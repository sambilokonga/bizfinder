import { UserRole } from "@/types/user";

/**
 * All permissions in the BizFinder platform.
 * Derived from the role-permission spec table.
 */
export type Permission =
  // Business – General User
  | "business.search"
  | "business.read"
  | "business.view"
  | "business.save"
  // Business – Owner
  | "business.create"
  | "business.update_own"
  | "business.delete_own"
  | "business.publish_own"
  | "business_photo.manage_own"
  | "business_video.manage_own"
  | "business_location.update_own"
  | "business_hours.manage_own"
  | "review.read"
  | "review.respond_own"
  | "analytics.read_own"
  // Business – City Admin / Admin
  | "user.read"
  | "user.update"
  | "user.suspend"
  | "business.update_any"
  | "business.delete_any"
  | "business.verify"
  | "business.approve"
  | "business.reject"
  | "review.moderate"
  | "review.delete_any"
  | "category.manage"
  | "report.manage"
  | "analytics.read"
  // Country Main Admin permissions
  | "city_admin.manage"
  | "city_admin.create"
  | "city_admin.assign"
  | "country.analytics.read"
  // Super Admin only
  | "country_admin.manage"
  | "country_admin.create"
  | "country_admin.assign"
  | "admin.create"
  | "admin.update"
  | "admin.delete"
  | "role.manage"
  | "permission.manage"
  | "system.settings.manage"
  | "audit_log.manage"
  | "platform.manage";

/** Permissions granted to each role (cumulative — higher roles include lower). */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    "business.search",
    "business.read",
    "business.view",
    "business.save",
    "review.read",
  ],

  owner: [
    // Inherits user permissions
    "business.search",
    "business.read",
    "business.view",
    "business.save",
    "review.read",
    // Owner-specific
    "business.create",
    "business.update_own",
    "business.delete_own",
    "business.publish_own",
    "business_photo.manage_own",
    "business_video.manage_own",
    "business_location.update_own",
    "business_hours.manage_own",
    "review.respond_own",
    "analytics.read_own",
  ],

  city_admin: [
    // Inherits user + owner permissions
    "business.search",
    "business.read",
    "business.view",
    "business.save",
    "review.read",
    "business.create",
    "business.update_own",
    "business.delete_own",
    "business.publish_own",
    "business_photo.manage_own",
    "business_video.manage_own",
    "business_location.update_own",
    "business_hours.manage_own",
    "review.respond_own",
    "analytics.read_own",
    // City admin-specific
    "user.read",
    "business.update_any",
    "business.verify",
    "business.approve",
    "business.reject",
    "review.moderate",
    "report.manage",
    "analytics.read",
  ],

  country_admin: [
    // Inherits city admin permissions
    "business.search",
    "business.read",
    "business.view",
    "business.save",
    "review.read",
    "business.create",
    "business.update_own",
    "business.delete_own",
    "business.publish_own",
    "business_photo.manage_own",
    "business_video.manage_own",
    "business_location.update_own",
    "business_hours.manage_own",
    "review.respond_own",
    "analytics.read_own",
    "user.read",
    "user.update",
    "business.update_any",
    "business.delete_any",
    "business.verify",
    "business.approve",
    "business.reject",
    "review.moderate",
    "review.delete_any",
    "category.manage",
    "report.manage",
    "analytics.read",
    // Country admin-specific
    "city_admin.manage",
    "city_admin.create",
    "city_admin.assign",
    "country.analytics.read",
  ],

  admin: [
    // General Admin (Legacy/Full Scope)
    "business.search",
    "business.read",
    "business.view",
    "business.save",
    "review.read",
    "business.create",
    "business.update_own",
    "business.delete_own",
    "business.publish_own",
    "business_photo.manage_own",
    "business_video.manage_own",
    "business_location.update_own",
    "business_hours.manage_own",
    "review.respond_own",
    "analytics.read_own",
    "user.read",
    "user.update",
    "user.suspend",
    "business.update_any",
    "business.delete_any",
    "business.verify",
    "business.approve",
    "business.reject",
    "review.moderate",
    "review.delete_any",
    "category.manage",
    "report.manage",
    "analytics.read",
    "city_admin.manage",
    "city_admin.create",
    "city_admin.assign",
    "country.analytics.read",
  ],

  super_admin: [
    // All permissions globally
    "business.search",
    "business.read",
    "business.view",
    "business.save",
    "review.read",
    "business.create",
    "business.update_own",
    "business.delete_own",
    "business.publish_own",
    "business_photo.manage_own",
    "business_video.manage_own",
    "business_location.update_own",
    "business_hours.manage_own",
    "review.respond_own",
    "analytics.read_own",
    "user.read",
    "user.update",
    "user.suspend",
    "business.update_any",
    "business.delete_any",
    "business.verify",
    "business.approve",
    "business.reject",
    "review.moderate",
    "review.delete_any",
    "category.manage",
    "report.manage",
    "analytics.read",
    "city_admin.manage",
    "city_admin.create",
    "city_admin.assign",
    "country.analytics.read",
    "country_admin.manage",
    "country_admin.create",
    "country_admin.assign",
    "admin.create",
    "admin.update",
    "admin.delete",
    "role.manage",
    "permission.manage",
    "system.settings.manage",
    "audit_log.manage",
    "platform.manage",
  ],
};

/**
 * Check whether a role has a specific permission.
 */
export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Returns all permissions for a given role.
 */
export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check whether a role can access a portal/section.
 */
export function canAccessPortal(
  role: UserRole,
  portal: "home" | "dashboard" | "admin" | "city_admin"
): boolean {
  switch (portal) {
    case "city_admin":
      return role === "city_admin" || role === "country_admin" || role === "super_admin" || role === "admin";
    case "admin":
      return role === "city_admin" || role === "country_admin" || role === "admin" || role === "super_admin";
    case "dashboard":
      return role === "owner" || role === "city_admin" || role === "country_admin" || role === "admin" || role === "super_admin";
    case "home":
    default:
      return true;
  }
}
