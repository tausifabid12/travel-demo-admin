"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, Input, Spinner, Button } from "@/components/ui";

export type Column<T> = {
  key: string;
  header: string;
  /** Right-align and shrink — used for the actions column. */
  align?: "left" | "right";
  width?: string;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends { _id: string }>({
  rows,
  columns,
  loading,
  empty,
  search,
  onSearch,
  searchPlaceholder = "Search…",
  filters,
  page,
  pages,
  total,
  onPageChange,
  rowHref,
  onRowClick,
  draggable,
  onReorder,
}: {
  rows: T[];
  columns: Column<T>[];
  loading?: boolean;
  empty: React.ReactNode;
  search?: string;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  page?: number;
  pages?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  rowHref?: (row: T) => string;
  onRowClick?: (row: T) => void;
  draggable?: boolean;
  onReorder?: (ids: string[]) => void;
}) {
  const move = (index: number, direction: -1 | 1) => {
    const to = index + direction;
    if (!onReorder || to < 0 || to >= rows.length) return;
    const ids = rows.map((r) => r._id);
    [ids[index], ids[to]] = [ids[to], ids[index]];
    onReorder(ids);
  };

  return (
    <div className="flex flex-col gap-4">
      {(onSearch || filters) && (
        <div className="flex flex-wrap items-center gap-3">
          {onSearch && (
            <div className="relative flex-1 min-w-[220px]">
              <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-text-secondary pointer-events-none" />
              <Input
                value={search ?? ""}
                onChange={(e) => onSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-9"
              />
            </div>
          )}
          {filters}
        </div>
      )}

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-12 flex items-center justify-center gap-3 text-admin-text-secondary text-sm">
            <Spinner /> Loading…
          </div>
        ) : rows.length === 0 ? (
          empty
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-admin-border bg-admin-bg/40">
                  {draggable && <th className="w-10" />}
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={col.width ? { width: col.width } : undefined}
                      className={cn(
                        "p-4 text-xs font-semibold uppercase tracking-wider text-admin-text-secondary",
                        col.align === "right" && "text-right",
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={row._id}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(
                      "border-b border-admin-border last:border-0 transition-colors",
                      (onRowClick || rowHref) &&
                        "hover:bg-admin-surface-hover cursor-pointer",
                    )}
                  >
                    {draggable && (
                      <td className="pl-3 align-middle">
                        <div className="flex flex-col">
                          <button
                            type="button"
                            aria-label="Move up"
                            onClick={(e) => {
                              e.stopPropagation();
                              move(index, -1);
                            }}
                            disabled={index === 0}
                            className="text-admin-text-secondary hover:text-admin-accent disabled:opacity-20 text-[10px] leading-none"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            aria-label="Move down"
                            onClick={(e) => {
                              e.stopPropagation();
                              move(index, 1);
                            }}
                            disabled={index === rows.length - 1}
                            className="text-admin-text-secondary hover:text-admin-accent disabled:opacity-20 text-[10px] leading-none"
                          >
                            ▼
                          </button>
                        </div>
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "p-4 text-sm text-admin-text-secondary align-middle",
                          col.align === "right" && "text-right",
                        )}
                      >
                        {col.render(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pages !== undefined && pages > 1 && page !== undefined && onPageChange && (
        <div className="flex items-center justify-between text-sm text-admin-text-secondary">
          <span>
            Page {page} of {pages}
            {total !== undefined && ` · ${total} total`}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

