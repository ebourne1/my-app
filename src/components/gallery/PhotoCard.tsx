'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'

interface PhotoCardProps {
  block: {
    blockType: 'photo' | 'photoBulk'
    image?: Media | string
    images?: (Media | string)[] // For bulk upload
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
    blackAndWhite?: boolean
  }
  priority?: boolean
  onPhotoClick?: (photo: {
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
  }) => void
}

/**
 * PhotoCard Component
 *
 * Renders individual photos in the masonry grid.
 * Handles both single photos (photo block) and bulk photos (photoBulk block).
 *
 * Features:
 * - Next.js Image optimization with AVIF/WebP automatic conversion
 * - Responsive sizing with proper sizes prop
 * - Priority loading for above-fold images
 * - Layout shift prevention using width/height
 * - Clickable to open in lightbox modal
 * - Caption hidden in grid, shown in modal only
 */
export default function PhotoCard({ block, priority = false, onPhotoClick }: PhotoCardProps) {
  // Handle photoBulk block type - render multiple images
  if (block.blockType === 'photoBulk' && block.images) {
    return (
      <>
        {block.images.map((img, idx) => {
          const image = typeof img === 'string' ? null : img
          if (!image) return null

          return (
            <PhotoCardItem
              key={image.id || `bulk-${idx}`}
              image={image}
              caption={undefined} // Bulk photos don't have captions
              priority={priority && idx === 0} // Only first bulk image gets priority
              blackAndWhite={block.blackAndWhite}
              onClick={
                onPhotoClick
                  ? () =>
                      onPhotoClick({
                        image,
                        caption: undefined,
                        isFilmPhoto: block.isFilmPhoto,
                        filmType: block.filmType,
                        filmStock: block.filmStock,
                      })
                  : undefined
              }
            />
          )
        })}
      </>
    )
  }

  // Handle regular photo block type
  const image = typeof block.image === 'string' ? null : block.image
  if (!image) return null

  return (
    <PhotoCardItem
      image={image}
      caption={block.caption}
      priority={priority}
      blackAndWhite={block.blackAndWhite}
      onClick={
        onPhotoClick
          ? () =>
              onPhotoClick({
                image,
                caption: block.caption,
                isFilmPhoto: block.isFilmPhoto,
                filmType: block.filmType,
                filmStock: block.filmStock,
              })
          : undefined
      }
    />
  )
}

/**
 * PhotoCardItem - Internal component for rendering a single image
 */
function PhotoCardItem({
  image,
  caption,
  priority,
  onClick,
  blackAndWhite = false,
}: {
  image: Media
  caption?: string
  priority: boolean
  onClick?: () => void
  blackAndWhite?: boolean
}) {
  const imageUrl = image.url
  const width = image.width || 1200
  const height = image.height || 800
  const alt = image.alt || 'Gallery photo'

  const cardRef = useRef<HTMLDivElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  // Intersection Observer for scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true)
            observer.unobserve(entry.target) // Only animate once
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of element is visible
        rootMargin: '50px', // Start animation slightly before element enters viewport
      }
    )

    if (cardRef.current) {
      observer.observe(cardRef.current)
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current)
      }
    }
  }, [])

  if (!imageUrl) {
    console.warn('Image missing URL:', image)
    return null
  }

  return (
    <div
      ref={cardRef}
      className={`photo-card reveal-on-scroll ${isRevealed ? 'revealed' : ''} ${onClick ? 'photo-card-clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      } : undefined}
    >
      <div className="photo-wrapper">
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          priority={priority}
          className={`photo-image ${blackAndWhite ? 'grayscale' : ''}`}
        />
      </div>
      {/* Caption hidden in grid view - will be shown in modal */}
    </div>
  )
}
