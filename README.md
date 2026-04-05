# Kanto Pokédex

A React + TypeScript Pokédex that uses the [PokéAPI](https://pokeapi.co/). Browse Pokémon, view details (evolution, moves, stats), compare two Pokémon, save favorites, and switch between Classic and Arcade themes.

## Prerequisites

- [Node.js](https://nodejs.org/) (current LTS is fine)
- npm (comes with Node)

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` if you need a different API base URL. Only variables prefixed with `VITE_` are available in the app.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Local dev server + HMR   |
| `npm run build`| Typecheck + production build → `dist/` |
| `npm run preview` | Serve the `dist` build locally |
| `npm run lint` | Run ESLint               |

## GitHub Pages (project site)

If your site will live at `https://YOUR_USER.github.io/REPO_NAME/`, Vite needs the correct **base path** or assets will 404.

1. In `vite.config.ts`, set `base` to your repo name with slashes, e.g. `base: '/REPO_NAME/'`.
2. Build: `npm run build`.
3. On GitHub: **Settings → Pages → Build and deployment → Source**: often **GitHub Actions** with a Vite/static workflow, or deploy the contents of `dist` (e.g. `gh-pages` branch or an action that uploads `dist`).

After changing `base`, run `npm run dev` and `npm run build` again before deploying.

For a **user site** (`https://YOUR_USER.github.io/` with no repo path), you can keep the default `base: '/'`.

## License

Private / personal project unless you add a license file.
