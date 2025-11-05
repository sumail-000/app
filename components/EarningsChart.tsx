'use client'

import { useMemo } from 'react'

interface Payment {
  id: string
  amount: number
  status: string
  createdAt: string | Date
}

interface EarningsChartProps {
  payments: Payment[]
}

export default function EarningsChart({ payments }: EarningsChartProps) {
  // Group payments by month
  const monthlyData = useMemo(() => {
    const grouped: { [key: string]: number } = {}
    
    payments
      .filter(p => p.status === 'completed')
      .forEach(payment => {
        const date = new Date(payment.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        grouped[monthKey] = (grouped[monthKey] || 0) + payment.amount
      })

    // Get last 6 months
    const months: string[] = []
    const labels: string[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      months.push(monthKey)
      labels.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))
    }

    return {
      labels,
      values: months.map(month => grouped[month] || 0),
    }
  }, [payments])

  const maxValue = Math.max(...monthlyData.values, 1)

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-6">Earnings Over Time</h3>
      <div className="space-y-4">
        {monthlyData.labels.map((label, index) => {
          const value = monthlyData.values[index]
          const percentage = (value / maxValue) * 100
          
          return (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">{label}</span>
                <span className="text-green-400 font-semibold">${value.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

