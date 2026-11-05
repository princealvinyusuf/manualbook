import { useEffect, useMemo, useState } from 'react'
import {
  ArrowUp,
  BookOpen,
  Download,
  FileText,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { ManualSearch, type SearchResult } from './components/ManualSearch'
import { PasswordGate } from './components/PasswordGate'
import {
  TableOfContents,
  type ManualHeading,
} from './components/TableOfContents'
import manualHtml from './content/manual.html?raw'
import manualMeta from './content/manual-meta.json'

const PDF_URL = 'https://paskerid.kemnaker.go.id/manualbook.pdf'

type SearchSection = SearchResult & {
  searchableText: string
}

function buildSearchIndex(
  html: string,
  headings: ManualHeading[],
): SearchSection[] {
  const document = new DOMParser().parseFromString(
    `<article>${html}</article>`,
    'text/html',
  )

  return headings.map((heading) => {
    const element = document.getElementById(heading.id)
    const sectionParts: string[] = []
    let sibling = element?.nextElementSibling

    while (sibling && !/^H[1-6]$/.test(sibling.tagName)) {
      const text = sibling.textContent?.trim().replace(/\s+/g, ' ')
      if (text) sectionParts.push(text)
      sibling = sibling.nextElementSibling
    }

    const sectionText = sectionParts.join(' ')
    return {
      id: heading.id,
      title: heading.text,
      snippet:
        sectionText.slice(0, 155) +
        (sectionText.length > 155 ? '…' : ''),
      searchableText: `${heading.text} ${sectionText}`.toLocaleLowerCase('id'),
    }
  })
}

function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activeId, setActiveId] = useState('')
  const [tocCollapsed, setTocCollapsed] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const requirePasswordAfterHistoryRestore = (event: PageTransitionEvent) => {
      if (event.persisted) setIsUnlocked(false)
    }

    window.addEventListener('pageshow', requirePasswordAfterHistoryRestore)
    return () =>
      window.removeEventListener('pageshow', requirePasswordAfterHistoryRestore)
  }, [])

  const headings = manualMeta.headings as ManualHeading[]
  const searchIndex = useMemo(
    () => buildSearchIndex(manualHtml, headings),
    [headings],
  )
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase('id')
    if (query.length < 2) return []

    const terms = query.split(/\s+/)
    return searchIndex
      .filter((section) =>
        terms.every((term) => section.searchableText.includes(term)),
      )
      .sort((a, b) => {
        const aTitleMatch = a.title.toLocaleLowerCase('id').includes(query)
        const bTitleMatch = b.title.toLocaleLowerCase('id').includes(query)
        return Number(bTitleMatch) - Number(aTitleMatch)
      })
      .slice(0, 8)
  }, [searchIndex, searchQuery])

  useEffect(() => {
    if (!isUnlocked) return

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element))

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-112px 0px -72% 0px', threshold: 0 },
    )

    headingElements.forEach((heading) => observer.observe(heading))
    return () => observer.disconnect()
  }, [headings, isUnlocked])

  useEffect(() => {
    if (!isUnlocked) return

    const handleScroll = () => setShowScrollTop(window.scrollY > 900)
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        document
          .querySelector<HTMLInputElement>('.manual-search input')
          ?.focus()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isUnlocked])

  const navigateTo = (id: string) => {
    const target = document.getElementById(id)
    if (!target) return

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
    setActiveId(id)
    setMobileNavOpen(false)
  }

  if (!isUnlocked) {
    return <PasswordGate onUnlock={() => setIsUnlocked(true)} />
  }

  return (
    <div className={`portal-shell ${tocCollapsed ? 'toc-is-collapsed' : ''}`}>
      <header className="site-header">
        <div className="header-brand">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Buka daftar isi"
          >
            <Menu />
          </button>
          <a
            href="#panduan-penggunaan-dan-operasional-karirhub"
            className="brand-lockup"
            onClick={(event) => {
              event.preventDefault()
              navigateTo('panduan-penggunaan-dan-operasional-karirhub')
            }}
          >
            <span className="brand-symbol" aria-hidden="true">
              <BookOpen size={22} />
            </span>
            <span>
              <strong>Karirhub</strong>
              <small>Portal Panduan</small>
            </span>
          </a>
        </div>

        <ManualSearch
          query={searchQuery}
          results={searchResults}
          onQueryChange={setSearchQuery}
          onNavigate={navigateTo}
        />

        <a
          className="download-button header-download"
          href={PDF_URL}
          target="_blank"
          rel="noreferrer"
          download
        >
          <Download aria-hidden="true" />
          <span>Unduh PDF</span>
        </a>
      </header>

      <TableOfContents
        headings={headings}
        activeId={activeId}
        collapsed={tocCollapsed}
        mobileOpen={mobileNavOpen}
        onCollapse={() => setTocCollapsed((collapsed) => !collapsed)}
        onCloseMobile={() => setMobileNavOpen(false)}
        onNavigate={navigateTo}
      />

      {tocCollapsed && (
        <button
          className="restore-toc"
          onClick={() => setTocCollapsed(false)}
          aria-label="Tampilkan daftar isi"
        >
          <PanelLeftOpen />
        </button>
      )}

      <main className="reading-area">
        <div className="reading-frame">
          <div className="breadcrumbs" aria-label="Breadcrumb">
            <span>Karirhub</span>
            <span aria-hidden="true">/</span>
            <strong>Panduan Penggunaan dan Operasional</strong>
          </div>

          <section className="document-hero" aria-labelledby="document-title">
            <div className="document-hero-copy">
              <p className="eyebrow">Dokumentasi resmi · Versi {manualMeta.version}</p>
              <h1 id="document-title">{manualMeta.title}</h1>
              <p>{manualMeta.subtitle}</p>
              <div className="document-meta">
                <span>
                  <FileText aria-hidden="true" />
                  {headings.length} bagian
                </span>
                <span>Diperbarui {manualMeta.updatedAt}</span>
              </div>
            </div>
            <div className="hero-action-card">
              <span className="hero-card-icon" aria-hidden="true">
                <Download />
              </span>
              <div>
                <strong>Butuh versi offline?</strong>
                <p>Unduh panduan lengkap dalam format PDF.</p>
              </div>
              <a
                href={PDF_URL}
                target="_blank"
                rel="noreferrer"
                download
                className="primary-button"
              >
                Unduh PDF
              </a>
            </div>
          </section>

          <div className="article-toolbar">
            <span>Isi dokumen</span>
            <button
              onClick={() => setTocCollapsed((collapsed) => !collapsed)}
              type="button"
            >
              {tocCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
              {tocCollapsed ? 'Tampilkan navigasi' : 'Sembunyikan navigasi'}
            </button>
          </div>

          <article
            className="manual-article"
            dangerouslySetInnerHTML={{ __html: manualHtml }}
          />

          <footer className="document-footer">
            <div className="brand-symbol" aria-hidden="true">
              <BookOpen />
            </div>
            <div>
              <strong>Portal Panduan Karirhub</strong>
              <p>
                Disusun oleh Tim Sistem Informasi Pasar Kerja, Pusat Pasar
                Kerja, Kementerian Ketenagakerjaan Republik Indonesia.
              </p>
            </div>
          </footer>
        </div>
      </main>

      {showScrollTop && (
        <button
          className="scroll-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Kembali ke atas"
        >
          <ArrowUp />
        </button>
      )}
    </div>
  )
}

export default App
