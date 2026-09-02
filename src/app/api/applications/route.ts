import JobApplication from "@/lib/models/JobApplication";
import { ok, withAuth, listParams, publicRoute } from "@/lib/api";
import { createApplication } from "@/lib/services/submissions";

export const GET = withAuth("applications", "read", async ({ request }) => {
  const { q, status, limit, skip, page, searchParams } = listParams(request);

  const filter: Record<string, unknown> = {};
  if (status && status !== "All") filter.status = status;

  const careerId = searchParams.get("careerId");
  if (careerId) filter.careerId = careerId;

  if (q) {
    filter.$or = ["name", "email"].map((f) => ({
      [f]: { $regex: q, $options: "i" },
    }));
  }

  const [items, total] = await Promise.all([
    JobApplication.find(filter)
      .populate("careerId", "jobTitle department location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    JobApplication.countDocuments(filter),
  ]);

  return ok({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

/** Public: the job application form posts here. */
export const POST = publicRoute(async ({ request }) => {
  const result = await createApplication(await request.json());
  if (result.spam) return ok({ received: true });
  return ok({ received: true, id: result.application._id }, { status: 201 });
});
