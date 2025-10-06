# Website Upload Helper Script
Write-Host "BSSC Website Upload Helper" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

Write-Host "Your website has been built and is ready for upload!" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deployment Options:" -ForegroundColor Yellow
Write-Host "1. GitHub Pages (Automatic) - Already triggered!" -ForegroundColor White
Write-Host "2. Netlify (Drag & Drop)" -ForegroundColor White
Write-Host "3. Vercel (Git Integration)" -ForegroundColor White
Write-Host "4. Custom Server (FTP/SFTP)" -ForegroundColor White
Write-Host ""

Write-Host "Files ready for upload:" -ForegroundColor Cyan
Write-Host "Location: bssc-live-website/" -ForegroundColor White
Write-Host "Size: $((Get-ChildItem -Recurse bssc-live-website | Measure-Object -Property Length -Sum).Sum / 1MB) MB" -ForegroundColor White
Write-Host ""

Write-Host "Quick Upload Instructions:" -ForegroundColor Yellow
Write-Host ""

Write-Host "Option 1: GitHub Pages" -ForegroundColor Green
Write-Host "- Already deployed automatically" -ForegroundColor White
Write-Host "- Check: https://haidaridk.github.io/Binance-Super-Smart-Chain/" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: Netlify" -ForegroundColor Green
Write-Host "1. Go to https://netlify.com" -ForegroundColor White
Write-Host "2. Drag the 'bssc-live-website' folder to deploy" -ForegroundColor White
Write-Host "3. Your site will be live in seconds" -ForegroundColor White
Write-Host ""

Write-Host "Option 3: Vercel" -ForegroundColor Green
Write-Host "1. Go to https://vercel.com" -ForegroundColor White
Write-Host "2. Connect your GitHub repository" -ForegroundColor White
Write-Host "3. Deploy automatically from GitHub" -ForegroundColor White
Write-Host ""

Write-Host "Option 4: Custom Server" -ForegroundColor Green
Write-Host "1. Upload contents of 'bssc-live-website' to your web server" -ForegroundColor White
Write-Host "2. Use the nginx configuration provided" -ForegroundColor White
Write-Host "3. Set up SSL certificate" -ForegroundColor White
Write-Host ""

Write-Host "Recommended: Use Netlify for quickest deployment!" -ForegroundColor Cyan
Write-Host ""

Write-Host "Press any key to open the deployment folder..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open the deployment folder
Start-Process explorer.exe -ArgumentList (Resolve-Path "bssc-live-website")
