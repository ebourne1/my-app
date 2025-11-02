'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface AnimatedSignatureProps {
  onAnimationComplete?: () => void
}

/**
 * AnimatedSignature Component
 *
 * Displays an animated reveal of the Britnee Bourne signature logo
 * on initial page load. The animation simulates the signature being written
 * with a smooth reveal from left to right.
 */
export default function AnimatedSignature({ onAnimationComplete }: AnimatedSignatureProps) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Animation duration: 2.5 seconds reveal + 0.5s pause
    const animationTimer = setTimeout(() => {
      setIsAnimating(false)

      // Wait another 0.5s before calling completion callback
      const completionTimer = setTimeout(() => {
        if (onAnimationComplete) {
          onAnimationComplete()
        }
        // Fade out the animation component
        setIsVisible(false)
      }, 500)

      return () => clearTimeout(completionTimer)
    }, 2500)

    return () => clearTimeout(animationTimer)
  }, [onAnimationComplete])

  if (!isVisible) return null

  return (
    <div className={`signature-animation-overlay ${!isAnimating ? 'fade-out' : ''}`}>
      <div className="signature-animation-container">
        <div className="signature-reveal-wrapper">
          <Image
            src="/images/britnee-bourne-animated.svg"
            alt="Britnee Bourne"
            width={240}
            height={240}
            className="signature-image"
            priority
          />
        </div>
      </div>
    </div>
  )
}
