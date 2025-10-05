# BSSC Demo Dashboard Launcher
# Launch the user-friendly testing dashboard for BSSC

param(
    [switch]$OpenBrowser = $true,
    [int]$Port = 8080
)

Write-Host "🚀 Launching BSSC Demo Dashboard..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is available for a simple server
$nodeAvailable = $false
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        $nodeAvailable = $true
        Write-Host "✅ Node.js detected: $nodeVersion" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Node.js not found, using file:// protocol" -ForegroundColor Yellow
}

# Check if Python is available as fallback
$pythonAvailable = $false
if (-not $nodeAvailable) {
    try {
        $pythonVersion = python --version 2>$null
        if ($pythonVersion) {
            $pythonAvailable = $true
            Write-Host "✅ Python detected: $pythonVersion" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Python not found" -ForegroundColor Yellow
    }
}

# Create a simple HTTP server if possible
if ($nodeAvailable) {
    Write-Host "🌐 Starting HTTP server with Node.js..." -ForegroundColor Cyan
    
    # Create a simple server script
    $serverScript = @"
const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') filePath = './bssc-demo-dashboard.html';
    
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.wav': 'audio/wav',
        '.mp4': 'video/mp4',
        '.woff': 'application/font-woff',
        '.ttf': 'application/font-ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'application/font-otf',
        '.wasm': 'application/wasm'
    };
    
    const contentType = mimeTypes[extname] || 'application/octet-stream';
    
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1><p>The requested file was not found on this server.</p>');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen($Port, () => {
    console.log('🚀 BSSC Demo Dashboard Server running at:');
    console.log('   Local:   http://localhost:$Port');
    console.log('   Network: http://' + require('os').networkInterfaces()['Wi-Fi']?.[0]?.address + ':$Port');
    console.log('');
    console.log('📊 Dashboard Features:');
    console.log('   • RPC Server Testing');
    console.log('   • BNB Transaction Simulation');
    console.log('   • Solana Compatibility Tests');
    console.log('   • Performance Metrics');
    console.log('   • Smart Contract Demo');
    console.log('   • Network Status Monitoring');
    console.log('');
    console.log('🎯 Test BSSC - Solana performance with BNB gas token!');
    console.log('');
    console.log('⏹️  Press Ctrl+C to stop the server');
});
"@
    
    $serverScript | Out-File -FilePath "demo-server.js" -Encoding UTF8
    
    # Start the server
    if ($OpenBrowser) {
        Start-Process "http://localhost:$Port"
        Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
    }
    
    Write-Host "🚀 Starting BSSC Demo Dashboard..." -ForegroundColor Green
    Write-Host "📍 URL: http://localhost:$Port" -ForegroundColor Yellow
    Write-Host ""
    
    # Run the server
    node demo-server.js
    
} elseif ($pythonAvailable) {
    Write-Host "🌐 Starting HTTP server with Python..." -ForegroundColor Cyan
    
    if ($OpenBrowser) {
        Start-Process "http://localhost:$Port"
        Write-Host "🌐 Opening browser..." -ForegroundColor Cyan
    }
    
    Write-Host "🚀 Starting BSSC Demo Dashboard..." -ForegroundColor Green
    Write-Host "📍 URL: http://localhost:$Port" -ForegroundColor Yellow
    Write-Host ""
    
    # Python 3
    python -m http.server $Port --bind 127.0.0.1
    
} else {
    Write-Host "📁 Opening dashboard file directly..." -ForegroundColor Cyan
    
    $dashboardPath = Join-Path $PSScriptRoot "bssc-demo-dashboard.html"
    
    if (Test-Path $dashboardPath) {
        if ($OpenBrowser) {
            Start-Process $dashboardPath
            Write-Host "🌐 Opening dashboard in browser..." -ForegroundColor Green
        }
        
        Write-Host "📊 BSSC Demo Dashboard:" -ForegroundColor Green
        Write-Host "📍 File: $dashboardPath" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "🎯 Features Available:" -ForegroundColor Cyan
        Write-Host "   • RPC Server Testing" -ForegroundColor White
        Write-Host "   • BNB Transaction Simulation" -ForegroundColor White
        Write-Host "   • Solana Compatibility Tests" -ForegroundColor White
        Write-Host "   • Performance Metrics" -ForegroundColor White
        Write-Host "   • Smart Contract Demo" -ForegroundColor White
        Write-Host "   • Network Status Monitoring" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠️  Note: Some features may be limited without HTTP server" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Dashboard file not found: $dashboardPath" -ForegroundColor Red
        Write-Host ""
        Write-Host "Please ensure 'bssc-demo-dashboard.html' exists in the current directory." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🎯 BSSC Demo Dashboard Features:" -ForegroundColor Green
Write-Host "   • Test RPC connectivity to bssc.live" -ForegroundColor White
Write-Host "   • Simulate BNB transactions with ultra-low fees" -ForegroundColor White
Write-Host "   • Verify Solana program compatibility" -ForegroundColor White
Write-Host "   • Measure 65,000 TPS performance" -ForegroundColor White
Write-Host "   • Test smart contract deployment" -ForegroundColor White
Write-Host "   • Monitor network health and validators" -ForegroundColor White
Write-Host "   • Interact with PUMP contract" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Experience the future: Solana's speed with BNB as native gas token!" -ForegroundColor Cyan
