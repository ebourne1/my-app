'use client'

import { useState } from 'react'
import Masonry from '@mui/lab/Masonry'
import PhotoCard from './PhotoCard'
import PhotoModal from './PhotoModal'
import type { Media } from '@/payload-types'

interface BulkPhotos3AcrossProps {
  block: {
    blockType: 'photoBulk3Across'
    images: Media[]
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
    blackAndWhite?: boolean
  }
}

/**
 * BulkPhotos3Across Component
 *
 * Renders a full-width section with 3-column masonry grid on desktop (1 column on mobile).
 * Creates a clean section break from the default 2-column grid.
 *
 * Key Features:
 * - 3 columns on desktop (≥768px)
 * - 1 column on mobile (<768px)
 * - Height-based column balancing (items placed in shortest column)
 * - Photo lightbox/modal support
 * - Full-width section with section break behavior
 */
export default function BulkPhotos3Across({ block }: BulkPhotos3AcrossProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<{
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
  } | null>(null)

  const handlePhotoClick = (photo: {
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
  }) => {
    // Disable modal on mobile screens (< 768px)
    if (window.innerWidth < 768) {
      return
    }
    setSelectedPhoto(photo)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
  }

  // Flatten images into individual photo items with shared metadata
  const photoItems = block.images.map((image, idx) => ({
    blockType: 'photo',
    image: image,
    id: `${block.blockType}-${idx}`,
    isFilmPhoto: block.isFilmPhoto,
    filmType: block.filmType,
    filmStock: block.filmStock,
    blackAndWhite: block.blackAndWhite,
  }))

  return (
    <>
      <div className="bulk-photos-3-across">
        <Masonry
          columns={{ xs: 1, sm: 1, md: 3 }}
          spacing={{ xs: 1.5, sm: 1.5, md: 1.5 }}
          className="masonry-grid-3-across"
        >
          {photoItems.map((item, index) => (
            <PhotoCard
              key={item.id}
              block={item}
              priority={index < 6} // Priority loading for first 6 items
              onPhotoClick={handlePhotoClick}
            />
          ))}
        </Masonry>
      </div>

      {/* Photo Modal */}
      <PhotoModal isOpen={!!selectedPhoto} onClose={handleCloseModal} photo={selectedPhoto} />
    </>
  )
}
