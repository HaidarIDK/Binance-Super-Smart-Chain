# BSSC Testnet Deployment - Troubleshooting SSH Connection

## Issue: SSH Connection Timeout

```
ssh: connect to host 109.147.47.132 port 22: Connection timed out
```

## Possible Causes & Solutions

### 1. Check if Server is Accessible

Test basic connectivity:

```bash
# Test if server is reachable
ping 109.147.47.132

# Test if port 22 is open
telnet 109.147.47.132 22
# Or use PowerShell:
Test-NetConnection -ComputerName 109.147.47.132 -Port 22
```

### 2. Check SSH Service on Server

If you have access to the server console (via hosting provider control panel):

```bash
# Check SSH service status
sudo systemctl status ssh
sudo systemctl status sshd

# Start SSH if not running
sudo systemctl start ssh

# Enable SSH to start on boot
sudo systemctl enable ssh
```

### 3. Check Firewall Rules

The server firewall might be blocking SSH. Via server console:

```bash
# Check UFW status
sudo ufw status

# Allow SSH
sudo ufw allow 22/tcp

# Or disable UFW temporarily (not recommended for production)
sudo ufw disable
```

### 4. Check Hosting Provider Firewall

Some hosting providers have additional firewall rules. Check your hosting provider's control panel:
- Look for "Firewall Rules" or "Security Groups"
- Ensure port 22 (SSH) is allowed
- Add your IP address to whitelist if needed

## Alternative Deployment Methods

If you can't access the server via SSH, here are alternatives:

### Option A: Use Hosting Provider's Console

Most hosting providers offer a web-based console:
1. Log into your hosting provider (Hetzner/DigitalOcean/etc)
2. Access the server console/terminal
3. Upload files via their file manager or SFTP
4. Run deployment commands directly in console

### Option B: Use a Different Server

If this server isn't accessible, you can:
1. Use a local test setup (slower but works for testing)
2. Deploy to a cloud service with built-in deployment
3. Use a VPS from a different provider

### Option C: Deploy on Different Platform

#### Deploy on Render (Simplified Version)

Instead of running your own validator, you can:
1. Keep using the mock RPC server for now
2. Deploy a lightweight test environment
3. Upgrade to full validator later when server access is resolved

#### Deploy Locally (Windows with WSL)

1. Install WSL2:
   ```powershell
   wsl --install
   ```

2. Install Ubuntu in WSL:
   ```bash
   wsl --install -d Ubuntu
   ```

3. Inside WSL, run the deployment script:
   ```bash
   cd /mnt/c/Users/7haid/OneDrive/Desktop/Binance-Super-Smart-Chain
   chmod +x deploy-bssc-testnet.sh
   ./deploy-bssc-testnet.sh
   ```

This will run the validator locally on your Windows machine via WSL.

## Quick Test: Local Development Setup

If you want to test immediately without the server, use Solana's test-validator locally:

```powershell
# Install Solana CLI (Windows)
Invoke-WebRequest -Uri "https://release.solana.com/v1.18.4/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile "C:\solana-install-tmp\solana-install-init.exe"
C:\solana-install-tmp\solana-install-init.exe

# Run test validator
solana-test-validator
```

Then update your RPC server to connect to `http://localhost:8899`.

## Recommended Next Steps

1. **Check server access via hosting provider control panel**
2. **Verify SSH service is running**
3. **Configure firewall to allow SSH**
4. **Or use local WSL deployment for testing**

## Need Help?

Let me know:
- What hosting provider are you using for 109.147.47.132?
- Do you have access to the server's control panel?
- Would you like to try local deployment with WSL instead?

