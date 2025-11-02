export default function AboutPage() {
  return (
    <div className="gallery-container" style={{ paddingTop: '200px', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>About</h1>
      <div style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <p style={{ marginBottom: '1.5rem' }}>
          Welcome to our photography portfolio. This is a placeholder page for your About content.
        </p>
        <p style={{ marginBottom: '1.5rem' }}>
          Add your photographer bio, story, and background information here.
        </p>
        <p>
          You can customize this page by editing{' '}
          <code style={{ background: 'rgb(30, 30, 30)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
            src/app/(frontend)/about/page.tsx
          </code>
        </p>
      </div>
    </div>
  )
}
