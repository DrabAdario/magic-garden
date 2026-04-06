# Magic Garden

A browser-based **garden sim** with seasonal harvest quotas, a **shop** (plot expansion, seeds, fertilizers, rations), **locked plant species** you unlock in the shop or through **winter story events**, and a **BitLife / Oregon Trail–style winter survival** minigame (choices, health, rations).

Built with **React**, **TypeScript**, **Vite**, and **MUI**.

---

## Features

- **Growing seasons** — Spring → summer → fall with per-phase harvest limits; advance by using harvests or **end season early**.
- **Grid planting** — Place seeds, synergies between crops (apples boost neighbors, pears chain when neighbors mature, cherries/tangerines slow ortho neighbors, oranges use auras, etc.).
- **Economy** — Sell crops or **pack rations** for winter; buy seeds, fertilizers, plot expansion, and rations in the shop.
- **Locked plants** — Only **carrot**, **tomato**, and **sunflower** start unlocked; other species cost coins to unlock, or can appear as rewards in winter events.
- **Winter** — Ten narrative days with two-option choices; **health** and **rations** matter; outcomes are summarized after each choice.
- **Year-end score** — Earnings, harvest stats, and winter survival summary.

---

## Getting started

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

### Scripts

| Command        | Description                |
|----------------|----------------------------|
| `npm run dev`  | Dev server with HMR        |
| `npm run build`| Typecheck + production build |
| `npm run preview` | Serve `dist` locally    |
| `npm test`     | Run Vitest (game logic)    |
| `npm run test:watch` | Vitest watch mode  |

---

## Deployment (GitHub Pages)

The repo includes a workflow that builds with Vite and deploys **`dist`** when you push to **`main`** or **`master`**.

1. **Repository → Settings → Pages** — set **Source** to **GitHub Actions** (not “Deploy from branch”).
2. Push your changes; the **Actions** tab shows the deploy run.
3. The app uses `base: "./"` in Vite so asset paths work from a project subpath on Pages.

---

## Project layout (short)

| Path | Role |
|------|------|
| `src/App.tsx` | Screens: start, play, winter, score |
| `src/components/` | UI (board, HUD, shop, winter screen, …) |
| `src/game/` | Simulation, seeds, fertilizers, winter events, tests |
| `public/` | Static files served as-is (see **Pixel art** below) |

---

## Pixel art assets (e.g. Admurin)

You can use **free packs** (such as [Admurin](https://admurin.itch.io/)) as long as you follow **their license** (often requires attribution—check each pack’s page).

### Where to put files

**Option A — `public/sprites/` (simple, good for many PNGs)**  

1. Create or use **`public/sprites/`** (already present in this repo as a placeholder).
2. Drop your `.png` files there (e.g. `public/sprites/carrot.png`).
3. Reference them in React with a **base-aware URL** so dev and GitHub Pages both work:

```tsx
<img
  src={`${import.meta.env.BASE_URL}sprites/carrot.png`}
  alt="Carrot"
  width={32}
  height={32}
/>
```

`import.meta.env.BASE_URL` is `./` in this project, so the path resolves correctly for `npm run dev`, `npm run preview`, and GitHub Pages.

**Option B — `src/assets/` (imported, hashed filenames on build)**  

1. Put files under e.g. `src/assets/sprites/`.
2. Import where needed:

```tsx
import carrotImg from "../assets/sprites/carrot.png";

<img src={carrotImg} alt="Carrot" width={32} height={32} />;
```

Vite will bundle and version the file. Use this when you want tree-shaking and cache-busting per file.

### Sprite sheets in this project

The game uses one **combined atlas**: **`public/sprites/Freebies_Full_Icons.png`**

- **672×640 px** → **21 columns × 20 rows** of **32×32 px** cells (`ICON_ATLAS` in `src/game/spriteAssets.ts`).

Each crop and fertilizer is mapped by **`col` / `row`** (0-based, left-to-right, top-to-bottom) in **`SEED_SPRITE_CELL`** and **`FERTILIZER_SPRITE_CELL`**. If an icon looks wrong, open the PNG in an editor with a grid, count to the correct icon, and update those numbers.

Rendering uses **`src/components/SpriteSheetIcon.tsx`** (CSS `background-position`, crisp pixel scaling).

### Attribution

The in-game footer links to **Admurin**. Keep your copy of their license / readme from the pack download and follow their terms.

- **Pixel icons:** [Admurin](https://admurin.itch.io/) — *Freebies full icon sheet; see each asset page for license terms.*

---

## License

Game **source code** in this repository: follow the license you choose for the project (add a `LICENSE` file if you haven’t).

**Third-party assets** (sprites, fonts, etc.) remain under their respective licenses—keep those terms and attribution with the files or in this README.

---

## Development notes

- Core rules are tested in `src/game/simulation.test.ts` (Vitest, Node environment).
- Winter narrative content lives in `src/game/winterEvents.ts`; tuning constants in `src/game/winterConstants.ts`.
