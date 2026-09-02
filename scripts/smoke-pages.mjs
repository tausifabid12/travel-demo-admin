/**
 * Checks that every admin page renders for a signed-in SuperAdmin, and that
 * signed-out visitors are redirected to the login screen.
 *   node scripts/smoke-pages.mjs
 */
const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@bhancer.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

const jar = new Map();
let passed = 0;
let failed = 0;

const cookieHeader = () =>
  [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");

function absorb(res) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(";");
    const idx = pair.indexOf("=");
    jar.set(pair.slice(0, idx), pair.slice(idx + 1));
  }
}

function check(label, ok, detail = "") {
  if (ok) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label} ${detail}`);
  }
}

async function login() {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`, {
    headers: { cookie: cookieHeader() },
  });
  absorb(csrfRes);
  const { csrfToken } = await csrfRes.json();

  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      cookie: cookieHeader(),
    },
    body: new URLSearchParams({
      csrfToken,
      email: EMAIL,
      password: PASSWORD,
      callbackUrl: `${BASE}/admin`,
      json: "true",
    }),
    redirect: "manual",
  });
  absorb(res);
}

const PAGES = [
  "/admin",
  "/admin/packages",
  "/admin/packages/new",
  "/admin/destinations",
  "/admin/destinations/new",
  "/admin/offerings",
  "/admin/offerings/new",
  "/admin/case-studies",
  "/admin/case-studies/new",
  "/admin/insights",
  "/admin/insights/new",
  "/admin/media",
  "/admin/bookings",
  "/admin/enquiries",
  "/admin/careers",
  "/admin/careers/new",
  "/admin/careers/applications",
  "/admin/reports",
  "/admin/finance",
  "/admin/users",
  "/admin/settings",
];

async function main() {
  console.log(`Page smoke test against ${BASE}\n`);

  console.log("Signed out");
  const guarded = await fetch(`${BASE}/admin/packages`, { redirect: "manual" });
  check(
    "admin redirects anonymous visitors to login",
    guarded.status === 307 || guarded.status === 302,
    `got ${guarded.status}`,
  );
  check(
    "redirect target is the login page",
    (guarded.headers.get("location") ?? "").includes("/admin/login"),
    guarded.headers.get("location") ?? "",
  );

  const loginPage = await fetch(`${BASE}/admin/login`);
  check("login page renders", loginPage.status === 200, String(loginPage.status));

  console.log("\nSigned in");
  await login();

  for (const path of PAGES) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { cookie: cookieHeader() },
      redirect: "manual",
    });
    const html = res.status === 200 ? await res.text() : "";
    // The admin shell only renders when the layout and the page both succeed.
    const rendered = html.includes('data-shell="admin"');
    check(`${path} renders`, res.status === 200 && rendered, `status ${res.status}`);
  }

  // Detail routes need a real id.
  const pkgRes = await fetch(`${BASE}/api/packages?limit=1`, {
    headers: { cookie: cookieHeader() },
  });
  const pkg = (await pkgRes.json()).data?.items?.[0];
  if (pkg) {
    const res = await fetch(`${BASE}/admin/packages/${pkg._id}`, {
      headers: { cookie: cookieHeader() },
      redirect: "manual",
    });
    check("/admin/packages/[id] renders", res.status === 200, String(res.status));
  }

  console.log("\nPublic endpoints stay reachable");
  const sitemap = await fetch(`${BASE}/sitemap.xml`);
  check("sitemap.xml resolves", sitemap.status === 200, String(sitemap.status));
  const robots = await fetch(`${BASE}/robots.txt`);
  check("robots.txt resolves", robots.status === 200, String(robots.status));

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
