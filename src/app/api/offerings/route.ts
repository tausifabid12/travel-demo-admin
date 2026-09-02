import { collectionHandlers } from "@/lib/crud";
import { offeringResource } from "@/lib/resources";

export const { GET, POST } = collectionHandlers(offeringResource);
