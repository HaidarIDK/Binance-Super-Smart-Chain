# BSSC Server Update Script - PowerShell Version
# Run this from your local Windows machine

param(
    [string]$ServerIP = "109.147.47.132",
    [string]$ServerUser = "root",
    [string]$ServerPath = "~/Binance-Super-Smart-Chain"
)

Write-Host "🚀 BSSC Server Update Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Server: $ServerUser@$ServerIP" -ForegroundColor Yellow
Write-Host "Path: $ServerPath" -ForegroundColor Yellow
Write-Host ""

# Check if we have the files
if (-not (Test-Path "bssc-live-server.js")) {
    Write-Host "❌ Error: bssc-live-server.js not found!" -ForegroundColor Red
    Write-Host "Make sure you're running this from the project directory" -ForegroundColor Yellow
    exit 1
}

# Step 1: Upload files
Write-Host "📤 Uploading files to server..." -ForegroundColor Cyan
try {
    scp bssc-live-server.js "${ServerUser}@${ServerIP}:${ServerPath}/"
    scp explorer-server.js "${ServerUser}@${ServerIP}:${ServerPath}/"
    scp eth-solana-bridge.js "${ServerUser}@${ServerIP}:${ServerPath}/"
    Write-Host "✅ Files uploaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to upload files" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Restart services via SSH
Write-Host "🔄 Restarting services on server..." -ForegroundColor Cyan
Write-Host "You may need to enter your password..." -ForegroundColor Yellow
Write-Host ""

# Create restart command
$restartCommand = @"
cd $ServerPath
echo '🔄 Stopping old processes...'
pkill -f 'node bssc-live-server' || true
pkill -f 'node explorer-server' || true
sleep 2

echo '✅ Starting BSSC RPC Server...'
nohup node bssc-live-server.js > rpc.log 2>&1 &

echo '✅ Starting Explorer Server...'
nohup node explorer-server.js > explorer.log 2>&1 &

sleep 3
echo '🧪 Testing services...'

# Test RPC
curl -s http://localhost:8545 -X POST -H 'Content-Type: application/json' -d '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"getHealth\"}' | grep -q 'ok' && echo '✅ RPC Server: Working' || echo '❌ RPC Server: Failed'

# Test Explorer
curl -s http://localhost:3001 > /dev/null && echo '✅ Explorer: Working' || echo '❌ Explorer: Failed'

echo ''
echo '✅ Update complete!'
"@

# Execute on server
ssh "${ServerUser}@${ServerIP}" $restartCommand

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "✅ Update Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Access your services:" -ForegroundColor Cyan
Write-Host "  🌐 RPC: https://bssc-rpc.bssc.live" -ForegroundColor White
Write-Host "  🔍 Explorer: https://explorer.bssc.live" -ForegroundColor White
Write-Host ""
Write-Host "To check logs:" -ForegroundColor Cyan
Write-Host "  ssh ${ServerUser}@${ServerIP}" -ForegroundColor White
Write-Host "  tail -f ~/Binance-Super-Smart-Chain/rpc.log" -ForegroundColor White
Write-Host ""



