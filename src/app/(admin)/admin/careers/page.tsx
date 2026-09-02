"use client";

import Link from "next/link";
import { Users, Inbox } from "lucide-react";
import { ResourceListPage } from "@/components/admin/ResourceListPage";
import { Badge, Button, Select, StatusBadge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type Row = {
  _id: string;
  jobTitle: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  status: string;
  applicationDeadline?: string;
};

export default function CareersPage() {
  return (
    <div>
      <div className="flex justify-end mb-2">
        <Link href="/admin/careers/applications">
          <Button variant="secondary" size="sm">
            <Inbox className="size-4" /> Applications inbox
          </Button>
        </Link>
      </div>

      <ResourceListPage<Row>
        title="Careers"
        description="Open roles shown on the careers page."
        endpoint="/api/careers"
        basePath="/admin/careers"
        newLabel="Post a job"
        searchPlaceholder="Search roles…"
        initialFilters={{ status: "All" }}
        labelOf={(row) => row.jobTitle}
        emptyIcon={<Users className="size-10" />}
        emptyTitle="No open roles"
        emptyMessage="Post your first job to start receiving applications."
        filters={(list) => (
          <Select
            value={list.filters.status}
            onChange={(e) => list.setFilter("status", e.target.value)}
            className="w-auto"
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
          </Select>
        )}
        columns={[
          {
            key: "title",
            header: "Role",
            render: (row) => (
              <div>
                <p className="font-medium text-admin-text-primary">{row.jobTitle}</p>
                <p className="text-xs text-admin-text-secondary">{row.department}</p>
              </div>
            ),
          },
          { key: "location", header: "Location", render: (row) => row.location },
          { key: "type", header: "Type", render: (row) => <Badge>{row.type}</Badge> },
          {
            key: "deadline",
            header: "Deadline",
            render: (row) => formatDate(row.applicationDeadline),
          },
          {
            key: "status",
            header: "Status",
            render: (row) => <StatusBadge status={row.status} />,
          },
        ]}
      />
    </div>
  );
}
