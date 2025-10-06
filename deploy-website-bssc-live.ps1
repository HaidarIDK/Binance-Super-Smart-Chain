# Deploy BSSC Website to bssc.live
Write-Host "Deploying BSSC Website to bssc.live..." -ForegroundColor Green
Write-Host ""

# Configuration
$DOMAIN = "bssc.live"
$WEBSITE_DIR = "website"
$BUILD_DIR = "website/out"
$DEPLOY_DIR = "bssc-live-website"

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  Domain: $DOMAIN" -ForegroundColor White
Write-Host "  Website Directory: $WEBSITE_DIR" -ForegroundColor White
Write-Host "  Build Directory: $BUILD_DIR" -ForegroundColor White
Write-Host "  Deploy Directory: $DEPLOY_DIR" -ForegroundColor White
Write-Host ""

# Check if website directory exists
if (-not (Test-Path $WEBSITE_DIR)) {
    Write-Host "Error: Website directory not found!" -ForegroundColor Red
    exit 1
}

# Build the website
Write-Host "Building website..." -ForegroundColor Yellow
Set-Location $WEBSITE_DIR
try {
    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
    Write-Host "Website built successfully!" -ForegroundColor Green
} catch {
    Write-Host "Error building website: $_" -ForegroundColor Red
    exit 1
}

# Go back to root directory
Set-Location ..

# Check if build output exists
if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "Error: Build output not found!" -ForegroundColor Red
    exit 1
}

# Create deployment directory
if (Test-Path $DEPLOY_DIR) {
    Write-Host "Removing existing deployment directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $DEPLOY_DIR
}

Write-Host "Creating deployment directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $DEPLOY_DIR | Out-Null

# Copy build files to deployment directory
Write-Host "Copying website files..." -ForegroundColor Yellow
Copy-Item -Recurse -Path "$BUILD_DIR/*" -Destination $DEPLOY_DIR

# Create deployment package
$ZIP_NAME = "bssc-live-website-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
Write-Host "Creating deployment package: $ZIP_NAME" -ForegroundColor Yellow
Compress-Archive -Path $DEPLOY_DIR -DestinationPath $ZIP_NAME

Write-Host ""
Write-Host "Deployment package created successfully!" -ForegroundColor Green
Write-Host "Package: $ZIP_NAME" -ForegroundColor White
Write-Host "Size: $((Get-Item $ZIP_NAME).Length / 1MB) MB" -ForegroundColor White
Write-Host ""

Write-Host "Next steps to deploy to bssc.live:" -ForegroundColor Cyan
Write-Host "1. Upload the contents of '$DEPLOY_DIR' to your web server" -ForegroundColor White
Write-Host "2. Configure your web server to serve files from the root directory" -ForegroundColor White
Write-Host "3. Set up SSL certificate for $DOMAIN" -ForegroundColor White
Write-Host "4. Configure DNS to point $DOMAIN to your server" -ForegroundColor White
Write-Host ""

Write-Host "Files ready for deployment:" -ForegroundColor Green
Get-ChildItem $DEPLOY_DIR | ForEach-Object {
    Write-Host "  $($_.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "Deployment preparation complete!" -ForegroundColor Green
