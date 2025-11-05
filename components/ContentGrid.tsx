'use client'

import { useState } from 'react'
import { Content } from '@prisma/client'
import ContentViewer from './ContentViewer'

interface ContentGridProps {
  content: Content[]
}

export default function ContentGrid({ content: initialContent }: ContentGridProps) {
  const [viewingContent, setViewingContent] = useState<Content | null>(null)
  const [content, setContent] = useState<Content[]>(initialContent)

  const handleContentUpdate = (updatedContent: Content) => {
    setContent(prev => 
      prev.map(item => 
        item.id === updatedContent.id ? updatedContent : item
      )
    )
    if (viewingContent && viewingContent.id === updatedContent.id) {
      setViewingContent(updatedContent)
    }
  }

  return (
    <>
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
        {content.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition group"
            onClick={() => setViewingContent(item)}
          >
            <div className="relative aspect-square bg-gray-900">
              {item.thumbnail || item.url ? (
                <img
                  src={item.thumbnail || item.url}
                  alt={item.title || 'Content'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    if (item.url && target.src !== item.url) {
                      target.src = item.url
                    }
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              {item.isPremium && (
                <div className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded text-xs font-semibold">
                  Premium
                </div>
              )}
            </div>
            <div className="p-4">
              {item.title && (
                <h3 className="font-semibold mb-1">{item.title}</h3>
              )}
              <div className="flex justify-between text-sm text-gray-400">
                <span>{item.views} views</span>
                <span>{item.likes} likes</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {viewingContent && (
        <ContentViewer
          content={viewingContent}
          onClose={() => setViewingContent(null)}
          onUpdate={handleContentUpdate}
        />
      )}
    </>
  )
}

