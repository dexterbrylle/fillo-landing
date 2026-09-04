#!/bin/sh
# Regenerate the optimized web assets for the Fillo landing site.
# Sources of truth:
#   ../fillo/app-store-assets/screenshots/iphone-6.9-1290x2796/*.png  (composed App Store frames)
#   ../fillo/app-store-assets/raw-screenshots/iphone/*.png            (chrome-free captures, used for the OG image)
#   ../fillo/app-store-assets/logo/fillo-app-icon-light-1024.png
set -eu
cd "$(dirname "$0")/.."

SRC=../fillo/app-store-assets/screenshots/iphone-6.9-1290x2796
RAW=../fillo/app-store-assets/raw-screenshots/iphone
ICON=../fillo/app-store-assets/logo/fillo-app-icon-light-1024.png

require() { command -v "$1" >/dev/null || { echo "missing dependency: $1"; exit 1; }; }
require cwebp
require sips

mkdir -p assets/img/screenshots assets/img/hero

# 1. Screenshots → WebP, 880px wide (2x for a ~440px display width), q82
MAPPING="
01-dashboard-know-every-car-cost dashboard
02-cost-ahead-see-whats-next cost-ahead
03-fuel-log-in-seconds fuel-form
04-reminders-next-service reminders
05-glovebox-documents glovebox
06-vehicle-passport vehicle-passport
07-private-offline-garage privacy-backup
"
echo "$MAPPING" | while read -r src dst; do
  [ -z "$dst" ] && continue
  cwebp -quiet -resize 880 0 -q 82 "$SRC/$src.png" -o "assets/img/screenshots/$dst.webp"
done

# 1b. Chrome-free capture for the social preview image
cwebp -quiet -resize 600 0 -q 82 "$RAW/02-cost-ahead.png" -o "assets/img/og-shot.webp"

# 1c. Hero LCP variants. The hero renders at min(340px, 82vw): 440w covers
#     1x displays, 660w covers 2x phones, 880w stays the 3x ceiling.
cwebp -quiet -resize 440 0 -q 82 "$SRC/01-dashboard-know-every-car-cost.png" -o "assets/img/screenshots/dashboard-440.webp"
cwebp -quiet -resize 660 0 -q 82 "$SRC/01-dashboard-know-every-car-cost.png" -o "assets/img/screenshots/dashboard-660.webp"

# 2. App icon + favicon set
cp "$ICON" assets/img/app-icon.png
sips -z 180 180 assets/img/app-icon.png --out assets/img/apple-touch-icon.png >/dev/null
sips -z 48 48  assets/img/app-icon.png --out assets/img/icon-48.png  >/dev/null
sips -z 32 32  assets/img/app-icon.png --out assets/img/icon-32.png  >/dev/null
sips -z 16 16  assets/img/app-icon.png --out assets/img/icon-16.png  >/dev/null

# 3. Social preview image (needs playwright in tools/)
(cd tools && node -e "
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  await p.goto('file://' + process.cwd() + '/og.html');
  await p.waitForTimeout(600);
  await p.screenshot({ path: '../assets/img/og-image.png' });
  await b.close();
  console.log('og-image.png written');
})();")

echo "Assets regenerated."
