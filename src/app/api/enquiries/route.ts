import Enquiry from "@/lib/models/Enquiry";
import { ok, withAuth, listParams, publicRoute } from "@/lib/api";
import { createEnquiry } from "@/lib/services/submissions";

export const GET = withAuth("enquiries", "read", async ({ request }) => {
  const { q, status, limit, skip, page, searchParams } = listParams(request);

  const filter: Record<string, unknown> = {};
  if (status && status !== "All") filter.status = status;

  const source = searchParams.get("source");
  if (source && source !== "All") filter.source = source;

  const from = searchParams.get("from");
  const to = searchParams.get("to");
  if (from || to) {
    filter.createdAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }

  if (q) {
    filter.$or = ["name", "email", "company", "message"].map((f) => ({
      [f]: { $regex: q, $options: "i" },
    }));
  }

  const [items, total] = await Promise.all([
    Enquiry.find(filter)
      .populate("packageId", "title slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Enquiry.countDocuments(filter),
  ]);

  return ok({ items, total, page, pages: Math.ceil(total / limit) || 1 });
});

/** Public: the site enquiry and contact forms post here. */
export const POST = publicRoute(async ({ request }) => {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

  const result = await createEnquiry(await request.json(), ip);
  if (result.spam) return ok({ received: true });
  return ok({ received: true, id: result.enquiry._id }, { status: 201 });
});
