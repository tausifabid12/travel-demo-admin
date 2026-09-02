import { collectionHandlers } from "@/lib/crud";
import { careerResource } from "@/lib/resources";

export const { GET, POST } = collectionHandlers(careerResource);
