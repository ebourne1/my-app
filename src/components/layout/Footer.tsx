export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-copyright">
          &copy; {currentYear} Photographer Portfolio. All rights reserved.
        </p>
        <div className="footer-links">
          <a href="/privacy">Privacy</a>
          <span className="footer-separator">|</span>
          <a href="/terms">Terms</a>
        </div>
      </div>
    </footer>
  )
}
