'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { Media } from '@/payload-types'
import { fontMap, type FontFamily } from '@/lib/fonts'

interface OverlayTextBlock {
  blockType: 'overlayText'
  text: any // Lexical RichText JSON
  alignment?: 'left' | 'center' | 'right'
  verticalPosition?: 'top' | 'top-third' | 'center' | 'bottom-third' | 'bottom'
  width?: 'small' | 'medium' | 'large' | 'full'
  fontSize?: number
  fontColor?: string
  lineHeight?: 'tight' | 'normal' | 'relaxed' | 'loose'
  fontFamily?: FontFamily
  textShadow?: boolean
  id?: string
}

interface OverlayButtonBlock {
  blockType: 'overlayButton'
  buttonText: string
  buttonLink: string
  alignment?: 'left' | 'center' | 'right'
  verticalPosition?: 'top' | 'top-third' | 'center' | 'bottom-third' | 'bottom'
  id?: string
}

type OverlayContentBlock = OverlayTextBlock | OverlayButtonBlock

interface FeaturedPhotoProps {
  block: {
    blockType: 'featuredPhoto'
    image: Media | string
    enableOverlay?: boolean
    overlayContent?: OverlayContentBlock[]
    overlayIntensity?: 'none' | 'light' | 'medium' | 'heavy'
  }
}

/**
 * FeaturedPhoto Component
 *
 * Renders a full-width featured photo with optional overlay containing:
 * - Multiple independently positioned text blocks
 * - Multiple independently positioned buttons
 *
 * Features:
 * - Full viewport width display (section break)
 * - Each overlay element can be positioned independently
 * - Next.js Image optimization
 * - Priority loading (always above-fold)
 * - Scroll reveal animation
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

  const overlayIntensity = block.overlayIntensity || 'medium'
  const overlayClasses = ['featured-overlay', `overlay-intensity-${overlayIntensity}`].join(' ')

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

        {block.enableOverlay && block.overlayContent && block.overlayContent.length > 0 && (
          <div className={overlayClasses}>
            {block.overlayContent.map((item, index) => {
              if (item.blockType === 'overlayText') {
                return <OverlayTextElement key={item.id || index} block={item} />
              } else if (item.blockType === 'overlayButton') {
                return <OverlayButtonElement key={item.id || index} block={item} />
              }
              return null
            })}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * OverlayTextElement - Renders a positioned text block
 */
function OverlayTextElement({ block }: { block: OverlayTextBlock }) {
  const alignment = block.alignment || 'center'
  const verticalPosition = block.verticalPosition || 'center'
  const width = block.width || 'medium'
  const fontSize = block.fontSize || 64
  const fontColor = block.fontColor || '#ffffff'
  const lineHeight = block.lineHeight || 'normal'
  const fontFamily = block.fontFamily || 'lobster-two'
  const textShadow = block.textShadow !== false

  const selectedFont = fontMap[fontFamily]

  const containerClasses = [
    'overlay-text-container',
    `text-align-${alignment}`,
    `text-position-${verticalPosition}`,
    `text-width-${width}`,
  ].join(' ')

  const lineHeightMap = {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5,
    loose: 1.8,
  }

  const textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    color: fontColor,
    lineHeight: lineHeightMap[lineHeight],
    textShadow: textShadow ? '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(0, 0, 0, 0.6)' : 'none',
  }

  return (
    <div className={containerClasses}>
      <div className={`overlay-text ${selectedFont.className}`} style={textStyle}>
        <RichTextRenderer data={block.text} fontSize={fontSize} fontColor={fontColor} />
      </div>
    </div>
  )
}

/**
 * OverlayButtonElement - Renders a positioned button
 */
function OverlayButtonElement({ block }: { block: OverlayButtonBlock }) {
  const alignment = block.alignment || 'center'
  const verticalPosition = block.verticalPosition || 'bottom'

  const containerClasses = [
    'overlay-button-container',
    `button-align-${alignment}`,
    `button-position-${verticalPosition}`,
  ].join(' ')

  return (
    <div className={containerClasses}>
      <a href={block.buttonLink} className="overlay-button">
        {block.buttonText}
      </a>
    </div>
  )
}

/**
 * RichTextRenderer - Simple renderer for Lexical RichText
 */
function RichTextRenderer({ data, fontSize, fontColor }: { data: any; fontSize?: number; fontColor?: string }) {
  if (!data) return null

  // Automatically scale fontSize for mobile (50% of desktop size)
  // Using clamp() for smooth responsive scaling between mobile and desktop
  const mobileFontSize = fontSize ? Math.round(fontSize * 0.5) : undefined
  const elementStyle: React.CSSProperties = {
    fontSize: fontSize ? `clamp(${mobileFontSize}px, 4vw + 1rem, ${fontSize}px)` : undefined,
    color: fontColor || undefined,
  }

  if (typeof data === 'string') return <p style={elementStyle}>{data}</p>

  const root = data.root
  if (!root || !root.children) return null

  return (
    <>
      {root.children.map((node: any, index: number) => {
        if (node.type === 'paragraph') {
          return (
            <p key={index} style={elementStyle}>
              {node.children?.map((child: any, childIndex: number) => {
                if (child.type === 'text') {
                  let text = child.text
                  if (child.format & 1) text = <strong key={childIndex}>{text}</strong>
                  if (child.format & 2) text = <em key={childIndex}>{text}</em>
                  return text
                }
                return null
              })}
            </p>
          )
        }

        if (node.type === 'heading') {
          const HeadingTag = `h${node.tag}` as keyof JSX.IntrinsicElements
          return (
            <HeadingTag key={index} style={elementStyle}>
              {node.children?.map((child: any) => child.text).join('')}
            </HeadingTag>
          )
        }

        return null
      })}
    </>
  )
}
