use {
    solana_account_decoder::parse_token::real_number_string_trimmed,
    solana_sdk::native_token::lamports_to_bnb,
    std::{
        fmt::{Debug, Display, Formatter, Result},
        ops::Add,
    },
};

const BNB_SYMBOL: &str = "BNB";

#[derive(PartialEq, Eq)]
pub enum TokenType {
    Bnb,
    SplToken,
}

pub struct Token {
    amount: u64,
    decimals: u8,
    token_type: TokenType,
}

impl Token {
    fn write_with_symbol(&self, f: &mut Formatter) -> Result {
        match &self.token_type {
            TokenType::Bnb => {
                let amount = lamports_to_bnb(self.amount);
                write!(f, "{BNB_SYMBOL}{amount}")
            }
            TokenType::SplToken => {
                let amount = real_number_string_trimmed(self.amount, self.decimals);
                write!(f, "{amount} tokens")
            }
        }
    }

    pub fn bnb(amount: u64) -> Self {
        Self {
            amount,
            decimals: 9,
            token_type: TokenType::Bnb,
        }
    }

    // Keep backward compatibility - SOL amounts are treated as SOL lamports
    pub fn sol(amount: u64) -> Self {
        Self {
            amount,
            decimals: 9,
            token_type: TokenType::Bnb, // Display as BNB but with SOL amount
        }
    }

    pub fn spl_token(amount: u64, decimals: u8) -> Self {
        Self {
            amount,
            decimals,
            token_type: TokenType::SplToken,
        }
    }
}

impl Display for Token {
    fn fmt(&self, f: &mut Formatter) -> Result {
        self.write_with_symbol(f)
    }
}

impl Debug for Token {
    fn fmt(&self, f: &mut Formatter) -> Result {
        self.write_with_symbol(f)
    }
}

impl Add for Token {
    type Output = Token;

    fn add(self, other: Self) -> Self {
        if self.token_type == other.token_type {
            Self {
                amount: self.amount + other.amount,
                decimals: self.decimals,
                token_type: self.token_type,
            }
        } else {
            self
        }
    }
}
