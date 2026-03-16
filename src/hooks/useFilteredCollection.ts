/**
 * hooks/useFilteredCollection.ts
 *
 * Derives a filtered + sorted view of the collection.
 * Memoized so the sort only re-runs when entries or filters actually change.
 */

import { useMemo } from 'react'
import type { CollectionEntry, CollectionFilters } from '@/types'

const RARITY_ORDER: Record<string, number> = {
  mythic: 0,
  rare: 1,
  uncommon: 2,
  common: 3,
  special: 4,
  bonus: 5,
}

export function useFilteredCollection(
  entries: CollectionEntry[],
  filters: CollectionFilters
): CollectionEntry[] {
  return useMemo(() => {
    const { search, foilFilter, sortKey } = filters

    const filtered = entries.filter((e) => {
      if (search && !e.name.toLowerCase().includes(search.toLowerCase())) return false
      if (foilFilter === 'foil' && !e.foil) return false
      if (foilFilter === 'nonfoil' && e.foil) return false
      return true
    })

    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'price': {
          const aP = (a.foil ? a.priceFoil : a.priceUsd) ?? 0
          const bP = (b.foil ? b.priceFoil : b.priceUsd) ?? 0
          return bP - aP
        }
        case 'rarity':
          return (RARITY_ORDER[a.rarity] ?? 99) - (RARITY_ORDER[b.rarity] ?? 99)
        case 'dateAdded':
          return b.acquiredDate.localeCompare(a.acquiredDate)
        default:
          return 0
      }
    })
  }, [entries, filters])
}
