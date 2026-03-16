# MTG Collection

React + TypeScript collection tracker powered by the Scryfall API.
Shoutout Claude for building the 1.0 version, everything forward was built by me

## Quick start

```bash
npm install
npm run dev
```

## Stack

| Layer | Choice | Why |
|---|---|---|
| UI | React 18 + TypeScript | Strict types throughout |
| Data fetching | TanStack Query v5 | Caching, deduplication, background refresh |
| State | Zustand | Minimal boilerplate, easy to test |
| Build | Vite | Fast dev server, code splitting |

## Project structure

```
src/
├── types/
│   └── index.ts          ← Single source of truth for all types
├── services/
│   ├── scryfall.ts       ← Permanent: Scryfall API (stays forever)
│   └── collection.ts     ← Swap me: localStorage now, real API later
├── store/
│   └── collectionStore.ts ← Zustand store (wraps collection service)
├── hooks/
│   ├── queryKeys.ts      ← Centralised TanStack Query key registry
│   ├── useCardSearch.ts  ← Scryfall search + autocomplete
│   └── useFilteredCollection.ts ← Memoised filter/sort
├── components/
│   ├── ui/               ← Spinner, Badge — no domain knowledge
│   ├── card/             ← CardTile, CardImage, CardDetail, ManaCost, SearchBar
│   └── layout/           ← Nav, ErrorBoundary
└── pages/
    ├── SearchPage.tsx
    └── CollectionPage.tsx
```

## Migrating to a real backend

Only `src/services/collection.ts` needs to change. Each function is already
async and has a comment showing what its `fetch()` equivalent looks like:

```ts
// Before (localStorage):
export async function getAll() {
  return JSON.parse(localStorage.getItem('mtg:collection') ?? '[]')
}

// After (real API):
export async function getAll() {
  return fetch('/api/collection').then(r => r.json())
}
```

The store, hooks, and components are untouched.

## Performance notes

- `CardTile` and `CardImage` are wrapped in `React.memo` — safe to render in large grids
- All handlers passed to memoized children are `useCallback`-stable
- `useFilteredCollection` uses `useMemo` — sort only re-runs when entries or filters change
- Pages are `React.lazy` — each is a separate chunk, loaded on first navigation
- TanStack Query deduplicates concurrent requests and caches results across the session
- `searchCards` has a `maxPages` cap (default 3) to avoid unbounded fetches
