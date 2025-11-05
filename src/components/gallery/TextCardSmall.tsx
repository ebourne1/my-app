'use client'

import { useEffect, useRef, useState } from 'react'

interface TextCardSmallProps {
  block: {
    blockType: 'textCardSmall'
    content: any // Lexical RichText JSON

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
    backgroundImage?: {
      url: string
      width: number
      height: number
      cloudinaryPublicId?: string
    }
    overlayColor?: 'dark' | 'light' | 'custom'
    customOverlayColor?: string
    overlayOpacity?: number
  }
  isFirstInMasonry?: boolean
}

/**
 * TextCardSmall Component
 *
 * Smaller version of TextCard designed for masonry grid.
 * When first in masonry section on large screens, centers itself at top.
 */
export default function TextCardSmall({ block, isFirstInMasonry = false }: TextCardSmallProps) {
  const {
    content,
    // Typography defaults
    fontFamily = 'inter',
    fontSize = 'small',
    fontWeight = 'normal',
    lineHeight = 'normal',
    letterSpacing = 'normal',
    textAlign = 'left',
    // Background defaults
    backgroundType = 'solid',
    backgroundColor = 'light',
    customBackgroundColor,
    customTextColor,
    backgroundImage,
    overlayColor = 'dark',
    customOverlayColor,
    overlayOpacity = 70,
  } = block

  const textCardRef = useRef<HTMLDivElement>(null)
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

    if (textCardRef.current) {
      observer.observe(textCardRef.current)
    }

    return () => {
      if (textCardRef.current) {
        observer.unobserve(textCardRef.current)
      }
    }
  }, [])

  if (!content) {
    console.warn('TextCardSmall missing content:', block)
    return null
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

  // Build inline styles
  const cardStyles: React.CSSProperties = {}
  const contentStyles: React.CSSProperties = {}

  // Custom background color
  if (backgroundType === 'solid' && backgroundColor === 'custom') {
    if (customBackgroundColor) {
      cardStyles.backgroundColor = customBackgroundColor
    }
    if (customTextColor) {
      contentStyles.color = customTextColor
    }
  }

  // Background image with overlay
  if (backgroundType === 'image' && backgroundImage) {
    const imageUrl = backgroundImage.cloudinaryPublicId
      ? `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto,w_800/${backgroundImage.cloudinaryPublicId}`
      : backgroundImage.url

    cardStyles.backgroundImage = `url(${imageUrl})`
    cardStyles.backgroundSize = 'cover'
    cardStyles.backgroundPosition = 'center'
    cardStyles.position = 'relative'

    // Determine overlay color
    let overlayColorValue = 'rgba(0, 0, 0, 0.7)' // default dark
    if (overlayColor === 'light') {
      overlayColorValue = `rgba(255, 255, 255, ${overlayOpacity / 100})`
    } else if (overlayColor === 'dark') {
      overlayColorValue = `rgba(0, 0, 0, ${overlayOpacity / 100})`
    } else if (overlayColor === 'custom' && customOverlayColor) {
      // Parse custom color and add opacity
      overlayColorValue = customOverlayColor.includes('rgba')
        ? customOverlayColor
        : `${customOverlayColor}${Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0')}`
    }

    // Set CSS variable for overlay color
    ;(cardStyles as any)['--overlay-color'] = overlayColorValue
  }

  return (
    <div
      ref={textCardRef}
      className={`text-card-small ${backgroundClasses} ${isFirstInMasonry ? 'first-in-masonry' : ''} reveal-on-scroll ${isRevealed ? 'revealed' : ''}`}
      style={cardStyles}
    >
      <div className={`text-card-small-content ${typographyClasses}`} style={contentStyles}>
        <RichTextRenderer data={content} />
      </div>
    </div>
  )
}

/**
 * RichTextRenderer - Renderer for Lexical RichText with link support
 *
 * Handles text nodes, links, headings, paragraphs, and lists.
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

  // Helper function to render inline content (text and links)
  const renderInlineContent = (children: any[], parentKey: string | number) => {
    return children?.map((child: any, childIndex: number) => {
      const key = `${parentKey}-${childIndex}`

      // Handle link nodes
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

      // Handle text nodes
      if (child.type === 'text') {
        return renderTextNode(child, key)
      }

      return null
    })
  }

  // Helper function to render text with formatting
  const renderTextNode = (child: any, key: string | number) => {
    let text: React.ReactNode = child.text

    // Apply formatting (bold, italic, etc.)
    if (child.format) {
      if (child.format & 1) text = <strong>{text}</strong> // Bold
      if (child.format & 2) text = <em>{text}</em> // Italic
      if (child.format & 4) text = <s>{text}</s> // Strikethrough
      if (child.format & 8) text = <u>{text}</u> // Underline
      if (child.format & 16) text = <code>{text}</code> // Code
    }

    return <span key={key}>{text}</span>
  }

  return (
    <>
      {root.children.map((node: any, index: number) => {
        // Handle paragraph nodes
        if (node.type === 'paragraph') {
          return <p key={index}>{renderInlineContent(node.children, `p-${index}`)}</p>
        }

        // Handle heading nodes
        if (node.type === 'heading') {
          // node.tag can be either "h1" or just "1" depending on Lexical version
          const tagNumber = node.tag?.toString().replace('h', '')
          const HeadingTag = `h${tagNumber}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
          return (
            <HeadingTag key={index}>{renderInlineContent(node.children, `h-${index}`)}</HeadingTag>
          )
        }

        // Handle list nodes
        if (node.type === 'list') {
          const ListTag = node.listType === 'number' ? 'ol' : 'ul'
          return (
            <ListTag key={index}>
              {node.children?.map((listItem: any, listItemIndex: number) => (
                <li key={listItemIndex}>
                  {listItem.children?.map((itemChild: any, itemChildIndex: number) => {
                    // List items can contain paragraphs or inline content
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
