"use client";

import React, { useState } from "react";
import Link from "next/link";
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-[1600px] w-full mx-auto flex h-16 items-center justify-between px-2 sm:px-4 lg:px-6 gap-1.5">
        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 lg:gap-3 xl:gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg xl:text-xl font-black tracking-tight text-foreground flex items-center gap-1">
                Biz<span className="text-indigo-600 dark:text-indigo-400">Finder</span>
                <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500 animate-pulse" />
              </span>
              <span className="text-[9px] -mt-1 font-medium text-muted-foreground tracking-wider uppercase hidden sm:inline">
                Search & Directory
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-0.5 xl:gap-1">
            <Link
              href="/search"
              className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                pathname === "/search"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              Explore Map
            </Link>
            <Link
              href="/categories"
              className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                pathname.startsWith("/categories") || pathname.startsWith("/category")
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              All Categories
            </Link>
            <Link
              href="/saved"
              className={`relative p-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-center ${
                pathname === "/saved"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
              title="Saved Favorites"
            >
              <Heart className={`w-4 h-4 ${totalSaved > 0 ? "text-red-500 fill-red-500" : ""}`} />
              {totalSaved > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-sm pointer-events-none ring-2 ring-background animate-in zoom-in-50">
                  {totalSaved}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              className={`px-2.5 py-1.5 rounded-lg text-xs xl:text-sm font-medium transition-colors ${
                pathname === "/profile"
                  ? "bg-accent text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              Preferences
            </Link>

            {/* Quick Search Icon Button */}
            <Link
              href="/search"
              className="flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground bg-muted/60 hover:bg-muted border border-border/60 transition-colors ml-0.5"
              title="Search directory"
            >
              <Search className="w-3.5 h-3.5 text-indigo-500" />
            </Link>
          </nav>
        </div>

        {/* Action Controls & Auth / Role Switcher */}
        <div className="hidden md:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {/* Interactive Role Switcher */}
          <RoleSwitcher />

          {/* Dark / Light Theme Toggle */}
          <ThemeToggle variant="button" />

          {/* Notifications Center with Live Confirmation Alerts */}
          <NotificationBell />

          {/* Role-Specific Portal Links */}
          {isCityAdmin && (
            <Link href="/city-admin">
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs font-semibold gap-1 border-sky-500/40 text-sky-600 dark:text-sky-400 bg-sky-500/10 hover:bg-sky-500/20 shadow-sm">
                <span>🏙️</span>
                <span className="hidden xl:inline">City Admin</span>
              </Button>
            </Link>
          )}

          {isCountryAdmin && (
            <Link href="/admin">
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs font-semibold gap-1 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 shadow-sm">
                <span>🌍</span>
                <span className="hidden xl:inline">Country Admin</span>
              </Button>
            </Link>
          )}

          {isSuperAdmin && (
            <Link href="/admin">
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs font-semibold gap-1 border-purple-500/40 text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 shadow-sm">
                <Crown className="w-3.5 h-3.5 text-purple-500" />
                <span className="hidden xl:inline">Super Admin</span>
              </Button>
            </Link>
          )}

          {isAdmin && !isSuperAdmin && !isCountryAdmin && (
            <Link href="/admin">
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs font-semibold gap-1 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30">
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Admin Panel</span>
              </Button>
            </Link>
          )}

          {isOwner && (
            <Link href="/dashboard">
              <Button size="sm" variant="outline" className="h-8 px-2 text-xs font-semibold gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Owner Portal</span>
              </Button>
            </Link>
          )}

          {/* Quick Upload CTA (Batch / File) */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsUploadModalOpen(true)}
            className="h-8 px-2 text-xs font-semibold gap-1 border-border/80 text-foreground hover:bg-muted inline-flex items-center"
            title="Upload business listings via CSV, Excel or JSON"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden xl:inline">Upload</span>
          </Button>

          {/* Add / Claim Business CTA */}
          <Link href="/dashboard/listings/new">
            <Button size="sm" variant="gradient" className="h-8 px-2.5 text-xs font-bold gap-1 shadow-sm shadow-indigo-500/10">
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">List Business</span>
            </Button>
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
              <div className="flex items-center gap-1 shrink-0">
                <Link
                  href="/profile"
                  className="w-8 h-8 rounded-full bg-accent hover:bg-accent/80 border border-border flex items-center justify-center text-foreground transition-all hover:scale-105 shrink-0"
                  title="User Profile / Account"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                    {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "U"}
                  </div>
                </Link>
                <Link href="/sign-in">
                  <Button size="sm" variant="ghost" className="h-8 px-2 text-xs font-semibold gap-1">
                    <LogIn className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Sign In</span>
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="sm" variant="outline" className="h-8 px-2 text-xs font-semibold border-indigo-200 dark:border-indigo-800">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline">Register</span>
                  </Button>
                </Link>
              </div>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Controls: Theme, Role, Upload, Saved, User Icon, Bell & Menu Toggle */}
        <div className="flex md:hidden items-center gap-1.5 shrink-0">
          <ThemeToggle variant="button" />
          <RoleSwitcher />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setIsUploadModalOpen(true)}
            className="w-7 h-7 p-0 text-muted-foreground hover:text-foreground"
            title="Upload business listings"
          >
            <Upload className="w-4 h-4 text-indigo-500" />
          </Button>
          <Link
            href="/saved"
            className="relative w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground"
            title="Saved Favorites"
          >
            <Heart className={`w-4 h-4 ${totalSaved > 0 ? "text-red-500 fill-red-500" : ""}`} />
            {totalSaved > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[14px] h-3.5 px-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center ring-1 ring-background">
                {totalSaved}
              </span>
            )}
          </Link>
          <SignedIn>
            <NotificationBell />
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link
              href="/profile"
              className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm"
              title="User Account"
            >
              {currentUser?.name ? currentUser.name.slice(0, 2).toUpperCase() : "U"}
            </Link>
          </SignedOut>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent flex items-center justify-between"
            >
              <span>Explore Map & Search</span>
            </Link>
            <Link
              href="/categories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent flex items-center justify-between"
            >
              <span>All Categories</span>
            </Link>
            <Link
              href="/saved"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <Heart className={`w-4 h-4 ${totalSaved > 0 ? "text-red-500 fill-red-500" : ""}`} />
                <span>Favorites</span>
              </span>
              {totalSaved > 0 && (
                <Badge className="text-[10px] bg-red-500 text-white rounded-full">
                  {totalSaved}
                </Badge>
              )}
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-accent flex items-center justify-between"
            >
              <span>Account Preferences</span>
            </Link>
            {isCityAdmin && (
              <Link
                href="/city-admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 flex items-center gap-2"
              >
                <span>🏙️</span>
                City Admin Portal
              </Link>
            )}
            {isOwner && (
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Owner Dashboard
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-semibold text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 flex items-center gap-2"
              >
                <Shield className="w-4 h-4" />
                Admin Control Panel
              </Link>
            )}
          </nav>

          <SignedOut>
            <div className="pt-2 border-t border-border grid grid-cols-2 gap-2">
              <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-xs font-semibold gap-1.5">
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="gradient" className="w-full text-xs font-semibold gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </Button>
              </Link>
            </div>
          </SignedOut>

          <div className="pt-2 border-t border-border space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsUploadModalOpen(true);
              }}
              className="w-full text-xs font-semibold gap-2 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
            >
              <Upload className="w-4 h-4" />
              Upload Businesses (CSV / Excel)
            </Button>

            <Link href="/dashboard/listings/new" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full" variant="gradient">
                <PlusCircle className="w-4 h-4 mr-2" />
                List Your Business
              </Button>
            </Link>
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

