import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, MapPin, Clock } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import {
  Container,
  Section,
  Display,
  Eyebrow,
  Rule,
} from "@/components/site/primitives";
import { PageHero } from "@/components/site/heroes";
import { EnquiryForm } from "@/components/site/forms";
import Reveal from "@/components/site/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Contact",
    description:
      "Talk to Bhancer about a corporate travel, MICE, incentive or live experience programme.",
    path: "/contact",
    settings,
  });
}

export default async function ContactPage() {
  const settings = await getSettings();

  const channels = [
    settings.contact.email && {
      icon: Mail,
      label: "Email",
      value: settings.contact.email,
      href: `mailto:${settings.contact.email}`,
    },
    settings.contact.phone && {
      icon: Phone,
      label: "Phone",
      value: settings.contact.phone,
      href: `tel:${settings.contact.phone.replace(/\s/g, "")}`,
    },
    settings.contact.whatsapp && {
      icon: MessageCircle,
      label: "WhatsApp",
      value: "Message us",
      href: `https://wa.me/${settings.contact.whatsapp.replace(/\D/g, "")}`,
    },
  ].filter(Boolean) as {
    icon: typeof Mail;
    label: string;
    value: string;
    href: string;
  }[];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let us talk."
        lead="Tell us what the programme has to achieve. We will tell you honestly whether we are the right team, and what it is likely to cost."
      />

      {/* Direct channels read as a tappable app list on a phone. */}
      {channels.length > 0 && (
        <Section className="pb-0 pt-10 sm:pt-14 lg:hidden">
          <Container>
            <div className="overflow-hidden rounded-2xl border border-line">
              {channels.map((channel) => (
                <a
                  key={channel.href}
                  href={channel.href}
                  target={channel.href.startsWith("http") ? "_blank" : undefined}
                  rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                  className="flex items-center gap-4 border-b border-line bg-surface px-4 py-4 last:border-0 active:bg-canvas"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-canvas">
                    <channel.icon className="size-4 text-gold" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[0.625rem] uppercase tracking-[0.18em] text-muted">
                      {channel.label}
                    </span>
                    <span className="block text-sm text-ink">{channel.value}</span>
                  </span>
                </a>
              ))}
            </div>
          </Container>
        </Section>
      )}

      <Section>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-32">
                <Reveal>
                  <Eyebrow>Direct</Eyebrow>

                  <div className="mt-6 hidden flex-col gap-5 lg:flex">
                    {channels.map((channel) => (
                      <a
                        key={channel.href}
                        href={channel.href}
                        target={channel.href.startsWith("http") ? "_blank" : undefined}
                        rel={
                          channel.href.startsWith("http") ? "noreferrer" : undefined
                        }
                        className="group flex items-start gap-3.5"
                      >
                        <channel.icon className="mt-0.5 size-4 shrink-0 text-gold" />
                        <span>
                          <span className="block text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
                            {channel.label}
                          </span>
                          <span className="block text-ink transition-colors group-hover:text-accent">
                            {channel.value}
                          </span>
                        </span>
                      </a>
                    ))}
                  </div>

                  {settings.contact.responsePromise && (
                    <div className="mt-8 flex items-start gap-3.5">
                      <Clock className="mt-0.5 size-4 shrink-0 text-gold" />
                      <span>
                        <span className="block text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
                          Response
                        </span>
                        <span className="block text-ink">
                          {settings.contact.responsePromise}
                        </span>
                      </span>
                    </div>
                  )}

                  {settings.contact.addressLines?.length ? (
                    <div className="mt-8 flex items-start gap-3.5">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-gold" />
                      <address className="not-italic">
                        <span className="block text-[0.6875rem] uppercase tracking-[0.18em] text-muted">
                          Office
                        </span>
                        {settings.contact.addressLines.map((line) => (
                          <span key={line} className="block text-body">
                            {line}
                          </span>
                        ))}
                      </address>
                    </div>
                  ) : null}
                </Reveal>
              </div>
            </div>

            <div className="lg:col-span-8">
              <Reveal delay={100}>
                <Rule className="mb-10 lg:hidden" />
                <Display size="sm" className="mb-10 lg:hidden">
                  Send an enquiry.
                </Display>
                <EnquiryForm
                  source="Contact Page"
                  sourcePage="/contact"
                  variant="contact"
                />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {settings.contact.mapEmbedUrl && (
        <Section className="pt-0">
          <Container size="wide">
            <div className="overflow-hidden border border-line" style={{ aspectRatio: "21/9" }}>
              <iframe
                src={settings.contact.mapEmbedUrl}
                title="Office location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="size-full"
              />
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
