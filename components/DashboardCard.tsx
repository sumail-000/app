'use client'

import Link from 'next/link'

interface DashboardCardProps {
  title: string
  description: string
  href: string
  icon: React.ReactNode
  badge?: string | number
  color?: 'primary' | 'secondary' | 'accent'
}

export default function DashboardCard({ title, description, href, icon, badge, color = 'primary' }: DashboardCardProps) {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30 hover:border-primary/50',
    secondary: 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30 hover:border-blue-500/50',
    accent: 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30 hover:border-purple-500/50',
  }

  return (
    <Link
      href={href}
      className={`block bg-gray-800 rounded-xl p-6 border-2 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/20 group ${colorClasses[color]}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/20 group-hover:bg-primary/30 transition-colors">
          {icon}
        </div>
        {badge && (
          <span className="bg-primary px-3 py-1 rounded-full text-xs font-semibold">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </Link>
  )
}

