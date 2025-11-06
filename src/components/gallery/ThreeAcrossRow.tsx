'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import PhotoModal from './PhotoModal'
import type { Media } from '@/payload-types'

interface ThreeAcrossRowProps {
  block: {
    blockType: 'threeAcrossRow'
    leftImage: Media | string
    rightImage: Media | string
    textContent: any // Lexical RichText JSON

    // Typography
    fontFamily?: 'inter' | 'playfair' | 'bebas' | 'lobster-two' | 'monospace'
    fontSize?: 'small' | 'medium' | 'large' | 'xl'
    fontWeight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold'
    lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose'
    letterSpacing?: 'tight' | 'normal' | 'wide'
    textAlign?: 'left' | 'center' | 'right' | 'justify'

    // Background
    backgroundType?: 'none' | 'solid' | 'image'
    backgroundColor?: 'light' | 'dark' | 'accent' | 'custom'
    customBackgroundColor?: string
    customTextColor?: string
    backgroundImage?: Media | string
    overlayColor?: 'dark' | 'light' | 'custom'
    customOverlayColor?: string
    overlayOpacity?: number

    // Left photo metadata
    leftPhotoCaption?: string
    leftPhotoIsFilm?: boolean
    leftPhotoFilmType?: string
    leftPhotoFilmStock?: string
    leftPhotoBlackAndWhite?: boolean
    leftPhotoApplyFilmBorder?: boolean
    leftPhotoFilmBorderNumber?: string

    // Right photo metadata
    rightPhotoCaption?: string
    rightPhotoIsFilm?: boolean
    rightPhotoFilmType?: string
    rightPhotoFilmStock?: string
    rightPhotoBlackAndWhite?: boolean
    rightPhotoApplyFilmBorder?: boolean
    rightPhotoFilmBorderNumber?: string
  }
}

/**
 * ThreeAcrossRow Component
 *
 * Desktop (≥768px): 3 columns in single row (left photo | center text | right photo)
 * - Dynamic uniform height based on tallest element
 * - Photos use object-fit: cover for cropping
 * - Photos are clickable and open modal with full uncropped version
 *
 * Mobile (<768px): Stacked vertically
 * - Text appears first, then left photo, then right photo
 * - Natural heights, no cropping
 */
export default function ThreeAcrossRow({ block }: ThreeAcrossRowProps) {
  const {
    leftImage: leftImageData,
    rightImage: rightImageData,
    textContent,
    // Typography defaults
    fontFamily = 'inter',
    fontSize = 'small',
    fontWeight = 'normal',
    lineHeight = 'normal',
    letterSpacing = 'normal',
    textAlign = 'center',
    // Background defaults
    backgroundType = 'solid',
    backgroundColor = 'light',
    customBackgroundColor,
    customTextColor,
    backgroundImage: bgImageData,
    overlayColor = 'dark',
    customOverlayColor,
    overlayOpacity = 70,
    // Photo metadata
    leftPhotoCaption,
    leftPhotoIsFilm,
    leftPhotoFilmType,
    leftPhotoFilmStock,
    leftPhotoBlackAndWhite,
    leftPhotoApplyFilmBorder,
    leftPhotoFilmBorderNumber,
    rightPhotoCaption,
    rightPhotoIsFilm,
    rightPhotoFilmType,
    rightPhotoFilmStock,
    rightPhotoBlackAndWhite,
    rightPhotoApplyFilmBorder,
    rightPhotoFilmBorderNumber,
  } = block

  // Parse image data
  const leftImage = typeof leftImageData === 'string' ? null : leftImageData
  const rightImage = typeof rightImageData === 'string' ? null : rightImageData
  const backgroundImage = typeof bgImageData === 'string' ? null : bgImageData

  // Refs for height calculation
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const [rowHeight, setRowHeight] = useState<number | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  // Modal state
  const [selectedPhoto, setSelectedPhoto] = useState<{
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
  } | null>(null)

  // Calculate dynamic height on mount and resize
  useEffect(() => {
    const calculateHeight = () => {
      // Only calculate on desktop
      if (window.innerWidth < 768 || !containerRef.current || !textRef.current || !leftImage || !rightImage) {
        setRowHeight(null)
        return
      }

      // Get container width and calculate column width (1/3 of container minus gaps)
      const containerWidth = containerRef.current.offsetWidth
      const gap = 24 // 1.5rem = 24px
      const columnWidth = (containerWidth - gap * 2) / 3

      // Calculate natural height of each element
      const textHeight = textRef.current.scrollHeight

      // Calculate image heights based on aspect ratio
      const leftImageHeight = (leftImage.height / leftImage.width) * columnWidth
      const rightImageHeight = (rightImage.height / rightImage.width) * columnWidth

      // Use the maximum height
      const maxHeight = Math.max(textHeight, leftImageHeight, rightImageHeight)
      setRowHeight(maxHeight)
    }

    // Calculate on mount
    calculateHeight()

    // Recalculate on window resize
    window.addEventListener('resize', calculateHeight)
    return () => window.removeEventListener('resize', calculateHeight)
  }, [leftImage, rightImage, textContent])

  // Intersection Observer for scroll reveal animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsRevealed(true)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current)
      }
    }
  }, [])

  // Handle photo click (desktop only)
  const handlePhotoClick = (photo: {
    image: Media
    caption?: string
    isFilmPhoto?: boolean
    filmType?: string
    filmStock?: string
  }) => {
    // Disable modal on mobile screens (< 768px)
    if (window.innerWidth < 768) {
      return
    }
    setSelectedPhoto(photo)
  }

  const handleCloseModal = () => {
    setSelectedPhoto(null)
  }

  if (!leftImage || !rightImage) {
    return (
      <div className="three-across-row-empty">
        <p>Missing images. Please upload both left and right photos.</p>
      </div>
    )
  }

  // Build CSS classes for typography
  const typographyClasses = [
    `font-family-${fontFamily}`,
    `font-size-${fontSize}`,
    `font-weight-${fontWeight}`,
    `line-height-${lineHeight}`,
    `letter-spacing-${letterSpacing}`,
    `text-align-${textAlign}`,
  ].join(' ')

  // Build CSS classes for background
  let backgroundClasses = ''
  if (backgroundType === 'solid') {
    backgroundClasses = `text-card-${backgroundColor}`
  } else if (backgroundType === 'none') {
    backgroundClasses = 'text-card-transparent'
  } else if (backgroundType === 'image') {
    backgroundClasses = 'text-card-image'
  }

  // Build inline styles for text card
  const textCardStyles: React.CSSProperties = {}
  const textContentStyles: React.CSSProperties = {}

  // Custom background color
  if (backgroundType === 'solid' && backgroundColor === 'custom') {
    if (customBackgroundColor) {
      textCardStyles.backgroundColor = customBackgroundColor
    }
    if (customTextColor) {
      textContentStyles.color = customTextColor
    }
  }

  // Background image with overlay
  if (backgroundType === 'image' && backgroundImage) {
    const imageUrl = backgroundImage.cloudinaryPublicId
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800/${backgroundImage.cloudinaryPublicId}`
      : backgroundImage.url

    textCardStyles.backgroundImage = `url(${imageUrl})`
    textCardStyles.backgroundSize = 'cover'
    textCardStyles.backgroundPosition = 'center'
    textCardStyles.position = 'relative'

    // Determine overlay color
    let overlayColorValue = 'rgba(0, 0, 0, 0.7)' // default dark
    if (overlayColor === 'light') {
      overlayColorValue = `rgba(255, 255, 255, ${overlayOpacity / 100})`
    } else if (overlayColor === 'dark') {
      overlayColorValue = `rgba(0, 0, 0, ${overlayOpacity / 100})`
    } else if (overlayColor === 'custom' && customOverlayColor) {
      overlayColorValue = customOverlayColor.includes('rgba')
        ? customOverlayColor
        : `${customOverlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
    }

    // Set CSS variable for overlay color
    ;(textCardStyles as any)['--overlay-color'] = overlayColorValue
  }

  // Apply dynamic height on desktop
  if (rowHeight) {
    textCardStyles.height = `${rowHeight}px`
  }

  // Generate Cloudinary URLs for photos
  const getCloudinaryUrl = (image: Media, width: number) => {
    if (image.cloudinaryPublicId) {
      return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_${width}/${image.cloudinaryPublicId}`
    }
    return image.url
  }

  return (
    <>
      <div
        ref={containerRef}
        className={`three-across-row reveal-on-scroll ${isRevealed ? 'revealed' : ''}`}
      >
        <div className="three-across-row-grid">
          {/* Left Photo */}
          <div
            className="three-across-row-photo-wrapper"
            style={rowHeight ? { height: `${rowHeight}px` } : {}}
            onClick={() =>
              handlePhotoClick({
                image: leftImage,
                caption: leftPhotoCaption,
                isFilmPhoto: leftPhotoIsFilm,
                filmType: leftPhotoFilmType,
                filmStock: leftPhotoFilmStock,
              })
            }
          >
            <Image
              src={getCloudinaryUrl(leftImage, 800)}
              alt={leftPhotoCaption || 'Gallery photo'}
              width={leftImage.width}
              height={leftImage.height}
              className={`three-across-row-photo ${leftPhotoBlackAndWhite ? 'grayscale' : ''}`}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>

          {/* Center Text Card - hidden offscreen for height measurement */}
          <div
            ref={textRef}
            className={`three-across-row-text-measure ${backgroundClasses}`}
            style={{ position: 'absolute', visibility: 'hidden', width: '33.33%' }}
          >
            <div className={`text-card-small-content ${typographyClasses}`} style={textContentStyles}>
              <RichTextRenderer data={textContent} />
            </div>
          </div>

          {/* Center Text Card - visible version with fixed height */}
          <div
            className={`three-across-row-text ${backgroundClasses}`}
            style={textCardStyles}
          >
            <div className={`text-card-small-content ${typographyClasses}`} style={textContentStyles}>
              <RichTextRenderer data={textContent} />
            </div>
          </div>

          {/* Right Photo */}
          <div
            className="three-across-row-photo-wrapper"
            style={rowHeight ? { height: `${rowHeight}px` } : {}}
            onClick={() =>
              handlePhotoClick({
                image: rightImage,
                caption: rightPhotoCaption,
                isFilmPhoto: rightPhotoIsFilm,
                filmType: rightPhotoFilmType,
                filmStock: rightPhotoFilmStock,
              })
            }
          >
            <Image
              src={getCloudinaryUrl(rightImage, 800)}
              alt={rightPhotoCaption || 'Gallery photo'}
              width={rightImage.width}
              height={rightImage.height}
              className={`three-across-row-photo ${rightPhotoBlackAndWhite ? 'grayscale' : ''}`}
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      <PhotoModal isOpen={!!selectedPhoto} onClose={handleCloseModal} photo={selectedPhoto} />
    </>
  )
}

/**
 * RichTextRenderer - Renderer for Lexical RichText with link support
 * (Reused from TextCardSmall component)
 */
function RichTextRenderer({ data }: { data: any }) {
  if (!data) return null
  if (typeof data === 'string') return <p>{data}</p>

  const root = data.root
  if (!root || !root.children) return null

  const renderInlineContent = (children: any[], parentKey: string | number) => {
    return children?.map((child: any, childIndex: number) => {
      const key = `${parentKey}-${childIndex}`

      if (child.type === 'link' || child.type === 'autolink') {
        const linkUrl = child.fields?.url || child.url || '#'
        const linkTarget = child.fields?.newTab ? '_blank' : '_self'
        const linkRel = child.fields?.newTab ? 'noopener noreferrer' : undefined

        return (
          <a key={key} href={linkUrl} target={linkTarget} rel={linkRel} className="text-card-link">
            {child.children?.map((linkChild: any, linkChildIndex: number) => {
              if (linkChild.type === 'text') {
                return renderTextNode(linkChild, `${key}-${linkChildIndex}`)
              }
              return null
            })}
          </a>
        )
      }

      if (child.type === 'text') {
        return renderTextNode(child, key)
      }

      return null
    })
  }

  const renderTextNode = (child: any, key: string | number) => {
    let text: React.ReactNode = child.text

    if (child.format) {
      if (child.format & 1) text = <strong>{text}</strong>
      if (child.format & 2) text = <em>{text}</em>
      if (child.format & 4) text = <s>{text}</s>
      if (child.format & 8) text = <u>{text}</u>
      if (child.format & 16) text = <code>{text}</code>
    }

    return <span key={key}>{text}</span>
  }

  return (
    <>
      {root.children.map((node: any, index: number) => {
        if (node.type === 'paragraph') {
          return <p key={index}>{renderInlineContent(node.children, `p-${index}`)}</p>
        }

        if (node.type === 'heading') {
          const tagNumber = node.tag?.toString().replace('h', '')
          const HeadingTag = `h${tagNumber}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
          return (
            <HeadingTag key={index}>{renderInlineContent(node.children, `h-${index}`)}</HeadingTag>
          )
        }

        if (node.type === 'list') {
          const ListTag = node.listType === 'number' ? 'ol' : 'ul'
          return (
            <ListTag key={index}>
              {node.children?.map((listItem: any, listItemIndex: number) => (
                <li key={listItemIndex}>
                  {listItem.children?.map((itemChild: any, itemChildIndex: number) => {
                    if (itemChild.type === 'paragraph') {
                      return renderInlineContent(itemChild.children, `li-${listItemIndex}-${itemChildIndex}`)
                    }
                    return renderInlineContent([itemChild], `li-${listItemIndex}-${itemChildIndex}`)
                  })}
                </li>
              ))}
            </ListTag>
          )
        }

        return null
      })}
    </>
  )
}
