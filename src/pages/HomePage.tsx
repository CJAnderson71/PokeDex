import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  fetchPokemonList,
  fetchPokemonType,
  officialArtworkUrlForNationalDexId,
  parsePokemonIdFromUrl,
} from '../api/pokeapi'
import { POKEMON_TYPE_SLUGS } from '../constants/typeFilter'
import { REGION } from '../config'
import { useFavorites } from '../favorites/useFavorites'
import { formatPokemonName } from '../lib/pokemonDisplay'

const listLimit = REGION.idTo - REGION.idFrom + 1
const listOffset = REGION.idFrom - 1

type ListRow = {
  item: { name: string; url: string }
  id: number
  label: string
}

export function HomePage() {
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const listQuery = useQuery({
    queryKey: ['pokemon-list', REGION.idFrom, REGION.idTo],
    queryFn: () => fetchPokemonList(listLimit, listOffset),
  })

  const typeQuery = useQuery({
    queryKey: ['pokemon-type', selectedType],
    queryFn: () => fetchPokemonType(selectedType),
    enabled: Boolean(selectedType) && Boolean(listQuery.data),
  })

  const rows: ListRow[] = useMemo(() => {
    const data = listQuery.data
    if (!data) return []
    const out: ListRow[] = []
    for (const item of data.results) {
      const id = parsePokemonIdFromUrl(item.url)
      if (id == null) continue
      out.push({
        item,
        id,
        label: formatPokemonName(item.name),
      })
    }
    return out
  }, [listQuery.data])

  const kantoIdsForSelectedType = useMemo(() => {
    if (!selectedType) return null
    const detail = typeQuery.data
    if (!detail) return undefined
    const set = new Set<number>()
    for (const entry of detail.pokemon) {
      const id = parsePokemonIdFromUrl(entry.pokemon.url)
      if (
        id != null &&
        id >= REGION.idFrom &&
        id <= REGION.idTo
      ) {
        set.add(id)
      }
    }
    return set
  }, [selectedType, typeQuery.data])

  const searchNorm = searchQuery.trim().toLowerCase()

  const filteredRows = useMemo(() => {
    if (selectedType && kantoIdsForSelectedType === undefined) {
      return []
    }
    return rows.filter(({ id, item, label }) => {
      if (favoritesOnly && !favoriteIds.has(id)) {
        return false
      }
      if (kantoIdsForSelectedType != null && !kantoIdsForSelectedType.has(id)) {
        return false
      }
      if (!searchNorm) return true
      if (item.name.includes(searchNorm)) return true
      if (label.toLowerCase().includes(searchNorm)) return true
      if (String(id).includes(searchNorm)) return true
      return false
    })
  }, [
    rows,
    kantoIdsForSelectedType,
    searchNorm,
    selectedType,
    favoritesOnly,
    favoriteIds,
  ])

  const typeFilterLoading = Boolean(selectedType) && typeQuery.isPending
  const typeFilterError = Boolean(selectedType) && typeQuery.isError

  return (
    <main className="page page--wide">
      <h1>Kanto Pokédex</h1>
      <p className="lede">
        Pokémon #{REGION.idFrom}–{REGION.idTo}. Search, filter by type, star
        favorites (saved in this browser).{' '}
        <Link to="/compare">Compare any two</Link>.
      </p>

      {listQuery.isPending && <p>Loading Kanto Pokémon…</p>}
      {listQuery.isError && (
        <p className="error" role="alert">
          {listQuery.error instanceof Error
            ? listQuery.error.message
            : 'Request failed'}
          <button type="button" onClick={() => listQuery.refetch()}>
            Retry
          </button>
        </p>
      )}

      {listQuery.data && (
        <>
          <div className="filters" role="search">
            <div className="filters__field">
              <label htmlFor="pokemon-search">Search</label>
              <input
                id="pokemon-search"
                type="search"
                autoComplete="off"
                placeholder="Name or # (e.g. pika, 25)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="filters__field">
              <label htmlFor="pokemon-type">Type</label>
              <select
                id="pokemon-type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All types</option>
                {POKEMON_TYPE_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {formatPokemonName(slug)}
                  </option>
                ))}
              </select>
            </div>
            <div className="filters__field filters__field--checkbox">
              <span className="filters__field-label">Favorites</span>
              <label className="filters__checkbox">
                <input
                  type="checkbox"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                />
                Show favorites only ({favoriteIds.size})
              </label>
            </div>
          </div>

          {typeFilterError && (
            <p className="error" role="alert">
              {typeQuery.error instanceof Error
                ? typeQuery.error.message
                : 'Type request failed'}
              <button type="button" onClick={() => typeQuery.refetch()}>
                Retry
              </button>
            </p>
          )}

          {typeFilterLoading && (
            <p className="filters-status" aria-live="polite">
              Loading Pokémon of this type…
            </p>
          )}

          {!typeFilterLoading && !typeFilterError && filteredRows.length === 0 && (
            <p className="empty-hint">
              {favoritesOnly && favoriteIds.size === 0
                ? 'You have no favorites yet. Use the star on a card or the button on a detail page.'
                : 'No Pokémon match your search, type, or favorites filter.'}
            </p>
          )}

          {!typeFilterLoading && !typeFilterError && filteredRows.length > 0 && (
            <ul className="pokemon-grid">
              {filteredRows.map(({ item, id, label }) => {
                const fav = isFavorite(id)
                return (
                  <li key={item.name} className="pokemon-grid__cell">
                    <button
                      type="button"
                      className={`pokemon-card__fav${fav ? ' pokemon-card__fav--on' : ''}`}
                      aria-pressed={fav}
                      aria-label={
                        fav
                          ? `Remove ${label} from favorites`
                          : `Add ${label} to favorites`
                      }
                      onClick={() => toggleFavorite(id)}
                    >
                      ★
                    </button>
                    <Link
                      to={`/pokemon/${id}`}
                      className="pokemon-card"
                      aria-label={`${label}, number ${id}`}
                    >
                      <img
                        src={officialArtworkUrlForNationalDexId(id)}
                        alt=""
                        width={96}
                        height={96}
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="pokemon-card__meta">
                        <span className="pokemon-card__id">#{id}</span>
                        <span className="pokemon-card__name">{label}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </>
      )}
    </main>
  )
}
