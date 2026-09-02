"use client";

import { useState } from "react";
import { UserCog, Plus, Pencil, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { api } from "@/lib/client";
import { useResourceList } from "@/hooks/useResourceList";
import { DataTable, type Column } from "@/components/ui/DataTable";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  Modal,
  PageHeader,
  Select,
  toast,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";
import { ROLES } from "@/lib/permissions";

type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

const ROLE_INFO: Record<string, { label: string; description: string }> = {
  SuperAdmin: {
    label: "Super Admin",
    description: "Everything, including users, settings and deletion.",
  },
  ContentManager: {
    label: "Content Manager",
    description: "Create, edit and publish content. Cannot delete or manage users.",
  },
  HRAdmin: {
    label: "HR Admin",
    description: "Careers and job applications only.",
  },
  Sales: {
    label: "Sales / BD",
    description: "Enquiries only — can update status and export.",
  },
  Editor: {
    label: "Editor",
    description: "Can draft content but never publish it.",
  },
};

const BLANK = {
  name: "",
  email: "",
  password: "",
  role: "Editor",
  isActive: true,
};

export default function UsersPage() {
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string } | undefined)?.id;

  const list = useResourceList<User>("/api/users", { role: "All" });
  const [editing, setEditing] = useState<User | null>(null);
  const [draft, setDraft] = useState(BLANK);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);

  const openNew = () => {
    setEditing(null);
    setDraft(BLANK);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setDraft({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setErrors({});
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setErrors({});
    try {
      // An empty password on edit means "leave it unchanged".
      const payload = editing && !draft.password
        ? { ...draft, password: undefined }
        : draft;

      await api(editing ? `/api/users/${editing._id}` : "/api/users", {
        method: editing ? "PUT" : "POST",
        json: payload,
      });
      toast(editing ? "User updated" : "User created");
      setOpen(false);
      await list.reload();
    } catch (err) {
      const fieldErrors = (err as { fieldErrors?: Record<string, string[]> })
        .fieldErrors;
      if (fieldErrors) {
        setErrors(fieldErrors);
        toast("Check the highlighted fields", "error");
      } else {
        toast(err instanceof Error ? err.message : "Could not save", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      render: (row) => (
        <div>
          <p className="font-medium text-admin-text-primary">
            {row.name}
            {row._id === currentUserId && (
              <span className="text-admin-text-secondary text-xs"> (you)</span>
            )}
          </p>
          <p className="text-xs text-admin-text-secondary">{row.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (row) => (
        <div>
          <Badge tone={row.role === "SuperAdmin" ? "info" : "neutral"}>
            {ROLE_INFO[row.role]?.label ?? row.role}
          </Badge>
          <p className="text-xs mt-1 max-w-xs">{ROLE_INFO[row.role]?.description}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Access",
      render: (row) =>
        row.isActive ? (
          <Badge tone="success">Active</Badge>
        ) : (
          <Badge tone="danger">Disabled</Badge>
        ),
    },
    { key: "created", header: "Added", render: (row) => formatDate(row.createdAt) },
    {
      key: "actions",
      header: "",
      align: "right",
      width: "120px",
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Edit ${row.name}`}
            onClick={(e) => {
              e.stopPropagation();
              openEdit(row);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${row.name}`}
            disabled={row._id === currentUserId}
            title={
              row._id === currentUserId ? "You cannot delete your own account" : undefined
            }
            onClick={(e) => {
              e.stopPropagation();
              setPendingDelete(row);
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users & Roles"
        description="Who can sign in, and what each of them can reach."
        actions={
          <Button onClick={openNew}>
            <Plus className="size-4" /> Add user
          </Button>
        }
      />

      <DataTable
        rows={list.items}
        columns={columns}
        loading={list.loading}
        search={list.search}
        onSearch={list.setSearch}
        searchPlaceholder="Search by name or email…"
        onRowClick={openEdit}
        page={list.page}
        pages={list.pages}
        total={list.total}
        onPageChange={list.setPage}
        filters={
          <Select
            value={list.filters.role}
            onChange={(e) => list.setFilter("role", e.target.value)}
            className="w-auto"
            aria-label="Filter by role"
          >
            <option value="All">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_INFO[r].label}
              </option>
            ))}
          </Select>
        }
        empty={
          <EmptyState
            icon={<UserCog className="size-10" />}
            title="No users"
            message="Add a teammate so they can sign in to the admin."
            action={
              <Button onClick={openNew}>
                <Plus className="size-4" /> Add user
              </Button>
            }
          />
        }
      />

      <Card className="p-5 mt-6">
        <h2 className="font-semibold text-admin-text-primary mb-3">
          What each role can do
        </h2>
        <ul className="grid sm:grid-cols-2 gap-3">
          {ROLES.map((role) => (
            <li key={role} className="flex gap-3">
              <Badge tone={role === "SuperAdmin" ? "info" : "neutral"}>
                {ROLE_INFO[role].label}
              </Badge>
              <span className="text-sm text-admin-text-secondary flex-1">
                {ROLE_INFO[role].description}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? `Edit ${editing.name}` : "Add a user"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={save}>
              {editing ? "Save changes" : "Create user"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Name" required error={errors.name?.[0]}>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              invalid={Boolean(errors.name)}
            />
          </Field>
          <Field label="Email" required error={errors.email?.[0]}>
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              invalid={Boolean(errors.email)}
            />
          </Field>
          <Field
            label={editing ? "New password" : "Password"}
            required={!editing}
            hint={
              editing
                ? "Leave blank to keep the current password."
                : "At least 8 characters."
            }
            error={errors.password?.[0]}
          >
            <Input
              type="password"
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              autoComplete="new-password"
            />
          </Field>
          <Field label="Role" required>
            <Select
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_INFO[r].label}
                </option>
              ))}
            </Select>
            <p className="text-xs text-admin-text-secondary mt-1.5">
              {ROLE_INFO[draft.role]?.description}
            </p>
          </Field>
          <Checkbox
            label="Account is active — they can sign in"
            checked={draft.isActive}
            onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete this user?"
        message={`${pendingDelete?.name} will lose access immediately. Consider disabling the account instead if you may need it later.`}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await list.remove(pendingDelete._id, "User");
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
