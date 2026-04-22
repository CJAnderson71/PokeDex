import {
  NavLink,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { FAVICON_URL } from './constants/favicon'
import { ComparePage } from './pages/ComparePage'
import { HomePage } from './pages/HomePage'
import { PokemonDetailPage } from './pages/PokemonDetailPage'
import { useTheme } from './theme/useTheme'
import './App.css'

function navClass({ isActive }: { isActive: boolean }): string {
  return `shell-nav__link${isActive ? ' shell-nav__link--active' : ''}`
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const classic = theme === 'classic'
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={classic}
      aria-label={
        classic
          ? 'Classic Dex theme on. Switch to arcade theme.'
          : 'Arcade theme. Switch to classic Dex theme.'
      }
    >
      {classic ? 'Arcade' : 'Classic Dex'}
    </button>
  )
}

export default function App() {
  return (
    <div className="app">
      <header className="shell-header">
        <div className="shell-header__top">
          <NavLink to="/" className="shell-header__brand" end>
            <img
              className="shell-header__logo"
              src={FAVICON_URL}
              alt=""
              width={32}
              height={32}
              decoding="async"
            />
            <span className="shell-header__title">Kanto Pokédex</span>
          </NavLink>
          <div className="shell-header__tools">
            <ThemeToggle />
            <nav className="shell-nav" aria-label="Main navigation">
              <NavLink to="/" className={navClass} end>
                List
              </NavLink>
              <NavLink to="/compare" className={navClass}>
                Compare
              </NavLink>
            </nav>
          </div>
        </div>
        <div className="shell-header__bezel" aria-hidden="true" />
      </header>

      <div className="app__screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/pokemon/:idOrName" element={<PokemonDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  )
}
