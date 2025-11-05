/**
 * Payload Config for Scripts
 *
 * This is a script-friendly version of the Payload config that doesn't rely
 * on Next.js initialization. Used for standalone scripts like border processing.
 */

import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { r2Storage } from '@payloadcms/storage-r2'

import { Users } from '../src/collections/Users.js'
import { Media } from '../src/collections/Media.js'
import { Gallery } from '../src/collections/Gallery.js'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Create a Payload config for use in scripts with provided Cloudflare bindings
 */
export function createScriptConfig(cloudflareEnv: any) {
  const secret = process.env.PAYLOAD_SECRET

  if (!secret) {
    throw new Error('PAYLOAD_SECRET environment variable is not set. Check your .env.local file.')
  }

  return buildConfig({
    admin: {
      user: Users.slug,
      importMap: {
        baseDir: path.resolve(dirname, '..', 'src'),
      },
    },
    collections: [Users, Media, Gallery],
    editor: lexicalEditor(),
    secret,
    typescript: {
      outputFile: path.resolve(dirname, '..', 'src', 'payload-types.ts'),
    },
    db: sqliteD1Adapter({
      binding: cloudflareEnv.D1,
      push: false, // Don't auto-push schema in scripts
    }),
    plugins: [
      r2Storage({
        bucket: cloudflareEnv.R2,
        collections: { media: true },
      }),
    ],
  })
}
