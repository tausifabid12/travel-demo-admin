import { itemHandlers } from "@/lib/crud";
import { offeringResource } from "@/lib/resources";

export const { GET, PUT, DELETE } = itemHandlers(offeringResource);
