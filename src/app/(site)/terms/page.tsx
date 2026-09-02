import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import LegalPage from "@/components/site/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Terms of Service",
    description: "The terms on which Bhancer provides this website.",
    path: "/terms",
    settings,
  });
}

export default async function TermsPage() {
  const settings = await getSettings();
  const email = settings.contact.email ?? "hello@bhancer.com";

  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="20 August 2026"
      sections={[
        {
          heading: "These terms",
          body: (
            <p>
              These terms govern your use of this website. By using the site you
              accept them. They do not govern any programme we deliver for you —
              that is covered by a separate written agreement.
            </p>
          ),
        },
        {
          heading: "Nothing here is an offer",
          body: (
            <p>
              Every experience, itinerary, inclusion, exclusion and price
              indicator shown on this site is illustrative. Availability and
              pricing change constantly, and every programme we run is customised.
              Nothing published here constitutes a binding offer or a quotation.
              A price becomes firm only in a written proposal signed by both
              parties.
            </p>
          ),
        },
        {
          heading: "Accuracy",
          body: (
            <p>
              We take care to keep this site accurate, but we do not warrant that
              it is complete or current. Destination information, imagery and
              third-party content may change without notice.
            </p>
          ),
        },
        {
          heading: "Your submissions",
          body: (
            <p>
              When you submit an enquiry or job application you confirm that the
              information you provide is accurate and that you are entitled to
              share it. Do not submit confidential information belonging to a
              third party. Any link you provide to a CV or document must be one
              you have the right to share.
            </p>
          ),
        },
        {
          heading: "Intellectual property",
          body: (
            <p>
              The content of this site — text, imagery, case studies, brand names
              and design — belongs to {settings.siteTitle} or its licensors. You
              may view and print pages for your own reference. You may not
              republish, sell or systematically extract any part of it without
              our written permission. Client names and logos appear with those
              clients&rsquo; permission and remain their property.
            </p>
          ),
        },
        {
          heading: "Third-party links",
          body: (
            <p>
              Where we link to another site we do so for convenience. We do not
              control those sites and are not responsible for their content or
              their handling of your data.
            </p>
          ),
        },
        {
          heading: "Liability",
          body: (
            <p>
              To the extent permitted by law, we are not liable for any indirect
              or consequential loss arising from your use of this website.
              Nothing in these terms limits liability for death or personal
              injury caused by negligence, or for fraud.
            </p>
          ),
        },
        {
          heading: "Governing law",
          body: (
            <p>
              These terms are governed by the laws of India, and the courts of
              Mumbai have exclusive jurisdiction over any dispute arising from
              them.
            </p>
          ),
        },
        {
          heading: "Contact",
          body: (
            <p>
              Questions about these terms go to{" "}
              <a href={`mailto:${email}`}>{email}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
