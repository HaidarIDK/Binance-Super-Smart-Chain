# Explorer Deployment Guide

Deploy the BSSC Block Explorer to `explorer.bssc.live`

---

##  Quick Start (Local Testing)

### 1. Start the Explorer Locally

```bash
# Install dependencies (if not already done)
npm install

# Start the explorer server
npm run explorer
```

The explorer will be available at:
- **HTTP**: `http://localhost:3000`
- **HTTPS**: `https://localhost:443` (if running as admin)

### 2. Start the RPC Server (Required)

In a separate terminal:

```bash
npm run rpc
```

---

## Deploy to Production

####  Configure Service
```yaml
Name: bssc-explorer
Environment: Node
Build Command: npm install
Start Command: node explorer-server.js
```

#### Environment Variables
```
PORT=3000
NODE_ENV=production
```



### **Option: Deploy to Your Own Server**

#### Step 1: SSH to Server
```bash
ssh user@your-server.com
```

#### Step 2: Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Step 3: Clone Repository
```bash
git clone https://github.com/HaidarIDK/Binance-Super-Smart-Chain.git
cd Binance-Super-Smart-Chain
npm install
```

#### Step 4: Run with PM2 (Process Manager)
```bash
# Install PM2
npm install -g pm2

# Start explorer
pm2 start explorer-server.js --name bssc-explorer

# Start RPC server
pm2 start bssc-live-server.js --name bssc-rpc

# Save configuration
pm2 save
pm2 startup
```

#### Step 5: Setup Nginx Reverse Proxy
```bash
sudo nano /etc/nginx/sites-available/explorer.bssc.live
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name explorer.bssc.live;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/explorer.bssc.live /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 6: Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d explorer.bssc.live
```

---

## 🔧 DNS Configuration

### Point Subdomain to Server

#### If using Render/Vercel:
1. Go to your DNS provider (Cloudflare, Namecheap, etc.)
2. Add CNAME record:
   ```
   Type: CNAME
   Name: explorer
   Value: bssc-explorer.onrender.com (or your Vercel URL)
   TTL: Auto
   ```

#### If using your own server:
1. Add A record:
   ```
   Type: A
   Name: explorer
   Value: YOUR_SERVER_IP
   TTL: Auto
   ```

### Wait for DNS Propagation
- Usually takes 5-30 minutes
- Check with: `nslookup explorer.bssc.live`

---

## ✅ Verify Deployment

### 1. Check Explorer is Live
Visit: `https://explorer.bssc.live`

You should see:
- ✅ BSSC Explorer homepage
- ✅ Latest block number updating
- ✅ Transaction list
- ✅ Search functionality

### 2. Test Search
Try searching for:
- A transaction hash
- An address
- A block number

### 3. Check RPC Connection
Open browser console and verify:
- No CORS errors
- RPC calls working
- Data loading correctly

---

## 🔄 Update Deployment

### Render/Vercel (Auto-deploy)
Just push to GitHub:
```bash
git add .
git commit -m "Update explorer"
git push origin master
```

Render/Vercel will automatically redeploy.

### Manual Server
```bash
cd Binance-Super-Smart-Chain
git pull origin master
pm2 restart bssc-explorer
```

---

## 🐛 Troubleshooting

### Explorer not loading?
1. Check if server is running: `pm2 status` or check Render logs
2. Verify DNS: `nslookup explorer.bssc.live`
3. Check firewall: Port 3000 should be open

### No transactions showing?
1. Verify RPC server is running
2. Check RPC_URL in `explorer.html` (line 1037)
3. Open browser console for errors

### CORS errors?
1. Make sure RPC server has CORS enabled
2. Check `bssc-live-server.js` has proper CORS headers
3. Verify both servers are on same domain or CORS is configured

### SSL certificate errors?
1. For production, use Let's Encrypt (free)
2. For local testing, accept self-signed certificate
3. Run: `sudo certbot renew` to renew certificates

---

## 📊 Monitoring

### Check Server Status
```bash
pm2 status
pm2 logs bssc-explorer
pm2 monit
```

### Check Resource Usage
```bash
htop
df -h
free -m
```

### Setup Uptime Monitoring
Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake

---

## 🎯 Next Steps

After deployment:

1. ✅ Test all features
2. ✅ Share explorer URL with users
3. ✅ Add to documentation
4. ✅ Monitor performance
5. ✅ Collect feedback

---

## 🔗 Related URLs

- **Explorer**: `https://explorer.bssc.live`
- **RPC**: `https://bssc-rpc.bssc.live`
- **Main Site**: `https://bssc.live`
- **GitHub**: `https://github.com/HaidarIDK/Binance-Super-Smart-Chain`

---

## 💡 Tips

1. **Always run RPC server** - Explorer needs it for data
2. **Use PM2** - Keeps servers running after crashes
3. **Enable SSL** - Users expect HTTPS
4. **Monitor logs** - Catch errors early
5. **Auto-deploy** - Use GitHub + Render for easy updates

---

## 🆘 Need Help?

- Check logs: `pm2 logs bssc-explorer`
- Test locally first
- Verify DNS propagation
- Check firewall rules
- Review CORS settings

---

**🎉 Your explorer is now live at `explorer.bssc.live`!**
