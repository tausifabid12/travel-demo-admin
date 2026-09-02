/**
 * End-to-end smoke test against a running dev server.
 * Logs in with the seeded SuperAdmin, then exercises the CRUD surface.
 *   node scripts/smoke.mjs
 */
const BASE = process.env.SMOKE_BASE ?? "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@bhancer.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "ChangeMe123!";

const jar = new Map();
let passed = 0;
let failed = 0;

function cookieHeader() {
  return [...jar.entries()].map(([k, v]) => `${k}=${v}`).join("; ");
}

function absorb(res) {
  for (const raw of res.headers.getSetCookie?.() ?? []) {
    const [pair] = raw.split(";");
    const idx = pair.indexOf("=");
    jar.set(pair.slice(0, idx), pair.slice(idx + 1));
  }
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      cookie: cookieHeader(),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  absorb(res);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json };
}

function check(label, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`  PASS  ${label}`);
  } else {
    failed += 1;
    console.log(`  FAIL  ${label} ${detail}`);
  }
}

async function login() {
  const csrfRes = await req("GET", "/api/auth/csrf");
  const csrfToken = csrfRes.json.csrfToken;

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

  const session = await req("GET", "/api/auth/session");
  return session.json?.user;
}

async function main() {
  console.log(`Smoke test against ${BASE}\n`);

  console.log("Auth");
  const user = await login();
  check("logs in with seeded credentials", Boolean(user?.email), JSON.stringify(user));
  check("session carries the SuperAdmin role", user?.role === "SuperAdmin", user?.role);

  console.log("\nSettings secrecy");
  const settings = await req("GET", "/api/settings");
  check("authenticated read succeeds", settings.status === 200);
  check(
    "salt key is never returned",
    settings.json?.data?.phonePeSaltKey === undefined,
    JSON.stringify(settings.json?.data?.phonePeSaltKey),
  );

  console.log("\nPackages CRUD");
  const dests = await req("GET", "/api/destinations");
  const destId = dests.json?.data?.items?.[0]?._id;
  check("destinations list returns items", Boolean(destId));

  const created = await req("POST", "/api/packages", {
    title: "Smoke Test Package",
    destinationId: destId,
    category: "MICE",
    highlights: ["One", "Two"],
    itinerary: [{ day: 1, title: "Arrive", description: "Transfers" }],
    inclusions: ["Hotel"],
    exclusions: ["Flights"],
    status: "published",
  });
  const pkgId = created.json?.data?._id;
  check("creates a package", created.status === 201, JSON.stringify(created.json));
  check("auto-generates a slug", created.json?.data?.slug === "smoke-test-package");
  check("persists the itinerary", created.json?.data?.itinerary?.length === 1);

  const updated = await req("PUT", `/api/packages/${pkgId}`, {
    title: "Smoke Test Package Updated",
    destinationId: destId,
    category: "Offsite",
    highlights: ["One", "Two", "Three"],
    itinerary: [
      { day: 1, title: "Arrive", description: "Transfers" },
      { day: 2, title: "Sessions", description: "Full day" },
    ],
    inclusions: ["Hotel", "Meals"],
    exclusions: ["Flights"],
    status: "published",
    seo: { metaTitle: "Smoke SEO" },
  });
  check("updates a package", updated.status === 200, JSON.stringify(updated.json));
  check("update persists highlights", updated.json?.data?.highlights?.length === 3);
  check("update persists SEO", updated.json?.data?.seo?.metaTitle === "Smoke SEO");

  const reread = await req("GET", `/api/packages/${pkgId}`);
  check("re-read shows the update", reread.json?.data?.title === "Smoke Test Package Updated");

  const dup = await req("POST", `/api/packages/${pkgId}/duplicate`);
  const dupId = dup.json?.data?._id;
  check("duplicates a package", dup.status === 201, JSON.stringify(dup.json));
  check("clone gets a distinct slug", dup.json?.data?.slug !== reread.json?.data?.slug);
  check("clone reverts to draft", dup.json?.data?.status === "draft");

  const reorder = await req("PATCH", "/api/packages/reorder", { ids: [dupId, pkgId] });
  check("reorders packages", reorder.status === 200, JSON.stringify(reorder.json));
  const afterOrder = await req("GET", `/api/packages/${pkgId}`);
  check("order persisted", afterOrder.json?.data?.order === 1, String(afterOrder.json?.data?.order));

  console.log("\nValidation");
  const bad = await req("POST", "/api/packages", { title: "x" });
  check("rejects invalid payloads with 422", bad.status === 422, String(bad.status));
  check("returns field errors", Boolean(bad.json?.details), JSON.stringify(bad.json));

  console.log("\nPublic submission");
  const enquiry = await fetch(`${BASE}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Smoke Tester",
      email: "smoke@example.com",
      message: "This is a smoke test enquiry with enough characters.",
      source: "TravelXL Package",
      packageId: pkgId,
      groupSize: "40",
    }),
  });
  check("accepts an anonymous enquiry", enquiry.status === 201, String(enquiry.status));

  const spam = await fetch(`${BASE}/api/enquiries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Bot",
      email: "bot@example.com",
      message: "Buy cheap things right now please.",
      website: "http://spam.example",
    }),
  });
  const spamBody = await spam.json();
  check("honeypot silently swallows spam", spam.status === 200 && !spamBody.data?.id);

  const inbox = await req("GET", "/api/enquiries?q=Smoke Tester");
  check("enquiry reaches the inbox", inbox.json?.data?.items?.length >= 1);
  const enquiryId = inbox.json?.data?.items?.[0]?._id;

  const statusUpdate = await req("PATCH", `/api/enquiries/${enquiryId}`, {
    status: "Converted",
  });
  check("updates enquiry status", statusUpdate.json?.data?.status === "Converted");

  const csv = await fetch(`${BASE}/api/enquiries/export`, {
    headers: { cookie: cookieHeader() },
  });
  const csvText = await csv.text();
  check("CSV export returns a file", csv.status === 200 && csvText.includes("Smoke Tester"));
  check(
    "CSV is sent as an attachment",
    (csv.headers.get("content-disposition") ?? "").includes("attachment"),
  );

  console.log("\nJob applications");
  const careers = await req("GET", "/api/careers");
  const careerId = careers.json?.data?.items?.[0]?._id;
  check("careers list returns items", Boolean(careerId));

  const application = await fetch(`${BASE}/api/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      careerId,
      name: "Smoke Candidate",
      email: "candidate@example.com",
      resumeUrl: "https://example.com/cv.pdf",
    }),
  });
  check("accepts an application", application.status === 201, String(application.status));

  const apps = await req("GET", "/api/applications");
  const appId = apps.json?.data?.items?.[0]?._id;
  check("application reaches the inbox", Boolean(appId));

  const shortlist = await req("PATCH", `/api/applications/${appId}`, {
    status: "Shortlisted",
  });
  check("shortlists an applicant", shortlist.json?.data?.status === "Shortlisted");

  console.log("\nRole enforcement");
  const salesUser = await req("POST", "/api/users", {
    name: "Smoke Sales",
    email: `smoke-sales-${Date.now()}@example.com`,
    password: "SmokeTest123!",
    role: "Sales",
    isActive: true,
  });
  check("creates a scoped user", salesUser.status === 201, JSON.stringify(salesUser.json));
  check("never returns the password hash", salesUser.json?.data?.password === undefined);

  const salesEmail = salesUser.json?.data?.email;
  jar.clear();
  const csrf = await req("GET", "/api/auth/csrf");
  const salesLogin = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      cookie: cookieHeader(),
    },
    body: new URLSearchParams({
      csrfToken: csrf.json.csrfToken,
      email: salesEmail,
      password: "SmokeTest123!",
      callbackUrl: `${BASE}/admin`,
      json: "true",
    }),
    redirect: "manual",
  });
  absorb(salesLogin);

  const salesSession = await req("GET", "/api/auth/session");
  check("sales user can log in", salesSession.json?.user?.role === "Sales");

  const salesEnquiries = await req("GET", "/api/enquiries");
  check("sales may read enquiries", salesEnquiries.status === 200);

  const salesWrite = await req("POST", "/api/packages", {
    title: "Sales should not create this",
    destinationId: destId,
    category: "MICE",
  });
  check("sales is forbidden from creating packages", salesWrite.status === 403, String(salesWrite.status));

  const salesUsers = await req("GET", "/api/users");
  check("sales is forbidden from user management", salesUsers.status === 403, String(salesUsers.status));

  console.log("\nCleanup");
  jar.clear();
  await login();
  const delDup = await req("DELETE", `/api/packages/${dupId}`);
  const delPkg = await req("DELETE", `/api/packages/${pkgId}`);
  check("deletes packages", delDup.status === 200 && delPkg.status === 200);
  const gone = await req("GET", `/api/packages/${pkgId}`);
  check("deleted package is gone", gone.status === 404, String(gone.status));

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
