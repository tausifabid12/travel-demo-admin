"use client";

import { Briefcase } from "lucide-react";
import { ResourceListPage } from "@/components/admin/ResourceListPage";
import { Badge, Select, StatusBadge } from "@/components/ui";

type Row = {
  _id: string;
  title: string;
  slug: string;
  clientName: string;
  industry: string;
  serviceCategory: string;
  status: string;
  isFeatured: boolean;
};

export default function CaseStudiesPage() {
  return (
    <ResourceListPage<Row>
      title="Case Studies"
      description="Proof of work shown on the Work page."
      endpoint="/api/case-studies"
      basePath="/admin/case-studies"
      newLabel="New case study"
      searchPlaceholder="Search by title, client or industry…"
      initialFilters={{ status: "All" }}
      draggable
      duplicable
      labelOf={(row) => row.title}
      emptyIcon={<Briefcase className="size-10" />}
      emptyTitle="No case studies yet"
      emptyMessage="Publish your first piece of work to build credibility on the site."
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
          header: "Case study",
          render: (row) => (
            <div>
              <p className="font-medium text-admin-text-primary">{row.title}</p>
              <p className="text-xs text-admin-text-secondary">{row.clientName}</p>
            </div>
          ),
        },
        { key: "industry", header: "Industry", render: (row) => row.industry },
        {
          key: "service",
          header: "Service",
          render: (row) => <Badge>{row.serviceCategory}</Badge>,
        },
        {
          key: "status",
          header: "Status",
          render: (row) => (
            <div className="flex items-center gap-2">
              <StatusBadge status={row.status} />
              {row.isFeatured && <Badge tone="info">Featured</Badge>}
            </div>
          ),
        },
      ]}
    />
  );
}
