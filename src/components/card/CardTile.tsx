import { memo, useState, useCallback } from 'react'
import type { NormalizedCard } from '@/types'
import { formatPrice } from '@/services/scryfall'
import { ManaCost } from './ManaCost'
import { RarityBadge } from '@/components/ui/Badge'

const RARITY_GLOW: Record<string, string> = {
  mythic:   '#e8a23b',
  rare:     '#b59a37',
  uncommon: '#9ab0c4',
  common:   '#555',
}

interface CardTileProps {
  card: NormalizedCard
  owned?: boolean
  onAdd?: (card: NormalizedCard) => void
  onSelect?: (card: NormalizedCard) => void
}

export const CardTile = memo(function CardTile({
  card, owned = false, onAdd, onSelect,
}: CardTileProps) {
  const [hovered, setHovered] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [adding, setAdding] = useState(false)
  const glow = RARITY_GLOW[card.rarity] ?? '#555'

  const handleAdd = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onAdd || adding) return
    setAdding(true)
    try { await Promise.resolve(onAdd(card)) } finally { setAdding(false) }
  }, [onAdd, card, adding])

  return (
    <div
      onClick={() => onSelect?.(card)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: onSelect ? 'pointer' : 'default',
        transform: hovered ? 'translateY(-3px) scale(1.015)' : 'none',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        boxShadow: hovered
          ? `0 10px 28px rgba(0,0,0,0.55), 0 0 0 1px ${glow}44`
          : '0 3px 10px rgba(0,0,0,0.4)',
        background: '#111827',
      }}
    >
      {/* Image area */}
      <div style={{ position: 'relative', paddingTop: '139%', background: '#0d111c' }}>
        {!imgLoaded && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#374151', fontSize: 11, padding: 8, textAlign: 'center',
          }}>
            {card.name}
          </div>
        )}
        {card.imageUri && (
          <img
            src={card.imageUri}
            alt={card.name}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.25s ease',
            }}
          />
        )}
        {/* Rarity dot */}
        <div style={{
          position: 'absolute', top: 7, right: 7,
          width: 7, height: 7, borderRadius: '50%',
          background: glow,
          boxShadow: `0 0 5px ${glow}`,
        }} />
        {owned && (
          <div style={{
            position: 'absolute', top: 7, left: 7,
            background: 'rgba(34,197,94,0.9)',
            color: '#fff', fontSize: 9, fontWeight: 700,
            padding: '2px 5px', borderRadius: 3, letterSpacing: '0.05em',
          }}>
            OWNED
          </div>
        )}
        {/* Add overlay */}
        {onAdd && (
          <button
            onClick={handleAdd}
            disabled={adding}
            style={{
              position: 'absolute', bottom: 10, left: '50%',
              transform: `translateX(-50%) translateY(${hovered ? 0 : 6}px)`,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.18s, transform 0.18s',
              background: owned ? 'rgba(34,197,94,0.9)' : 'rgba(99,102,241,0.95)',
              color: '#fff', border: 'none', borderRadius: 6,
              padding: '5px 14px', fontSize: 11, fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
              pointerEvents: hovered ? 'auto' : 'none',
            }}
          >
            {adding ? '…' : owned ? '+ Add another' : '+ Add to collection'}
          </button>
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px 10px',
        background: '#0d111c',
        borderTop: `1px solid ${glow}22`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 4, marginBottom: 4,
        }}>
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#e2d9c8',
            fontFamily: "'Cinzel', serif",
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            flex: 1,
          }}>
            {card.name}
          </span>
          <ManaCost manaCost={card.manaCost} size={13} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <RarityBadge rarity={card.rarity} />
          <span style={{ fontSize: 11, color: '#86efac', fontWeight: 600 }}>
            {formatPrice(card.priceUsd?.toString())}
          </span>
        </div>
      </div>
    </div>
  )
})
