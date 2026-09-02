/**
 * Captures desktop and mobile screenshots of the public site so the design can
 * be reviewed without a browser open.
 *   node scripts/shots.mjs [outDir]
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE = process.env.SHOT_BASE ?? "http://localhost:3100";
const OUT = process.argv[2] ?? "screenshots";

const PAGES = [
  { name: "home", path: "/" },
  { name: "listing", path: "/travelxl" },
  { name: "destinations", path: "/destinations" },
  { name: "deals", path: "/deals" },
  { name: "booking", path: null, discover: /href="(\/book\/[a-z0-9-]+)"/ },
  { name: "package", path: null, discover: /href="(\/travelxl\/[a-z0-9-]+)"/ },
  { name: "work", path: "/work" },
  { name: "case-study", path: null, discover: /href="(\/work\/[a-z0-9-]+)"/ },
  { name: "about", path: "/about" },
  { name: "offerings", path: "/offerings" },
  { name: "experia", path: "/experia" },
  { name: "insights", path: "/insights" },
  { name: "careers", path: "/careers" },
  { name: "contact", path: "/contact" },
];

const VIEWPORTS = [
  { label: "desktop", width: 1440, height: 900, isMobile: false },
  { label: "mobile", width: 390, height: 844, isMobile: true },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();

  // Resolve the detail-page slugs from the listings.
  const probe = await browser.newPage();
  for (const page of PAGES) {
    if (!page.discover) continue;
    const source =
      page.name === "package" || page.name === "booking" ? "/travelxl" : "/work";
    // The booking link only exists on a package detail page.
    if (page.name === "booking") {
      await probe.goto(`${BASE}/travelxl`, { waitUntil: "load" });
      const detail = (await probe.content()).match(
        /href="(\/travelxl\/[a-z0-9-]+)"/,
      )?.[1];
      if (detail) await probe.goto(`${BASE}${detail}`, { waitUntil: "load" });
      page.path = (await probe.content()).match(page.discover)?.[1] ?? "/travelxl";
      continue;
    }
    await probe.goto(`${BASE}${source}`, { waitUntil: "load" });
    const html = await probe.content();
    page.path = html.match(page.discover)?.[1] ?? source;
  }
  await probe.close();

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 2,
      isMobile: viewport.isMobile,
      hasTouch: viewport.isMobile,
      // Scroll reveals are view-timeline driven, so a full-page capture would
      // otherwise freeze off-screen sections mid-fade.
      reducedMotion: "reduce",
    });
    // Pre-accept cookies so the banner does not sit over the page in captures.
    await context.addInitScript(() => {
      window.localStorage.setItem(
        "bhancer-cookie-consent",
        JSON.stringify({ necessary: true, analytics: false, marketing: false }),
      );
    });

    const page = await context.newPage();
    page.setDefaultTimeout(90_000);
    page.setDefaultNavigationTimeout(90_000);

    for (const target of PAGES) {
      await page.goto(`${BASE}${target.path}`, { waitUntil: "load" });
      // Scroll through so lazy images request and reveals fire.
      await page.evaluate(async () => {
        const step = window.innerHeight / 2;
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 150));
        }
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 300));
      });

      // Then wait for every image to actually decode before capturing.
      await page.evaluate(async () => {
        await Promise.all(
          [...document.images].map((img) =>
            img.complete
              ? Promise.resolve()
              : new Promise((resolve) => {
                  img.addEventListener("load", resolve, { once: true });
                  img.addEventListener("error", resolve, { once: true });
                }),
          ),
        );
        await document.fonts.ready;
      });
      await page.waitForTimeout(500);

      const file = path.join(OUT, `${target.name}-${viewport.label}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log(`  ${file}`);
    }

    await context.close();
  }

  await browser.close();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
