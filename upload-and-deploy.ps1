# Upload and Deploy BSSC Testnet
Write-Host "BSSC Testnet - Upload and Deploy" -ForegroundColor Green
Write-Host ""

$SERVER_IP = "109.147.47.132"
$SERVER_USER = "root"
$DEPLOY_DIR = "bssc-validator-deploy"

Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Upload the deployment package to your server" -ForegroundColor White
Write-Host "2. Connect via SSH and start the deployment" -ForegroundColor White
Write-Host ""

# Check if deployment package exists
if (-not (Test-Path $DEPLOY_DIR)) {
    Write-Host "Error: Deployment package not found!" -ForegroundColor Red
    Write-Host "Please run deploy-bssc-testnet-auto.ps1 first" -ForegroundColor Yellow
    exit 1
}

Write-Host "Deployment package found: $DEPLOY_DIR" -ForegroundColor Green
Write-Host ""

# Show instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Manual Steps:" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 1: Upload to server" -ForegroundColor White
Write-Host "Run this command in a separate terminal:" -ForegroundColor Yellow
Write-Host ""
Write-Host "scp -r $DEPLOY_DIR ${SERVER_USER}@${SERVER_IP}:/tmp/" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 2: SSH and deploy" -ForegroundColor White
Write-Host "After upload completes, run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then on the server, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "cd /tmp/$DEPLOY_DIR" -ForegroundColor Cyan
Write-Host "chmod +x deploy-bssc-testnet.sh" -ForegroundColor Cyan
Write-Host "sudo ./deploy-bssc-testnet.sh" -ForegroundColor Cyan
Write-Host ""
Write-Host "Step 3: Configure firewall" -ForegroundColor White
Write-Host "After deployment completes, run:" -ForegroundColor Yellow
Write-Host ""
Write-Host "sudo ufw allow 8899/tcp" -ForegroundColor Cyan
Write-Host "sudo ufw allow 9900/tcp" -ForegroundColor Cyan
Write-Host "sudo ufw allow 8900/tcp" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: The deployment will take 30-60 minutes to build everything." -ForegroundColor Yellow
Write-Host ""

