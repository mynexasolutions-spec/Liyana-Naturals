import { InquiryManager, type AdminInquiry } from "@/components/admin/InquiryManager";
import { fetchAll, requireAdminPage } from "@/lib/admin/server";

type InquiryRow = Omit<AdminInquiry, "createdAt"> & { created_at: string };

export default async function InquiriesPage() {
  const { supabase } = await requireAdminPage();
  const inquiries = await fetchAll<InquiryRow>("Inquiries", (from, to) =>
    supabase
      .from("inquiries")
      .select("id,name,email,phone,subject,message,status,created_at")
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to),
  );

  return (
    <InquiryManager
      inquiries={inquiries.map(({ created_at, ...inquiry }) => ({ ...inquiry, createdAt: created_at }))}
    />
  );
}
