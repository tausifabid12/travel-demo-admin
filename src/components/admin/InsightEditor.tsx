"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, CalendarClock } from "lucide-react";
import { api, ApiError } from "@/lib/client";
import { slugify } from "@/lib/utils";
import {
  Badge,
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
import { ImageUrlField, SeoFields, SlugField, type SeoValue } from "@/components/ui/fields";
import { useNow } from "@/hooks/client";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { INSIGHT_CATEGORIES } from "@/lib/constants";

type Form = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  featuredImage: string;
  author: string;
  authorRole: string;
  category: string;
  tags: string[];
  publishDate: string;
  status: "draft" | "published";
  seo: SeoValue;
};

const BLANK: Form = {
  title: "",
  slug: "",
  excerpt: "",
  body: "",
  featuredImage: "",
  author: "Bhancer Editorial",
  authorRole: "",
  category: "Corporate Travel Trends",
  tags: [],
  publishDate: "",
  status: "draft",
  seo: {},
};

/** yyyy-MM-ddTHH:mm for datetime-local inputs. */
function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function InsightEditor({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;

  const [form, setForm] = useState<Form>(BLANK);
  const [tab, setTab] = useState("content");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!id) return;
    api<Record<string, unknown>>(`/api/insights/${id}`)
      .then((doc) =>
        setForm({
          ...BLANK,
          ...doc,
          publishDate: toLocalInput(doc.publishDate as string),
          featuredImage: (doc.featuredImage as string) ?? "",
          authorRole: (doc.authorRole as string) ?? "",
          seo: (doc.seo as SeoValue) ?? {},
        } as Form),
      )
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [id]);

  // Reading the clock during render would be impure, so it comes from an
  // external store that re-renders once a minute.
  const now = useNow();

  const isScheduled = Boolean(
    form.status === "published" &&
      form.publishDate &&
      now > 0 &&
      new Date(form.publishDate).getTime() > now,
  );

  const save = async (status?: "draft" | "published") => {
    const nextStatus = status ?? form.status;
    setSaving(true);
    setErrors({});
    try {
      const saved = await api<{ _id: string }>(
        isNew ? "/api/insights" : `/api/insights/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          json: {
            ...form,
            status: nextStatus,
            slug: form.slug || slugify(form.title),
            publishDate: form.publishDate
              ? new Date(form.publishDate).toISOString()
              : new Date().toISOString(),
          },
        },
      );
      toast(
        nextStatus !== "published"
          ? "Draft saved"
          : isScheduled
            ? "Scheduled — it will appear on the site at the chosen time"
            : "Article published",
      );
      set("status", nextStatus);
      if (isNew) router.replace(`/admin/insights/${saved._id}`);
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
        href="/admin/insights"
        className="inline-flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4"
      >
        <ArrowLeft className="size-4" /> All insights
      </Link>

      <PageHeader
        title={isNew ? "New article" : form.title || "Untitled article"}
        actions={
          <>
            {isScheduled ? (
              <Badge tone="info">
                <CalendarClock className="size-3 mr-1" /> Scheduled
              </Badge>
            ) : (
              <StatusBadge status={form.status} />
            )}
            <Button variant="secondary" loading={saving} onClick={() => save("draft")}>
              <Save className="size-4" /> Save draft
            </Button>
            <Button loading={saving} onClick={() => save("published")}>
              {isScheduled ? "Schedule" : "Publish"}
            </Button>
          </>
        }
      />

      <Tabs
        tabs={[
          { id: "content", label: "Content" },
          { id: "body", label: "Article" },
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
                invalid={Boolean(error("title"))}
              />
            </Field>

            <SlugField
              value={form.slug}
              onChange={(slug) => set("slug", slug)}
              pathPrefix="/insights"
              sourceTitle={form.title}
            />

            <Field
              label="Excerpt"
              required
              hint="Shown on the listing page and in search results."
              error={error("excerpt")}
            >
              <Textarea
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={3}
              />
            </Field>

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Author" required error={error("author")}>
                <Input
                  value={form.author}
                  onChange={(e) => set("author", e.target.value)}
                />
              </Field>
              <Field label="Author role">
                <Input
                  value={form.authorRole}
                  onChange={(e) => set("authorRole", e.target.value)}
                  placeholder="Head of MICE"
                />
              </Field>
              <Field label="Category" required>
                <Select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {INSIGHT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field
                label="Publish date"
                hint={
                  isScheduled
                    ? "In the future — the article stays hidden until then."
                    : "Leave blank to publish immediately."
                }
              >
                <Input
                  type="datetime-local"
                  value={form.publishDate}
                  onChange={(e) => set("publishDate", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Tags">
              <div className="flex flex-wrap gap-2 mb-2">
                {form.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      set(
                        "tags",
                        form.tags.filter((t) => t !== tag),
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded border border-admin-border bg-admin-surface-hover px-2 py-1 text-xs text-admin-text-primary hover:border-red-500/40"
                  >
                    {tag} <span className="text-admin-text-secondary">×</span>
                  </button>
                ))}
              </div>
              <Input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagDraft.trim()) {
                    e.preventDefault();
                    if (!form.tags.includes(tagDraft.trim())) {
                      set("tags", [...form.tags, tagDraft.trim()]);
                    }
                    setTagDraft("");
                  }
                }}
                placeholder="Type a tag and press Enter"
              />
            </Field>

            <ImageUrlField
              label="Featured image"
              value={form.featuredImage}
              onChange={(v) => set("featuredImage", v)}
            />
          </Card>
        )}

        {tab === "body" && (
          <Card className="p-5">
            <RichTextEditor
              label="Article body"
              value={form.body}
              onChange={(v) => set("body", v)}
              minHeight={480}
            />
            {error("body") && (
              <p className="text-xs text-red-400 mt-2">{error("body")}</p>
            )}
          </Card>
        )}

        {tab === "seo" && (
          <Card className="p-5">
            <SeoFields
              value={form.seo}
              onChange={(seo) => set("seo", seo)}
              fallbackTitle={form.title}
              slug={form.slug || slugify(form.title)}
              pathPrefix="/insights"
            />
          </Card>
        )}

        {!isNew && (
          <div className="flex justify-end border-t border-admin-border pt-6">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Delete article
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this article?"
        message={`"${form.title}" will be removed from the site permanently.`}
        onConfirm={async () => {
          try {
            await api(`/api/insights/${id}`, { method: "DELETE" });
            toast("Article deleted");
            router.push("/admin/insights");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Could not delete", "error");
          }
        }}
      />
    </div>
  );
}
