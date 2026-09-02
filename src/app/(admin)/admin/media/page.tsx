"use client";

import { useState } from "react";
import { ImageIcon, Plus, Trash2, Copy, Check } from "lucide-react";
import { api } from "@/lib/client";
import { useResourceList } from "@/hooks/useResourceList";
import {
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  toast,
} from "@/components/ui";
import { MEDIA_TYPES } from "@/lib/constants";

type Asset = {
  _id: string;
  url: string;
  type: string;
  title?: string;
  alt?: string;
  folder: string;
};

const BLANK = {
  url: "",
  type: "image",
  title: "",
  alt: "",
  folder: "Uncategorised",
};

export default function MediaPage() {
  const list = useResourceList<Asset>("/api/media", { type: "All", folder: "" });
  const [editing, setEditing] = useState<Asset | null>(null);
  const [draft, setDraft] = useState(BLANK);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Asset | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const openNew = () => {
    setEditing(null);
    setDraft(BLANK);
    setOpen(true);
  };

  const openEdit = (asset: Asset) => {
    setEditing(asset);
    setDraft({
      url: asset.url,
      type: asset.type,
      title: asset.title ?? "",
      alt: asset.alt ?? "",
      folder: asset.folder,
    });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      await api(editing ? `/api/media/${editing._id}` : "/api/media", {
        method: editing ? "PUT" : "POST",
        json: draft,
      });
      toast(editing ? "Asset updated" : "Added to the library");
      setOpen(false);
      await list.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div>
      <PageHeader
        title="Media Library"
        description="A shared registry of image, video and document URLs, reusable across every module."
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" /> Add media
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          value={list.search}
          onChange={(e) => list.setSearch(e.target.value)}
          placeholder="Search by title, alt text or folder…"
          className="flex-1 min-w-[220px]"
        />
        <Select
          value={list.filters.type}
          onChange={(e) => list.setFilter("type", e.target.value)}
          className="w-auto"
          aria-label="Filter by type"
        >
          <option value="All">All types</option>
          {MEDIA_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </Select>
      </div>

      {list.loading ? (
        <div className="p-20 grid place-items-center">
          <Spinner />
        </div>
      ) : list.items.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ImageIcon className="size-10" />}
            title="The library is empty"
            message="Add an image URL here once, then reuse it from any package, case study or article."
            action={
              <Button onClick={openNew}>
                <Plus className="size-4" /> Add media
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {list.items.map((asset) => (
            <Card key={asset._id} className="overflow-hidden group">
              <button
                type="button"
                onClick={() => openEdit(asset)}
                className="block w-full aspect-4/3 bg-admin-bg"
              >
                {asset.type === "image" ? (
                  // Editor-supplied hosts, so a plain img rather than next/image.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.alt ?? ""}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="size-full grid place-items-center text-xs uppercase tracking-wider text-admin-text-secondary">
                    {asset.type}
                  </span>
                )}
              </button>
              <div className="p-3">
                <p className="text-sm text-admin-text-primary truncate">
                  {asset.title || asset.url.split("/").pop()}
                </p>
                <p className="text-xs text-admin-text-secondary truncate mb-2">
                  {asset.folder}
                  {!asset.alt && (
                    <span className="text-amber-400"> · no alt text</span>
                  )}
                </p>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copy(asset.url)}
                    aria-label="Copy URL"
                  >
                    {copied === asset.url ? (
                      <Check className="size-3.5" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDelete(asset)}
                    aria-label="Delete asset"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {list.pages > 1 && (
        <div className="flex items-center justify-between mt-6 text-sm text-admin-text-secondary">
          <span>
            Page {list.page} of {list.pages} · {list.total} assets
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={list.page <= 1}
              onClick={() => list.setPage(list.page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={list.page >= list.pages}
              onClick={() => list.setPage(list.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit asset" : "Add media"}
        description="Media is stored as a link. Host the file anywhere public and paste the URL."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={save} disabled={!draft.url}>
              Save
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="URL" required>
            <Input
              value={draft.url}
              onChange={(e) => setDraft({ ...draft, url: e.target.value })}
              placeholder="https://…"
            />
          </Field>

          {draft.url && draft.type === "image" && (
            <div className="aspect-video rounded-md border border-admin-border bg-admin-bg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={draft.url}
                alt={draft.alt}
                className="size-full object-contain"
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Type">
              <Select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value })}
              >
                {MEDIA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Folder">
              <Input
                value={draft.folder}
                onChange={(e) => setDraft({ ...draft, folder: e.target.value })}
                placeholder="Dubai"
              />
            </Field>
            <Field label="Title">
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </Field>
            <Field
              label="Alt text"
              hint="Describes the image for screen readers and search engines."
            >
              <Input
                value={draft.alt}
                onChange={(e) => setDraft({ ...draft, alt: e.target.value })}
              />
            </Field>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Remove this asset?"
        message="It is removed from the library only. Anywhere the URL is already used keeps working."
        confirmLabel="Remove"
        onConfirm={async () => {
          if (!pendingDelete) return;
          await list.remove(pendingDelete._id, "Asset");
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
