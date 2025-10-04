# BSSC Website - GitHub Pages Deployment

This website is configured to deploy automatically to GitHub Pages using GitHub Actions.

## 🚀 Deployment Status

[![Deploy Website](https://github.com/HaidarIDK/Binance-Super-Smart-Chain/actions/workflows/deploy.yml/badge.svg)](https://github.com/HaidarIDK/Binance-Super-Smart-Chain/actions/workflows/deploy.yml)

**Live Website**: https://haidaridk.github.io/Binance-Super-Smart-Chain/

## 📋 Setup Instructions

### 1. Enable GitHub Pages

1. Go to your repository: https://github.com/HaidarIDK/Binance-Super-Smart-Chain
2. Click on **Settings** tab
3. Scroll down to **Pages** section
4. Under **Source**, select **GitHub Actions**
5. Save the settings

### 2. Automatic Deployment

The website will automatically deploy when you:
- Push to the `master` branch
- Manually trigger the workflow

### 3. Build Process

The GitHub Action will:
1. Checkout the code
2. Setup Node.js 18
3. Install dependencies
4. Build the website
5. Deploy to GitHub Pages

## 🔧 Configuration

### GitHub Actions Workflows

- **`.github/workflows/deploy.yml`** - Deploys to GitHub Pages
- **`.github/workflows/build.yml`** - Builds and tests the website

### Next.js Configuration

The website is configured for static export:
- `output: 'export'` - Generates static files
- `assetPrefix` - Handles GitHub Pages subdirectory
- `basePath` - Sets the correct base path
- `images.unoptimized: true` - For static export compatibility

## 📁 Project Structure

```
website/
├── .github/
│   └── workflows/
│       ├── deploy.yml      # GitHub Pages deployment
│       └── build.yml       # Build and test workflow
├── src/
│   ├── app/               # Next.js App Router
│   └── components/        # React components
├── out/                   # Built static files (generated)
├── package.json           # Dependencies and scripts
└── next.config.js         # Next.js configuration
```

## 🌐 Website Features

- ✅ **Responsive Design** - Works on all devices
- ✅ **Performance Charts** - Interactive data visualization
- ✅ **Developer Tools** - Comprehensive tool showcase
- ✅ **Getting Started Guide** - Step-by-step instructions
- ✅ **Social Media Integration** - Links to Twitter and community
- ✅ **SEO Optimized** - Proper meta tags and structure
- ✅ **Fast Loading** - Optimized images and code

## 🔗 Links

- **Live Website**: https://haidaridk.github.io/Binance-Super-Smart-Chain/
- **GitHub Repository**: https://github.com/HaidarIDK/Binance-Super-Smart-Chain
- **Twitter**: https://x.com/bnbsolfork
- **Twitter Community**: https://x.com/i/communities/1974309470806139295

## 🛠️ Local Development

To run the website locally:

```bash
cd website
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Build Commands

- `npm run build` - Build for production
- `npm run dev` - Start development server
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎯 Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the website root with your domain
2. Configure DNS settings to point to GitHub Pages
3. Enable HTTPS in GitHub Pages settings

## 📄 License

Apache-2.0 License - see LICENSE file for details.

## ⚠️ Disclaimer

BSSC is a fork of Solana for educational purposes. This project is not affiliated with Binance or any official Binance project.
