# How to Add DNS A Record for bssc-rpc.bssc.live

## DNS Record to Add
```
Type: A
Name: bssc-rpc
Value: 109.147.47.132
TTL: 3600 (or default)
```

## Step-by-Step Instructions

### Step 1: Access Your Domain Registrar
1. Go to your domain registrar (where you bought bssc.live)
2. Common registrars: GoDaddy, Namecheap, Cloudflare, Route 53, etc.
3. Log in to your account

### Step 2: Find DNS Management
1. Look for "DNS Management", "DNS Settings", or "Manage DNS"
2. Click on the domain `bssc.live`
3. Find the DNS records section

### Step 3: Add the A Record
1. Click "Add Record" or "Add DNS Record"
2. Select record type: **A**
3. Enter the following values:
   - **Name/Host**: `bssc-rpc`
   - **Value/Points to**: `109.147.47.132`
   - **TTL**: `3600` (or leave default)
4. Click "Save" or "Add Record"

### Step 4: Verify the Record
Your DNS records should now include:
```
bssc-rpc.bssc.live    A    109.147.47.132
```

### Step 5: Wait for Propagation
- DNS changes take 5-30 minutes to propagate
- You can check propagation at: https://www.whatsmydns.net/
- Enter `bssc-rpc.bssc.live` and select "A" record type

## Testing the DNS Record

### Command Line Test:
```bash
# Test DNS resolution
nslookup bssc-rpc.bssc.live

# Test ping
ping bssc-rpc.bssc.live

# Test with curl
curl -I https://bssc-rpc.bssc.live
```

### Online DNS Check:
1. Go to https://www.whatsmydns.net/
2. Enter `bssc-rpc.bssc.live`
3. Select "A" record type
4. Check if it resolves to `109.147.47.132`

## Expected Result
After DNS propagation, `bssc-rpc.bssc.live` should resolve to `109.147.47.132`

## Troubleshooting
- If it doesn't work immediately, wait up to 30 minutes
- Clear your DNS cache: `ipconfig /flushdns` (Windows)
- Try different DNS servers (8.8.8.8, 1.1.1.1)

## Next Steps
Once DNS is working:
1. Deploy your RPC server
2. Test the RPC endpoint: `https://bssc-rpc.bssc.live`
3. Set up SSL certificate for the subdomain
