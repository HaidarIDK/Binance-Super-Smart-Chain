#!/bin/bash

# Setup SSL certificates and Nginx for BSSC

set -e

echo "Setting up SSL for BSSC..."

# Install certbot and nginx
sudo apt update
sudo apt install -y certbot nginx

# Get SSL certificates
echo "Getting SSL certificate for rpc.bssc.live..."
sudo certbot certonly --standalone -d rpc.bssc.live --non-interactive --agree-tos --email admin@bssc.live

echo "Getting SSL certificate for explorer.bssc.live..."
sudo certbot certonly --standalone -d explorer.bssc.live --non-interactive --agree-tos --email admin@bssc.live

# Copy nginx config
sudo cp nginx-bssc.conf /etc/nginx/sites-available/bssc

# Create symlink
sudo ln -sf /etc/nginx/sites-available/bssc /etc/nginx/sites-enabled/

# Create explorer directory
sudo mkdir -p /var/www/bssc-explorer
sudo cp explorer.html /var/www/bssc-explorer/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

echo "SSL setup complete!"
echo "RPC: https://rpc.bssc.live"
echo "Explorer: https://explorer.bssc.live"

