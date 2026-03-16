/**
 * services/collection.ts
 *
 * Async-first storage layer. Currently backed by localStorage.
 *
 * TO MIGRATE to a real backend: replace each function body with a
 * fetch() call. The interface (async, same signatures) stays identical,
 * so nothing else in the app needs to change.
 *
 * e.g.  export async function getAll() {
 *          return fetch('/api/collection').then(r => r.json())
 *        }
 */

import type {
  CollectionEntry,
  CollectionStats,
  AddCardOptions,
  NormalizedCard,
  Deck,
  CreateDeckInput,
  CardCondition,
} from '@/types'

const KEYS = {
  collection: 'mtg:collection',
  decks: 'mtg:decks',
} as const

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readCollection(): CollectionEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.collection) ?? '[]') as CollectionEntry[]
  } catch {
    return []
  }
}

function writeCollection(data: CollectionEntry[]): void {
  localStorage.setItem(KEYS.collection, JSON.stringify(data))
}

function readDecks(): Deck[] {
  try {
    return JSON.parse(localStorage.getItem(KEYS.decks) ?? '[]') as Deck[]
  } catch {
    return []
  }
}

function writeDecks(data: Deck[]): void {
  localStorage.setItem(KEYS.decks, JSON.stringify(data))
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

// ─── Collection CRUD ──────────────────────────────────────────────────────────

/** GET /api/collection */
export async function getAll(): Promise<CollectionEntry[]> {
  return readCollection()
}

/** GET /api/collection/:id */
export async function getById(id: string): Promise<CollectionEntry | null> {
  return readCollection().find((c) => c.id === id) ?? null
}

/** POST /api/collection */
export async function add(
  card: NormalizedCard,
  options: AddCardOptions = {}
): Promise<CollectionEntry> {
  const {
    quantity = 1,
    foil = false,
    condition = 'NM' as CardCondition,
    language = 'en',
    acquiredPrice = null,
    location = null,
    notes = null,
  } = options

  const col = readCollection()

  // Merge into existing entry if same card + foil status
  const existing = col.find(
    (c) => c.scryfallId === card.scryfallId && c.foil === foil
  )
  if (existing) {
    existing.quantity += quantity
    writeCollection(col)
    return existing
  }

  const entry: CollectionEntry = {
    id: uid(),
    scryfallId: card.scryfallId,
    name: card.name,
    setCode: card.setCode,
    setName: card.setName,
    imageUri: card.imageUri,
    rarity: card.rarity,
    priceUsd: card.priceUsd,
    priceFoil: card.priceFoil,
    quantity,
    foil,
    condition,
    language,
    acquiredPrice,
    acquiredDate: new Date().toISOString().split('T')[0],
    location,
    notes,
  }

  col.push(entry)
  writeCollection(col)
  return entry
}

/** PATCH /api/collection/:id */
export async function update(
  id: string,
  changes: Partial<CollectionEntry>
): Promise<CollectionEntry> {
  const col = readCollection()
  const idx = col.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Entry not found: ${id}`)
  col[idx] = { ...col[idx], ...changes }
  writeCollection(col)
  return col[idx]
}

/** DELETE /api/collection/:id */
export async function remove(id: string): Promise<void> {
  writeCollection(readCollection().filter((c) => c.id !== id))
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getStats(): Promise<CollectionStats> {
  const col = readCollection()
  return {
    totalCards: col.reduce((s, c) => s + c.quantity, 0),
    uniqueCards: col.length,
    estimatedValue: col.reduce((s, c) => {
      const p = c.foil ? (c.priceFoil ?? 0) : (c.priceUsd ?? 0)
      return s + p * c.quantity
    }, 0),
  }
}

// ─── Decks ────────────────────────────────────────────────────────────────────

export async function getDecks(): Promise<Deck[]> {
  return readDecks()
}

export async function createDeck(input: CreateDeckInput): Promise<Deck> {
  const deck: Deck = {
    id: uid(),
    name: input.name,
    format: input.format ?? null,
    description: input.description ?? null,
    cards: [],
    createdAt: new Date().toISOString(),
  }
  const decks = readDecks()
  decks.push(deck)
  writeDecks(decks)
  return deck
}

export async function deleteDeck(id: string): Promise<void> {
  writeDecks(readDecks().filter((d) => d.id !== id))
}

// ─── Dev ──────────────────────────────────────────────────────────────────────

export function __devReset(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k))
  console.info('[collection] Cleared all local data.')
}
