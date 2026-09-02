"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Trash2, Pencil } from "lucide-react";
import { useResourceList } from "@/hooks/useResourceList";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  PageHeader,
} from "@/components/ui";

type SeoMetaRow = {
  _id: string;
  urlPath: string;
  metaTitle: string;
  metaDescription: string;
};

export default function SeoPage() {
  const router = useRouter();
  const list = useResourceList<SeoMetaRow>("/api/seo", {});
  const [pendingDelete, setPendingDelete] = useState<SeoMetaRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const columns: Column<SeoMetaRow>[] = [
    {
      key: "urlPath",
      header: "URL Path",
      render: (row) => <p className="font-medium text-admin-text-primary">{row.urlPath}</p>,
    },
    {
      key: "metaTitle",
      header: "Meta Title",
      render: (row) => row.metaTitle,
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
            aria-label={`Edit ${row.urlPath}`}
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/seo/${row._id}`);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${row.urlPath}`}
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
        title="SEO Overrides"
        description="Manually override the title and description for any specific URL on the site."
        actions={
          <Link href="/admin/seo/new">
            <Button>
              <Plus className="size-4" /> New override
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
        searchPlaceholder="Search by path or title…"
        onRowClick={(row) => router.push(`/admin/seo/${row._id}`)}
        page={list.page}
        pages={list.pages}
        total={list.total}
        onPageChange={list.setPage}
        empty={
          <EmptyState
            icon={<FileText className="size-10" />}
            title="No SEO overrides yet"
            message="Create your first manual SEO override to customize metadata for a specific URL."
            action={
              <Link href="/admin/seo/new">
                <Button>
                  <Plus className="size-4" /> Create override
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
        title="Delete this override?"
        message={`The SEO metadata for "${pendingDelete?.urlPath}" will be removed. This cannot be undone.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          await list.remove(pendingDelete._id, "SEO Override");
          setDeleting(false);
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
