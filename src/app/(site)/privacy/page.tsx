import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { buildMetadata } from "@/lib/seo";
import LegalPage from "@/components/site/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return buildMetadata({
    title: "Privacy Policy",
    description: "How Bhancer collects, uses and protects your personal data.",
    path: "/privacy",
    settings,
  });
}

export default async function PrivacyPolicyPage() {
  const settings = await getSettings();
  const email = settings.contact.email ?? "privacy@bhancer.com";

  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="20 August 2026"
      sections={[
        {
          heading: "Who we are",
          body: (
            <p>
              {settings.siteTitle} designs and delivers corporate travel, MICE
              and live experience programmes. This policy explains what personal
              data we collect through this website, why we collect it, and what
              we do with it. If you have a question about any of it, write to{" "}
              <a href={`mailto:${email}`}>{email}</a>.
            </p>
          ),
        },
        {
          heading: "What we collect",
          body: (
            <ul>
              <li>
                <strong>Enquiry details.</strong> When you submit an enquiry or
                contact form we collect your name, email address, and any phone
                number, company name, group size, dates, budget range and message
                you choose to give us.
              </li>
              <li>
                <strong>Job applications.</strong> If you apply for a role we
                collect your name, email, phone number, links to your CV and
                professional profiles, and anything you write in your
                application.
              </li>
              <li>
                <strong>Technical data.</strong> We record the IP address a form
                submission came from, purely to detect and block automated spam.
              </li>
              <li>
                <strong>Analytics.</strong> Only if you consent. See our cookie
                policy for the detail.
              </li>
            </ul>
          ),
        },
        {
          heading: "Why we use it",
          body: (
            <ul>
              <li>To respond to your enquiry and prepare a proposal.</li>
              <li>To assess your application if you apply for a role.</li>
              <li>To send you our newsletter, if you asked for it.</li>
              <li>
                To understand, in aggregate, which parts of this site are useful.
              </li>
            </ul>
          ),
        },
        {
          heading: "Legal basis",
          body: (
            <p>
              We process enquiry and application data on the basis of taking
              steps at your request before entering a contract, and our
              legitimate interest in running and improving our business. Analytics
              and marketing cookies are processed only on the basis of your
              consent, which you may withdraw at any time.
            </p>
          ),
        },
        {
          heading: "Who we share it with",
          body: (
            <p>
              We do not sell your data. We share it only with the service
              providers who help us operate — our hosting provider, our database
              provider, and our email and messaging providers — and only to the
              extent they need it. Where a programme requires it, we share the
              travel details you provide with the airlines, hotels and ground
              operators delivering that programme.
            </p>
          ),
        },
        {
          heading: "How long we keep it",
          body: (
            <p>
              Enquiries are retained for three years from your last contact with
              us, so we can pick up a conversation where it left off.
              Unsuccessful job applications are retained for twelve months.
              Newsletter subscriptions are retained until you unsubscribe.
            </p>
          ),
        },
        {
          heading: "Your rights",
          body: (
            <p>
              You may ask us for a copy of the personal data we hold about you,
              ask us to correct it, ask us to delete it, or object to our
              processing of it. Write to{" "}
              <a href={`mailto:${email}`}>{email}</a> and we will respond within
              thirty days.
            </p>
          ),
        },
        {
          heading: "Changes to this policy",
          body: (
            <p>
              If we change this policy we will update the date at the top of this
              page. Material changes will be flagged on the site.
            </p>
          ),
        },
      ]}
    />
  );
}
