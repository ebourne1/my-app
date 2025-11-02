/**
 * Google Fonts configuration for Featured Photo overlays
 *
 * Next.js automatically optimizes and self-hosts these fonts
 * Only loaded when actually used on the page
 */

import { Lobster_Two, Playfair_Display, Bebas_Neue, Inter } from 'next/font/google'

export const lobsterTwo = Lobster_Two({
  weight: '700',
  style: 'italic',
  subsets: ['latin'],
  display: 'swap',
})

export const playfairDisplay = Playfair_Display({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
})

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

// Font map for easy lookup from Payload CMS values
export const fontMap = {
  'lobster-two': lobsterTwo,
  'playfair': playfairDisplay,
  'bebas': bebasNeue,
  'inter': inter,
}

export type FontFamily = keyof typeof fontMap
