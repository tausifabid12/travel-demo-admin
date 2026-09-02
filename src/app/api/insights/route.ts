import { collectionHandlers } from "@/lib/crud";
import { insightResource } from "@/lib/resources";

export const { GET, POST } = collectionHandlers(insightResource);
