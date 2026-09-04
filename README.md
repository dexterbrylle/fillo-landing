# Fillo Landing Site

Static, dependency-free marketing site for Fillo — a paid, offline car expense
tracker for iPhone and iPad. Three pages:

- `index.html` — landing page (parallax hero, Cost Ahead, Vehicle Passport,
  interactive demo, privacy, purchase CTA)
- `support.html` — `/support` (FAQ + contact)
- `privacy.html` — `/privacy` (policy generated from verified app behavior)

The paid-upfront and privacy copy follows
`../fillo/app-store-assets/APP_STORE_RELEASE_BLOCKERS.md` plus direct source and
compiled-product inspection. Every site claim is tracked in
[CONTENT-AUDIT.md](CONTENT-AUDIT.md).

## Local preview

```sh
python3 -m http.server 8080
# open http://localhost:8080
```

The checked-in optimized assets make the site directly deployable. Deploy by
uploading the directory as-is (minus `tools/` and `verification/` if you prefer).

## Regenerating screenshots

The landing page does **not** use the App Store marketing compositions. It takes
the current raw iPhone captures from
`../fillo/app-store-assets/raw-screenshots/iphone/`, places them directly inside
Apple's official iPhone 17 Pro Max hardware bezel, and writes optimized WebP
assets.

Download the iPhone 17 Product Bezels kit from
[Apple Design Resources](https://developer.apple.com/design/resources/), accept
Apple's license, and mount the disk image. Then run:

```sh
FILLO_IPHONE_BEZEL_PATH='/path/to/iPhone 17 Pro Max - Deep Blue - Portrait.png' \
  ./tools/build-assets.sh
```

The licensed source bezel is intentionally not committed. App Store listing
artwork remains separately generated in `../fillo/app-store-assets/screenshots/`.

## GitHub Pages first deployment

This directory is ready for branch-based GitHub Pages hosting. The included
`.nojekyll` file tells GitHub Pages to serve the static files without Jekyll.

1. Create an empty GitHub repository for this site.
2. Initialize this directory as that repository, commit the site, and push it.
3. In the GitHub repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, then select
   the publishing branch and `/ (root)` folder.
5. Record the generated URL. A project site normally uses
   `https://<account>.github.io/<repository>/`; an account site uses
   `https://<account>.github.io/`.
6. Confirm the custom domain `https://fillo.dexterbrylle.com/` resolves to the
   published Pages site and that HTTPS enforcement is enabled.
7. Open `/support` and `/privacy` from a real iPhone.

## Structure

```
index.html  support.html  privacy.html
robots.txt  sitemap.xml
assets/
  css/styles.css        design tokens mirror fillo/App/Theme.swift
  js/main.js            progressive enhancement only (site works without JS)
  img/screenshots/      raw captures in Apple's official iPhone bezel, WebP
  img/                  app icon, favicons, og-image.png
tools/
  og.html               editable source for the social preview image
  build-assets.sh       regenerates all optimized assets from repo sources
  frame-iphone-screenshots.swift  composites raw captures into Apple's bezel
  verify.js             browser verification (24 checks) via playwright
  package.json          dev tooling only — never shipped
verification/           full-page screenshots at 320→1440 px
HERO-MANIFEST.md        hero layers, sources, motion contract
CONTENT-AUDIT.md        verified claims, placeholders, publishing blockers
```

## Publishing blockers

See [CONTENT-AUDIT.md §3](CONTENT-AUDIT.md). Short version: App Store URL,
owner review, price decision, and preview-host noindex. All
swap points are marked `<!-- PUBLISHING BLOCKER -->` in the HTML.

## Accessibility & behavior notes

- Works fully with JavaScript disabled (demo shows all panels statically).
- Honors `prefers-reduced-motion` (no parallax, no reveals, no bar animation).
- Keyboard: skip link first, mobile menu Escape + focus return, demo tabs use
  roving tabindex with Arrow/Home/End keys.
- Official Apple hardware artwork is used for the device bezel; no fake email
  capture, dead links, or policy/support placeholders remain.
