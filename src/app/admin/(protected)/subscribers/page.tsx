import { SubscriberManager, type Subscriber } from "@/components/admin/SubscriberManager";
import { fetchAll, requireAdminPage } from "@/lib/admin/server";

export default async function SubscribersPage() {
  const { supabase } = await requireAdminPage();

  const subscribers = await fetchAll<Subscriber>("Subscribers", (from, to) =>
    supabase
      .from("newsletter_subscribers")
      .select("id,email,source,created_at")
      .order("created_at", { ascending: false })
      .order("id")
      .range(from, to),
  );

  return <SubscriberManager subscribers={subscribers} />;
}
