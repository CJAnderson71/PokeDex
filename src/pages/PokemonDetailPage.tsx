import { useQueries, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchEvolutionChain,
  fetchMove,
  fetchPokemon,
  fetchPokemonList,
  fetchPokemonSpecies,
  parseEvolutionChainIdFromUrl,
  parsePokemonIdFromUrl,
} from '../api/pokeapi'
import { EvolutionChart } from '../components/EvolutionChart'
import { BASE_STAT_ORDER } from '../constants/pokemonStats'
import { getTypeBadgeColors } from '../constants/pokemonTypeColors'
import {
  LEVEL_UP_MOVES_NOTE,
  LEVEL_UP_MOVES_VERSION_GROUPS,
  REGION,
} from '../config'
import { useFavorites } from '../favorites/useFavorites'
import {
  buildEvolutionColumns,
  filterEvolutionColumnsToNationalDexRange,
} from '../lib/evolutionChain'
import { formatSpeciesSummary } from '../lib/pokemonSpeciesSummary'
import {
  formatLearnLevel,
  getLevelUpMoveRows,
} from '../lib/pokemonLevelUpMoves'
import { formatPokemonName } from '../lib/pokemonDisplay'
import { useTheme } from '../theme/useTheme'

const listLimit = REGION.idTo - REGION.idFrom + 1
const listOffset = REGION.idFrom - 1

export function PokemonDetailPage() {
  const { theme } = useTheme()
  const { isFavorite, toggleFavorite } = useFavorites()
  const { idOrName = '' } = useParams<{ idOrName: string }>()
  const key = idOrName.trim()

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['pokemon', key],
    queryFn: () => fetchPokemon(key),
    enabled: key.length > 0,
  })

  const listQuery = useQuery({
    queryKey: ['pokemon-list', REGION.idFrom, REGION.idTo],
    queryFn: () => fetchPokemonList(listLimit, listOffset),
  })

  const kantoNameById = useMemo(() => {
    const m = new Map<number, string>()
    const results = listQuery.data?.results
    if (!results) return m
    for (const item of results) {
      const id = parsePokemonIdFromUrl(item.url)
      if (id != null) m.set(id, item.name)
    }
    return m
  }, [listQuery.data])

  const orderedStats = useMemo(() => {
    if (!data) return []
    return BASE_STAT_ORDER.map((slug) =>
      data.stats.find((s) => s.stat.name === slug),
    ).filter((s): s is NonNullable<typeof s> => s != null)
  }, [data])

  const levelUpMoves = useMemo(
    () =>
      getLevelUpMoveRows(data?.moves, LEVEL_UP_MOVES_VERSION_GROUPS),
    [data?.moves],
  )

  const uniqueLevelUpMoveNames = useMemo(
    () => [...new Set(levelUpMoves.map((m) => m.apiName))],
    [levelUpMoves],
  )

  const moveDetailQueries = useQueries({
    queries: uniqueLevelUpMoveNames.map((name) => ({
      queryKey: ['move', name] as const,
      queryFn: () => fetchMove(name),
      enabled: uniqueLevelUpMoveNames.length > 0,
    })),
  })

  const moveTypeByApiName = useMemo(() => {
    const m = new Map<string, string>()
    uniqueLevelUpMoveNames.forEach((name, i) => {
      const slug = moveDetailQueries[i]?.data?.type?.name
      if (slug) m.set(name, slug)
    })
    return m
  }, [uniqueLevelUpMoveNames, moveDetailQueries])

  const moveQueryIndexByApiName = useMemo(() => {
    const idx = new Map<string, number>()
    uniqueLevelUpMoveNames.forEach((n, i) => idx.set(n, i))
    return idx
  }, [uniqueLevelUpMoveNames])

  const speciesQuery = useQuery({
    queryKey: ['pokemon-species', data?.species.name],
    queryFn: () => fetchPokemonSpecies(data!.species.name),
    enabled: !!data?.species?.name,
  })

  const evolutionChainId = useMemo(() => {
    const url = speciesQuery.data?.evolution_chain.url
    return url ? parseEvolutionChainIdFromUrl(url) : null
  }, [speciesQuery.data?.evolution_chain.url])

  const evolutionChainQuery = useQuery({
    queryKey: ['evolution-chain', evolutionChainId],
    queryFn: () => fetchEvolutionChain(evolutionChainId!),
    enabled: evolutionChainId != null,
  })

  const evolutionColumns = useMemo(() => {
    const chain = evolutionChainQuery.data?.chain
    if (!chain) return []
    const built = buildEvolutionColumns(chain)
    return filterEvolutionColumnsToNationalDexRange(
      built,
      REGION.idFrom,
      REGION.idTo,
    )
  }, [evolutionChainQuery.data])

  const kantoEvolutionStageCount = useMemo(
    () => evolutionColumns.reduce((n, col) => n + col.length, 0),
    [evolutionColumns],
  )

  const showKantoEvolutionChart =
    evolutionChainQuery.isSuccess &&
    evolutionColumns.length > 0 &&
    kantoEvolutionStageCount > 1

  const neighborLabel = (id: number) => {
    const apiName = kantoNameById.get(id)
    return apiName ? formatPokemonName(apiName) : `#${id}`
  }

  const inKanto =
    data != null && data.id >= REGION.idFrom && data.id <= REGION.idTo
  const prevId =
    inKanto && data.id > REGION.idFrom ? data.id - 1 : null
  const nextId =
    inKanto && data.id < REGION.idTo ? data.id + 1 : null

  if (!key) {
    return (
      <main className="page">
        <p>Missing Pokémon id or name.</p>
        <Link to="/">← Back</Link>
      </main>
    )
  }

  return (
    <main
      className={`page page--detail${inKanto ? ' page--detail-pager' : ''}`}
    >
      <nav className="nav-back">
        <Link to="/">← Kanto list</Link>
      </nav>

      {isPending && <p>Loading…</p>}
      {isError && (
        <p className="error" role="alert">
          {error instanceof Error ? error.message : 'Request failed'}
          <button type="button" onClick={() => refetch()}>
            Retry
          </button>
        </p>
      )}

      {data && (
        <article>
          <div className="detail-head">
            <h1>
              {formatPokemonName(data.name)}{' '}
              <span className="muted">#{data.id}</span>
            </h1>
            <div className="detail-actions">
              <Link
                className="detail-compare"
                to={`/compare?a=${encodeURIComponent(String(data.id))}`}
              >
                Compare with…
              </Link>
              <button
                type="button"
                className={`detail-fav${isFavorite(data.id) ? ' detail-fav--on' : ''}`}
                aria-pressed={isFavorite(data.id)}
                onClick={() => toggleFavorite(data.id)}
              >
                {isFavorite(data.id) ? '★ Favorited' : '☆ Add favorite'}
              </button>
            </div>
          </div>

          <div className="detail-layout">
            <div className="detail-layout__art">
              <img
                src={
                  data.sprites.other?.['official-artwork']?.front_default ??
                  data.sprites.front_default ??
                  undefined
                }
                alt=""
                width={256}
                height={256}
              />
            </div>
            <div className="detail-layout__side">
              <div className="detail-types">
                <span className="detail-types__label">Types</span>
                <div className="detail-types__badges" role="list">
                  {data.types
                    .slice()
                    .sort((a, b) => a.slot - b.slot)
                    .map((t) => {
                      const slug = t.type.name
                      const c = getTypeBadgeColors(slug, theme)
                      return (
                        <span
                          key={slug}
                          className="type-badge"
                          style={{
                            borderColor: c.borderColor,
                            backgroundColor: c.backgroundColor,
                            color: c.color,
                          }}
                          role="listitem"
                        >
                          {formatPokemonName(slug)}
                        </span>
                      )
                    })}
                </div>
              </div>
              <section
                className="detail-dex"
                aria-labelledby="detail-dex-heading"
              >
                <h2 id="detail-dex-heading" className="detail-dex__heading">
                  Summary
                </h2>
                {speciesQuery.isPending && (
                  <p className="detail-dex__text muted">Loading…</p>
                )}
                {speciesQuery.isError && (
                  <p className="detail-dex__text muted">
                    Summary unavailable.
                  </p>
                )}
                {speciesQuery.isSuccess && (
                  <p className="detail-dex__text">
                    {formatSpeciesSummary(speciesQuery.data)}
                  </p>
                )}
              </section>
              <div className="detail-layout__stats-row">
                <div className="detail-stats-block">
                  <table className="detail-stats">
                    <caption className="detail-stats__caption">Base stats</caption>
                    <tbody>
                      {orderedStats.map((s) => (
                        <tr key={s.stat.name}>
                          <th scope="row">{formatPokemonName(s.stat.name)}</th>
                          <td>{s.base_stat}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div
                  className={`detail-evolution-wrap${showKantoEvolutionChart ? ' detail-evolution-wrap--column' : ''}`}
                >
                  {speciesQuery.isSuccess &&
                    evolutionChainId != null &&
                    evolutionChainQuery.isPending && (
                      <p className="detail-evolution__pending muted">Loading…</p>
                    )}
                  {(speciesQuery.isError ||
                    (speciesQuery.isSuccess && evolutionChainQuery.isError)) && (
                    <p className="detail-evolution__pending muted">
                      Evolution data unavailable.
                    </p>
                  )}
                  {showKantoEvolutionChart && (
                    <div className="detail-evolution-column">
                      <h2
                        id="detail-kanto-evolution-heading"
                        className="detail-evolution-column__heading"
                      >
                        Kanto evolution
                      </h2>
                      <EvolutionChart
                        columns={evolutionColumns}
                        currentApiName={data.name}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <section
              className="detail-moves"
              aria-labelledby="detail-moves-heading"
            >
              <h2 id="detail-moves-heading" className="detail-moves__title">
                Level-up moves
              </h2>
              <p className="detail-moves__note muted">{LEVEL_UP_MOVES_NOTE}</p>
              {levelUpMoves.length > 0 ? (
                <table className="detail-moves__table">
                  <thead>
                    <tr>
                      <th scope="col">Level</th>
                      <th scope="col">Move</th>
                      <th scope="col">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {levelUpMoves.map((row) => {
                      const qIdx = moveQueryIndexByApiName.get(row.apiName)
                      const moveQ =
                        qIdx != null ? moveDetailQueries[qIdx] : undefined
                      const typeSlug = moveTypeByApiName.get(row.apiName)
                      const typePending = moveQ?.isPending ?? false
                      const typeColors = typeSlug
                        ? getTypeBadgeColors(typeSlug, theme)
                        : null
                      return (
                        <tr key={row.apiName}>
                          <td className="detail-moves__level">
                            {formatLearnLevel(row.level)}
                          </td>
                          <th scope="row">
                            {formatPokemonName(row.apiName)}
                          </th>
                          <td className="detail-moves__type-cell">
                            {typePending ? (
                              <span className="muted">…</span>
                            ) : typeSlug && typeColors ? (
                              <span
                                className="type-badge type-badge--move-table"
                                style={{
                                  borderColor: typeColors.borderColor,
                                  backgroundColor: typeColors.backgroundColor,
                                  color: typeColors.color,
                                }}
                              >
                                {formatPokemonName(typeSlug)}
                              </span>
                            ) : (
                              <span className="muted">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                <p className="detail-moves__empty muted">
                  No level-up learnset found for this form in the configured
                  game versions.
                </p>
              )}
            </section>
          </div>
        </article>
      )}

      {inKanto && data && (
        <footer
          className="detail-pager"
          role="navigation"
          aria-label="Previous and next Kanto Pokémon"
        >
          <div className="detail-pager__inner">
            {prevId != null ? (
              <Link
                className="detail-pager__btn detail-pager__btn--prev"
                to={`/pokemon/${prevId}`}
              >
                <span className="detail-pager__arrow" aria-hidden="true">
                  ◀
                </span>
                <span className="detail-pager__text">
                  <span className="detail-pager__hint">Previous</span>
                  <span className="detail-pager__target">
                    #{prevId} {neighborLabel(prevId)}
                  </span>
                </span>
              </Link>
            ) : (
              <span className="detail-pager__btn detail-pager__btn--dead">
                <span className="detail-pager__arrow" aria-hidden="true">
                  ◀
                </span>
                <span className="detail-pager__text">
                  <span className="detail-pager__hint">Previous</span>
                  <span className="detail-pager__target">—</span>
                </span>
              </span>
            )}

            {nextId != null ? (
              <Link
                className="detail-pager__btn detail-pager__btn--next"
                to={`/pokemon/${nextId}`}
              >
                <span className="detail-pager__text">
                  <span className="detail-pager__hint">Next</span>
                  <span className="detail-pager__target">
                    #{nextId} {neighborLabel(nextId)}
                  </span>
                </span>
                <span className="detail-pager__arrow" aria-hidden="true">
                  ▶
                </span>
              </Link>
            ) : (
              <span className="detail-pager__btn detail-pager__btn--dead">
                <span className="detail-pager__text">
                  <span className="detail-pager__hint">Next</span>
                  <span className="detail-pager__target">—</span>
                </span>
                <span className="detail-pager__arrow" aria-hidden="true">
                  ▶
                </span>
              </span>
            )}
          </div>
        </footer>
      )}
    </main>
  )
}
