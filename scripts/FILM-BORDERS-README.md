# Film Border Processing

This feature allows you to apply authentic film frame borders to your photographs, giving them a vintage analog photography aesthetic.

## Overview

The film border system composites transparent PNG overlays onto your photographs **before** Next.js generates optimized WebP/AVIF versions. This ensures:

- **Performance**: Border is applied once, not on every request
- **Consistency**: Border scales properly at all responsive sizes
- **Quality**: High-quality 95% JPEG output before optimization
- **Caching**: Better CDN performance with pre-processed images

## Available Borders

8 unique film border designs, each available in 4 variants:

- **Horizontal** (landscape photos) - Color & Black/White
- **Vertical** (portrait photos) - Color & Black/White

Total: 32 border variations automatically selected based on image orientation and color settings.

## Workflow

### 1. Upload Photos

Upload your photos to the Media collection via Payload CMS admin.

### 2. Add to Gallery

In the Gallery collection, add photos using:
- **Photo** block (single image)
- **Bulk Photos** block (multiple images, 2-column masonry)
- **Bulk Photos 3 Across** block (multiple images, 3-column grid)

### 3. Enable Film Border

For each photo block:

1. Check **"Apply Film Border"** checkbox
2. Select **Border Number (1-8)** from dropdown
3. Optionally set **"Black and White"** if desired
4. Save the gallery

### 4. Process Borders

Run the processing script to generate bordered versions:

```bash
pnpm run process:borders
```

The script will:
- Find all photos with `applyFilmBorder` enabled
- Download original images from R2
- Determine orientation (portrait/landscape)
- Apply the selected border overlay
- Upload bordered version to R2
- Update media entries with bordered version metadata

### 5. Deploy

Bordered images will automatically be used in place of originals when available.

## Technical Details

### How It Works

1. **Detection**: Script scans Gallery collection for `applyFilmBorder=true`
2. **Download**: Fetches original image from Cloudflare R2
3. **Analysis**: Determines if image is portrait or landscape
4. **Selection**: Picks appropriate border:
   - Border number (1-8) from user selection
   - Orientation (horizontal/vertical) from image dimensions
   - Color/B&W from `blackAndWhite` field
5. **Composite**: Uses Sharp to overlay border PNG
6. **Upload**: Saves to R2 as `{original}-border-{number}.jpg`
7. **Update**: Stores bordered version metadata in Media collection

### File Structure

```
src/assets/film-borders/
├── FILM-FRAME_OVERLAY-1-horizontal.png
├── FILM-FRAME_OVERLAY-1-horizontal-bw.png
├── FILM-FRAME_OVERLAY-1-vertical.png
├── FILM-FRAME_OVERLAY-1-vertical-bw.png
├── ... (borders 2-8)
```

### Data Model

**Media Collection:**
```typescript
{
  url: string                    // Original image URL
  width: number                  // Original dimensions
  height: number
  borderedVersion: {
    url: string                  // Bordered image URL in R2
    width: number                // Bordered dimensions
    height: number
    borderNumber: number         // Which border (1-8)
  }
}
```

**Gallery Collection (Photo Blocks):**
```typescript
{
  applyFilmBorder: boolean       // Enable film border
  filmBorderNumber: 1-8          // User-selected border
  blackAndWhite: boolean         // Use B&W variant
  // ... other fields
}
```

### Frontend Rendering

All gallery components automatically check for `borderedVersion`:

- **PhotoCard.tsx** - Masonry grid photos
- **BulkPhotos3Across.tsx** - 3-column grid
- **FeaturedPhoto.tsx** - Full-width hero images
- **PhotoModal.tsx** - Lightbox view

If bordered version exists, it's used instead of the original.

## Important Notes

### R2 Upload (TODO)

**Current Status:** The script has a placeholder for R2 upload. You need to implement direct R2 upload logic.

**Options:**
1. **Wrangler CLI**: Use `wrangler r2 object put` to upload files
2. **R2 SDK**: Use `@cloudflare/workers-types` with R2 binding
3. **S3 Compatible API**: Use AWS SDK with R2 endpoints

**Implementation Location:** `scripts/process-film-borders.ts` → `uploadBorderedImage()` function

### Optimization Recommendations

The film border PNGs are large (1.8MB-18MB). Consider:

1. **Optimize PNGs**: Use `pngquant` or similar to reduce file size
   ```bash
   # Install pngquant
   brew install pngquant

   # Optimize borders (lossy compression)
   cd src/assets/film-borders
   pngquant --quality=65-80 --ext .png --force *.png
   ```

2. **Use WebP Borders**: Convert to WebP for smaller files
   ```bash
   # Using cwebp
   for f in *.png; do cwebp -q 90 "$f" -o "${f%.png}.webp"; done
   ```

### Performance Considerations

- **Processing Time**: ~2-5 seconds per image (download, composite, upload)
- **Storage**: Bordered versions are stored separately (not destructive)
- **Bandwidth**: First run downloads all images from R2
- **Caching**: Subsequent runs skip already-processed images

## Troubleshooting

### "Image not found" errors

Make sure images are uploaded to R2 and have valid URLs in the Media collection.

### Type errors in components

Run `pnpm run generate:types:payload` to regenerate TypeScript types after schema changes.

### Borders not appearing

1. Check that `borderedVersion.url` is populated in Media collection
2. Verify bordered image is accessible in R2
3. Check browser network tab for 404s
4. Clear Next.js cache: `rm -rf .next`

### Script crashes

- Ensure `PAYLOAD_SECRET` is set in `.env.local`
- Check Node.js version (requires 18.20.2+ or 20.9.0+)
- Verify Sharp is installed: `pnpm list sharp`

## Future Enhancements

Potential improvements:

1. **Automatic R2 Upload**: Implement direct R2 integration
2. **Batch Processing**: Process specific galleries or date ranges
3. **Border Preview**: Show border preview in CMS before applying
4. **Custom Borders**: Allow users to upload their own border designs
5. **Undo/Reprocess**: Remove borders or change to different variant
6. **Progress Bar**: Real-time progress indicator during processing
7. **Cloudflare Images**: Use Cloudflare Images API for transformation

## Questions?

For issues or questions about the film border feature, check:

- Script source: `scripts/process-film-borders.ts`
- Collection schema: `src/collections/Gallery.ts` and `src/collections/Media.ts`
- Component rendering: `src/components/gallery/`
