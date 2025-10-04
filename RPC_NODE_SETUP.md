# BSSC RPC Node Setup Guide

This guide will help you set up your own BSSC (Binance Super Smart Chain) RPC node with HTTPS support using either NGINX reverse proxy or Cloudflare Tunnel.

## Prerequisites

- Windows 10/11 with PowerShell 7+
- Rust and Cargo installed
- Domain name (for HTTPS setup)
- Basic knowledge of command line operations

## Quick Start

### 1. Build the Project

First, ensure you have built the BSSC project:

```powershell
cargo build --all
```

### 2. Launch RPC Node

Run the provided PowerShell script to start your RPC node:

```powershell
.\launch_rpc_node.ps1
```

This script will:
- Create necessary directories (`ledger`, `logs`, `config`)
- Generate validator keypairs if they don't exist
- Create genesis configuration
- Start the BSSC validator with RPC enabled on port 8899

The RPC endpoint will be available at: `http://localhost:8899`

## HTTPS Setup Options

### Option 1: NGINX Reverse Proxy (Recommended for Production)

#### Prerequisites
- NGINX installed on your server
- SSL certificate (Let's Encrypt recommended)
- Domain pointing to your server's IP

#### Setup Steps

1. **Install NGINX** (if not already installed):
   ```powershell
   # On Windows, you can use Chocolatey
   choco install nginx
   ```

2. **Configure NGINX**:
   - Copy `nginx-bssc-rpc.conf` to your NGINX configuration directory
   - Update the domain name in the configuration file
   - Replace `your-domain.com` with your actual domain

3. **Set up SSL Certificate**:
   ```powershell
   # Install Certbot for Let's Encrypt
   choco install certbot
   
   # Obtain SSL certificate
   certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

4. **Start NGINX**:
   ```powershell
   nginx
   ```

5. **Test the setup**:
   - Visit `https://your-domain.com` in your browser
   - Check that the RPC endpoint responds correctly

#### NGINX Configuration Features

- **Rate Limiting**: Prevents abuse with configurable request limits
- **CORS Support**: Enables web3 applications to connect
- **Security Headers**: Includes HSTS, XSS protection, and more
- **Health Checks**: Built-in health monitoring endpoint
- **Metrics**: Optional metrics collection endpoint

### Option 2: Cloudflare Tunnel (Easier Setup)

Cloudflare Tunnel provides a simpler way to expose your RPC node with built-in HTTPS and DDoS protection.

#### Setup Steps

1. **Run the Cloudflare setup script**:
   ```powershell
   .\setup-cloudflare-tunnel.ps1
   ```

2. **Follow the authentication prompts**:
   - The script will open your browser for Cloudflare authentication
   - Complete the authentication process

3. **Configure DNS**:
   - Add CNAME records in your Cloudflare DNS dashboard
   - Point your domain to the tunnel endpoint

4. **Start the tunnel**:
   - The script will automatically start the tunnel
   - Your RPC node will be accessible via your domain

#### Cloudflare Tunnel Benefits

- **No Port Forwarding**: Your server's IP remains private
- **Built-in HTTPS**: Automatic SSL/TLS encryption
- **DDoS Protection**: Cloudflare's network protection
- **Easy Setup**: No need to configure firewalls or SSL certificates

## Configuration Details

### RPC Node Configuration

The RPC node is configured with the following settings:

- **RPC Port**: 8899 (configurable)
- **Full RPC API**: Enabled (all RPC methods available)
- **Transaction History**: Enabled
- **Extended Metadata**: Enabled for enhanced transaction information
- **Ledger Size Limit**: 100,000 slots (configurable)

### Security Considerations

1. **Rate Limiting**: Both NGINX and Cloudflare configurations include rate limiting
2. **CORS Configuration**: Properly configured for web3 applications
3. **SSL/TLS**: Strong encryption with modern cipher suites
4. **Security Headers**: Comprehensive security headers included

### Monitoring and Logs

- **Logs**: Stored in `.\logs\rpc-node.log`
- **Health Check**: Available at `/health` endpoint
- **Metrics**: Optional metrics endpoint at `/metrics`

## Testing Your RPC Node

### Basic Connectivity Test

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}' \
  https://your-domain.com
```

### Web3 Integration Test

```javascript
// Using ethers.js or web3.js
const provider = new ethers.providers.JsonRpcProvider('https://your-domain.com');

// Test connection
provider.getBlockNumber().then(blockNumber => {
  console.log('Current block:', blockNumber);
});
```

### RPC Method Testing

Test common RPC methods:

```bash
# Get latest block hash
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getLatestBlockhash"}' \
  https://your-domain.com

# Get account info
curl -X POST -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getAccountInfo","params":["your-account-address"]}' \
  https://your-domain.com
```

## Troubleshooting

### Common Issues

1. **RPC Node Won't Start**:
   - Check if port 8899 is available
   - Verify that the project was built successfully
   - Check logs in `.\logs\rpc-node.log`

2. **HTTPS Not Working**:
   - Verify SSL certificate is valid
   - Check NGINX configuration syntax
   - Ensure domain DNS is pointing correctly

3. **CORS Errors**:
   - Verify CORS headers in NGINX configuration
   - Check that your web3 application is using the correct RPC URL

4. **Rate Limiting Issues**:
   - Adjust rate limits in NGINX configuration
   - Check Cloudflare rate limiting settings

### Log Locations

- **RPC Node Logs**: `.\logs\rpc-node.log`
- **NGINX Logs**: `/var/log/nginx/bssc_rpc_*.log`
- **Cloudflare Tunnel Logs**: `/var/log/cloudflared/bssc-rpc-tunnel.log`

## Performance Optimization

### Hardware Recommendations

- **CPU**: 4+ cores recommended
- **RAM**: 8GB+ recommended
- **Storage**: SSD with 100GB+ free space
- **Network**: Stable internet connection

### Configuration Tuning

1. **Ledger Size**: Adjust `--limit-ledger-size` based on available storage
2. **RPC Timeouts**: Configure appropriate timeouts in NGINX
3. **Connection Pooling**: Tune upstream connection settings

## Security Best Practices

1. **Firewall**: Only expose necessary ports (80, 443)
2. **Updates**: Keep all software updated
3. **Monitoring**: Set up monitoring and alerting
4. **Backups**: Regular backup of configuration and keys
5. **Access Control**: Implement proper access controls

## Support and Resources

- **BSSC Documentation**: Check the main project documentation
- **Solana RPC Reference**: [Solana RPC API Documentation](https://docs.solana.com/api/http)
- **NGINX Documentation**: [NGINX Configuration Guide](https://nginx.org/en/docs/)
- **Cloudflare Tunnel**: [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)

## Next Steps

After setting up your RPC node:

1. **Test thoroughly** with various RPC methods
2. **Set up monitoring** and alerting
3. **Configure backups** for your keys and configuration
4. **Document your setup** for team members
5. **Consider load balancing** for high-traffic scenarios

Your BSSC RPC node is now ready to serve requests with enterprise-grade security and performance!
