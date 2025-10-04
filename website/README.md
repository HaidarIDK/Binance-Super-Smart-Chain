# BSSC Website

Official website for Binance Super Smart Chain (BSSC) - built with Next.js, TypeScript, and Tailwind CSS.

## Features

- 🚀 **Modern Tech Stack**: Next.js 14 with TypeScript and Tailwind CSS
- 📱 **Responsive Design**: Mobile-first approach with beautiful animations
- ⚡ **Performance Optimized**: Fast loading with optimized images and code splitting
- 🎨 **Beautiful UI**: Modern design with gradient themes and smooth animations
- 📊 **Interactive Charts**: Performance comparison with Recharts
- 🔧 **Developer Focused**: Getting started guides and tool compatibility

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/HaidarIDK/Binance-Super-Smart-Chain.git
cd Binance-Super-Smart-Chain/website
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
website/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   └── components/          # React components
│       ├── Hero.tsx         # Hero section
│       ├── Features.tsx     # Features section
│       ├── PerformanceComparison.tsx
│       ├── TechArchitecture.tsx
│       ├── DeveloperTools.tsx
│       ├── GettingStarted.tsx
│       ├── Navigation.tsx
│       └── Footer.tsx
├── public/                  # Static assets
├── package.json
├── tailwind.config.js       # Tailwind configuration
└── next.config.js          # Next.js configuration
```

## Deployment

The website is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. The site will automatically deploy on push to main branch
3. Custom domain can be configured in Vercel dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the Apache-2.0 License - see the [LICENSE](../LICENSE) file for details.

## Disclaimer

BSSC is a fork of Solana for educational purposes. This project is not affiliated with Binance or any official Binance project.
