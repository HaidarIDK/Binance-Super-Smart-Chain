import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Binance Super Smart Chain (BSSC) - Solana Performance with BNB',
  description: 'BSSC brings BSC\'s smart contract ecosystem to Solana\'s high-performance infrastructure. 65,000 TPS with BNB as the native gas token.',
  keywords: 'BSSC, Binance Super Smart Chain, BNB, Solana, EVM, blockchain, smart contracts, DeFi',
  authors: [{ name: 'BSSC Team' }],
  openGraph: {
    title: 'Binance Super Smart Chain (BSSC)',
    description: 'Solana Performance with BNB as Native Gas Token',
    type: 'website',
    url: 'https://bssc.binance.org',
    siteName: 'BSSC',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Binance Super Smart Chain (BSSC)',
    description: 'Solana Performance with BNB as Native Gas Token',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
