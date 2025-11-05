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
  filmBorderNumber?: string | number
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

  // If no imageUrl, return empty string
  if (!imageUrl) {
    return ''
  }

  // If image URL is a relative path (starts with /), skip Cloudinary
  // This indicates R2 disablePayloadAccessControl is not enabled
  if (imageUrl.startsWith('/')) {
    console.error(
      'Cannot apply Cloudinary transformation: Image URL is relative instead of R2 public URL.',
      '\nCheck that disablePayloadAccessControl: true is set in payload.config.ts',
      '\nURL:', imageUrl
    )
    return imageUrl
  }

  // Start building transformation string
  const transformations: string[] = []

  // Apply film border if requested
  if (applyFilmBorder && filmBorderNumber) {
    const orientation = getOrientation(width, height)
    const bwSuffix = isBlackAndWhite ? '-bw' : ''
    // Note: The upload script created public IDs with "film-borders/film-borders/" prefix
    const borderPublicId = `film-borders/film-borders/FILM-FRAME_OVERLAY-${filmBorderNumber}-${orientation}${bwSuffix}`

    // Apply overlay with proper positioning and blending
    // Replace / with : for nested folders in Cloudinary overlay syntax
    transformations.push(`l_${borderPublicId.replace(/\//g, ':')}`)
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
export function getOrientationFromMedia(media: {
  width?: number
  height?: number
}): 'horizontal' | 'vertical' {
  return getOrientation(media.width, media.height)
}
