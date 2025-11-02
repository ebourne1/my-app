/**
 * Gallery Collection
 *
 * Main collection for the photographer's portfolio gallery.
 * Uses blocks field to support mixed content types: photos, featured photos, and text cards.
 */

import type { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const Gallery: CollectionConfig = {
  slug: 'gallery',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'published', 'updatedAt'],
    description: 'Manage your portfolio gallery with photos, featured images, and text content.',
  },
  access: {
    read: () => true, // Public access for frontend
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'Internal title for this gallery (not displayed on website)',
      },
    },
    {
      name: 'published',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck to hide this gallery from the website',
      },
    },
    {
      name: 'items',
      type: 'blocks',
      minRows: 1,
      admin: {
        description:
          'Build your gallery by adding photos, featured photos, and text cards. Drag blocks to reorder. Featured photos and text cards display full-width.',
        initCollapsed: false,
      },
      blocks: [
        // Block 1: Regular Photo
        {
          slug: 'photo',
          labels: {
            singular: 'Photo',
            plural: 'Photos',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Upload a photo for the masonry gallery',
              },
            },
            {
              name: 'caption',
              type: 'text',
              admin: {
                description: 'Optional caption displayed below the photo',
              },
            },
          ],
        },

        // Block 2: Featured Photo (Full Width with Optional Overlay)
        {
          slug: 'featuredPhoto',
          labels: {
            singular: 'Featured Photo',
            plural: 'Featured Photos',
          },
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              required: true,
              admin: {
                description: 'Featured photo - displays full-width across the page',
              },
            },
            {
              name: 'enableOverlay',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Show overlay with text and call-to-action button',
              },
            },
            {
              name: 'overlayText',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => defaultFeatures,
              }),
              admin: {
                condition: (data, siblingData) => siblingData?.enableOverlay === true,
                description: 'Text displayed over the photo (headline, tagline, etc.)',
              },
            },
            {
              name: 'buttonText',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.enableOverlay === true,
                description: 'Call-to-action button text (e.g., "Contact Me", "View Portfolio")',
              },
            },
            {
              name: 'buttonLink',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.enableOverlay === true,
                description: 'URL for the button (e.g., "/contact", "mailto:email@example.com")',
              },
            },
          ],
        },

        // Block 3: Text Card (Full Width)
        {
          slug: 'textCard',
          labels: {
            singular: 'Text Card',
            plural: 'Text Cards',
          },
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
              editor: lexicalEditor({
                features: ({ defaultFeatures }) => defaultFeatures,
              }),
              admin: {
                description:
                  'Text content for storytelling or context. Displays full-width. Keep to 2-4 paragraphs for optimal layout.',
              },
            },
            {
              name: 'backgroundColor',
              type: 'select',
              defaultValue: 'light',
              options: [
                {
                  label: 'Light',
                  value: 'light',
                },
                {
                  label: 'Dark',
                  value: 'dark',
                },
                {
                  label: 'Accent',
                  value: 'accent',
                },
              ],
              admin: {
                description: 'Background color scheme for the text card',
              },
            },
          ],
        },
      ],
    },
  ],
}
