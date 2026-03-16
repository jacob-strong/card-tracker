import { lazy, Suspense, useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Nav } from '@/components/layout/Nav'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { Spinner } from '@/components/ui/Spinner'
import { useCollectionStore } from '@/store/collectionStore'

// Code-split each page — only loaded when navigated to
const SearchPage     = lazy(() => import('@/pages/SearchPage').then((m) => ({ default: m.SearchPage })))
const CollectionPage = lazy(() => import('@/pages/CollectionPage').then((m) => ({ default: m.CollectionPage })))

// QueryClient config: sensible cache + retry behaviour
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,   // 5 min before background refetch
      gcTime: 30 * 60_000,     // 30 min before cache eviction
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

type Page = 'search' | 'collection'

function PageFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: '#6b7280' }}>
      <Spinner size={28} />
    </div>
  )
}

function AppShell() {
  const [page, setPage] = useState<Page>('search')
  const hydrate = useCollectionStore((s) => s.hydrate)

  // Load collection from storage once on mount
  useEffect(() => { void hydrate() }, [hydrate])

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f1e', color: '#e5e7eb', fontFamily: "'Crimson Pro', Georgia, serif" }}>
      <Nav page={page} onNavigate={setPage} />

      <main>
        <ErrorBoundary>
          <Suspense fallback={<PageFallback />}>
            {page === 'search'     && <SearchPage />}
            {page === 'collection' && <CollectionPage />}
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem', color: '#374151', fontSize: 12 }}>
        Card data via{' '}
        <a href="https://scryfall.com" target="_blank" rel="noreferrer" style={{ color: '#4b5563', textDecoration: 'none' }}>
          Scryfall
        </a>
        {' '}· Stored locally in your browser
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppShell />
    </QueryClientProvider>
  )
}
