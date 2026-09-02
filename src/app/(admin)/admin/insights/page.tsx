"use client";

import { FileText, CalendarClock } from "lucide-react";
import { ResourceListPage } from "@/components/admin/ResourceListPage";
import { Badge, Select, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { INSIGHT_CATEGORIES } from "@/lib/constants";
import { useNow } from "@/hooks/client";

type Row = {
  _id: string;
  title: string;
  slug: string;
  author: string;
  category: string;
  status: string;
  publishDate?: string;
};

export default function InsightsPage() {
  const now = useNow();

  return (
    <ResourceListPage<Row>
      title="Insights"
      description="Articles and thought leadership. Future-dated posts stay hidden until their publish date."
      endpoint="/api/insights"
      basePath="/admin/insights"
      newLabel="New article"
      searchPlaceholder="Search articles…"
      initialFilters={{ status: "All", category: "All" }}
      labelOf={(row) => row.title}
      emptyIcon={<FileText className="size-10" />}
      emptyTitle="No articles yet"
      emptyMessage="Write your first insight to start building the Insights section."
      filters={(list) => (
        <>
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
          <Select
            value={list.filters.category}
            onChange={(e) => list.setFilter("category", e.target.value)}
            className="w-auto"
            aria-label="Filter by category"
          >
            <option value="All">All categories</option>
            {INSIGHT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </>
      )}
      columns={[
        {
          key: "title",
          header: "Article",
          render: (row) => (
            <div>
              <p className="font-medium text-admin-text-primary">{row.title}</p>
              <p className="text-xs text-admin-text-secondary">/insights/{row.slug}</p>
            </div>
          ),
        },
        { key: "author", header: "Author", render: (row) => row.author },
        {
          key: "category",
          header: "Category",
          render: (row) => <Badge>{row.category}</Badge>,
        },
        {
          key: "status",
          header: "Status",
          render: (row) => {
            const scheduled =
              row.status === "published" &&
              row.publishDate &&
              now > 0 &&
              new Date(row.publishDate).getTime() > now;
            return (
              <div className="flex items-center gap-2">
                {scheduled ? (
                  <Badge tone="info">
                    <CalendarClock className="size-3 mr-1" /> Scheduled
                  </Badge>
                ) : (
                  <StatusBadge status={row.status} />
                )}
                <span className="text-xs">{formatDate(row.publishDate)}</span>
              </div>
            );
          },
        },
      ]}
    />
  );
}
