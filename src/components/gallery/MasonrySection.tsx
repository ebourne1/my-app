import { BLOCK_REGISTRY } from '@/lib/blocks/blockRegistry'

interface MasonrySectionProps {
  items: any[]
}

/**
 * MasonrySection Component
 *
 * Renders a section of items in a masonry grid layout (2 columns on desktop, 1 on mobile).
 * Uses the block registry to dynamically render each item's component.
 *
 * Key Features:
 * - No hardcoded component types - uses registry lookup
 * - Supports any block type with layout: 'masonry'
 * - Automatically handles priority loading for above-fold images (first 4 items)
 * - Gracefully handles unknown block types
 */
export default function MasonrySection({ items }: MasonrySectionProps) {
  return (
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

        return (
          <BlockComponent
            key={item.id || `item-${index}`}
            block={item}
            priority={priority}
          />
        )
      })}
    </div>
  )
}
