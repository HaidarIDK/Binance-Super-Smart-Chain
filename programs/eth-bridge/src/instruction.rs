//! Instruction builders for ETH Bridge program

use borsh::BorshSerialize;
use solana_program::{
    instruction::{AccountMeta, Instruction},
    pubkey::Pubkey,
    system_program,
};

use crate::BridgeInstruction;

/// Create instruction to initialize a PDA for an Ethereum address
pub fn initialize_pda(
    program_id: &Pubkey,
    payer: &Pubkey,
    eth_address: [u8; 20],
) -> Instruction {
    let (pda, _bump) = crate::derive_pda(&eth_address, program_id);

    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(*payer, true),
            AccountMeta::new(pda, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: BridgeInstruction::InitializePDA { eth_address }
            .try_to_vec()
            .unwrap(),
    }
}

/// Create instruction to transfer SOL via PDA
pub fn transfer(
    program_id: &Pubkey,
    source_eth_address: [u8; 20],
    destination: &Pubkey,
    amount: u64,
    eth_signature: [u8; 65],
) -> Instruction {
    let (source_pda, _bump) = crate::derive_pda(&source_eth_address, program_id);

    Instruction {
        program_id: *program_id,
        accounts: vec![
            AccountMeta::new(source_pda, false),
            AccountMeta::new(*destination, false),
            AccountMeta::new_readonly(system_program::id(), false),
        ],
        data: BridgeInstruction::Transfer {
            eth_address: source_eth_address,
            amount,
            eth_signature,
        }
        .try_to_vec()
        .unwrap(),
    }
}

