"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import { api } from "@/lib/client";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Badge, Card, EmptyState, PageHeader, Select } from "@/components/ui";
import { formatDate } from "@/lib/utils";

type Purchase = {
  _id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  transactionId?: string;
  createdAt: string;
  packageId?: { title?: string };
};

type Result = {
  items: Purchase[];
  total: number;
  page: number;
  pages: number;
  revenue: number;
};

const TONE: Record<string, "warning" | "success" | "danger" | "neutral"> = {
  Pending: "warning",
  Completed: "success",
  Failed: "danger",
  Refunded: "neutral",
};

export default function FinancePage() {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);

  const changeFilter = (next: string) => {
    setLoading(true);
    setPage(1);
    setStatus(next);
  };

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams({ page: String(page), limit: "25" });
    if (status !== "All") params.set("status", status);

    api<Result>(`/api/finance?${params}`)
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
  }, [status, page]);

  const money = (amount: number, currency = "INR") =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);

  const columns: Column<Purchase>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div>
          <p className="font-medium text-admin-text-primary">{row.customerName}</p>
          <p className="text-xs text-admin-text-secondary">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      key: "package",
      header: "Package",
      render: (row) => row.packageId?.title ?? "—",
    },
    {
      key: "amount",
      header: "Amount",
      render: (row) => (
        <span className="tabular-nums text-admin-text-primary">
          {money(row.amount, row.currency)}
        </span>
      ),
    },
    {
      key: "transaction",
      header: "Transaction",
      render: (row) => (
        <span className="font-mono text-xs">{row.transactionId ?? "—"}</span>
      ),
    },
    { key: "date", header: "Date", render: (row) => formatDate(row.createdAt) },
    {
      key: "status",
      header: "Status",
      align: "right",
      render: (row) => <Badge tone={TONE[row.status] ?? "neutral"}>{row.status}</Badge>,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Package purchases and payment records."
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-admin-text-secondary mb-2">
            Completed revenue
          </p>
          <p className="text-3xl font-semibold text-admin-text-primary tabular-nums">
            {money(data?.revenue ?? 0)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-admin-text-secondary mb-2">
            Transactions
          </p>
          <p className="text-3xl font-semibold text-admin-text-primary tabular-nums">
            {data?.total ?? 0}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs uppercase tracking-wider text-admin-text-secondary mb-2">
            Payment gateway
          </p>
          <p className="text-sm text-admin-text-secondary mt-2">
            PhonePe credentials are stored in Settings, but no checkout is wired up
            yet — nothing creates a purchase today.
          </p>
        </Card>
      </div>

      <DataTable
        rows={data?.items ?? []}
        columns={columns}
        loading={loading}
        page={data?.page}
        pages={data?.pages}
        total={data?.total}
        onPageChange={(next) => {
          setLoading(true);
          setPage(next);
        }}
        filters={
          <Select
            value={status}
            onChange={(e) => changeFilter(e.target.value)}
            className="w-auto"
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </Select>
        }
        empty={
          <EmptyState
            icon={<Wallet className="size-10" />}
            title="No transactions"
            message="Purchases appear here once a payment gateway is connected."
          />
        }
      />
    </div>
  );
}
