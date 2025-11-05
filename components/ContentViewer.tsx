'use client'

import { useState, useEffect } from 'react'
import { Content } from '@prisma/client'
import { useSession } from 'next-auth/react'

interface ContentViewerProps {
  content: Content
  onClose: () => void
  onUpdate?: (updatedContent: Content) => void
}

export default function ContentViewer({ content, onClose, onUpdate }: ContentViewerProps) {
  const { data: session } = useSession()
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [currentContent, setCurrentContent] = useState(content)
  const [isLiked, setIsLiked] = useState(() => {
    if (typeof window !== 'undefined') {
      const likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]')
      return likedContent.includes(content.id)
    }
    return false
  })
  const [liking, setLiking] = useState(false)
  const [viewTracked, setViewTracked] = useState(false)

  const isClient = session?.user.role === 'CLIENT'

  // Sync content when prop changes
  useEffect(() => {
    setCurrentContent(content)
    if (typeof window !== 'undefined') {
      const likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]')
      setIsLiked(likedContent.includes(content.id))
    }
    setViewTracked(false) // Reset view tracking for new content
  }, [content.id])

  // Track view when content is opened (only once)
  useEffect(() => {
    if (isClient && !viewTracked) {
      trackView()
      setViewTracked(true)
    }
  }, [isClient, viewTracked, content.id])

  const trackView = async () => {
    try {
      const res = await fetch(`/api/content/${content.id}/view`, {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        setCurrentContent(prev => ({ ...prev, views: data.content.views }))
        if (onUpdate) {
          onUpdate({ ...currentContent, views: data.content.views })
        }
      }
    } catch (error) {
      console.error('Failed to track view:', error)
    }
  }

  const handleLike = async () => {
    if (!isClient || liking) return

    // Prevent duplicate likes in same session
    if (isLiked) {
      // Already liked, so unlike
      const likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]')
      localStorage.setItem('likedContent', JSON.stringify(likedContent.filter((id: string) => id !== content.id)))
    } else {
      // Check if already liked
      const likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]')
      if (likedContent.includes(content.id)) {
        return // Already liked in this session
      }
    }

    setLiking(true)
    try {
      const method = isLiked ? 'DELETE' : 'POST'
      const res = await fetch(`/api/content/${content.id}/like`, {
        method,
      })

      if (res.ok) {
        const data = await res.json()
        const newLikedState = !isLiked
        
        // Update localStorage
        const likedContent = JSON.parse(localStorage.getItem('likedContent') || '[]')
        if (newLikedState) {
          localStorage.setItem('likedContent', JSON.stringify([...likedContent, content.id]))
        } else {
          localStorage.setItem('likedContent', JSON.stringify(likedContent.filter((id: string) => id !== content.id)))
        }
        
        setCurrentContent(prev => ({ 
          ...prev, 
          likes: data.content.likes 
        }))
        setIsLiked(newLikedState)
        if (onUpdate) {
          onUpdate({ ...currentContent, likes: data.content.likes })
        }
      }
    } catch (error) {
      console.error('Failed to toggle like:', error)
    } finally {
      setLiking(false)
    }
  }

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full max-h-[95vh] flex flex-col bg-gray-900 rounded-xl overflow-hidden border border-gray-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-800/50">
          <div className="flex items-center gap-3">
            {currentContent.isPremium && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium
              </span>
            )}
            <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-semibold text-gray-300">
              Photo
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

            {/* Media Display Area */}
            <div className="flex-1 flex items-center justify-center bg-black/50 overflow-auto min-h-0">
              <div className="w-full h-full flex items-center justify-center p-4">
                {!imageError ? (
                  <>
                    {imageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img
                      src={currentContent.url}
                      alt={currentContent.title || 'Content'}
                      className="max-w-full max-h-[calc(95vh-200px)] object-contain"
                      onLoad={() => setImageLoading(false)}
                      onError={() => {
                        setImageError(true)
                        setImageLoading(false)
                      }}
                      loading="lazy"
                    />
                  </>
                ) : (
                  <div className="text-center p-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-red-400 mb-4 font-semibold">Failed to load image</p>
                    <a
                      href={currentContent.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-2"
                    >
                      <span>Open in new tab</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </div>

        {/* Info Section - Always Visible */}
        <div className="border-t border-gray-800 bg-gray-800/30">
          <div className="p-6">
            {/* Title */}
            {currentContent.title && (
              <h3 className="text-2xl font-bold mb-3 text-white">{currentContent.title}</h3>
            )}

            {/* Description */}
            {currentContent.description && (
              <p className="text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap">{currentContent.description}</p>
            )}

            {/* Stats and Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="font-semibold">{currentContent.views}</span>
                  <span className="text-xs">views</span>
                </div>
                <button
                  onClick={handleLike}
                  disabled={!isClient || liking}
                  className={`flex items-center gap-2 transition-all ${
                    isClient 
                      ? isLiked 
                        ? 'text-red-400 hover:text-red-300' 
                        : 'text-gray-400 hover:text-red-400'
                      : 'text-gray-500 cursor-not-allowed'
                  } ${liking ? 'opacity-50' : ''}`}
                >
                  <svg 
                    className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`}
                    fill={isLiked ? 'currentColor' : 'none'} 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="font-semibold">{currentContent.likes}</span>
                  <span className="text-xs">likes</span>
                </button>
                {currentContent.isPremium && currentContent.price && (
                  <div className="flex items-center gap-2 text-yellow-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-bold">${currentContent.price}</span>
                  </div>
                )}
              </div>

              {/* External Link */}
              <a
                href={currentContent.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Original
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
