import { itemHandlers } from "@/lib/crud";
import { userResource } from "@/lib/resources";

export const { GET, PUT, DELETE } = itemHandlers(userResource);
