/**
 * services/scryfall.ts
 *
 * Permanent layer. Stays forever — used for searching, lookups, price
 * refreshes, and seeding cards that aren't in your local DB yet.
 */

import type {
  ScryfallCard,
  ScryfallList,
  ScryfallSet,
  NormalizedCard,
  ImageSize,
} from '@/types'

const BASE = 'https://api.scryfall.com'

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function scryfallFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { details?: string }
    throw new Error(err.details ?? `Scryfall error ${res.status}: ${path}`)
  }
  return res.json() as Promise<T>
}

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function autocomplete(query: string): Promise<string[]> {
  if (query.length < 2) return []
  const data = await scryfallFetch<{ data: string[] }>(
    `/cards/autocomplete?q=${encodeURIComponent(query)}`
  )
  return data.data
}

export async function getCardByName(name: string): Promise<ScryfallCard> {
  return scryfallFetch<ScryfallCard>(
    `/cards/named?fuzzy=${encodeURIComponent(name)}`
  )
}

export async function getCardById(id: string): Promise<ScryfallCard> {
  return scryfallFetch<ScryfallCard>(`/cards/${id}`)
}

export async function searchCards(
  query: string,
  { maxPages = 3 }: { maxPages?: number } = {}
): Promise<ScryfallCard[]> {
  const results: ScryfallCard[] = []
  let page = 1
  let hasMore = true

  while (hasMore && page <= maxPages) {
    const data = await scryfallFetch<ScryfallList<ScryfallCard>>(
      `/cards/search?q=${encodeURIComponent(query)}&page=${page}`
    )
    results.push(...data.data)
    hasMore = data.has_more
    page++
    if (hasMore) await delay(100) // Scryfall rate limit: be polite
  }

  return results
}

// ─── Sets ─────────────────────────────────────────────────────────────────────

export async function getSets(): Promise<ScryfallSet[]> {
  const data = await scryfallFetch<{ data: ScryfallSet[] }>('/sets')
  return data.data
}

export async function getSet(code: string): Promise<ScryfallSet> {
  return scryfallFetch<ScryfallSet>(`/sets/${code}`)
}

// ─── Utilities ────────────────────────────────────────────────────────────────

export function getImageUri(card: ScryfallCard, size: ImageSize = 'normal'): string | null {
  const uris = card.image_uris ?? card.card_faces?.[0]?.image_uris
  return uris?.[size] ?? uris?.normal ?? null
}

export function formatPrice(raw: string | null | undefined): string {
  if (!raw) return '—'
  return `$${parseFloat(raw).toFixed(2)}`
}

export function parseManaCost(cost: string): string[] {
  return [...cost.matchAll(/\{([^}]+)\}/g)].map((m) => m[1])
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Convert raw Scryfall JSON → flat NormalizedCard.
 * Components always receive NormalizedCard — never raw API data.
 * This makes the shape identical to what your DB will eventually return.
 */
export function normalizeCard(card: ScryfallCard): NormalizedCard {
  const faces = card.card_faces ?? []
  const frontUris = card.image_uris ?? faces[0]?.image_uris
  const backUris = faces[1]?.image_uris ?? null

  return {
    scryfallId: card.id,
    oracleId: card.oracle_id,
    name: card.name,
    setCode: card.set,
    setName: card.set_name,
    collectorNumber: card.collector_number,
    rarity: card.rarity,
    manaCost: card.mana_cost ?? faces[0]?.mana_cost ?? null,
    cmc: card.cmc,
    typeLine: card.type_line ?? faces[0]?.type_line ?? '',
    oracleText: card.oracle_text ?? faces[0]?.oracle_text ?? null,
    colors: card.colors ?? faces[0]?.colors ?? [],
    colorIdentity: card.color_identity,
    imageUri: frontUris?.normal ?? frontUris?.large ?? null,
    backImageUri: backUris?.normal ?? null,
    priceUsd: card.prices.usd ? parseFloat(card.prices.usd) : null,
    priceFoil: card.prices.usd_foil ? parseFloat(card.prices.usd_foil) : null,
    legalities: card.legalities,
    reserved: card.reserved ?? false,
    scryfallUri: card.scryfall_uri,
  }
}
