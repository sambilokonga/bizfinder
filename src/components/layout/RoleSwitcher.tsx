"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { UserRole } from "@/types/user";
import { DEMO_USERS, DemoUser, normalizeRole, getRoleLabel } from "@/lib/auth/roles";
import { Shield, User, Building, Crown, ChevronDown, Loader2 } from "lucide-react";

import { can as canCheck, getPermissions, Permission } from "@/lib/auth/permissions";

interface RoleContextType {
  currentRole: UserRole;
  currentUser: DemoUser;
  setRole: (role: UserRole) => void;
  can: (permission: Permission) => boolean;
  permissions: Permission[];
}

const RoleContext = createContext<RoleContextType>({
  currentRole: "user",
  currentUser: DEMO_USERS.user,
  setRole: () => {},
  can: (permission: Permission) => canCheck("user", permission),
  permissions: getPermissions("user"),
});

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded, user } = useUser();
  const [currentRole, setCurrentRole] = useState<UserRole>("user");
  const [synced, setSynced] = useState(false);

  const resolveRole = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      setCurrentRole("user");
      setSynced(true);
      return;
    }

    /**
     * Step 1: Force-reload the Clerk user object to ensure we have
     * the very latest publicMetadata (important right after sign-in
     * before the JWT has propagated).
     */
    try {
      await user.reload();
    } catch {
      // Non-fatal — proceed with cached data
    }

    /**
     * Step 2: Read role from all known Clerk metadata locations.
     *
     * Priority order:
     *   a) publicMetadata.role  — set by admins in Clerk dashboard (most authoritative)
     *   b) publicMetadata.roles — array variant
     *   c) publicMetadata.business_role / userRole
     *   d) unsafeMetadata.role  — set client-side as fallback
     *   e) Organization membership role (org:admin → admin, org:member → user)
     */
    const rawFromMeta =
      (user.publicMetadata as any)?.role ||
      (user.publicMetadata as any)?.roles ||
      (user.publicMetadata as any)?.business_role ||
      (user.publicMetadata as any)?.userRole ||
      (user.unsafeMetadata as any)?.role ||
      (user.unsafeMetadata as any)?.roles;

    if (rawFromMeta) {
      const normalized = normalizeRole(rawFromMeta);
      setCurrentRole(normalized);
      if (typeof document !== "undefined") {
        document.cookie = `bizfinder_role=${normalized}; path=/; max-age=604800; SameSite=Lax`;
      }
      setSynced(true);
      return;
    }

    /**
     * Step 3: Check org membership role as fallback.
     */
    const orgRole = (user as any)?.organizationMemberships?.[0]?.role as string | undefined;
    if (orgRole) {
      const normalized = normalizeRole(orgRole);
      if (normalized !== "user") {
        setCurrentRole(normalized);
        if (typeof document !== "undefined") {
          document.cookie = `bizfinder_role=${normalized}; path=/; max-age=604800; SameSite=Lax`;
        }
        setSynced(true);
        return;
      }
    }

    /**
     * Step 4: Fall back to DB role returned by our API (syncs Clerk → Mongo).
     */
    try {
      const res = await fetch("/api/users/me");
      if (res.ok) {
        const data = await res.json();
        const dbRole = normalizeRole(data.role || data.user?.role);
        setCurrentRole(dbRole);
        if (typeof document !== "undefined") {
          document.cookie = `bizfinder_role=${dbRole}; path=/; max-age=604800; SameSite=Lax`;
        }
      }
    } catch {
      // Silent fallback – leave as "user"
    } finally {
      setSynced(true);
    }
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    resolveRole();
  }, [resolveRole]);

  // Merge real user info with DemoUser shape for backwards compat
  const clerkUser: DemoUser = isSignedIn && user
    ? {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User",
        email: user.emailAddresses?.[0]?.emailAddress || "",
        role: currentRole,
        avatarUrl: user.imageUrl || DEMO_USERS[currentRole].avatarUrl,
        claimedBusinessIds: [],
      }
    : DEMO_USERS[currentRole];

  return (
    <RoleContext.Provider
      value={{
        currentRole,
        currentUser: clerkUser,
        setRole: (r) => {
          setCurrentRole(r);
          if (typeof document !== "undefined") {
            document.cookie = `bizfinder_role=${r}; path=/; max-age=604800; SameSite=Lax`;
          }
        },
        can: (permission: Permission) => canCheck(currentRole, permission),
        permissions: getPermissions(currentRole),
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useCurrentRole() {
  return useContext(RoleContext);
}

export function RoleSwitcher() {
  const { currentRole, setRole } = useCurrentRole();
  const { isSignedIn, isLoaded } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  const roles: Array<{ role: UserRole; label: string; icon: React.ReactNode; desc: string; portalUrl: string }> = [
    {
      role: "city_admin",
      label: "City Admin",
      icon: <span className="text-sm">🏙️</span>,
      desc: "Municipal verification, sub-city zones & reports",
      portalUrl: "/city-admin",
    },
    {
      role: "country_admin",
      label: "Country Main Admin",
      icon: <span className="text-sm">🌍</span>,
      desc: "National territory lead, manage city admins & national directory",
      portalUrl: "/admin",
    },
    {
      role: "super_admin",
      label: "Super Admin",
      icon: <Crown className="w-4 h-4 text-purple-500" />,
      desc: "Global system control, 195 nations & audit logs",
      portalUrl: "/admin",
    },
    {
      role: "owner",
      label: "Business Owner",
      icon: <Building className="w-4 h-4 text-emerald-500" />,
      desc: "Manage listings, hours, photos, analytics",
      portalUrl: "/dashboard",
    },
    {
      role: "admin",
      label: "Operations Admin",
      icon: <Shield className="w-4 h-4 text-amber-500" />,
      desc: "Moderate reviews, verify listings, manage reports",
      portalUrl: "/admin",
    },
    {
      role: "user",
      label: "Customer",
      icon: <User className="w-4 h-4 text-sky-500" />,
      desc: "Search, view, and save businesses",
      portalUrl: "/",
    },
  ];

  const currentRoleInfo = roles.find((r) => r.role === currentRole) || roles[0];

  if (!isLoaded) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-muted-foreground border border-slate-200 dark:border-slate-700">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-muted-foreground border border-slate-200 dark:border-slate-700">
        <User className="w-3.5 h-3.5 text-sky-500" />
        <span className="font-medium text-muted-foreground">Guest</span>
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
        title={`Current Role: ${currentRoleInfo?.label}`}
      >
        <div className="flex items-center gap-1">
          {currentRoleInfo?.icon}
          <span className="text-[11px] font-bold hidden sm:inline-block max-w-[80px] truncate">
            {currentRoleInfo?.label}
          </span>
        </div>
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl bg-card border border-border p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-2 py-1.5 text-[11px] font-bold text-muted-foreground border-b border-border/50 uppercase tracking-wider flex items-center justify-between">
            <span>Select Perspective / Role</span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-muted text-foreground">Interactive</span>
          </div>

          <div className="mt-2 space-y-1 max-h-[340px] overflow-y-auto pr-0.5">
            {roles.map((r) => {
              const isSelected = r.role === currentRole;
              return (
                <div
                  key={r.role}
                  onClick={() => {
                    setRole(r.role);
                  }}
                  className={`w-full text-left p-2 rounded-xl transition-all cursor-pointer border ${
                    isSelected
                      ? "bg-primary/10 border-primary/30 text-foreground shadow-sm"
                      : "hover:bg-accent/60 border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">{r.icon}</div>
                      <div>
                        <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          {r.label}
                          {isSelected && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-primary text-primary-foreground font-black">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-muted-foreground leading-snug line-clamp-1">
                          {r.desc}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isSelected && r.portalUrl !== "/" && (
                    <div className="mt-2 pt-1.5 border-t border-primary/20 flex justify-end">
                      <a
                        href={r.portalUrl}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                        }}
                        className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        Go to Dashboard →
                      </a>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-muted-foreground mt-2 px-1 text-center">
            Role session is persisted in cookies and synced with API.
          </p>
        </div>
      )}
    </div>
  );
}
