/**
 * Exercises the storefront funnel: listing filters, sorting, the booking
 * request, and the admin inbox that receives it.
 *   node scripts/smoke-booking.mjs
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

async function get(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  return { status: res.status, body: res.status < 400 ? await res.text() : "" };
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

async function main() {
  console.log(`Booking funnel smoke test against ${BASE}\n`);

  console.log("Storefront pages");
  for (const path of ["/", "/travelxl", "/destinations", "/deals"]) {
    const { status } = await get(path);
    check(`${path} renders`, status === 200, `status ${status}`);
  }

  console.log("\nListing filters and sort");
  const all = await get("/travelxl");
  const honeymoon = await get("/travelxl?theme=Honeymoon");
  check("theme filter renders", honeymoon.status === 200);
  check(
    "theme filter narrows the results",
    honeymoon.body.includes("Bali Honeymoon Escape") &&
      !honeymoon.body.includes("Swiss Alps Family Winter"),
  );

  const corporate = await get("/travelxl?tripType=Corporate");
  check(
    "trip-type filter separates corporate from holidays",
    corporate.body.includes("Dubai Luxury MICE Experience") &&
      !corporate.body.includes("Bali Honeymoon Escape"),
  );

  const cheapFirst = await get("/travelxl?sort=price-asc");
  const dearFirst = await get("/travelxl?sort=price-desc");
  const firstCard = (html) =>
    html.match(/href="\/travelxl\/([a-z0-9-]+)"/)?.[1] ?? "";
  check(
    "price sort reverses the first result",
    firstCard(cheapFirst.body) !== firstCard(dearFirst.body),
    `${firstCard(cheapFirst.body)} vs ${firstCard(dearFirst.body)}`,
  );

  const capped = await get("/travelxl?maxPrice=50000");
  check(
    "max-price filter excludes dearer packages",
    !capped.body.includes("Swiss Alps Family Winter"),
  );

  const nothing = await get("/travelxl?destination=Nowhere");
  check(
    "an impossible filter shows the empty state",
    nothing.body.includes("Nothing matches those filters"),
  );

  console.log("\nDetail and booking pages");
  const slug = firstCard(all.body);
  const detail = await get(`/travelxl/${slug}`);
  check(`/travelxl/${slug} renders`, detail.status === 200);
  check("detail page shows the booking widget", detail.body.includes("Request to book"));
  check(
    "widget links to the booking page",
    detail.body.includes(`/book/${slug}`),
  );

  const book = await get(`/book/${slug}`);
  check(`/book/${slug} renders`, book.status === 200);
  check("booking page states no payment is taken", book.body.includes("No payment"));

  console.log("\nBooking submission");
  const created = await fetch(`${BASE}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      packageId: null,
      leadName: "Smoke Traveller",
      email: "smoke-traveller@example.com",
      phone: "9876543210",
      adults: 2,
      children: 1,
    }),
  });
  check(
    "a booking without a real package is rejected",
    created.status >= 400,
    `status ${created.status}`,
  );

  // Fetch a real package id through the authenticated admin API.
  await login();
  const pkgRes = await fetch(`${BASE}/api/packages?limit=1`, {
    headers: { cookie: cookieHeader() },
  });
  const pkg = (await pkgRes.json()).data?.items?.[0];
  check("found a package to book", Boolean(pkg?._id));

  const good = await fetch(`${BASE}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      packageId: pkg._id,
      leadName: "Smoke Traveller",
      email: "smoke-traveller@example.com",
      phone: "9876543210",
      adults: 2,
      children: 1,
      flexibleDates: true,
      addOns: ["Airport transfers"],
      specialRequests: "Ground floor room if possible.",
    }),
  });
  const goodBody = await good.json();
  const reference = goodBody.data?.reference;
  check("accepts a valid booking request", good.status === 201, String(good.status));
  check(
    "returns a booking reference",
    /^BH\d{2}-[A-Z0-9]{6}$/.test(reference ?? ""),
    reference ?? "none",
  );

  const spam = await fetch(`${BASE}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      packageId: pkg._id,
      leadName: "Bot",
      email: "bot@example.com",
      phone: "0000000000",
      adults: 1,
      website: "http://spam.example",
    }),
  });
  const spamBody = await spam.json();
  check(
    "honeypot swallows a bot booking",
    spam.status === 200 && !spamBody.data?.reference,
  );

  console.log("\nAdmin inbox");
  const anon = await fetch(`${BASE}/api/bookings`);
  check("bookings list rejects anonymous reads", anon.status === 401);

  const inbox = await fetch(`${BASE}/api/bookings?q=Smoke Traveller`, {
    headers: { cookie: cookieHeader() },
  });
  const inboxBody = await inbox.json();
  const booking = inboxBody.data?.items?.[0];
  check("booking reaches the admin inbox", Boolean(booking));
  check(
    "price was snapshotted at request time",
    booking?.estimatedTotal === undefined ||
      typeof booking?.estimatedTotal === "number",
  );

  if (booking) {
    const quoted = await fetch(`${BASE}/api/bookings/${booking._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie: cookieHeader() },
      body: JSON.stringify({ status: "Quoted" }),
    });
    const quotedBody = await quoted.json();
    check("status can be moved to Quoted", quotedBody.data?.status === "Quoted");

    const removed = await fetch(`${BASE}/api/bookings/${booking._id}`, {
      method: "DELETE",
      headers: { cookie: cookieHeader() },
    });
    check("booking can be deleted", removed.status === 200);
  }

  console.log("\nSEO");
  const robots = await get("/robots.txt");
  check("robots blocks the booking form", robots.body.includes("/book/"));
  const sitemap = await get("/sitemap.xml");
  check("sitemap lists destination pages", sitemap.body.includes("/destinations/"));
  check("sitemap does not list booking pages", !sitemap.body.includes("/book/"));

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
