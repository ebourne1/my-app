# Photographer Portfolio CMS

A modern, flexible photography portfolio built with Next.js 15, Payload CMS 3.0, and Cloudflare. Features a beautiful masonry gallery layout with support for featured photos, text cards, and bulk photo uploads.

## Features

✨ **Dynamic Gallery System**
- Pinterest-style masonry layout (2 columns on desktop, 1 on mobile)
- Mix photos, featured photos, and text cards in any order
- Drag-and-drop reordering in admin panel
- Bulk photo uploads for efficient workflow

🎨 **Flexible Content Types**
- **Photos**: Regular gallery images with optional captions
- **Featured Photos**: Full-width hero images with optional overlay, text, and CTA button
- **Text Cards**: Rich text content for storytelling with 3 background styles

🚀 **Modern Stack**
- Next.js 15 with Server Components for optimal performance
- Payload CMS 3.0 for powerful, type-safe content management
- Cloudflare R2 for image storage
- Cloudflare D1 SQLite for database
- Automatic WebP/AVIF image optimization

🔧 **Extensible Architecture**
- Block registry pattern for easy additions (video, carousel, etc.)
- No code changes needed to add new block types
- Type-safe with auto-generated TypeScript types

---

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Cloudflare account (for deployment)

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Authenticate with Cloudflare (if not already)**
   ```bash
   pnpm wrangler login
   ```

3. **Start the development server**
   ```bash
   pnpm dev
   ```

   This will start both:
   - Next.js dev server at `http://localhost:3001` (or next available port)
   - Payload admin panel at `http://localhost:3001/admin`

4. **Create your first admin user**

   Navigate to `http://localhost:3001/admin` and follow the setup wizard to create your admin account.

---

## Development Commands

### Start Development Server
```bash
pnpm dev
```
Starts Next.js and Payload CMS in development mode with hot reload. Automatically connects to Cloudflare remote bindings for R2 and D1.

### Database Migrations

**Create a new migration** (after schema changes):
```bash
pnpm payload migrate:create
```

**Run pending migrations**:
```bash
pnpm payload migrate
```

**Check migration status**:
```bash
pnpm payload migrate:status
```

### Build for Production
```bash
pnpm build
```
Creates an optimized production build.

### Deploy to Cloudflare
```bash
pnpm run deploy
```
Runs migrations, builds the app, and deploys to Cloudflare Workers.

### Wrangler CLI
Access the full Wrangler CLI:
```bash
pnpm wrangler [command]
```

Common Wrangler commands:
- `pnpm wrangler d1 execute D1 --command "SELECT * FROM users"` - Query D1 database
- `pnpm wrangler r2 bucket list` - List R2 buckets
- `pnpm wrangler tail` - Stream live logs from production

---

## Using the CMS

### Accessing the Admin Panel

1. Start dev server: `pnpm dev`
2. Navigate to: `http://localhost:3001/admin`
3. Log in with your admin credentials

### Creating a Gallery

1. **Navigate to Gallery collection** in the admin sidebar
2. **Click "Create New"**
3. **Add items** using the block types:

   **Photo Block** - Single photo upload
   - Upload an image
   - Add optional caption
   - Best for individual photos

   **Bulk Photos Block** - Multiple photo upload
   - Select multiple images at once
   - Ideal for adding many photos quickly
   - No individual captions (for batch uploads)

   **Featured Photo Block** - Hero/highlight image
   - Upload full-width featured image
   - Optional overlay with:
     - Rich text (headline, description)
     - CTA button with custom text and link
   - Great for section headers or standout moments

   **Text Card Block** - Storytelling content
   - Rich text editor with formatting
   - Choose background style: Light, Dark, or Accent
   - Perfect for context, stories, or descriptions

4. **Reorder items** by dragging blocks up/down
5. **Save as draft** or **Publish** when ready

### Managing Media

- **Upload images**: Go to Media collection
- **Edit alt text**: Click on any image to edit accessibility text
- **View image details**: See dimensions, file size, URL
- **Delete unused media**: Remove images no longer in use

### Publishing Workflow

- **Draft**: Save work in progress (not visible on site)
- **Published**: Make gallery live on the website
- Toggle the "Published" checkbox in the sidebar

---

## Project Structure

```
my-app/
├── src/
│   ├── app/
│   │   └── (frontend)/
│   │       ├── layout.tsx         # Main layout with Navbar/Footer
│   │       ├── page.tsx           # Homepage (renders gallery)
│   │       └── styles.css         # Global styles
│   ├── collections/
│   │   ├── Gallery.ts             # Gallery collection (blocks field)
│   │   ├── Media.ts               # Image uploads
│   │   └── Users.ts               # Admin users
│   ├── components/
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx    # Main container
│   │   │   ├── MasonrySection.tsx # Masonry layout
│   │   │   ├── PhotoCard.tsx      # Photo rendering
│   │   │   ├── FeaturedPhoto.tsx  # Featured photo
│   │   │   └── TextCard.tsx       # Text content
│   │   └── layout/
│   │       ├── Navbar.tsx         # Site navigation
│   │       └── Footer.tsx         # Site footer
│   ├── lib/
│   │   └── blocks/
│   │       ├── types.ts           # TypeScript types
│   │       ├── blockRegistry.ts   # Block configuration
│   │       └── sectionSplitter.ts # Section logic
│   ├── payload.config.ts          # Payload CMS config
│   └── payload-types.ts           # Auto-generated types
├── next.config.ts                 # Next.js config
├── wrangler.toml                  # Cloudflare config
└── package.json
```

---

## Architecture Overview

### Block Registry Pattern

The gallery uses a **configuration-based block registry** for extensibility:

1. **Define block in Payload** (`src/collections/Gallery.ts`)
2. **Create React component** (`src/components/gallery/`)
3. **Register in blockRegistry** (`src/lib/blocks/blockRegistry.ts`)

**No other code changes needed!** The rendering system automatically handles:
- Dynamic component lookup
- Section splitting (masonry vs full-width)
- Priority image loading
- Type safety

### Masonry Layout

Uses **react-masonry-css** for intelligent column distribution:
- Items distributed round-robin across columns for balance
- Maintains aspect ratios without stretching
- photoBulk blocks automatically flattened into individual items
- Responsive: 2 columns (desktop) → 1 column (mobile)
- True masonry behavior with natural item flow

### Image Optimization

Next.js Image component automatically:
- Converts to AVIF/WebP formats
- Generates responsive sizes
- Lazy loads off-screen images
- Prevents layout shift

Images are served from Cloudflare R2 with configured remote patterns.

---

## Extending the Gallery

### Adding a New Block Type (Example: Video)

**Step 1: Create Component**

`src/components/gallery/VideoBlock.tsx`:
```tsx
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

**Step 2: Add to Gallery Collection**

`src/collections/Gallery.ts`:
```ts
{
  slug: 'video',
  labels: { singular: 'Video', plural: 'Videos' },
  fields: [
    { name: 'videoUrl', type: 'text', required: true },
    { name: 'thumbnail', type: 'upload', relationTo: 'media' },
    { name: 'caption', type: 'text' }
  ]
}
```

**Step 3: Register Block**

`src/lib/blocks/blockRegistry.ts`:
```ts
import VideoBlock from '@/components/gallery/VideoBlock'

export const BLOCK_REGISTRY = {
  // ... existing blocks
  video: {
    slug: 'video',
    component: VideoBlock,
    layout: 'masonry', // or 'section-break' for full-width
    priority: false
  }
}
```

**Done!** The video block is now available in the admin panel and will render automatically.

---

## Cloudflare Configuration

### Local Development

Wrangler automatically creates **remote bindings** to your Cloudflare services:
- **R2**: Image storage (production bucket)
- **D1**: SQLite database (production database)

This is configured in `src/payload.config.ts`:
```ts
const cloudflareRemoteBindings = true
```

### Environment Variables

Create `.env.local` (not committed):
```bash
PAYLOAD_SECRET=your-secret-key-here
CLOUDFLARE_ENV=production
```

Generate a secret:
```bash
openssl rand -base64 32
```

### R2 Image Storage

Images are uploaded to R2 and served with Next.js optimization:
- Bucket name configured in `wrangler.toml`
- Remote patterns configured in `next.config.ts`
- Automatic format conversion (AVIF/WebP)

### D1 Database

SQLite database with Payload schema:
- Managed by Payload migrations
- Access via Wrangler CLI: `pnpm wrangler d1 execute D1 --command "..."`
- View in Cloudflare Dashboard under D1

---

## Deployment

### First Deployment

1. **Create migrations** (if any schema changes):
   ```bash
   pnpm payload migrate:create
   ```

2. **Deploy**:
   ```bash
   pnpm run deploy
   ```

   This will:
   - Run pending migrations
   - Build the Next.js app
   - Upload to Cloudflare Workers

3. **View your site** at the Cloudflare Workers URL (shown in deploy output)

### Custom Domain

Configure in Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select your worker
3. Add custom domain under Settings → Domains

Then update `next.config.ts` with your domain:
```ts
images: {
  remotePatterns: [
    // ... existing R2 patterns
    {
      protocol: 'https',
      hostname: 'your-domain.com',
      pathname: '/**',
    }
  ]
}
```

---

## Troubleshooting

### "Database locked" error

If you see database locked errors during development:
```bash
pnpm wrangler d1 execute D1 --command "PRAGMA journal_mode=WAL;" --remote
```

### Images not loading

1. Check R2 remote patterns in `next.config.ts`
2. Verify R2 bucket binding in `wrangler.toml`
3. Check Cloudflare R2 bucket exists and has correct permissions

### Migration errors

Reset migrations (⚠️ destructive):
```bash
pnpm wrangler d1 execute D1 --command "DROP TABLE IF EXISTS payload_migrations;" --remote
pnpm payload migrate
```

### Port already in use

Next.js will automatically use the next available port:
- Default: 3000
- If in use: 3001, 3002, etc.
- Check output for actual port: `Local: http://localhost:XXXX`

---

## Performance

### Image Optimization

- AVIF format (~50% smaller than JPEG)
- WebP fallback (~30% smaller than JPEG)
- Responsive sizes for different devices
- Priority loading for above-fold images
- Lazy loading for off-screen images

### Bundle Size

Current deployment requires **Paid Workers** plan due to bundle size limits (3MB free tier).

To reduce bundle size:
- Minimize dependencies
- Use dynamic imports for large libraries
- Tree-shake unused code

### Core Web Vitals Target

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

Monitor with Lighthouse or WebPageTest.

---

## Resources

### Documentation
- [Next.js 15](https://nextjs.org/docs)
- [Payload CMS 3.0](https://payloadcms.com/docs)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)

### Support
- [Payload Discord](https://discord.com/invite/payload)
- [Payload GitHub Discussions](https://github.com/payloadcms/payload/discussions)
- [Cloudflare Community](https://community.cloudflare.com/)

---

## Known Issues

### GraphQL
Full GraphQL support not guaranteed when deployed due to [upstream Workers issue](https://github.com/cloudflare/workerd/issues/5175).

### Worker Size Limits
Requires Paid Workers plan due to 3MB bundle size limit. We recommend monitoring your bundle size as you add features.

---

## License

[Your License Here]

---

## Support

For issues or questions:
- Check the [troubleshooting section](#troubleshooting)
- Review [Payload CMS docs](https://payloadcms.com/docs)
- Ask in [Payload Discord](https://discord.com/invite/payload)
