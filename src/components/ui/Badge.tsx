import type { ReactNode } from 'react'

type BadgeVariant = 'rarity-common' | 'rarity-uncommon' | 'rarity-rare' | 'rarity-mythic' | 'foil' | 'owned' | 'neutral'

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  'rarity-common':   { bg: 'rgba(156,163,175,0.15)', color: '#9ca3af', border: 'rgba(156,163,175,0.3)' },
  'rarity-uncommon': { bg: 'rgba(110,231,183,0.15)', color: '#6ee7b7', border: 'rgba(110,231,183,0.3)' },
  'rarity-rare':     { bg: 'rgba(251,191,36,0.15)',  color: '#fbbf24', border: 'rgba(251,191,36,0.3)'  },
  'rarity-mythic':   { bg: 'rgba(249,115,22,0.15)',  color: '#f97316', border: 'rgba(249,115,22,0.3)'  },
  'foil':            { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: 'rgba(167,139,250,0.3)' },
  'owned':           { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e', border: 'rgba(34,197,94,0.3)'   },
  'neutral':         { bg: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: 'rgba(255,255,255,0.1)' },
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ variant = 'neutral', children }: BadgeProps) {
  const { bg, color, border } = VARIANT_STYLES[variant]
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 7px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.03em',
      textTransform: 'capitalize',
      background: bg,
      color,
      border: `1px solid ${border}`,
    }}>
      {children}
    </span>
  )
}

import type { CardRarity } from '@/types'

export function RarityBadge({ rarity }: { rarity: CardRarity }) {
  const variant = `rarity-${rarity}` as BadgeVariant
  return <Badge variant={variant in VARIANT_STYLES ? variant : 'neutral'}>{rarity}</Badge>
}
