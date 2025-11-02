import GalleryGrid from '@/components/gallery/GalleryGrid'
import './styles.css'

/**
 * Homepage - Photography Portfolio Gallery
 *
 * Renders the main gallery using GalleryGrid component which:
 * - Fetches gallery data from Payload CMS
 * - Dynamically renders blocks using the block registry
 * - Displays photos in masonry layout with featured photos and text cards
 */
export default async function HomePage() {
  return <GalleryGrid />
}
