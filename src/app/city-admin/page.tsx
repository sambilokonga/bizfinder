"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Building2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  MapPin,
  Users,
  Eye,
  Star,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Globe,
  FileCheck,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  Filter,
  Check,
  X,
  Megaphone,
  Bell,
  RefreshCw,
  Send,
  Flag,
  ArrowUpRight,
  FileText,
  BadgeCheck,
  SlidersHorizontal,
  Compass,
  Landmark,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Info,
  Calendar,
  MessageSquare,
  Crown,
  HelpCircle,
  Activity,
  Camera,
  CreditCard,
  Ticket,
  Lock,
  BarChart3,
  FolderTree,
  Banknote,
  UserCheck,
  Ban,
  Play,
  Printer,
  Receipt,
  CheckSquare,
  MessageCircle,
  Sliders,
  DollarSign,
  UserPlus,
  Menu,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";
import { Business } from "@/types/business";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { SUBCITIES_DATABASE } from "@/lib/data/subcities-database";
import { exportUsersToCSV, exportUsersToJSON } from "@/lib/utils/export-users";
import { exportBusinessesToCSV, exportBusinessesToJSON } from "@/lib/utils/export-businesses";
import { exportPaymentsToCSV, exportPaymentsToJSON } from "@/lib/utils/export-payments";
import { IPayment, GeoPaymentSummary } from "@/types/payment";
import { PaymentStatusGeoMatrix } from "@/components/admin/PaymentStatusGeoMatrix";
import { toast } from "sonner";
import { PendingConfirmationsQueue } from "@/components/admin/PendingConfirmationsQueue";
import { GlobalVisitorsMatrix } from "@/components/admin/GlobalVisitorsMatrix";
import { EmbeddedListingWizard } from "@/components/dashboard/EmbeddedListingWizard";
import { MediaLightboxModal, LightboxMediaItem } from "@/components/media/MediaLightboxModal";
import { AddCampaignModal, AdminAdCampaign } from "@/components/admin/AddCampaignModal";
import { RegisterPaymentModal } from "@/components/admin/RegisterPaymentModal";
import { PaymentReceiptModal } from "@/components/admin/PaymentReceiptModal";

// ─── Interfaces ─────────────────────────────────────────────────────────────

interface CityStats {
  totalBusinesses: number;
  pendingVerification: number;
  verifiedBusinesses: number;
  suspendedBusinesses: number;
  claimedBusinesses: number;
  openReports: number;
  pendingClaims: number;
  averageRating: number;
  subcityCount: number;
  monthlyGrowthPercent: string;
}

interface SubcityStat {
  name: string;
  count: number;
  type?: string;
  commercialFocus?: string;
  densityIndex?: string;
}

interface CategoryStat {
  name: string;
  count: number;
}

interface ClaimItem {
  id: string;
  businessId: string;
  businessName: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  businessRole: string;
  proofDocumentUrl?: string;
  notes?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface ReviewModerationItem {
  id: string;
  businessName: string;
  userName: string;
  rating: number;
  comment: string;
  status: "published" | "pending" | "reported" | "removed";
  date: string;
}

interface CityReportItem {
  id: string;
  title: string;
  reason: string;
  targetName: string;
  reporterName: string;
  status: "open" | "investigating" | "resolved";
  priority: "high" | "medium" | "low";
  createdAt: string;
}

interface CityNotice {
  id: string;
  title: string;
  message: string;
  sentAt: string;
  target: string;
  priority: string;
}

interface MunicipalSupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  userName: string;
  userEmail: string;
  businessName: string;
  category: "Listing Verification" | "Storefront Pin" | "Trade License" | "Billing Dispute" | "General";
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
  description: string;
  messages: Array<{
    id: string;
    sender: string;
    senderRole: "merchant" | "admin";
    text: string;
    timestamp: string;
  }>;
}

interface MunicipalAuditLog {
  id: string;
  timestamp: string;
  action: string;
  targetName: string;
  targetType: "Business" | "Claim" | "Review" | "Bulletin" | "District" | "Media";
  adminName: string;
  ipAddress: string;
  status: "success" | "warning" | "alert";
}

// ─── Initial Seed / Mock Datasets for City Jurisdiction ─────────────────────

const INITIAL_CITY_CLAIMS: ClaimItem[] = [
  {
    id: "clm-addis-01",
    businessId: "biz-1",
    businessName: "Kategna Ethiopian Restaurant",
    userName: "Samuel Kebede",
    userEmail: "samuel@kategna.et",
    userPhone: "+251 91 123 4567",
    businessRole: "Founder & General Manager",
    proofDocumentUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
    notes: "Official Addis Ababa City Trade License #ET-AA-2024-8842 attached.",
    status: "pending",
    createdAt: "2026-03-20T10:30:00Z",
  },
  {
    id: "clm-addis-02",
    businessId: "biz-2",
    businessName: "Tomoca Coffee (Bole)",
    userName: "Lidia Hailu",
    userEmail: "lidia@tomocacoffee.et",
    userPhone: "+251 91 234 5678",
    businessRole: "Operations Director",
    proofDocumentUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80",
    notes: "Commercial Registration certificate & lease agreement for Bole branch.",
    status: "pending",
    createdAt: "2026-03-22T14:15:00Z",
  },
  {
    id: "clm-addis-03",
    businessId: "biz-3",
    businessName: "Bole International Medical Center",
    userName: "Dr. Dawit Bekele",
    userEmail: "dawit@bolemed.et",
    userPhone: "+251 91 345 6789",
    businessRole: "Managing Director",
    notes: "Ministry of Health municipal operating certificate verified.",
    status: "approved",
    createdAt: "2026-03-18T09:00:00Z",
  },
];

const INITIAL_CITY_REPORTS: CityReportItem[] = [
  {
    id: "rep-aa-101",
    title: "Inaccurate Storefront Location Pin",
    reason: "Map coordinates point 500m away from the actual physical entrance on Africa Avenue.",
    targetName: "Bole Tech Hub",
    reporterName: "Yonas Girma",
    status: "open",
    priority: "medium",
    createdAt: "2026-03-23T11:20:00Z",
  },
  {
    id: "rep-aa-102",
    title: "Suspicious Unlicensed Pharmacy Listing",
    reason: "Store claims to sell prescription pharmaceuticals without displaying municipal health permit.",
    targetName: "Kirkos Express Meds",
    reporterName: "Dr. Almaz Tadesse",
    status: "investigating",
    priority: "high",
    createdAt: "2026-03-22T16:45:00Z",
  },
  {
    id: "rep-aa-103",
    title: "Permanent Closure Not Updated",
    reason: "This branch relocated to Piazza 2 months ago; location is currently vacant.",
    targetName: "Old Town Craft Gallery",
    reporterName: "Meron Assefa",
    status: "resolved",
    priority: "low",
    createdAt: "2026-03-19T08:15:00Z",
  },
];

const INITIAL_CITY_REVIEWS: ReviewModerationItem[] = [
  {
    id: "rev-aa-01",
    businessName: "Kategna Ethiopian Restaurant",
    userName: "Bereket T.",
    rating: 5,
    comment: "Outstanding authentic culinary experience in Bole! Staff was very courteous and clean.",
    status: "published",
    date: "Yesterday",
  },
  {
    id: "rev-aa-02",
    businessName: "Lucy Lounge & Restaurant",
    userName: "Visitor from UK",
    rating: 5,
    comment: "Historic garden ambiance next to the National Museum. Must visit in Arada!",
    status: "published",
    date: "2 days ago",
  },
  {
    id: "rev-aa-03",
    businessName: "Addis Ababa Auto Spa",
    userName: "Competitor Account",
    rating: 1,
    comment: "Terrible service, completely fake shop, do not visit here ever!",
    status: "reported",
    date: "3 days ago",
  },
  {
    id: "rev-aa-04",
    businessName: "Tomoca Coffee (Bole)",
    userName: "Hanna Girma",
    rating: 5,
    comment: "The finest macchiato in Africa Avenue. Warm atmosphere and very fast WiFi for working.",
    status: "published",
    date: "4 days ago",
  },
];

const INITIAL_CITY_NOTICES: CityNotice[] = [
  {
    id: "not-01",
    title: "Annual Municipal Commercial License Renewal Deadline",
    message: "All registered business owners in Addis Ababa must verify trade licenses before April 30.",
    sentAt: "2026-03-20",
    target: "All Business Owners",
    priority: "High",
  },
  {
    id: "not-02",
    title: "Bole Africa Avenue Clean Energy Street Lighting Project",
    message: "Scheduled evening infrastructure enhancements along Bole Road from 9 PM to 4 AM.",
    sentAt: "2026-03-15",
    target: "Commercial Corridor Merchants",
    priority: "Medium",
  },
];

const INITIAL_CITY_MEDIA: LightboxMediaItem[] = [
  {
    id: "med-01",
    title: "Storefront Main Entrance & Signage",
    url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
    type: "Photo",
    businessName: "Kategna Ethiopian Restaurant",
    uploadedBy: "Samuel Kebede (Owner)",
    uploadedAt: "2026-03-24",
    status: "Approved",
    description: "Exterior entrance signage along Bole Africa Avenue.",
  },
  {
    id: "med-02",
    title: "Bole Branch Roastery Interior",
    url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80",
    type: "Photo",
    businessName: "Tomoca Coffee (Bole)",
    uploadedBy: "Lidia Hailu (Operations)",
    uploadedAt: "2026-03-22",
    status: "Approved",
    description: "Artisan coffee bar seating and customer counter area.",
  },
  {
    id: "med-03",
    title: "Diagnostic Imaging Center Wing",
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
    type: "Photo",
    businessName: "Bole International Medical Center",
    uploadedBy: "Dr. Dawit Bekele",
    uploadedAt: "2026-03-20",
    status: "Approved",
    description: "State-of-the-art diagnostic MRI and laboratory department.",
  },
  {
    id: "med-04",
    title: "Brand Official Vector Logo",
    url: "https://images.unsplash.com/photo-1516876437184-593fda40c7ce?auto=format&fit=crop&w=800&q=80",
    type: "Logo",
    businessName: "Addis Ababa Auto Spa",
    uploadedBy: "Store Manager",
    uploadedAt: "2026-03-23",
    status: "Pending",
    description: "High-resolution corporate emblem for directory listing.",
  },
  {
    id: "med-05",
    title: "Traditional Coffee Roasting & Pouring Ceremony",
    url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80",
    type: "Video",
    businessName: "Lucy Lounge & Restaurant",
    uploadedBy: "Marketing Director",
    uploadedAt: "2026-03-21",
    status: "Approved",
    description: "Cultural presentation of traditional Ethiopian ceremony in the National Museum garden.",
  },
];

const INITIAL_CITY_CAMPAIGNS: AdminAdCampaign[] = [
  {
    id: "ad-01",
    name: "Bole Coffee Aficionados Week",
    businessName: "Tomoca Coffee (Bole)",
    placement: "search_top",
    targetLocation: "Addis Ababa - Bole",
    dailyBudgetETB: 850,
    totalSpentETB: 5950,
    impressions: 14200,
    clicks: 864,
    status: "active",
    startDate: "2026-03-15",
  },
  {
    id: "ad-02",
    name: "Gourmet Cultural Dining Spotlight",
    businessName: "Kategna Ethiopian Restaurant",
    placement: "home_hero",
    targetLocation: "Addis Ababa - All Subcities",
    dailyBudgetETB: 1200,
    totalSpentETB: 10800,
    impressions: 28400,
    clicks: 1450,
    status: "active",
    startDate: "2026-03-10",
  },
  {
    id: "ad-03",
    name: "Comprehensive Health Checkups Promotion",
    businessName: "Bole International Medical Center",
    placement: "category_spotlight",
    targetLocation: "Addis Ababa - Kirkos & Bole",
    dailyBudgetETB: 650,
    totalSpentETB: 3900,
    impressions: 9800,
    clicks: 420,
    status: "paused",
    startDate: "2026-03-01",
  },
  {
    id: "ad-04",
    name: "Spring Auto Detailing Special",
    businessName: "Addis Ababa Auto Spa",
    placement: "map_highlight",
    targetLocation: "Addis Ababa - Yeka",
    dailyBudgetETB: 450,
    totalSpentETB: 2700,
    impressions: 6500,
    clicks: 290,
    status: "completed",
    startDate: "2026-02-15",
  },
];

const INITIAL_CITY_SUPPORT_TICKETS: MunicipalSupportTicket[] = [
  {
    id: "tkt-aa-01",
    ticketNumber: "TKT-MUNI-8841",
    subject: "Storefront Location Pin Shift Request on Africa Ave",
    userName: "Samuel Kebede",
    userEmail: "samuel@kategna.et",
    businessName: "Kategna Ethiopian Restaurant",
    category: "Storefront Pin",
    priority: "medium",
    status: "open",
    createdAt: "2026-03-23T14:30:00Z",
    description: "Our entrance is 150m south of where the map pin is currently placed. Need admin to adjust GPS coordinates.",
    messages: [
      {
        id: "msg-1",
        sender: "Samuel Kebede",
        senderRole: "merchant",
        text: "Hello Municipal Admin, our customers have reported the pin takes them to the back alley instead of Africa Avenue front entrance. Attached photo.",
        timestamp: "2026-03-23 14:30",
      },
    ],
  },
  {
    id: "tkt-aa-02",
    ticketNumber: "TKT-MUNI-8842",
    subject: "Annual Trade License Re-verification Submission",
    userName: "Lidia Hailu",
    userEmail: "lidia@tomocacoffee.et",
    businessName: "Tomoca Coffee (Bole)",
    category: "Trade License",
    priority: "high",
    status: "in_progress",
    createdAt: "2026-03-22T09:15:00Z",
    description: "Uploaded our 2026 renewed commercial license from the Addis Ababa Bureau of Trade. Please grant renewed Trust Seal.",
    messages: [
      {
        id: "msg-2",
        sender: "Lidia Hailu",
        senderRole: "merchant",
        text: "We have uploaded the verified renewal stamp. Kindly expedite review as our premium campaign is pending seal.",
        timestamp: "2026-03-22 09:15",
      },
      {
        id: "msg-3",
        sender: "City Admin Bureau",
        senderRole: "admin",
        text: "Under review by Municipal Inspector. Verification will complete within 24 hours.",
        timestamp: "2026-03-22 11:00",
      },
    ],
  },
  {
    id: "tkt-aa-03",
    ticketNumber: "TKT-MUNI-8843",
    subject: "Sub-City Designation Correction for Bole Bulbula Branch",
    userName: "Dr. Dawit Bekele",
    userEmail: "dawit@bolemed.et",
    businessName: "Bole International Medical Center",
    category: "Listing Verification",
    priority: "low",
    status: "resolved",
    createdAt: "2026-03-18T16:00:00Z",
    description: "Branch was mistakenly listed under Kirkos sub-city. It belongs to Bole Woreda 12.",
    messages: [
      {
        id: "msg-4",
        sender: "Dr. Dawit Bekele",
        senderRole: "merchant",
        text: "Please update municipal boundary tag to Bole.",
        timestamp: "2026-03-18 16:00",
      },
      {
        id: "msg-5",
        sender: "City Admin Bureau",
        senderRole: "admin",
        text: "Boundary verified and sub-city updated to Bole. Ticket resolved.",
        timestamp: "2026-03-19 10:20",
      },
    ],
  },
];

const INITIAL_CITY_AUDIT_LOGS: MunicipalAuditLog[] = [
  {
    id: "aud-01",
    timestamp: "2026-03-24 10:14:22",
    action: "Listing Approved & Verified",
    targetName: "Kategna Ethiopian Restaurant",
    targetType: "Business",
    adminName: "Elena Vance (City Admin)",
    ipAddress: "197.156.104.18",
    status: "success",
  },
  {
    id: "aud-02",
    timestamp: "2026-03-23 16:40:05",
    action: "Ownership Claim Certified",
    targetName: "Tomoca Coffee (Bole)",
    targetType: "Claim",
    adminName: "Elena Vance (City Admin)",
    ipAddress: "197.156.104.18",
    status: "success",
  },
  {
    id: "aud-03",
    timestamp: "2026-03-23 11:22:19",
    action: "Citizen Dispute Resolved",
    targetName: "Bole Tech Hub (#rep-aa-101)",
    targetType: "Business",
    adminName: "Elena Vance (City Admin)",
    ipAddress: "197.156.104.18",
    status: "success",
  },
  {
    id: "aud-04",
    timestamp: "2026-03-22 14:05:30",
    action: "Broadcasted City Notice",
    targetName: "Annual Commercial License Renewal",
    targetType: "Bulletin",
    adminName: "Elena Vance (City Admin)",
    ipAddress: "197.156.104.18",
    status: "success",
  },
  {
    id: "aud-05",
    timestamp: "2026-03-21 08:30:11",
    action: "Commercial Zone Registered",
    targetName: "Bole Medhanialem Corridor",
    targetType: "District",
    adminName: "Elena Vance (City Admin)",
    ipAddress: "197.156.104.18",
    status: "success",
  },
  {
    id: "aud-06",
    timestamp: "2026-03-20 17:12:45",
    action: "Flagged Policy Violation Review",
    targetName: "Competitor Account (#rev-aa-03)",
    targetType: "Review",
    adminName: "Elena Vance (City Admin)",
    ipAddress: "197.156.104.18",
    status: "warning",
  },
];

export default function CityAdminDashboard() {
  const { currentRole, currentUser } = useCurrentRole();

  // ── Municipal Jurisdiction State ──────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState<string>(
    currentUser?.assignedCountry || "Ethiopia"
  );
  const [selectedCity, setSelectedCity] = useState<string>(
    currentUser?.assignedCity || "Addis Ababa"
  );
  const [selectedSubcityFilter, setSelectedSubcityFilter] = useState<string>("all");

  useEffect(() => {
    if (currentUser?.assignedCountry) {
      setSelectedCountry(currentUser.assignedCountry);
    }
    if (currentUser?.assignedCity) {
      setSelectedCity(currentUser.assignedCity);
    }
  }, [currentUser?.assignedCountry, currentUser?.assignedCity]);

  // ── Navigation State: Modern Expandable 16 Modules ────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>("dashboard");
  const [activeSubnav, setActiveSubnav] = useState<string>("overview");
  const [expandedNavSections, setExpandedNavSections] = useState<string[]>([
    "dashboard",
    "businesses",
  ]);

  const toggleNavSection = (section: string) => {
    setExpandedNavSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // ── City Payments State ────────────────────────────────────────────────────
  const [cityPayments, setCityPayments] = useState<IPayment[]>([]);
  const [cityPayGeoBreakdown, setCityPayGeoBreakdown] = useState<GeoPaymentSummary[]>([]);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState<boolean>(false);
  const [payStatusFilter, setPayStatusFilter] = useState<string>("all");
  const [payCityFilter, setPayCityFilter] = useState<string>("all");
  const [paySearch, setPaySearch] = useState<string>("");
  const [payPage, setPayPage] = useState<number>(1);
  const [payTotal, setPayTotal] = useState<number>(0);
  const [isRegisterPaymentModalOpen, setIsRegisterPaymentModalOpen] = useState(false);
  const [inspectReceiptPayment, setInspectReceiptPayment] = useState<IPayment | null>(null);

  // ── Municipal Users Roster State ──────────────────────────────────────────
  const [cityUsers, setCityUsers] = useState<any[]>([]);
  const [cityUsersTotal, setCityUsersTotal] = useState<number>(0);
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "customers" | "owners" | "admins">("all");
  const [userFilterCountry, setUserFilterCountry] = useState<string>("Ethiopia");
  const [userFilterCity, setUserFilterCity] = useState<string>("Addis Ababa");
  const [isExportingUsers, setIsExportingUsers] = useState<boolean>(false);

  // ── Data State ────────────────────────────────────────────────────────────
  const [stats, setStats] = useState<CityStats>({
    totalBusinesses: 32,
    pendingVerification: 4,
    verifiedBusinesses: 28,
    suspendedBusinesses: 0,
    claimedBusinesses: 22,
    openReports: 2,
    pendingClaims: 3,
    averageRating: 4.8,
    subcityCount: 10,
    monthlyGrowthPercent: "+14.8%",
  });

  const [subcities, setSubcities] = useState<SubcityStat[]>([]);
  const [topCategories, setTopCategories] = useState<CategoryStat[]>([]);
  const [growthChart, setGrowthChart] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoadingBiz, setIsLoadingBiz] = useState(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [isExportingBiz, setIsExportingBiz] = useState(false);

  // Claims & Reports & Reviews & Notices State
  const [claimsList, setClaimsList] = useState<ClaimItem[]>(INITIAL_CITY_CLAIMS);
  const [reportsList, setReportsList] = useState<CityReportItem[]>(INITIAL_CITY_REPORTS);
  const [reviewsList, setReviewsList] = useState<ReviewModerationItem[]>(INITIAL_CITY_REVIEWS);
  const [noticesList, setNoticesList] = useState<CityNotice[]>(INITIAL_CITY_NOTICES);

  // Media Library State
  const [mediaList, setMediaList] = useState<LightboxMediaItem[]>(INITIAL_CITY_MEDIA);
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMediaItem | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>("all");
  const [mediaSearch, setMediaSearch] = useState<string>("");
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [newMediaTitle, setNewMediaTitle] = useState("");
  const [newMediaUrl, setNewMediaUrl] = useState("");
  const [newMediaType, setNewMediaType] = useState<"Photo" | "Video" | "Logo">("Photo");
  const [newMediaBiz, setNewMediaBiz] = useState("");

  // Advertisements State
  const [campaignsList, setCampaignsList] = useState<AdminAdCampaign[]>(INITIAL_CITY_CAMPAIGNS);
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false);
  const [campaignSearch, setCampaignSearch] = useState("");

  // Support Desk State
  const [supportTickets, setSupportTickets] = useState<MunicipalSupportTicket[]>(INITIAL_CITY_SUPPORT_TICKETS);
  const [inspectTicket, setInspectTicket] = useState<MunicipalSupportTicket | null>(null);
  const [supportSearch, setSupportSearch] = useState("");
  const [supportStatusFilter, setSupportStatusFilter] = useState("all");
  const [ticketReplyText, setTicketReplyText] = useState("");

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<MunicipalAuditLog[]>(INITIAL_CITY_AUDIT_LOGS);

  // Modals & Drawers
  const [inspectBusiness, setInspectBusiness] = useState<Business | null>(null);
  const [rejectionModalBiz, setRejectionModalBiz] = useState<Business | null>(null);
  const [rejectionReason, setRejectionReason] = useState("Inaccurate Physical Address / Storefront Details");
  const [rejectionNotes, setRejectionNotes] = useState("");

  const [isAddDistrictModalOpen, setIsAddDistrictModalOpen] = useState(false);
  const [newDistrictName, setNewDistrictName] = useState("");
  const [newDistrictFocus, setNewDistrictFocus] = useState("");
  const [newDistrictType, setNewDistrictType] = useState("subcity");

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState<"business" | "user" | "global">("business");
  const [broadcastPriority, setBroadcastPriority] = useState<"high" | "medium" | "low">("medium");

  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateSubject, setEscalateSubject] = useState("");
  const [escalateReason, setEscalateReason] = useState("");

  // Inspect Claim Modal
  const [inspectClaim, setInspectClaim] = useState<ClaimItem | null>(null);

  // Available countries & cities
  const countryEntry = COUNTRIES_WITH_CITIES.find(
    (c) => c.name.toLowerCase() === selectedCountry.toLowerCase()
  );
  const availableCities = countryEntry?.cities || ["Addis Ababa", "Dire Dawa", "Hawassa", "Bahir Dar", "Mekelle"];

  // ── Fetch City Stats ──────────────────────────────────────────────────────
  const fetchCityStats = async () => {
    try {
      const res = await fetch(`/api/city-admin/stats?country=${encodeURIComponent(selectedCountry)}&city=${encodeURIComponent(selectedCity)}`);
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
        if (data.subcityStats) setSubcities(data.subcityStats);
        if (data.topCategories) setTopCategories(data.topCategories);
        if (data.growthChart) setGrowthChart(data.growthChart);
      }
    } catch (e) {
      console.warn("Using local fallback stats for City Admin:", e);
    }
  };

  // ── Fetch City Businesses ─────────────────────────────────────────────────
  const fetchBusinesses = async () => {
    setIsLoadingBiz(true);
    try {
      const res = await fetch(`/api/businesses?country=${encodeURIComponent(selectedCountry)}&city=${encodeURIComponent(selectedCity)}&limit=100`);
      const data = await res.json();
      if (data.businesses && data.businesses.length > 0) {
        setBusinesses(data.businesses);
      } else {
        const filtered = SEED_BUSINESSES.filter(
          (b) =>
            b.cityName?.toLowerCase() === selectedCity.toLowerCase() ||
            (b.countryName?.toLowerCase() === selectedCountry.toLowerCase() && selectedCity.toLowerCase().includes("addis"))
        );
        setBusinesses(filtered.length > 0 ? filtered : SEED_BUSINESSES.slice(0, 15));
      }
    } catch (e) {
      console.warn("Failed to fetch city businesses, falling back to seed:", e);
      setBusinesses(SEED_BUSINESSES.slice(0, 15));
    } finally {
      setIsLoadingBiz(false);
    }
  };

  const handleExportCityBusinesses = async (format: "csv" | "json") => {
    setIsExportingBiz(true);
    try {
      const res = await fetch(
        `/api/businesses?country=${encodeURIComponent(selectedCountry)}&city=${encodeURIComponent(selectedCity)}&limit=5000&export=true`
      );
      const data = await res.json();
      const exportList = data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0
        ? data.businesses
        : filteredBusinesses;

      const fileLabel = `${selectedCity.toLowerCase().replace(/\s+/g, "_")}_${selectedCountry.toLowerCase().replace(/\s+/g, "_")}_businesses`;
      if (format === "csv") {
        exportBusinessesToCSV(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} businesses for ${selectedCity} in CSV!`);
      } else {
        exportBusinessesToJSON(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} businesses for ${selectedCity} in JSON!`);
      }
    } catch (err) {
      console.error("City admin export error:", err);
      const fileLabel = `${selectedCity.toLowerCase().replace(/\s+/g, "_")}_businesses`;
      if (format === "csv") exportBusinessesToCSV(filteredBusinesses, fileLabel);
      else exportBusinessesToJSON(filteredBusinesses, fileLabel);
      toast.success(`Downloaded ${filteredBusinesses.length} businesses!`);
    } finally {
      setIsExportingBiz(false);
    }
  };

  // ── Fetch Municipal Users ─────────────────────────────────────────────────
  const fetchCityUsers = async () => {
    setIsUsersLoading(true);
    try {
      const countryParam = userFilterCountry && userFilterCountry !== "all"
        ? `&country=${encodeURIComponent(userFilterCountry)}`
        : "";
      const cityParam = userFilterCity && userFilterCity !== "all"
        ? `&city=${encodeURIComponent(userFilterCity)}`
        : "";
      const roleParam = userRoleFilter !== "all" ? `&role=${userRoleFilter}` : "";
      const qParam = userSearch.trim() ? `&search=${encodeURIComponent(userSearch.trim())}` : "";
      const res = await fetch(`/api/admin/users?limit=50${countryParam}${cityParam}${roleParam}${qParam}`);
      const data = await res.json();
      if (data?.users && Array.isArray(data.users)) {
        setCityUsers(data.users);
        setCityUsersTotal(data.total ?? data.users.length);
      }
    } catch (err) {
      console.error("Failed to fetch city users:", err);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleExportCityUsers = async (format: "csv" | "json") => {
    setIsExportingUsers(true);
    try {
      const countryParam = userFilterCountry && userFilterCountry !== "all"
        ? `&country=${encodeURIComponent(userFilterCountry)}`
        : "";
      const cityParam = userFilterCity && userFilterCity !== "all"
        ? `&city=${encodeURIComponent(userFilterCity)}`
        : "";
      const roleParam = userRoleFilter !== "all" ? `&role=${userRoleFilter}` : "";
      const qParam = userSearch.trim() ? `&search=${encodeURIComponent(userSearch.trim())}` : "";
      const res = await fetch(`/api/admin/users?export=true${countryParam}${cityParam}${roleParam}${qParam}`);
      const data = await res.json();
      const exportList = data?.users && Array.isArray(data.users) && data.users.length > 0
        ? data.users
        : cityUsers;
      const fileLabel = `city_users_${(userFilterCity || "city").toLowerCase().replace(/\s+/g, "_")}_${(userFilterCountry || "country").toLowerCase().replace(/\s+/g, "_")}`;
      if (format === "csv") {
        exportUsersToCSV(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} municipal users in CSV format!`);
      } else {
        exportUsersToJSON(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} municipal users in JSON format!`);
      }
    } catch (err) {
      console.error("Export city users error:", err);
      const fileLabel = `city_users_${(userFilterCity || "city").toLowerCase().replace(/\s+/g, "_")}`;
      if (format === "csv") exportUsersToCSV(cityUsers, fileLabel);
      else exportUsersToJSON(cityUsers, fileLabel);
      toast.success(`Downloaded ${cityUsers.length} users!`);
    } finally {
      setIsExportingUsers(false);
    }
  };

  // ── City Payments Fetch ────────────────────────────────────────────────────
  const fetchCityPayments = useCallback(async () => {
    setIsPaymentsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "200");
      params.set("sort", "desc");
      if (selectedCity && selectedCity !== "all") params.set("city", selectedCity);
      if (selectedCountry && selectedCountry !== "all") params.set("country", selectedCountry);
      if (payStatusFilter && payStatusFilter !== "all") params.set("status", payStatusFilter);
      if (paySearch.trim()) params.set("search", paySearch.trim());
      const res = await fetch(`/api/payments?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.payments)) {
        setCityPayments(data.payments);
        setPayTotal(data.pagination?.total ?? data.payments.length);
        if (data.geoBreakdown) setCityPayGeoBreakdown(data.geoBreakdown);
      }
    } catch (err) {
      console.warn("[CityAdmin] Failed to load city payments:", err);
    } finally {
      setIsPaymentsLoading(false);
    }
  }, [selectedCity, selectedCountry, payStatusFilter, paySearch]);

  useEffect(() => {
    fetchCityStats();
    fetchBusinesses();
  }, [selectedCountry, selectedCity]);

  useEffect(() => {
    if (activeNav === "users") {
      const handler = setTimeout(() => {
        fetchCityUsers();
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [activeNav, userFilterCountry, userFilterCity, userRoleFilter, userSearch]);

  useEffect(() => {
    if (activeNav === "payments") {
      const handler = setTimeout(() => fetchCityPayments(), 200);
      return () => clearTimeout(handler);
    }
  }, [activeNav, fetchCityPayments]);

  // ── Sub-Cities & Districts list ───────────────────────────────────────────
  const activeSubcitiesList = useMemo(() => {
    if (subcities.length > 0) return subcities;
    const fromDb = SUBCITIES_DATABASE[selectedCountry]?.[selectedCity] || [
      "Bole", "Kirkos", "Arada", "Yeka", "Lideta", "Nifas Silk", "Gullele", "Akaky Kaliti", "Kolfe Keranio", "Addis Ketema"
    ];
    return fromDb.map((name, i) => ({
      name,
      count: [14, 11, 9, 8, 6, 5, 4, 3, 3, 2][i % 10] || 3,
      commercialFocus: "Commercial Corridor & Urban Center",
      densityIndex: "High",
    }));
  }, [subcities, selectedCountry, selectedCity]);

  // ── Filtered Businesses in this City ──────────────────────────────────────
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const bAny = b as any;
      // Sub-city filter
      if (selectedSubcityFilter !== "all") {
        const dist = (b.districtName || bAny.subcityId || "").toLowerCase();
        if (!dist.includes(selectedSubcityFilter.toLowerCase())) return false;
      }
      // Status subtab filter
      if (activeNav === "businesses") {
        if (activeSubnav === "pending" && b.isVerified) return false;
        if (activeSubnav === "verified" && !b.isVerified) return false;
        if (activeSubnav === "rejected" && bAny.adminStatus !== "rejected") return false;
        if (activeSubnav === "suspended" && bAny.adminStatus !== "suspended") return false;
        if (activeSubnav === "claimed" && !bAny.isClaimed && !bAny.claimedByUserId) return false;
      }

      // Text search
      if (businessSearch.trim()) {
        const q = businessSearch.toLowerCase();
        const matchesName = b.name?.toLowerCase().includes(q);
        const matchesCat = b.categoryName?.toLowerCase().includes(q);
        const matchesSubcity = (b.districtName || bAny.subcityId || "")?.toLowerCase().includes(q);
        const matchesAddress = b.addressLine?.toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesSubcity && !matchesAddress) return false;
      }

      return true;
    });
  }, [businesses, selectedSubcityFilter, activeNav, activeSubnav, businessSearch]);

  // ── Approval & Verification Handlers ─────────────────────────────────────
  const handleApproveBusiness = async (biz: Business) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === biz.id
          ? {
              ...b,
              approvalStatus: "pending_country",
              approvedByCity: { approved: true, at: new Date().toISOString(), by: `${selectedCity} City Admin` },
            }
          : b
      )
    );
    toast.success(`"${biz.name}" approved by City Admin and forwarded to Country Lead!`);
    try {
      await fetch(`/api/businesses/${biz.id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "city_approve",
          actorName: `${selectedCity} City Admin`,
          actorRole: "city_admin",
          notes: `Verified municipal credentials for ${selectedCity}.`,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerifySeal = async (biz: Business) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === biz.id ? { ...b, isVerified: true } : b))
    );
    toast.success(`Granted official ${selectedCity} Municipal Trust Seal to "${biz.name}".`);
    try {
      await fetch(`/api/businesses/${biz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: true }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmRejection = async () => {
    if (!rejectionModalBiz) return;
    const bizId = rejectionModalBiz.id;
    const bizName = rejectionModalBiz.name;

    setBusinesses((prev) =>
      prev.map((b) => (b.id === bizId ? { ...b, approvalStatus: "rejected", isVerified: false } : b))
    );
    setRejectionModalBiz(null);
    toast.error(`"${bizName}" rejected: ${rejectionReason}`);

    try {
      await fetch(`/api/businesses/${bizId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          actorName: `${selectedCity} City Admin`,
          actorRole: "city_admin",
          rejectionReason: `${rejectionReason} - ${rejectionNotes}`,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSuspendBusiness = async (biz: Business) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === biz.id ? { ...b, isVerified: false } : b))
    );
    toast.warning(`"${biz.name}" suspended pending municipal review.`);
    try {
      await fetch(`/api/businesses/${biz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: false }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ── Claims Actions ────────────────────────────────────────────────────────
  const handleApproveClaim = async (claim: ClaimItem) => {
    setClaimsList((prev) =>
      prev.map((c) => (c.id === claim.id ? { ...c, status: "approved" } : c))
    );
    toast.success(`Ownership claim approved! ${claim.userName} is now the verified owner of ${claim.businessName}.`);
    setInspectClaim(null);

    try {
      await fetch(`/api/claims/${claim.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectClaim = async (claim: ClaimItem) => {
    setClaimsList((prev) =>
      prev.map((c) => (c.id === claim.id ? { ...c, status: "rejected" } : c))
    );
    toast.error(`Ownership claim rejected for ${claim.userName}.`);
    setInspectClaim(null);

    try {
      await fetch(`/api/claims/${claim.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionReason: "Documents could not be verified by Municipal Admin" }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // ── Add District ──────────────────────────────────────────────────────────
  const handleCreateDistrict = async () => {
    if (!newDistrictName.trim()) {
      toast.error("Please enter district or sub-city name.");
      return;
    }
    const newDist: SubcityStat = {
      name: newDistrictName.trim(),
      count: 0,
      type: newDistrictType,
      commercialFocus: newDistrictFocus.trim() || "Mixed Commercial Corridor",
      densityIndex: "Emerging",
    };
    setSubcities((prev) => [...prev, newDist]);
    setIsAddDistrictModalOpen(false);
    toast.success(`Added "${newDistrictName.trim()}" to ${selectedCity} municipal registry.`);

    try {
      await fetch("/api/city-admin/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDistrictName.trim(),
          type: newDistrictType,
          commercialFocus: newDistrictFocus.trim(),
          city: selectedCity,
          country: selectedCountry,
        }),
      });
      setNewDistrictName("");
      setNewDistrictFocus("");
    } catch (e) {
      console.error(e);
    }
  };

  // ── Broadcast Notice ──────────────────────────────────────────────────────
  const handleSendBroadcast = async () => {
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Please provide announcement title and details.");
      return;
    }

    const newNotice: CityNotice = {
      id: `not-${Date.now().toString().slice(-4)}`,
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      sentAt: "Just now",
      target: broadcastTarget === "business" ? "All Business Owners" : "All Citizens & Users",
      priority: broadcastPriority.toUpperCase(),
    };

    setNoticesList((prev) => [newNotice, ...prev]);
    setIsBroadcastModalOpen(false);
    toast.success(`City Notice broadcasted to ${selectedCity}!`);

    try {
      await fetch("/api/city-admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          city: selectedCity,
          country: selectedCountry,
          target: broadcastTarget,
          priority: broadcastPriority,
        }),
      });
      setBroadcastTitle("");
      setBroadcastMessage("");
    } catch (e) {
      console.error(e);
    }
  };

  // ── Escalate to Country Lead ──────────────────────────────────────────────
  const handleSendEscalation = async () => {
    if (!escalateSubject.trim() || !escalateReason.trim()) {
      toast.error("Please provide escalation subject and reason.");
      return;
    }

    setIsEscalateModalOpen(false);
    toast.success(`Escalation submitted to ${selectedCountry} Country Main Admin.`);

    try {
      await fetch("/api/city-admin/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city: selectedCity,
          country: selectedCountry,
          subject: escalateSubject.trim(),
          reason: escalateReason.trim(),
        }),
      });
      setEscalateSubject("");
      setEscalateReason("");
    } catch (e) {
      console.error(e);
    }
  };

  // ── Media Handlers ────────────────────────────────────────────────────────
  const handleAddMedia = () => {
    if (!newMediaTitle.trim() || !newMediaUrl.trim()) {
      toast.error("Please provide asset title and URL.");
      return;
    }
    const item: LightboxMediaItem = {
      id: `med-${Date.now()}`,
      title: newMediaTitle.trim(),
      url: newMediaUrl.trim(),
      type: newMediaType,
      businessName: newMediaBiz.trim() || "Addis Ababa Merchant",
      uploadedBy: currentUser?.name || "City Admin",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "Approved",
    };
    setMediaList((prev) => [item, ...prev]);
    setIsAddMediaModalOpen(false);
    setNewMediaTitle("");
    setNewMediaUrl("");
    toast.success("Media asset registered in municipal library!");
  };

  // ── Support Ticket Handlers ───────────────────────────────────────────────
  const handleReplyTicket = () => {
    if (!inspectTicket || !ticketReplyText.trim()) return;
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: "City Admin Bureau",
      senderRole: "admin" as const,
      text: ticketReplyText.trim(),
      timestamp: "Just now",
    };
    setSupportTickets((prev) =>
      prev.map((t) =>
        t.id === inspectTicket.id
          ? { ...t, status: "in_progress", messages: [...t.messages, newMsg] }
          : t
      )
    );
    setInspectTicket((prev) =>
      prev ? { ...prev, status: "in_progress", messages: [...prev.messages, newMsg] } : null
    );
    setTicketReplyText("");
    toast.success("Reply dispatched to merchant!");
  };

  // ── Helper: Render Modern Expandable Sidebar Item ─────────────────────────
  const renderSidebarItem = (
    key: string,
    label: string,
    icon: React.ReactNode,
    superAdminOnly?: boolean,
    subItems?: Array<{ key: string; label: string; count?: number }>
  ) => {
    const isSelected = activeNav === key;
    const isExpanded = expandedNavSections.includes(key);

    return (
      <div key={key} className="space-y-0.5">
        <button
          onClick={() => {
            setActiveNav(key);
            if (subItems && subItems.length > 0) {
              if (!isExpanded) setActiveSubnav(subItems[0].key);
              toggleNavSection(key);
            } else {
              setSidebarOpen(false); // close drawer on mobile for leaf items
            }
          }}
          className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group overflow-hidden ${
            isSelected
              ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-500/25"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
          }`}
        >
          {isSelected && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          )}
          <div className="flex items-center gap-2.5 truncate">
            <span
              className={`shrink-0 transition-transform duration-200 ${
                isSelected
                  ? "text-white scale-110"
                  : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
              }`}
            >
              {icon}
            </span>
            <span className="truncate font-semibold">{label}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {subItems && subItems.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNavSection(key);
                }}
                className={`p-0.5 rounded-md transition-all duration-200 ${
                  isSelected ? "text-white/80 hover:text-white" : "hover:bg-accent"
                }`}
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    isExpanded ? "rotate-0" : "-rotate-90"
                  }`}
                />
              </span>
            )}
          </div>
        </button>

        {subItems && isExpanded && (
          <div className="pl-4 pr-1 pt-0.5 pb-1 space-y-0.5">
            {subItems.map((sub) => {
              const isSubActive = activeNav === key && activeSubnav === sub.key;
              return (
                <button
                  key={sub.key}
                  onClick={() => {
                    setActiveNav(key);
                    setActiveSubnav(sub.key);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all duration-150 ${
                    isSubActive
                      ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                        isSubActive
                          ? "bg-sky-500 shadow-[0_0_6px_currentColor]"
                          : "bg-muted-foreground/30"
                      }`}
                    />
                    <span className="truncate">{sub.label}</span>
                  </div>
                  {sub.count !== undefined && sub.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                        isSubActive
                          ? "bg-sky-500/20 text-sky-600 dark:text-sky-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {sub.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Helper: Subnav Tab Bar Builder
  const renderSubnavTabs = (
    tabs: Array<{ key: string; label: string; count?: number }>
  ) => (
    <div className="flex items-center gap-2 flex-wrap mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveSubnav(tab.key)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
            activeSubnav === tab.key
              ? "bg-sky-600 text-white shadow-sm"
              : "bg-card text-muted-foreground border border-border hover:border-foreground/30 hover:text-foreground"
          }`}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`text-[10px] px-1.5 rounded-full ${
                activeSubnav === tab.key
                  ? "bg-white/20 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ════════════════════════════════════════════════════════════════════
          🏛️ TOP MUNICIPAL HEADER & QUICK JURISDICTION STRIP
         ════════════════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-background/95 backdrop-blur-xl transition-all">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: City Brand & Jurisdictional Seal */}
          <div className="flex items-center gap-3">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl border border-border/60 bg-card hover:bg-accent transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <Landmark className="w-5 h-5" />
              </div>
            </Link>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-foreground flex items-center gap-1.5">
                  <span>{countryEntry?.flag || "🌍"}</span>
                  <span>{selectedCity}</span>
                  <span className="text-sky-600 dark:text-sky-400 font-extrabold text-sm uppercase tracking-wide">
                    City Admin
                  </span>
                </span>
                <Badge
                  variant="outline"
                  className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 text-[10px] font-bold py-0.5 hidden sm:inline-flex"
                >
                  Municipal Command Center
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-medium">
                <span>{selectedCountry}</span>
                <span>•</span>
                <span className="text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Jurisdiction
                </span>
                <span>•</span>
                <span>{activeSubcitiesList.length} Sub-Cities</span>
              </span>
            </div>
          </div>

          {/* Center / Right: Interactive City Switcher & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {/* Quick City Selector Dropdown */}
            <div className="hidden md:flex items-center gap-1.5 bg-muted/60 border border-border px-2.5 py-1 rounded-xl text-xs">
              <Compass className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-[11px] font-semibold text-muted-foreground">City:</span>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setSelectedSubcityFilter("all");
                  toast.info(`Switched municipal jurisdiction to ${e.target.value}`);
                }}
                className="bg-transparent text-foreground font-bold text-xs focus:outline-none cursor-pointer"
              >
                {availableCities.slice(0, 15).map((cityName) => (
                  <option key={cityName} value={cityName} className="bg-popover text-popover-foreground">
                    {cityName}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Broadcast CTA */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsBroadcastModalOpen(true)}
              className="gap-1.5 text-xs font-semibold border-sky-500/30 text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 hidden sm:inline-flex"
            >
              <Megaphone className="w-3.5 h-3.5" />
              Broadcast Notice
            </Button>

            {/* Higher Role Links (if Country/Super Admin) */}
            {(currentRole === "super_admin" || currentRole === "country_admin") && (
              <Link href="/admin">
                <Button size="sm" variant="ghost" className="gap-1 text-xs text-muted-foreground hover:text-foreground">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden lg:inline">Country / Global Admin</span>
                  <ArrowUpRight className="w-3 h-3 opacity-60" />
                </Button>
              </Link>
            )}

            <ThemeToggle variant="button" />

            {/* Admin Avatar Chip */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                EV
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-bold leading-tight">
                  {currentUser?.name || "Elena Vance"}
                </div>
                <div className="text-[10px] text-muted-foreground">Municipal Lead</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════════════
          📐 MAIN DASHBOARD WORKSTATION BODY
         ════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* ── Left Sidebar Navigation: Grouped Modern Hierarchy ─────────── */}
        <aside className={`dashboard-sidebar z-50 w-64 xl:w-72 shrink-0 border-r border-border/80 bg-card/95 p-3 space-y-5 flex flex-col justify-between overflow-y-auto no-scrollbar${
          sidebarOpen ? " open" : ""
        }`}>
          {/* Mobile close button */}
          <div className="md:hidden flex items-center justify-between pb-3 mb-1 border-b border-border/60">
            <span className="text-sm font-bold text-foreground">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {/* Municipal Bureau Profile Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/10 via-indigo-500/5 to-transparent border border-sky-500/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Municipal Authority
                </span>
                <Badge className="text-[9px] px-1.5 py-0 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-none font-bold">
                  Active
                </Badge>
              </div>
              <div className="text-sm font-bold text-foreground">
                {selectedCity} Municipal Bureau
              </div>
              <p className="text-[11px] text-muted-foreground leading-snug">
                Responsible for commercial licensing, address verification, sub-city zones, and consumer protection.
              </p>
            </div>

            {/* ── Section: Core Operations ────────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Core Operations
                <div className="flex-1 h-px bg-border/60" />
              </div>

              {renderSidebarItem("dashboard", "Command Center", <Landmark className="w-4 h-4 text-sky-500" />)}

              {renderSidebarItem("global_visitors", "Global Visitors", <Globe className="w-4 h-4 text-cyan-400" />, false, [
                { key: "overview", label: "City Reach & Matrix" },
                { key: "origins", label: "Top Visitor Countries" },
                { key: "inquiries", label: "International Leads" },
              ])}

              {renderSidebarItem("users", "Municipal Users", <Users className="w-4 h-4 text-sky-500" />, false, [
                { key: "all", label: "All Municipal Users", count: cityUsersTotal || cityUsers.length },
                { key: "customers", label: "Citizens & Customers" },
                { key: "owners", label: "Business Owners" },
                { key: "suspended", label: "Suspended Accounts" },
              ])}

              {renderSidebarItem("businesses", `Businesses (${selectedCity})`, <Building2 className="w-4 h-4 text-emerald-500" />, false, [
                { key: "all", label: "All City Listings", count: businesses.length },
                { key: "confirmations", label: "🔔 Confirmations", count: stats.pendingVerification },
                { key: "pending", label: "Pending Verification", count: stats.pendingVerification },
                { key: "verified", label: "Verified Businesses", count: stats.verifiedBusinesses },
                { key: "claims", label: "Owner Claims Queue", count: claimsList.filter((c) => c.status === "pending").length },
                { key: "new", label: "+ New Listing Wizard" },
                { key: "rejected", label: "Rejected Listings" },
                { key: "suspended", label: "Suspended" },
              ])}

              {renderSidebarItem("categories", "Categories", <FolderTree className="w-4 h-4 text-purple-500" />, false, [
                { key: "all", label: "All City Categories", count: topCategories.length || 12 },
                { key: "industries", label: "Commercial Sectors" },
                { key: "petition", label: "Petition Country Lead" },
              ])}

              {renderSidebarItem("locations", "Locations", <MapPin className="w-4 h-4 text-rose-500" />, false, [
                { key: "subcities", label: "Sub-Cities & Woredas", count: activeSubcitiesList.length },
                { key: "districts", label: "Commercial Corridors" },
                { key: "coverage", label: "Density & Coverage" },
              ])}
            </div>

            {/* ── Section: Content & Media ───────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Content & Media
                <div className="flex-1 h-px bg-border/60" />
              </div>

              {renderSidebarItem("reviews", "Reviews", <Star className="w-4 h-4 text-amber-500" />, false, [
                { key: "all", label: "All City Reviews", count: reviewsList.length },
                { key: "published", label: "Published" },
                { key: "reported", label: "Flagged for Review", count: reviewsList.filter((r) => r.status === "reported").length },
                { key: "removed", label: "Removed" },
              ])}

              {renderSidebarItem("media", "Media Library", <Camera className="w-4 h-4 text-pink-500" />, false, [
                { key: "all", label: "All Media Assets", count: mediaList.length },
                { key: "photos", label: "Storefront Photos" },
                { key: "logos", label: "Brand Logos" },
                { key: "videos", label: "Promotional Videos" },
                { key: "pending", label: "Pending Review", count: mediaList.filter((m) => m.status === "Pending").length },
              ])}

              {renderSidebarItem("advertisements", "Advertisements", <Megaphone className="w-4 h-4 text-teal-500" />, false, [
                { key: "all", label: "All Local Campaigns", count: campaignsList.length },
                { key: "active", label: "Active Campaigns", count: campaignsList.filter((c) => c.status === "active").length },
                { key: "create", label: "+ Create Campaign" },
                { key: "paused", label: "Paused" },
              ])}
            </div>

            {/* ── Section: Platform Operations ───────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Platform Ops
                <div className="flex-1 h-px bg-border/60" />
              </div>

              {renderSidebarItem("payments", "Payments", <CreditCard className="w-4 h-4 text-emerald-500" />, false, [
                { key: "transactions", label: "City Transactions", count: cityPayments.length },
                { key: "matrix", label: "Revenue Geo-Matrix" },
                { key: "subscriptions", label: "Active Plans" },
                { key: "refunds", label: "Refunds & Disputes" },
              ])}

              {renderSidebarItem("analytics", "Analytics", <BarChart3 className="w-4 h-4 text-indigo-400" />, false, [
                { key: "overview", label: "Economic Pulse" },
                { key: "curve", label: "Growth Curve" },
                { key: "sectors", label: "Sector Breakdown" },
                { key: "search_trends", label: "Citizen Searches" },
              ])}

              {renderSidebarItem("moderation", "Reports & Moderation", <Flag className="w-4 h-4 text-red-500" />, false, [
                { key: "all", label: "All Citizen Reports", count: reportsList.filter((r) => r.status !== "resolved").length },
                { key: "business", label: "Storefront Disputes" },
                { key: "licensing", label: "Unlicensed Activity" },
                { key: "resolved", label: "Resolved Archive" },
              ])}

              {renderSidebarItem("notifications", "Notifications", <Bell className="w-4 h-4 text-yellow-500" />, false, [
                { key: "bulletins", label: "City Bulletins", count: noticesList.length },
                { key: "broadcast", label: "Send Broadcast Alert" },
                { key: "history", label: "Delivery Logs" },
              ])}

              {renderSidebarItem("support", "Support Desk", <Ticket className="w-4 h-4 text-cyan-500" />, false, [
                { key: "all", label: "All Tickets", count: supportTickets.length },
                { key: "open", label: "Open Issues", count: supportTickets.filter((t) => t.status === "open").length },
                { key: "in_progress", label: "In Progress", count: supportTickets.filter((t) => t.status === "in_progress").length },
                { key: "resolved", label: "Resolved" },
              ])}
            </div>

            {/* ── Section: System ────────────────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                System
                <div className="flex-1 h-px bg-border/60" />
              </div>

              {renderSidebarItem("settings", "Settings", <SlidersHorizontal className="w-4 h-4 text-slate-400" />, false, [
                { key: "rules", label: "Verification Guidelines" },
                { key: "office", label: "Bureau Office Profile" },
                { key: "liaison", label: "Country Lead Liaison" },
              ])}

              {renderSidebarItem("security", "Security", <Lock className="w-4 h-4 text-rose-500" />, false, [
                { key: "audit", label: "Municipal Audit Trail" },
                { key: "sessions", label: "Admin Login Activity" },
                { key: "credentials", label: "Role & Credentials" },
              ])}

              {renderSidebarItem("territory", "Territory Admin", <Landmark className="w-4 h-4 text-indigo-500" />, false, [
                { key: "jurisdiction", label: "Municipal Boundaries" },
                { key: "subcities", label: "Sub-City Allocation" },
                { key: "escalation", label: "National Hierarchy" },
              ])}
            </div>
          </div>

          {/* Country Admin Escalation Liaison Card & Footer */}
          <div className="pt-2 border-t border-border/80 space-y-2">
            <div className="p-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Globe className="w-3.5 h-3.5 text-indigo-500" />
                <span>National Lead Liaison</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Escalate cross-city issues or request national classification updates.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEscalateModalOpen(true)}
                className="w-full text-xs h-7 gap-1 font-semibold border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
              >
                <Send className="w-3 h-3" />
                Escalate to Country Lead
              </Button>
            </div>
          </div>
        </aside>

        {/* ── Main Content Workstation ──────────────────────────────────── */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Mobile Tab Selector */}
          <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "dashboard", label: "Command Center", icon: "🏛️" },
              { id: "global_visitors", label: "Global Visitors", icon: "🌐" },
              { id: "users", label: "Users", icon: "👥" },
              { id: "businesses", label: "Businesses", icon: "🏢" },
              { id: "categories", label: "Categories", icon: "📂" },
              { id: "locations", label: "Locations", icon: "🗺️" },
              { id: "reviews", label: "Reviews", icon: "⭐" },
              { id: "media", label: "Media", icon: "📸" },
              { id: "advertisements", label: "Ads", icon: "📢" },
              { id: "payments", label: "Payments", icon: "💳" },
              { id: "analytics", label: "Analytics", icon: "📈" },
              { id: "moderation", label: "Reports", icon: "🚨" },
              { id: "notifications", label: "Notices", icon: "🔔" },
              { id: "support", label: "Support", icon: "🎫" },
              { id: "settings", label: "Settings", icon: "⚙️" },
              { id: "security", label: "Security", icon: "🔒" },
              { id: "territory", label: "Territory", icon: "🗺️" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setActiveNav(t.id);
                  setActiveSubnav("overview");
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1 ${
                  activeNav === t.id
                    ? "bg-sky-600 text-white shadow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* ════════════════════════════════════════════════════════════════
              1. 🏠 COMMAND CENTER (DASHBOARD)
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "dashboard" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Municipal Banner */}
              <div className="rounded-3xl border border-border bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 text-white p-6 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{countryEntry?.flag || "🌍"}</span>
                      <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                        {selectedCity} Municipal Command Center
                      </h1>
                      <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/40 text-[10px] font-black">
                        City Administration
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                      Overseeing local commercial registrations, physical address certifications, customer consumer protections, and economic distribution across {activeSubcitiesList.length} sub-cities in {selectedCity}, {selectedCountry}.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={() => {
                        setActiveNav("businesses");
                        setActiveSubnav("pending");
                      }}
                      className="bg-white text-slate-900 hover:bg-slate-100 font-bold gap-1.5 shadow-md shadow-white/10 text-xs"
                    >
                      <Building2 className="w-4 h-4 text-sky-600" />
                      Review Pending Listings ({stats.pendingVerification})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsBroadcastModalOpen(true)}
                      className="border-white/20 text-white hover:bg-white/10 gap-1.5 text-xs"
                    >
                      <Megaphone className="w-4 h-4 text-sky-400" />
                      City Bulletin
                    </Button>
                  </div>
                </div>
              </div>

              {/* Urgent Attention Alert Banner */}
              {stats.pendingVerification > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-800 dark:text-amber-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold">{stats.pendingVerification} listings awaiting municipal verification.</span>{" "}
                      <span className="text-muted-foreground hidden sm:inline">
                        Review submitted physical addresses, telephone contacts, and trade license credentials before publishing.
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setActiveNav("businesses");
                      setActiveSubnav("pending");
                    }}
                    className="shrink-0 text-xs border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 font-bold"
                  >
                    Open Queue →
                  </Button>
                </div>
              )}

              {/* 8 Municipal Key Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🏢 Businesses</div>
                  <div className="text-lg font-black text-foreground mt-1">{stats.totalBusinesses}</div>
                  <div className="text-[10px] text-emerald-500 font-semibold mt-0.5">{stats.monthlyGrowthPercent} Growth</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">⏳ Pending</div>
                  <div className="text-lg font-black text-amber-500 mt-1">{stats.pendingVerification}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Needs Review</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">📋 Claims</div>
                  <div className="text-lg font-black text-indigo-500 mt-1">{stats.pendingClaims}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Trade Licenses</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🗺️ Sub-Cities</div>
                  <div className="text-lg font-black text-foreground mt-1">{activeSubcitiesList.length}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Municipal Woredas</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🚨 Reports</div>
                  <div className="text-lg font-black text-rose-500 mt-1">{stats.openReports}</div>
                  <div className="text-[10px] text-rose-400 mt-0.5">Citizen Disputes</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">⭐ Rating</div>
                  <div className="text-lg font-black text-amber-400 mt-1">{stats.averageRating} ★</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Consumer Quality</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">👥 Users</div>
                  <div className="text-lg font-black text-sky-500 mt-1">{cityUsersTotal || 450}</div>
                  <div className="text-[10px] text-sky-400 mt-0.5">Registered In City</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">💰 Revenue</div>
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {cityPayments.length ? `$${(cityPayments.reduce((acc, p) => acc + (p.amount || 0), 0) / 100).toLocaleString()}` : "$24,500"}
                  </div>
                  <div className="text-[10px] text-emerald-500 mt-0.5">Municipal Volume</div>
                </div>
              </div>

              {/* ─── Global Visitors Telemetry Snippet ─── */}
              <div className="p-5 rounded-3xl bg-card border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-sm font-bold text-foreground">
                      International Visitor Telemetry for {selectedCity}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Track diaspora and international consumers viewing storefronts, restaurants, and medical centers in {selectedCity}.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setActiveNav("global_visitors");
                    setActiveSubnav("overview");
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs gap-1.5 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Open Global Visitors Matrix →
                </Button>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Growth Curve */}
                <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Monthly Registration & Verification Curve</span>
                    <Badge variant="outline" className="text-[10px] font-mono">6 Months</Badge>
                  </h3>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={growthChart.length > 0 ? growthChart : [
                        { month: "Oct", businesses: 12, verifications: 10 },
                        { month: "Nov", businesses: 18, verifications: 15 },
                        { month: "Dec", businesses: 24, verifications: 20 },
                        { month: "Jan", businesses: 27, verifications: 23 },
                        { month: "Feb", businesses: 30, verifications: 26 },
                        { month: "Mar", businesses: 32, verifications: 28 },
                      ]}>
                        <defs>
                          <linearGradient id="muniBizGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="muniVerifGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                        <Area type="monotone" dataKey="businesses" stroke="#0284c7" fillOpacity={1} fill="url(#muniBizGrad)" name="Total Businesses" />
                        <Area type="monotone" dataKey="verifications" stroke="#10b981" fillOpacity={1} fill="url(#muniVerifGrad)" name="Verified" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Top Commercial Categories */}
                <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4">
                  <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Top Commercial Sectors in {selectedCity}</span>
                    <Badge variant="outline" className="text-[10px]">Establishments</Badge>
                  </h3>
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topCategories.length > 0 ? topCategories : [
                        { name: "Restaurants", count: 14 },
                        { name: "Cafes & Roasters", count: 11 },
                        { name: "Healthcare", count: 7 },
                        { name: "Auto & Transport", count: 5 },
                        { name: "Hotels", count: 4 },
                      ]} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis type="number" tick={{ fontSize: 11 }} />
                        <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Establishments" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Sub-Cities Distribution Table */}
              <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-bold text-foreground">
                      Sub-City Administrative Distribution
                    </h3>
                    <p className="text-[11px] text-muted-foreground">
                      {activeSubcitiesList.length} municipal administrative units in {selectedCity}.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddDistrictModalOpen(true)}
                    className="text-xs font-bold gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-500" /> Add Zone
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                        <th className="p-3 pl-4">Sub-City / District</th>
                        <th className="p-3">Commercial Focus</th>
                        <th className="p-3">Registered Units</th>
                        <th className="p-3">Density Index</th>
                        <th className="p-3 pr-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {activeSubcitiesList.map((sc) => (
                        <tr key={sc.name} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 pl-4 font-bold text-foreground flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-sky-500" />
                            <span>{sc.name}</span>
                          </td>
                          <td className="p-3 text-muted-foreground">{sc.commercialFocus || "Urban Commercial"}</td>
                          <td className="p-3 font-mono font-bold text-foreground">{sc.count} Establishments</td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-[10px] font-bold border-sky-500/30 text-sky-600 bg-sky-500/10">
                              {sc.densityIndex || "High Density"}
                            </Badge>
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedSubcityFilter(sc.name);
                                setActiveNav("businesses");
                                setActiveSubnav("all");
                              }}
                              className="text-xs font-bold text-sky-600 hover:text-sky-700 hover:bg-sky-500/10 h-7 px-2"
                            >
                              View Listings →
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              2. 🌐 GLOBAL VISITORS TELEMETRY
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "global_visitors" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  {selectedCity} — Global Visitors & International Telemetry
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time observation of global consumers, diaspora tourists, and foreign business inquiries viewing listings in {selectedCity}, {selectedCountry}.
                </p>
              </div>

              {renderSubnavTabs([
                { key: "overview", label: "City Reach & Matrix" },
                { key: "origins", label: "Top Visitor Countries" },
                { key: "inquiries", label: "International Leads" },
              ])}

              {/* International Reach KPI Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🌍 Global Views</div>
                  <div className="text-xl font-black text-cyan-500 mt-1">14,890</div>
                  <div className="text-[10px] text-emerald-500 font-bold mt-0.5">+28.4% this month</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🏳️ Countries Represented</div>
                  <div className="text-xl font-black text-foreground mt-1">42 Nations</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Top: USA, UK, UAE</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">💼 Business Inquiries</div>
                  <div className="text-xl font-black text-indigo-500 mt-1">312 Leads</div>
                  <div className="text-[10px] text-indigo-400 mt-0.5">Direct merchant contacts</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🏨 Hospitality & Tourism</div>
                  <div className="text-xl font-black text-amber-500 mt-1">68% Share</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Dominant sector viewed</div>
                </div>
              </div>

              {/* Interactive Global Visitors Matrix */}
              <GlobalVisitorsMatrix
                currentRole="city_admin"
                targetCountry={selectedCountry}
                targetCity={selectedCity}
              />
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              3. 👥 MUNICIPAL USERS
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "users" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-500" />
                    {selectedCity} — Municipal Users Roster
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage citizens, customers, and registered business owners in {selectedCity}, {selectedCountry}.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportCityUsers("csv")}
                    disabled={isExportingUsers}
                    className="text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportCityUsers("json")}
                    disabled={isExportingUsers}
                    className="text-xs font-bold gap-1.5 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Download JSON
                  </Button>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All Municipal Users", count: cityUsersTotal || cityUsers.length },
                { key: "customers", label: "Citizens & Customers" },
                { key: "owners", label: "Business Owners" },
                { key: "suspended", label: "Suspended Accounts" },
              ])}

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-3xl bg-card border border-border shadow-sm">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={`Search municipal users in ${selectedCity} by name, email, phone...`}
                    className="w-full pl-9 h-10 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value as any)}
                    className="h-10 px-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none"
                  >
                    <option value="all">All Roles</option>
                    <option value="customers">Customers / Citizens</option>
                    <option value="owners">Business Owners</option>
                    <option value="admins">Admins</option>
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fetchCityUsers}
                    disabled={isUsersLoading}
                    className="text-xs font-bold gap-1.5 h-10 rounded-2xl"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isUsersLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Users Table */}
              <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                        <th className="px-6 py-3.5">User</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5">Role</th>
                        <th className="px-6 py-3.5">Location</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Joined</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-medium">
                      {cityUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                            {isUsersLoading ? "Loading users…" : "No municipal users found matching current filters."}
                          </td>
                        </tr>
                      ) : (
                        cityUsers.map((u, idx) => (
                          <tr key={u.id || idx} className="hover:bg-accent/30 transition-colors">
                            <td className="px-6 py-3.5 font-bold text-foreground">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500/20 to-sky-500/5 text-sky-600 font-black text-xs flex items-center justify-center border border-sky-500/20 shrink-0">
                                  {u.name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <div className="font-bold text-foreground">{u.name || "—"}</div>
                                  {u.phone && <div className="text-[10px] text-muted-foreground font-mono">{u.phone}</div>}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-muted-foreground font-mono">{u.email || "—"}</td>
                            <td className="px-6 py-3.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border bg-sky-500/10 text-sky-600 border-sky-500/30">
                                {u.role === "owner" ? "Business Owner" : u.role === "city_admin" ? "City Admin" : "Citizen / Customer"}
                              </span>
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span>{u.city || selectedCity}, {u.country || selectedCountry}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <Badge className={u.status === "active" || u.isActive !== false ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold" : "bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold"}>
                                {u.status === "active" || u.isActive !== false ? "🟢 Active" : "🔴 Suspended"}
                              </Badge>
                            </td>
                            <td className="px-6 py-3.5 text-muted-foreground font-mono text-[11px]">
                              {u.joinedAt || (u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              4. 🏢 BUSINESSES (LISTINGS, VERIFICATION, CLAIMS, WIZARD)
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "businesses" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    {selectedCity} — Business Listings & Storefront Verification
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage storefront verifications, pending confirmations, ownership claims, and listing onboarding.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => setActiveSubnav("new")}
                    className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    + New Listing Wizard
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportCityBusinesses("csv")}
                    disabled={isExportingBiz}
                    className="text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All City Listings", count: businesses.length },
                { key: "confirmations", label: "🔔 Confirmations", count: stats.pendingVerification },
                { key: "pending", label: "Pending Verification", count: stats.pendingVerification },
                { key: "verified", label: "Verified", count: stats.verifiedBusinesses },
                { key: "claims", label: "Owner Claims Queue", count: claimsList.filter((c) => c.status === "pending").length },
                { key: "new", label: "+ New Listing Wizard" },
                { key: "rejected", label: "Rejected / Remediation" },
                { key: "suspended", label: "Suspended" },
              ])}

              {/* Sub-view: Embedded Listing Wizard */}
              {activeSubnav === "new" && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm">
                  <EmbeddedListingWizard
                    mode="embedded"
                    isAdmin={true}
                    onSuccess={(id) => {
                      toast.success("Business successfully registered in municipal directory!");
                      fetchBusinesses();
                      setActiveSubnav("all");
                    }}
                    onCancel={() => setActiveSubnav("all")}
                  />
                </div>
              )}

              {/* Sub-view: Pending Confirmations Queue */}
              {activeSubnav === "confirmations" && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-sky-500" />
                      Pending Confirmations Queue — Multi-Tier Governance
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Businesses submitted by owners or citizens in {selectedCity} awaiting municipal review before escalation to National Lead.
                    </p>
                  </div>
                  <PendingConfirmationsQueue
                    role="city_admin"
                    filterCity={selectedCity}
                    filterCountry={selectedCountry}
                    onApproved={(_bizId) => {
                      fetchBusinesses();
                      fetchCityStats();
                    }}
                  />
                </div>
              )}

              {/* Sub-view: Owner Claims Queue */}
              {activeSubnav === "claims" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-900 dark:text-indigo-200">
                    <span className="font-bold">Official Municipal Claims Verification:</span> Verify applicant identity against commercial registration certificates and lease agreements.
                  </div>

                  <div className="space-y-3">
                    {claimsList.map((claim) => (
                      <div
                        key={claim.id}
                        className="p-5 rounded-3xl bg-card border border-border flex flex-wrap items-center justify-between gap-4 shadow-sm hover:border-indigo-500/40 transition-colors"
                      >
                        <div className="space-y-1 max-w-xl">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-sm">{claim.businessName}</span>
                            <Badge
                              variant="outline"
                              className={
                                claim.status === "approved"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                                  : claim.status === "rejected"
                                  ? "bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]"
                                  : "bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px]"
                              }
                            >
                              {claim.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Claimant: <strong className="text-foreground">{claim.userName}</strong> ({claim.businessRole}) • {claim.userPhone}
                          </div>
                          {claim.notes && <p className="text-xs text-muted-foreground italic">"{claim.notes}"</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setInspectClaim(claim)}
                            className="h-8 text-xs font-bold gap-1"
                          >
                            <FileCheck className="w-3.5 h-3.5 text-indigo-500" />
                            Inspect Trade License
                          </Button>
                          {claim.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveClaim(claim)}
                                className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectClaim(claim)}
                                className="h-8 text-xs font-bold"
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Standard Businesses Table (for all, pending, verified, rejected, suspended) */}
              {activeSubnav !== "new" && activeSubnav !== "confirmations" && activeSubnav !== "claims" && (
                <div className="space-y-4">
                  {/* Search and Subcity Filter Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-3xl bg-card border border-border shadow-sm">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                      <input
                        type="text"
                        value={businessSearch}
                        onChange={(e) => setBusinessSearch(e.target.value)}
                        placeholder={`Search ${selectedCity} businesses by name, address, category...`}
                        className="w-full pl-9 h-10 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={selectedSubcityFilter}
                        onChange={(e) => setSelectedSubcityFilter(e.target.value)}
                        className="h-10 px-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="all">All Sub-Cities</option>
                        {activeSubcitiesList.map((sc) => (
                          <option key={sc.name} value={sc.name}>{sc.name}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchBusinesses}
                        disabled={isLoadingBiz}
                        className="text-xs font-bold gap-1.5 h-10 rounded-2xl"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBiz ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Listings Table */}
                  <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                            <th className="p-3.5 pl-6">Business</th>
                            <th className="p-3.5">Category</th>
                            <th className="p-3.5">Sub-City & Address</th>
                            <th className="p-3.5">Phone Contact</th>
                            <th className="p-3.5">Trust Status</th>
                            <th className="p-3.5 pr-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-medium">
                          {filteredBusinesses.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                {isLoadingBiz ? "Loading businesses…" : `No businesses found in ${selectedCity} matching criteria.`}
                              </td>
                            </tr>
                          ) : (
                            filteredBusinesses.map((b) => (
                              <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                                <td className="p-3.5 pl-6 font-bold text-foreground">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-muted border border-border overflow-hidden shrink-0 flex items-center justify-center font-bold text-sky-600">
                                      {b.logoUrl ? (
                                        <img src={b.logoUrl} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        b.name.charAt(0)
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-bold text-foreground flex items-center gap-1.5">
                                        <span>{b.name}</span>
                                        {b.isVerified && (
                                          <BadgeCheck className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                        )}
                                      </div>
                                      <div className="text-[10px] text-muted-foreground">ID: {b.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-3.5 text-muted-foreground">{b.categoryName || "General"}</td>
                                <td className="p-3.5">
                                  <div className="font-semibold text-foreground">{b.districtName || "Central Zone"}</div>
                                  <div className="text-[10px] text-muted-foreground truncate max-w-[160px]">{b.addressLine || selectedCity}</div>
                                </td>
                                <td className="p-3.5 font-mono text-muted-foreground">{b.telephone || b.mobile || "—"}</td>
                                <td className="p-3.5">
                                  <Badge
                                    className={
                                      b.isVerified
                                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold"
                                        : (b as any).approvalStatus === "rejected"
                                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold"
                                        : "bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold"
                                    }
                                  >
                                    {b.isVerified ? "✓ Verified" : (b as any).approvalStatus === "rejected" ? "✕ Rejected" : "⏳ Pending"}
                                  </Badge>
                                </td>
                                <td className="p-3.5 pr-6 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setInspectBusiness(b)}
                                      className="h-7 px-2 text-xs font-bold text-sky-600 hover:bg-sky-500/10"
                                    >
                                      Inspect
                                    </Button>
                                    {!b.isVerified && (
                                      <>
                                        <Button
                                          size="sm"
                                          onClick={() => handleApproveBusiness(b)}
                                          className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                        >
                                          Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => setRejectionModalBiz(b)}
                                          className="h-7 px-2 text-xs font-bold"
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              5. 📂 CATEGORIES (MUNICIPAL TAXONOMY)
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "categories" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-purple-500" />
                    {selectedCity} — Commercial Categories & Taxonomy
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Municipal industry distribution, sector density, and category expansion petitions to Country Lead.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => {
                    setEscalateSubject(`Category Petition for ${selectedCity}`);
                    setEscalateReason(`Requesting national taxonomy addition for commercial sector in ${selectedCity}...`);
                    setIsEscalateModalOpen(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-purple-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  Petition Country Lead for Category
                </Button>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All City Categories", count: topCategories.length || 12 },
                { key: "industries", label: "Commercial Sectors" },
                { key: "petition", label: "Petition Country Lead" },
              ])}

              {/* Category Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SEED_CATEGORIES.slice(0, 12).map((cat, idx) => {
                  const matchCount = businesses.filter(
                    (b) => b.categoryName?.toLowerCase() === cat.name.toLowerCase()
                  ).length || [14, 11, 8, 7, 5, 4, 3, 3, 2, 2, 1, 1][idx % 12];

                  return (
                    <div
                      key={cat.id}
                      className="p-5 rounded-3xl bg-card border border-border space-y-3 hover:border-purple-500/40 transition-colors shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold text-base">
                          {cat.icon || "📂"}
                        </div>
                        <Badge variant="outline" className="text-[10px] font-bold border-purple-500/30 text-purple-600 bg-purple-500/10">
                          {matchCount > 8 ? "Core Sector" : "Emerging"}
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground text-sm">{cat.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {cat.description || `Commercial establishments registered under ${cat.name} in ${selectedCity}.`}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-foreground">{matchCount} Businesses</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setBusinessSearch(cat.name);
                            setActiveNav("businesses");
                            setActiveSubnav("all");
                          }}
                          className="h-6 text-[11px] font-bold text-purple-600 hover:text-purple-700"
                        >
                          View Listings →
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              6. 🗺️ LOCATIONS & DISTRICTS
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "locations" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    {selectedCity} — Sub-Cities, Districts & Commercial Corridors
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage administrative subdivisions, commercial zones, and geographic density boundaries.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsAddDistrictModalOpen(true)}
                  className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  + Add Sub-City / Commercial Zone
                </Button>
              </div>

              {renderSubnavTabs([
                { key: "subcities", label: "Sub-Cities & Woredas", count: activeSubcitiesList.length },
                { key: "districts", label: "Commercial Corridors" },
                { key: "coverage", label: "Density & Coverage" },
              ])}

              {/* Sub-Cities Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeSubcitiesList.map((sc, idx) => (
                  <div
                    key={sc.name}
                    className="p-5 rounded-3xl bg-card border border-border space-y-3 shadow-sm hover:border-rose-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        <h3 className="font-bold text-foreground text-sm">{sc.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-rose-500/30 text-rose-600 bg-rose-500/10">
                        {sc.densityIndex || "Active Zone"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {sc.commercialFocus || "Primary commercial corridor and municipal market center."}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Establishments:</span>
                        <span className="font-bold font-mono text-foreground">{sc.count} Listed</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-sky-500 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(15, sc.count * 7))}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[10px] text-emerald-500 font-semibold">✓ Municipal Certified</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedSubcityFilter(sc.name);
                          setActiveNav("businesses");
                          setActiveSubnav("all");
                        }}
                        className="h-7 text-xs font-bold text-sky-600 hover:text-sky-700"
                      >
                        Inspect Zone →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              7. ⭐ REVIEWS MODERATION
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "reviews" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    {selectedCity} — Citizen Reviews & Quality Moderation
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Monitor citizen feedback, audit reported reviews, and maintain consumer trust standards.
                  </p>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All City Reviews", count: reviewsList.length },
                { key: "published", label: "Published" },
                { key: "reported", label: "Flagged for Review", count: reviewsList.filter((r) => r.status === "reported").length },
                { key: "removed", label: "Removed" },
              ])}

              {/* Reviews List */}
              <div className="space-y-3">
                {reviewsList
                  .filter((r) => {
                    if (activeSubnav === "published") return r.status === "published";
                    if (activeSubnav === "reported") return r.status === "reported";
                    if (activeSubnav === "removed") return r.status === "removed";
                    return true;
                  })
                  .map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-3xl bg-card border border-border flex flex-wrap items-center justify-between gap-4 shadow-sm hover:border-amber-500/40 transition-colors"
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-foreground text-sm">{rev.businessName}</span>
                          <span className="text-xs text-muted-foreground">• by {rev.userName}</span>
                          <span className="text-amber-500 font-bold text-xs flex items-center">
                            ★ {rev.rating}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              rev.status === "reported"
                                ? "bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px]"
                                : rev.status === "removed"
                                ? "bg-slate-500/10 text-slate-600 border-slate-500/30 text-[10px]"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                            }
                          >
                            {rev.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">"{rev.comment}"</p>
                        <div className="text-[10px] text-muted-foreground">Posted: {rev.date}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {rev.status === "reported" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => {
                                setReviewsList((prev) =>
                                  prev.map((r) => (r.id === rev.id ? { ...r, status: "published" } : r))
                                );
                                toast.success("Review approved and restored.");
                              }}
                              className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setReviewsList((prev) =>
                                  prev.map((r) => (r.id === rev.id ? { ...r, status: "removed" } : r))
                                );
                                toast.error("Review removed for policy violation.");
                              }}
                              className="h-8 text-xs font-bold"
                            >
                              Remove
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setReviewsList((prev) =>
                                prev.map((r) => (r.id === rev.id ? { ...r, status: "reported" } : r))
                              );
                              toast.warning("Flagged review for moderation.");
                            }}
                            className="h-8 text-xs text-muted-foreground hover:text-rose-600"
                          >
                            Flag Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              8. 📸 MEDIA LIBRARY
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "media" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Camera className="w-5 h-5 text-pink-500" />
                    {selectedCity} — Storefront & Commercial Media Library
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Storefront photos, business logos, and promotional videos registered in {selectedCity}.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsAddMediaModalOpen(true)}
                  className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-pink-600/20"
                >
                  <Plus className="w-4 h-4" />
                  + Register Asset
                </Button>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All Media Assets", count: mediaList.length },
                { key: "photos", label: "Storefront Photos" },
                { key: "logos", label: "Brand Logos" },
                { key: "videos", label: "Promotional Videos" },
                { key: "pending", label: "Pending Review", count: mediaList.filter((m) => m.status === "Pending").length },
              ])}

              {/* Media Grid Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {mediaList
                  .filter((m) => {
                    if (activeSubnav === "photos") return m.type === "Photo";
                    if (activeSubnav === "logos") return m.type === "Logo";
                    if (activeSubnav === "videos") return m.type === "Video";
                    if (activeSubnav === "pending") return m.status === "Pending";
                    return true;
                  })
                  .map((item) => (
                    <div
                      key={item.id}
                      className="rounded-3xl bg-card border border-border overflow-hidden space-y-2 shadow-sm hover:border-pink-500/40 transition-colors group cursor-pointer"
                      onClick={() => setLightboxMedia(item)}
                    >
                      <div className="h-44 w-full bg-muted relative overflow-hidden">
                        <img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-black/60 text-white border-none text-[10px] font-bold">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="absolute top-3 right-3">
                          <Badge
                            className={
                              item.status === "Approved"
                                ? "bg-emerald-500 text-white text-[10px]"
                                : "bg-amber-500 text-white text-[10px]"
                            }
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-4 space-y-2">
                        <div>
                          <h4 className="font-bold text-foreground text-sm truncate">{item.title}</h4>
                          <p className="text-xs text-sky-600 font-semibold truncate">{item.businessName}</p>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{item.description}</p>
                        <div className="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>By: {item.uploadedBy}</span>
                          <span>{item.uploadedAt}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              9. 📢 ADVERTISEMENTS & CAMPAIGNS
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "advertisements" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-teal-500" />
                    {selectedCity} — Local Sponsored Ads & Promotions
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage sponsored business placements, search top banners, and merchant ad campaigns in {selectedCity}.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsAddCampaignModalOpen(true)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-teal-600/20"
                >
                  <Plus className="w-4 h-4" />
                  + Create Local Campaign
                </Button>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All Local Campaigns", count: campaignsList.length },
                { key: "active", label: "Active Campaigns", count: campaignsList.filter((c) => c.status === "active").length },
                { key: "create", label: "+ Create Campaign" },
                { key: "paused", label: "Paused" },
              ])}

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">📢 Active Campaigns</div>
                  <div className="text-xl font-black text-teal-500 mt-1">{campaignsList.filter((c) => c.status === "active").length}</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">👁️ City Impressions</div>
                  <div className="text-xl font-black text-foreground mt-1">
                    {campaignsList.reduce((acc, c) => acc + c.impressions, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">👆 Clicks Generated</div>
                  <div className="text-xl font-black text-sky-500 mt-1">
                    {campaignsList.reduce((acc, c) => acc + c.clicks, 0).toLocaleString()}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">💰 Daily Revenue</div>
                  <div className="text-xl font-black text-emerald-500 mt-1">
                    {campaignsList.reduce((acc, c) => acc + c.dailyBudgetETB, 0).toLocaleString()} ETB
                  </div>
                </div>
              </div>

              {/* Campaigns Table */}
              <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                        <th className="p-3.5 pl-6">Campaign & Business</th>
                        <th className="p-3.5">Placement</th>
                        <th className="p-3.5">Target Location</th>
                        <th className="p-3.5">Daily Budget</th>
                        <th className="p-3.5">Impressions / Clicks</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {campaignsList
                        .filter((c) => (activeSubnav === "active" ? c.status === "active" : activeSubnav === "paused" ? c.status === "paused" : true))
                        .map((camp) => (
                          <tr key={camp.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3.5 pl-6 font-bold text-foreground">
                              <div>{camp.name}</div>
                              <div className="text-[11px] text-teal-600 font-semibold">{camp.businessName}</div>
                            </td>
                            <td className="p-3.5 capitalize text-muted-foreground">{camp.placement.replace("_", " ")}</td>
                            <td className="p-3.5 text-muted-foreground">{camp.targetLocation}</td>
                            <td className="p-3.5 font-mono font-bold text-foreground">{camp.dailyBudgetETB} ETB/day</td>
                            <td className="p-3.5">
                              <span className="font-bold text-foreground">{camp.impressions.toLocaleString()}</span> views •{" "}
                              <span className="text-emerald-500 font-bold">{camp.clicks} clicks</span>
                            </td>
                            <td className="p-3.5">
                              <Badge
                                className={
                                  camp.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]"
                                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]"
                                }
                              >
                                {camp.status.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-3.5 pr-6 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setCampaignsList((prev) =>
                                    prev.map((c) =>
                                      c.id === camp.id
                                        ? { ...c, status: c.status === "active" ? "paused" : "active" }
                                        : c
                                    )
                                  );
                                  toast.info(`Toggled status for ${camp.name}`);
                                }}
                                className="h-7 text-xs font-bold"
                              >
                                {camp.status === "active" ? "Pause" : "Resume"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              10. 💳 PAYMENTS & LEDGER
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "payments" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-500" />
                    {selectedCity} — Payment Status & Collections
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Live municipal-scoped transaction ledger. Monitor completed, pending, and subscription payments.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => setIsRegisterPaymentModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Plus className="w-4 h-4" />
                    + Register Payment
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (!cityPayments.length) { toast.error("No payment records to export."); return; }
                      exportPaymentsToCSV(cityPayments, `${selectedCity.toLowerCase().replace(/\s+/g, "_")}_payments`);
                      toast.success(`Exported ${cityPayments.length} payment records to CSV.`);
                    }}
                    className="text-xs font-bold gap-1.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download CSV
                  </Button>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "transactions", label: "City Transactions", count: cityPayments.length },
                { key: "matrix", label: "Revenue Geo-Matrix" },
                { key: "subscriptions", label: "Active Plans" },
                { key: "refunds", label: "Refunds & Disputes" },
              ])}

              {/* Geo Matrix View */}
              {activeSubnav === "matrix" && (
                <PaymentStatusGeoMatrix
                  payments={cityPayments}
                  geoSummaries={cityPayGeoBreakdown}
                  selectedCountry={selectedCountry}
                  selectedCity={payCityFilter}
                  selectedStatus={payStatusFilter}
                  currentRole="city_admin"
                  isCityLocked={true}
                  isCountryLocked={true}
                  title={`Payment Collections — ${selectedCity}`}
                  subtitle={`Sub-city and district payment breakdown for ${selectedCity}, ${selectedCountry}.`}
                  onSelectGeo={(_country, city) => {
                    setPayCityFilter(city);
                    setPayPage(1);
                  }}
                  onSelectStatus={(st) => {
                    setPayStatusFilter(st);
                    setPayPage(1);
                  }}
                />
              )}

              {/* Transactions Ledger Table */}
              {activeSubnav !== "matrix" && (
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-3xl bg-card border border-border shadow-sm">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                      <input
                        type="text"
                        value={paySearch}
                        onChange={(e) => { setPaySearch(e.target.value); setPayPage(1); }}
                        placeholder={`Search transactions in ${selectedCity}...`}
                        className="w-full pl-9 h-10 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={payStatusFilter}
                        onChange={(e) => { setPayStatusFilter(e.target.value); setPayPage(1); }}
                        className="h-10 px-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={fetchCityPayments}
                        disabled={isPaymentsLoading}
                        className="text-xs font-bold gap-1.5 h-10 rounded-2xl"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isPaymentsLoading ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Transaction Table */}
                  <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                            <th className="pb-3.5 pt-3.5 pl-6">TX ID</th>
                            <th className="pb-3.5 pt-3.5">Business</th>
                            <th className="pb-3.5 pt-3.5">Sub-City</th>
                            <th className="pb-3.5 pt-3.5">Channel</th>
                            <th className="pb-3.5 pt-3.5">Amount</th>
                            <th className="pb-3.5 pt-3.5">Status</th>
                            <th className="pb-3.5 pt-3.5 pr-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60 font-medium">
                          {cityPayments.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                                {isPaymentsLoading ? "Loading payment records…" : `No payments registered yet for ${selectedCity}.`}
                              </td>
                            </tr>
                          ) : (
                            cityPayments
                              .filter((p) => payStatusFilter === "all" || p.status === payStatusFilter)
                              .map((tx) => (
                                <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                                  <td className="py-3.5 pl-6 font-mono font-bold text-sky-600 text-[11px]">{tx.id}</td>
                                  <td className="py-3.5 font-semibold text-foreground">{tx.businessName}</td>
                                  <td className="py-3.5 text-muted-foreground">{tx.cityName || selectedCity}</td>
                                  <td className="py-3.5 capitalize text-foreground font-semibold">{tx.provider.replace("_", " ")}</td>
                                  <td className="py-3.5 font-black text-foreground">{tx.amount.toLocaleString()} {tx.currency}</td>
                                  <td className="py-3.5">
                                    <Badge
                                      className={
                                        tx.status === "completed"
                                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]"
                                          : tx.status === "pending"
                                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]"
                                          : "bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px]"
                                      }
                                    >
                                      {tx.status.toUpperCase()}
                                    </Badge>
                                  </td>
                                  <td className="py-3.5 pr-6 text-right">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setInspectReceiptPayment(tx)}
                                      className="h-7 text-xs font-bold text-sky-600 hover:bg-sky-500/10"
                                    >
                                      Receipt
                                    </Button>
                                  </td>
                                </tr>
                              ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              11. 📈 ANALYTICS & ECONOMIC TRENDS
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "analytics" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  {selectedCity} — Economic Growth & Search Telemetry
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Onboarding velocity, commercial categories density, and citizen search trends in {selectedCity}.
                </p>
              </div>

              {renderSubnavTabs([
                { key: "overview", label: "Economic Pulse" },
                { key: "curve", label: "Growth Curve" },
                { key: "sectors", label: "Sector Breakdown" },
                { key: "search_trends", label: "Citizen Searches" },
              ])}

              {/* Citizen Search Trends Radar */}
              <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-3">
                <h2 className="text-sm font-bold text-foreground">
                  Top Trending Citizen Search Queries in {selectedCity}
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    { query: "Bole coffee roasters", searches: "1,420 searches", trend: "+24%" },
                    { query: "Kirkos private clinic", searches: "980 searches", trend: "+18%" },
                    { query: "Traditional restaurant Arada", searches: "840 searches", trend: "+12%" },
                    { query: "Auto spare parts Addis Ketema", searches: "720 searches", trend: "+31%" },
                  ].map((item) => (
                    <div key={item.query} className="p-3 rounded-2xl bg-muted/40 border border-border/60 space-y-1">
                      <div className="font-bold text-foreground truncate">{item.query}</div>
                      <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                        <span>{item.searches}</span>
                        <span className="text-emerald-500 font-bold">{item.trend}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Growth Curve */}
              <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border space-y-4">
                <h2 className="text-sm font-bold text-foreground">
                  Monthly Registration & Verification Curve
                </h2>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthChart.length > 0 ? growthChart : [
                      { month: "Oct", businesses: 12, verifications: 10 },
                      { month: "Nov", businesses: 18, verifications: 15 },
                      { month: "Dec", businesses: 24, verifications: 20 },
                      { month: "Jan", businesses: 27, verifications: 23 },
                      { month: "Feb", businesses: 30, verifications: 26 },
                      { month: "Mar", businesses: 32, verifications: 28 },
                    ]}>
                      <defs>
                        <linearGradient id="anBizGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="anVerifGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Area type="monotone" dataKey="businesses" stroke="#0284c7" fillOpacity={1} fill="url(#anBizGrad)" name="Total Businesses" />
                      <Area type="monotone" dataKey="verifications" stroke="#10b981" fillOpacity={1} fill="url(#anVerifGrad)" name="Verified" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              12. 🚨 REPORTS & MODERATION
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "moderation" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Flag className="w-5 h-5 text-red-500" />
                    {selectedCity} — Citizen Consumer Protection & Reports
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Storefront location inaccuracies, fraudulent listings, and merchant zoning complaints.
                  </p>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All Citizen Reports", count: reportsList.filter((r) => r.status !== "resolved").length },
                { key: "business", label: "Storefront Disputes" },
                { key: "licensing", label: "Unlicensed Activity" },
                { key: "resolved", label: "Resolved Archive" },
              ])}

              {/* Reports List */}
              <div className="space-y-3">
                {reportsList.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-5 rounded-3xl bg-card border border-border flex flex-wrap items-center justify-between gap-4 shadow-sm hover:border-red-500/40 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={
                            rep.priority === "high"
                              ? "bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-black"
                              : "bg-amber-500/10 text-amber-600 border-amber-500/30 text-[10px] font-bold"
                          }
                        >
                          {rep.priority.toUpperCase()} PRIORITY
                        </Badge>
                        <h2 className="text-sm font-bold text-foreground">{rep.title}</h2>
                        <span className="text-xs text-muted-foreground">• Target: {rep.targetName}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{rep.reason}</p>
                      <div className="text-[10px] text-muted-foreground">
                        Reported by: <span className="font-medium text-foreground">{rep.reporterName}</span> • Status:{" "}
                        <span className="font-bold text-foreground">{rep.status.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {rep.status !== "resolved" ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setReportsList((prev) =>
                                prev.map((r) => (r.id === rep.id ? { ...r, status: "resolved" } : r))
                              );
                              toast.success(`Report "${rep.title}" resolved!`);
                            }}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            Mark Resolved
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEscalateSubject(`City Report Escalation: ${rep.title} (${rep.targetName})`);
                              setEscalateReason(rep.reason);
                              setIsEscalateModalOpen(true);
                            }}
                            className="h-8 text-xs font-bold"
                          >
                            Escalate to Country
                          </Button>
                        </>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                          ✓ Resolved
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              13. 🔔 NOTIFICATIONS & BULLETINS
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "notifications" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    {selectedCity} — Municipal Bulletins & Push Notices
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Broadcast municipal alerts, tax deadlines, and commercial corridor updates to local merchants.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIsBroadcastModalOpen(true)}
                  className="bg-primary text-primary-foreground font-bold text-xs gap-1.5 shadow-md shadow-primary/20"
                >
                  <Plus className="w-4 h-4" />
                  Compose City Notice
                </Button>
              </div>

              {renderSubnavTabs([
                { key: "bulletins", label: "City Bulletins", count: noticesList.length },
                { key: "broadcast", label: "Send Broadcast Alert" },
                { key: "history", label: "Delivery Logs" },
              ])}

              {/* Bulletins Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {noticesList.map((not) => (
                  <div
                    key={not.id}
                    className="p-5 rounded-3xl bg-card border border-border space-y-3 shadow-sm hover:border-sky-500/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30 text-[10px] font-bold"
                          >
                            {not.priority} Priority
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">{not.sentAt}</span>
                        </div>
                        <h2 className="text-base font-bold text-foreground">{not.title}</h2>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{not.message}</p>

                    <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>Audience: <strong className="text-foreground">{not.target}</strong></span>
                      <span className="text-emerald-500 font-bold">✓ Delivered</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              14. 🎫 SUPPORT DESK
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "support" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-cyan-500" />
                    {selectedCity} — Municipal Support & Inquiry Desk
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assist local merchants with location updates, trade license verification, and dispute resolution.
                  </p>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All Tickets", count: supportTickets.length },
                { key: "open", label: "Open Issues", count: supportTickets.filter((t) => t.status === "open").length },
                { key: "in_progress", label: "In Progress", count: supportTickets.filter((t) => t.status === "in_progress").length },
                { key: "resolved", label: "Resolved" },
              ])}

              {/* Tickets Table */}
              <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                        <th className="p-3.5 pl-6">Ticket #</th>
                        <th className="p-3.5">Subject & Merchant</th>
                        <th className="p-3.5">Category</th>
                        <th className="p-3.5">Priority</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {supportTickets
                        .filter((t) => {
                          if (activeSubnav === "open") return t.status === "open";
                          if (activeSubnav === "in_progress") return t.status === "in_progress";
                          if (activeSubnav === "resolved") return t.status === "resolved";
                          return true;
                        })
                        .map((tkt) => (
                          <tr key={tkt.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3.5 pl-6 font-mono font-bold text-sky-600">{tkt.ticketNumber}</td>
                            <td className="p-3.5">
                              <div className="font-bold text-foreground">{tkt.subject}</div>
                              <div className="text-[11px] text-muted-foreground">{tkt.businessName} • {tkt.userName}</div>
                            </td>
                            <td className="p-3.5 text-muted-foreground">{tkt.category}</td>
                            <td className="p-3.5">
                              <Badge
                                className={
                                  tkt.priority === "high"
                                    ? "bg-rose-500/10 text-rose-600 border border-rose-500/30 text-[10px]"
                                    : "bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px]"
                                }
                              >
                                {tkt.priority.toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-3.5">
                              <Badge
                                className={
                                  tkt.status === "open"
                                    ? "bg-sky-500/10 text-sky-600 border border-sky-500/30 text-[10px]"
                                    : tkt.status === "in_progress"
                                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px]"
                                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px]"
                                }
                              >
                                {tkt.status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </td>
                            <td className="p-3.5 pr-6 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setInspectTicket(tkt)}
                                className="h-7 text-xs font-bold text-sky-600 hover:bg-sky-500/10"
                              >
                                Respond
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              15. ⚙️ SETTINGS & MUNICIPAL RULES
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "settings" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-400" />
                  {selectedCity} — Municipal Authority Rules & Settings
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Verification criteria, operating guidelines, and administrative escalation channels to Country Lead.
                </p>
              </div>

              {renderSubnavTabs([
                { key: "rules", label: "Verification Guidelines" },
                { key: "office", label: "Bureau Office Profile" },
                { key: "liaison", label: "Country Lead Liaison" },
              ])}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Municipal Policy Toggles */}
                <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-sky-500" />
                    Storefront Verification Requirements
                  </h2>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
                      <div>
                        <div className="font-bold text-foreground">Require Physical Storefront Photos</div>
                        <div className="text-muted-foreground text-[11px]">
                          Listings must supply exterior entrance photo before verification.
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
                      <div>
                        <div className="font-bold text-foreground">Mandate Sub-City / District Designation</div>
                        <div className="text-muted-foreground text-[11px]">
                          Every business must be mapped to one of the {activeSubcitiesList.length} sub-cities.
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/60">
                      <div>
                        <div className="font-bold text-foreground">Trade License Upload for Owner Claims</div>
                        <div className="text-muted-foreground text-[11px]">
                          Owner claims require official commercial registration certificate.
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked className="toggle cursor-pointer" />
                    </div>
                  </div>
                </div>

                {/* Country Admin Liaison Card */}
                <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    {selectedCountry} Country Main Admin Liaison
                  </h2>

                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 space-y-2 text-xs">
                    <div className="font-bold text-foreground text-sm">
                      National Administration Desk: Mastwal (Country Lead)
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      Your municipal administration is linked to the {selectedCountry} National Lead. Submit formal escalations for country-wide tax policies, cross-jurisdiction disputes, or to petition new national business classifications.
                    </p>
                    <div className="pt-2">
                      <Button
                        size="sm"
                        onClick={() => setIsEscalateModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-indigo-600/20"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Compose Escalation Request
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              16. 🔒 SECURITY & MUNICIPAL AUDIT TRAIL
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "security" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Lock className="w-5 h-5 text-rose-500" />
                  {selectedCity} — Governance Security & Audit Station
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Municipal audit trail of verification actions, administrator sessions, and credential security.
                </p>
              </div>

              {renderSubnavTabs([
                { key: "audit", label: "Municipal Audit Trail" },
                { key: "sessions", label: "Admin Login Activity" },
                { key: "credentials", label: "Role & Credentials" },
              ])}

              {/* Security Posture Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🔐 2FA Status</div>
                  <div className="text-base font-bold text-emerald-500">Enforced & Active</div>
                  <div className="text-[11px] text-muted-foreground">Clerk Multi-Factor Authentication</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🏙️ Municipal Scope</div>
                  <div className="text-base font-bold text-sky-500">{selectedCity}, {selectedCountry}</div>
                  <div className="text-[11px] text-muted-foreground">Role: City Administrator</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🛡️ Session Encryption</div>
                  <div className="text-base font-bold text-indigo-500">TLS 1.3 End-to-End</div>
                  <div className="text-[11px] text-muted-foreground">60-minute automatic timeout</div>
                </div>
              </div>

              {/* Audit Table */}
              <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Municipal Audit Trail</span>
                  <Badge variant="outline" className="text-[10px] font-mono">Live Immutable Log</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                        <th className="p-3.5 pl-6">Timestamp</th>
                        <th className="p-3.5">Action</th>
                        <th className="p-3.5">Target Resource</th>
                        <th className="p-3.5">Admin Account</th>
                        <th className="p-3.5">IP Address</th>
                        <th className="p-3.5 pr-6 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3.5 pl-6 font-mono text-muted-foreground text-[11px]">{log.timestamp}</td>
                          <td className="p-3.5 font-bold text-foreground">{log.action}</td>
                          <td className="p-3.5 text-sky-600 font-semibold">{log.targetName}</td>
                          <td className="p-3.5 text-muted-foreground">{log.adminName}</td>
                          <td className="p-3.5 font-mono text-muted-foreground text-[11px]">{log.ipAddress}</td>
                          <td className="p-3.5 pr-6 text-right">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                              Success
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════
              17. 🗺️ TERRITORY ADMIN (MUNICIPAL JURISDICTION COMMAND)
             ════════════════════════════════════════════════════════════════ */}
          {activeNav === "territory" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h1 className="text-xl font-black text-foreground flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-500" />
                  {selectedCity} — Municipal Jurisdiction & Territory Command
                </h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Official municipal boundaries, sub-city administrative allocation, and national hierarchy liaison.
                </p>
              </div>

              {renderSubnavTabs([
                { key: "jurisdiction", label: "Municipal Boundaries" },
                { key: "subcities", label: "Sub-City Allocation" },
                { key: "escalation", label: "National Hierarchy" },
              ])}

              {/* Territory Profile Card */}
              <div className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{countryEntry?.flag || "🌍"}</span>
                      <h2 className="text-lg font-black text-foreground">
                        {selectedCity} Municipal Administrative Territory
                      </h2>
                      <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/30 text-[10px] font-bold">
                        Lead City Admin
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-2xl">
                      Official administrative authority covering {activeSubcitiesList.length} sub-cities in {selectedCountry}. Responsible for storefront certification and consumer safety within city limits.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/60 text-xs space-y-1">
                    <div className="font-bold text-foreground">National Lead Admin:</div>
                    <div className="text-indigo-600 font-semibold">Mastwal ({selectedCountry} Country Lead)</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-border">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-semibold">MUNICIPAL STATUS</span>
                    <div className="font-bold text-emerald-500 text-sm">Active & Verified</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-semibold">SUB-CITIES MANAGED</span>
                    <div className="font-bold text-foreground text-sm">{activeSubcitiesList.length} Divisions</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-semibold">REGISTERED LISTINGS</span>
                    <div className="font-bold text-foreground text-sm">{stats.totalBusinesses} Establishments</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-semibold">VERIFICATION RATIO</span>
                    <div className="font-bold text-emerald-500 text-sm">
                      {Math.round((stats.verifiedBusinesses / Math.max(1, stats.totalBusinesses)) * 100)}% Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* Sub-City Allocation Table */}
              <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">Sub-City Governance Allocation</span>
                  <Badge variant="outline" className="text-[10px]">{activeSubcitiesList.length} Units</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                        <th className="p-3.5 pl-6">Sub-City Unit</th>
                        <th className="p-3.5">Commercial Focus</th>
                        <th className="p-3.5">Supervisory Status</th>
                        <th className="p-3.5 pr-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 font-medium">
                      {activeSubcitiesList.map((sc) => (
                        <tr key={sc.name} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3.5 pl-6 font-bold text-foreground flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-sky-500" />
                            <span>{sc.name}</span>
                          </td>
                          <td className="p-3.5 text-muted-foreground">{sc.commercialFocus || "Urban Commercial"}</td>
                          <td className="p-3.5">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                              Designated & Active
                            </Badge>
                          </td>
                          <td className="p-3.5 pr-6 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setSelectedSubcityFilter(sc.name);
                                setActiveNav("businesses");
                                setActiveSubnav("all");
                              }}
                              className="h-7 text-xs font-bold text-sky-600 hover:bg-sky-500/10"
                            >
                              Manage Listings →
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ════════════════════════════════════════════════════════════════════
          MODALS & DRAWERS
         ════════════════════════════════════════════════════════════════════ */}

      {/* MODAL: INSPECT BUSINESS STOREFRONT DETAILS */}
      {inspectBusiness && (
        <Dialog open={Boolean(inspectBusiness)} onOpenChange={() => setInspectBusiness(null)}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-sky-500" />
              <span>{inspectBusiness.name}</span>
              {inspectBusiness.isVerified && (
                <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">Verified</Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Municipal storefront inspection record for {selectedCity}, {selectedCountry}.
            </DialogDescription>

            <div className="space-y-4 mt-4 text-xs">
              {(inspectBusiness.coverUrl || inspectBusiness.logoUrl) && (
                <div className="h-44 w-full rounded-2xl overflow-hidden bg-muted border border-border">
                  <img src={inspectBusiness.coverUrl || inspectBusiness.logoUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Sub-City & District</span>
                  <div className="font-bold text-foreground">
                    {inspectBusiness.districtName || (inspectBusiness as any).subcityId || "Central Zone"}
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Category</span>
                  <div className="font-bold text-foreground">{inspectBusiness.categoryName || "General"}</div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Phone Contact</span>
                  <div className="font-bold text-foreground">{inspectBusiness.telephone || inspectBusiness.mobile || "Not provided"}</div>
                </div>
                <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Address Line</span>
                  <div className="font-bold text-foreground truncate">{inspectBusiness.addressLine || `${selectedCity}, ${selectedCountry}`}</div>
                </div>
              </div>

              {inspectBusiness.description && (
                <div className="p-3 rounded-2xl bg-muted/30 border border-border/60">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">
                    Storefront Description
                  </span>
                  <p className="text-foreground leading-relaxed">{inspectBusiness.description}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setInspectBusiness(null)}>
                  Close
                </Button>
                {!inspectBusiness.isVerified && (
                  <Button
                    size="sm"
                    onClick={() => {
                      handleApproveBusiness(inspectBusiness);
                      setInspectBusiness(null);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Approve Listing
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: REJECTION / REMEDIATION NOTICE */}
      {rejectionModalBiz && (
        <Dialog open={Boolean(rejectionModalBiz)} onOpenChange={() => setRejectionModalBiz(null)}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              Reject / Request Remediation: {rejectionModalBiz.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provide formal municipal rationale to notify the listing submitter.
            </DialogDescription>

            <div className="space-y-3 mt-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Select Primary Municipal Rationale:</label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl p-2 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="Inaccurate Physical Address / Storefront Details">
                    Inaccurate Physical Address / Storefront Details
                  </option>
                  <option value="Incomplete or Invalid Business License / TIN">
                    Incomplete or Invalid Business License / TIN
                  </option>
                  <option value="Prohibited or Restricted Commercial Activity">
                    Prohibited or Restricted Commercial Activity
                  </option>
                  <option value="Duplicate Business Entry Detected in City">
                    Duplicate Business Entry Detected in City
                  </option>
                  <option value="Unreachable Contact Phone / Invalid Manager">
                    Unreachable Contact Phone / Invalid Manager
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Remediation Instructions for Owner:</label>
                <Textarea
                  placeholder="e.g. Please provide your physical storefront entrance photo and updated sub-city lease agreement..."
                  value={rejectionNotes}
                  onChange={(e) => setRejectionNotes(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setRejectionModalBiz(null)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleConfirmRejection}
                  className="font-bold"
                >
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: ADD SUB-CITY OR COMMERCIAL ZONE */}
      {isAddDistrictModalOpen && (
        <Dialog open={isAddDistrictModalOpen} onOpenChange={setIsAddDistrictModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-5 h-5 text-sky-500" />
              Add Sub-City / Commercial Zone to {selectedCity}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Register a new administrative division or commercial corridor in {selectedCity}, {selectedCountry}.
            </DialogDescription>

            <div className="space-y-3 mt-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Division Name:</label>
                <Input
                  placeholder="e.g. Bole Medhanialem Corridor, Arada Piazza..."
                  value={newDistrictName}
                  onChange={(e) => setNewDistrictName(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Type:</label>
                <select
                  value={newDistrictType}
                  onChange={(e) => setNewDistrictType(e.target.value)}
                  className="w-full bg-card border border-border rounded-xl p-2 text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="subcity">Sub-City (Administrative)</option>
                  <option value="district">Commercial District</option>
                  <option value="zone">Industrial / Logistics Zone</option>
                  <option value="corridor">Commercial Street / Corridor</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Commercial Focus / Description:</label>
                <Input
                  placeholder="e.g. Financial Headquarters, Tech Hub, Hospitality Corridor..."
                  value={newDistrictFocus}
                  onChange={(e) => setNewDistrictFocus(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsAddDistrictModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleCreateDistrict} className="font-bold bg-primary text-primary-foreground">
                  Create Zone
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: COMPOSE CITY BULLETIN */}
      {isBroadcastModalOpen && (
        <Dialog open={isBroadcastModalOpen} onOpenChange={setIsBroadcastModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-sky-500" />
              Broadcast Municipal Notice: {selectedCity}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Send an official city alert to local business owners and citizen accounts.
            </DialogDescription>

            <div className="space-y-3 mt-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Notice Title:</label>
                <Input
                  placeholder="e.g. Municipal Business License Renewal Deadline"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Target Audience:</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value as any)}
                    className="w-full bg-card border border-border rounded-xl p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="business">Business Owners Only</option>
                    <option value="user">Citizens & Customers</option>
                    <option value="global">Entire City (All Accounts)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-foreground">Priority:</label>
                  <select
                    value={broadcastPriority}
                    onChange={(e) => setBroadcastPriority(e.target.value as any)}
                    className="w-full bg-card border border-border rounded-xl p-2 text-xs font-semibold focus:outline-none"
                  >
                    <option value="medium">Normal / Standard</option>
                    <option value="high">High / Urgent</option>
                    <option value="low">Informational / Low</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Announcement Content:</label>
                <Textarea
                  placeholder="Write official municipal directive or notice here..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsBroadcastModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendBroadcast}
                  className="font-bold bg-sky-600 hover:bg-sky-700 text-white"
                >
                  Send Announcement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: ESCALATE TO COUNTRY MAIN ADMIN */}
      {isEscalateModalOpen && (
        <Dialog open={isEscalateModalOpen} onOpenChange={setIsEscalateModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-indigo-600">
              <Globe className="w-5 h-5 text-indigo-600" />
              Escalate to {selectedCountry} Country Main Admin
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Formal escalation ticket directly sent to national administration lead.
            </DialogDescription>

            <div className="space-y-3 mt-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Subject:</label>
                <Input
                  placeholder="e.g. Cross-district trademark conflict, National category petition..."
                  value={escalateSubject}
                  onChange={(e) => setEscalateSubject(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Escalation Rationale & Details:</label>
                <Textarea
                  placeholder="Provide background, legal citations, or commercial impact..."
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  rows={4}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsEscalateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSendEscalation}
                  className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Submit Escalation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: INSPECT CLAIM & TRADE LICENSE */}
      {inspectClaim && (
        <Dialog open={Boolean(inspectClaim)} onOpenChange={() => setInspectClaim(null)}>
          <DialogContent className="max-w-lg rounded-3xl p-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-500" />
              Inspect Ownership Claim: {inspectClaim.businessName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Verify trade license and applicant authorization.
            </DialogDescription>

            <div className="space-y-4 mt-3 text-xs">
              {inspectClaim.proofDocumentUrl && (
                <div className="h-44 w-full rounded-2xl overflow-hidden bg-muted border border-border">
                  <img src={inspectClaim.proofDocumentUrl} alt="Trade License Document" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-3 rounded-2xl bg-muted/40 space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Applicant Name:</span>
                  <span>{inspectClaim.userName}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Declared Role:</span>
                  <span className="font-semibold text-foreground">{inspectClaim.businessRole}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Phone:</span>
                  <span>{inspectClaim.userPhone}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Email:</span>
                  <span>{inspectClaim.userEmail}</span>
                </div>
              </div>

              {inspectClaim.notes && (
                <div className="p-3 rounded-2xl bg-muted/20 border border-border/60">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">
                    Applicant Statement:
                  </span>
                  <p className="text-foreground">{inspectClaim.notes}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setInspectClaim(null)}>
                  Close
                </Button>
                {inspectClaim.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRejectClaim(inspectClaim)}
                    >
                      Reject Claim
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleApproveClaim(inspectClaim)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      Approve Ownership
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: MEDIA LIGHTBOX */}
      {lightboxMedia && (
        <MediaLightboxModal
          isOpen={Boolean(lightboxMedia)}
          onClose={() => setLightboxMedia(null)}
          media={lightboxMedia}
        />
      )}

      {/* MODAL: ADD MUNICIPAL MEDIA ASSET */}
      {isAddMediaModalOpen && (
        <Dialog open={isAddMediaModalOpen} onOpenChange={setIsAddMediaModalOpen}>
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Camera className="w-5 h-5 text-pink-500" />
              Register Storefront Asset in {selectedCity}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a verified photo, brand logo, or video showcase for a local establishment.
            </DialogDescription>

            <div className="space-y-3 mt-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-foreground">Asset Title:</label>
                <Input
                  placeholder="e.g. Front Entrance & Signage"
                  value={newMediaTitle}
                  onChange={(e) => setNewMediaTitle(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Associated Business Name:</label>
                <Input
                  placeholder="e.g. Tomoca Coffee (Bole)"
                  value={newMediaBiz}
                  onChange={(e) => setNewMediaBiz(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Asset Type:</label>
                <select
                  value={newMediaType}
                  onChange={(e) => setNewMediaType(e.target.value as any)}
                  className="w-full bg-card border border-border rounded-xl p-2 text-xs font-semibold focus:outline-none"
                >
                  <option value="Photo">Storefront Photo</option>
                  <option value="Logo">Business Logo</option>
                  <option value="Video">Video Link</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Image or Video URL:</label>
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => setIsAddMediaModalOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleAddMedia} className="font-bold bg-pink-600 hover:bg-pink-700 text-white">
                  Register Asset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: ADD CAMPAIGN */}
      <AddCampaignModal
        isOpen={isAddCampaignModalOpen}
        onClose={() => setIsAddCampaignModalOpen(false)}
        onAddCampaign={(newCamp) => {
          setCampaignsList((prev) => [newCamp, ...prev]);
          setIsAddCampaignModalOpen(false);
          toast.success(`Created sponsored campaign "${newCamp.name}" for ${selectedCity}!`);
        }}
      />

      {/* MODAL: REGISTER PAYMENT */}
      <RegisterPaymentModal
        isOpen={isRegisterPaymentModalOpen}
        onClose={() => setIsRegisterPaymentModalOpen(false)}
        onPaymentRegistered={(p) => {
          setCityPayments((prev) => [p, ...prev]);
          setIsRegisterPaymentModalOpen(false);
          toast.success(`Payment of ${p.amount} ${p.currency} recorded for ${p.businessName}!`);
        }}
        businessesList={businesses.map((b) => ({ id: b.id, name: b.name }))}
        currentAdminName={`${selectedCity} Municipal Admin`}
      />

      {/* MODAL: PAYMENT RECEIPT */}
      {inspectReceiptPayment && (
        <PaymentReceiptModal
          payment={inspectReceiptPayment}
          isOpen={Boolean(inspectReceiptPayment)}
          onClose={() => setInspectReceiptPayment(null)}
          onStatusUpdated={(id, newStatus) => {
            setCityPayments((prev) =>
              prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
            );
            toast.success("Transaction status updated.");
          }}
        />
      )}

      {/* MODAL: SUPPORT TICKET DETAILS & REPLY */}
      {inspectTicket && (
        <Dialog open={Boolean(inspectTicket)} onOpenChange={() => setInspectTicket(null)}>
          <DialogContent className="max-w-lg rounded-3xl p-6">
            <DialogTitle className="text-base font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ticket className="w-5 h-5 text-cyan-500" />
                <span>{inspectTicket.ticketNumber}</span>
              </div>
              <Badge
                className={
                  inspectTicket.status === "open"
                    ? "bg-sky-500/10 text-sky-600 border border-sky-500/30 text-[10px]"
                    : inspectTicket.status === "in_progress"
                    ? "bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px]"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px]"
                }
              >
                {inspectTicket.status.toUpperCase()}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {inspectTicket.businessName} • Submitted by {inspectTicket.userName} ({inspectTicket.userEmail})
            </DialogDescription>

            <div className="space-y-4 mt-3 text-xs">
              <div className="p-3 rounded-2xl bg-muted/40 space-y-1">
                <div className="font-bold text-foreground text-sm">{inspectTicket.subject}</div>
                <p className="text-muted-foreground">{inspectTicket.description}</p>
              </div>

              {/* Messages Thread */}
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 rounded-2xl bg-muted/20 border border-border/50">
                {inspectTicket.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl ${
                      m.senderRole === "admin"
                        ? "bg-sky-500/10 text-sky-950 dark:text-sky-100 ml-4 border border-sky-500/20"
                        : "bg-muted text-foreground mr-4"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold opacity-75 mb-1">
                      <span>{m.sender}</span>
                      <span>{m.timestamp}</span>
                    </div>
                    <p>{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Reply Box */}
              <div className="space-y-1.5">
                <label className="font-bold text-foreground text-xs">Municipal Response / Directive:</label>
                <Textarea
                  placeholder="Type municipal resolution or instructions for the merchant..."
                  value={ticketReplyText}
                  onChange={(e) => setTicketReplyText(e.target.value)}
                  rows={3}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  {inspectTicket.status !== "resolved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSupportTickets((prev) =>
                          prev.map((t) => (t.id === inspectTicket.id ? { ...t, status: "resolved" } : t))
                        );
                        setInspectTicket((prev) => (prev ? { ...prev, status: "resolved" } : null));
                        toast.success("Ticket marked as resolved!");
                      }}
                      className="text-xs font-bold text-emerald-600 border-emerald-500/30"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setInspectTicket(null)}>
                    Close
                  </Button>
                  <Button size="sm" onClick={handleReplyTicket} className="font-bold bg-sky-600 hover:bg-sky-700 text-white">
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
