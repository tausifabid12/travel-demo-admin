import { collectionHandlers } from "@/lib/crud";
import { destinationResource } from "@/lib/resources";

export const { GET, POST } = collectionHandlers(destinationResource);
