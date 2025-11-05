#!/usr/bin/env tsx

// Simple test script to verify basic functionality
import 'dotenv/config'

console.log('Testing basic imports...')

try {
  console.log('1. Testing Sharp...')
  const sharp = await import('sharp')
  console.log('✓ Sharp loaded')

  console.log('2. Testing Payload config...')
  const config = await import('../src/payload.config.js')
  console.log('✓ Payload config loaded')

  console.log('3. Testing Cloudflare imports...')
  const { getCloudflareContext } = await import('@opennextjs/cloudflare')
  console.log('✓ Cloudflare imports loaded')

  console.log('\n✅ All imports successful!')
} catch (error) {
  console.error('❌ Error:', error)
  process.exit(1)
}
