import JobApplication from "@/lib/models/JobApplication";
import { ok, fail, withAuth } from "@/lib/api";
import { applicationUpdateSchema } from "@/lib/validation";

type P = { id: string };

export const GET = withAuth<P>("applications", "read", async ({ params }) => {
  const doc = await JobApplication.findById(params.id)
    .populate("careerId", "jobTitle department location")
    .lean();
  if (!doc) return fail("Not found", 404);
  return ok(doc);
});

export const PATCH = withAuth<P>("applications", "update", async ({ request, params }) => {
  const data = applicationUpdateSchema.parse(await request.json());
  const updated = await JobApplication.findByIdAndUpdate(params.id, data, {
    new: true,
  });
  if (!updated) return fail("Not found", 404);
  return ok(updated);
});

export const DELETE = withAuth<P>("applications", "delete", async ({ params }) => {
  const removed = await JobApplication.findByIdAndDelete(params.id);
  if (!removed) return fail("Not found", 404);
  return ok({ id: params.id });
});
