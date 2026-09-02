"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import { api, ApiError, type ListResult } from "@/lib/client";
import { slugify } from "@/lib/utils";
import {
  Button,
  Card,
  Checkbox,
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

type Destination = { _id: string; name: string; region: string };
type Metric = { label: string; value: string };

type Form = {
  title: string;
  slug: string;
  clientName: string;
  industry: string;
  destinationId: string;
  serviceCategory: string;
  tags: string[];
  heroImage: string;
  gallery: string[];
  videoUrl: string;
  summary: string;
  challenge: string;
  solution: string;
  results: string;
  metrics: Metric[];
  testimonialQuote: string;
  testimonialAuthor: string;
  testimonialRole: string;
  isFeatured: boolean;
  status: "draft" | "published";
  seo: SeoValue;
};

const BLANK: Form = {
  title: "",
  slug: "",
  clientName: "",
  industry: "",
  destinationId: "",
  serviceCategory: "MICE",
  tags: [],
  heroImage: "",
  gallery: [],
  videoUrl: "",
  summary: "",
  challenge: "",
  solution: "",
  results: "",
  metrics: [],
  testimonialQuote: "",
  testimonialAuthor: "",
  testimonialRole: "",
  isFeatured: false,
  status: "draft",
  seo: {},
};

const SERVICE_CATEGORIES = [
  "MICE",
  "Incentive",
  "Offsite",
  "Conference",
  "Corporate Experience",
  "Experia",
];

export default function CaseStudyEditor({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;

  const [form, setForm] = useState<Form>(BLANK);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [tab, setTab] = useState("content");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    api<ListResult<Destination>>("/api/destinations?limit=100")
      .then((r) => setDestinations(r.items))
      .catch(() => setDestinations([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    api<Record<string, unknown>>(`/api/case-studies/${id}`)
      .then((doc) => {
        const destination = doc.destinationId as { _id?: string } | string | null;
        setForm({
          ...BLANK,
          ...doc,
          destinationId:
            typeof destination === "string" ? destination : (destination?._id ?? ""),
          seo: (doc.seo as SeoValue) ?? {},
        } as Form);
      })
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async (status?: "draft" | "published") => {
    const nextStatus = status ?? form.status;
    setSaving(true);
    setErrors({});
    try {
      const saved = await api<{ _id: string }>(
        isNew ? "/api/case-studies" : `/api/case-studies/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          json: {
            ...form,
            status: nextStatus,
            slug: form.slug || slugify(form.title),
            metrics: form.metrics.filter((m) => m.label && m.value),
          },
        },
      );
      toast(nextStatus === "published" ? "Case study published" : "Draft saved");
      set("status", nextStatus);
      if (isNew) router.replace(`/admin/case-studies/${saved._id}`);
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
        href="/admin/case-studies"
        className="inline-flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4"
      >
        <ArrowLeft className="size-4" /> All case studies
      </Link>

      <PageHeader
        title={isNew ? "New case study" : form.title || "Untitled case study"}
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
          { id: "story", label: "The story" },
          { id: "media", label: "Media" },
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
                placeholder="Moving 320 delegates to Dubai in six weeks"
                invalid={Boolean(error("title"))}
              />
            </Field>

            <SlugField
              value={form.slug}
              onChange={(slug) => set("slug", slug)}
              pathPrefix="/work"
              sourceTitle={form.title}
            />

            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Client name" required error={error("clientName")}>
                <Input
                  value={form.clientName}
                  onChange={(e) => set("clientName", e.target.value)}
                  placeholder="A global fintech"
                  invalid={Boolean(error("clientName"))}
                />
              </Field>
              <Field label="Industry" required error={error("industry")}>
                <Input
                  value={form.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  placeholder="Financial Services"
                  invalid={Boolean(error("industry"))}
                />
              </Field>
              <Field label="Destination">
                <Select
                  value={form.destinationId}
                  onChange={(e) => set("destinationId", e.target.value)}
                >
                  <option value="">No specific destination</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Service category" required>
                <Select
                  value={form.serviceCategory}
                  onChange={(e) => set("serviceCategory", e.target.value)}
                >
                  {SERVICE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Summary" hint="Shown on the Work listing card.">
              <Textarea
                value={form.summary}
                onChange={(e) => set("summary", e.target.value)}
                rows={3}
              />
            </Field>

            <Field label="Tags" hint="Used by the filters on the Work page.">
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

            <Checkbox
              label="Feature this case study on the homepage"
              checked={form.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
            />
          </Card>
        )}

        {tab === "story" && (
          <>
            <Card className="p-5 flex flex-col gap-6">
              <RichTextEditor
                label="Challenge"
                hint="What the client was up against."
                value={form.challenge}
                onChange={(v) => set("challenge", v)}
              />
              <RichTextEditor
                label="Solution"
                hint="What Bhancer did about it."
                value={form.solution}
                onChange={(v) => set("solution", v)}
              />
              <RichTextEditor
                label="Results"
                hint="What actually happened."
                value={form.results}
                onChange={(v) => set("results", v)}
              />
            </Card>

            <Card className="p-5 flex flex-col gap-5">
              <Field
                label="Headline metrics"
                hint="Shown as large figures on the case study page."
              >
                <div className="flex flex-col gap-2">
                  {form.metrics.map((metric, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={metric.value}
                        onChange={(e) =>
                          set(
                            "metrics",
                            form.metrics.map((m, i) =>
                              i === index ? { ...m, value: e.target.value } : m,
                            ),
                          )
                        }
                        placeholder="320"
                        className="w-32"
                      />
                      <Input
                        value={metric.label}
                        onChange={(e) =>
                          set(
                            "metrics",
                            form.metrics.map((m, i) =>
                              i === index ? { ...m, label: e.target.value } : m,
                            ),
                          )
                        }
                        placeholder="Delegates"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Remove metric"
                        onClick={() =>
                          set(
                            "metrics",
                            form.metrics.filter((_, i) => i !== index),
                          )
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
                      set("metrics", [...form.metrics, { label: "", value: "" }])
                    }
                  >
                    <Plus className="size-3.5" /> Add metric
                  </Button>
                </div>
              </Field>

              <Field label="Testimonial quote">
                <Textarea
                  value={form.testimonialQuote}
                  onChange={(e) => set("testimonialQuote", e.target.value)}
                  rows={3}
                />
              </Field>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Attributed to">
                  <Input
                    value={form.testimonialAuthor}
                    onChange={(e) => set("testimonialAuthor", e.target.value)}
                    placeholder="Head of Internal Communications"
                  />
                </Field>
                <Field label="Their organisation">
                  <Input
                    value={form.testimonialRole}
                    onChange={(e) => set("testimonialRole", e.target.value)}
                  />
                </Field>
              </div>
            </Card>
          </>
        )}

        {tab === "media" && (
          <Card className="p-5 flex flex-col gap-6">
            <ImageUrlField
              label="Hero image"
              value={form.heroImage}
              onChange={(v) => set("heroImage", v)}
            />
            <Field label="Video URL" hint="A YouTube or Vimeo link, shown in a lightbox.">
              <Input
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <GalleryUrlField value={form.gallery} onChange={(v) => set("gallery", v)} />
          </Card>
        )}

        {tab === "seo" && (
          <Card className="p-5">
            <SeoFields
              value={form.seo}
              onChange={(seo) => set("seo", seo)}
              fallbackTitle={form.title}
              slug={form.slug || slugify(form.title)}
              pathPrefix="/work"
            />
          </Card>
        )}

        {!isNew && (
          <div className="flex justify-end border-t border-admin-border pt-6">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Delete case study
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this case study?"
        message={`"${form.title}" will be removed from the site permanently.`}
        onConfirm={async () => {
          try {
            await api(`/api/case-studies/${id}`, { method: "DELETE" });
            toast("Case study deleted");
            router.push("/admin/case-studies");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Could not delete", "error");
          }
        }}
      />
    </div>
  );
}
