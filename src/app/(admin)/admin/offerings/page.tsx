"use client";

import { Layers } from "lucide-react";
import { ResourceListPage } from "@/components/admin/ResourceListPage";
import { Select, StatusBadge } from "@/components/ui";

type Row = {
  _id: string;
  title: string;
  slug: string;
  summary?: string;
  status: string;
  blocks?: unknown[];
};

export default function OfferingsPage() {
  return (
    <ResourceListPage<Row>
      title="Offerings"
      description="Service pages such as TravelXL and Experia, composed from content blocks."
      endpoint="/api/offerings"
      basePath="/admin/offerings"
      newLabel="New offering"
      searchPlaceholder="Search offerings…"
      initialFilters={{ status: "All" }}
      draggable
      labelOf={(row) => row.title}
      emptyIcon={<Layers className="size-10" />}
      emptyTitle="No offerings yet"
      emptyMessage="Create an offering to build out the services section of the site."
      filters={(list) => (
        <Select
          value={list.filters.status}
          onChange={(e) => list.setFilter("status", e.target.value)}
          className="w-auto"
          aria-label="Filter by status"
        >
          <option value="All">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </Select>
      )}
      columns={[
        {
          key: "title",
          header: "Offering",
          render: (row) => (
            <div>
              <p className="font-medium text-admin-text-primary">{row.title}</p>
              <p className="text-xs text-admin-text-secondary">/offerings/{row.slug}</p>
            </div>
          ),
        },
        {
          key: "summary",
          header: "Summary",
          render: (row) => (
            <span className="line-clamp-1 max-w-md">{row.summary || "—"}</span>
          ),
        },
        {
          key: "blocks",
          header: "Blocks",
          render: (row) => row.blocks?.length ?? 0,
        },
        {
          key: "status",
          header: "Status",
          render: (row) => <StatusBadge status={row.status} />,
        },
      ]}
    />
  );
}
