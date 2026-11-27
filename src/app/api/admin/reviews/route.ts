import { createRecord } from "@/lib/admin/mutations";
import { reviewCreateSchema } from "@/lib/admin/schemas";

export const POST = createRecord("reviews", reviewCreateSchema);
