import { getPokeApiBaseUrl } from '../config'

export type NamedApiResource = {
  name: string
  url: string
}

export type PokemonTypeSlot = {
  slot: number
  type: NamedApiResource
}

export type PokemonStat = {
  base_stat: number
  stat: NamedApiResource
}

export type PokemonAbilitySlot = {
  is_hidden: boolean
  slot: number
  ability: NamedApiResource
}

export type PokemonMoveVersionGroupDetail = {
  level_learned_at: number
  move_learn_method: NamedApiResource
  version_group: NamedApiResource
}

export type PokemonMoveEntry = {
  move: NamedApiResource
  version_group_details: PokemonMoveVersionGroupDetail[]
}

export type PokemonSprites = {
  front_default: string | null
  other?: {
    'official-artwork'?: {
      front_default: string | null
    }
  }
}

/** Subset of PokéAPI `Pokemon` used by this app — add fields as features need them. */
export type Pokemon = {
  id: number
  name: string
  species: NamedApiResource
  types: PokemonTypeSlot[]
  stats: PokemonStat[]
  abilities: PokemonAbilitySlot[]
  moves: PokemonMoveEntry[]
  sprites: PokemonSprites
}

export type PokemonSpeciesGenusEntry = {
  genus: string
  language: NamedApiResource
}

export type PokemonSpeciesFlavorTextEntry = {
  flavor_text: string
  language: NamedApiResource
  version: NamedApiResource
}

/** Subset of PokéAPI `PokemonSpecies` used by this app. */
export type PokemonSpecies = {
  evolution_chain: { url: string }
  genera: PokemonSpeciesGenusEntry[]
  flavor_text_entries: PokemonSpeciesFlavorTextEntry[]
}

export type EvolutionDetail = {
  min_level: number | null
  min_happiness: number | null
  item: NamedApiResource | null
  trigger: NamedApiResource
}

export type ChainLink = {
  species: NamedApiResource
  evolution_details: EvolutionDetail[]
  evolves_to: ChainLink[]
}

export type EvolutionChain = {
  id: number
  chain: ChainLink
}

async function apiGet<T>(path: string): Promise<T> {
  const base = getPokeApiBaseUrl()
  const url = `${base}/${path.replace(/^\//, '')}`
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(
      `PokéAPI ${res.status} ${res.statusText} for ${url}${body ? `: ${body.slice(0, 200)}` : ''}`,
    )
  }
  return res.json() as Promise<T>
}

export type PokemonListItem = {
  name: string
  url: string
}

export type PokemonListResponse = {
  count: number
  next: string | null
  previous: string | null
  results: PokemonListItem[]
}

/** Paginated index (`/pokemon`). Results are national-dex order for offset 0. */
export function fetchPokemonList(
  limit: number,
  offset: number,
): Promise<PokemonListResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  })
  return apiGet<PokemonListResponse>(`pokemon?${params.toString()}`)
}

/** National dex id from a PokéAPI resource URL (`.../pokemon/42/`). */
export function parsePokemonIdFromUrl(resourceUrl: string): number | null {
  const match = resourceUrl.match(/\/pokemon\/(\d+)\/?$/)
  return match ? parseInt(match[1], 10) : null
}

/** Species id from `.../pokemon-species/42/` (matches national dex for base forms). */
export function parsePokemonSpeciesIdFromUrl(resourceUrl: string): number | null {
  const match = resourceUrl.match(/\/pokemon-species\/(\d+)\/?$/)
  return match ? parseInt(match[1], 10) : null
}

export function parseEvolutionChainIdFromUrl(resourceUrl: string): number | null {
  const match = resourceUrl.match(/\/evolution-chain\/(\d+)\/?$/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Official artwork URL for a national dex id — same host/path PokéAPI uses on
 * `Pokemon` resources, so the list view does not need 151 detail requests.
 */
export function officialArtworkUrlForNationalDexId(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}

export type TypePokemonEntry = {
  slot: number
  pokemon: NamedApiResource
}

/** Subset of PokéAPI `Type` — only what the type filter needs. */
export type PokemonTypeDetail = {
  name: string
  pokemon: TypePokemonEntry[]
}

export function fetchPokemonType(typeName: string): Promise<PokemonTypeDetail> {
  const segment = encodeURIComponent(typeName.toLowerCase())
  return apiGet<PokemonTypeDetail>(`type/${segment}`)
}

/** `idOrName` can be a national dex number or a species name (e.g. `bulbasaur`). */
export function fetchPokemon(idOrName: string | number): Promise<Pokemon> {
  const segment = encodeURIComponent(String(idOrName))
  return apiGet<Pokemon>(`pokemon/${segment}`)
}

export function fetchPokemonSpecies(
  idOrName: string | number,
): Promise<PokemonSpecies> {
  const segment = encodeURIComponent(String(idOrName))
  return apiGet<PokemonSpecies>(`pokemon-species/${segment}`)
}

export function fetchEvolutionChain(id: number): Promise<EvolutionChain> {
  return apiGet<EvolutionChain>(`evolution-chain/${id}`)
}

/** Subset of PokéAPI `Move` — type slug for display. */
export type Move = {
  name: string
  type: NamedApiResource
}

export function fetchMove(idOrName: string | number): Promise<Move> {
  const segment = encodeURIComponent(String(idOrName))
  return apiGet<Move>(`move/${segment}`)
}
