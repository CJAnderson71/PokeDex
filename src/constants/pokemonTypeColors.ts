import type { ThemeId } from '../theme/themeContext'

export type TypeBadgeColors = {
  borderColor: string
  backgroundColor: string
  color: string
}

/** Dark “arcade” UI — light text, glowing fills. */
const ARCADE: Record<string, TypeBadgeColors> = {
  bug: {
    borderColor: '#b8d050',
    backgroundColor: 'rgba(168, 184, 32, 0.28)',
    color: '#f2f8c8',
  },
  dark: {
    borderColor: '#8b7a6e',
    backgroundColor: 'rgba(112, 88, 72, 0.35)',
    color: '#ede4dc',
  },
  dragon: {
    borderColor: '#a070ff',
    backgroundColor: 'rgba(112, 56, 248, 0.28)',
    color: '#ece4ff',
  },
  electric: {
    borderColor: '#f5d040',
    backgroundColor: 'rgba(248, 208, 48, 0.28)',
    color: '#fff9d0',
  },
  fairy: {
    borderColor: '#f8a8bc',
    backgroundColor: 'rgba(238, 153, 172, 0.3)',
    color: '#ffeef2',
  },
  fighting: {
    borderColor: '#e86050',
    backgroundColor: 'rgba(192, 48, 40, 0.32)',
    color: '#ffd8d4',
  },
  fire: {
    borderColor: '#ff9a48',
    backgroundColor: 'rgba(240, 128, 48, 0.32)',
    color: '#ffe8d4',
  },
  flying: {
    borderColor: '#b8a0f8',
    backgroundColor: 'rgba(168, 144, 240, 0.28)',
    color: '#f0ecff',
  },
  ghost: {
    borderColor: '#a890d8',
    backgroundColor: 'rgba(112, 88, 152, 0.35)',
    color: '#ebe4f8',
  },
  grass: {
    borderColor: '#6fd060',
    backgroundColor: 'rgba(120, 200, 80, 0.28)',
    color: '#e4ffd8',
  },
  ground: {
    borderColor: '#e8c868',
    backgroundColor: 'rgba(224, 192, 104, 0.28)',
    color: '#fff6d8',
  },
  ice: {
    borderColor: '#a8e8e8',
    backgroundColor: 'rgba(152, 216, 216, 0.28)',
    color: '#ecffff',
  },
  normal: {
    borderColor: '#c8c8a8',
    backgroundColor: 'rgba(168, 168, 120, 0.28)',
    color: '#f5f5e8',
  },
  poison: {
    borderColor: '#c868d8',
    backgroundColor: 'rgba(160, 64, 160, 0.32)',
    color: '#fce8fc',
  },
  psychic: {
    borderColor: '#ff80a8',
    backgroundColor: 'rgba(248, 88, 136, 0.28)',
    color: '#ffe8f0',
  },
  rock: {
    borderColor: '#d8c868',
    backgroundColor: 'rgba(184, 160, 56, 0.3)',
    color: '#fff8d8',
  },
  steel: {
    borderColor: '#d0d0e8',
    backgroundColor: 'rgba(184, 184, 208, 0.28)',
    color: '#f4f4ff',
  },
  water: {
    borderColor: '#78b0ff',
    backgroundColor: 'rgba(104, 144, 240, 0.3)',
    color: '#e8f0ff',
  },
}

/** Light “classic Dex” — dark readable text. */
const CLASSIC: Record<string, TypeBadgeColors> = {
  bug: {
    borderColor: '#6f7a1a',
    backgroundColor: 'rgba(168, 184, 32, 0.22)',
    color: '#2a3208',
  },
  dark: {
    borderColor: '#4a3d32',
    backgroundColor: 'rgba(112, 88, 72, 0.2)',
    color: '#1c1510',
  },
  dragon: {
    borderColor: '#5c2eb0',
    backgroundColor: 'rgba(112, 56, 248, 0.15)',
    color: '#2a1050',
  },
  electric: {
    borderColor: '#b89818',
    backgroundColor: 'rgba(248, 208, 48, 0.22)',
    color: '#3d3208',
  },
  fairy: {
    borderColor: '#c06078',
    backgroundColor: 'rgba(238, 153, 172, 0.25)',
    color: '#4a1828',
  },
  fighting: {
    borderColor: '#a02820',
    backgroundColor: 'rgba(192, 48, 40, 0.18)',
    color: '#3a1010',
  },
  fire: {
    borderColor: '#c85818',
    backgroundColor: 'rgba(240, 128, 48, 0.2)',
    color: '#4a2008',
  },
  flying: {
    borderColor: '#7058b8',
    backgroundColor: 'rgba(168, 144, 240, 0.2)',
    color: '#281848',
  },
  ghost: {
    borderColor: '#584878',
    backgroundColor: 'rgba(112, 88, 152, 0.2)',
    color: '#1e1830',
  },
  grass: {
    borderColor: '#3d8a32',
    backgroundColor: 'rgba(120, 200, 80, 0.22)',
    color: '#143818',
  },
  ground: {
    borderColor: '#a88830',
    backgroundColor: 'rgba(224, 192, 104, 0.25)',
    color: '#3a3210',
  },
  ice: {
    borderColor: '#509898',
    backgroundColor: 'rgba(152, 216, 216, 0.25)',
    color: '#103838',
  },
  normal: {
    borderColor: '#8a8a68',
    backgroundColor: 'rgba(168, 168, 120, 0.2)',
    color: '#2a2818',
  },
  poison: {
    borderColor: '#783878',
    backgroundColor: 'rgba(160, 64, 160, 0.18)',
    color: '#301030',
  },
  psychic: {
    borderColor: '#c84878',
    backgroundColor: 'rgba(248, 88, 136, 0.18)',
    color: '#401020',
  },
  rock: {
    borderColor: '#988028',
    backgroundColor: 'rgba(184, 160, 56, 0.22)',
    color: '#322810',
  },
  steel: {
    borderColor: '#787890',
    backgroundColor: 'rgba(184, 184, 208, 0.25)',
    color: '#222428',
  },
  water: {
    borderColor: '#4068c8',
    backgroundColor: 'rgba(104, 144, 240, 0.2)',
    color: '#102048',
  },
}

const FALLBACK: Record<ThemeId, TypeBadgeColors> = {
  arcade: {
    borderColor: '#9d97b8',
    backgroundColor: 'rgba(140, 135, 168, 0.25)',
    color: '#f5f2ff',
  },
  classic: {
    borderColor: '#6b5e4f',
    backgroundColor: 'rgba(107, 94, 79, 0.15)',
    color: '#1c1814',
  },
}

export function getTypeBadgeColors(
  typeSlug: string,
  theme: ThemeId,
): TypeBadgeColors {
  const key = typeSlug.toLowerCase()
  const table = theme === 'classic' ? CLASSIC : ARCADE
  return table[key] ?? FALLBACK[theme]
}
