import { useState, useCallback } from 'react'
import type { CollectionEntry, CollectionFilters, CardCondition, SortKey, FoilFilter } from '@/types'
import { useCollectionStore } from '@/store/collectionStore'
import { useFilteredCollection } from '@/hooks/useFilteredCollection'
import { RarityBadge } from '@/components/ui/Badge'

const CONDITIONS: CardCondition[] = ['NM', 'LP', 'MP', 'HP', 'DMG']

const DEFAULT_FILTERS: CollectionFilters = {
  search: '',
  foilFilter: 'all',
  sortKey: 'name',
}

export function CollectionPage() {
  const { entries, stats, removeCard, updateCard } = useCollectionStore()
  const [filters, setFilters] = useState<CollectionFilters>(DEFAULT_FILTERS)
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = useFilteredCollection(entries, filters)

  const setFilter = useCallback(<K extends keyof CollectionFilters>(
    key: K, value: CollectionFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
        <h2 style={{ fontFamily: "'Cinzel', serif", color: '#e2d9c8', marginBottom: 8 }}>
          Your collection is empty, broke ass :(
        </h2>
        <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: 15 }}>
          Head to Search to add your first cards.
        </p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Stats bar */}
      <div style={{
        display: 'flex', gap: 32,
        background: '#0d111c',
        border: '1px solid #1f2937',
        borderRadius: 12, padding: '16px 24px',
        marginBottom: 24, flexWrap: 'wrap',
      }}>
        <Stat label="Unique cards" value={stats.uniqueCards} />
        <Stat label="Total cards"  value={stats.totalCards} />
        <Stat label="Est. value"   value={`$${stats.estimatedValue.toFixed(2)}`} accent />
      </div>

      <h1 style={headingStyle}>My Collection</h1>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <input
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          placeholder="Filter by name…"
          style={inputStyle}
        />
        <Select
          value={filters.foilFilter}
          onChange={(v) => setFilter('foilFilter', v as FoilFilter)}
          options={[
            { value: 'all',     label: 'All' },
            { value: 'foil',    label: 'Foil only' },
            { value: 'nonfoil', label: 'Non-foil only' },
          ]}
        />
        <Select
          value={filters.sortKey}
          onChange={(v) => setFilter('sortKey', v as SortKey)}
          options={[
            { value: 'name',      label: 'Sort: Name' },
            { value: 'price',     label: 'Sort: Price ↓' },
            { value: 'rarity',    label: 'Sort: Rarity' },
            { value: 'dateAdded', label: 'Sort: Date added' },
          ]}
        />
      </div>

      <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 12 }}>
        {filtered.length} of {entries.length} entries
      </p>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#080c18' }}>
              {['Card', 'Set', 'Qty', 'Condition', 'Foil', 'Value', ''].map((h) => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <CollectionRow
                key={entry.id}
                entry={entry}
                isEditing={editingId === entry.id}
                onStartEdit={() => setEditingId(entry.id)}
                onStopEdit={() => setEditingId(null)}
                onUpdate={(changes) => void updateCard(entry.id, changes)}
                onRemove={() => void removeCard(entry.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stat({ label, value, accent = false }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{
        fontSize: 22, fontWeight: 700,
        fontFamily: "'Cinzel', serif",
        color: accent ? '#86efac' : '#e2d9c8',
      }}>
        {value}
      </span>
      <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </div>
  )
}

interface CollectionRowProps {
  entry: CollectionEntry
  isEditing: boolean
  onStartEdit: () => void
  onStopEdit: () => void
  onUpdate: (changes: Partial<CollectionEntry>) => void
  onRemove: () => void
}

function CollectionRow({ entry, isEditing, onStartEdit, onStopEdit, onUpdate, onRemove }: CollectionRowProps) {
  const price = (entry.foil ? entry.priceFoil : entry.priceUsd) ?? 0
  const totalValue = price * entry.quantity

  return (
    <tr style={{ borderBottom: '1px solid #1f2937' }}>
      {/* Card name + image */}
      <td style={tdStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {entry.imageUri && (
            <img
              src={entry.imageUri}
              alt={entry.name}
              style={{ width: 34, height: 47, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
              loading="lazy"
            />
          )}
          <div>
            <div style={{ fontWeight: 600, color: '#e2d9c8', fontSize: 13, fontFamily: "'Cinzel', serif" }}>
              {entry.name}
            </div>
            <div style={{ marginTop: 2 }}>
              <RarityBadge rarity={entry.rarity} />
            </div>
          </div>
        </div>
      </td>

      {/* Set */}
      <td style={{ ...tdStyle, color: '#6b7280', fontSize: 12 }}>
        {entry.setCode.toUpperCase()}
      </td>

      {/* Quantity — click to inline-edit */}
      <td style={tdStyle}>
        {isEditing ? (
          <input
            type="number"
            defaultValue={entry.quantity}
            min={1}
            autoFocus
            onBlur={(e) => {
              onUpdate({ quantity: Math.max(1, parseInt(e.target.value) || 1) })
              onStopEdit()
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            style={{
              width: 52, padding: '3px 6px', borderRadius: 6,
              border: '1px solid #6366f1', background: '#111827',
              color: '#e2d9c8', fontSize: 14,
            }}
          />
        ) : (
          <button
            onClick={onStartEdit}
            title="Click to edit"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 30, height: 30, borderRadius: 6,
              background: '#1f2937', border: 'none',
              color: '#e2d9c8', fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {entry.quantity}
          </button>
        )}
      </td>

      {/* Condition */}
      <td style={tdStyle}>
        <select
          value={entry.condition}
          onChange={(e) => onUpdate({ condition: e.target.value as CardCondition })}
          style={{
            background: '#1f2937', border: '1px solid #374151',
            borderRadius: 6, color: '#d1d5db',
            padding: '3px 6px', fontSize: 12, cursor: 'pointer',
          }}
        >
          {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </td>

      {/* Foil */}
      <td style={{ ...tdStyle, textAlign: 'center', fontSize: 14 }}>
        {entry.foil ? <span style={{ color: '#a78bfa' }}>✦</span> : <span style={{ color: '#374151' }}>—</span>}
      </td>

      {/* Value */}
      <td style={{ ...tdStyle, color: '#86efac', fontWeight: 700, fontFamily: 'monospace' }}>
        {totalValue > 0 ? `$${totalValue.toFixed(2)}` : '—'}
      </td>

      {/* Remove */}
      <td style={tdStyle}>
        <button
          onClick={onRemove}
          title="Remove from collection"
          style={{
            background: 'none', border: 'none',
            color: '#374151', cursor: 'pointer',
            fontSize: 16, padding: 4,
            transition: 'color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
        >
          ✕
        </button>
      </td>
    </tr>
  )
}

interface SelectOption { value: string; label: string }
interface SelectProps {
  value: string
  options: SelectOption[]
  onChange: (v: string) => void
}

function Select({ value, options, onChange }: SelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: '8px 12px', borderRadius: 8,
        border: '1px solid #374151', background: '#111827',
        color: '#f3f4f6', fontSize: 13, cursor: 'pointer',
      }}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const headingStyle: React.CSSProperties = {
  fontFamily: "'Cinzel', serif",
  fontSize: '1.75rem', fontWeight: 700,
  color: '#e2d9c8', marginBottom: 16, marginTop: 0,
}

const inputStyle: React.CSSProperties = {
  flex: 1, minWidth: 200, padding: '8px 12px',
  borderRadius: 8, border: '1px solid #374151',
  background: '#111827', color: '#f3f4f6', fontSize: 13,
  outline: 'none',
}

const thStyle: React.CSSProperties = {
  padding: '10px 12px', textAlign: 'left',
  fontSize: 10, fontWeight: 600, color: '#6b7280',
  textTransform: 'uppercase', letterSpacing: '0.07em',
  borderBottom: '1px solid #1f2937',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontSize: 13, color: '#d1d5db',
  verticalAlign: 'middle',
}