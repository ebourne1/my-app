'use client'

import { useState } from 'react'
import Masonry from '@mui/lab/Masonry'
import PhotoModal from './PhotoModal'
import type { Media } from '@/payload-types'

interface BulkPhotos3AcrossProps {
  block: {
    blockType: 'photoBulk3Across'
    // Individual items array
    items?: Array<{
      blockType: 'gridPhoto' | 'gridTextCard'
      id?: string
      // Photo fields
      image?: Media | string
      caption?: string
      isFilmPhoto?: boolean
      filmType?: string
      filmStock?: string
      blackAndWhite?: boolean
      applyFilmBorder?: boolean
      filmBorderNumber?: string
      // Text card fields
      content?: any
      fontFamily?: string
      fontSize?: string
      textAlign?: string
      backgroundType?: string
      backgroundColor?: string
    }>
    // Bulk upload array
    images?: (Media | string)[]
    // Shared metadata for bulk uploads
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
    blackAndWhite?: boolean
    applyFilmBorder?: boolean
    filmBorderNumber?: string
  }
}

/**
 * BulkPhotos3Across Component
 *
 * Phase 1: Basic 3-column grid (section-break layout)
 * - 3 columns on desktop (≥768px), 1 column on mobile
 * - Supports bulk photo upload (images array with shared metadata)
 * - Supports individual items (items array for mixing photos + text cards)
 * - Text cards flow naturally with height-based balancing
 * - Photo lightbox/modal for clicking photos to view larger
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

  // Combine items and bulk upload arrays
  let gridItems: any[] = []

  // Add individual items if they exist
  if (block.items && block.items.length > 0) {
    gridItems = [...block.items]
  }

  // Add bulk uploaded photos if they exist
  if (block.images && block.images.length > 0) {
    const bulkPhotos = block.images.map((image, idx) => ({
      blockType: 'gridPhoto',
      image,
      id: `bulk-${idx}`,
      // Apply shared metadata from block level
      isFilmPhoto: block.isFilmPhoto,
      filmType: block.filmType,
      filmStock: block.filmStock,
      blackAndWhite: block.blackAndWhite,
      applyFilmBorder: block.applyFilmBorder,
      filmBorderNumber: block.filmBorderNumber,
    }))
    gridItems = [...gridItems, ...bulkPhotos]
  }

  if (gridItems.length === 0) {
    return (
      <div className="bulk-photos-3-across-empty">
        <p>No photos or items added yet. Add items or upload photos in the admin panel.</p>
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
          {gridItems.map((item, index) => {
            const key = item.id || `item-${index}`

            // Render photo
            if (item.blockType === 'gridPhoto') {
              const image = typeof item.image === 'string' ? null : item.image
              if (!image) return null

              // Import PhotoCard dynamically to render
              return (
                <PhotoCardWrapper
                  key={key}
                  image={image}
                  caption={item.caption}
                  isFilmPhoto={item.isFilmPhoto}
                  filmType={item.filmType}
                  filmStock={item.filmStock}
                  blackAndWhite={item.blackAndWhite}
                  applyFilmBorder={item.applyFilmBorder}
                  filmBorderNumber={item.filmBorderNumber}
                  priority={index < 3} // First 3 items get priority loading
                  onPhotoClick={handlePhotoClick}
                />
              )
            }

            // Render text card
            if (item.blockType === 'gridTextCard') {
              return (
                <TextCardWrapper
                  key={key}
                  content={item.content}
                  fontFamily={item.fontFamily}
                  fontSize={item.fontSize}
                  textAlign={item.textAlign}
                  backgroundType={item.backgroundType}
                  backgroundColor={item.backgroundColor}
                />
              )
            }

            return null
          })}
        </Masonry>
      </div>

      {/* Photo Modal */}
      <PhotoModal isOpen={!!selectedPhoto} onClose={handleCloseModal} photo={selectedPhoto} />
    </>
  )
}

/**
 * PhotoCardWrapper - Wrapper to render individual photo in 3-column grid
 * Uses same PhotoCard component as 2-column masonry
 */
function PhotoCardWrapper({
  image,
  caption,
  isFilmPhoto,
  filmType,
  filmStock,
  blackAndWhite,
  applyFilmBorder,
  filmBorderNumber,
  priority,
  onPhotoClick,
}: {
  image: Media
  caption?: string
  isFilmPhoto?: boolean
  filmType?: string
  filmStock?: string
  blackAndWhite?: boolean
  applyFilmBorder?: boolean
  filmBorderNumber?: string
  priority: boolean
  onPhotoClick: (photo: any) => void
}) {
  // Import PhotoCard component
  const PhotoCard = require('./PhotoCard').default

  return (
    <PhotoCard
      block={{
        blockType: 'photo',
        image,
        caption,
        isFilmPhoto,
        filmType,
        filmStock,
        blackAndWhite,
        applyFilmBorder,
        filmBorderNumber,
      }}
      priority={priority}
      onPhotoClick={onPhotoClick}
    />
  )
}

/**
 * TextCardWrapper - Wrapper to render text card in 3-column grid
 * Uses same TextCardSmall component as 2-column masonry
 */
function TextCardWrapper({
  content,
  fontFamily,
  fontSize,
  textAlign,
  backgroundType,
  backgroundColor,
}: {
  content: any
  fontFamily?: string
  fontSize?: string
  textAlign?: string
  backgroundType?: string
  backgroundColor?: string
}) {
  // Import TextCardSmall component
  const TextCardSmall = require('./TextCardSmall').default

  return (
    <TextCardSmall
      block={{
        blockType: 'textCardSmall',
        content,
        fontFamily: fontFamily as any,
        fontSize: fontSize as any,
        textAlign: textAlign as any,
        backgroundType: backgroundType as any,
        backgroundColor: backgroundColor as any,
      }}
      isFirstInMasonry={false}
    />
  )
}
