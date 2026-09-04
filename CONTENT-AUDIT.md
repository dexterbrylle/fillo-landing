# Content Audit — Fillo Landing Site

Audit date: September 4, 2026, against the current `fillo` working tree,
`app-store-assets/APP_STORE_RELEASE_BLOCKERS.md`, direct source inspection, and
the compiled Release simulator product.

## 1. Claims verified against the repository

| Claim (on site) | Verified in |
| --- | --- |
| Paid once, no subscription, no free tier/trial, no ads, no in-app purchases | `APP_STORE_RELEASE_BLOCKERS.md` approved monetization; shipping app has no StoreKit/RevenueCat dependency, product, or access gate |
| No account required | spec (Accounts: No Fillo account); no auth code in app target |
| Records stay on device; nothing leaves unless you export/backup via Apple's tools | spec §"Offline-only boundary" + §132 wording; `fillo/Services/BackupService.swift`, `AttachmentStore.swift` (Application Support container) |
| No analytics or advertising SDKs / no trackers | grep across `fillo/`, `FilloWidgets/`: zero hits for analytics/ads/crash SDKs; `project.pbxproj` contains no remote Swift package references |
| No backend, works fully offline | spec; Info.plist has no push/background-network config; entitlements contain only an app group |
| Cost Ahead: 30/90/365-day estimates from saved history, confirmed maintenance intervals, recurring expenses, document renewals | `metadata.md` description ("PLAN AHEAD"); spec §Maintenance intervals and reminders |
| Reminders by date, odometer, or both; estimated due dates clearly labeled; local notifications only | spec (Reminder states, local notification scheduling) |
| No prediction of failures / no market data | spec (deterministic calculations; prohibited online exchange rates, manufacturer schedules) — site states the negative explicitly |
| Vehicle Passport: private PDF for mechanic, insurer, or buyer | `metadata.md` description + screenshot copy 6 |
| Glovebox: registration, insurance, receipts, renewals; photos/scans/PDFs | spec §attachments (543, 547) |
| Fillo Backup: complete restorable archive, optional password, save to On My iPhone / iCloud Drive / other Files providers, restore | `BackupService.swift` (`createBackup(now:password:)` verified); spec |
| Up to seven automatic daily backups in app container; removed on uninstall | spec line 898, 209 |
| CSV export; CSV import accepts official versioned Fillo templates | spec §CSV Export and import; `fillo/Features/Settings/CSVImportView.swift` exists in v1.0 code |
| Recently Deleted: 30-day recovery, then permanent purge | spec §Recently Deleted; `GarageState.swift` purge logic |
| Deleting the app removes local storage; no copy remains with Fillo | spec (no servers); storage location in app container |
| Unlimited cars; Running Cost; currencies never combined | spec non-negotiable rules 9, product summary |
| Quick Log accepts typed text or system-keyboard dictation and produces a reviewable draft | `FilloAssistView.swift` text field; keyboard dictation is an iOS input method and Fillo requests no microphone or Speech permission |
| Widgets, Shortcuts, Quick Log | `FilloWidgets/` (WidgetKit, AppIntents); spec |
| Permissions: camera (receipts/photos/documents), Face ID (Privacy Lock, protected deletion), and notifications are optional | `fillo/Info.plist`, `PrivacyLockService.swift`, and `NotificationScheduler.swift` |
| Privacy Lock (biometric or device passcode gate), Privacy Mode (hides sensitive values) | spec domain terms table |
| iPhone and iPad, iOS 18.0 or later | `project.pbxproj`: `TARGETED_DEVICE_FAMILY = "1,2"`, `IPHONEOS_DEPLOYMENT_TARGET = 18.0` |
| "Independently made" | no company/legal entity anywhere in repo; individual developer (git history). Listed below for owner confirmation |

## 2. Unresolved placeholders on the site

1. **App Store CTA** — deliberately a non-link status button labeled “Fillo on App
   Store” with the Apple mark (see blockers below). The purchase section states
   it becomes a real download link when the listing is live. Swap points are
   marked with `<!-- PUBLISHING BLOCKER -->` comments in all three HTML files.

## 3. Owner must provide before publishing

1. **Public App Store URL** → turn the “Fillo on App Store” CTAs (nav, hero,
   purchase section, footer) into real download links in `index.html`,
   `support.html`, `privacy.html`.
2. **Owner review of the privacy policy** — it was generated from code behavior;
   it is not legal advice.
3. **Confirm price wording** — no numeric price is shown on the site. This keeps
   the site accurate across localized storefronts until the launch price is final.
4. **Confirm copyright year** in the footer (currently © 2026, matching the
   repo's dating).
5. **Confirm "independently made"** footer/tagline wording.
6. **Preview-deployment noindex** — configure `X-Robots-Tag: noindex` for
   preview environments at the host; `robots.txt` documents this.

## 4. Discrepancies between app, spec, and site copy

1. **Launch price**: the paid-download mechanism is reconciled across the app,
   metadata, specification, and site. The exact App Store launch price remains an
   owner decision, so the site correctly shows no numeric price.
2. **CSV import versioning**: the spec's roadmap lists CSV import for v1.1, but
   `CSVImportView.swift` ships in the v1.0 codebase and `metadata.md` promotes
   CSV import. → Site copy is version-neutral ("CSV import accepts official
   versioned Fillo templates"). Spec should be updated to match the shipped app.
3. **"Forecasts" wording**: metadata uses "forecasts"; the site consistently
   says "estimates"/"estimated" to honor the spec's honesty rule about labeled
   estimates. Intentional, not an error.
4. **Minimum OS**: the app and support page now consistently require iOS 18.0.

## 5. Verification results

- `tools/verify.js`: **24/24 checks pass** — no console/page errors, no
  horizontal overflow at 320/375/430/768/1024/1440, no broken internal links or
  fragment targets, single h1 per page, skip link first tab stop, mobile menu
  Escape + focus return, demo tabs keyboard-operable, nav scrolled state,
  contrast ≥ 4.5:1 for all key text pairs, reduced-motion shows all content,
  no-JS renders full content (including all four demo panels).
- `html-validate`: all three pages pass with zero errors.
- Screenshots: `verification/*.png` (full-page, 3 pages × 6 widths).
- This is a fully static site — there is no build step, formatter, type
  checker, or test suite beyond the checks above.

## 6. Asset sourcing

- Site screenshots: `app-store-assets/raw-screenshots/iphone/*.png`, composited
  directly into Apple's official iPhone 17 Pro Max product bezel and converted
  to 880px WebP. App Store marketing compositions are not used.
- Social preview device shot: the same raw Cost Ahead capture in the official
  Apple hardware bezel.
- Both are regenerated by `tools/build-assets.sh`; the licensed bezel is supplied
  through `FILLO_IPHONE_BEZEL_PATH` and is not committed.
