import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Alternative text for accessibility and SEO',
      },
    },
    {
      name: 'width',
      type: 'number',
      admin: {
        hidden: true,
        readOnly: true,
        description: 'Image width in pixels (auto-populated)',
      },
    },
    {
      name: 'height',
      type: 'number',
      admin: {
        hidden: true,
        readOnly: true,
        description: 'Image height in pixels (auto-populated)',
      },
    },
  ],
  upload: {
    // These are not supported on Workers yet due to lack of sharp
    crop: false,
    focalPoint: false,
    // TODO Phase 5: Add upload hooks to extract image dimensions
    // This prevents layout shift by allowing us to set aspect ratios
  },
}
