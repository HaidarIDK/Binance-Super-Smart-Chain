# Deploy BSSC Testnet on Railway (Easy Alternative)

## Why Railway?
- No SSH needed
- Deploy via GitHub
- Free trial available
- Simple web interface

## Steps:

### 1. Create Railway Account
Go to: https://railway.app
- Sign up with GitHub

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose: `HaidarIDK/Binance-Super-Smart-Chain`

### 3. Configure Build
Add this `railway.json` file to your repo:

```json
{
  "build": {
    "builder": "DOCKERFILE",
    "buildCommand": "cargo build --release --bin solana-test-validator"
  },
  "deploy": {
    "startCommand": "./target/release/solana-test-validator --rpc-port $PORT --rpc-bind-address 0.0.0.0",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 4. Add Dockerfile

```dockerfile
FROM rust:1.75

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    libssl-dev \
    libudev-dev

RUN cargo build --release --bin solana-test-validator --bin solana-faucet

EXPOSE 8899 9900

CMD ["./target/release/solana-test-validator", "--rpc-port", "8899", "--rpc-bind-address", "0.0.0.0", "--faucet-port", "9900"]
```

### 5. Deploy
Railway will automatically build and deploy!

Your testnet will be available at: `https://your-project.railway.app`

