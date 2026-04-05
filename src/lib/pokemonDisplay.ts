/** PokéAPI uses lowercase names (e.g. `mr-mime`). */
export function formatPokemonName(apiName: string): string {
  return apiName
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
