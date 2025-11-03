'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AnimatedSignature from './AnimatedSignature'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [showStaticLogo, setShowStaticLogo] = useState(false)
  const [hideNavLinks, setHideNavLinks] = useState(true) // Start hidden
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Only show animation on homepage if not seen yet
    if (pathname === '/') {
      const hasSeenAnimation = sessionStorage.getItem('hasSeenSignatureAnimation')
      if (!hasSeenAnimation) {
        setShowAnimation(true)
        setHideNavLinks(true)
        setShowStaticLogo(false)
      } else {
        setShowStaticLogo(true)
        setHideNavLinks(false) // Show nav links immediately if animation already seen
      }
    } else {
      setShowStaticLogo(true)
      setHideNavLinks(false)
    }
  }, [pathname])

  const handleAnimationComplete = () => {
    // Animation complete - just show nav links, keep animated logo visible
    setHideNavLinks(false)
  }

  return (
    <>
      {/* Large hero logo container - holds animated or static logo */}
      <div className={`hero-logo ${isScrolled ? 'hero-logo-hidden' : ''}`}>
        {showAnimation ? (
          <AnimatedSignature onAnimationComplete={handleAnimationComplete} />
        ) : showStaticLogo ? (
          <Image
            src="/images/BBLOGOWT.png"
            alt="Britnee Bourne Photography"
            width={240}
            height={240}
            className="hero-logo-image"
            priority
          />
        ) : null}
      </div>

      {/* Main navbar */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''} ${hideNavLinks ? 'navbar-hidden' : ''}`}>
        <div className="navbar-container">
          {/* Left navigation */}
          <div className="navbar-left">
            <Link href="/about" className="navbar-link">
              ABOUT
            </Link>
          </div>

          {/* Center logo - appears on scroll */}
          <div className={`navbar-center ${isScrolled ? 'navbar-center-visible' : ''}`}>
            <Image
              src="/images/BBLOGOWT.png"
              alt="Britnee Bourne Photography"
              width={80}
              height={80}
              className="navbar-logo-image"
            />
          </div>

          {/* Right navigation */}
          <div className="navbar-right">
            <Link href="/contact" className="navbar-link">
              CONTACT
            </Link>
          </div>
        </div>
      </nav>
    </>
  )
}
