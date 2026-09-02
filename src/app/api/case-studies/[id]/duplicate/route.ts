import { duplicateHandler } from "@/lib/crud";
import { caseStudyResource } from "@/lib/resources";

export const POST = duplicateHandler(caseStudyResource);
