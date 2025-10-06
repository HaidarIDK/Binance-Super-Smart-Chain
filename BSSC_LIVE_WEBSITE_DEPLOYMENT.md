# BSSC Website Deployment Guide for bssc.live

## Overview
This guide will help you deploy the BSSC website to the bssc.live domain.

## Prerequisites
- Web server (Nginx or Apache)
- SSL certificate for bssc.live
- Domain DNS configured
- Server with root access

## Deployment Steps

### 1. Prepare Website Files
The website has been built and is ready for deployment:
- Build directory: `website/out`
- Deployment package: `bssc-live-website-*.zip`
- Static files ready for upload

### 2. Upload Website Files
Upload the contents of the `bssc-live-website` directory to your web server:
```bash
# Copy files to web server
scp -r bssc-live-website/* user@your-server:/var/www/bssc.live/
```

### 3. Configure Web Server

#### For Nginx:
1. Copy the nginx configuration:
```bash
sudo cp nginx-bssc-live-website.conf /etc/nginx/sites-available/bssc.live
sudo ln -s /etc/nginx/sites-available/bssc.live /etc/nginx/sites-enabled/
```

2. Update SSL certificate paths in the configuration
3. Test configuration:
```bash
sudo nginx -t
```

4. Reload Nginx:
```bash
sudo systemctl reload nginx
```

#### For Apache:
Create a virtual host configuration:
```apache
<VirtualHost *:443>
    ServerName bssc.live
    ServerAlias www.bssc.live
    DocumentRoot /var/www/bssc.live
    
    SSLEngine on
    SSLCertificateFile /path/to/cert.pem
    SSLCertificateKeyFile /path/to/private.key
    
    <Directory /var/www/bssc.live>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 4. Set File Permissions
```bash
sudo chown -R www-data:www-data /var/www/bssc.live
sudo chmod -R 755 /var/www/bssc.live
```

### 5. Configure DNS
Ensure your DNS records point to your server:
- A record: bssc.live -> your-server-ip
- A record: www.bssc.live -> your-server-ip

### 6. SSL Certificate
If you don't have an SSL certificate, use Let's Encrypt:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d bssc.live -d www.bssc.live
```

## Website Features
The deployed website includes:
- Modern responsive design
- Performance comparison charts
- Technical architecture overview
- Developer tools showcase
- Getting started guide
- Interactive components

## Testing
After deployment, test the website:
1. Visit https://bssc.live
2. Check all pages load correctly
3. Verify SSL certificate
4. Test responsive design on mobile

## Maintenance
- Monitor server logs for errors
- Keep SSL certificate updated
- Update website content as needed
- Monitor performance and uptime

## Support
For deployment issues, check:
- Server logs: `/var/log/nginx/bssc.live.error.log`
- Nginx configuration: `sudo nginx -t`
- File permissions and ownership
- DNS propagation status
