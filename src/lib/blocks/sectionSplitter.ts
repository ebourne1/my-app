/**
 * Section Splitter
 *
 * Generic logic to split gallery blocks into renderable sections.
 * This handles the masonry + section break architecture.
 *
 * How it works:
 * - Masonry blocks accumulate into sections
 * - Section-break blocks flush masonry accumulation and render full-width
 * - This creates the alternating pattern: masonry | break | masonry | break
 */

import { BLOCK_REGISTRY } from './blockRegistry'
import type { Section } from './types'

/**
 * Split an array of blocks into renderable sections
 *
 * @param blocks - Array of blocks from Payload (with blockType property)
 * @returns Array of sections ready to render
 *
 * @example
 * Input blocks: [photo, photo, featuredPhoto, photo, textCard, photo]
 * Output sections: [
 *   { type: 'masonry', items: [photo, photo] },
 *   { type: 'block', blockType: 'featuredPhoto', item: {...} },
 *   { type: 'masonry', items: [photo] },
 *   { type: 'block', blockType: 'textCard', item: {...} },
 *   { type: 'masonry', items: [photo] }
 * ]
 */
export function splitIntoSections(blocks: any[]): Section[] {
  const sections: Section[] = []
  let currentMasonryItems: any[] = []

  blocks.forEach((block) => {
    // Get block configuration from registry
    const config = BLOCK_REGISTRY[block.blockType]

    if (!config) {
      console.warn(
        `[Section Splitter] Unknown block type: ${block.blockType}. ` +
          `Make sure it's registered in blockRegistry.ts`
      )
      return // Skip unknown blocks
    }

    if (config.layout === 'masonry') {
      // Accumulate masonry items
      currentMasonryItems.push(block)
    } else if (config.layout === 'section-break' || config.layout === 'full-width') {
      // Section break: flush accumulated masonry items, then add the break

      // Flush accumulated masonry items
      if (currentMasonryItems.length > 0) {
        sections.push({
          type: 'masonry',
          items: [...currentMasonryItems],
        })
        currentMasonryItems = [] // Reset accumulator
      }

      // Add the section break block
      sections.push({
        type: 'block',
        blockType: block.blockType,
        item: block,
      })
    }
  })

  // Flush any remaining masonry items at the end
  if (currentMasonryItems.length > 0) {
    sections.push({
      type: 'masonry',
      items: currentMasonryItems,
    })
  }

  return sections
}

/**
 * Get statistics about sections (useful for debugging)
 */
export function getSectionStats(sections: Section[]) {
  return {
    totalSections: sections.length,
    masonrySections: sections.filter((s) => s.type === 'masonry').length,
    blockSections: sections.filter((s) => s.type === 'block').length,
    totalMasonryItems: sections
      .filter((s) => s.type === 'masonry')
      .reduce((sum, s) => sum + (s.items?.length || 0), 0),
  }
}
