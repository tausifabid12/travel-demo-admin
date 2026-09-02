"use client";

import { useEffect, useState } from "react";
import { Save, Plus, Trash2, Download, ExternalLink } from "lucide-react";
import { api, type ListResult } from "@/lib/client";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Field,
  Input,
  PageHeader,
  Spinner,
  Tabs,
  Textarea,
  toast,
} from "@/components/ui";
import { ImageUrlField, RepeaterField } from "@/components/ui/fields";

type NavChild = { label: string; href: string; description?: string };
type NavItem = { label: string; href: string; children?: NavChild[] };

type Settings = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

type Option = { _id: string; title: string };

/** Triggers a file download without routing away from the page. */
function download(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = "";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

const TABS = [
  { id: "general", label: "General" },
  { id: "contact", label: "Contact & social" },
  { id: "homepage", label: "Homepage" },
  { id: "navigation", label: "Navigation" },
  { id: "seo", label: "SEO & tracking" },
  { id: "notifications", label: "Notifications" },
  { id: "push-notifications", label: "Push notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "backup", label: "Backup" },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [tab, setTab] = useState("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [packages, setPackages] = useState<Option[]>([]);
  const [caseStudies, setCaseStudies] = useState<Option[]>([]);

  useEffect(() => {
    api<Settings>("/api/settings")
      .then(setSettings)
      .catch((err) => toast(err.message, "error"))
      .finally(() => setLoading(false));

    api<ListResult<Option>>("/api/packages?limit=100")
      .then((r) => setPackages(r.items))
      .catch(() => setPackages([]));
    api<ListResult<Option>>("/api/case-studies?limit=100")
      .then((r) => setCaseStudies(r.items))
      .catch(() => setCaseStudies([]));
  }, []);

  const set = (path: string, value: unknown) => {
    setSettings((prev) => {
      const keys = path.split(".");
      const next = { ...prev };
      let cursor: Record<string, any> = next; // eslint-disable-line @typescript-eslint/no-explicit-any
      for (let i = 0; i < keys.length - 1; i += 1) {
        cursor[keys[i]] = { ...(cursor[keys[i]] ?? {}) };
        cursor = cursor[keys[i]];
      }
      cursor[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const get = (path: string, fallback: unknown = "") =>
    path.split(".").reduce<any>((acc, key) => acc?.[key], settings) ?? fallback; // eslint-disable-line @typescript-eslint/no-explicit-any

  const save = async () => {
    setSaving(true);
    try {
      const updated = await api<Settings>("/api/settings", {
        method: "POST",
        json: settings,
      });
      setSettings(updated);
      toast("Settings saved");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleFeatured = (path: string, id: string) => {
    const current: string[] = get(path, []) as string[];
    set(
      path,
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  };

  if (loading) {
    return (
      <div className="p-20 grid place-items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="Settings"
        description="Site-wide configuration. Changes take effect on the public site immediately."
        actions={
          <Button loading={saving} onClick={save}>
            <Save className="size-4" /> Save settings
          </Button>
        }
      />

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      <div className="mt-6 flex flex-col gap-6">
        {tab === "general" && (
          <Card className="p-5 flex flex-col gap-5">
            <Field label="Site name">
              <Input
                value={get("siteTitle") as string}
                onChange={(e) => set("siteTitle", e.target.value)}
              />
            </Field>
            <Field
              label="Site description"
              hint="Used as the default meta description across the site."
            >
              <Textarea
                value={get("siteDescription") as string}
                onChange={(e) => set("siteDescription", e.target.value)}
                rows={2}
              />
            </Field>
            <ImageUrlField
              label="Logo"
              value={get("logoUrl") as string}
              onChange={(v) => set("logoUrl", v)}
            />
            <ImageUrlField
              label="Footer logo"
              value={get("footerLogoUrl") as string}
              onChange={(v) => set("footerLogoUrl", v)}
            />
            <ImageUrlField
              label="Favicon"
              value={get("faviconUrl") as string}
              onChange={(v) => set("faviconUrl", v)}
            />
          </Card>
        )}

        {tab === "contact" && (
          <>
            <Card className="p-5 flex flex-col gap-5">
              <h2 className="font-semibold text-admin-text-primary">Contact details</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Email">
                  <Input
                    type="email"
                    value={get("contact.email") as string}
                    onChange={(e) => set("contact.email", e.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={get("contact.phone") as string}
                    onChange={(e) => set("contact.phone", e.target.value)}
                  />
                </Field>
                <Field label="WhatsApp number" hint="Include the country code.">
                  <Input
                    value={get("contact.whatsapp") as string}
                    onChange={(e) => set("contact.whatsapp", e.target.value)}
                    placeholder="+919876543210"
                  />
                </Field>
                <Field label="Response promise">
                  <Input
                    value={get("contact.responsePromise") as string}
                    onChange={(e) => set("contact.responsePromise", e.target.value)}
                  />
                </Field>
              </div>
              <RepeaterField
                label="Address"
                hint="One line per row, shown in the footer and on the contact page."
                value={get("contact.addressLines", []) as string[]}
                onChange={(v) => set("contact.addressLines", v)}
                placeholder="Bandra Kurla Complex"
              />
              <Field label="Map embed URL" hint="The src of a Google Maps embed iframe.">
                <Input
                  value={get("contact.mapEmbedUrl") as string}
                  onChange={(e) => set("contact.mapEmbedUrl", e.target.value)}
                />
              </Field>
            </Card>

            <Card className="p-5 flex flex-col gap-5">
              <h2 className="font-semibold text-admin-text-primary">Social links</h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {(["linkedin", "instagram", "facebook", "youtube", "x"] as const).map(
                  (network) => (
                    <Field key={network} label={network === "x" ? "X" : network}>
                      <Input
                        value={get(`social.${network}`) as string}
                        onChange={(e) => set(`social.${network}`, e.target.value)}
                        placeholder="https://…"
                      />
                    </Field>
                  ),
                )}
              </div>
            </Card>
          </>
        )}

        {tab === "homepage" && (
          <>
            <Card className="p-5 flex flex-col gap-5">
              <h2 className="font-semibold text-admin-text-primary">Hero</h2>
              <Field label="Headline">
                <Textarea
                  value={get("homepage.heroHeadline") as string}
                  onChange={(e) => set("homepage.heroHeadline", e.target.value)}
                  rows={2}
                />
              </Field>
              <Field label="Subheadline">
                <Textarea
                  value={get("homepage.heroSubheadline") as string}
                  onChange={(e) => set("homepage.heroSubheadline", e.target.value)}
                  rows={2}
                />
              </Field>
              <ImageUrlField
                label="Hero image"
                value={get("homepage.heroImageUrl") as string}
                onChange={(v) => set("homepage.heroImageUrl", v)}
              />
              <Field
                label="Hero video URL"
                hint="Optional. An MP4 shown in place of the image."
              >
                <Input
                  value={get("homepage.heroVideoUrl") as string}
                  onChange={(e) => set("homepage.heroVideoUrl", e.target.value)}
                />
              </Field>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold text-admin-text-primary mb-1">
                Featured packages
              </h2>
              <p className="text-sm text-admin-text-secondary mb-4">
                Pick three or four to show on the homepage.
              </p>
              <div className="flex flex-wrap gap-2">
                {packages.map((pkg) => {
                  const selected = (
                    get("homepage.featuredPackageIds", []) as string[]
                  ).includes(pkg._id);
                  return (
                    <button
                      key={pkg._id}
                      type="button"
                      onClick={() => toggleFeatured("homepage.featuredPackageIds", pkg._id)}
                      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-admin-accent bg-admin-accent/10 text-admin-accent"
                          : "border-admin-border text-admin-text-secondary hover:text-admin-text-primary"
                      }`}
                    >
                      {pkg.title}
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <h2 className="font-semibold text-admin-text-primary mb-4">
                Featured case studies
              </h2>
              <div className="flex flex-wrap gap-2">
                {caseStudies.map((cs) => {
                  const selected = (
                    get("homepage.featuredCaseStudyIds", []) as string[]
                  ).includes(cs._id);
                  return (
                    <button
                      key={cs._id}
                      type="button"
                      onClick={() =>
                        toggleFeatured("homepage.featuredCaseStudyIds", cs._id)
                      }
                      className={`rounded-md border px-3 py-1.5 text-sm transition-colors ${
                        selected
                          ? "border-admin-accent bg-admin-accent/10 text-admin-accent"
                          : "border-admin-border text-admin-text-secondary hover:text-admin-text-primary"
                      }`}
                    >
                      {cs.title}
                    </button>
                  );
                })}
              </div>
            </Card>

            <PairListEditor
              title="Statistics"
              description="Shown in the proof section of the homepage."
              valueLabel="Value"
              labelLabel="Label"
              valuePlaceholder="450+"
              labelPlaceholder="Programmes delivered"
              rows={get("homepage.stats", []) as { label: string; value: string }[]}
              onChange={(rows) => set("homepage.stats", rows)}
            />

            <PairListEditor
              title="Client logos"
              description="Shown as a marquee in the proof section."
              valueLabel="Logo URL"
              labelLabel="Client name"
              valuePlaceholder="https://…"
              labelPlaceholder="Northwind"
              rows={(get("homepage.clientLogos", []) as { name: string; logoUrl: string }[]).map(
                (l) => ({ label: l.name, value: l.logoUrl }),
              )}
              onChange={(rows) =>
                set(
                  "homepage.clientLogos",
                  rows.map((r) => ({ name: r.label, logoUrl: r.value })),
                )
              }
            />
          </>
        )}

        {tab === "navigation" && (
          <>
            <NavEditor
              title="Header menu"
              description="Top-level items. Add children to turn an item into a dropdown."
              items={get("navigation.header", []) as NavItem[]}
              onChange={(items) => set("navigation.header", items)}
              allowChildren
            />
            <NavEditor
              title="Footer links"
              description="Each item becomes a footer column; its children are the links."
              items={get("navigation.footer", []) as NavItem[]}
              onChange={(items) => set("navigation.footer", items)}
              allowChildren
            />
          </>
        )}

        {tab === "seo" && (
          <Card className="p-5 flex flex-col gap-5">
            <ImageUrlField
              label="Default social share image"
              hint="Used when a page has no image of its own. 1200×630."
              value={get("defaultOgImage") as string}
              onChange={(v) => set("defaultOgImage", v)}
            />
            <div className="grid sm:grid-cols-2 gap-5">
              <Field
                label="Google Analytics ID"
                hint="Injected on the public site once cookies are accepted."
              >
                <Input
                  value={get("googleAnalyticsId") as string}
                  onChange={(e) => set("googleAnalyticsId", e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </Field>
              <Field label="Google Tag Manager ID">
                <Input
                  value={get("gtmTag") as string}
                  onChange={(e) => set("gtmTag", e.target.value)}
                  placeholder="GTM-XXXXXXX"
                />
              </Field>
              <Field label="Google Ads Tracking ID">
                <Input
                  value={get("googleAdsId") as string}
                  onChange={(e) => set("googleAdsId", e.target.value)}
                  placeholder="AW-XXXXXXXXX"
                />
              </Field>
              <Field label="Facebook Pixel ID">
                <Input
                  value={get("facebookPixelId") as string}
                  onChange={(e) => set("facebookPixelId", e.target.value)}
                  placeholder="123456789012345"
                />
              </Field>
              <Field label="Search Console Verification Code" hint="The content value from the meta tag provided by Google.">
                <Input
                  value={get("searchConsoleCode") as string}
                  onChange={(e) => set("searchConsoleCode", e.target.value)}
                  placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                />
              </Field>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 border-t border-admin-border">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  fetch("/sitemap.xml").then(() => toast("Sitemap regenerated", "success"));
                }}
              >
                Generate sitemap
              </Button>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm">
                  View sitemap <ExternalLink className="size-3.5" />
                </Button>
              </a>
              <a href="/robots.txt" target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm">
                  View robots.txt <ExternalLink className="size-3.5" />
                </Button>
              </a>
            </div>
          </Card>
        )}

        {tab === "notifications" && (
          <Card className="p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Checkbox
                label="Send email notifications"
                checked={Boolean(get("notifications.emailEnabled", false))}
                onChange={(e) => set("notifications.emailEnabled", e.target.checked)}
              />
              <Checkbox
                label="Send WhatsApp notifications via Pinggo"
                checked={Boolean(get("notifications.whatsappEnabled", false))}
                onChange={(e) => set("notifications.whatsappEnabled", e.target.checked)}
              />
              <p className="text-xs text-admin-text-secondary">
                Email requires RESEND_API_KEY and NOTIFY_FROM_EMAIL in the environment.
                WhatsApp uses the Pinggo credentials on the Integrations tab.
              </p>
            </div>

            <RepeaterField
              label="Enquiry recipients"
              hint="Who gets notified when a new enquiry arrives."
              value={get("notifications.enquiryRecipients", []) as string[]}
              onChange={(v) => set("notifications.enquiryRecipients", v)}
              placeholder="sales@bhancer.com"
            />
            <RepeaterField
              label="Careers recipients"
              hint="Who gets notified about new job applications."
              value={get("notifications.careersRecipients", []) as string[]}
              onChange={(v) => set("notifications.careersRecipients", v)}
              placeholder="hr@bhancer.com"
            />
          </Card>
        )}

        {tab === "push-notifications" && (
          <Card className="p-5 flex flex-col gap-5">
            <h2 className="font-semibold text-admin-text-primary">Firebase Push Notifications Setup</h2>
            <p className="text-sm text-admin-text-secondary">
              Configure Firebase to enable desktop and mobile push notifications. You can find these values in your Firebase Console under Project Settings.
            </p>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="API Key">
                <Input
                  value={get("firebaseApiKey") as string}
                  onChange={(e) => set("firebaseApiKey", e.target.value)}
                />
              </Field>
              <Field label="Auth Domain">
                <Input
                  value={get("firebaseAuthDomain") as string}
                  onChange={(e) => set("firebaseAuthDomain", e.target.value)}
                />
              </Field>
              <Field label="Project ID">
                <Input
                  value={get("firebaseProjectId") as string}
                  onChange={(e) => set("firebaseProjectId", e.target.value)}
                />
              </Field>
              <Field label="Messaging Sender ID">
                <Input
                  value={get("firebaseMessagingSenderId") as string}
                  onChange={(e) => set("firebaseMessagingSenderId", e.target.value)}
                />
              </Field>
              <Field label="App ID">
                <Input
                  value={get("firebaseAppId") as string}
                  onChange={(e) => set("firebaseAppId", e.target.value)}
                />
              </Field>
              <Field label="VAPID Key (Web Push)">
                <Input
                  type="password"
                  value={get("firebaseVapidKey") as string}
                  onChange={(e) => set("firebaseVapidKey", e.target.value)}
                  placeholder={get("firebaseVapidKeyIsSet") ? "••••••••" : ""}
                />
              </Field>
            </div>
            <p className="text-xs text-admin-text-secondary">
              Note: To send push notifications from the server, you must also provide the <code>FIREBASE_SERVICE_ACCOUNT</code> environment variable with your Firebase service account JSON.
            </p>
          </Card>
        )}

        {tab === "integrations" && (
          <Card className="p-5 flex flex-col gap-5">
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
              Secret keys are write-only. Once saved they are never shown again — leave a
              field blank to keep the stored value.
            </div>

            <h2 className="font-semibold text-admin-text-primary">PhonePe</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Merchant ID">
                <Input
                  value={get("phonePeMerchantId") as string}
                  onChange={(e) => set("phonePeMerchantId", e.target.value)}
                />
              </Field>
              <Field
                label="Salt key"
                hint={
                  get("phonePeSaltKeyIsSet") ? "A key is stored." : "No key stored yet."
                }
              >
                <Input
                  type="password"
                  value={(get("phonePeSaltKey") as string) || ""}
                  onChange={(e) => set("phonePeSaltKey", e.target.value)}
                  placeholder={get("phonePeSaltKeyIsSet") ? "••••••••" : ""}
                />
              </Field>
            </div>

            <h2 className="font-semibold text-admin-text-primary pt-3 border-t border-admin-border">
              Pinggo WhatsApp
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="User ID">
                <Input
                  value={get("pinggoUserId") as string}
                  onChange={(e) => set("pinggoUserId", e.target.value)}
                />
              </Field>
              <Field label="Vendor phone">
                <Input
                  value={get("pinggoVendorPhone") as string}
                  onChange={(e) => set("pinggoVendorPhone", e.target.value)}
                />
              </Field>
              <Field
                label="API key"
                hint={get("pinggoApiKeyIsSet") ? "A key is stored." : "No key stored yet."}
              >
                <Input
                  type="password"
                  value={(get("pinggoApiKey") as string) || ""}
                  onChange={(e) => set("pinggoApiKey", e.target.value)}
                  placeholder={get("pinggoApiKeyIsSet") ? "••••••••" : ""}
                />
              </Field>
            </div>
          </Card>
        )}

        {tab === "backup" && (
          <Card className="p-5 flex flex-col gap-5">
            <div>
              <h2 className="font-semibold text-admin-text-primary mb-1">
                Export content
              </h2>
              <p className="text-sm text-admin-text-secondary mb-4">
                Downloads a JSON snapshot of every content collection. Secrets are
                excluded.
              </p>
              <Button variant="secondary" onClick={() => download("/api/backup")}>
                <Download className="size-4" /> Download backup
              </Button>
            </div>

            <div className="pt-4 border-t border-admin-border">
              <h2 className="font-semibold text-admin-text-primary mb-1">
                Enquiries export
              </h2>
              <p className="text-sm text-admin-text-secondary mb-4">
                A CSV of every lead, ready for a CRM import.
              </p>
              <Button
                variant="secondary"
                onClick={() => download("/api/enquiries/export")}
              >
                <Download className="size-4" /> Download leads CSV
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ------------------------- Small local editors ------------------------- */

function PairListEditor({
  title,
  description,
  rows,
  onChange,
  valueLabel,
  labelLabel,
  valuePlaceholder,
  labelPlaceholder,
}: {
  title: string;
  description: string;
  rows: { label: string; value: string }[];
  onChange: (rows: { label: string; value: string }[]) => void;
  valueLabel: string;
  labelLabel: string;
  valuePlaceholder: string;
  labelPlaceholder: string;
}) {
  return (
    <Card className="p-5">
      <h2 className="font-semibold text-admin-text-primary mb-1">{title}</h2>
      <p className="text-sm text-admin-text-secondary mb-4">{description}</p>
      <div className="flex flex-col gap-2">
        <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-2 text-xs uppercase tracking-wider text-admin-text-secondary">
          <span>{valueLabel}</span>
          <span>{labelLabel}</span>
          <span className="w-9" />
        </div>
        {rows.map((row, index) => (
          <div key={index} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
            <Input
              value={row.value}
              onChange={(e) =>
                onChange(
                  rows.map((r, i) => (i === index ? { ...r, value: e.target.value } : r)),
                )
              }
              placeholder={valuePlaceholder}
            />
            <Input
              value={row.label}
              onChange={(e) =>
                onChange(
                  rows.map((r, i) => (i === index ? { ...r, label: e.target.value } : r)),
                )
              }
              placeholder={labelPlaceholder}
            />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Remove row"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          onClick={() => onChange([...rows, { label: "", value: "" }])}
        >
          <Plus className="size-3.5" /> Add
        </Button>
      </div>
    </Card>
  );
}

function NavEditor({
  title,
  description,
  items,
  onChange,
  allowChildren,
}: {
  title: string;
  description: string;
  items: NavItem[];
  onChange: (items: NavItem[]) => void;
  allowChildren?: boolean;
}) {
  const update = (index: number, patch: Partial<NavItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  const move = (index: number, direction: -1 | 1) => {
    const to = index + direction;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    onChange(next);
  };

  return (
    <Card className="p-5">
      <h2 className="font-semibold text-admin-text-primary mb-1">{title}</h2>
      <p className="text-sm text-admin-text-secondary mb-4">{description}</p>

      <div className="flex flex-col gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-admin-border bg-admin-bg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Input
                value={item.label}
                onChange={(e) => update(index, { label: e.target.value })}
                placeholder="Label"
              />
              <Input
                value={item.href}
                onChange={(e) => update(index, { href: e.target.value })}
                placeholder="/travelxl"
              />
              <Button
                variant="ghost"
                size="sm"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                ▲
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Move down"
                disabled={index === items.length - 1}
                onClick={() => move(index, 1)}
              >
                ▼
              </Button>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Remove item"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>

            {allowChildren && (
              <div className="pl-4 border-l-2 border-admin-border flex flex-col gap-2">
                {(item.children ?? []).map((child, childIndex) => (
                  <div key={childIndex} className="flex items-center gap-2">
                    <Input
                      value={child.label}
                      onChange={(e) =>
                        update(index, {
                          children: (item.children ?? []).map((c, i) =>
                            i === childIndex ? { ...c, label: e.target.value } : c,
                          ),
                        })
                      }
                      placeholder="Child label"
                    />
                    <Input
                      value={child.href}
                      onChange={(e) =>
                        update(index, {
                          children: (item.children ?? []).map((c, i) =>
                            i === childIndex ? { ...c, href: e.target.value } : c,
                          ),
                        })
                      }
                      placeholder="/travelxl/mice"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label="Remove child"
                      onClick={() =>
                        update(index, {
                          children: (item.children ?? []).filter(
                            (_, i) => i !== childIndex,
                          ),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="self-start"
                  onClick={() =>
                    update(index, {
                      children: [...(item.children ?? []), { label: "", href: "" }],
                    })
                  }
                >
                  <Plus className="size-3.5" /> Add sub-item
                </Button>
              </div>
            )}
          </div>
        ))}

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onChange([...items, { label: "", href: "", children: [] }])}
          >
            <Plus className="size-3.5" /> Add item
          </Button>
          {items.length === 0 && (
            <Badge tone="warning">
              Empty — the site falls back to its default menu
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
