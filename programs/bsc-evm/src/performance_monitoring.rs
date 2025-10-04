use solana_program::{
    account_info::AccountInfo,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::Sysvar,
};
use std::collections::{HashMap, VecDeque};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

/// Performance monitoring configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceConfig {
    /// Enable real-time metrics collection
    pub enable_real_time_metrics: bool,
    /// Metrics collection interval in milliseconds
    pub metrics_interval_ms: u64,
    /// Maximum number of metrics samples to retain
    pub max_samples: usize,
    /// Enable performance optimization recommendations
    pub enable_optimization_recommendations: bool,
    /// Enable user experience monitoring
    pub enable_ux_monitoring: bool,
    /// Performance threshold for alerts
    pub performance_threshold: f64,
    /// Enable detailed transaction analytics
    pub enable_transaction_analytics: bool,
}

impl Default for PerformanceConfig {
    fn default() -> Self {
        Self {
            enable_real_time_metrics: true,
            metrics_interval_ms: 1000, // 1 second
            max_samples: 1000,
            enable_optimization_recommendations: true,
            enable_ux_monitoring: true,
            performance_threshold: 0.8, // 80% of target performance
            enable_transaction_analytics: true,
        }
    }
}

/// Real-time performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceMetrics {
    /// Transactions per second
    pub tps: f64,
    /// Average transaction latency in milliseconds
    pub avg_latency_ms: f64,
    /// P95 latency in milliseconds
    pub p95_latency_ms: f64,
    /// P99 latency in milliseconds
    pub p99_latency_ms: f64,
    /// Block time in milliseconds
    pub block_time_ms: f64,
    /// Gas utilization percentage
    pub gas_utilization: f64,
    /// Network congestion level (0.0-1.0)
    pub congestion_level: f64,
    /// Memory usage in MB
    pub memory_usage_mb: f64,
    /// CPU utilization percentage
    pub cpu_utilization: f64,
    /// Active connections count
    pub active_connections: u32,
    /// Queue depth
    pub queue_depth: u32,
    /// Error rate percentage
    pub error_rate: f64,
    /// Success rate percentage
    pub success_rate: f64,
    /// Timestamp of metrics collection
    pub timestamp: u64,
}

impl Default for PerformanceMetrics {
    fn default() -> Self {
        Self {
            tps: 0.0,
            avg_latency_ms: 0.0,
            p95_latency_ms: 0.0,
            p99_latency_ms: 0.0,
            block_time_ms: 400.0, // Target 400ms block time
            gas_utilization: 0.0,
            congestion_level: 0.0,
            memory_usage_mb: 0.0,
            cpu_utilization: 0.0,
            active_connections: 0,
            queue_depth: 0,
            error_rate: 0.0,
            success_rate: 100.0,
            timestamp: 0,
        }
    }
}

/// Transaction analytics data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TransactionAnalytics {
    /// Total transactions processed
    pub total_transactions: u64,
    /// Successful transactions
    pub successful_transactions: u64,
    /// Failed transactions
    pub failed_transactions: u64,
    /// Average gas price
    pub avg_gas_price: u128,
    /// Average gas used
    pub avg_gas_used: u64,
    /// Transaction types distribution
    pub transaction_types: HashMap<String, u64>,
    /// Contract interactions count
    pub contract_interactions: u64,
    /// Simple transfers count
    pub simple_transfers: u64,
    /// Contract deployments count
    pub contract_deployments: u64,
    /// Cross-chain transactions
    pub cross_chain_transactions: u64,
    /// Batch transactions count
    pub batch_transactions: u64,
    /// Peak TPS achieved
    pub peak_tps: f64,
    /// Average transaction size in bytes
    pub avg_transaction_size_bytes: u64,
    /// Most active contracts
    pub most_active_contracts: Vec<ContractActivity>,
}

/// Contract activity tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractActivity {
    pub contract_address: [u8; 20],
    pub transaction_count: u64,
    pub gas_consumed: u128,
    pub last_activity: u64,
    pub activity_score: f64,
}

/// Network health status
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum NetworkHealthStatus {
    Excellent,  // > 95% performance
    Good,       // 80-95% performance
    Fair,       // 60-80% performance
    Poor,       // 40-60% performance
    Critical,   // < 40% performance
}

/// Network health report
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NetworkHealthReport {
    pub status: NetworkHealthStatus,
    pub overall_score: f64,
    pub performance_score: f64,
    pub stability_score: f64,
    pub efficiency_score: f64,
    pub recommendations: Vec<String>,
    pub alerts: Vec<PerformanceAlert>,
    pub timestamp: u64,
}

/// Performance alert
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceAlert {
    pub alert_type: AlertType,
    pub severity: AlertSeverity,
    pub message: String,
    pub timestamp: u64,
    pub threshold: f64,
    pub current_value: f64,
    pub recommendation: String,
}

/// Types of performance alerts
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertType {
    LowTPS,
    HighLatency,
    HighErrorRate,
    HighCongestion,
    HighMemoryUsage,
    HighCPUUsage,
    QueueOverflow,
    NetworkInstability,
    GasPriceSpike,
    BlockTimeIncrease,
}

/// Alert severity levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AlertSeverity {
    Info,
    Warning,
    Critical,
    Emergency,
}

/// User experience metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserExperienceMetrics {
    /// Average time to confirmation
    pub avg_confirmation_time_ms: f64,
    /// User satisfaction score (0.0-1.0)
    pub user_satisfaction_score: f64,
    /// Transaction success rate from user perspective
    pub user_success_rate: f64,
    /// Average time to first confirmation
    pub avg_first_confirmation_ms: f64,
    /// User abandonment rate
    pub abandonment_rate: f64,
    /// Most common user complaints
    pub common_complaints: Vec<String>,
    /// User feedback score
    pub feedback_score: f64,
    /// Support ticket volume
    pub support_tickets: u32,
}

/// Performance optimization recommendation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationRecommendation {
    pub recommendation_type: RecommendationType,
    pub priority: RecommendationPriority,
    pub title: String,
    pub description: String,
    pub expected_improvement: f64,
    pub implementation_effort: ImplementationEffort,
    pub estimated_impact: String,
}

/// Types of optimization recommendations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecommendationType {
    GasOptimization,
    BatchProcessing,
    Caching,
    LoadBalancing,
    DatabaseOptimization,
    NetworkOptimization,
    CodeOptimization,
    InfrastructureScaling,
}

/// Priority levels for recommendations
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RecommendationPriority {
    Low,
    Medium,
    High,
    Critical,
}

/// Implementation effort levels
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ImplementationEffort {
    Low,     // < 1 day
    Medium,  // 1-7 days
    High,    // 1-4 weeks
    Critical, // > 1 month
}

/// Performance monitoring dashboard data
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceDashboard {
    pub current_metrics: PerformanceMetrics,
    pub historical_metrics: Vec<PerformanceMetrics>,
    pub network_health: NetworkHealthReport,
    pub transaction_analytics: TransactionAnalytics,
    pub user_experience: UserExperienceMetrics,
    pub optimization_recommendations: Vec<OptimizationRecommendation>,
    pub active_alerts: Vec<PerformanceAlert>,
    pub performance_trends: PerformanceTrends,
    pub timestamp: u64,
}

/// Performance trends analysis
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PerformanceTrends {
    pub tps_trend: TrendDirection,
    pub latency_trend: TrendDirection,
    pub error_rate_trend: TrendDirection,
    pub congestion_trend: TrendDirection,
    pub efficiency_trend: TrendDirection,
    pub trend_strength: f64,
    pub prediction_accuracy: f64,
}

/// Trend direction indicators
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum TrendDirection {
    Improving,
    Stable,
    Declining,
    Volatile,
}

/// Performance Monitoring Manager
#[derive(Debug, Clone)]
pub struct PerformanceMonitor {
    config: PerformanceConfig,
    current_metrics: PerformanceMetrics,
    historical_metrics: VecDeque<PerformanceMetrics>,
    transaction_analytics: TransactionAnalytics,
    user_experience: UserExperienceMetrics,
    optimization_recommendations: Vec<OptimizationRecommendation>,
    active_alerts: Vec<PerformanceAlert>,
    performance_trends: PerformanceTrends,
    contract_activities: HashMap<[u8; 20], ContractActivity>,
    start_time: u64,
}

impl PerformanceMonitor {
    /// Create a new performance monitor
    pub fn new(config: PerformanceConfig) -> Self {
        Self {
            config,
            current_metrics: PerformanceMetrics::default(),
            historical_metrics: VecDeque::new(),
            transaction_analytics: TransactionAnalytics {
                total_transactions: 0,
                successful_transactions: 0,
                failed_transactions: 0,
                avg_gas_price: 0,
                avg_gas_used: 0,
                transaction_types: HashMap::new(),
                contract_interactions: 0,
                simple_transfers: 0,
                contract_deployments: 0,
                cross_chain_transactions: 0,
                batch_transactions: 0,
                peak_tps: 0.0,
                avg_transaction_size_bytes: 0,
                most_active_contracts: Vec::new(),
            },
            user_experience: UserExperienceMetrics {
                avg_confirmation_time_ms: 0.0,
                user_satisfaction_score: 1.0,
                user_success_rate: 100.0,
                avg_first_confirmation_ms: 0.0,
                abandonment_rate: 0.0,
                common_complaints: Vec::new(),
                feedback_score: 5.0,
                support_tickets: 0,
            },
            optimization_recommendations: Vec::new(),
            active_alerts: Vec::new(),
            performance_trends: PerformanceTrends {
                tps_trend: TrendDirection::Stable,
                latency_trend: TrendDirection::Stable,
                error_rate_trend: TrendDirection::Stable,
                congestion_trend: TrendDirection::Stable,
                efficiency_trend: TrendDirection::Stable,
                trend_strength: 0.0,
                prediction_accuracy: 0.0,
            },
            contract_activities: HashMap::new(),
            start_time: Self::get_current_timestamp(),
        }
    }

    /// Record a transaction for analytics
    pub fn record_transaction(&mut self, tx_type: String, success: bool, gas_used: u64, gas_price: u128, confirmation_time_ms: f64) {
        // Update transaction analytics
        self.transaction_analytics.total_transactions += 1;
        if success {
            self.transaction_analytics.successful_transactions += 1;
        } else {
            self.transaction_analytics.failed_transactions += 1;
        }

        // Update transaction type distribution
        *self.transaction_analytics.transaction_types.entry(tx_type.clone()).or_insert(0) += 1;

        // Update specific transaction types
        match tx_type.as_str() {
            "contract_interaction" => self.transaction_analytics.contract_interactions += 1,
            "simple_transfer" => self.transaction_analytics.simple_transfers += 1,
            "contract_deployment" => self.transaction_analytics.contract_deployments += 1,
            "cross_chain" => self.transaction_analytics.cross_chain_transactions += 1,
            "batch" => self.transaction_analytics.batch_transactions += 1,
            _ => {}
        }

        // Update gas metrics
        let total_gas = self.transaction_analytics.avg_gas_used * (self.transaction_analytics.total_transactions - 1);
        self.transaction_analytics.avg_gas_used = (total_gas + gas_used) / self.transaction_analytics.total_transactions;

        let total_gas_price = self.transaction_analytics.avg_gas_price * (self.transaction_analytics.total_transactions - 1) as u128;
        self.transaction_analytics.avg_gas_price = (total_gas_price + gas_price) / self.transaction_analytics.total_transactions as u128;

        // Update user experience metrics
        self.update_user_experience_metrics(confirmation_time_ms, success);

        // Update TPS calculation
        self.update_tps_metrics();

        // Check for performance alerts
        self.check_performance_alerts();

        // Update optimization recommendations
        self.update_optimization_recommendations();
    }

    /// Update contract activity
    pub fn update_contract_activity(&mut self, contract_address: [u8; 20], gas_consumed: u128) {
        let current_timestamp = Self::get_current_timestamp();
        
        let activity = self.contract_activities.entry(contract_address).or_insert(ContractActivity {
            contract_address,
            transaction_count: 0,
            gas_consumed: 0,
            last_activity: current_timestamp,
            activity_score: 0.0,
        });

        activity.transaction_count += 1;
        activity.gas_consumed += gas_consumed;
        activity.last_activity = current_timestamp;
        
        // Calculate activity score using the activity data
        let activity_score = Self::calculate_activity_score_static(
            activity.transaction_count,
            activity.gas_consumed,
            activity.last_activity,
            current_timestamp,
        );
        activity.activity_score = activity_score;

        // Update most active contracts list
        self.update_most_active_contracts();
    }

    /// Get current performance metrics
    pub fn get_current_metrics(&self) -> &PerformanceMetrics {
        &self.current_metrics
    }

    /// Get historical metrics
    pub fn get_historical_metrics(&self) -> &VecDeque<PerformanceMetrics> {
        &self.historical_metrics
    }

    /// Get transaction analytics
    pub fn get_transaction_analytics(&self) -> &TransactionAnalytics {
        &self.transaction_analytics
    }

    /// Get user experience metrics
    pub fn get_user_experience_metrics(&self) -> &UserExperienceMetrics {
        &self.user_experience
    }

    /// Get network health report
    pub fn get_network_health_report(&self) -> NetworkHealthReport {
        self.calculate_network_health()
    }

    /// Get optimization recommendations
    pub fn get_optimization_recommendations(&self) -> &Vec<OptimizationRecommendation> {
        &self.optimization_recommendations
    }

    /// Get active alerts
    pub fn get_active_alerts(&self) -> &Vec<PerformanceAlert> {
        &self.active_alerts
    }

    /// Get performance dashboard data
    pub fn get_performance_dashboard(&self) -> PerformanceDashboard {
        PerformanceDashboard {
            current_metrics: self.current_metrics.clone(),
            historical_metrics: self.historical_metrics.iter().cloned().collect(),
            network_health: self.calculate_network_health(),
            transaction_analytics: self.transaction_analytics.clone(),
            user_experience: self.user_experience.clone(),
            optimization_recommendations: self.optimization_recommendations.clone(),
            active_alerts: self.active_alerts.clone(),
            performance_trends: self.performance_trends.clone(),
            timestamp: Self::get_current_timestamp(),
        }
    }

    /// Update performance configuration
    pub fn update_config(&mut self, config: PerformanceConfig) {
        self.config = config;
    }

    /// Clear historical data
    pub fn clear_historical_data(&mut self) {
        self.historical_metrics.clear();
        self.active_alerts.clear();
    }

    // Private helper methods

    fn update_user_experience_metrics(&mut self, confirmation_time_ms: f64, success: bool) {
        // Update average confirmation time
        let total_transactions = self.transaction_analytics.successful_transactions;
        if total_transactions > 0 {
            let current_avg = self.user_experience.avg_confirmation_time_ms;
            self.user_experience.avg_confirmation_time_ms = 
                (current_avg * (total_transactions - 1) as f64 + confirmation_time_ms) / total_transactions as f64;
        }

        // Update user success rate
        self.user_experience.user_success_rate = 
            (self.transaction_analytics.successful_transactions as f64 / self.transaction_analytics.total_transactions as f64) * 100.0;

        // Update user satisfaction score based on confirmation time and success rate
        let time_score = if confirmation_time_ms < 1000.0 { 1.0 } 
                        else if confirmation_time_ms < 3000.0 { 0.8 } 
                        else if confirmation_time_ms < 10000.0 { 0.6 } 
                        else { 0.4 };
        
        let success_score = self.user_experience.user_success_rate / 100.0;
        self.user_experience.user_satisfaction_score = (time_score + success_score) / 2.0;
    }

    fn update_tps_metrics(&mut self) {
        let current_time = Self::get_current_timestamp();
        let time_elapsed = current_time - self.start_time;
        
        if time_elapsed > 0 {
            self.current_metrics.tps = self.transaction_analytics.total_transactions as f64 / time_elapsed as f64;
            
            // Update peak TPS
            if self.current_metrics.tps > self.transaction_analytics.peak_tps {
                self.transaction_analytics.peak_tps = self.current_metrics.tps;
            }
        }

        // Update latency metrics (simplified calculation)
        self.current_metrics.avg_latency_ms = self.user_experience.avg_confirmation_time_ms;
        self.current_metrics.p95_latency_ms = self.current_metrics.avg_latency_ms * 1.5;
        self.current_metrics.p99_latency_ms = self.current_metrics.avg_latency_ms * 2.0;

        // Update success and error rates
        self.current_metrics.success_rate = self.user_experience.user_success_rate;
        self.current_metrics.error_rate = 100.0 - self.current_metrics.success_rate;

        // Update timestamp
        self.current_metrics.timestamp = current_time;

        // Store in historical metrics
        self.historical_metrics.push_back(self.current_metrics.clone());
        if self.historical_metrics.len() > self.config.max_samples {
            self.historical_metrics.pop_front();
        }
    }

    fn check_performance_alerts(&mut self) {
        // Check TPS alerts
        if self.current_metrics.tps < 1000.0 {
            self.add_alert(AlertType::LowTPS, AlertSeverity::Warning, 
                format!("TPS is below threshold: {:.2}", self.current_metrics.tps),
                1000.0, self.current_metrics.tps,
                "Consider optimizing transaction processing or scaling infrastructure".to_string());
        }

        // Check latency alerts
        if self.current_metrics.avg_latency_ms > 5000.0 {
            self.add_alert(AlertType::HighLatency, AlertSeverity::Critical,
                format!("High latency detected: {:.2}ms", self.current_metrics.avg_latency_ms),
                5000.0, self.current_metrics.avg_latency_ms,
                "Investigate network congestion or processing bottlenecks".to_string());
        }

        // Check error rate alerts
        if self.current_metrics.error_rate > 5.0 {
            self.add_alert(AlertType::HighErrorRate, AlertSeverity::Critical,
                format!("High error rate: {:.2}%", self.current_metrics.error_rate),
                5.0, self.current_metrics.error_rate,
                "Review transaction validation and error handling".to_string());
        }
    }

    fn add_alert(&mut self, alert_type: AlertType, severity: AlertSeverity, message: String, threshold: f64, current_value: f64, recommendation: String) {
        let alert = PerformanceAlert {
            alert_type,
            severity,
            message,
            timestamp: Self::get_current_timestamp(),
            threshold,
            current_value,
            recommendation,
        };

        self.active_alerts.push(alert);

        // Keep only last 100 alerts
        if self.active_alerts.len() > 100 {
            self.active_alerts.remove(0);
        }
    }

    fn update_optimization_recommendations(&mut self) {
        self.optimization_recommendations.clear();

        // TPS optimization recommendations
        if self.current_metrics.tps < 10000.0 {
            self.optimization_recommendations.push(OptimizationRecommendation {
                recommendation_type: RecommendationType::BatchProcessing,
                priority: RecommendationPriority::High,
                title: "Implement Batch Processing".to_string(),
                description: "Batch multiple transactions together to improve throughput".to_string(),
                expected_improvement: 50.0,
                implementation_effort: ImplementationEffort::Medium,
                estimated_impact: "Could increase TPS by 50-100%".to_string(),
            });
        }

        // Latency optimization recommendations
        if self.current_metrics.avg_latency_ms > 2000.0 {
            self.optimization_recommendations.push(OptimizationRecommendation {
                recommendation_type: RecommendationType::NetworkOptimization,
                priority: RecommendationPriority::Critical,
                title: "Optimize Network Layer".to_string(),
                description: "Improve network configuration and reduce latency".to_string(),
                expected_improvement: 30.0,
                implementation_effort: ImplementationEffort::High,
                estimated_impact: "Could reduce latency by 30-50%".to_string(),
            });
        }

        // Gas optimization recommendations
        if self.transaction_analytics.avg_gas_used > 100000 {
            self.optimization_recommendations.push(OptimizationRecommendation {
                recommendation_type: RecommendationType::GasOptimization,
                priority: RecommendationPriority::Medium,
                title: "Optimize Gas Usage".to_string(),
                description: "Implement gas optimization techniques to reduce costs".to_string(),
                expected_improvement: 25.0,
                implementation_effort: ImplementationEffort::Medium,
                estimated_impact: "Could reduce gas costs by 25-40%".to_string(),
            });
        }
    }

    fn calculate_network_health(&self) -> NetworkHealthReport {
        let performance_score = self.calculate_performance_score();
        let stability_score = self.calculate_stability_score();
        let efficiency_score = self.calculate_efficiency_score();
        let overall_score = (performance_score + stability_score + efficiency_score) / 3.0;

        let status = match overall_score {
            x if x >= 0.95 => NetworkHealthStatus::Excellent,
            x if x >= 0.80 => NetworkHealthStatus::Good,
            x if x >= 0.60 => NetworkHealthStatus::Fair,
            x if x >= 0.40 => NetworkHealthStatus::Poor,
            _ => NetworkHealthStatus::Critical,
        };

        let recommendations = self.generate_health_recommendations(overall_score);

        NetworkHealthReport {
            status,
            overall_score,
            performance_score,
            stability_score,
            efficiency_score,
            recommendations,
            alerts: self.active_alerts.clone(),
            timestamp: Self::get_current_timestamp(),
        }
    }

    fn calculate_performance_score(&self) -> f64 {
        let tps_score = (self.current_metrics.tps / 65000.0).min(1.0); // Target 65k TPS
        let latency_score = (1000.0 / self.current_metrics.avg_latency_ms).min(1.0); // Target < 1s
        let success_rate_score = self.current_metrics.success_rate / 100.0;
        
        (tps_score + latency_score + success_rate_score) / 3.0
    }

    fn calculate_stability_score(&self) -> f64 {
        let error_rate_score = (100.0 - self.current_metrics.error_rate) / 100.0;
        let consistency_score = self.calculate_consistency_score();
        
        (error_rate_score + consistency_score) / 2.0
    }

    fn calculate_efficiency_score(&self) -> f64 {
        let gas_efficiency = (100000.0 / self.transaction_analytics.avg_gas_used as f64).min(1.0);
        let resource_utilization = 1.0 - (self.current_metrics.cpu_utilization / 100.0);
        
        (gas_efficiency + resource_utilization) / 2.0
    }

    fn calculate_consistency_score(&self) -> f64 {
        if self.historical_metrics.len() < 10 {
            return 1.0;
        }

        let recent_metrics: Vec<&PerformanceMetrics> = self.historical_metrics.iter().rev().take(10).collect();
        let avg_tps: f64 = recent_metrics.iter().map(|m| m.tps).sum::<f64>() / recent_metrics.len() as f64;
        
        let variance: f64 = recent_metrics.iter()
            .map(|m| (m.tps - avg_tps).powi(2))
            .sum::<f64>() / recent_metrics.len() as f64;
        
        let std_dev = variance.sqrt();
        let coefficient_of_variation = std_dev / avg_tps;
        
        (1.0 - coefficient_of_variation).max(0.0)
    }

    fn generate_health_recommendations(&self, overall_score: f64) -> Vec<String> {
        let mut recommendations = Vec::new();

        if overall_score < 0.8 {
            recommendations.push("Consider scaling infrastructure to handle increased load".to_string());
        }
        if self.current_metrics.error_rate > 2.0 {
            recommendations.push("Review error handling and transaction validation logic".to_string());
        }
        if self.current_metrics.avg_latency_ms > 3000.0 {
            recommendations.push("Optimize network configuration and reduce processing bottlenecks".to_string());
        }
        if self.current_metrics.tps < 5000.0 {
            recommendations.push("Implement transaction batching and parallel processing".to_string());
        }

        if recommendations.is_empty() {
            recommendations.push("Network performance is excellent. Continue monitoring.".to_string());
        }

        recommendations
    }

    fn calculate_activity_score(&self, activity: &ContractActivity) -> f64 {
        let recency_weight = if Self::get_current_timestamp() - activity.last_activity < 3600 { 1.0 } else { 0.5 };
        let frequency_weight = (activity.transaction_count as f64 / 100.0).min(1.0);
        let gas_weight = (activity.gas_consumed as f64 / 1000000.0).min(1.0);
        
        (recency_weight + frequency_weight + gas_weight) / 3.0
    }

    fn calculate_activity_score_static(transaction_count: u64, gas_consumed: u128, last_activity: u64, current_timestamp: u64) -> f64 {
        let recency_weight = if current_timestamp - last_activity < 3600 { 1.0 } else { 0.5 };
        let frequency_weight = (transaction_count as f64 / 100.0).min(1.0);
        let gas_weight = (gas_consumed as f64 / 1000000.0).min(1.0);
        
        (recency_weight + frequency_weight + gas_weight) / 3.0
    }

    fn update_most_active_contracts(&mut self) {
        let mut activities: Vec<ContractActivity> = self.contract_activities.values().cloned().collect();
        activities.sort_by(|a, b| b.activity_score.partial_cmp(&a.activity_score).unwrap());
        
        self.transaction_analytics.most_active_contracts = activities.into_iter().take(10).collect();
    }

    fn get_current_timestamp() -> u64 {
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs()
    }
}
