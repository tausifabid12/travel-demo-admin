import { collectionHandlers } from "@/lib/crud";
import { packageResource } from "@/lib/resources";

export const { GET, POST } = collectionHandlers(packageResource);
