# BSSC RPC Node Launcher
Write-Host "🚀 Launching BSSC RPC Node..." -ForegroundColor Green
Write-Host ""

# Configuration
$RPC_PORT = 8899
$LEDGER_DIR = ".\ledger"
$LOG_FILE = ".\logs\rpc-node.log"
$IDENTITY_FILE = ".\config\validator-identity.json"
$VOTE_ACCOUNT_FILE = ".\config\validator-vote-account.json"

# Create necessary directories
Write-Host "📁 Creating necessary directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path ".\ledger" | Out-Null
New-Item -ItemType Directory -Force -Path ".\logs" | Out-Null
New-Item -ItemType Directory -Force -Path ".\config" | Out-Null

# Check if Solana CLI tools are available
Write-Host "🔍 Checking for Solana CLI tools..." -ForegroundColor Cyan

# Try to find solana-test-validator
$validatorPath = "solana-test-validator"
try {
    & $validatorPath --version | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Found solana-test-validator" -ForegroundColor Green
    } else {
        throw "solana-test-validator not working"
    }
} catch {
    Write-Host "❌ Error: Solana CLI tools not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Solana CLI tools:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://docs.solana.com/cli/install-solana-cli-tools" -ForegroundColor White
    Write-Host "2. Or run: sh -c `"`$(curl -sSfL https://release.solana.com/v1.18.4/install)`"" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Generate keypairs if they don't exist
Write-Host "🔑 Setting up validator keypairs..." -ForegroundColor Cyan

if (-not (Test-Path $IDENTITY_FILE)) {
    Write-Host "  • Generating validator identity keypair..." -ForegroundColor White
    & solana-keygen new --no-passphrase -so $IDENTITY_FILE
}

if (-not (Test-Path $VOTE_ACCOUNT_FILE)) {
    Write-Host "  • Generating vote account keypair..." -ForegroundColor White
    & solana-keygen new --no-passphrase -so $VOTE_ACCOUNT_FILE
}

Write-Host ""
Write-Host "🎯 Starting BSSC RPC Node..." -ForegroundColor Green
Write-Host "  • RPC Port: $RPC_PORT" -ForegroundColor White
Write-Host "  • Ledger Directory: $LEDGER_DIR" -ForegroundColor White
Write-Host "  • Log File: $LOG_FILE" -ForegroundColor White
Write-Host ""
Write-Host "🔗 RPC Endpoint will be available at: http://localhost:$RPC_PORT" -ForegroundColor Yellow
Write-Host ""

# Set environment variables
$env:RUST_LOG = "solana=info,solana_runtime::message_processor=debug"
$env:RUST_BACKTRACE = "1"

# Start the RPC node
try {
    Write-Host "🚀 Launching Solana Test Validator with RPC enabled..." -ForegroundColor Green
    Write-Host ""
    
    & $validatorPath `
        --ledger $LEDGER_DIR `
        --rpc-port $RPC_PORT `
        --rpc-bind-address 0.0.0.0 `
        --log $LOG_FILE `
        --enable-rpc-transaction-history `
        --enable-extended-tx-metadata-storage `
        --limit-ledger-size 100000

} catch {
    Write-Host "❌ Error starting RPC node: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "🎉 BSSC RPC Node started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Node Information:" -ForegroundColor Yellow
Write-Host "  • RPC URL: http://localhost:$RPC_PORT" -ForegroundColor White
Write-Host "  • Gossip Port: 8001" -ForegroundColor White
Write-Host "  • Full RPC API: Enabled" -ForegroundColor White
Write-Host "  • Transaction History: Enabled" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure reverse proxy (NGINX or Cloudflare Tunnel)" -ForegroundColor White
Write-Host "  2. Set up HTTPS/SSL certificates" -ForegroundColor White
Write-Host "  3. Configure your domain to point to this node" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Press Ctrl+C to stop the RPC node" -ForegroundColor Yellow
