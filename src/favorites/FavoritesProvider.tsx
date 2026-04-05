import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { FavoritesContext } from './favoritesContext'

const STORAGE_KEY = 'pokedex-favorite-ids'

function loadFavoriteIds(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    const ids: number[] = []
    for (const x of parsed) {
      if (typeof x === 'number' && Number.isInteger(x)) ids.push(x)
      else if (typeof x === 'string' && /^\d+$/.test(x))
        ids.push(parseInt(x, 10))
    }
    return [...new Set(ids)].sort((a, b) => a - b)
  } catch {
    return []
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [idList, setIdList] = useState<number[]>(() => loadFavoriteIds())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return
      setIdList(loadFavoriteIds())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const favoriteIds = useMemo(() => new Set(idList), [idList])

  const toggleFavorite = useCallback((id: number) => {
    setIdList((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id].sort((a, b) => a - b)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        /* quota / private mode */
      }
      return next
    })
  }, [])

  const isFavorite = useCallback(
    (id: number) => favoriteIds.has(id),
    [favoriteIds],
  )

  const value = useMemo(
    () => ({ favoriteIds, toggleFavorite, isFavorite }),
    [favoriteIds, toggleFavorite, isFavorite],
  )

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}
