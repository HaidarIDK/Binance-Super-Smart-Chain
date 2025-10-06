'use client'

import { motion } from 'framer-motion'
import { Code2, Wrench, ExternalLink, Github, FileCode, Zap, Shield, Globe } from 'lucide-react'

export default function DeveloperTools() {
  const tools = [
    {
      category: 'Development Frameworks',
      icon: Code2,
      items: [
        { name: 'Hardhat', description: 'Development environment for Ethereum software', status: 'Supported' },
        { name: 'Truffle', description: 'Development framework for Ethereum', status: 'Supported' },
        { name: 'Foundry', description: 'Fast, portable and modular toolkit for Ethereum', status: 'Supported' },
        { name: 'Brownie', description: 'Python-based development framework', status: 'Supported' }
      ]
    },
    {
      category: 'IDEs & Editors',
      icon: FileCode,
      items: [
        { name: 'Remix IDE', description: 'Online IDE for smart contract development', status: 'Supported' },
        { name: 'VS Code', description: 'Popular code editor with Solidity extensions', status: 'Supported' },
        { name: 'IntelliJ IDEA', description: 'Java-based IDE with Solidity plugin', status: 'Supported' },
        { name: 'Vim/Neovim', description: 'Terminal-based editors with Solidity support', status: 'Supported' }
      ]
    },
    {
      category: 'Libraries & SDKs',
      icon: Wrench,
      items: [
        { name: 'Web3.js', description: 'JavaScript library for Ethereum', status: 'Supported' },
        { name: 'Ethers.js', description: 'Complete Ethereum wallet implementation', status: 'Supported' },
        { name: 'OpenZeppelin', description: 'Secure smart contract development framework', status: 'Supported' },
        { name: 'Hardhat Network', description: 'Local Ethereum network for testing', status: 'Supported' }
      ]
    },
    {
      category: 'Wallets & Integration',
      icon: Globe,
      items: [
        { name: 'MetaMask', description: 'Popular Ethereum wallet browser extension', status: 'Supported' },
        { name: 'WalletConnect', description: 'Open protocol for connecting wallets', status: 'Supported' },
        { name: 'Coinbase Wallet', description: 'Multi-chain wallet from Coinbase', status: 'Supported' },
        { name: 'Trust Wallet', description: 'Secure multi-crypto wallet', status: 'Supported' }
      ]
    }
  ]

  const quickStart = [
    {
      step: 1,
      title: 'Install BSSC CLI',
      description: 'Download and install the BSSC command-line tools',
      code: 'npm install -g @bssc/cli'
    },
    {
      step: 2,
      title: 'Initialize Project',
      description: 'Create a new project with Hardhat or Truffle',
      code: 'npx hardhat init'
    },
    {
      step: 3,
      title: 'Configure Network',
      description: 'Add BSSC network to your configuration',
      code: `network: "bssc",
rpc: "https://bssc-rpc.bssc.live",
chainId: 9701`
    },
    {
      step: 4,
      title: 'Deploy Contract',
      description: 'Deploy your smart contract to BSSC',
      code: 'npx hardhat run scripts/deploy.js --network bssc'
    }
  ]

  return (
    <section id="developer-tools" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">
            Developer Tools & Ecosystem
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Use your existing Ethereum development tools and workflows. BSSC is 100% compatible with the Ethereum ecosystem.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-bsc-600 to-solana-600 rounded-lg flex items-center justify-center">
                  <tool.icon size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold">{tool.category}</h3>
              </div>
              <div className="space-y-3">
                {tool.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Start Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Quick Start Guide</h3>
            <p className="text-gray-600 mt-1">Get up and running with BSSC in minutes</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickStart.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex space-x-4"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gradient-to-r from-bsc-600 to-solana-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{step.step}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{step.description}</p>
                    <div className="bg-gray-900 rounded-lg p-3">
                      <code className="text-green-400 text-sm font-mono">{step.code}</code>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Key Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Zap className="w-12 h-12 text-bsc-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Zero Learning Curve</h4>
            <p className="text-gray-600">Use existing Ethereum tools and knowledge. No new frameworks to learn.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Shield className="w-12 h-12 text-bsc-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Proven Security</h4>
            <p className="text-gray-600">Built on Solana&apos;s battle-tested infrastructure with additional security layers.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Globe className="w-12 h-12 text-bsc-600 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Full Compatibility</h4>
            <p className="text-gray-600">100% compatible with Ethereum standards and development tools.</p>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-bsc-600 to-solana-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Building?</h3>
            <p className="text-bsc-100 mb-6 max-w-2xl mx-auto">
              Join the BSSC ecosystem and build the future of decentralized applications with BNB as the native gas token.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/HaidarIDK/Binance-Super-Smart-Chain"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-bsc-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Github size={20} />
                <span>View on GitHub</span>
                <ExternalLink size={16} />
              </a>
              <a
                href="#getting-started"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-bsc-600 transition-colors duration-200"
              >
                Get Started Guide
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
