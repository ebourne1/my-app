'use client'

import { useState, useEffect, useRef } from 'react'

interface AnimatedSignatureProps {
  onAnimationComplete?: () => void
}

/**
 * AnimatedSignature Component
 *
 * Displays an animated "handwriting" of the Britnee Bourne signature logo
 * on initial page load. Uses stroke-dasharray animation to simulate
 * the signature being drawn with a pen.
 */
export default function AnimatedSignature({ onAnimationComplete }: AnimatedSignatureProps) {
  const [isAnimating, setIsAnimating] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const pathRef = useRef<SVGPathElement>(null)

  useEffect(() => {
    // Calculate and set the actual path length for accurate animation
    // Negative offset makes the path draw in reverse (from end to start)
    if (pathRef.current) {
      const pathLength = pathRef.current.getTotalLength()
      pathRef.current.style.strokeDasharray = `${pathLength}`
      pathRef.current.style.strokeDashoffset = `${-pathLength}`
    }

    // Animation duration: 3 seconds drawing, then call completion callback
    const animationTimer = setTimeout(() => {
      setIsAnimating(false)
      if (onAnimationComplete) {
        onAnimationComplete()
      }
    }, 3200)

    return () => clearTimeout(animationTimer)
  }, [onAnimationComplete])

  return (
    <div className="signature-animation-wrapper">
      <svg
        className="signature-svg-animated"
        viewBox="420 0 1080 1080"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <mask id="signatureMask">
            {/* Black background - hides everything initially */}
            <rect width="1920" height="1080" fill="#000000" />
            {/* White stroke reveals the image as it draws */}
            <path
              ref={pathRef}
              className="signature-path"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="70"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeMiterlimit="10"
              d="M1347,702c-98.17,1.6-183.47,10.38-252.66,20.62c0,0-140,20.71-257.63,56.61c-38.54,11.76-93.75,31.56-108.4,37.19
		c-22.78,8.74-35.13,13.81-42.31,16.58c-76.47,29.52-189.89,25.4-194,8c-11.85-50.14,876.93-332.41,897-282
		c5.31,13.32-46.64,58.47-77,48c-20.05-6.91-33.69-39.12-27-65c5.19-20.08,21.23-31,33-39c19.01-12.93,45.88-22.12,50-16
		c5.44,8.07-29.65,41.39-43,52c-11.91,9.46-25.45,18.24-25.45,18.24c-5.74,3.72-5.57,3.13-7.55,4.76c-14.32,11.76-11.73,22.39-29,40
		c-2.33,2.38-21.31,21.73-30,17c-5.29-2.88-4.79-13.63-3.8-23.45c5.45-54.06,25.93-81.85,18.8-88.55c-7.24-6.8-41.62,9.39-65,39
		c-29.04,36.79-32,82.77-31,83c1.63,0.38,34.31-116.9,24-121c-12.13-4.83-74.12,145.57-93,139c-8.63-3-11.26-39.9,4-67
		c9.51-16.89,22.85-24.45,20-31c-4.68-10.78-43.75,3.64-53-12c-3.83-6.47-2.31-17.04,3-21c4.22-3.15,11.69-2.77,15,0
		c18.42,15.41-57.82,151.27-84,143c-9.9-3.13-11.22-26.33-12-40c-2.44-42.81,16.67-75.2,15-76c-3.33-1.61-63.18,135.75-82,130
		c-8.86-2.71-9.82-37.22-2-65c8.9-31.59,28.45-51.96,24-56c-3.59-3.26-18.6,7.95-20,9c-20.58,15.52-19.27,29.63-33,38
		c-17.55,10.69-48,4.81-53-9c-4.6-12.69,11.44-34.42,23-33c12.15,1.49,16.97,28.29,18,34c0.87,4.82,9.61,57.75-25,80
		c-17.01,10.94-44.29,14.32-55,2c-7.75-8.91-3.16-24.94,6-57c7.06-24.69,14.5-35.82,20.09-42.64c8.82-10.76,16.3-14.76,15.91-15.36
		c-1.84-2.86-298.77,143.44-281,197c6.64,20.02,56.75,25.59,91.04,15.17c32.66-9.93,50.52-34.25,73.96-66.17
		c18.73-25.5,20.71-38.3,20-48c-0.13-1.73-2.26-26-20-37c-26.27-16.28-69.61,7.13-70,6c-0.49-1.44,52.55-9.09,73-45
		c9.2-16.16,13.77-40.87,3-52c-17.67-18.24-77.18-0.66-111,34c-59.62,61.1-37.47,173.29-25,175c3.36,0.46,21.4-50.65,57-153
		c15.65-45,15.76-45.33,16-46c52.46-145.68,682.09-246.51,698-182c4.68,18.98-46.87,58.1-70,48c-22.76-9.94-29.39-72.79,0-105
		c16.87-18.49,45.92-27.2,52-20c6.87,8.13-11.68,41.11-39,60c-19.51,13.49-25.61,7.83-45,20c-38.21,23.98-36.3,59.62-57,62
		c-20.25,2.33-47.45-28.86-49-60c-2.47-49.56,60.6-87.82,74-79c10.5,6.92,2.72,50.82-23,73c-20.86,17.99-47.88,6.07-61,26
		c-7.8,11.86-2.2,20.72-12,32c-10.34,11.9-30.98,18.61-39,12c-18.67-15.4,38.22-97.24,23-109c-9.63-7.44-44.96,15.6-68,46
		c-26.44,34.88-32,73.28-33,73c-2.3-0.64,31.09-110.4,20-115c-12.63-5.24-64.11,133.78-92,127c-22.63-5.5-36.78-108.69,12-154
		c36.74-34.12,101.68-28.46,103-22c1.93,9.42-124.36,54.1-137,33c-9.84-16.43,46.3-77.53,60-70c22.45,12.34-47.34,220.97-98,217
		c-12.75-1-21.17-15.23-24-20c-29.46-49.75,26.9-137.88,32-136c3.02,1.11-7.43,35.42-14,57c-9.85,32.33-16.69,54.09-34,76
		c-11.93,15.11-35.95,39.46-46,34c-10.21-5.55-7.54-42.71,9-70c10.22-16.87,21.55-23.03,19-30c-4.97-13.61-52.91-1.88-57-15
		c-2.83-9.08,14.06-24.34,18-22c5.88,3.49-9.57,50.67-30,79c-60.95,84.51-211.09,63.44-211,78c0.06,8.73,51.34,25.17,100,8
		c38.45-13.56,85.1-51.58,78-89c-3.6-18.95-20.05-37.41-39-42c-25.72-6.23-50.78,14.15-52,12c-1.48-2.61,42.13-20.89,70-62
		c5.48-8.08,30.4-44.79,19-61c-16.96-24.11-120.12-13.69-162,54c-43.82,70.82,5.82,165.96,20,165c7.36-0.5,6.63-25.96,22-80
		c13.86-48.75,31.19-86.89,44-112"
            />
          </mask>
        </defs>
        <image
          href="/images/BBLOGOWT.png"
          width="1920"
          height="1080"
          mask="url(#signatureMask)"
        />
      </svg>
    </div>
  )
}
