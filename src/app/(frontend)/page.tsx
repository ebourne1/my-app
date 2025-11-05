import GalleryGrid from '@/components/gallery/GalleryGrid'
import HomePageClient from '@/components/layout/HomePageClient'
import './styles.css'

// Enable ISR (Incremental Static Regeneration) - page rebuilds automatically every hour
export const revalidate = 3600 // seconds

/**
 * Homepage - Photography Portfolio Gallery
 *
 * Renders the main gallery using GalleryGrid component which:
 * - Fetches gallery data from Payload CMS
 * - Dynamically renders blocks using the block registry
 * - Displays photos in masonry layout with featured photos and text cards
 * - Shows animated signature on initial page load (once per session)
 * - Static with ISR: Pre-rendered at build time, regenerates every hour
 */
export default async function HomePage() {
  return (
    <HomePageClient>
      <GalleryGrid />
    </HomePageClient>
  )
}
