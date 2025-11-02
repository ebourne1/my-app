import { getPayload } from 'payload'
import { Fragment } from 'react'
import config from '@/payload.config'
import { BLOCK_REGISTRY } from '@/lib/blocks/blockRegistry'
import { splitIntoSections } from '@/lib/blocks/sectionSplitter'
import MasonrySection from './MasonrySection'

/**
 * GalleryGrid Component
 *
 * Main container that:
 * 1. Fetches gallery data from Payload CMS
 * 2. Splits items into sections using the block registry
 * 3. Renders masonry sections and full-width blocks dynamically
 *
 * Uses the block registry pattern for extensibility - no hardcoded block types!
 */
export default async function GalleryGrid() {
  const payload = await getPayload({ config })

  // Fetch the most recent published gallery
  const galleryData = await payload.find({
    collection: 'gallery',
    where: {
      published: { equals: true },
    },
    depth: 2, // Populate relationships (image uploads)
    limit: 1,
    sort: '-createdAt',
  })

  // Get items from the first gallery
  const items = galleryData.docs[0]?.items || []

  if (items.length === 0) {
    return (
      <div className="gallery-container">
        <div className="gallery-empty">
          <p>No gallery items found. Add some content in the admin panel.</p>
        </div>
      </div>
    )
  }

  // Split items into sections using the registry-based splitter
  const sections = splitIntoSections(items)

  return (
    <div className="gallery-container">
      {sections.map((section, index) => {
        // Render masonry sections
        if (section.type === 'masonry') {
          return <MasonrySection key={`masonry-${index}`} items={section.items || []} />
        }

        // Dynamically render block components (NO HARDCODED TYPES!)
        if (section.type === 'block' && section.blockType) {
          const config = BLOCK_REGISTRY[section.blockType]

          if (!config) {
            console.warn(`No renderer for block type: ${section.blockType}`)
            return null
          }

          const BlockComponent = config.component

          // Return null if component is not yet implemented (Phase 3 placeholder)
          if (!BlockComponent || BlockComponent === null) {
            console.warn(`Component not yet implemented for: ${section.blockType}`)
            return null
          }

          return <BlockComponent key={`block-${index}`} block={section.item} />
        }

        return null
      })}
    </div>
  )
}
