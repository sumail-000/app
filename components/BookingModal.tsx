'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Profile } from '@prisma/client'

interface BookingModalProps {
  performerId: string
  profile: Profile
  onClose: () => void
}

export default function BookingModal({ performerId, profile, onClose }: BookingModalProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    time: '',
    duration: 60,
    notes: '',
  })
  
  const services = profile.services ? (typeof profile.services === 'string' ? JSON.parse(profile.services) : profile.services) : []
  const rates = profile.rates ? (typeof profile.rates === 'string' ? JSON.parse(profile.rates) : profile.rates) : {}
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]
  
  // Get tomorrow's date for default
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  // Initialize with first service if available
  useEffect(() => {
    if (services.length > 0 && !formData.type) {
      setFormData(prev => ({ ...prev, type: services[0] }))
    } else if (services.length === 0) {
      setFormData(prev => ({ ...prev, type: 'virtual' }))
    }
  }, [services])

  // Calculate current rate based on selected service type
  const getCurrentRate = () => {
    if (!formData.type) return 100
    
    // Try multiple key formats
    const normalizedType = formData.type.toLowerCase().replace(/\s+/g, '')
    const rateKeys = [
      normalizedType,
      formData.type.toLowerCase(),
      formData.type,
      normalizedType.replace('shows', 'show'),
      normalizedType.replace('sessions', 'session'),
    ]
    
    for (const key of rateKeys) {
      if (rates[key]) {
        return rates[key]
      }
    }
    
    // Try matching partial keys
    for (const [key, value] of Object.entries(rates)) {
      if (normalizedType.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedType)) {
        return value as number
      }
    }
    
    return 100 // Default rate
  }

  const totalAmount = ((formData.duration / 60) * getCurrentRate()).toFixed(2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!formData.date || !formData.time) {
      setError('Please select both date and time')
      return
    }

    const selectedDateTime = new Date(`${formData.date}T${formData.time}`)
    const now = new Date()
    
    if (selectedDateTime <= now) {
      setError('Please select a future date and time')
      return
    }

    setLoading(true)

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`)
      const rate = getCurrentRate()

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performerId,
          type: formData.type,
          date: dateTime.toISOString(),
          duration: formData.duration,
          rate,
          notes: formData.notes || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create booking')
      }

      router.push('/dashboard/bookings')
      router.refresh()
      onClose()
    } catch (error: any) {
      setError(error.message || 'Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  // Format service name for display
  const formatServiceName = (service: string) => {
    return service
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-2xl max-w-lg w-full border border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Book Session</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Service Type */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Service Type</label>
              {services.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {services.map((service: string) => {
                    const normalizedService = service.toLowerCase().replace(/\s+/g, '')
                    const serviceRate = rates[normalizedService] || rates[service] || getCurrentRate()
                    const isSelected = formData.type === service
                    
                    return (
                      <button
                        key={service}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: service })}
                        className={`p-3 rounded-lg border-2 transition-all text-left ${
                          isSelected
                            ? 'border-primary bg-primary/20 text-white'
                            : 'border-gray-700 bg-gray-700/50 text-gray-300 hover:border-gray-600'
                        }`}
                      >
                        <div className="font-semibold mb-1">{formatServiceName(service)}</div>
                        <div className="text-sm text-gray-400">${serviceRate}/hr</div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="virtual">Virtual Session</option>
                  <option value="private">Private Show</option>
                  <option value="in-person">In-Person</option>
                </select>
              )}
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Date</label>
                <input
                  type="date"
                  value={formData.date || tomorrowStr}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  min={today}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                {formData.date && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(formData.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-gray-300 mb-2 font-medium">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
                {formData.time && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(`2000-01-01T${formData.time}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Duration</label>
              <div className="flex gap-2 mb-3">
                {[15, 30, 60, 90, 120].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setFormData({ ...formData, duration: dur })}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                      formData.duration === dur
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {dur}m
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                min={15}
                step={15}
                max={480}
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300 text-sm">Rate</p>
                  <p className="text-xl font-bold">${getCurrentRate()}/hr</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-300 text-sm">Total</p>
                  <p className="text-2xl font-bold text-primary">${totalAmount}</p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-gray-300 mb-2 font-medium">Special Requests (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Any special requests or notes for the performer..."
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-gray-700 rounded-lg hover:bg-gray-600 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.date || !formData.time}
                className="flex-1 py-3 bg-gradient-to-r from-primary to-purple-600 rounded-lg hover:from-primary/90 hover:to-purple-600/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-primary/30"
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

