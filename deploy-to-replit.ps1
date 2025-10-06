# Deploy BSSC Website to Replit
Write-Host "Deploy BSSC Website to Replit" -ForegroundColor Green
Write-Host "=============================" -ForegroundColor Green
Write-Host ""

Write-Host "Your website is ready for Replit deployment!" -ForegroundColor Cyan
Write-Host ""

Write-Host "Replit Configuration Status:" -ForegroundColor Yellow
Write-Host "✓ .replit file configured" -ForegroundColor Green
Write-Host "✓ replit.nix with Node.js 18" -ForegroundColor Green
Write-Host "✓ package.json with dependencies" -ForegroundColor Green
Write-Host "✓ next.config.js configured" -ForegroundColor Green
Write-Host ""

Write-Host "Deployment Options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option 1: Import from GitHub (Recommended)" -ForegroundColor Green
Write-Host "1. Go to https://replit.com" -ForegroundColor White
Write-Host "2. Click 'Create Repl'" -ForegroundColor White
Write-Host "3. Select 'Import from GitHub'" -ForegroundColor White
Write-Host "4. Enter: https://github.com/HaidarIDK/Binance-Super-Smart-Chain" -ForegroundColor White
Write-Host "5. Click 'Import' and wait for setup" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: Manual Upload" -ForegroundColor Green
Write-Host "1. Go to https://replit.com" -ForegroundColor White
Write-Host "2. Click 'Create Repl'" -ForegroundColor White
Write-Host "3. Select 'Node.js' template" -ForegroundColor White
Write-Host "4. Upload your project files" -ForegroundColor White
Write-Host "5. Configuration will be automatic" -ForegroundColor White
Write-Host ""

Write-Host "What Happens Automatically:" -ForegroundColor Yellow
Write-Host "- Node.js 18 installation" -ForegroundColor White
Write-Host "- npm install dependencies" -ForegroundColor White
Write-Host "- npm run build website" -ForegroundColor White
Write-Host "- Static files served from /out" -ForegroundColor White
Write-Host "- Public URL generated" -ForegroundColor White
Write-Host ""

Write-Host "Custom Domain Setup (Optional):" -ForegroundColor Yellow
Write-Host "1. In Repl Settings > Webview" -ForegroundColor White
Write-Host "2. Add custom domain: bssc.live" -ForegroundColor White
Write-Host "3. Update DNS to point to Replit" -ForegroundColor White
Write-Host ""

Write-Host "Advantages:" -ForegroundColor Yellow
Write-Host "- Free hosting with custom domains" -ForegroundColor White
Write-Host "- Automatic SSL certificates" -ForegroundColor White
Write-Host "- Easy GitHub integration" -ForegroundColor White
Write-Host "- No server management needed" -ForegroundColor White
Write-Host ""

Write-Host "Ready to deploy! Choose your preferred method above." -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to open Replit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open Replit in browser
Start-Process "https://replit.com"
