# LLM Handoff Documentation

## Project Overview

This is a professional photography portfolio website built with Next.js 15 and Payload CMS 3, deployed on Cloudflare Workers. The site features a dynamic masonry gallery with mixed content types (photos, featured images, text cards) and an animated signature logo.

---

## Tech Stack

### Core Framework
- **Next.js 15.4.4** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.7.3** - Type safety

### CMS & Database
- **Payload CMS 3.59.1** - Headless CMS
- **Cloudflare D1** - SQLite database (via `@payloadcms/db-d1-sqlite`)
- **Cloudflare R2** - Object storage for images (via `@payloadcms/storage-r2`)

### Deployment
- **Cloudflare Workers** - Edge serverless runtime
- **@opennextjs/cloudflare** - Adapter for running Next.js on Cloudflare Workers
- **Wrangler** - Cloudflare CLI tool

### Key Dependencies
- `@payloadcms/richtext-lexical` - Rich text editor
- `@payloadcms/ui` - Payload admin UI components
- `cross-env` - Cross-platform environment variables
- `dotenv` - Environment variable management

---

## Next.js & Payload Integration

### How They Work Together

#### 1. **Dual Route Groups**
The app uses Next.js route groups to separate frontend and admin:

```
src/app/
├── (frontend)/        # Public-facing site
│   ├── layout.tsx     # Custom frontend layout with Navbar/Footer
│   ├── page.tsx       # Homepage (gallery)
│   ├── about/
│   └── contact/
└── (payload)/         # CMS admin panel
    └── admin/         # Payload admin routes
```

- **(frontend)**: Custom design, Navbar, Footer, gallery components
- **(payload)**: Auto-generated Payload admin UI (accessible at `/admin`)

#### 2. **Server-Side Data Fetching**
Gallery data is fetched server-side using Payload's API:

```typescript
// In any Server Component
import { getPayload } from 'payload'
import config from '@/payload.config'

const payload = await getPayload({ config })
const data = await payload.find({
  collection: 'gallery',
  where: { published: { equals: true } },
  depth: 2, // Populate relationships
})
```

**Key Points:**
- No REST API needed - direct database access
- Server Components handle all data fetching
- Relationships auto-populate with `depth` parameter
- Type-safe with generated TypeScript types in `payload-types.ts`

#### 3. **Configuration**
**File: `src/payload.config.ts`**

This is the central configuration file that:
- Defines collections (Users, Media, Gallery)
- Configures D1 database adapter
- Sets up R2 storage for media
- Configures rich text editor (Lexical)
- Wraps Next.js config via `withPayload()` in `next.config.ts`

#### 4. **Database & Storage**
**Cloudflare Bindings (wrangler.jsonc):**
```jsonc
{
  "d1_databases": [{
    "binding": "D1",
    "database_id": "88af2521-2058-450e-ba79-37e0b83548d7",
    "database_name": "my-app",
    "remote": true
  }],
  "r2_buckets": [{
    "binding": "R2",
    "bucket_name": "my-app",
    "remote": true
  }]
}
```

**Important:**
- `remote: true` means dev uses production database (no local DB)
- Images stored in R2, URLs like `https://*.r2.cloudflarestorage.com/...`
- Database migrations run via `payload migrate`

#### 5. **Build & Deploy Process**
```bash
# Development
pnpm dev                    # Local dev server with remote D1/R2

# Build
pnpm build                  # Next.js build

# Deploy
pnpm run deploy:database    # Run Payload migrations to D1
pnpm run deploy:app         # Build & deploy to Cloudflare Workers

# Full Deploy
pnpm run deploy             # Runs both database + app
```

---

## Gallery Component Architecture

The gallery uses an **extensible block registry pattern** - no hardcoded block types! This allows adding new content types without modifying core rendering logic.

### High-Level Flow

```
GalleryGrid (Server Component)
    ↓
Fetches data from Payload
    ↓
Split into sections (sectionSplitter.ts)
    ↓
Render sections:
    - Masonry sections → MasonrySection (Client Component)
    - Block sections → FeaturedPhoto, TextCard, etc.
```

### Key Files

#### 1. **GalleryGrid.tsx** (Server Component)
**Path:** `src/components/gallery/GalleryGrid.tsx`

**Purpose:** Main container that orchestrates the gallery

**How it works:**
1. Fetches gallery data from Payload CMS
2. Gets the most recent published gallery
3. Splits items into sections using `splitIntoSections()`
4. Dynamically renders sections based on type

**Code Structure:**
```typescript
export default async function GalleryGrid() {
  // 1. Fetch data
  const payload = await getPayload({ config })
  const galleryData = await payload.find({
    collection: 'gallery',
    where: { published: { equals: true } },
    depth: 2,
    limit: 1,
    sort: '-createdAt',
  })

  const items = galleryData.docs[0]?.items || []

  // 2. Split into sections
  const sections = splitIntoSections(items)

  // 3. Render sections dynamically
  return (
    <div className="gallery-container">
      {sections.map((section, index) => {
        if (section.type === 'masonry') {
          return <MasonrySection items={section.items} />
        }
        if (section.type === 'block') {
          const config = BLOCK_REGISTRY[section.blockType]
          const BlockComponent = config.component
          return <BlockComponent block={section.item} />
        }
      })}
    </div>
  )
}
```

#### 2. **Block Registry** (`src/lib/blocks/blockRegistry.ts`)

**Purpose:** Central configuration mapping block types to components

**Structure:**
```typescript
export const BLOCK_REGISTRY: Record<string, BlockConfig> = {
  photo: {
    slug: 'photo',
    component: PhotoCard,
    layout: 'masonry',      // Renders in masonry grid
    priority: false,
  },
  photoBulk: {
    slug: 'photoBulk',
    component: PhotoCard,
    layout: 'masonry',
    priority: false,
  },
  featuredPhoto: {
    slug: 'featuredPhoto',
    component: FeaturedPhoto,
    layout: 'section-break', // Full-width, breaks masonry flow
    priority: true,
  },
  textCard: {
    slug: 'textCard',
    component: TextCard,
    layout: 'masonry',
    priority: false,
  },
}
```

**Key Concepts:**
- `layout: 'masonry'` → Items accumulate in masonry grid
- `layout: 'section-break'` → Full-width, flushes masonry accumulator
- `priority: true` → Images get Next.js priority loading

**Adding a New Block Type:**
1. Create component in `src/components/gallery/`
2. Add block definition in `src/collections/Gallery.ts`
3. Register in `BLOCK_REGISTRY`
4. Done! No other code changes needed.

#### 3. **Section Splitter** (`src/lib/blocks/sectionSplitter.ts`)

**Purpose:** Splits flat array of blocks into renderable sections

**Algorithm:**
```
Input: [photo, photo, featuredPhoto, photo, textCard]

Processing:
- photo → accumulate in masonry
- photo → accumulate in masonry
- featuredPhoto → flush masonry, add as section-break
- photo → start new masonry accumulation
- textCard → accumulate in masonry

Output: [
  { type: 'masonry', items: [photo, photo] },
  { type: 'block', blockType: 'featuredPhoto', item: {...} },
  { type: 'masonry', items: [photo, textCard] }
]
```

**Code Logic:**
```typescript
export function splitIntoSections(blocks: any[]): Section[] {
  const sections: Section[] = []
  let currentMasonryItems: any[] = []

  blocks.forEach((block) => {
    const config = BLOCK_REGISTRY[block.blockType]

    if (config.layout === 'masonry') {
      currentMasonryItems.push(block)
    } else if (config.layout === 'section-break') {
      // Flush masonry items
      if (currentMasonryItems.length > 0) {
        sections.push({ type: 'masonry', items: [...currentMasonryItems] })
        currentMasonryItems = []
      }
      // Add section break
      sections.push({ type: 'block', blockType: block.blockType, item: block })
    }
  })

  // Flush remaining masonry items
  if (currentMasonryItems.length > 0) {
    sections.push({ type: 'masonry', items: currentMasonryItems })
  }

  return sections
}
```

#### 4. **MasonrySection.tsx** (Client Component)
**Path:** `src/components/gallery/MasonrySection.tsx`

**Purpose:** Renders masonry grid sections with 2-column layout

**Features:**
- Uses block registry for dynamic component rendering
- Priority loading for first 4 items (above-fold)
- Photo modal/lightbox integration
- Mobile: 1 column, Desktop: 2 columns (CSS Grid)

**Key Code:**
```typescript
export default function MasonrySection({ items }: MasonrySectionProps) {
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const handlePhotoClick = (photo) => {
    // Disable on mobile (< 768px)
    if (window.innerWidth < 768) return
    setSelectedPhoto(photo)
  }

  return (
    <>
      <div className="masonry-section">
        {items.map((item, index) => {
          const config = BLOCK_REGISTRY[item.blockType]
          const BlockComponent = config.component
          const priority = index < 4 // First 4 get priority

          return (
            <BlockComponent
              key={item.id}
              block={item}
              priority={priority}
              onPhotoClick={handlePhotoClick} // For photos
            />
          )
        })}
      </div>

      <PhotoModal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        photo={selectedPhoto}
      />
    </>
  )
}
```

**CSS (styles.css):**
```css
.masonry-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 2 columns on desktop */
  gap: 20px;
  max-width: 1400px;
  margin: 60px auto;
  padding: 0 40px;
}

@media (max-width: 768px) {
  .masonry-section {
    grid-template-columns: 1fr; /* 1 column on mobile */
    gap: 16px;
    padding: 0 20px;
  }
}
```

#### 5. **Gallery Content Types**

##### a) **PhotoCard** (`src/components/gallery/PhotoCard.tsx`)

**Handles both:**
- Single photos (`photo` block)
- Bulk photos (`photoBulk` block - renders multiple images)

**Features:**
- Next.js Image optimization (AVIF/WebP)
- Responsive sizes prop: `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px`
- Scroll-reveal animation (Intersection Observer)
- Clickable for lightbox (desktop only)
- Grayscale filter support (`blackAndWhite` field)

**Scroll Reveal Animation:**
```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.unobserve(entry.target) // Animate only once
        }
      })
    },
    {
      threshold: 0.1,      // Trigger at 10% visibility
      rootMargin: '50px',  // Start 50px before entering viewport
    }
  )

  if (cardRef.current) {
    observer.observe(cardRef.current)
  }
}, [])
```

**CSS Animation:**
```css
.photo-card.reveal-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.photo-card.reveal-on-scroll.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

##### b) **FeaturedPhoto** (`src/components/gallery/FeaturedPhoto.tsx`)

**Purpose:** Full-width hero images with optional overlay

**Features:**
- Full viewport width (`sizes="100vw"`)
- Optional overlay with:
  - Rich text (Lexical) - headlines, descriptions
  - CTA button with link
  - Customizable font family, size, color
- Always priority loading
- Scroll-reveal animation

**Overlay Configuration (from Payload):**
```typescript
{
  enableOverlay: true,
  overlayText: { root: { children: [...] } }, // Lexical JSON
  buttonText: "Contact Me",
  buttonLink: "/contact",
  fontFamily: "lobster-two",
  fontSize: 64,
  fontColor: "#ffffff"
}
```

##### c) **TextCard** (`src/components/gallery/TextCard.tsx`)

**Purpose:** Full-width text content for storytelling

**Features:**
- Rich text content (Lexical)
- Background color options: `light`, `dark`, `accent`
- Max-width 800px for optimal readability
- Scroll-reveal animation

**Payload CMS Configuration:**
```typescript
{
  content: { root: { children: [...] } }, // Lexical JSON
  backgroundColor: "light" // or "dark", "accent"
}
```

##### d) **PhotoModal** (`src/components/gallery/PhotoModal.tsx`)

**Purpose:** Lightbox for full-size photo viewing

**Features:**
- Dark overlay backdrop
- Large centered image (quality: 95)
- Caption display
- Film metadata display (if `isFilmPhoto: true`):
  - Vintage camera icon
  - Film type (35mm, 645, 6x6, etc.)
  - Film stock (Kodak Gold 200, Portra 400, etc.)
- Close via: X button, ESC key, backdrop click
- Body scroll lock when open
- Desktop only (disabled on mobile)

### Gallery Collection Schema

**File:** `src/collections/Gallery.ts`

**Structure:**
```typescript
{
  slug: 'gallery',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      // Internal title, not displayed on site
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      // Toggle visibility
    },
    {
      name: 'items',
      type: 'blocks',
      blocks: [
        // Block 1: photo
        {
          slug: 'photo',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media' },
            { name: 'caption', type: 'text' },
            { name: 'isFilmPhoto', type: 'checkbox' },
            { name: 'filmType', type: 'select' },
            { name: 'filmStock', type: 'text' },
            { name: 'blackAndWhite', type: 'checkbox' },
          ]
        },
        // Block 2: photoBulk (same fields, but `images` is array)
        {
          slug: 'photoBulk',
          fields: [
            { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
            // ... same film/B&W fields applied to all images
          ]
        },
        // Block 3: featuredPhoto
        {
          slug: 'featuredPhoto',
          fields: [
            { name: 'image', type: 'upload' },
            { name: 'enableOverlay', type: 'checkbox' },
            { name: 'overlayText', type: 'richText', editor: lexicalEditor },
            { name: 'buttonText', type: 'text' },
            { name: 'buttonLink', type: 'text' },
            { name: 'fontFamily', type: 'select' },
            { name: 'fontSize', type: 'number' },
            { name: 'fontColor', type: 'text' },
          ]
        },
        // Block 4: textCard
        {
          slug: 'textCard',
          fields: [
            { name: 'content', type: 'richText', editor: lexicalEditor },
            { name: 'backgroundColor', type: 'select' },
          ]
        },
      ]
    }
  ]
}
```

**Key Points:**
- Blocks are draggable/reorderable in admin UI
- Each block type has `blockType` property (e.g., `"photo"`, `"featuredPhoto"`)
- Upload fields are relationships to `media` collection
- Rich text uses Lexical editor (JSON format)

### Media Collection

**File:** `src/collections/Media.ts`

**Schema:**
```typescript
{
  slug: 'media',
  upload: {
    crop: false,        // Not supported on Workers (no sharp)
    focalPoint: false,
  },
  fields: [
    { name: 'alt', type: 'text', required: true },
    { name: 'width', type: 'number', hidden: true },
    { name: 'height', type: 'number', hidden: true },
  ]
}
```

**Storage:**
- Files uploaded to Cloudflare R2 bucket
- URLs: `https://*.r2.cloudflarestorage.com/...`
- Width/height auto-populated on upload
- No local file storage - all in cloud

---

## Navbar Component Architecture

**File:** `src/components/layout/Navbar.tsx`

### Features

1. **Animated Signature Logo** (homepage only, first visit)
2. **Static Hero Logo** (always visible at top when not scrolled)
3. **Sticky Navbar** with scroll-triggered logo
4. **Session-based Animation** (plays once per browser session)

### Component Structure

```typescript
export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showStaticLogo, setShowStaticLogo] = useState(false)
  const [hideNavLinks, setHideNavLinks] = useState(true)
  const pathname = usePathname()

  // ... state management
}
```

### State Management

#### 1. **Animation Logic (useEffect)**

```typescript
useEffect(() => {
  if (pathname === '/') {
    const hasSeenAnimation = sessionStorage.getItem('hasSeenSignatureAnimation')

    if (!hasSeenAnimation) {
      // First visit: show animation
      setShowAnimation(true)
      setHideNavLinks(true)
      setShowStaticLogo(false)
    } else {
      // Subsequent visits: skip animation
      setShowStaticLogo(true)
      setHideNavLinks(false)
    }
  } else {
    // Non-homepage: always show static logo
    setShowStaticLogo(true)
    setHideNavLinks(false)
  }
}, [pathname])
```

**Key Points:**
- Animation only on homepage (`pathname === '/'`)
- Uses `sessionStorage` for session-based persistence
- `hasSeenSignatureAnimation` key set by `HomePageClient` component
- Nav links hidden during animation, fade in after

#### 2. **Scroll Detection (useEffect)**

```typescript
useEffect(() => {
  const handleScroll = () => {
    const scrollTop = window.scrollY
    setIsScrolled(scrollTop > 100)
  }

  window.addEventListener('scroll', handleScroll)
  return () => window.removeEventListener('scroll', handleScroll)
}, [])
```

**Behavior:**
- `isScrolled` triggers at 100px scroll
- Shows navbar center logo when scrolled
- Hides hero logo when scrolled

#### 3. **Animation Complete Callback**

```typescript
const handleAnimationComplete = () => {
  setHideNavLinks(false) // Fade in nav links
  // Animation stays visible (no fade-out)
}
```

### JSX Structure

```tsx
return (
  <>
    {/* Hero Logo Container (top of page) */}
    <div className={`hero-logo ${isScrolled ? 'hero-logo-hidden' : ''}`}>
      {showAnimation ? (
        <AnimatedSignature onAnimationComplete={handleAnimationComplete} />
      ) : showStaticLogo ? (
        <Image
          src="/images/BBLOGOWT.png"
          alt="Britnee Bourne Photography"
          width={240}
          height={240}
          className="hero-logo-image"
          priority
        />
      ) : null}
    </div>

    {/* Sticky Navbar */}
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${hideNavLinks ? 'navbar-hidden' : ''}`}>
      <div className="navbar-container">
        {/* Left: About Link */}
        <div className="navbar-left">
          <Link href="/about">ABOUT</Link>
        </div>

        {/* Center: Scroll-triggered Logo */}
        <div className={`navbar-center ${isScrolled ? 'navbar-center-visible' : ''}`}>
          <Image src="/images/BBLOGOWT.png" width={80} height={80} />
        </div>

        {/* Right: Contact Link */}
        <div className="navbar-right">
          <Link href="/contact">CONTACT</Link>
        </div>
      </div>
    </nav>
  </>
)
```

### CSS (styles.css)

#### Hero Logo
```css
.hero-logo {
  position: fixed;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  width: 240px;
  height: 240px;
  transition: opacity 0.3s ease-out;
}

.hero-logo-hidden {
  opacity: 0;
  pointer-events: none;
}

.hero-logo-image {
  opacity: 1;
}
```

#### Navbar
```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 90;
  background: transparent;
  padding: 20px 40px;
  transition: opacity 0.5s ease-in, background-color 0.3s ease-out;
}

.navbar-hidden {
  opacity: 0 !important;
  pointer-events: none;
}

.navbar-scrolled {
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
}

.navbar-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.3s ease-out;
}

.navbar-center-visible {
  opacity: 1;
}
```

### AnimatedSignature Component

**File:** `src/components/layout/AnimatedSignature.tsx`

**Purpose:** Netflix-style handwriting animation using SVG stroke technique

**Technique:**
1. SVG path with `stroke-dasharray` and `stroke-dashoffset`
2. Animate `stroke-dashoffset` from path length to 0
3. Use stroke as **mask** to progressively reveal logo image

**Code:**
```typescript
export default function AnimatedSignature({ onAnimationComplete }) {
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    // Calculate actual path length
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength()
      pathRef.current.style.strokeDasharray = `${pathLength}`
      pathRef.current.style.strokeDashoffset = `${pathLength}`
    }

    // Call completion callback after 3.2 seconds
    const timer = setTimeout(() => {
      if (onAnimationComplete) onAnimationComplete()
    }, 3200)

    return () => clearTimeout(timer)
  }, [onAnimationComplete])

  return (
    <div className="signature-animation-wrapper">
      <svg viewBox="420 0 1080 1080">
        <defs>
          <mask id="signatureMask">
            <path
              ref={pathRef}
              className="signature-path"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="60"
              d="M627,272c-12.38,23.83..." /* Long path data */
            />
          </mask>
        </defs>
        <image
          href="/images/BBLOGOWT.png"
          width="1920"
          height="1080"
          mask="url(#signatureMask)"
        />
      </svg>
    </div>
  )
}
```

**CSS Animation:**
```css
.signature-path {
  animation: drawSignature 3s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
}

@keyframes drawSignature {
  to {
    stroke-dashoffset: 0;
  }
}

.signature-svg-animated image {
  opacity: 0;
  animation: fadeInLogo 0.3s ease-out 0.2s forwards;
}

@keyframes fadeInLogo {
  to {
    opacity: 1;
  }
}
```

**Key Points:**
- Path traced in Adobe Illustrator from logo PNG
- `getTotalLength()` ensures accurate animation timing
- Mask technique reveals actual logo (not just white strokes)
- Animation duration: 3.2s total (3s draw + 0.2s delay)

### HomePageClient Component

**File:** `src/components/layout/HomePageClient.tsx`

**Purpose:** Manages homepage content visibility during animation

```typescript
export default function HomePageClient({ children }) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const hasSeenAnimation = sessionStorage.getItem('hasSeenSignatureAnimation')

    if (!hasSeenAnimation) {
      // First visit: set session flag, delay content
      sessionStorage.setItem('hasSeenSignatureAnimation', 'true')
      const timer = setTimeout(() => setShowContent(true), 3200)
      return () => clearTimeout(timer)
    } else {
      // Subsequent visits: show content immediately
      setShowContent(true)
    }
  }, [])

  return (
    <div
      style={{
        opacity: showContent ? 1 : 0,
        transition: showContent ? 'opacity 0.5s ease-in' : 'none'
      }}
    >
      {children}
    </div>
  )
}
```

**Usage (page.tsx):**
```typescript
export default async function HomePage() {
  return (
    <HomePageClient>
      <GalleryGrid />
    </HomePageClient>
  )
}
```

---

## Key File Paths Reference

### Collections & Config
- `src/collections/Gallery.ts` - Gallery content schema
- `src/collections/Media.ts` - Media upload schema
- `src/collections/Users.ts` - Admin user schema
- `src/payload.config.ts` - Payload CMS configuration
- `next.config.ts` - Next.js configuration (wrapped with `withPayload()`)
- `wrangler.jsonc` - Cloudflare Workers configuration

### Gallery Components
- `src/components/gallery/GalleryGrid.tsx` - Main gallery container (Server)
- `src/components/gallery/MasonrySection.tsx` - Masonry grid renderer (Client)
- `src/components/gallery/PhotoCard.tsx` - Photo renderer (Client)
- `src/components/gallery/FeaturedPhoto.tsx` - Featured photo renderer (Client)
- `src/components/gallery/TextCard.tsx` - Text card renderer (Client)
- `src/components/gallery/PhotoModal.tsx` - Lightbox modal (Client)

### Block Registry System
- `src/lib/blocks/blockRegistry.ts` - Block type → component mapping
- `src/lib/blocks/sectionSplitter.ts` - Splits blocks into sections
- `src/lib/blocks/types.ts` - TypeScript types for blocks

### Layout Components
- `src/components/layout/Navbar.tsx` - Navbar with animated logo (Client)
- `src/components/layout/AnimatedSignature.tsx` - SVG animation (Client)
- `src/components/layout/HomePageClient.tsx` - Content visibility wrapper (Client)
- `src/components/layout/Footer.tsx` - Footer component

### App Routes
- `src/app/(frontend)/layout.tsx` - Frontend layout (Navbar, Footer)
- `src/app/(frontend)/page.tsx` - Homepage (GalleryGrid)
- `src/app/(frontend)/about/page.tsx` - About page
- `src/app/(frontend)/contact/page.tsx` - Contact page
- `src/app/(payload)/layout.tsx` - Payload admin layout (auto-generated)
- `src/app/(payload)/admin/[[...segments]]/page.tsx` - Admin routes

### Styles
- `src/app/(frontend)/styles.css` - All frontend styles (1000+ lines)

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `.env.local` - Environment variables (not in repo)
- `.env.example` - Example environment variables

---

## Development Commands

```bash
# Install dependencies
pnpm install

# Development
pnpm dev                    # Start dev server (uses remote D1/R2)
pnpm devsafe                # Clean .next/.open-next then dev

# Type Generation
pnpm generate:types         # Generate Payload + Cloudflare types
pnpm generate:types:payload # Generate only Payload types
pnpm generate:types:cloudflare # Generate only Cloudflare env types

# Database
payload migrate             # Run database migrations
wrangler d1 execute my-app --remote --command "SQL HERE"

# Build & Deploy
pnpm build                  # Build Next.js app
pnpm deploy:database        # Run migrations to production D1
pnpm deploy:app             # Build and deploy to Cloudflare Workers
pnpm deploy                 # Full deploy (database + app)

# Testing
pnpm test                   # Run all tests
pnpm test:int               # Integration tests (Vitest)
pnpm test:e2e               # E2E tests (Playwright)

# Linting
pnpm lint                   # ESLint
```

---

## Important Development Notes

### 1. **Server vs Client Components**

**Server Components** (default in App Router):
- `GalleryGrid.tsx` - Fetches data from Payload
- All `page.tsx` files
- `layout.tsx` files (except where 'use client' needed)

**Client Components** (`'use client'` directive):
- `MasonrySection.tsx` - Uses useState for modal
- `PhotoCard.tsx`, `FeaturedPhoto.tsx`, `TextCard.tsx` - Intersection Observer
- `PhotoModal.tsx` - Event handlers, DOM manipulation
- `Navbar.tsx` - useState, useEffect, usePathname
- `AnimatedSignature.tsx` - useRef, useEffect, SVG animation
- `HomePageClient.tsx` - useState, useEffect, sessionStorage

**Rule of Thumb:**
- Use Server Components for data fetching
- Use Client Components for interactivity (state, events, browser APIs)

### 2. **Database is Remote (IMPORTANT!)**

- `wrangler.jsonc` sets `"remote": true` for D1 and R2
- **There is no local database** - dev uses production database
- Be careful with destructive operations (deletes, migrations)
- Use `wrangler d1 execute my-app --remote` to query database
- User deletion example:
  ```bash
  wrangler d1 execute my-app --remote --command "DELETE FROM users WHERE email = 'email@example.com'"
  ```

### 3. **Image Optimization**

- All images stored in Cloudflare R2
- Next.js Image component auto-generates AVIF/WebP
- Remote patterns configured in `next.config.ts`:
  ```typescript
  remotePatterns: [
    { hostname: '**.r2.cloudflarestorage.com' },
    { hostname: '**.r2.dev' },
  ]
  ```
- Priority loading for above-fold images (first 4 in masonry)

### 4. **Scroll Reveal Animation**

All gallery components use Intersection Observer for scroll-reveal:

```typescript
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
          observer.unobserve(entry.target) // Only animate once
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '50px',
    }
  )

  if (ref.current) observer.observe(ref.current)
  return () => { if (ref.current) observer.unobserve(ref.current) }
}, [])
```

**CSS:**
```css
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.reveal-on-scroll.revealed {
  opacity: 1;
  transform: translateY(0);
}
```

### 5. **Session Storage for Animation**

- `sessionStorage.getItem('hasSeenSignatureAnimation')`
- Set by `HomePageClient` component
- Checked by `Navbar` component
- Animation plays once per browser session
- To test animation again: clear sessionStorage or use incognito

### 6. **Adding New Pages**

```
src/app/(frontend)/
└── new-page/
    └── page.tsx
```

Example:
```typescript
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
      <p>Content here</p>
    </div>
  )
}
```

Navbar/Footer automatically included via `(frontend)/layout.tsx`.

### 7. **Accessing Payload Admin**

- URL: `http://localhost:3000/admin` (dev) or `your-domain.com/admin` (prod)
- Separate route group: `(payload)/admin`
- Auto-generated UI by Payload CMS
- User management: `/admin/collections/users`
- Gallery management: `/admin/collections/gallery`
- Media management: `/admin/collections/media`

---

## Common Tasks

### Add a New Block Type to Gallery

1. **Create Component** (`src/components/gallery/VideoBlock.tsx`):
   ```typescript
   'use client'

   export default function VideoBlock({ block }) {
     return (
       <div className="video-block">
         <video src={block.video.url} controls />
       </div>
     )
   }
   ```

2. **Add to Gallery Collection** (`src/collections/Gallery.ts`):
   ```typescript
   {
     slug: 'video',
     labels: { singular: 'Video', plural: 'Videos' },
     fields: [
       { name: 'video', type: 'upload', relationTo: 'media' },
       { name: 'caption', type: 'text' },
     ]
   }
   ```

3. **Register Block** (`src/lib/blocks/blockRegistry.ts`):
   ```typescript
   import VideoBlock from '@/components/gallery/VideoBlock'

   export const BLOCK_REGISTRY = {
     // ... existing blocks
     video: {
       slug: 'video',
       component: VideoBlock,
       layout: 'masonry', // or 'section-break'
       priority: false,
     },
   }
   ```

4. **Done!** No changes needed to `GalleryGrid`, `MasonrySection`, or `sectionSplitter`.

### Query the Database

```bash
# List all users
wrangler d1 execute my-app --remote --command "SELECT * FROM users"

# Count gallery items
wrangler d1 execute my-app --remote --command "SELECT COUNT(*) FROM gallery"

# Delete a user
wrangler d1 execute my-app --remote --command "DELETE FROM users WHERE email = 'email@example.com'"
```

### Run Database Migrations

```bash
# Generate migration
payload migrate:create

# Run migrations
payload migrate

# Production
pnpm run deploy:database
```

### Test Animation Again

1. Open DevTools → Application → Session Storage
2. Delete `hasSeenSignatureAnimation` key
3. Refresh page

Or use incognito mode.

---

## Deployment Architecture

```
User Request
    ↓
Cloudflare Workers (Edge)
    ↓
Next.js App (SSR/SSG)
    ↓
├── Static Assets (R2)
├── Database Queries (D1)
└── Image Uploads (R2)
```

**Environment Variables** (`.env.local`):
```bash
PAYLOAD_SECRET=your-secret-here
DATABASE_URL=unused-but-required-by-payload
CLOUDFLARE_ENV=production
```

**Cloudflare Secrets** (via wrangler):
- `PAYLOAD_SECRET` - Used for JWT signing
- Database/R2 accessed via bindings (no secrets needed)

---

## Troubleshooting

### "Database connection error"
- Restart dev server: `pnpm dev`
- Check `wrangler.jsonc` database_id is correct
- Verify remote access: `wrangler d1 execute my-app --remote --command "SELECT 1"`

### Animation not playing
- Check sessionStorage for `hasSeenSignatureAnimation` key
- Clear sessionStorage and refresh
- Ensure `HomePageClient` wraps homepage content

### Images not loading
- Verify R2 bucket exists: `wrangler r2 bucket list`
- Check `next.config.ts` remotePatterns match R2 URLs
- Inspect image URL in browser - should be `*.r2.cloudflarestorage.com`

### Build errors
- Clear cache: `rm -rf .next .open-next`
- Regenerate types: `pnpm generate:types`
- Check for missing dependencies: `pnpm install`

### Scroll reveal not working
- Verify `reveal-on-scroll` class is applied
- Check Intersection Observer in DevTools
- Ensure component is Client Component ('use client')

---

## Summary for LLMs

**When modifying this codebase:**

1. **Gallery Changes**: Use block registry pattern - add to registry, don't hardcode types
2. **Data Fetching**: Use Server Components with `getPayload()` API
3. **Interactivity**: Use Client Components with `'use client'` directive
4. **Database**: Remember it's remote (production) - be careful!
5. **Images**: Use Next.js Image component, verify R2 URLs
6. **Animations**: All components use scroll-reveal pattern
7. **Navbar**: Animation state managed via sessionStorage
8. **Deployment**: Run migrations before deploying app

**Key Patterns to Preserve:**
- Block registry extensibility
- Server/Client component separation
- Intersection Observer for scroll reveals
- Session-based animation (not first-visit cookie)
- Priority loading for above-fold images

**Don't Break:**
- Block registry lookups (no hardcoded `if (blockType === 'photo')`)
- SVG animation timing (3.2s total)
- Remote database configuration
- Next.js Image optimization
- Scroll-reveal CSS classes

---

## Contact & Support

For questions about:
- **Payload CMS**: https://payloadcms.com/docs
- **Next.js 15**: https://nextjs.org/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers
- **This Project**: Ask the user (Elliot Bourne)

---

**Last Updated:** 2025-01-03
**Project Version:** 1.0.0
**Next.js Version:** 15.4.4
**Payload CMS Version:** 3.59.1
