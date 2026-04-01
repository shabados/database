import Link from 'next/link'

import { buildSearchHref } from '@/lib/routes'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        color: 'white',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '32rem' }}>
        <p style={{ color: '#888', marginBottom: '0.5rem' }}>Not found</p>
        <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 600 }}>That page is not available.</h1>
        <p style={{ color: '#777', marginTop: '0.75rem' }}>
          Return to the search surface or try another work.
        </p>
        <Link
          href={buildSearchHref('')}
          style={{
            display: 'inline-flex',
            marginTop: '1.25rem',
            padding: '0.75rem 1rem',
            borderRadius: '999px',
            background: '#151515',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          Back to search
        </Link>
      </div>
    </main>
  )
}
