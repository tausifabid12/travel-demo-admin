import { itemHandlers } from "@/lib/crud";
import { caseStudyResource } from "@/lib/resources";

export const { GET, PUT, DELETE } = itemHandlers(caseStudyResource);
