import { collectionHandlers } from "@/lib/crud";
import { mediaResource } from "@/lib/resources";

export const { GET, POST } = collectionHandlers(mediaResource);
