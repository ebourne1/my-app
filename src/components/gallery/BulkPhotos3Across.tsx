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
    items?: Array<{
      blockType: 'gridPhoto' | 'gridPhotoBulk' | 'gridTextCard'
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
      // Text card fields
      content?: any
      fontFamily?: string
      fontSize?: string
      fontWeight?: string
      lineHeight?: string
      letterSpacing?: string
      textAlign?: string
      backgroundType?: string
      backgroundColor?: string
      customBackgroundColor?: string
      customTextColor?: string
      backgroundImage?: Media | string
      overlayColor?: string
      customOverlayColor?: string
      overlayOpacity?: number
    }>
  }
}

type GridItem =
  | {
      type: 'photo'
      image: Media
      caption?: string
      isFilmPhoto?: boolean
      filmType?: string
      filmStock?: string
      blackAndWhite?: boolean
      applyFilmBorder?: boolean
      filmBorderNumber?: string
      id: string
    }
  | {
      type: 'textCard'
      content: any
      fontFamily?: string
      fontSize?: string
      fontWeight?: string
      lineHeight?: string
      letterSpacing?: string
      textAlign?: string
      backgroundType?: string
      backgroundColor?: string
      customBackgroundColor?: string
      customTextColor?: string
      backgroundImage?: Media
      overlayColor?: string
      customOverlayColor?: string
      overlayOpacity?: number
      id: string
    }

/**
 * BulkPhotos3Across Component
 *
 * 3-column grid (section-break layout)
 * - 3 columns desktop (≥768px), 1 column mobile
 * - All items in single array for easy reordering
 * - Supports individual photos, bulk photo uploads, and text cards
 * - Height-based masonry balancing for optimal layout
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

  // Flatten all items into grid items (photos and text cards)
  const gridItems: GridItem[] = []

  block.items?.forEach((item, itemIndex) => {
    if (item.blockType === 'gridPhoto') {
      // Single photo
      const image = typeof item.image === 'string' ? null : item.image
      if (image) {
        gridItems.push({
          type: 'photo',
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
          gridItems.push({
            type: 'photo',
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
    } else if (item.blockType === 'gridTextCard') {
      // Text card
      const backgroundImage = typeof item.backgroundImage === 'string' ? null : item.backgroundImage
      gridItems.push({
        type: 'textCard',
        content: item.content,
        fontFamily: item.fontFamily,
        fontSize: item.fontSize,
        fontWeight: item.fontWeight,
        lineHeight: item.lineHeight,
        letterSpacing: item.letterSpacing,
        textAlign: item.textAlign,
        backgroundType: item.backgroundType,
        backgroundColor: item.backgroundColor,
        customBackgroundColor: item.customBackgroundColor,
        customTextColor: item.customTextColor,
        backgroundImage,
        overlayColor: item.overlayColor,
        customOverlayColor: item.customOverlayColor,
        overlayOpacity: item.overlayOpacity,
        id: item.id || `text-${itemIndex}`,
      })
    }
  })

  if (gridItems.length === 0) {
    return (
      <div className="bulk-photos-3-across-empty">
        <p>No items added yet. Add photos or text cards in the admin panel.</p>
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
            if (item.type === 'photo') {
              return (
                <PhotoCard
                  key={item.id}
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
                  priority={index < 3} // First 3 items get priority loading
                  onPhotoClick={handlePhotoClick}
                />
              )
            } else {
              // Text card
              return (
                <TextCardSmall
                  key={item.id}
                  block={{
                    blockType: 'textCardSmall',
                    content: item.content,
                    fontFamily: item.fontFamily as any,
                    fontSize: item.fontSize as any,
                    fontWeight: item.fontWeight as any,
                    lineHeight: item.lineHeight as any,
                    letterSpacing: item.letterSpacing as any,
                    textAlign: item.textAlign as any,
                    backgroundType: item.backgroundType as any,
                    backgroundColor: item.backgroundColor as any,
                    customBackgroundColor: item.customBackgroundColor,
                    customTextColor: item.customTextColor,
                    backgroundImage: item.backgroundImage
                      ? {
                          url: item.backgroundImage.url,
                          width: item.backgroundImage.width,
                          height: item.backgroundImage.height,
                          cloudinaryPublicId: item.backgroundImage.cloudinaryPublicId,
                        }
                      : undefined,
                    overlayColor: item.overlayColor as any,
                    customOverlayColor: item.customOverlayColor,
                    overlayOpacity: item.overlayOpacity,
                  }}
                />
              )
            }
          })}
        </Masonry>
      </div>

      {/* Photo Modal */}
      <PhotoModal isOpen={!!selectedPhoto} onClose={handleCloseModal} photo={selectedPhoto} />
    </>
  )
}
