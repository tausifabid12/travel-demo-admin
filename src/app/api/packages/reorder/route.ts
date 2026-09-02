import { reorderHandler } from "@/lib/crud";
import { packageResource } from "@/lib/resources";

export const PATCH = reorderHandler(packageResource);
