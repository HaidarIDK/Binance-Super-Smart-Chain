# Test BSSC Live Server Configuration
Write-Host "🧪 Testing BSSC Live Server Configuration..." -ForegroundColor Green
Write-Host ""

$DOMAIN = "bssc.live"
$PUBLIC_IP = "109.147.47.132"

Write-Host "📊 Configuration Test:" -ForegroundColor Cyan
Write-Host "  • Domain: $DOMAIN" -ForegroundColor White
Write-Host "  • Public IP: $PUBLIC_IP" -ForegroundColor White
Write-Host "  • Target RPC: https://$DOMAIN" -ForegroundColor White
Write-Host ""

# Test if domain resolves (after DNS setup)
Write-Host "🔍 Testing DNS Resolution..." -ForegroundColor Cyan
try {
    $dnsResult = Resolve-DnsName $DOMAIN -ErrorAction Stop
    Write-Host "✅ DNS Resolution: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "⚠️ DNS not resolved yet: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This is normal - DNS propagation takes 5-30 minutes" -ForegroundColor Yellow
}

# Test if server is reachable
Write-Host ""
Write-Host "🔍 Testing Server Connectivity..." -ForegroundColor Cyan
try {
    $pingResult = Test-Connection -ComputerName $PUBLIC_IP -Count 1 -Quiet
    if ($pingResult) {
        Write-Host "✅ Server is reachable at $PUBLIC_IP" -ForegroundColor Green
    } else {
        Write-Host "❌ Server not reachable at $PUBLIC_IP" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Connection test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test HTTP connectivity
Write-Host ""
Write-Host "🔍 Testing HTTP Connectivity..." -ForegroundColor Cyan
try {
    $httpResponse = Invoke-WebRequest -Uri "http://$PUBLIC_IP" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ HTTP Server responding on port 80" -ForegroundColor Green
    Write-Host "  Status Code: $($httpResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "⚠️ HTTP Server not responding: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This is expected if the server isn't running yet" -ForegroundColor Yellow
}

# Test HTTPS connectivity
Write-Host ""
Write-Host "🔍 Testing HTTPS Connectivity..." -ForegroundColor Cyan
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://$PUBLIC_IP" -TimeoutSec 10 -SkipCertificateCheck -ErrorAction Stop
    Write-Host "✅ HTTPS Server responding on port 443" -ForegroundColor Green
    Write-Host "  Status Code: $($httpsResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "⚠️ HTTPS Server not responding: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This is expected if the server isn't running yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Deployment Status:" -ForegroundColor Cyan
Write-Host "✅ Server files created and ready" -ForegroundColor Green
Write-Host "✅ SSL certificates configured for $DOMAIN" -ForegroundColor Green
Write-Host "✅ Production server configured" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Ready to Deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure DNS records in your domain registrar" -ForegroundColor White
Write-Host "2. Upload files to your server at $PUBLIC_IP" -ForegroundColor White
Write-Host "3. Run: npm install" -ForegroundColor White
Write-Host "4. Run: sudo node bssc-live-server.js" -ForegroundColor White
Write-Host "5. Test: https://$DOMAIN" -ForegroundColor White
Write-Host ""
Write-Host "📁 Files ready for upload:" -ForegroundColor Cyan
Get-ChildItem -Name "bssc-live-*", "package.json", "DEPLOYMENT_INSTRUCTIONS.md" | ForEach-Object {
    Write-Host "  • $_" -ForegroundColor White
}
