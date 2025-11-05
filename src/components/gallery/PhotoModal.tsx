'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import { getCloudinaryUrl } from '@/lib/cloudinary'

interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photo: {
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
    applyFilmBorder?: boolean
    filmBorderNumber?: string
    blackAndWhite?: boolean
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

  const { image, caption, isFilmPhoto, filmType, filmStock, applyFilmBorder, filmBorderNumber, blackAndWhite } = photo
  const width = image.width || 1200
  const height = image.height || 800
  const alt = image.alt || 'Gallery photo'

  // Generate Cloudinary URL with higher quality for modal
  // Use actual image dimensions to ensure correct border orientation
  const imageUrl = getCloudinaryUrl({
    imageUrl: image.url || '',
    width, // Use actual image width for correct orientation detection
    height, // Use actual image height for correct orientation detection
    applyFilmBorder,
    filmBorderNumber,
    isBlackAndWhite: blackAndWhite,
    quality: 95, // Higher quality for modal
  })

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

        {/* Caption and metadata */}
        {(caption || isFilmPhoto) && (
          <div className="photo-modal-caption">
            {/* Film metadata */}
            {isFilmPhoto && (
              <div className="film-metadata">
                <div className="film-header">
                  <svg className="vintage-camera-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="8" width="20" height="12" rx="2" />
                    <circle cx="12" cy="14" r="3" />
                    <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
                    <circle cx="17" cy="11" r="0.5" fill="currentColor" />
                  </svg>
                  <span className="film-label">Film Photograph</span>
                </div>
                {(filmType || filmStock) && (
                  <div className="film-details">
                    {filmType && <span className="film-type">{filmType}</span>}
                    {filmStock && <span className="film-stock">{filmStock}</span>}
                  </div>
                )}
              </div>
            )}

            {/* Caption */}
            {caption && <p className="caption-text">{caption}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
