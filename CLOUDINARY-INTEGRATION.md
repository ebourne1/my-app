# Cloudinary Film Border Integration - Complete Implementation Guide

## Overview

This photography portfolio uses **Cloudinary** to apply film border overlays to images on-demand. Images are stored in **Cloudflare R2**, and Cloudinary fetches them dynamically, applies transformations (including film borders), optimizes them, and serves them through its global CDN.

### Architecture Flow

```
User Browser
    ↓
Next.js App (localhost:3002 or production)
    ↓
Cloudinary CDN (res.cloudinary.com)
    ↓ (fetches original)
Cloudflare R2 (pub-d659efaed4444e63acad9644f15a6b51.r2.dev)
    ↓ (returns image)
Cloudinary
    ↓ (applies film border overlay, optimizes, caches)
User Browser (receives optimized image with border)
```

---

## How It Works

### 1. Image Storage
- **Original images** are stored in Cloudflare R2 bucket
- R2 is configured with **public read access** via dev URL: `https://pub-d659efaed4444e63acad9644f15a6b51.r2.dev`
- Images are uploaded through Payload CMS admin panel

### 2. Film Border Assets
- **32 optimized PNG overlays** stored in Cloudinary
- **Location**: `film-borders/` folder in Cloudinary Media Library
- **Naming pattern**: `FILM-FRAME_OVERLAY-{1-8}-{horizontal|vertical}{-bw}.png`
  - 8 border designs
  - Each has horizontal and vertical variants
  - Each has color and black & white variants

### 3. URL Generation
The `getCloudinaryUrl()` helper (in `src/lib/cloudinary.ts`) builds transformation URLs:

```typescript
// Example generated URL:
https://res.cloudinary.com/dthtnyavj/image/fetch/
  l_film-borders:film-borders:FILM-FRAME_OVERLAY-3-vertical,
  fl_layer_apply,
  w_2473,
  h_3709,
  f_auto,
  q_95,
  c_limit/
  https://pub-d659efaed4444e63acad9644f15a6b51.r2.dev/IMG_1277-2.jpg
```

**URL Breakdown:**
- `l_film-borders:film-borders:FILM-FRAME_OVERLAY-3-vertical` - Apply overlay (border #3, vertical)
- `fl_layer_apply` - Composite the overlay onto the image
- `w_2473,h_3709` - Resize to dimensions (maintains correct orientation)
- `f_auto` - Automatic format (WebP/AVIF based on browser)
- `q_95` - Quality setting (95% for modal, 85% for grid)
- `c_limit` - Don't upscale beyond original size
- Final path: R2 public URL of original image

### 4. Orientation Detection
The helper automatically detects orientation based on image dimensions:

```typescript
function getOrientation(width?: number, height?: number): 'horizontal' | 'vertical' {
  if (!width || !height) return 'vertical' // Default
  return width >= height ? 'horizontal' : 'vertical'
}
```

This ensures:
- Portrait images get vertical borders
- Landscape images get horizontal borders
- Borders match image proportions

---

## Dev vs Production

### Development Mode (localhost:3002)

**Configuration:**
- Uses R2 **public dev URL**: `https://pub-d659efaed4444e63acad9644f15a6b51.r2.dev`
- Payload CMS configured with `disablePayloadAccessControl: true` in R2 storage adapter
- This forces Payload to return full R2 URLs instead of relative paths like `/api/media/file/...`

**Why This Matters:**
- Cloudinary can only fetch from **public HTTP URLs**, not relative paths
- Without public URLs, Cloudinary would return 401 Unauthorized errors
- R2 dev URL is enabled in Cloudflare dashboard under R2 bucket settings

**payload.config.ts Configuration:**
```typescript
r2Storage({
  bucket: cloudflare.env.R2,
  collections: {
    media: {
      // Enable direct R2 URLs instead of proxied URLs through Payload
      disablePayloadAccessControl: true,
      // Generate public R2 URLs for Cloudinary access
      generateFileURL: ({ filename, prefix }: { filename: string; prefix?: string }) => {
        return [
          'https://pub-d659efaed4444e63acad9644f15a6b51.r2.dev',
          prefix,
          filename,
        ]
          .filter(Boolean)
          .join('/')
      },
    },
  },
})
```

### Production Mode

**Same configuration** - no changes needed! The R2 public URL works in both environments.

**Production Optimization:**
- First request: Cloudinary fetches from R2, processes, caches (~2-5 seconds)
- Subsequent requests: Served from Cloudinary's global CDN (~50-200ms)
- Cloudinary automatically serves WebP/AVIF for modern browsers
- Next.js Image component handles responsive srcsets

**Optional Production Enhancement:**
- Set up custom R2 domain (e.g., `cdn.yoursite.com`) instead of `.r2.dev` URL
- Update `generateFileURL` to use custom domain
- Add custom domain to Cloudinary allowed fetch domains

---

## Cloudinary Security Configuration

### Required Settings in Cloudinary Dashboard

Go to **Settings → Security**:

#### 1. Restricted Image Types
**MUST UNCHECK "Fetched URL":**
- ⬜ Fetched URL (UNCHECKED = allowed)

By default, Cloudinary **restricts fetch requests** for security. You must explicitly enable the fetch feature.

#### 2. Allowed Fetch Domains
Add your R2 domain to the whitelist:
```
pub-d659efaed4444e63acad9644f15a6b51.r2.dev
```

**How to add:**
1. Go to Settings → Security → Allowed fetch domains
2. Paste the R2 domain in the text box
3. Click Save

This tells Cloudinary which domains it's allowed to fetch images from.

---

## Component Implementation

### PhotoCard.tsx (Gallery Grid)
- Reads `applyFilmBorder`, `filmBorderNumber`, `blackAndWhite` from block data
- Passes to `getCloudinaryUrl()` with grid dimensions (~600-1200px)
- Quality: 85%
- Passes border settings to PhotoModal on click

### PhotoModal.tsx (Lightbox)
- Receives border settings from PhotoCard click event
- Uses **actual image dimensions** (not hardcoded)
- Quality: 95% (higher for full-screen viewing)
- Fixed bug: Was using hardcoded 2400x1600, causing wrong orientation

### FeaturedPhoto.tsx (Hero Images)
- Currently **no border support** (not in schema)
- Uses Cloudinary for optimization only
- Can add border fields to `featuredPhoto` block in Gallery.ts if desired

### BulkPhotos3Across.tsx
- Passes border props through to PhotoCard
- Applies same border to all 3 images in a row

---

## Troubleshooting

### Images Not Loading (Blank/Broken)

**1. Check R2 URLs are being generated:**
```bash
# In browser console, check image src
document.querySelector('img').src
// Should be: https://pub-d659efaed4444e63acad9644f15a6b51.r2.dev/...
// NOT: /api/media/file/...
```

**Fix:** Ensure `disablePayloadAccessControl: true` is set in payload.config.ts

---

### Cloudinary 401 Unauthorized Errors

**Symptoms:**
```
⨯ upstream image response failed for https://res.cloudinary.com/... 401
```

**Causes:**
1. **"Fetched URL" is restricted** in Cloudinary security settings
2. **R2 domain not in allowed fetch domains**

**Fix:**
1. Go to Cloudinary Settings → Security
2. Find "Restricted image types" section
3. **UNCHECK** "Fetched URL"
4. Add R2 domain to "Allowed fetch domains"
5. Click Save
6. **Wait 5-10 minutes** for settings to propagate globally

**Cache Issues:**
- Cloudinary caches 401 responses for up to 24 hours
- To test immediately, use a **different transformation** (e.g., change `w_640` to `w_641`)
- Or wait for cache to expire naturally

---

### Images Timeout on First Load

**Symptoms:**
```
⨯ upstream image response timed out for https://res.cloudinary.com/...
```

**This is normal!** First request requires Cloudinary to:
1. Fetch large original from R2 (2-5 MB files)
2. Apply film border overlay
3. Resize/optimize
4. Cache result

**First load:** 5-15 seconds (may timeout)
**Second load:** 50-200ms (cached)

**Solutions:**
- **Pre-warm cache:** Visit Cloudinary URLs directly in browser before testing
- **Reduce dimensions:** Use smaller sizes for dev testing
- **Be patient:** Just reload the page after ~30 seconds

---

### Wrong Border Orientation

**Symptoms:**
- Vertical image gets horizontal border (or vice versa)
- Border cuts through middle of photo

**Cause:** Component passing wrong dimensions to `getCloudinaryUrl()`

**Fix:** Use **actual image dimensions** from database:
```typescript
const width = image.width || 1200  // Use actual width
const height = image.height || 800  // Use actual height

const imageUrl = getCloudinaryUrl({
  imageUrl: image.url || '',
  width,   // Don't hardcode!
  height,  // Don't hardcode!
  applyFilmBorder,
  filmBorderNumber,
  isBlackAndWhite: blackAndWhite,
})
```

---

### Next.js Image Cache Issues

If images won't update after changes:

```bash
# Clear Next.js image cache
rm -rf .next/cache/images

# Restart dev server
pkill -f "next dev"
pnpm run dev
```

---

## Cost & Performance

### Cloudinary Free Tier
- **25 credits/month** = ~25,000 transformations
- Good for portfolios with moderate traffic
- Monitor at: https://cloudinary.com/console/lui/usage

### Performance Characteristics

**First Request (Cold):**
- Cloudinary fetches from R2: ~2-3 seconds
- Applies transformation: ~1-2 seconds
- Total: ~3-5 seconds (may timeout in dev)

**Subsequent Requests (Cached):**
- Served from Cloudinary CDN: ~50-200ms
- Global edge network
- Automatic WebP/AVIF conversion

**Optimization Benefits:**
- Original JPG: ~2-5 MB
- Cloudinary WebP: ~200-500 KB (70-90% smaller!)
- Faster page loads
- Lower bandwidth costs

---

## Code Reference

### Key Files

**Core Implementation:**
- `src/lib/cloudinary.ts` - URL builder helper
- `src/components/gallery/PhotoCard.tsx` - Grid images
- `src/components/gallery/PhotoModal.tsx` - Lightbox
- `src/components/gallery/FeaturedPhoto.tsx` - Hero images

**Configuration:**
- `src/payload.config.ts` - R2 storage adapter
- `next.config.ts` - Allowed image domains
- `.env.local` - Cloudinary cloud name

**Database Schema:**
- `src/collections/Gallery.ts` - Block definitions with border fields
- `src/collections/Media.ts` - Image metadata

### Environment Variables

**Required:**
```bash
# .env.local
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dthtnyavj
```

**Optional (for production custom domain):**
```bash
R2_PUBLIC_URL=https://cdn.yoursite.com
```

---

## Testing Checklist

### Setup Verification
- [ ] Cloudinary account active (cloud name: `dthtnyavj`)
- [ ] 32 film borders uploaded to Cloudinary `film-borders/` folder
- [ ] R2 bucket has public dev URL enabled
- [ ] "Fetched URL" is **unchecked** in Cloudinary security settings
- [ ] R2 domain in Cloudinary allowed fetch domains
- [ ] `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` in .env.local
- [ ] Dev server running on port 3002

### Functional Testing
- [ ] Gallery grid shows images (may take 5-10 seconds first time)
- [ ] Apply film border to a photo in admin
- [ ] Border appears correctly in grid
- [ ] Click image to open modal
- [ ] Border appears correctly in modal (correct orientation)
- [ ] Try different border numbers (1-8)
- [ ] Try black & white variant
- [ ] Test both portrait and landscape images
- [ ] Check browser Network tab shows `res.cloudinary.com` URLs

### Browser Console Checks
No errors related to:
- Cloudinary 401 unauthorized
- Cloudinary 404 not found
- Image load failures

**Acceptable warnings:**
- Cloudinary timeouts on first load (normal)
- "Cannot apply Cloudinary transformation: Image URL is relative" means R2 config issue

---

## Future Enhancements

### Potential Improvements

**1. Custom Domain for R2**
- Set up `cdn.yourportfolio.com` pointing to R2
- Better branding, no `.r2.dev` in URLs
- Update `generateFileURL` in payload.config.ts

**2. Border Preview in Admin**
- Add custom Payload field component
- Show live preview of selected border
- Help editors visualize before saving

**3. Smart Caching Strategy**
- Pre-generate common sizes during build
- Upload to R2 as static assets
- Fallback to Cloudinary for dynamic sizes

**4. Featured Photo Borders**
- Add border fields to `featuredPhoto` block in Gallery.ts
- Update FeaturedPhoto.tsx component
- Allow hero images to have borders too

**5. Advanced Transformations**
- Vignette effects
- Color grading
- Grain overlay for authentic film look
- All possible via Cloudinary transformations

---

## Summary

### What Works
✅ Film borders apply correctly to images
✅ Automatic orientation detection (portrait/landscape)
✅ Black & white variants
✅ All 8 border designs functional
✅ Works in both dev and production
✅ Automatic image optimization (WebP/AVIF)
✅ Global CDN caching
✅ No build scripts required
✅ Change borders instantly (no rebuild)

### Key Configuration Points
1. **R2**: Enable public dev URL, configure in payload.config.ts
2. **Cloudinary**: Uncheck "Fetched URL", add R2 to allowed domains
3. **Next.js**: Add Cloudinary to remotePatterns
4. **Components**: Use actual image dimensions, not hardcoded

### Performance Notes
- First load: 3-5 seconds (Cloudinary processing)
- Cached loads: 50-200ms (CDN)
- 70-90% file size reduction (WebP/AVIF)
- Free tier sufficient for portfolio traffic

---

## Support Resources

**Cloudinary Documentation:**
- Overlays: https://cloudinary.com/documentation/layers
- Fetch API: https://cloudinary.com/documentation/fetch_remote_images
- Transformations: https://cloudinary.com/documentation/image_transformations

**R2 Documentation:**
- Public Buckets: https://developers.cloudflare.com/r2/buckets/public-buckets/
- Custom Domains: https://developers.cloudflare.com/r2/buckets/public-buckets/#custom-domains

**Troubleshooting:**
- If 401 errors persist after 24 hours, contact Cloudinary support
- Check Cloudinary status page: https://status.cloudinary.com
- Monitor usage to avoid hitting free tier limits

---

**Last Updated:** November 5, 2025
**Implementation Status:** ✅ Complete and Working
