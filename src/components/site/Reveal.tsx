import { cn } from "@/lib/utils";

/**
 * Scroll-reveal wrapper.
 *
 * Driven entirely by a CSS view timeline rather than an IntersectionObserver,
 * which means no client JavaScript, no hydration gap, and — crucially — no way
 * for content to end up permanently invisible if the observer never fires.
 * Browsers without `animation-timeline` simply render the content as-is.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Staggers items within a row, in milliseconds. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  return (
    <Tag
      className={cn("reveal", className)}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
