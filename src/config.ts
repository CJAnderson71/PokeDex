/** Pokédex region bounds — change to expand beyond Kanto later. */
export const REGION = {
  idFrom: 1,
  idTo: 151,
} as const

/**
 * PokéAPI `version_group.name` order for level-up moves on the detail page.
 * First matching entry wins (FRLG Kanto remakes, then classic Kanto).
 */
export const LEVEL_UP_MOVES_VERSION_GROUPS = [
  'firered-leafgreen',
  'yellow',
  'red-blue',
] as const

/** Shown under the level-up moves list (learnset source). */
export const LEVEL_UP_MOVES_NOTE =
  'FireRed / LeafGreen learnset; falls back to Yellow or Red/Blue when needed.'

/** Default public PokéAPI base — same as `.env.example`; override with `VITE_POKEAPI_BASE_URL` in `.env` or host env (e.g. Vercel). */
const DEFAULT_POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2'

function normalizeApiBaseUrl(raw: string | undefined): string {
  if (typeof raw !== 'string') {
    return DEFAULT_POKEAPI_BASE_URL
  }

  const trimmed = raw.trim()
  if (trimmed === '' || trimmed === 'VITE_POKEAPI_BASE_URL') {
    return DEFAULT_POKEAPI_BASE_URL
  }

  try {
    const parsed = new URL(trimmed)
    if (!/^https?:$/.test(parsed.protocol)) {
      return DEFAULT_POKEAPI_BASE_URL
    }
  } catch {
    return DEFAULT_POKEAPI_BASE_URL
  }

  return trimmed
}

export function getPokeApiBaseUrl(): string {
  const value = normalizeApiBaseUrl(import.meta.env.VITE_POKEAPI_BASE_URL)
  return value.replace(/\/$/, '')
}
