# DNS Setup Instructions for bssc.live

## 🌐 Your Server Information
- **Domain**: bssc.live
- **Public IP**: 109.147.47.132
- **RPC Endpoint**: https://bssc-rpc.bssc.live

## 📋 DNS Records to Configure

### Step 1: Login to Your Domain Registrar
Go to where you bought the domain `bssc.live` and access the DNS management panel.

### Step 2: Add These DNS Records

#### A Records (Required):
```
Type: A
Name: @
Value: 109.147.47.132
TTL: 300 (or default)

Type: A
Name: www
Value: 109.147.47.132
TTL: 300 (or default)
```

#### Optional CNAME Records:
```
Type: CNAME
Name: api
Value: bssc.live
TTL: 300

Type: CNAME
Name: rpc
Value: bssc.live
TTL: 300
```

### Step 3: Save Changes
Save the DNS changes and wait for propagation (5-30 minutes).

## 🔧 Server Configuration

### Firewall Settings
Make sure these ports are open:
- **Port 80** (HTTP) - for redirects to HTTPS
- **Port 443** (HTTPS) - for secure RPC connections

### Windows Firewall Commands:
```powershell
# Open HTTP port
netsh advfirewall firewall add rule name="BSSC HTTP" dir=in action=allow protocol=TCP localport=80

# Open HTTPS port  
netsh advfirewall firewall add rule name="BSSC HTTPS" dir=in action=allow protocol=TCP localport=443
```

## 🚀 Starting Your Server

### Run as Administrator:
1. Right-click PowerShell
2. Select "Run as administrator"
3. Navigate to your project folder
4. Run: `.\launch-bssc-live.ps1`

## 🧪 Testing Your Domain

### After DNS Propagation:
```bash
# Test domain resolution
nslookup bssc.live

# Test HTTP redirect
curl -I http://bssc.live

# Test HTTPS endpoint
curl -k https://bssc.live/health

# Test RPC method
curl -k -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  https://bssc.live
```

### Browser Test:
1. Visit: https://bssc.live
2. You should see the BSSC RPC Server documentation page
3. Test the health endpoint: https://bssc.live/health

## 📊 RPC Endpoints

Once configured, your RPC endpoints will be:

- **Main RPC**: https://bssc-rpc.bssc.live
- **API Documentation**: https://bssc.live/
- **Health Check**: https://bssc.live/health

## 🔒 SSL Certificate

The server uses a self-signed certificate for testing. For production:

1. **Option 1**: Use Let's Encrypt (free)
2. **Option 2**: Buy a commercial SSL certificate
3. **Option 3**: Use Cloudflare (free SSL proxy)

## ⚠️ Important Notes

- **DNS Propagation**: Can take 5-30 minutes
- **Administrator Rights**: Required for ports 80/443
- **Firewall**: Must allow incoming connections
- **SSL Warning**: Browser will show security warning (normal for self-signed certs)

## 🆘 Troubleshooting

### If domain doesn't work:
1. Check DNS propagation: https://www.whatsmydns.net/#A/bssc.live
2. Verify firewall settings
3. Ensure server is running as administrator
4. Check if ports 80/443 are available

### Common Issues:
- **"Connection refused"**: Firewall blocking ports
- **"DNS not found"**: DNS not propagated yet
- **"Certificate error"**: Normal for self-signed certificates
