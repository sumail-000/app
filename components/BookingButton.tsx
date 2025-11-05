'use client'

import { useState } from 'react'
import { Profile } from '@prisma/client'
import BookingModal from './BookingModal'

interface BookingButtonProps {
  performerId: string
  profile: Profile
}

export default function BookingButton({ performerId, profile }: BookingButtonProps) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-3 bg-gradient-to-r from-primary to-purple-600 rounded-lg font-semibold hover:from-primary/90 hover:to-purple-600/90 transition-all shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
      >
        Book Session
      </button>

      {showModal && (
        <BookingModal
          performerId={performerId}
          profile={profile}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

