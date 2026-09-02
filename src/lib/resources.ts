import Package from "@/lib/models/Package";
import Destination from "@/lib/models/Destination";
import CaseStudy from "@/lib/models/CaseStudy";
import Insight from "@/lib/models/Insight";
import Offering from "@/lib/models/Offering";
import Career from "@/lib/models/Career";
import MediaAsset from "@/lib/models/MediaAsset";
import Employee from "@/lib/models/Employee";
import {
  packageSchema,
  destinationSchema,
  caseStudySchema,
  insightSchema,
  offeringSchema,
  careerSchema,
  mediaSchema,
  userCreateSchema,
  userUpdateSchema,
} from "@/lib/validation";
import type { CrudConfig } from "@/lib/crud";

export const packageResource: CrudConfig = {
  model: Package,
  module: "packages",
  entityType: "Package",
  schema: packageSchema,
  slugSource: "title",
  searchFields: ["title", "summary", "priceIndicator"],
  defaultSort: { order: 1, createdAt: -1 },
  populate: [["destinationId", "name region"]],
};

export const destinationResource: CrudConfig = {
  model: Destination,
  module: "destinations",
  entityType: "Destination",
  schema: destinationSchema,
  slugSource: "name",
  searchFields: ["name", "region", "description"],
  defaultSort: { order: 1, name: 1 },
};

export const caseStudyResource: CrudConfig = {
  model: CaseStudy,
  module: "case-studies",
  entityType: "Case Study",
  schema: caseStudySchema,
  slugSource: "title",
  searchFields: ["title", "clientName", "industry", "serviceCategory"],
  defaultSort: { order: 1, createdAt: -1 },
  populate: [["destinationId", "name region"]],
};

export const insightResource: CrudConfig = {
  model: Insight,
  module: "insights",
  entityType: "Insight",
  schema: insightSchema,
  slugSource: "title",
  searchFields: ["title", "excerpt", "author", "category"],
  defaultSort: { publishDate: -1, createdAt: -1 },
};

export const offeringResource: CrudConfig = {
  model: Offering,
  module: "offerings",
  entityType: "Offering",
  schema: offeringSchema,
  slugSource: "title",
  searchFields: ["title", "summary"],
  defaultSort: { order: 1, title: 1 },
};

export const careerResource: CrudConfig = {
  model: Career,
  module: "careers",
  entityType: "Job",
  schema: careerSchema,
  slugSource: "jobTitle",
  searchFields: ["jobTitle", "department", "location"],
  defaultSort: { createdAt: -1 },
};

export const mediaResource: CrudConfig = {
  model: MediaAsset,
  module: "media",
  entityType: "Media",
  schema: mediaSchema,
  searchFields: ["title", "alt", "folder", "url"],
  defaultSort: { createdAt: -1 },
};

export const userResource: CrudConfig = {
  model: Employee,
  module: "users",
  entityType: "User",
  schema: userCreateSchema,
  updateSchema: userUpdateSchema,
  searchFields: ["name", "email"],
  defaultSort: { createdAt: -1 },
  hide: ["password"],
};
