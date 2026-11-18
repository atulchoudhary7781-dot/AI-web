'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{ background: '#050510', color: '#fff', fontFamily: 'sans-serif', minHeight: '100vh' }}>
        <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 18, fontWeight: 600 }}>NEXUS AI is still running.</p>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Please refresh and try again.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ borderRadius: 12, border: 0, background: 'linear-gradient(90deg,#22d3ee,#8b5cf6)', color: '#020617', fontWeight: 700, padding: '10px 20px' }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
