import Enquiry from "@/lib/models/Enquiry";
import Package from "@/lib/models/Package";
import Career from "@/lib/models/Career";
import JobApplication from "@/lib/models/JobApplication";
import CaseStudy from "@/lib/models/CaseStudy";
import Insight from "@/lib/models/Insight";
import ActivityLog from "@/lib/models/ActivityLog";
import { ok, withAuth } from "@/lib/api";

export const GET = withAuth("dashboard", "read", async () => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalEnquiries,
    newLeads,
    leadsThisWeek,
    publishedPackages,
    draftPackages,
    activeJobs,
    newApplications,
    publishedCaseStudies,
    draftContent,
    activity,
  ] = await Promise.all([
    Enquiry.countDocuments({}),
    Enquiry.countDocuments({ status: "New" }),
    Enquiry.countDocuments({ createdAt: { $gte: weekAgo } }),
    Package.countDocuments({ status: "published" }),
    Package.countDocuments({ status: "draft" }),
    Career.countDocuments({ status: "active" }),
    JobApplication.countDocuments({ status: "New" }),
    CaseStudy.countDocuments({ status: "published" }),
    Promise.all([
      Package.countDocuments({ status: "draft" }),
      CaseStudy.countDocuments({ status: "draft" }),
      Insight.countDocuments({ status: "draft" }),
    ]).then(([a, b, c]) => a + b + c),
    ActivityLog.find({}).sort({ createdAt: -1 }).limit(12).lean(),
  ]);

  return ok({
    stats: {
      totalEnquiries,
      newLeads,
      leadsThisWeek,
      publishedPackages,
      draftPackages,
      activeJobs,
      newApplications,
      publishedCaseStudies,
      draftContent,
    },
    activity,
  });
});
