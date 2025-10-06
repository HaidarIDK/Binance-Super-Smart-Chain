# Test DNS Record for bssc-rpc.bssc.live
Write-Host "Testing DNS Record for bssc-rpc.bssc.live" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

$domain = "bssc-rpc.bssc.live"
$expectedIP = "109.147.47.132"

Write-Host "Testing DNS resolution for: $domain" -ForegroundColor Cyan
Write-Host "Expected IP: $expectedIP" -ForegroundColor White
Write-Host ""

try {
    # Test DNS resolution
    Write-Host "1. Testing DNS resolution..." -ForegroundColor Yellow
    $dnsResult = Resolve-DnsName -Name $domain -Type A -ErrorAction Stop
    
    if ($dnsResult) {
        $actualIP = $dnsResult.IPAddress
        Write-Host "   DNS Resolution: SUCCESS" -ForegroundColor Green
        Write-Host "   Resolved IP: $actualIP" -ForegroundColor White
        
        if ($actualIP -eq $expectedIP) {
            Write-Host "   IP Match: CORRECT" -ForegroundColor Green
        } else {
            Write-Host "   IP Match: INCORRECT (expected: $expectedIP)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   DNS Resolution: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

try {
    # Test ping
    Write-Host "2. Testing ping..." -ForegroundColor Yellow
    $pingResult = Test-Connection -ComputerName $domain -Count 1 -Quiet -ErrorAction Stop
    
    if ($pingResult) {
        Write-Host "   Ping: SUCCESS" -ForegroundColor Green
    } else {
        Write-Host "   Ping: FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "   Ping: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

try {
    # Test HTTP connection
    Write-Host "3. Testing HTTP connection..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://$domain" -TimeoutSec 10 -ErrorAction Stop
    
    Write-Host "   HTTP Connection: SUCCESS" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   HTTP Connection: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

try {
    # Test HTTPS connection
    Write-Host "4. Testing HTTPS connection..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://$domain" -TimeoutSec 10 -ErrorAction Stop
    
    Write-Host "   HTTPS Connection: SUCCESS" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   HTTPS Connection: FAILED" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "DNS Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "If DNS resolution failed:" -ForegroundColor Yellow
Write-Host "- Wait 5-30 minutes for DNS propagation" -ForegroundColor White
Write-Host "- Check if you added the A record correctly" -ForegroundColor White
Write-Host "- Try: ipconfig /flushdns" -ForegroundColor White
Write-Host ""
Write-Host "If ping/HTTP failed:" -ForegroundColor Yellow
Write-Host "- Make sure your RPC server is running" -ForegroundColor White
Write-Host "- Check firewall settings on your server" -ForegroundColor White
Write-Host "- Verify the server IP address is correct" -ForegroundColor White
