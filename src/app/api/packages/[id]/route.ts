import { itemHandlers } from "@/lib/crud";
import { packageResource } from "@/lib/resources";

export const { GET, PUT, DELETE } = itemHandlers(packageResource);
