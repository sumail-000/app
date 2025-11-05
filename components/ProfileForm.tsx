'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@prisma/client'

interface ProfileFormProps {
  profile: Profile | null
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    bio: profile?.bio || '',
    location: profile?.location || '',
    age: profile?.age || '',
    height: profile?.height || '',
    measurements: profile?.measurements || '',
    services: profile?.services ? (typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services) : [],
    rates: profile?.rates ? (typeof profile.rates === 'string' ? JSON.parse(profile.rates) : profile.rates) : { privateShow: '', virtual: '', photoSet: '' },
  })

  const serviceOptions = ['Private Shows', 'Virtual Sessions', 'Photo Sets', 'Video Calls', 'Custom Content']

  const handleServiceToggle = (service: string) => {
    const formatted = service.toLowerCase().replace(/\s+/g, '')
    const current = formData.services || []
    if (current.includes(formatted)) {
      setFormData({
        ...formData,
        services: current.filter((s: string) => s !== formatted),
      })
    } else {
      setFormData({
        ...formData,
        services: [...current, formatted],
      })
    }
  }

  const handleRateChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      rates: {
        ...formData.rates,
        [key]: value,
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      router.refresh()
      alert('Profile updated successfully!')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg">
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-gray-300 mb-2">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2">Location</label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Age</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || '' })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2">Height</label>
          <input
            type="text"
            placeholder="5'6"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Measurements</label>
          <input
            type="text"
            placeholder="34-24-36"
            value={formData.measurements}
            onChange={(e) => setFormData({ ...formData, measurements: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-gray-300 mb-2">Services Offered</label>
        <div className="flex flex-wrap gap-2">
          {serviceOptions.map((service) => {
            const formatted = service.toLowerCase().replace(/\s+/g, '')
            const isSelected = formData.services?.includes(formatted)
            return (
              <button
                key={service}
                type="button"
                onClick={() => handleServiceToggle(service)}
                className={`px-4 py-2 rounded-lg ${
                  isSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {service}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-gray-300 mb-4">Rates (USD)</label>
        <div className="space-y-3">
          {formData.services?.includes('privateshows') && (
            <div>
              <label className="text-gray-400 text-sm">Private Shows</label>
              <input
                type="number"
                value={(formData.rates as any).privateShow || ''}
                onChange={(e) => handleRateChange('privateShow', e.target.value)}
                placeholder="200"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          {formData.services?.includes('virtualsessions') && (
            <div>
              <label className="text-gray-400 text-sm">Virtual Sessions</label>
              <input
                type="number"
                value={(formData.rates as any).virtual || ''}
                onChange={(e) => handleRateChange('virtual', e.target.value)}
                placeholder="100"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
          {formData.services?.includes('photosets') && (
            <div>
              <label className="text-gray-400 text-sm">Photo Sets</label>
              <input
                type="number"
                value={(formData.rates as any).photoSet || ''}
                onChange={(e) => handleRateChange('photoSet', e.target.value)}
                placeholder="50"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-primary rounded-lg font-semibold hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : 'Save Profile'}
      </button>
    </form>
  )
}

