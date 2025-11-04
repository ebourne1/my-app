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
            <path
              ref={pathRef}
              className="signature-path"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="60"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeMiterlimit="10"
              d="M1353,711c-105.58-4.22-196.79,3.05-269,13c-30.29,4.17-126.03,18.3-247.28,55.23c-45.56,13.88-82.5,27.25-108.4,37.19
		c-22.78,8.74-35.13,13.81-42.31,16.58c-76.47,29.52-189.89,25.4-194,8c-11.97-50.65,872.13-341.1,897-282
		c6.72,15.96-45.68,66.54-76,57c-21.67-6.82-36.91-44.57-28-74c6.2-20.49,22.55-31.78,33-39c15.63-10.79,43.39-23.63,50-16
		c8.62,9.94-20.31,48.42-41,61c-15.78,9.6-22.5,3.74-35,14c-14.32,11.76-11.73,22.39-29,40c-2.33,2.38-21.31,21.73-30,17
		c-5.29-2.88-4.79-13.63-3.8-23.45c5.45-54.06,25.93-81.85,18.8-88.55c-7.24-6.8-41.62,9.39-65,39c-29.04,36.79-32,82.77-31,83
		c1.63,0.38,34.31-116.9,24-121c-12.13-4.83-74.12,145.57-93,139c-8.63-3-11.26-39.9,4-67c9.51-16.89,22.85-24.45,20-31
		c-4.68-10.78-43.75,3.64-53-12c-3.83-6.47-2.31-17.04,3-21c4.22-3.15,11.69-2.77,15,0c18.42,15.41-57.82,151.27-84,143
		c-9.9-3.13-11.22-26.33-12-40c-2.44-42.81,16.67-75.2,15-76c-3.33-1.61-63.18,135.75-82,130c-8.86-2.71-9.82-37.22-2-65
		c8.9-31.59,28.45-51.96,24-56c-3.59-3.26-18.6,7.95-20,9c-21.41,16.15-19.71,31.42-33,38c-19.18,9.49-53.1-7.26-54-22
		c-0.6-9.93,13.6-22.04,24-20c12.68,2.49,16.54,25.38,18,34c1.89,11.17,7.15,55.59-25,80c-13.72,10.41-39.52,21.18-53,11
		c-18.62-14.07-8.08-63.9,14-96c13.45-19.56,27-26.45,26-28c-1.84-2.86-298.77,143.44-281,197c6.64,20.02,56.75,25.59,91.04,15.17
		c32.66-9.93,50.52-34.25,73.96-66.17c18.73-25.5,20.71-38.3,20-48c-0.13-1.73-2.26-26-20-37c-26.27-16.28-69.61,7.13-70,6
		c-0.49-1.44,52.55-9.09,73-45c9.2-16.16,13.77-40.87,3-52c-17.67-18.24-77.18-0.66-111,34c-59.62,61.1-37.47,173.29-25,175
		c3.36,0.46,21.4-50.65,57-153c15.65-45,15.76-45.33,16-46c52.46-145.68,682.09-246.51,698-182c4.83,19.58-46.02,57.81-70,48
		c-25.97-10.62-35.64-83.82-2-114c17.64-15.82,47.54-20.14,54-11c7.37,10.43-13.02,42.04-39,60c-19.51,13.49-25.61,7.83-45,20
		c-38.21,23.98-36.3,59.62-57,62c-20.25,2.33-47.45-28.86-49-60c-2.47-49.56,60.6-87.82,74-79c10.5,6.92,2.72,50.82-23,73
		c-20.86,17.99-47.88,6.07-61,26c-7.8,11.86-2.2,20.72-12,32c-10.34,11.9-30.98,18.61-39,12c-18.67-15.4,38.22-97.24,23-109
		c-9.63-7.44-44.96,15.6-68,46c-26.44,34.88-32,73.28-33,73c-2.3-0.64,31.09-110.4,20-115c-12.63-5.24-64.11,133.78-92,127
		c-22.63-5.5-36.78-108.69,12-154c36.74-34.12,101.68-28.46,103-22c1.93,9.42-124.36,54.1-137,33c-9.84-16.43,46.3-77.53,60-70
		c22.45,12.34-47.34,220.97-98,217c-12.75-1-21.17-15.23-24-20c-29.46-49.75,26.9-137.88,32-136c3.02,1.11-7.43,35.42-14,57
		c-9.85,32.33-16.69,54.09-34,76c-11.93,15.11-35.95,39.46-46,34c-10.21-5.55-7.54-42.71,9-70c10.22-16.87,21.55-23.03,19-30
		c-4.97-13.61-52.91-1.88-57-15c-2.83-9.08,14.06-24.34,18-22c5.88,3.49-9.57,50.67-30,79c-60.95,84.51-211.09,63.44-211,78
		c0.06,8.73,51.34,25.17,100,8c38.45-13.56,85.1-51.58,78-89c-3.58-18.87-20.57-36.22-39-42c-24.33-7.63-47.59,6.31-49,3
		c-1.79-4.22,40.21-16.72,67-53c9.97-13.5,29.5-46.08,19-61c-16.96-24.11-120.12-13.69-162,54c-44.22,71.47,8,166.23,20,165
		c6.51-0.67,2.66-31.21,17-89c10.13-40.82,23.82-73.01,34.17-94.41"
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
