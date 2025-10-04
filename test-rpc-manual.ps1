# Manual RPC Testing Script
Write-Host "🧪 Testing RPC Endpoint Manually..." -ForegroundColor Green
Write-Host ""

$RPC_URL = "http://localhost:8899"

# Function to test RPC method
function Test-RPCMethod {
    param(
        [string]$Method,
        [array]$Params = @(),
        [string]$Description
    )
    
    $payload = @{
        jsonrpc = "2.0"
        id = 1
        method = $Method
        params = $Params
    } | ConvertTo-Json
    
    Write-Host "🔍 Testing: $Description" -ForegroundColor Cyan
    Write-Host "Method: $Method" -ForegroundColor White
    
    try {
        $response = Invoke-RestMethod -Uri $RPC_URL -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 10
        Write-Host "✅ Success!" -ForegroundColor Green
        Write-Host "Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
        Write-Host ""
        return $response
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

# Test various RPC methods
Write-Host "📊 Testing Core RPC Methods:" -ForegroundColor Yellow
Test-RPCMethod -Method "getHealth" -Description "Health Check"
Test-RPCMethod -Method "getVersion" -Description "Version Information"
Test-RPCMethod -Method "getSlot" -Description "Current Slot"
Test-RPCMethod -Method "getBlockHeight" -Description "Block Height"

Write-Host "🌐 Testing Web3/Ethereum Methods:" -ForegroundColor Yellow
Test-RPCMethod -Method "eth_blockNumber" -Description "Ethereum Block Number"
Test-RPCMethod -Method "eth_chainId" -Description "Chain ID"
Test-RPCMethod -Method "net_version" -Description "Network Version"

Write-Host "📝 Testing Account Methods:" -ForegroundColor Yellow
Test-RPCMethod -Method "getAccountInfo" -Params @("11111111111111111111111111111111") -Description "Account Info"

Write-Host "🎉 Manual testing complete!" -ForegroundColor Green
