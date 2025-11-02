'use client'

import { useState, useEffect } from 'react'
import AnimatedSignature from './AnimatedSignature'

interface HomePageClientProps {
  children: React.ReactNode
}

/**
 * HomePageClient Component
 *
 * Client-side wrapper for the home page that:
 * 1. Shows animated signature on first load (once per session)
 * 2. Transitions to main content after animation completes
 * 3. Uses sessionStorage to prevent replay on navigation
 */
export default function HomePageClient({ children }: HomePageClientProps) {
  const [showAnimation, setShowAnimation] = useState(false)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Check if user has already seen the animation this session
    const hasSeenAnimation = sessionStorage.getItem('hasSeenSignatureAnimation')

    if (!hasSeenAnimation) {
      setShowAnimation(true)
      sessionStorage.setItem('hasSeenSignatureAnimation', 'true')
    } else {
      // Skip animation if already seen
      setShowContent(true)
    }
  }, [])

  const handleAnimationComplete = () => {
    setShowAnimation(false)
    setShowContent(true)
  }

  return (
    <>
      {showAnimation && <AnimatedSignature onAnimationComplete={handleAnimationComplete} />}
      <div style={{ opacity: showContent ? 1 : 0, transition: 'opacity 0.5s ease-in' }}>
        {children}
      </div>
    </>
  )
}
