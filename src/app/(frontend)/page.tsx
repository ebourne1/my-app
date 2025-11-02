import GalleryGrid from '@/components/gallery/GalleryGrid'
import HomePageClient from '@/components/layout/HomePageClient'
import './styles.css'

/**
 * Homepage - Photography Portfolio Gallery
 *
 * Renders the main gallery using GalleryGrid component which:
 * - Fetches gallery data from Payload CMS
 * - Dynamically renders blocks using the block registry
 * - Displays photos in masonry layout with featured photos and text cards
 * - Shows animated signature on initial page load (once per session)
 */
export default async function HomePage() {
  return (
    <HomePageClient>
      <GalleryGrid />
    </HomePageClient>
  )
}
