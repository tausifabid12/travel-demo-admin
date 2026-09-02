import dbConnect from "@/lib/mongodb";
import Enquiry from "@/lib/models/Enquiry";
import JobApplication from "@/lib/models/JobApplication";
import Career from "@/lib/models/Career";
import { notifyTeam } from "@/lib/notify";
import {
  enquirySchema,
  applicationSchema,
  type EnquiryInput,
  type ApplicationInput,
} from "@/lib/validation";

/**
 * Shared by the public API route and the Server Actions the site forms use,
 * so validation, spam checks and notifications behave identically either way.
 */
export async function createEnquiry(input: unknown, ipAddress?: string) {
  const data: EnquiryInput = enquirySchema.parse(input);

  // Honeypot: silently accept so bots see success and stop retrying.
  if (data.website) return { spam: true as const };

  await dbConnect();
  const { website, packageId, ...rest } = data;
  void website;

  const enquiry = await Enquiry.create({
    ...rest,
    packageId: packageId || undefined,
    ipAddress,
  });

  await notifyTeam({
    audience: "enquiry",
    subject: `New enquiry from ${enquiry.name}`,
    lines: [
      `Source: ${enquiry.source}`,
      `Email: ${enquiry.email}`,
      enquiry.phone ? `Phone: ${enquiry.phone}` : "",
      enquiry.company ? `Company: ${enquiry.company}` : "",
      enquiry.groupSize ? `Group size: ${enquiry.groupSize}` : "",
      enquiry.preferredDates ? `Dates: ${enquiry.preferredDates}` : "",
      enquiry.budgetRange ? `Budget: ${enquiry.budgetRange}` : "",
      "",
      enquiry.message,
    ].filter(Boolean),
  });

  return { spam: false as const, enquiry };
}

export async function createApplication(input: unknown) {
  const data: ApplicationInput = applicationSchema.parse(input);
  if (data.website) return { spam: true as const };

  await dbConnect();
  const { website, ...rest } = data;
  void website;

  const job = await Career.findById(data.careerId).lean<{ jobTitle: string }>();
  if (!job) throw new Error("That role is no longer open");

  const application = await JobApplication.create(rest);

  await notifyTeam({
    audience: "careers",
    subject: `New application: ${job.jobTitle}`,
    lines: [
      `Candidate: ${application.name}`,
      `Email: ${application.email}`,
      application.phone ? `Phone: ${application.phone}` : "",
      application.resumeUrl ? `CV: ${application.resumeUrl}` : "",
      application.linkedinUrl ? `LinkedIn: ${application.linkedinUrl}` : "",
    ].filter(Boolean),
  });

  return { spam: false as const, application };
}
