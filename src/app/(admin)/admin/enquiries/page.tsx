"use client";

import { useState } from "react";
import { Inbox, Download, Mail, Phone, Building2, Trash2 } from "lucide-react";
import { api } from "@/lib/client";
import { useResourceList } from "@/hooks/useResourceList";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Badge,
  Button,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  Textarea,
  toast,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { ENQUIRY_STATUSES, ENQUIRY_SOURCES } from "@/lib/constants";

type Row = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  source: string;
  sourcePage?: string;
  groupSize?: string;
  preferredDates?: string;
  budgetRange?: string;
  serviceInterest?: string;
  status: string;
  notes?: string;
  createdAt: string;
  packageId?: { title?: string; slug?: string };
};

const TONE: Record<string, "warning" | "info" | "success" | "neutral"> = {
  New: "warning",
  "In Progress": "info",
  Responded: "info",
  Converted: "success",
  Archived: "neutral",
};

export default function EnquiriesPage() {
  const list = useResourceList<Row>("/api/enquiries", {
    status: "All",
    source: "All",
    from: "",
    to: "",
  });
  const [selected, setSelected] = useState<Row | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  const setStatus = async (id: string, status: string) => {
    try {
      await api(`/api/enquiries/${id}`, { method: "PATCH", json: { status } });
      toast(`Marked as ${status}`);
      setSelected((prev) => (prev && prev._id === id ? { ...prev, status } : prev));
      await list.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not update", "error");
    }
  };

  const saveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await api(`/api/enquiries/${selected._id}`, { method: "PATCH", json: { notes } });
      toast("Notes saved");
      await list.reload();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save", "error");
    } finally {
      setSavingNotes(false);
    }
  };

  const exportCsv = () => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(list.filters)) {
      if (value && value !== "All") params.set(key, value);
    }
    // An anchor click lets the browser act on Content-Disposition and save the
    // file, which a client-side route push would not do.
    const link = document.createElement("a");
    link.href = `/api/enquiries/export?${params}`;
    link.download = "";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "From",
      render: (row) => (
        <div>
          <p className="font-medium text-admin-text-primary">{row.name}</p>
          <p className="text-xs text-admin-text-secondary">
            {row.company ? `${row.company} · ` : ""}
            {row.email}
          </p>
        </div>
      ),
    },
    {
      key: "source",
      header: "Source",
      render: (row) => (
        <div>
          <Badge>{row.source}</Badge>
          {row.packageId?.title && (
            <p className="text-xs mt-1 truncate max-w-[180px]">
              {row.packageId.title}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "message",
      header: "Message",
      render: (row) => (
        <span className="line-clamp-2 max-w-sm">{row.message}</span>
      ),
    },
    {
      key: "received",
      header: "Received",
      render: (row) => formatDate(row.createdAt),
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
            aria-label={`Status for ${row.name}`}
            className="text-xs h-8 py-0"
          >
            {ENQUIRY_STATUSES.map((s) => (
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
        title="Enquiries & Leads"
        description="Every enquiry from the site, in one inbox."
        actions={
          <Button variant="secondary" onClick={exportCsv}>
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <DataTable
        rows={list.items}
        columns={columns}
        loading={list.loading}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search name, email, company or message…"
        onRowClick={(row) => {
          setSelected(row);
          setNotes(row.notes ?? "");
        }}
        page={list.page}
        pages={list.pages}
        total={list.total}
        onPageChange={list.setPage}
        filters={
          <>
            <Select
              value={list.filters.status}
              onChange={(e) => list.setFilter("status", e.target.value)}
              className="w-auto"
              aria-label="Filter by status"
            >
              <option value="All">All statuses</option>
              {ENQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              value={list.filters.source}
              onChange={(e) => list.setFilter("source", e.target.value)}
              className="w-auto"
              aria-label="Filter by source"
            >
              <option value="All">All sources</option>
              {ENQUIRY_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              value={list.filters.from}
              onChange={(e) => list.setFilter("from", e.target.value)}
              aria-label="From date"
              className="w-auto"
            />
            <Input
              type="date"
              value={list.filters.to}
              onChange={(e) => list.setFilter("to", e.target.value)}
              aria-label="To date"
              className="w-auto"
            />
          </>
        }
        empty={
          <EmptyState
            icon={<Inbox className="size-10" />}
            title="No enquiries yet"
            message="Enquiries from the contact form and package pages arrive here."
          />
        }
      />

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.name ?? ""}
        description={selected ? `Received ${formatDate(selected.createdAt, true)}` : ""}
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
            <Button variant="secondary" loading={savingNotes} onClick={saveNotes}>
              Save notes
            </Button>
            <a href={`mailto:${selected?.email}`}>
              <Button>
                <Mail className="size-4" /> Reply by email
              </Button>
            </a>
          </>
        }
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap gap-2">
              <Badge tone={TONE[selected.status] ?? "neutral"}>{selected.status}</Badge>
              <Badge>{selected.source}</Badge>
              {selected.sourcePage && (
                <span className="text-xs text-admin-text-secondary self-center">
                  from {selected.sourcePage}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <span className="flex items-center gap-2 text-admin-text-secondary">
                <Mail className="size-4 shrink-0" />
                <a href={`mailto:${selected.email}`} className="hover:text-admin-accent">
                  {selected.email}
                </a>
              </span>
              {selected.phone && (
                <span className="flex items-center gap-2 text-admin-text-secondary">
                  <Phone className="size-4 shrink-0" />
                  <a href={`tel:${selected.phone}`} className="hover:text-admin-accent">
                    {selected.phone}
                  </a>
                </span>
              )}
              {selected.company && (
                <span className="flex items-center gap-2 text-admin-text-secondary">
                  <Building2 className="size-4 shrink-0" /> {selected.company}
                </span>
              )}
            </div>

            {(selected.groupSize ||
              selected.preferredDates ||
              selected.budgetRange ||
              selected.serviceInterest ||
              selected.packageId?.title) && (
              <div className="rounded-lg border border-admin-border bg-admin-bg p-4 grid sm:grid-cols-2 gap-3 text-sm">
                {selected.packageId?.title && (
                  <Detail label="Package" value={selected.packageId.title} />
                )}
                {selected.serviceInterest && (
                  <Detail label="Service interest" value={selected.serviceInterest} />
                )}
                {selected.groupSize && (
                  <Detail label="Group size" value={selected.groupSize} />
                )}
                {selected.preferredDates && (
                  <Detail label="Preferred dates" value={selected.preferredDates} />
                )}
                {selected.budgetRange && (
                  <Detail label="Budget" value={selected.budgetRange} />
                )}
              </div>
            )}

            <Field label="Message">
              <p className="text-sm text-admin-text-primary whitespace-pre-wrap rounded-md border border-admin-border bg-admin-bg p-3">
                {selected.message}
              </p>
            </Field>

            <Field label="Status">
              <Select
                value={selected.status}
                onChange={(e) => setStatus(selected._id, e.target.value)}
              >
                {ENQUIRY_STATUSES.map((s) => (
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
                placeholder="Called on the 12th, sending a proposal Thursday."
              />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this enquiry?"
        message={`The enquiry from ${pendingDelete?.name} will be removed permanently.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await list.remove(pendingDelete._id, "Enquiry");
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
