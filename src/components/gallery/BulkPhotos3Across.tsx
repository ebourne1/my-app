'use client'

import { useState } from 'react'
import Masonry from '@mui/lab/Masonry'
import PhotoCard from './PhotoCard'
import PhotoModal from './PhotoModal'
import type { Media } from '@/payload-types'

interface BulkPhotos3AcrossProps {
  block: {
    blockType: 'photoBulk3Across'
    items?: Array<{
      blockType: 'gridPhoto' | 'gridPhotoBulk'
      id?: string
      // Single photo fields
      image?: Media | string
      caption?: string
      // Bulk photos field
      images?: (Media | string)[]
      // Shared photo metadata
      isFilmPhoto?: boolean
      filmType?: string
      filmStock?: string
      blackAndWhite?: boolean
      applyFilmBorder?: boolean
      filmBorderNumber?: string
    }>
  }
}

/**
 * BulkPhotos3Across Component (Phase 1)
 *
 * 3-column grid (section-break layout)
 * - 3 columns desktop (≥768px), 1 column mobile
 * - All items in single array for easy reordering
 * - Supports individual photos and bulk photo uploads
 * - Height-based masonry balancing
 * - Photo lightbox/modal
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

  // Flatten all items into individual photos
  const photos: Array<{
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
    blackAndWhite?: boolean
    applyFilmBorder?: boolean
    filmBorderNumber?: string
    id: string
  }> = []

  block.items?.forEach((item, itemIndex) => {
    if (item.blockType === 'gridPhoto') {
      // Single photo
      const image = typeof item.image === 'string' ? null : item.image
      if (image) {
        photos.push({
          image,
          caption: item.caption,
          isFilmPhoto: item.isFilmPhoto,
          filmType: item.filmType,
          filmStock: item.filmStock,
          blackAndWhite: item.blackAndWhite,
          applyFilmBorder: item.applyFilmBorder,
          filmBorderNumber: item.filmBorderNumber,
          id: item.id || `photo-${itemIndex}`,
        })
      }
    } else if (item.blockType === 'gridPhotoBulk' && item.images) {
      // Bulk photos - flatten into individual photos
      item.images.forEach((img, imgIndex) => {
        const image = typeof img === 'string' ? null : img
        if (image) {
          photos.push({
            image,
            caption: undefined, // Bulk photos don't have individual captions
            isFilmPhoto: item.isFilmPhoto,
            filmType: item.filmType,
            filmStock: item.filmStock,
            blackAndWhite: item.blackAndWhite,
            applyFilmBorder: item.applyFilmBorder,
            filmBorderNumber: item.filmBorderNumber,
            id: `${item.id || `bulk-${itemIndex}`}-${imgIndex}`,
          })
        }
      })
    }
  })

  if (photos.length === 0) {
    return (
      <div className="bulk-photos-3-across-empty">
        <p>No photos added yet. Add items in the admin panel.</p>
      </div>
    )
  }

  return (
    <>
      <div className="bulk-photos-3-across">
        <Masonry
          columns={{ xs: 1, sm: 1, md: 3 }}
          spacing={{ xs: 1.5, sm: 1.5, md: 1.5 }}
          className="masonry-grid-3-column"
        >
          {photos.map((photo, index) => (
            <PhotoCard
              key={photo.id}
              block={{
                blockType: 'photo',
                image: photo.image,
                caption: photo.caption,
                isFilmPhoto: photo.isFilmPhoto,
                filmType: photo.filmType,
                filmStock: photo.filmStock,
                blackAndWhite: photo.blackAndWhite,
                applyFilmBorder: photo.applyFilmBorder,
                filmBorderNumber: photo.filmBorderNumber,
              }}
              priority={index < 3} // First 3 photos get priority loading
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
