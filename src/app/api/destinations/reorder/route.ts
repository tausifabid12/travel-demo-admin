import { reorderHandler } from "@/lib/crud";
import { destinationResource } from "@/lib/resources";

export const PATCH = reorderHandler(destinationResource);
