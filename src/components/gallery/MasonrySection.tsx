'use client'

import { useState } from 'react'
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
  } | null>(null)

  const handlePhotoClick = (photo: { image: Media; caption?: string }) => {
    setSelectedPhoto(photo)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
  }

  return (
    <>
      <div className="masonry-section">
        {items.map((item, index) => {
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

          // Pass click handler to photo components only
          const extraProps: any = {}
          if (item.blockType === 'photo') {
            extraProps.onClick = () => handlePhotoClick(item)
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
      </div>

      {/* Photo Modal */}
      <PhotoModal isOpen={!!selectedPhoto} onClose={handleCloseModal} photo={selectedPhoto} />
    </>
  )
}
