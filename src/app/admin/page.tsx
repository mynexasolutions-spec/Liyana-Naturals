import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin-auth";

export default async function AdminRootPage() {
  if (!(await getAdminSession())) redirect("/admin/login");
  redirect("/admin/dashboard");
}
