import type { PokemonSpecies } from '../api/pokeapi'

export function cleanFlavorText(raw: string): string {
  return raw.replace(/\f/g, ' ').replace(/\s+/g, ' ').trim()
}

export function getEnglishGenus(species: PokemonSpecies): string | null {
  const g = species.genera?.find((x) => x.language.name === 'en')
  const t = g?.genus?.trim()
  return t || null
}

export function getEnglishFlavorText(species: PokemonSpecies): string | null {
  const entries = species.flavor_text_entries ?? []
  const en = entries.filter((e) => e.language.name === 'en')
  if (!en.length) return null
  const pick = (version: string) =>
    en.find((e) => e.version.name === version)?.flavor_text
  const raw =
    pick('firered') ??
    pick('leafgreen') ??
    pick('yellow') ??
    pick('red') ??
    en[0]?.flavor_text
  return raw ? cleanFlavorText(raw) : null
}

const SUMMARY_MAX = 168

export function formatSpeciesSummary(species: PokemonSpecies): string {
  const genus = getEnglishGenus(species)
  const flavor = getEnglishFlavorText(species)
  const short =
    flavor && flavor.length > SUMMARY_MAX
      ? `${flavor.slice(0, SUMMARY_MAX - 1)}…`
      : flavor
  if (genus && short) return `${genus} — ${short}`
  if (short) return short
  if (genus) return genus
  return 'No summary available.'
}
