# Run BSSC Testnet Locally on Windows
Write-Host "Starting BSSC Local Testnet..." -ForegroundColor Green
Write-Host ""

# Check if Solana is installed
$solanaCheck = Get-Command solana -ErrorAction SilentlyContinue

if (-not $solanaCheck) {
    Write-Host "Solana CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    
    # Download Solana installer
    $installerUrl = "https://release.solana.com/v1.18.4/solana-install-init-x86_64-pc-windows-msvc.exe"
    $installerPath = "$env:TEMP\solana-install-init.exe"
    
    Write-Host "Downloading Solana CLI..." -ForegroundColor Cyan
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath
    
    Write-Host "Installing Solana CLI..." -ForegroundColor Cyan
    Start-Process -FilePath $installerPath -Wait
    
    # Add to PATH for current session
    $env:PATH = "$env:LOCALAPPDATA\.local\share\solana\install\active_release\bin;$env:PATH"
    
    Write-Host "Solana CLI installed!" -ForegroundColor Green
    Write-Host ""
}

Write-Host "Solana CLI is ready!" -ForegroundColor Green
Write-Host ""

# Check if validator is already running
$existingValidator = Get-Process -Name "solana-test-validator" -ErrorAction SilentlyContinue
if ($existingValidator) {
    Write-Host "Stopping existing validator..." -ForegroundColor Yellow
    Stop-Process -Name "solana-test-validator" -Force
    Start-Sleep -Seconds 2
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting BSSC Test Validator..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create a data directory
$testLedger = "$PSScriptRoot\test-ledger"
if (Test-Path $testLedger) {
    Write-Host "Cleaning previous test data..." -ForegroundColor Gray
    Remove-Item -Recurse -Force $testLedger -ErrorAction SilentlyContinue
}

Write-Host "Your BSSC Testnet will run on:" -ForegroundColor Green
Write-Host "  RPC Endpoint: http://localhost:8899" -ForegroundColor White
Write-Host "  Faucet: http://localhost:9900" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the testnet" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting validator..." -ForegroundColor Cyan
Write-Host ""

# Start test validator
solana-test-validator `
    --ledger $testLedger `
    --rpc-port 8899 `
    --faucet-port 9900 `
    --reset `
    --quiet

