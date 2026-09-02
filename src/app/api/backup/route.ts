import Package from "@/lib/models/Package";
import Destination from "@/lib/models/Destination";
import CaseStudy from "@/lib/models/CaseStudy";
import Insight from "@/lib/models/Insight";
import Offering from "@/lib/models/Offering";
import Career from "@/lib/models/Career";
import JobApplication from "@/lib/models/JobApplication";
import Enquiry from "@/lib/models/Enquiry";
import MediaAsset from "@/lib/models/MediaAsset";
import Setting, { SECRET_FIELDS } from "@/lib/models/Setting";
import { withAuth } from "@/lib/api";

export const GET = withAuth("settings", "read", async () => {
  const [
    packages,
    destinations,
    caseStudies,
    insights,
    offerings,
    careers,
    applications,
    enquiries,
    media,
    settings,
  ] = await Promise.all([
    Package.find({}).lean(),
    Destination.find({}).lean(),
    CaseStudy.find({}).lean(),
    Insight.find({}).lean(),
    Offering.find({}).lean(),
    Career.find({}).lean(),
    JobApplication.find({}).lean(),
    Enquiry.find({}).lean(),
    MediaAsset.find({}).lean(),
    Setting.findOne({}).lean<Record<string, unknown>>(),
  ]);

  // Never write credentials into a file that leaves the server.
  const safeSettings = { ...(settings ?? {}) };
  for (const field of SECRET_FIELDS) delete safeSettings[field];

  const backup = {
    exportedAt: new Date().toISOString(),
    collections: {
      packages,
      destinations,
      caseStudies,
      insights,
      offerings,
      careers,
      applications,
      enquiries,
      media,
      settings: safeSettings,
    },
  };

  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="bhancer-backup-${stamp}.json"`,
    },
  });
});
