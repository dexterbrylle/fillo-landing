# Hero Layer Manifest

The hero is built entirely from real, repository-owned assets and CSS. No
AI-generated imagery, stock photography, or third-party assets are used.

## Layers (back → front)

| # | Layer | Element | Source | Parallax speed | Notes |
|---|-------|---------|--------|----------------|-------|
| 1 | Background gradient | `.hero` | CSS (`assets/css/styles.css`) | none | mist `#F7FBF9` → surface `#F3F8F5` → primary-soft `#DDEFE7`, mirroring Fillo's `launchGradient`/`surfaceGradient` in `fillo/App/Theme.swift` |
| 2 | Soft blob (top right) | `.hero-blob.b1` | CSS radial shape | `0.12` | primary-soft at 55% opacity, 60px blur |
| 3 | Soft blob (bottom left) | `.hero-blob.b2` | CSS radial shape | `0.22` | derived light green at 80% opacity |
| 4 | Road line | `.hero-road` | CSS repeating-linear-gradient | `0.05` | dashed primary `#18715B` at 30% opacity; horizontal under the hero, continues as the vertical road in the Vehicle Passport section |
| 5 | Copy block | `.hero-copy` | HTML | none (static) | eyebrow / headline / lede / CTAs / fact pills |
| 6 | App screenshot | `.hero-visual .shot img` | `assets/img/screenshots/dashboard.webp` ← `app-store-assets/raw-screenshots/iphone/01-dashboard.png` | `0.06` | real Fillo Home screen with deterministic sample data; plain rounded frame, no simulated device chrome |

## Source assets

- `../fillo/app-store-assets/raw-screenshots/iphone/01-dashboard.png` — 1320×2868 real simulator capture (see `app-store-assets/README.md` for the capture test).
- Palette values from `fillo/App/Theme.swift` (`FilloTheme`).
- Regenerate optimized versions with `tools/build-assets.sh` (cwebp, sips, playwright).

## Motion contract

- Transforms are applied by `assets/js/main.js` only when
  `prefers-reduced-motion: no-preference` holds; otherwise layers sit at their
  static positions (the default in CSS).
- Without JavaScript the hero is fully static and complete.
- Speeds (0.05–0.22) are deliberately subtle; owner confirmation of depth/speed
  is a publishing checkpoint (see CONTENT-AUDIT.md).

## Visual continuation

The dashed road motif starts under the hero, and reappears as the vertical
`.passport-road` line through the Vehicle Passport section (numbered markers
1–6, scroll-linked dash shift). It is the page's single continuous motif —
the hero's visual language carried down the page, not a separate decoration.
