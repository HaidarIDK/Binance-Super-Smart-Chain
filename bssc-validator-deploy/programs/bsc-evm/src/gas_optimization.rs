use solana_program::{
    account_info::AccountInfo,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::Sysvar,
};
use std::collections::HashMap;
use serde::{Deserialize, Serialize};

/// Gas optimization configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GasConfig {
    pub base_gas_price: u128,           // Base gas price in wei
    pub max_gas_price: u128,            // Maximum gas price
    pub min_gas_price: u128,            // Minimum gas price
    pub congestion_threshold: f64,      // Network congestion threshold (0.0-1.0)
    pub price_adjustment_factor: f64,   // How aggressively to adjust prices
    pub batch_discount: f64,            // Discount for batch transactions (0.0-1.0)
}

impl Default for GasConfig {
    fn default() -> Self {
        Self {
            base_gas_price: 20_000_000_000, // 20 gwei base
            max_gas_price: 1_000_000_000_000, // 1000 gwei max
            min_gas_price: 1_000_000_000,    // 1 gwei min
            congestion_threshold: 0.8,       // 80% capacity threshold
            price_adjustment_factor: 0.1,    // 10% adjustment per step
            batch_discount: 0.3,             // 30% discount for batches
        }
    }
}

/// Network congestion metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkMetrics {
    pub current_tps: f64,               // Current transactions per second
    pub target_tps: f64,                // Target TPS capacity
    pub pending_transactions: usize,    // Number of pending transactions
    pub average_gas_used: u64,          // Average gas used per transaction
    pub block_utilization: f64,         // Current block utilization (0.0-1.0)
    pub timestamp: u64,                 // Last update timestamp
}

impl Default for NetworkMetrics {
    fn default() -> Self {
        Self {
            current_tps: 0.0,
            target_tps: 65000.0,        // Solana's TPS capacity
            pending_transactions: 0,
            average_gas_used: 21000,    // Basic transfer gas
            block_utilization: 0.0,
            timestamp: 0,
        }
    }
}

/// Batch transaction container
#[derive(Debug, Clone)]
pub struct BatchTransaction {
    pub transactions: Vec<EvmTransaction>,
    pub batch_id: u64,
    pub total_gas_limit: u64,
    pub batch_discount: f64,
    pub timestamp: u64,
}

/// Enhanced EVM transaction with gas optimization
#[derive(Debug, Clone)]
pub struct EvmTransaction {
    pub to: Option<[u8; 20]>,
    pub value: u128,
    pub data: Vec<u8>,
    pub gas_limit: u64,
    pub gas_price: u128,
    pub nonce: u64,
    pub signature: [u8; 65],
    pub from: [u8; 20],
    pub batch_id: Option<u64>,          // For batch transactions
    pub priority_fee: u128,             // Priority fee (EIP-1559 style)
    pub max_fee_per_gas: u128,          // Max fee per gas (EIP-1559 style)
}

/// Advanced Gas Optimizer
#[derive(Debug, Clone)]
pub struct GasOptimizer {
    config: GasConfig,
    metrics: NetworkMetrics,
    transaction_history: Vec<EvmTransaction>,
    gas_price_history: Vec<u128>,
    batch_transactions: HashMap<u64, BatchTransaction>,
}

impl GasOptimizer {
    pub fn new(config: GasConfig) -> Self {
        Self {
            config,
            metrics: NetworkMetrics::default(),
            transaction_history: Vec::new(),
            gas_price_history: Vec::new(),
            batch_transactions: HashMap::new(),
        }
    }

    /// Calculate dynamic gas price based on network congestion
    pub fn calculate_dynamic_gas_price(&mut self, base_gas_limit: u64) -> u128 {
        let congestion_ratio = self.calculate_congestion_ratio();
        let utilization_factor = self.metrics.block_utilization;
        
        // Base calculation
        let mut gas_price = self.config.base_gas_price;
        
        // Adjust for congestion
        if congestion_ratio > self.config.congestion_threshold {
            let congestion_multiplier = 1.0 + (congestion_ratio - self.config.congestion_threshold) * 2.0;
            gas_price = (gas_price as f64 * congestion_multiplier) as u128;
        }
        
        // Adjust for block utilization
        if utilization_factor > 0.5 {
            let utilization_multiplier = 1.0 + (utilization_factor - 0.5) * self.config.price_adjustment_factor;
            gas_price = (gas_price as f64 * utilization_multiplier) as u128;
        }
        
        // Apply bounds
        gas_price = gas_price.max(self.config.min_gas_price);
        gas_price = gas_price.min(self.config.max_gas_price);
        
        // Store in history for trend analysis
        self.gas_price_history.push(gas_price);
        if self.gas_price_history.len() > 100 {
            self.gas_price_history.remove(0);
        }
        
        gas_price
    }

    /// Calculate network congestion ratio
    fn calculate_congestion_ratio(&self) -> f64 {
        if self.metrics.target_tps == 0.0 {
            return 0.0;
        }
        
        let current_utilization = self.metrics.current_tps / self.metrics.target_tps;
        let pending_ratio = (self.metrics.pending_transactions as f64) / (self.metrics.target_tps * 10.0);
        
        (current_utilization + pending_ratio * 0.3).min(1.0)
    }

    /// Estimate optimal gas limit for a transaction
    pub fn estimate_gas_limit(&self, to: Option<[u8; 20]>, data: &[u8], value: u128) -> u64 {
        let mut gas_limit = 21000; // Base transfer cost
        
        if let Some(_) = to {
            // Contract interaction
            gas_limit += 2000; // Additional overhead
            
            // Estimate based on data size
            gas_limit += (data.len() as u64) * 16; // 16 gas per byte
            
            // Estimate based on complexity (simple heuristic)
            let complexity = data.len().min(1000);
            gas_limit += (complexity as u64) * 5;
        } else {
            // Contract creation
            gas_limit = 32000; // Base creation cost
            gas_limit += (data.len() as u64) * 200; // 200 gas per byte of init code
        }
        
        // Add safety buffer (20%)
        gas_limit = (gas_limit as f64 * 1.2) as u64;
        
        // Use historical average if available
        if !self.transaction_history.is_empty() {
            let avg_gas = self.transaction_history
                .iter()
                .map(|tx| tx.gas_limit)
                .sum::<u64>() / self.transaction_history.len() as u64;
            
            // Weighted average (70% estimate, 30% historical)
            gas_limit = ((gas_limit as f64 * 0.7) + (avg_gas as f64 * 0.3)) as u64;
        }
        
        gas_limit
    }

    /// Create a batch transaction for multiple operations
    pub fn create_batch_transaction(
        &mut self,
        transactions: Vec<EvmTransaction>,
        batch_id: u64,
    ) -> Result<BatchTransaction, ProgramError> {
        if transactions.is_empty() {
            return Err(ProgramError::InvalidInstructionData);
        }
        
        let total_gas_limit: u64 = transactions.iter().map(|tx| tx.gas_limit).sum();
        let batch_discount = self.calculate_batch_discount(transactions.len());
        
        let batch = BatchTransaction {
            transactions,
            batch_id,
            total_gas_limit,
            batch_discount,
            timestamp: solana_program::clock::Clock::get()?.unix_timestamp as u64,
        };
        
        self.batch_transactions.insert(batch_id, batch.clone());
        Ok(batch)
    }

    /// Calculate discount for batch transactions
    fn calculate_batch_discount(&self, transaction_count: usize) -> f64 {
        let base_discount = self.config.batch_discount;
        let volume_discount = if transaction_count > 10 {
            0.1 // Additional 10% for large batches
        } else {
            0.0
        };
        
        (base_discount + volume_discount).min(0.8) // Max 80% discount
    }

    /// Process batch transaction with optimized gas pricing
    pub fn process_batch_transaction(
        &mut self,
        batch_id: u64,
    ) -> Result<Vec<Vec<u8>>, ProgramError> {
        let batch = self.batch_transactions.get(&batch_id)
            .ok_or(ProgramError::InvalidAccountData)?
            .clone();
        
        let mut results = Vec::new();
        
        // Calculate batch gas price with discount
        let base_gas_price = self.calculate_dynamic_gas_price(0);
        let discounted_gas_price = (base_gas_price as f64 * (1.0 - batch.batch_discount)) as u128;
        
        for (i, mut transaction) in batch.transactions.into_iter().enumerate() {
            // Apply batch pricing
            transaction.gas_price = discounted_gas_price;
            transaction.batch_id = Some(batch_id);
            
            // Process individual transaction
            let result = self.process_single_transaction(transaction)?;
            results.push(result);
            
            // Update metrics after each transaction
            self.update_metrics();
        }
        
        // Remove processed batch
        self.batch_transactions.remove(&batch_id);
        
        Ok(results)
    }

    /// Process a single transaction with gas optimization
    pub fn process_single_transaction(
        &mut self,
        mut transaction: EvmTransaction,
    ) -> Result<Vec<u8>, ProgramError> {
        // Optimize gas price if not set
        if transaction.gas_price == 0 {
            transaction.gas_price = self.calculate_dynamic_gas_price(transaction.gas_limit);
        }
        
        // Optimize gas limit if not set or too low
        if transaction.gas_limit < 21000 {
            transaction.gas_limit = self.estimate_gas_limit(
                transaction.to,
                &transaction.data,
                transaction.value,
            );
        }
        
        // Store transaction for history analysis
        self.transaction_history.push(transaction.clone());
        if self.transaction_history.len() > 1000 {
            self.transaction_history.remove(0);
        }
        
        // Update metrics
        self.update_metrics();
        
        // Return optimized transaction data (simplified)
        Ok(vec![0x01, 0x02, 0x03]) // Placeholder return
    }

    /// Update network metrics
    fn update_metrics(&mut self) {
        let clock = solana_program::clock::Clock::get().unwrap_or_default();
        
        // Update TPS calculation
        let recent_transactions = self.transaction_history
            .iter()
            .filter(|tx| {
                // Count transactions from last 10 seconds
                let tx_time = 0; // Would be actual transaction timestamp
                let current_time = clock.unix_timestamp as u64;
                current_time.saturating_sub(tx_time) <= 10
            })
            .count();
        
        self.metrics.current_tps = recent_transactions as f64 / 10.0;
        self.metrics.pending_transactions = self.batch_transactions.values()
            .map(|batch| batch.transactions.len())
            .sum();
        self.metrics.block_utilization = (self.metrics.current_tps / self.metrics.target_tps).min(1.0);
        self.metrics.timestamp = clock.unix_timestamp as u64;
    }

    /// Get current gas price recommendation
    pub fn get_gas_price_recommendation(&mut self) -> GasPriceRecommendation {
        let current_price = self.calculate_dynamic_gas_price(0);
        let congestion = self.calculate_congestion_ratio();
        
        GasPriceRecommendation {
            slow: (current_price as f64 * 0.8) as u128,      // 20% cheaper, slower
            standard: current_price,                          // Current market rate
            fast: (current_price as f64 * 1.2) as u128,      // 20% more expensive, faster
            urgent: (current_price as f64 * 1.5) as u128,    // 50% more expensive, urgent
            congestion_level: congestion,
            estimated_confirmation_time: self.estimate_confirmation_time(current_price),
        }
    }

    /// Estimate transaction confirmation time based on gas price
    fn estimate_confirmation_time(&self, gas_price: u128) -> u64 {
        let base_price = self.config.base_gas_price;
        let ratio = gas_price as f64 / base_price as f64;
        
        if ratio >= 2.0 {
            1 // Very fast (next block)
        } else if ratio >= 1.5 {
            2 // Fast (1-2 blocks)
        } else if ratio >= 1.0 {
            3 // Standard (2-3 blocks)
        } else {
            5 // Slow (3-5 blocks)
        }
    }

    /// Get gas optimization statistics
    pub fn get_optimization_stats(&self) -> GasOptimizationStats {
        let avg_gas_price = if !self.gas_price_history.is_empty() {
            self.gas_price_history.iter().sum::<u128>() / self.gas_price_history.len() as u128
        } else {
            self.config.base_gas_price
        };
        
        let total_batches = self.batch_transactions.len();
        let total_savings = self.calculate_total_savings();
        
        GasOptimizationStats {
            average_gas_price: avg_gas_price,
            total_batches_processed: total_batches,
            total_gas_savings: total_savings,
            network_efficiency: 1.0 - self.calculate_congestion_ratio(),
            optimization_score: self.calculate_optimization_score(),
        }
    }

    /// Calculate total gas savings from optimizations
    fn calculate_total_savings(&self) -> u128 {
        let mut total_savings = 0u128;
        
        for batch in self.batch_transactions.values() {
            let batch_savings = (batch.total_gas_limit as u128 * self.config.base_gas_price as u128)
                * (batch.batch_discount * 1_000_000.0) as u128 / 1_000_000;
            total_savings += batch_savings;
        }
        
        total_savings
    }

    /// Calculate overall optimization score (0.0-1.0)
    fn calculate_optimization_score(&self) -> f64 {
        let congestion_score = 1.0 - self.calculate_congestion_ratio();
        let batch_efficiency = if self.batch_transactions.is_empty() {
            0.5 // Neutral if no batches
        } else {
            let avg_batch_size = self.batch_transactions.values()
                .map(|b| b.transactions.len())
                .sum::<usize>() as f64 / self.batch_transactions.len() as f64;
            (avg_batch_size / 10.0).min(1.0) // Reward larger batches
        };
        
        (congestion_score + batch_efficiency) / 2.0
    }
}

/// Gas price recommendation structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GasPriceRecommendation {
    pub slow: u128,
    pub standard: u128,
    pub fast: u128,
    pub urgent: u128,
    pub congestion_level: f64,
    pub estimated_confirmation_time: u64,
}

/// Gas optimization statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GasOptimizationStats {
    pub average_gas_price: u128,
    pub total_batches_processed: usize,
    pub total_gas_savings: u128,
    pub network_efficiency: f64,
    pub optimization_score: f64,
}
