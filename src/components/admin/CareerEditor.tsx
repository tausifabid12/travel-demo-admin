"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Users } from "lucide-react";
import { api, ApiError, type ListResult } from "@/lib/client";
import { slugify, formatDate } from "@/lib/utils";
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
import { RepeaterField, SeoFields, SlugField, type SeoValue } from "@/components/ui/fields";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { JOB_TYPES } from "@/lib/constants";

type Application = {
  _id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string;
};

type Form = {
  jobTitle: string;
  slug: string;
  department: string;
  location: string;
  type: string;
  summary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationDeadline: string;
  status: "active" | "closed";
  seo: SeoValue;
};

const BLANK: Form = {
  jobTitle: "",
  slug: "",
  department: "",
  location: "",
  type: "Full-time",
  summary: "",
  description: "",
  requirements: [""],
  benefits: [""],
  applicationDeadline: "",
  status: "active",
  seo: {},
};

export default function CareerEditor({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;

  const [form, setForm] = useState<Form>(BLANK);
  const [applications, setApplications] = useState<Application[]>([]);
  const [tab, setTab] = useState("content");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    if (!id) return;
    api<Record<string, unknown>>(`/api/careers/${id}`)
      .then((doc) =>
        setForm({
          ...BLANK,
          ...doc,
          applicationDeadline: doc.applicationDeadline
            ? String(doc.applicationDeadline).slice(0, 10)
            : "",
          summary: (doc.summary as string) ?? "",
          seo: (doc.seo as SeoValue) ?? {},
        } as Form),
      )
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));

    api<ListResult<Application>>(`/api/applications?careerId=${id}&limit=100`)
      .then((r) => setApplications(r.items))
      .catch(() => setApplications([]));
  }, [id]);

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      const saved = await api<{ _id: string }>(
        isNew ? "/api/careers" : `/api/careers/${id}`,
        {
          method: isNew ? "POST" : "PUT",
          json: {
            ...form,
            slug: form.slug || slugify(form.jobTitle),
            requirements: form.requirements.filter(Boolean),
            benefits: form.benefits.filter(Boolean),
            applicationDeadline: form.applicationDeadline || undefined,
          },
        },
      );
      toast("Job saved");
      if (isNew) router.replace(`/admin/careers/${saved._id}`);
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
        href="/admin/careers"
        className="inline-flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4"
      >
        <ArrowLeft className="size-4" /> All jobs
      </Link>

      <PageHeader
        title={isNew ? "New job posting" : form.jobTitle || "Untitled role"}
        actions={
          <>
            <StatusBadge status={form.status} />
            <Button loading={saving} onClick={save}>
              <Save className="size-4" /> Save
            </Button>
          </>
        }
      />

      <Tabs
        tabs={[
          { id: "content", label: "Content" },
          { id: "seo", label: "SEO" },
          { id: "applications", label: "Applications", count: applications.length },
        ]}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-6 flex flex-col gap-6">
        {tab === "content" && (
          <>
            <Card className="p-5 flex flex-col gap-5">
              <Field label="Job title" required error={error("jobTitle")}>
                <Input
                  value={form.jobTitle}
                  onChange={(e) => set("jobTitle", e.target.value)}
                  placeholder="Senior Event Producer"
                  invalid={Boolean(error("jobTitle"))}
                />
              </Field>

              <SlugField
                value={form.slug}
                onChange={(slug) => set("slug", slug)}
                pathPrefix="/careers"
                sourceTitle={form.jobTitle}
              />

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Department" required error={error("department")}>
                  <Input
                    value={form.department}
                    onChange={(e) => set("department", e.target.value)}
                    placeholder="Operations"
                    invalid={Boolean(error("department"))}
                  />
                </Field>
                <Field label="Location" required error={error("location")}>
                  <Input
                    value={form.location}
                    onChange={(e) => set("location", e.target.value)}
                    placeholder="Mumbai"
                    invalid={Boolean(error("location"))}
                  />
                </Field>
                <Field label="Type" required>
                  <Select value={form.type} onChange={(e) => set("type", e.target.value)}>
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Status">
                  <Select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value as Form["status"])}
                  >
                    <option value="active">Active — accepting applications</option>
                    <option value="closed">Closed</option>
                  </Select>
                </Field>
                <Field label="Application deadline">
                  <Input
                    type="date"
                    value={form.applicationDeadline}
                    onChange={(e) => set("applicationDeadline", e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Summary" hint="One line, shown on the careers listing.">
                <Textarea
                  value={form.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  rows={2}
                />
              </Field>
            </Card>

            <Card className="p-5 flex flex-col gap-6">
              <RichTextEditor
                label="Description"
                value={form.description}
                onChange={(v) => set("description", v)}
              />
              {error("description") && (
                <p className="text-xs text-red-400 -mt-4">{error("description")}</p>
              )}
              <RepeaterField
                label="Requirements"
                value={form.requirements}
                onChange={(v) => set("requirements", v)}
                placeholder="Six or more years producing corporate events"
              />
              <RepeaterField
                label="Benefits"
                value={form.benefits}
                onChange={(v) => set("benefits", v)}
                placeholder="Health cover"
              />
            </Card>
          </>
        )}

        {tab === "seo" && (
          <Card className="p-5">
            <SeoFields
              value={form.seo}
              onChange={(seo) => set("seo", seo)}
              fallbackTitle={form.jobTitle}
              slug={form.slug || slugify(form.jobTitle)}
              pathPrefix="/careers"
            />
          </Card>
        )}

        {tab === "applications" && (
          <Card>
            {applications.length === 0 ? (
              <div className="p-10 text-center">
                <Users className="size-8 mx-auto mb-3 text-admin-text-secondary/40" />
                <p className="text-sm text-admin-text-secondary">
                  Nobody has applied to this role yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-admin-border">
                {applications.map((a) => (
                  <li key={a._id}>
                    <Link
                      href={`/admin/careers/applications/${a._id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-admin-surface-hover transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-admin-text-primary truncate">
                          {a.name}
                        </p>
                        <p className="text-xs text-admin-text-secondary truncate">
                          {a.email}
                        </p>
                      </div>
                      <Badge>{a.status}</Badge>
                      <span className="text-xs text-admin-text-secondary whitespace-nowrap">
                        {formatDate(a.createdAt)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {!isNew && (
          <div className="flex justify-end border-t border-admin-border pt-6">
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="size-4" /> Delete job
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this job posting?"
        message={`"${form.jobTitle}" will be removed. Applications already received are kept.`}
        onConfirm={async () => {
          try {
            await api(`/api/careers/${id}`, { method: "DELETE" });
            toast("Job deleted");
            router.push("/admin/careers");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Could not delete", "error");
          }
        }}
      />
    </div>
  );
}
