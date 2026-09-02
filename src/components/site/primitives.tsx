import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------ Container ----------------------------- */

export function Container({
  children,
  className,
  size = "default",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "narrow" | "default" | "wide";
}) {
  const widths = {
    narrow: "max-w-2xl",
    default: "max-w-5xl",
    wide: "max-w-[78rem]",
  };
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6", widths[size], className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("py-9 sm:py-12 lg:py-16", className)}>
      {children}
    </section>
  );
}

/* ----------------------------- Typography ----------------------------- */

/** Small-caps label that sits above a heading. */
export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1",
        "text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-brand",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-brand" aria-hidden />
      {children}
    </p>
  );
}

export function Display({
  children,
  as: Tag = "h2",
  size = "md",
  className,
}: {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "p";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    sm: "text-[length:var(--text-display-sm)]",
    md: "text-[length:var(--text-display-md)]",
    lg: "text-[length:var(--text-display-lg)]",
  };
  return (
    <Tag
      className={cn(
        "font-[family-name:var(--font-display)] font-normal text-ink",
        "leading-[1.05] tracking-[-0.02em] text-balance",
        sizes[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Lead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm sm:text-base leading-relaxed text-body text-pretty", className)}>
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  action,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  align?: "left" | "center";
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        action && "sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        className,
      )}
    >
      <div className={cn("flex flex-col gap-3", align === "center" && "items-center")}>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Display size="sm" className="max-w-3xl">
          {title}
        </Display>
        {lead && <Lead className="max-w-2xl">{lead}</Lead>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------- Buttons ------------------------------ */

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "outline" | "ghost" | "light";
  className?: string;
  external?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const VARIANTS = {
  primary:
    "bg-brand text-white shadow-[var(--shadow-md)] hover:bg-brand-hover hover:shadow-[var(--shadow-lg)] hover:-translate-y-0.5",
  outline:
    "border border-ink/15 text-ink hover:border-brand hover:bg-brand hover:text-white hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
  ghost: "text-ink hover:text-brand",
  light: "frost border border-white/40 text-white hover:bg-white hover:text-ink",
};

export function CTA({
  href,
  children,
  variant = "primary",
  className,
  external,
  ...props
}: ButtonProps) {
  const classes = cn(
    "group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5",
    "text-sm font-semibold transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
    VARIANTS[variant],
    className,
  );

  const content = (
    <>
      {children}
      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
    </>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} className={classes} target="_blank" rel="noreferrer">
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}

/** An underlined text link that animates its rule on hover. */
export function TextLink({
  href,
  children,
  className,
  light,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 text-sm font-medium",
        light ? "text-white" : "text-ink",
        className,
      )}
    >
      <span
        className={cn(
          "bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-300",
          "bg-[length:100%_1px] group-hover:bg-[length:0%_1px]",
          light
            ? "bg-[linear-gradient(currentColor,currentColor)]"
            : "bg-[linear-gradient(currentColor,currentColor)]",
        )}
      >
        {children}
      </span>
      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
    </Link>
  );
}

/* -------------------------------- Rules ------------------------------- */

export function Rule({ className }: { className?: string }) {
  return (
    <hr
      className={cn(
        "h-px border-0 bg-gradient-to-r from-brand/50 via-line to-transparent",
        className,
      )}
    />
  );
}

export function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1.5",
        "text-xs font-medium tracking-wide text-body whitespace-nowrap shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------ Rich text ----------------------------- */

/**
 * Renders editor HTML. The content originates from the authenticated admin
 * rich-text editor, not from public input.
 */
export function RichText({
  html,
  className,
}: {
  html?: string;
  className?: string;
}) {
  if (!html) return null;
  return (
    <div
      className={cn("prose-site", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
