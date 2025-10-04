'use client'

import { motion } from 'framer-motion'
import { Download, Code, Play, CheckCircle, Copy, ExternalLink } from 'lucide-react'
import { useState } from 'react'

export default function GettingStarted() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const installationSteps = [
    {
      title: 'Install Rust',
      description: 'BSSC is built with Rust for maximum performance',
      code: 'curl https://sh.rustup.rs -sSf | sh\nsource $HOME/.cargo/env\nrustup component add rustfmt',
      id: 'rust'
    },
    {
      title: 'Clone Repository',
      description: 'Get the BSSC source code from GitHub',
      code: 'git clone https://github.com/HaidarIDK/Binance-Super-Smart-Chain.git\ncd Binance-Super-Smart-Chain',
      id: 'clone'
    },
    {
      title: 'Build BSSC',
      description: 'Compile the BSSC blockchain node and tools',
      code: './cargo build',
      id: 'build'
    },
    {
      title: 'Run Tests',
      description: 'Verify your build with the test suite',
      code: './cargo test',
      id: 'test'
    }
  ]

  const quickStartCommands = [
    {
      title: 'Start Local Testnet',
      description: 'Launch a local BSSC testnet for development',
      code: './multinode-demo/setup.sh\n./multinode-demo/faucet.sh\n./multinode-demo/validator.sh',
      id: 'testnet'
    },
    {
      title: 'Get Test BNB',
      description: 'Request test BNB from the faucet',
      code: 'bssc airdrop 1000',
      id: 'faucet'
    },
    {
      title: 'Check Balance',
      description: 'View your BNB balance',
      code: 'bssc balance',
      id: 'balance'
    },
    {
      title: 'Create Account',
      description: 'Generate a new BSSC account',
      code: 'bssc-keygen new --outfile ~/my-bssc-wallet.json',
      id: 'account'
    }
  ]

  const features = [
    '65,000 TPS performance',
    'Sub-cent transaction fees',
    '400ms finality time',
    'Full EVM compatibility',
    'BNB as native gas token',
    'MetaMask integration',
    'Hardhat & Truffle support',
    'Web3.js compatibility'
  ]

  return (
    <section id="getting-started" className="py-20 bg-white">
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
            Getting Started with BSSC
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Set up your development environment and start building on BSSC in minutes.
          </p>
        </motion.div>

        {/* Installation Steps */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Installation</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Follow these steps to install and build BSSC from source.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {installationSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-bsc-600 to-solana-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h4>
                    <p className="text-gray-600 mb-4">{step.description}</p>
                    <div className="relative">
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{step.code}</pre>
                      </div>
                      <button
                        onClick={() => copyToClipboard(step.code, step.id)}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedCode === step.id ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Start Commands */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Quick Start Commands</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Essential commands to get started with BSSC development.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {quickStartCommands.map((command, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-solana-600 to-bsc-600 rounded-lg flex items-center justify-center">
                      <Play size={16} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{command.title}</h4>
                    <p className="text-gray-600 mb-4">{command.description}</p>
                    <div className="relative">
                      <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">{command.code}</pre>
                      </div>
                      <button
                        onClick={() => copyToClipboard(command.code, command.id)}
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedCode === command.id ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">What You Get</h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              BSSC provides enterprise-grade performance with familiar Ethereum tooling.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm"
              >
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{feature}</span>
              </motion.div>
            ))}
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
            <h3 className="text-2xl font-bold mb-4">Ready to Build the Future?</h3>
            <p className="text-bsc-100 mb-6 max-w-2xl mx-auto">
              Join thousands of developers building the next generation of decentralized applications on BSSC.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/HaidarIDK/Binance-Super-Smart-Chain"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-bsc-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Download size={20} />
                <span>Download BSSC</span>
                <ExternalLink size={16} />
              </a>
              <a
                href="https://github.com/HaidarIDK/Binance-Super-Smart-Chain/blob/main/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-bssc-600 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Code size={20} />
                <span>Read Documentation</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
