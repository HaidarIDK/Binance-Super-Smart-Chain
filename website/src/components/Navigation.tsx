'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Github, ExternalLink } from 'lucide-react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'Performance', href: '#performance' },
    { name: 'Live Testnet', href: '#live-testnet' },
    { name: 'Getting Started', href: '#getting-started' },
  ]

  const externalLinks = [
    { name: 'Explorer', href: 'https://explorer.bssc.live', icon: ExternalLink },
    { name: 'RPC', href: 'https://bssc-rpc.bssc.live', icon: ExternalLink },
  ]

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-bsc-600 to-solana-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold gradient-text">BSSC</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-bsc-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {externalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-gray-600 hover:text-bsc-600 transition-colors duration-200 font-medium"
              >
                <span>{link.name}</span>
                <link.icon size={14} />
              </a>
            ))}
            <a
              href="https://github.com/HaidarIDK/Binance-Super-Smart-Chain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-gray-600 hover:text-bsc-600 transition-colors duration-200"
            >
              <Github size={20} />
              <span>GitHub</span>
              <ExternalLink size={14} />
            </a>
            <Link href="#getting-started" className="btn-primary">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-bsc-600 transition-colors duration-200"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-bsc-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {externalLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-bsc-600 transition-colors duration-200"
                  >
                    <span>{link.name}</span>
                    <link.icon size={14} />
                  </a>
                ))}
                <a
                  href="https://github.com/HaidarIDK/Binance-Super-Smart-Chain"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-bsc-600 transition-colors duration-200"
                >
                  <Github size={20} />
                  <span>GitHub</span>
                  <ExternalLink size={14} />
                </a>
                <Link
                  href="#getting-started"
                  className="block mx-3 btn-primary text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
