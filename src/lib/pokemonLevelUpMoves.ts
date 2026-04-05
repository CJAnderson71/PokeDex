import type { PokemonMoveEntry } from '../api/pokeapi'

const LEVEL_UP = 'level-up'

export type LevelUpMoveRow = {
  apiName: string
  level: number
}

/**
 * Level-up moves for this species form, using the first version group in
 * `priority` that defines each move. Sorted by level, then name.
 */
export function getLevelUpMoveRows(
  moves: PokemonMoveEntry[] | undefined,
  priority: readonly string[],
): LevelUpMoveRow[] {
  if (!moves?.length) return []
  const rows: LevelUpMoveRow[] = []
  for (const entry of moves) {
    let level: number | null = null
    for (const vg of priority) {
      const d = entry.version_group_details.find(
        (x) =>
          x.move_learn_method.name === LEVEL_UP &&
          x.version_group.name === vg,
      )
      if (d) {
        level = d.level_learned_at
        break
      }
    }
    if (level === null) continue
    rows.push({ apiName: entry.move.name, level })
  }
  rows.sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level
    return a.apiName.localeCompare(b.apiName)
  })
  return rows
}

export function formatLearnLevel(level: number): string {
  if (level <= 0) return 'Evolve'
  return `Lv. ${level}`
}
