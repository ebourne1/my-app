/**
 * Block Registry
 *
 * Central configuration for all gallery block types.
 * To add a new block type:
 * 1. Create the component in src/components/gallery/
 * 2. Add the block to Payload's Gallery collection
 * 3. Add an entry here with slug, component, and layout
 *
 * No other code changes needed!
 */

import type { BlockConfig } from './types'

// Components will be imported here as we create them in Phase 3
// import PhotoCard from '@/components/gallery/PhotoCard'
// import FeaturedPhoto from '@/components/gallery/FeaturedPhoto'
// import TextCard from '@/components/gallery/TextCard'

/**
 * Block Registry - maps block types to their rendering configuration
 *
 * IMPORTANT: The slug must match the block slug in Gallery.ts collection
 */
export const BLOCK_REGISTRY: Record<string, BlockConfig> = {
  photo: {
    slug: 'photo',
    component: null as any, // Will be set in Phase 3: PhotoCard
    layout: 'masonry',
    priority: false,
  },
  photoBulk: {
    slug: 'photoBulk',
    component: null as any, // Will be set in Phase 3: PhotoCard (handles bulk uploads)
    layout: 'masonry',
    priority: false,
  },
  featuredPhoto: {
    slug: 'featuredPhoto',
    component: null as any, // Will be set in Phase 3: FeaturedPhoto
    layout: 'section-break',
    priority: true,
  },
  textCard: {
    slug: 'textCard',
    component: null as any, // Will be set in Phase 3: TextCard
    layout: 'section-break',
    priority: false,
  },

  // FUTURE BLOCK TYPES - Examples (commented out)
  // Uncomment and implement when needed
  //
  // video: {
  //   slug: 'video',
  //   component: VideoBlock,
  //   layout: 'masonry',
  //   priority: false,
  // },
  //
  // carousel: {
  //   slug: 'carousel',
  //   component: CarouselBlock,
  //   layout: 'section-break',
  //   priority: false,
  // },
  //
  // quote: {
  //   slug: 'quote',
  //   component: QuoteBlock,
  //   layout: 'masonry',
  //   priority: false,
  // },
  //
  // comparison: {
  //   slug: 'comparison',
  //   component: BeforeAfterBlock,
  //   layout: 'section-break',
  //   priority: false,
  // },
}

/**
 * Get block configuration by block type
 * @param blockType - The block type slug
 * @returns Block configuration or null if not found
 */
export function getBlockConfig(blockType: string): BlockConfig | null {
  return BLOCK_REGISTRY[blockType] || null
}

/**
 * Check if a block type is registered
 * @param blockType - The block type slug
 * @returns True if block type exists in registry
 */
export function isBlockTypeRegistered(blockType: string): boolean {
  return blockType in BLOCK_REGISTRY
}

/**
 * Get all registered block type slugs
 * @returns Array of block type slugs
 */
export function getRegisteredBlockTypes(): string[] {
  return Object.keys(BLOCK_REGISTRY)
}
