# Launch BSSC RPC Server for bssc.live domain
Write-Host "🌐 Launching BSSC RPC Server for bssc.live..." -ForegroundColor Green
Write-Host ""

# Configuration
$DOMAIN = "bssc-rpc.bssc.live"
$PUBLIC_IP = "109.147.47.132"
$HTTP_PORT = 80
$HTTPS_PORT = 443

Write-Host "📊 Configuration:" -ForegroundColor Cyan
Write-Host "  • Domain: $DOMAIN" -ForegroundColor White
Write-Host "  • Public IP: $PUBLIC_IP" -ForegroundColor White
Write-Host "  • HTTP Port: $HTTP_PORT" -ForegroundColor White
Write-Host "  • HTTPS Port: $HTTPS_PORT" -ForegroundColor White
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Error: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if SSL certificates exist
if (-not ((Test-Path "server-key.pem") -and (Test-Path "server-cert.pem"))) {
    Write-Host "🔧 Generating SSL certificates for $DOMAIN..." -ForegroundColor Cyan
    
    # Generate certificates for the domain
    try {
        & node .\generate-ssl-certs.js
        Write-Host "✅ SSL certificates generated" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to generate SSL certificates: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🚀 Starting BSSC RPC Server for $DOMAIN..." -ForegroundColor Green
Write-Host ""

# Set environment variables
$env:NODE_ENV = "production"
$env:DOMAIN = $DOMAIN

Write-Host "🔗 Your RPC endpoints will be:" -ForegroundColor Yellow
Write-Host "  • HTTP:  http://$DOMAIN (redirects to HTTPS)" -ForegroundColor White
Write-Host "  • HTTPS: https://$DOMAIN" -ForegroundColor White
Write-Host "  • API Docs: https://$DOMAIN/" -ForegroundColor White
Write-Host ""

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure DNS records in your domain registrar" -ForegroundColor White
Write-Host "  2. Add A records pointing $DOMAIN to $PUBLIC_IP" -ForegroundColor White
Write-Host "  3. Wait for DNS propagation (5-30 minutes)" -ForegroundColor White
Write-Host "  4. Test your domain: https://$DOMAIN" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Important:" -ForegroundColor Yellow
Write-Host "  • Make sure ports 80 and 443 are open in your firewall" -ForegroundColor White
Write-Host "  • This server needs to run as administrator for ports 80/443" -ForegroundColor White
Write-Host ""

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as administrator" -ForegroundColor Yellow
    Write-Host "  Ports 80 and 443 require administrator privileges" -ForegroundColor White
    Write-Host "  The server will start but may not bind to these ports" -ForegroundColor White
    Write-Host ""
    Write-Host "To run as administrator:" -ForegroundColor Cyan
    Write-Host "  1. Right-click PowerShell" -ForegroundColor White
    Write-Host "  2. Select 'Run as administrator'" -ForegroundColor White
    Write-Host "  3. Run this script again" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press Enter to start the server, or Ctrl+C to cancel..." -ForegroundColor Gray
Read-Host

# Start the production server
try {
    Write-Host "🚀 Launching BSSC RPC Server..." -ForegroundColor Green
    Write-Host ""
    
    & node .\production-https-server.js

} catch {
    Write-Host "❌ Error starting RPC server: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "🎉 BSSC RPC Server started for $DOMAIN!" -ForegroundColor Green
