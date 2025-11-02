/**
 * Block Registry Types
 *
 * Core TypeScript types for the extensible block registry system.
 * This allows adding new block types without modifying core rendering logic.
 */

import type { ComponentType } from 'react'

/**
 * Defines how a block should be laid out in the gallery
 * - masonry: Renders within a masonry grid section
 * - section-break: Full-width block that breaks masonry sections
 * - full-width: Full-width but doesn't break flow (future use)
 */
export type BlockLayout = 'masonry' | 'section-break' | 'full-width'

/**
 * Configuration for a block type
 */
export interface BlockConfig {
  /** Unique identifier matching Payload block slug */
  slug: string
  /** React component to render this block type */
  component: ComponentType<any>
  /** How this block should be laid out */
  layout: BlockLayout
  /** Whether this block should get priority loading (for images) */
  priority?: boolean
}

/**
 * Represents a section in the gallery after splitting
 */
export interface Section {
  /** Type of section */
  type: 'masonry' | 'block'
  /** Items in a masonry section */
  items?: any[]
  /** Single block item for section breaks */
  item?: any
  /** Block type identifier for block sections */
  blockType?: string
}
