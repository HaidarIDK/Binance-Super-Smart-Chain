# Deploy BSSC Live RPC Server
Write-Host "🚀 Deploying BSSC Live RPC Server..." -ForegroundColor Green
Write-Host ""

# Configuration
$DOMAIN = "bssc.live"
$PUBLIC_IP = "109.147.47.132"

Write-Host "📊 Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  • Domain: $DOMAIN" -ForegroundColor White
Write-Host "  • Public IP: $PUBLIC_IP" -ForegroundColor White
Write-Host "  • Server Files: bssc-live-server.js" -ForegroundColor White
Write-Host ""

# Check if Node.js is available
try {
    $nodeVersion = & node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "❌ Error: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if required files exist
$requiredFiles = @("bssc-live-server.js")
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Error: Required file $file not found!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ All required files found" -ForegroundColor Green

# Install required npm packages
Write-Host "📦 Installing required packages..." -ForegroundColor Cyan
try {
    & npm install node-forge --save
    Write-Host "✅ node-forge installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install packages: $_" -ForegroundColor Red
    exit 1
}

# Create package.json for production
$packageJson = @{
    name = "bssc-live-rpc-server"
    version = "1.0.0"
    description = "BSSC Live RPC Server for $DOMAIN"
    main = "bssc-live-server.js"
    scripts = @{
        start = "node bssc-live-server.js"
        dev = "node bssc-live-server.js"
    }
    dependencies = @{
        "node-forge" = "^1.3.1"
    }
    keywords = @("bssc", "rpc", "blockchain", "solana", "bsc")
    author = "BSSC Live"
    license = "MIT"
} | ConvertTo-Json -Depth 3

$packageJson | Out-File -FilePath "package.json" -Encoding UTF8
Write-Host "✅ package.json created" -ForegroundColor Green

# Create deployment instructions
$deploymentInstructions = @"
# BSSC Live RPC Server Deployment Instructions

## 🌐 Domain Configuration
- Domain: $DOMAIN
- Public IP: $PUBLIC_IP

## 📋 DNS Records to Add
In your domain registrar's DNS settings, add:
```
Type: A
Name: @
Value: $PUBLIC_IP
TTL: 300

Type: A
Name: www
Value: $PUBLIC_IP
TTL: 300
```

## 🔧 Server Setup

### 1. Upload Files to Server
Upload these files to your server at ${PUBLIC_IP}:
- bssc-live-server.js
- package.json
- node_modules/ (after npm install)

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Server
```bash
# Run as administrator (for ports 80/443)
sudo node bssc-live-server.js
```

### 4. Firewall Configuration
```bash
# Open HTTP port
sudo ufw allow 80

# Open HTTPS port
sudo ufw allow 443
```

## 🧪 Testing
After DNS propagation (5-30 minutes):
- Visit: https://$DOMAIN
- Test RPC: curl -k https://$DOMAIN/health
- API Docs: https://$DOMAIN/

## 📊 RPC Endpoints
- Main RPC: https://$DOMAIN
- Health Check: https://$DOMAIN/health
- Documentation: https://$DOMAIN/

## 🔒 SSL Certificate
The server will auto-generate SSL certificates for $DOMAIN.
For production, consider using Let's Encrypt.

## ⚠️ Important Notes
- Run as administrator for ports 80/443
- Ensure firewall allows incoming connections
- DNS propagation can take 5-30 minutes
- Browser will show SSL warning (normal for self-signed certs)
"@

$deploymentInstructions | Out-File -FilePath "DEPLOYMENT_INSTRUCTIONS.md" -Encoding UTF8
Write-Host "✅ Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor Green

# Create a deployment archive
Write-Host "📦 Creating deployment package..." -ForegroundColor Cyan

$deploymentFiles = @(
    "bssc-live-server.js",
    "package.json",
    "DEPLOYMENT_INSTRUCTIONS.md"
)

# Create a zip file with deployment files
try {
    Compress-Archive -Path $deploymentFiles -DestinationPath "bssc-live-deployment.zip" -Force
    Write-Host "✅ Deployment package created: bssc-live-deployment.zip" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not create zip file: $_" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Deployment Package Ready!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Configure DNS records in your domain registrar" -ForegroundColor White
Write-Host "  2. Upload files to your server ($PUBLIC_IP)" -ForegroundColor White
Write-Host "  3. Run: npm install" -ForegroundColor White
Write-Host "  4. Run: sudo node bssc-live-server.js" -ForegroundColor White
Write-Host "  5. Test: https://$DOMAIN" -ForegroundColor White
Write-Host ""
Write-Host "📁 Files to upload:" -ForegroundColor Cyan
foreach ($file in $deploymentFiles) {
    Write-Host "  • $file" -ForegroundColor White
}
Write-Host "  • bssc-live-deployment.zip (if created)" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your RPC endpoint will be: https://$DOMAIN" -ForegroundColor Green

# Ask if user wants to start the server locally for testing
Write-Host ""
Write-Host "Would you like to start the server locally for testing? (y/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "y" -or $response -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting BSSC Live RPC Server locally..." -ForegroundColor Green
    Write-Host "⚠️  Note: This will run on localhost for testing" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        & node .\bssc-live-server.js
    } catch {
        Write-Host "❌ Error starting server: $_" -ForegroundColor Red
    }
}
