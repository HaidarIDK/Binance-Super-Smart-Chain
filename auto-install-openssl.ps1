# Auto-Download and Install OpenSSL for Windows
Write-Host "Auto-Installing OpenSSL for Windows..." -ForegroundColor Green
Write-Host ""

# OpenSSL download URL (latest stable version)
$opensslUrl = "https://slproweb.com/download/Win64OpenSSL-3_2_0.exe"
$installerPath = "$env:TEMP\Win64OpenSSL.exe"

Write-Host "Step 1: Downloading OpenSSL..." -ForegroundColor Cyan
Write-Host "URL: $opensslUrl" -ForegroundColor Gray
Write-Host ""

try {
    Invoke-WebRequest -Uri $opensslUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "Download complete!" -ForegroundColor Green
} catch {
    Write-Host "Download failed. Trying alternative method..." -ForegroundColor Yellow
    
    # Try alternative download
    $opensslUrl = "https://slproweb.com/download/Win64OpenSSL-3_1_4.exe"
    Write-Host "Trying: $opensslUrl" -ForegroundColor Gray
    Invoke-WebRequest -Uri $opensslUrl -OutFile $installerPath -UseBasicParsing
}

Write-Host ""
Write-Host "Step 2: Installing OpenSSL..." -ForegroundColor Cyan
Write-Host "Running installer (this will open a window)..." -ForegroundColor Yellow
Write-Host ""

# Run installer silently
Start-Process -FilePath $installerPath -ArgumentList "/silent /sp- /suppressmsgboxes" -Wait

Write-Host ""
Write-Host "OpenSSL installed!" -ForegroundColor Green
Write-Host ""

# Set environment variables
Write-Host "Step 3: Setting environment variables..." -ForegroundColor Cyan
$opensslPath = "C:\Program Files\OpenSSL-Win64"

[System.Environment]::SetEnvironmentVariable('OPENSSL_DIR', $opensslPath, [System.EnvironmentVariableTarget]::Machine)
$env:OPENSSL_DIR = $opensslPath

Write-Host "OPENSSL_DIR = $opensslPath" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "OpenSSL Installation Complete!" -ForegroundColor Green  
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Build BSSC Validator" -ForegroundColor Yellow
Write-Host ""
Write-Host "Close this PowerShell window and open a NEW one, then run:" -ForegroundColor Cyan
Write-Host "cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain" -ForegroundColor White
Write-Host "cargo build --release --bin solana-test-validator" -ForegroundColor White
Write-Host ""
Write-Host "Or simply run:" -ForegroundColor Cyan
Write-Host ".\build-and-run-validator.ps1" -ForegroundColor White
Write-Host ""

