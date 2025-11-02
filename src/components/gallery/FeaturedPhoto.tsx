'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import { fontMap, type FontFamily } from '@/lib/fonts'

interface FeaturedPhotoProps {
  block: {
    blockType: 'featuredPhoto'
    image: Media | string
    enableOverlay?: boolean
    overlayText?: any // Lexical RichText JSON
    buttonText?: string
    buttonLink?: string
    fontFamily?: FontFamily
    fontSize?: number
    fontColor?: string
  }
}

/**
 * FeaturedPhoto Component
 *
 * Renders a full-width featured photo with optional overlay containing:
 * - Rich text content (headlines, taglines, descriptions)
 * - Call-to-action button with custom text and link
 *
 * Features:
 * - Full viewport width display (section break)
 * - Optional dark overlay with centered content
 * - Next.js Image optimization
 * - Priority loading (always above-fold)
 * - Responsive text sizing
 */
export default function FeaturedPhoto({ block }: FeaturedPhotoProps) {
  const image = typeof block.image === 'string' ? null : block.image

  const featuredRef = useRef<HTMLDivElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)

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

    if (featuredRef.current) {
      observer.observe(featuredRef.current)
    }

    return () => {
      if (featuredRef.current) {
        observer.unobserve(featuredRef.current)
      }
    }
  }, [])

  if (!image || !image.url) {
    console.warn('Featured photo missing image:', block)
    return null
  }

  const imageUrl = image.url
  const width = image.width || 2400
  const height = image.height || 1200
  const alt = image.alt || 'Featured photo'

  // Get font configuration with defaults
  const fontFamily = block.fontFamily || 'lobster-two'
  const fontSize = block.fontSize || 64
  const fontColor = block.fontColor || '#ffffff'
  const selectedFont = fontMap[fontFamily]

  // Build inline styles for overlay text
  const overlayTextStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    color: fontColor,
  }

  return (
    <div ref={featuredRef} className={`featured-photo reveal-on-scroll ${isRevealed ? 'revealed' : ''}`}>
      <div className="featured-photo-wrapper">
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          sizes="100vw"
          priority // Featured photos are always high priority
          className="featured-image"
        />

        {block.enableOverlay && (block.overlayText || block.buttonText) && (
          <div className="featured-overlay">
            <div className="overlay-content">
              {block.overlayText && (
                <div className={`overlay-text ${selectedFont.className}`} style={overlayTextStyle}>
                  <RichTextRenderer data={block.overlayText} />
                </div>
              )}
              {block.buttonText && block.buttonLink && (
                <a href={block.buttonLink} className="overlay-button">
                  {block.buttonText}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * RichTextRenderer - Simple renderer for Lexical RichText
 *
 * Note: For production, use @payloadcms/richtext-lexical/react's RichText component
 * This is a simplified version for basic text rendering
 */
function RichTextRenderer({ data }: { data: any }) {
  // If data is null/undefined, return nothing
  if (!data) return null

  // If it's a string (shouldn't happen with Lexical, but just in case)
  if (typeof data === 'string') {
    return <p>{data}</p>
  }

  // Lexical format: { root: { children: [...] } }
  const root = data.root
  if (!root || !root.children) {
    return null
  }

  return (
    <>
      {root.children.map((node: any, index: number) => {
        // Handle paragraph nodes
        if (node.type === 'paragraph') {
          return (
            <p key={index}>
              {node.children?.map((child: any, childIndex: number) => {
                if (child.type === 'text') {
                  // Handle text formatting
                  let text = child.text
                  if (child.format & 1) text = <strong key={childIndex}>{text}</strong> // Bold
                  if (child.format & 2) text = <em key={childIndex}>{text}</em> // Italic
                  return text
                }
                return null
              })}
            </p>
          )
        }

        // Handle heading nodes
        if (node.type === 'heading') {
          const HeadingTag = `h${node.tag}` as keyof JSX.IntrinsicElements
          return (
            <HeadingTag key={index}>
              {node.children?.map((child: any) => child.text).join('')}
            </HeadingTag>
          )
        }

        return null
      })}
    </>
  )
}
