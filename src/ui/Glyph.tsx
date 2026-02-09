type GlyphProps = {
  n: number
}

export function Glyph({ n }: GlyphProps) {
  // Keep shapes instantly distinguishable, even at small sizes.
  const common = {
    viewBox: '0 0 24 24',
    className: 'glyph',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.2,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
    'aria-hidden': true as const,
  }

  switch (n) {
    case 1:
      return (
        <svg {...common}>
          <title>1</title>
          <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 2:
      return (
        <svg {...common}>
          <title>2</title>
          <circle cx="9" cy="10" r="2.6" fill="currentColor" stroke="none" />
          <circle cx="15" cy="14" r="2.6" fill="currentColor" stroke="none" />
        </svg>
      )
    case 3:
      return (
        <svg {...common}>
          <title>3</title>
          <polygon points="12,5 19,19 5,19" />
        </svg>
      )
    case 4:
      return (
        <svg {...common}>
          <title>4</title>
          <rect x="6.5" y="6.5" width="11" height="11" rx="1.6" />
        </svg>
      )
    case 5:
      return (
        <svg {...common}>
          <title>5</title>
          <polygon points="12,4.5 20,10 17,20 7,20 4,10" />
        </svg>
      )
    case 6:
      return (
        <svg {...common}>
          <title>6</title>
          <polygon points="12,4.5 19.5,9 19.5,15 12,19.5 4.5,15 4.5,9" />
        </svg>
      )
    case 7:
      return (
        <svg {...common}>
          <title>7</title>
          <polygon points="12,3.2 15.2,10 22,10 16.5,14.2 18.6,21 12,16.8 5.4,21 7.5,14.2 2,10 8.8,10" />
        </svg>
      )
    case 8:
      return (
        <svg {...common}>
          <title>8</title>
          <polygon points="8,4.5 16,4.5 19.5,8 19.5,16 16,19.5 8,19.5 4.5,16 4.5,8" />
        </svg>
      )
    default:
      return null
  }
}

