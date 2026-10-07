import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { MapPin, Sparkles, Star, Building2, Shield, TrendingUp, Heart, Zap } from "lucide-react";
import { fetchAuthStats, formatCount } from "@/lib/auth-stats";

export const metadata = {
  title: "Create Account — BizFinder",
  description: "Join BizFinder free — discover local businesses, claim your listing, and unlock analytics.",
};

export default async function SignUpPage() {
  const stats = await fetchAuthStats();

  const displayStats = [
    { value: "100% Free", label: "To Register" },
    { value: formatCount(stats.listingCount), label: "Registered Listings" },
    { value: "0%", label: "Commission" },
  ];

  const testimonial = stats.ownerTestimonial;

  return (
    <div className="auth-page-root auth-signup">
      {/* ── Animated background orbs ── */}
      <div className="auth-bg-orb auth-bg-orb-1 auth-orb-purple" />
      <div className="auth-bg-orb auth-bg-orb-2 auth-orb-indigo" />
      <div className="auth-bg-orb auth-bg-orb-3 auth-orb-violet" />
      <div className="auth-bg-orb auth-bg-orb-4 auth-orb-rose" />

      {/* ── Grid noise overlay ── */}
      <div className="auth-grid-overlay" />

      {/* ── Main two-column layout ── */}
      <div className="auth-layout">

        {/* ════ LEFT: Brand Showcase ════ */}
        <div className="auth-left auth-fade-up">

          {/* Logo */}
          <Link href="/" className="auth-logo-link">
            <div className="auth-logo-icon auth-logo-icon-purple">
              <MapPin size={22} />
            </div>
            <span className="auth-logo-text">
              Biz<span className="auth-logo-accent-purple">Finder</span>
            </span>
            <Sparkles size={14} className="auth-logo-sparkle" />
          </Link>

          {/* Hero Copy */}
          <div className="auth-hero auth-delay-1">
            <div className="auth-badge auth-badge-purple">
              <span className="auth-badge-dot auth-badge-dot-purple" />
              100% Free to get started
            </div>
            <h1 className="auth-headline">
              Join the local<br />
              <span className="auth-headline-gradient-purple">business network</span>
            </h1>
            <p className="auth-subline">
              List and claim your business, bookmark favorites, write reviews,
              and access real-time visitor analytics — all in one place.
            </p>
          </div>

          {/* Perks grid */}
          <div className="auth-perks auth-delay-2">
            {[
              { icon: Building2, title: "List Your Business", desc: "Showcase menus, photos & contacts" },
              { icon: TrendingUp, title: "Owner Analytics", desc: "Views, searches & visitor graphs" },
              { icon: Heart, title: "Bookmark & Review", desc: "Save favorite spots across cities" },
              { icon: Zap, title: "Instant Verification", desc: "Go live in under 5 minutes" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="auth-perk">
                <div className="auth-perk-icon-wrap">
                  <Icon size={14} className="auth-perk-icon" />
                </div>
                <div>
                  <div className="auth-perk-title">{title}</div>
                  <div className="auth-perk-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Row — real listing count from DB */}
          <div className="auth-stats auth-delay-3">
            {displayStats.map((s) => (
              <div key={s.label} className="auth-stat">
                <span className="auth-stat-value auth-stat-value-purple">{s.value}</span>
                <span className="auth-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial — real owner review from DB if available */}
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
              <div className="auth-avatar auth-avatar-purple">{testimonial?.authorInitials}</div>
              <span>{testimonial?.authorName}</span>
            </div>
          </div>
        </div>

        {/* ════ RIGHT: Auth Form ════ */}
        <div className="auth-right auth-slide-in auth-delay-1">
          <div className="auth-card auth-card-purple auth-pulse-glow-purple">
            {/* Card header */}
            <div className="auth-card-header">
              <div className="auth-card-icon auth-card-icon-purple">
                <Building2 size={20} />
              </div>
              <h2 className="auth-card-title">Create your account</h2>
              <p className="auth-card-sub">
                Already a member?{" "}
                <Link href="/sign-in" className="auth-card-link auth-card-link-purple">
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Clerk form */}
            <div className="auth-clerk-wrap">
              <SignUp
                routing="path"
                path="/sign-up"
                signInUrl="/sign-in"
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
                    formFieldInput: "!w-full !max-w-full !box-border !bg-white/8 !border !border-white/15 !text-slate-100 !rounded-xl !h-11 !text-sm placeholder:!text-slate-400 focus:!border-purple-500/70 focus:!ring-2 focus:!ring-purple-500/20 !px-3.5 !transition-all",
                    formFieldAction: "!text-purple-400 hover:!text-purple-300 !text-xs !font-medium",
                    formButtonRow: "!w-full !max-w-full !flex !items-center !justify-center !m-0 !p-0",
                    formButtonPrimary: "!w-full !max-w-full !box-border !flex !items-center !justify-center !h-11 !rounded-xl !font-bold !text-sm !text-white !bg-gradient-to-r !from-purple-600 !to-indigo-600 hover:!from-purple-500 hover:!to-indigo-500 !shadow-lg !shadow-purple-500/30 !mt-2 !m-0 !transition-all",
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
              <span>No credit card required · Free forever plan available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
