'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Large hero logo - fades out on scroll */}
      <div className={`hero-logo ${isScrolled ? 'hero-logo-hidden' : ''}`}>
        <Image
          src="/images/BBLOGOWT.png"
          alt="Britnee Bourne Photography"
          width={240}
          height={240}
          className="hero-logo-image"
          priority
        />
      </div>

      {/* Main navbar */}
      <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
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
