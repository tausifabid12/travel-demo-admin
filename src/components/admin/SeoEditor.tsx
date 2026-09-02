"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { api, ApiError } from "@/lib/client";
import {
  Button,
  Card,
  Field,
  Input,
  PageHeader,
  Spinner,
  Textarea,
  toast,
} from "@/components/ui";
import { ImageUrlField } from "@/components/ui/fields";

type SeoMetaForm = {
  urlPath: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
};

const BLANK: SeoMetaForm = {
  urlPath: "",
  metaTitle: "",
  metaDescription: "",
  ogImage: "",
};

export default function SeoEditor({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;

  const [form, setForm] = useState<SeoMetaForm>(BLANK);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const set = <K extends keyof SeoMetaForm>(key: K, value: SeoMetaForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!id) return;
    api<Record<string, unknown>>(`/api/seo/${id}`)
      .then((doc) => {
        setForm({
          urlPath: (doc.urlPath as string) ?? "",
          metaTitle: (doc.metaTitle as string) ?? "",
          metaDescription: (doc.metaDescription as string) ?? "",
          ogImage: (doc.ogImage as string) ?? "",
        });
      })
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      await api(isNew ? "/api/seo" : `/api/seo/${id}`, {
        method: isNew ? "POST" : "PUT",
        json: form,
      });
      toast("SEO Override saved");
      router.push("/admin/seo");
    } catch (err) {
      if (err instanceof ApiError && err.fieldErrors) {
        setErrors(err.fieldErrors);
        toast("Check the highlighted fields", "error");
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
      <div className="mb-4">
        <Link
          href="/admin/seo"
          className="inline-flex items-center gap-2 text-sm text-admin-text-secondary hover:text-admin-text-primary transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to SEO
        </Link>
      </div>

      <PageHeader
        title={isNew ? "New SEO Override" : "Edit SEO Override"}
        description={
          isNew
            ? "Create a manual SEO metadata override for a specific path."
            : "Update the manual SEO metadata for this path."
        }
        actions={
          <Button loading={saving} onClick={save}>
            <Save className="size-4" /> Save override
          </Button>
        }
      />

      <div className="flex flex-col gap-6">
        <Card className="p-5 flex flex-col gap-5">
          <Field 
            label="URL Path" 
            required 
            error={error("urlPath")}
            hint="The path to override, starting with a slash (e.g., /about, /destinations/bali)."
          >
            <Input
              value={form.urlPath}
              onChange={(e) => set("urlPath", e.target.value)}
              placeholder="/example-path"
              autoFocus
              invalid={Boolean(error("urlPath"))}
            />
          </Field>
          
          <Field 
            label="Meta Title" 
            required 
            error={error("metaTitle")}
            hint="The title that appears in search engines and browser tabs."
          >
            <Input
              value={form.metaTitle}
              onChange={(e) => set("metaTitle", e.target.value)}
              invalid={Boolean(error("metaTitle"))}
            />
          </Field>

          <Field 
            label="Meta Description" 
            required 
            error={error("metaDescription")}
            hint="A short summary appearing below the title in search results."
          >
            <Textarea
              value={form.metaDescription}
              onChange={(e) => set("metaDescription", e.target.value)}
              rows={3}
            />
          </Field>

          <ImageUrlField
            label="OpenGraph Image"
            hint="Optional. Custom share image for this URL. 1200x630 recommended."
            value={form.ogImage}
            onChange={(v) => set("ogImage", v)}
          />
        </Card>
      </div>
    </div>
  );
}
