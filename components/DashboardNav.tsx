'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function DashboardNav() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isPerformer = session?.user.role === 'PERFORMER'

  const performerLinks = [
    { href: '/dashboard/profile', label: 'Profile' },
    { href: '/dashboard/content', label: 'Content' },
    { href: '/dashboard/bookings', label: 'Bookings' },
    { href: '/dashboard/messages', label: 'Messages' },
    { href: '/dashboard/earnings', label: 'Earnings' },
  ]

  const clientLinks = [
    { href: '/profiles', label: 'Browse' },
    { href: '/dashboard/bookings', label: 'Bookings' },
    { href: '/dashboard/messages', label: 'Messages' },
    { href: '/dashboard/favorites', label: 'Favorites' },
  ]

  const links = isPerformer ? performerLinks : clientLinks

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-6">
      <div className="flex flex-wrap gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg transition ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

