import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { MapPin, Sparkles, Star, Building2, Shield, TrendingUp, Users } from "lucide-react";
import { fetchAuthStats, formatCount } from "@/lib/auth-stats";

export const metadata = {
  title: "Sign In — BizFinder",
  description: "Sign in to your BizFinder account.",
};

export default async function SignInPage() {
  const stats = await fetchAuthStats();

  const displayStats = [
    {
      value: formatCount(stats.listingCount),
      label: "Listings",
    },
    {
      value: formatCount(stats.userCount),
      label: "Monthly Visitors",
    },
    {
      value: `${stats.avgRating}★`,
      label: "Rating",
    },
  ];

  const testimonial = stats.featuredReview;

  return (
    <div className="auth-page-root">
      {/* ── Animated background orbs ── */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />
      <div className="auth-bg-orb auth-bg-orb-4" />

      {/* ── Grid noise overlay ── */}
      <div className="auth-grid-overlay" />

      {/* ── Main two-column layout ── */}
      <div className="auth-layout">

        {/* ════ LEFT: Brand Showcase ════ */}
        <div className="auth-left auth-fade-up">

          {/* Logo */}
          <Link href="/" className="auth-logo-link">
            <div className="auth-logo-icon">
              <MapPin size={22} />
            </div>
            <span className="auth-logo-text">
              Biz<span className="auth-logo-accent">Finder</span>
            </span>
            <Sparkles size={14} className="auth-logo-sparkle" />
          </Link>

          {/* Hero Copy */}
          <div className="auth-hero auth-delay-1">
            <div className="auth-badge">
              <span className="auth-badge-dot" />
              Trusted by {formatCount(stats.userCount)} users
            </div>
            <h1 className="auth-headline">
              Welcome back to<br />
              <span className="auth-headline-gradient">BizFinder</span>
            </h1>
            <p className="auth-subline">
              Your gateway to verified local businesses, live operating hours,
              GPS-accurate maps, and authentic community reviews.
            </p>
          </div>

          {/* Stats Row — live from DB */}
          <div className="auth-stats auth-delay-2">
            {displayStats.map((s) => (
              <div key={s.label} className="auth-stat">
                <span className="auth-stat-value">{s.value}</span>
                <span className="auth-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Feature pills */}
          <div className="auth-features auth-delay-3">
            {[
              { icon: Shield, text: "Verified listings" },
              { icon: TrendingUp, text: "Live analytics" },
              { icon: Building2, text: "Business tools" },
              { icon: Users, text: "Community reviews" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="auth-feature-pill">
                <Icon size={13} className="auth-feature-icon" />
                {text}
              </div>
            ))}
          </div>

          {/* Testimonial — real review from DB if available */}
          <div className="auth-testimonial auth-delay-4">
            <div className="auth-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} className="auth-star" fill="currentColor" />
              ))}
            </div>
            <p className="auth-testimonial-text">
              &ldquo;{testimonial?.text}&rdquo;
            </p>
            <div className="auth-testimonial-author">
              <div className="auth-avatar">{testimonial?.authorInitials}</div>
              <span>{testimonial?.authorName}</span>
            </div>
          </div>
        </div>

        {/* ════ RIGHT: Auth Form ════ */}
        <div className="auth-right auth-slide-in auth-delay-1">
          <div className="auth-card auth-pulse-glow">
            {/* Card header */}
            <div className="auth-card-header">
              <div className="auth-card-icon">
                <MapPin size={20} />
              </div>
              <h2 className="auth-card-title">Welcome back</h2>
              <p className="auth-card-sub">
                New here?{" "}
                <Link href="/sign-up" className="auth-card-link">
                  Create a free account
                </Link>
              </p>
            </div>

            {/* Clerk form */}
            <div className="auth-clerk-wrap">
              <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                fallbackRedirectUrl="/auth/redirect"
                forceRedirectUrl="/auth/redirect"
                appearance={{
                  layout: {
                    socialButtonsPlacement: "top",
                    showOptionalFields: false,
                  },
                  elements: {
                    rootBox: "!w-full !max-w-full !flex !flex-col !items-center !justify-center !m-0 !p-0",
                    cardBox: "!w-full !max-w-full !m-0 !p-0 !bg-transparent !shadow-none !border-0 !flex !flex-col !items-stretch",
                    card: "!w-full !max-w-full !m-0 !p-0 !bg-transparent !shadow-none !border-0 !flex !flex-col !items-stretch",
                    main: "!w-full !max-w-full !m-0 !p-0 !flex !flex-col !items-stretch !gap-3",
                    socialButtonsRoot: "!w-full !max-w-full !flex !flex-col !items-stretch !m-0 !p-0",
                    socialButtons: "!w-full !max-w-full !flex !flex-col !items-stretch !m-0 !p-0",
                    socialButtonsBlockButton: "!w-full !max-w-full !h-11 !flex !items-center !justify-center !bg-white/8 hover:!bg-white/12 !border !border-white/15 !rounded-xl !text-slate-200 !font-semibold !text-sm !m-0 !transition-all",
                    socialButtonsBlockButtonText: "!text-slate-200 !font-semibold !text-sm",
                    dividerRow: "!w-full !max-w-full !flex !items-center !justify-center !my-3",
                    dividerLine: "!bg-white/10 !flex-1",
                    dividerText: "!text-slate-400 !text-xs !px-3",
                    form: "!w-full !max-w-full !flex !flex-col !gap-3 !m-0 !p-0",
                    formFieldRow: "!w-full !max-w-full !m-0 !p-0",
                    formField: "!w-full !max-w-full !flex !flex-col !gap-1 !m-0 !p-0",
                    formFieldLabel: "!text-slate-200 !text-xs !font-semibold !text-left",
                    formFieldInput: "!w-full !max-w-full !box-border !bg-white/8 !border !border-white/15 !text-slate-100 !rounded-xl !h-11 !text-sm placeholder:!text-slate-400 focus:!border-indigo-500/70 focus:!ring-2 focus:!ring-indigo-500/20 !px-3.5 !transition-all",
                    formFieldAction: "!text-indigo-400 hover:!text-indigo-300 !text-xs !font-medium",
                    formButtonRow: "!w-full !max-w-full !flex !items-center !justify-center !m-0 !p-0",
                    formButtonPrimary: "!w-full !max-w-full !box-border !flex !items-center !justify-center !h-11 !rounded-xl !font-bold !text-sm !text-white !bg-gradient-to-r !from-indigo-600 !to-purple-600 hover:!from-indigo-500 hover:!to-purple-500 !shadow-lg !shadow-indigo-500/30 !mt-2 !m-0 !transition-all",
                    header: "!hidden",
                    headerTitle: "!hidden",
                    headerSubtitle: "!hidden",
                    footer: "!hidden",
                    footerAction: "!hidden",
                  },
                }}
              />
            </div>

            {/* Trust line */}
            <div className="auth-trust">
              <Shield size={12} />
              <span>256-bit SSL encrypted · Your data is safe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
