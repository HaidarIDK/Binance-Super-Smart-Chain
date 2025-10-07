//! Definitions for the native BNB token and its fractional lamports.

#![allow(clippy::arithmetic_side_effects)]

/// There are 5.08 * 10^9 lamports in one BNB (1 BNB = 5.08 SOL)
pub const LAMPORTS_PER_BNB: u64 = 5_080_000_000;

/// Approximately convert fractional native tokens (lamports) into native tokens (BNB)
pub fn lamports_to_bnb(lamports: u64) -> f64 {
    lamports as f64 / LAMPORTS_PER_BNB as f64
}

/// Approximately convert native tokens (BNB) into fractional native tokens (lamports)
pub fn bnb_to_lamports(bnb: f64) -> u64 {
    (bnb * LAMPORTS_PER_BNB as f64) as u64
}

// Keep backward compatibility aliases
pub const LAMPORTS_PER_SOL: u64 = 1_000_000_000; // SOL maintains original precision
pub fn lamports_to_sol(lamports: u64) -> f64 { lamports as f64 / LAMPORTS_PER_SOL as f64 }
pub fn sol_to_lamports(sol: f64) -> u64 { (sol * LAMPORTS_PER_SOL as f64) as u64 }

// Conversion functions between SOL and BNB
pub fn sol_to_bnb(sol: f64) -> f64 { sol / 5.08 }
pub fn bnb_to_sol(bnb: f64) -> f64 { bnb * 5.08 }

use std::fmt::{Debug, Display, Formatter, Result};
pub struct Bnb(pub u64);

impl Bnb {
    fn write_in_bnb(&self, f: &mut Formatter) -> Result {
        write!(
            f,
            "BNB{}.{:09}",
            self.0 / LAMPORTS_PER_BNB,
            self.0 % LAMPORTS_PER_BNB
        )
    }
}

impl Display for Bnb {
    fn fmt(&self, f: &mut Formatter) -> Result {
        self.write_in_bnb(f)
    }
}

impl Debug for Bnb {
    fn fmt(&self, f: &mut Formatter) -> Result {
        self.write_in_bnb(f)
    }
}

// Keep backward compatibility alias
pub type Sol = Bnb;
