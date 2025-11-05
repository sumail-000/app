'use client'

import { useState } from 'react'

interface SafeImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
  fill?: boolean
}

export default function SafeImage({ src, alt, className, fallbackSrc, fill }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    } else {
      setHasError(true)
    }
  }

  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-gray-900 text-gray-600 ${className || ''}`}>
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const imageClasses = fill 
    ? `${className || ''} absolute inset-0 w-full h-full`
    : className || ''

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={imageClasses}
      onError={handleError}
    />
  )
}

