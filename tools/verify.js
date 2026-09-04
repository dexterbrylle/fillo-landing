/* Browser verification for the Fillo landing site.
   Checks: horizontal overflow, console errors, broken internal links,
   mobile menu keyboard behavior, demo tab keyboard behavior, reduced-motion,
   no-JS fallback, and heading/focus basics. Saves screenshots at all widths. */
const { chromium } = require("playwright");
const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SHOTS = path.join(ROOT, "verification");
const PORT = 8791;
const WIDTHS = [320, 375, 430, 768, 1024, 1440];
const PAGES = ["index.html", "support.html", "privacy.html"];

const MIME = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".webp": "image/webp", ".xml": "application/xml", ".txt": "text/plain" };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split("?")[0]);
      if (p === "/") p = "/index.html";
      if (!path.extname(p)) p += ".html";
      const file = path.join(ROOT, p);
      fs.readFile(file, (err, data) => {
        if (err) { res.writeHead(404); res.end("not found"); return; }
        res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

(async () => {
  fs.mkdirSync(SHOTS, { recursive: true });
  const server = await serve();
  const browser = await chromium.launch();
  const results = { errors: [], overflow: [], brokenLinks: [], checks: [] };
  const ok = (name, pass, detail) => results.checks.push({ name, pass, detail: detail || "" });

  for (const page of PAGES) {
    // JS-enabled pass
    {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
      const p = await ctx.newPage();
      const consoleErrors = [];
      p.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
      p.on("pageerror", (e) => consoleErrors.push(String(e)));
      await p.goto(`http://localhost:${PORT}/${page}`, { waitUntil: "networkidle" });

      // Broken internal links
      const links = await p.$$eval("a[href]", (as) => as.map((a) => a.getAttribute("href")));
      for (const href of new Set(links)) {
        if (/^(https?:|mailto:|#)/.test(href)) continue;
        const target = href.split("#")[0] || page;
        const status = await p.evaluate((t) => fetch(t).then((r) => r.status).catch(() => 0), target);
        if (status !== 200) results.brokenLinks.push(`${page} -> ${href} (${status})`);
      }
      // Fragment targets exist
      for (const href of new Set(links.filter((h) => h.includes("#") && !h.startsWith("mailto")))) {
        const id = href.split("#")[1];
        if (!id) continue;
        const base = href.split("#")[0];
        if (base && base !== page) continue;
        const found = await p.$(`[id="${id}"]`);
        if (!found) results.brokenLinks.push(`${page} -> missing #${id}`);
      }

      // Heading hierarchy: exactly one h1
      const h1 = await p.$$eval("h1", (h) => h.length);
      ok(`${page}: single h1`, h1 === 1, `found ${h1}`);

      await ctx.close();

      // Reduced-motion pass (desktop)
      const ctxRM = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
      const pRM = await ctxRM.newPage();
      const rmErrors = [];
      pRM.on("pageerror", (e) => rmErrors.push(String(e)));
      await pRM.goto(`http://localhost:${PORT}/${page}`, { waitUntil: "networkidle" });
      const revealHidden = await pRM.$$eval(".reveal-pre", (els) => els.filter((e) => !e.classList.contains("reveal-in")).length);
      ok(`${page}: reduced motion shows all content`, revealHidden === 0, `${revealHidden} hidden reveal els`);
      if (rmErrors.length) results.errors.push(`${page} reduced-motion: ${rmErrors.join("; ")}`);
      await ctxRM.close();

      // No-JS pass
      const ctxNJ = await browser.newContext({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
      const pNJ = await ctxNJ.newPage();
      await pNJ.goto(`http://localhost:${PORT}/${page}`, { waitUntil: "networkidle" });
      const hiddenByDefault = await pNJ.$$eval("[hidden]", (els) => els.length);
      const bodyText = (await pNJ.textContent("body")).trim().length;
      ok(`${page}: no-JS renders content`, bodyText > 500, `${bodyText} chars`);
      if (page === "index.html") {
        const panelsVisible = await pNJ.$$eval(".demo-panel", (els) => els.filter((e) => e.offsetParent !== null).length);
        ok("index: no-JS demo shows all panels", panelsVisible === 4, `${panelsVisible}/4 visible`);
      }
      await ctxNJ.close();

      if (consoleErrors.length) results.errors.push(`${page}: ${consoleErrors.join("; ")}`);
    }

    // Width sweep with screenshots (JS on)
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const p = await ctx.newPage();
      const errs = [];
      p.on("pageerror", (e) => errs.push(String(e)));
      await p.goto(`http://localhost:${PORT}/${page}`, { waitUntil: "networkidle" });
      const over = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      if (over > 0) results.overflow.push(`${page} @${width}px overflows by ${over}px`);
      await p.screenshot({ path: path.join(SHOTS, `${page.replace(".html", "")}-${width}.png`), fullPage: true });
      if (errs.length) results.errors.push(`${page}@${width}: ${errs.join("; ")}`);
      await ctx.close();
    }
  }

  // Interaction tests on index
  {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
    const p = await ctx.newPage();
    await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle" });

    // Mobile menu: toggle, Escape, focus return
    await p.click(".nav-toggle");
    ok("index: mobile menu opens", await p.$eval(".site-nav", (n) => n.classList.contains("open")));
    ok("index: aria-expanded true", (await p.getAttribute(".nav-toggle", "aria-expanded")) === "true");
    await p.keyboard.press("Escape");
    ok("index: Escape closes menu", await p.$eval(".site-nav", (n) => !n.classList.contains("open")));
    ok("index: focus returns to toggle", await p.evaluate(() => document.activeElement.classList.contains("nav-toggle")));

    // Keyboard order sanity: first Tab reaches skip link (fresh page)
    await p.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle" });
    await p.keyboard.press("Tab");
    ok("index: skip link is first tab stop", await p.evaluate(() => document.activeElement.classList.contains("skip-link")));

    // Demo tabs: roving tabindex + arrow keys
    await p.click("#tab-cost");
    await p.keyboard.press("ArrowRight");
    ok("index: ArrowRight selects Reminders tab", (await p.getAttribute("#tab-reminders", "aria-selected")) === "true");
    ok("index: Reminders panel visible", await p.$eval("#panel-reminders", (e) => !e.hidden));
    await ctx.close();

    // Desktop: nav scrolled class + tap-target sizes
    const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p2 = await ctx2.newPage();
    await p2.goto(`http://localhost:${PORT}/index.html`, { waitUntil: "networkidle" });
    await p2.evaluate(() => window.scrollTo(0, 600));
    await p2.waitForTimeout(200);
    ok("index: nav gains scrolled background", await p2.$eval(".site-nav", (n) => n.classList.contains("scrolled")));
    const smallTargets = await p2.$$eval("a[href], button", (els) =>
      els.filter((e) => e.offsetParent !== null && e.getAttribute("aria-hidden") !== "true")
        .filter((e) => {
          const r = e.getBoundingClientRect();
          // Inline text links inside paragraphs are exempt (WCAG 2.5.8);
          // we only flag standalone controls smaller than 24px.
          const inline = e.closest("p") && e.textContent.trim().length > 2 && !e.classList.contains("btn");
          if (inline) return false;
          return r.height > 0 && (r.height < 24 || r.width < 24);
        }).map((e) => e.textContent.trim().slice(0, 30))
    );
    ok("index: no tiny tap targets", smallTargets.length === 0, smallTargets.join(", "));
    await ctx2.close();
  }

  await browser.close();
  server.close();

  // Contrast quick check for key text colors on light backgrounds
  const contrastPairs = [
    ["#17241F", "#F7FBF9", "body text on mist"],
    ["#36564C", "#F7FBF9", "secondary text on mist"],
    ["#0D513F", "#F7FBF9", "primary-dark links on mist"],
    ["#FFFFFF", "#18715B", "white on primary buttons"],
    ["#C4D6CD", "#17241F", "demo lede on graphite"],
  ];
  const lum = (hex) => {
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  for (const [fg, bg, name] of contrastPairs) {
    const ratio = (Math.max(lum(fg), lum(bg)) + 0.05) / (Math.min(lum(fg), lum(bg)) + 0.05);
    ok(`contrast: ${name} ≥ 4.5`, ratio >= 4.5, ratio.toFixed(2));
  }

  console.log(JSON.stringify(results, null, 2));
  const failed = results.checks.filter((c) => !c.pass);
  console.log(`\n${results.checks.length - failed.length}/${results.checks.length} checks passed`);
  process.exit(failed.length || results.errors.length || results.overflow.length || results.brokenLinks.length ? 1 : 0);
})();
