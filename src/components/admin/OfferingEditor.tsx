"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { api, ApiError } from "@/lib/client";
import { slugify } from "@/lib/utils";
import {
  Button,
  Card,
  ConfirmDialog,
  Field,
  Input,
  PageHeader,
  Select,
  Spinner,
  StatusBadge,
  Tabs,
  Textarea,
  toast,
} from "@/components/ui";
import {
  GalleryUrlField,
  ImageUrlField,
  SeoFields,
  SlugField,
  type SeoValue,
} from "@/components/ui/fields";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { BLOCK_TYPES } from "@/lib/constants";

type BlockItem = {
  title?: string;
  description?: string;
  image?: string;
  value?: string;
};

type Block = {
  type: (typeof BLOCK_TYPES)[number];
  heading?: string;
  body?: string;
  image?: string;
  items: BlockItem[];
};

type Form = {
  title: string;
  slug: string;
  summary: string;
  heroImage: string;
  heroVideo: string;
  blocks: Block[];
  status: "draft" | "published";
  seo: SeoValue;
};

const BLANK: Form = {
  title: "",
  slug: "",
  summary: "",
  heroImage: "",
  heroVideo: "",
  blocks: [],
  status: "draft",
  seo: {},
};

const BLOCK_LABELS: Record<(typeof BLOCK_TYPES)[number], string> = {
  richText: "Rich text",
  imageText: "Image and text",
  cards: "Card grid",
  stats: "Statistics",
  timeline: "Timeline",
  gallery: "Gallery",
  quote: "Pull quote",
  cta: "Call to action",
};

/** Which sub-fields each block type actually uses. */
const BLOCK_SHAPE: Record<
  (typeof BLOCK_TYPES)[number],
  { body?: "rich" | "plain"; image?: boolean; items?: "titled" | "valued" | "images" }
> = {
  richText: { body: "rich" },
  imageText: { body: "rich", image: true },
  cards: { items: "titled" },
  stats: { items: "valued" },
  timeline: { items: "titled" },
  gallery: { items: "images" },
  quote: { body: "plain" },
  cta: { body: "plain" },
};

export default function OfferingEditor({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;

  const [form, setForm] = useState<Form>(BLANK);
  const [tab, setTab] = useState("content");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newBlockType, setNewBlockType] =
    useState<(typeof BLOCK_TYPES)[number]>("richText");

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!id) return;
    api<Record<string, unknown>>(`/api/offerings/${id}`)
      .then((doc) =>
        setForm({
          ...BLANK,
          ...doc,
          summary: (doc.summary as string) ?? "",
          heroImage: (doc.heroImage as string) ?? "",
          heroVideo: (doc.heroVideo as string) ?? "",
          blocks: (doc.blocks as Block[]) ?? [],
          seo: (doc.seo as SeoValue) ?? {},
        } as Form),
      )
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const updateBlock = (index: number, patch: Partial<Block>) =>
    set(
      "blocks",
      form.blocks.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    );

  const moveBlock = (index: number, direction: -1 | 1) => {
    const to = index + direction;
    if (to < 0 || to >= form.blocks.length) return;
    const next = [...form.blocks];
    [next[index], next[to]] = [next[to], next[index]];
    set("blocks", next);
  };

  const save = async (status?: "draft" | "published") => {
    const nextStatus = status ?? form.status;
    setSaving(true);
    setErrors({});
    try {
      const saved = await api<{ _id: string }>(
        isNew ? "/api/offerings" : `/api/offerings/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          json: {
            ...form,
            status: nextStatus,
            slug: form.slug || slugify(form.title),
          },
        },
      );
      toast(nextStatus === "published" ? "Offering published" : "Draft saved");
      set("status", nextStatus);
      if (isNew) router.replace(`/admin/offerings/${saved._id}`);
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
        toast("Check the highlighted fields", "error");
        setTab("content");
      } else {
        toast(err instanceof Error ? err.message : "Could not save", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const error = (field: string) => errors[field]?.[0];

  if (loading) {
    return (
      <div className="p-20 grid place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/offerings"
        className="inline-flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4"
      >
        <ArrowLeft className="size-4" /> All offerings
      </Link>

      <PageHeader
        title={isNew ? "New offering" : form.title || "Untitled offering"}
        description="Service pages such as TravelXL and Experia, built from rearrangeable blocks."
        actions={
          <>
            <StatusBadge status={form.status} />
            <Button variant="secondary" loading={saving} onClick={() => save("draft")}>
              <Save className="size-4" /> Save draft
            </Button>
            <Button loading={saving} onClick={() => save("published")}>
              Publish
            </Button>
          </>
        }
      />

      <Tabs
        tabs={[
          { id: "content", label: "Content" },
          { id: "blocks", label: "Blocks", count: form.blocks.length },
          { id: "seo", label: "SEO" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-6 flex flex-col gap-6">
        {tab === "content" && (
          <Card className="p-5 flex flex-col gap-5">
            <Field label="Title" required error={error("title")}>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="TravelXL"
                invalid={Boolean(error("title"))}
              />
            </Field>

            <SlugField
              value={form.slug}
              onChange={(slug) => set("slug", slug)}
              pathPrefix="/offerings"
              sourceTitle={form.title}
            />

            <Field label="Summary">
              <Textarea
                value={form.summary}
                onChange={(e) => set("summary", e.target.value)}
                rows={3}
              />
            </Field>

            <ImageUrlField
              label="Hero image"
              value={form.heroImage}
              onChange={(v) => set("heroImage", v)}
            />

            <Field label="Hero video URL">
              <Input
                value={form.heroVideo}
                onChange={(e) => set("heroVideo", e.target.value)}
                placeholder="https://…"
              />
            </Field>
          </Card>
        )}

        {tab === "blocks" && (
          <>
            {form.blocks.map((block, index) => {
              const shape = BLOCK_SHAPE[block.type];
              return (
                <Card key={index} className="p-5">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-admin-border">
                    <span className="text-xs font-semibold uppercase tracking-wider text-admin-accent">
                      {BLOCK_LABELS[block.type]}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Move block up"
                        disabled={index === 0}
                        onClick={() => moveBlock(index, -1)}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Move block down"
                        disabled={index === form.blocks.length - 1}
                        onClick={() => moveBlock(index, 1)}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remove block"
                        onClick={() =>
                          set(
                            "blocks",
                            form.blocks.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <Field label="Heading">
                      <Input
                        value={block.heading ?? ""}
                        onChange={(e) => updateBlock(index, { heading: e.target.value })}
                      />
                    </Field>

                    {shape.body === "rich" && (
                      <RichTextEditor
                        label="Body"
                        value={block.body ?? ""}
                        onChange={(body) => updateBlock(index, { body })}
                        minHeight={140}
                      />
                    )}
                    {shape.body === "plain" && (
                      <Field label="Body">
                        <Textarea
                          value={block.body ?? ""}
                          onChange={(e) => updateBlock(index, { body: e.target.value })}
                          rows={3}
                        />
                      </Field>
                    )}

                    {shape.image && (
                      <ImageUrlField
                        label="Image"
                        value={block.image ?? ""}
                        onChange={(image) => updateBlock(index, { image })}
                      />
                    )}

                    {shape.items === "images" && (
                      <GalleryUrlField
                        label="Images"
                        value={block.items.map((i) => i.image ?? "").filter(Boolean)}
                        onChange={(urls) =>
                          updateBlock(index, { items: urls.map((image) => ({ image })) })
                        }
                      />
                    )}

                    {(shape.items === "titled" || shape.items === "valued") && (
                      <Field label={shape.items === "valued" ? "Statistics" : "Items"}>
                        <div className="flex flex-col gap-2">
                          {block.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex gap-2">
                              <Input
                                value={
                                  shape.items === "valued"
                                    ? (item.value ?? "")
                                    : (item.title ?? "")
                                }
                                onChange={(e) =>
                                  updateBlock(index, {
                                    items: block.items.map((it, i) =>
                                      i === itemIndex
                                        ? shape.items === "valued"
                                          ? { ...it, value: e.target.value }
                                          : { ...it, title: e.target.value }
                                        : it,
                                    ),
                                  })
                                }
                                placeholder={shape.items === "valued" ? "450+" : "Title"}
                                className={shape.items === "valued" ? "w-32" : undefined}
                              />
                              <Input
                                value={
                                  shape.items === "valued"
                                    ? (item.title ?? "")
                                    : (item.description ?? "")
                                }
                                onChange={(e) =>
                                  updateBlock(index, {
                                    items: block.items.map((it, i) =>
                                      i === itemIndex
                                        ? shape.items === "valued"
                                          ? { ...it, title: e.target.value }
                                          : { ...it, description: e.target.value }
                                        : it,
                                    ),
                                  })
                                }
                                placeholder={
                                  shape.items === "valued"
                                    ? "Programmes delivered"
                                    : "Description"
                                }
                              />
                              <Button
                                variant="ghost"
                                size="sm"
                                aria-label="Remove item"
                                onClick={() =>
                                  updateBlock(index, {
                                    items: block.items.filter((_, i) => i !== itemIndex),
                                  })
                                }
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="secondary"
                            size="sm"
                            className="self-start"
                            onClick={() =>
                              updateBlock(index, { items: [...block.items, {}] })
                            }
                          >
                            <Plus className="size-3.5" /> Add item
                          </Button>
                        </div>
                      </Field>
                    )}
                  </div>
                </Card>
              );
            })}

            <Card className="p-5 flex items-end gap-3">
              <Field label="Add a block" className="flex-1">
                <Select
                  value={newBlockType}
                  onChange={(e) =>
                    setNewBlockType(e.target.value as (typeof BLOCK_TYPES)[number])
                  }
                >
                  {BLOCK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {BLOCK_LABELS[t]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Button
                onClick={() =>
                  set("blocks", [...form.blocks, { type: newBlockType, items: [] }])
                }
              >
                <Plus className="size-4" /> Add
              </Button>
            </Card>
          </>
        )}

        {tab === "seo" && (
          <Card className="p-5">
            <SeoFields
              value={form.seo}
              onChange={(seo) => set("seo", seo)}
              fallbackTitle={form.title}
              slug={form.slug || slugify(form.title)}
              pathPrefix="/offerings"
            />
          </Card>
        )}

        {!isNew && (
          <div className="flex justify-end border-t border-admin-border pt-6">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Delete offering
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this offering?"
        message={`"${form.title}" will be removed from the site permanently.`}
        onConfirm={async () => {
          try {
            await api(`/api/offerings/${id}`, { method: "DELETE" });
            toast("Offering deleted");
            router.push("/admin/offerings");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Could not delete", "error");
          }
        }}
      />
    </div>
  );
}
