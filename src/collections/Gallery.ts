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
            {
              name: 'isFilmPhoto',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Mark this as a film photograph to display vintage camera icon and film details',
              },
            },
            {
              name: 'filmType',
              type: 'select',
              options: [
                {
                  label: '35mm',
                  value: '35mm',
                },
                {
                  label: '645 Medium Format',
                  value: '645',
                },
                {
                  label: '6x6 Medium Format',
                  value: '6x6',
                },
                {
                  label: '6x7 Medium Format',
                  value: '6x7',
                },
                {
                  label: '6x9 Medium Format',
                  value: '6x9',
                },
                {
                  label: 'Large Format 4x5',
                  value: '4x5',
                },
                {
                  label: 'Large Format 8x10',
                  value: '8x10',
                },
              ],
              admin: {
                condition: (data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film format used for this photograph',
              },
            },
            {
              name: 'filmStock',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film stock used (e.g., "Kodak Gold 200", "Portra 400", "HP5 Plus")',
              },
            },
          ],
        },

        // Block 1b: Bulk Photo Upload
        {
          slug: 'photoBulk',
          labels: {
            singular: 'Bulk Photos',
            plural: 'Bulk Photos',
          },
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              required: true,
              hasMany: true,
              admin: {
                description: 'Upload multiple photos at once - they will all be added to the masonry gallery',
              },
            },
            {
              name: 'isFilmPhoto',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Mark all photos in this batch as film photographs',
              },
            },
            {
              name: 'filmType',
              type: 'select',
              options: [
                {
                  label: '35mm',
                  value: '35mm',
                },
                {
                  label: '645 Medium Format',
                  value: '645',
                },
                {
                  label: '6x6 Medium Format',
                  value: '6x6',
                },
                {
                  label: '6x7 Medium Format',
                  value: '6x7',
                },
                {
                  label: '6x9 Medium Format',
                  value: '6x9',
                },
                {
                  label: 'Large Format 4x5',
                  value: '4x5',
                },
                {
                  label: 'Large Format 8x10',
                  value: '8x10',
                },
              ],
              admin: {
                condition: (data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film format used for all photos in this batch',
              },
            },
            {
              name: 'filmStock',
              type: 'text',
              admin: {
                condition: (data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film stock used (e.g., "Kodak Gold 200", "Portra 400", "HP5 Plus")',
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
            {
              name: 'fontFamily',
              type: 'select',
              defaultValue: 'lobster-two',
              options: [
                {
                  label: 'Lobster Two Bold Italic',
                  value: 'lobster-two',
                },
                {
                  label: 'Playfair Display',
                  value: 'playfair',
                },
                {
                  label: 'Bebas Neue',
                  value: 'bebas',
                },
                {
                  label: 'Inter',
                  value: 'inter',
                },
              ],
              admin: {
                condition: (data, siblingData) => siblingData?.enableOverlay === true,
                description: 'Font family for overlay text',
              },
            },
            {
              name: 'fontSize',
              type: 'number',
              defaultValue: 64,
              min: 24,
              max: 120,
              admin: {
                condition: (data, siblingData) => siblingData?.enableOverlay === true,
                description: 'Font size in pixels (24-120)',
              },
            },
            {
              name: 'fontColor',
              type: 'text',
              defaultValue: '#ffffff',
              validate: (val) => {
                if (!val) return true
                return /^#[0-9A-F]{6}$/i.test(val) || 'Must be a valid hex color (e.g., #ffffff)'
              },
              admin: {
                condition: (data, siblingData) => siblingData?.enableOverlay === true,
                description: 'Font color as hex code (e.g., #ffffff for white)',
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
