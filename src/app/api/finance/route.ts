import Purchase from "@/lib/models/Purchase";
import { ok, withAuth, listParams } from "@/lib/api";

export const GET = withAuth("finance", "read", async ({ request }) => {
  const { status, limit, skip, page } = listParams(request);

  const filter: Record<string, unknown> = {};
  if (status && status !== "All") filter.status = status;

  const [items, total, revenue] = await Promise.all([
    Purchase.find(filter)
      .populate("packageId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Purchase.countDocuments(filter),
    Purchase.aggregate([
      { $match: { status: "Completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]).then((r) => r[0]?.total ?? 0),
  ]);

  return ok({ items, total, page, pages: Math.ceil(total / limit) || 1, revenue });
});
