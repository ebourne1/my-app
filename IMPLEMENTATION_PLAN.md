# Photographer Gallery CMS - Master Implementation Plan

**Project:** Photography Portfolio Gallery with Next.js 15 and Payload CMS 3.0
**Date:** November 2, 2025
**Tech Stack:** Next.js 15.4.4, Payload CMS 3.59.1, Cloudflare R2, D1 SQLite, Lexical Editor

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture Decisions](#architecture-decisions)
3. [Image Optimization Strategy](#image-optimization-strategy)
4. [Payload CMS Structure](#payload-cms-structure)
5. [Component Architecture](#component-architecture)
6. [Problem Areas & Solutions](#problem-areas--solutions)
7. [Implementation Phases](#implementation-phases)
8. [Testing Strategy](#testing-strategy)

---

## Project Overview

### Goals
Build a photographer portfolio website with a flexible gallery system that allows:
- Mixed content types (photos, featured photos with overlays, text cards)
- Masonry grid layout (2 columns on desktop, 1 on mobile)
- Featured photos that span full width with optional overlay and CTA button
- Text cards integrated into the layout for storytelling
- Photographer-friendly CMS interface for easy content management

### User Roles
1. **Photographer (Admin)**: Manages gallery content through Payload admin panel
2. **Website Visitors**: View the gallery on the public-facing website

---

## Architecture Decisions

### Core Technology Choices

#### 1. Payload CMS with Blocks Field
**Decision:** Use a single `Gallery` collection with a `blocks` field containing three block types.

**Rationale:**
- Blocks field allows mixing different content types in any order
- Single collection = single query = simpler data fetching
- Built-in drag-and-drop reordering in admin UI
- Type-safe with auto-generated TypeScript types

**Alternative Considered:** Separate collections for each item type
- **Rejected:** Would require multiple queries and complex ordering logic

#### 2. Section-Based Layout (Critical Decision)
**Decision:** Treat featured photos and text cards as **section breaks** rather than masonry grid items.

**Rationale:**
- Solves the masonry + dynamic spanning problem
- Featured photos naturally divide the gallery into visual sections
- Predictable layout behavior (no complex balancing algorithms)
- Better responsive behavior

**Layout Pattern:**
```
[Masonry Section 1: Regular Photos]
  Photo 1 | Photo 2
  Photo 3 | Photo 4

[Featured Photo - Full Width with Overlay]

[Masonry Section 2: Regular Photos]
  Photo 5 | Photo 6
  Text Card (Full Width)

[Masonry Section 3: Regular Photos]
  Photo 7 | Photo 8
  Photo 9 | Photo 10
```

#### 3. Next.js Server Components
**Decision:** Use React Server Components for data fetching with Payload's Local API.

**Rationale:**
- No HTTP requests needed (server-side only)
- Better performance (data fetching happens on server)
- SEO benefits (fully rendered HTML)
- Type-safe queries with auto-generated types
- Already implemented in existing codebase

#### 4. CSS Grid (Not External Masonry Library)
**Decision:** Use native CSS Grid for masonry sections.

**Rationale:**
- No external dependencies
- Better performance
- Full control over responsive behavior
- Simpler to implement with section-based approach

**CSS Strategy:**
```css
.masonry-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  grid-auto-flow: dense;
}

@media (max-width: 1023px) {
  .masonry-section {
    grid-template-columns: 1fr;
  }
}
```

#### 5. Block Registry Pattern (Extensibility - CRITICAL)
**Decision:** Implement a configuration-based block registry system for dynamic component rendering.

**Rationale:**
- **Future-proof**: Adding new block types (video, carousel, quote, etc.) requires ZERO changes to core logic
- **Configuration over code**: New blocks defined in registry, not hardcoded in components
- **Maintainable**: Each block is self-contained and testable independently
- **Type-safe**: Leverages Payload's auto-generated discriminated unions
- **Scalable**: Supports unlimited block types without refactoring

**Pattern:**
```typescript
// src/lib/blocks/blockRegistry.ts
export const BLOCK_REGISTRY = {
  photo: {
    slug: 'photo',
    component: PhotoCard,
    layout: 'masonry', // Renders in grid
  },
  featuredPhoto: {
    slug: 'featuredPhoto',
    component: FeaturedPhoto,
    layout: 'section-break', // Full-width, breaks grid
  },
  // Future: Just add new entries here!
  // video: { slug: 'video', component: VideoBlock, layout: 'masonry' }
}
```

**Benefits:**
- Adding video block = Create component + Add to Payload + Register (3 steps)
- No modifications to GalleryGrid, section splitting, or rendering logic
- Open-closed principle: Open for extension, closed for modification

---

## Image Optimization Strategy

### Next.js 15 Image Component Configuration

#### 1. Automatic Format Conversion
Next.js automatically serves images in modern formats:
- **AVIF** (first priority in Next.js 15) - ~50% smaller than JPEG
- **WebP** (fallback) - ~30% smaller than JPEG
- **Original format** (fallback for unsupported browsers)

**No configuration needed** - this happens automatically when using `<Image>` component.

#### 2. Responsive Image Sizes
Use the `sizes` prop to generate optimal srcset for different devices:

```tsx
<Image
  src={imageUrl}
  alt={altText}
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
/>
```

**Sizes Breakdown:**
- Mobile (≤768px): 100vw (full viewport width)
- Tablet (≤1200px): 50vw (half viewport, for 2-column)
- Desktop (>1200px): 600px (fixed max width per column)

#### 3. Device Sizes Configuration
Default Next.js breakpoints (sufficient for our use):
```javascript
deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
```

#### 4. Cloudflare R2 Remote Patterns
Configure `next.config.js` to allow R2 images:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com', // R2 public URLs
        pathname: '/**',
      },
      // Add custom R2 domain if configured
      {
        protocol: 'https',
        hostname: 'your-custom-domain.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'], // Default in Next.js 15
  },
};
```

#### 5. Layout Shift Prevention
**Critical:** Store image dimensions to prevent Cumulative Layout Shift (CLS).

**Implementation:** Add hidden fields to Media collection and use upload hooks to extract dimensions:

```typescript
// In Media collection
fields: [
  {
    name: 'width',
    type: 'number',
    admin: { hidden: true, readOnly: true }
  },
  {
    name: 'height',
    type: 'number',
    admin: { hidden: true, readOnly: true }
  }
]
```

Then use `aspect-ratio` CSS or pass width/height to Image component.

#### 6. Priority Loading
Use `priority` prop for above-the-fold images:

```tsx
<Image
  src={firstImage}
  alt="Hero"
  priority // First 2-3 images
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

---

## Payload CMS Structure

### Collections

#### 1. Gallery Collection (NEW)

**File:** `src/collections/Gallery.ts`

```typescript
import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    description: 'Manage your portfolio gallery with photos, featured images, and text content.'
  },
  access: {
    read: () => true, // Public access for frontend
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal title for this gallery (not shown on frontend)'
      }
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Uncheck to hide this gallery from the website'
      }
    },
    {
      name: 'items',
      type: 'blocks',
      minRows: 1,
      admin: {
        description: 'Add photos, featured photos, and text cards. Drag to reorder. Featured photos and text cards will display full-width.'
      },
      blocks: [
        // Block 1: Regular Photo
        {
          slug: 'photo',
          labels: {
            singular: 'Photo',
            plural: 'Photos'
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Upload a photo for the gallery'
              }
            },
            {
              name: 'caption',
              type: 'text',
              admin: {
                description: 'Optional caption shown below the photo'
              }
            }
          ]
        },

        // Block 2: Featured Photo (Full Width with Overlay)
        {
          slug: 'featuredPhoto',
          labels: {
            singular: 'Featured Photo',
            plural: 'Featured Photos'
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Featured photo - will display full width'
              }
            },
            {
              name: 'enableOverlay',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Show overlay with text and button on this photo'
              }
            },
            {
              name: 'overlayText',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => defaultFeatures
              }),
              admin: {
                condition: (data, siblingData) => siblingData.enableOverlay,
                description: 'Text to display over the photo'
              }
            },
            {
              name: 'buttonText',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData.enableOverlay,
                description: 'Call-to-action button text (e.g., "Contact Me")'
              }
            },
            {
              name: 'buttonLink',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData.enableOverlay,
                description: 'URL for the button (e.g., "/contact")'
              }
            }
          ]
        },

        // Block 3: Text Card (Full Width)
        {
          slug: 'textCard',
          labels: {
            singular: 'Text Card',
            plural: 'Text Cards'
          },
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => defaultFeatures
              }),
              admin: {
                description: 'Text content for storytelling or context. Will display full-width. Keep to 2-4 paragraphs for optimal layout.'
              }
            },
            {
              name: 'backgroundColor',
              type: 'select',
              defaultValue: 'light',
              options: [
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'Accent', value: 'accent' }
              ],
              admin: {
                description: 'Background style for the text card'
              }
            }
          ]
        }
      ]
    }
  ]
}
```

#### 2. Media Collection (EXISTING - MODIFY)

**File:** `src/collections/Media.ts`

**Add dimension tracking fields and upload hooks:**

```typescript
import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'width',
      type: 'number',
      admin: {
        hidden: true,
        readOnly: true
      }
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        hidden: true,
        readOnly: true
      }
    }
  ],
  upload: {
    crop: false,
    focalPoint: false,
    // Note: Image processing hooks will be added in implementation phase
    // to extract dimensions from uploaded files
  },
}
```

#### 3. Users Collection (EXISTING - NO CHANGES)

---

## Component Architecture

### Directory Structure

```
src/
├── collections/
│   ├── Gallery.ts        (NEW)
│   ├── Media.ts          (MODIFIED)
│   └── Users.ts          (EXISTING)
├── lib/                  (NEW - Core utilities)
│   └── blocks/
│       ├── blockRegistry.ts      (NEW - Block configuration registry)
│       ├── sectionSplitter.ts    (NEW - Section splitting logic)
│       └── types.ts              (NEW - Shared TypeScript types)
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx    (NEW)
│   │   └── Footer.tsx    (NEW)
│   └── gallery/
│       ├── GalleryGrid.tsx        (NEW - Main container)
│       ├── MasonrySection.tsx     (NEW - Masonry grid)
│       ├── PhotoCard.tsx          (NEW - Regular photos)
│       ├── FeaturedPhoto.tsx      (NEW - Full-width with overlay)
│       └── TextCard.tsx           (NEW - Text content)
├── app/
│   └── (frontend)/
│       ├── layout.tsx    (MODIFY - Add Navbar/Footer)
│       ├── page.tsx      (MODIFY - Render gallery)
│       └── globals.css   (MODIFY - Add styles)
└── payload.config.ts     (MODIFY - Register Gallery collection)
```

### Block Registry System (Extensibility Pattern)

The block registry pattern is a **critical architectural decision** that ensures future extensibility. This system allows adding new block types (video, carousel, quote, etc.) without modifying core rendering logic.

#### Core Files

**1. Block Types (`src/lib/blocks/types.ts`)**
```typescript
export type BlockLayout = 'masonry' | 'section-break' | 'full-width'

export interface BlockConfig {
  slug: string
  component: React.ComponentType<any>
  layout: BlockLayout
  priority?: boolean
}

export interface Section {
  type: 'masonry' | 'block'
  items?: any[]
  item?: any
  blockType?: string
}
```

**2. Block Registry (`src/lib/blocks/blockRegistry.ts`)**
```typescript
import PhotoCard from '@/components/gallery/PhotoCard'
import FeaturedPhoto from '@/components/gallery/FeaturedPhoto'
import TextCard from '@/components/gallery/TextCard'
import type { BlockConfig } from './types'

export const BLOCK_REGISTRY: Record<string, BlockConfig> = {
  photo: {
    slug: 'photo',
    component: PhotoCard,
    layout: 'masonry',
    priority: false
  },
  featuredPhoto: {
    slug: 'featuredPhoto',
    component: FeaturedPhoto,
    layout: 'section-break',
    priority: true
  },
  textCard: {
    slug: 'textCard',
    component: TextCard,
    layout: 'section-break',
    priority: false
  },

  // FUTURE ADDITIONS (Examples - commented out for now)
  // video: {
  //   slug: 'video',
  //   component: VideoBlock,
  //   layout: 'masonry',
  //   priority: false
  // },
  // carousel: {
  //   slug: 'carousel',
  //   component: CarouselBlock,
  //   layout: 'section-break',
  //   priority: false
  // },
  // quote: {
  //   slug: 'quote',
  //   component: QuoteBlock,
  //   layout: 'masonry',
  //   priority: false
  // }
}

export function getBlockConfig(blockType: string): BlockConfig | null {
  return BLOCK_REGISTRY[blockType] || null
}
```

**3. Section Splitter (`src/lib/blocks/sectionSplitter.ts`)**
```typescript
import { BLOCK_REGISTRY } from './blockRegistry'
import type { Section } from './types'

export function splitIntoSections(blocks: any[]): Section[] {
  const sections: Section[] = []
  let currentMasonryItems: any[] = []

  blocks.forEach((block) => {
    const config = BLOCK_REGISTRY[block.blockType]

    if (!config) {
      console.warn(`Unknown block type: ${block.blockType}`)
      return
    }

    if (config.layout === 'masonry') {
      // Accumulate masonry items
      currentMasonryItems.push(block)
    } else {
      // Section break (full-width or section-break layout)

      // Flush accumulated masonry items
      if (currentMasonryItems.length > 0) {
        sections.push({
          type: 'masonry',
          items: [...currentMasonryItems]
        })
        currentMasonryItems = []
      }

      // Add the section break block
      sections.push({
        type: 'block',
        blockType: block.blockType,
        item: block
      })
    }
  })

  // Flush remaining masonry items
  if (currentMasonryItems.length > 0) {
    sections.push({
      type: 'masonry',
      items: currentMasonryItems
    })
  }

  return sections
}
```

#### How to Add New Block Types

**Example: Adding a Video Block**

1. **Create component** (`src/components/gallery/VideoBlock.tsx`)
```typescript
export default function VideoBlock({ block }) {
  const { videoUrl, thumbnail, caption } = block
  return (
    <div className="video-block">
      <video src={videoUrl} poster={thumbnail.url} controls />
      {caption && <p>{caption}</p>}
    </div>
  )
}
```

2. **Add to Payload collection** (`src/collections/Gallery.ts`)
```typescript
{
  slug: 'video',
  fields: [
    { name: 'videoUrl', type: 'text', required: true },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'caption', type: 'text' }
  ]
}
```

3. **Register in block registry** (`src/lib/blocks/blockRegistry.ts`)
```typescript
import VideoBlock from '@/components/gallery/VideoBlock'

export const BLOCK_REGISTRY = {
  // ... existing blocks ...
  video: {
    slug: 'video',
    component: VideoBlock,
    layout: 'masonry', // or 'section-break' for full-width
    priority: false
  }
}
```

**Done!** No changes needed to GalleryGrid, MasonrySection, or any other components.

---

### Component Specifications

#### 1. GalleryGrid Component (Dynamic Block Rendering)
**Purpose:** Main container that fetches data and orchestrates rendering

```tsx
// src/components/gallery/GalleryGrid.tsx
import { getPayload } from 'payload'
import { Fragment } from 'react'
import config from '@/payload.config'
import { BLOCK_REGISTRY } from '@/lib/blocks/blockRegistry'
import { splitIntoSections } from '@/lib/blocks/sectionSplitter'
import MasonrySection from './MasonrySection'

export default async function GalleryGrid() {
  const payload = await getPayload({ config })

  const galleryData = await payload.find({
    collection: 'gallery',
    where: {
      published: { equals: true }
    },
    limit: 1,
    sort: '-createdAt'
  })

  const items = galleryData.docs[0]?.items || []

  // Split items into sections using the registry-based splitter
  const sections = splitIntoSections(items)

  return (
    <div className="gallery-container">
      {sections.map((section, index) => {
        // Render masonry sections
        if (section.type === 'masonry') {
          return <MasonrySection key={index} items={section.items} />
        }

        // Dynamically render block components (NO HARDCODED TYPES!)
        if (section.type === 'block') {
          const config = BLOCK_REGISTRY[section.blockType]
          if (!config) {
            console.warn(`No renderer for block type: ${section.blockType}`)
            return null
          }

          const BlockComponent = config.component
          return <BlockComponent key={index} block={section.item} />
        }

        return null
      })}
    </div>
  )
}
```

#### 2. MasonrySection Component (Dynamic Rendering)
**Purpose:** Renders a section of masonry items using dynamic component lookup

```tsx
// src/components/gallery/MasonrySection.tsx
import { BLOCK_REGISTRY } from '@/lib/blocks/blockRegistry'

export default function MasonrySection({ items }) {
  return (
    <div className="masonry-section">
      {items.map((item, index) => {
        const config = BLOCK_REGISTRY[item.blockType]

        if (!config) {
          console.warn(`Unknown block type: ${item.blockType}`)
          return null
        }

        const BlockComponent = config.component
        const priority = index < 4 && config.priority // First 4 items with priority flag

        return (
          <BlockComponent
            key={index}
            block={item}
            priority={priority}
          />
        )
      })}
    </div>
  )
}
```

**Key Features:**
- No hardcoded component imports for masonry items
- Supports any block type registered with `layout: 'masonry'`
- Automatically handles priority loading for above-fold images
- Gracefully handles unknown block types

#### 3. PhotoCard Component
**Purpose:** Renders individual photo in masonry grid

```tsx
// src/components/gallery/PhotoCard.tsx
import Image from 'next/image'

export default function PhotoCard({ block, priority = false }) {
  const { image, caption } = block

  // image is populated relationship to media collection
  const imageUrl = image.url
  const width = image.width || 1200
  const height = image.height || 800

  return (
    <div className="photo-card">
      <Image
        src={imageUrl}
        alt={image.alt}
        width={width}
        height={height}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        priority={priority}
        className="photo-image"
      />
      {caption && <p className="photo-caption">{caption}</p>}
    </div>
  )
}
```

#### 4. FeaturedPhoto Component
**Purpose:** Full-width photo with optional overlay and CTA

```tsx
// src/components/gallery/FeaturedPhoto.tsx
import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'

export default function FeaturedPhoto({ block }) {
  const { image, enableOverlay, overlayText, buttonText, buttonLink } = block

  return (
    <div className="featured-photo">
      <div className="featured-photo-wrapper">
        <Image
          src={image.url}
          alt={image.alt}
          width={image.width || 2400}
          height={image.height || 1200}
          sizes="100vw"
          priority
          className="featured-image"
        />

        {enableOverlay && (
          <div className="featured-overlay">
            <div className="overlay-content">
              {overlayText && <RichText data={overlayText} />}
              {buttonText && buttonLink && (
                <a href={buttonLink} className="overlay-button">
                  {buttonText}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
```

#### 5. TextCard Component
**Purpose:** Full-width text content card

```tsx
// src/components/gallery/TextCard.tsx
import { RichText } from '@payloadcms/richtext-lexical/react'

export default function TextCard({ block }) {
  const { content, backgroundColor = 'light' } = block

  return (
    <div className={`text-card text-card-${backgroundColor}`}>
      <div className="text-card-content">
        <RichText data={content} />
      </div>
    </div>
  )
}
```

#### 6. Navbar Component
**Purpose:** Site navigation

```tsx
// src/components/layout/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <a href="/" className="navbar-logo">
          Photographer Name
        </a>
        <ul className="navbar-menu">
          <li><a href="/">Gallery</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </nav>
  )
}
```

#### 7. Footer Component
**Purpose:** Site footer

```tsx
// src/components/layout/Footer.tsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p>&copy; {new Date().getFullYear()} Photographer Name. All rights reserved.</p>
        <div className="footer-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  )
}
```

---

## Problem Areas & Solutions

### 1. Masonry + Dynamic Spanning ✅ SOLVED
**Problem:** Featured photos spanning 2 columns break masonry flow
**Solution:** Section-based architecture - featured photos act as dividers between masonry sections

### 2. Image Aspect Ratios & Layout Shift ✅ SOLVED
**Problem:** Unknown dimensions cause CLS
**Solution:** Store dimensions in Media collection via upload hooks, use aspect-ratio CSS

### 3. Text Card Variable Heights ✅ SOLVED
**Problem:** Long text cards create unbalanced columns
**Solution:** Make text cards full-width section breaks (not masonry items)

### 4. Responsive Breakpoints ✅ DEFINED
**Solution:**
- Mobile (≤767px): 1 column
- Tablet (768px-1023px): 1 column centered
- Desktop (≥1024px): 2 columns with featured photos spanning both

### 5. Lexical RichText Rendering ✅ SOLVED
**Problem:** Need to render Lexical JSON on frontend
**Solution:** Use `@payloadcms/richtext-lexical/react` RichText component

### 6. R2 Image URLs ✅ ADDRESSED
**Solution:** Configure remotePatterns in next.config.js for R2 domains

### 7. WebP & Responsive Images ✅ SOLVED
**Solution:** Next.js Image component handles automatically with proper `sizes` prop

---

## Implementation Phases

### Phase 1: Foundation (Collections, Config & Block Registry) ✅ COMPLETE
**Estimated Time:** 1.5-2.5 hours
**Actual Time:** ~2 hours

**Tasks:**
1. ✅ Create block registry system:
   - ✅ Create `src/lib/blocks/types.ts` (TypeScript types)
   - ✅ Create `src/lib/blocks/blockRegistry.ts` (Block configuration)
   - ✅ Create `src/lib/blocks/sectionSplitter.ts` (Section splitting logic)
2. ✅ Create Gallery collection (`src/collections/Gallery.ts`)
3. ✅ Modify Media collection to add dimension fields
4. ✅ Update `payload.config.ts` to register Gallery collection
5. ✅ Configure `next.config.ts` for R2 remote patterns
6. ✅ Run database migrations
7. ✅ Test admin panel - create test gallery items

**Validation:**
- [x] Block registry files created and exporting correctly
- [x] Can create gallery in admin panel
- [x] Can upload images to media collection
- [x] Can add all four block types (photo, photoBulk, featured, text)
- [x] Can reorder blocks via drag-and-drop

**Implementation Notes:**
- **Bulk Upload Feature Added**: After initial implementation and user testing, added `photoBulk` block type with `hasMany: true` to enable multi-file selection for photographers. This allows uploading multiple photos at once to streamline the workflow.
- **Database Schema Fix**: Encountered duplicate index error (`payload_locked_documents_rels_order_idx`) which was resolved by dropping the index via wrangler and allowing Payload to recreate it.
- **Block Types Implemented**:
  - `photo` - Single photo upload with optional caption
  - `photoBulk` - Multi-file upload for batch photo additions (NEW)
  - `featuredPhoto` - Full-width photo with optional overlay, text, and CTA button
  - `textCard` - Rich text content with background color options
- **Registry System Working**: Block registry successfully abstracts component rendering and layout logic, making future extensions trivial.

---

### Phase 2: Layout Components (Navbar & Footer)
**Estimated Time:** 30 minutes

**Tasks:**
1. Create Navbar component
2. Create Footer component
3. Update `app/(frontend)/layout.tsx` to include Navbar and Footer
4. Add basic CSS for navigation

**Validation:**
- [ ] Navbar displays at top of all pages
- [ ] Footer displays at bottom
- [ ] Links work correctly

---

### Phase 3: Gallery Components (Core Rendering)
**Estimated Time:** 2-2.5 hours

**Tasks:**
1. Create GalleryGrid component (uses block registry for dynamic rendering)
2. Create MasonrySection component (uses block registry for dynamic rendering)
3. Create PhotoCard component
4. Create FeaturedPhoto component
5. Create TextCard component

**Validation:**
- [ ] Gallery fetches data from Payload
- [ ] Block registry correctly splits items into sections
- [ ] Regular photos render in masonry grid
- [ ] Featured photos render full-width
- [ ] Text cards render full-width
- [ ] Images load with Next.js optimization

---

### Phase 4: Styling & Responsive Design
**Estimated Time:** 2-3 hours

**Tasks:**
1. Add CSS for masonry grid
2. Add CSS for featured photos with overlay
3. Add CSS for text cards with background variants
4. Implement responsive breakpoints
5. Add hover effects and transitions
6. Test on different screen sizes

**Validation:**
- [ ] Masonry grid displays correctly on desktop (2 columns)
- [ ] Single column on mobile/tablet
- [ ] Featured photo overlays look good
- [ ] Text cards match photo aesthetic
- [ ] No layout shift on image load
- [ ] Smooth responsive behavior

---

### Phase 5: Image Optimization & Performance
**Estimated Time:** 1-2 hours

**Tasks:**
1. Add upload hooks to extract image dimensions
2. Implement priority loading for above-fold images
3. Verify WebP/AVIF generation
4. Test responsive image sizes
5. Optimize Lexical RichText rendering

**Validation:**
- [ ] Images serve in WebP/AVIF formats
- [ ] Correct image sizes load on different devices
- [ ] No Cumulative Layout Shift (CLS)
- [ ] First images load with priority
- [ ] Lighthouse score >90 for performance

---

### Phase 6: Polish & Testing
**Estimated Time:** 1-2 hours

**Tasks:**
1. Add loading states
2. Add error handling
3. Test with various content combinations
4. Test with real photographer images
5. Cross-browser testing
6. Accessibility audit

**Validation:**
- [ ] Works in Chrome, Safari, Firefox
- [ ] Mobile experience is smooth
- [ ] Admin panel is intuitive for photographers
- [ ] Alt text works for screen readers
- [ ] Keyboard navigation works

---

## Testing Strategy

### Admin Panel Testing
- [ ] Create gallery with 20+ items
- [ ] Mix all three block types
- [ ] Test reordering via drag-and-drop
- [ ] Upload various image formats (JPG, PNG, WebP)
- [ ] Test various image aspect ratios (portrait, landscape, square)
- [ ] Test featured photo with/without overlay
- [ ] Test text card with different background colors
- [ ] Publish/unpublish gallery

### Frontend Testing
- [ ] Test on mobile (375px - iPhone SE)
- [ ] Test on tablet (768px - iPad)
- [ ] Test on desktop (1920px - standard monitor)
- [ ] Test on large desktop (2560px - 4K)
- [ ] Test with slow 3G connection
- [ ] Verify lazy loading of off-screen images
- [ ] Check image format served (should be WebP/AVIF)
- [ ] Verify no layout shift with DevTools
- [ ] Test featured photo overlay CTAs work

### Performance Testing
- [ ] Run Lighthouse audit (target: >90 all metrics)
- [ ] Check Core Web Vitals:
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- [ ] Test with 50+ gallery items
- [ ] Monitor bundle size
- [ ] Check network waterfall for image loading

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Safari (latest)
- [ ] Firefox (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

---

## Next.js Configuration

### next.config.js (Required Changes)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
      // Add custom domain if you have one configured for R2
    ],
    formats: ['image/avif', 'image/webp'], // Default in Next.js 15
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

---

## Success Criteria

### MVP Complete When:
1. ✅ Photographer can create gallery in admin panel
2. ✅ All three block types work (photo, featured photo, text card)
3. ✅ Gallery renders on homepage with proper layout
4. ✅ Images optimize to WebP/AVIF automatically
5. ✅ Responsive design works on mobile and desktop
6. ✅ Featured photos display full-width with overlay option
7. ✅ Text cards integrate seamlessly into layout
8. ✅ No layout shift on image load
9. ✅ Lighthouse performance score >90
10. ✅ Admin panel is intuitive for non-technical users

---

## Future Enhancements (Post-MVP)

### Phase 7+: Optional Features
- Multiple gallery collections (e.g., Wedding, Portrait, Landscape)
- Image filtering/categorization
- Lightbox/modal view for photos
- Infinite scroll for large galleries
- Admin preview mode
- Social sharing integration
- Contact form integration with overlay CTAs
- Analytics integration
- SEO metadata per gallery
- Custom domain configuration for R2

---

## Risk Mitigation

### Technical Risks
1. **Risk:** R2 image URLs not working with Next.js Image
   - **Mitigation:** Test R2 integration in Phase 1, verify remotePatterns early

2. **Risk:** Lexical RichText not rendering correctly
   - **Mitigation:** Test with sample content in Phase 3, have fallback to plain text

3. **Risk:** Layout issues with mixed aspect ratios
   - **Mitigation:** Test with diverse real images early, adjust CSS as needed

4. **Risk:** Performance degradation with large galleries
   - **Mitigation:** Implement lazy loading, monitor performance in Phase 5

### User Experience Risks
1. **Risk:** Admin panel too complex for photographers
   - **Mitigation:** Add helpful descriptions, test with actual photographer

2. **Risk:** Gallery layout not matching photographer's vision
   - **Mitigation:** Create mockups, get approval before implementation

---

## Resources & References

### Documentation
- [Next.js 15 Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Payload CMS 3.0 Blocks Field](https://payloadcms.com/docs/fields/blocks)
- [Payload CMS Upload Collections](https://payloadcms.com/docs/upload/overview)
- [Lexical RichText Editor](https://payloadcms.com/docs/rich-text/overview)
- [Payload Local API](https://payloadcms.com/docs/local-api/overview)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Performance testing
- [WebPageTest](https://www.webpagetest.org/) - Performance analysis
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/) - Debugging

---

## Conclusion

This implementation plan provides a comprehensive roadmap for building a photographer portfolio gallery with modern web technologies. The section-based architecture solves the complex masonry + spanning problem while Next.js 15's automatic image optimization ensures WebP/AVIF delivery and responsive sizing without manual configuration.

**Key Success Factors:**
1. Section-based layout prevents masonry complexity
2. Payload blocks provide flexible, type-safe content management
3. Next.js Image component handles all optimization automatically
4. Cloudflare R2 provides scalable, cost-effective image storage
5. Server Components enable fast, SEO-friendly rendering

**Estimated Total Time:** 8-12 hours for complete MVP implementation

---

**Ready to begin Phase 1: Foundation**
