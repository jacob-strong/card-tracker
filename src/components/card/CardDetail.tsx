import { memo, useState, useCallback, useEffect } from 'react'
import type { NormalizedCard, CardCondition, AddCardOptions } from '@/types'
import { CardImage } from './CardImage'
import { ManaCost } from './ManaCost'
import { RarityBadge } from '@/components/ui/Badge'
import { formatPrice } from '@/services/scryfall'

const CONDITIONS: CardCondition[] = ['NM', 'LP', 'MP', 'HP', 'DMG']
const FORMATS = ['commander', 'modern', 'pioneer', 'standard', 'legacy', 'vintage'] as const

interface CardDetailProps {
  card: NormalizedCard
  onClose: () => void
  onAdd?: (card: NormalizedCard, options: AddCardOptions) => Promise<void>
}

export const CardDetail = memo(function CardDetail({ card, onClose, onAdd }: CardDetailProps) {
  const [foil, setFoil] = useState(false)
  const [condition, setCondition] = useState<CardCondition>('NM')
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleAdd = useCallback(async () => {
    if (!onAdd) return
    setAdding(true)
    await onAdd(card, { foil, condition, quantity })
    setAdding(false)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }, [onAdd, card, foil, condition, quantity])

  const currentPrice = foil ? card.priceFoil : card.priceUsd

  return (
    // Backdrop
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={card.name}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0d111c',
          border: '1px solid #1f2937',
          borderRadius: 16,
          display: 'flex',
          gap: 28,
          padding: 28,
          maxWidth: 760,
          width: '100%',
          maxHeight: '92vh',
          overflowY: 'auto',
          position: 'relative',
        }}
      >
        {/* Left: image */}
        <div style={{ flexShrink: 0 }}>
          <CardImage
            name={card.name}
            imageUri={card.imageUri}
            backImageUri={card.backImageUri}
            size="normal"
          />
        </div>

        {/* Right: info */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 }}>
          {/* Header */}
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
              <h2 style={{
                margin: 0,
                fontFamily: "'Cinzel', serif",
                fontSize: 20, fontWeight: 700, color: '#e2d9c8',
              }}>
                {card.name}
              </h2>
              <ManaCost manaCost={card.manaCost} size={18} />
            </div>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 13 }}>{card.typeLine}</p>
          </div>

          {/* Oracle text */}
          {card.oracleText && (
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid #1f2937',
              borderRadius: 8, padding: '10px 14px',
            }}>
              <p style={{
                margin: 0, color: '#d1d5db', fontSize: 13,
                lineHeight: 1.65, whiteSpace: 'pre-wrap',
              }}>
                {card.oracleText}
              </p>
            </div>
          )}

          {/* Meta */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <RarityBadge rarity={card.rarity} />
            <span style={{ fontSize: 12, color: '#6b7280' }}>
              {card.setName} · #{card.collectorNumber}
            </span>
          </div>

          {/* Prices */}
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Normal', value: formatPrice(card.priceUsd?.toString()) },
              { label: 'Foil',   value: formatPrice(card.priceFoil?.toString()) },
            ].map((p) => (
              <div key={p.label} style={{
                background: 'rgba(134,239,172,0.06)',
                border: '1px solid rgba(134,239,172,0.15)',
                borderRadius: 8, padding: '6px 14px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 15, color: '#86efac', fontWeight: 700 }}>{p.value}</div>
              </div>
            ))}
          </div>

          {/* Legalities */}
          <div>
            <div style={{ fontSize: 10, color: '#6b7280', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>
              Legality
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {FORMATS.map((fmt) => {
                const legal = card.legalities[fmt] === 'legal'
                return (
                  <span key={fmt} style={{
                    fontSize: 10, padding: '2px 7px', borderRadius: 4,
                    fontWeight: 600, textTransform: 'capitalize',
                    background: legal ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
                    color: legal ? '#22c55e' : '#ef4444',
                    border: `1px solid ${legal ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.15)'}`,
                  }}>
                    {fmt}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Add to collection */}
          {onAdd && (
            <div style={{ borderTop: '1px solid #1f2937', paddingTop: 16, marginTop: 'auto' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                {/* Qty */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <StepButton onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</StepButton>
                  <span style={{ color: '#e2d9c8', fontSize: 14, width: 24, textAlign: 'center' }}>{quantity}</span>
                  <StepButton onClick={() => setQuantity((q) => q + 1)}>+</StepButton>
                </div>
                {/* Condition */}
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as CardCondition)}
                  style={selectStyle}
                >
                  {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                {/* Foil toggle */}
                <button
                  onClick={() => setFoil((f) => !f)}
                  style={{
                    ...stepBtnStyle,
                    padding: '4px 12px',
                    background: foil ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.05)',
                    color: foil ? '#a78bfa' : '#9ca3af',
                    border: `1px solid ${foil ? 'rgba(167,139,250,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  ✦ Foil
                </button>
                <span style={{ marginLeft: 'auto', color: '#86efac', fontWeight: 700, fontSize: 14 }}>
                  {currentPrice != null ? `$${currentPrice.toFixed(2)}` : '—'}
                </span>
              </div>
              <button
                onClick={() => void handleAdd()}
                disabled={adding}
                style={{
                  width: '100%', padding: '10px 0',
                  background: added ? '#065f46' : '#4f46e5',
                  border: 'none', borderRadius: 8,
                  color: added ? '#6ee7b7' : '#fff',
                  fontSize: 14, fontWeight: 700,
                  cursor: adding ? 'wait' : 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {adding ? 'Adding…' : added ? '✓ Added to collection' : '+ Add to collection'}
              </button>
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute', top: 14, right: 14,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, color: '#9ca3af',
            width: 28, height: 28,
            cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
})

function StepButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button onClick={onClick} style={stepBtnStyle}>{children}</button>
}

const stepBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6, color: '#d1d5db',
  width: 28, height: 28,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', fontSize: 16,
}

const selectStyle: React.CSSProperties = {
  background: '#1f2937',
  border: '1px solid #374151',
  borderRadius: 6, color: '#d1d5db',
  padding: '4px 8px', fontSize: 12,
  cursor: 'pointer',
}
