'use client'

import { signOut } from 'next-auth/react'

interface SignOutButtonProps {
  className?: string
  children?: React.ReactNode
}

export default function SignOutButton({ className, children }: SignOutButtonProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <button
      onClick={handleSignOut}
      className={className || 'px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 transition text-sm font-semibold'}
    >
      {children || 'Sign Out'}
    </button>
  )
}

