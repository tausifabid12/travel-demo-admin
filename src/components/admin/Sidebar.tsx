"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  LayoutDashboard,
  Plane,
  Globe2,
  Inbox,
  CalendarCheck,
  Briefcase,
  FileText,
  Layers,
  ImageIcon,
  Users,
  UserCog,
  BarChart3,
  Settings,
  Wallet,
  Menu,
  X,
  BellRing,
  LifeBuoy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { canAccess, type Module } from "@/lib/permissions";

const NAV: { label: string; href: string; module: Module; icon: typeof Plane }[] = [
  { label: "Dashboard", href: "/admin", module: "dashboard", icon: LayoutDashboard },
  { label: "TravelXL Packages", href: "/admin/packages", module: "packages", icon: Plane },
  { label: "Destinations", href: "/admin/destinations", module: "destinations", icon: Globe2 },
  { label: "Offerings", href: "/admin/offerings", module: "offerings", icon: Layers },
  { label: "Case Studies", href: "/admin/case-studies", module: "case-studies", icon: Briefcase },
  { label: "Insights", href: "/admin/insights", module: "insights", icon: FileText },
  { label: "Media Library", href: "/admin/media", module: "media", icon: ImageIcon },
  { label: "Bookings", href: "/admin/bookings", module: "bookings", icon: CalendarCheck },
  { label: "Enquiries & Leads", href: "/admin/enquiries", module: "enquiries", icon: Inbox },
  { label: "Careers", href: "/admin/careers", module: "careers", icon: Users },
  { label: "Applications", href: "/admin/careers/applications", module: "applications", icon: UserCog },
  { label: "Reports", href: "/admin/reports", module: "reports", icon: BarChart3 },
  { label: "Finance", href: "/admin/finance", module: "finance", icon: Wallet },
  { label: "Users & Roles", href: "/admin/users", module: "users", icon: UserCog },
  { label: "Settings", href: "/admin/settings", module: "settings", icon: Settings },
  { label: "Push Notifications", href: "/admin/push-notifications", module: "notifications", icon: BellRing },
  { label: "Support Tickets", href: "/admin/support", module: "support", icon: LifeBuoy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const role = (session?.user as { role?: string } | undefined)?.role;
  // Until the session resolves, show everything rather than flashing an empty
  // nav; the proxy and API still enforce the real permissions.
  const items = session ? NAV.filter((i) => canAccess(role, i.module)) : NAV;

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    if (href === "/admin/careers") {
      return pathname.startsWith("/admin/careers") && !pathname.includes("/applications");
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="md:hidden fixed top-3 left-3 z-60 size-10 grid place-items-center rounded-md bg-admin-surface border border-admin-border text-admin-text-primary"
      >
        <Menu className="size-5" />
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-60"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "w-[260px] bg-admin-surface border-r border-admin-border fixed top-0 left-0 h-screen flex flex-col z-70 transition-transform",
          "md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-admin-border shrink-0">
          <Link href="/admin" className="text-lg font-bold tracking-tight text-admin-text-primary">
            Bhancer <span className="text-admin-accent">Admin</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="md:hidden text-admin-text-secondary"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto">
          {items.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              aria-current={isActive(href) ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md mb-1 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-admin-accent/10 text-admin-accent"
                  : "text-admin-text-secondary hover:bg-admin-surface-hover hover:text-admin-text-primary",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-admin-border shrink-0">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-surface-hover transition-colors"
          >
            <Globe2 className="size-4" /> View live site
          </Link>
        </div>
      </aside>
    </>
  );
}
