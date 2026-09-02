import { itemHandlers } from "@/lib/crud";
import { mediaResource } from "@/lib/resources";

export const { GET, PUT, DELETE } = itemHandlers(mediaResource);
