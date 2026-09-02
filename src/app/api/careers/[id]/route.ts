import { itemHandlers } from "@/lib/crud";
import { careerResource } from "@/lib/resources";

export const { GET, PUT, DELETE } = itemHandlers(careerResource);
