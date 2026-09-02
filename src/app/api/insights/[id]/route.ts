import { itemHandlers } from "@/lib/crud";
import { insightResource } from "@/lib/resources";

export const { GET, PUT, DELETE } = itemHandlers(insightResource);
