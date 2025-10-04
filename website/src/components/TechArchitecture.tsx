'use client'

import { motion } from 'framer-motion'
import { Layers, Database, Network, Shield, Code, Zap } from 'lucide-react'

export default function TechArchitecture() {
  const components = [
    {
      icon: Code,
      title: 'EVM Program',
      description: 'Solana program implementing EVM bytecode execution with BNB token integration',
      features: ['Smart contract deployment', 'BNB gas system', 'Ethereum compatibility', 'State management'],
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Network,
      title: 'Bridge Program',
      description: 'Cross-chain asset transfer with decentralized validator consensus',
      features: ['Cross-chain transfers', 'Validator consensus', 'Merkle proofs', 'Emergency controls'],
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Database,
      title: 'RPC Server',
      description: 'Ethereum-compatible JSON-RPC interface for seamless integration',
      features: ['Standard Ethereum RPC', 'MetaMask integration', 'Web3.js support', 'JSON-RPC protocol'],
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const architecture = [
    {
      layer: 'Application Layer',
      description: 'Smart contracts, dApps, and developer tools',
      technologies: ['Solidity', 'Web3.js', 'MetaMask', 'Hardhat', 'Remix']
    },
    {
      layer: 'EVM Layer',
      description: 'Ethereum Virtual Machine implementation on Solana',
      technologies: ['EVM Bytecode', 'BNB Gas Token', 'State Management', 'Contract Execution']
    },
    {
      layer: 'Bridge Layer',
      description: 'Cross-chain communication and asset transfers',
      technologies: ['Validator Consensus', 'Merkle Proofs', 'Cross-Chain Protocols', 'Security Controls']
    },
    {
      layer: 'Solana Layer',
      description: 'High-performance blockchain infrastructure',
      technologies: ['Proof of History', 'Turbine', 'Gulf Stream', 'Sealevel']
    }
  ]

  return (
    <section id="architecture" className="py-20 bg-white">
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
            Technical Architecture
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BSSC is built on Solana's proven infrastructure with custom EVM and bridge components for seamless BNB integration.
          </p>
        </motion.div>

        {/* Core Components */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {components.map((component, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${component.color} flex items-center justify-center mb-4`}>
                <component.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{component.title}</h3>
              <p className="text-gray-600 mb-4">{component.description}</p>
              <ul className="space-y-2">
                {component.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-1.5 h-1.5 bg-bsc-600 rounded-full"></div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Architecture Layers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
              BSSC Architecture Layers
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A layered approach that combines Ethereum compatibility with Solana's performance.
            </p>
          </div>

          <div className="space-y-6">
            {architecture.map((layer, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-r from-bsc-600 to-solana-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{layer.layer}</h4>
                    <p className="text-gray-600 mb-3">{layer.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {layer.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Zap className="w-8 h-8 text-bsc-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">EVM Bytecode</h4>
            <p className="text-sm text-gray-600">Full Ethereum Virtual Machine compatibility</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Database className="w-8 h-8 text-bsc-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">BNB Native</h4>
            <p className="text-sm text-gray-600">BNB as the native gas token</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Network className="w-8 h-8 text-bsc-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Cross-Chain</h4>
            <p className="text-sm text-gray-600">Bridge to other networks</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <Shield className="w-8 h-8 text-bsc-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Decentralized</h4>
            <p className="text-sm text-gray-600">Validator consensus security</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
