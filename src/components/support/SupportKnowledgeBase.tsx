"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Building2,
  CreditCard,
  Shield,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TicketCategory } from "@/types/ticket";

export interface KnowledgeArticle {
  id: string;
  category: TicketCategory;
  categoryName: string;
  categoryIcon: string;
  title: string;
  summary: string;
  content: string[];
  tips?: string;
  slaInfo: string;
}

export const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  {
    id: "kb-1",
    category: "verification",
    categoryName: "Verification & Badges",
    categoryIcon: "✅",
    title: "How to apply for an Official Verified Business Badge",
    summary:
      "Submit your valid trade license, tax identification (TIN), and commercial registration certificate to receive the verified checkmark.",
    content: [
      "Navigate to your Business Management workspace tab and open the Verification section.",
      "Upload a high-resolution scan or PDF of your Municipal Trade License and Tax Identification (TIN) certificate issued by the Ministry of Trade & Regional Integration.",
      "Our compliance officers verify documents against regional trade registry databases within 1-2 business days.",
      "Upon approval, your listing immediately receives the Verified Gold Checkmark, prioritizing your business in search results and location discovery.",
    ],
    tips: "Ensure business names on trade documents match your registered listing title exactly to avoid verification delays.",
    slaInfo: "Standard Turnaround: 24-48 Hours",
  },
  {
    id: "kb-2",
    category: "billing",
    categoryName: "Payments & Settlements",
    categoryIcon: "💳",
    title: "Payment settlement cycles: Telebirr, CBE Birr, Chapa & Stripe",
    summary:
      "Understand when QR code payments and subscription fees are cleared to your primary merchant bank account.",
    content: [
      "Customer payments collected via Telebirr SuperApp and CBE Birr are reconciled every 24 hours.",
      "Direct merchant bank settlements are executed weekly every Tuesday morning at 09:00 EAT.",
      "For Pro Merchant Plan subscriptions, automatic electronic receipts with VAT/TOT breakdowns are available in the Billing & Plans tab.",
      "If a transaction reference status remains pending for over 3 hours, open a Billing ticket with the transaction reference ID for instant gateway trace.",
    ],
    tips: "Always keep your registered settlement CBE or Dashen Bank account number updated in Account Settings.",
    slaInfo: "Urgent Financial SLA: 2-4 Hours",
  },
  {
    id: "kb-3",
    category: "listing",
    categoryName: "Listings & Catalogs",
    categoryIcon: "🏢",
    title: "Accurately setting your GPS map coordinates & branch hours",
    summary:
      "Learn how to optimize customer walk-ins by configuring precise lat/long pins and holiday operating hours.",
    content: [
      "To update your location coordinates, go to 'Edit Listing' -> 'Location & Address' and drag the map pin to your building entrance.",
      "Operating hours can be customized per day of the week, including split shifts (e.g. morning breakfast & evening dinner).",
      "During national holidays (e.g. Meskel, Enkutatash, Genna), enable 'Special Holiday Hours' to inform customers in advance.",
      "Changes to coordinates and operating hours reflect immediately on public web directory and mobile web apps.",
    ],
    tips: "Precise coordinates dramatically increase directions requests and Uber/Feres/RIDE navigation accuracy.",
    slaInfo: "Technical SLA: 12 Hours",
  },
  {
    id: "kb-4",
    category: "dispute",
    categoryName: "Review Disputes",
    categoryIcon: "⚖️",
    title: "How to dispute defamatory, duplicate, or competitor reviews",
    summary:
      "Platform moderation policies regarding unfair reviews and merchant rights of reply.",
    content: [
      "BizFinder enforces strict anti-harassment and authenticity standards for all user-generated reviews.",
      "If a review contains vulgar language, personal defamation, or was posted by a competitor without genuine customer transaction, you can request administrative arbitration.",
      "Click 'Dispute Review' on the relevant review in your Customer Reviews hub, or open a Support Desk ticket under 'Dispute'.",
      "Our integrity team evaluates proof of visit or order receipts. False reviews are expunged within 24 hours.",
    ],
    tips: "Replying professionally to negative reviews before moderation arbitration shows other customers that you care deeply about guest experience.",
    slaInfo: "Moderation SLA: 24 Hours",
  },
  {
    id: "kb-5",
    category: "account",
    categoryName: "Security & Access",
    categoryIcon: "🔐",
    title: "Setting up Two-Factor Authentication (2FA) & Staff Privileges",
    summary:
      "Protect your merchant dashboard and restrict administrative privileges for cashiers and branch managers.",
    content: [
      "Enable SMS or Authenticator App 2FA in 'Account Settings' -> 'Security & 2FA'.",
      "Assign granular roles to team members: 'Branch Manager' (can reply to reviews and messages) vs 'Admin' (full billing and editing access).",
      "If a key staff member departs your company, revoke their active session token in the Security Workstation immediately.",
      "For emergency phone number transitions, submit an account ticket with proof of business ownership.",
    ],
    tips: "Never share primary owner credentials with temporary staff; use designated sub-accounts.",
    slaInfo: "Security SLA: 2 Hours",
  },
  {
    id: "kb-6",
    category: "technical",
    categoryName: "Technical & Platform",
    categoryIcon: "⚙️",
    title: "Troubleshooting photo uploads, cover banners, and video media",
    summary:
      "Recommended image aspect ratios, file size guidelines, and CDN delivery optimization.",
    content: [
      "Listing cover banners look best at 1200x675 pixels (16:9 aspect ratio).",
      "Supported file formats include JPG, PNG, and WebP, up to 10MB per image.",
      "Photos uploaded to BizFinder are automatically compressed and delivered through global Edge CDNs for lightning-fast loading across mobile networks.",
      "If an image fails to upload, check that your network connection allows multi-part form uploads or clear browser cache.",
    ],
    tips: "Brightly lit, authentic photos of your interior, menu, and products receive 3.8x more customer engagements.",
    slaInfo: "Technical SLA: 12 Hours",
  },
];

interface SupportKnowledgeBaseProps {
  onOpenTicketWithTopic?: (category: TicketCategory, defaultSubject: string) => void;
}

export function SupportKnowledgeBase({
  onOpenTicketWithTopic,
}: SupportKnowledgeBaseProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>("kb-1");

  const categories = useMemo(() => {
    return [
      { key: "all", label: "All Topics", icon: "📚" },
      { key: "verification", label: "Verification", icon: "✅" },
      { key: "billing", label: "Billing & Payouts", icon: "💳" },
      { key: "listing", label: "Branch Catalog", icon: "🏢" },
      { key: "dispute", label: "Review Disputes", icon: "⚖️" },
      { key: "account", label: "Security & Access", icon: "🔐" },
      { key: "technical", label: "Technical", icon: "⚙️" },
    ];
  }, []);

  const filteredArticles = useMemo(() => {
    return KNOWLEDGE_ARTICLES.filter((article) => {
      const matchesCategory =
        selectedCategory === "all" || article.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        article.content.some((c) => c.toLowerCase().includes(q)) ||
        article.categoryName.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white relative overflow-hidden shadow-sm border border-indigo-700/50">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            Self-Service Knowledge Base &amp; FAQ
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Find instant answers to merchant operations
          </h3>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Search verified guidelines on business trade verification, Telebirr payout settlement cycles, catalog geocoding, and review moderation.
          </p>

          <div className="relative pt-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 mt-1" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles (e.g., 'trade license', 'Telebirr', 'dispute review', '2FA')..."
              className="pl-10 h-10 bg-white/95 text-slate-900 dark:bg-slate-900/95 dark:text-white rounded-2xl border-white/20 text-xs shadow-inner placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === cat.key
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "bg-card border border-border/80 text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Articles List */}
      <div className="space-y-3">
        {filteredArticles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-3">
            <HelpCircle className="w-10 h-10 text-muted-foreground/40 mx-auto" />
            <h4 className="text-sm font-bold text-foreground">No articles match your search</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Couldn't find what you're looking for? Our dedicated platform support desk is standing by to help.
            </p>
            {onOpenTicketWithTopic && (
              <Button
                size="sm"
                variant="gradient"
                onClick={() =>
                  onOpenTicketWithTopic(
                    selectedCategory !== "all" ? (selectedCategory as TicketCategory) : "general",
                    searchQuery ? `Inquiry regarding: ${searchQuery}` : "Platform Inquiry"
                  )
                }
                className="gap-1.5 font-bold text-xs mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                Open Support Ticket
              </Button>
            )}
          </div>
        ) : (
          filteredArticles.map((article) => {
            const isExpanded = expandedArticleId === article.id;
            return (
              <div
                key={article.id}
                className={`rounded-3xl border transition-all overflow-hidden bg-card ${
                  isExpanded
                    ? "border-primary/40 shadow-sm"
                    : "border-border/80 hover:border-border"
                }`}
              >
                {/* Accordion Header */}
                <button
                  onClick={() =>
                    setExpandedArticleId(isExpanded ? null : article.id)
                  }
                  className="w-full p-4 sm:p-5 flex items-start justify-between gap-4 text-left transition-colors hover:bg-muted/20"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                        {article.categoryIcon} {article.categoryName}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {article.slaInfo}
                      </span>
                    </div>
                    <h4 className="font-bold text-foreground text-sm tracking-tight pt-1">
                      {article.title}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {article.summary}
                    </p>
                  </div>

                  <div className="p-1 rounded-lg bg-muted text-muted-foreground shrink-0 mt-1">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-border/60 bg-muted/[0.04] space-y-4 text-xs text-foreground">
                    <div className="space-y-2 pt-2">
                      <div className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                        Detailed Guidance:
                      </div>
                      <ol className="space-y-2 list-decimal list-inside text-muted-foreground leading-relaxed">
                        {article.content.map((step, idx) => (
                          <li key={idx} className="pl-1">
                            <span className="text-foreground">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {article.tips && (
                      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          Platform Pro-Tip:
                        </div>
                        <p className="leading-relaxed text-[11px]">{article.tips}</p>
                      </div>
                    )}

                    {/* Footer CTA */}
                    <div className="pt-2 flex items-center justify-between flex-wrap gap-2 border-t border-border/60">
                      <span className="text-[11px] text-muted-foreground">
                        Did this answer your question?
                      </span>
                      {onOpenTicketWithTopic && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onOpenTicketWithTopic(
                              article.category,
                              `Inquiry regarding: ${article.title}`
                            )
                          }
                          className="text-xs font-bold gap-1.5 border-primary/30 text-primary hover:bg-primary/10 h-7"
                        >
                          <Plus className="w-3 h-3" />
                          Open Ticket on this Topic
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
