import { collectionHandlers } from "@/lib/crud";
import { userResource } from "@/lib/resources";

export const { GET, POST } = collectionHandlers(userResource);
