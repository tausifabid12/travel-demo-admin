"use client";

import { forwardRef, useEffect, useId, useState } from "react";
import { X, Check, ChevronDown, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------- Button ------------------------------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-admin-accent text-white hover:bg-admin-accent-hover disabled:hover:bg-admin-accent",
  secondary:
    "bg-admin-surface-hover text-admin-text-primary border border-admin-border hover:border-admin-accent/60",
  ghost:
    "text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-surface-hover",
  danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
};

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
  }
>(function Button(
  { className, variant = "primary", size = "md", loading, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-accent focus-visible:ring-offset-2 focus-visible:ring-offset-admin-bg",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        BUTTON_VARIANTS[variant],
        BUTTON_SIZES[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="size-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
});

/* -------------------------------- Field ------------------------------- */

export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-xs font-medium uppercase tracking-wide text-admin-text-secondary">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="size-3" /> {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-admin-text-secondary/70">{hint}</p>
      ) : null}
    </div>
  );
}

const CONTROL = [
  "w-full rounded-md bg-admin-bg border border-admin-border px-3 py-2 text-sm text-admin-text-primary",
  "placeholder:text-admin-text-secondary/50",
  "focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent",
  "disabled:opacity-50",
].join(" ");

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(CONTROL, invalid && "border-red-500/60", className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea ref={ref} rows={rows} className={cn(CONTROL, "resize-y", className)} {...props} />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(CONTROL, "appearance-none pr-9 cursor-pointer", className)}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-admin-text-secondary pointer-events-none" />
    </div>
  );
});

export function Checkbox({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center gap-2.5 cursor-pointer select-none text-sm text-admin-text-primary",
        className,
      )}
    >
      <span className="relative flex items-center justify-center">
        <input id={id} type="checkbox" className="peer sr-only" {...props} />
        <span className="size-4 rounded border border-admin-border bg-admin-bg peer-checked:bg-admin-accent peer-checked:border-admin-accent transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-admin-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-admin-bg" />
        <Check className="size-3 absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
      </span>
      {label}
    </label>
  );
}

/* -------------------------------- Badge ------------------------------- */

const BADGE_TONES = {
  neutral: "bg-admin-surface-hover text-admin-text-secondary border-admin-border",
  success: "bg-green-500/10 text-green-400 border-green-500/25",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/25",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  danger: "bg-red-500/10 text-red-400 border-red-500/25",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status?: string }) {
  const tone: BadgeTone =
    status === "published" || status === "active" || status === "Converted"
      ? "success"
      : status === "draft" || status === "New"
        ? "warning"
        : status === "Rejected" || status === "closed"
          ? "danger"
          : "neutral";
  return <Badge tone={tone}>{status ?? "—"}</Badge>;
}

/* -------------------------------- Modal ------------------------------- */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-md", md: "max-w-2xl", lg: "max-w-4xl" };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative w-full bg-admin-surface border border-admin-border rounded-xl shadow-2xl my-auto",
          widths[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-admin-border">
          <div>
            <h2 className="text-lg font-semibold text-admin-text-primary">{title}</h2>
            {description && (
              <p className="text-sm text-admin-text-secondary mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-admin-text-secondary hover:text-admin-text-primary transition-colors p-1 -m-1"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-5 border-t border-admin-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Delete",
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-admin-text-secondary">{message}</p>
    </Modal>
  );
}

/* -------------------------------- Tabs -------------------------------- */

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-admin-border overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            active === tab.id
              ? "border-admin-accent text-admin-text-primary"
              : "border-transparent text-admin-text-secondary hover:text-admin-text-primary",
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 text-xs text-admin-text-secondary">{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- Toast ------------------------------- */

type Toast = { id: number; message: string; tone: "success" | "error" };

let pushToast: ((t: Omit<Toast, "id">) => void) | null = null;

export function toast(message: string, tone: Toast["tone"] = "success") {
  pushToast?.({ message, tone });
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    pushToast = (t) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { ...t, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4000);
    };
    return () => {
      pushToast = null;
    };
  }, []);

  return (
    <div
      className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-xl backdrop-blur",
            t.tone === "success"
              ? "bg-green-500/10 border-green-500/30 text-green-300"
              : "bg-red-500/10 border-red-500/30 text-red-300",
          )}
        >
          {t.tone === "success" ? (
            <Check className="size-4 shrink-0" />
          ) : (
            <AlertCircle className="size-4 shrink-0" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Empty state --------------------------- */

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center p-12">
      {icon && <div className="text-admin-text-secondary/50 mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-admin-text-primary mb-1.5">{title}</h3>
      <p className="text-sm text-admin-text-secondary max-w-md mb-6">{message}</p>
      {action}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-5 rounded-full border-2 border-admin-text-secondary/30 border-t-admin-accent animate-spin",
        className,
      )}
    />
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-admin-text-primary">{title}</h1>
        {description && (
          <p className="text-admin-text-secondary text-sm mt-1">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-admin-surface border border-admin-border rounded-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}
