import { Search, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export type SearchResult = {
  id: string
  title: string
  snippet: string
}

type ManualSearchProps = {
  results: SearchResult[]
  query: string
  onQueryChange: (query: string) => void
  onNavigate: (id: string) => void
}

export function ManualSearch({
  results,
  query,
  onQueryChange,
  onNavigate,
}: ManualSearchProps) {
  const [focused, setFocused] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const showResults = focused && query.trim().length >= 2

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setFocused(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <div className="manual-search" ref={rootRef}>
      <div className="search-field">
        <Search aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Cari topik, fitur, atau kendala..."
          aria-label="Cari di dalam panduan"
          aria-expanded={showResults}
          aria-controls="search-results"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            aria-label="Hapus pencarian"
            type="button"
          >
            <X />
          </button>
        )}
        <kbd>Ctrl K</kbd>
      </div>

      {showResults && (
        <div className="search-results" id="search-results" role="listbox">
          <div className="search-results-label">
            {results.length > 0
              ? `${results.length} hasil teratas`
              : 'Tidak ada hasil'}
          </div>
          {results.map((result) => (
            <button
              key={result.id}
              type="button"
              role="option"
              aria-selected="false"
              onClick={() => {
                onNavigate(result.id)
                setFocused(false)
                onQueryChange('')
              }}
            >
              <strong>{result.title}</strong>
              <span>{result.snippet}</span>
            </button>
          ))}
          {results.length === 0 && (
            <p className="empty-search">
              Coba gunakan istilah lain seperti “verifikasi”, “lowongan”, atau
              “profil”.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
