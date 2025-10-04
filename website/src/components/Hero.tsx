'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Globe, Code, Rocket } from 'lucide-react'

export default function Hero() {
  const features = [
    { icon: Zap, text: '65,000 TPS' },
    { icon: Shield, text: 'Sub-cent fees' },
    { icon: Globe, text: 'EVM Compatible' },
    { icon: Code, text: 'BNB Native' },
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center gradient-bg pt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-72 h-72 bg-bsc-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-solana-500 rounded-full filter blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="gradient-text">Binance Super</span>
              <br />
              <span className="gradient-text">Smart Chain</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Solana's proven performance meets BNB as the native gas token. 
              Experience 65,000 TPS with sub-cent fees and full EVM compatibility.
            </p>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap justify-center gap-4 mb-12"
          >
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-gray-200"
              >
                <feature.icon size={16} className="text-bsc-600" />
                <span className="text-sm font-medium text-gray-700">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="#getting-started"
              className="btn-primary flex items-center space-x-2 group"
            >
              <span>Start Building</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://github.com/HaidarIDK/Binance-Super-Smart-Chain"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center space-x-2"
            >
              <Rocket size={20} />
              <span>View on GitHub</span>
            </a>
          </motion.div>

          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">65,000</div>
              <div className="text-gray-600 text-sm">TPS</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">400ms</div>
              <div className="text-gray-600 text-sm">Finality</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">$0.001</div>
              <div className="text-gray-600 text-sm">Avg Cost</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">100%</div>
              <div className="text-gray-600 text-sm">EVM Compatible</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
