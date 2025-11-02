'use client'

import { useEffect, useRef, useState } from 'react'

interface TextCardProps {
  block: {
    blockType: 'textCard'
    content: any // Lexical RichText JSON
    backgroundColor?: 'light' | 'dark' | 'accent'
  }
}

/**
 * TextCard Component
 *
 * Renders full-width text content cards for storytelling and context.
 * Supports three background color schemes: light, dark, and accent.
 *
 * Features:
 * - Full-width display (section break)
 * - Rich text formatting with Lexical
 * - Multiple background color options
 * - Responsive text sizing
 * - Optimal reading width (max 800px centered)
 */
export default function TextCard({ block }: TextCardProps) {
  const { content, backgroundColor = 'light' } = block

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
    console.warn('TextCard missing content:', block)
    return null
  }

  return (
    <div
      ref={textCardRef}
      className={`text-card text-card-${backgroundColor} reveal-on-scroll ${isRevealed ? 'revealed' : ''}`}
    >
      <div className="text-card-content">
        <RichTextRenderer data={content} />
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

        // Handle list nodes
        if (node.type === 'list') {
          const ListTag = node.listType === 'number' ? 'ol' : 'ul'
          return (
            <ListTag key={index}>
              {node.children?.map((listItem: any, listItemIndex: number) => (
                <li key={listItemIndex}>
                  {listItem.children?.map((child: any) => child.text).join('')}
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
