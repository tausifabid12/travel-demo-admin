import { z } from "zod";
import SeoMeta from "@/lib/models/SeoMeta";
import { itemHandlers } from "@/lib/crud";

const seoMetaSchema = z.object({
  urlPath: z.string().min(1, "URL path is required").startsWith("/", "URL path must start with a slash (e.g., /about)"),
  metaTitle: z.string().min(1, "Title is required"),
  metaDescription: z.string().min(1, "Description is required"),
  ogImage: z.string().optional(),
});

export const { GET, PUT, DELETE } = itemHandlers({
  model: SeoMeta,
  module: "seo",
  entityType: "SEO Override",
  schema: seoMetaSchema,
});
