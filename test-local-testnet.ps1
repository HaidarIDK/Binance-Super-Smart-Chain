# Test BSSC Local Testnet
Write-Host "Testing BSSC Local Testnet..." -ForegroundColor Green
Write-Host ""

# Test RPC endpoint
Write-Host "1. Testing RPC endpoint..." -ForegroundColor Cyan
$rpcTest = Invoke-RestMethod -Uri "http://localhost:8899" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' -ErrorAction SilentlyContinue

if ($rpcTest) {
    Write-Host "   RPC Status: ONLINE" -ForegroundColor Green
    Write-Host "   Response: $($rpcTest | ConvertTo-Json)" -ForegroundColor Gray
} else {
    Write-Host "   RPC Status: OFFLINE" -ForegroundColor Red
    Write-Host "   Make sure validator is running (run-testnet-locally.ps1)" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "2. Testing block height..." -ForegroundColor Cyan
$blockTest = Invoke-RestMethod -Uri "http://localhost:8899" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","id":1,"method":"getBlockHeight"}' -ErrorAction SilentlyContinue

if ($blockTest.result) {
    Write-Host "   Current Block: $($blockTest.result)" -ForegroundColor Green
}

Write-Host ""
Write-Host "3. Testing via public RPC adapter..." -ForegroundColor Cyan
Write-Host "   Connecting to: https://bssc-rpc.bssc.live" -ForegroundColor Gray

$publicTest = Invoke-RestMethod -Uri "https://bssc-rpc.bssc.live" -Method Post -ContentType "application/json" -Body '{"jsonrpc":"2.0","id":1,"method":"eth_chainId","params":[]}' -ErrorAction SilentlyContinue

if ($publicTest.result) {
    $chainId = [Convert]::ToInt32($publicTest.result, 16)
    Write-Host "   Public RPC: ONLINE" -ForegroundColor Green
    Write-Host "   Chain ID: $chainId" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BSSC Testnet is Running!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local Endpoints:" -ForegroundColor Yellow
Write-Host "  RPC: http://localhost:8899" -ForegroundColor White
Write-Host "  Faucet: http://localhost:9900" -ForegroundColor White
Write-Host ""
Write-Host "Public Endpoint:" -ForegroundColor Yellow
Write-Host "  RPC: https://bssc-rpc.bssc.live" -ForegroundColor White
Write-Host "  (Connect your local validator to this)" -ForegroundColor Gray
Write-Host ""
Write-Host "Test Commands:" -ForegroundColor Yellow
Write-Host "  solana config set --url http://localhost:8899" -ForegroundColor Cyan
Write-Host "  solana airdrop 1" -ForegroundColor Cyan
Write-Host "  solana balance" -ForegroundColor Cyan
Write-Host ""

