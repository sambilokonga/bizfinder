import { UserRole } from "@/types/user";
// Re-export the new granular permission system for convenience
export { can, getPermissions, canAccessPortal } from "@/lib/auth/permissions";
export type { Permission } from "@/lib/auth/permissions";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  assignedCountry?: string;
  assignedCity?: string;
  claimedBusinessIds: string[];
}

export const DEMO_USERS: Record<UserRole, DemoUser> = {
  user: {
    id: "user-cust-1",
    name: "Daniel Tesfaye",
    email: "daniel@example.com",
    role: "user",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    claimedBusinessIds: [],
  },
  owner: {
    id: "user-owner-1",
    name: "Samuel Kebede (Business Owner)",
    email: "samuel@kategnarestaurant.com",
    role: "owner",
    avatarUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80",
    claimedBusinessIds: ["biz-1"],
  },
  city_admin: {
    id: "user-city-admin-1",
    name: "Elena Vance (City Admin)",
    email: "cityadmin@bizfinder.et",
    role: "city_admin",
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80",
    assignedCountry: "Ethiopia",
    assignedCity: "Addis Ababa",
    claimedBusinessIds: [],
  },
  country_admin: {
    id: "user-country-admin-1",
    name: "Marcus Holloway (Country Main Admin)",
    email: "countryadmin@bizfinder.et",
    role: "country_admin",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    assignedCountry: "Ethiopia",
    claimedBusinessIds: [],
  },
  admin: {
    id: "user-admin-1",
    name: "Sarah Connor (Operations Admin)",
    email: "admin@bizfinder.et",
    role: "admin",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
    assignedCountry: "Ethiopia",
    assignedCity: "Addis Ababa",
    claimedBusinessIds: [],
  },
  super_admin: {
    id: "user-super-1",
    name: "Alex Rivera (Super Admin)",
    email: "superadmin@bizfinder.et",
    role: "super_admin",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    claimedBusinessIds: [],
  },
};

/**
 * Legacy permission helper — kept for backwards compatibility.
 * Prefer the granular `can(role, permission)` from permissions.ts for new code.
 */
export function hasPermission(
  role: UserRole,
  action: "manage_taxonomy" | "approve_listings" | "manage_users" | "edit_own_business" | "write_reviews" | "manage_geo_admins"
): boolean {
  switch (action) {
    case "write_reviews":
      return true;
    case "edit_own_business":
      return role === "owner" || role === "city_admin" || role === "country_admin" || role === "admin" || role === "super_admin";
    case "approve_listings":
      return role === "city_admin" || role === "country_admin" || role === "admin" || role === "super_admin";
    case "manage_geo_admins":
      return role === "country_admin" || role === "super_admin";
    case "manage_taxonomy":
    case "manage_users":
      return role === "super_admin";
    default:
      return false;
  }
}

/**
 * Normalizes any role string from the Clerk dashboard into a valid BizFinder UserRole.
 */
export function normalizeRole(raw: any): UserRole {
  if (!raw) return "user";

  // Handle nested object format like { role: "admin" } or { name: "admin" }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    raw = raw.role || raw.name || raw.value || raw.slug || raw.title || raw.id || raw;
  }

  // Handle array format like ["admin"] or [{ role: "admin" }]
  if (Array.isArray(raw)) {
    const roles = raw.map((r) => {
      const val = typeof r === "object" ? r?.role || r?.name || r?.value || r?.slug || r : r;
      return String(val).toLowerCase().trim();
    });
    if (roles.some((r) => r.includes("super"))) return "super_admin";
    if (roles.some((r) => r.includes("country"))) return "country_admin";
    if (roles.some((r) => r.includes("city"))) return "city_admin";
    if (roles.some((r) => r.includes("admin") && !r.includes("owner"))) return "admin";
    if (roles.some((r) => r.includes("owner") || r.includes("business") || r.includes("merchant"))) return "owner";
    return "user";
  }

  const str = String(raw).toLowerCase().trim().replace(/[\s_-]+/g, "_");

  // 1. Super Admin
  if (
    str === "super_admin" ||
    str === "superadmin" ||
    str === "super" ||
    str.includes("super_admin") ||
    str.includes("superadmin")
  ) {
    return "super_admin";
  }

  // 2. Country Main Admin
  if (
    str === "country_admin" ||
    str === "countryadmin" ||
    str === "country_main_admin" ||
    str.includes("country_admin")
  ) {
    return "country_admin";
  }

  // 3. City Admin
  if (
    str === "city_admin" ||
    str === "cityadmin" ||
    str === "municipal_admin" ||
    str.includes("city_admin")
  ) {
    return "city_admin";
  }

  // 4. Admin
  if (
    str === "admin" ||
    str === "moderator" ||
    str === "org_admin" ||
    str === "org:admin" ||
    (str.includes("admin") && !str.includes("owner"))
  ) {
    return "admin";
  }

  // 5. Business Owner
  if (
    str === "owner" ||
    str === "business_owner" ||
    str === "businessowner" ||
    str === "merchant" ||
    str === "business" ||
    str === "org_owner" ||
    str === "org:owner" ||
    str.includes("owner") ||
    str.includes("business") ||
    str.includes("merchant")
  ) {
    return "owner";
  }

  // 6. General User / Customer
  return "user";
}

/**
 * Returns the destination portal path for each role after signing in.
 */
export function getRoleRedirectPath(role: UserRole): string {
  switch (role) {
    case "super_admin":
    case "country_admin":
    case "admin":
      return "/admin";
    case "city_admin":
      return "/city-admin";
    case "owner":
      return "/dashboard";
    case "user":
    default:
      return "/";
  }
}

/**
 * Returns the human-readable title for each role.
 */
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin (Global)";
    case "country_admin":
      return "Country Main Admin";
    case "city_admin":
      return "City Admin";
    case "admin":
      return "Admin";
    case "owner":
      return "Business Owner";
    case "user":
    default:
      return "Customer";
  }
}
