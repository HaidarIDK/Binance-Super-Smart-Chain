# DNS Setup for bssc.live

## 🎯 Current Status
- ✅ Cloudflare Tunnel created: `bssc-rpc`
- ✅ Tunnel ID: `37ce739b-910d-48d0-9ecd-7dee89cb57e8`
- ✅ Configuration file created
- ⚠️ DNS record needs to be updated

## 🔧 DNS Configuration Options

### Option 1: Use Cloudflare Dashboard (Recommended)
1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Select your domain**: bssc.live
3. **Go to DNS > Records**
4. **Delete existing A record** for bssc.live (if any)
5. **Add CNAME record**:
   ```
   Type: CNAME
   Name: @
   Target: 37ce739b-910d-48d0-9ecd-7dee89cb57e8.cfargotunnel.com
   TTL: Auto
   Proxy status: Proxied (orange cloud)
   ```

### Option 2: Use Command Line
```bash
# First, delete existing record
.\cloudflared.exe tunnel route dns delete bssc.live

# Then add the tunnel route
.\cloudflared.exe tunnel route dns bssc-rpc bssc.live
```

### Option 3: Manual DNS (if not using Cloudflare)
If your domain is not managed by Cloudflare:
```
Type: CNAME
Name: @
Value: 37ce739b-910d-48d0-9ecd-7dee89cb57e8.cfargotunnel.com
TTL: 300
```

## 🚀 Quick Start Commands

```powershell
# 1. Start everything
.\setup-bssc-live-tunnel.ps1

# 2. Or start manually:
node simple-https-server.js
.\cloudflared.exe tunnel run bssc-rpc
```

## 🧪 Testing Your Public RPC

Once DNS is configured (5-30 minutes for propagation):

```bash
# Health check
curl https://bssc.live/health

# RPC test
curl -X POST https://bssc.live \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

## 📊 Your Public RPC Endpoints
- **Main RPC**: https://bssc-rpc.bssc.live
- **Health Check**: https://bssc.live/health
- **Documentation**: https://bssc.live/

## ⚠️ Important Notes
- DNS propagation takes 5-30 minutes
- Keep both processes running: RPC server + Cloudflare tunnel
- Your RPC server runs locally but is accessible worldwide
- No need for port forwarding or server setup
