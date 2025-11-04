'use client'

import { useState, useEffect } from 'react'

interface HomePageClientProps {
  children: React.ReactNode
}

/**
 * HomePageClient Component
 *
 * Client-side wrapper for the home page that:
 * - Hides content during initial animation
 * - Shows content after animation completes
 */
export default function HomePageClient({ children }: HomePageClientProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Check if user has already seen the animation this session
    const hasSeenAnimation = sessionStorage.getItem('hasSeenSignatureAnimation')

    if (!hasSeenAnimation) {
      sessionStorage.setItem('hasSeenSignatureAnimation', 'true')

      // Start fading in content at 2/3 animation completion (2130ms of 3200ms total)
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 2130)
      return () => clearTimeout(timer)
    } else {
      // Skip animation if already seen
      setShowContent(true)
    }
  }, [])

  return (
    <div
      style={{
        opacity: showContent ? 1 : 0,
        transition: showContent ? 'opacity 0.5s ease-in' : 'none'
      }}
    >
      {children}
    </div>
  )
}
