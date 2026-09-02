"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  submitEnquiry,
  submitApplication,
  INITIAL_FORM_STATE,
  type FormState,
} from "@/app/actions";

/* ------------------------------ Primitives ---------------------------- */

const CONTROL = [
  "w-full border-0 border-b border-line bg-transparent px-0 py-3",
  "text-base text-ink placeholder:text-muted/70",
  "transition-colors focus:border-ink focus:outline-none focus:ring-0",
].join(" ");

export function FormField({
  label,
  name,
  type = "text",
  required,
  placeholder,
  errors,
  className,
  children,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  errors?: string[];
  className?: string;
  children?: React.ReactNode;
}) {
  const invalid = Boolean(errors?.length);
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={name}
        className="text-[0.6875rem] uppercase tracking-[0.18em] text-muted"
      >
        {label}
        {required && <span className="text-gold ml-1">*</span>}
      </label>
      {children ?? (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? `${name}-error` : undefined}
          className={cn(CONTROL, invalid && "border-red-500")}
        />
      )}
      {invalid && (
        <p id={`${name}-error`} className="text-xs text-red-600 mt-1">
          {errors![0]}
        </p>
      )}
    </div>
  );
}

export function FormTextarea({
  label,
  name,
  required,
  placeholder,
  errors,
  rows = 4,
  className,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  errors?: string[];
  rows?: number;
  className?: string;
}) {
  return (
    <FormField label={label} name={name} required={required} errors={errors} className={className}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        required={required}
        placeholder={placeholder}
        aria-invalid={Boolean(errors?.length) || undefined}
        className={cn(CONTROL, "resize-y", errors?.length && "border-red-500")}
      />
    </FormField>
  );
}

export function FormSelect({
  label,
  name,
  options,
  required,
  errors,
  className,
}: {
  label: string;
  name: string;
  options: readonly string[];
  required?: boolean;
  errors?: string[];
  className?: string;
}) {
  return (
    <FormField label={label} name={name} required={required} errors={errors} className={className}>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        className={cn(CONTROL, "cursor-pointer", errors?.length && "border-red-500")}
      >
        <option value="" disabled>
          Please choose…
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FormField>
  );
}

/** Hidden from people, irresistible to bots. */
function Honeypot() {
  return (
    <div aria-hidden className="absolute left-[-9999px] w-px h-px overflow-hidden">
      <label htmlFor="website">Leave this field empty</label>
      <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}

function SubmitButton({
  children,
  light,
}: {
  children: React.ReactNode;
  light?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "group inline-flex items-center justify-center gap-2.5 rounded-full px-8 py-4",
        "text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-60",
        light
          ? "bg-white text-ink hover:bg-white/90"
          : "bg-ink text-canvas hover:bg-accent",
      )}
    >
      {pending ? "Sending…" : children}
      {!pending && (
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </button>
  );
}

function Banner({ state }: { state: FormState }) {
  if (state.status === "idle") return null;
  const success = state.status === "success";
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-md border p-4 text-sm",
        success
          ? "border-green-600/30 bg-green-50 text-green-900"
          : "border-red-500/30 bg-red-50 text-red-900",
      )}
    >
      {success ? (
        <Check className="size-4 shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
      )}
      {state.message}
    </div>
  );
}

/* ----------------------------- Enquiry form --------------------------- */

const BUDGET_RANGES = [
  "Under ₹10 lakh",
  "₹10–25 lakh",
  "₹25–50 lakh",
  "₹50 lakh–1 crore",
  "Over ₹1 crore",
  "Not sure yet",
] as const;

const SERVICE_INTERESTS = [
  "Corporate Travel",
  "MICE",
  "Incentive Travel",
  "Corporate Offsite",
  "Conference",
  "Experia / Live Events",
  "Something else",
] as const;

export function EnquiryForm({
  source,
  sourcePage,
  packageId,
  packageTitle,
  variant = "package",
}: {
  source: string;
  sourcePage?: string;
  packageId?: string;
  packageTitle?: string;
  variant?: "package" | "contact";
}) {
  const [state, action] = useActionState(submitEnquiry, INITIAL_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center">
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-green-600/10 text-green-700">
          <Check className="size-6" />
        </span>
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-ink mb-2">
          Thank you
        </h3>
        <p className="text-body">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-8">
      <Honeypot />
      <input type="hidden" name="source" value={source} />
      {sourcePage && <input type="hidden" name="sourcePage" value={sourcePage} />}
      {packageId && <input type="hidden" name="packageId" value={packageId} />}

      {packageTitle && (
        <p className="text-sm text-muted">
          Enquiring about <span className="text-ink">{packageTitle}</span>
        </p>
      )}

      <Banner state={state} />

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
        <FormField
          label="Name"
          name="name"
          required
          placeholder="Your full name"
          errors={errors.name}
        />
        <FormField
          label="Company"
          name="company"
          placeholder="Where you work"
          errors={errors.company}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          errors={errors.email}
        />
        <FormField
          label="Phone"
          name="phone"
          type="tel"
          placeholder="+91 …"
          errors={errors.phone}
        />

        {variant === "package" ? (
          <>
            <FormField
              label="Group size"
              name="groupSize"
              placeholder="How many travelling"
              errors={errors.groupSize}
            />
            <FormField
              label="Preferred dates"
              name="preferredDates"
              placeholder="e.g. February 2027"
              errors={errors.preferredDates}
            />
            <FormSelect
              label="Budget range"
              name="budgetRange"
              options={BUDGET_RANGES}
              errors={errors.budgetRange}
              className="sm:col-span-2"
            />
          </>
        ) : (
          <FormSelect
            label="Service interest"
            name="serviceInterest"
            options={SERVICE_INTERESTS}
            errors={errors.serviceInterest}
            className="sm:col-span-2"
          />
        )}

        <FormTextarea
          label={variant === "package" ? "Custom requirements" : "Message"}
          name="message"
          required
          rows={4}
          placeholder={
            variant === "package"
              ? "Tell us what you have in mind — objectives, must-haves, anything to avoid."
              : "How can we help?"
          }
          errors={errors.message}
          className="sm:col-span-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <SubmitButton>
          {variant === "package" ? "Request a proposal" : "Send enquiry"}
        </SubmitButton>
        <p className="text-xs text-muted max-w-xs">
          We use your details only to respond to this enquiry. See our{" "}
          <a href="/privacy" className="underline underline-offset-2">
            privacy policy
          </a>
          .
        </p>
      </div>
    </form>
  );
}

/* --------------------------- Application form ------------------------- */

export function ApplicationForm({
  careerId,
  jobTitle,
}: {
  careerId: string;
  jobTitle: string;
}) {
  const [state, action] = useActionState(submitApplication, INITIAL_FORM_STATE);
  const errors = state.fieldErrors ?? {};

  if (state.status === "success") {
    return (
      <div className="rounded-lg border border-line bg-surface p-10 text-center">
        <span className="mx-auto mb-5 grid size-12 place-items-center rounded-full bg-green-600/10 text-green-700">
          <Check className="size-6" />
        </span>
        <h3 className="font-[family-name:var(--font-display)] text-2xl text-ink mb-2">
          Application received
        </h3>
        <p className="text-body">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="relative flex flex-col gap-8">
      <Honeypot />
      <input type="hidden" name="careerId" value={careerId} />

      <Banner state={state} />

      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-7">
        <FormField label="Name" name="name" required errors={errors.name} />
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          errors={errors.email}
        />
        <FormField label="Phone" name="phone" type="tel" errors={errors.phone} />
        <FormField
          label="LinkedIn"
          name="linkedinUrl"
          type="url"
          placeholder="https://linkedin.com/in/…"
          errors={errors.linkedinUrl}
        />
        <FormField
          label="Link to your CV"
          name="resumeUrl"
          type="url"
          required
          placeholder="A public Google Drive, Dropbox or personal-site link"
          errors={errors.resumeUrl}
          className="sm:col-span-2"
        />
        <FormTextarea
          label="Why this role"
          name="coverLetter"
          rows={5}
          placeholder={`Tell us why ${jobTitle} is the right next step for you.`}
          errors={errors.coverLetter}
          className="sm:col-span-2"
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <SubmitButton>Submit application</SubmitButton>
        <p className="text-xs text-muted max-w-xs">
          Make sure your CV link is publicly viewable, or we will not be able to
          open it.
        </p>
      </div>
    </form>
  );
}
