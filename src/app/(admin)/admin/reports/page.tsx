"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/client";
import { Badge, Card, PageHeader, Select, Spinner } from "@/components/ui";

type Report = {
  enquiries: {
    byMonth: { _id: string; count: number }[];
    bySource: { _id: string; count: number }[];
    byStatus: { _id: string; count: number }[];
  };
  topPackages: { _id: string; title: string; category: string; count: number }[];
  applicationsByJob: { jobTitle: string; status: string; count: number }[];
  contentActivity: {
    drafts: { packages: number; caseStudies: number; insights: number };
    published: { packages: number; caseStudies: number; insights: number };
  };
};

/** Colour-blind-safe categorical ramp, used for every series on this page. */
const SERIES = ["#5B8FF9", "#61DDAA", "#F6BD16", "#F08BB4", "#7262FD", "#78D3F8"];

function monthLabel(id: string) {
  const [year, month] = id.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-GB", {
    month: "short",
    year: "2-digit",
  });
}

function BarChart({ data }: { data: { _id: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="flex items-end gap-2 h-56 pt-4" role="img" aria-label="Enquiries by month">
      {data.map((point) => (
        <div key={point._id} className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <span className="text-xs text-admin-text-secondary tabular-nums">
            {point.count}
          </span>
          <div
            className="w-full rounded-t bg-admin-accent/70 hover:bg-admin-accent transition-colors min-h-[2px]"
            style={{ height: `${(point.count / max) * 100}%` }}
            title={`${monthLabel(point._id)}: ${point.count}`}
          />
          <span className="text-[10px] text-admin-text-secondary truncate w-full text-center">
            {monthLabel(point._id)}
          </span>
        </div>
      ))}
    </div>
  );
}

function Breakdown({
  data,
  total,
}: {
  data: { _id: string; count: number }[];
  total: number;
}) {
  return (
    <ul className="flex flex-col gap-3">
      {data.map((row, index) => (
        <li key={row._id} className="flex items-center gap-3">
          <span
            className="size-2.5 rounded-full shrink-0"
            style={{ backgroundColor: SERIES[index % SERIES.length] }}
          />
          <span className="text-sm text-admin-text-primary flex-1 truncate">
            {row._id || "Unspecified"}
          </span>
          <span className="text-sm text-admin-text-secondary tabular-nums">
            {row.count}
          </span>
          <span className="text-xs text-admin-text-secondary tabular-nums w-10 text-right">
            {total ? Math.round((row.count / total) * 100) : 0}%
          </span>
        </li>
      ))}
    </ul>
  );
}

export default function ReportsPage() {
  const [months, setMonths] = useState("12");
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api<Report>(`/api/reports?months=${months}`)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [months]);

  if (loading) {
    return (
      <div className="p-20 grid place-items-center">
        <Spinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Reports" />
        <Card className="p-10 text-center text-sm text-admin-text-secondary">
          Could not load the reports.
        </Card>
      </div>
    );
  }

  const totalEnquiries = data.enquiries.bySource.reduce((sum, r) => sum + r.count, 0);
  const totalByStatus = data.enquiries.byStatus.reduce((sum, r) => sum + r.count, 0);

  const applicationsByJob = data.applicationsByJob.reduce<
    Record<string, Record<string, number>>
  >((acc, row) => {
    acc[row.jobTitle] ??= {};
    acc[row.jobTitle][row.status] = row.count;
    return acc;
  }, {});

  const content = data.contentActivity;

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Where enquiries come from, which packages pull, and how the careers funnel is doing."
        actions={
          <Select
            value={months}
            onChange={(e) => {
              setLoading(true);
              setMonths(e.target.value);
            }}
            className="w-auto"
            aria-label="Reporting period"
          >
            <option value="3">Last 3 months</option>
            <option value="6">Last 6 months</option>
            <option value="12">Last 12 months</option>
            <option value="24">Last 24 months</option>
          </Select>
        }
      />

      <div className="flex flex-col gap-6">
        <Card className="p-5">
          <h2 className="font-semibold text-admin-text-primary mb-1">
            Enquiry volume
          </h2>
          <p className="text-sm text-admin-text-secondary mb-2">
            {totalEnquiries} enquiries over the period.
          </p>
          {data.enquiries.byMonth.length === 0 ? (
            <p className="py-12 text-center text-sm text-admin-text-secondary">
              No enquiries in this period yet.
            </p>
          ) : (
            <BarChart data={data.enquiries.byMonth} />
          )}
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h2 className="font-semibold text-admin-text-primary mb-4">
              Where enquiries come from
            </h2>
            {data.enquiries.bySource.length === 0 ? (
              <p className="text-sm text-admin-text-secondary">Nothing yet.</p>
            ) : (
              <Breakdown data={data.enquiries.bySource} total={totalEnquiries} />
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-admin-text-primary mb-4">
              Lead status
            </h2>
            {data.enquiries.byStatus.length === 0 ? (
              <p className="text-sm text-admin-text-secondary">Nothing yet.</p>
            ) : (
              <Breakdown data={data.enquiries.byStatus} total={totalByStatus} />
            )}
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="font-semibold text-admin-text-primary mb-1">
            Package performance
          </h2>
          <p className="text-sm text-admin-text-secondary mb-4">
            Ranked by the number of enquiries attributed to each package.
          </p>
          {data.topPackages.length === 0 ? (
            <p className="text-sm text-admin-text-secondary">
              No package-attributed enquiries yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {data.topPackages.map((pkg, index) => {
                const max = data.topPackages[0].count || 1;
                return (
                  <li key={pkg._id} className="flex items-center gap-3">
                    <span className="text-xs text-admin-text-secondary w-5 tabular-nums">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-admin-text-primary truncate">
                          {pkg.title}
                        </span>
                        <Badge>{pkg.category}</Badge>
                      </div>
                      <div className="h-1.5 rounded-full bg-admin-bg overflow-hidden">
                        <div
                          className="h-full bg-admin-accent rounded-full"
                          style={{ width: `${(pkg.count / max) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-admin-text-secondary tabular-nums">
                      {pkg.count}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="p-5">
            <h2 className="font-semibold text-admin-text-primary mb-4">
              Careers funnel
            </h2>
            {Object.keys(applicationsByJob).length === 0 ? (
              <p className="text-sm text-admin-text-secondary">
                No applications received yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wider text-admin-text-secondary">
                      <th className="pb-2">Role</th>
                      <th className="pb-2 text-right">New</th>
                      <th className="pb-2 text-right">Reviewed</th>
                      <th className="pb-2 text-right">Shortlisted</th>
                      <th className="pb-2 text-right">Rejected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(applicationsByJob).map(([job, statuses]) => (
                      <tr key={job} className="border-t border-admin-border">
                        <td className="py-2 text-admin-text-primary">{job}</td>
                        {["New", "Reviewed", "Shortlisted", "Rejected"].map((s) => (
                          <td
                            key={s}
                            className="py-2 text-right tabular-nums text-admin-text-secondary"
                          >
                            {statuses[s] ?? 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="font-semibold text-admin-text-primary mb-4">
              Content activity
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {(["packages", "caseStudies", "insights"] as const).map((key) => (
                <div key={key}>
                  <p className="text-xs uppercase tracking-wider text-admin-text-secondary mb-1">
                    {key === "caseStudies" ? "Case studies" : key}
                  </p>
                  <p className="text-2xl font-semibold text-admin-text-primary tabular-nums">
                    {content.published[key]}
                  </p>
                  <p className="text-xs text-admin-text-secondary">
                    published · {content.drafts[key]} draft
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
