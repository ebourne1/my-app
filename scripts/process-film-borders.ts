#!/usr/bin/env tsx

/**
 * Film Border Processing Script
 *
 * This script processes images in the gallery that have the "applyFilmBorder" flag set.
 * It composites film border overlays onto photos using Sharp and uploads the results to R2.
 *
 * Usage: pnpm run process:borders
 */

import path from 'path'
import { fileURLToPath } from 'url'
import { config as dotenvConfig } from 'dotenv'

// Load environment variables first
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenvConfig({ path: path.join(__dirname, '../.env.local') })

import sharp from 'sharp'
import fs from 'fs/promises'

// Import Payload after setting up environment
let payload: any
let getPayload: any

// Film border file naming pattern
function getFilmBorderPath(borderNumber: number, orientation: 'horizontal' | 'vertical', isBlackAndWhite: boolean): string {
  const bwSuffix = isBlackAndWhite ? '-bw' : ''
  return path.join(__dirname, '../src/assets/film-borders', `FILM-FRAME_OVERLAY-${borderNumber}-${orientation}${bwSuffix}.png`)
}

// Determine if image is portrait or landscape
async function getImageOrientation(imageBuffer: Buffer): Promise<'horizontal' | 'vertical'> {
  const metadata = await sharp(imageBuffer).metadata()
  const width = metadata.width || 0
  const height = metadata.height || 0
  return width >= height ? 'horizontal' : 'vertical'
}

// Download image from URL
async function downloadImage(url: string): Promise<Buffer> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Composite image with film border
async function compositeWithBorder(
  imageBuffer: Buffer,
  borderNumber: number,
  isBlackAndWhite: boolean
): Promise<{ buffer: Buffer; width: number; height: number }> {
  const orientation = await getImageOrientation(imageBuffer)
  const borderPath = getFilmBorderPath(borderNumber, orientation, isBlackAndWhite)

  console.log(`  Using border: ${path.basename(borderPath)}`)

  // Get original image dimensions
  const imageSharp = sharp(imageBuffer)
  const imageMetadata = await imageSharp.metadata()
  const imageWidth = imageMetadata.width || 0
  const imageHeight = imageMetadata.height || 0

  // Load and resize border to match image dimensions
  const borderBuffer = await sharp(borderPath)
    .resize(imageWidth, imageHeight, { fit: 'fill' })
    .toBuffer()

  // Composite border over image
  const composited = await imageSharp
    .composite([
      {
        input: borderBuffer,
        blend: 'over', // Border has transparency in the center
      },
    ])
    .jpeg({ quality: 95 }) // High quality output
    .toBuffer()

  return {
    buffer: composited,
    width: imageWidth,
    height: imageHeight,
  }
}

// Get Cloudflare context using Wrangler's getPlatformProxy
async function getCloudflareContextFromWrangler() {
  try {
    // Dynamically import wrangler to access getPlatformProxy
    const wranglerModule = await import('wrangler')
    const { getPlatformProxy } = wranglerModule

    return await getPlatformProxy({
      environment: process.env.CLOUDFLARE_ENV,
      experimental: { remoteBindings: true },
    })
  } catch (error) {
    console.error('Error initializing Wrangler proxy:', error)
    throw error
  }
}

// Upload bordered image to R2
async function uploadBorderedImage(
  r2Bucket: any,
  originalMedia: any,
  borderedBuffer: Buffer,
  borderNumber: number
): Promise<string> {
  // Create a filename for the bordered version
  const originalFilename = originalMedia.filename || 'image.jpg'
  const ext = path.extname(originalFilename)
  const basename = path.basename(originalFilename, ext)
  const borderedFilename = `${basename}-border-${borderNumber}.jpg`

  // Extract the path from the original media if it has one
  // R2 storage structure: media/{filename}
  let r2Key = borderedFilename
  if (originalMedia.url) {
    // Extract path structure from original URL if available
    const urlPath = new URL(originalMedia.url).pathname
    const pathParts = urlPath.split('/')
    const mediaIndex = pathParts.indexOf('media')
    if (mediaIndex !== -1 && pathParts.length > mediaIndex + 1) {
      // Preserve the media folder structure
      r2Key = `media/${borderedFilename}`
    }
  } else {
    r2Key = `media/${borderedFilename}`
  }

  console.log(`  Uploading to R2: ${r2Key}`)

  try {
    // Upload to R2
    await r2Bucket.put(r2Key, borderedBuffer, {
      httpMetadata: {
        contentType: 'image/jpeg',
      },
    })

    // Get the public URL
    // The URL format depends on your R2 bucket configuration
    // Usually: https://{bucket}.{account}.r2.cloudflarestorage.com/{key}
    // or custom domain if configured

    // For now, we'll construct the URL based on the original media URL pattern
    let borderedUrl: string
    if (originalMedia.url) {
      const originalUrl = new URL(originalMedia.url)
      // Replace the filename in the path
      borderedUrl = `${originalUrl.protocol}//${originalUrl.host}/${r2Key}`
    } else {
      // Fallback - this will need to be adjusted based on your R2 setup
      borderedUrl = `https://r2.cloudflarestorage.com/${r2Key}`
    }

    console.log(`  ✓ Uploaded: ${borderedUrl}`)

    return borderedUrl
  } catch (error) {
    console.error(`  ✗ Failed to upload to R2:`, error)
    throw error
  }
}

// Process a single image
async function processImage(
  payload: any,
  r2Bucket: any,
  mediaId: string,
  borderNumber: number,
  isBlackAndWhite: boolean
): Promise<void> {
  try {
    // Fetch media entry
    const media = await payload.findByID({
      collection: 'media',
      id: mediaId,
    })

    if (!media) {
      console.log(`  ⚠️  Media not found: ${mediaId}`)
      return
    }

    console.log(`  Processing: ${media.filename || media.id}`)

    // Check if already processed
    if (media.borderedVersion?.url && media.borderedVersion?.borderNumber === borderNumber) {
      console.log(`  ✓ Already processed with border ${borderNumber}`)
      return
    }

    // Download original image
    const imageUrl = media.url
    if (!imageUrl) {
      console.log(`  ⚠️  No URL found for media: ${mediaId}`)
      return
    }

    console.log(`  Downloading from: ${imageUrl}`)
    const imageBuffer = await downloadImage(imageUrl)

    // Composite with border
    console.log(`  Compositing with border ${borderNumber}...`)
    const { buffer: borderedBuffer, width, height } = await compositeWithBorder(
      imageBuffer,
      borderNumber,
      isBlackAndWhite
    )

    // Upload bordered version
    console.log(`  Uploading bordered version...`)
    const borderedUrl = await uploadBorderedImage(r2Bucket, media, borderedBuffer, borderNumber)

    // Update media entry with bordered version info
    await payload.update({
      collection: 'media',
      id: mediaId,
      data: {
        borderedVersion: {
          url: borderedUrl,
          width,
          height,
          borderNumber,
        },
      },
    })

    console.log(`  ✅ Completed: ${media.filename || media.id}`)
  } catch (error) {
    console.error(`  ❌ Error processing image ${mediaId}:`, error)
  }
}

// Main processing function
async function processFilmBorders() {
  console.log('🎬 Film Border Processing Script')
  console.log('=================================\n')

  let cloudflare: any
  let r2Bucket: any
  let payload: any

  try {
    // Initialize Cloudflare context and Payload
    console.log('Initializing Cloudflare context...')
    try {
      cloudflare = await getCloudflareContextFromWrangler()
      r2Bucket = cloudflare.env.R2
      console.log('✓ Cloudflare R2 bucket connected\n')
    } catch (error) {
      console.error('Failed to initialize Cloudflare context:', error)
      console.error('Make sure wrangler is configured and environment variables are set.')
      throw error
    }

    console.log('Initializing Payload...')
    try {
      // Import Payload and create script-friendly config
      const payloadModule = await import('payload')
      getPayload = payloadModule.getPayload

      const { createScriptConfig } = await import('./payload-script.config.js')
      const config = createScriptConfig(cloudflare.env)

      payload = await getPayload({ config })
      console.log('✓ Payload initialized\n')
    } catch (error) {
      console.error('Failed to initialize Payload:', error)
      throw error
    }

    // Fetch all galleries
    console.log('Fetching galleries...')
    const galleries = await payload.find({
      collection: 'gallery',
      limit: 1000,
    })
    console.log(`✓ Found ${galleries.docs.length} galleries\n`)

    // Process each gallery
    let totalProcessed = 0
    for (const gallery of galleries.docs) {
      console.log(`Gallery: ${gallery.title}`)

      if (!gallery.items || gallery.items.length === 0) {
        console.log('  No items in gallery\n')
        continue
      }

      // Process each block in the gallery
      for (const item of gallery.items) {
        const blockType = item.blockType

        // Handle different block types
        if (blockType === 'photo') {
          if (item.applyFilmBorder && item.image) {
            const mediaId = typeof item.image === 'string' ? item.image : item.image.id
            const borderNumber = item.filmBorderNumber || 1
            const isBlackAndWhite = item.blackAndWhite || false

            console.log(`\n📸 Photo block (Border ${borderNumber})`)
            await processImage(payload, r2Bucket, mediaId, borderNumber, isBlackAndWhite)
            totalProcessed++
          }
        } else if (blockType === 'photoBulk' || blockType === 'photoBulk3Across') {
          if (item.applyFilmBorder && item.images && item.images.length > 0) {
            const borderNumber = item.filmBorderNumber || 1
            const isBlackAndWhite = item.blackAndWhite || false

            console.log(`\n📸 ${blockType} block (${item.images.length} images, Border ${borderNumber})`)

            for (const image of item.images) {
              const mediaId = typeof image === 'string' ? image : image.id
              await processImage(payload, r2Bucket, mediaId, borderNumber, isBlackAndWhite)
              totalProcessed++
            }
          }
        }
      }

      console.log() // Empty line between galleries
    }

    console.log('=================================')
    console.log(`✅ Processing complete! Processed ${totalProcessed} images.`)
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
processFilmBorders()
