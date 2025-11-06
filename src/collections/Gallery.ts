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
                condition: (_data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film format used for this photograph',
              },
            },
            {
              name: 'filmStock',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film stock used (e.g., "Kodak Gold 200", "Portra 400", "HP5 Plus")',
              },
            },
            {
              name: 'blackAndWhite',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Render this photo in black and white (grayscale filter)',
              },
            },
            {
              name: 'applyFilmBorder',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Apply a film border overlay to this photo',
              },
            },
            {
              name: 'filmBorderNumber',
              type: 'select',
              options: [
                { label: 'Border 1', value: '1' },
                { label: 'Border 2', value: '2' },
                { label: 'Border 3', value: '3' },
                { label: 'Border 4', value: '4' },
                { label: 'Border 5', value: '5' },
                { label: 'Border 6', value: '6' },
                { label: 'Border 7', value: '7' },
                { label: 'Border 8', value: '8' },
              ],
              defaultValue: '1',
              admin: {
                condition: (_data, siblingData) => siblingData?.applyFilmBorder === true,
                description: 'Select which film border design to apply (1-8)',
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
                condition: (_data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film format used for all photos in this batch',
              },
            },
            {
              name: 'filmStock',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film stock used (e.g., "Kodak Gold 200", "Portra 400", "HP5 Plus")',
              },
            },
            {
              name: 'blackAndWhite',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Render all photos in this batch in black and white (grayscale filter)',
              },
            },
            {
              name: 'applyFilmBorder',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Apply a film border overlay to all photos in this batch',
              },
            },
            {
              name: 'filmBorderNumber',
              type: 'select',
              options: [
                { label: 'Border 1', value: '1' },
                { label: 'Border 2', value: '2' },
                { label: 'Border 3', value: '3' },
                { label: 'Border 4', value: '4' },
                { label: 'Border 5', value: '5' },
                { label: 'Border 6', value: '6' },
                { label: 'Border 7', value: '7' },
                { label: 'Border 8', value: '8' },
              ],
              defaultValue: '1',
              admin: {
                condition: (_data, siblingData) => siblingData?.applyFilmBorder === true,
                description: 'Select which film border design to apply to all photos (1-8)',
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
                description: 'Show overlay with text and/or buttons',
              },
            },
            {
              name: 'overlayContent',
              type: 'blocks',
              admin: {
                condition: (_data, siblingData) => siblingData?.enableOverlay === true,
                description: 'Add text blocks and buttons. Each can be positioned independently.',
              },
              blocks: [
                // Text Block
                {
                  slug: 'overlayText',
                  labels: {
                    singular: 'Text Block',
                    plural: 'Text Blocks',
                  },
                  fields: [
                    {
                      name: 'text',
                      type: 'richText',
                      required: false,
                      editor: lexicalEditor({
                        features: ({ defaultFeatures }) => defaultFeatures,
                      }),
                      admin: {
                        description: 'Text content (headline, tagline, paragraph, etc.)',
                      },
                    },
                    {
                      name: 'alignment',
                      type: 'select',
                      defaultValue: 'center',
                      options: [
                        { label: '← Left', value: 'left' },
                        { label: '↔ Center', value: 'center' },
                        { label: '→ Right', value: 'right' },
                      ],
                      admin: {
                        description: 'Horizontal alignment',
                      },
                    },
                    {
                      name: 'verticalPosition',
                      type: 'select',
                      defaultValue: 'center',
                      options: [
                        { label: '↑ Top', value: 'top' },
                        { label: '⬆ Top Third', value: 'top-third' },
                        { label: '↕ Middle', value: 'center' },
                        { label: '⬇ Bottom Third', value: 'bottom-third' },
                        { label: '↓ Bottom', value: 'bottom' },
                      ],
                      admin: {
                        description: 'Vertical position',
                      },
                    },
                    {
                      name: 'width',
                      type: 'select',
                      defaultValue: 'medium',
                      options: [
                        { label: 'Small (33%)', value: 'small' },
                        { label: 'Medium (50%)', value: 'medium' },
                        { label: 'Large (66%)', value: 'large' },
                        { label: 'Full Width', value: 'full' },
                      ],
                      admin: {
                        description: 'Maximum width',
                      },
                    },
                    {
                      name: 'fontSize',
                      type: 'number',
                      defaultValue: 64,
                      min: 24,
                      max: 120,
                      admin: {
                        description: 'Font size in pixels (24-120)',
                      },
                    },
                    {
                      name: 'fontColor',
                      type: 'text',
                      defaultValue: '#ffffff',
                      validate: (val: string) => {
                        if (!val) return true
                        return /^#[0-9A-F]{6}$/i.test(val) || 'Must be a valid hex color (e.g., #ffffff)'
                      },
                      admin: {
                        description: 'Font color as hex code (e.g., #ffffff for white)',
                      },
                    },
                    {
                      name: 'lineHeight',
                      type: 'select',
                      defaultValue: 'normal',
                      options: [
                        { label: 'Tight (1.1)', value: 'tight' },
                        { label: 'Normal (1.3)', value: 'normal' },
                        { label: 'Relaxed (1.5)', value: 'relaxed' },
                        { label: 'Loose (1.8)', value: 'loose' },
                      ],
                      admin: {
                        description: 'Line spacing (use "Relaxed" or "Loose" for large fonts)',
                      },
                    },
                    {
                      name: 'fontFamily',
                      type: 'select',
                      defaultValue: 'lobster-two',
                      options: [
                        { label: 'Lobster Two Bold Italic', value: 'lobster-two' },
                        { label: 'Playfair Display', value: 'playfair' },
                        { label: 'Bebas Neue', value: 'bebas' },
                        { label: 'Inter', value: 'inter' },
                      ],
                      admin: {
                        description: 'Font family',
                      },
                    },
                    {
                      name: 'textShadow',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: {
                        description: 'Add shadow for better readability',
                      },
                    },
                  ],
                },
                // Button Block
                {
                  slug: 'overlayButton',
                  labels: {
                    singular: 'Button',
                    plural: 'Buttons',
                  },
                  fields: [
                    {
                      name: 'buttonText',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'Button text (e.g., "Contact Me", "Get Started")',
                      },
                    },
                    {
                      name: 'buttonLink',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'URL (e.g., "/contact", "mailto:email@example.com")',
                      },
                    },
                    {
                      name: 'alignment',
                      type: 'select',
                      defaultValue: 'center',
                      options: [
                        { label: '← Left', value: 'left' },
                        { label: '↔ Center', value: 'center' },
                        { label: '→ Right', value: 'right' },
                      ],
                      admin: {
                        description: 'Horizontal alignment',
                      },
                    },
                    {
                      name: 'verticalPosition',
                      type: 'select',
                      defaultValue: 'bottom',
                      options: [
                        { label: '↑ Top', value: 'top' },
                        { label: '⬆ Top Third', value: 'top-third' },
                        { label: '↕ Middle', value: 'center' },
                        { label: '⬇ Bottom Third', value: 'bottom-third' },
                        { label: '↓ Bottom', value: 'bottom' },
                      ],
                      admin: {
                        description: 'Vertical position',
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'overlayIntensity',
              type: 'select',
              defaultValue: 'medium',
              options: [
                {
                  label: 'None (Transparent)',
                  value: 'none',
                },
                {
                  label: 'Light',
                  value: 'light',
                },
                {
                  label: 'Medium',
                  value: 'medium',
                },
                {
                  label: 'Heavy',
                  value: 'heavy',
                },
              ],
              admin: {
                condition: (_data, siblingData) => siblingData?.enableOverlay === true,
                description: 'Darkness of the background overlay for text readability',
              },
            },
            {
              name: 'blackAndWhite',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Render this photo in black and white (grayscale filter)',
              },
            },
            {
              name: 'applyFilmBorder',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Apply a film border overlay to this photo',
              },
            },
            {
              name: 'filmBorderNumber',
              type: 'select',
              options: [
                { label: 'Border 1', value: '1' },
                { label: 'Border 2', value: '2' },
                { label: 'Border 3', value: '3' },
                { label: 'Border 4', value: '4' },
                { label: 'Border 5', value: '5' },
                { label: 'Border 6', value: '6' },
                { label: 'Border 7', value: '7' },
                { label: 'Border 8', value: '8' },
              ],
              defaultValue: '1',
              admin: {
                condition: (_data, siblingData) => siblingData?.applyFilmBorder === true,
                description: 'Select which film border design to apply (1-8)',
              },
            },
          ],
        },

        // Block 3: 3-Column Grid (Section Break)
        {
          slug: 'photoBulk3Across',
          labels: {
            singular: '3-Column Grid',
            plural: '3-Column Grids',
          },
          fields: [
            // Individual items array (for mixing photos and text cards)
            {
              name: 'items',
              type: 'blocks',
              minRows: 0,
              admin: {
                description:
                  'Add individual photos or text cards with full control over each item. Drag to reorder.',
              },
              blocks: [
                // Nested block: Grid Photo
                {
                  slug: 'gridPhoto',
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
                    },
                    {
                      name: 'caption',
                      type: 'text',
                    },
                    {
                      name: 'isFilmPhoto',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'filmType',
                      type: 'select',
                      options: [
                        { label: '35mm', value: '35mm' },
                        { label: '645 Medium Format', value: '645' },
                        { label: '6x6 Medium Format', value: '6x6' },
                        { label: '6x7 Medium Format', value: '6x7' },
                        { label: '6x9 Medium Format', value: '6x9' },
                        { label: 'Large Format 4x5', value: '4x5' },
                        { label: 'Large Format 8x10', value: '8x10' },
                      ],
                      admin: {
                        condition: (_data, siblingData) => siblingData?.isFilmPhoto === true,
                      },
                    },
                    {
                      name: 'filmStock',
                      type: 'text',
                      admin: {
                        condition: (_data, siblingData) => siblingData?.isFilmPhoto === true,
                      },
                    },
                    {
                      name: 'blackAndWhite',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'applyFilmBorder',
                      type: 'checkbox',
                      defaultValue: false,
                    },
                    {
                      name: 'filmBorderNumber',
                      type: 'select',
                      options: [
                        { label: 'Border 1', value: '1' },
                        { label: 'Border 2', value: '2' },
                        { label: 'Border 3', value: '3' },
                        { label: 'Border 4', value: '4' },
                        { label: 'Border 5', value: '5' },
                        { label: 'Border 6', value: '6' },
                        { label: 'Border 7', value: '7' },
                        { label: 'Border 8', value: '8' },
                      ],
                      defaultValue: '1',
                      admin: {
                        condition: (_data, siblingData) => siblingData?.applyFilmBorder === true,
                      },
                    },
                  ],
                },
                // Nested block: Grid Text Card
                {
                  slug: 'gridTextCard',
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
                    },
                    {
                      name: 'fontFamily',
                      type: 'select',
                      defaultValue: 'inter',
                      options: [
                        { label: 'Inter (Sans Serif)', value: 'inter' },
                        { label: 'Playfair Display (Serif)', value: 'playfair' },
                        { label: 'Bebas Neue (Display)', value: 'bebas' },
                        { label: 'Lobster Two Bold Italic', value: 'lobster-two' },
                      ],
                    },
                    {
                      name: 'fontSize',
                      type: 'select',
                      defaultValue: 'medium',
                      options: [
                        { label: 'Small', value: 'small' },
                        { label: 'Medium', value: 'medium' },
                        { label: 'Large', value: 'large' },
                      ],
                    },
                    {
                      name: 'textAlign',
                      type: 'select',
                      defaultValue: 'center',
                      options: [
                        { label: 'Left', value: 'left' },
                        { label: 'Center', value: 'center' },
                        { label: 'Right', value: 'right' },
                      ],
                    },
                    {
                      name: 'backgroundType',
                      type: 'select',
                      defaultValue: 'solid',
                      options: [
                        { label: 'None (Transparent)', value: 'none' },
                        { label: 'Solid Color', value: 'solid' },
                      ],
                    },
                    {
                      name: 'backgroundColor',
                      type: 'select',
                      defaultValue: 'light',
                      options: [
                        { label: 'Light (Dark Grey)', value: 'light' },
                        { label: 'Dark (Near Black)', value: 'dark' },
                        { label: 'Accent (Blue-Grey)', value: 'accent' },
                      ],
                      admin: {
                        condition: (_data, siblingData) => siblingData?.backgroundType === 'solid',
                      },
                    },
                  ],
                },
              ],
            },

            // Bulk upload array (for quick photo uploads with shared settings)
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: {
                description:
                  'Upload multiple photos at once - they will share the film settings below',
              },
            },

            // Shared film metadata for bulk uploads
            {
              name: 'isFilmPhoto',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Mark all bulk uploaded photos as film photographs',
              },
            },
            {
              name: 'filmType',
              type: 'select',
              options: [
                { label: '35mm', value: '35mm' },
                { label: '645 Medium Format', value: '645' },
                { label: '6x6 Medium Format', value: '6x6' },
                { label: '6x7 Medium Format', value: '6x7' },
                { label: '6x9 Medium Format', value: '6x9' },
                { label: 'Large Format 4x5', value: '4x5' },
                { label: 'Large Format 8x10', value: '8x10' },
              ],
              admin: {
                condition: (_data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film format used for all bulk uploaded photos',
              },
            },
            {
              name: 'filmStock',
              type: 'text',
              admin: {
                condition: (_data, siblingData) => siblingData?.isFilmPhoto === true,
                description: 'Film stock used for all bulk uploaded photos',
              },
            },
            {
              name: 'blackAndWhite',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Render all bulk uploaded photos in black and white',
              },
            },
            {
              name: 'applyFilmBorder',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Apply film border to all bulk uploaded photos',
              },
            },
            {
              name: 'filmBorderNumber',
              type: 'select',
              options: [
                { label: 'Border 1', value: '1' },
                { label: 'Border 2', value: '2' },
                { label: 'Border 3', value: '3' },
                { label: 'Border 4', value: '4' },
                { label: 'Border 5', value: '5' },
                { label: 'Border 6', value: '6' },
                { label: 'Border 7', value: '7' },
                { label: 'Border 8', value: '8' },
              ],
              defaultValue: '1',
              admin: {
                condition: (_data, siblingData) => siblingData?.applyFilmBorder === true,
                description: 'Film border design for all bulk uploaded photos',
              },
            },
          ],
        },

        // Block 4: Text Card (Full Width)
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
                features: ({ defaultFeatures }) => [
                  ...defaultFeatures,
                  // Link support is included in defaultFeatures
                ],
              }),
              admin: {
                description:
                  'Text content for storytelling or context. Displays full-width. Supports hyperlinks and rich formatting.',
              },
            },

            // Typography Controls
            {
              name: 'fontFamily',
              type: 'select',
              defaultValue: 'inter',
              options: [
                { label: 'Inter (Sans Serif)', value: 'inter' },
                { label: 'Playfair Display (Serif)', value: 'playfair' },
                { label: 'Bebas Neue (Display)', value: 'bebas' },
                { label: 'Lobster Two Bold Italic', value: 'lobster-two' },
                { label: 'JetBrains Mono (Monospace)', value: 'monospace' },
              ],
              admin: {
                description: 'Font family for the text content',
              },
            },
            {
              name: 'fontSize',
              type: 'select',
              defaultValue: 'medium',
              options: [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
                { label: 'Extra Large', value: 'xl' },
              ],
              admin: {
                description: 'Base font size for paragraphs',
              },
            },
            {
              name: 'fontWeight',
              type: 'select',
              defaultValue: 'normal',
              options: [
                { label: 'Light (300)', value: 'light' },
                { label: 'Normal (400)', value: 'normal' },
                { label: 'Medium (500)', value: 'medium' },
                { label: 'Semibold (600)', value: 'semibold' },
                { label: 'Bold (700)', value: 'bold' },
              ],
              admin: {
                description: 'Font weight for body text',
              },
            },
            {
              name: 'lineHeight',
              type: 'select',
              defaultValue: 'relaxed',
              options: [
                { label: 'Tight (1.4)', value: 'tight' },
                { label: 'Normal (1.6)', value: 'normal' },
                { label: 'Relaxed (1.8)', value: 'relaxed' },
                { label: 'Loose (2.0)', value: 'loose' },
              ],
              admin: {
                description: 'Line spacing for readability',
              },
            },
            {
              name: 'letterSpacing',
              type: 'select',
              defaultValue: 'normal',
              options: [
                { label: 'Tight (-0.025em)', value: 'tight' },
                { label: 'Normal (0)', value: 'normal' },
                { label: 'Wide (0.05em)', value: 'wide' },
              ],
              admin: {
                description: 'Letter spacing (tracking)',
              },
            },
            {
              name: 'textAlign',
              type: 'select',
              defaultValue: 'left',
              options: [
                { label: 'Left', value: 'left' },
                { label: 'Center', value: 'center' },
                { label: 'Right', value: 'right' },
                { label: 'Justify', value: 'justify' },
              ],
              admin: {
                description: 'Text alignment',
              },
            },

            // Background Configuration
            {
              name: 'backgroundType',
              type: 'select',
              defaultValue: 'solid',
              options: [
                { label: 'None (Transparent)', value: 'none' },
                { label: 'Solid Color', value: 'solid' },
                { label: 'Image', value: 'image' },
              ],
              admin: {
                description: 'Background type for the text card',
              },
            },
            {
              name: 'backgroundColor',
              type: 'select',
              defaultValue: 'light',
              options: [
                { label: 'Light (Dark Grey)', value: 'light' },
                { label: 'Dark (Near Black)', value: 'dark' },
                { label: 'Accent (Blue-Grey)', value: 'accent' },
                { label: 'Custom Color', value: 'custom' },
              ],
              admin: {
                condition: (_data, siblingData) => siblingData?.backgroundType === 'solid',
                description: 'Background color scheme',
              },
            },
            {
              name: 'customBackgroundColor',
              type: 'text',
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.backgroundType === 'solid' && siblingData?.backgroundColor === 'custom',
                description: 'Custom background color (e.g., #1a1a1a or rgb(26, 26, 26))',
              },
            },
            {
              name: 'customTextColor',
              type: 'text',
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.backgroundType === 'solid' && siblingData?.backgroundColor === 'custom',
                description: 'Custom text color (e.g., #ffffff or rgb(255, 255, 255))',
              },
            },
            {
              name: 'backgroundImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                condition: (_data, siblingData) => siblingData?.backgroundType === 'image',
                description: 'Background image for the text card',
              },
            },
            {
              name: 'overlayColor',
              type: 'select',
              defaultValue: 'dark',
              options: [
                { label: 'Dark Overlay', value: 'dark' },
                { label: 'Light Overlay', value: 'light' },
                { label: 'Custom Overlay', value: 'custom' },
              ],
              admin: {
                condition: (_data, siblingData) => siblingData?.backgroundType === 'image',
                description: 'Overlay color for text readability',
              },
            },
            {
              name: 'customOverlayColor',
              type: 'text',
              admin: {
                condition: (_data, siblingData) =>
                  siblingData?.backgroundType === 'image' && siblingData?.overlayColor === 'custom',
                description: 'Custom overlay color (e.g., #000000 or rgb(0, 0, 0))',
              },
            },
            {
              name: 'overlayOpacity',
              type: 'number',
              defaultValue: 70,
              min: 0,
              max: 100,
              admin: {
                condition: (_data, siblingData) => siblingData?.backgroundType === 'image',
                description: 'Overlay opacity (0-100, where 100 is fully opaque)',
              },
            },
          ],
        },
      ],
    },
  ],
}
