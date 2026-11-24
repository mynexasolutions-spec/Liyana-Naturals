import { AdminShell } from "@/components/admin/AdminShell";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/supabase/admin-auth";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return <AdminShell email={session.user.email}>{children}</AdminShell>;
}
