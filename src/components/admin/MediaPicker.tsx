"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Plus } from "lucide-react";
import { api, type ListResult } from "@/lib/client";
import { Button, Field, Input, Modal, Spinner, toast } from "@/components/ui";
import { cn } from "@/lib/utils";

export type MediaAsset = {
  _id: string;
  url: string;
  type: "image" | "video" | "document";
  title?: string;
  alt?: string;
  folder: string;
};

const BLANK = {
  url: "",
  title: "",
  alt: "",
  folder: "Uncategorised",
  type: "image" as const,
};

export default function MediaPicker({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: MediaAsset) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api<ListResult<MediaAsset>>(
        `/api/media?limit=60${query ? `&q=${encodeURIComponent(query)}` : ""}`,
      );
      setAssets(result.items);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(load, query ? 300 : 0);
    return () => clearTimeout(timer);
  }, [open, query, load]);

  const save = async () => {
    setSaving(true);
    try {
      const created = await api<MediaAsset>("/api/media", {
        method: "POST",
        json: draft,
      });
      toast("Added to the media library");
      setDraft(BLANK);
      setAdding(false);
      setAssets((prev) => [created, ...prev]);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Media library"
      description="Pick an existing asset, or add a new URL to the library."
      size="lg"
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, alt text or folder"
          />
          <Button variant="secondary" onClick={() => setAdding((v) => !v)}>
            <Plus className="size-4" /> Add
          </Button>
        </div>

        {adding && (
          <div className="rounded-lg border border-admin-border bg-admin-bg p-4 flex flex-col gap-3">
            <Field label="URL" required>
              <Input
                value={draft.url}
                onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                placeholder="https://…"
              />
            </Field>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Title">
                <Input
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                />
              </Field>
              <Field label="Alt text">
                <Input
                  value={draft.alt}
                  onChange={(e) => setDraft({ ...draft, alt: e.target.value })}
                />
              </Field>
              <Field label="Folder">
                <Input
                  value={draft.folder}
                  onChange={(e) => setDraft({ ...draft, folder: e.target.value })}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button size="sm" loading={saving} onClick={save} disabled={!draft.url}>
                Save to library
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="p-12 grid place-items-center">
            <Spinner />
          </div>
        ) : assets.length === 0 ? (
          <div className="p-10 text-center text-sm text-admin-text-secondary">
            <ImageIcon className="size-8 mx-auto mb-3 opacity-30" />
            Nothing in the library yet. Add a URL above to reuse it across the site.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[50vh] overflow-y-auto">
            {assets.map((asset) => (
              <button
                key={asset._id}
                type="button"
                onClick={() => onSelect(asset)}
                className={cn(
                  "group text-left rounded-lg overflow-hidden border border-admin-border bg-admin-bg",
                  "hover:border-admin-accent transition-colors",
                )}
              >
                <div className="aspect-4/3 bg-admin-surface-hover">
                  {asset.type === "image" ? (
                    // Arbitrary editor-supplied hosts, so plain img rather than next/image.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={asset.url}
                      alt={asset.alt ?? ""}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="size-full grid place-items-center text-admin-text-secondary text-xs uppercase">
                      {asset.type}
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-admin-text-primary truncate">
                    {asset.title || asset.url.split("/").pop()}
                  </p>
                  <p className="text-[10px] text-admin-text-secondary truncate">
                    {asset.folder}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

