import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { officialArtworkUrlForNationalDexId } from '../api/pokeapi'
import type { EvolutionStageCell } from '../lib/evolutionChain'
import { formatPokemonName } from '../lib/pokemonDisplay'

type Props = {
  columns: EvolutionStageCell[][]
  currentApiName: string
}

export function EvolutionChart({ columns, currentApiName }: Props) {
  if (columns.length === 0) return null

  return (
    <div
      className="detail-evolution__chart"
      role="group"
      aria-label="Evolution stages"
    >
      {columns.map((col, colIndex) => (
        <Fragment key={colIndex}>
          {colIndex > 0 ? (
            <span className="detail-evolution__arrow" aria-hidden="true">
              →
            </span>
          ) : null}
          <div className="detail-evolution__slot">
            <div className="detail-evolution__column">
              {col.map((cell, rowIndex) => (
                <div
                  key={`${cell.apiName}-${rowIndex}`}
                  className="detail-evolution__cell"
                >
                  <span
                    className={
                      cell.edgeLabel
                        ? 'detail-evolution__edge'
                        : 'detail-evolution__edge detail-evolution__edge--placeholder'
                    }
                    aria-hidden={!cell.edgeLabel}
                  >
                    {cell.edgeLabel ?? '\u00a0'}
                  </span>
                  <Link
                    className={`detail-evolution__stage${
                      cell.apiName === currentApiName
                        ? ' detail-evolution__stage--current'
                        : ''
                    }`}
                    to={`/pokemon/${encodeURIComponent(cell.apiName)}`}
                  >
                    {cell.speciesId != null ? (
                      <img
                        className="detail-evolution__sprite"
                        src={officialArtworkUrlForNationalDexId(cell.speciesId)}
                        alt=""
                        width={64}
                        height={64}
                        loading="lazy"
                      />
                    ) : null}
                    <span className="detail-evolution__name">
                      {formatPokemonName(cell.apiName)}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  )
}
