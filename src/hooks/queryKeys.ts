/**
 * hooks/queryKeys.ts
 *
 * Central registry of all React Query cache keys.
 * Keeps invalidation and prefetching consistent across the app.
 */

export const queryKeys = {
  cards: {
    search: (query: string) => ['cards', 'search', query] as const,
    byId: (id: string) => ['cards', 'id', id] as const,
    byName: (name: string) => ['cards', 'name', name] as const,
    autocomplete: (query: string) => ['cards', 'autocomplete', query] as const,
  },
  sets: {
    all: () => ['sets'] as const,
    byCode: (code: string) => ['sets', code] as const,
  },
} as const
