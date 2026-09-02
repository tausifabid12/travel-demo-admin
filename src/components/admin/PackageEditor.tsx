"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Inbox } from "lucide-react";
import { api, ApiError, type ListResult } from "@/lib/client";
import { cn, slugify, formatDate } from "@/lib/utils";
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
  Badge,
  toast,
} from "@/components/ui";
import {
  GalleryUrlField,
  ImageUrlField,
  ItineraryBuilder,
  RepeaterField,
  SeoFields,
  SlugField,
  type ItineraryDay,
  type SeoValue,
} from "@/components/ui/fields";
import {
  PACKAGE_CATEGORIES,
  PACKAGE_BADGES,
  TRIP_TYPES,
  HOLIDAY_THEMES,
} from "@/lib/constants";

type Destination = { _id: string; name: string; region: string };

type Enquiry = {
  _id: string;
  name: string;
  email: string;
  company?: string;
  status: string;
  createdAt: string;
};

export type PackageForm = {
  title: string;
  slug: string;
  summary: string;
  destinationId: string;
  category: string;
  heroImage: string;
  heroVideo: string;
  gallery: string[];
  highlights: string[];
  itinerary: ItineraryDay[];
  inclusions: string[];
  exclusions: string[];
  durationDays: string;
  durationNights: string;
  priceIndicator: string;
  priceFrom: string;
  strikePrice: string;
  currency: string;
  rating: string;
  reviewCount: string;
  badge: string;
  tripType: string;
  themes: string[];
  isFeatured: boolean;
  status: "draft" | "published";
  seo: SeoValue;
};

const BLANK: PackageForm = {
  title: "",
  slug: "",
  summary: "",
  destinationId: "",
  category: "MICE",
  heroImage: "",
  heroVideo: "",
  gallery: [],
  highlights: [""],
  itinerary: [{ day: 1, title: "", description: "" }],
  inclusions: [""],
  exclusions: [""],
  durationDays: "",
  durationNights: "",
  priceIndicator: "",
  priceFrom: "",
  strikePrice: "",
  currency: "INR",
  rating: "",
  reviewCount: "",
  badge: "",
  tripType: "Holiday",
  themes: [],
  isFeatured: false,
  status: "draft",
  seo: {},
};

const TABS = [
  { id: "content", label: "Content" },
  { id: "pricing", label: "Pricing" },
  { id: "itinerary", label: "Itinerary" },
  { id: "media", label: "Media" },
  { id: "seo", label: "SEO" },
  { id: "enquiries", label: "Enquiries" },
];

export default function PackageEditor({ id }: { id?: string }) {
  const router = useRouter();
  const isNew = !id;

  const [form, setForm] = useState<PackageForm>(BLANK);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [tab, setTab] = useState("content");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = <K extends keyof PackageForm>(key: K, value: PackageForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    api<ListResult<Destination>>("/api/destinations?limit=100")
      .then((r) => setDestinations(r.items))
      .catch(() => setDestinations([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    api<Record<string, unknown>>(`/api/packages/${id}`)
      .then((doc) => {
        const destination = doc.destinationId as { _id?: string } | string | null;
        setForm({
          ...BLANK,
          ...doc,
          destinationId:
            typeof destination === "string"
              ? destination
              : (destination?._id ?? ""),
          durationDays: doc.durationDays ? String(doc.durationDays) : "",
          durationNights: doc.durationNights ? String(doc.durationNights) : "",
          priceFrom: doc.priceFrom ? String(doc.priceFrom) : "",
          strikePrice: doc.strikePrice ? String(doc.strikePrice) : "",
          currency: (doc.currency as string) ?? "INR",
          rating: doc.rating ? String(doc.rating) : "",
          reviewCount: doc.reviewCount ? String(doc.reviewCount) : "",
          badge: (doc.badge as string) ?? "",
          tripType: (doc.tripType as string) ?? "Holiday",
          themes: (doc.themes as string[]) ?? [],
          summary: (doc.summary as string) ?? "",
          heroImage: (doc.heroImage as string) ?? "",
          heroVideo: (doc.heroVideo as string) ?? "",
          priceIndicator: (doc.priceIndicator as string) ?? "",
          seo: (doc.seo as SeoValue) ?? {},
        } as PackageForm);
      })
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));

    api<ListResult<Enquiry>>(`/api/enquiries?packageId=${id}&limit=50`)
      .then((r) => setEnquiries(r.items))
      .catch(() => setEnquiries([]));
  }, [id]);

  const save = async (status?: "draft" | "published") => {
    const nextStatus = status ?? form.status;
    setSaving(true);
    setErrors({});

    const payload = {
      ...form,
      status: nextStatus,
      slug: form.slug || slugify(form.title),
      durationDays: form.durationDays ? Number(form.durationDays) : undefined,
      durationNights: form.durationNights
        ? Number(form.durationNights)
        : undefined,
      priceFrom: form.priceFrom ? Number(form.priceFrom) : undefined,
      strikePrice: form.strikePrice ? Number(form.strikePrice) : undefined,
      rating: form.rating ? Number(form.rating) : undefined,
      reviewCount: form.reviewCount ? Number(form.reviewCount) : undefined,
      // Strip the blank rows the repeater leaves behind.
      highlights: form.highlights.filter(Boolean),
      inclusions: form.inclusions.filter(Boolean),
      exclusions: form.exclusions.filter(Boolean),
      itinerary: form.itinerary.filter((d) => d.title.trim()),
    };

    try {
      const saved = await api<{ _id: string }>(
        isNew ? "/api/packages" : `/api/packages/${id}`,
        { method: isNew ? "POST" : "PUT", json: payload },
      );
      toast(
        nextStatus === "published" ? "Package published" : "Draft saved",
      );
      set("status", nextStatus);
      if (isNew) router.replace(`/admin/packages/${saved._id}`);
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
        href="/admin/packages"
        className="inline-flex items-center gap-1.5 text-sm text-admin-text-secondary hover:text-admin-text-primary mb-4"
      >
        <ArrowLeft className="size-4" /> All packages
      </Link>

      <PageHeader
        title={isNew ? "New package" : form.title || "Untitled package"}
        description={
          isNew
            ? "Create a corporate travel experience."
            : `Currently ${form.status}.`
        }
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
        tabs={TABS.map((t) =>
          t.id === "enquiries" ? { ...t, count: enquiries.length } : t,
        )}
        active={tab}
        onChange={setTab}
      />

      <div className="mt-6 flex flex-col gap-6">
        {tab === "content" && (
          <>
            <Card className="p-5 flex flex-col gap-5">
              <Field label="Title" required error={error("title")}>
                <Input
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                  placeholder="Dubai Luxury MICE Experience"
                  invalid={Boolean(error("title"))}
                />
              </Field>

              <SlugField
                value={form.slug}
                onChange={(slug) => set("slug", slug)}
                pathPrefix="/travelxl"
                sourceTitle={form.title}
              />

              <Field
                label="Summary"
                hint="One or two sentences, used on listing cards."
                error={error("summary")}
              >
                <Textarea
                  value={form.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  rows={3}
                />
              </Field>

              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Destination" required error={error("destinationId")}>
                  <Select
                    value={form.destinationId}
                    onChange={(e) => set("destinationId", e.target.value)}
                  >
                    <option value="">Choose a destination…</option>
                    {destinations.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} — {d.region}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Trip type"
                  required
                  hint="Holiday packages fill the storefront; corporate ones sit under TravelXL."
                >
                  <Select
                    value={form.tripType}
                    onChange={(e) => set("tripType", e.target.value)}
                  >
                    {TRIP_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Category" required error={error("category")}>
                  <Select
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                  >
                    {PACKAGE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Duration (days)">
                  <Input
                    type="number"
                    min={0}
                    value={form.durationDays}
                    onChange={(e) => set("durationDays", e.target.value)}
                  />
                </Field>

                <Field label="Duration (nights)">
                  <Input
                    type="number"
                    min={0}
                    value={form.durationNights}
                    onChange={(e) => set("durationNights", e.target.value)}
                  />
                </Field>
              </div>

              <Checkbox
                label="Feature this package on the homepage"
                checked={form.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
              />
            </Card>

            <Card className="p-5 flex flex-col gap-6">
              <RepeaterField
                label="Highlights"
                hint="Four to six short lines shown near the top of the page."
                value={form.highlights}
                onChange={(v) => set("highlights", v)}
                placeholder="Luxury beachfront resort"
              />
              <RepeaterField
                label="Inclusions"
                value={form.inclusions}
                onChange={(v) => set("inclusions", v)}
                placeholder="Five-star accommodation, four nights"
              />
              <RepeaterField
                label="Exclusions"
                value={form.exclusions}
                onChange={(v) => set("exclusions", v)}
                placeholder="International flights"
              />
            </Card>
          </>
        )}

        {tab === "pricing" && (
          <>
            <Card className="p-5 flex flex-col gap-5">
              <div className="grid sm:grid-cols-3 gap-5">
                <Field label="Currency">
                  <Select
                    value={form.currency}
                    onChange={(e) => set("currency", e.target.value)}
                  >
                    <option value="INR">INR</option>
                    <option value="USD">USD</option>
                    <option value="AED">AED</option>
                    <option value="EUR">EUR</option>
                  </Select>
                </Field>

                <Field
                  label="Price from"
                  hint="Per person. Shown as the headline price on cards."
                  error={error("priceFrom")}
                >
                  <Input
                    type="number"
                    min={0}
                    value={form.priceFrom}
                    onChange={(e) => set("priceFrom", e.target.value)}
                    placeholder="64999"
                  />
                </Field>

                <Field
                  label="Was price"
                  hint="Optional. Only shown when it is higher than the price from."
                >
                  <Input
                    type="number"
                    min={0}
                    value={form.strikePrice}
                    onChange={(e) => set("strikePrice", e.target.value)}
                    placeholder="79999"
                  />
                </Field>
              </div>

              <Field
                label="Price note"
                hint="Replaces the number entirely. Use it for corporate packages priced on request."
              >
                <Input
                  value={form.priceIndicator}
                  onChange={(e) => set("priceIndicator", e.target.value)}
                  placeholder="On request"
                />
              </Field>
            </Card>

            <Card className="p-5 flex flex-col gap-5">
              <h2 className="font-semibold text-admin-text-primary">
                Social proof and flags
              </h2>

              <div className="grid sm:grid-cols-3 gap-5">
                <Field label="Rating" hint="Out of 5. Leave blank to hide it.">
                  <Input
                    type="number"
                    min={0}
                    max={5}
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => set("rating", e.target.value)}
                    placeholder="4.8"
                  />
                </Field>

                <Field label="Review count">
                  <Input
                    type="number"
                    min={0}
                    value={form.reviewCount}
                    onChange={(e) => set("reviewCount", e.target.value)}
                    placeholder="284"
                  />
                </Field>

                <Field label="Badge" hint="Corner ribbon on the card.">
                  <Select
                    value={form.badge}
                    onChange={(e) => set("badge", e.target.value)}
                  >
                    <option value="">No badge</option>
                    {PACKAGE_BADGES.map((badge) => (
                      <option key={badge} value={badge}>
                        {badge}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Themes" hint="What a holiday shopper filters by.">
                <div className="flex flex-wrap gap-2">
                  {HOLIDAY_THEMES.map((theme) => {
                    const on = form.themes.includes(theme);
                    return (
                      <button
                        key={theme}
                        type="button"
                        onClick={() =>
                          set(
                            "themes",
                            on
                              ? form.themes.filter((x) => x !== theme)
                              : [...form.themes, theme],
                          )
                        }
                        className={cn(
                          "rounded-md border px-3 py-1.5 text-sm transition-colors",
                          on
                            ? "border-admin-accent bg-admin-accent/10 text-admin-accent"
                            : "border-admin-border text-admin-text-secondary hover:text-admin-text-primary",
                        )}
                      >
                        {theme}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </Card>
          </>
        )}

        {tab === "itinerary" && (
          <Card className="p-5">
            <ItineraryBuilder
              value={form.itinerary}
              onChange={(v) => set("itinerary", v)}
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
            <Field
              label="Hero video URL"
              hint="Optional. An MP4 or a YouTube/Vimeo link shown in place of the hero image."
            >
              <Input
                value={form.heroVideo}
                onChange={(e) => set("heroVideo", e.target.value)}
                placeholder="https://…"
              />
            </Field>
            <GalleryUrlField
              value={form.gallery}
              onChange={(v) => set("gallery", v)}
            />
          </Card>
        )}

        {tab === "seo" && (
          <Card className="p-5">
            <SeoFields
              value={form.seo}
              onChange={(seo) => set("seo", seo)}
              fallbackTitle={form.title}
              slug={form.slug || slugify(form.title)}
              pathPrefix="/travelxl"
            />
          </Card>
        )}

        {tab === "enquiries" && (
          <Card>
            {enquiries.length === 0 ? (
              <div className="p-10 text-center">
                <Inbox className="size-8 mx-auto mb-3 text-admin-text-secondary/40" />
                <p className="text-sm text-admin-text-secondary">
                  No enquiries have come through this package yet.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-admin-border">
                {enquiries.map((e) => (
                  <li key={e._id}>
                    <Link
                      href={`/admin/enquiries?highlight=${e._id}`}
                      className="flex items-center gap-3 px-5 py-3.5 hover:bg-admin-surface-hover transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-admin-text-primary truncate">
                          {e.name}
                          {e.company && (
                            <span className="text-admin-text-secondary">
                              {" "}
                              · {e.company}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-admin-text-secondary truncate">
                          {e.email}
                        </p>
                      </div>
                      <Badge>{e.status}</Badge>
                      <span className="text-xs text-admin-text-secondary whitespace-nowrap">
                        {formatDate(e.createdAt)}
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
              <Trash2 className="size-4" /> Delete package
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this package?"
        message={`"${form.title}" will be removed from the site permanently.`}
        onConfirm={async () => {
          try {
            await api(`/api/packages/${id}`, { method: "DELETE" });
            toast("Package deleted");
            router.push("/admin/packages");
          } catch (err) {
            toast(err instanceof Error ? err.message : "Could not delete", "error");
          }
        }}
      />
    </div>
  );
}
