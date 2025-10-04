'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Zap, Shield, Users, Code2, Globe, Database, Lock } from 'lucide-react'

export default function Features() {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: '65,000 transactions per second with 400ms finality, powered by Solana\'s proven architecture.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Ultra Low Cost',
      description: 'Sub-cent transaction fees with BNB as the native gas token, making DeFi accessible to everyone.',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'EVM Compatible',
      description: 'Full Ethereum Virtual Machine compatibility. Deploy existing smart contracts without modification.',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      icon: Code2,
      title: 'Developer Friendly',
      description: 'Use familiar tools like MetaMask, Remix, Hardhat, and Web3.js with zero learning curve.',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: Database,
      title: 'Scalable Architecture',
      description: 'Built on Solana\'s battle-tested infrastructure with horizontal scaling capabilities.',
      color: 'from-indigo-400 to-blue-500'
    },
    {
      icon: Lock,
      title: 'Decentralized Security',
      description: 'Validator consensus mechanism with merkle proof verification and emergency controls.',
      color: 'from-red-400 to-rose-500'
    }
  ]

  const compatibility = [
    'ERC-20 Token Standard',
    'ERC-721 NFT Standard',
    'ERC-1155 Multi-Token',
    'EIP-1559 Fee Market',
    'EIP-2930 Access Lists',
    'MetaMask Integration',
    'Web3.js & Ethers.js',
    'Hardhat & Truffle',
    'Remix IDE Support',
    'OpenZeppelin Libraries'
  ]

  return (
    <section id="features" className="py-20 bg-white">
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
            Why Choose BSSC?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BSSC combines the best of both worlds: Solana's performance and BSC's ecosystem compatibility.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Compatibility Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gray-50 rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold gradient-text mb-4">
              Full Ethereum Ecosystem Compatibility
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              BSSC supports all major Ethereum standards and development tools, making migration seamless.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {compatibility.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center space-x-2 bg-white rounded-lg p-3 shadow-sm"
              >
                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
