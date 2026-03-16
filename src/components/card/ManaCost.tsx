import { memo } from 'react'
import { parseManaCost } from '@/services/scryfall'

interface SymbolStyle {
  bg: string
  color: string
  label: string
}

const SYMBOL_STYLES: Record<string, SymbolStyle> = {
  W: { bg: '#f9faf4', color: '#1a1a1a', label: 'White' },
  U: { bg: '#0e68ab', color: '#fff',    label: 'Blue' },
  B: { bg: '#1a1208', color: '#c8a96e', label: 'Black' },
  R: { bg: '#d3202a', color: '#fff',    label: 'Red' },
  G: { bg: '#00733e', color: '#fff',    label: 'Green' },
  C: { bg: '#c1c1c1', color: '#1a1a1a', label: 'Colorless' },
  X: { bg: '#555',    color: '#fff',    label: 'X' },
  S: { bg: '#aaddee', color: '#1a1a1a', label: 'Snow' },
}

interface ManaSymbolProps {
  symbol: string
  size: number
}

const ManaSymbol = memo(function ManaSymbol({ symbol, size }: ManaSymbolProps) {
  const isNumeric = /^\d+$/.test(symbol)
  const s = isNumeric
    ? { bg: '#6b7280', color: '#fff', label: `${symbol} generic` }
    : (SYMBOL_STYLES[symbol.toUpperCase()] ?? { bg: '#444', color: '#fff', label: symbol })

  return (
    <span
      title={s.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: s.bg,
        color: s.color,
        fontSize: Math.round(size * 0.58),
        fontWeight: 700,
        fontFamily: 'monospace',
        border: '1px solid rgba(0,0,0,0.3)',
        flexShrink: 0,
        lineHeight: 1,
      }}
    >
      {symbol}
    </span>
  )
})

interface ManaCostProps {
  manaCost: string | null
  size?: number
}

export const ManaCost = memo(function ManaCost({ manaCost, size = 16 }: ManaCostProps) {
  if (!manaCost) return null
  const symbols = parseManaCost(manaCost)
  if (symbols.length === 0) return null

  return (
    <span style={{ display: 'inline-flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
      {symbols.map((s, i) => <ManaSymbol key={i} symbol={s} size={size} />)}
    </span>
  )
})
