# Build BSSC Validator on Windows (Without OpenSSL)
Write-Host "Building BSSC Validator for Windows..." -ForegroundColor Green
Write-Host ""

Write-Host "Note: Windows build requires vcpkg for OpenSSL" -ForegroundColor Yellow
Write-Host ""
Write-Host "Installing vcpkg and OpenSSL..." -ForegroundColor Cyan
Write-Host ""

# Install vcpkg if not already installed
$vcpkgDir = "C:\vcpkg"
if (-not (Test-Path $vcpkgDir)) {
    Write-Host "Installing vcpkg..." -ForegroundColor Yellow
    git clone https://github.com/Microsoft/vcpkg.git C:\vcpkg
    cd C:\vcpkg
    .\bootstrap-vcpkg.bat
    .\vcpkg integrate install
} else {
    Write-Host "vcpkg already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Installing OpenSSL via vcpkg..." -ForegroundColor Cyan
C:\vcpkg\vcpkg install openssl:x64-windows-static

Write-Host ""
Write-Host "Setting environment variables..." -ForegroundColor Cyan
$env:OPENSSL_DIR = "C:\vcpkg\installed\x64-windows-static"
$env:OPENSSL_LIB_DIR = "C:\vcpkg\installed\x64-windows-static\lib"
$env:OPENSSL_INCLUDE_DIR = "C:\vcpkg\installed\x64-windows-static\include"

Write-Host ""
Write-Host "Building BSSC validator..." -ForegroundColor Green
Write-Host "This will take 30-60 minutes..." -ForegroundColor Yellow
Write-Host ""

cd C:\Users\7haid\OneDrive\Desktop\Binance-Super-Smart-Chain
cargo build --release --bin solana-test-validator

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Build Complete!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Validator binary: .\target\release\solana-test-validator.exe" -ForegroundColor White
    Write-Host ""
    Write-Host "To start the validator, run:" -ForegroundColor Yellow
    Write-Host ".\target\release\solana-test-validator.exe --ledger bssc-testnet-ledger --rpc-port 8899 --faucet-port 9900 --reset" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Build failed. See error above." -ForegroundColor Red
}

