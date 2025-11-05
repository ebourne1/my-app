# Film Border Feature - Quick Start Guide

This guide will walk you through using the film border feature to add authentic analog photography borders to your photos.

## Prerequisites

- Photos uploaded to your Media collection
- Gallery collection configured with photo blocks
- Development environment with access to Payload CMS admin

## Step-by-Step Workflow

### 1. Upload Your Photos

1. Go to Payload CMS admin: `http://localhost:3000/admin`
2. Navigate to **Collections** → **Media**
3. Upload your photographs
4. Add descriptive alt text for each image

### 2. Add Photos to Gallery

1. Navigate to **Collections** → **Gallery**
2. Open your gallery (or create a new one)
3. Add a photo block:
   - **Photo** - Single image
   - **Bulk Photos** - Multiple images (2-column masonry)
   - **Bulk Photos 3 Across** - Multiple images (3-column grid)

### 3. Enable Film Border

For each photo block where you want a film border:

1. Check the **"Apply Film Border"** checkbox
2. Select a **Border Number (1-8)** from the dropdown:
   - Border 1: Heavy grain, vintage look
   - Border 2: Clean edges, minimal grain
   - Border 3: Medium grain, centered frame
   - Border 4: Light leak effect
   - Border 5: Heavy grain, worn edges
   - Border 6: Clean, modern look
   - Border 7: Film perforation markings
   - Border 8: Distressed vintage

3. Optionally set **"Black and White"** to use B&W border variants
4. Save the gallery

### 4. Process Film Borders

Open your terminal and run:

```bash
pnpm run process:borders
```

The script will:
- Find all photos with "Apply Film Border" enabled
- Download images from R2 storage
- Detect orientation (portrait/landscape)
- Apply the selected border overlay
- Upload bordered version to R2
- Update database with bordered image URL

**Expected Output:**
```
🎬 Film Border Processing Script
=================================

Initializing Cloudflare context...
Using vars defined in .env.local
✓ Cloudflare R2 bucket connected

Initializing Payload...
✓ Payload initialized

Fetching galleries...
✓ Found 1 galleries

Gallery: main page

📸 Photo block (Border 3)
  Processing: IMG_1234.jpg
  Downloading from: https://...
  Using border: FILM-FRAME_OVERLAY-3-vertical.png
  Compositing with border 3...
  Uploading bordered version...
  Uploading to R2: media/IMG_1234-border-3.jpg
  ✓ Uploaded: https://...
  ✅ Completed: IMG_1234.jpg

=================================
✅ Processing complete! Processed 1 images.
```

### 5. View Your Bordered Photos

1. Visit your website (e.g., `http://localhost:3000`)
2. Bordered images will automatically display in place of originals
3. Click images to view in lightbox/modal with borders

## Tips & Best Practices

### Border Selection Guide

- **Landscape photos**: Horizontal borders are automatically selected
- **Portrait photos**: Vertical borders are automatically selected
- **Black & White photos**: Use B&W borders to match aesthetic

### Performance Optimization

- Process borders **before** deploying to production
- Bordered images are cached by Next.js Image optimizer
- Original images are preserved - borders are non-destructive

### Re-processing

To change a border:
1. Edit the gallery in Payload admin
2. Change the **Border Number**
3. Run `pnpm run process:borders` again
4. Script will detect the change and re-process

To remove a border:
1. Uncheck **"Apply Film Border"** in Payload admin
2. The original image will display instead

## Troubleshooting

### "No images processed"

- Check that "Apply Film Border" checkbox is enabled
- Verify that photos are uploaded and linked in gallery
- Ensure gallery is saved after making changes

### "Failed to download image"

- Verify R2 storage is configured correctly
- Check that image URLs are accessible
- Ensure internet connection is active

### "Failed to upload to R2"

- Verify Cloudflare credentials are set
- Check R2 bucket permissions
- Ensure `CLOUDFLARE_ENV` environment variable is set if using multiple environments

### Script crashes or hangs

- Check Node.js version (requires 18.20.2+ or 20.9.0+)
- Verify Sharp is installed: `pnpm list sharp`
- Clear any temporary files: `rm -rf .temp`

## Advanced Usage

### Batch Processing

To process all galleries at once, simply run:
```bash
pnpm run process:borders
```

The script automatically finds and processes all marked images across all galleries.

### Custom Border Images

To add your own borders:

1. Create PNG files with transparency in center
2. Name them: `FILM-FRAME_OVERLAY-9-horizontal.png` and `FILM-FRAME_OVERLAY-9-vertical.png`
3. Place in `src/assets/film-borders/`
4. Add option 9 to the `filmBorderNumber` select field in `src/collections/Gallery.ts`
5. Optimize with: `pnpm run optimize:borders`

### Checking Border Status

To see which images have borders applied, check the Media collection:

1. Go to Payload admin → Media
2. Open an image
3. Look for the **"Bordered Version"** field group
4. It shows the bordered image URL and which border was used

## Scripts Available

| Command | Purpose |
|---------|---------|
| `pnpm run process:borders` | Process all images marked for film borders |
| `pnpm run optimize:borders` | Optimize border PNG file sizes (one-time setup) |

## Need Help?

- Review the full documentation: `scripts/FILM-BORDERS-README.md`
- Check script source code: `scripts/process-film-borders.ts`
- Inspect collection schema: `src/collections/Gallery.ts` and `src/collections/Media.ts`

Happy border processing! 🎞️
