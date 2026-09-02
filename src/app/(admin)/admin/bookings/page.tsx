"use client";

import { useState } from "react";
import { CalendarCheck, Mail, Phone, Users, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { useResourceList } from "@/hooks/useResourceList";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  Modal,
  PageHeader,
  Select,
  Textarea,
  toast,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { BOOKING_STATUSES } from "@/lib/constants";

type Row = {
  _id: string;
  reference: string;
  packageTitle: string;
  leadName: string;
  email: string;
  phone: string;
  company?: string;
  adults: number;
  children: number;
  travelDate?: string;
  flexibleDates: boolean;
  roomPreference?: string;
  addOns: string[];
  specialRequests?: string;
  pricePerPerson?: number;
  currency: string;
  estimatedTotal?: number;
  status: string;
  notes?: string;
  createdAt: string;
  packageId?: { title?: string; slug?: string };
};

const TONE: Record<string, "warning" | "info" | "success" | "danger" | "neutral"> = {
  Requested: "warning",
  Quoted: "info",
  Confirmed: "success",
  Paid: "success",
  Cancelled: "danger",
};

export default function BookingsPage() {
  const list = useResourceList<Row>("/api/bookings", { status: "All" });
  const [selected, setSelected] = useState<Row | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const money = (amount?: number, currency = "INR") =>
    amount === undefined
      ? "—"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency,
          maximumFractionDigits: 0,
        }).format(amount);

  const setStatus = async (id: string, status: string) => {
    try {
      await api(`/api/bookings/${id}`, { method: "PATCH", json: { status } });
      toast(`Marked as ${status}`);
      setSelected((prev) => (prev && prev._id === id ? { ...prev, status } : prev));
      await list.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update", "error");
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api(`/api/bookings/${selected._id}`, {
        method: "PATCH",
        json: { notes },
      });
      toast("Notes saved");
      await list.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<Row>[] = [
    {
      key: "reference",
      header: "Reference",
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-admin-text-primary">
          {row.reference}
        </span>
      ),
    },
    {
      key: "lead",
      header: "Lead traveller",
      render: (row) => (
        <div>
          <p className="font-medium text-admin-text-primary">{row.leadName}</p>
          <p className="text-xs text-admin-text-secondary">{row.email}</p>
        </div>
      ),
    },
    {
      key: "package",
      header: "Package",
      render: (row) => (
        <span className="line-clamp-1 max-w-[16rem]">{row.packageTitle}</span>
      ),
    },
    {
      key: "party",
      header: "Party",
      render: (row) => (
        <span className="whitespace-nowrap">
          {row.adults}A{row.children ? ` + ${row.children}C` : ""}
        </span>
      ),
    },
    {
      key: "travelDate",
      header: "Travel",
      render: (row) =>
        row.flexibleDates ? "Flexible" : formatDate(row.travelDate),
    },
    {
      key: "total",
      header: "Indicative",
      render: (row) => (
        <span className="tabular-nums">
          {money(row.estimatedTotal, row.currency)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "170px",
      render: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={row.status}
            onChange={(e) => setStatus(row._id, e.target.value)}
            aria-label={`Status for ${row.reference}`}
            className="text-xs h-8 py-0"
          >
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Booking requests from the site. No payment is captured — each one needs a quote before it is confirmed."
      />

      <DataTable
        rows={list.items}
        columns={columns}
        loading={list.loading}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search reference, name, email or package…"
        onRowClick={(row) => {
          setSelected(row);
          setNotes(row.notes ?? "");
        }}
        page={list.page}
        pages={list.pages}
        total={list.total}
        onPageChange={list.setPage}
        filters={
          <Select
            value={list.filters.status}
            onChange={(e) => list.setFilter("status", e.target.value)}
            className="w-auto"
            aria-label="Filter by status"
          >
            <option value="All">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        }
        empty={
          <EmptyState
            icon={<CalendarCheck className="size-10" />}
            title="No booking requests yet"
            message="Requests submitted from a package page land here with a reference number."
          />
        }
      />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.reference ?? ""}
        description={
          selected ? `Requested ${formatDate(selected.createdAt, true)}` : ""
        }
        footer={
          <>
            <Button
              variant="danger"
              onClick={() => {
                setPendingDelete(selected);
                setSelected(null);
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
            <Button variant="secondary" loading={saving} onClick={saveNotes}>
              Save notes
            </Button>
            <a href={`mailto:${selected?.email}?subject=Your booking ${selected?.reference}`}>
              <Button>
                <Mail className="size-4" /> Send a quote
              </Button>
            </a>
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone={TONE[selected.status] ?? "neutral"}>
                {selected.status}
              </Badge>
              <Badge>{selected.packageTitle}</Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <span className="flex items-center gap-2 text-admin-text-secondary">
                <Mail className="size-4 shrink-0" />
                <a href={`mailto:${selected.email}`} className="hover:text-admin-accent">
                  {selected.email}
                </a>
              </span>
              <span className="flex items-center gap-2 text-admin-text-secondary">
                <Phone className="size-4 shrink-0" />
                <a href={`tel:${selected.phone}`} className="hover:text-admin-accent">
                  {selected.phone}
                </a>
              </span>
              <span className="flex items-center gap-2 text-admin-text-secondary">
                <Users className="size-4 shrink-0" />
                {selected.adults} adults
                {selected.children ? `, ${selected.children} children` : ""}
              </span>
              <span className="flex items-center gap-2 text-admin-text-secondary">
                <CalendarCheck className="size-4 shrink-0" />
                {selected.flexibleDates
                  ? "Flexible dates"
                  : formatDate(selected.travelDate)}
              </span>
            </div>

            <div className="rounded-lg border border-admin-border bg-admin-bg p-4 grid gap-3 sm:grid-cols-3 text-sm">
              <Detail
                label="Price per person"
                value={money(selected.pricePerPerson, selected.currency)}
              />
              <Detail
                label="Indicative total"
                value={money(selected.estimatedTotal, selected.currency)}
              />
              <Detail label="Rooms" value={selected.roomPreference ?? "No preference"} />
            </div>

            {selected.addOns?.length > 0 && (
              <Field label="Requested add-ons">
                <div className="flex flex-wrap gap-2">
                  {selected.addOns.map((addOn) => (
                    <Badge key={addOn} tone="info">
                      {addOn}
                    </Badge>
                  ))}
                </div>
              </Field>
            )}

            {selected.specialRequests && (
              <Field label="Special requests">
                <p className="whitespace-pre-wrap rounded-md border border-admin-border bg-admin-bg p-3 text-sm text-admin-text-primary">
                  {selected.specialRequests}
                </p>
              </Field>
            )}

            <Field label="Status">
              <Select
                value={selected.status}
                onChange={(e) => setStatus(selected._id, e.target.value)}
              >
                {BOOKING_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Internal notes" hint="Only visible to your team.">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Quoted 12 Aug, holding rooms until Friday."
              />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this booking request?"
        message={`Request ${pendingDelete?.reference} will be removed permanently.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await list.remove(pendingDelete._id, "Booking");
          setPendingDelete(null);
        }}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-admin-text-secondary">
        {label}
      </p>
      <p className="text-sm text-admin-text-primary">{value}</p>
    </div>
  );
}
