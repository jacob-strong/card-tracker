import { useRef, useState, memo } from 'react'
import { Spinner } from '@/components/ui/Spinner'

interface SearchBarProps {
  query: string
  suggestions: string[]
  isLoading: boolean
  placeholder?: string
  onChange: (q: string) => void
  onSubmit: () => void
  onSelectSuggestion: (name: string) => void
}

export const SearchBar = memo(function SearchBar({
  query, suggestions, isLoading, placeholder,
  onChange, onSubmit, onSelectSuggestion,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const showDropdown = focused && suggestions.length > 0 && query.length >= 2

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#111827',
        border: `1px solid ${focused ? '#6366f1' : '#374151'}`,
        borderRadius: 10, padding: '10px 14px',
        transition: 'border-color 0.15s',
      }}>
        {isLoading
          ? <Spinner size={16} style={{ color: '#6366f1', flexShrink: 0 }} />
          : <span style={{ color: '#6b7280', fontSize: 16, flexShrink: 0 }}>⌕</span>
        }
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder ?? 'Search cards… try "t:dragon cmc>=6"'}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#f3f4f6', fontSize: 14, fontFamily: 'inherit',
          }}
        />
        {query && (
          <button
            onMouseDown={(e) => { e.preventDefault(); onChange(''); inputRef.current?.focus() }}
            style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 14 }}
          >
            ✕
          </button>
        )}
        <button
          onClick={onSubmit}
          disabled={!query.trim() || isLoading}
          style={{
            padding: '4px 14px', borderRadius: 6, border: 'none',
            background: '#4f46e5', color: '#fff',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            opacity: !query.trim() ? 0.5 : 1,
            transition: 'opacity 0.15s',
            flexShrink: 0,
          }}
        >
          Search
        </button>
      </div>

      {showDropdown && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: '#1f2937',
          border: '1px solid #374151', borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          listStyle: 'none', margin: 0, padding: 0,
          zIndex: 100,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          {suggestions.map((name, i) => (
            <li
              key={name}
              onMouseDown={() => onSelectSuggestion(name)}
              style={{
                padding: '8px 14px', cursor: 'pointer',
                fontSize: 13, color: '#d1d5db',
                borderBottom: i < suggestions.length - 1 ? '1px solid #374151' : 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
})
