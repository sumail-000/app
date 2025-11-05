'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Content } from '@prisma/client'
import ContentViewer from './ContentViewer'
import { extractImageUrl, isValidImageUrl } from '@/lib/url-helpers'

interface ContentManagerProps {
  profileId: string
  content: Content[]
}

export default function ContentManager({ profileId, content: initialContent }: ContentManagerProps) {
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [showUpload, setShowUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [viewingContent, setViewingContent] = useState<Content | null>(null)
  const [formData, setFormData] = useState({
    url: '',
    thumbnail: '',
    title: '',
    description: '',
    isPremium: false,
    price: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Extract actual image URL if it's a Google Images URL
      let extractedUrl = extractImageUrl(formData.url)
      const extractedThumbnail = formData.thumbnail ? extractImageUrl(formData.thumbnail) : ''
      
      // If extraction returned the original URL and it's still a Google Images URL, extraction failed
      // But we should still try to validate it - maybe it's valid as-is
      if (extractedUrl === formData.url && formData.url.includes('google.com/imgres')) {
        // Extraction didn't work, but let's try validating the original URL anyway
        // The validation function will handle it
      }
      
      // Validate image URL - pass the original URL so validation can extract if needed
      if (!isValidImageUrl(formData.url)) {
        alert('Please enter a valid image URL.')
        setLoading(false)
        return
      }
      
      // Make sure we use the extracted URL (extract again in case validation extracted it differently)
      extractedUrl = extractImageUrl(formData.url)

      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId,
          type: 'photo',
          url: extractedUrl,
          thumbnail: extractedThumbnail || null,
          title: formData.title || null,
          description: formData.description || null,
          isPremium: formData.isPremium,
          price: formData.isPremium && formData.price ? parseFloat(formData.price) : null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to upload content')
      }

      const newContent = await res.json()
      setContent([newContent.content, ...content])
      setShowUpload(false)
      setFormData({
        url: '',
        thumbnail: '',
        title: '',
        description: '',
        isPremium: false,
        price: '',
      })
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to upload content')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return

    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setContent(content.filter((item) => item.id !== id))
        router.refresh()
      }
    } catch (error) {
      alert('Failed to delete content')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Your Content</h2>
        <button
          onClick={() => setShowUpload(true)}
          className="px-6 py-3 bg-primary rounded-lg hover:bg-primary/80 font-semibold"
        >
          + Add Content
        </button>
      </div>

      {showUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Upload Content</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-2">Image URL</label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => {
                    const inputUrl = e.target.value
                    // Auto-extract if it's a Google Images URL
                    if (inputUrl.includes('google.com/imgres') || inputUrl.includes('google.com/search')) {
                      const extracted = extractImageUrl(inputUrl)
                      if (extracted !== inputUrl && !extracted.includes('google.com')) {
                        // Show extracted URL in the input
                        setFormData({ ...formData, url: extracted })
                      } else {
                        setFormData({ ...formData, url: inputUrl })
                      }
                    } else {
                      setFormData({ ...formData, url: inputUrl })
                    }
                  }}
                  onBlur={(e) => {
                    // Final extraction on blur
                    const inputUrl = e.target.value
                    if (inputUrl.includes('google.com/imgres') || inputUrl.includes('google.com/search')) {
                      const extracted = extractImageUrl(inputUrl)
                      if (extracted !== inputUrl && !extracted.includes('google.com')) {
                        setFormData({ ...formData, url: extracted })
                      }
                    }
                  }}
                  placeholder="https://... (paste Google Images URL or direct image URL)"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                <p className="text-gray-400 text-sm mt-1">
                  Paste any image URL. Google Images links are automatically extracted.
                </p>
                {formData.url && (formData.url.includes('google.com/imgres') || formData.url.includes('google.com/search')) && (
                  <p className="text-yellow-400 text-sm mt-1 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Detected Google Images link - extracting image URL...
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Thumbnail URL (optional)</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPremium" className="text-gray-300">Premium Content</label>
              </div>

              {formData.isPremium && (
                <div>
                  <label className="block text-gray-300 mb-2">Price (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg"
                    required={formData.isPremium}
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {content.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-400 mb-4">No content yet.</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-6 py-3 bg-primary rounded-lg hover:bg-primary/80"
          >
            Upload Your First Content
          </button>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <div key={item.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-750 transition">
                <div 
                  className="relative aspect-square bg-gray-900 cursor-pointer"
                  onClick={() => setViewingContent(item)}
                >
                  {item.thumbnail || item.url ? (
                    <img
                      src={item.thumbnail || item.url}
                      alt={item.title || 'Content'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = item.url || '/placeholder.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {item.isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded text-xs font-semibold">
                      Premium ${item.price}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition flex items-center justify-center">
                    <svg className="w-12 h-12 text-white opacity-0 hover:opacity-100 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  {item.title && <h3 className="font-semibold mb-2">{item.title}</h3>}
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span className="capitalize">{item.type}</span>
                    <span>{item.views} views</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setViewingContent(item)}
                      className="flex-1 text-center px-3 py-2 bg-primary rounded hover:bg-primary/80 text-sm font-semibold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 bg-red-600 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {viewingContent && (
            <ContentViewer
              content={viewingContent}
              onClose={() => setViewingContent(null)}
              onUpdate={(updatedContent) => {
                setContent(prev => 
                  prev.map(item => 
                    item.id === updatedContent.id ? updatedContent : item
                  )
                )
                setViewingContent(updatedContent)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}

