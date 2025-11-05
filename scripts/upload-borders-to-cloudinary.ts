/**
 * Upload film borders to Cloudinary
 *
 * This script uploads all 32 film border PNG files to Cloudinary.
 *
 * Usage:
 * 1. Install cloudinary: pnpm add cloudinary
 * 2. Set environment variables: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET
 * 3. Run: tsx scripts/upload-borders-to-cloudinary.ts
 */

import { v2 as cloudinary } from 'cloudinary'
import { readdirSync } from 'fs'
import { join } from 'path'

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dthtnyavj',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const BORDERS_DIR = join(process.cwd(), 'src/assets/film-borders')

async function uploadBorders() {
  console.log('🎬 Starting film border upload to Cloudinary...\n')

  if (!process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error('❌ Error: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET must be set')
    console.error('   Get these from: https://cloudinary.com/console/settings/security')
    process.exit(1)
  }

  // Get all PNG files
  const files = readdirSync(BORDERS_DIR).filter((f) => f.endsWith('.png'))
  console.log(`Found ${files.length} border files to upload\n`)

  let successCount = 0
  let errorCount = 0

  for (const file of files) {
    const filePath = join(BORDERS_DIR, file)
    const publicId = `film-borders/${file.replace('.png', '')}`

    try {
      console.log(`📤 Uploading: ${file}`)

      const result = await cloudinary.uploader.upload(filePath, {
        public_id: publicId,
        folder: 'film-borders',
        resource_type: 'image',
        overwrite: true, // Overwrite if already exists
      })

      console.log(`   ✅ Success: ${result.secure_url}`)
      successCount++
    } catch (error) {
      console.error(`   ❌ Failed: ${error}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`\n✨ Upload complete!`)
  console.log(`   Success: ${successCount}`)
  console.log(`   Failed: ${errorCount}`)
  console.log(`\n📊 View your uploads: https://cloudinary.com/console/c-dthtnyavj/media_library/folders/film-borders`)
  console.log('='.repeat(60) + '\n')
}

uploadBorders().catch(console.error)
