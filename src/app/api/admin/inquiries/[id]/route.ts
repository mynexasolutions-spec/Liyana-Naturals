import { deleteRecord, updateRecord } from "@/lib/admin/mutations";
import { inquiryUpdateSchema } from "@/lib/admin/schemas";

export const PATCH = updateRecord("inquiries", inquiryUpdateSchema);
export const DELETE = deleteRecord("inquiries");
