import { useQueries, useQuery } from '@tanstack/react-query'
import {
  type FormEvent,
  type KeyboardEvent,
  useMemo,
  useState,
} from 'react'
import {
  Link,
  type SetURLSearchParams,
  useSearchParams,
} from 'react-router-dom'
import {
  fetchPokemon,
  fetchPokemonList,
  parsePokemonIdFromUrl,
  type Pokemon,
} from '../api/pokeapi'
import { BASE_STAT_ORDER } from '../constants/pokemonStats'
import { REGION } from '../config'
import { useFavorites } from '../favorites/useFavorites'
import { formatPokemonName } from '../lib/pokemonDisplay'

const KANTO_LIST_LIMIT = REGION.idTo - REGION.idFrom + 1
const KANTO_LIST_OFFSET = REGION.idFrom - 1
const SUGGEST_MAX = 10

type KantoSuggestRow = {
  apiName: string
  id: number
  label: string
}

function filterKantoSuggestions(
  rows: KantoSuggestRow[],
  query: string,
): KantoSuggestRow[] {
  const q = query.trim().toLowerCase()
  if (q.length < 1) return []
  if (/^\d+$/.test(q)) {
    return rows.filter((r) => String(r.id).startsWith(q)).slice(0, SUGGEST_MAX)
  }
  const scored = rows
    .map((r) => {
      const name = r.apiName
      const disp = r.label.toLowerCase()
      if (name.startsWith(q)) return { r, s: 0 as const }
      if (name.includes(q)) return { r, s: 1 as const }
      if (disp.includes(q)) return { r, s: 2 as const }
      return null
    })
    .filter((x): x is { r: KantoSuggestRow; s: 0 | 1 | 2 } => x != null)
  scored.sort((a, b) => a.s - b.s || a.r.id - b.r.id)
  return scored.slice(0, SUGGEST_MAX).map((x) => x.r)
}

type CompareNameFieldProps = {
  inputId: string
  fieldLabel: string
  value: string
  onChange: (value: string) => void
  kantoRows: KantoSuggestRow[]
}

function CompareNameField({
  inputId,
  fieldLabel,
  value,
  onChange,
  kantoRows,
}: CompareNameFieldProps) {
  const [open, setOpen] = useState(false)
  const [highlight, setHighlight] = useState(-1)
  const listboxId = `${inputId}-listbox`

  const suggestions = useMemo(
    () => filterKantoSuggestions(kantoRows, value),
    [kantoRows, value],
  )

  const showList = open && suggestions.length > 0

  const safeHighlight =
    highlight >= 0 && highlight < suggestions.length ? highlight : -1

  const pick = (apiName: string) => {
    onChange(apiName)
    setOpen(false)
    setHighlight(-1)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => {
        const len = suggestions.length
        if (!len) return -1
        const i = Math.min(Math.max(h, -1), len - 1)
        return i < len - 1 ? i + 1 : i
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => {
        const len = suggestions.length
        if (!len) return -1
        if (h < 0) return len - 1
        const i = Math.min(h, len - 1)
        return i > 0 ? i - 1 : -1
      })
    } else     if (e.key === 'Enter' && safeHighlight >= 0) {
      e.preventDefault()
      pick(suggestions[safeHighlight].apiName)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      setHighlight(-1)
    }
  }

  return (
    <div className="compare-suggest">
      <label htmlFor={inputId}>{fieldLabel}</label>
      <input
        id={inputId}
        value={value}
        autoComplete="off"
        placeholder="id or name"
        aria-expanded={showList}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && safeHighlight >= 0
            ? `${inputId}-opt-${safeHighlight}`
            : undefined
        }
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setHighlight(-1)
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false)
            setHighlight(-1)
          }, 160)
        }}
        onKeyDown={onKeyDown}
      />
      {showList && (
        <ul
          id={listboxId}
          className="compare-suggest__list"
          role="listbox"
        >
          {suggestions.map((row, i) => (
            <li
              key={row.apiName}
              id={`${inputId}-opt-${i}`}
              role="option"
              aria-selected={i === safeHighlight}
              className={
                i === safeHighlight
                  ? 'compare-suggest__option compare-suggest__option--active'
                  : 'compare-suggest__option'
              }
              onMouseDown={(e) => {
                e.preventDefault()
                pick(row.apiName)
              }}
              onMouseEnter={() => setHighlight(i)}
            >
              <span className="compare-suggest__label">{row.label}</span>
              <span className="compare-suggest__dex">#{row.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function artworkUrl(p: Pokemon): string | undefined {
  return (
    p.sprites.other?.['official-artwork']?.front_default ??
    p.sprites.front_default ??
    undefined
  )
}

function statMap(p: Pokemon): Map<string, number> {
  const m = new Map<string, number>()
  for (const s of p.stats) {
    m.set(s.stat.name, s.base_stat)
  }
  return m
}

type CompareUrlFormProps = {
  initialA: string
  initialB: string
  favoriteList: number[]
  setSearchParams: SetURLSearchParams
}

function CompareUrlForm({
  initialA,
  initialB,
  favoriteList,
  setSearchParams,
}: CompareUrlFormProps) {
  const [draftA, setDraftA] = useState(initialA)
  const [draftB, setDraftB] = useState(initialB)

  const { data: listData } = useQuery({
    queryKey: ['pokemon-list', REGION.idFrom, REGION.idTo],
    queryFn: () => fetchPokemonList(KANTO_LIST_LIMIT, KANTO_LIST_OFFSET),
  })

  const kantoRows = useMemo((): KantoSuggestRow[] => {
    const results = listData?.results
    if (!results) return []
    const out: KantoSuggestRow[] = []
    for (const item of results) {
      const id = parsePokemonIdFromUrl(item.url)
      if (id == null) continue
      out.push({
        apiName: item.name,
        id,
        label: formatPokemonName(item.name),
      })
    }
    return out
  }, [listData])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next = new URLSearchParams()
    const na = draftA.trim()
    const nb = draftB.trim()
    if (na) next.set('a', na)
    if (nb) next.set('b', nb)
    setSearchParams(next)
  }

  return (
    <form className="compare-form" onSubmit={onSubmit}>
      <div className="compare-form__fields">
        <div className="compare-form__field compare-form__field--suggest">
          <CompareNameField
            inputId="compare-a"
            fieldLabel="Pokémon A"
            value={draftA}
            onChange={setDraftA}
            kantoRows={kantoRows}
          />
        </div>
        <div className="compare-form__field compare-form__field--suggest">
          <CompareNameField
            inputId="compare-b"
            fieldLabel="Pokémon B"
            value={draftB}
            onChange={setDraftB}
            kantoRows={kantoRows}
          />
        </div>
      </div>
      <button type="submit" className="compare-form__submit">
        Compare
      </button>

      {favoriteList.length > 0 && (
        <div className="compare-favorites">
          <p className="compare-favorites__title">From favorites</p>
          <div className="compare-favorites__row">
            <label className="compare-favorites__pick">
              A
              <select
                value={
                  favoriteList.includes(Number(draftA)) ? draftA : ''
                }
                onChange={(e) => setDraftA(e.target.value)}
                aria-label="Set A from favorites"
              >
                <option value="">—</option>
                {favoriteList.map((id) => (
                  <option key={`fa-${id}`} value={String(id)}>
                    #{id}
                  </option>
                ))}
              </select>
            </label>
            <label className="compare-favorites__pick">
              B
              <select
                value={
                  favoriteList.includes(Number(draftB)) ? draftB : ''
                }
                onChange={(e) => setDraftB(e.target.value)}
                aria-label="Set B from favorites"
              >
                <option value="">—</option>
                {favoriteList.map((id) => (
                  <option key={`fb-${id}`} value={String(id)}>
                    #{id}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      )}
    </form>
  )
}

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const aParam = (searchParams.get('a') ?? '').trim()
  const bParam = (searchParams.get('b') ?? '').trim()

  const { favoriteIds } = useFavorites()
  const favoriteList = useMemo(
    () => [...favoriteIds].sort((x, y) => x - y),
    [favoriteIds],
  )

  const [leftQuery, rightQuery] = useQueries({
    queries: [
      {
        queryKey: ['pokemon', aParam],
        queryFn: () => fetchPokemon(aParam),
        enabled: aParam.length > 0,
      },
      {
        queryKey: ['pokemon', bParam],
        queryFn: () => fetchPokemon(bParam),
        enabled: bParam.length > 0,
      },
    ],
  })

  const left = leftQuery.data
  const right = rightQuery.data

  const statRows = useMemo(() => {
    if (!left || !right) return []
    const lm = statMap(left)
    const rm = statMap(right)
    return BASE_STAT_ORDER.map((name) => ({
      name,
      left: lm.get(name) ?? null,
      right: rm.get(name) ?? null,
    }))
  }, [left, right])

  const leftArt = left ? artworkUrl(left) : undefined
  const rightArt = right ? artworkUrl(right) : undefined

  return (
    <main className="page page--wide">
      <nav className="nav-back">
        <Link to="/">← Kanto list</Link>
      </nav>
      <h1>Compare</h1>
      <p className="lede">
        Two ids or names (e.g. <code>25</code> and <code>charizard</code>). The
        address bar uses <code>?a=…&b=…</code> so you can bookmark or share.
      </p>

      <CompareUrlForm
        key={`${aParam}|${bParam}`}
        initialA={aParam}
        initialB={bParam}
        favoriteList={favoriteList}
        setSearchParams={setSearchParams}
      />

      {aParam && leftQuery.isPending && <p>Loading A…</p>}
      {aParam && leftQuery.isError && (
        <p className="error" role="alert">
          A:{' '}
          {leftQuery.error instanceof Error
            ? leftQuery.error.message
            : 'Error'}
          <button type="button" onClick={() => leftQuery.refetch()}>
            Retry
          </button>
        </p>
      )}
      {bParam && rightQuery.isPending && <p>Loading B…</p>}
      {bParam && rightQuery.isError && (
        <p className="error" role="alert">
          B:{' '}
          {rightQuery.error instanceof Error
            ? rightQuery.error.message
            : 'Error'}
          <button type="button" onClick={() => rightQuery.refetch()}>
            Retry
          </button>
        </p>
      )}

      {left && right && (
        <>
          <div className="compare-panels">
            <section className="compare-panel" aria-label="Pokémon A">
              {leftArt ? (
                <img src={leftArt} alt="" width={200} height={200} />
              ) : null}
              <h2 className="compare-panel__title">
                {formatPokemonName(left.name)}{' '}
                <span className="muted">#{left.id}</span>
              </h2>
              <p className="compare-panel__types">
                {left.types
                  .slice()
                  .sort((x, y) => x.slot - y.slot)
                  .map((t) => formatPokemonName(t.type.name))
                  .join(' · ')}
              </p>
              <Link className="compare-panel__link" to={`/pokemon/${left.id}`}>
                Open detail
              </Link>
            </section>
            <section className="compare-panel" aria-label="Pokémon B">
              {rightArt ? (
                <img src={rightArt} alt="" width={200} height={200} />
              ) : null}
              <h2 className="compare-panel__title">
                {formatPokemonName(right.name)}{' '}
                <span className="muted">#{right.id}</span>
              </h2>
              <p className="compare-panel__types">
                {right.types
                  .slice()
                  .sort((x, y) => x.slot - y.slot)
                  .map((t) => formatPokemonName(t.type.name))
                  .join(' · ')}
              </p>
              <Link className="compare-panel__link" to={`/pokemon/${right.id}`}>
                Open detail
              </Link>
            </section>
          </div>

          <table className="compare-stats">
            <caption>Base stats</caption>
            <thead>
              <tr>
                <th scope="col">Stat</th>
                <th scope="col">A</th>
                <th scope="col">B</th>
              </tr>
            </thead>
            <tbody>
              {statRows.map((row) => {
                const lv = row.left
                const rv = row.right
                const lHi = lv != null && rv != null && lv > rv
                const rHi = lv != null && rv != null && rv > lv
                return (
                  <tr key={row.name}>
                    <th scope="row">{formatPokemonName(row.name)}</th>
                    <td className={lHi ? 'compare-stats__hi' : undefined}>
                      {lv ?? '—'}
                    </td>
                    <td className={rHi ? 'compare-stats__hi' : undefined}>
                      {rv ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </>
      )}

      {(!aParam || !bParam) && (
        <p className="empty-hint">
          {!aParam && !bParam
            ? 'Enter two Pokémon and submit to compare base stats and types.'
            : !aParam
              ? 'Add Pokémon A (or pick from favorites), then submit.'
              : 'Add Pokémon B (or pick from favorites), then submit.'}
        </p>
      )}
    </main>
  )
}
