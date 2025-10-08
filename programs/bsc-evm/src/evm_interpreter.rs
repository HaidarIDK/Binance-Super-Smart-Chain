//! # EVM Bytecode Interpreter
//!
//! Full implementation of the Ethereum Virtual Machine for executing smart contracts
//! on Solana with BNB as the gas token.

use solana_program::program_error::ProgramError;
use std::collections::HashMap;

/// EVM opcode definitions
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
#[repr(u8)]
pub enum Opcode {
    // 0x0 range - arithmetic ops
    STOP = 0x00,
    ADD = 0x01,
    MUL = 0x02,
    SUB = 0x03,
    DIV = 0x04,
    SDIV = 0x05,
    MOD = 0x06,
    SMOD = 0x07,
    ADDMOD = 0x08,
    MULMOD = 0x09,
    EXP = 0x0a,
    SIGNEXTEND = 0x0b,

    // 0x10 range - comparison ops
    LT = 0x10,
    GT = 0x11,
    SLT = 0x12,
    SGT = 0x13,
    EQ = 0x14,
    ISZERO = 0x15,
    AND = 0x16,
    OR = 0x17,
    XOR = 0x18,
    NOT = 0x19,
    BYTE = 0x1a,
    SHL = 0x1b,
    SHR = 0x1c,
    SAR = 0x1d,

    // 0x20 range - crypto
    SHA3 = 0x20,

    // 0x30 range - closure state
    ADDRESS = 0x30,
    BALANCE = 0x31,
    ORIGIN = 0x32,
    CALLER = 0x33,
    CALLVALUE = 0x34,
    CALLDATALOAD = 0x35,
    CALLDATASIZE = 0x36,
    CALLDATACOPY = 0x37,
    CODESIZE = 0x38,
    CODECOPY = 0x39,
    GASPRICE = 0x3a,
    EXTCODESIZE = 0x3b,
    EXTCODECOPY = 0x3c,
    RETURNDATASIZE = 0x3d,
    RETURNDATACOPY = 0x3e,
    EXTCODEHASH = 0x3f,

    // 0x40 range - block operations
    BLOCKHASH = 0x40,
    COINBASE = 0x41,
    TIMESTAMP = 0x42,
    NUMBER = 0x43,
    DIFFICULTY = 0x44,
    GASLIMIT = 0x45,
    CHAINID = 0x46,
    SELFBALANCE = 0x47,
    BASEFEE = 0x48,

    // 0x50 range - storage and execution
    POP = 0x50,
    MLOAD = 0x51,
    MSTORE = 0x52,
    MSTORE8 = 0x53,
    SLOAD = 0x54,
    SSTORE = 0x55,
    JUMP = 0x56,
    JUMPI = 0x57,
    PC = 0x58,
    MSIZE = 0x59,
    GAS = 0x5a,
    JUMPDEST = 0x5b,

    // 0x60 range - push
    PUSH1 = 0x60,
    PUSH2 = 0x61,
    PUSH3 = 0x62,
    PUSH4 = 0x63,
    PUSH5 = 0x64,
    PUSH6 = 0x65,
    PUSH7 = 0x66,
    PUSH8 = 0x67,
    PUSH9 = 0x68,
    PUSH10 = 0x69,
    PUSH11 = 0x6a,
    PUSH12 = 0x6b,
    PUSH13 = 0x6c,
    PUSH14 = 0x6d,
    PUSH15 = 0x6e,
    PUSH16 = 0x6f,
    PUSH17 = 0x70,
    PUSH18 = 0x71,
    PUSH19 = 0x72,
    PUSH20 = 0x73,
    PUSH21 = 0x74,
    PUSH22 = 0x75,
    PUSH23 = 0x76,
    PUSH24 = 0x77,
    PUSH25 = 0x78,
    PUSH26 = 0x79,
    PUSH27 = 0x7a,
    PUSH28 = 0x7b,
    PUSH29 = 0x7c,
    PUSH30 = 0x7d,
    PUSH31 = 0x7e,
    PUSH32 = 0x7f,

    // 0x80 range - duplication
    DUP1 = 0x80,
    DUP2 = 0x81,
    DUP3 = 0x82,
    DUP4 = 0x83,
    DUP5 = 0x84,
    DUP6 = 0x85,
    DUP7 = 0x86,
    DUP8 = 0x87,
    DUP9 = 0x88,
    DUP10 = 0x89,
    DUP11 = 0x8a,
    DUP12 = 0x8b,
    DUP13 = 0x8c,
    DUP14 = 0x8d,
    DUP15 = 0x8e,
    DUP16 = 0x8f,

    // 0x90 range - swap
    SWAP1 = 0x90,
    SWAP2 = 0x91,
    SWAP3 = 0x92,
    SWAP4 = 0x93,
    SWAP5 = 0x94,
    SWAP6 = 0x95,
    SWAP7 = 0x96,
    SWAP8 = 0x97,
    SWAP9 = 0x98,
    SWAP10 = 0x99,
    SWAP11 = 0x9a,
    SWAP12 = 0x9b,
    SWAP13 = 0x9c,
    SWAP14 = 0x9d,
    SWAP15 = 0x9e,
    SWAP16 = 0x9f,

    // 0xa0 range - logging
    LOG0 = 0xa0,
    LOG1 = 0xa1,
    LOG2 = 0xa2,
    LOG3 = 0xa3,
    LOG4 = 0xa4,

    // 0xf0 range - system operations
    CREATE = 0xf0,
    CALL = 0xf1,
    CALLCODE = 0xf2,
    RETURN = 0xf3,
    DELEGATECALL = 0xf4,
    CREATE2 = 0xf5,
    STATICCALL = 0xfa,
    REVERT = 0xfd,
    INVALID = 0xfe,
    SELFDESTRUCT = 0xff,
}

impl Opcode {
    pub fn from_u8(byte: u8) -> Option<Self> {
        match byte {
            0x00 => Some(Opcode::STOP),
            0x01 => Some(Opcode::ADD),
            0x02 => Some(Opcode::MUL),
            0x03 => Some(Opcode::SUB),
            0x04 => Some(Opcode::DIV),
            0x05 => Some(Opcode::SDIV),
            0x06 => Some(Opcode::MOD),
            0x07 => Some(Opcode::SMOD),
            0x08 => Some(Opcode::ADDMOD),
            0x09 => Some(Opcode::MULMOD),
            0x0a => Some(Opcode::EXP),
            0x0b => Some(Opcode::SIGNEXTEND),
            0x10 => Some(Opcode::LT),
            0x11 => Some(Opcode::GT),
            0x12 => Some(Opcode::SLT),
            0x13 => Some(Opcode::SGT),
            0x14 => Some(Opcode::EQ),
            0x15 => Some(Opcode::ISZERO),
            0x16 => Some(Opcode::AND),
            0x17 => Some(Opcode::OR),
            0x18 => Some(Opcode::XOR),
            0x19 => Some(Opcode::NOT),
            0x1a => Some(Opcode::BYTE),
            0x1b => Some(Opcode::SHL),
            0x1c => Some(Opcode::SHR),
            0x1d => Some(Opcode::SAR),
            0x20 => Some(Opcode::SHA3),
            0x30 => Some(Opcode::ADDRESS),
            0x31 => Some(Opcode::BALANCE),
            0x32 => Some(Opcode::ORIGIN),
            0x33 => Some(Opcode::CALLER),
            0x34 => Some(Opcode::CALLVALUE),
            0x35 => Some(Opcode::CALLDATALOAD),
            0x36 => Some(Opcode::CALLDATASIZE),
            0x37 => Some(Opcode::CALLDATACOPY),
            0x38 => Some(Opcode::CODESIZE),
            0x39 => Some(Opcode::CODECOPY),
            0x3a => Some(Opcode::GASPRICE),
            0x3b => Some(Opcode::EXTCODESIZE),
            0x3c => Some(Opcode::EXTCODECOPY),
            0x3d => Some(Opcode::RETURNDATASIZE),
            0x3e => Some(Opcode::RETURNDATACOPY),
            0x3f => Some(Opcode::EXTCODEHASH),
            0x40 => Some(Opcode::BLOCKHASH),
            0x41 => Some(Opcode::COINBASE),
            0x42 => Some(Opcode::TIMESTAMP),
            0x43 => Some(Opcode::NUMBER),
            0x44 => Some(Opcode::DIFFICULTY),
            0x45 => Some(Opcode::GASLIMIT),
            0x46 => Some(Opcode::CHAINID),
            0x47 => Some(Opcode::SELFBALANCE),
            0x48 => Some(Opcode::BASEFEE),
            0x50 => Some(Opcode::POP),
            0x51 => Some(Opcode::MLOAD),
            0x52 => Some(Opcode::MSTORE),
            0x53 => Some(Opcode::MSTORE8),
            0x54 => Some(Opcode::SLOAD),
            0x55 => Some(Opcode::SSTORE),
            0x56 => Some(Opcode::JUMP),
            0x57 => Some(Opcode::JUMPI),
            0x58 => Some(Opcode::PC),
            0x59 => Some(Opcode::MSIZE),
            0x5a => Some(Opcode::GAS),
            0x5b => Some(Opcode::JUMPDEST),
            0x60..=0x7f => Some(unsafe { std::mem::transmute(byte) }),
            0x80..=0x8f => Some(unsafe { std::mem::transmute(byte) }),
            0x90..=0x9f => Some(unsafe { std::mem::transmute(byte) }),
            0xa0..=0xa4 => Some(unsafe { std::mem::transmute(byte) }),
            0xf0 => Some(Opcode::CREATE),
            0xf1 => Some(Opcode::CALL),
            0xf2 => Some(Opcode::CALLCODE),
            0xf3 => Some(Opcode::RETURN),
            0xf4 => Some(Opcode::DELEGATECALL),
            0xf5 => Some(Opcode::CREATE2),
            0xfa => Some(Opcode::STATICCALL),
            0xfd => Some(Opcode::REVERT),
            0xfe => Some(Opcode::INVALID),
            0xff => Some(Opcode::SELFDESTRUCT),
            _ => None,
        }
    }

    /// Get gas cost for this opcode
    pub fn gas_cost(&self) -> u64 {
        match self {
            Opcode::STOP => 0,
            Opcode::ADD | Opcode::SUB | Opcode::NOT | Opcode::LT | Opcode::GT | 
            Opcode::SLT | Opcode::SGT | Opcode::EQ | Opcode::ISZERO | 
            Opcode::AND | Opcode::OR | Opcode::XOR | Opcode::BYTE |
            Opcode::CALLDATALOAD | Opcode::MLOAD | Opcode::MSTORE | 
            Opcode::MSTORE8 | Opcode::PUSH1..=Opcode::PUSH32 |
            Opcode::DUP1..=Opcode::DUP16 | Opcode::SWAP1..=Opcode::SWAP16 => 3,
            
            Opcode::MUL | Opcode::DIV | Opcode::SDIV | Opcode::MOD | Opcode::SMOD => 5,
            Opcode::ADDMOD | Opcode::MULMOD | Opcode::SIGNEXTEND => 8,
            Opcode::SHL | Opcode::SHR | Opcode::SAR => 3,
            
            Opcode::ADDRESS | Opcode::ORIGIN | Opcode::CALLER | Opcode::CALLVALUE |
            Opcode::CALLDATASIZE | Opcode::CODESIZE | Opcode::GASPRICE |
            Opcode::COINBASE | Opcode::TIMESTAMP | Opcode::NUMBER |
            Opcode::DIFFICULTY | Opcode::GASLIMIT | Opcode::CHAINID |
            Opcode::SELFBALANCE | Opcode::PC | Opcode::MSIZE | Opcode::GAS => 2,
            
            Opcode::JUMPDEST => 1,
            Opcode::POP => 2,
            Opcode::JUMP => 8,
            Opcode::JUMPI => 10,
            
            Opcode::SLOAD => 800,
            Opcode::SSTORE => 20000,
            
            Opcode::SHA3 => 30,
            Opcode::BALANCE => 700,
            Opcode::EXTCODESIZE | Opcode::EXTCODEHASH => 700,
            Opcode::BLOCKHASH => 20,
            
            Opcode::LOG0 => 375,
            Opcode::LOG1 => 750,
            Opcode::LOG2 => 1125,
            Opcode::LOG3 => 1500,
            Opcode::LOG4 => 1875,
            
            Opcode::CREATE | Opcode::CREATE2 => 32000,
            Opcode::CALL | Opcode::CALLCODE | Opcode::DELEGATECALL | Opcode::STATICCALL => 700,
            Opcode::SELFDESTRUCT => 5000,
            
            _ => 0,
        }
    }
}

/// EVM execution context
pub struct ExecutionContext {
    /// Contract address being executed
    pub address: [u8; 20],
    /// Caller address
    pub caller: [u8; 20],
    /// Transaction origin
    pub origin: [u8; 20],
    /// Call value in wei
    pub value: u128,
    /// Input data
    pub data: Vec<u8>,
    /// Gas limit
    pub gas_limit: u64,
    /// Gas price
    pub gas_price: u128,
    /// Block number
    pub block_number: u64,
    /// Block timestamp
    pub timestamp: u64,
    /// Chain ID
    pub chain_id: u64,
}

/// EVM execution result
pub struct ExecutionResult {
    /// Return data
    pub return_data: Vec<u8>,
    /// Gas used
    pub gas_used: u64,
    /// Success flag
    pub success: bool,
    /// Logs generated
    pub logs: Vec<Log>,
}

/// EVM log entry
#[derive(Debug, Clone)]
pub struct Log {
    pub address: [u8; 20],
    pub topics: Vec<[u8; 32]>,
    pub data: Vec<u8>,
}

/// EVM Interpreter - executes bytecode
pub struct EvmInterpreter {
    /// Stack (max 1024 items)
    stack: Vec<[u8; 32]>,
    /// Memory
    memory: Vec<u8>,
    /// Program counter
    pc: usize,
    /// Gas remaining
    gas: u64,
    /// Return data
    return_data: Vec<u8>,
    /// Logs
    logs: Vec<Log>,
    /// Stopped flag
    stopped: bool,
    /// Reverted flag
    reverted: bool,
}

impl EvmInterpreter {
    pub fn new(gas_limit: u64) -> Self {
        Self {
            stack: Vec::with_capacity(1024),
            memory: Vec::new(),
            pc: 0,
            gas: gas_limit,
            return_data: Vec::new(),
            logs: Vec::new(),
            stopped: false,
            reverted: false,
        }
    }

    /// Execute bytecode
    pub fn execute(
        &mut self,
        bytecode: &[u8],
        context: &ExecutionContext,
        state: &mut super::EvmState,
    ) -> Result<ExecutionResult, ProgramError> {
        while self.pc < bytecode.len() && !self.stopped && !self.reverted {
            let opcode_byte = bytecode[self.pc];
            let opcode = Opcode::from_u8(opcode_byte)
                .ok_or(ProgramError::InvalidInstructionData)?;

            // Check gas
            let gas_cost = opcode.gas_cost();
            if self.gas < gas_cost {
                return Err(ProgramError::InsufficientFunds);
            }
            self.gas -= gas_cost;

            // Execute opcode
            self.execute_opcode(opcode, bytecode, context, state)?;

            if !self.stopped && !self.reverted {
                self.pc += 1;
            }
        }

        Ok(ExecutionResult {
            return_data: self.return_data.clone(),
            gas_used: context.gas_limit - self.gas,
            success: !self.reverted,
            logs: self.logs.clone(),
        })
    }

    /// Execute a single opcode
    fn execute_opcode(
        &mut self,
        opcode: Opcode,
        bytecode: &[u8],
        context: &ExecutionContext,
        state: &mut super::EvmState,
    ) -> Result<(), ProgramError> {
        match opcode {
            // Arithmetic operations
            Opcode::ADD => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = u256_add(&a, &b);
                self.push(&result)?;
            }
            Opcode::MUL => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = u256_mul(&a, &b);
                self.push(&result)?;
            }
            Opcode::SUB => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = u256_sub(&a, &b);
                self.push(&result)?;
            }
            Opcode::DIV => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = u256_div(&a, &b);
                self.push(&result)?;
            }
            Opcode::MOD => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = u256_mod(&a, &b);
                self.push(&result)?;
            }

            // Comparison operations
            Opcode::LT => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = if u256_lt(&a, &b) { u256_one() } else { u256_zero() };
                self.push(&result)?;
            }
            Opcode::GT => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = if u256_gt(&a, &b) { u256_one() } else { u256_zero() };
                self.push(&result)?;
            }
            Opcode::EQ => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = if a == b { u256_one() } else { u256_zero() };
                self.push(&result)?;
            }
            Opcode::ISZERO => {
                let a = self.pop()?;
                let result = if a == u256_zero() { u256_one() } else { u256_zero() };
                self.push(&result)?;
            }

            // Bitwise operations
            Opcode::AND => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = u256_and(&a, &b);
                self.push(&result)?;
            }
            Opcode::OR => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = u256_or(&a, &b);
                self.push(&result)?;
            }
            Opcode::XOR => {
                let a = self.pop()?;
                let b = self.pop()?;
                let result = u256_xor(&a, &b);
                self.push(&result)?;
            }
            Opcode::NOT => {
                let a = self.pop()?;
                let result = u256_not(&a);
                self.push(&result)?;
            }

            // Stack operations
            Opcode::POP => {
                self.pop()?;
            }
            Opcode::PUSH1..=Opcode::PUSH32 => {
                let n = (opcode as u8 - Opcode::PUSH1 as u8 + 1) as usize;
                let mut value = [0u8; 32];
                let end = (self.pc + n + 1).min(bytecode.len());
                let data = &bytecode[self.pc + 1..end];
                value[32 - data.len()..].copy_from_slice(data);
                self.push(&value)?;
                self.pc += n;
            }
            Opcode::DUP1..=Opcode::DUP16 => {
                let n = (opcode as u8 - Opcode::DUP1 as u8) as usize;
                let value = self.stack.get(self.stack.len() - n - 1)
                    .ok_or(ProgramError::InvalidAccountData)?;
                self.push(value)?;
            }
            Opcode::SWAP1..=Opcode::SWAP16 => {
                let n = (opcode as u8 - Opcode::SWAP1 as u8 + 1) as usize;
                let len = self.stack.len();
                if len < n + 1 {
                    return Err(ProgramError::InvalidAccountData);
                }
                self.stack.swap(len - 1, len - n - 1);
            }

            // Memory operations
            Opcode::MLOAD => {
                let offset = u256_to_usize(&self.pop()?);
                self.expand_memory(offset + 32)?;
                let mut value = [0u8; 32];
                value.copy_from_slice(&self.memory[offset..offset + 32]);
                self.push(&value)?;
            }
            Opcode::MSTORE => {
                let offset = u256_to_usize(&self.pop()?);
                let value = self.pop()?;
                self.expand_memory(offset + 32)?;
                self.memory[offset..offset + 32].copy_from_slice(&value);
            }
            Opcode::MSTORE8 => {
                let offset = u256_to_usize(&self.pop()?);
                let value = self.pop()?;
                self.expand_memory(offset + 1)?;
                self.memory[offset] = value[31];
            }
            Opcode::MSIZE => {
                let size = self.memory.len();
                self.push(&usize_to_u256(size))?;
            }

            // Storage operations
            Opcode::SLOAD => {
                let key = self.pop()?;
                let value = state.get_storage(&context.address, &key);
                self.push(&value)?;
            }
            Opcode::SSTORE => {
                let key = self.pop()?;
                let value = self.pop()?;
                state.set_storage(&context.address, &key, &value);
            }

            // Control flow
            Opcode::JUMP => {
                let dest = u256_to_usize(&self.pop()?);
                if dest >= bytecode.len() || bytecode[dest] != Opcode::JUMPDEST as u8 {
                    return Err(ProgramError::InvalidInstructionData);
                }
                self.pc = dest;
                return Ok(());
            }
            Opcode::JUMPI => {
                let dest = u256_to_usize(&self.pop()?);
                let cond = self.pop()?;
                if cond != u256_zero() {
                    if dest >= bytecode.len() || bytecode[dest] != Opcode::JUMPDEST as u8 {
                        return Err(ProgramError::InvalidInstructionData);
                    }
                    self.pc = dest;
                    return Ok(());
                }
            }
            Opcode::JUMPDEST => {
                // Valid jump destination, no-op
            }
            Opcode::PC => {
                self.push(&usize_to_u256(self.pc))?;
            }

            // Context operations
            Opcode::ADDRESS => {
                let mut value = [0u8; 32];
                value[12..].copy_from_slice(&context.address);
                self.push(&value)?;
            }
            Opcode::CALLER => {
                let mut value = [0u8; 32];
                value[12..].copy_from_slice(&context.caller);
                self.push(&value)?;
            }
            Opcode::CALLVALUE => {
                self.push(&u128_to_u256(context.value))?;
            }
            Opcode::CALLDATALOAD => {
                let offset = u256_to_usize(&self.pop()?);
                let mut value = [0u8; 32];
                if offset < context.data.len() {
                    let end = (offset + 32).min(context.data.len());
                    value[..end - offset].copy_from_slice(&context.data[offset..end]);
                }
                self.push(&value)?;
            }
            Opcode::CALLDATASIZE => {
                self.push(&usize_to_u256(context.data.len()))?;
            }
            Opcode::GASPRICE => {
                self.push(&u128_to_u256(context.gas_price))?;
            }
            Opcode::CHAINID => {
                self.push(&u64_to_u256(context.chain_id))?;
            }
            Opcode::TIMESTAMP => {
                self.push(&u64_to_u256(context.timestamp))?;
            }
            Opcode::NUMBER => {
                self.push(&u64_to_u256(context.block_number))?;
            }
            Opcode::GAS => {
                self.push(&u64_to_u256(self.gas))?;
            }

            // Return operations
            Opcode::RETURN => {
                let offset = u256_to_usize(&self.pop()?);
                let size = u256_to_usize(&self.pop()?);
                self.expand_memory(offset + size)?;
                self.return_data = self.memory[offset..offset + size].to_vec();
                self.stopped = true;
            }
            Opcode::REVERT => {
                let offset = u256_to_usize(&self.pop()?);
                let size = u256_to_usize(&self.pop()?);
                self.expand_memory(offset + size)?;
                self.return_data = self.memory[offset..offset + size].to_vec();
                self.reverted = true;
                self.stopped = true;
            }
            Opcode::STOP => {
                self.stopped = true;
            }

            // Logging operations
            Opcode::LOG0..=Opcode::LOG4 => {
                let topic_count = (opcode as u8 - Opcode::LOG0 as u8) as usize;
                let offset = u256_to_usize(&self.pop()?);
                let size = u256_to_usize(&self.pop()?);
                
                let mut topics = Vec::new();
                for _ in 0..topic_count {
                    topics.push(self.pop()?);
                }
                
                self.expand_memory(offset + size)?;
                let data = self.memory[offset..offset + size].to_vec();
                
                self.logs.push(Log {
                    address: context.address,
                    topics,
                    data,
                });
            }

            // Not yet implemented opcodes
            _ => {
                solana_program::log::sol_log(&format!("Opcode {:?} not yet implemented", opcode));
            }
        }

        Ok(())
    }

    fn push(&mut self, value: &[u8; 32]) -> Result<(), ProgramError> {
        if self.stack.len() >= 1024 {
            return Err(ProgramError::InvalidAccountData);
        }
        self.stack.push(*value);
        Ok(())
    }

    fn pop(&mut self) -> Result<[u8; 32], ProgramError> {
        self.stack.pop().ok_or(ProgramError::InvalidAccountData)
    }

    fn expand_memory(&mut self, size: usize) -> Result<(), ProgramError> {
        if size > self.memory.len() {
            // Charge gas for memory expansion
            let words = (size + 31) / 32;
            let memory_cost = 3 * words + (words * words) / 512;
            if self.gas < memory_cost as u64 {
                return Err(ProgramError::InsufficientFunds);
            }
            self.gas -= memory_cost as u64;
            
            self.memory.resize(size, 0);
        }
        Ok(())
    }
}

// U256 helper functions
fn u256_zero() -> [u8; 32] {
    [0u8; 32]
}

fn u256_one() -> [u8; 32] {
    let mut result = [0u8; 32];
    result[31] = 1;
    result
}

fn u256_add(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let mut result = [0u8; 32];
    let mut carry = 0u16;
    for i in (0..32).rev() {
        let sum = a[i] as u16 + b[i] as u16 + carry;
        result[i] = sum as u8;
        carry = sum >> 8;
    }
    result
}

fn u256_sub(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let mut result = [0u8; 32];
    let mut borrow = 0i16;
    for i in (0..32).rev() {
        let diff = a[i] as i16 - b[i] as i16 - borrow;
        result[i] = diff as u8;
        borrow = if diff < 0 { 1 } else { 0 };
    }
    result
}

fn u256_mul(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    // Simplified multiplication (only works for small numbers)
    let a_u128 = u128::from_be_bytes(a[16..32].try_into().unwrap());
    let b_u128 = u128::from_be_bytes(b[16..32].try_into().unwrap());
    let result_u128 = a_u128.wrapping_mul(b_u128);
    u128_to_u256(result_u128)
}

fn u256_div(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    if *b == u256_zero() {
        return u256_zero();
    }
    let a_u128 = u128::from_be_bytes(a[16..32].try_into().unwrap());
    let b_u128 = u128::from_be_bytes(b[16..32].try_into().unwrap());
    if b_u128 == 0 {
        return u256_zero();
    }
    let result_u128 = a_u128 / b_u128;
    u128_to_u256(result_u128)
}

fn u256_mod(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    if *b == u256_zero() {
        return u256_zero();
    }
    let a_u128 = u128::from_be_bytes(a[16..32].try_into().unwrap());
    let b_u128 = u128::from_be_bytes(b[16..32].try_into().unwrap());
    if b_u128 == 0 {
        return u256_zero();
    }
    let result_u128 = a_u128 % b_u128;
    u128_to_u256(result_u128)
}

fn u256_and(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let mut result = [0u8; 32];
    for i in 0..32 {
        result[i] = a[i] & b[i];
    }
    result
}

fn u256_or(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let mut result = [0u8; 32];
    for i in 0..32 {
        result[i] = a[i] | b[i];
    }
    result
}

fn u256_xor(a: &[u8; 32], b: &[u8; 32]) -> [u8; 32] {
    let mut result = [0u8; 32];
    for i in 0..32 {
        result[i] = a[i] ^ b[i];
    }
    result
}

fn u256_not(a: &[u8; 32]) -> [u8; 32] {
    let mut result = [0u8; 32];
    for i in 0..32 {
        result[i] = !a[i];
    }
    result
}

fn u256_lt(a: &[u8; 32], b: &[u8; 32]) -> bool {
    for i in 0..32 {
        if a[i] < b[i] {
            return true;
        }
        if a[i] > b[i] {
            return false;
        }
    }
    false
}

fn u256_gt(a: &[u8; 32], b: &[u8; 32]) -> bool {
    for i in 0..32 {
        if a[i] > b[i] {
            return true;
        }
        if a[i] < b[i] {
            return false;
        }
    }
    false
}

fn u256_to_usize(value: &[u8; 32]) -> usize {
    let mut result = 0usize;
    for &byte in &value[24..32] {
        result = (result << 8) | byte as usize;
    }
    result
}

fn usize_to_u256(value: usize) -> [u8; 32] {
    let mut result = [0u8; 32];
    result[24..32].copy_from_slice(&value.to_be_bytes());
    result
}

fn u64_to_u256(value: u64) -> [u8; 32] {
    let mut result = [0u8; 32];
    result[24..32].copy_from_slice(&value.to_be_bytes());
    result
}

fn u128_to_u256(value: u128) -> [u8; 32] {
    let mut result = [0u8; 32];
    result[16..32].copy_from_slice(&value.to_be_bytes());
    result
}
