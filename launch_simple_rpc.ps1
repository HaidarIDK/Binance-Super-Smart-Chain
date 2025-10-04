# Simple BSSC RPC Server Launcher
Write-Host "🚀 Launching Simple BSSC RPC Server..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
Write-Host "🔍 Checking for Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Error: Node.js not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js:" -ForegroundColor Yellow
    Write-Host "1. Visit: https://nodejs.org/" -ForegroundColor White
    Write-Host "2. Download and install the LTS version" -ForegroundColor White
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check if the RPC server file exists
if (-not (Test-Path ".\simple-rpc-server.js")) {
    Write-Host "❌ Error: simple-rpc-server.js not found!" -ForegroundColor Red
    Write-Host "Please make sure the file exists in the current directory." -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "🎯 Starting Simple BSSC RPC Server..." -ForegroundColor Green
Write-Host "  • RPC Port: 8899" -ForegroundColor White
Write-Host "  • Mock Responses: Enabled" -ForegroundColor White
Write-Host ""
Write-Host "🔗 RPC Endpoint: http://localhost:8899" -ForegroundColor Yellow
Write-Host "📊 Available Methods: getHealth, getVersion, getSlot, getBlockHeight, and more" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  This is a mock server for testing purposes" -ForegroundColor Yellow
Write-Host ""

# Start the RPC server
try {
    Write-Host "🚀 Launching Node.js RPC server..." -ForegroundColor Green
    Write-Host ""
    
    & node .\simple-rpc-server.js

} catch {
    Write-Host "❌ Error starting RPC server: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "🎉 Simple BSSC RPC Server started successfully!" -ForegroundColor Green

