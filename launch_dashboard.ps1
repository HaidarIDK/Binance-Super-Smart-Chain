# BSC EVM Performance Dashboard Launcher
Write-Host "🚀 Launching BSC EVM Performance Dashboard..." -ForegroundColor Green
Write-Host ""

# Get the current directory
$currentPath = Get-Location
$dashboardPath = Join-Path $currentPath "dashboard.html"

# Check if dashboard.html exists
if (Test-Path $dashboardPath) {
    Write-Host "✅ Found dashboard.html" -ForegroundColor Green
    Write-Host "📊 Opening dashboard in your default browser..." -ForegroundColor Cyan
    
    # Open the dashboard in the default browser
    Start-Process $dashboardPath
    
    Write-Host ""
    Write-Host "🎉 Dashboard opened successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The dashboard includes:" -ForegroundColor Yellow
    Write-Host "  • Real-time performance metrics" -ForegroundColor White
    Write-Host "  • Network health monitoring" -ForegroundColor White
    Write-Host "  • Transaction analytics with interactive charts" -ForegroundColor White
    Write-Host "  • Optimization recommendations" -ForegroundColor White
    Write-Host "  • User experience metrics" -ForegroundColor White
    Write-Host "  • Performance trends visualization" -ForegroundColor White
    Write-Host "  • Active alerts monitoring" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 Dashboard will auto-refresh every 30 seconds" -ForegroundColor Cyan
    Write-Host "📱 Responsive design works on desktop and mobile" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Press any key to close this launcher..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
} else {
    Write-Host "❌ Error: dashboard.html not found!" -ForegroundColor Red
    Write-Host "Please make sure dashboard.html is in the current directory." -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
