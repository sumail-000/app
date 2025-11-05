'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FavoriteButtonProps {
  profileId: string
  isFavorited: boolean
}

export default function FavoriteButton({ profileId, isFavorited: initialFavorited }: FavoriteButtonProps) {
  const router = useRouter()
  const [isFavorited, setIsFavorited] = useState(initialFavorited)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/favorites', {
        method: isFavorited ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId }),
      })

      if (res.ok) {
        setIsFavorited(!isFavorited)
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`px-4 py-2 rounded-lg font-semibold transition ${
        isFavorited
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-gray-700 hover:bg-gray-600'
      } disabled:opacity-50`}
    >
      {isFavorited ? '❤️ Favorited' : '🤍 Favorite'}
    </button>
  )
}

