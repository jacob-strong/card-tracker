import { memo, useState } from 'react'

type CardSize = 'small' | 'normal' | 'large'

interface CardImageProps {
  name: string
  imageUri: string | null
  backImageUri?: string | null
  size?: CardSize
}

const DIMENSIONS: Record<CardSize, { w: number; h: number }> = {
  small:  { w: 120, h: 168 },
  normal: { w: 200, h: 280 },
  large:  { w: 280, h: 392 },
}

export const CardImage = memo(function CardImage({
  name,
  imageUri,
  backImageUri,
  size = 'normal',
}: CardImageProps) {
  const [flipped, setFlipped] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const isDfc = !!backImageUri
  const src = isDfc && flipped ? backImageUri : imageUri
  const { w, h } = DIMENSIONS[size]

  return (
    <div style={{ position: 'relative', width: w, flexShrink: 0 }}>
      {/* Placeholder shown until image loads */}
      {!loaded && (
        <div style={{
          width: w, height: h, borderRadius: 11,
          background: 'linear-gradient(135deg, #1a1a2e, #0d0d1a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#374151', fontSize: 11, textAlign: 'center', padding: 8,
        }}>
          {name}
        </div>
      )}

      {src && (
        <img
          src={src}
          alt={name}
          width={w}
          height={h}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{
            borderRadius: 11,
            display: loaded ? 'block' : 'none',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
          }}
        />
      )}

      {isDfc && (
        <button
          onClick={() => setFlipped((f) => !f)}
          title={flipped ? 'Show front' : 'Show back'}
          style={{
            position: 'absolute', bottom: 8, right: 8,
            width: 28, height: 28,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#e5e7eb',
            fontSize: 15, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s',
          }}
        >
          ↻
        </button>
      )}
    </div>
  )
})
