import Booking from "@/lib/models/Booking";
import { ok, fail, withAuth } from "@/lib/api";
import { bookingUpdateSchema } from "@/lib/validation";

type P = { id: string };

export const GET = withAuth<P>("bookings", "read", async ({ params }) => {
  const doc = await Booking.findById(params.id)
    .populate("packageId", "title slug")
    .lean();
  if (!doc) return fail("Not found", 404);
  return ok(doc);
});

export const PATCH = withAuth<P>("bookings", "update", async ({ request, params }) => {
  const data = bookingUpdateSchema.parse(await request.json());
  const updated = await Booking.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return fail("Not found", 404);
  return ok(updated);
});

export const DELETE = withAuth<P>("bookings", "delete", async ({ params }) => {
  const removed = await Booking.findByIdAndDelete(params.id);
  if (!removed) return fail("Not found", 404);
  return ok({ id: params.id });
});
