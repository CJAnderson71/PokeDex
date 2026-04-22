/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional; defaults to `https://pokeapi.co/api/v2` (see `config.ts`). */
  readonly VITE_POKEAPI_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
