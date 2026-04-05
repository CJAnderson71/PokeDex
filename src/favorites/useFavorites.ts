import { useContext } from 'react'
import { FavoritesContext, type FavoritesValue } from './favoritesContext'

export function useFavorites(): FavoritesValue {
  const ctx = useContext(FavoritesContext)
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return ctx
}
