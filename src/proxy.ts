import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { canAccess, type Module } from "@/lib/permissions";

/** First path segment after /admin -> the module it maps to. */
const SEGMENT_MODULE: Record<string, Module> = {
  "": "dashboard",
  packages: "packages",
  destinations: "destinations",
  "case-studies": "case-studies",
  insights: "insights",
  offerings: "offerings",
  media: "media",
  careers: "careers",
  applications: "applications",
  enquiries: "enquiries",
  bookings: "bookings",
  reports: "reports",
  users: "users",
  settings: "settings",
  finance: "finance",
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  const segment = pathname.replace(/^\/admin\/?/, "").split("/")[0] ?? "";
  const segmentModule = SEGMENT_MODULE[segment];

  // Careers applications live under /admin/careers/applications
  const effective =
    segment === "careers" && pathname.includes("/applications")
      ? "applications"
      : segmentModule;

  if (effective && !canAccess(token.role as string, effective)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
