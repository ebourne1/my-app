'use client'

import { useState } from 'react'
import Masonry from '@mui/lab/Masonry'
import PhotoCard from './PhotoCard'
import TextCardSmall from './TextCardSmall'
import PhotoModal from './PhotoModal'
import type { Media } from '@/payload-types'

interface BulkPhotos3AcrossProps {
  block: {
    blockType: 'photoBulk3Across'
    // New structure with blocks
    items?: Array<{
      blockType: 'gridPhoto' | 'gridTextCard'
      id?: string
      // Photo fields
      image?: Media
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
      fontWeight?: string
      textAlign?: string
      backgroundType?: string
      backgroundColor?: string
    }>
    // Legacy structure (backwards compatibility)
    images?: Media[]
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
    applyFilmBorder?: boolean
    filmBorderNumber?: string
    blackAndWhite?: boolean
  } | null>(null)

  const handlePhotoClick = (photo: {
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
    applyFilmBorder?: boolean
    filmBorderNumber?: string
    blackAndWhite?: boolean
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

  // Combine both items and legacy images arrays
  let gridItems: any[] = []

  // Add items from the new block structure
  if (block.items && block.items.length > 0) {
    gridItems = [...block.items]
  }

  // Add photos from legacy bulk upload field
  if (block.images && block.images.length > 0) {
    const legacyPhotos = block.images.map((image, idx) => ({
      blockType: 'gridPhoto' as const,
      image: image,
      id: `legacy-${block.blockType}-${idx}`,
      isFilmPhoto: block.isFilmPhoto,
      filmType: block.filmType,
      filmStock: block.filmStock,
      blackAndWhite: block.blackAndWhite,
      applyFilmBorder: block.applyFilmBorder,
      filmBorderNumber: block.filmBorderNumber,
    }))
    gridItems = [...gridItems, ...legacyPhotos]
  }

  // Check if first item is a text card - if so, render it separately above the grid
  const firstItemIsTextCard =
    gridItems.length > 0 && gridItems[0].blockType === 'gridTextCard' && gridItems[0].content

  // If first item is text card, separate it from the grid items
  const centeredTextCard = firstItemIsTextCard ? gridItems[0] : null
  const masonryItems = firstItemIsTextCard ? gridItems.slice(1) : gridItems

  return (
    <>
      <div className="bulk-photos-3-across">
        {/* Render first text card centered above grid if it exists */}
        {centeredTextCard && (
          <div className="centered-text-card-wrapper">
            <TextCardSmall
              key={centeredTextCard.id || 'centered-text-card'}
              block={{
                blockType: 'textCardSmall',
                content: centeredTextCard.content,
                fontFamily: centeredTextCard.fontFamily as any,
                fontSize: centeredTextCard.fontSize as any,
                fontWeight: centeredTextCard.fontWeight as any,
                textAlign: centeredTextCard.textAlign as any,
                backgroundType: centeredTextCard.backgroundType as any,
                backgroundColor: centeredTextCard.backgroundColor as any,
              }}
              isFirstInMasonry={true}
            />
          </div>
        )}

        {/* Masonry grid for photos and any additional text cards */}
        <Masonry
          columns={{ xs: 1, sm: 1, md: 3 }}
          spacing={{ xs: 1.5, sm: 1.5, md: 1.5 }}
          className="masonry-grid-3-across"
        >
          {masonryItems.map((item, index) => {
            const key = item.id || `item-${index}`

            // Render Photo
            if (item.blockType === 'gridPhoto' && item.image) {
              return (
                <PhotoCard
                  key={key}
                  block={{
                    blockType: 'photo',
                    image: item.image,
                    caption: item.caption,
                    isFilmPhoto: item.isFilmPhoto,
                    filmType: item.filmType,
                    filmStock: item.filmStock,
                    blackAndWhite: item.blackAndWhite,
                    applyFilmBorder: item.applyFilmBorder,
                    filmBorderNumber: item.filmBorderNumber,
                  }}
                  priority={index < 6}
                  onPhotoClick={handlePhotoClick}
                />
              )
            }

            // Render Text Card
            if (item.blockType === 'gridTextCard' && item.content) {
              return (
                <TextCardSmall
                  key={key}
                  block={{
                    blockType: 'textCardSmall',
                    content: item.content,
                    fontFamily: item.fontFamily as any,
                    fontSize: item.fontSize as any,
                    fontWeight: item.fontWeight as any,
                    textAlign: item.textAlign as any,
                    backgroundType: item.backgroundType as any,
                    backgroundColor: item.backgroundColor as any,
                  }}
                  isFirstInMasonry={false}
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
