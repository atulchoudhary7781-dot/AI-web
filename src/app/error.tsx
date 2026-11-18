'use client'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-lg font-semibold text-white">Something went wrong.</p>
      <p className="max-w-md text-sm text-slate-400">The page is still here. Try again in a moment.</p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2.5 text-sm font-semibold text-slate-950"
      >
        Try again
      </button>
    </div>
  )
}
