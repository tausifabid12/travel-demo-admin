export const ROLES = [
  "SuperAdmin",
  "ContentManager",
  "HRAdmin",
  "Sales",
  "Editor",
] as const;

export type Role = (typeof ROLES)[number];

/** Roles stored by the earlier schema, mapped forward so existing rows keep working. */
const LEGACY_ROLE_MAP: Record<string, Role> = {
  Manager: "ContentManager",
  Finance: "SuperAdmin",
};

export function normalizeRole(role: string | undefined | null): Role {
  if (!role) return "Editor";
  if ((ROLES as readonly string[]).includes(role)) return role as Role;
  return LEGACY_ROLE_MAP[role] ?? "Editor";
}

/** Every guardable area of the admin. */
export type Module =
  | "dashboard"
  | "packages"
  | "destinations"
  | "case-studies"
  | "insights"
  | "offerings"
  | "media"
  | "careers"
  | "applications"
  | "enquiries"
  | "bookings"
  | "reports"
  | "users"
  | "settings"
  | "finance"
  | "seo"
  | "support"
  | "notifications";

export type Action = "read" | "create" | "update" | "delete" | "publish";

type Grant = Partial<Record<Module, Action[]>>;

const ALL: Action[] = ["read", "create", "update", "delete", "publish"];
const CONTENT_MODULES: Module[] = [
  "packages",
  "destinations",
  "case-studies",
  "insights",
  "offerings",
  "media",
];

function grantEach(modules: Module[], actions: Action[]): Grant {
  return Object.fromEntries(modules.map((m) => [m, actions])) as Grant;
}

const MATRIX: Record<Role, Grant> = {
  SuperAdmin: grantEach(
    [
      "dashboard",
      ...CONTENT_MODULES,
      "careers",
      "applications",
      "enquiries",
      "bookings",
      "reports",
      "users",
      "settings",
      "finance",
      "seo",
      "support",
      "notifications",
    ],
    ALL,
  ),
  ContentManager: {
    dashboard: ["read"],
    // create/update/publish, but never delete
    ...grantEach(CONTENT_MODULES, ["read", "create", "update", "publish"]),
    enquiries: ["read"],
    bookings: ["read"],
    reports: ["read"],
    seo: ["read", "create", "update", "publish"],
    support: ["read", "update"],
  },
  HRAdmin: {
    dashboard: ["read"],
    careers: ALL,
    applications: ALL,
    reports: ["read"],
  },
  Sales: {
    dashboard: ["read"],
    enquiries: ["read", "update"],
    bookings: ["read", "update"],
    reports: ["read"],
    packages: ["read"],
  },
  Editor: {
    dashboard: ["read"],
    // draft-only: may create and update, never publish or delete
    ...grantEach(CONTENT_MODULES, ["read", "create", "update"]),
  },
};

export function can(role: string | undefined, module: Module, action: Action): boolean {
  return MATRIX[normalizeRole(role)][module]?.includes(action) ?? false;
}

export function canAccess(role: string | undefined, module: Module): boolean {
  return can(role, module, "read");
}

/** Modules a role may open, used to build the sidebar. */
export function allowedModules(role: string | undefined): Module[] {
  return Object.keys(MATRIX[normalizeRole(role)]) as Module[];
}
