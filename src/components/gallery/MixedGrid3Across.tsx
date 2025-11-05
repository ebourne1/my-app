'use client'

import { useState } from 'react'
import Masonry from '@mui/lab/Masonry'
import PhotoCard from './PhotoCard'
import TextCardSmall from './TextCardSmall'
import PhotoModal from './PhotoModal'
import type { Media } from '@/payload-types'

interface MixedGrid3AcrossProps {
  block: {
    blockType: 'mixedGrid3Across'
    items: Array<{
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
  }
}

/**
 * MixedGrid3Across Component
 *
 * Renders a full-width section with 3-column masonry grid supporting both photos AND text cards.
 * First text card in the grid gets centered at top on large screens.
 */
export default function MixedGrid3Across({ block }: MixedGrid3AcrossProps) {
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
    if (window.innerWidth < 768) {
      return
    }
    setSelectedPhoto(photo)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
  }

  // Find index of first text card for centering
  const firstTextCardIndex = block.items.findIndex((item) => item.blockType === 'gridTextCard')

  return (
    <>
      <div className="mixed-grid-3-across">
        <Masonry
          columns={{ xs: 1, sm: 1, md: 3 }}
          spacing={{ xs: 1.5, sm: 1.5, md: 1.5 }}
          className="masonry-grid-3-across"
        >
          {block.items.map((item, index) => {
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
              const isFirstTextCard = index === firstTextCardIndex
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
                  isFirstInMasonry={isFirstTextCard}
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
