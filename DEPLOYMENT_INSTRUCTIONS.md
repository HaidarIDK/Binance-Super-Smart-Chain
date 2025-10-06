# BSSC Live RPC Server Deployment Instructions

## 🌐 Domain Configuration
- Domain: bssc.live
- Public IP: 109.147.47.132

## 📋 DNS Records to Add
In your domain registrar's DNS settings, add:
`
Type: A
Name: @
Value: 109.147.47.132
TTL: 300

Type: A
Name: www
Value: 109.147.47.132
TTL: 300
`

## 🔧 Server Setup

### 1. Upload Files to Server
Upload these files to your server at 109.147.47.132:
- bssc-live-server.js
- package.json
- node_modules/ (after npm install)

### 2. Install Dependencies
`ash
npm install
`

### 3. Start the Server
`ash
# Run as administrator (for ports 80/443)
sudo node bssc-live-server.js
`

### 4. Firewall Configuration
`ash
# Open HTTP port
sudo ufw allow 80

# Open HTTPS port
sudo ufw allow 443
`

## 🧪 Testing
After DNS propagation (5-30 minutes):
- Visit: https://bssc.live
- Test RPC: curl -k https://bssc.live/health
- API Docs: https://bssc.live/

## 📊 RPC Endpoints
- Main RPC: https://bssc-rpc.bssc.live
- Health Check: https://bssc.live/health
- Documentation: https://bssc.live/

## 🔒 SSL Certificate
The server will auto-generate SSL certificates for bssc.live.
For production, consider using Let's Encrypt.

## ⚠️ Important Notes
- Run as administrator for ports 80/443
- Ensure firewall allows incoming connections
- DNS propagation can take 5-30 minutes
- Browser will show SSL warning (normal for self-signed certs)
