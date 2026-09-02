import Enquiry from "@/lib/models/Enquiry";
import { withAuth } from "@/lib/api";

const COLUMNS = [
  "createdAt",
  "name",
  "email",
  "phone",
  "company",
  "source",
  "sourcePage",
  "package",
  "groupSize",
  "preferredDates",
  "budgetRange",
  "serviceInterest",
  "status",
  "message",
] as const;

/** RFC 4180: wrap in quotes and double any embedded quote. */
function csvCell(value: unknown) {
  if (value === null || value === undefined) return "";
  const text = value instanceof Date ? value.toISOString() : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export const GET = withAuth("enquiries", "read", async ({ request }) => {
  const url = new URL(request.url);
  const filter: Record<string, unknown> = {};

  const status = url.searchParams.get("status");
  if (status && status !== "All") filter.status = status;

  const source = url.searchParams.get("source");
  if (source && source !== "All") filter.source = source;

  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (from || to) {
    filter.createdAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }

  const enquiries = await Enquiry.find(filter)
    .populate("packageId", "title")
    .sort({ createdAt: -1 })
    .lean<Record<string, unknown>[]>();

  const rows = enquiries.map((e) =>
    COLUMNS.map((col) =>
      csvCell(
        col === "package"
          ? (e.packageId as { title?: string } | undefined)?.title
          : e[col],
      ),
    ).join(","),
  );

  // BOM so Excel opens UTF-8 correctly.
  const csv = `﻿${COLUMNS.join(",")}\n${rows.join("\n")}`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bhancer-enquiries-${stamp}.csv"`,
    },
  });
});
