import Booking from "@/lib/models/Booking";
import { ok, withAuth, listParams, publicRoute } from "@/lib/api";
import { createBooking } from "@/lib/services/bookings";

export const GET = withAuth("bookings", "read", async ({ request }) => {
  const { q, status, limit, skip, page } = listParams(request);

  const filter: Record<string, unknown> = {};
  if (status && status !== "All") filter.status = status;
  if (q) {
    filter.$or = ["reference", "leadName", "email", "packageTitle"].map((f) => ({
      [f]: { $regex: q, $options: "i" },
    }));
  }

  const [items, total] = await Promise.all([
    Booking.find(filter)
      .populate("packageId", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Booking.countDocuments(filter),
  ]);

  return ok({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

/** Public: the booking request form posts here. */
export const POST = publicRoute(async ({ request }) => {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  const result = await createBooking(await request.json(), ip);
  if (result.spam) return ok({ received: true });

  return ok(
    { received: true, reference: result.booking.reference },
    { status: 201 },
  );
});
