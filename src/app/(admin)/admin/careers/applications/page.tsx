"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCog, ExternalLink, ArrowLeft } from "lucide-react";
import { api, type ListResult } from "@/lib/client";
import { useResourceList } from "@/hooks/useResourceList";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Badge,
  Button,
  EmptyState,
  PageHeader,
  Select,
  toast,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { APPLICATION_STATUSES } from "@/lib/constants";

type Row = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  status: string;
  createdAt: string;
  careerId?: { _id: string; jobTitle?: string; department?: string };
};

type Job = { _id: string; jobTitle: string };

const TONE: Record<string, "warning" | "info" | "success" | "danger"> = {
  New: "warning",
  Reviewed: "info",
  Shortlisted: "success",
  Rejected: "danger",
};

export default function ApplicationsPage() {
  const list = useResourceList<Row>("/api/applications", {
    status: "All",
    careerId: "All",
  });
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    api<ListResult<Job>>("/api/careers?limit=100")
      .then((r) => setJobs(r.items))
      .catch(() => setJobs([]));
  }, []);

  const setStatus = async (id: string, status: string) => {
    try {
      await api(`/api/applications/${id}`, { method: "PATCH", json: { status } });
      toast(`Marked as ${status}`);
      await list.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update", "error");
    }
  };

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "Candidate",
      render: (row) => (
        <div>
          <p className="font-medium text-admin-text-primary">{row.name}</p>
          <p className="text-xs text-admin-text-secondary">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Applied for",
      render: (row) => (
        <div>
          <p className="text-admin-text-primary">{row.careerId?.jobTitle ?? "—"}</p>
          <p className="text-xs">{row.careerId?.department}</p>
        </div>
      ),
    },
    {
      key: "cv",
      header: "CV",
      render: (row) =>
        row.resumeUrl ? (
          <a
            href={row.resumeUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-admin-accent hover:underline"
          >
            Open <ExternalLink className="size-3" />
          </a>
        ) : (
          "—"
        ),
    },
    {
      key: "received",
      header: "Received",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "status",
      header: "Status",
      width: "180px",
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={row.status}
            onChange={(e) => setStatus(row._id, e.target.value)}
            aria-label={`Status for ${row.name}`}
            className="text-xs h-8 py-0"
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      ),
    },
    {
      key: "badge",
      header: "",
      align: "right",
      width: "110px",
      render: (row) => <Badge tone={TONE[row.status] ?? "neutral"}>{row.status}</Badge>,
    },
  ];

  return (
    <div>
      <Link
        href="/admin/careers"
        className="inline-flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4"
      >
        <ArrowLeft className="size-4" /> Job postings
      </Link>

      <PageHeader
        title="Applications"
        description="Everyone who has applied through the careers page."
      />

      <DataTable
        rows={list.items}
        columns={columns}
        loading={list.loading}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search by name or email…"
        page={list.page}
        pages={list.pages}
        total={list.total}
        onPageChange={list.setPage}
        filters={
          <>
            <Select
              value={list.filters.status}
              onChange={(e) => list.setFilter("status", e.target.value)}
              className="w-auto"
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              {APPLICATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              value={list.filters.careerId}
              onChange={(e) => list.setFilter("careerId", e.target.value)}
              className="w-auto"
              aria-label="Filter by role"
            >
              <option value="All">All roles</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.jobTitle}
                </option>
              ))}
            </Select>
            <Button variant="secondary" onClick={list.reload}>
              Refresh
            </Button>
          </>
        }
        empty={
          <EmptyState
            icon={<UserCog className="size-10" />}
            title="No applications yet"
            message="Applications submitted through the careers page land here."
          />
        }
      />
    </div>
  );
}
