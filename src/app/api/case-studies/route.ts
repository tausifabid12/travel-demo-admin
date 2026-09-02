import { collectionHandlers } from "@/lib/crud";
import { caseStudyResource } from "@/lib/resources";

export const { GET, POST } = collectionHandlers(caseStudyResource);
