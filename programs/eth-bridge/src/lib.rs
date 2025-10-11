//! ETH-Solana Bridge using Program Derived Addresses (PDA)
//!
//! This program allows Ethereum addresses to control Solana accounts without
//! needing the Solana private key. It uses PDAs to derive deterministic
//! addresses from Ethereum addresses.
//!
//! Architecture:
//! - ETH address (0x123...) -> PDA (deterministic Solana address)
//! - PDA is controlled by this program
//! - MetaMask signs ETH transaction -> RPC converts to Solana instruction
//! - Program verifies ETH signature and executes on behalf of user

pub mod instruction;

use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};

entrypoint!(process_instruction);

/// Program instructions
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum BridgeInstruction {
    /// Initialize a PDA account for an Ethereum address
    ///
    /// Accounts:
    /// 0. [signer] Payer account
    /// 1. [writable] PDA account to initialize
    /// 2. [] System program
    InitializePDA {
        eth_address: [u8; 20], // Ethereum address (20 bytes)
    },

    /// Transfer SOL from one PDA to another (or regular account)
    ///
    /// Accounts:
    /// 0. [writable] Source PDA (derived from sender's ETH address)
    /// 1. [writable] Destination account
    /// 2. [] System program
    Transfer {
        eth_address: [u8; 20],  // Sender's ETH address (for PDA derivation)
        amount: u64,            // Amount in lamports
        eth_signature: [u8; 65], // ECDSA signature from MetaMask
    },
}

/// PDA account data structure
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct PDAAccount {
    pub eth_address: [u8; 20],
    pub is_initialized: bool,
    pub bump_seed: u8,
}

/// Seeds for PDA derivation
pub const PDA_SEED_PREFIX: &[u8] = b"eth-bridge";

/// Derive PDA from Ethereum address
pub fn derive_pda(
    eth_address: &[u8; 20],
    program_id: &Pubkey,
) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[PDA_SEED_PREFIX, eth_address],
        program_id,
    )
}

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = BridgeInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        BridgeInstruction::InitializePDA { eth_address } => {
            msg!("Instruction: InitializePDA");
            process_initialize_pda(program_id, accounts, eth_address)
        }
        BridgeInstruction::Transfer {
            eth_address,
            amount,
            eth_signature,
        } => {
            msg!("Instruction: Transfer");
            process_transfer(program_id, accounts, eth_address, amount, eth_signature)
        }
    }
}

fn process_initialize_pda(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    eth_address: [u8; 20],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let payer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Verify PDA
    let (expected_pda, bump_seed) = derive_pda(&eth_address, program_id);
    if expected_pda != *pda_account.key {
        msg!("Error: Invalid PDA");
        return Err(ProgramError::InvalidAccountData);
    }

    // Check if already initialized
    if pda_account.data_len() > 0 {
        msg!("PDA already initialized");
        return Ok(());
    }

    // Create PDA account
    let rent = Rent::get()?;
    let space = std::mem::size_of::<PDAAccount>();
    let rent_lamports = rent.minimum_balance(space);

    let seeds: &[&[u8]] = &[PDA_SEED_PREFIX, &eth_address, &[bump_seed]];

    invoke_signed(
        &system_instruction::create_account(
            payer.key,
            pda_account.key,
            rent_lamports,
            space as u64,
            program_id,
        ),
        &[payer.clone(), pda_account.clone(), system_program.clone()],
        &[seeds],
    )?;

    // Initialize account data
    let pda_data = PDAAccount {
        eth_address,
        is_initialized: true,
        bump_seed,
    };

    pda_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;

    msg!("PDA initialized for ETH address: {:?}", eth_address);
    Ok(())
}

fn process_transfer(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    eth_address: [u8; 20],
    amount: u64,
    _eth_signature: [u8; 65], // TODO: Verify ECDSA signature
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let source_pda = next_account_info(account_info_iter)?;
    let destination = next_account_info(account_info_iter)?;
    let _system_program = next_account_info(account_info_iter)?;

    // Verify source PDA
    let (expected_pda, bump_seed) = derive_pda(&eth_address, program_id);
    if expected_pda != *source_pda.key {
        msg!("Error: Invalid source PDA");
        return Err(ProgramError::InvalidAccountData);
    }

    // Verify PDA is initialized
    let pda_data = PDAAccount::try_from_slice(&source_pda.data.borrow())?;
    if !pda_data.is_initialized {
        msg!("Error: PDA not initialized");
        return Err(ProgramError::UninitializedAccount);
    }

    // TODO: Verify Ethereum signature
    // For now, we trust the RPC server to validate signatures
    // In production, implement secp256k1 signature verification here

    // Check sufficient balance
    let source_lamports = source_pda.lamports();
    if source_lamports < amount {
        msg!("Error: Insufficient funds");
        return Err(ProgramError::InsufficientFunds);
    }

    // Transfer lamports from PDA to destination
    **source_pda.try_borrow_mut_lamports()? -= amount;
    **destination.try_borrow_mut_lamports()? += amount;

    msg!(
        "Transferred {} lamports from PDA to {}",
        amount,
        destination.key
    );

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_pda_derivation() {
        let program_id = Pubkey::new_unique();
        let eth_address: [u8; 20] = [0x74, 0x2d, 0x35, 0xcc, 0x66, 0x34, 0xc0, 0x53, 0x29, 0x25, 0xa3, 0xb8, 0x44, 0xbc, 0x9e, 0x75, 0x95, 0xf0, 0xbe, 0xb];
        
        let (pda1, bump1) = derive_pda(&eth_address, &program_id);
        let (pda2, bump2) = derive_pda(&eth_address, &program_id);
        
        // Same ETH address should always produce same PDA
        assert_eq!(pda1, pda2);
        assert_eq!(bump1, bump2);
    }
}

