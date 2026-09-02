import Enquiry from "@/lib/models/Enquiry";
import Package from "@/lib/models/Package";
import JobApplication from "@/lib/models/JobApplication";
import CaseStudy from "@/lib/models/CaseStudy";
import Insight from "@/lib/models/Insight";
import { ok, withAuth } from "@/lib/api";

export const GET = withAuth("reports", "read", async ({ request }) => {
  const months = Math.min(
    24,
    Math.max(3, Number(new URL(request.url).searchParams.get("months") ?? 12)),
  );
  const since = new Date();
  since.setMonth(since.getMonth() - months);

  const [byMonth, bySource, byStatus, topPackages, applicationsByJob, contentActivity] =
    await Promise.all([
      Enquiry.aggregate([
        { $match: { createdAt: { $gte: since } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Enquiry.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$source", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Enquiry.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      // Most-enquired packages
      Enquiry.aggregate([
        { $match: { packageId: { $ne: null } } },
        { $group: { _id: "$packageId", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "packages",
            localField: "_id",
            foreignField: "_id",
            as: "package",
          },
        },
        { $unwind: "$package" },
        {
          $project: {
            count: 1,
            title: "$package.title",
            slug: "$package.slug",
            category: "$package.category",
          },
        },
      ]),
      JobApplication.aggregate([
        {
          $group: {
            _id: { career: "$careerId", status: "$status" },
            count: { $sum: 1 },
          },
        },
        {
          $lookup: {
            from: "careers",
            localField: "_id.career",
            foreignField: "_id",
            as: "career",
          },
        },
        { $unwind: "$career" },
        {
          $project: {
            _id: 0,
            jobTitle: "$career.jobTitle",
            status: "$_id.status",
            count: 1,
          },
        },
      ]),
      Promise.all([
        Package.countDocuments({ status: "draft" }),
        CaseStudy.countDocuments({ status: "draft" }),
        Insight.countDocuments({ status: "draft" }),
        Package.countDocuments({ status: "published" }),
        CaseStudy.countDocuments({ status: "published" }),
        Insight.countDocuments({ status: "published" }),
      ]).then(([pd, cd, id, pp, cp, ip]) => ({
        drafts: { packages: pd, caseStudies: cd, insights: id },
        published: { packages: pp, caseStudies: cp, insights: ip },
      })),
    ]);

  return ok({
    enquiries: { byMonth, bySource, byStatus },
    topPackages,
    applicationsByJob,
    contentActivity,
  });
});
