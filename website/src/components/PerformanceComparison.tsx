'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

export default function PerformanceComparison() {
  const tpsData = [
    { name: 'Ethereum', value: 15, color: '#627eea' },
    { name: 'BSC', value: 160, color: '#f3ba2f' },
    { name: 'BSSC', value: 65000, color: '#9333ea' }
  ]

  const finalityData = [
    { name: 'Ethereum', value: 900, color: '#627eea' },
    { name: 'BSC', value: 3, color: '#f3ba2f' },
    { name: 'BSSC', value: 0.4, color: '#9333ea' }
  ]

  const costData = [
    { name: 'Ethereum', value: 50, color: '#627eea' },
    { name: 'BSC', value: 0.05, color: '#f3ba2f' },
    { name: 'BSSC', value: 0.001, color: '#9333ea' }
  ]

  const energyData = [
    { name: 'Ethereum', value: 112, color: '#627eea' },
    { name: 'BSC', value: 1.4, color: '#f3ba2f' },
    { name: 'BSSC', value: 0.01, color: '#9333ea' }
  ]

  const comparisonTable = [
    {
      metric: 'Transactions Per Second',
      ethereum: '~15',
      bsc: '~160',
      bssc: '65,000',
      improvement: '4,333x over ETH'
    },
    {
      metric: 'Finality Time',
      ethereum: '15 minutes',
      bsc: '3 seconds',
      bssc: '400ms',
      improvement: '2,250x over ETH'
    },
    {
      metric: 'Transaction Cost',
      ethereum: '$10-100+',
      bsc: '$0.01-0.1',
      bssc: '$0.0001-0.001',
      improvement: '100,000x over ETH'
    },
    {
      metric: 'Energy Consumption',
      ethereum: '112 TWh/year',
      bsc: '1.4 TWh/year',
      bssc: '0.01 TWh/year',
      improvement: '11,200x over ETH'
    }
  ]

  const ChartCard = ({ title, data, formatValue }: { 
    title: string, 
    data: any[], 
    formatValue: (value: number) => string 
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="card"
    >
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={formatValue}
            />
            <Tooltip 
              formatter={(value: number) => [formatValue(value), '']}
              labelStyle={{ color: '#333' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )

  return (
    <section id="performance" className="py-20 bg-gray-50">
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
            Performance Comparison
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            BSSC delivers massive improvements across all key blockchain metrics compared to existing networks.
          </p>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <ChartCard 
            title="Transactions Per Second" 
            data={tpsData}
            formatValue={(value) => value.toLocaleString()}
          />
          <ChartCard 
            title="Finality Time (seconds)" 
            data={finalityData}
            formatValue={(value) => `${value}s`}
          />
          <ChartCard 
            title="Average Transaction Cost ($)" 
            data={costData}
            formatValue={(value) => `$${value}`}
          />
          <ChartCard 
            title="Energy Consumption (TWh/year)" 
            data={energyData}
            formatValue={(value) => value.toFixed(2)}
          />
        </div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">Detailed Performance Metrics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metric
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ethereum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BSC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    BSSC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Improvement
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {comparisonTable.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {row.metric}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.ethereum}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {row.bsc}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold gradient-text">
                      {row.bssc}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">
                      {row.improvement}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">4,333x</div>
            <div className="text-gray-600">Faster than Ethereum</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">100,000x</div>
            <div className="text-gray-600">Cheaper than Ethereum</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold gradient-text mb-2">11,200x</div>
            <div className="text-gray-600">More energy efficient</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
