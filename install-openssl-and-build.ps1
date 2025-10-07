# Install OpenSSL and Build BSSC Validator
Write-Host "Installing OpenSSL and Building BSSC Validator..." -ForegroundColor Green
Write-Host ""

# Step 1: Install vcpkg (package manager)
Write-Host "Step 1: Installing vcpkg..." -ForegroundColor Cyan
$vcpkgDir = "C:\vcpkg"

if (-not (Test-Path $vcpkgDir)) {
    Write-Host "Cloning vcpkg repository..." -ForegroundColor Yellow
    git clone https://github.com/Microsoft/vcpkg.git $vcpkgDir
    
    Write-Host "Bootstrapping vcpkg..." -ForegroundColor Yellow
    cd $vcpkgDir
    .\bootstrap-vcpkg.bat
    
    Write-Host "Integrating vcpkg..." -ForegroundColor Yellow
    .\vcpkg integrate install
} else {
    Write-Host "vcpkg already installed at $vcpkgDir" -ForegroundColor Green
}

# Step 2: Install OpenSSL
Write-Host ""
Write-Host "Step 2: Installing OpenSSL..." -ForegroundColor Cyan
Write-Host "This will take 10-20 minutes..." -ForegroundColor Yellow
cd $vcpkgDir
.\vcpkg install openssl:x64-windows-static

# Step 3: Set environment variables
Write-Host ""
Write-Host "Step 3: Setting environment variables..." -ForegroundColor Cyan
$env:VCPKG_ROOT = $vcpkgDir
$env:OPENSSL_DIR = "$vcpkgDir\installed\x64-windows-static"
$env:OPENSSL_LIB_DIR = "$vcpkgDir\installed\x64-windows-static\lib"
$env:OPENSSL_INCLUDE_DIR = "$vcpkgDir\installed\x64-windows-static\include"

Write-Host "VCPKG_ROOT = $env:VCPKG_ROOT" -ForegroundColor Gray
Write-Host "OPENSSL_DIR = $env:OPENSSL_DIR" -ForegroundColor Gray
Write-Host ""

# Step 4: Build BSSC validator
Write-Host "Step 4: Building BSSC Validator..." -ForegroundColor Cyan
Write-Host "This will take 30-60 minutes..." -ForegroundColor Yellow
Write-Host ""

cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain

cargo build --release --bin solana-test-validator

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "SUCCESS! Validator Built!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Binary location:" -ForegroundColor Cyan
    Write-Host ".\target\release\solana-test-validator.exe" -ForegroundColor White
    Write-Host ""
    Write-Host "To start your validator:" -ForegroundColor Yellow
    Write-Host ".\target\release\solana-test-validator.exe --ledger bssc-testnet-ledger --rpc-port 8899 --faucet-port 9900 --reset" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build failed. Check errors above." -ForegroundColor Red
    Write-Host ""
}

