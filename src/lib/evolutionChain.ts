import type { ChainLink, EvolutionDetail } from '../api/pokeapi'
import { parsePokemonSpeciesIdFromUrl } from '../api/pokeapi'
import { formatPokemonName } from './pokemonDisplay'

export type EvolutionStageCell = {
  apiName: string
  speciesId: number | null
  edgeLabel: string
}

function formatEvolutionDetail(d: EvolutionDetail): string {
  const trigger = d.trigger?.name ?? ''
  if (trigger === 'level-up') {
    if (d.min_level != null && d.min_level > 0) {
      return `Lv. ${d.min_level}`
    }
    if (d.min_happiness != null) {
      return 'Friendship'
    }
  }
  if (d.item?.name) {
    return formatPokemonName(d.item.name)
  }
  if (trigger === 'trade') return 'Trade'
  if (trigger === 'shed') return 'Shed'
  if (trigger === 'spin') return 'Spin'
  if (trigger === 'tower-of-darkness' || trigger === 'tower-of-waters') {
    return trigger
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
  }
  if (trigger) {
    return trigger
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(' ')
  }
  return ''
}

function summarizeEvolutionDetails(details: EvolutionDetail[]): string {
  if (!details.length) return ''
  const parts = details.map(formatEvolutionDetail).filter((s) => s.length > 0)
  if (parts.length) return parts.join(' / ')
  return 'Evolve'
}

/**
 * Breadth-first columns: col 0 = roots, each next column = all evolutions from
 * the previous frontier (handles splits like Eevee).
 */
export function buildEvolutionColumns(root: ChainLink): EvolutionStageCell[][] {
  const columns: EvolutionStageCell[][] = []
  let frontier: { link: ChainLink; edgeLabel: string }[] = [
    { link: root, edgeLabel: '' },
  ]

  while (frontier.length > 0) {
    const col: EvolutionStageCell[] = []
    const next: { link: ChainLink; edgeLabel: string }[] = []

    for (const { link, edgeLabel } of frontier) {
      const speciesId = parsePokemonSpeciesIdFromUrl(link.species.url)
      col.push({
        apiName: link.species.name,
        speciesId,
        edgeLabel,
      })
      for (const ev of link.evolves_to) {
        next.push({
          link: ev,
          edgeLabel: summarizeEvolutionDetails(ev.evolution_details),
        })
      }
    }

    columns.push(col)
    frontier = next
  }

  return columns
}

/** Drops stages outside inclusive national dex bounds; removes empty columns. */
export function filterEvolutionColumnsToNationalDexRange(
  columns: EvolutionStageCell[][],
  idFrom: number,
  idTo: number,
): EvolutionStageCell[][] {
  return columns
    .map((col) =>
      col.filter(
        (cell) =>
          cell.speciesId != null &&
          cell.speciesId >= idFrom &&
          cell.speciesId <= idTo,
      ),
    )
    .filter((col) => col.length > 0)
}
