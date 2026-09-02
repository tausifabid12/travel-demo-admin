"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe2, Plus, Trash2, Pencil, Star } from "lucide-react";
import { useResourceList } from "@/hooks/useResourceList";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Select,
} from "@/components/ui";
import { REGIONS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

type DestinationRow = {
  _id: string;
  name: string;
  slug?: string;
  region: string;
  isFeatured: boolean;
  heroImage?: string;
  createdAt: string;
};

export default function DestinationsPage() {
  const router = useRouter();
  const list = useResourceList<DestinationRow>("/api/destinations", {
    region: "All",
  });
  const [pendingDelete, setPendingDelete] = useState<DestinationRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const columns: Column<DestinationRow>[] = [
    {
      key: "name",
      header: "Destination",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-md bg-admin-bg border border-admin-border overflow-hidden shrink-0">
            {row.heroImage && (
              // Editor-supplied host, so a plain img rather than next/image.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.heroImage} alt="" className="size-full object-cover" />
            )}
          </div>
          <div>
            <p className="font-medium text-admin-text-primary">{row.name}</p>
            {row.isFeatured && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                <Star className="size-3 fill-current" /> Featured
              </span>
            )}
          </div>
        </div>
      ),
    },
    { key: "region", header: "Region", render: (row) => <Badge>{row.region}</Badge> },
    {
      key: "created",
      header: "Added",
      render: (row) => formatDate(row.createdAt),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "120px",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${row.name}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/destinations/${row._id}`);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${row.name}`}
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
        title="Destinations"
        description="The master list every package and case study is attached to."
        actions={
          <Link href="/admin/destinations/new">
            <Button>
              <Plus className="size-4" /> New destination
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
        searchPlaceholder="Search destinations…"
        draggable
        onReorder={list.reorder}
        onRowClick={(row) => router.push(`/admin/destinations/${row._id}`)}
        page={list.page}
        pages={list.pages}
        total={list.total}
        onPageChange={list.setPage}
        filters={
          <Select
            value={list.filters.region}
            onChange={(e) => list.setFilter("region", e.target.value)}
            className="w-auto"
            aria-label="Filter by region"
          >
            <option value="All">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        }
        empty={
          <EmptyState
            icon={<Globe2 className="size-10" />}
            title="No destinations yet"
            message="Add a destination before creating packages — every package is attached to one."
            action={
              <Link href="/admin/destinations/new">
                <Button>
                  <Plus className="size-4" /> Add a destination
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
        title="Delete this destination?"
        message={`"${pendingDelete?.name}" will be removed. Packages still attached to it will lose their destination.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          await list.remove(pendingDelete._id, "Destination");
          setDeleting(false);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
