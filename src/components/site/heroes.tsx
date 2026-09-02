import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Display, Eyebrow } from "@/components/site/primitives";

/**
 * Full-bleed hero. The `data-hero` attribute tells SiteHeader it may sit
 * transparently over the image.
 */
export function ImageHero({
  image,
  video,
  eyebrow,
  title,
  lead,
  actions,
  meta,
  height = "tall",
  priority = true,
}: {
  image?: string;
  video?: string;
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  height?: "tall" | "medium";
  priority?: boolean;
}) {
  return (
    <section
      data-hero
      className={cn(
        "relative flex items-end overflow-hidden bg-ink",
        height === "tall" ? "min-h-[86vh] lg:min-h-screen" : "min-h-[62vh]",
      )}
    >
      {video ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={image}
          className="absolute inset-0 size-full object-cover"
        >
          <source src={video} type="video/mp4" />
        </video>
      ) : image ? (
        <Image
          src={image}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="kenburns object-cover"
        />
      ) : null}

      {/* Legibility scrim, warmed with the brand teal so it never reads grey. */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(70rem_45rem_at_15%_110%,rgb(13_92_99/0.45),transparent_65%)]"
        aria-hidden
      />

      <Container size="wide" className="relative pb-20 pt-40 sm:pb-28">
        <div className="max-w-4xl">
          {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}

          <Display as="h1" size="lg" className="text-white">
            {title}
          </Display>

          {lead && (
            <p className="mt-7 max-w-2xl text-lg sm:text-xl leading-relaxed text-white/80 text-pretty">
              {lead}
            </p>
          )}

          {meta && <div className="mt-8">{meta}</div>}

          {actions && (
            <div className="mt-10 flex flex-wrap items-center gap-4">{actions}</div>
          )}
        </div>
      </Container>
    </section>
  );
}

/** Text-led hero for pages without strong imagery. */
export function PageHero({
  eyebrow,
  title,
  lead,
  actions,
  breadcrumbs,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: string;
  actions?: React.ReactNode;
  breadcrumbs?: { label: string; href: string }[];
}) {
  return (
    <section className="relative overflow-hidden border-b border-line pt-32 pb-14 sm:pt-44 sm:pb-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45rem_28rem_at_88%_-10%,rgb(13_92_99/0.1),transparent_60%),radial-gradient(38rem_24rem_at_-5%_20%,rgb(192_138_46/0.12),transparent_60%)]"
        aria-hidden
      />
      <Container size="wide" className="relative">
        {breadcrumbs && <Breadcrumbs trail={breadcrumbs} />}

        <div className="max-w-4xl">
          {eyebrow && <Eyebrow className="mb-6">{eyebrow}</Eyebrow>}

          <Display as="h1" size="md">
            {title}
          </Display>

          {lead && (
            <p className="mt-7 max-w-2xl text-lg sm:text-xl leading-relaxed text-body text-pretty">
              {lead}
            </p>
          )}

          {actions && (
            <div className="mt-9 flex flex-wrap items-center gap-4">{actions}</div>
          )}
        </div>
      </Container>
    </section>
  );
}

export function Breadcrumbs({
  trail,
  light,
}: {
  trail: { label: string; href: string }[];
  light?: boolean;
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-8 flex flex-wrap items-center gap-1.5 text-xs",
        light ? "text-white/60" : "text-muted",
      )}
    >
      {trail.map((crumb, index) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight className="size-3" aria-hidden />}
          {index === trail.length - 1 ? (
            <span aria-current="page" className={light ? "text-white" : "text-ink"}>
              {crumb.label}
            </span>
          ) : (
            <Link
              href={crumb.href}
              className={cn(
                "transition-colors",
                light ? "hover:text-white" : "hover:text-ink",
              )}
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
