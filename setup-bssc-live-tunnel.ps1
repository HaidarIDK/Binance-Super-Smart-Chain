# BSSC Live RPC Server with Cloudflare Tunnel Setup
# This script sets up your RPC server to be accessible at bssc.live

Write-Host "🚀 BSSC Live RPC Server Setup" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if cloudflared is installed
if (!(Test-Path ".\cloudflared.exe")) {
    Write-Host "📥 Downloading Cloudflare Tunnel..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
    Write-Host "✅ Cloudflare Tunnel downloaded!" -ForegroundColor Green
}

# Start the HTTPS RPC server
Write-Host "🚀 Starting HTTPS RPC Server..." -ForegroundColor Cyan
Write-Host "   Server will run on: https://localhost:9443" -ForegroundColor Gray
Write-Host "   Public URL will be: https://bssc.live" -ForegroundColor Gray

# Start RPC server in background
$rpcServer = Start-Process -FilePath "node" -ArgumentList "simple-https-server.js" -PassThru -WindowStyle Hidden
Write-Host "✅ RPC Server started (PID: $($rpcServer.Id))" -ForegroundColor Green

# Wait for server to start
Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test the server
Write-Host "🧪 Testing local server..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "https://localhost:9443/health" -SkipCertificateCheck -TimeoutSec 5
    Write-Host "✅ Local server is running: $response" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Local server test failed, but continuing..." -ForegroundColor Yellow
}

# Start Cloudflare Tunnel
Write-Host "🌐 Starting Cloudflare Tunnel..." -ForegroundColor Cyan
Write-Host "   This will expose your RPC server at bssc.live" -ForegroundColor Gray
Write-Host "   Press Ctrl+C to stop both server and tunnel" -ForegroundColor Yellow
Write-Host ""

# Start tunnel (this will run in foreground)
Write-Host "🚇 Starting tunnel... (This will run until you stop it)" -ForegroundColor Green
try {
    .\cloudflared.exe tunnel run bssc-rpc
} catch {
    Write-Host "❌ Tunnel failed to start. Make sure you're logged in with: .\cloudflared.exe tunnel login" -ForegroundColor Red
}

# Cleanup when script exits
Write-Host "🛑 Stopping RPC server..." -ForegroundColor Yellow
Stop-Process -Id $rpcServer.Id -Force -ErrorAction SilentlyContinue
Write-Host "✅ Setup complete!" -ForegroundColor Green
