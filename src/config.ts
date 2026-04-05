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

function requireEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing ${String(name)}. Copy .env.example to .env and set ${String(name)}.`,
    )
  }
  return value.replace(/\/$/, '')
}

export function getPokeApiBaseUrl(): string {
  return requireEnv('VITE_POKEAPI_BASE_URL')
}
