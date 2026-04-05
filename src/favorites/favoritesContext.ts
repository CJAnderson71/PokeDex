import { createContext } from 'react'

export type FavoritesValue = {
  favoriteIds: ReadonlySet<number>
  toggleFavorite: (id: number) => void
  isFavorite: (id: number) => boolean
}

export const FavoritesContext = createContext<FavoritesValue | null>(null)
