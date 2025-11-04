'use client'

import { useState } from 'react'
import Masonry from 'react-masonry-css'
import { BLOCK_REGISTRY } from '@/lib/blocks/blockRegistry'
import PhotoModal from './PhotoModal'
import type { Media } from '@/payload-types'

interface MasonrySectionProps {
  items: any[]
}

/**
 * MasonrySection Component (Client Component)
 *
 * Renders a section of items in a masonry grid layout (2 columns on desktop, 1 on mobile).
 * Uses the block registry to dynamically render each item's component.
 *
 * Key Features:
 * - No hardcoded component types - uses registry lookup
 * - Supports any block type with layout: 'masonry'
 * - Automatically handles priority loading for above-fold images (first 4 items)
 * - Gracefully handles unknown block types
 * - Photo lightbox/modal for clicking photos to view larger
 */
export default function MasonrySection({ items }: MasonrySectionProps) {
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

  // Breakpoint configuration for react-masonry-css
  const breakpointColumns = {
    default: 2, // 2 columns on desktop
    1023: 1, // 1 column on tablets and below
  }

  // Flatten photoBulk blocks into individual items for proper masonry distribution
  const flattenedItems = items.flatMap((item) => {
    // If it's a photoBulk block, expand it into individual photo items
    if (item.blockType === 'photoBulk' && item.images) {
      return item.images.map((image: any, idx: number) => ({
        ...item,
        blockType: 'photo', // Treat as individual photo
        image: image,
        images: undefined, // Remove images array
        id: `${item.id}-${idx}`, // Unique ID for each expanded image
      }))
    }
    // Otherwise return the item as-is
    return [item]
  })

  return (
    <>
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {flattenedItems.map((item, index) => {
          const config = BLOCK_REGISTRY[item.blockType]

          if (!config) {
            console.warn(`Unknown block type in masonry: ${item.blockType}`)
            return null
          }

          const BlockComponent = config.component

          // Return null if component is not yet implemented
          if (!BlockComponent || BlockComponent === null) {
            console.warn(`Component not yet implemented for masonry item: ${item.blockType}`)
            return null
          }

          // Priority loading for first 4 items (above-fold on most screens)
          const priority = index < 4 && config.priority !== false

          // Pass click handler to photo components (both photo and photoBulk)
          const extraProps: any = {}
          if (item.blockType === 'photo' || item.blockType === 'photoBulk') {
            extraProps.onPhotoClick = handlePhotoClick
          }

          return (
            <BlockComponent
              key={item.id || `item-${index}`}
              block={item}
              priority={priority}
              {...extraProps}
            />
          )
        })}
      </Masonry>

      {/* Photo Modal */}
      <PhotoModal isOpen={!!selectedPhoto} onClose={handleCloseModal} photo={selectedPhoto} />
    </>
  )
}
