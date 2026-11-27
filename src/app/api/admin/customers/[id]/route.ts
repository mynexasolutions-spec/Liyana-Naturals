import { deleteRecord, updateRecord } from "@/lib/admin/mutations";
import { customerUpdateSchema } from "@/lib/admin/schemas";

export const PATCH = updateRecord("customers", customerUpdateSchema);
export const DELETE = deleteRecord("customers");
