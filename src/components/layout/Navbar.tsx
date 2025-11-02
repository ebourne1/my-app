import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          Photographer Portfolio
        </Link>
        <ul className="navbar-menu">
          <li>
            <Link href="/">Gallery</Link>
          </li>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/contact">Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
