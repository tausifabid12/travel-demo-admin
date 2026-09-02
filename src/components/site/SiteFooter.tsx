import Link from "next/link";
import { Mail, Phone, MessageCircle, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/site/primitives";
import NewsletterForm from "@/components/site/NewsletterForm";
import FooterAccordion from "@/components/site/FooterAccordion";
import type { SiteSettings } from "@/lib/queries";

const DEFAULT_COLUMNS = [
  {
    label: "Offerings",
    href: "/offerings",
    children: [
      { label: "TravelXL", href: "/travelxl" },
      { label: "Experia", href: "/experia" },
      { label: "Phase1World", href: "/phase1world" },
      { label: "Cabexperiences", href: "/cabexperiences" },
      { label: "All services", href: "/offerings" },
    ],
  },
  {
    label: "Company",
    href: "/about",
    children: [
      { label: "About", href: "/about" },
      { label: "Our work", href: "/work" },
      { label: "Careers", href: "/careers" },
      { label: "Insights", href: "/insights" },
    ],
  },
  {
    label: "Get in touch",
    href: "/contact",
    children: [
      { label: "Contact", href: "/contact" },
      { label: "Enquire", href: "/contact" },
    ],
  },
];

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  x: "X",
};

export default function SiteFooter({ settings }: { settings: SiteSettings }) {
  const columns = settings.navigation.footer?.length
    ? settings.navigation.footer
    : DEFAULT_COLUMNS;

  const socials = Object.entries(settings.social ?? {}).filter(([, url]) =>
    Boolean(url),
  );

  const year = new Date().getFullYear();

  const contactRows = [
    settings.contact.email && {
      icon: Mail,
      label: settings.contact.email,
      href: `mailto:${settings.contact.email}`,
    },
    settings.contact.phone && {
      icon: Phone,
      label: settings.contact.phone,
      href: `tel:${settings.contact.phone.replace(/\s/g, "")}`,
    },
    settings.contact.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      href: `https://wa.me/${settings.contact.whatsapp.replace(/\D/g, "")}`,
    },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href: string }[];

  return (
    <footer className="bg-deep text-white/70">
      {/* ---------------- Mobile: an app "more" screen ------------------ */}
      <div className="lg:hidden">
        <Container>
          <div className="pt-12 pb-8">
            <p className="font-[family-name:var(--font-display)] text-2xl text-white">
              {settings.siteTitle}
            </p>
            <p className="mt-2.5 text-sm leading-relaxed">
              {settings.siteDescription}
            </p>

            <Link
              href="/contact"
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-medium text-ink"
            >
              Start an enquiry
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Container>

        {/* Grouped rows, the way a settings screen lists sections. */}
        <FooterAccordion columns={columns} />

        {contactRows.length > 0 && (
          <div className="mt-8 px-6">
            <p className="mb-3 text-[0.625rem] uppercase tracking-[0.2em] text-brand-soft">
              Contact
            </p>
            <div className="overflow-hidden rounded-2xl border border-white/10">
              {contactRows.map((row) => (
                <a
                  key={row.href}
                  href={row.href}
                  target={row.href.startsWith("http") ? "_blank" : undefined}
                  rel={row.href.startsWith("http") ? "noreferrer" : undefined}
                  className="flex items-center gap-3.5 border-b border-white/10 px-4 py-4 text-sm text-white last:border-0 active:bg-white/5"
                >
                  <row.icon className="size-4 shrink-0 text-gold" />
                  <span className="flex-1">{row.label}</span>
                  <ArrowUpRight className="size-3.5 text-white/30" />
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 px-6">
          <p className="mb-3 text-[0.625rem] uppercase tracking-[0.2em] text-brand-soft">
            Newsletter
          </p>
          <NewsletterForm />
        </div>

        {settings.contact.addressLines?.length ? (
          <address className="mt-8 px-6 text-sm not-italic leading-relaxed">
            {settings.contact.addressLines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </address>
        ) : null}

        {socials.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2 px-6">
            {socials.map(([network, url]) => (
              <a
                key={network}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/80"
              >
                {SOCIAL_LABELS[network] ?? network}
              </a>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-white/10 px-6 py-6">
          <nav
            className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs"
            aria-label="Legal"
          >
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/cookies">Cookies</Link>
          </nav>
          <p className="mt-4 text-xs text-white/40">
            © {year} {settings.siteTitle}. All rights reserved.
          </p>
        </div>
      </div>

      {/* --------------------- Desktop: classic footer ------------------- */}
      <div className="hidden lg:block">
        <Container size="wide">
          <div className="grid gap-14 py-24 lg:grid-cols-[1.3fr_2fr]">
            <div>
              <Link
                href="/"
                className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-white"
              >
                {settings.footerLogoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={settings.footerLogoUrl}
                    alt={settings.siteTitle}
                    className="h-8 w-auto"
                  />
                ) : (
                  settings.siteTitle
                )}
              </Link>

              <p className="mt-5 max-w-sm text-sm leading-relaxed">
                {settings.siteDescription}
              </p>

              <div className="mt-8">
                <p className="mb-3 text-[0.6875rem] uppercase tracking-[0.2em] text-brand-soft">
                  Newsletter
                </p>
                <NewsletterForm />
              </div>
            </div>

            <div className="grid gap-10 sm:grid-cols-3">
              {columns.map((column) => (
                <nav key={column.label} aria-label={column.label}>
                  <p className="mb-4 text-[0.6875rem] uppercase tracking-[0.2em] text-brand-soft">
                    {column.label}
                  </p>
                  <ul className="flex flex-col gap-2.5">
                    {(column.children ?? []).map((link) => (
                      <li key={`${link.href}-${link.label}`}>
                        <Link
                          href={link.href}
                          className="text-sm transition-colors hover:text-white"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="grid gap-8 border-t border-white/10 py-10 lg:grid-cols-2">
            <div className="flex flex-col gap-2.5 text-sm">
              {contactRows.map((row) => (
                <a
                  key={row.href}
                  href={row.href}
                  target={row.href.startsWith("http") ? "_blank" : undefined}
                  rel={row.href.startsWith("http") ? "noreferrer" : undefined}
                  className="inline-flex w-fit items-center gap-2.5 transition-colors hover:text-white"
                >
                  <row.icon className="size-4 text-gold" /> {row.label}
                </a>
              ))}
            </div>

            {settings.contact.addressLines?.length ? (
              <address className="text-sm not-italic leading-relaxed lg:text-right">
                {settings.contact.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
            ) : null}
          </div>

          <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 py-8 text-xs sm:flex-row">
            <p>
              © {year} {settings.siteTitle}. All rights reserved.
            </p>

            {socials.length > 0 && (
              <div className="flex items-center gap-5">
                {socials.map(([network, url]) => (
                  <a
                    key={network}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {SOCIAL_LABELS[network] ?? network}
                  </a>
                ))}
              </div>
            )}

            <nav className="flex items-center gap-5" aria-label="Legal">
              <Link href="/privacy" className="transition-colors hover:text-white">
                Privacy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-white">
                Terms
              </Link>
              <Link href="/cookies" className="transition-colors hover:text-white">
                Cookies
              </Link>
            </nav>
          </div>
        </Container>
      </div>
    </footer>
  );
}
