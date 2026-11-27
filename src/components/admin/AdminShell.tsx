"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  CircleHelp,
  FileText,
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  Ticket,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tags },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Inquiries", href: "/admin/inquiries", icon: CircleHelp },
  { label: "Subscribers", href: "/admin/subscribers", icon: Mail },
  { label: "Homepage", href: "/admin/banners", icon: Megaphone },
  { label: "Blogs", href: "/admin/blogs", icon: BookOpen },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [open, setOpen] = useState(false);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#F7F5EC] text-[#28321F]">
      {open && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-[#1D3214]/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#1D3214] text-[#FBF7EE] transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] items-center justify-between px-5">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full border border-[#A8B88A]/40">
              <Leaf className="size-5" />
            </span>
            <div>
              <p className="font-serif text-lg leading-none">Liyana Naturals</p>
              <p className="mt-1 text-[10px] tracking-[0.16em] text-[#A8B88A]">ADMIN</p>
            </div>
          </Link>
          <button aria-label="Close menu" className="grid size-10 place-items-center lg:hidden" onClick={() => setOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition ${
                  active
                    ? "bg-[#FBF7EE] font-semibold text-[#263D18]"
                    : "text-[#E9DCC5]/80 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <div className="mb-2 px-3 py-2">
            <p className="truncate text-xs text-[#A8B88A]">{email}</p>
          </div>
          <button
            onClick={logout}
            className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm text-[#E9DCC5]/80 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#28321F]/8 bg-[#FBF7EE]/95 px-4 backdrop-blur md:px-7">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              onClick={() => setOpen(true)}
              className="grid size-10 place-items-center rounded-xl border border-[#28321F]/10 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-xs text-[#777968]">Liyana Naturals</p>
              <p className="font-serif text-lg text-[#263D18]">
                {navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))?.label ?? "Administration"}
              </p>
            </div>
          </div>
          <Link href="/" className="flex h-10 items-center rounded-full border border-[#28321F]/10 bg-white px-3 text-sm font-medium hover:border-[#536B35]/40">
            <span>View store</span>
          </Link>
        </header>
        <main className="p-4 md:p-7">{children}</main>
      </div>
    </div>
  );
}
