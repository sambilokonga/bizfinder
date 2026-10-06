"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { normalizeRole, getRoleRedirectPath, getRoleLabel } from "@/lib/auth/roles";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

/**
 * /auth/redirect
 *
 * Called automatically after every sign-in / sign-up.
 *
 * Flow:
 * 1. Wait for Clerk to fully load the user.
 * 2. Call user.reload() to flush stale cached publicMetadata.
 * 3. Read publicMetadata.role — the authoritative role set in Clerk dashboard.
 * 4. As a safety net, also call /api/users/me to sync Clerk → MongoDB.
 * 5. Redirect to the correct portal: /admin | /dashboard | /
 *
 * Has a 10-second hard timeout to prevent infinite loading states.
 */
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const originParam = searchParams.get("origin");
  const { isLoaded, isSignedIn, user } = useUser();
  const redirected = useRef(false);
  const [statusMsg, setStatusMsg] = useState("Verifying your account…");
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoaded || redirected.current) return;

    if (!isSignedIn) {
      router.replace("/sign-in");
      return;
    }

    // 10-second hard timeout — fall back to homepage if something goes wrong
    const timeout = setTimeout(() => {
      if (!redirected.current) {
        redirected.current = true;
        setTimedOut(true);
        setTimeout(() => router.replace("/"), 2000);
      }
    }, 10_000);

    function computeDestination(role: any) {
      if (originParam && originParam !== "/auth/redirect") {
        if (originParam.startsWith("/admin")) {
          if (role === "admin" || role === "super_admin") return originParam;
        } else if (originParam.startsWith("/dashboard")) {
          if (role === "owner" || role === "admin" || role === "super_admin") return originParam;
        } else {
          return originParam;
        }
      }
      return getRoleRedirectPath(role);
    }

    function setRoleCookie(role: string) {
      if (typeof document !== "undefined") {
        document.cookie = `bizfinder_role=${role}; path=/; max-age=604800; SameSite=Lax`;
      }
    }

    async function doRedirect() {
      try {
        setStatusMsg("Loading your profile…");

        // Step 1: Force-reload to get freshest publicMetadata from Clerk
        try {
          await user!.reload();
        } catch {
          // Non-fatal
        }

        // Step 2: Try reading role directly from publicMetadata (fastest path)
        const rawFromMeta =
          (user!.publicMetadata as any)?.role ||
          (user!.publicMetadata as any)?.roles ||
          (user!.publicMetadata as any)?.business_role ||
          (user!.publicMetadata as any)?.userRole ||
          (user!.unsafeMetadata as any)?.role ||
          (user!.unsafeMetadata as any)?.roles ||
          (user as any)?.organizationMemberships?.[0]?.role;

        let resolvedRole = rawFromMeta ? normalizeRole(rawFromMeta) : null;

        // Step 3: Call /api/users/me to sync with MongoDB and set response cookie
        try {
          setStatusMsg("Syncing role & permissions…");
          const res = await fetch("/api/users/me");
          if (res.ok) {
            const data = await res.json();
            if (data.role) {
              resolvedRole = normalizeRole(data.role);
            }
          }
        } catch {
          // Non-fatal if API is temporarily slow
        }

        const finalRole = resolvedRole || "user";
        setRoleCookie(finalRole);

        if (!redirected.current) {
          redirected.current = true;
          clearTimeout(timeout);
          const destination = computeDestination(finalRole);
          setStatusMsg(`Welcome! Directing you to ${getRoleLabel(finalRole)} portal…`);
          setTimeout(() => router.replace(destination), 350);
        }
      } catch (err) {
        if (!redirected.current) {
          redirected.current = true;
          clearTimeout(timeout);
          const rawRole =
            (user!.publicMetadata as any)?.role ||
            (user!.unsafeMetadata as any)?.role;
          const finalRole = normalizeRole(rawRole);
          setRoleCookie(finalRole);
          router.replace(computeDestination(finalRole));
        }
      }
    }

    doRedirect();

    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, user, router, originParam]);

  if (timedOut) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-amber-500" />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-bold text-foreground">Taking longer than expected…</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Redirecting you to the home page. You can navigate to your portal manually.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6">
      {/* Animated logo mark */}
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/30 animate-bounce">
        <ShieldCheck className="w-8 h-8 text-white" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
          Setting up your portal…
        </div>
        <p className="text-sm text-muted-foreground max-w-xs">
          {statusMsg}
        </p>
      </div>
    </div>
  );
}

export default function AuthRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm text-muted-foreground">Loading session…</p>
        </div>
      }
    >
      <AuthRedirectContent />
    </Suspense>
  );
}
