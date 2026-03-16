import { memo } from 'react'
import { useCollectionStore } from '@/store/collectionStore'

type Page = 'search' | 'collection'

interface NavProps {
  page: Page
  onNavigate: (p: Page) => void
}

export const Nav = memo(function Nav({ page, onNavigate }: NavProps) {
  const stats = useCollectionStore((s) => s.stats)

  return (
    <nav style={{
      display: 'flex', alignItems: 'center',
      padding: '0 2rem', height: 56, gap: 32,
      background: '#080c18',
      borderBottom: '1px solid #1f2937',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Logo */}
      <span style={{
        fontFamily: "'Cinzel', serif",
        fontWeight: 700, fontSize: 25,
        color: '#e2d9c8', letterSpacing: '0.04em',
        whiteSpace: 'nowrap', userSelect: 'none',
      }}>
        Mana Vault
      </span>

      {/* Links */}
      <div style={{ display: 'flex', gap: 4 }}>
        <NavTab active={page === 'search'} onClick={() => onNavigate('search')}>
          Search
        </NavTab>
        <NavTab active={page === 'collection'} onClick={() => onNavigate('collection')}>
          Collection
        </NavTab>
      </div>

      {/* Value pill */}
      <div style={{ marginLeft: 'auto' }}>
        {stats.estimatedValue > 0 && (
          <span style={{
            background: '#052e16',
            color: '#86efac',
            border: '1px solid #065f46',
            borderRadius: 20,
            fontSize: 13, fontWeight: 700,
            padding: '3px 12px',
          }}>
            ${stats.estimatedValue.toFixed(2)}
          </span>
        )}
      </div>
    </nav>
  )
})

interface NavTabProps {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function NavTab({ active, onClick, children }: NavTabProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center',
        height: 56, padding: '0 10px',
        background: 'none', border: 'none',
        borderBottom: `2px solid ${active ? '#6366f1' : 'transparent'}`,
        color: active ? '#e2d9c8' : '#6b7280',
        fontSize: 14, cursor: 'pointer',
        fontFamily: "'Crimson Pro', serif",
        transition: 'color 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  )
}
