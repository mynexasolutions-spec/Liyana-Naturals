import { deleteRecord, updateRecord } from "@/lib/admin/mutations";
import { reviewUpdateSchema } from "@/lib/admin/schemas";

export const PATCH = updateRecord("reviews", reviewUpdateSchema);
export const DELETE = deleteRecord("reviews");
