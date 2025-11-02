export default function ContactPage() {
  return (
    <div className="gallery-container" style={{ paddingTop: '200px', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>Contact</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          This is a placeholder page for your Contact information.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          Add your contact details, booking information, or contact form here.
        </p>
        <p>
          You can customize this page by editing{' '}
          <code style={{ background: 'rgb(30, 30, 30)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
            src/app/(frontend)/contact/page.tsx
          </code>
        </p>
      </div>
    </div>
  )
}
