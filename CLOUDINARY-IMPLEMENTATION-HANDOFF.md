# Cloudinary Film Border Implementation - LLM Handoff

## Project Context

**Project:** Photography portfolio built with Next.js 15, Payload CMS 3, and Cloudflare infrastructure
**Stack:** Next.js 15.4.4, Payload CMS 3.59.1, React 19, TypeScript, Cloudflare Workers + D1 + R2
**Current State:** Dev server running on http://localhost:3002
**Goal:** Implement film borders on photographs using Cloudinary for on-demand image transformation

---

## What Was Already Built

### 1. Database Schema (✅ KEEP)
- **Media Collection** (`src/collections/Media.ts`):
  - Added `borderedVersion` group field (lines 35-75)
  - ⚠️ **This field is NO LONGER NEEDED** for Cloudinary approach, but keep it for now (can remove later)

- **Gallery Collection** (`src/collections/Gallery.ts`):
  - Added `applyFilmBorder` checkbox to all photo blocks:
    - `photo` block (lines 135-161)
    - `photoBulk` block (lines 245-271)
    - `photoBulk3Across` block (lines 355-381)
  - Added `filmBorderNumber` select field (1-8) to all blocks
  - ✅ **KEEP THESE** - they tell Cloudinary which border to apply

### 2. Film Border Assets (✅ KEEP)
- **Location:** `src/assets/film-borders/`
- **Files:** 32 optimized PNG files (11 MB total, already optimized from 251 MB)
- **Naming pattern:** `FILM-FRAME_OVERLAY-{1-8}-{horizontal|vertical}{-bw}.png`
- **Status:** ✅ Ready to upload to Cloudinary

### 3. Processing Script (❌ DELETE LATER)
- **Files to eventually remove:**
  - `scripts/process-film-borders.ts`
  - `scripts/payload-script.config.ts`
  - `scripts/test-script.ts`
- **Don't delete yet** - keep as reference during implementation

### 4. Component Updates (⚠️ NEED TO MODIFY)
All these components were updated to check for `borderedVersion.url`. They need to be changed to use Cloudinary URLs instead:
- `src/components/gallery/PhotoCard.tsx` (lines 119-123)
- `src/components/gallery/PhotoModal.tsx` (lines 55-59)
- `src/components/gallery/FeaturedPhoto.tsx` (lines 96-100)

---

## Architecture Decision: Why Cloudinary

### Previous Approach (Abandoned)
- Pre-process borders using Sharp (Node.js)
- Store bordered versions in R2
- Problem: Requires running script locally or in CI

### New Approach (Implement This)
- Upload film borders to Cloudinary
- Apply borders on-demand via Cloudinary URL transformations
- Cloudinary fetches originals from R2, applies border, optimizes, caches
- No build scripts, no local processing needed

### Benefits
1. ✅ No local/CI processing required
2. ✅ Change borders without rebuilding site
3. ✅ Automatic image optimization (WebP/AVIF)
4. ✅ All on Cloudflare (simpler architecture)
5. ✅ Free tier sufficient for portfolio traffic

---

## Static Site Generation Strategy

### Decision: Hybrid Static/Dynamic Architecture

**Homepage:** Static with ISR (Incremental Static Regeneration)
- Pre-rendered at build time for maximum performance
- Automatically regenerates on schedule or webhook trigger
- Instant page loads for users
- SEO-friendly static HTML

**Future Features:** Dynamic routes available
- Client galleries with authentication (when needed)
- Protected/personalized content
- All runs on Cloudflare edge

### Implementation for Homepage

Add to `src/app/(frontend)/page.tsx`:

```tsx
// Enable ISR - page rebuilds automatically every hour
export const revalidate = 3600 // seconds

// OR for full static (manual rebuild only):
// export const dynamic = 'force-static'

export default async function HomePage() {
  return (
    <HomePageClient>
      <GalleryGrid />
    </HomePageClient>
  )
}
```

### Why This Approach?

1. **Performance:** Static HTML = instant loads
2. **SEO:** Pre-rendered content = better search ranking
3. **Flexibility:** Can add dynamic routes later without architecture change
4. **Automatic updates:** ISR rebuilds page when gallery changes (via webhook)
5. **Cloudinary compatible:** Works perfectly with Cloudinary URLs in static HTML

### Deployment Configuration

**Cloudflare Pages:**
- Build command: `pnpm run build`
- Output directory: `.next`
- Framework preset: Next.js

**Don't set** `output: 'export'` in `next.config.ts` - this forces full static and disables ISR.
Leave it unset for hybrid static/dynamic capability.

### Optional: Webhook Auto-Rebuild

To trigger rebuild when gallery updates in Payload:

```tsx
// In src/collections/Gallery.ts hooks:
afterChange: [
  async ({ doc }) => {
    // Trigger Cloudflare Pages rebuild
    await fetch(process.env.CLOUDFLARE_PAGES_WEBHOOK_URL, {
      method: 'POST',
    })
  }
]
```

This makes the workflow:
1. Edit gallery in Payload admin
2. Click "Save"
3. Webhook triggers rebuild
4. Wait 2-3 minutes
5. Updated site is live

**No terminal access needed!**

---

## Implementation Steps

### Phase 1: Cloudinary Setup

#### 1.1 Create Cloudinary Account
1. Sign up at https://cloudinary.com
2. Select free tier (25 credits/month = ~25,000 transformations)
3. Note your **Cloud Name** (will be in dashboard URL: `https://cloudinary.com/console/c-{CLOUD_NAME}`)

#### 1.2 Upload Film Border Overlays
Upload all 32 film borders from `src/assets/film-borders/` to Cloudinary:

**Using Cloudinary UI:**
1. Go to Media Library
2. Create folder: `film-borders`
3. Upload all 32 PNG files
4. **Important:** Set public IDs to match filenames without extension:
   - `FILM-FRAME_OVERLAY-1-horizontal-bw.png` → public ID: `film-borders/FILM-FRAME_OVERLAY-1-horizontal-bw`
   - `FILM-FRAME_OVERLAY-1-horizontal.png` → public ID: `film-borders/FILM-FRAME_OVERLAY-1-horizontal`
   - etc.

**Or using Cloudinary CLI (faster):**
```bash
npm install -g cloudinary-cli
cloudinary config:set cloud_name=YOUR_CLOUD_NAME api_key=YOUR_KEY api_secret=YOUR_SECRET

# Upload all borders
cd src/assets/film-borders
for file in *.png; do
  cloudinary uploader:upload "$file" --public-id "film-borders/${file%.png}"
done
```

#### 1.3 Enable Fetch from R2
Configure Cloudinary to fetch images from your R2 bucket:

1. Go to Settings → Security → Allowed fetch domains
2. Add your R2 domain patterns:
   - `*.r2.cloudflarestorage.com`
   - `*.r2.dev`
   - Any custom domain you use for R2

#### 1.4 Add Environment Variables
Add to `.env.local`:
```bash
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

---

### Phase 2: Code Implementation

#### 2.1 Create Cloudinary Helper Utility
Create new file: `src/lib/cloudinary.ts`

```typescript
/**
 * Cloudinary URL Builder for Film Borders
 *
 * This utility generates Cloudinary transformation URLs that:
 * 1. Fetch original images from R2
 * 2. Apply film border overlays based on user selection
 * 3. Optimize to WebP/AVIF with quality settings
 * 4. Generate responsive sizes
 */

interface CloudinaryOptions {
  imageUrl: string
  width?: number
  height?: number
  applyFilmBorder?: boolean
  filmBorderNumber?: number
  isBlackAndWhite?: boolean
  quality?: number
  format?: 'auto' | 'webp' | 'avif'
}

/**
 * Determine if image is portrait or landscape based on dimensions
 * Falls back to 'vertical' if dimensions are unknown
 */
function getOrientation(width?: number, height?: number): 'horizontal' | 'vertical' {
  if (!width || !height) return 'vertical' // Default to vertical
  return width >= height ? 'horizontal' : 'vertical'
}

/**
 * Build Cloudinary transformation URL
 */
export function getCloudinaryUrl(options: CloudinaryOptions): string {
  const {
    imageUrl,
    width,
    height,
    applyFilmBorder = false,
    filmBorderNumber,
    isBlackAndWhite = false,
    quality = 85,
    format = 'auto',
  } = options

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

  if (!cloudName) {
    console.error('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set, returning original URL')
    return imageUrl
  }

  // Start building transformation string
  const transformations: string[] = []

  // Apply film border if requested
  if (applyFilmBorder && filmBorderNumber) {
    const orientation = getOrientation(width, height)
    const bwSuffix = isBlackAndWhite ? '-bw' : ''
    const borderPublicId = `film-borders/FILM-FRAME_OVERLAY-${filmBorderNumber}-${orientation}${bwSuffix}`

    // Apply overlay with proper positioning and blending
    transformations.push(`l_${borderPublicId.replace(/\//g, ':')}`) // Replace / with : for nested folders
    transformations.push('fl_layer_apply') // Apply the overlay
  }

  // Add responsive sizing if dimensions provided
  if (width) {
    transformations.push(`w_${width}`)
  }
  if (height) {
    transformations.push(`h_${height}`)
  }

  // Add optimization flags
  transformations.push(`f_${format}`) // Format (auto = automatic best format)
  transformations.push(`q_${quality}`) // Quality
  transformations.push('c_limit') // Don't upscale

  // Build final URL
  const transformationString = transformations.join(',')
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformationString}/${imageUrl}`
}

/**
 * Get orientation from Media object
 * Helper for components that have access to image metadata
 */
export function getOrientationFromMedia(media: { width?: number; height?: number }): 'horizontal' | 'vertical' {
  return getOrientation(media.width, media.height)
}
```

**Key Implementation Notes:**
- Cloudinary uses `:` instead of `/` for nested folder paths in overlays
- `fl_layer_apply` is required after specifying an overlay
- `c_limit` prevents upscaling (maintains quality)
- `f_auto` automatically serves WebP/AVIF based on browser support

---

#### 2.2 Update PhotoCard Component
File: `src/components/gallery/PhotoCard.tsx`

**Find lines 119-124:**
```typescript
// OLD CODE (remove this):
const hasBorderedVersion = image.borderedVersion?.url
const imageUrl = hasBorderedVersion ? image.borderedVersion.url : image.url
const width = hasBorderedVersion ? (image.borderedVersion.width || 1200) : (image.width || 1200)
const height = hasBorderedVersion ? (image.borderedVersion.height || 800) : (image.height || 800)
const alt = image.alt || 'Gallery photo'
```

**Replace with:**
```typescript
import { getCloudinaryUrl } from '@/lib/cloudinary'

// Inside PhotoCardItem component, add these props:
interface PhotoCardItemProps {
  image: Media
  caption?: string
  priority: boolean
  onClick?: () => void
  blackAndWhite?: boolean
  applyFilmBorder?: boolean        // NEW
  filmBorderNumber?: number        // NEW
}

// Update the destructuring to include new props:
function PhotoCardItem({
  image,
  caption,
  priority,
  onClick,
  blackAndWhite = false,
  applyFilmBorder = false,          // NEW
  filmBorderNumber,                 // NEW
}: PhotoCardItemProps) {
  // NEW CODE:
  const width = image.width || 1200
  const height = image.height || 800
  const alt = image.alt || 'Gallery photo'

  // Generate Cloudinary URL with film border if enabled
  const imageUrl = getCloudinaryUrl({
    imageUrl: image.url || '',
    width,
    height,
    applyFilmBorder,
    filmBorderNumber,
    isBlackAndWhite: blackAndWhite,
  })
```

**Then update the PhotoCard component to pass these props down:**

Find the PhotoCardItem calls (around lines 52 and 82) and add the new props:

```typescript
// For bulk photos (line ~52):
<PhotoCardItem
  key={image.id || `bulk-${idx}`}
  image={image}
  caption={undefined}
  priority={priority && idx === 0}
  blackAndWhite={block.blackAndWhite}
  applyFilmBorder={block.applyFilmBorder}      // NEW
  filmBorderNumber={block.filmBorderNumber}    // NEW
  onClick={...}
/>

// For single photo (line ~82):
<PhotoCardItem
  image={image}
  caption={block.caption}
  priority={priority}
  blackAndWhite={block.blackAndWhite}
  applyFilmBorder={block.applyFilmBorder}      // NEW
  filmBorderNumber={block.filmBorderNumber}    // NEW
  onClick={...}
/>
```

---

#### 2.3 Update PhotoModal Component
File: `src/components/gallery/PhotoModal.tsx`

**Find lines 54-60:**
```typescript
// OLD CODE (remove):
const { image, caption, isFilmPhoto, filmType, filmStock } = photo
const hasBorderedVersion = image.borderedVersion?.url
const imageUrl = hasBorderedVersion ? image.borderedVersion.url : image.url
const width = hasBorderedVersion ? (image.borderedVersion.width || 1200) : (image.width || 1200)
const height = hasBorderedVersion ? (image.borderedVersion.height || 800) : (image.height || 800)
const alt = image.alt || 'Gallery photo'
```

**Replace with:**
```typescript
import { getCloudinaryUrl } from '@/lib/cloudinary'

// Update PhotoModalProps interface (around line 10):
interface PhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photo: {
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
    applyFilmBorder?: boolean      // NEW
    filmBorderNumber?: number      // NEW
    blackAndWhite?: boolean        // NEW
  } | null
}

// In the component body:
const { image, caption, isFilmPhoto, filmType, filmStock, applyFilmBorder, filmBorderNumber, blackAndWhite } = photo
const width = image.width || 1200
const height = image.height || 800
const alt = image.alt || 'Gallery photo'

// Generate Cloudinary URL
const imageUrl = getCloudinaryUrl({
  imageUrl: image.url || '',
  width: 2400, // Higher quality for modal/lightbox
  height: 1600,
  applyFilmBorder,
  filmBorderNumber,
  isBlackAndWhite: blackAndWhite,
  quality: 95, // Higher quality for modal
})
```

**Update PhotoCard onPhotoClick calls to pass border info:**

In `src/components/gallery/PhotoCard.tsx`, update the `onPhotoClick` calls:

```typescript
// Around line 61 (bulk photos):
onPhotoClick({
  image,
  caption: undefined,
  isFilmPhoto: block.isFilmPhoto,
  filmType: block.filmType,
  filmStock: block.filmStock,
  applyFilmBorder: block.applyFilmBorder,      // NEW
  filmBorderNumber: block.filmBorderNumber,    // NEW
  blackAndWhite: block.blackAndWhite,          // NEW
})

// Around line 90 (single photo):
onPhotoClick({
  image,
  caption: block.caption,
  isFilmPhoto: block.isFilmPhoto,
  filmType: block.filmType,
  filmStock: block.filmStock,
  applyFilmBorder: block.applyFilmBorder,      // NEW
  filmBorderNumber: block.filmBorderNumber,    // NEW
  blackAndWhite: block.blackAndWhite,          // NEW
})
```

---

#### 2.4 Update FeaturedPhoto Component
File: `src/components/gallery/FeaturedPhoto.tsx`

**Find lines 96-101:**
```typescript
// OLD CODE (remove):
const hasBorderedVersion = image.borderedVersion?.url
const imageUrl = hasBorderedVersion ? image.borderedVersion.url : image.url
const width = hasBorderedVersion ? (image.borderedVersion.width || 2400) : (image.width || 2400)
const height = hasBorderedVersion ? (image.borderedVersion.height || 1200) : (image.height || 1200)
const alt = image.alt || 'Featured photo'
```

**Replace with:**
```typescript
import { getCloudinaryUrl } from '@/lib/cloudinary'

// Note: FeaturedPhoto doesn't currently have film border options in Gallery.ts
// You may want to add them to the featuredPhoto block schema first

const width = image.width || 2400
const height = image.height || 1200
const alt = image.alt || 'Featured photo'

// For now, no film borders on featured photos (since schema doesn't have the fields)
// But use Cloudinary for optimization:
const imageUrl = getCloudinaryUrl({
  imageUrl: image.url || '',
  width,
  height,
  quality: 90,
})
```

**Optional:** If you want film borders on featured photos, add the fields to the `featuredPhoto` block in `src/collections/Gallery.ts` (after line 320).

---

#### 2.5 Update BulkPhotos3Across Component
File: `src/components/gallery/BulkPhotos3Across.tsx`

This component passes props to PhotoCard, so it should automatically work once PhotoCard is updated. Just verify the block item mapping includes the border fields:

**Around line 61-68:**
```typescript
const photoItems = block.images.map((image, idx) => ({
  blockType: 'photo',
  image: image,
  id: `${block.blockType}-${idx}`,
  isFilmPhoto: block.isFilmPhoto,
  filmType: block.filmType,
  filmStock: block.filmStock,
  blackAndWhite: block.blackAndWhite,
  applyFilmBorder: block.applyFilmBorder,      // Should already be here
  filmBorderNumber: block.filmBorderNumber,    // Should already be here
}))
```

---

#### 2.6 Update Next.js Image Config
File: `next.config.ts`

Add Cloudinary to allowed image domains:

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '**.r2.cloudflarestorage.com',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: '**.r2.dev',
      pathname: '/**',
    },
    // ADD THIS:
    {
      protocol: 'https',
      hostname: 'res.cloudinary.com',
      pathname: '/**',
    },
  ],
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
},
```

---

### Phase 3: Testing

#### 3.1 Test Checklist

**Setup:**
- [ ] Cloudinary account created
- [ ] All 32 film borders uploaded to Cloudinary
- [ ] Cloud name added to `.env.local`
- [ ] Dev server restarted (`pnpm run dev`)

**Payload Admin Testing:**
1. [ ] Go to http://localhost:3002/admin
2. [ ] Open Gallery → "main page"
3. [ ] Find a photo block
4. [ ] Enable "Apply Film Border"
5. [ ] Select "Border 3"
6. [ ] Save

**Frontend Testing:**
1. [ ] Go to http://localhost:3002
2. [ ] Verify bordered image displays in gallery
3. [ ] Check browser Network tab:
   - [ ] Image URL should be `res.cloudinary.com`
   - [ ] Should see transformation parameters in URL
4. [ ] Click image to open modal
5. [ ] Verify border appears in modal (higher quality)

**Multiple Border Testing:**
1. [ ] Test all 8 borders (change filmBorderNumber, save, refresh)
2. [ ] Test black & white variant (check "Black and White", refresh)
3. [ ] Test portrait vs landscape images (should use correct orientation)

**Bulk Photos Testing:**
1. [ ] Test "Bulk Photos" block with borders enabled
2. [ ] Test "Bulk Photos 3 Across" block with borders

**Edge Cases:**
1. [ ] Test with `applyFilmBorder` disabled (should show original, but via Cloudinary for optimization)
2. [ ] Test with missing border number (should fallback gracefully)
3. [ ] Test with missing image dimensions (should still work)

**Static Generation Testing:**
1. [ ] Add ISR config to home page: `export const revalidate = 3600`
2. [ ] Run production build: `pnpm run build`
3. [ ] Check build output for "○" (Static) or "◐" (ISR) next to `/`
4. [ ] Start production server: `pnpm run start`
5. [ ] Verify page loads instantly (pre-rendered)
6. [ ] Check that Cloudinary URLs work in static HTML
7. [ ] Verify images still optimize/transform correctly

**Expected Build Output:**
```
Route (app)                              Size     First Load JS
┌ ○ /                                    XXX kB        XXX kB
└ ○ /about                               XXX kB        XXX kB
└ ○ /contact                             XXX kB        XXX kB

○  (Static)  prerendered as static content
◐  (ISR)     incremental static regeneration
```

---

### Phase 4: Deployment

#### 4.1 Build Configuration

Update `package.json` scripts:

```json
{
  "scripts": {
    "build": "next build",
    // REMOVE these (no longer needed):
    // "process:borders": "...",
    // "optimize:borders": "..."
  }
}
```

#### 4.2 Environment Variables for Production

Add to your Cloudflare deployment:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name`

**In Cloudflare Pages:**
1. Go to Pages → Your Project → Settings → Environment Variables
2. Add variable for Production and Preview environments

#### 4.3 Deploy

```bash
pnpm run build
pnpm run deploy:app
```

Should just work! No more border processing scripts.

---

## Troubleshooting

### Common Issues

**1. Image doesn't show border:**
- Check browser console for errors
- Verify Cloudinary URL is being generated (check Network tab)
- Verify border public ID matches uploaded files in Cloudinary
- Check that orientation detection is correct (portrait vs landscape)

**2. Cloudinary returns 404:**
- Verify border overlay public IDs are correct
- Check that R2 domain is in Cloudinary's allowed fetch domains
- Verify R2 images are publicly accessible

**3. Wrong border orientation:**
- Check image.width and image.height in database
- May need to populate dimensions (see Media collection TODO about Phase 5)
- Orientation detection falls back to 'vertical' if dimensions unknown

**4. Performance issues:**
- Cloudinary free tier has rate limits
- First load will be slower (Cloudinary fetches + processes)
- Subsequent loads use Cloudinary's CDN cache (fast)

---

## What to Clean Up (Later)

After confirming Cloudinary works, you can delete:

**Files to remove:**
- `scripts/process-film-borders.ts`
- `scripts/payload-script.config.ts`
- `scripts/test-script.ts`
- `scripts/optimize-film-borders.ts`
- `scripts/FILM-BORDERS-README.md` (or archive)
- `scripts/USAGE-GUIDE.md` (or archive)

**Database fields to remove:**
- `Media.borderedVersion` group (no longer used)
- Keep `Gallery.applyFilmBorder` and `filmBorderNumber` (still needed!)

**Package.json scripts to remove:**
- `process:borders`
- `optimize:borders`

**Dependencies to remove:**
- `tsx` (only used for scripts)
- Can keep `sharp` in case you need it later

---

## Cost Monitoring

**Cloudinary Free Tier:**
- 25 credits/month
- 1 credit ≈ 1,000 transformations
- Monitor usage at: https://cloudinary.com/console/lui/usage

**If you exceed free tier:**
- Upgrade to $99/month (250 credits)
- Or optimize: reduce quality, limit transformations
- Or switch to Vercel (unlimited, but split architecture)

---

## Future Enhancements

**Potential improvements:**

1. **Lazy border application:**
   - Only apply border on images in viewport
   - Use Cloudinary's dynamic transformations

2. **Border preview in Payload:**
   - Add custom field component showing border preview
   - Let user see border before saving

3. **Auto-orientation detection:**
   - Extract image dimensions on upload (Phase 5 TODO)
   - Store in Media.width and Media.height
   - Currently defaults to 'vertical' if unknown

4. **Custom border uploads:**
   - Let user upload custom borders via Payload
   - Store in Cloudinary
   - Reference in gallery blocks

---

## Questions to Ask User

Before starting implementation, clarify:

1. **Do you already have a Cloudinary account?**
   - If yes: Get cloud name
   - If no: Create account first

2. **What quality settings do you prefer?**
   - Current: 85% for grid, 95% for modal
   - Can adjust based on file size vs quality tradeoff

3. **Do you want film borders on Featured Photos too?**
   - Currently not in schema
   - Easy to add if desired

4. **Any custom border designs?**
   - The 8 existing borders cover most cases
   - Can upload more to Cloudinary anytime

---

## Summary of Changes

### What Changes:
- ✅ Add Cloudinary helper (`src/lib/cloudinary.ts`)
- ✅ Update PhotoCard component
- ✅ Update PhotoModal component
- ✅ Update FeaturedPhoto component
- ✅ Update Next.js config (add Cloudinary domain)
- ✅ Add environment variable
- ✅ Upload borders to Cloudinary
- ✅ Add ISR config to homepage (`export const revalidate = 3600`)

### What Stays:
- ✅ Database schema (applyFilmBorder, filmBorderNumber fields)
- ✅ Gallery collection structure
- ✅ All existing components (just modified)
- ✅ Cloudflare architecture

### What Gets Removed (after testing):
- ❌ Processing scripts
- ❌ Script-specific dependencies
- ❌ Media.borderedVersion field (optional cleanup)

---

## Success Criteria

Implementation is complete when:

1. ✅ Film borders appear on photos in the gallery
2. ✅ Borders are correct orientation (portrait/landscape)
3. ✅ Black & white variants work
4. ✅ All 8 borders tested and working
5. ✅ Modal displays bordered images
6. ✅ Images are optimized (WebP/AVIF)
7. ✅ No console errors
8. ✅ Cloudinary URLs visible in Network tab
9. ✅ User can change borders in Payload and see results immediately (no rebuild needed)
10. ✅ Homepage is statically generated (ISR enabled)
11. ✅ Production build shows homepage as static/ISR in build output
12. ✅ Cloudinary works perfectly with static generation

---

## Contact Info / Resources

**Cloudinary Docs:**
- Overlays: https://cloudinary.com/documentation/layers
- Fetch: https://cloudinary.com/documentation/fetch_remote_images
- Transformations: https://cloudinary.com/documentation/image_transformations

**Project Repo Structure:**
- Config: `next.config.ts`, `src/payload.config.ts`
- Collections: `src/collections/`
- Components: `src/components/gallery/`
- Utilities: `src/lib/`

**Key Files to Modify:**
1. `src/lib/cloudinary.ts` (CREATE)
2. `src/components/gallery/PhotoCard.tsx` (MODIFY)
3. `src/components/gallery/PhotoModal.tsx` (MODIFY)
4. `src/components/gallery/FeaturedPhoto.tsx` (MODIFY)
5. `src/app/(frontend)/page.tsx` (ADD ISR CONFIG)
6. `next.config.ts` (MODIFY)
7. `.env.local` (ADD VARIABLE)

---

## Final Notes for Next LLM

This is a well-structured codebase with good TypeScript types. The film border infrastructure is already in place (database fields, optimized PNGs). You're just changing WHERE the borders get applied (Cloudinary instead of Sharp).

The user is experienced and understands the tradeoffs. They explicitly chose Cloudinary for simplicity and automatic optimization, even with potential costs.

**IMPORTANT: Static Generation Strategy**
The user wants the homepage to use static generation with ISR (Incremental Static Regeneration). This is a key architectural decision:
- Add `export const revalidate = 3600` to `src/app/(frontend)/page.tsx`
- This enables automatic rebuilds every hour
- Keeps door open for dynamic client galleries later
- Cloudinary works perfectly with static HTML
- Test the production build to verify static generation

Focus on:
1. Clean implementation of the Cloudinary helper
2. Proper TypeScript types throughout
3. Thorough testing across all components
4. Good error handling (fallback to original URLs if Cloudinary fails)
5. **Verify ISR configuration works correctly in production build**

Good luck! This should be a straightforward implementation.
