"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/client";
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
import { REGIONS } from "@/lib/constants";

type Form = {
  name: string;
  slug: string;
  region: string;
  description: string;
  heroImage: string;
  gallery: string[];
  isFeatured: boolean;
  seo: SeoValue;
};

const BLANK: Form = {
  name: "",
  slug: "",
  region: "Middle East",
  description: "",
  heroImage: "",
  gallery: [],
  isFeatured: false,
  seo: {},
};

export default function DestinationEditor({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;

  const [form, setForm] = useState<Form>(BLANK);
  const [tab, setTab] = useState("content");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!id) return;
    api<Record<string, unknown>>(`/api/destinations/${id}`)
      .then((doc) =>
        setForm({
          ...BLANK,
          ...doc,
          description: (doc.description as string) ?? "",
          heroImage: (doc.heroImage as string) ?? "",
          slug: (doc.slug as string) ?? "",
          seo: (doc.seo as SeoValue) ?? {},
        } as Form),
      )
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const saved = await api<{ _id: string }>(
        isNew ? "/api/destinations" : `/api/destinations/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          json: { ...form, slug: form.slug || slugify(form.name) },
        },
      );
      toast("Destination saved");
      if (isNew) router.replace(`/admin/destinations/${saved._id}`);
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
    <div className="max-w-3xl">
      <Link
        href="/admin/destinations"
        className="inline-flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4"
      >
        <ArrowLeft className="size-4" /> All destinations
      </Link>

      <PageHeader
        title={isNew ? "New destination" : form.name || "Untitled destination"}
        actions={
          <Button loading={saving} onClick={save}>
            <Save className="size-4" /> Save
          </Button>
        }
      />

      <Tabs
        tabs={[
          { id: "content", label: "Content" },
          { id: "media", label: "Media" },
          { id: "seo", label: "SEO" },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-6 flex flex-col gap-6">
        {tab === "content" && (
          <Card className="p-5 flex flex-col gap-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Name" required error={error("name")}>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Dubai"
                  invalid={Boolean(error("name"))}
                />
              </Field>
              <Field label="Region" required error={error("region")}>
                <Select
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <SlugField
              value={form.slug}
              onChange={(slug) => set("slug", slug)}
              pathPrefix="/travelxl/destination"
              sourceTitle={form.name}
            />

            <Field label="Description" error={error("description")}>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                placeholder="What makes this destination right for corporate travel."
              />
            </Field>

            <Checkbox
              label="Feature this destination on the TravelXL page"
              checked={form.isFeatured}
              onChange={(e) => set("isFeatured", e.target.checked)}
            />
          </Card>
        )}

        {tab === "media" && (
          <Card className="p-5 flex flex-col gap-6">
            <ImageUrlField
              label="Hero image"
              value={form.heroImage}
              onChange={(v) => set("heroImage", v)}
            />
            <GalleryUrlField value={form.gallery} onChange={(v) => set("gallery", v)} />
          </Card>
        )}

        {tab === "seo" && (
          <Card className="p-5">
            <SeoFields
              value={form.seo}
              onChange={(seo) => set("seo", seo)}
              fallbackTitle={form.name}
              slug={form.slug || slugify(form.name)}
              pathPrefix="/travelxl/destination"
            />
          </Card>
        )}

        {!isNew && (
          <div className="flex justify-end border-t border-admin-border pt-6">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Delete destination
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this destination?"
        message={`"${form.name}" will be removed. Packages attached to it will lose their destination.`}
        onConfirm={async () => {
          try {
            await api(`/api/destinations/${id}`, { method: "DELETE" });
            toast("Destination deleted");
            router.push("/admin/destinations");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Could not delete", "error");
          }
        }}
      />
    </div>
  );
}
