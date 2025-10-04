# BSSC RPC Node Test Script
Write-Host "🧪 Testing BSSC RPC Node..." -ForegroundColor Green
Write-Host ""

# Configuration
$RPC_URL = "http://localhost:8899"
$HTTPS_RPC_URL = "https://your-domain.com"  # Update this with your actual domain

# Function to test RPC endpoint
function Test-RPCEndpoint {
    param(
        [string]$Url,
        [string]$Name
    )
    
    Write-Host "🔍 Testing $Name at $Url..." -ForegroundColor Cyan
    
    $testPayload = @{
        jsonrpc = "2.0"
        id = 1
        method = "getHealth"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Post -Body $testPayload -ContentType "application/json" -TimeoutSec 10
        if ($response) {
            Write-Host "✅ $Name is responding correctly" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "❌ $Name failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test specific RPC methods
function Test-RPCMethod {
    param(
        [string]$Url,
        [string]$Method,
        [array]$Params = @()
    )
    
    $payload = @{
        jsonrpc = "2.0"
        id = 1
        method = $Method
        params = $Params
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Post -Body $payload -ContentType "application/json" -TimeoutSec 10
        Write-Host "✅ $Method successful" -ForegroundColor Green
        return $response
    } catch {
        Write-Host "❌ $Method failed: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test local RPC endpoint
Write-Host "🏠 Testing Local RPC Endpoint..." -ForegroundColor Yellow
$localSuccess = Test-RPCEndpoint -Url $RPC_URL -Name "Local RPC"

if ($localSuccess) {
    Write-Host ""
    Write-Host "📊 Testing RPC Methods..." -ForegroundColor Cyan
    
    # Test basic RPC methods
    $methods = @(
        @{Method="getHealth"; Params=@()},
        @{Method="getVersion"; Params=@()},
        @{Method="getSlot"; Params=@()},
        @{Method="getBlockHeight"; Params=@()}
    )
    
    foreach ($method in $methods) {
        Test-RPCMethod -Url $RPC_URL -Method $method.Method -Params $method.Params
    }
    
    Write-Host ""
    Write-Host "🎯 Testing Web3 Compatibility..." -ForegroundColor Cyan
    
    # Test eth-compatible methods if available
    $ethMethods = @(
        @{Method="eth_blockNumber"; Params=@()},
        @{Method="eth_chainId"; Params=@()},
        @{Method="net_version"; Params=@()}
    )
    
    foreach ($method in $ethMethods) {
        Test-RPCMethod -Url $RPC_URL -Method $method.Method -Params $method.Params
    }
} else {
    Write-Host "⚠️  Local RPC node is not responding. Make sure it's running." -ForegroundColor Yellow
    Write-Host "Run: .\launch_rpc_node.ps1" -ForegroundColor White
}

Write-Host ""
Write-Host "🌐 Testing HTTPS Endpoint (if configured)..." -ForegroundColor Yellow

# Test HTTPS endpoint if domain is configured
if ($HTTPS_RPC_URL -ne "https://your-domain.com") {
    $httpsSuccess = Test-RPCEndpoint -Url $HTTPS_RPC_URL -Name "HTTPS RPC"
    
    if ($httpsSuccess) {
        Write-Host ""
        Write-Host "🔒 Testing HTTPS Security..." -ForegroundColor Cyan
        
        # Test SSL certificate
        try {
            $request = [System.Net.WebRequest]::Create($HTTPS_RPC_URL)
            $request.GetResponse() | Out-Null
            Write-Host "✅ SSL Certificate is valid" -ForegroundColor Green
        } catch {
            Write-Host "❌ SSL Certificate issue: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test CORS headers
        try {
            $headers = @{
                'Origin' = 'https://example.com'
                'Access-Control-Request-Method' = 'POST'
                'Access-Control-Request-Headers' = 'Content-Type'
            }
            
            $response = Invoke-WebRequest -Uri $HTTPS_RPC_URL -Method Options -Headers $headers -TimeoutSec 10
            if ($response.Headers['Access-Control-Allow-Origin']) {
                Write-Host "✅ CORS headers are configured" -ForegroundColor Green
            } else {
                Write-Host "⚠️  CORS headers not found" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "❌ CORS test failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  HTTPS endpoint not configured. Update the HTTPS_RPC_URL variable in this script." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📈 Performance Test..." -ForegroundColor Cyan

# Simple performance test
if ($localSuccess) {
    $startTime = Get-Date
    $successCount = 0
    $testCount = 10
    
    for ($i = 1; $i -le $testCount; $i++) {
        $result = Test-RPCMethod -Url $RPC_URL -Method "getSlot" -Params @()
        if ($result) { $successCount++ }
    }
    
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds
    $avgResponseTime = $duration / $testCount
    
    Write-Host "📊 Performance Results:" -ForegroundColor Green
    Write-Host "  • Requests: $testCount" -ForegroundColor White
    Write-Host "  • Successful: $successCount" -ForegroundColor White
    Write-Host "  • Success Rate: $([math]::Round(($successCount / $testCount) * 100, 2))%" -ForegroundColor White
    Write-Host "  • Average Response Time: $([math]::Round($avgResponseTime, 3)) seconds" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 RPC Node Testing Complete!" -ForegroundColor Green

if ($localSuccess) {
    Write-Host "✅ Your BSSC RPC node is working correctly!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 RPC Endpoint: $RPC_URL" -ForegroundColor Cyan
    Write-Host "📚 Available Methods: getHealth, getVersion, getSlot, getBlockHeight, and more" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "💡 Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Configure HTTPS with NGINX or Cloudflare Tunnel" -ForegroundColor White
    Write-Host "  2. Set up monitoring and alerting" -ForegroundColor White
    Write-Host "  3. Configure rate limiting for production use" -ForegroundColor White
    Write-Host "  4. Test with your web3 applications" -ForegroundColor White
} else {
    Write-Host "❌ RPC Node testing failed. Please check the setup." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Make sure the RPC node is running: .\launch_rpc_node.ps1" -ForegroundColor White
    Write-Host "  2. Check the logs: Get-Content .\logs\rpc-node.log -Tail 20" -ForegroundColor White
    Write-Host "  3. Verify port 8899 is not blocked by firewall" -ForegroundColor White
    Write-Host "  4. Ensure the project was built successfully: cargo build --all" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
