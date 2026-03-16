// ─── Primitives ───────────────────────────────────────────────────────────────

export type ManaColor = 'W' | 'U' | 'B' | 'R' | 'G' | 'C'
export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus'
export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG'
export type ImageSize = 'small' | 'normal' | 'large' | 'png' | 'art_crop' | 'border_crop'
export type Format =
  | 'standard' | 'pioneer' | 'modern' | 'legacy' | 'vintage'
  | 'commander' | 'pauper' | 'historic' | 'explorer' | 'brawl'

// ─── Scryfall API shapes ──────────────────────────────────────────────────────

export interface ScryfallImageUris {
  small?: string
  normal?: string
  large?: string
  png?: string
  art_crop?: string
  border_crop?: string
}

export interface ScryfallPrices {
  usd?: string | null
  usd_foil?: string | null
  usd_etched?: string | null
  eur?: string | null
  eur_foil?: string | null
  tix?: string | null
}

export type Legality = 'legal' | 'not_legal' | 'banned' | 'restricted'

export type ScryfallLegalities = Record<Format, Legality>

export interface ScryfallCardFace {
  name: string
  mana_cost?: string
  type_line?: string
  oracle_text?: string
  colors?: ManaColor[]
  power?: string
  toughness?: string
  loyalty?: string
  image_uris?: ScryfallImageUris
  flavor_text?: string
  artist?: string
}

export interface ScryfallCard {
  id: string
  oracle_id?: string
  name: string
  lang: string
  set: string
  set_name: string
  set_type: string
  collector_number: string
  rarity: CardRarity
  released_at: string
  reprint: boolean
  digital: boolean
  mana_cost?: string
  cmc: number
  type_line: string
  oracle_text?: string
  power?: string
  toughness?: string
  loyalty?: string
  colors?: ManaColor[]
  color_identity: ManaColor[]
  keywords: string[]
  legalities: ScryfallLegalities
  card_faces?: ScryfallCardFace[]
  image_uris?: ScryfallImageUris
  image_status: 'missing' | 'placeholder' | 'lowres' | 'highres_scan'
  artist?: string
  flavor_text?: string
  full_art: boolean
  foil: boolean
  nonfoil: boolean
  prices: ScryfallPrices
  scryfall_uri: string
  uri: string
  reserved?: boolean
}

export interface ScryfallList<T> {
  object: 'list'
  total_cards?: number
  has_more: boolean
  next_page?: string
  data: T[]
  warnings?: string[]
}

export interface ScryfallSet {
  id: string
  code: string
  name: string
  set_type: string
  released_at?: string
  card_count: number
  icon_svg_uri: string
  scryfall_uri: string
}

// ─── Normalized card ──────────────────────────────────────────────────────────
// Flat shape that mirrors your future DB schema.
// Components always work with this — never raw ScryfallCard.

export interface NormalizedCard {
  scryfallId: string
  oracleId: string | undefined
  name: string
  setCode: string
  setName: string
  collectorNumber: string
  rarity: CardRarity
  manaCost: string | null
  cmc: number
  typeLine: string
  oracleText: string | null
  colors: ManaColor[]
  colorIdentity: ManaColor[]
  imageUri: string | null
  backImageUri: string | null
  priceUsd: number | null
  priceFoil: number | null
  legalities: ScryfallLegalities
  reserved: boolean
  scryfallUri: string
}

// ─── Collection ───────────────────────────────────────────────────────────────

export interface CollectionEntry {
  id: string
  scryfallId: string
  // Denormalized for fast display without a DB join
  name: string
  setCode: string
  setName: string
  imageUri: string | null
  rarity: CardRarity
  priceUsd: number | null
  priceFoil: number | null
  // User data
  quantity: number
  foil: boolean
  condition: CardCondition
  language: string
  acquiredPrice: number | null
  acquiredDate: string
  location: string | null
  notes: string | null
}

export interface AddCardOptions {
  quantity?: number
  foil?: boolean
  condition?: CardCondition
  language?: string
  acquiredPrice?: number | null
  location?: string | null
  notes?: string | null
}

export interface CollectionStats {
  totalCards: number
  uniqueCards: number
  estimatedValue: number
}

// ─── Decks ────────────────────────────────────────────────────────────────────

export interface DeckCard {
  collectionId: string
  quantity: number
  isCommander: boolean
  isSideboard: boolean
}

export interface Deck {
  id: string
  name: string
  format: Format | null
  description: string | null
  cards: DeckCard[]
  createdAt: string
}

export interface CreateDeckInput {
  name: string
  format?: Format | null
  description?: string | null
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export type SortKey = 'name' | 'price' | 'rarity' | 'dateAdded'
export type FoilFilter = 'all' | 'foil' | 'nonfoil'

export interface CollectionFilters {
  search: string
  foilFilter: FoilFilter
  sortKey: SortKey
}
