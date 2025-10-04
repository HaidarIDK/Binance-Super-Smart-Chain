'use client'

import { motion } from 'framer-motion'
import { Github, Twitter, ExternalLink, Mail, FileText, Code, Shield } from 'lucide-react'

export default function Footer() {
  const links = {
    'Developers': [
      { name: 'Documentation', href: 'https://github.com/HaidarIDK/Binance-Super-Smart-Chain/blob/main/README.md', external: true },
      { name: 'GitHub Repository', href: 'https://github.com/HaidarIDK/Binance-Super-Smart-Chain', external: true },
      { name: 'API Reference', href: '#', external: false },
      { name: 'Developer Tools', href: '#developer-tools', external: false }
    ],
    'Resources': [
      { name: 'Getting Started', href: '#getting-started', external: false },
      { name: 'Performance Metrics', href: '#performance', external: false },
      { name: 'Technical Architecture', href: '#architecture', external: false },
      { name: 'EVM Compatibility', href: '#features', external: false }
    ],
    'Community': [
      { name: 'GitHub Discussions', href: 'https://github.com/HaidarIDK/Binance-Super-Smart-Chain/discussions', external: true },
      { name: 'Discord Server', href: '#', external: false },
      { name: 'Twitter', href: 'https://x.com/bnbsolfork', external: true },
      { name: 'Twitter Community', href: 'https://x.com/i/communities/1974309470806139295', external: true }
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '#', external: false },
      { name: 'Terms of Service', href: '#', external: false },
      { name: 'Disclaimer', href: '#', external: false },
      { name: 'Security', href: '#', external: false }
    ]
  }

  const socialLinks = [
    { icon: Github, href: 'https://github.com/HaidarIDK/Binance-Super-Smart-Chain', label: 'GitHub' },
    { icon: Twitter, href: 'https://x.com/bnbsolfork', label: 'Twitter' },
    { icon: Mail, href: 'mailto:contact@bssc.binance.org', label: 'Email' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-bsc-600 to-solana-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold">BSSC</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Binance Super Smart Chain combines Solana's performance with BNB as the native gas token, 
                delivering 65,000 TPS with full EVM compatibility.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target={social.href.startsWith('http') ? '_blank' : '_self'}
                    rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Sections */}
          {Object.entries(links).map(([category, categoryLinks], index) => (
            <div key={category}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-4">
                  {category}
                </h3>
                <ul className="space-y-3">
                  {categoryLinks.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : '_self'}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center space-x-1"
                      >
                        <span>{link.name}</span>
                        {link.external && <ExternalLink size={12} />}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">65,000</div>
              <div className="text-sm text-gray-400">TPS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">400ms</div>
              <div className="text-sm text-gray-400">Finality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">$0.001</div>
              <div className="text-sm text-gray-400">Avg Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-gray-400">EVM Compatible</div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Binance Super Smart Chain. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <span>Built with ❤️ on Solana</span>
              <span>•</span>
              <span>Powered by BNB</span>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-gray-800 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-400">
                <strong className="text-yellow-400">Disclaimer:</strong> BSSC is a fork of Solana for educational purposes. 
                This project is not affiliated with Binance or any official Binance project. All claims, content, 
                designs, algorithms, estimates, roadmaps, specifications, and performance measurements are provided 
                with good faith efforts. It is up to the reader to validate their accuracy and truthfulness.
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
