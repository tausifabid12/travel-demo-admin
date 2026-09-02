"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Copy, Trash2, Pencil } from "lucide-react";
import { useResourceList } from "@/hooks/useResourceList";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Button, ConfirmDialog, EmptyState, PageHeader } from "@/components/ui";

/**
 * The shared shape of every admin index page: header, search, filters, table,
 * row actions and a delete confirmation. Callers supply the columns.
 */
export function ResourceListPage<T extends { _id: string }>({
  title,
  description,
  endpoint,
  basePath,
  newLabel,
  columns,
  initialFilters,
  filters,
  searchPlaceholder,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  labelOf,
  draggable,
  duplicable,
}: {
  title: string;
  description?: string;
  endpoint: string;
  basePath: string;
  newLabel: string;
  columns: Column<T>[];
  initialFilters?: Record<string, string>;
  filters?: (
    list: ReturnType<typeof useResourceList<T>>,
  ) => React.ReactNode;
  searchPlaceholder?: string;
  emptyIcon?: React.ReactNode;
  emptyTitle: string;
  emptyMessage: string;
  labelOf: (row: T) => string;
  draggable?: boolean;
  duplicable?: boolean;
}) {
  const router = useRouter();
  const list = useResourceList<T>(endpoint, initialFilters);
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);
  const [deleting, setDeleting] = useState(false);

  const actionsColumn: Column<T> = {
    key: "actions",
    header: "",
    align: "right",
    width: duplicable ? "160px" : "120px",
    render: (row) => (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Edit ${labelOf(row)}`}
          onClick={(e) => {
            e.stopPropagation();
            router.push(`${basePath}/${row._id}`);
          }}
        >
          <Pencil className="size-4" />
        </Button>
        {duplicable && (
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Duplicate ${labelOf(row)}`}
            onClick={(e) => {
              e.stopPropagation();
              list.duplicate(row._id);
            }}
          >
            <Copy className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Delete ${labelOf(row)}`}
          onClick={(e) => {
            e.stopPropagation();
            setPendingDelete(row);
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    ),
  };

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        actions={
          <Link href={`${basePath}/new`}>
            <Button>
              <Plus className="size-4" /> {newLabel}
            </Button>
          </Link>
        }
      />

      <DataTable
        rows={list.items}
        columns={[...columns, actionsColumn]}
        loading={list.loading}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={searchPlaceholder}
        draggable={draggable}
        onReorder={draggable ? list.reorder : undefined}
        onRowClick={(row) => router.push(`${basePath}/${row._id}`)}
        page={list.page}
        pages={list.pages}
        total={list.total}
        onPageChange={list.setPage}
        filters={filters?.(list)}
        empty={
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            message={emptyMessage}
            action={
              <Link href={`${basePath}/new`}>
                <Button>
                  <Plus className="size-4" /> {newLabel}
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
        title="Delete this item?"
        message={`"${pendingDelete ? labelOf(pendingDelete) : ""}" will be removed permanently. This cannot be undone.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          await list.remove(pendingDelete._id);
          setDeleting(false);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
