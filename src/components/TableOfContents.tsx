import { ChevronLeft, ListTree, X } from 'lucide-react'

export type ManualHeading = {
  id: string
  text: string
  level: number
}

type TableOfContentsProps = {
  headings: ManualHeading[]
  activeId: string
  collapsed: boolean
  mobileOpen: boolean
  onCollapse: () => void
  onCloseMobile: () => void
  onNavigate: (id: string) => void
}

export function TableOfContents({
  headings,
  activeId,
  collapsed,
  mobileOpen,
  onCollapse,
  onCloseMobile,
  onNavigate,
}: TableOfContentsProps) {
  const visibleHeadings = headings.filter(
    (heading, index) => index > 1 && heading.level <= 2,
  )

  return (
    <>
      {mobileOpen && (
        <button
          className="nav-scrim"
          onClick={onCloseMobile}
          aria-label="Tutup daftar isi"
        />
      )}
      <aside
        className={[
          'toc-sidebar',
          collapsed ? 'is-collapsed' : '',
          mobileOpen ? 'is-mobile-open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-label="Daftar isi"
      >
        <div className="toc-heading">
          <span>
            <ListTree size={18} aria-hidden="true" />
            <strong>Daftar isi</strong>
          </span>
          <button
            className="icon-button toc-mobile-close"
            onClick={onCloseMobile}
            aria-label="Tutup daftar isi"
          >
            <X />
          </button>
        </div>

        <nav className="toc-nav">
          <ul>
            {visibleHeadings.map((heading) => (
              <li
                key={heading.id}
                className={`toc-level-${heading.level}`}
              >
                <a
                  href={`#${heading.id}`}
                  className={activeId === heading.id ? 'is-active' : ''}
                  aria-current={activeId === heading.id ? 'location' : undefined}
                  onClick={(event) => {
                    event.preventDefault()
                    onNavigate(heading.id)
                  }}
                  title={heading.text}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          className="toc-collapse"
          onClick={onCollapse}
          aria-label={collapsed ? 'Tampilkan daftar isi' : 'Sembunyikan daftar isi'}
        >
          <ChevronLeft aria-hidden="true" />
          <span>Sembunyikan</span>
        </button>
      </aside>
    </>
  )
}
