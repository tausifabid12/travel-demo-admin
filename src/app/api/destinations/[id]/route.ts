import { itemHandlers } from "@/lib/crud";
import { destinationResource } from "@/lib/resources";

export const { GET, PUT, DELETE } = itemHandlers(destinationResource);
