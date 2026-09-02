"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/packages": "TravelXL Packages",
  "/admin/destinations": "Destinations",
  "/admin/offerings": "Offerings",
  "/admin/case-studies": "Case Studies",
  "/admin/insights": "Insights",
  "/admin/media": "Media Library",
  "/admin/bookings": "Bookings",
  "/admin/enquiries": "Enquiries & Leads",
  "/admin/careers": "Careers",
  "/admin/careers/applications": "Applications",
  "/admin/reports": "Reports",
  "/admin/finance": "Finance",
  "/admin/users": "Users & Roles",
  "/admin/settings": "Settings",
};

const ROLE_LABELS: Record<string, string> = {
  SuperAdmin: "Super Admin",
  ContentManager: "Content Manager",
  HRAdmin: "HR Admin",
  Sales: "Sales / BD",
  Editor: "Editor",
};

function titleFor(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  const match = Object.keys(TITLES)
    .filter((key) => key !== "/admin" && pathname.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];
  return match ? TITLES[match] : "Admin";
}

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const user = session?.user as
    | { name?: string | null; email?: string | null; role?: string }
    | undefined;

  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "··";

  return (
    <header className="h-16 shrink-0 border-b border-admin-border bg-admin-surface/70 backdrop-blur sticky top-0 z-40 flex items-center justify-between px-6 pl-16 md:pl-6">
      <h2 className="text-sm font-medium text-admin-text-secondary uppercase tracking-wider">
        {titleFor(pathname)}
      </h2>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-admin-surface-hover transition-colors"
        >
          <span className="size-8 rounded-full bg-admin-accent/15 text-admin-accent grid place-items-center text-xs font-semibold">
            {initials}
          </span>
          <span className="text-left hidden sm:block">
            <span className="block text-sm text-admin-text-primary leading-tight">
              {user?.name ?? "Signed out"}
            </span>
            <span className="block text-[11px] text-admin-text-secondary leading-tight">
              {ROLE_LABELS[user?.role ?? ""] ?? user?.role ?? "—"}
            </span>
          </span>
          <ChevronDown
            className={cn(
              "size-4 text-admin-text-secondary transition-transform",
              menuOpen && "rotate-180",
            )}
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />
            <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border border-admin-border bg-admin-surface shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-admin-border">
                <p className="text-sm text-admin-text-primary truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-admin-text-secondary truncate">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/admin/login" })}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-admin-text-secondary hover:text-admin-text-primary hover:bg-admin-surface-hover transition-colors"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
