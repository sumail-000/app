'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { extractImageUrl, isValidImageUrl } from '@/lib/url-helpers'
import SafeImage from './SafeImage'

interface AvatarUploadProps {
  currentImage?: string | null
  onUpdate?: () => void
}

export default function AvatarUpload({ currentImage, onUpdate }: AvatarUploadProps) {
  const { data: session, update } = useSession()
  const [imageUrl, setImageUrl] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setWarning('')
    setLoading(true)

    try {
      // Extract actual image URL if it's a Google Images URL (silently)
      const extractedUrl = extractImageUrl(imageUrl)

      // Validate URL (more lenient - handles Google Images URLs)
      if (!isValidImageUrl(extractedUrl)) {
        setError('Please enter a valid image URL. If using Google Images, we\'ll extract it automatically.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/user/image', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: extractedUrl }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update image')
      }

      // Update session
      await update()
      
      setImageUrl('')
      setShowInput(false)
      if (onUpdate) onUpdate()
    } catch (err: any) {
      setError(err.message || 'Failed to update image')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden border-2 border-gray-600">
            {currentImage ? (
              <SafeImage
                src={currentImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={() => setShowInput(!showInput)}
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 text-sm font-semibold"
          >
            {showInput ? 'Cancel' : 'Change Avatar'}
          </button>
        </div>
      </div>

      {showInput && (
        <form onSubmit={handleSubmit} className="space-y-3 bg-gray-800 p-4 rounded-lg">
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}
          {warning && (
            <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-2 rounded text-sm">
              {warning}
            </div>
          )}
          <div>
            <label className="block text-gray-300 mb-2 text-sm">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value)
                setError('')
                setWarning('')
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste a direct image URL. Google Images links are automatically converted.
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
          >
            {loading ? 'Updating...' : 'Update Avatar'}
          </button>
        </form>
      )}
    </div>
  )
}

