'use client'

import { motion } from 'framer-motion'
import { Rocket, ExternalLink, Wallet, Search, Code, Zap } from 'lucide-react'

export default function LiveTestnet() {
  return (
    <section id="live-testnet" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="gradient-text">🚀 Live Testnet</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our BSSC testnet is live and running 24/7! Test your dApps, explore blocks, and get free testnet BNB.
          </p>
        </motion.div>

        {/* Live Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
            <h3 className="text-2xl font-bold text-green-900">Testnet Status: LIVE ✅</h3>
          </div>
          <p className="text-green-700 mb-6">Validator running on 65,000 TPS Solana infrastructure with BNB as gas token</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-white rounded-lg px-6 py-3 shadow-sm">
              <div className="text-sm text-gray-600">Chain ID</div>
              <div className="text-2xl font-bold text-bsc-600">16979</div>
            </div>
            <div className="bg-white rounded-lg px-6 py-3 shadow-sm">
              <div className="text-sm text-gray-600">Network</div>
              <div className="text-2xl font-bold text-bsc-600">BSSC Testnet</div>
            </div>
            <div className="bg-white rounded-lg px-6 py-3 shadow-sm">
              <div className="text-sm text-gray-600">Currency</div>
              <div className="text-2xl font-bold text-bsc-600">BNB</div>
            </div>
          </div>
        </motion.div>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Explorer Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card hover-lift"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-bsc-100 rounded-lg flex items-center justify-center">
                <Search size={24} className="text-bsc-600" />
              </div>
              <h3 className="text-2xl font-bold">Block Explorer</h3>
            </div>
            <p className="text-gray-600 mb-6">
              View real-time blocks, transactions, and network statistics. Includes a built-in faucet for free testnet BNB!
            </p>
            <a
              href="https://explorer.bssc.live"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center space-x-2 justify-center group"
            >
              <span>Open Explorer</span>
              <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>

          {/* RPC Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card hover-lift"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-solana-100 rounded-lg flex items-center justify-center">
                <Zap size={24} className="text-solana-600" />
              </div>
              <h3 className="text-2xl font-bold">RPC Endpoint</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Connect your MetaMask or Web3.js apps to our live RPC server. Full Ethereum JSON-RPC compatibility.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 mb-4">
              <code className="text-green-400 text-sm break-all">https://bssc-rpc.bssc.live</code>
            </div>
            <a
              href="https://bssc-rpc.bssc.live"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2 justify-center group"
            >
              <span>Test RPC</span>
              <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </motion.div>
        </div>

        {/* How to Test Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-3xl font-bold text-center mb-12">How to Test BSSC</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1: Get Testnet BNB */}
            <div className="card">
              <div className="w-12 h-12 bg-gradient-to-r from-bsc-500 to-bsc-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Get Testnet BNB</h4>
              <p className="text-gray-600 mb-4">
                Visit the Block Explorer and use the built-in faucet to get 3 free testnet BNB per day.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Supports Solana and Ethereum wallet formats</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>3 BNB per address per 24 hours</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Instant delivery to your wallet</span>
                </li>
              </ul>
            </div>

            {/* Step 2: Connect MetaMask */}
            <div className="card">
              <div className="w-12 h-12 bg-gradient-to-r from-solana-500 to-solana-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Connect MetaMask</h4>
              <p className="text-gray-600 mb-4">
                Add BSSC testnet to MetaMask and connect your wallet to start testing.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1 mb-4">
                <div><strong>Network Name:</strong> BSSC Testnet</div>
                <div><strong>RPC URL:</strong> https://bssc-rpc.bssc.live</div>
                <div><strong>Chain ID:</strong> 16979</div>
                <div><strong>Currency:</strong> BNB</div>
              </div>
              <a
                href="https://metamask.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bsc-600 hover:text-bsc-700 font-medium flex items-center space-x-1"
              >
                <Wallet size={16} />
                <span>Get MetaMask</span>
                <ExternalLink size={12} />
              </a>
            </div>

            {/* Step 3: Deploy & Test */}
            <div className="card">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h4 className="text-xl font-bold mb-3">Deploy & Test</h4>
              <p className="text-gray-600 mb-4">
                Deploy your smart contracts and test your dApps on the live testnet with real blockchain data.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Full EVM compatibility</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Sub-cent transaction fees</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>65,000 TPS performance</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Developer Quick Start */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16"
        >
          <div className="card bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="flex items-center space-x-3 mb-6">
              <Code size={32} className="text-green-400" />
              <h3 className="text-2xl font-bold">Quick Start for Developers</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-green-400">Web3.js Example</h4>
                <pre className="bg-gray-950 rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`const Web3 = require('web3');
const web3 = new Web3(
  'https://bssc-rpc.bssc.live'
);

// Get latest block
const block = await web3.eth.getBlockNumber();
console.log('Current block:', block);`}</code>
                </pre>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-green-400">MetaMask Connection</h4>
                <pre className="bg-gray-950 rounded-lg p-4 text-sm overflow-x-auto">
                  <code>{`await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x4253',
    chainName: 'BSSC Testnet',
    rpcUrls: ['https://bssc-rpc.bssc.live'],
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  }]
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold mb-4">Ready to Start Testing?</h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Jump into the live testnet and experience 65,000 TPS with sub-cent fees!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://explorer.bssc.live"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center space-x-2 justify-center group"
            >
              <Rocket size={20} />
              <span>Open Explorer & Get BNB</span>
              <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#getting-started"
              className="btn-secondary flex items-center space-x-2 justify-center"
            >
              <Code size={20} />
              <span>View Documentation</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

