# ETH Bridge PDA Implementation - Deployment Guide

## What is PDA?

Program Derived Addresses (PDA) allow your Solana program to control accounts deterministically derived from Ethereum addresses. This solves the private key problem:

- MetaMask has ETH private key
- Solana needs Solana private key
- PDA: Program controls the Solana account for you
- No private key needed!

## Architecture

```
MetaMask (ETH addr: 0x819...) 
    signs transaction
         ↓
RPC Server converts to Solana instruction
         ↓
ETH Bridge Program (on-chain)
    derives PDA from 0x819...
    executes transfer on behalf of user
         ↓
BSSC Blockchain (real transaction)
```

## Step 1: Install Dependencies

On your server:

```bash
cd ~/Binance-Super-Smart-Chain

# Install Node.js dependencies
npm install @solana/web3.js borsh

# Install Rust toolchain (if not already)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install Solana build tools
cargo install --git https://github.com/solana-labs/solana solana-install
```

## Step 2: Build the Bridge Program

```bash
cd ~/Binance-Super-Smart-Chain

# Make build script executable
chmod +x build-eth-bridge.sh

# Build the program
./build-eth-bridge.sh

# Or manually:
cd programs/eth-bridge
cargo build-sbf
```

## Step 3: Deploy the Program

```bash
# Generate a new keypair for the program (or use existing)
solana-keygen new -o ~/eth-bridge-keypair.json

# Deploy program
solana program deploy \
    programs/eth-bridge/target/deploy/eth_bridge.so \
    --program-id ~/eth-bridge-keypair.json \
    --url http://127.0.0.1:8899

# Get the program ID
solana address -k ~/eth-bridge-keypair.json
```

**Save this program ID!** Example: `BRGxxx...xxx`

## Step 4: Configure RPC Server

Edit your systemd service:

```bash
sudo nano /etc/systemd/system/bssc-rpc.service
```

Add environment variable:

```ini
[Service]
...
Environment="ETH_BRIDGE_PROGRAM_ID=BRGxxx...xxx"
Environment="BSSC_VALIDATOR_URL=http://127.0.0.1:8899"
Environment="METAMASK_PORT=8545"
...
```

Reload and restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart bssc-rpc
```

## Step 5: Test PDA Bridge

Test PDA derivation:

```bash
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"eth_requestFaucet","params":["0x819BF6791d055c3dAbe3bAc8D2DA6e9Da6FB5718"]}'
```

Should return a PDA address instead of simple hash!

## How It Works

### Without PDA (Current - Limited):
```
ETH Address: 0x819...
    ↓ SHA256 hash
Solana Address: CDmp... (just a hash, no private key)
    ↓ Can't sign transactions!
FAIL
```

### With PDA (New - Full Support):
```
ETH Address: 0x819...
    ↓ PDA derivation
PDA: BRid... (controlled by bridge program)
    ↓ Program signs on your behalf
SUCCESS - Full transaction support!
```

## Transaction Flow with PDA

1. **User sends transaction in MetaMask**
   - Signs with ETH private key
   - Signature: `v, r, s` values

2. **RPC receives eth_sendTransaction**
   - Extracts: from (0x819...), to (0x456...), amount
   - Extracts ETH signature

3. **RPC builds Solana transaction**
   ```javascript
   // Derive PDAs
   fromPDA = derivePDA(0x819...)
   toPDA = derivePDA(0x456...)
   
   // Create bridge instruction
   instruction = Transfer {
       eth_address: 0x819...,
       amount: 2000000000,
       eth_signature: [v, r, s]
   }
   ```

4. **Bridge program executes**
   - Verifies ETH signature matches 0x819...
   - Transfers lamports from fromPDA to toPDA
   - Both PDAs controlled by program

5. **Transaction confirmed**
   - Real blockchain transaction
   - MetaMask shows success!

## Current Status

Files created:
- `programs/eth-bridge/Cargo.toml` - Program manifest
- `programs/eth-bridge/src/lib.rs` - PDA program implementation  
- `programs/eth-bridge/src/instruction.rs` - Instruction builders
- `eth-bridge-client.js` - Node.js client for RPC server
- `build-eth-bridge.sh` - Build script

Status:
- Program: Created, needs building
- Client: Created, needs @solana/web3.js
- RPC Integration: Partially done
- Deployment: Pending

## Next Steps

1. Build the program on your server
2. Deploy it to your validator
3. Get the program ID
4. Configure RPC server with program ID
5. Test transactions!

Want me to create a quick deployment script to automate this?

