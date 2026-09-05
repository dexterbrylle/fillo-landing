# Fillo Landing Site

<!-- impeccable:product-schema 1 -->

This is a site-scoped product record for design work on the Fillo marketing website. [The Fillo app's product record](../fillo/PRODUCT.md) and its [approved product specification](../fillo/docs/offline-paid-product-spec.md) remain the authoritative source for the app itself — its scope, domain language, behavior, and release boundaries. If this summary diverges from those, follow the app record and update this summary.

## Platform

web

## Users

Personal car owners — the same audience as the app, addressed here in English as prospective buyers. Philippines-first, global-friendly: local currency and framing lead, with an explicit reassurance that the app works in the visitor's own currency and measurement system. Launch scope covers personal cars, SUVs, crossovers, pickups, and vans; commercial fleets and motorcycles are excluded.

## Product Purpose

Persuade a car owner to understand and buy Fillo. The site explains what Fillo does — keeps fuel, charging, maintenance, expenses, documents, reminders, forecasts, and ownership history together on the device — and drives one conversion: the App Store download.

## Positioning

The site presents Fillo's positioning unchanged: a paid-once, offline-only car-ownership tracker with every feature included and no account, subscription, feature unlock, advertising, backend, cloud sync, or third-party analytics.

## Operating Context

- Static, dependency-free marketing site on the custom domain https://fillo.dexterbrylle.com/, published via GitHub Pages. Three pages: `index.html` (landing), `support.html`, `privacy.html`.
- The site is completed and presented as if Fillo is launched. The App Store download link is a placeholder the owner will replace with the live listing URL; swap points are marked `<!-- PUBLISHING BLOCKER -->` in the HTML.
- No numeric price is shown, so the site stays accurate across storefronts until the launch price is final.
- Claims are tracked against the app source and compiled product in CONTENT-AUDIT.md; the app's own record is the authority for app facts.

## Capabilities and Constraints

- No build step, no backend, no runtime dependencies; works fully with JavaScript disabled.
- Sample data is deterministic and Philippine-peso denominated, with a "works in your local currency" note. Do not fabricate testimonials, customers, benchmarks, pricing, or release dates.
- Device frames use Apple's official iPhone bezel artwork; the licensed source bezel is supplied at build time (`FILLO_IPHONE_BEZEL_PATH`) and is not committed.
- The placeholder App Store URL is an owner swap point. Until it is swapped, the site must not present a dead or deceptive link.

## Brand Commitments

- Name: Fillo. Voice: honest, practical, understated — the product's real mechanics do the persuading.
- Privacy is a first-class pillar ("records never touch a Fillo server," no account, no trackers). Avoid absolute claims that data can never leave the device; it can, when the user chooses to export or back up.
- "Independently made" and the © 2026 copyright year are used but pending owner confirmation (CONTENT-AUDIT.md §3).

## Evidence on Hand

- CONTENT-AUDIT.md — verified claims, placeholders, and publishing blockers.
- HERO-MANIFEST.md — hero layers, source assets, and motion contract.
- ../fillo/PRODUCT.md and ../fillo/docs/offline-paid-product-spec.md — authoritative app product record and specification.
- ../fillo/app-store-assets/raw-screenshots/iphone/ — real product captures used in device frames.
- assets/img/screenshots/ (optimized WebP) and verification/*.png (full-page screenshots at 320–1440px).
- .impeccable/critique/2026-09-04T05-23-25Z__index-html.md — a completed design critique of the landing page.

## Product Principles

1. Every claim is true and verifiable against the app; state absences honestly rather than inventing proof.
2. Persuade through the product's real mechanism — the road/journey metaphor, real screenshots, labeled estimates — not category clichés.
3. Lead Philippines-first while staying legible and welcoming to a global visitor.
4. Keep the single conversion — the App Store download — present and honest at every stage.
5. Ship production-grade: progressive enhancement, accessibility, and performance are not optional.

## Accessibility & Inclusion

The site must work fully with JavaScript disabled, honor prefers-reduced-motion, stay keyboard-operable (skip link, roving-tabindex demo tabs, Escape menu), hold ≥ 4.5:1 contrast for key text, and not overflow horizontally at 320–1440px.

## Open Decisions

- The exact App Store URL and launch price (owner decisions; see CONTENT-AUDIT.md §3).
- Final wording of "Independently made" and the footer copyright year.
