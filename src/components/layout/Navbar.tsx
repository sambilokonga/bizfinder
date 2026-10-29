"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Search,
  MapPin,
  Building2,
  Bookmark,
  Heart,
  Shield,
  LayoutDashboard,
  Menu,
  X,
  Sparkles,
  PlusCircle,
  LogIn,
  UserPlus,
  Crown,
  Upload,
} from "lucide-react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleSwitcher, useCurrentRole } from "./RoleSwitcher";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { UploadBusinessModal } from "@/components/business/UploadBusinessModal";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useSavedBusinesses } from "@/hooks/useSavedBusinesses";

export function Navbar() {
  const pathname = usePathname();
  const { currentRole, currentUser } = useCurrentRole();
  const { user, isLoaded } = useUser();
  const { totalSaved } = useSavedBusinesses();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const isOwner = currentRole === "owner";
  const isCityAdmin = currentRole === "city_admin";
  const isCountryAdmin = currentRole === "country_admin";
  const isSuperAdmin = currentRole === "super_admin";
  const isAdmin = currentRole === "admin" || currentRole === "super_admin" || currentRole === "country_admin";
  const canUpload = isAdmin || isCityAdmin;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-[1600px] w-full mx-auto flex h-16 items-center justify-between px-2 sm:px-4 lg:px-6 gap-1.5">
        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 lg:gap-3 xl:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/logo.png"
                alt="BizGlobe Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain drop-shadow-sm"
                priority
              />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-lg xl:text-xl font-black tracking-tight text-foreground flex items-center gap-1">
                Biz<span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">Globe</span>
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
              </span>
              <span className="text-[9px] -mt-1 font-medium text-muted-foreground tracking-wider uppercase">
                Global Business Directory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Medium, Large & Extra Large screens) - Icons Only, Hidden Text */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-1.5">
            <Link
              href="/search"
              className={`relative p-2 rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                pathname === "/search"
                  ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              }`}
              title="Explore Map"
              aria-label="Explore Map"
            >
              <MapPin className="w-4 h-4" />
            </Link>

            <Link
              href="/categories"
              className={`relative p-2 rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                pathname.startsWith("/categories") || pathname.startsWith("/category")
                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
              }`}
              title="All Categories"
              aria-label="All Categories"
            >
              <Building2 className="w-4 h-4" />
            </Link>

            <Link
              href="/saved"
              className={`relative p-2 rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                pathname === "/saved"
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              }`}
              title="Favorites"
              aria-label="Favorites"
            >
              <Heart className={`w-4 h-4 ${totalSaved > 0 ? "text-rose-500 fill-rose-500" : ""}`} />
              {totalSaved > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm pointer-events-none ring-2 ring-background animate-in zoom-in-50">
                  {totalSaved}
                </span>
              )}
            </Link>

            <Link
              href="/profile"
              className={`relative p-2 rounded-xl transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                pathname === "/profile"
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 font-semibold shadow-sm"
                  : "text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
              }`}
              title="Preferences"
              aria-label="Preferences"
            >
              <Sparkles className="w-4 h-4" />
            </Link>

            {/* Quick Search Icon Button */}
            <Link
              href="/search"
              className="flex items-center justify-center w-8 h-8 rounded-xl text-muted-foreground hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-muted/80 transition-all hover:scale-105 active:scale-95"
              title="Search directory"
              aria-label="Search directory"
            >
              <Search className="w-4 h-4" />
            </Link>
          </nav>
        </div>

        {/* Action Controls & Auth / Role Switcher (Large & XL screens) */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {/* Interactive Role Switcher */}
          <RoleSwitcher />

          {/* Dark / Light Theme Toggle */}
          <ThemeToggle variant="button" />

          {/* Notifications Center with Live Confirmation Alerts */}
          <NotificationBell />

          {/* Role-Specific Portal Links */}
          {isCityAdmin && (
            <Link href="/city-admin">
              <button className="group flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-sky-200/80 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-950/60 hover:border-sky-400/60 transition-all text-xs font-bold shadow-sm">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="text-[10px] leading-none">🏙️</span>
                </div>
                <span className="hidden xl:inline">City Admin</span>
              </button>
            </Link>
          )}

          {isCountryAdmin && (
            <Link href="/admin">
              <button className="group flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-indigo-200/80 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 hover:border-indigo-400/60 transition-all text-xs font-bold shadow-sm">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <span className="text-[10px] leading-none">🌍</span>
                </div>
                <span className="hidden xl:inline">Country Admin</span>
              </button>
            </Link>
          )}

          {isSuperAdmin && (
            <Link href="/admin">
              <button className="group flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-purple-200/80 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950/60 hover:border-purple-400/60 transition-all text-xs font-bold shadow-sm">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <Crown className="w-3 h-3 text-white" />
                </div>
                <span className="hidden xl:inline">Super Admin</span>
              </button>
            </Link>
          )}

          {isAdmin && !isSuperAdmin && !isCountryAdmin && (
            <Link href="/admin">
              <button className="group flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-amber-200/80 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:border-amber-400/60 transition-all text-xs font-bold shadow-sm">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <Shield className="w-3 h-3 text-white" />
                </div>
                <span className="hidden xl:inline">Admin Panel</span>
              </button>
            </Link>
          )}

          {isOwner && (
            <Link href="/dashboard">
              <button className="group flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 hover:border-emerald-400/60 transition-all text-xs font-bold shadow-sm">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                  <LayoutDashboard className="w-3 h-3 text-white" />
                </div>
                <span className="hidden xl:inline">Owner Portal</span>
              </button>
            </Link>
          )}

          {/* Quick Upload CTA */}
          {canUpload && (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="group flex items-center gap-1.5 h-8 px-2.5 rounded-xl border border-border/80 bg-card hover:bg-accent hover:border-indigo-400/40 transition-all text-xs font-bold text-foreground shadow-sm"
              title="Upload business listings via CSV, Excel or JSON"
            >
              <div className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                <Upload className="w-3 h-3 text-white" />
              </div>
              <span className="hidden xl:inline">Upload</span>
            </button>
          )}

          {/* Add / Claim Business CTA */}
          <Link href="/dashboard/listings/new">
            <button className="group flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/30 transition-all active:scale-95">
              <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <PlusCircle className="w-3 h-3 text-white" />
              </div>
              <span className="hidden xl:inline">List Business</span>
            </button>
          </Link>

          {/* Auth & User Icon Section */}
          <div className="flex items-center gap-1.5 pl-1.5 border-l border-border/80 shrink-0">
            <SignedIn>
              <div className="flex items-center gap-1.5 shrink-0">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 rounded-full ring-2 ring-indigo-500/30",
                      userButtonPopoverCard: "!bg-slate-900 !border !border-slate-700/80 !shadow-2xl !rounded-2xl !opacity-100 !p-3 !w-72",
                      userButtonPopoverActionButton: "hover:!bg-slate-800 !text-slate-200 hover:!text-white transition-colors !rounded-xl !p-2.5",
                      userButtonPopoverActionButtonText: "!font-semibold !text-xs !text-slate-200",
                      userButtonPopoverFooter: "!border-t !border-slate-800/80 !pt-2",
                    },
                  }}
                />
                {user && (
                  <span className="text-xs font-semibold text-foreground hidden 2xl:inline-block max-w-[80px] truncate">
                    {user.firstName || user.username || "Account"}
                  </span>
                )}
              </div>
            </SignedIn>

            <SignedOut>
              <div className="flex items-center gap-1.5 shrink-0">
                <Link href="/sign-in">
                  <Button size="sm" variant="ghost" className="h-8 px-2.5 text-xs font-semibold gap-1.5">
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" variant="outline" className="h-8 px-2.5 text-xs font-semibold border-indigo-200 dark:border-indigo-800 gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Register</span>
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Small & Medium Screen Controls (< 1024px: XS, S, M) */}
        {/* Carefully proportioned so all components fit cleanly without horizontal overflow */}
        <div className="flex lg:hidden items-center gap-1 xs:gap-1.5 shrink-0">
          {/* Quick Search Shortcut */}
          <Link
            href="/search"
            className="md:hidden w-8 h-8 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
            title="Search directory"
            aria-label="Search directory"
          >
            <Search className="w-3.5 h-3.5 text-indigo-500" />
          </Link>

          {/* Saved Favorites Icon */}
          <Link
            href="/saved"
            className="md:hidden relative w-8 h-8 rounded-xl bg-muted/60 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground border border-border/60 transition-colors"
            title="Saved Favorites"
            aria-label="Saved Favorites"
          >
            <Heart className={`w-3.5 h-3.5 ${totalSaved > 0 ? "text-red-500 fill-red-500" : ""}`} />
            {totalSaved > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[15px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-background">
                {totalSaved}
              </span>
            )}
          </Link>

          {/* Theme Switcher */}
          <ThemeToggle variant="button" />

          {/* Auth State in Mobile Top Bar */}
          <SignedIn>
            <NotificationBell />
            <div className="shrink-0 flex items-center">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-7 h-7 xs:w-8 xs:h-8 rounded-full ring-2 ring-indigo-500/30",
                  },
                }}
              />
            </div>
          </SignedIn>

          <SignedOut>
            <Link
              href="/sign-in"
              className="h-8 px-2 xs:px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center gap-1 text-[11px] xs:text-xs font-bold transition-colors"
              title="Sign In"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign In</span>
            </Link>
          </SignedOut>

          {/* Mobile & Tablet Hamburger Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-sm"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Full Navigation Drawer (XS, S, M screens) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-border bg-background/98 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xl max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <div className="p-3 xs:p-4 space-y-3">

            {/* Brand header strip */}
            <div className="flex items-center justify-between px-1 pb-1 border-b border-border/50">
              <div className="flex items-center gap-2">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser?.name || "User"}
                    className="w-7 h-7 rounded-lg object-cover shadow-sm border border-border"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <Crown className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div>
                  <div className="text-[11px] font-black text-foreground tracking-tight leading-none">
                    {currentUser?.name || "Guest Explorer"}
                  </div>
                  <div className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider leading-none mt-0.5">Active Role</div>
                </div>
              </div>
              <RoleSwitcher />
            </div>

            {/* Primary Navigation — 2-col icon cards */}
            <div>
              <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest px-0.5 mb-1.5">Navigation</p>
              <nav className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/search"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 hover:border-indigo-400/60 hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <MapPin className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 leading-tight">Explore Map</span>
                </Link>

                <Link
                  href="/categories"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 hover:border-purple-400/60 hover:bg-purple-100 dark:hover:bg-purple-950/70 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Building2 className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 leading-tight">Categories</span>
                </Link>

                <Link
                  href="/saved"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 hover:border-rose-400/60 hover:bg-rose-100 dark:hover:bg-rose-950/70 transition-all"
                >
                  <div className="relative w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Heart className="w-3.5 h-3.5 text-white" />
                    {totalSaved > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 border border-white text-white text-[7px] font-black flex items-center justify-center leading-none">
                        {totalSaved > 9 ? "9+" : totalSaved}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 leading-tight">Favorites</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="group flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 hover:border-amber-400/60 hover:bg-amber-100 dark:hover:bg-amber-950/70 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 leading-tight">Preferences</span>
                </Link>
              </nav>
            </div>

            {/* Role-Specific Portals */}
            {(isCityAdmin || isCountryAdmin || isSuperAdmin || isAdmin || isOwner) && (
              <div>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest px-0.5 mb-1.5">Management</p>
                <div className="space-y-1.5">
                  {isCityAdmin && (
                    <Link
                      href="/city-admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-900/60 hover:bg-sky-100 dark:hover:bg-sky-950/60 transition-all"
                    >
                      <span className="text-base leading-none">🏙️</span>
                      <span className="text-[11px] font-bold">City Admin Portal</span>
                    </Link>
                  )}
                  {isCountryAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/60 hover:bg-indigo-100 dark:hover:bg-indigo-950/60 transition-all"
                    >
                      <span className="text-base leading-none">🌍</span>
                      <span className="text-[11px] font-bold">Country Admin Portal</span>
                    </Link>
                  )}
                  {isSuperAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/60 hover:bg-purple-100 dark:hover:bg-purple-950/60 transition-all"
                    >
                      <Crown className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-bold">Super Admin Portal</span>
                    </Link>
                  )}
                  {isAdmin && !isSuperAdmin && !isCountryAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-950/60 transition-all"
                    >
                      <Shield className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-bold">Admin Control Panel</span>
                    </Link>
                  )}
                  {isOwner && (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 transition-all"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span className="text-[11px] font-bold">Owner Dashboard</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-2 pt-0.5">
              {canUpload && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsUploadModalOpen(true);
                  }}
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-accent hover:border-indigo-400/40 text-[11px] font-bold text-foreground transition-all shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-500" />
                  Bulk Upload
                </button>
              )}
              <Link
                href="/dashboard/listings/new"
                onClick={() => setIsMobileMenuOpen(false)}
                className={canUpload ? "flex-1" : "w-full"}
              >
                <button className="w-full h-9 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md hover:shadow-indigo-500/30 transition-all active:scale-95">
                  <PlusCircle className="w-3.5 h-3.5" />
                  List Business
                </button>
              </Link>
            </div>

            {/* Signed Out Auth Actions */}
            <SignedOut>
              <div className="flex items-center gap-2">
                <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                  <button className="w-full h-9 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-accent text-[11px] font-bold text-foreground transition-all shadow-sm">
                    <LogIn className="w-3.5 h-3.5 text-indigo-500" />
                    Sign In
                  </button>
                </Link>
                <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                  <button className="w-full h-9 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-[11px] font-bold shadow-md hover:shadow-indigo-500/30 transition-all active:scale-95">
                    <UserPlus className="w-3.5 h-3.5" />
                    Register
                  </button>
                </Link>
              </div>
            </SignedOut>

          </div>
        </div>
      )}

      {/* Upload Businesses Modal */}
      <UploadBusinessModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </header>
  );
}

