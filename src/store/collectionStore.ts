/**
 * store/collectionStore.ts
 *
 * Zustand store for collection state.
 * Wraps the async collection service so components get reactive updates.
 *
 * Usage:
 *   const entries = useCollectionStore(s => s.entries)
 *   const { addCard, removeCard } = useCollectionStore()
 */

import { create } from 'zustand'
import type {
  CollectionEntry,
  CollectionStats,
  NormalizedCard,
  AddCardOptions,
} from '@/types'
import * as collectionService from '@/services/collection'

interface CollectionState {
  entries: CollectionEntry[]
  stats: CollectionStats
  loading: boolean
  // Actions
  hydrate: () => Promise<void>
  addCard: (card: NormalizedCard, options?: AddCardOptions) => Promise<void>
  removeCard: (id: string) => Promise<void>
  updateCard: (id: string, changes: Partial<CollectionEntry>) => Promise<void>
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  entries: [],
  stats: { totalCards: 0, uniqueCards: 0, estimatedValue: 0 },
  loading: false,

  hydrate: async () => {
    set({ loading: true })
    const [entries, stats] = await Promise.all([
      collectionService.getAll(),
      collectionService.getStats(),
    ])
    set({ entries, stats, loading: false })
  },

  addCard: async (card, options) => {
    await collectionService.add(card, options)
    await get().hydrate()
  },

  removeCard: async (id) => {
    await collectionService.remove(id)
    await get().hydrate()
  },

  updateCard: async (id, changes) => {
    await collectionService.update(id, changes)
    await get().hydrate()
  },
}))
