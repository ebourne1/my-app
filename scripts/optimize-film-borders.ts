#!/usr/bin/env tsx

/**
 * Film Border PNG Optimization Script
 *
 * This script optimizes film border PNG files using Sharp to reduce file sizes
 * while maintaining transparency and visual quality.
 *
 * Usage: pnpm run optimize:borders
 */

import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const BORDERS_DIR = path.join(__dirname, '../src/assets/film-borders')

// Format bytes to human-readable size
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

// Calculate percentage reduction
function calculateReduction(original: number, optimized: number): string {
  const reduction = ((original - optimized) / original) * 100
  return `${Math.round(reduction)}%`
}

async function optimizeBorder(filePath: string): Promise<{
  filename: string
  originalSize: number
  optimizedSize: number
  reduction: string
}> {
  const filename = path.basename(filePath)

  // Get original file size
  const stats = await fs.stat(filePath)
  const originalSize = stats.size

  console.log(`  Processing: ${filename} (${formatBytes(originalSize)})`)

  // Create a backup
  const backupPath = filePath + '.backup'
  await fs.copyFile(filePath, backupPath)

  try {
    // Optimize PNG with Sharp
    await sharp(filePath)
      .png({
        compressionLevel: 9,       // Maximum compression
        quality: 85,               // Good quality (0-100)
        effort: 10,                // Maximum effort (slower but better compression)
        palette: true,             // Use palette-based PNG if possible
      })
      .toFile(filePath + '.tmp')

    // Replace original with optimized version
    await fs.rename(filePath + '.tmp', filePath)

    // Get new file size
    const newStats = await fs.stat(filePath)
    const optimizedSize = newStats.size

    const reduction = calculateReduction(originalSize, optimizedSize)

    console.log(`  ✓ Optimized: ${formatBytes(optimizedSize)} (saved ${reduction})`)

    // Remove backup on success
    await fs.unlink(backupPath)

    return {
      filename,
      originalSize,
      optimizedSize,
      reduction,
    }
  } catch (error) {
    // Restore backup on error
    console.error(`  ✗ Error optimizing ${filename}:`, error)
    await fs.rename(backupPath, filePath)
    throw error
  }
}

async function optimizeAllBorders() {
  console.log('🎨 Film Border PNG Optimization')
  console.log('===============================\n')

  try {
    // Get all PNG files in the borders directory
    const files = await fs.readdir(BORDERS_DIR)
    const pngFiles = files
      .filter(file => file.endsWith('.png') && !file.endsWith('.backup'))
      .map(file => path.join(BORDERS_DIR, file))

    if (pngFiles.length === 0) {
      console.log('No PNG files found in', BORDERS_DIR)
      return
    }

    console.log(`Found ${pngFiles.length} PNG files to optimize\n`)

    const results: {
      filename: string
      originalSize: number
      optimizedSize: number
      reduction: string
    }[] = []

    // Process each file
    for (const file of pngFiles) {
      try {
        const result = await optimizeBorder(file)
        results.push(result)
        console.log() // Empty line between files
      } catch (error) {
        console.error(`Failed to optimize ${path.basename(file)}`)
      }
    }

    // Print summary
    console.log('===============================')
    console.log('Summary:')
    console.log('===============================\n')

    const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0)
    const totalOptimized = results.reduce((sum, r) => sum + r.optimizedSize, 0)
    const totalReduction = calculateReduction(totalOriginal, totalOptimized)

    console.log(`Files processed:  ${results.length}`)
    console.log(`Original size:    ${formatBytes(totalOriginal)}`)
    console.log(`Optimized size:   ${formatBytes(totalOptimized)}`)
    console.log(`Total saved:      ${formatBytes(totalOriginal - totalOptimized)} (${totalReduction})`)
    console.log()
    console.log('✅ Optimization complete!')

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
optimizeAllBorders()
