'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photo: {
    image: Media
    caption?: string
  } | null
}

/**
 * PhotoModal Component
 *
 * Full-screen lightbox for displaying photos in a larger view.
 * Features:
 * - Dark backdrop overlay
 * - Large centered image
 * - Caption display below image
 * - Close via X button, ESC key, or backdrop click
 * - Smooth fade-in/out animations
 * - Body scroll lock when open
 */
export default function PhotoModal({ isOpen, onClose, photo }: PhotoModalProps) {
  // ESC key handler
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen || !photo) return null

  const { image, caption } = photo
  const imageUrl = image.url
  const width = image.width || 1200
  const height = image.height || 800
  const alt = image.alt || 'Gallery photo'

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close button */}
        <button className="photo-modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Image */}
        <div className="photo-modal-image-wrapper">
          <Image
            src={imageUrl}
            alt={alt}
            width={width}
            height={height}
            className="photo-modal-image"
            quality={95}
            priority
          />
        </div>

        {/* Caption */}
        {caption && (
          <div className="photo-modal-caption">
            <p>{caption}</p>
          </div>
        )}
      </div>
    </div>
  )
}
