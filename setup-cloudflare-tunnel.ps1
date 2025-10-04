# Cloudflare Tunnel Setup Script for BSSC RPC Node
Write-Host "🌐 Setting up Cloudflare Tunnel for BSSC RPC Node..." -ForegroundColor Green
Write-Host ""

# Check if cloudflared is installed
Write-Host "🔍 Checking for Cloudflare Tunnel (cloudflared)..." -ForegroundColor Cyan

try {
    $cloudflaredVersion = & cloudflared --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Cloudflare Tunnel is installed: $cloudflaredVersion" -ForegroundColor Green
    } else {
        throw "cloudflared not found"
    }
} catch {
    Write-Host "❌ Cloudflare Tunnel (cloudflared) not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Installing cloudflared..." -ForegroundColor Yellow
    
    # Download and install cloudflared for Windows
    $downloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    $installPath = "$env:ProgramFiles\Cloudflare\cloudflared.exe"
    
    try {
        # Create directory if it doesn't exist
        New-Item -ItemType Directory -Force -Path (Split-Path $installPath) | Out-Null
        
        # Download cloudflared
        Write-Host "  • Downloading cloudflared..." -ForegroundColor White
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installPath -UseBasicParsing
        
        # Add to PATH
        $env:PATH += ";$env:ProgramFiles\Cloudflare"
        
        Write-Host "✅ Cloudflare Tunnel installed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install cloudflared: $_" -ForegroundColor Red
        Write-Host "Please install cloudflared manually from: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Press any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
}

Write-Host ""
Write-Host "🔑 Setting up Cloudflare authentication..." -ForegroundColor Cyan
Write-Host "You need to login to Cloudflare first:" -ForegroundColor Yellow
Write-Host ""

try {
    & cloudflared tunnel login
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully authenticated with Cloudflare!" -ForegroundColor Green
    } else {
        throw "Authentication failed"
    }
} catch {
    Write-Host "❌ Failed to authenticate with Cloudflare" -ForegroundColor Red
    Write-Host "Please run 'cloudflared tunnel login' manually" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🏗️  Creating tunnel..." -ForegroundColor Cyan

# Create tunnel
$tunnelName = "bssc-rpc-tunnel"
try {
    $tunnelOutput = & cloudflared tunnel create $tunnelName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Tunnel '$tunnelName' created successfully!" -ForegroundColor Green
        Write-Host $tunnelOutput -ForegroundColor White
    } else {
        Write-Host "⚠️  Tunnel might already exist, continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Error creating tunnel (might already exist): $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Configuring DNS..." -ForegroundColor Cyan
Write-Host "You need to add CNAME records for your domain:" -ForegroundColor Yellow
Write-Host ""

# Get tunnel ID
try {
    $tunnelsOutput = & cloudflared tunnel list 2>&1
    $tunnelId = ($tunnelsOutput | Select-String $tunnelName | ForEach-Object { ($_ -split '\s+')[0] })[0]
    
    if ($tunnelId) {
        Write-Host "🔗 Tunnel ID: $tunnelId" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Add these CNAME records to your Cloudflare DNS:" -ForegroundColor Yellow
        Write-Host "  • your-domain.com CNAME $tunnelId.cfargotunnel.com" -ForegroundColor White
        Write-Host "  • api.your-domain.com CNAME $tunnelId.cfargotunnel.com" -ForegroundColor White
        Write-Host "  • health.your-domain.com CNAME $tunnelId.cfargotunnel.com" -ForegroundColor White
        Write-Host ""
        Write-Host "Press Enter when you've added the DNS records..." -ForegroundColor Gray
        Read-Host
    }
} catch {
    Write-Host "❌ Could not retrieve tunnel ID" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Starting Cloudflare Tunnel..." -ForegroundColor Green
Write-Host ""
Write-Host "The tunnel will run in the background and expose your BSSC RPC node." -ForegroundColor Cyan
Write-Host "Make sure your BSSC RPC node is running on localhost:8899" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Gray
Write-Host ""

# Start the tunnel
try {
    & cloudflared tunnel --config .\cloudflare-tunnel-config.yml run $tunnelName
} catch {
    Write-Host "❌ Error running tunnel: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Press any key to exit..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "🎉 Cloudflare Tunnel setup complete!" -ForegroundColor Green
Write-Host "Your BSSC RPC node is now accessible via your domain with HTTPS!" -ForegroundColor Green
