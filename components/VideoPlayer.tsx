'use client'

import { useState, useEffect } from 'react'
import { parseVideoUrl, VideoInfo } from '@/lib/video-helpers'

interface VideoPlayerProps {
  url: string
  className?: string
}

export default function VideoPlayer({ url, className = '' }: VideoPlayerProps) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (url) {
      const info = parseVideoUrl(url)
      setVideoInfo(info)
      setError(false)
      setLoading(false)
    }
  }, [url])

  if (!videoInfo || videoInfo.type === 'unknown') {
    return (
      <div className={`flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg ${className}`}>
        <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <p className="text-gray-400 mb-4">Unable to load video</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition text-sm font-semibold"
        >
          Open in New Tab
        </a>
      </div>
    )
  }

  // YouTube Embed
  if (videoInfo.type === 'youtube' && videoInfo.embedUrl) {
    return (
      <div className={`relative w-full ${className}`} style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={videoInfo.embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )
  }

  // Vimeo Embed
  if (videoInfo.type === 'vimeo' && videoInfo.embedUrl) {
    return (
      <div className={`relative w-full ${className}`} style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={videoInfo.embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setLoading(false)}
          onError={() => setError(true)}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    )
  }

  // Direct Video URL
  if (videoInfo.type === 'direct' && videoInfo.directUrl) {
    return (
      <div className={`relative w-full ${className}`}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg z-10">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {error ? (
          <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg min-h-[400px]">
            <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <p className="text-red-400 mb-2 font-semibold">Failed to load video</p>
            <p className="text-gray-400 text-sm mb-4 text-center max-w-md">
              The video may be blocked by CORS, require authentication, or the URL is invalid. Try opening it directly.
            </p>
            <a
              href={videoInfo.directUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition text-sm font-semibold"
            >
              Open in New Tab
            </a>
          </div>
        ) : (
          <video
            src={videoInfo.directUrl}
            controls
            preload="metadata"
            playsInline
            className="w-full max-h-[calc(95vh-200px)] rounded-lg"
            onLoadedData={() => setLoading(false)}
            onLoadedMetadata={() => setLoading(false)}
            onCanPlay={() => setLoading(false)}
            onError={(e) => {
              console.error('Video error:', e)
              setError(true)
              setLoading(false)
            }}
            onLoadStart={() => setLoading(true)}
          >
            <source src={videoInfo.directUrl} type="video/mp4" />
            <source src={videoInfo.directUrl} type="video/webm" />
            <source src={videoInfo.directUrl} type="video/ogg" />
            Your browser does not support the video tag.
            <br />
            <a href={videoInfo.directUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline">
              Download video
            </a>
          </video>
        )}
      </div>
    )
  }

  // Fallback
  return (
    <div className={`flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg ${className}`}>
      <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
      <p className="text-gray-400 mb-4">Video format not supported</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-primary rounded-lg hover:bg-primary/80 transition text-sm font-semibold"
      >
        Open in New Tab
      </a>
    </div>
  )
}

