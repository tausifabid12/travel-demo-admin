"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Inbox,
  Flame,
  Plane,
  Users,
  FileEdit,
  Plus,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { api } from "@/lib/client";
import { relativeTime } from "@/lib/utils";
import { Card, PageHeader, Spinner, Badge } from "@/components/ui";

type Dashboard = {
  stats: {
    totalEnquiries: number;
    newLeads: number;
    leadsThisWeek: number;
    publishedPackages: number;
    draftPackages: number;
    activeJobs: number;
    newApplications: number;
    publishedCaseStudies: number;
    draftContent: number;
  };
  activity: {
    _id: string;
    actorName: string;
    action: string;
    entityType: string;
    entityLabel?: string;
    createdAt: string;
  }[];
};

const ACTION_TONE: Record<string, "success" | "info" | "warning" | "danger"> = {
  created: "info",
  updated: "info",
  published: "success",
  duplicated: "info",
  deleted: "danger",
};

export default function AdminDashboard() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Dashboard>("/api/dashboard")
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;

  const cards = [
    {
      label: "Total enquiries",
      value: s?.totalEnquiries,
      sub: s ? `${s.leadsThisWeek} this week` : "",
      icon: Inbox,
      href: "/admin/enquiries",
    },
    {
      label: "New leads",
      value: s?.newLeads,
      sub: "Awaiting a first response",
      icon: Flame,
      href: "/admin/enquiries?status=New",
    },
    {
      label: "Published packages",
      value: s?.publishedPackages,
      sub: s ? `${s.draftPackages} in draft` : "",
      icon: Plane,
      href: "/admin/packages",
    },
    {
      label: "New applications",
      value: s?.newApplications,
      sub: s ? `${s.activeJobs} roles open` : "",
      icon: Users,
      href: "/admin/careers/applications",
    },
  ];

  const quickActions = [
    { label: "New package", href: "/admin/packages/new", icon: Plane },
    { label: "New case study", href: "/admin/case-studies/new", icon: Briefcase },
    { label: "Write an insight", href: "/admin/insights/new", icon: FileEdit },
    { label: "Post a job", href: "/admin/careers/new", icon: Users },
  ];

  return (
    <div>
      <PageHeader
        title="Welcome back"
        description="Everything happening across Bhancer right now."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="p-5 h-full transition-colors hover:border-admin-accent/50">
              <div className="flex items-start justify-between mb-4">
                <span className="text-xs uppercase tracking-wider text-admin-text-secondary">
                  {label}
                </span>
                <Icon className="size-4 text-admin-accent" />
              </div>
              <p className="text-3xl font-semibold text-admin-text-primary tabular-nums">
                {loading ? <Spinner /> : (value ?? 0)}
              </p>
              {sub && (
                <p className="text-xs text-admin-text-secondary mt-1.5">{sub}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 border-b border-admin-border">
            <h2 className="font-semibold text-admin-text-primary">Recent activity</h2>
          </div>
          {loading ? (
            <div className="p-10 grid place-items-center">
              <Spinner />
            </div>
          ) : !data?.activity.length ? (
            <p className="p-8 text-sm text-admin-text-secondary text-center">
              Nothing yet. Activity appears here as your team publishes and edits content.
            </p>
          ) : (
            <ul className="divide-y divide-admin-border">
              {data.activity.map((entry) => (
                <li key={entry._id} className="flex items-center gap-3 px-5 py-3.5">
                  <Badge tone={ACTION_TONE[entry.action] ?? "neutral"}>
                    {entry.action}
                  </Badge>
                  <span className="text-sm text-admin-text-primary flex-1 truncate">
                    {entry.entityType}
                    {entry.entityLabel && (
                      <span className="text-admin-text-secondary">
                        {" "}
                        · {entry.entityLabel}
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-admin-text-secondary whitespace-nowrap">
                    {entry.actorName} · {relativeTime(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <div className="p-5 border-b border-admin-border">
              <h2 className="font-semibold text-admin-text-primary">Quick actions</h2>
            </div>
            <div className="p-3">
              {quickActions.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-admin-text-secondary hover:bg-admin-surface-hover hover:text-admin-text-primary transition-colors group"
                >
                  <Icon className="size-4" />
                  <span className="flex-1">{label}</span>
                  <Plus className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-admin-text-primary mb-1">
              Unpublished content
            </h2>
            <p className="text-sm text-admin-text-secondary mb-4">
              {loading
                ? "…"
                : `${s?.draftContent ?? 0} items are still in draft across packages, case studies and insights.`}
            </p>
            <Link
              href="/admin/packages?status=draft"
              className="text-sm text-admin-accent hover:underline inline-flex items-center gap-1"
            >
              Review drafts <ArrowRight className="size-3.5" />
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
