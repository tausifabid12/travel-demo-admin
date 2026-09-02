"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plane, Plus, Copy, Trash2, Pencil } from "lucide-react";
import { useResourceList } from "@/hooks/useResourceList";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Select,
  StatusBadge,
} from "@/components/ui";
import { PACKAGE_CATEGORIES } from "@/lib/constants";

type PackageRow = {
  _id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  isFeatured: boolean;
  destinationId?: { name?: string; region?: string };
};

export default function PackagesPage() {
  const router = useRouter();
  const list = useResourceList<PackageRow>("/api/packages", {
    status: "All",
    category: "All",
  });
  const [pendingDelete, setPendingDelete] = useState<PackageRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const columns: Column<PackageRow>[] = [
    {
      key: "title",
      header: "Package",
      render: (row) => (
        <div>
          <p className="font-medium text-admin-text-primary">{row.title}</p>
          <p className="text-xs text-admin-text-secondary">/travelxl/{row.slug}</p>
        </div>
      ),
    },
    {
      key: "destination",
      header: "Destination",
      render: (row) => row.destinationId?.name ?? "—",
    },
    {
      key: "category",
      header: "Category",
      render: (row) => <Badge>{row.category}</Badge>,
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
    {
      key: "actions",
      header: "",
      align: "right",
      width: "160px",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${row.title}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/packages/${row._id}`);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Duplicate ${row.title}`}
            onClick={(e) => {
              e.stopPropagation();
              list.duplicate(row._id);
            }}
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${row.title}`}
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(row);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="TravelXL Packages"
        description="Corporate travel experiences shown on the public site. Drag to change the order they appear in."
        actions={
          <Link href="/admin/packages/new">
            <Button>
              <Plus className="size-4" /> New package
            </Button>
          </Link>
        }
      />

      <DataTable
        rows={list.items}
        columns={columns}
        loading={list.loading}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search packages…"
        draggable
        onReorder={list.reorder}
        onRowClick={(row) => router.push(`/admin/packages/${row._id}`)}
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
              {PACKAGE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </>
        }
        empty={
          <EmptyState
            icon={<Plane className="size-10" />}
            title="No packages yet"
            message="Create your first corporate travel experience to show it on the site."
            action={
              <Link href="/admin/packages/new">
                <Button>
                  <Plus className="size-4" /> Create a package
                </Button>
              </Link>
            }
          />
        }
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        loading={deleting}
        title="Delete this package?"
        message={`"${pendingDelete?.title}" will be removed from the site permanently. This cannot be undone.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          await list.remove(pendingDelete._id, "Package");
          setDeleting(false);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
