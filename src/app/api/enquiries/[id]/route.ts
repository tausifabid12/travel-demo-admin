import Enquiry from "@/lib/models/Enquiry";
import { ok, fail, withAuth } from "@/lib/api";
import { enquiryStatusSchema } from "@/lib/validation";

type P = { id: string };

export const GET = withAuth<P>("enquiries", "read", async ({ params }) => {
  const doc = await Enquiry.findById(params.id)
    .populate("packageId", "title slug")
    .lean();
  if (!doc) return fail("Not found", 404);
  return ok(doc);
});

export const PATCH = withAuth<P>("enquiries", "update", async ({ request, params }) => {
  const data = enquiryStatusSchema.parse(await request.json());
  const updated = await Enquiry.findByIdAndUpdate(params.id, data, { new: true });
  if (!updated) return fail("Not found", 404);
  return ok(updated);
});

export const DELETE = withAuth<P>("enquiries", "delete", async ({ params }) => {
  const removed = await Enquiry.findByIdAndDelete(params.id);
  if (!removed) return fail("Not found", 404);
  return ok({ id: params.id });
});
