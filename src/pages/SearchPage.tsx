import { useState, useCallback } from 'react'
import type { NormalizedCard, AddCardOptions } from '@/types'
import { useCardSearch } from '@/hooks/useCardSearch'
import { useCollectionStore } from '@/store/collectionStore'
import { SearchBar } from '@/components/card/SearchBar'
import { CardTile } from '@/components/card/CardTile'
import { CardDetail } from '@/components/card/CardDetail'
import { Spinner } from '@/components/ui/Spinner'

export function SearchPage() {
  const { query, setQuery, submit, selectSuggestion, results, suggestions, isSearching, isSuggesting, error } = useCardSearch()
  const { entries, addCard } = useCollectionStore()
  const [selectedCard, setSelectedCard] = useState<NormalizedCard | null>(null)

  const ownedIds = new Set(entries.map((e) => e.scryfallId))

  const handleAdd = useCallback(async (card: NormalizedCard, options?: AddCardOptions) => {
    await addCard(card, options)
  }, [addCard])

  const handleTileAdd = useCallback((card: NormalizedCard) => {
    void handleAdd(card, { quantity: 1 })
  }, [handleAdd])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={headingStyle}>Search Cards</h1>
        <p style={{ color: '#6b7280', fontSize: 13, fontStyle: 'italic', marginBottom: 16 }}>
          Supports full{' '}
          <a href="https://scryfall.com/docs/syntax" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>
            Scryfall syntax
          </a>
          {' '}— try <code style={{ color: '#a78bfa' }}>c:blue t:instant cmc&lt;=2</code>
        </p>
        <SearchBar
          query={query}
          suggestions={suggestions}
          isLoading={isSuggesting}
          onChange={setQuery}
          onSubmit={submit}
          onSelectSuggestion={selectSuggestion}
        />
      </div>

      {/* States */}
      {isSearching && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', padding: '2rem 0' }}>
          <Spinner size={18} />
          <span style={{ fontSize: 14 }}>Searching Scryfall…</span>
        </div>
      )}

      {error && !isSearching && (
        <div style={{
          padding: '12px 16px', borderRadius: 8,
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.25)',
          color: '#f87171', fontSize: 14,
        }}>
          {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !isSearching && (
        <>
          <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 16 }}>
            {results.length} card{results.length !== 1 ? 's' : ''} found
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: 16,
          }}>
            {results.map((card) => (
              <CardTile
                key={card.scryfallId}
                card={card}
                owned={ownedIds.has(card.scryfallId)}
                onAdd={handleTileAdd}
                onSelect={setSelectedCard}
              />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!isSearching && !error && results.length === 0 && query === '' && (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#374151' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <p style={{ fontSize: 15 }}>Search for any Magic card above</p>
        </div>
      )}

      {/* Detail modal */}
      {selectedCard && (
        <CardDetail
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}

const headingStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontSize: '1.75rem', fontWeight: 700,
  color: '#e2d9c8', marginBottom: 6,
}
