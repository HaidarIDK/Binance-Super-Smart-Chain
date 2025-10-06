# Deploy BSSC Website to Replit

## Overview
Your website is already configured for Replit deployment with all necessary files.

## Files Already Configured
- `.replit` - Replit configuration
- `replit.nix` - Node.js 18 setup
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration

## Deployment Steps

### Method 1: Import from GitHub (Recommended)
1. Go to https://replit.com
2. Click "Create Repl"
3. Select "Import from GitHub"
4. Enter your repository URL: `https://github.com/HaidarIDK/Binance-Super-Smart-Chain`
5. Replit will automatically detect the website configuration
6. Click "Import" and wait for setup

### Method 2: Manual Upload
1. Go to https://replit.com
2. Click "Create Repl"
3. Select "Node.js" template
4. Upload your project files
5. The `.replit` file will configure everything automatically

## What Happens Automatically
- Node.js 18 will be installed
- Dependencies will be installed via `npm install`
- Website will be built via `npm run build`
- Static files will be served from the `out` directory
- Your site will get a public URL like `https://your-repl-name.your-username.repl.co`

## Custom Domain (Optional)
To use bssc.live domain:
1. In your Repl, go to Settings
2. Click on "Webview"
3. Add custom domain: `bssc.live`
4. Update your DNS to point to Replit's servers

## Advantages of Replit
- Free hosting with custom domains
- Automatic SSL certificates
- Easy deployment from GitHub
- Built-in code editor
- Automatic builds and updates
- No server management needed

## After Deployment
Your website will be available at:
- Replit URL: `https://your-repl-name.your-username.repl.co`
- Custom domain: `https://bssc.live` (if configured)

## Support
- Replit automatically handles all the technical setup
- Your website will be live in minutes
- Updates are automatic when you push to GitHub
