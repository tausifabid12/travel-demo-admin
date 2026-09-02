import { duplicateHandler } from "@/lib/crud";
import { packageResource } from "@/lib/resources";

export const POST = duplicateHandler(packageResource);
