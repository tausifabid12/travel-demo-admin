/**
 * Public-site smoke test: every route renders, drafts stay hidden, filters
 * work, SEO endpoints resolve, and the mobile app shell is present.
 *   node scripts/smoke-site.mjs
 */
const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";

let passed = 0;
let failed = 0;

function check(label, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label} ${detail}`);
  }
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const body = res.status < 400 ? await res.text() : "";
  return { status: res.status, body, headers: res.headers };
}

async function main() {
  console.log(`Public site smoke test against ${BASE}\n`);

  console.log("Core routes");
  const routes = [
    "/",
    "/about",
    "/offerings",
    "/travelxl",
    "/destinations",
    "/deals",
    "/experia",
    "/work",
    "/insights",
    "/careers",
    "/contact",
    "/privacy",
    "/terms",
    "/cookies",
  ];

  for (const route of routes) {
    const { status, body } = await get(route);
    check(
      `${route} renders`,
      status === 200 && body.includes('data-shell="site"'),
      `status ${status}`,
    );
  }

  console.log("\nMobile app shell");
  const home = await get("/");
  check(
    "bottom tab bar is present",
    home.body.includes('aria-label="Mobile navigation"'),
  );
  check(
    "tab bar clears the iOS home indicator",
    home.body.includes("env(safe-area-inset-bottom)"),
  );
  check(
    "footer renders its mobile variant",
    home.body.includes("Start an enquiry"),
  );

  console.log("\nDetail pages");
  const travelxl = await get("/travelxl");
  const slugMatch = [...travelxl.body.matchAll(/href="\/travelxl\/([a-z0-9-]+)"/g)];
  const pkgSlug = slugMatch[0]?.[1];
  check("travelxl links to package pages", Boolean(pkgSlug), "no slug found");

  if (pkgSlug) {
    const pkg = await get(`/travelxl/${pkgSlug}`);
    check(`/travelxl/${pkgSlug} renders`, pkg.status === 200, String(pkg.status));
    check(
      "package page carries TouristTrip structured data",
      pkg.body.includes('"@type":"TouristTrip"'),
    );
    check(
      "package page has an enquiry form",
      pkg.body.includes('id="enquire"'),
    );
    check(
      "package page has the sticky mobile action bar",
      pkg.body.includes("Enquire about"),
    );
  }

  const work = await get("/work");
  const caseSlug = [...work.body.matchAll(/href="\/work\/([a-z0-9-]+)"/g)][0]?.[1];
  if (caseSlug) {
    const study = await get(`/work/${caseSlug}`);
    check(`/work/${caseSlug} renders`, study.status === 200, String(study.status));
  }

  const insights = await get("/insights");
  const insightSlug = [
    ...insights.body.matchAll(/href="\/insights\/([a-z0-9-]+)"/g),
  ][0]?.[1];
  if (insightSlug) {
    const article = await get(`/insights/${insightSlug}`);
    check(`/insights/${insightSlug} renders`, article.status === 200);
    check(
      "article carries Article structured data",
      article.body.includes('"@type":"Article"'),
    );
  }

  const careers = await get("/careers");
  const roleSlug = [...careers.body.matchAll(/href="\/careers\/([a-z0-9-]+)"/g)][0]?.[1];
  if (roleSlug) {
    const role = await get(`/careers/${roleSlug}`);
    check(`/careers/${roleSlug} renders`, role.status === 200);
    check(
      "role carries JobPosting structured data",
      role.body.includes('"@type":"JobPosting"'),
    );
    check("role has an application form", role.body.includes('id="apply"'));
  }

  console.log("\nDrafts and scheduling stay hidden");
  check(
    "draft package is absent from the listing",
    !travelxl.body.includes("Bangkok Conference Programme"),
  );
  const scheduled = await get("/insights/a-scheduled-post");
  check(
    "future-dated article 404s",
    scheduled.status === 404,
    `status ${scheduled.status}`,
  );
  check(
    "future-dated article is absent from the listing",
    !insights.body.includes("A scheduled post"),
  );

  console.log("\nFilters");
  const filtered = await get("/travelxl?category=Incentive");
  check("category filter renders", filtered.status === 200);
  check(
    "category filter narrows the results",
    filtered.body.includes("Singapore Incentive Programme") &&
      !filtered.body.includes("Bali Executive Retreat"),
  );
  const destinationPage = await get("/destinations/bali");
  check("a destination page renders", destinationPage.status === 200);
  const region = await get("/work?service=MICE");
  check("work service filter renders", region.status === 200);

  console.log("\nSEO");
  const sitemap = await get("/sitemap.xml");
  check("sitemap.xml resolves", sitemap.status === 200, String(sitemap.status));
  check(
    "sitemap lists package pages",
    sitemap.body.includes("/travelxl/"),
  );
  const robots = await get("/robots.txt");
  check("robots.txt resolves", robots.status === 200, String(robots.status));
  check("robots disallows /admin", robots.body.includes("/admin"));
  check(
    "homepage carries Organization structured data",
    home.body.includes('"@type":"Organization"'),
  );
  check(
    "homepage sets a canonical-capable metadata base",
    home.body.includes("og:title") || home.body.includes('property="og:title"'),
  );

  console.log("\nNot found");
  const missing = await get("/travelxl/definitely-not-a-real-package");
  check("unknown package 404s", missing.status === 404, String(missing.status));

  console.log("\nAnalytics gating");
  check(
    "no analytics script before consent",
    !home.body.includes("googletagmanager.com/gtag/js"),
  );

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
