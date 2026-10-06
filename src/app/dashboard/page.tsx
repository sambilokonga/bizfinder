"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Eye,
  Phone,
  Navigation,
  Star,
  PlusCircle,
  Edit,
  Edit2,
  Trash2,
  Copy,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Send,
  SlidersHorizontal,
  BarChart3,
  MousePointerClick,
  Layers,
  ChevronRight,
  ChevronDown,
  Crown,
  Building2,
  MapPin,
  Globe,
  Mail,
  DollarSign,
  Calendar,
  CalendarClock,
  Tag,
  Gift,
  Ticket,
  FileText,
  CreditCard,
  Bell,
  HelpCircle,
  Lock,
  Search,
  Check,
  X,
  Upload,
  Camera,
  Film,
  UserCheck,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Archive,
  Download,
  Flag,
  Loader2,
  Printer,
  Shield,
  Smartphone,
  Key,
  Inbox,
  Power,
  Play,
  Pause,
  Percent,
  ChevronLeft,
  FolderTree,
  Plus,
  Megaphone,
  QrCode,
  Share2,
  Receipt,
  Volume2,
  VolumeX,
  CheckCheck,
  BellRing,
  BookOpen,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SEED_BUSINESSES, SEED_REVIEWS } from "@/lib/db/seed-data/businesses";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Business, BusinessStatus, BusinessMedia, OpeningHourSlot, BusinessServiceItem, BusinessAttributes, PriceTier } from "@/types/business";
import { Review } from "@/types/review";
import { getLiveOpeningStatus, getFormattedWeekSchedule } from "@/lib/utils/opening-hours";
import { ListingEditorModal } from "@/components/dashboard/ListingEditorModal";
import { MediaUploaderModal } from "@/components/dashboard/MediaUploaderModal";
import { MediaLightboxModal } from "@/components/media/MediaLightboxModal";
import { HoursEditorModal } from "@/components/dashboard/HoursEditorModal";
import { extractYoutubeVideoId, isYoutubeUrl, getYoutubeThumbnail } from "@/lib/utils/youtube";
import { AddCategoryModal } from "@/components/admin/AddCategoryModal";
import { EditCategoryModal } from "@/components/admin/EditCategoryModal";
import { AddReviewModal } from "@/components/admin/AddReviewModal";
import { Category } from "@/types/category";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { toast } from "sonner";
import { SORTED_COUNTRIES } from "@/lib/data/countries-regions";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { exportUsersToCSV, exportUsersToJSON } from "@/lib/utils/export-users";
import { exportBusinessesToCSV, exportBusinessesToJSON } from "@/lib/utils/export-businesses";
import { getSubcitiesForCity } from "@/lib/data/subcities-database";
import { useUser } from "@clerk/nextjs";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";
import {
  useNotifications,
  playNotificationSound,
  requestDesktopNotificationPermission,
  showDesktopNotification,
} from "@/hooks/useNotifications";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { RegisterAnalyticsModal } from "@/components/admin/RegisterAnalyticsModal";
import { IAnalyticsEvent, AnalyticsStats } from "@/types/analytics";
import { RegisterReportModal } from "@/components/admin/RegisterReportModal";
import { ReportDetailModal } from "@/components/admin/ReportDetailModal";
import { IReport, ReportStats } from "@/types/report";
import { RegisterNotificationModal } from "@/components/admin/RegisterNotificationModal";
import { NotificationDetailModal } from "@/components/admin/NotificationDetailModal";
import { INotification, NotificationStats } from "@/types/notification";
import { ISupportTicket, TicketStats, TicketCategory, TicketStatus } from "@/types/ticket";
import { SupportTicketDetailModal } from "@/components/support/SupportTicketDetailModal";
import { CreateSupportTicketModal } from "@/components/support/CreateSupportTicketModal";
import { SupportKnowledgeBase } from "@/components/support/SupportKnowledgeBase";
import { DashboardSettingsView } from "@/components/dashboard/DashboardSettingsView";
import { BillingPlansView } from "@/components/dashboard/BillingPlansView";
import { EmbeddedListingWizard } from "@/components/dashboard/EmbeddedListingWizard";
import { SecurityWorkstation } from "@/components/security/SecurityWorkstation";
import { RegisterMediaModal } from "@/components/media/RegisterMediaModal";
import { BusinessAuditStatusCard } from "@/components/business/BusinessAuditStatusCard";
import { buildRealShowcaseMedia } from "@/lib/data/real-media-showcase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";


async function parseResponseJson<T = any>(res: Response): Promise<T | null> {
  try {
    if (!res.ok) return null;
    const ct = res.headers.get("content-type");
    if (!ct || !ct.includes("application/json")) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface BranchLocation {
  id: string;
  branchName: string;
  country: string;
  city: string;
  district: string;
  addressLine: string;
  phone: string;
  status: "Active" | "Inactive";
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  stock: number;
  status: "Available" | "Out of Stock" | "Low Stock";
  sku: string;
}

export interface OfferItem {
  id: string;
  title: string;
  code: string;
  type: "Percentage" | "Fixed Amount" | "BOGO" | "Weekend Special";
  discountValue: string;
  validFrom: string;
  validTo: string;
  status: "Active" | "Scheduled" | "Expired";
  usageCount: number;
  description?: string;
  minOrderValue?: string;
  usageLimit?: string | number | null;
  targetAudience?: string;
  isHighlighted?: boolean;
}

export interface RedemptionRecord {
  id: string;
  offerId: string;
  offerTitle: string;
  code: string;
  discountValue: string;
  customerName: string;
  branchName: string;
  orderTotal?: string;
  discountApplied?: string;
  redeemedAt: string;
}


export interface OwnerAdCampaign {
  id: string;
  name: string;
  businessName: string;
  budget: number;
  currency: string;
  impressions: number;
  clicks: number;
  status: "Active" | "Paused" | "Completed";
  startDate: string;
  endDate: string;
  placement: string;
  totalSpentETB?: number;
  durationDays?: number;
  targetLocation?: string;
}

export interface OwnerInvoice {
  id: string;
  txId: string;
  amount: number;
  currency: string;
  type: "Subscription" | "Advertising" | "Boost";
  status: "Paid" | "Pending" | "Refunded";
  date: string;
  billingMethod: string;
}

export interface CustomerMessage {
  id: string;
  customerName: string;
  customerAvatar: string;
  subject: string;
  preview: string;
  timestamp: string;
  status: "unread" | "read" | "archived";
  thread: { sender: "customer" | "owner"; text: string; time: string }[];
}

export interface OwnerSupportTicket {
  id: string;
  subject: string;
  category: "Billing" | "Verification" | "Listing Help" | "Bug Report" | "Other";
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed";
  createdDate: string;
  lastReply: string;
  messages: { sender: string; text: string; time: string }[];
}

export interface OwnerNotification {
  id: string;
  title: string;
  description: string;
  type: "approval" | "review" | "message" | "billing" | "system";
  time: string;
  read: boolean;
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────

const INITIAL_BRANCHES: BranchLocation[] = [
  {
    id: "br-1",
    branchName: "Main Flagship Branch",
    country: "Ethiopia",
    city: "Addis Ababa",
    district: "Bole",
    addressLine: "Cameroon St, Near Edna Mall",
    phone: "+251 11 661 2345",
    status: "Active",
  },
  {
    id: "br-2",
    branchName: "Kazanchis Branch",
    country: "Ethiopia",
    city: "Addis Ababa",
    district: "Kirkos",
    addressLine: "Tito St, Beside UNECA",
    phone: "+251 11 551 8900",
    status: "Active",
  },
  {
    id: "br-3",
    branchName: "Westlands Branch",
    country: "Kenya",
    city: "Nairobi",
    district: "Westlands",
    addressLine: "Mpaka Rd, Woodvale Grove",
    phone: "+254 20 444 7890",
    status: "Active",
  },
];

const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: "prod-1",
    name: "Yirgacheffe Single Origin Beans (250g)",
    category: "Coffee & Beans",
    price: 450,
    currency: "ETB",
    stock: 85,
    status: "Available",
    sku: "YIRG-250",
  },
  {
    id: "prod-2",
    name: "Sidama Roast Signature Blend (500g)",
    category: "Coffee & Beans",
    price: 820,
    currency: "ETB",
    stock: 12,
    status: "Low Stock",
    sku: "SIDA-500",
  },
  {
    id: "prod-3",
    name: "Traditional Clay Jebena Gift Set",
    category: "Accessories",
    price: 1200,
    currency: "ETB",
    stock: 0,
    status: "Out of Stock",
    sku: "JEB-SET",
  },
  {
    id: "prod-4",
    name: "Organic Honey Ginger Pastry",
    category: "Bakery",
    price: 180,
    currency: "ETB",
    stock: 40,
    status: "Available",
    sku: "HON-PST",
  },
];

const INITIAL_OFFERS: OfferItem[] = [
  {
    id: "off-1",
    title: "50% OFF Weekend Special",
    code: "WEEKEND50",
    type: "Percentage",
    discountValue: "50%",
    validFrom: "2026-09-01",
    validTo: "2026-09-30",
    status: "Active",
    usageCount: 142,
    description: "Enjoy half price on all signature hot coffees and desserts every Saturday and Sunday.",
    minOrderValue: "300 ETB",
    usageLimit: "500",
    targetAudience: "All Customers",
    isHighlighted: true,
  },
  {
    id: "off-2",
    title: "Buy 1 Get 1 Free Pastry Combo",
    code: "BOGOPAST",
    type: "BOGO",
    discountValue: "Free 2nd Item",
    validFrom: "2026-09-01",
    validTo: "2026-09-25",
    status: "Active",
    usageCount: 78,
    description: "Purchase any fresh croissant or danish pastry and get the second one completely free.",
    minOrderValue: "150 ETB",
    usageLimit: "250",
    targetAudience: "Returning Customers",
    isHighlighted: false,
  },
  {
    id: "off-3",
    title: "New Customer 100 ETB Welcome Voucher",
    code: "WELCOME100",
    type: "Fixed Amount",
    discountValue: "100 ETB",
    validFrom: "2026-08-01",
    validTo: "2026-10-31",
    status: "Active",
    usageCount: 320,
    description: "First time at our branch? Claim an instant 100 ETB discount on your first table or takeout order.",
    minOrderValue: "400 ETB",
    usageLimit: "1000",
    targetAudience: "New Customers Only",
    isHighlighted: true,
  },
  {
    id: "off-4",
    title: "Friday Evening Happy Hour 25% Off",
    code: "HAPPYFRIDAY",
    type: "Weekend Special",
    discountValue: "25%",
    validFrom: "2026-08-15",
    validTo: "2026-09-05",
    status: "Expired",
    usageCount: 95,
    description: "Special after-work lounge discount valid between 5:00 PM and 8:00 PM.",
    minOrderValue: "500 ETB",
    usageLimit: "100",
    targetAudience: "All Customers",
    isHighlighted: false,
  },
];

const INITIAL_REDEMPTIONS: RedemptionRecord[] = [
  {
    id: "red-1",
    offerId: "off-1",
    offerTitle: "50% OFF Weekend Special",
    code: "WEEKEND50",
    discountValue: "50%",
    customerName: "Bethlehem T.",
    branchName: "Bole Medhanialem Branch",
    orderTotal: "1,200 ETB",
    discountApplied: "600 ETB",
    redeemedAt: "12 mins ago",
  },
  {
    id: "red-2",
    offerId: "off-2",
    offerTitle: "Buy 1 Get 1 Free Pastry Combo",
    code: "BOGOPAST",
    discountValue: "Free 2nd Item",
    customerName: "Dawit M.",
    branchName: "Sarbet Branch",
    orderTotal: "480 ETB",
    discountApplied: "240 ETB",
    redeemedAt: "45 mins ago",
  },
  {
    id: "red-3",
    offerId: "off-3",
    offerTitle: "New Customer 100 ETB Welcome Voucher",
    code: "WELCOME100",
    discountValue: "100 ETB",
    customerName: "Natnael K.",
    branchName: "Kazanchis Branch",
    orderTotal: "850 ETB",
    discountApplied: "100 ETB",
    redeemedAt: "2 hours ago",
  },
  {
    id: "red-4",
    offerId: "off-1",
    offerTitle: "50% OFF Weekend Special",
    code: "WEEKEND50",
    discountValue: "50%",
    customerName: "Almaz H.",
    branchName: "Bole Medhanialem Branch",
    orderTotal: "1,800 ETB",
    discountApplied: "900 ETB",
    redeemedAt: "Yesterday",
  },
];

const INITIAL_CAMPAIGNS: OwnerAdCampaign[] = [
  {
    id: "camp-1",
    name: "Summer City Spotlight",
    businessName: "Abyssinia Gourmet Cafe",
    budget: 1500,
    currency: "ETB",
    impressions: 18450,
    clicks: 1120,
    status: "Active",
    startDate: "2026-08-20",
    endDate: "2026-09-20",
    placement: "Top Search Banner",
  },
  {
    id: "camp-2",
    name: "Near Me GPS Boost",
    businessName: "Abyssinia Gourmet Cafe",
    budget: 800,
    currency: "ETB",
    impressions: 9200,
    clicks: 640,
    status: "Active",
    startDate: "2026-08-25",
    endDate: "2026-09-10",
    placement: "Map Spotlight Pin",
  },
];

const INITIAL_INVOICES: OwnerInvoice[] = [
  {
    id: "INV-2026-089",
    txId: "TX-99882",
    amount: 1499,
    currency: "ETB",
    type: "Subscription",
    status: "Paid",
    date: "2026-08-28",
    billingMethod: "Telebirr (**** 4892)",
  },
  {
    id: "INV-2026-081",
    txId: "TX-99411",
    amount: 1500,
    currency: "ETB",
    type: "Advertising",
    status: "Paid",
    date: "2026-08-20",
    billingMethod: "CBE Birr (**** 1120)",
  },
  {
    id: "INV-2026-074",
    txId: "TX-98745",
    amount: 1499,
    currency: "ETB",
    type: "Subscription",
    status: "Paid",
    date: "2026-07-28",
    billingMethod: "Telebirr (**** 4892)",
  },
];

const INITIAL_MESSAGES: CustomerMessage[] = [
  {
    id: "msg-1",
    customerName: "John Dawit",
    customerAvatar: "J",
    subject: "Table Reservation for 6 People",
    preview: "Are you open this evening for dinner reservation around 7:30 PM?",
    timestamp: "10 mins ago",
    status: "unread",
    thread: [
      {
        sender: "customer",
        text: "Hello! Are you open this evening for dinner reservation around 7:30 PM? We have a group of 6.",
        time: "10:15 AM",
      },
    ],
  },
  {
    id: "msg-2",
    customerName: "Sara Alemayehu",
    customerAvatar: "S",
    subject: "Catering Inquiry for Corporate Event",
    preview: "Could you send over the custom coffee & pastry catering menu?",
    timestamp: "2 hours ago",
    status: "read",
    thread: [
      {
        sender: "customer",
        text: "Hi! Could you send over the custom coffee & pastry catering menu for next Friday?",
        time: "08:30 AM",
      },
      {
        sender: "owner",
        text: "Hi Sara! Absolutely, I have sent our full corporate PDF menu to your email. Feel free to WhatsApp us for instant booking.",
        time: "09:00 AM",
      },
    ],
  },
  {
    id: "msg-3",
    customerName: "Michael Kiptoo",
    customerAvatar: "M",
    subject: "Delivery to Kazanchis",
    preview: "Do you offer door delivery for bulk whole bean packages?",
    timestamp: "Yesterday",
    status: "read",
    thread: [
      {
        sender: "customer",
        text: "Hello! Do you offer door delivery for bulk whole bean packages in Kazanchis?",
        time: "Yesterday, 3:20 PM",
      },
    ],
  },
];

const INITIAL_TICKETS: OwnerSupportTicket[] = [
  {
    id: "TCK-8821",
    subject: "Request to update verified tax ID number",
    category: "Verification",
    priority: "Medium",
    status: "In Progress",
    createdDate: "2026-08-29",
    lastReply: "Platform Support: Reviewing updated TIN certificate.",
    messages: [
      { sender: "owner", text: "We recently renewed our municipal trade license and have updated our official TIN document.", time: "Aug 29, 10:00 AM" },
      { sender: "Platform Support", text: "Thank you! Our compliance team is verifying the document and will confirm within 24 hours.", time: "Aug 29, 11:30 AM" },
    ],
  },
  {
    id: "TCK-8740",
    subject: "Question about telebirr QR invoice payout schedule",
    category: "Billing",
    priority: "Low",
    status: "Resolved",
    createdDate: "2026-08-25",
    lastReply: "Support: Payout cycle verified every Tuesday.",
    messages: [
      { sender: "owner", text: "Could you clarify when QR code payments settle to our primary bank account?", time: "Aug 25, 02:15 PM" },
      { sender: "Platform Support", text: "Telebirr settlements are automatically cleared and deposited weekly every Tuesday morning.", time: "Aug 25, 03:00 PM" },
    ],
  },
];

const INITIAL_NOTIFICATIONS: OwnerNotification[] = [
  {
    id: "notif-1",
    title: "🎉 Business Verification Approved",
    description: "Abyssinia Gourmet Cafe is now 100% verified with a verified badge.",
    type: "approval",
    time: "30 mins ago",
    read: false,
  },
  {
    id: "notif-2",
    title: "⭐ New 5-Star Customer Review",
    description: "Helen T. left a glowing 5-star review: 'Best traditional macchiato in Bole!'",
    type: "review",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "notif-3",
    title: "💬 New Customer Message",
    description: "John Dawit sent an inquiry regarding evening reservations.",
    type: "message",
    time: "3 hours ago",
    read: false,
  },
  {
    id: "notif-4",
    title: "💳 Subscription Renewed Successfully",
    description: "Your Pro Business Plan was renewed. Next billing date: Sep 28, 2026.",
    type: "billing",
    time: "Yesterday",
    read: true,
  },
];

// ─── Analytics Datasets ──────────────────────────────────────────────────────

const ANALYTICS_7D = [
  { day: "Mon", views: 420, calls: 32, directions: 45, clicks: 88, impressions: 1840 },
  { day: "Tue", views: 530, calls: 41, directions: 58, clicks: 110, impressions: 2150 },
  { day: "Wed", views: 610, calls: 48, directions: 64, clicks: 135, impressions: 2540 },
  { day: "Thu", views: 780, calls: 62, directions: 82, clicks: 172, impressions: 3100 },
  { day: "Fri", views: 1120, calls: 94, directions: 140, clicks: 245, impressions: 4200 },
  { day: "Sat", views: 1450, calls: 128, directions: 195, clicks: 310, impressions: 5600 },
  { day: "Sun", views: 1290, calls: 110, directions: 165, clicks: 275, impressions: 4900 },
];

const SEARCH_KEYWORDS_DATA = [
  { keyword: "best cafe near me", count: 2450, trend: "+32%" },
  { keyword: "traditional coffee bole", count: 1820, trend: "+24%" },
  { keyword: "ethiopian pastry & breakfast", count: 1250, trend: "+18%" },
  { keyword: "wifi cafe with outdoor seating", count: 940, trend: "+45%" },
  { keyword: "lunch in addis ababa", count: 820, trend: "+12%" },
  { keyword: "specialty yirgacheffe beans", count: 610, trend: "+28%" },
];

const GEO_CUSTOMERS_DATA = [
  { region: "Bole Subcity, Addis Ababa", percentage: 46, customers: "5,720" },
  { region: "Kirkos / Kazanchis, Addis", percentage: 24, customers: "2,980" },
  { region: "Yeka / CMC, Addis Ababa", percentage: 14, customers: "1,740" },
  { region: "Westlands, Nairobi (Kenya)", percentage: 10, customers: "1,240" },
  { region: "International Travelers", percentage: 6, customers: "745" },
];

const EMPTY_BUSINESS: Business = {
  id: "",
  name: "No Business Listed",
  slug: "",
  categoryId: "cat-general",
  categoryName: "General",
  description: "",
  addressLine: "No location added",
  latitude: 0,
  longitude: 0,
  status: "open",
  isVerified: false,
  isFeatured: false,
  ratingAvg: 0,
  reviewCount: 0,
  viewCount: 0,
  callCount: 0,
  directionCount: 0,
  logoUrl: "",
  coverUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
  media: [],
  openingHours: [],
  attributes: {},
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export default function OwnerDashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { currentRole } = useCurrentRole();
  const {
    notifications: liveNotifications,
    unreadCount: liveUnreadCount,
    soundEnabled,
    toggleSound,
    markAsRead: markLiveNotificationRead,
    markAsUnread: markLiveNotificationUnread,
    markAllAsRead: markAllLiveNotificationsRead,
    clearAllRead: clearAllLiveNotificationsRead,
    deleteNotification: deleteLiveNotification,
    refresh: refreshLiveNotifications,
  } = useNotifications();
  const [hasDesktopPermission, setHasDesktopPermission] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setHasDesktopPermission(Notification.permission === "granted");
    }
  }, []);

  const handleRequestDesktopPermission = async () => {
    const granted = await requestDesktopNotificationPermission();
    setHasDesktopPermission(granted);
    if (granted) {
      toast.success("Desktop notifications enabled!");
      showDesktopNotification("🔔 Notifications Enabled", "You will now receive desktop alerts for reviews, messages, and invoices.");
    } else {
      toast.info("Desktop notifications are not enabled or blocked in your browser.");
    }
  };

  // Navigation State (14 Primary Nav Modules)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<
    | "dashboard"
    | "businesses"
    | "management"
    | "media"
    | "reviews"
    | "customers"
    | "analytics"
    | "advertising"
    | "billing"
    | "promotions"
    | "messages"
    | "notifications"
    | "support"
    | "moderation"
    | "settings"
    | "security"
  >("dashboard");


  const [activeSubnav, setActiveSubnav] = useState<string>("all");

  // Businesses State & 20-Per-Page Pagination
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business>(EMPTY_BUSINESS);
  const [bizPage, setBizPage] = useState<number>(1);
  const [bizTotalPages, setBizTotalPages] = useState<number>(1);
  const [bizTotalCount, setBizTotalCount] = useState<number>(0);
  const [isBizLoading, setIsBizLoading] = useState<boolean>(false);
  const [bizSearch, setBizSearch] = useState<string>("");
  const [bizStatusFilter, setBizStatusFilter] = useState<string>("all");
  const [bizSort, setBizSort] = useState<string>("newest");
  const [bizViewMode, setBizViewMode] = useState<"table" | "grid">("table");
  const [portfolioScope, setPortfolioScope] = useState<"my" | "corporate">("my");
  const [businessToDelete, setBusinessToDelete] = useState<Business | null>(null);
  const [isDeletingBiz, setIsDeletingBiz] = useState<boolean>(false);
  // (wizard state moved to EmbeddedListingWizard component)

  // Reviews State & 20-Per-Page Pagination
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewPage, setReviewPage] = useState<number>(1);
  const [reviewTotalPages, setReviewTotalPages] = useState<number>(1);
  const [reviewTotalCount, setReviewTotalCount] = useState<number>(0);
  const [isReviewsLoading, setIsReviewsLoading] = useState<boolean>(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState<boolean>(false);
  const [reviewCounts, setReviewCounts] = useState<{
    all: number;
    replies: number;
    pending: number;
  }>({ all: 0, replies: 0, pending: 0 });

  // ─── Customers / Users State & 20-Per-Page Pagination ─────────────────────
  const [customersList, setCustomersList] = useState<any[]>([]);
  const [customersPage, setCustomersPage] = useState<number>(1);
  const [customersTotalPages, setCustomersTotalPages] = useState<number>(1);
  const [customersTotalCount, setCustomersTotalCount] = useState<number>(0);
  const [isCustomersLoading, setIsCustomersLoading] = useState<boolean>(false);
  const [customersSearch, setCustomersSearch] = useState<string>("");
  const [customerFilterCountry, setCustomerFilterCountry] = useState<string>("all");
  const [customerFilterCity, setCustomerFilterCity] = useState<string>("all");
  const [isExportingCustomers, setIsExportingCustomers] = useState<boolean>(false);
  const CUSTOMERS_PER_PAGE = 20;

  const customerFilterCities = useMemo(() => {
    if (!customerFilterCountry || customerFilterCountry === "all") return [];
    return getCitiesForCountry(customerFilterCountry);
  }, [customerFilterCountry]);

  const fetchCustomers = async (page = customersPage) => {
    setIsCustomersLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(CUSTOMERS_PER_PAGE));
      if (customersSearch.trim()) params.set("search", customersSearch.trim());
      if (customerFilterCountry !== "all") params.set("country", customerFilterCountry);
      if (customerFilterCity !== "all") params.set("city", customerFilterCity);
      const res = await fetch(`/api/users/all?${params.toString()}`);
      const data = await parseResponseJson(res);
      if (!data) return;
      if (Array.isArray(data.users)) {
        setCustomersList(data.users);
        setCustomersPage(data.page ?? page);
        setCustomersTotalCount(data.total ?? data.users.length);
        setCustomersTotalPages(
          data.totalPages ?? Math.max(1, Math.ceil((data.total ?? data.users.length) / CUSTOMERS_PER_PAGE))
        );
      }
    } catch (err) {
      console.warn("[Dashboard] Failed to fetch customers:", err);
    } finally {
      setIsCustomersLoading(false);
    }
  };

  const handleExportCustomers = async (format: "csv" | "json") => {
    setIsExportingCustomers(true);
    try {
      const params = new URLSearchParams();
      params.set("export", "true");
      if (customersSearch.trim()) params.set("search", customersSearch.trim());
      if (customerFilterCountry !== "all") params.set("country", customerFilterCountry);
      if (customerFilterCity !== "all") params.set("city", customerFilterCity);
      const res = await fetch(`/api/users/all?${params.toString()}`);
      const data = await parseResponseJson(res);
      const exportList = data?.users && Array.isArray(data.users) && data.users.length > 0
        ? data.users
        : customersList;
      const fileLabel = `customers${customerFilterCountry !== "all" ? `_${customerFilterCountry}` : ""}${customerFilterCity !== "all" ? `_${customerFilterCity}` : ""}`;
      if (format === "csv") {
        exportUsersToCSV(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} users in CSV format!`);
      } else {
        exportUsersToJSON(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} users in JSON format!`);
      }
    } catch (err) {
      console.error("Export customers error:", err);
      const fileLabel = `customers${customerFilterCountry !== "all" ? `_${customerFilterCountry}` : ""}${customerFilterCity !== "all" ? `_${customerFilterCity}` : ""}`;
      if (format === "csv") exportUsersToCSV(customersList, fileLabel);
      else exportUsersToJSON(customersList, fileLabel);
      toast.success(`Downloaded ${customersList.length} users!`);
    } finally {
      setIsExportingCustomers(false);
    }
  };

  useEffect(() => {
    if (activeNav === "customers") {
      const handler = setTimeout(() => fetchCustomers(customersPage), 200);
      return () => clearTimeout(handler);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeNav, customersPage, customersSearch, customerFilterCountry, customerFilterCity]);

  const fetchDashboardReviews = async (page = reviewPage) => {
    setIsReviewsLoading(true);
    try {
      const bizParam = selectedBusiness?.id ? `&businessId=${encodeURIComponent(selectedBusiness.id)}` : "";
      let statusParam = "";
      if (activeNav === "reviews") {
        if (activeSubnav === "replies") statusParam = "&status=replies";
        else if (activeSubnav === "pending") statusParam = "&status=pending";
      }
      const res = await fetch(`/api/reviews?page=${page}&limit=20${bizParam}${statusParam}`);
      const data = await parseResponseJson(res);
      if (data?.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews);
        setReviewTotalCount(data.total ?? data.reviews.length);
        setReviewTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total ?? data.reviews.length) / 20)));
        setReviewPage(data.page ?? page);
        if (data.counts) {
          setReviewCounts({
            all: data.counts.all ?? 0,
            replies: data.counts.replies ?? 0,
            pending: data.counts.pending ?? 0,
          });
        }
      }
    } catch (err) {
      console.error("Dashboard failed to fetch reviews:", err);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  // ─── Owner Analytics State & 20-Per-Page Pagination ────────────────────────
  const [dashboardAnalytics, setDashboardAnalytics] = useState<IAnalyticsEvent[]>([]);
  const [dashboardAnalyticsPage, setDashboardAnalyticsPage] = useState<number>(1);
  const [dashboardAnalyticsTotalPages, setDashboardAnalyticsTotalPages] = useState<number>(1);
  const [dashboardAnalyticsTotalCount, setDashboardAnalyticsTotalCount] = useState<number>(0);
  const [dashboardAnalyticsStats, setDashboardAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [isDashboardAnalyticsLoading, setIsDashboardAnalyticsLoading] = useState<boolean>(false);
  const [isRegisterDashboardAnalyticsOpen, setIsRegisterDashboardAnalyticsOpen] = useState<boolean>(false);
  // Global (unfiltered) stats — used for home overview tiles and charts
  const [globalAnalyticsStats, setGlobalAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [isGlobalStatsLoading, setIsGlobalStatsLoading] = useState<boolean>(false);

  const fetchGlobalAnalyticsStats = async () => {
    if (isGlobalStatsLoading) return;
    setIsGlobalStatsLoading(true);
    try {
      const res = await fetch("/api/analytics?page=1&limit=20");
      const data = await parseResponseJson(res);
      if (data.success && data.stats) {
        setGlobalAnalyticsStats(data.stats);
        // Also seed the ledger count for the sidebar badge
        if (!dashboardAnalyticsTotalCount) {
          setDashboardAnalyticsTotalCount(data.pagination?.total || 0);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch global analytics stats:", err);
    } finally {
      setIsGlobalStatsLoading(false);
    }
  };

  const fetchDashboardAnalytics = async (page = dashboardAnalyticsPage) => {
    setIsDashboardAnalyticsLoading(true);
    try {
      const bizParam = selectedBusiness?.id ? `&businessId=${encodeURIComponent(selectedBusiness.id)}` : "";
      const res = await fetch(`/api/analytics?page=${page}&limit=20${bizParam}`);
      const data = await parseResponseJson(res);
      if (data.success && Array.isArray(data.events)) {
        setDashboardAnalytics(data.events);
        setDashboardAnalyticsPage(data.pagination?.page || page);
        setDashboardAnalyticsTotalPages(data.pagination?.totalPages || 1);
        setDashboardAnalyticsTotalCount(data.pagination?.total || 0);
        if (data.stats) setDashboardAnalyticsStats(data.stats);
      }
    } catch (err) {
      console.warn("Dashboard failed to fetch analytics:", err);
    } finally {
      setIsDashboardAnalyticsLoading(false);
    }
  };

  // Fetch global stats once on mount (powers home overview tiles & charts)
  useEffect(() => {
    fetchGlobalAnalyticsStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeNav === "analytics") {
      fetchDashboardAnalytics(dashboardAnalyticsPage);
    }
  }, [activeNav, dashboardAnalyticsPage, selectedBusiness?.id]);

  // ─── Real Disputes & Moderation State & 5-Per-Page Pagination ─────────────
  const [ownerReports, setOwnerReports] = useState<IReport[]>([]);
  const [ownerReportPage, setOwnerReportPage] = useState<number>(1);
  const OWNER_REPORTS_PER_PAGE = 5; // Exactly 5 records per page
  const [ownerReportTotalPages, setOwnerReportTotalPages] = useState<number>(1);
  const [ownerReportTotalCount, setOwnerReportTotalCount] = useState<number>(0);
  const [ownerReportStats, setOwnerReportStats] = useState<ReportStats | null>(null);
  const [isOwnerReportsLoading, setIsOwnerReportsLoading] = useState<boolean>(false);
  const [isRegisterOwnerReportOpen, setIsRegisterOwnerReportOpen] = useState<boolean>(false);
  const [selectedOwnerReportForDetail, setSelectedOwnerReportForDetail] = useState<IReport | null>(null);
  const [preselectedReportTarget, setPreselectedReportTarget] = useState<{
    type: "business" | "review" | "user" | "media";
    id?: string;
    name?: string;
  }>({ type: "business" });

  const fetchOwnerReports = async (page = ownerReportPage) => {
    setIsOwnerReportsLoading(true);
    try {
      const res = await fetch(`/api/reports?page=${page}&limit=${OWNER_REPORTS_PER_PAGE}`);
      const data = await parseResponseJson(res);
      if (data.success && Array.isArray(data.data)) {
        setOwnerReports(data.data);
        setOwnerReportPage(data.page || page);
        setOwnerReportTotalPages(data.totalPages || 1);
        setOwnerReportTotalCount(data.total || 0);
        if (data.stats) setOwnerReportStats(data.stats);
      }
    } catch (err) {
      console.warn("Dashboard failed to fetch moderation reports:", err);
    } finally {
      setIsOwnerReportsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "moderation") {
      fetchOwnerReports(ownerReportPage);
    }
  }, [activeNav, ownerReportPage]);


  // Business Sub-entities State
  const [branches, setBranches] = useState<BranchLocation[]>(INITIAL_BRANCHES);
  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
  // Advertising Campaigns State & 20-Per-Page Pagination
  const [campaigns, setCampaigns] = useState<OwnerAdCampaign[]>([]);
  const [campaignsPage, setCampaignsPage] = useState<number>(1);
  const [campaignsTotalPages, setCampaignsTotalPages] = useState<number>(1);
  const [campaignsTotalCount, setCampaignsTotalCount] = useState<number>(0);
  const [isCampaignsLoading, setIsCampaignsLoading] = useState<boolean>(false);
  const [isCampaignSubmitting, setIsCampaignSubmitting] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<OwnerInvoice[]>(INITIAL_INVOICES);
  const [messages, setMessages] = useState<CustomerMessage[]>(INITIAL_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<CustomerMessage | null>(INITIAL_MESSAGES[0]);
  const [replyMessageText, setReplyMessageText] = useState<string>("");
  // ─── Real Owner Support Tickets State & 20-Per-Page Server Pagination ────────
  const [ownerTickets, setOwnerTickets] = useState<ISupportTicket[]>([]);
  const [ownerTicketPage, setOwnerTicketPage] = useState<number>(1);
  const OWNER_TICKETS_PER_PAGE = 20; // 20 per page as requested
  const [ownerTicketTotalPages, setOwnerTicketTotalPages] = useState<number>(1);
  const [ownerTicketTotalCount, setOwnerTicketTotalCount] = useState<number>(0);
  const [isOwnerTicketsLoading, setIsOwnerTicketsLoading] = useState<boolean>(false);
  const [ownerTicketSearch, setOwnerTicketSearch] = useState<string>("");
  const [ownerTicketCategoryFilter, setOwnerTicketCategoryFilter] = useState<string>("all");
  const [ownerTicketPriorityFilter, setOwnerTicketPriorityFilter] = useState<string>("all");
  const [ownerTicketStats, setOwnerTicketStats] = useState<TicketStats | null>(null);
  const [selectedOwnerTicketForDetail, setSelectedOwnerTicketForDetail] = useState<ISupportTicket | null>(null);
  const [isCreateOwnerTicketOpen, setIsCreateOwnerTicketOpen] = useState<boolean>(false);
  const [supportTabMode, setSupportTabMode] = useState<"tickets" | "faq">("tickets");
  const [prefilledTicketCategory, setPrefilledTicketCategory] = useState<TicketCategory>("verification");
  const [prefilledTicketSubject, setPrefilledTicketSubject] = useState<string>("");
  const [isSimulatingSupport, setIsSimulatingSupport] = useState<boolean>(false);

  const handleSimulateGlobalSupportResponse = async (
    scenario: "verification_approved" | "settlement_cleared" | "technical_fixed"
  ) => {
    setIsSimulatingSupport(true);
    try {
      const targetTicket = ownerTickets[0];
      const bizName = selectedBusiness?.name || "Abyssinia Gourmet Cafe";

      let staffName = "Admin Elena (Compliance Desk)";
      let message = "";
      let newStatus: TicketStatus = "resolved";

      if (scenario === "verification_approved") {
        staffName = "Compliance Department";
        message = `Good news! We have thoroughly reviewed your submitted municipal trade license and tax TIN certificate. ${bizName} has been officially approved and awarded the Verified Gold Checkmark badge!`;
        newStatus = "resolved";
      } else if (scenario === "settlement_cleared") {
        staffName = "Finance & Settlement Operations";
        message = `Settlement reconciliation completed. Direct disbursement of 3,840.00 ETB has been cleared to your registered commercial bank account. Ref: SET-77491.`;
        newStatus = "resolved";
      } else {
        staffName = "Technical Platform Lead";
        message = `Our mapping team has adjusted your branch entrance GPS coordinates and updated satellite pin rendering. Customer directions will now route accurately to your front entrance.`;
        newStatus = "resolved";
      }

      if (targetTicket) {
        const res = await fetch(`/api/support/tickets/${encodeURIComponent(targetTicket.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName: staffName,
            senderRole: "admin",
            message,
            newStatus,
          }),
        });
        const data = await parseResponseJson(res);
        if (data?.success && data.ticket) {
          playNotificationSound();
          showDesktopNotification(
            `🎫 Support Update #${targetTicket.id}`,
            `${staffName}: "${message.slice(0, 80)}..."`
          );
          toast.success(`Simulated support resolution added to #${targetTicket.id}!`);
          setOwnerTickets((prev) => prev.map((t) => (t.id === data.ticket.id ? data.ticket : t)));
          fetchOwnerTickets(ownerTicketPage);
          refreshLiveNotifications();
        }
      } else {
        const res = await fetch("/api/support/tickets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subject:
              scenario === "verification_approved"
                ? "Official Business License Verification"
                : "Payment Settlement Reconciliation",
            category: scenario === "verification_approved" ? "verification" : "billing",
            priority: "high",
            status: "resolved",
            initialMessage: message,
            userId: user?.id || "user_owner",
            userName: user?.fullName || bizName,
            userEmail: user?.primaryEmailAddress?.emailAddress || "owner@bizfinder.et",
            businessId: selectedBusiness?.id || "biz-1",
            businessName: bizName,
            assignedAdmin: staffName,
          }),
        });
        const data = await res.json();
        if (data?.success && data.data) {
          playNotificationSound();
          showDesktopNotification(
            `🎫 Support Update #${data.data.id}`,
            `${staffName}: "${message.slice(0, 80)}..."`
          );
          toast.success("Simulated support ticket and response created!");
          fetchOwnerTickets(1);
          refreshLiveNotifications();
        }
      }
    } catch (err) {
      toast.error("Failed to simulate support response");
    } finally {
      setIsSimulatingSupport(false);
    }
  };

  const fetchOwnerTickets = async (page = ownerTicketPage) => {
    setIsOwnerTicketsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(OWNER_TICKETS_PER_PAGE));
      if (ownerTicketSearch.trim()) params.set("search", ownerTicketSearch.trim());

      const statusParam =
        activeNav === "support" && activeSubnav !== "all" && activeSubnav !== "tickets"
          ? activeSubnav
          : "all";
      if (statusParam !== "all") params.set("status", statusParam);

      if (ownerTicketCategoryFilter && ownerTicketCategoryFilter !== "all") {
        params.set("category", ownerTicketCategoryFilter);
      }
      if (ownerTicketPriorityFilter && ownerTicketPriorityFilter !== "all") {
        params.set("priority", ownerTicketPriorityFilter);
      }

      const res = await fetch(`/api/support/tickets?${params.toString()}`);
      const data = await parseResponseJson(res);
      if (data?.success && Array.isArray(data.tickets)) {
        setOwnerTickets(data.tickets);
        setOwnerTicketPage(data.page || page);
        setOwnerTicketTotalPages(
          data.totalPages || Math.max(1, Math.ceil((data.total || data.tickets.length) / OWNER_TICKETS_PER_PAGE))
        );
        setOwnerTicketTotalCount(data.total || data.tickets.length);
        if (data.stats) setOwnerTicketStats(data.stats);
      }
    } catch (err) {
      console.warn("Dashboard failed to fetch support tickets:", err);
    } finally {
      setIsOwnerTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "support") {
      const handler = setTimeout(() => {
        fetchOwnerTickets(ownerTicketPage);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [
    activeNav,
    ownerTicketPage,
    activeSubnav,
    ownerTicketCategoryFilter,
    ownerTicketPriorityFilter,
    ownerTicketSearch,
  ]);

  const [notifications, setNotifications] = useState<OwnerNotification[]>(INITIAL_NOTIFICATIONS);

  // ─── Real Notifications State & 10-Per-Page Server Pagination ───────────────
  const [ownerNotificationsList, setOwnerNotificationsList] = useState<INotification[]>([]);
  const [ownerNotifPage, setOwnerNotifPage] = useState<number>(1);
  const OWNER_NOTIFS_PER_PAGE = 10;
  const [ownerNotifTotalPages, setOwnerNotifTotalPages] = useState<number>(1);
  const [ownerNotifTotalCount, setOwnerNotifTotalCount] = useState<number>(0);
  const [isOwnerNotifsLoading, setIsOwnerNotifsLoading] = useState<boolean>(false);
  const [ownerNotifSearch, setOwnerNotifSearch] = useState<string>("");
  const [ownerNotifTypeFilter, setOwnerNotifTypeFilter] = useState<string>("all");
  const [ownerNotifPriorityFilter, setOwnerNotifPriorityFilter] = useState<string>("all");
  const [ownerNotifStats, setOwnerNotifStats] = useState<NotificationStats | null>(null);
  const [isRegisterOwnerNotifOpen, setIsRegisterOwnerNotifOpen] = useState<boolean>(false);
  const [selectedOwnerNotifForDetail, setSelectedOwnerNotifForDetail] = useState<INotification | null>(null);

  const fetchOwnerNotifications = async (page = ownerNotifPage) => {
    setIsOwnerNotifsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(OWNER_NOTIFS_PER_PAGE));
      if (ownerNotifSearch.trim()) params.set("search", ownerNotifSearch.trim());

      // Filter by activeSubnav tabs when viewing notifications
      if (activeNav === "notifications") {
        if (activeSubnav === "unread") params.set("readStatus", "unread");
        else if (activeSubnav === "read") params.set("readStatus", "read");
        else if (activeSubnav === "critical") params.set("priority", "critical");
        else if (activeSubnav === "business") params.set("target", "business");
        else if (activeSubnav === "global") params.set("target", "global");
      }

      if (ownerNotifTypeFilter && ownerNotifTypeFilter !== "all") params.set("type", ownerNotifTypeFilter);
      if (ownerNotifPriorityFilter && ownerNotifPriorityFilter !== "all") params.set("priority", ownerNotifPriorityFilter);

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data = await parseResponseJson(res);
      if (data.success) {
        setOwnerNotificationsList(data.notifications || []);
        setOwnerNotifPage(data.page || page);
        setOwnerNotifTotalPages(data.totalPages || 1);
        setOwnerNotifTotalCount(data.total || 0);
        if (data.stats) setOwnerNotifStats(data.stats);
      }
    } catch (err) {
      console.warn("[Owner Notifications] Failed to fetch:", err);
    } finally {
      setIsOwnerNotifsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "notifications") {
      fetchOwnerNotifications(ownerNotifPage);
    }
  }, [activeNav, ownerNotifPage, activeSubnav]);

  const handleOwnerMarkRead = async (id: string) => {
    setOwnerNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    if (ownerNotifStats) {
      setOwnerNotifStats({
        ...ownerNotifStats,
        unread: Math.max(0, (ownerNotifStats.unread || 1) - 1),
      });
    }
    await markLiveNotificationRead(id);
    toast.success("Marked as read");
  };

  const handleOwnerMarkUnread = async (id: string) => {
    setOwnerNotificationsList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
    );
    if (ownerNotifStats) {
      setOwnerNotifStats({
        ...ownerNotifStats,
        unread: (ownerNotifStats.unread || 0) + 1,
      });
    }
    await markLiveNotificationUnread(id);
    toast.info("Marked as unread");
  };

  const handleOwnerMarkAllRead = async () => {
    setOwnerNotificationsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
    if (ownerNotifStats) {
      setOwnerNotifStats({ ...ownerNotifStats, unread: 0 });
    }
    await markAllLiveNotificationsRead();
    toast.success("All notifications marked as read");
  };

  const handleOwnerClearAllRead = async () => {
    setOwnerNotificationsList((prev) => prev.filter((n) => !n.isRead));
    await clearAllLiveNotificationsRead();
    toast.success("Read notifications cleared");
    fetchOwnerNotifications(1);
  };

  const handleOwnerDeleteNotification = async (id: string) => {
    const target = ownerNotificationsList.find((n) => n.id === id);
    setOwnerNotificationsList((prev) => prev.filter((n) => n.id !== id));
    setOwnerNotifTotalCount((c) => Math.max(0, c - 1));
    if (target && !target.isRead && ownerNotifStats) {
      setOwnerNotifStats({
        ...ownerNotifStats,
        unread: Math.max(0, (ownerNotifStats.unread || 1) - 1),
      });
    }
    await deleteLiveNotification(id);
    toast.success("Notification deleted.");
  };

  // Modern feature: Quick Simulator for Business Owner Testing
  const [isSimulatingAlert, setIsSimulatingAlert] = useState<boolean>(false);
  const handleSimulateNotification = async (
    scenario: "review" | "inquiry" | "billing" | "verification"
  ) => {
    setIsSimulatingAlert(true);
    try {
      const bizName = selectedBusiness?.name || "Abyssinia Gourmet Cafe";
      let title = "";
      let message = "";
      let type = "system";
      let priority: "critical" | "high" | "medium" | "low" = "medium";
      let link = "/dashboard";

      if (scenario === "review") {
        title = `⭐⭐⭐⭐⭐ New 5-Star Customer Review!`;
        message = `Helen K. just posted: "Absolutely stunning ambiance and the best traditional roast coffee in town! Highly recommend."`;
        type = "review";
        priority = "high";
        link = "/dashboard?tab=reviews";
      } else if (scenario === "inquiry") {
        title = `💬 New Customer Inquiry from Yohannes`;
        message = `Inquiry: "Hi! Are you taking dinner table reservations for a party of 8 this Saturday evening?"`;
        type = "message";
        priority = "medium";
        link = "/dashboard?tab=messages";
      } else if (scenario === "billing") {
        title = `💳 Subscription Renewal Receipt (ETB 1,499)`;
        message = `Your Pro Merchant Plan has been successfully renewed. Transaction ID #TX-${Date.now().toString().slice(-6)}.`;
        type = "payment";
        priority = "medium";
        link = "/dashboard?tab=billing";
      } else if (scenario === "verification") {
        title = `🎉 Business Verification Approved!`;
        message = `Congratulations! ${bizName} has been fully verified and granted the Official Verified Gold Badge.`;
        type = "system";
        priority = "high";
        link = "/dashboard?tab=management";
      }

      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          target: "business",
          targetBusinessId: selectedBusiness?.id || "biz-1",
          type,
          priority,
          link,
          sentBy: "BizFinder Platform",
        }),
      });

      const data = await parseResponseJson(res);
      if (data?.notification) {
        setOwnerNotificationsList((prev) => [data.notification, ...prev]);
        setOwnerNotifTotalCount((c) => c + 1);
        if (ownerNotifStats) {
          setOwnerNotifStats({
            ...ownerNotifStats,
            total: ownerNotifStats.total + 1,
            unread: ownerNotifStats.unread + 1,
          });
        }
        playNotificationSound();
        showDesktopNotification(title, message);
        toast.success(`Simulated alert: "${title}" arrived!`);
        refreshLiveNotifications();
      }
    } catch (err) {
      console.error("Failed to simulate notification:", err);
      toast.error("Failed to simulate notification");
    } finally {
      setIsSimulatingAlert(false);
    }
  };

  // Review Reply State
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Modals State
  const [isEditListingOpen, setIsEditListingOpen] = useState(false);
  const [isMediaUploaderOpen, setIsMediaUploaderOpen] = useState(false);
  const [isRegisterMediaOpen, setIsRegisterMediaOpen] = useState(false);
  const [ownerMediaPage, setOwnerMediaPage] = useState(1);
  const [ownerMediaSearch, setOwnerMediaSearch] = useState("");
  const [lightboxMedia, setLightboxMedia] = useState<any | null>(null);
  const [isHoursEditorOpen, setIsHoursEditorOpen] = useState(false);
  const [isAddBranchOpen, setIsAddBranchOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isAddOfferOpen, setIsAddOfferOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [selectedOfferForShare, setSelectedOfferForShare] = useState<OfferItem | null>(null);
  const [isShareOfferOpen, setIsShareOfferOpen] = useState(false);
  const [isPosRedeemOpen, setIsPosRedeemOpen] = useState(false);
  const [posCodeInput, setPosCodeInput] = useState("");
  const [posRedeemFeedback, setPosRedeemFeedback] = useState<{
    status: "idle" | "success" | "error";
    message: string;
    offerTitle?: string;
    discount?: string;
  }>({ status: "idle", message: "" });
  const [redemptions, setRedemptions] = useState<RedemptionRecord[]>(INITIAL_REDEMPTIONS);
  const [promosTab, setPromosTab] = useState<"offers" | "pos" | "history">("offers");
  const [offerSearch, setOfferSearch] = useState("");
  const [offerTypeFilter, setOfferTypeFilter] = useState("all");
  const [offerSubnav, setOfferSubnav] = useState<"active" | "scheduled" | "expired" | "all">("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newOfferFull, setNewOfferFull] = useState({
    title: "",
    code: "",
    type: "Percentage" as "Percentage" | "Fixed Amount" | "BOGO" | "Weekend Special",
    discountValue: "",
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    description: "",
    minOrderValue: "",
    usageLimit: "",
    targetAudience: "All Customers",
    isHighlighted: false,
  });
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<OwnerInvoice | null>(null);

  // Form States for Modals
  const [newBranch, setNewBranch] = useState({ branchName: "", country: "Ethiopia", city: "Addis Ababa", district: "Bole", addressLine: "", phone: "" });
  const [newProduct, setNewProduct] = useState({ name: "", category: "Coffee & Beans", price: 250, stock: 50, sku: "" });
  const [newService, setNewService] = useState({ name: "", category: "Dining", price: "250 ETB", description: "" });
  const [newOffer, setNewOffer] = useState({ title: "", code: "", type: "Percentage" as const, discountValue: "20%", validFrom: "2026-09-01", validTo: "2026-09-30" });
  const [newTicket, setNewTicket] = useState({ subject: "", category: "Verification" as const, priority: "Medium" as const, message: "" });
  const [newCampaign, setNewCampaign] = useState({ name: "", budget: 1000, durationDays: 30, placement: "search_top", targetLocation: "All Sub-Cities" });

  // Dynamic Categories Taxonomy & 3-Per-Page Pagination State
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [catPage, setCatPage] = useState<number>(1);
  const [catSearch, setCatSearch] = useState<string>("");
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [defaultParentForAdd, setDefaultParentForAdd] = useState<string | undefined>(undefined);
  const CATS_PER_PAGE = 3;

  // (Old 8-step wizard state removed – now handled by EmbeddedListingWizard component)

  // Fetch actual registered categories from MongoDB on mount
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => (res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.warn("Dashboard failed to fetch categories:", err));

    // Fetch live payments for billing & receipts ledger
    fetch("/api/payments?limit=20")
      .then((res) => (res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.payments) && data.payments.length > 0) {
          const liveInvoices: OwnerInvoice[] = data.payments.map((p: any) => ({
            id: `INV-${p.id}`,
            txId: p.id,
            amount: p.amount,
            currency: p.currency || "ETB",
            type:
              p.paymentType === "subscription"
                ? "Subscription"
                : p.paymentType === "advertisement"
                ? "Advertising"
                : "Service Fee",
            status:
              p.status === "completed"
                ? "Paid"
                : p.status === "pending"
                ? "Pending"
                : "Refunded",
            date: new Date(p.createdAt).toISOString().split("T")[0],
            billingMethod: `${p.provider.toUpperCase()} (${p.reference || "Verified"})`,
          }));
          setInvoices(liveInvoices);
        }
      })
      .catch(() => {});

    // Fetch real support tickets and notifications for live telemetry
    fetchOwnerTickets(1);
    fetchOwnerNotifications(1);
  }, []);

  const handleAddCategory = async (newCat: Partial<Category>) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      });
      const data = await parseResponseJson(res);
      if (data?.success && data.category) {
        setCategories((prev) => [data.category, ...prev]);
        toast.success(`Category "${data.category.name}" registered to database!`);
        setIsAddCatModalOpen(false);
        setDefaultParentForAdd(undefined);
      } else {
        toast.error(data?.error || "Failed to register category");
      }
    } catch (err: any) {
      toast.error(err.message || "Error registering category");
    }
  };

  const handleUpdateCategory = async (upCat: Category) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(upCat),
      });
      const data = await parseResponseJson(res);
      if (data?.success && data.category) {
        setCategories((prev) => prev.map((c) => (c.id === data.category.id ? data.category : c)));
        toast.success(`Category "${data.category.name}" updated!`);
        setEditingCategory(null);
      } else {
        toast.error(data?.error || "Failed to update category");
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating category");
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${catName}" and any associated subcategories?`)) return;
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(catId)}`, { method: "DELETE" });
      const data = await parseResponseJson(res);
      if (data?.success) {
        setCategories((prev) => prev.filter((c) => c.id !== catId && c.parentId !== catId));
        toast.success(`Category "${catName}" removed from database`);
      } else {
        toast.error(data?.error || "Failed to delete category");
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting category");
    }
  };

  // Dynamic industry groups from actual registered categories
  const industryGroups = useMemo(() => {
    const level1 = categories.filter((c) => c.level === 1 || !c.parentId);
    return level1.map((ind) => {
      const level2 = categories.filter((c) => c.parentId === ind.id);
      const catsWithSubcats = level2.map((l2) => {
        const level3 = categories.filter((c) => c.parentId === l2.id);
        return {
          ...l2,
          subcats: level3,
        };
      });
      const totalCount = catsWithSubcats.reduce((acc, curr) => acc + 1 + curr.subcats.length, 0);
      return {
        ...ind,
        categories: catsWithSubcats,
        totalCount,
      };
    });
  }, [categories]);

  const filteredIndustryGroups = useMemo(() => {
    if (!catSearch.trim()) return industryGroups;
    const q = catSearch.toLowerCase();
    return industryGroups.filter((ind) => {
      if (ind.name.toLowerCase().includes(q)) return true;
      return ind.categories.some(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.subcats.some((s) => s.name.toLowerCase().includes(q))
      );
    });
  }, [industryGroups, catSearch]);

  const catTotalPages = Math.max(1, Math.ceil(filteredIndustryGroups.length / CATS_PER_PAGE));
  const paginatedIndustries = useMemo(() => {
    const start = (catPage - 1) * CATS_PER_PAGE;
    return filteredIndustryGroups.slice(start, start + CATS_PER_PAGE);
  }, [filteredIndustryGroups, catPage]);

  // ─── Live 7-Day Chart Data derived from analytics events ─────────────────────
  const liveChartData = useMemo(() => {
    const activeStats = dashboardAnalyticsStats || globalAnalyticsStats;
    if (!activeStats || !dashboardAnalytics.length) return ANALYTICS_7D;

    // Build day buckets from the last 7 unique dates in the loaded events
    const dayMap: Record<string, { views: number; calls: number; directions: number; clicks: number; impressions: number }> = {};
    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Seed the last 7 days
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - d);
      const key = date.toISOString().slice(0, 10);
      dayMap[key] = { views: 0, calls: 0, directions: 0, clicks: 0, impressions: 0 };
    }

    // Count events into buckets
    for (const evt of dashboardAnalytics) {
      const key = new Date(evt.createdAt).toISOString().slice(0, 10);
      if (!dayMap[key]) continue;
      dayMap[key].impressions += 1;
      if (evt.eventType === "view") dayMap[key].views += 1;
      else if (evt.eventType === "click_phone") dayMap[key].calls += 1;
      else if (evt.eventType === "click_direction") dayMap[key].directions += 1;
      else if (evt.eventType === "click_website") dayMap[key].clicks += 1;
    }

    const entries = Object.entries(dayMap).map(([date, counts]) => ({
      day: dayNames[new Date(date + "T12:00:00").getDay()],
      ...counts,
    }));

    // If we have real data, return it; otherwise fall back to seed
    const hasRealData = entries.some(e => e.impressions > 0);
    return hasRealData ? entries : ANALYTICS_7D;
  }, [dashboardAnalytics, dashboardAnalyticsStats, globalAnalyticsStats]);


  // Business Portfolio Geo Filter & Export State
  const [bizFilterCountry, setBizFilterCountry] = useState<string>("all");
  const [bizFilterCity, setBizFilterCity] = useState<string>("all");
  const [isExportingBiz, setIsExportingBiz] = useState<boolean>(false);

  const bizFilterCities = useMemo(() => {
    if (!bizFilterCountry || bizFilterCountry === "all") return [];
    return getCitiesForCountry(bizFilterCountry);
  }, [bizFilterCountry]);

  // Fetch businesses from live API with exactly 20 per page pagination
  const fetchBusinesses = async (
    page = bizPage,
    scope = portfolioScope,
    filter = bizStatusFilter,
    search = bizSearch,
    sort = bizSort,
    country = bizFilterCountry,
    city = bizFilterCity
  ) => {
    setIsBizLoading(true);
    try {
      const activeOwner = scope === "corporate"
        ? "org-cbe-corporate"
        : (user?.id || (typeof window !== "undefined" ? localStorage.getItem("bizfinder_active_owner_id") : null) || "user-owner-1");

      const params = new URLSearchParams();
      params.set("ownerId", activeOwner);
      params.set("page", String(page));
      params.set("limit", "20");
      if (filter && filter !== "all") params.set("status", filter);
      if (search.trim()) params.set("q", search.trim());
      if (sort) params.set("sort", sort);
      if (country && country !== "all") params.set("country", country);
      if (city && city !== "all") params.set("city", city);

      const res = await fetch(`/api/businesses?${params.toString()}`);
      const data = await parseResponseJson(res);
      if (data && Array.isArray(data.businesses)) {
        setBusinesses(data.businesses);
        setBizTotalCount(data.total ?? data.businesses.length);
        setBizTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total ?? data.businesses.length) / 20)));
        setBizPage(data.page ?? page);

        if (data.businesses.length > 0) {
          const lastCreated = typeof window !== "undefined" ? localStorage.getItem("bizfinder_last_created_biz") : null;
          const target = lastCreated ? data.businesses.find((b: Business) => b.id === lastCreated) : null;
          if (target) {
            setSelectedBusiness(target);
            localStorage.removeItem("bizfinder_last_created_biz");
          } else if (!selectedBusiness?.id || selectedBusiness.id === "") {
            setSelectedBusiness(data.businesses[0]);
          }
        } else if (scope === "my") {
          // If no personal businesses yet, keep selectedBusiness as empty or first available
          if (!selectedBusiness?.id) {
            setSelectedBusiness(EMPTY_BUSINESS);
          }
        }
      }
    } catch (err) {
      console.error("Dashboard failed to load businesses:", err);
    } finally {
      setIsBizLoading(false);
    }
  };

  const handleExportDashboardBusinesses = async (format: "csv" | "json") => {
    setIsExportingBiz(true);
    try {
      const activeOwner = portfolioScope === "corporate"
        ? "org-cbe-corporate"
        : (user?.id || (typeof window !== "undefined" ? localStorage.getItem("bizfinder_active_owner_id") : null) || "user-owner-1");

      const params = new URLSearchParams();
      params.set("ownerId", activeOwner);
      params.set("page", "1");
      params.set("limit", "5000");
      params.set("export", "true");
      if (bizStatusFilter && bizStatusFilter !== "all") params.set("status", bizStatusFilter);
      if (bizSearch.trim()) params.set("q", bizSearch.trim());
      if (bizSort) params.set("sort", bizSort);
      if (bizFilterCountry && bizFilterCountry !== "all") params.set("country", bizFilterCountry);
      if (bizFilterCity && bizFilterCity !== "all") params.set("city", bizFilterCity);

      const res = await fetch(`/api/businesses?${params.toString()}`);
      const data = await parseResponseJson(res);
      const exportList = data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0
        ? data.businesses
        : businesses;

      const fileLabel = `my_portfolio_businesses${bizFilterCountry !== "all" ? `_${bizFilterCountry}` : ""}${bizFilterCity !== "all" ? `_${bizFilterCity}` : ""}`;
      if (format === "csv") {
        exportBusinessesToCSV(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} businesses in CSV format!`);
      } else {
        exportBusinessesToJSON(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} businesses in JSON format!`);
      }
    } catch (err) {
      console.error("Dashboard export businesses error:", err);
      const fileLabel = `my_portfolio_businesses${bizFilterCountry !== "all" ? `_${bizFilterCountry}` : ""}${bizFilterCity !== "all" ? `_${bizFilterCity}` : ""}`;
      if (format === "csv") exportBusinessesToCSV(businesses, fileLabel);
      else exportBusinessesToJSON(businesses, fileLabel);
      toast.success(`Downloaded ${businesses.length} businesses!`);
    } finally {
      setIsExportingBiz(false);
    }
  };

  useEffect(() => {
    fetchBusinesses(bizPage, portfolioScope, bizStatusFilter, bizSearch, bizSort, bizFilterCountry, bizFilterCity);
  }, [portfolioScope, bizStatusFilter, bizSort, bizSearch, bizFilterCountry, bizFilterCity, user?.id]);

  // Update selected business helper
  const handleUpdateBusiness = async (updated: Business) => {
    setBusinesses((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBusiness(updated);
    try {
      await fetch(`/api/businesses/${updated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      toast.success("Business profile synchronized with MongoDB!");
    } catch (e) {
      toast.success("Changes saved to active profile!");
    }
  };

  // ─── Business Management Hub Top-Level State & Live Sync ───
  const [mgmtSaving, setMgmtSaving] = useState(false);
  const [editBiz, setEditBiz] = useState<Business>(EMPTY_BUSINESS);
  const [addBranchOpen, setAddBranchOpen] = useState(false);
  const [newBranchForm, setNewBranchForm] = useState({
    branchName: "",
    country: "Ethiopia",
    city: "Addis Ababa",
    district: "Bole",
    addressLine: "",
    phone: "",
    status: "Active" as "Active" | "Inactive",
  });
  const [addServiceOpen, setAddServiceOpen] = useState(false);
  const [newServiceForm, setNewServiceForm] = useState({
    name: "",
    category: "Dining",
    price: "",
    description: "",
  });
  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [editServiceForm, setEditServiceForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
  });
  const [hoursLocal, setHoursLocal] = useState<OpeningHourSlot[]>([]);
  const [contactForm, setContactForm] = useState({
    telephone: "",
    mobile: "",
    whatsapp: "",
    email: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    tiktok: "",
    telegram: "",
    youtube: "",
  });

  useEffect(() => {
    if (selectedBusiness && selectedBusiness.id) {
      setEditBiz({ ...selectedBusiness });
      setContactForm({
        telephone: selectedBusiness.telephone || "",
        mobile: selectedBusiness.mobile || "",
        whatsapp: selectedBusiness.whatsapp || "",
        email: selectedBusiness.email || "",
        website: selectedBusiness.website || "",
        facebook: (selectedBusiness as any).facebook || "",
        instagram: (selectedBusiness as any).instagram || "",
        twitter: (selectedBusiness as any).twitter || "",
        linkedin: (selectedBusiness as any).linkedin || "",
        tiktok: (selectedBusiness as any).tiktok || "",
        telegram: (selectedBusiness as any).telegram || "",
        youtube: (selectedBusiness as any).youtube || "",
      });
      setHoursLocal(
        [0, 1, 2, 3, 4, 5, 6].map((d) => {
          const existing = (selectedBusiness.openingHours || []).find((h: any) => h.dayOfWeek === d);
          return existing || { dayOfWeek: d, openTime: "08:00", closeTime: "22:00", is24h: false, isClosed: false };
        })
      );
    }
  }, [selectedBusiness]);

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const saveBusinessInfo = async () => {
    setMgmtSaving(true);
    await handleUpdateBusiness(editBiz);
    setMgmtSaving(false);
  };

  const saveContactInfo = async () => {
    setMgmtSaving(true);
    await handleUpdateBusiness({ ...selectedBusiness, ...contactForm });
    setMgmtSaving(false);
  };

  const saveHours = async () => {
    setMgmtSaving(true);
    await handleUpdateBusiness({ ...selectedBusiness, openingHours: hoursLocal });
    setMgmtSaving(false);
  };

  const addBranch = () => {
    if (!newBranchForm.branchName || !newBranchForm.addressLine) {
      toast.error("Branch name and address are required.");
      return;
    }
    const newBr: BranchLocation = { ...newBranchForm, id: `br-${Date.now()}` };
    setBranches((prev) => [...prev, newBr]);
    setNewBranchForm({
      branchName: "",
      country: "Ethiopia",
      city: "Addis Ababa",
      district: "Bole",
      addressLine: "",
      phone: "",
      status: "Active",
    });
    setAddBranchOpen(false);
    toast.success(`Branch "${newBr.branchName}" added!`);
  };

  const deleteBranch = (id: string, name: string) => {
    setBranches((prev) => prev.filter((b) => b.id !== id));
    toast.success(`Branch "${name}" removed.`);
  };

  const toggleBranchStatus = (id: string) => {
    setBranches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: b.status === "Active" ? "Inactive" : "Active" } : b))
    );
  };

  const addService = () => {
    if (!newServiceForm.name) {
      toast.error("Service name is required.");
      return;
    }
    const svc: BusinessServiceItem = {
      id: `svc-${Date.now()}`,
      name: newServiceForm.name,
      category: newServiceForm.category,
      price: newServiceForm.price,
      description: newServiceForm.description,
    };
    const updated = [...(selectedBusiness.services || []), svc];
    handleUpdateBusiness({ ...selectedBusiness, services: updated });
    setNewServiceForm({ name: "", category: "Dining", price: "", description: "" });
    setAddServiceOpen(false);
  };

  const removeService = (id: string) => {
    const updated = (selectedBusiness.services || []).filter((s: BusinessServiceItem) => s.id !== id);
    handleUpdateBusiness({ ...selectedBusiness, services: updated });
  };

  const saveEditService = () => {
    if (!editServiceForm.name) return;
    const updated = (selectedBusiness.services || []).map((s: BusinessServiceItem) =>
      s.id === editServiceId ? { ...s, ...editServiceForm } : s
    );
    handleUpdateBusiness({ ...selectedBusiness, services: updated });
    setEditServiceId(null);
  };

  // Fetch reviews whenever selected business or review navigation changes
  useEffect(() => {
    if (selectedBusiness?.id) {
      fetchDashboardReviews(1);
      setReviewPage(1);
    }
  }, [selectedBusiness?.id]);

  useEffect(() => {
    if (activeNav === "reviews") {
      fetchDashboardReviews(reviewPage);
    }
  }, [activeNav, activeSubnav, reviewPage]);

  // ─── Owner Advertising Campaigns Integration ────────────────────────────────
  const fetchOwnerCampaigns = async (page = campaignsPage) => {
    if (!isSignedIn || !user?.id) return;
    setIsCampaignsLoading(true);
    try {
      const res = await fetch(`/api/ads/campaigns?page=${page}&limit=20`);
      const data = await parseResponseJson(res);
      if (data) {
        if (data?.campaigns && Array.isArray(data.campaigns)) {
          const mapped: OwnerAdCampaign[] = data.campaigns.map((c: any) => ({
            id: c.id,
            name: c.name,
            businessName: c.businessName || selectedBusiness?.name || "Business",
            budget: c.dailyBudgetETB || c.budget || 1000,
            currency: "ETB",
            impressions: c.impressions || 0,
            clicks: c.clicks || 0,
            status: (c.status ? (c.status.charAt(0).toUpperCase() + c.status.slice(1).toLowerCase()) : "Active") as "Active" | "Paused" | "Completed",
            startDate: c.startDate || new Date().toISOString().split("T")[0],
            endDate: c.endDate || new Date(Date.now() + (c.durationDays || 30) * 86400000).toISOString().split("T")[0],
            placement: c.placement === "search_top" ? "Top Search Banner" :
                       c.placement === "map_highlight" ? "Map Spotlight Pin" :
                       c.placement === "category_spotlight" ? "Category Featured Card" :
                       c.placement === "home_hero" ? "Home Billboard Hero" :
                       c.placement || "Top Search Banner",
            totalSpentETB: c.totalSpentETB || 0,
            durationDays: c.durationDays || 30,
            targetLocation: c.targetLocation || "All Sub-Cities",
          }));
          setCampaigns(mapped);
          setCampaignsTotalPages(data.totalPages || 1);
          setCampaignsTotalCount(data.total || 0);
          setCampaignsPage(data.page || page);
        }
      }
    } catch (err) {
      console.error("Dashboard failed to fetch campaigns:", err);
    } finally {
      setIsCampaignsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && user?.id && (activeNav === "advertising" || activeNav === "dashboard")) {
      fetchOwnerCampaigns(campaignsPage);
    }
  }, [isSignedIn, user?.id, activeNav, campaignsPage]);

  const handleToggleCampaignStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus.toLowerCase() === "active" ? "paused" : "active";
    try {
      const res = await fetch(`/api/ads/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  status: (nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)) as "Active" | "Paused",
                }
              : c
          )
        );
        toast.success(`Campaign ${nextStatus === "active" ? "resumed" : "paused"} successfully.`);
      } else {
        toast.error("Failed to update campaign status");
      }
    } catch (e) {
      toast.error("Network error updating campaign");
    }
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete advertisement "${name}"?`)) return;
    try {
      const res = await fetch(`/api/ads/campaigns/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Advertisement "${name}" deleted.`);
        fetchOwnerCampaigns(campaignsPage);
      } else {
        toast.error("Failed to delete campaign");
      }
    } catch (e) {
      toast.error("Network error deleting campaign");
    }
  };

  // Helper to handle Review Responses
  const handlePostReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reviewId,
          reply: {
            ownerId: selectedBusiness?.id || "owner-1",
            ownerName: selectedBusiness?.name || "Business Management",
            comment: replyText.trim(),
          },
        }),
      });
      const data = await res.json();
      if (data?.success) {
        toast.success("Public response published successfully to database!");
        setReplyingReviewId(null);
        setReplyText("");
        fetchDashboardReviews(reviewPage);
      } else {
        toast.error(data?.error || "Failed to post reply");
      }
    } catch (e: any) {
      toast.error(e.message || "Network error posting reply");
    }
  };

  // Helper to handle Branch Addition
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranch.branchName.trim()) return;
    const branch: BranchLocation = {
      id: `br-${Date.now()}`,
      branchName: newBranch.branchName.trim(),
      country: newBranch.country,
      city: newBranch.city,
      district: newBranch.district,
      addressLine: newBranch.addressLine || "Branch Location",
      phone: newBranch.phone || "+251 11 000 0000",
      status: "Active",
    };
    setBranches((prev) => [...prev, branch]);
    setNewBranch({ branchName: "", country: "Ethiopia", city: "Addis Ababa", district: "Bole", addressLine: "", phone: "" });
    setIsAddBranchOpen(false);
    toast.success(`Location branch "${branch.branchName}" added!`);
  };

  // Helper to handle Product Addition
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;
    const prod: ProductItem = {
      id: `prod-${Date.now()}`,
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: Number(newProduct.price) || 100,
      currency: "ETB",
      stock: Number(newProduct.stock) || 10,
      status: "Available",
      sku: newProduct.sku || `SKU-${Date.now().toString().slice(-4)}`,
    };
    setProducts((prev) => [...prev, prod]);
    setNewProduct({ name: "", category: "Coffee & Beans", price: 250, stock: 50, sku: "" });
    setIsAddProductOpen(false);
    toast.success(`Product "${prod.name}" cataloged!`);
  };

  // Helper to handle Service Addition
  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name.trim()) return;
    const sItem: BusinessServiceItem = {
      id: `srv-${Date.now()}`,
      name: newService.name.trim(),
      category: newService.category,
      price: newService.price,
      description: newService.description,
    };
    const updatedServices = [...(selectedBusiness.services || []), sItem];
    const updated: Business = { ...selectedBusiness, services: updatedServices };
    handleUpdateBusiness(updated);
    setNewService({ name: "", category: "Dining", price: "250 ETB", description: "" });
    setIsAddServiceOpen(false);
    toast.success(`Service "${sItem.name}" added to menu!`);
  };

  // ─── Offers & Deals Persistence & POS Handlers ────────────────────────────
  useEffect(() => {
    try {
      const storedOffers = typeof window !== "undefined" ? localStorage.getItem("globalbiz_merchant_offers") : null;
      if (storedOffers) {
        const parsed = JSON.parse(storedOffers);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setOffers(parsed);
        }
      }
      const storedReds = typeof window !== "undefined" ? localStorage.getItem("globalbiz_merchant_redemptions") : null;
      if (storedReds) {
        const parsedReds = JSON.parse(storedReds);
        if (Array.isArray(parsedReds) && parsedReds.length > 0) {
          setRedemptions(parsedReds);
        }
      }
    } catch (e) {
      console.warn("[Offers] Failed restoring from localStorage:", e);
    }
  }, []);

  const persistOffers = (updated: OfferItem[]) => {
    setOffers(updated);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("globalbiz_merchant_offers", JSON.stringify(updated));
      }
    } catch (e) {}
  };

  const persistRedemptions = (updated: RedemptionRecord[]) => {
    setRedemptions(updated);
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("globalbiz_merchant_redemptions", JSON.stringify(updated));
      }
    } catch (e) {}
  };

  // Sync sidebar subnav with promotions engine
  useEffect(() => {
    if (activeNav === "promotions") {
      if (activeSubnav === "discounts") {
        setPromosTab("offers");
        setOfferTypeFilter("Percentage");
      } else if (activeSubnav === "coupons") {
        setPromosTab("offers");
        setOfferTypeFilter("all");
      } else if (activeSubnav === "offers") {
        setPromosTab("offers");
        setOfferSubnav("active");
      }
    }
  }, [activeNav, activeSubnav]);

  const handleToggleOfferStatus = (off: OfferItem) => {
    const nextStatus = off.status === "Active" ? "Scheduled" : "Active";
    const updated = offers.map(o => o.id === off.id ? { ...o, status: nextStatus as any } : o);
    persistOffers(updated);
    toast.success(`Offer "${off.title}" ${nextStatus === "Active" ? "activated" : "paused"}.`);
  };

  const handleDuplicateOffer = (off: OfferItem) => {
    const clone: OfferItem = {
      ...off,
      id: `off-${Date.now()}`,
      title: `${off.title} (Copy)`,
      code: `${off.code.replace(/[0-9]/g, "")}${Math.floor(10 + Math.random() * 90)}`,
      usageCount: 0,
      status: "Active",
    };
    persistOffers([clone, ...offers]);
    toast.success(`Cloned offer "${clone.title}" (Code: ${clone.code})!`);
  };

  const handleDeleteOffer = (off: OfferItem) => {
    if (confirm(`Delete offer "${off.title}" (${off.code})?`)) {
      persistOffers(offers.filter(o => o.id !== off.id));
      toast.success(`Offer "${off.title}" deleted.`);
    }
  };

  const handlePosRedeem = (codeToVerify?: string) => {
    const code = (codeToVerify || posCodeInput).trim().toUpperCase();
    if (!code) {
      setPosRedeemFeedback({ status: "error", message: "Please enter a valid promo code." });
      return;
    }
    const matched = offers.find(o => o.code.toUpperCase() === code);
    if (!matched) {
      setPosRedeemFeedback({
        status: "error",
        message: `No promotion found matching code "${code}". Please verify code spelling.`,
      });
      return;
    }
    const nowStr = new Date().toISOString().split("T")[0];
    if (matched.status === "Expired" || (matched.validTo && matched.validTo < nowStr)) {
      setPosRedeemFeedback({
        status: "error",
        message: `Promotion "${matched.title}" expired on ${matched.validTo}. Cannot redeem.`,
        offerTitle: matched.title,
      });
      return;
    }
    if (matched.status === "Scheduled" || (matched.validFrom && matched.validFrom > nowStr)) {
      setPosRedeemFeedback({
        status: "error",
        message: `Promotion "${matched.title}" is not active yet (starts ${matched.validFrom}).`,
        offerTitle: matched.title,
      });
      return;
    }

    const limitNum = matched.usageLimit ? parseInt(String(matched.usageLimit)) : null;
    if (limitNum && matched.usageCount >= limitNum) {
      setPosRedeemFeedback({
        status: "error",
        message: `Promotion "${matched.title}" has reached its maximum redemptions limit (${limitNum}).`,
        offerTitle: matched.title,
      });
      return;
    }

    // Success! Increment count and record
    const updatedOffers = offers.map(o => o.id === matched.id ? { ...o, usageCount: o.usageCount + 1 } : o);
    persistOffers(updatedOffers);

    const newRed: RedemptionRecord = {
      id: `red-${Date.now()}`,
      offerId: matched.id,
      offerTitle: matched.title,
      code: matched.code,
      discountValue: matched.discountValue,
      customerName: "Counter Guest",
      branchName: selectedBusiness?.name || "Main Counter",
      orderTotal: matched.minOrderValue ? `${matched.minOrderValue}` : "Standard",
      discountApplied: matched.discountValue,
      redeemedAt: "Just now",
    };
    persistRedemptions([newRed, ...redemptions]);

    setPosRedeemFeedback({
      status: "success",
      message: `🎉 Success! Verified code "${matched.code}". Applied discount of ${matched.discountValue} to customer bill. Redemption #${matched.usageCount + 1} logged!`,
      offerTitle: matched.title,
      discount: matched.discountValue,
    });
    toast.success(`Redeemed "${matched.code}" (${matched.discountValue} off)!`);
    setPosCodeInput("");
  };

  const handleExportOffersCsv = () => {
    const headers = ["ID", "Title", "Code", "Type", "Discount", "Valid From", "Valid To", "Status", "Usage Count", "Min Order", "Audience"];
    const rows = offers.map(o => [
      `"${o.id}"`,
      `"${(o.title || "").replace(/"/g, '""')}"`,
      `"${o.code}"`,
      `"${o.type}"`,
      `"${o.discountValue}"`,
      `"${o.validFrom}"`,
      `"${o.validTo}"`,
      `"${o.status}"`,
      `"${o.usageCount}"`,
      `"${o.minOrderValue || "None"}"`,
      `"${o.targetAudience || "All"}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `promotions_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Promotions exported to CSV!");
  };

  const handleResetOffersToDemo = () => {
    if (confirm("Reset offers & redemptions to default demo data?")) {
      persistOffers(INITIAL_OFFERS);
      persistRedemptions(INITIAL_REDEMPTIONS);
      toast.success("Demo offers & redemptions restored!");
    }
  };

  // Helper to handle Campaign Creation
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) {
      toast.error("Please provide an advertisement campaign name.");
      return;
    }
    setIsCampaignSubmitting(true);
    try {
      const res = await fetch("/api/ads/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBusiness?.id || `biz-${Date.now()}`,
          businessName: selectedBusiness?.name || "My Business",
          name: newCampaign.name.trim(),
          placement: newCampaign.placement,
          targetLocation: newCampaign.targetLocation || "All Sub-Cities",
          dailyBudgetETB: Number(newCampaign.budget) || 1000,
          durationDays: Number(newCampaign.durationDays) || 30,
          startDate: new Date().toISOString().split("T")[0],
        }),
      });

      if (res.ok) {
        toast.success(`Ad campaign "${newCampaign.name.trim()}" deployed successfully!`);
        setNewCampaign({
          name: "",
          budget: 1000,
          durationDays: 30,
          placement: "search_top",
          targetLocation: "All Sub-Cities",
        });
        setIsCreateCampaignOpen(false);
        fetchOwnerCampaigns(1);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData?.error || "Failed to create campaign");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to deploy campaign");
    } finally {
      setIsCampaignSubmitting(false);
    }
  };

  // Helper to handle Ticket Creation
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim()) return;
    const ticket: OwnerSupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newTicket.subject.trim(),
      category: newTicket.category,
      priority: newTicket.priority,
      status: "Open",
      createdDate: new Date().toISOString().split("T")[0],
      lastReply: "Submitted by owner",
      messages: [{ sender: "owner", text: newTicket.message, time: "Just now" }],
    };
    setOwnerTickets((prev: any) => [ticket as any, ...prev]);
    setNewTicket({ subject: "", category: "Verification" as const, priority: "Medium" as const, message: "" });
    setIsCreateTicketOpen(false);
    toast.success(`Support Ticket ${ticket.id} submitted!`);
  };

  // Helper to reply in customer chat
  const handleSendCustomerReply = () => {
    if (!replyMessageText.trim() || !selectedMessage) return;
    const replyItem = { sender: "owner" as const, text: replyMessageText.trim(), time: "Just now" };
    const updated = {
      ...selectedMessage,
      thread: [...selectedMessage.thread, replyItem],
      preview: `You: ${replyMessageText.trim()}`,
      status: "read" as const,
    };
    setMessages((prev) => prev.map((m) => (m.id === selectedMessage.id ? updated : m)));
    setSelectedMessage(updated);
    setReplyMessageText("");
    toast.success("Reply sent to customer!");
  };

  // Callback when EmbeddedListingWizard successfully submits a new business
  const handleWizardSuccess = (businessId: string) => {
    setPortfolioScope("my");
    setActiveNav("businesses");
    setActiveSubnav("all");
    setBizPage(1);
    fetchBusinesses(1, "my");
    toast.success("🎉 Business Registered!", {
      description: "Your new listing has been submitted for review.",
      duration: 4000,
    });
  };

  // Helper to delete a business listing from MongoDB
  const handleDeleteBusiness = async () => {
    if (!businessToDelete) return;
    setIsDeletingBiz(true);
    try {
      const res = await fetch(`/api/businesses/${businessToDelete.id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Business listing deleted", {
          description: `"${businessToDelete.name}" has been permanently removed.`,
        });
        setBusinesses((prev) => prev.filter((b) => b.id !== businessToDelete.id));
        setBizTotalCount((prev) => Math.max(0, prev - 1));
        if (selectedBusiness?.id === businessToDelete.id) {
          const remaining = businesses.filter((b) => b.id !== businessToDelete.id);
          setSelectedBusiness(remaining[0] || EMPTY_BUSINESS);
        }
        setBusinessToDelete(null);
        fetchBusinesses(bizPage);
      } else {
        toast.error("Failed to delete business listing");
      }
    } catch (err) {
      toast.error("Error deleting business listing");
    } finally {
      setIsDeletingBiz(false);
    }
  };

  // Helper to toggle business open/closed status in MongoDB
  const handleToggleStatus = async (biz: Business) => {
    const nextStatus: BusinessStatus = biz.status === "open" ? "temporarily_closed" : "open";
    const updated: Business = { ...biz, status: nextStatus };
    setBusinesses((prev) => prev.map((b) => (b.id === biz.id ? updated : b)));
    if (selectedBusiness?.id === biz.id) setSelectedBusiness(updated);
    try {
      await fetch(`/api/businesses/${biz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.success(nextStatus === "open" ? `"${biz.name}" marked as Open` : `"${biz.name}" marked as Temporarily Closed`);
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const currentLiveStatus = getLiveOpeningStatus(selectedBusiness?.openingHours || []);
  const unreadNotifsCount = liveUnreadCount;
  const unreadMessagesCount = messages.filter((m) => m.status === "unread").length;

  // Render Subnav Tabs Helper
  const renderSubnavTabs = (tabs: { key: string; label: string; count?: number }[]) => (
    <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-border overflow-x-auto no-scrollbar w-fit max-w-full">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveSubnav(tab.key)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeSubnav === tab.key
              ? "bg-card text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeSubnav === tab.key
                  ? "bg-primary text-primary-foreground font-black"
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

  // ── Modern Dashboard Sidebar Nav Item Builder ───────────────────────
  const renderSidebarItem = (
    navKey: typeof activeNav,
    label: string,
    icon: React.ReactNode,
    badge?: number,
    subtabs?: { key: string; label: string; count?: number }[]
  ) => {
    const isActive = activeNav === navKey;
    const isExpanded = isActive; // dashboard auto-expands active item's subtabs

    return (
      <div className="space-y-0.5">
        <button
          onClick={() => {
            setActiveNav(navKey);
            if (subtabs && subtabs.length > 0) {
              setActiveSubnav(subtabs[0].key);
            } else {
              setActiveSubnav("all");
            }
            setSidebarOpen(false); // close drawer on mobile
          }}
          className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group overflow-hidden ${
            isActive
              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
          }`}
        >
          {/* Active left-border glow */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          )}
          <div className="flex items-center gap-2.5">
            <span className={`shrink-0 transition-transform duration-200 ${
              isActive ? "text-primary-foreground scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
            }`}>
              {icon}
            </span>
            <span className="font-bold">{label}</span>
          </div>
          {badge !== undefined && badge > 0 && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                isActive ? "bg-white/25 text-white" : "bg-red-500 text-white"
              }`}
            >
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </button>

        {/* Expandable Subnav — animates open when item is active */}
        {isExpanded && subtabs && subtabs.length > 0 && (
          <div className="pl-4 pr-1 pt-0.5 pb-1 space-y-0.5 animate-subnav-open">
            {subtabs.map((st) => (
              <button
                key={st.key}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveSubnav(st.key);
                }}
                className={`w-full text-left px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-150 flex items-center justify-between gap-1.5 ${
                  activeSubnav === st.key
                    ? "bg-primary/10 text-primary font-bold border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                    activeSubnav === st.key ? "bg-primary shadow-[0_0_6px_currentColor]" : "bg-muted-foreground/30"
                  }`} />
                  <span>{st.label}</span>
                </div>
                {st.count !== undefined && st.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                    activeSubnav === st.key ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {st.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex flex-col">
      {/* ─── Top Workspace Bar ────────────────────────────────────────────── */}
      <div className="border-b border-border/80 bg-card/60 backdrop-blur-xl px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-16 z-30">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl border border-border/60 bg-card hover:bg-accent transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-foreground">
                Business Owner Portal
              </h1>
              <Badge variant="outline" className="text-[10px] uppercase font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                🟢 Verified Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Multi-Branch Management, Performance Telemetry & Customer Engagement
            </p>
          </div>
        </div>

        {/* Right Controls: Business Selector + Theme + Quick CTA */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Active Business Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl border border-border text-xs">
            <span className="text-[11px] font-bold text-muted-foreground pl-2 hidden sm:inline">Active:</span>
            <select
              value={selectedBusiness?.id}
              onChange={(e) => {
                const found = businesses.find((b) => b.id === e.target.value);
                if (found) setSelectedBusiness(found);
              }}
              className="bg-background text-foreground text-xs font-bold py-1 px-2.5 rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-primary max-w-[160px] truncate"
            >
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Real-time Notification Bell */}
          <NotificationBell />

          {/* Theme Toggle (Pill mode) */}
          <ThemeToggle variant="pill" />

          {/* Quick Preview Profile */}
          <Link href={`/business/${selectedBusiness?.id || "biz-1"}`} target="_blank">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs font-bold">
              <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Preview Profile</span>
            </Button>
          </Link>

          {/* Territory Administration Portal Link for Admin Roles */}
          {["super_admin", "country_admin", "city_admin", "admin"].includes(currentRole) && (
            <Link href="/admin">
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs font-bold border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
              >
                <Crown className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Admin Portal</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ─── Sidebar + Main Content Workspace ────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* ── Left Sidebar Navigation ───────────────────────────────── */}
        <aside className={`dashboard-sidebar z-50 w-64 xl:w-72 shrink-0 border-r border-border/60 bg-card/90 backdrop-blur-sm flex flex-col justify-between overflow-y-auto no-scrollbar${
          sidebarOpen ? " open" : ""
        }`}>
          {/* Mobile close button */}
          <div className="md:hidden flex items-center justify-between p-3 border-b border-border/60">
            <span className="text-sm font-bold text-foreground">Navigation</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Scrollable nav area */}
          <div className="p-3 space-y-5 flex-1">

            {/* ── Section: My Business ──────────────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                My Business
                <div className="flex-1 h-px bg-border/60" />
              </div>
              {renderSidebarItem("dashboard", "Dashboard", <Building2 className="w-4 h-4 text-indigo-500" />)}
              {renderSidebarItem("businesses", "My Businesses", <Building2 className="w-4 h-4 text-emerald-500" />, businesses.length, [
                { key: "all", label: "All Listings" },
                { key: "add", label: "Add New Business" },
                { key: "active", label: "Active" },
                { key: "pending", label: "Pending Approval" },
                { key: "rejected", label: "Rejected" },
                { key: "suspended", label: "Suspended" },
              ])}
              {renderSidebarItem("management", "Management", <Sliders className="w-4 h-4 text-blue-500" />, undefined, [
                { key: "info", label: "Business Info" },
                { key: "categories", label: "Categories & Tags" },
                { key: "locations", label: "Branch Locations", count: branches.length },
                { key: "contact", label: "Contact Info" },
                { key: "hours", label: "Opening Hours" },
                { key: "services", label: "Services Menu", count: (selectedBusiness.services || []).length },
              ])}
              {renderSidebarItem("media", "Media & Photos", <Camera className="w-4 h-4 text-purple-500" />, undefined, [
                { key: "photos", label: "Photo Gallery" },
                { key: "videos", label: "Videos" },
                { key: "logo", label: "Logo & Avatar" },
                { key: "cover", label: "Cover Header" },
              ])}
            </div>

            {/* ── Section: Customer Engagement ──────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Customer Hub
                <div className="flex-1 h-px bg-border/60" />
              </div>
              {renderSidebarItem("reviews", "Customer Reviews", <Star className="w-4 h-4 text-amber-500" />, reviewCounts.all || reviews.length || undefined, [
                { key: "all", label: "All Reviews", count: reviewCounts.all || reviews.length },
                { key: "replies", label: "Responded", count: reviewCounts.replies },
                { key: "pending", label: "Awaiting Reply", count: reviewCounts.pending },
              ])}
              {renderSidebarItem("customers", "Customers", <UserCheck className="w-4 h-4 text-violet-500" />, customersTotalCount || undefined, [
                { key: "all", label: "All Customers", count: customersTotalCount },
                { key: "owners", label: "Business Owners" },
                { key: "users", label: "Regular Users" },
              ])}
              {renderSidebarItem("messages", "Customer Inquiries", <MessageSquare className="w-4 h-4 text-sky-500" />, unreadMessagesCount, [
                { key: "all", label: "All Inquiries" },
                { key: "unread", label: "Unread" },
                { key: "archived", label: "Archived" },
              ])}
              {renderSidebarItem("notifications", "Notifications", <Bell className="w-4 h-4 text-yellow-500" />, unreadNotifsCount || undefined, [
                { key: "all", label: "All Alerts", count: ownerNotifTotalCount || undefined },
                { key: "unread", label: "Unread", count: unreadNotifsCount || undefined },
                { key: "critical", label: "Urgent", count: ownerNotifStats?.criticalCount || undefined },
                { key: "business", label: "Business Alerts", count: ownerNotifStats?.businessCount || undefined },
              ])}
            </div>

            {/* ── Section: Growth & Revenue ─────────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Growth & Revenue
                <div className="flex-1 h-px bg-border/60" />
              </div>
              {renderSidebarItem("analytics", "Analytics", <BarChart3 className="w-4 h-4 text-teal-500" />, dashboardAnalyticsTotalCount || undefined, [
                { key: "events", label: "Live Event Ledger", count: dashboardAnalyticsTotalCount },
                { key: "overview", label: "Overview Metrics" },
                { key: "keywords", label: "Search Keywords" },
                { key: "geo", label: "Geographic Breakdown" },
              ])}
              {renderSidebarItem("advertising", "Advertising & Ads", <Crown className="w-4 h-4 text-amber-500" />, campaigns.length || undefined, [
                { key: "campaigns", label: "Ad Campaigns" },
                { key: "create", label: "Create Campaign" },
                { key: "performance", label: "Ad Performance" },
                { key: "budget", label: "Budget" },
              ])}
              {renderSidebarItem("promotions", "Offers & Deals", <Gift className="w-4 h-4 text-rose-500" />, offers.length || undefined, [
                { key: "offers", label: "Active Offers", count: offers.length },
                { key: "discounts", label: "Discounts & BOGO" },
                { key: "coupons", label: "Promo Coupons" },
              ])}
              {renderSidebarItem("billing", "Billing & Plans", <CreditCard className="w-4 h-4 text-green-500" />, undefined, [
                { key: "subscription", label: "Current Plan" },
                { key: "methods", label: "Payment Methods" },
                { key: "transactions", label: "Transactions" },
                { key: "invoices", label: "Invoices" },
              ])}
            </div>

            {/* ── Section: Account ───────────────────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Account
                <div className="flex-1 h-px bg-border/60" />
              </div>
              {renderSidebarItem("support", "Support Desk", <Ticket className="w-4 h-4 text-indigo-400" />, ownerTicketTotalCount || undefined, [
                { key: "all", label: "My Tickets", count: ownerTicketTotalCount },
                { key: "open", label: "Open", count: ownerTicketStats?.open },
                { key: "waiting_on_customer", label: "Awaiting Reply", count: ownerTicketStats?.waiting },
                { key: "resolved", label: "Resolved", count: ownerTicketStats?.resolved },
              ])}
              {renderSidebarItem("moderation", "Disputes & Reports", <Flag className="w-4 h-4 text-red-500" />, ownerReportTotalCount || undefined, [
                { key: "all", label: "All Cases", count: ownerReportTotalCount },
                { key: "pending", label: "In Review", count: ownerReportStats?.underReviewCount },
                { key: "resolved", label: "Resolved", count: ownerReportStats?.resolvedCount },
              ])}
              {renderSidebarItem("settings", "Account Settings", <Lock className="w-4 h-4 text-slate-400" />, undefined, [
                { key: "account", label: "Account Profile" },
                { key: "business", label: "Business Preferences" },
                { key: "notifications", label: "Notification Preferences" },
                { key: "security", label: "Security & 2FA" },
              ])}
              {renderSidebarItem("security", "Security & Access", <Shield className="w-4 h-4 text-rose-500" />, undefined, [
                { key: "audit", label: "Security Audit" },
                { key: "firewall", label: "Firewall & IPs" },
                { key: "sessions", label: "Active Sessions" },
                { key: "mfa", label: "2FA & Identity" },
                { key: "apikeys", label: "API Keys" },
              ])}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border/60">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 flex items-center justify-between gap-2">
              <div className="truncate">
                <div className="text-[10px] font-black text-foreground truncate">{selectedBusiness?.name || "My Business"}</div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">★ Pro Premium</div>
              </div>
              <ThemeToggle variant="button" />
            </div>
          </div>
        </aside>

        {/* ── Main Workspace Display ──────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Breadcrumb / Location Strip */}
          <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md px-6 sm:px-8 py-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-foreground">{selectedBusiness?.name || "Owner Portal"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="capitalize font-semibold text-primary">
              {activeNav.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            {activeSubnav && activeSubnav !== "all" && activeSubnav !== "events" && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="capitalize text-muted-foreground">
                  {activeSubnav.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
                </span>
              </>
            )}
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Live</span>
            </div>
          </div>
          {/* Animated key wrapper — re-mounts + slides in on every nav change */}
          <div key={activeNav + "-" + activeSubnav} className="animate-page-enter p-6 sm:p-8">
          {/* ════════════════════════════════════════════════════════════════════
              1. 🏠 DASHBOARD HOME OVERVIEW
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "dashboard" && (
            <div className="space-y-8 max-w-7xl mx-auto">
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-6 sm:p-8 shadow-xl">
                <div className="relative z-10 max-w-2xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold border border-white/20">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Live Owner Telemetry
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Welcome back, {selectedBusiness?.name || "Business Owner"}!
                  </h2>
                  <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                    Manage your locations, track customer engagement metrics, respond to reviews, and promote special offers across all 195 countries.
                  </p>
                </div>
              </div>

              {/* 8 Primary Statistics Cards — powered by live analytics API */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {[
                  { icon: "🏢", label: "Businesses", value: businesses.length.toString(), change: "Active", loading: false },
                  {
                    icon: "👁️", label: "Total Views",
                    value: (globalAnalyticsStats?.totalViews ?? dashboardAnalyticsStats?.totalViews)?.toLocaleString() || (isGlobalStatsLoading ? "…" : "0"),
                    change: globalAnalyticsStats?.totalViews ? "+Live" : "+18.4%", loading: isGlobalStatsLoading,
                  },
                  {
                    icon: "🔎", label: "Impressions",
                    value: (globalAnalyticsStats?.totalSearches ?? dashboardAnalyticsStats?.totalSearches)?.toLocaleString() || (isGlobalStatsLoading ? "…" : "0"),
                    change: globalAnalyticsStats?.totalSearches ? "+Live" : "+29.1%", loading: isGlobalStatsLoading,
                  },
                  { icon: "⭐", label: "Avg Rating", value: `${selectedBusiness?.ratingAvg?.toFixed(1) || 4.7}`, change: "Top 5%", loading: false },
                  { icon: "💬", label: "Reviews", value: `${reviews.length || 0}`, change: reviews.length > 0 ? `${reviews.length} total` : "None yet", loading: false },
                  {
                    icon: "📞", label: "Phone Calls",
                    value: (globalAnalyticsStats?.totalCalls ?? dashboardAnalyticsStats?.totalCalls)?.toLocaleString() || (isGlobalStatsLoading ? "…" : "0"),
                    change: globalAnalyticsStats?.totalCalls ? "+Live" : "+24.2%", loading: isGlobalStatsLoading,
                  },
                  {
                    icon: "🌐", label: "Web Visits",
                    value: (globalAnalyticsStats?.totalWebsites ?? dashboardAnalyticsStats?.totalWebsites)?.toLocaleString() || (isGlobalStatsLoading ? "…" : "0"),
                    change: globalAnalyticsStats?.totalWebsites ? "+Live" : "+31.0%", loading: isGlobalStatsLoading,
                  },
                  {
                    icon: "📍", label: "Directions",
                    value: (globalAnalyticsStats?.totalDirections ?? dashboardAnalyticsStats?.totalDirections)?.toLocaleString() || (isGlobalStatsLoading ? "…" : "0"),
                    change: globalAnalyticsStats?.totalDirections ? "+Live" : "+15.7%", loading: isGlobalStatsLoading,
                  },
                ].map((stat, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-card border border-border shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase truncate">{stat.label}</div>
                      <div className={`text-lg font-black text-foreground mt-0.5 ${stat.loading ? "animate-pulse text-muted-foreground" : ""}`}>{stat.value}</div>
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{stat.change}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row: Business Views + Customer Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart 1: Business Views (Area) */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-base text-foreground flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-indigo-500" />
                        Business Profile Views (Last 7 Days)
                      </h3>
                      <p className="text-xs text-muted-foreground">Daily unique impressions and customer visits</p>
                    </div>
                    <Badge className="bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 text-xs font-bold">
                      +18.4% WoW
                    </Badge>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={liveChartData}>
                        <defs>
                          <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#1e1b4b", borderRadius: "1rem", color: "#fff" }} />
                        <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fill="url(#viewGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Customer Actions (Bar) */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-base text-foreground flex items-center gap-2">
                        <MousePointerClick className="w-4 h-4 text-emerald-500" />
                        Customer Conversion Actions
                      </h3>
                      <p className="text-xs text-muted-foreground">Calls, directions requests, and web clicks</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold">
                      High Intent
                    </Badge>
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={liveChartData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: "#064e3b", borderRadius: "1rem", color: "#fff" }} />
                        <Bar dataKey="calls" fill="#10b981" radius={[4, 4, 0, 0]} name="Phone Calls" />
                        <Bar dataKey="directions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Directions" />
                        <Bar dataKey="clicks" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Web Clicks" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Recent Reviews + Business Status Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Reviews Preview */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-base text-foreground flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      Recent Customer Reviews
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveNav("reviews")}
                      className="text-xs font-bold text-primary"
                    >
                      View All ({reviews.length}) →
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((r) => (
                      <div key={r.id} className="p-3.5 rounded-2xl bg-muted/40 border border-border/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">{r.userName}</span>
                          <span className="text-amber-500 font-black">{"★".repeat(r.rating)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{r.comment}</p>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                          <span>{r.createdAt?.split("T")[0]}</span>
                          {r.reply ? (
                            <span className="text-emerald-600 font-bold">✓ Replied</span>
                          ) : (
                            <button
                              onClick={() => {
                                setActiveNav("reviews");
                                setReplyingReviewId(r.id);
                              }}
                              className="text-primary font-bold hover:underline"
                            >
                              Reply to customer →
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Status Roster */}
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-black text-base text-foreground flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      Owned Business Listings Status
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveNav("businesses")}
                      className="text-xs font-bold text-primary"
                    >
                      Manage Listings →
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {businesses.map((biz) => (
                      <div key={biz.id} className="p-3.5 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={biz.coverUrl || "/placeholder-business.jpg"} alt={biz.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-foreground">{biz.name}</div>
                            <div className="text-xs text-muted-foreground">{biz.categoryName} • {biz.addressLine}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                            🟢 Active
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedBusiness(biz);
                              setIsEditListingOpen(true);
                            }}
                            className="h-7 text-xs font-semibold px-2"
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              2. 🏢 MY BUSINESSES
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "businesses" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Top Title & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-black border border-primary/20">
                      <Building2 className="w-3.5 h-3.5" />
                      Live Business Management
                    </span>
                    <span className="text-xs text-muted-foreground">• Exactly 20 Listings / Page</span>
                  </div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">
                    My Business Directory Portfolio
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Register, monitor, edit, and manage all your live business listings with real MongoDB synchronization.
                  </p>
                </div>

                <div className="flex items-center flex-wrap gap-2.5">
                  {/* Portfolio Scope Switcher */}
                  <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setPortfolioScope("my");
                        setBizPage(1);
                        fetchBusinesses(1, "my");
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                        portfolioScope === "my"
                          ? "bg-background text-foreground shadow-sm font-black"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🏢 My Registered
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPortfolioScope("corporate");
                        setBizPage(1);
                        fetchBusinesses(1, "corporate");
                      }}
                      className={`px-3 py-1.5 rounded-lg transition-all text-xs font-bold ${
                        portfolioScope === "corporate"
                          ? "bg-background text-foreground shadow-sm font-black"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🌐 Corporate (514)
                    </button>
                  </div>

                  {/* Export Buttons */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportDashboardBusinesses("csv")}
                    disabled={isExportingBiz || isBizLoading}
                    className="gap-1.5 text-xs font-bold shrink-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs h-9"
                    title="Download business portfolio in Excel/Spreadsheet CSV format"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExportingBiz ? "animate-bounce" : ""}`} />
                    {isExportingBiz ? "Exporting…" : "Export CSV"}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportDashboardBusinesses("json")}
                    disabled={isExportingBiz || isBizLoading}
                    className="gap-1.5 text-xs font-bold shrink-0 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 shadow-xs h-9"
                    title="Download business portfolio in JSON format"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Export JSON
                  </Button>

                  <Link href="/dashboard/listings/new" target="_blank">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold gap-1.5 h-9"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Fullscreen Wizard
                    </Button>
                  </Link>

                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => setActiveSubnav("add")}
                    className="gap-1.5 text-xs font-bold shadow-md h-9"
                  >
                    <PlusCircle className="w-4 h-4" /> Add New Business
                  </Button>
                </div>
              </div>

              {/* Portfolio Performance Metrics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground font-semibold">Total Businesses</div>
                    <div className="text-xl font-black text-foreground">{bizTotalCount}</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground font-semibold">Active & Open</div>
                    <div className="text-xl font-black text-foreground">
                      {businesses.filter((b) => b.status === "open").length} on page
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground font-semibold">Avg Rating</div>
                    <div className="text-xl font-black text-foreground">
                      {(
                        businesses.reduce((acc, b) => acc + (b.ratingAvg || 4.5), 0) /
                        (businesses.length || 1)
                      ).toFixed(1)} ★
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-muted-foreground font-semibold">Page Views</div>
                    <div className="text-xl font-black text-foreground">
                      {businesses.reduce((acc, b) => acc + (b.viewCount || 240), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Subnav Tabs & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { key: "all", label: "All Businesses", count: bizTotalCount },
                    { key: "active", label: "🟢 Open Now" },
                    { key: "temporarily_closed", label: "🟡 Closed" },
                    { key: "verified", label: "🛡️ Verified Only" },
                    { key: "add", label: "âž• Add New Business" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveSubnav(tab.key);
                        if (tab.key !== "add") {
                          const statusVal = tab.key === "active" ? "open" : tab.key === "temporarily_closed" ? "temporarily_closed" : tab.key === "verified" ? "verified" : "all";
                          setBizStatusFilter(statusVal);
                          setBizPage(1);
                          fetchBusinesses(1, portfolioScope, statusVal);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                        activeSubnav === tab.key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {tab.label}
                      {tab.count !== undefined && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          activeSubnav === tab.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                        }`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* View Mode Toggle, Country/City Filters & Search */}
                {activeSubnav !== "add" && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Search */}
                    <div className="relative w-44 sm:w-52">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={bizSearch}
                        onChange={(e) => setBizSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            setBizPage(1);
                            fetchBusinesses(1, portfolioScope, bizStatusFilter, bizSearch, bizSort, bizFilterCountry, bizFilterCity);
                          }
                        }}
                        placeholder="Search name, category..."
                        className="pl-8 h-8 text-xs rounded-xl"
                      />
                    </div>

                    {/* Country Filter Dropdown */}
                    <div className="relative min-w-[140px]">
                      <Globe className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select
                        value={bizFilterCountry}
                        onChange={(e) => {
                          setBizFilterCountry(e.target.value);
                          setBizFilterCity("all");
                          setBizPage(1);
                          fetchBusinesses(1, portfolioScope, bizStatusFilter, bizSearch, bizSort, e.target.value, "all");
                        }}
                        className="w-full h-8 pl-7 pr-6 text-xs rounded-xl bg-card border border-border text-foreground font-medium focus:ring-1 focus:ring-primary focus:outline-none transition-all cursor-pointer appearance-none"
                      >
                        <option value="all">🌍 All Countries</option>
                        {COUNTRIES_WITH_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                    </div>

                    {/* City Filter Dropdown */}
                    <div className="relative min-w-[140px]">
                      <MapPin className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select
                        value={bizFilterCity}
                        onChange={(e) => {
                          setBizFilterCity(e.target.value);
                          setBizPage(1);
                          fetchBusinesses(1, portfolioScope, bizStatusFilter, bizSearch, bizSort, bizFilterCountry, e.target.value);
                        }}
                        className="w-full h-8 pl-7 pr-6 text-xs rounded-xl bg-card border border-border text-foreground font-medium focus:ring-1 focus:ring-primary focus:outline-none transition-all cursor-pointer appearance-none"
                      >
                        <option value="all">📍 All Cities</option>
                        {bizFilterCities.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                        {bizFilterCountry === "all" && (
                          <>
                            <option value="Addis Ababa">Addis Ababa (Ethiopia)</option>
                            <option value="Nairobi">Nairobi (Kenya)</option>
                            <option value="New York">New York (USA)</option>
                            <option value="London">London (UK)</option>
                            <option value="Toronto">Toronto (Canada)</option>
                            <option value="Dubai">Dubai (UAE)</option>
                          </>
                        )}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                    </div>

                    {/* Reset Filters */}
                    {(bizFilterCountry !== "all" || bizFilterCity !== "all" || bizSearch.trim()) && (
                      <button
                        onClick={() => {
                          setBizFilterCountry("all");
                          setBizFilterCity("all");
                          setBizSearch("");
                          setBizPage(1);
                          fetchBusinesses(1, portfolioScope, bizStatusFilter, "", bizSort, "all", "all");
                        }}
                        className="px-2 py-1 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[11px] font-bold transition-colors shrink-0"
                      >
                        Reset
                      </button>
                    )}

                    <div className="flex items-center bg-muted/60 p-0.5 rounded-xl border border-border">
                      <button
                        type="button"
                        onClick={() => setBizViewMode("table")}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                          bizViewMode === "table"
                            ? "bg-background text-foreground shadow-xs font-black"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Table View"
                      >
                        📋 Table
                      </button>
                      <button
                        type="button"
                        onClick={() => setBizViewMode("grid")}
                        className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                          bizViewMode === "grid"
                            ? "bg-background text-foreground shadow-xs font-black"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        title="Card Grid View"
                      >
                        🎴 Cards
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {activeSubnav === "add" ? (
                /* Full 7-Step Registration Wizard (shared component) */
                <div className="w-full">
                  <EmbeddedListingWizard
                    mode="embedded"
                    onSuccess={handleWizardSuccess}
                    onCancel={() => setActiveSubnav("all")}
                  />
                </div>
              ) : (
                /* ─── 20-PER-PAGE BUSINESS LISTING VIEW ─── */
                <div className="space-y-4">
                  {/* Multi-Tier Approval Pipeline Status Tracker for Owner */}
                  {businesses.some((b) => b.approvalStatus && b.approvalStatus !== "approved") && (
                    <div className="p-5 rounded-3xl border border-indigo-500/30 bg-card shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
                            <Clock className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                              Multi-Tier Verification Pipeline
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">
                                Approval in Progress
                              </span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Listings are reviewed by City Admin &rarr; Country Lead &rarr; Super Admin before public posting.
                            </p>
                          </div>
                        </div>
                      </div>

                      {businesses
                        .filter((b) => b.approvalStatus && b.approvalStatus !== "approved")
                        .map((biz) => {
                          const isCityApproved = biz.approvedByCity?.approved || biz.approvalStatus === "pending_country" || biz.approvalStatus === "pending_super_admin";
                          const isCountryApproved = biz.approvedByCountry?.approved || biz.approvalStatus === "pending_super_admin";
                          const isSuperApproved = biz.approvalStatus === "approved";
                          const isRejected = biz.approvalStatus === "rejected";

                          return (
                            <div key={biz.id} className="p-4 rounded-2xl border border-border/80 bg-muted/20 space-y-3">
                              <div className="flex items-center justify-between text-xs">
                                <div className="font-bold text-foreground flex items-center gap-2">
                                  <span>{biz.name}</span>
                                  <span className="text-[10px] text-muted-foreground font-normal">
                                    ({biz.cityName || "City"}, {biz.countryName || "Country"})
                                  </span>
                                </div>
                                <span className="text-[11px] font-semibold text-muted-foreground">
                                  ID: {biz.id}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                                {/* Stage 1: City Admin */}
                                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                                  isCityApproved
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : biz.approvalStatus === "pending_city"
                                    ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                                    : "border-border bg-muted/30 text-muted-foreground"
                                }`}>
                                  <div className="flex items-center justify-between font-bold">
                                    <span>1. City Admin</span>
                                    {isCityApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />}
                                  </div>
                                  <div className="text-[11px]">
                                    {isCityApproved ? "Approved & Forwarded" : "Under Local Inspection"}
                                  </div>
                                </div>

                                {/* Stage 2: Country Lead */}
                                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                                  isCountryApproved
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : biz.approvalStatus === "pending_country"
                                    ? "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                                    : "border-border bg-muted/30 text-muted-foreground opacity-75"
                                }`}>
                                  <div className="flex items-center justify-between font-bold">
                                    <span>2. Country Lead</span>
                                    {isCountryApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : biz.approvalStatus === "pending_country" ? <Clock className="w-3.5 h-3.5 text-blue-500 animate-pulse" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                  </div>
                                  <div className="text-[11px]">
                                    {isCountryApproved ? "National Compliance Verified" : biz.approvalStatus === "pending_country" ? "Reviewing Compliance" : "Awaiting City Approval"}
                                  </div>
                                </div>

                                {/* Stage 3: Super Admin */}
                                <div className={`p-3 rounded-xl border text-xs space-y-1 ${
                                  isSuperApproved
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    : biz.approvalStatus === "pending_super_admin"
                                    ? "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-400"
                                    : "border-border bg-muted/30 text-muted-foreground opacity-75"
                                }`}>
                                  <div className="flex items-center justify-between font-bold">
                                    <span>3. Super Admin</span>
                                    {isSuperApproved ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : biz.approvalStatus === "pending_super_admin" ? <Clock className="w-3.5 h-3.5 text-purple-500 animate-pulse" /> : <Crown className="w-3.5 h-3.5" />}
                                  </div>
                                  <div className="text-[11px]">
                                    {isSuperApproved ? "Published Live" : biz.approvalStatus === "pending_super_admin" ? "Ready for Final Sign-Off" : "Queued (or Fast-Track)"}
                                  </div>
                                </div>
                              </div>

                              {isRejected && (
                                <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-medium">
                                  <strong>Reason for Rejection:</strong> {biz.rejectionReason || "Listing did not meet municipal guidelines. Please revise."}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* ── ⏱️ 4-Month Directory Health & Subscription Lifecycle Banner ── */}
                  {businesses.some((b) => {
                    const regDate = b.registeredAt ? new Date(b.registeredAt) : (b.createdAt ? new Date(b.createdAt) : new Date());
                    const valDate = b.validationDate ? new Date(b.validationDate) : undefined;
                    const startDate = valDate || regDate;
                    const daysElapsed = Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000));
                    return daysElapsed >= 120 || b.existenceStatus === "pending_confirmation" || b.subscriptionStatus === "due";
                  }) && (
                    <div className="p-5 rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-background to-indigo-500/5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                            <CalendarClock className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                              4-Month Directory Verification & Subscription Renewal
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 border border-rose-500/30 animate-pulse">
                                Action Required
                              </span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Platform policy requires listings at 4 months to confirm operational existence and renew directory subscription.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {businesses
                          .filter((b) => {
                            const regDate = b.registeredAt ? new Date(b.registeredAt) : (b.createdAt ? new Date(b.createdAt) : new Date());
                            const valDate = b.validationDate ? new Date(b.validationDate) : undefined;
                            const startDate = valDate || regDate;
                            const daysElapsed = Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000));
                            return daysElapsed >= 120 || b.existenceStatus === "pending_confirmation" || b.subscriptionStatus === "due";
                          })
                          .map((biz) => {
                            const regDate = biz.registeredAt ? new Date(biz.registeredAt) : (biz.createdAt ? new Date(biz.createdAt) : new Date());
                            const valDate = biz.validationDate ? new Date(biz.validationDate) : undefined;
                            const startDate = valDate || regDate;
                            const daysElapsed = Math.floor((Date.now() - startDate.getTime()) / (24 * 60 * 60 * 1000));

                            return (
                              <div key={biz.id} className="p-4 rounded-2xl border border-border/80 bg-card shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="font-bold text-foreground flex items-center gap-2">
                                    <span>{biz.name}</span>
                                    <span className="text-[10px] text-muted-foreground font-normal">
                                      ({biz.cityName || "City"}, {biz.countryName || "Country"})
                                    </span>
                                    {biz.existenceStatus === "confirmed" ? (
                                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 text-[9px] font-bold">
                                        ✓ Confirmed Operating
                                      </Badge>
                                    ) : (
                                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 text-[9px] font-bold">
                                        Pending Confirmation
                                      </Badge>
                                    )}
                                    {biz.subscriptionStatus === "due" && (
                                      <Badge className="bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30 text-[9px] font-bold">
                                        Fee Due (1,499 ETB)
                                      </Badge>
                                    )}
                                  </div>

                                  <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                                    <span>Registered: <strong>{regDate.toLocaleDateString()}</strong></span>
                                    {valDate && <span>• Validated: <strong>{valDate.toLocaleDateString()}</strong></span>}
                                    <span>• Cycle: <strong className="text-amber-600 dark:text-amber-400">{daysElapsed} days completed</strong></span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap shrink-0">
                                  {/* 1-Click Confirm Existence */}
                                  <Button
                                    size="sm"
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/businesses/${biz.id}/confirm-existence`, {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({
                                            actorName: user?.fullName || "Business Owner",
                                            actorRole: "owner",
                                            notes: "Confirmed active by owner from dashboard review card.",
                                          }),
                                        });
                                        const data = await res.json();
                                        if (data.success) {
                                          toast.success(`✨ Business Confirmed!`, {
                                            description: `"${biz.name}" is verified active for the next 4 months.`,
                                          });
                                          setBusinesses((prev) =>
                                            prev.map((b) => (b.id === biz.id ? { ...b, existenceStatus: "confirmed" } : b))
                                          );
                                        }
                                      } catch (err) {
                                        toast.error("Failed to confirm business existence.");
                                      }
                                    }}
                                    className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 rounded-xl shadow-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Confirm Business Exists</span>
                                  </Button>

                                  {/* 1-Click Pay Subscription */}
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      window.location.href = `/billing?businessId=${biz.id}`;
                                    }}
                                    className="h-8 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 rounded-xl shadow-xs"
                                  >
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Pay Subscription Fee</span>
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}

                  {isBizLoading ? (
                    <div className="p-12 text-center rounded-3xl bg-card border border-border shadow-xs space-y-3">
                      <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin" />
                      <div className="text-sm font-bold text-foreground">Loading portfolio listings...</div>
                      <p className="text-xs text-muted-foreground">Fetching live business records from MongoDB (20 per page)</p>
                    </div>
                  ) : businesses.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-card border border-border shadow-xs space-y-4 max-w-lg mx-auto my-8">
                      <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                        <Building2 className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black text-foreground">No Businesses Found</h3>
                        <p className="text-xs text-muted-foreground">
                          {portfolioScope === "my"
                            ? "You haven't registered any businesses under this account yet. Launch the wizard to create your first listing, or switch to the Corporate portfolio to view 500+ records."
                            : "No businesses matching the selected status or search filter."}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-2">
                        {portfolioScope === "my" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setPortfolioScope("corporate");
                              setBizPage(1);
                              fetchBusinesses(1, "corporate");
                            }}
                            className="text-xs font-bold"
                          >
                            View Corporate (514)
                          </Button>
                        )}
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => setActiveSubnav("add")}
                          className="text-xs font-bold gap-1.5 shadow-md"
                        >
                          <PlusCircle className="w-4 h-4" /> Add Business Listing
                        </Button>
                      </div>
                    </div>
                  ) : bizViewMode === "table" ? (
                    /* Table View */
                    <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                            <tr>
                              <th className="px-5 py-3.5">Business</th>
                              <th className="px-5 py-3.5">Category</th>
                              <th className="px-5 py-3.5">Location</th>
                              <th className="px-5 py-3.5">Status</th>
                              <th className="px-5 py-3.5">Performance</th>
                              <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60 font-medium">
                            {businesses.map((biz) => (
                              <tr key={biz.id} className="hover:bg-muted/30 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-border/60">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={biz.coverUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80"}
                                        alt={biz.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&q=80";
                                        }}
                                      />
                                    </div>
                                    <div className="max-w-[200px]">
                                      <div className="font-bold text-foreground text-xs sm:text-sm truncate">
                                        {biz.name}
                                      </div>
                                      <div className="text-[11px] text-muted-foreground truncate">
                                        {biz.telephone || biz.mobile || "No telephone"}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="font-bold text-foreground block truncate max-w-[150px]">
                                    {biz.categoryName}
                                  </span>
                                  {biz.subcategoryName && (
                                    <span className="text-[10px] text-muted-foreground block truncate max-w-[150px]">
                                      {biz.subcategoryName}
                                    </span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-muted-foreground">
                                  <span className="text-foreground font-semibold block truncate max-w-[150px]">
                                    {biz.cityName || "City"}, {biz.countryName || "Country"}
                                  </span>
                                  <span className="text-[10px] block truncate max-w-[150px]">
                                    {biz.addressLine}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5">
                                      <button
                                        type="button"
                                        onClick={() => handleToggleStatus(biz)}
                                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                          biz.status === "open"
                                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                                            : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                                        }`}
                                        title="Click to toggle Open / Closed status"
                                      >
                                        {biz.status === "open" ? "🟢 Open" : "🟡 Closed"}
                                      </button>
                                      {biz.isVerified && (
                                        <span title="Verified Business" className="text-blue-500 text-xs font-bold">
                                          🛡️
                                        </span>
                                      )}
                                    </div>
                                    {/* Multi-tier approval badge */}
                                    {biz.approvalStatus === "pending_city" && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                        <Clock className="w-2.5 h-2.5 animate-pulse" /> Stage 1: City Review
                                      </span>
                                    )}
                                    {biz.approvalStatus === "pending_country" && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                                        <ShieldCheck className="w-2.5 h-2.5" /> Stage 2: Country Lead
                                      </span>
                                    )}
                                    {biz.approvalStatus === "pending_super_admin" && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                                        <Crown className="w-2.5 h-2.5" /> Stage 3: Super Admin
                                      </span>
                                    )}
                                    {(biz.approvalStatus === "approved" || (biz.isVerified && !biz.approvalStatus)) && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                        <CheckCircle2 className="w-2.5 h-2.5" /> Published Live
                                      </span>
                                    )}
                                    {biz.approvalStatus === "rejected" && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                        <XCircle className="w-2.5 h-2.5" /> Rejected
                                      </span>
                                    )}
                                    {/* ── 4-Month Audit Lifecycle Badges ── */}
                                    {(biz.existenceStatus === "pending_confirmation" || biz.existenceStatus === "unconfirmed") && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 animate-pulse">
                                        <AlertTriangle className="w-2.5 h-2.5" /> ⚠️ Confirm Existence
                                      </span>
                                    )}
                                    {(biz.subscriptionStatus === "due" || biz.subscriptionStatus === "past_due") && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-500/20">
                                        <CreditCard className="w-2.5 h-2.5" /> 💳 Fee Due
                                      </span>
                                    )}
                                    {biz.subscriptionStatus === "active" && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                                        ✨ Subscribed
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-3.5">
                                  <div className="font-black text-foreground text-xs">
                                    ⭐ {(biz.ratingAvg || 4.8).toFixed(1)}
                                    <span className="text-muted-foreground font-normal ml-1">
                                      ({biz.reviewCount || 12})
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-muted-foreground">
                                    {(biz.viewCount || 240).toLocaleString()} views
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-right space-x-1">
                                  <Link href={`/business/${biz.id}`} target="_blank">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 text-xs text-primary font-semibold px-2"
                                      title="Preview Public Page"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Button>
                                  </Link>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedBusiness(biz);
                                      setIsEditListingOpen(true);
                                    }}
                                    className="h-7 text-xs font-semibold px-2"
                                  >
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setBusinessToDelete(biz)}
                                    className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-500/10 px-2"
                                    title="Delete Listing"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    /* Card Grid View */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {businesses.map((biz) => (
                        <div
                          key={biz.id}
                          className="rounded-3xl bg-card border border-border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                        >
                          <div className="w-full h-36 relative bg-muted">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={biz.coverUrl || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80"}
                              alt={biz.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80";
                              }}
                            />
                            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(biz)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border backdrop-blur-xs ${
                                  biz.status === "open"
                                    ? "bg-emerald-500/90 text-white border-emerald-400"
                                    : "bg-amber-500/90 text-white border-amber-400"
                                }`}
                              >
                                {biz.status === "open" ? "Open" : "Closed"}
                              </button>
                            </div>
                            <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                              {biz.categoryName}
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="font-black text-sm text-foreground line-clamp-1">{biz.name}</h4>
                                <span className="font-bold text-xs text-amber-500 shrink-0">
                                  ⭐ {(biz.ratingAvg || 4.8).toFixed(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 line-clamp-1">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                <span>{biz.addressLine || `${biz.cityName}, ${biz.countryName}`}</span>
                              </div>
                              {biz.telephone && (
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                                  <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{biz.telephone}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border gap-2">
                              <Link href={`/business/${biz.id}`} target="_blank">
                                <Button size="sm" variant="ghost" className="h-7 text-xs text-primary font-semibold px-2">
                                  Preview ↗
                                </Button>
                              </Link>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBusiness(biz);
                                    setIsEditListingOpen(true);
                                  }}
                                  className="h-7 text-xs font-semibold px-2.5"
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setBusinessToDelete(biz)}
                                  className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-500/10 px-2"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ─── 20-PER-PAGE MODERN PAGINATION CONTROLS ─── */}
                  {businesses.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border shadow-xs">
                      {/* Left: Range and Totals indicator */}
                      <div className="text-xs text-muted-foreground font-medium">
                        Showing <strong className="text-foreground font-bold">{(bizPage - 1) * 20 + 1}</strong> to{" "}
                        <strong className="text-foreground font-bold">
                          {Math.min(bizPage * 20, bizTotalCount)}
                        </strong>{" "}
                        of <strong className="text-foreground font-black">{bizTotalCount}</strong> businesses ·{" "}
                        Page <strong className="text-primary font-black">{bizPage}</strong> of{" "}
                        <strong className="text-foreground font-bold">{bizTotalPages}</strong>
                      </div>

                      {/* Right: Page Navigation Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Previous Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={bizPage <= 1 || isBizLoading}
                          onClick={() => {
                            const newPage = Math.max(1, bizPage - 1);
                            fetchBusinesses(newPage, portfolioScope, bizStatusFilter, bizSearch, bizSort);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className="h-8 px-3 text-xs font-bold gap-1 rounded-xl shadow-2xs"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" /> Previous
                        </Button>

                        {/* Smart Numbered Windowed Buttons */}
                        {(() => {
                          const pages: (number | string)[] = [];
                          if (bizTotalPages <= 7) {
                            for (let i = 1; i <= bizTotalPages; i++) pages.push(i);
                          } else {
                            pages.push(1);
                            if (bizPage > 3) pages.push("...");
                            const start = Math.max(2, bizPage - 1);
                            const end = Math.min(bizTotalPages - 1, bizPage + 1);
                            for (let i = start; i <= end; i++) pages.push(i);
                            if (bizPage < bizTotalPages - 2) pages.push("...");
                            pages.push(bizTotalPages);
                          }

                          return pages.map((p, idx) => {
                            if (typeof p === "string") {
                              return (
                                <span key={`ellipsis-${idx}`} className="px-1 text-xs text-muted-foreground font-bold">
                                  ...
                                </span>
                              );
                            }
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => {
                                  fetchBusinesses(p, portfolioScope, bizStatusFilter, bizSearch, bizSort);
                                  window.scrollTo({ top: 400, behavior: "smooth" });
                                }}
                                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                                  bizPage === p
                                    ? "bg-primary text-primary-foreground font-black shadow-sm"
                                    : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                              >
                                {p}
                              </button>
                            );
                          });
                        })()}

                        {/* Next Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={bizPage >= bizTotalPages || isBizLoading}
                          onClick={() => {
                            const newPage = Math.min(bizTotalPages, bizPage + 1);
                            fetchBusinesses(newPage, portfolioScope, bizStatusFilter, bizSearch, bizSort);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className="h-8 px-3 text-xs font-bold gap-1 rounded-xl shadow-2xs"
                        >
                          Next <ChevronRight className="w-3.5 h-3.5" />
                        </Button>

                        {/* Fast Jump Input */}
                        {bizTotalPages > 3 && (
                          <div className="flex items-center gap-1 pl-2 border-l border-border ml-1">
                            <span className="text-[11px] text-muted-foreground font-medium">Jump:</span>
                            <input
                              type="number"
                              min={1}
                              max={bizTotalPages}
                              defaultValue={bizPage}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const val = parseInt((e.target as HTMLInputElement).value);
                                  if (val >= 1 && val <= bizTotalPages) {
                                    fetchBusinesses(val, portfolioScope, bizStatusFilter, bizSearch, bizSort);
                                  }
                                }
                              }}
                              className="w-12 h-8 text-center text-xs font-bold rounded-lg border border-input bg-background"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Business Confirmation Dialog */}
              <Dialog
                open={!!businessToDelete}
                onOpenChange={(open) => {
                  if (!open) setBusinessToDelete(null);
                }}
              >
                <DialogContent className="max-w-md p-6 rounded-3xl">
                  <DialogHeader className="space-y-2">
                    <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mb-1">
                      <Trash2 className="w-5 h-5" />
                    </div>
                    <DialogTitle className="text-lg font-black text-foreground">
                      Delete Business Listing?
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                      Are you sure you want to permanently delete{" "}
                      <strong className="text-foreground font-bold">
                        {businessToDelete?.name}
                      </strong>
                      ? This will remove its public listing, reviews, and media from the MongoDB database.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex items-center justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setBusinessToDelete(null)}
                      disabled={isDeletingBiz}
                      className="text-xs font-bold rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDeleteBusiness}
                      disabled={isDeletingBiz}
                      className="text-xs font-bold rounded-xl gap-1.5"
                    >
                      {isDeletingBiz ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" /> Delete Listing
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              3. 📋 BUSINESS MANAGEMENT HUB — Fully Functional 6-Tab System
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "management" && (
            <div className="space-y-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-black border border-blue-500/20">
                        <Sliders className="w-3 h-3" /> Management Hub
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-foreground tracking-tight">
                      {selectedBusiness.name} — Management
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Configure your business profile, branch network, services, hours, and contact channels.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditListingOpen(true)}
                      className="gap-1.5 text-xs font-bold"
                    >
                      <Edit className="w-3.5 h-3.5" /> Full Profile Editor
                    </Button>
                    <Link href={`/business/${selectedBusiness?.id}`} target="_blank">
                      <Button size="sm" variant="ghost" className="gap-1.5 text-xs font-bold text-primary">
                        <ExternalLink className="w-3.5 h-3.5" /> Live Preview
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Quick KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { icon: "📋", label: "Services Listed", value: (selectedBusiness.services || []).length, color: "indigo" },
                    { icon: "📍", label: "Branch Locations", value: branches.length, color: "emerald" },
                    { icon: "⏰", label: "Operating Days", value: (selectedBusiness.openingHours || []).filter((h: any) => !h.isClosed).length, color: "amber" },
                    { icon: "🛡️", label: "Verification", value: selectedBusiness.isVerified ? "Verified" : "Pending", color: "blue" },
                  ].map((kpi, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-card border border-border shadow-xs flex items-center gap-3">
                      <div className="text-2xl">{kpi.icon}</div>
                      <div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase">{kpi.label}</div>
                        <div className="text-lg font-black text-foreground">{kpi.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── 4-Month Audit Lifecycle Card ── */}
                <BusinessAuditStatusCard
                  business={selectedBusiness}
                  onRefresh={() => {
                    fetch(`/api/businesses/${selectedBusiness.id}`)
                      .then((r) => r.json())
                      .then((d) => {
                        if (d.business) {
                          setBusinesses((prev: any[]) =>
                            prev.map((b: any) => (b.id === d.business.id ? d.business : b))
                          );
                          if (selectedBusiness?.id === d.business.id) setSelectedBusiness(d.business);
                        }
                      })
                      .catch(console.error);
                  }}
                  className="mb-2"
                />

                {renderSubnavTabs([
                  { key: "info", label: "📝 Business Info" },
                  { key: "categories", label: "🏷️ Categories", count: categories.length },
                  { key: "locations", label: "📍 Branches", count: branches.length },
                  { key: "contact", label: "📞 Contact & Socials" },
                  { key: "hours", label: "⏰ Operating Hours" },
                  { key: "services", label: "🛎️ Services Menu", count: (selectedBusiness.services || []).length },
                ])}

                {/* ──────────────────────────────────────────────────────────── */}
                {/* TAB 1: BUSINESS INFO */}
                {/* ──────────────────────────────────────────────────────────── */}
                {activeSubnav === "info" && (
                  <div className="space-y-6">
                    {/* Core Profile Card */}
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-5">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <h3 className="font-black text-base text-foreground flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-500" /> Core Business Profile
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">Update and sync your public business listing directly in MongoDB.</p>
                        </div>
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={saveBusinessInfo}
                          disabled={mgmtSaving}
                          className="gap-1.5 text-xs font-bold"
                        >
                          {mgmtSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save & Sync to DB</>}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Business Legal Name *</label>
                          <Input
                            value={editBiz.name}
                            onChange={e => setEditBiz({ ...editBiz, name: e.target.value })}
                            className="font-semibold"
                            placeholder="Official business name"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Industry / Category</label>
                          <div className="flex gap-2">
                            <Input value={editBiz.categoryName} readOnly className="bg-muted/40 font-semibold flex-1" />
                            <Badge className="self-center bg-primary/10 text-primary border-primary/20 text-[10px] font-bold whitespace-nowrap shrink-0">
                              {editBiz.subcategoryName || "Level 1"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Business Tagline / Slogan</label>
                          <Input
                            value={(editBiz as any).shortDescription || ""}
                            onChange={e => setEditBiz({ ...editBiz, shortDescription: e.target.value } as any)}
                            placeholder="What makes your business unique in one line"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Year Established</label>
                          <Input
                            type="number"
                            value={(editBiz as any).yearEstablished || ""}
                            onChange={e => setEditBiz({ ...editBiz, yearEstablished: parseInt(e.target.value) } as any)}
                            placeholder="e.g. 2010"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Business Scale</label>
                          <select
                            value={(editBiz as any).businessLevel || "Small"}
                            onChange={e => setEditBiz({ ...editBiz, businessLevel: e.target.value } as any)}
                            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {["Small", "Medium", "Large", "International"].map(l => <option key={l} value={l}>{l} Business</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Price Tier</label>
                          <select
                            value={(editBiz.attributes as any)?.priceTier || "$"}
                            onChange={e => setEditBiz({ ...editBiz, attributes: { ...editBiz.attributes, priceTier: e.target.value as any } })}
                            className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            {["$", "$$", "$$$", "$$$$"].map(t => <option key={t} value={t}>{t} {t === "$" ? "— Budget" : t === "$$" ? "— Mid-Range" : t === "$$$" ? "— Premium" : "— Luxury"}</option>)}
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-bold text-muted-foreground block mb-1.5">Detailed Description</label>
                          <Textarea
                            value={editBiz.description}
                            onChange={e => setEditBiz({ ...editBiz, description: e.target.value })}
                            rows={4}
                            className="resize-none"
                            placeholder="Tell customers about your story, specialties, and what makes you unique..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Location Block */}
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                      <h3 className="font-black text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
                        <MapPin className="w-4 h-4 text-emerald-500" /> Primary Location Address
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Country</label>
                          <Input value={editBiz.countryName || ""} onChange={e => setEditBiz({ ...editBiz, countryName: e.target.value })} placeholder="Country" />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">City</label>
                          <Input value={editBiz.cityName || ""} onChange={e => setEditBiz({ ...editBiz, cityName: e.target.value })} placeholder="City" />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">District / Subcity</label>
                          <Input value={editBiz.districtName || ""} onChange={e => setEditBiz({ ...editBiz, districtName: e.target.value })} placeholder="District" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="font-bold text-muted-foreground block mb-1.5">Full Address Line</label>
                          <Input value={editBiz.addressLine || ""} onChange={e => setEditBiz({ ...editBiz, addressLine: e.target.value })} placeholder="Street, building name, landmark..." />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Postal Code</label>
                          <Input value={editBiz.postalCode || ""} onChange={e => setEditBiz({ ...editBiz, postalCode: e.target.value })} placeholder="P.O. Box or ZIP" />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Latitude</label>
                          <Input type="number" step="0.000001" value={editBiz.latitude || ""} onChange={e => setEditBiz({ ...editBiz, latitude: parseFloat(e.target.value) })} placeholder="e.g. 9.010793" />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5">Longitude</label>
                          <Input type="number" step="0.000001" value={editBiz.longitude || ""} onChange={e => setEditBiz({ ...editBiz, longitude: parseFloat(e.target.value) })} placeholder="e.g. 38.761252" />
                        </div>
                        <div>
                          <label className="font-bold text-muted-foreground block mb-1.5 invisible">Map</label>
                          <a
                            href={`https://www.google.com/maps?q=${editBiz.latitude},${editBiz.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-border bg-muted/30 text-xs font-bold text-primary hover:bg-muted transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" /> View on Google Maps
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Amenities Block */}
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                      <h3 className="font-black text-sm text-foreground flex items-center gap-2 border-b border-border pb-3">
                        <Sparkles className="w-4 h-4 text-purple-500" /> Amenities & Features
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        {[
                          { key: "wifi", label: "📶 Free Wi-Fi" },
                          { key: "parking", label: "🅿️ Parking" },
                          { key: "outdoorSeating", label: "🌿 Outdoor Seating" },
                          { key: "delivery", label: "🚗 Delivery" },
                          { key: "acceptsCards", label: "💳 Cards Accepted" },
                          { key: "airConditioning", label: "❄️ Air Conditioning" },
                          { key: "accessible", label: "♿ Wheelchair Access" },
                          { key: "reservation", label: "📅 Reservations" },
                          { key: "petFriendly", label: "🐾 Pet Friendly" },
                          { key: "takeout", label: "🥡 Takeout" },
                        ].map(f => (
                          <label key={f.key} className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${Boolean((editBiz.attributes as any)?.[f.key]) ? "border-primary/30 bg-primary/5 text-primary" : "border-border bg-muted/20 text-muted-foreground"}`}>
                            <input
                              type="checkbox"
                              checked={Boolean((editBiz.attributes as any)?.[f.key])}
                              onChange={e => setEditBiz({ ...editBiz, attributes: { ...editBiz.attributes, [f.key]: e.target.checked } })}
                              className="rounded text-primary"
                            />
                            <span className="font-bold text-[11px]">{f.label}</span>
                          </label>
                        ))}
                      </div>
                      <div className="flex justify-end pt-2">
                        <Button variant="gradient" size="sm" onClick={saveBusinessInfo} disabled={mgmtSaving} className="gap-1.5 text-xs font-bold">
                          {mgmtSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save All Changes</>}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ──────────────────────────────────────────────────────────── */}
                {/* TAB 2: CATEGORIES & TAGS */}
                {/* ──────────────────────────────────────────────────────────── */}
                {activeSubnav === "categories" && (
                  <div className="space-y-6 max-w-7xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                          <FolderTree className="w-5 h-5 text-primary" />
                          <span>Registered Business Categories & Directory Taxonomy</span>
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Real-time categories synced with MongoDB. Displaying 3 industries per page for clean management.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            fetch("/api/categories")
                              .then((res) => res.json())
                              .then((data) => {
                                if (data?.categories) {
                                  setCategories(data.categories);
                                  toast.success("Categories refreshed from database");
                                }
                              });
                          }}
                          className="gap-1 text-xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </Button>
                        <Button
                          size="sm"
                          variant="gradient"
                          onClick={() => {
                            setDefaultParentForAdd(undefined);
                            setIsAddCatModalOpen(true);
                          }}
                          className="gap-1.5 text-xs font-bold shadow-md"
                        >
                          <Plus className="w-3.5 h-3.5" /> Register Category
                        </Button>
                      </div>
                    </div>

                    <div className="relative max-w-md">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={catSearch}
                        onChange={(e) => {
                          setCatSearch(e.target.value);
                          setCatPage(1);
                        }}
                        placeholder="Search categories and specialties..."
                        className="pl-8 text-xs h-9 rounded-xl bg-card border-border"
                      />
                    </div>

                    {filteredIndustryGroups.length === 0 ? (
                      <div className="p-10 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-2">
                        <p className="font-bold">No categories match your search</p>
                        <Button size="sm" variant="outline" onClick={() => setCatSearch("")} className="text-xs">
                          Reset Filter
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {paginatedIndustries.map((ind) => (
                          <div
                            key={ind.id}
                            className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                                  <FolderTree className="w-5 h-5" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                                    {ind.name}
                                    {ind.featured && (
                                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px]">
                                        Featured
                                      </Badge>
                                    )}
                                  </h4>
                                  <p className="text-[11px] text-muted-foreground font-mono">
                                    Slug: /{ind.slug} • Level 1 Industry
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-mono">
                                  {ind.categories.length} Categories ({ind.totalCount} items)
                                </Badge>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setDefaultParentForAdd(ind.id);
                                    setIsAddCatModalOpen(true);
                                  }}
                                  className="h-7 text-xs text-primary font-bold px-2.5"
                                >
                                  <Plus className="w-3 h-3 mr-1" /> Add Subcategory
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setEditingCategory(ind)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteCategory(ind.id, ind.name)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            {ind.categories.length === 0 ? (
                              <p className="text-xs text-muted-foreground py-2 italic">
                                No child categories yet. Click "Add Subcategory" to register one.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {ind.categories.map((cat) => (
                                  <div
                                    key={cat.id}
                                    className="p-3.5 rounded-2xl bg-background border border-border hover:border-primary/40 transition-colors space-y-2"
                                  >
                                    <div className="flex items-center justify-between text-xs">
                                      <span className="font-bold text-foreground">{cat.name}</span>
                                      <div className="flex items-center gap-0.5">
                                        <button
                                          onClick={() => setEditingCategory(cat)}
                                          className="text-muted-foreground hover:text-primary p-1"
                                        >
                                          <Edit2 className="w-2.5 h-2.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                          className="text-muted-foreground hover:text-destructive p-1"
                                        >
                                          <Trash2 className="w-2.5 h-2.5" />
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {cat.subcats.map((sub) => (
                                        <Badge key={sub.id} variant="secondary" className="text-[10px]">
                                          {sub.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
                          <div className="text-xs text-muted-foreground">
                            Showing <span className="font-bold text-foreground">{(catPage - 1) * CATS_PER_PAGE + 1}</span>{" "}
                            to <span className="font-bold text-foreground">{Math.min(catPage * CATS_PER_PAGE, filteredIndustryGroups.length)}</span>{" "}
                            of <span className="font-bold text-foreground">{filteredIndustryGroups.length}</span> industries
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Button variant="outline" size="sm" disabled={catPage <= 1} onClick={() => setCatPage((p) => Math.max(1, p - 1))} className="h-8 px-3 text-xs gap-1 font-bold rounded-xl">
                              <ChevronLeft className="w-3.5 h-3.5" /> Previous
                            </Button>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: catTotalPages }, (_, i) => i + 1).map((pageNum) => (
                                <Button key={pageNum} size="sm" variant={pageNum === catPage ? "gradient" : "outline"} onClick={() => setCatPage(pageNum)} className="h-8 w-8 p-0 text-xs font-bold rounded-xl">
                                  {pageNum}
                                </Button>
                              ))}
                            </div>
                            <Button variant="outline" size="sm" disabled={catPage >= catTotalPages} onClick={() => setCatPage((p) => Math.min(catTotalPages, p + 1))} className="h-8 px-3 text-xs gap-1 font-bold rounded-xl">
                              Next <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ──────────────────────────────────────────────────────────── */}
                {/* TAB 3: BRANCH LOCATIONS */}
                {/* ──────────────────────────────────────────────────────────── */}
                {activeSubnav === "locations" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-base text-foreground flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-500" /> Branch Locations & Outlet Network
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{branches.length} registered location{branches.length !== 1 ? "s" : ""}. Manage multi-city addresses and regional contact lines.</p>
                      </div>
                      <Button size="sm" variant="gradient" onClick={() => setAddBranchOpen(!addBranchOpen)} className="gap-1.5 text-xs font-bold">
                        <PlusCircle className="w-3.5 h-3.5" /> {addBranchOpen ? "Cancel" : "Add Branch"}
                      </Button>
                    </div>

                    {/* Inline Add Branch Form */}
                    {addBranchOpen && (
                      <div className="p-5 rounded-3xl bg-primary/5 border-2 border-primary/20 shadow-sm space-y-4">
                        <h4 className="font-black text-sm text-primary flex items-center gap-2">
                          <Plus className="w-4 h-4" /> Register New Branch Location
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">Branch Name *</label>
                            <Input value={newBranchForm.branchName} onChange={e => setNewBranchForm({ ...newBranchForm, branchName: e.target.value })} placeholder="e.g. Bole Medhanialem Branch" />
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">Country</label>
                            <Input value={newBranchForm.country} onChange={e => setNewBranchForm({ ...newBranchForm, country: e.target.value })} placeholder="Country" />
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">City</label>
                            <Input value={newBranchForm.city} onChange={e => setNewBranchForm({ ...newBranchForm, city: e.target.value })} placeholder="City" />
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">District / Subcity</label>
                            <Input value={newBranchForm.district} onChange={e => setNewBranchForm({ ...newBranchForm, district: e.target.value })} placeholder="District or Subcity" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="font-bold text-muted-foreground block mb-1">Full Address *</label>
                            <Input value={newBranchForm.addressLine} onChange={e => setNewBranchForm({ ...newBranchForm, addressLine: e.target.value })} placeholder="Street address, building, landmark" />
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">Branch Phone</label>
                            <Input value={newBranchForm.phone} onChange={e => setNewBranchForm({ ...newBranchForm, phone: e.target.value })} placeholder="+251 11 xxx xxxx" />
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">Status</label>
                            <select value={newBranchForm.status} onChange={e => setNewBranchForm({ ...newBranchForm, status: e.target.value as "Active" | "Inactive" })} className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary">
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <Button size="sm" variant="gradient" onClick={addBranch} className="gap-1.5 text-xs font-bold">
                            <Check className="w-3.5 h-3.5" /> Save Branch Location
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setAddBranchOpen(false)} className="text-xs">Cancel</Button>
                        </div>
                      </div>
                    )}

                    {/* Branch Cards Grid */}
                    {branches.length === 0 ? (
                      <div className="p-16 rounded-3xl bg-card border border-dashed border-border text-center space-y-3">
                        <MapPin className="w-10 h-10 mx-auto text-muted-foreground/30" />
                        <h4 className="font-bold text-sm text-foreground">No branch locations yet</h4>
                        <p className="text-xs text-muted-foreground">Add your first branch to enable multi-location management.</p>
                        <Button size="sm" variant="gradient" onClick={() => setAddBranchOpen(true)} className="gap-1.5 text-xs">
                          <PlusCircle className="w-3.5 h-3.5" /> Add First Branch
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {branches.map((b) => (
                          <div key={b.id} className="group p-5 rounded-3xl bg-card border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => toggleBranchStatus(b.id)}
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                                    b.status === "Active"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20"
                                      : "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20"
                                  }`}
                                >
                                  {b.status === "Active" ? "🟢 Active" : "🟡 Inactive"}
                                </button>
                                <span className="text-[11px] font-semibold text-muted-foreground">{b.country}</span>
                              </div>
                              <div className="font-black text-foreground">{b.branchName}</div>
                              <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                                <span>{b.addressLine}, {b.district}, {b.city}</span>
                              </div>
                              {b.phone && (
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                  <Phone className="w-3 h-3" /> {b.phone}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between border-t border-border pt-3">
                              <a
                                href={`https://www.google.com/maps/search/${encodeURIComponent(`${b.branchName} ${b.addressLine} ${b.city}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                              >
                                <Globe className="w-3.5 h-3.5" /> View on Map
                              </a>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => deleteBranch(b.id, b.branchName)}
                                  className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ──────────────────────────────────────────────────────────── */}
                {/* TAB 4: CONTACT INFO & SOCIAL LINKS */}
                {/* ──────────────────────────────────────────────────────────── */}
                {activeSubnav === "contact" && (
                  <div className="space-y-5">
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-5">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <h3 className="font-black text-base text-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4 text-sky-500" /> Contact Channels & Digital Presence
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">All contact methods shown on your public business listing.</p>
                        </div>
                        <Button variant="gradient" size="sm" onClick={saveContactInfo} disabled={mgmtSaving} className="gap-1.5 text-xs font-bold">
                          {mgmtSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save All Contacts</>}
                        </Button>
                      </div>

                      {/* Primary Channels */}
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">📞 Primary Contact</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {[
                            { key: "telephone", label: "Office / Landline", icon: "📞", placeholder: "+251 11 661 2345" },
                            { key: "mobile", label: "Mobile Number", icon: "📱", placeholder: "+251 91 234 5678" },
                            { key: "whatsapp", label: "WhatsApp Number", icon: "💬", placeholder: "+251 91 234 5678 (WhatsApp)" },
                            { key: "email", label: "Business Email", icon: "✉️", placeholder: "info@yourbusiness.et" },
                            { key: "website", label: "Website / Online Store", icon: "🌐", placeholder: "https://yourbusiness.com" },
                            { key: "telegram", label: "Telegram Username", icon: "✈️", placeholder: "@yourbusiness" },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="font-bold text-muted-foreground block mb-1.5">{f.icon} {f.label}</label>
                              <Input
                                value={(contactForm as any)[f.key]}
                                onChange={e => setContactForm({ ...contactForm, [f.key]: e.target.value })}
                                placeholder={f.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Social Media */}
                      <div className="border-t border-border pt-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">📱 Social Media Profiles</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          {[
                            { key: "facebook", label: "Facebook Page", icon: "📘", placeholder: "https://facebook.com/yourbusiness" },
                            { key: "instagram", label: "Instagram Profile", icon: "📷", placeholder: "https://instagram.com/yourbusiness" },
                            { key: "twitter", label: "Twitter / X Handle", icon: "🐦", placeholder: "https://x.com/yourbusiness" },
                            { key: "linkedin", label: "LinkedIn Company", icon: "💼", placeholder: "https://linkedin.com/company/yourbusiness" },
                            { key: "tiktok", label: "TikTok Profile", icon: "🎵", placeholder: "https://tiktok.com/@yourbusiness" },
                            { key: "youtube", label: "YouTube Channel", icon: "▶️", placeholder: "https://youtube.com/@yourbusiness" },
                          ].map(f => (
                            <div key={f.key}>
                              <label className="font-bold text-muted-foreground block mb-1.5">{f.icon} {f.label}</label>
                              <Input
                                value={(contactForm as any)[f.key]}
                                onChange={e => setContactForm({ ...contactForm, [f.key]: e.target.value })}
                                placeholder={f.placeholder}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Preview Card */}
                      <div className="border-t border-border pt-4">
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-3">👁️ Customer-Facing Contact Preview</h4>
                        <div className="p-4 rounded-2xl bg-muted/40 border border-border grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          {contactForm.telephone && <div className="flex items-center gap-2 font-semibold"><span className="text-lg">📞</span><span>{contactForm.telephone}</span></div>}
                          {contactForm.mobile && <div className="flex items-center gap-2 font-semibold"><span className="text-lg">📱</span><span>{contactForm.mobile}</span></div>}
                          {contactForm.whatsapp && <div className="flex items-center gap-2 font-semibold"><span className="text-lg">💬</span><span>WhatsApp</span></div>}
                          {contactForm.email && <div className="flex items-center gap-2 font-semibold"><span className="text-lg">✉️</span><span>{contactForm.email}</span></div>}
                          {contactForm.website && <div className="flex items-center gap-2 font-semibold text-primary"><span className="text-lg">🌐</span><a href={contactForm.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">{contactForm.website.replace(/^https?:\/\//, "")}</a></div>}
                          {contactForm.facebook && <div className="flex items-center gap-2 font-semibold"><span className="text-lg">📘</span><span>Facebook</span></div>}
                          {contactForm.instagram && <div className="flex items-center gap-2 font-semibold"><span className="text-lg">📷</span><span>Instagram</span></div>}
                          {contactForm.telegram && <div className="flex items-center gap-2 font-semibold"><span className="text-lg">✈️</span><span>Telegram</span></div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ──────────────────────────────────────────────────────────── */}
                {/* TAB 5: OPENING HOURS */}
                {/* ──────────────────────────────────────────────────────────── */}
                {activeSubnav === "hours" && (
                  <div className="space-y-5">
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-5">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div>
                          <h3 className="font-black text-base text-foreground flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" /> Weekly Operating Schedule
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Live Status: <strong className={currentLiveStatus.isOpen ? "text-emerald-600" : "text-red-500"}>{currentLiveStatus.statusText}</strong>
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setIsHoursEditorOpen(true)} className="text-xs font-bold gap-1.5">
                            <Edit2 className="w-3.5 h-3.5" /> Advanced Editor
                          </Button>
                          <Button variant="gradient" size="sm" onClick={saveHours} disabled={mgmtSaving} className="text-xs font-bold gap-1.5">
                            {mgmtSaving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : <><Check className="w-3.5 h-3.5" /> Save Schedule</>}
                          </Button>
                        </div>
                      </div>

                      {/* 7-Day Inline Editor */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-5 gap-2 text-[10px] font-black uppercase tracking-wider text-muted-foreground px-3 pb-1">
                          <span className="col-span-1">Day</span>
                          <span className="col-span-1 text-center">Closed?</span>
                          <span className="col-span-1 text-center">24 Hours?</span>
                          <span className="col-span-1 text-center">Opens</span>
                          <span className="col-span-1 text-center">Closes</span>
                        </div>
                        {hoursLocal.map((h, idx) => (
                          <div key={h.dayOfWeek} className={`grid grid-cols-5 gap-2 items-center p-3 rounded-2xl border transition-all ${h.isClosed ? "bg-red-500/5 border-red-500/20" : h.is24h ? "bg-emerald-500/5 border-emerald-500/20" : "bg-card border-border"}`}>
                            <div className="col-span-1">
                              <span className={`text-xs font-black ${h.isClosed ? "text-red-500 line-through" : "text-foreground"}`}>{dayNames[h.dayOfWeek]}</span>
                              {h.dayOfWeek === new Date().getDay() && <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20 ml-1">Today</Badge>}
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <input
                                type="checkbox"
                                checked={h.isClosed}
                                onChange={e => {
                                  const upd = [...hoursLocal];
                                  upd[idx] = { ...h, isClosed: e.target.checked, is24h: false };
                                  setHoursLocal(upd);
                                }}
                                className="w-4 h-4 rounded text-red-500"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              <input
                                type="checkbox"
                                checked={h.is24h}
                                disabled={h.isClosed}
                                onChange={e => {
                                  const upd = [...hoursLocal];
                                  upd[idx] = { ...h, is24h: e.target.checked, isClosed: false };
                                  setHoursLocal(upd);
                                }}
                                className="w-4 h-4 rounded text-emerald-500 disabled:opacity-30"
                              />
                            </div>
                            <div className="col-span-1">
                              <input
                                type="time"
                                value={h.openTime || "08:00"}
                                disabled={h.isClosed || h.is24h}
                                onChange={e => {
                                  const upd = [...hoursLocal];
                                  upd[idx] = { ...h, openTime: e.target.value };
                                  setHoursLocal(upd);
                                }}
                                className="w-full h-9 rounded-xl border border-input bg-background px-2 text-xs font-bold disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                            <div className="col-span-1">
                              <input
                                type="time"
                                value={h.closeTime || "22:00"}
                                disabled={h.isClosed || h.is24h}
                                onChange={e => {
                                  const upd = [...hoursLocal];
                                  upd[idx] = { ...h, closeTime: e.target.value };
                                  setHoursLocal(upd);
                                }}
                                className="w-full h-9 rounded-xl border border-input bg-background px-2 text-xs font-bold disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Quick Presets */}
                      <div className="border-t border-border pt-4 space-y-2">
                        <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">âš¡ Quick Schedule Presets</h4>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { label: "Mon–Fri 9am–6pm", apply: () => setHoursLocal([0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: "09:00", closeTime: "18:00", is24h: false, isClosed: d === 0 || d === 6 }))) },
                            { label: "All Week 8am–10pm", apply: () => setHoursLocal([0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: "08:00", closeTime: "22:00", is24h: false, isClosed: false }))) },
                            { label: "24/7 Always Open", apply: () => setHoursLocal([0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: "00:00", closeTime: "00:00", is24h: true, isClosed: false }))) },
                            { label: "Weekend Only", apply: () => setHoursLocal([0,1,2,3,4,5,6].map(d => ({ dayOfWeek: d, openTime: "10:00", closeTime: "20:00", is24h: false, isClosed: !(d === 0 || d === 6) }))) },
                          ].map(preset => (
                            <Button key={preset.label} size="sm" variant="outline" onClick={preset.apply} className="text-xs font-bold h-8 rounded-xl">
                              {preset.label}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ──────────────────────────────────────────────────────────── */}
                {/* TAB 6: SERVICES MENU */}
                {/* ──────────────────────────────────────────────────────────── */}
                {activeSubnav === "services" && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-black text-base text-foreground flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-violet-500" /> Services & Menu Items
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{(selectedBusiness.services || []).length} services listed. All changes sync to MongoDB immediately.</p>
                      </div>
                      <Button size="sm" variant="gradient" onClick={() => setAddServiceOpen(!addServiceOpen)} className="gap-1.5 text-xs font-bold">
                        <PlusCircle className="w-3.5 h-3.5" /> {addServiceOpen ? "Cancel" : "Add Service"}
                      </Button>
                    </div>

                    {/* Inline Add Service Form */}
                    {addServiceOpen && (
                      <div className="p-5 rounded-3xl bg-violet-500/5 border-2 border-violet-500/20 space-y-4">
                        <h4 className="font-black text-sm text-violet-600 dark:text-violet-400 flex items-center gap-2">
                          <Plus className="w-4 h-4" /> New Service / Menu Item
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">Service Name *</label>
                            <Input value={newServiceForm.name} onChange={e => setNewServiceForm({ ...newServiceForm, name: e.target.value })} placeholder="e.g. Ethiopian Macchiato" />
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">Category</label>
                            <Input value={newServiceForm.category} onChange={e => setNewServiceForm({ ...newServiceForm, category: e.target.value })} placeholder="e.g. Beverages, Main Course, Consulting" />
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">Price</label>
                            <Input value={newServiceForm.price} onChange={e => setNewServiceForm({ ...newServiceForm, price: e.target.value })} placeholder="e.g. 45 ETB, $12, Contact Us" />
                          </div>
                          <div>
                            <label className="font-bold text-muted-foreground block mb-1">Short Description</label>
                            <Input value={newServiceForm.description} onChange={e => setNewServiceForm({ ...newServiceForm, description: e.target.value })} placeholder="Brief description of the service" />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="gradient" onClick={addService} className="gap-1.5 text-xs font-bold">
                            <Check className="w-3.5 h-3.5" /> Add to Services List
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setAddServiceOpen(false)} className="text-xs">Cancel</Button>
                        </div>
                      </div>
                    )}

                    {/* Services Table */}
                    {(selectedBusiness.services || []).length === 0 ? (
                      <div className="p-16 rounded-3xl bg-card border border-dashed border-border text-center space-y-3">
                        <Sparkles className="w-10 h-10 mx-auto text-muted-foreground/30" />
                        <h4 className="font-bold text-sm text-foreground">No services listed yet</h4>
                        <p className="text-xs text-muted-foreground">Add your menu items, services, or packages to attract customers.</p>
                        <Button size="sm" variant="gradient" onClick={() => setAddServiceOpen(true)} className="gap-1.5 text-xs">
                          <PlusCircle className="w-3.5 h-3.5" /> Add First Service
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                              <tr>
                                <th className="px-5 py-3.5">Service / Item</th>
                                <th className="px-5 py-3.5">Category</th>
                                <th className="px-5 py-3.5">Price</th>
                                <th className="px-5 py-3.5">Description</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 font-medium">
                              {(selectedBusiness.services || []).map((s: BusinessServiceItem) => (
                                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                                  {editServiceId === s.id ? (
                                    <>
                                      <td className="px-5 py-3">
                                        <Input value={editServiceForm.name} onChange={e => setEditServiceForm({ ...editServiceForm, name: e.target.value })} className="h-8 text-xs" />
                                      </td>
                                      <td className="px-5 py-3">
                                        <Input value={editServiceForm.category} onChange={e => setEditServiceForm({ ...editServiceForm, category: e.target.value })} className="h-8 text-xs" />
                                      </td>
                                      <td className="px-5 py-3">
                                        <Input value={editServiceForm.price} onChange={e => setEditServiceForm({ ...editServiceForm, price: e.target.value })} className="h-8 text-xs" />
                                      </td>
                                      <td className="px-5 py-3">
                                        <Input value={editServiceForm.description} onChange={e => setEditServiceForm({ ...editServiceForm, description: e.target.value })} className="h-8 text-xs" />
                                      </td>
                                      <td className="px-5 py-3 text-right space-x-1">
                                        <Button size="sm" variant="gradient" onClick={saveEditService} className="h-7 text-xs px-2 gap-1">
                                          <Check className="w-3 h-3" /> Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => setEditServiceId(null)} className="h-7 text-xs px-2">
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-5 py-3.5">
                                        <div className="font-bold text-foreground">{s.name}</div>
                                      </td>
                                      <td className="px-5 py-3.5 text-muted-foreground">{s.category || "—"}</td>
                                      <td className="px-5 py-3.5">
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{s.price || "Contact"}</span>
                                      </td>
                                      <td className="px-5 py-3.5 text-muted-foreground max-w-[200px] truncate">{s.description || "—"}</td>
                                      <td className="px-5 py-3.5 text-right space-x-1">
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditServiceId(s.id);
                                            setEditServiceForm({ name: s.name, category: s.category || "", price: s.price || "", description: s.description || "" });
                                          }}
                                          className="h-7 text-xs px-2"
                                        >
                                          <Edit2 className="w-3 h-3 mr-1" /> Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => removeService(s.id)}
                                          className="h-7 text-xs text-red-500 hover:text-red-700 hover:bg-red-500/10 px-2"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </td>
                                    </>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">{(selectedBusiness.services || []).length} service{(selectedBusiness.services || []).length !== 1 ? "s" : ""} in your menu</span>
                          <Button size="sm" variant="outline" onClick={() => setAddServiceOpen(true)} className="gap-1 text-xs h-7">
                            <Plus className="w-3 h-3" /> Add Service
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              4. 📸 MEDIA
             ════════════════════════════════════════════════════════════════════ */}
          {/* ════════════════════════════════════════════════════════════════════
              4. 📸 MEDIA (20 PER PAGE WITH PAGINATION)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "media" && (() => {
            const rawMedia = [...(selectedBusiness.media || [])];
            const hasVideoItem = rawMedia.some((m) => m.type === "video" || isYoutubeUrl(m.url));
            const ytId =
              extractYoutubeVideoId(selectedBusiness.youtubeVideoId) ||
              (rawMedia.find((m) => isYoutubeUrl(m.url)) ? extractYoutubeVideoId(rawMedia.find((m) => isYoutubeUrl(m.url))!.url) : null);
            if (ytId && !hasVideoItem) {
              rawMedia.push({
                id: "med-video-auto",
                type: "video",
                url: `https://www.youtube.com/watch?v=${ytId}`,
                thumbnailUrl: getYoutubeThumbnail(ytId),
                title: `${selectedBusiness.name} Video Tour`,
                sortOrder: rawMedia.length + 1,
                uploadedAt: new Date().toISOString(),
              });
            }

            // Filter by subnav tab
            let filtered = rawMedia;
            if (activeSubnav === "photos") {
              filtered = rawMedia.filter((m) => m.type !== "cover" && m.type !== "logo" && m.type !== "video" && !isYoutubeUrl(m.url));
            } else if (activeSubnav === "videos") {
              filtered = rawMedia.filter((m) => m.type === "video" || isYoutubeUrl(m.url));
            } else if (activeSubnav === "logo") {
              filtered = rawMedia.filter((m) => m.type === "logo");
            } else if (activeSubnav === "cover") {
              filtered = rawMedia.filter((m) => m.type === "cover");
            }

            if (ownerMediaSearch.trim()) {
              const q = ownerMediaSearch.toLowerCase();
              filtered = filtered.filter((m) =>
                (m.title && m.title.toLowerCase().includes(q)) ||
                (m.type && m.type.toLowerCase().includes(q))
              );
            }

            const OWNER_MEDIA_PER_PAGE = 20;
            const total = filtered.length;
            const totalPages = Math.max(1, Math.ceil(total / OWNER_MEDIA_PER_PAGE));
            const safePage = Math.min(Math.max(1, ownerMediaPage), totalPages);
            const startIdx = (safePage - 1) * OWNER_MEDIA_PER_PAGE;
            const pageItems = filtered.slice(startIdx, startIdx + OWNER_MEDIA_PER_PAGE);

            const handleLoad24RealPhotos = () => {
              const showcaseItems = buildRealShowcaseMedia(selectedBusiness.name || "Business");
              const existingUrls = new Set(rawMedia.map((m) => m.url));
              const newItems = showcaseItems.filter((m) => !existingUrls.has(m.url));
              const combined = [...newItems, ...rawMedia];
              const primaryCover = showcaseItems.find((m) => m.type === "cover");
              handleUpdateBusiness({
                ...selectedBusiness,
                media: combined,
                coverUrl: primaryCover ? primaryCover.url : selectedBusiness.coverUrl,
              });
              setOwnerMediaPage(1);
              toast.success(`Loaded ${newItems.length} real showcase photos! 20-per-page gallery ready.`);
            };

            return (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-foreground">Media & Visual Content</h2>
                      <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary/10">
                        20 per page
                      </Badge>
                      <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-bold">
                        {rawMedia.length} Registered Photos
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Manage {selectedBusiness.name || "your business"} profile covers, logos, interior gallery photos, and YouTube video embeds.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleLoad24RealPhotos}
                      className="gap-1.5 text-xs font-bold h-8 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
                      title="Instantly register 24 authentic high-res photos to test 20/page pagination"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      âš¡ Load 24 Real Photos
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsMediaUploaderOpen(true)}
                      className="gap-1.5 text-xs font-bold h-8"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Batch Upload
                    </Button>

                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => setIsRegisterMediaOpen(true)}
                      className="gap-1.5 text-xs font-bold h-8 shadow-md shadow-primary/20"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Register Real Photo
                    </Button>
                  </div>
                </div>

                {/* Subnav Tabs & Real-Time Search Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-border overflow-x-auto no-scrollbar w-fit max-w-full">
                    {[
                      { key: "all", label: "All Media", count: rawMedia.length },
                      { key: "photos", label: "Photo Gallery", count: rawMedia.filter((m) => m.type !== "cover" && m.type !== "logo" && m.type !== "video" && !isYoutubeUrl(m.url)).length },
                      { key: "videos", label: "YouTube Videos", count: rawMedia.filter((m) => m.type === "video" || isYoutubeUrl(m.url)).length },
                      { key: "logo", label: "Logo & Avatar", count: rawMedia.filter((m) => m.type === "logo").length },
                      { key: "cover", label: "Cover Header", count: rawMedia.filter((m) => m.type === "cover").length },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveSubnav(tab.key);
                          setOwnerMediaPage(1);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                          activeSubnav === tab.key
                            ? "bg-card text-primary shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              activeSubnav === tab.key
                                ? "bg-primary text-primary-foreground font-black"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {tab.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Search Input */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={ownerMediaSearch}
                      onChange={(e) => {
                        setOwnerMediaSearch(e.target.value);
                        setOwnerMediaPage(1);
                      }}
                      placeholder="Search photos by title or tag..."
                      className="text-xs pl-8 h-8 rounded-xl bg-card"
                    />
                    {ownerMediaSearch && (
                      <button
                        onClick={() => setOwnerMediaSearch("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Photo Showcase Grid */}
                {total === 0 ? (
                  <div className="p-16 rounded-3xl bg-card border border-dashed border-border text-center space-y-3">
                    <Camera className="w-10 h-10 mx-auto text-muted-foreground/40" />
                    <div>
                      <h4 className="text-sm font-bold text-foreground">No media matching your filter</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Upload high-resolution photos or load real showcase photography to attract customers.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => setIsRegisterMediaOpen(true)}
                        className="text-xs gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register Real Photo
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleLoad24RealPhotos}
                        className="text-xs gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Load 24 Real Photos
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {pageItems.map((m) => {
                        const isVideo = m.type === "video" || isYoutubeUrl(m.url);
                        const vidId = isVideo ? extractYoutubeVideoId(m.url) : null;
                        const isPrimaryCover = !isVideo && (m.type === "cover" || m.url === selectedBusiness.coverUrl);
                        const displayThumbnail = isVideo
                          ? (m.thumbnailUrl || (vidId ? getYoutubeThumbnail(vidId) : m.url))
                          : m.url;

                        return (
                          <div
                            key={m.id}
                            className="group relative rounded-3xl overflow-hidden bg-slate-900 border border-border aspect-[4/3] shadow-sm hover:shadow-lg transition-all cursor-pointer"
                            onClick={() =>
                              setLightboxMedia({
                                id: m.id,
                                title: m.title || `${selectedBusiness.name} ${isVideo ? "Video Tour" : "Photo"}`,
                                url: m.url,
                                type: isVideo ? "video" : m.type,
                                youtubeId: vidId || undefined,
                                businessName: selectedBusiness.name,
                                uploadedBy: "Business Owner",
                              })
                            }
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={displayThumbnail}
                              alt={m.title || "Business Media"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />

                            {/* Center Play Icon for Videos */}
                            {isVideo && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                                <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                  <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                                </div>
                              </div>
                            )}

                            {/* Badges on Top */}
                            <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
                              {isPrimaryCover ? (
                                <Badge className="bg-amber-500 text-black text-[10px] font-black gap-1 shadow-md shadow-amber-500/30">
                                  <Crown className="w-3 h-3 fill-black" /> Cover
                                </Badge>
                              ) : (
                                <span />
                              )}

                              <Badge
                                className={
                                  isVideo
                                    ? "bg-red-600 text-white border border-red-500/40 text-[10px] font-bold flex items-center gap-1 shadow"
                                    : "bg-black/70 backdrop-blur-md text-white border border-white/20 text-[10px] capitalize font-bold"
                                }
                              >
                                {isVideo && <Play className="w-2.5 h-2.5 fill-current" />}
                                {isVideo ? "Video Tour" : m.type}
                              </Badge>
                            </div>

                            {/* Hover Details Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end gap-2">
                              <div>
                                <h4 className="text-white text-xs font-bold truncate">
                                  {m.title || (isVideo ? "Video Tour" : "Gallery Item")}
                                </h4>
                                <p className="text-[10px] text-white/70">
                                  {isVideo ? "Click to play video tour" : "Click to view in lightbox"}
                                </p>
                              </div>

                              <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                                {!isVideo && !isPrimaryCover ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const updated = (selectedBusiness.media || []).map((item) =>
                                        item.id === m.id ? { ...item, type: "cover" as any } : item
                                      );
                                      handleUpdateBusiness({
                                        ...selectedBusiness,
                                        media: updated,
                                        coverUrl: m.url,
                                      });
                                      toast.success("Designated as primary profile cover!");
                                    }}
                                    className="h-7 text-[10px] font-bold px-2 bg-black/60 hover:bg-amber-500 hover:text-black text-white border-white/20 gap-1 rounded-xl"
                                    title="Set as profile cover"
                                  >
                                    <Crown className="w-3 h-3" /> Set Cover
                                  </Button>
                                ) : isPrimaryCover ? (
                                  <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                                    <Crown className="w-3 h-3 fill-amber-400" /> Active Cover
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setLightboxMedia({
                                        id: m.id,
                                        title: m.title || `${selectedBusiness.name} Video Tour`,
                                        url: m.url,
                                        type: "video",
                                        youtubeId: vidId || undefined,
                                        businessName: selectedBusiness.name,
                                        uploadedBy: "Business Owner",
                                      })
                                    }
                                    className="h-7 text-[10px] font-bold px-2 bg-red-600 hover:bg-red-700 text-white border-none gap-1 rounded-xl shadow"
                                    title="Play Video"
                                  >
                                    <Play className="w-3 h-3 fill-white" /> Watch
                                  </Button>
                                )}

                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(m.url);
                                      toast.success(isVideo ? "Video URL copied!" : "Image URL copied to clipboard!");
                                    }}
                                    className="h-7 w-7 p-0 bg-black/60 hover:bg-white/20 text-white border-white/20 rounded-xl"
                                    title="Copy URL"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </Button>

                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => {
                                      const updated = (selectedBusiness.media || []).filter((item) => item.id !== m.id);
                                      handleUpdateBusiness({
                                        ...selectedBusiness,
                                        media: updated,
                                        youtubeVideoId: isVideo ? undefined : selectedBusiness.youtubeVideoId,
                                      });
                                      toast.success("Media item removed from listing");
                                    }}
                                    className="h-7 w-7 p-0 rounded-xl shrink-0"
                                    title="Delete Media"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 20 At One Page Pagination Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border shadow-xs">
                      <div className="text-xs text-muted-foreground">
                        Showing{" "}
                        <span className="font-bold text-foreground">
                          {total === 0 ? 0 : startIdx + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-bold text-foreground">
                          {Math.min(startIdx + OWNER_MEDIA_PER_PAGE, total)}
                        </span>{" "}
                        of <span className="font-bold text-foreground">{total}</span> media items (
                        <span className="font-semibold text-primary">20 per page</span>)
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-mono mr-2">
                          Page {safePage} of {totalPages}
                        </span>

                        {/* Previous Page Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={safePage <= 1}
                          onClick={() => setOwnerMediaPage((p) => Math.max(1, p - 1))}
                          className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </Button>

                        {/* Numeric Page Buttons */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum = i + 1;
                            if (totalPages > 5 && safePage > 3) {
                              pageNum = safePage - 3 + i;
                              if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                            }
                            if (pageNum < 1 || pageNum > totalPages) return null;

                            const isActive = safePage === pageNum;
                            return (
                              <Button
                                key={pageNum}
                                size="sm"
                                variant={isActive ? "default" : "outline"}
                                onClick={() => setOwnerMediaPage(pageNum)}
                                className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${
                                  isActive
                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-primary font-black"
                                    : "bg-card hover:bg-muted text-foreground border border-border"
                                }`}
                              >
                                {pageNum}
                              </Button>
                            );
                          })}
                        </div>

                        {/* Next Page Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={safePage >= totalPages}
                          onClick={() => setOwnerMediaPage((p) => Math.min(totalPages, p + 1))}
                          className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ════════════════════════════════════════════════════════════════════
              5. ⭐ REVIEWS (20 REVIEWS PER PAGE WITH PAGINATION)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "reviews" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">Customer Reviews & Ratings</h2>
                    <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-600 bg-amber-500/10">
                      20 per page
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Monitor customer feedback for {selectedBusiness.name || "your business"}, publish verified owner responses, and record customer ratings.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs font-bold py-1 px-2.5">
                    ⭐ {selectedBusiness.ratingAvg || "0.0"} Rating Average
                  </Badge>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsAddReviewModalOpen(true)}
                    className="gap-1.5 text-xs font-bold shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Review</span>
                  </Button>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All Reviews", count: reviewCounts.all || reviews.length },
                { key: "replies", label: "Responded", count: reviewCounts.replies },
                { key: "pending", label: "Awaiting Reply", count: reviewCounts.pending },
              ])}

              {isReviewsLoading ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">Loading reviews from database...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <Star className="w-10 h-10 mx-auto opacity-30 text-amber-500" />
                  <p className="font-bold text-foreground">No customer reviews yet</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Customer reviews left on your public business profile will appear here. You can also register verified customer feedback directly.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddReviewModalOpen(true)}
                    className="text-xs font-bold gap-1 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Customer Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <div key={r.id} className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 hover:border-primary/30 transition-all">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 font-black flex items-center justify-center text-sm border border-indigo-500/20 shadow-sm">
                              {r.userName ? r.userName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground text-sm">{r.userName}</span>
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                  Verified
                                </Badge>
                              </div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                {r.createdAt?.split("T")[0] || "Recently"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-amber-500 font-black text-sm tracking-wider">
                              {"★".repeat(r.rating)}{"☆".repeat(Math.max(0, 5 - r.rating))}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setPreselectedReportTarget({
                                  type: "review",
                                  id: r.id,
                                  name: `Review by ${r.userName} on ${selectedBusiness?.name || "My Business"}`,
                                });
                                setIsRegisterOwnerReportOpen(true);
                              }}
                              className="text-[10px] text-muted-foreground hover:text-red-500 h-7"
                            >
                              Report
                            </Button>

                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-foreground leading-relaxed pl-13">
                          {r.comment}
                        </p>

                        {/* Owner Response Box */}
                        {r.reply ? (
                          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-1">
                            <div className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Response from {r.reply.ownerName}
                            </div>
                            <p className="text-xs text-foreground/90">{r.reply.comment}</p>
                          </div>
                        ) : replyingReviewId === r.id ? (
                          <div className="space-y-2 pt-2 border-t border-border">
                            <Textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Type your official owner response..."
                              rows={2}
                              className="text-xs rounded-2xl"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setReplyingReviewId(null)}
                                className="text-xs rounded-xl"
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="gradient"
                                onClick={() => handlePostReply(r.id)}
                                className="text-xs font-bold rounded-xl"
                              >
                                Post Public Reply
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setReplyingReviewId(r.id);
                              setReplyText("");
                            }}
                            className="text-xs font-bold gap-1 text-primary rounded-xl"
                          >
                            <Send className="w-3 h-3" /> Reply as Owner
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* ═══════════════════════════════════════════════════════
                      20 REVIEWS PER PAGE PAGINATION BAR
                     ═══════════════════════════════════════════════════════ */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
                    <div className="text-xs text-muted-foreground">
                      Showing{" "}
                      <span className="font-bold text-foreground">
                        {reviewTotalCount === 0 ? 0 : (reviewPage - 1) * 20 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-foreground">
                        {Math.min(reviewPage * 20, reviewTotalCount)}
                      </span>{" "}
                      of <span className="font-bold text-foreground">{reviewTotalCount}</span> reviews
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reviewPage <= 1}
                        onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                        className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: reviewTotalPages }, (_, i) => i + 1)
                          .filter((pageNum) => {
                            if (reviewTotalPages <= 7) return true;
                            if (pageNum === 1 || pageNum === reviewTotalPages) return true;
                            return Math.abs(pageNum - reviewPage) <= 1;
                          })
                          .map((pageNum, idx, arr) => {
                            const isCurrent = pageNum === reviewPage;
                            const prev = arr[idx - 1];
                            const showEllipsis = prev && pageNum - prev > 1;

                            return (
                              <React.Fragment key={pageNum}>
                                {showEllipsis && (
                                  <span className="px-1 text-xs text-muted-foreground font-mono">
                                    …
                                  </span>
                                )}
                                <Button
                                  variant={isCurrent ? "gradient" : "outline"}
                                  size="sm"
                                  onClick={() => setReviewPage(pageNum)}
                                  className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${
                                    isCurrent ? "shadow-sm" : ""
                                  }`}
                                >
                                  {pageNum}
                                </Button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={reviewPage >= reviewTotalPages}
                        onClick={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))}
                        className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              5b. 👥 CUSTOMERS / REGISTERED USERS — 20 per page
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "customers" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-black border border-violet-500/20">
                      <UserCheck className="w-3 h-3" /> Customer Registry
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">
                      Registered Users
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 text-xs font-mono font-bold border border-violet-500/20">
                      20 per page
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View and manage all registered platform customers, owners, and users.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Search Input */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-card border border-border rounded-xl text-xs">
                    <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      value={customersSearch}
                      onChange={(e) => {
                        setCustomersSearch(e.target.value);
                        setCustomersPage(1);
                      }}
                      placeholder="Search users..."
                      className="bg-transparent text-xs outline-none text-foreground placeholder:text-muted-foreground w-36"
                    />
                  </div>

                  {/* Country Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={customerFilterCountry}
                      onChange={(e) => {
                        setCustomerFilterCountry(e.target.value);
                        setCustomerFilterCity("all");
                        setCustomersPage(1);
                      }}
                      className="h-8 pl-2.5 pr-7 text-xs rounded-xl bg-card border border-border text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">🌍 All Countries</option>
                      {COUNTRIES_WITH_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                  </div>

                  {/* City Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={customerFilterCity}
                      onChange={(e) => {
                        setCustomerFilterCity(e.target.value);
                        setCustomersPage(1);
                      }}
                      className="h-8 pl-2.5 pr-7 text-xs rounded-xl bg-card border border-border text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">📍 All Cities</option>
                      {customerFilterCities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                      {customerFilterCountry === "all" && (
                        <>
                          <option value="Addis Ababa">Addis Ababa (Ethiopia)</option>
                          <option value="Nairobi">Nairobi (Kenya)</option>
                          <option value="New York">New York (USA)</option>
                          <option value="London">London (UK)</option>
                          <option value="Toronto">Toronto (Canada)</option>
                        </>
                      )}
                    </select>
                    <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                  </div>

                  {/* Download CSV */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportCustomers("csv")}
                    disabled={isExportingCustomers || isCustomersLoading}
                    className="gap-1.5 text-xs font-bold h-8 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
                    title="Download users in CSV format"
                  >
                    <Download className={`w-3.5 h-3.5 ${isExportingCustomers ? "animate-bounce" : ""}`} />
                    {isExportingCustomers ? "Exporting…" : "CSV"}
                  </Button>

                  {/* Download JSON */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportCustomers("json")}
                    disabled={isExportingCustomers || isCustomersLoading}
                    className="gap-1.5 text-xs font-bold h-8 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 shadow-xs"
                    title="Download users in JSON format"
                  >
                    JSON
                  </Button>

                  {/* Refresh */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchCustomers(customersPage)}
                    className="gap-1.5 text-xs font-bold h-8"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCustomersLoading ? "animate-spin" : ""}`} />
                  </Button>

                  {/* Reset Filters */}
                  {(customerFilterCountry !== "all" || customerFilterCity !== "all" || customersSearch.trim()) && (
                    <button
                      onClick={() => {
                        setCustomerFilterCountry("all");
                        setCustomerFilterCity("all");
                        setCustomersSearch("");
                        setCustomersPage(1);
                      }}
                      className="px-2 py-1 rounded-lg border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-[11px] font-bold transition-colors shrink-0"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Summary KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: "👥", label: "Total Users", value: customersTotalCount || customersList.length,
                    color: "violet", desc: "All registered",
                  },
                  {
                    icon: "🏢", label: "Business Owners", value: customersList.filter((u) => u.role === "owner").length,
                    color: "indigo", desc: "On this page",
                  },
                  {
                    icon: "⭐", label: "Regular Customers", value: customersList.filter((u) => u.role === "user").length,
                    color: "amber", desc: "On this page",
                  },
                  {
                    icon: "🛡️", label: "Admins & Staff", value: customersList.filter((u) => ["super_admin","country_admin","city_admin","admin"].includes(u.role)).length,
                    color: "rose", desc: "On this page",
                  },
                ].map((kpi, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-card border border-border shadow-sm flex items-center gap-3 hover:border-primary/30 transition-colors">
                    <div className="text-2xl">{kpi.icon}</div>
                    <div>
                      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{kpi.label}</div>
                      <div className="text-xl font-black text-foreground">{kpi.value}</div>
                      <div className="text-[10px] text-muted-foreground">{kpi.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Subnav Tabs */}
              {renderSubnavTabs([
                { key: "all", label: "All Users", count: customersTotalCount },
                { key: "owners", label: "Business Owners" },
                { key: "users", label: "Customers" },
              ])}

              {/* Users Table */}
              {isCustomersLoading ? (
                <div className="p-16 rounded-3xl bg-card border border-border text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">Loading users from database...</p>
                </div>
              ) : (() => {
                  const filtered = activeSubnav === "owners"
                    ? customersList.filter((u) => u.role === "owner")
                    : activeSubnav === "users"
                    ? customersList.filter((u) => u.role === "user")
                    : customersList;

                  if (filtered.length === 0) {
                    return (
                      <div className="p-16 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                        <UserCheck className="w-10 h-10 mx-auto opacity-30 text-violet-500" />
                        <p className="font-bold text-foreground">No users found</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          {customersSearch ? `No users matching "${customersSearch}"` : "No registered users yet. Users appear here when they sign up."}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {/* User Table Card */}
                      <div className="rounded-3xl bg-card border border-border shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-muted/40 border-b border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <div className="col-span-1">#</div>
                          <div className="col-span-3">Customer</div>
                          <div className="col-span-3">Email</div>
                          <div className="col-span-2">Territory</div>
                          <div className="col-span-1">Role</div>
                          <div className="col-span-2">Joined</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-border/50">
                          {filtered.map((u: any, idx: number) => {
                            const rowNum = (customersPage - 1) * CUSTOMERS_PER_PAGE + idx + 1;
                            const roleColor =
                              u.role === "super_admin" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" :
                              u.role === "country_admin" || u.role === "city_admin" || u.role === "admin" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                              u.role === "owner" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" :
                              "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
                            const roleLabel =
                              u.role === "super_admin" ? "Super Admin" :
                              u.role === "country_admin" ? "Country Admin" :
                              u.role === "city_admin" ? "City Admin" :
                              u.role === "admin" ? "Admin" :
                              u.role === "owner" ? "Owner" :
                              "Customer";

                            return (
                              <div
                                key={u.id || u.clerkId || idx}
                                className="grid grid-cols-12 gap-3 px-6 py-4 hover:bg-accent/40 transition-colors items-center group"
                              >
                                <div className="col-span-1 text-xs font-mono text-muted-foreground">{rowNum}</div>

                                {/* Avatar + Name */}
                                <div className="col-span-3 flex items-center gap-3 min-w-0">
                                  {u.avatarUrl ? (
                                    <img
                                      src={u.avatarUrl}
                                      alt={u.name}
                                      className="w-9 h-9 rounded-2xl object-cover border border-border shrink-0 shadow-sm"
                                      onError={(e: any) => { e.target.style.display = "none"; }}
                                    />
                                  ) : (
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-500/20 to-indigo-500/20 text-violet-600 font-black flex items-center justify-center text-sm border border-violet-500/20 shadow-sm shrink-0">
                                      {u.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-foreground truncate">{u.name || "—"}</div>
                                    {u.phone && (
                                      <div className="text-[10px] text-muted-foreground font-mono truncate">{u.phone}</div>
                                    )}
                                  </div>
                                </div>

                                {/* Email */}
                                <div className="col-span-3 text-xs text-muted-foreground truncate font-mono">
                                  {u.email || "—"}
                                </div>

                                {/* Territory (City, Country) */}
                                <div className="col-span-2 flex items-center gap-1.5 text-xs text-foreground font-medium min-w-0">
                                  <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                  <span className="truncate">{u.city ? `${u.city}, ${u.country}` : u.country || "Global"}</span>
                                </div>

                                {/* Role Badge */}
                                <div className="col-span-1">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black border ${roleColor}`}>
                                    {roleLabel}
                                  </span>
                                </div>

                                {/* Joined Date */}
                                <div className="col-span-2 text-[11px] text-muted-foreground font-mono">
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ═══ 20 USERS PER PAGE PAGINATION BAR ═══ */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Showing{" "}
                          <span className="font-bold text-foreground">
                            {customersTotalCount === 0 ? 0 : (customersPage - 1) * CUSTOMERS_PER_PAGE + 1}
                          </span>
                          {" "}to{" "}
                          <span className="font-bold text-foreground">
                            {Math.min(customersPage * CUSTOMERS_PER_PAGE, customersTotalCount)}
                          </span>
                          {" "}of{" "}
                          <span className="font-bold text-foreground">{customersTotalCount}</span> registered users
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={customersPage <= 1}
                            onClick={() => setCustomersPage((p) => Math.max(1, p - 1))}
                            className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                          </Button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: customersTotalPages }, (_, i) => i + 1)
                              .filter((pageNum) => {
                                if (customersTotalPages <= 7) return true;
                                if (pageNum === 1 || pageNum === customersTotalPages) return true;
                                return Math.abs(pageNum - customersPage) <= 1;
                              })
                              .map((pageNum, idx, arr) => {
                                const isCurrent = pageNum === customersPage;
                                const prev = arr[idx - 1];
                                const showEllipsis = prev && pageNum - prev > 1;
                                return (
                                  <React.Fragment key={pageNum}>
                                    {showEllipsis && (
                                      <span className="px-1 text-xs text-muted-foreground font-mono">…</span>
                                    )}
                                    <Button
                                      variant={isCurrent ? "gradient" : "outline"}
                                      size="sm"
                                      onClick={() => setCustomersPage(pageNum)}
                                      className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${isCurrent ? "shadow-sm" : ""}`}
                                    >
                                      {pageNum}
                                    </Button>
                                  </React.Fragment>
                                );
                              })}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={customersPage >= customersTotalPages}
                            onClick={() => setCustomersPage((p) => Math.min(customersTotalPages, p + 1))}
                            className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
              })()}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              6. 📊 ANALYTICS
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "analytics" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">
                      Performance &amp; Search Intelligence
                    </h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                      {dashboardAnalyticsTotalCount} Real Telemetry Events
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Discover how customers find and interact with {selectedBusiness?.name ? `"${selectedBusiness.name}"` : "your business listings"}.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchDashboardAnalytics(dashboardAnalyticsPage)}
                    disabled={isDashboardAnalyticsLoading}
                    className="gap-1.5 text-xs font-bold rounded-xl"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDashboardAnalyticsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsRegisterDashboardAnalyticsOpen(true)}
                    className="gap-1.5 text-xs font-bold shadow-md shadow-primary/20 rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register Analytics Event
                  </Button>
                </div>
              </div>

              {/* Dynamic KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
                  <div className="text-xs font-bold text-muted-foreground">Profile Views</div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {(dashboardAnalyticsStats?.totalViews || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600">Dynamic Count</div>
                </div>

                <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
                  <div className="text-xs font-bold text-muted-foreground">Search Impressions</div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {(dashboardAnalyticsStats?.totalSearches || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600">Dynamic Count</div>
                </div>

                <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
                  <div className="text-xs font-bold text-muted-foreground">Direct Calls Initiated</div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {(dashboardAnalyticsStats?.totalCalls || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600">Dynamic Count</div>
                </div>

                <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1">
                  <div className="text-xs font-bold text-muted-foreground">Directions Requested</div>
                  <div className="text-2xl font-black text-foreground font-mono">
                    {(dashboardAnalyticsStats?.totalDirections || 0).toLocaleString()}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600">Dynamic Count</div>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "events", label: "Live Event Ledger", count: dashboardAnalyticsTotalCount },
                { key: "overview", label: "Overview Metrics" },
                { key: "keywords", label: "Search Keywords" },
                { key: "geo", label: "Geographic Breakdown" },
              ])}

              {/* Subnav: Live 20-Per-Page Event Ledger */}
              {(activeSubnav === "events" || activeSubnav === "all" || !["overview", "keywords", "geo"].includes(activeSubnav)) && (
                <div className="space-y-4">
                  <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/70 text-muted-foreground font-semibold">
                            <th className="px-5 py-3.5">Event ID</th>
                            <th className="px-5 py-3.5">Event Type</th>
                            <th className="px-5 py-3.5">Target Listing</th>
                            <th className="px-5 py-3.5">Details / Keyword</th>
                            <th className="px-5 py-3.5">Location</th>
                            <th className="px-5 py-3.5">Device</th>
                            <th className="px-5 py-3.5">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {isDashboardAnalyticsLoading ? (
                            <tr>
                              <td colSpan={7} className="text-center py-14 text-muted-foreground">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                <span className="text-xs font-semibold">Loading telemetry events...</span>
                              </td>
                            </tr>
                          ) : dashboardAnalytics.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="text-center py-14 text-muted-foreground">
                                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30 text-primary" />
                                <p className="font-bold text-sm text-foreground">No telemetry recorded yet</p>
                                <p className="text-xs mt-1">Register a real event or wait for customer interactions.</p>
                                <Button
                                  size="sm"
                                  variant="gradient"
                                  onClick={() => setIsRegisterDashboardAnalyticsOpen(true)}
                                  className="mt-3 text-xs font-bold rounded-xl"
                                >
                                  Register Telemetry Event
                                </Button>
                              </td>
                            </tr>
                          ) : (
                            dashboardAnalytics.map((evt) => (
                              <tr key={evt.id} className="hover:bg-accent/20 transition-colors">
                                <td className="px-5 py-3.5 font-mono text-[11px] font-bold text-primary">
                                  <div className="flex items-center gap-1.5">
                                    <span>{evt.id}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(evt.id);
                                        toast.success(`Copied ${evt.id}!`);
                                      }}
                                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                                      title="Copy ID"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>

                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] capitalize font-bold ${
                                      evt.eventType === "view"
                                        ? "bg-sky-500/10 text-sky-600 border-sky-500/20"
                                        : evt.eventType === "search"
                                        ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                        : evt.eventType === "click_phone"
                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                        : evt.eventType === "click_direction"
                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                        : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                    }`}
                                  >
                                    {evt.eventType.replace("_", " ")}
                                  </Badge>
                                </td>

                                <td className="px-5 py-3.5 font-bold text-foreground max-w-[200px] truncate">
                                  {evt.businessName || "Global Platform"}
                                </td>

                                <td className="px-5 py-3.5 text-muted-foreground text-[11px] max-w-[220px] truncate">
                                  {evt.searchTerm ? (
                                    <span className="font-mono text-foreground font-semibold">"{evt.searchTerm}"</span>
                                  ) : evt.duration ? (
                                    <span>Dwell: {evt.duration}s</span>
                                  ) : (
                                    <span>Action Click</span>
                                  )}
                                </td>

                                <td className="px-5 py-3.5 text-muted-foreground text-[11px] whitespace-nowrap">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-rose-500" />
                                    {evt.city}, {evt.country}
                                  </span>
                                </td>

                                <td className="px-5 py-3.5 text-muted-foreground text-[11px] capitalize whitespace-nowrap">
                                  {evt.device} {evt.os && `(${evt.os})`}
                                </td>

                                <td className="px-5 py-3.5 text-muted-foreground text-[11px] whitespace-nowrap font-mono">
                                  {new Date(evt.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* 20-Per-Page Pagination Controls (Ready-to-count) */}
                    <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
                      <div className="text-xs text-muted-foreground font-medium">
                        Showing{" "}
                        <strong className="text-foreground">
                          {dashboardAnalyticsTotalCount === 0 ? 0 : (dashboardAnalyticsPage - 1) * 20 + 1}
                        </strong>{" "}
                        to{" "}
                        <strong className="text-foreground">
                          {Math.min(dashboardAnalyticsPage * 20, dashboardAnalyticsTotalCount)}
                        </strong>{" "}
                        of <strong className="text-foreground">{dashboardAnalyticsTotalCount}</strong> events
                        <span className="ml-1 text-[11px] opacity-75">(20 per page)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const prev = Math.max(1, dashboardAnalyticsPage - 1);
                            setDashboardAnalyticsPage(prev);
                            fetchDashboardAnalytics(prev);
                          }}
                          disabled={dashboardAnalyticsPage <= 1 || isDashboardAnalyticsLoading}
                          className="h-8 text-xs font-bold gap-1 rounded-xl"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </Button>

                        {/* Direct Page Numbers */}
                        {Array.from({ length: Math.min(dashboardAnalyticsTotalPages, 5) }).map((_, i) => {
                          let pageNum = i + 1;
                          if (dashboardAnalyticsTotalPages > 5 && dashboardAnalyticsPage > 3) {
                            pageNum = Math.min(dashboardAnalyticsTotalPages - 4 + i, Math.max(1, dashboardAnalyticsPage - 2 + i));
                          }
                          return (
                            <Button
                              key={pageNum}
                              size="sm"
                              variant={dashboardAnalyticsPage === pageNum ? "gradient" : "outline"}
                              onClick={() => {
                                setDashboardAnalyticsPage(pageNum);
                                fetchDashboardAnalytics(pageNum);
                              }}
                              disabled={isDashboardAnalyticsLoading}
                              className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${
                                dashboardAnalyticsPage === pageNum ? "shadow-sm shadow-primary/30" : ""
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const next = Math.min(dashboardAnalyticsTotalPages, dashboardAnalyticsPage + 1);
                            setDashboardAnalyticsPage(next);
                            fetchDashboardAnalytics(next);
                          }}
                          disabled={dashboardAnalyticsPage >= dashboardAnalyticsTotalPages || isDashboardAnalyticsLoading}
                          className="h-8 text-xs font-bold gap-1 rounded-xl"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subnav: Overview Metrics — Device, CTR, Event-Type Chart */}
              {activeSubnav === "overview" && (() => {
                const stats = dashboardAnalyticsStats || globalAnalyticsStats;
                const totalEvents = stats?.totalEvents || 0;
                const ctr = stats?.ctr || 0;
                const deviceDesktop = stats?.deviceBreakdown?.desktop || 0;
                const deviceMobile = stats?.deviceBreakdown?.mobile || 0;
                const deviceTablet = stats?.deviceBreakdown?.tablet || 0;
                const totalDevices = deviceDesktop + deviceMobile + deviceTablet || 1;
                const eventTypeBars = [
                  { label: "Profile Views", count: stats?.counts?.view || 0, color: "#6366f1" },
                  { label: "Searches", count: stats?.counts?.search || 0, color: "#3b82f6" },
                  { label: "Phone Calls", count: stats?.counts?.click_phone || 0, color: "#10b981" },
                  { label: "Directions", count: stats?.counts?.click_direction || 0, color: "#f59e0b" },
                  { label: "Website Clicks", count: stats?.counts?.click_website || 0, color: "#8b5cf6" },
                  { label: "Favorites", count: stats?.counts?.favorite || 0, color: "#ef4444" },
                  { label: "Shares", count: stats?.counts?.share || 0, color: "#06b6d4" },
                  { label: "Ad Clicks", count: stats?.counts?.ad_click || 0, color: "#f97316" },
                ];
                const maxCount = Math.max(...eventTypeBars.map(e => e.count), 1);
                return (
                  <div className="space-y-4">
                    {/* Top row: CTR card + Total events card */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 shadow-sm space-y-1 col-span-1">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Click-Through Rate</div>
                        <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400 font-mono">{ctr.toFixed(1)}%</div>
                        <div className="text-[11px] text-muted-foreground">Calls + Directions + Web ÷ Views</div>
                      </div>
                      <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1 col-span-1">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Events</div>
                        <div className="text-3xl font-black text-foreground font-mono">{totalEvents.toLocaleString()}</div>
                        <div className="text-[11px] text-emerald-600 font-semibold">All time interactions</div>
                      </div>
                      <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1 col-span-1">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">High-Intent Actions</div>
                        <div className="text-3xl font-black text-foreground font-mono">{((stats?.totalCalls || 0) + (stats?.totalDirections || 0) + (stats?.totalWebsites || 0)).toLocaleString()}</div>
                        <div className="text-[11px] text-amber-600 font-semibold">Calls + Nav + Web</div>
                      </div>
                      <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-1 col-span-1">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Unique Searches</div>
                        <div className="text-3xl font-black text-foreground font-mono">{(stats?.totalSearches || 0).toLocaleString()}</div>
                        <div className="text-[11px] text-blue-600 font-semibold">Discovery queries</div>
                      </div>
                    </div>

                    {/* Time-Series Area Chart */}
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-base text-foreground flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-indigo-500" />
                          Interaction Trends (Last 7 Days)
                        </h3>
                      </div>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={stats?.timeSeriesData || []} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: 12 }}
                            />
                            <Area type="monotone" dataKey="views" name="Profile Views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                            <Area type="monotone" dataKey="clicks" name="High-Intent Clicks" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorClicks)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Event type distribution bars */}
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-base text-foreground flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-indigo-500" />
                          Event Type Distribution
                        </h3>
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                          {totalEvents.toLocaleString()} total
                        </Badge>
                      </div>
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={eventTypeBars} layout="vertical" margin={{ left: 16, right: 32, top: 4, bottom: 4 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.12} horizontal={false} />
                            <XAxis type="number" tick={{ fontSize: 10 }} />
                            <YAxis type="category" dataKey="label" tick={{ fontSize: 10 }} width={110} />
                            <Tooltip
                              contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "0.75rem", fontSize: 12 }}
                              formatter={(val: number) => [val.toLocaleString(), "Events"]}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={24}>
                              {eventTypeBars.map((entry, idx) => (
                                <Cell key={idx} fill={entry.color} fillOpacity={0.85} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Device Breakdown */}
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                      <h3 className="font-black text-base text-foreground flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-500" />
                        Device Breakdown
                      </h3>
                      <div className="space-y-3 text-xs">
                        {[
                          { label: "Mobile", count: deviceMobile, color: "bg-emerald-500", icon: "📱" },
                          { label: "Desktop", count: deviceDesktop, color: "bg-indigo-500", icon: "🖥️" },
                          { label: "Tablet", count: deviceTablet, color: "bg-amber-500", icon: "📟" },
                        ].map((d) => {
                          const pct = Math.round((d.count / totalDevices) * 100);
                          return (
                            <div key={d.label} className="space-y-1.5">
                              <div className="flex items-center justify-between font-bold">
                                <span className="flex items-center gap-1.5">{d.icon} {d.label}</span>
                                <span className="text-muted-foreground font-semibold">{d.count.toLocaleString()} ({pct}%)</span>
                              </div>
                              <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${d.color}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-2 border-t border-border flex items-center gap-6 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Mobile: {Math.round((deviceMobile / totalDevices) * 100)}%</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /><span>Desktop: {Math.round((deviceDesktop / totalDevices) * 100)}%</span></div>
                        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" /><span>Tablet: {Math.round((deviceTablet / totalDevices) * 100)}%</span></div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Subnav: Keywords Table */}
              {activeSubnav === "keywords" && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <h3 className="font-black text-base text-foreground">Top Customer Search Terms</h3>
                  <div className="divide-y divide-border text-xs font-medium">
                    {(dashboardAnalyticsStats?.topKeywords && dashboardAnalyticsStats.topKeywords.length > 0
                      ? dashboardAnalyticsStats.topKeywords
                      : SEARCH_KEYWORDS_DATA
                    ).map((kw, i) => (
                      <div key={i} className="py-3 flex items-center justify-between">
                        <span className="font-bold text-foreground">"{kw.keyword}"</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground font-semibold">{kw.count} searches</span>
                          <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">{kw.trend || "+18%"}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subnav: Geographic Breakdown */}
              {activeSubnav === "geo" && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <h3 className="font-black text-base text-foreground">Geographic Visitor Distribution</h3>
                  <div className="space-y-3 text-xs">
                    {(dashboardAnalyticsStats?.geoDistribution && dashboardAnalyticsStats.geoDistribution.length > 0
                      ? dashboardAnalyticsStats.geoDistribution.map((g) => ({
                          region: `${g.city}, ${g.country}`,
                          percentage: g.percentage,
                          customers: g.count,
                        }))
                      : GEO_CUSTOMERS_DATA
                    ).map((geo, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between font-bold">
                          <span>{geo.region}</span>
                          <span>{geo.percentage}% ({geo.customers})</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${geo.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              7. 📢 ADVERTISING
             ════════════════════════════════════════════════════════════════════ */}
          {/* ════════════════════════════════════════════════════════════════════
              7. 📢 ADVERTISING — Real MongoDB Ad Campaigns & 20/Page Pagination
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "advertising" && (
            <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Advertising &amp; Growth Engine</h2>
                    <Badge variant="outline" className="text-[11px] font-bold bg-primary/10 text-primary border-primary/20">
                      {campaignsTotalCount} {campaignsTotalCount === 1 ? "Advertisement" : "Advertisements"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Launch sponsored placement banners, boost search ranking, and target local customers across Addis Ababa.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchOwnerCampaigns(campaignsPage)}
                    disabled={isCampaignsLoading}
                    className="gap-1.5 text-xs font-bold rounded-xl"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCampaignsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsCreateCampaignOpen(true)}
                    className="gap-1.5 text-xs font-bold shadow-md rounded-xl"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Advertisement
                  </Button>
                </div>
              </div>

              {/* Quick Metric KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Active Campaigns</div>
                  <div className="text-2xl font-black text-emerald-500 mt-1">
                    {campaigns.filter((c) => c.status === "Active").length}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Live on search &amp; spotlight</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Impressions</div>
                  <div className="text-2xl font-black text-foreground mt-1">
                    {campaigns.reduce((acc, c) => acc + (c.impressions || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Local customer views</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Clicks</div>
                  <div className="text-2xl font-black text-primary mt-1">
                    {campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Direct profile clicks</div>
                </div>
                <div className="p-4 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Daily Budget Total</div>
                  <div className="text-2xl font-black text-foreground mt-1">
                    {campaigns.reduce((acc, c) => acc + (c.budget || 0), 0).toLocaleString()} ETB
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Aggregated daily spend</div>
                </div>
              </div>

              {/* ─── Ad Performance Overview Chart ─────────────────────────── */}
              {campaigns.length > 0 && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-black text-foreground">Ad Performance Overview</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Impressions vs Clicks across all campaigns</p>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={campaigns.map((c) => ({ name: c.name.length > 18 ? c.name.slice(0, 18) + "…" : c.name, Impressions: c.impressions || 0, Clicks: c.clicks || 0 }))} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }}
                        cursor={{ fill: "hsl(var(--muted)/0.3)" }}
                      />
                      <Bar dataKey="Impressions" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
                      <Bar dataKey="Clicks" fill="#10b981" radius={[6, 6, 0, 0]} fillOpacity={0.85} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Main Campaign List Content */}
              {isCampaignsLoading ? (
                <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
                  <p className="text-sm font-bold text-foreground">Loading your advertisement campaigns...</p>
                  <p className="text-xs text-muted-foreground">Connecting to database</p>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-card border border-dashed border-border space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                    <Megaphone className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="text-lg font-black text-foreground">No Registered Advertisements Yet</h3>
                    <p className="text-xs text-muted-foreground">
                      Boost your business visibility! Register your first advertisement campaign to appear at the top of search results and map spotlights across Ethiopia.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsCreateCampaignOpen(true)}
                    className="gap-2 font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Your First Advertisement
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {campaigns.map((camp) => {
                      const isActive = camp.status === "Active";
                      const ctr = camp.impressions ? ((camp.clicks / camp.impressions) * 100).toFixed(2) : "0.00";
                      const totalBudget = (camp.budget || 0) * (camp.durationDays || 30);
                      const spentPct = totalBudget > 0 ? Math.min(100, Math.round(((camp.totalSpentETB || 0) / totalBudget) * 100)) : 0;
                      return (
                        <div
                          key={camp.id}
                          className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 flex flex-col justify-between hover:border-primary/40 transition-all"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Badge
                                className={
                                  isActive
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold gap-1"
                                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20 text-xs font-bold gap-1"
                                }
                              >
                                <span className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                                {camp.status}
                              </Badge>
                              <Badge variant="outline" className="text-[11px] font-semibold text-muted-foreground bg-muted/40">
                                {camp.placement}
                              </Badge>
                            </div>

                            <div>
                              <h3 className="font-black text-base text-foreground group-hover:text-primary transition-colors">
                                {camp.name}
                              </h3>
                              <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                <Building2 className="w-3.5 h-3.5" />
                                <span>{camp.businessName}</span>
                                {camp.targetLocation && (
                                  <>
                                    <span className="text-border">•</span>
                                    <span>{camp.targetLocation}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* KPI mini-grid */}
                            <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-muted/30 border border-border/50 text-center text-xs">
                              <div>
                                <div className="text-[10px] text-muted-foreground font-bold">Daily Budget</div>
                                <div className="font-black text-foreground">{camp.budget} {camp.currency}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-muted-foreground font-bold">Impressions</div>
                                <div className="font-black text-foreground">{(camp.impressions || 0).toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-muted-foreground font-bold">Clicks</div>
                                <div className="font-black text-primary">{(camp.clicks || 0).toLocaleString()}</div>
                              </div>
                              <div>
                                <div className="text-[10px] text-muted-foreground font-bold">CTR</div>
                                <div className="font-black text-violet-500">{ctr}%</div>
                              </div>
                            </div>

                            {/* Budget utilization bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="text-muted-foreground font-bold">Budget Utilization</span>
                                <span className="font-black text-foreground">{spentPct}% <span className="font-normal text-muted-foreground">of {totalBudget.toLocaleString()} ETB</span></span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${spentPct > 80 ? "bg-red-500" : spentPct > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                                  style={{ width: `${spentPct}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                            <span className="text-[11px] text-muted-foreground">
                              Valid until: <span className="font-semibold text-foreground">{camp.endDate}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleCampaignStatus(camp.id, camp.status)}
                                className="h-7 text-xs font-bold rounded-lg gap-1"
                              >
                                {isActive ? (
                                  <>
                                    <Pause className="w-3 h-3 text-amber-500" />
                                    <span>Pause</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 text-emerald-500" />
                                    <span>Resume</span>
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                                className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 rounded-lg"
                                title="Delete Advertisement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ─── 20-Per-Page Pagination Controls ─────────────────────── */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border shadow-sm mt-4">
                    <div className="text-xs text-muted-foreground">
                      Showing{" "}
                      <span className="font-bold text-foreground">
                        {campaignsTotalCount === 0 ? 0 : (campaignsPage - 1) * 20 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-foreground">
                        {Math.min(campaignsPage * 20, campaignsTotalCount)}
                      </span>{" "}
                      of <span className="font-bold text-foreground">{campaignsTotalCount}</span> advertisements (20 per page)
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono mr-2">
                        Page {campaignsPage} of {campaignsTotalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={campaignsPage <= 1 || isCampaignsLoading}
                        onClick={() => setCampaignsPage((p) => Math.max(1, p - 1))}
                        className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: campaignsTotalPages }, (_, i) => i + 1)
                          .filter((pageNum) => {
                            if (campaignsTotalPages <= 7) return true;
                            if (pageNum === 1 || pageNum === campaignsTotalPages) return true;
                            if (Math.abs(pageNum - campaignsPage) <= 1) return true;
                            return false;
                          })
                          .map((pageNum, idx, arr) => {
                            const prev = arr[idx - 1];
                            const showEllipsis = prev && pageNum - prev > 1;
                            return (
                              <React.Fragment key={pageNum}>
                                {showEllipsis && (
                                  <span className="px-1 text-xs text-muted-foreground">...</span>
                                )}
                                <Button
                                  variant={campaignsPage === pageNum ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => setCampaignsPage(pageNum)}
                                  className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${
                                    campaignsPage === pageNum
                                      ? "bg-primary text-primary-foreground"
                                      : "hover:bg-muted"
                                  }`}
                                >
                                  {pageNum}
                                </Button>
                              </React.Fragment>
                            );
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={campaignsPage >= campaignsTotalPages || isCampaignsLoading}
                        onClick={() => setCampaignsPage((p) => Math.min(campaignsTotalPages, p + 1))}
                        className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              8. 🎁 OFFERS & PROMOTIONS (Full-Featured)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "promotions" && (() => {
            const now = new Date();
            const filteredOffers = offers.filter((off) => {
              const matchSearch = !offerSearch.trim() ||
                off.title.toLowerCase().includes(offerSearch.toLowerCase()) ||
                off.code.toLowerCase().includes(offerSearch.toLowerCase());
              const matchType = offerTypeFilter === "all" || off.type === offerTypeFilter;
              const matchTab = offerSubnav === "all" || off.status.toLowerCase() === offerSubnav;
              return matchSearch && matchType && matchTab;
            });
            const activeCount = offers.filter(o => o.status === "Active").length;
            const scheduledCount = offers.filter(o => o.status === "Scheduled").length;
            const expiredCount = offers.filter(o => o.status === "Expired").length;
            const totalRedemptions = offers.reduce((acc, o) => acc + o.usageCount, 0);

            return (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* ── Header Banner ── */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-pink-900 to-orange-900 text-white p-6 sm:p-8 shadow-xl">
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px"}} />
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold border border-white/20 mb-2">
                      <Gift className="w-3 h-3 text-orange-300" /> Promotions, Coupons & Deals Engine
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Offers & Discounts Engine</h2>
                    <p className="text-sm text-rose-200">
                      Launch discount codes, BOGO promotions, and counter QR vouchers to boost footfall and sales.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleExportOffersCsv}
                      className="gap-1.5 text-xs font-bold bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleResetOffersToDemo}
                      className="gap-1.5 text-xs font-bold bg-white/10 border-white/20 text-white hover:bg-white/20"
                      title="Reset demo offers and redemptions"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Reset Demo
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => { setEditingOffer(null); setIsAddOfferOpen(true); }}
                      className="gap-1.5 text-xs font-bold bg-white text-rose-900 hover:bg-rose-50 shadow-lg"
                    >
                      <Plus className="w-3.5 h-3.5" /> Create Offer
                    </Button>
                  </div>
                </div>
              </div>

              {/* ── KPI Stats Row ── */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Offers", value: offers.length, icon: "🎁", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
                  { label: "Active Now", value: activeCount, icon: "✅", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
                  { label: "Scheduled", value: scheduledCount, icon: "🕐", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                  { label: "Total Redemptions", value: totalRedemptions.toLocaleString(), icon: "🎟️", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
                ].map((stat, i) => (
                  <div key={i} className={`p-5 rounded-2xl bg-card border ${stat.border} shadow-sm flex items-start gap-3`}>
                    <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center text-lg shrink-0`}>{stat.icon}</div>
                    <div>
                      <div className={`text-2xl font-black ${stat.color} font-mono`}>{stat.value}</div>
                      <div className="text-[11px] text-muted-foreground font-semibold mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Top Navigation Tabs (Cards vs POS Terminal vs Audit Log) ── */}
              <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant={promosTab === "offers" ? "default" : "outline"}
                    onClick={() => setPromosTab("offers")}
                    className={`gap-1.5 text-xs font-bold rounded-xl ${promosTab === "offers" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""}`}
                  >
                    <Gift className="w-3.5 h-3.5" /> All Offers ({offers.length})
                  </Button>
                  <Button
                    size="sm"
                    variant={promosTab === "pos" ? "default" : "outline"}
                    onClick={() => setPromosTab("pos")}
                    className={`gap-1.5 text-xs font-bold rounded-xl ${promosTab === "pos" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
                  >
                    <Receipt className="w-3.5 h-3.5" /> Cashier POS Terminal
                  </Button>
                  <Button
                    size="sm"
                    variant={promosTab === "history" ? "default" : "outline"}
                    onClick={() => setPromosTab("history")}
                    className={`gap-1.5 text-xs font-bold rounded-xl ${promosTab === "history" ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}`}
                  >
                    <Clock className="w-3.5 h-3.5" /> Redemptions Audit Log ({redemptions.length})
                  </Button>
                </div>
              </div>

              {/* ── TAB 1: OFFERS CARDS VIEW ── */}
              {promosTab === "offers" && (
                <div className="space-y-5">
                  {/* Filter Toolbar */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border">
                      {(["all", "active", "scheduled", "expired"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setOfferSubnav(tab)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                            offerSubnav === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tab === "all" ? `All (${offers.length})` :
                           tab === "active" ? `Active (${activeCount})` :
                           tab === "scheduled" ? `Scheduled (${scheduledCount})` :
                           `Expired (${expiredCount})`}
                        </button>
                      ))}
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search by title or coupon code…"
                        value={offerSearch}
                        onChange={(e) => setOfferSearch(e.target.value)}
                        className="pl-9 text-xs h-9 rounded-xl"
                      />
                    </div>

                    {/* Type Filter */}
                    <select
                      value={offerTypeFilter}
                      onChange={(e) => setOfferTypeFilter(e.target.value)}
                      className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground font-medium"
                    >
                      <option value="all">All Types</option>
                      <option value="Percentage">Percentage Off</option>
                      <option value="Fixed Amount">Fixed Amount</option>
                      <option value="BOGO">Buy 1 Get 1 (BOGO)</option>
                      <option value="Weekend Special">Weekend Special</option>
                    </select>
                  </div>

                  {/* Offers Grid */}
                  {filteredOffers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-card border border-dashed border-border rounded-3xl p-8">
                      <div className="w-16 h-16 rounded-3xl bg-muted/60 flex items-center justify-center text-3xl">🎁</div>
                      <div>
                        <div className="font-black text-lg text-foreground">No Offers Matching Filter</div>
                        <p className="text-sm text-muted-foreground mt-1">Adjust your filters or launch a new promotion to attract customers.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => { setOfferSearch(""); setOfferTypeFilter("all"); setOfferSubnav("all"); }} variant="outline" size="sm">
                          Clear Filters
                        </Button>
                        <Button onClick={() => { setEditingOffer(null); setIsAddOfferOpen(true); }} size="sm" className="gap-1.5 font-bold">
                          <Plus className="w-4 h-4" /> Create New Offer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredOffers.map((off) => {
                        const isActive = off.status === "Active";
                        const isExpired = off.status === "Expired";
                        const isScheduled = off.status === "Scheduled";
                        const statusColor = isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                          : isScheduled ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                          : "bg-muted text-muted-foreground border-border";
                        const typeColor = off.type === "Percentage" ? "bg-rose-500/10 text-rose-600"
                          : off.type === "Fixed Amount" ? "bg-indigo-500/10 text-indigo-600"
                          : off.type === "BOGO" ? "bg-purple-500/10 text-purple-600"
                          : "bg-orange-500/10 text-orange-600";
                        const limitNum = off.usageLimit ? parseInt(String(off.usageLimit)) : null;
                        const usagePct = limitNum ? Math.min(100, Math.round((off.usageCount / limitNum) * 100)) : null;

                        return (
                          <div
                            key={off.id}
                            className={`group relative rounded-3xl bg-card border shadow-sm flex flex-col overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
                              isExpired ? "opacity-75 border-border" : "border-border hover:border-primary/40"
                            }`}
                          >
                            {/* Top accent bar */}
                            <div className={`h-1.5 w-full ${
                              isActive ? "bg-gradient-to-r from-emerald-400 to-teal-500" :
                              isScheduled ? "bg-gradient-to-r from-amber-400 to-orange-500" :
                              "bg-gradient-to-r from-slate-300 to-slate-400"
                            }`} />

                            <div className="p-5 flex-1 space-y-4">
                              {/* Status + Type + Featured Row */}
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <Badge className={`text-[10px] font-bold border px-2 py-0.5 ${statusColor}`}>
                                    {isActive ? "● Active" : isScheduled ? "◌ Scheduled" : "✕ Expired"}
                                  </Badge>
                                  {off.isHighlighted && (
                                    <Badge className="text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/30 gap-1 px-1.5 py-0.5">
                                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Featured
                                    </Badge>
                                  )}
                                </div>
                                <Badge className={`text-[10px] font-bold ${typeColor}`}>
                                  {off.type}
                                </Badge>
                              </div>

                              {/* Title & Description */}
                              <div>
                                <h3 className="font-black text-base text-foreground leading-snug">{off.title}</h3>
                                {off.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{off.description}</p>
                                )}
                              </div>

                              {/* Discount Value */}
                              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/60">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-sm">
                                    <Percent className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-lg font-black text-foreground">{off.discountValue}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium">Customer Discount</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-base font-black text-foreground font-mono">{off.usageCount.toLocaleString()}</div>
                                  <div className="text-[10px] text-muted-foreground font-medium">Redeemed</div>
                                </div>
                              </div>

                              {/* Usage Limit Progress Bar (if set) */}
                              {limitNum && (
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                                    <span>Cap: {off.usageCount} / {limitNum} redemptions</span>
                                    <span className="font-bold">{usagePct}%</span>
                                  </div>
                                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${usagePct! >= 90 ? "bg-rose-500" : "bg-primary"}`}
                                      style={{ width: `${usagePct}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Coupon Code Box */}
                              <div
                                onClick={() => {
                                  if (navigator?.clipboard) {
                                    navigator.clipboard.writeText(off.code).catch(() => {});
                                  }
                                  setCopiedCode(off.id);
                                  toast.success(`Code "${off.code}" copied to clipboard!`);
                                  setTimeout(() => setCopiedCode(null), 2500);
                                }}
                                className="cursor-pointer group/code flex items-center justify-between gap-2 p-3 rounded-2xl bg-muted/50 border border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all"
                              >
                                <span className="font-mono font-black text-sm text-primary tracking-widest">{off.code}</span>
                                <span className="text-[10px] font-bold text-muted-foreground group-hover/code:text-primary transition-colors flex items-center gap-1">
                                  {copiedCode === off.id ? (
                                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Copied!</>
                                  ) : (
                                    <><Copy className="w-3 h-3" /> Copy Code</>
                                  )}
                                </span>
                              </div>

                              {/* Validity & Min Order */}
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                                  <span>{off.validFrom} → {off.validTo}</span>
                                </div>
                                {off.minOrderValue && (
                                  <span className="font-medium text-[10px] bg-muted px-2 py-0.5 rounded-lg border border-border">
                                    Min: {off.minOrderValue}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* ── Card Actions Footer ── */}
                            <div className="px-5 pb-4 flex items-center justify-between gap-2 border-t border-border pt-3">
                              {/* Status Toggle */}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleToggleOfferStatus(off)}
                                className={`h-7 gap-1 text-[11px] font-bold ${
                                  isActive ? "text-amber-600 hover:bg-amber-500/10" : "text-emerald-600 hover:bg-emerald-500/10"
                                }`}
                                disabled={isExpired}
                              >
                                {isActive ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Activate</>}
                              </Button>

                              <div className="flex items-center gap-1">
                                {/* POS Quick Redeem */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setPosCodeInput(off.code);
                                    setPromosTab("pos");
                                  }}
                                  className="h-7 px-2 text-[11px] font-bold text-indigo-600 hover:bg-indigo-500/10 rounded-lg gap-1"
                                  title="Open in Cashier POS Terminal"
                                >
                                  <Receipt className="w-3 h-3" /> POS
                                </Button>

                                {/* Share & QR Code */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedOfferForShare(off);
                                    setIsShareOfferOpen(true);
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                                  title="Share & Print QR Counter Display"
                                >
                                  <QrCode className="w-3.5 h-3.5" />
                                </Button>

                                {/* Clone / Duplicate */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDuplicateOffer(off)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground rounded-lg"
                                  title="Duplicate Offer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </Button>

                                {/* Edit */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingOffer(off);
                                    setNewOfferFull({
                                      title: off.title,
                                      code: off.code,
                                      type: off.type,
                                      discountValue: off.discountValue,
                                      validFrom: off.validFrom,
                                      validTo: off.validTo,
                                      description: off.description || "",
                                      minOrderValue: off.minOrderValue || "",
                                      usageLimit: String(off.usageLimit || ""),
                                      targetAudience: off.targetAudience || "All Customers",
                                      isHighlighted: !!off.isHighlighted,
                                    });
                                    setIsAddOfferOpen(true);
                                  }}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-primary rounded-lg"
                                  title="Edit Offer"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>

                                {/* Delete */}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteOffer(off)}
                                  className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500 rounded-lg"
                                  title="Delete Offer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: CASHIER POS TERMINAL & INSTANT REDEEM ── */}
              {promosTab === "pos" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Interactive Terminal */}
                  <div className="lg:col-span-2 space-y-5">
                    <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-5">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 text-[11px] font-bold mb-2">
                          <Receipt className="w-3 h-3" /> Live Cashier Voucher Terminal
                        </div>
                        <h3 className="text-xl font-black text-foreground">Verify & Redeem Promo Code</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Scan barcode scanner input or manually type customer coupon code to validate and record immediate discount.
                        </p>
                      </div>

                      {/* Code Input Box */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter code e.g. WEEKEND50"
                            value={posCodeInput}
                            onChange={(e) => setPosCodeInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handlePosRedeem();
                              }
                            }}
                            className="pl-10 h-12 rounded-2xl font-mono text-base tracking-wider uppercase font-bold"
                            autoFocus
                          />
                        </div>
                        <Button
                          onClick={() => handlePosRedeem()}
                          className="h-12 px-6 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Verify & Redeem
                        </Button>
                      </div>

                      {/* 1-Click Test Buttons */}
                      <div className="space-y-1.5 pt-2">
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                          Quick 1-Click Test Codes:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {offers.filter(o => o.status === "Active").map(o => (
                            <button
                              key={o.id}
                              onClick={() => {
                                setPosCodeInput(o.code);
                                handlePosRedeem(o.code);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary text-xs font-mono font-bold border border-border transition-all flex items-center gap-1.5"
                            >
                              <span>{o.code}</span>
                              <span className="text-[10px] text-muted-foreground font-sans">({o.discountValue})</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* POS Feedback Banner */}
                      {posRedeemFeedback.status !== "idle" && (
                        <div
                          className={`p-4 rounded-2xl border transition-all animate-in fade-in ${
                            posRedeemFeedback.status === "success"
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-100"
                              : "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl shrink-0">
                              {posRedeemFeedback.status === "success" ? "🎉" : "⚠️"}
                            </div>
                            <div className="flex-1">
                              <div className="font-bold text-sm">
                                {posRedeemFeedback.status === "success" ? "Promotion Validated!" : "Validation Error"}
                              </div>
                              <p className="text-xs mt-0.5 opacity-90">{posRedeemFeedback.message}</p>
                              {posRedeemFeedback.discount && (
                                <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500 text-white font-bold text-xs">
                                  <span>Discount Applied:</span>
                                  <span className="font-mono text-sm">{posRedeemFeedback.discount}</span>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => setPosRedeemFeedback({ status: "idle", message: "" })}
                              className="text-muted-foreground hover:text-foreground p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right 1 Col: Counter Summary Card */}
                  <div className="space-y-4">
                    <div className="p-5 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                      <h4 className="font-black text-sm text-foreground flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-indigo-500" /> Counter Telemetry
                      </h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Total Redemptions</span>
                          <span className="font-mono font-black text-sm text-foreground">{totalRedemptions}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Active Deals</span>
                          <span className="font-mono font-black text-sm text-emerald-600">{activeCount}</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Today's Redemptions</span>
                          <span className="font-mono font-black text-sm text-indigo-600">{redemptions.length}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPromosTab("history")}
                          className="w-full text-xs font-bold gap-1.5"
                        >
                          <Clock className="w-3.5 h-3.5" /> View Audit Trail ({redemptions.length})
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: REDEMPTIONS AUDIT LOG TABLE ── */}
              {promosTab === "history" && (
                <div className="space-y-4">
                  <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="font-black text-lg text-foreground flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-500" /> Redemptions Audit Ledger
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Chronological log of customer coupon scans, checkout redemptions, and discounts granted.
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleExportOffersCsv}
                        className="gap-1.5 text-xs font-bold shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" /> Export Log
                      </Button>
                    </div>

                    {redemptions.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground text-xs">
                        No redemptions logged yet. Use the Cashier POS Terminal to redeem your first customer code.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold">
                            <tr>
                              <th className="py-3 px-4 rounded-l-xl">Customer</th>
                              <th className="py-3 px-4">Voucher Code</th>
                              <th className="py-3 px-4">Offer Title</th>
                              <th className="py-3 px-4">Discount</th>
                              <th className="py-3 px-4">Branch Counter</th>
                              <th className="py-3 px-4 rounded-r-xl">Timestamp</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {redemptions.map((red) => (
                              <tr key={red.id} className="hover:bg-muted/30 transition-colors">
                                <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-[10px]">
                                    {red.customerName.slice(0, 1)}
                                  </div>
                                  {red.customerName}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-mono font-black text-primary px-2 py-0.5 rounded-md bg-primary/10">
                                    {red.code}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-foreground font-medium">{red.offerTitle}</td>
                                <td className="py-3 px-4 font-black text-emerald-600">{red.discountValue}</td>
                                <td className="py-3 px-4 text-muted-foreground">{red.branchName}</td>
                                <td className="py-3 px-4 text-muted-foreground">{red.redeemedAt}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Pro Tip Advertising Banner ── */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-500" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-foreground">Pro Tip: Boost Offers with Sponsored Ad Campaigns</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Businesses that attach active promotions to targeted sponsored search campaigns see 3.8x more voucher claims and foot traffic across Addis Ababa.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setActiveNav("advertising"); setActiveSubnav("create"); }}
                  className="shrink-0 text-xs font-bold gap-1.5 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
                >
                  <Megaphone className="w-3.5 h-3.5 text-indigo-500" /> Launch Ad Campaign
                </Button>
              </div>
            </div>
            );
          })()}

          {/* ════════════════════════════════════════════════════════════════════
              9. 💳 BILLING & PAYMENTS
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "billing" && (
            <BillingPlansView
              businesses={businesses}
              selectedBusiness={selectedBusiness}
              onBusinessUpdated={(updatedBiz) => {
                setSelectedBusiness(updatedBiz);
                setBusinesses((prev) =>
                  prev.map((b) => (b.id === updatedBiz.id ? updatedBiz : b))
                );
              }}
              onRefreshBusinesses={() => {
                fetchBusinesses(bizPage, portfolioScope, bizStatusFilter, bizSearch, bizSort);
              }}
              userEmail={user?.primaryEmailAddress?.emailAddress}
              userPhone={user?.primaryPhoneNumber?.phoneNumber}
            />
          )}

          {/* ════════════════════════════════════════════════════════════════════
              10. 💬 MESSAGES & INQUIRIES
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "messages" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div>
                <h2 className="text-2xl font-black text-foreground">Customer Inquiries & Messages</h2>
                <p className="text-xs text-muted-foreground">Direct customer table inquiries, catering quotes, and customer questions.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Messages List Column */}
                <div className="p-4 rounded-3xl bg-card border border-border space-y-3">
                  <div className="font-bold text-xs text-muted-foreground uppercase px-2">Inbox ({messages.length})</div>
                  <div className="space-y-1.5">
                    {messages.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMessage(m)}
                        className={`p-3 rounded-2xl cursor-pointer transition-all ${
                          selectedMessage?.id === m.id
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-muted/50 border border-transparent"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-foreground">{m.customerName}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">{m.timestamp}</span>
                        </div>
                        <div className="text-xs font-semibold text-foreground truncate mt-0.5">{m.subject}</div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{m.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Active Chat Conversation Column */}
                <div className="md:col-span-2 p-6 rounded-3xl bg-card border border-border shadow-sm flex flex-col justify-between min-h-[420px]">
                  {selectedMessage ? (
                    <>
                      <div className="border-b border-border pb-3 flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-base text-foreground">{selectedMessage.customerName}</h4>
                          <span className="text-xs text-muted-foreground">{selectedMessage.subject}</span>
                        </div>
                        <Badge className="bg-primary/10 text-primary text-[10px]">{selectedMessage.status}</Badge>
                      </div>

                      {/* Chat Thread */}
                      <div className="flex-1 py-4 space-y-3 overflow-y-auto">
                        {selectedMessage.thread.map((msg, i) => (
                          <div
                            key={i}
                            className={`flex flex-col ${msg.sender === "owner" ? "items-end" : "items-start"}`}
                          >
                            <div
                              className={`p-3.5 rounded-2xl max-w-md text-xs ${
                                msg.sender === "owner"
                                  ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                                  : "bg-muted text-foreground font-medium rounded-tl-none"
                              }`}
                            >
                              {msg.text}
                            </div>
                            <span className="text-[9px] text-muted-foreground mt-1 px-1">{msg.time}</span>
                          </div>
                        ))}
                      </div>

                      {/* Reply Input Box */}
                      <div className="border-t border-border pt-3 flex items-center gap-2">
                        <Input
                          value={replyMessageText}
                          onChange={(e) => setReplyMessageText(e.target.value)}
                          placeholder="Type your response to the customer..."
                          className="text-xs rounded-xl"
                          onKeyDown={(e) => { if (e.key === "Enter") handleSendCustomerReply(); }}
                        />
                        <Button size="sm" variant="gradient" onClick={handleSendCustomerReply} className="gap-1.5 text-xs font-bold px-4">
                          <Send className="w-3.5 h-3.5" /> Send
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-xs">
                      <MessageSquare className="w-8 h-8 opacity-40 mb-2" />
                      Select a message to view conversation
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              11. 🔔 NOTIFICATIONS & ALERTS (Real DB + 10-Per-Page Pagination)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "notifications" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Notifications & Activity Feed</h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                      {ownerNotifTotalCount} Total
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time alerts regarding business listing approvals, reviews, payment receipts, and administrative directives.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Mark All Read */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOwnerMarkAllRead}
                    disabled={isOwnerNotifsLoading || (ownerNotifStats?.unread === 0 && unreadNotifsCount === 0)}
                    className="text-xs font-bold gap-1.5 h-8 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Mark All Read</span>
                  </Button>

                  {/* Clear Read */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleOwnerClearAllRead}
                    disabled={isOwnerNotifsLoading}
                    className="text-xs font-bold gap-1.5 h-8 text-muted-foreground hover:text-red-500 hover:border-red-500/30"
                    title="Clear read notifications"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Clear Read</span>
                  </Button>

                  {/* Sound Toggle */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={toggleSound}
                    className="text-xs font-bold gap-1.5 h-8"
                    title={soundEnabled ? "Audio chimes active (click to mute)" : "Audio muted (click to unmute)"}
                  >
                    {soundEnabled ? (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="hidden lg:inline text-[11px]">Chime On</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="hidden lg:inline text-[11px]">Muted</span>
                      </>
                    )}
                  </Button>

                  {/* Desktop Push Notification Toggle */}
                  <Button
                    size="sm"
                    variant={hasDesktopPermission ? "outline" : "secondary"}
                    onClick={handleRequestDesktopPermission}
                    className="text-xs font-bold gap-1.5 h-8"
                    title={hasDesktopPermission ? "Desktop push notifications active" : "Enable desktop notifications"}
                  >
                    <BellRing className={`w-3.5 h-3.5 ${hasDesktopPermission ? "text-primary" : "text-amber-500"}`} />
                    <span className="hidden lg:inline text-[11px]">{hasDesktopPermission ? "Push Active" : "Enable Push"}</span>
                  </Button>

                  {/* âš¡ Live Simulator Dropdown */}
                  <div className="relative inline-block">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSimulateNotification(e.target.value as any);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                      disabled={isSimulatingAlert}
                      className="h-8 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold text-xs px-2.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
                    >
                      <option value="" disabled>⚡ Simulate Alert…</option>
                      <option value="review">⭐ 1. New 5-Star Review</option>
                      <option value="inquiry">💬 2. Customer Inquiry</option>
                      <option value="billing">💳 3. Invoice Paid</option>
                      <option value="verification">🎉 4. Verification Badge</option>
                    </select>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchOwnerNotifications(ownerNotifPage)}
                    disabled={isOwnerNotifsLoading}
                    className="text-xs font-bold gap-1.5 h-8"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isOwnerNotifsLoading ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsRegisterOwnerNotifOpen(true)}
                    className="gap-1.5 text-xs font-bold h-8 shadow-md shadow-primary/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Register Real</span> Alert
                  </Button>
                </div>
              </div>

              {/* KPI Telemetry Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total</span>
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {ownerNotifStats?.total ?? ownerNotifTotalCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">All logged notifications</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Unread</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-amber-500 mt-2 font-mono">
                    {ownerNotifStats?.unread ?? 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Pending read receipts</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-red-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Critical</span>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-red-500 mt-2 font-mono">
                    {ownerNotifStats?.criticalCount ?? 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">High urgency directives</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Business</span>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-500 mt-2 font-mono">
                    {ownerNotifStats?.businessCount ?? 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Merchant specific</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-blue-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Global</span>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-blue-500 mt-2 font-mono">
                    {ownerNotifStats?.globalCount ?? 0}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Platform announcements</div>
                </div>
              </div>

              {/* Quick Segment Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-2xl border border-border overflow-x-auto no-scrollbar w-fit max-w-full">
                {[
                  { key: "all", label: "All Alerts", count: ownerNotifTotalCount },
                  { key: "unread", label: "Unread", count: ownerNotifStats?.unread ?? liveUnreadCount },
                  { key: "read", label: "Read" },
                  { key: "critical", label: "Urgent", count: ownerNotifStats?.criticalCount },
                  { key: "business", label: "Business", count: ownerNotifStats?.businessCount },
                  { key: "global", label: "Global", count: ownerNotifStats?.globalCount },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveSubnav(tab.key);
                      setOwnerNotifPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                      activeSubnav === tab.key
                        ? "bg-card text-primary shadow-xs border border-border"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                          activeSubnav === tab.key
                            ? "bg-primary/20 text-primary"
                            : tab.key === "unread"
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Search + Filter Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search notifications by title or message…"
                    value={ownerNotifSearch}
                    onChange={(e) => setOwnerNotifSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setOwnerNotifPage(1);
                        fetchOwnerNotifications(1);
                      }
                    }}
                    className="pl-9 text-xs h-9"
                  />
                </div>
                <select
                  value={ownerNotifTypeFilter}
                  onChange={(e) => {
                    setOwnerNotifTypeFilter(e.target.value);
                    setOwnerNotifPage(1);
                  }}
                  className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground"
                >
                  <option value="all">All Types</option>
                  <option value="system">System</option>
                  <option value="verification">Verification</option>
                  <option value="review">Review</option>
                  <option value="payment">Payment</option>
                  <option value="security">Security</option>
                  <option value="promo">Promo</option>
                  <option value="dispute">Dispute</option>
                </select>
                <select
                  value={ownerNotifPriorityFilter}
                  onChange={(e) => {
                    setOwnerNotifPriorityFilter(e.target.value);
                    setOwnerNotifPage(1);
                  }}
                  className="h-9 rounded-xl border border-border bg-background px-3 text-xs text-foreground"
                >
                  <option value="all">All Priorities</option>
                  <option value="critical">🔴 Critical</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🔵 Medium</option>
                  <option value="low">⚪ Low</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setOwnerNotifPage(1);
                    fetchOwnerNotifications(1);
                  }}
                  className="h-9 text-xs font-bold px-4"
                >
                  Apply Filter
                </Button>
              </div>

              {/* Notification Cards List (10 per page) */}
              <div className="space-y-3">
                {isOwnerNotifsLoading ? (
                  <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm font-bold text-foreground">Loading notifications…</p>
                    <p className="text-xs text-muted-foreground">Connecting to database collection</p>
                  </div>
                ) : ownerNotificationsList.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-card border border-dashed border-border text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                      <Bell className="w-7 h-7" />
                    </div>
                    <div className="max-w-md mx-auto space-y-1">
                      <h3 className="text-lg font-black text-foreground">No Notifications Found</h3>
                      <p className="text-xs text-muted-foreground">
                        {ownerNotifSearch || ownerNotifTypeFilter !== "all" || ownerNotifPriorityFilter !== "all"
                          ? "No notifications match your current filters. Try resetting the filters."
                          : "You are all caught up! Updates regarding listings and reviews will appear here."}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => setIsRegisterOwnerNotifOpen(true)}
                      className="gap-2 font-bold text-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Register Real Notification
                    </Button>
                  </div>
                ) : (
                  ownerNotificationsList.map((n) => {
                    const isCritical = n.priority === "critical";
                    const isUnread = !n.isRead;
                    return (
                      <div
                        key={n.id}
                        className={`p-5 rounded-3xl bg-card border transition-all hover:border-border/90 hover:shadow-md space-y-3 relative ${
                          isCritical
                            ? "border-red-500/40 bg-gradient-to-r from-red-500/[0.04] to-transparent shadow-xs"
                            : isUnread
                            ? "border-primary/40 bg-gradient-to-r from-primary/[0.03] to-transparent shadow-xs"
                            : "border-border/70 opacity-95"
                        }`}
                      >
                        {/* Top: ID + Unread Pulse + Badges */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Unread Visual Indicator */}
                            {isUnread ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                Unread
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full border border-border/60">
                                <Check className="w-3 h-3 text-muted-foreground/80" />
                                Read
                              </span>
                            )}

                            <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                              {n.id}
                            </span>

                            {/* Target badge */}
                            <Badge
                              className={`text-[10px] font-bold ${
                                n.target === "global"
                                  ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : n.target === "business"
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : n.target === "admin"
                                  ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                  : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                              }`}
                            >
                              {n.target === "global"
                                ? "🌐 Global"
                                : n.target === "business"
                                ? "🏢 Business"
                                : n.target === "admin"
                                ? "🛡️ Admin"
                                : "👤 User"}
                            </Badge>

                            {/* Type badge */}
                            <Badge
                              variant="outline"
                              className="text-[10px] capitalize font-bold border-border text-muted-foreground"
                            >
                              {n.type || "system"}
                            </Badge>

                            {/* Priority badge */}
                            {n.priority === "critical" && (
                              <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[9px] font-black animate-pulse">
                                🔴 Critical
                              </Badge>
                            )}
                            {n.priority === "high" && (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[9px] font-black">
                                🟠 High
                              </Badge>
                            )}
                            {n.priority === "medium" && (
                              <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[9px] font-black">
                                🔵 Medium
                              </Badge>
                            )}
                            {n.priority === "low" && (
                              <Badge variant="outline" className="text-[9px] text-muted-foreground">
                                ⚪ Low
                              </Badge>
                            )}
                          </div>

                          <span className="text-[11px] text-muted-foreground">
                            {n.sent ||
                              (n.createdAt
                                ? new Date(n.createdAt).toLocaleDateString(undefined, {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "")}
                          </span>
                        </div>

                        {/* Title + Body */}
                        <div>
                          <h4 className={`tracking-tight text-sm ${isUnread ? "text-foreground font-black" : "text-foreground/90 font-bold"}`}>
                            {n.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {n.body}
                          </p>
                        </div>

                        {/* Footer: meta + actions */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/80">
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 flex-wrap">
                            <span>Sent by <strong className="text-foreground">{n.sentBy || "Platform"}</strong></span>
                            {n.link && (
                              <span className="font-mono text-primary/80">({n.link})</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Direct Deep-link Action CTA */}
                            {n.link && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  if (isUnread) handleOwnerMarkRead(n.id);
                                  if (n.link?.includes("tab=reviews")) setActiveNav("reviews");
                                  else if (n.link?.includes("tab=messages")) setActiveNav("messages");
                                  else if (n.link?.includes("tab=billing")) setActiveNav("billing");
                                  else if (n.link?.includes("tab=support")) setActiveNav("support");
                                  else if (n.link?.includes("tab=moderation")) setActiveNav("moderation");
                                  else if (n.link?.includes("tab=settings")) setActiveNav("settings");
                                  else if (n.link?.startsWith("/")) window.open(n.link, "_blank");
                                }}
                                className="text-xs font-bold h-7 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <ArrowUpRight className="w-3 h-3" />
                                {n.type === "review"
                                  ? "Reply to Review"
                                  : n.type === "payment"
                                  ? "View Invoices"
                                  : n.type === "message"
                                  ? "Open Inquiry"
                                  : "View Details"}
                              </Button>
                            )}

                            {/* Mark Read / Unread Toggle */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => (n.isRead ? handleOwnerMarkUnread(n.id) : handleOwnerMarkRead(n.id))}
                              className="text-xs font-bold h-7 gap-1 text-muted-foreground hover:text-foreground"
                              title={n.isRead ? "Mark as unread" : "Mark as read"}
                            >
                              {n.isRead ? (
                                <>
                                  <Clock className="w-3 h-3 text-muted-foreground" />
                                  <span className="hidden sm:inline">Mark Unread</span>
                                </>
                              ) : (
                                <>
                                  <Check className="w-3 h-3 text-emerald-500" />
                                  <span className="hidden sm:inline">Mark Read</span>
                                </>
                              )}
                            </Button>

                            {/* Inspect Modal Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOwnerNotifForDetail(n)}
                              className="text-xs font-bold h-7 gap-1"
                            >
                              <Eye className="w-3 h-3 text-primary" /> Inspect
                            </Button>

                            {/* Delete / Dismiss */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOwnerDeleteNotification(n.id)}
                              className="h-7 text-xs text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ─── 10-ITEMS-PER-PAGE PAGINATION BAR ───────────────────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <div>
                  Showing{" "}
                  <strong className="text-foreground">
                    {ownerNotifTotalCount === 0 ? 0 : (ownerNotifPage - 1) * OWNER_NOTIFS_PER_PAGE + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-foreground">
                    {Math.min(ownerNotifPage * OWNER_NOTIFS_PER_PAGE, ownerNotifTotalCount)}
                  </strong>{" "}
                  of <strong className="text-foreground">{ownerNotifTotalCount}</strong> notifications (
                  <span className="font-semibold text-primary">10 per page</span>)
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ownerNotifPage <= 1 || isOwnerNotifsLoading}
                    onClick={() => setOwnerNotifPage((p) => Math.max(1, p - 1))}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>

                  {/* Dynamic page number buttons */}
                  {Array.from({ length: Math.min(5, ownerNotifTotalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (ownerNotifTotalPages > 5 && ownerNotifPage > 3) {
                      pageNum = Math.min(
                        ownerNotifTotalPages - 4 + i,
                        Math.max(ownerNotifPage - 2 + i, i + 1)
                      );
                    }
                    if (pageNum < 1 || pageNum > ownerNotifTotalPages) return null;
                    const isActive = ownerNotifPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setOwnerNotifPage(pageNum)}
                        disabled={isOwnerNotifsLoading}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-primary"
                            : "bg-card hover:bg-muted text-foreground border border-border"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {ownerNotifTotalPages > 5 && ownerNotifPage < ownerNotifTotalPages - 2 && (
                    <span className="px-1 text-muted-foreground">…</span>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ownerNotifPage >= ownerNotifTotalPages || isOwnerNotifsLoading}
                    onClick={() => setOwnerNotifPage((p) => Math.min(ownerNotifTotalPages, p + 1))}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              12. 🎫 SUPPORT DESK (20 ITEMS PER PAGE SERVER PAGINATION)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "support" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header with Quick Actions & Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">
                      Business Support &amp; Help Desk
                    </h2>
                    <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 text-[10px] font-bold">
                      {ownerTicketTotalCount} Active Tickets
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Contact platform administration for business verification, billing settlements, branch updates, or technical assistance.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Simulator Testing Trigger */}
                  <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/80">
                    <span className="text-[10px] font-black text-muted-foreground px-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      Simulator:
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSimulatingSupport}
                      onClick={() => handleSimulateGlobalSupportResponse("verification_approved")}
                      className="h-7 text-[11px] font-bold px-2 hover:bg-emerald-500/10 hover:text-emerald-600"
                      title="Simulate immediate license verification approval by compliance desk"
                    >
                      {isSimulatingSupport ? <RefreshCw className="w-3 h-3 animate-spin" /> : "✅ Verify License"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={isSimulatingSupport}
                      onClick={() => handleSimulateGlobalSupportResponse("settlement_cleared")}
                      className="h-7 text-[11px] font-bold px-2 hover:bg-blue-500/10 hover:text-blue-600"
                      title="Simulate bank payout settlement confirmation"
                    >
                      {isSimulatingSupport ? <RefreshCw className="w-3 h-3 animate-spin" /> : "💳 Settle Payout"}
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchOwnerTickets(ownerTicketPage)}
                    disabled={isOwnerTicketsLoading}
                    className="text-xs font-bold gap-1.5 h-8"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isOwnerTicketsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>

                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => {
                      setPrefilledTicketCategory("general");
                      setPrefilledTicketSubject("");
                      setIsCreateOwnerTicketOpen(true);
                    }}
                    className="gap-1.5 text-xs font-bold h-8 shadow-md shadow-indigo-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Open New Ticket
                  </Button>
                </div>
              </div>

              {/* View Switcher Tabs & SLA Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-b border-border/60 pb-3">
                <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border/80 w-fit">
                  <button
                    type="button"
                    onClick={() => setSupportTabMode("tickets")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      supportTabMode === "tickets"
                        ? "bg-card text-foreground shadow-sm shadow-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5 text-indigo-500" />
                    <span>My Support Tickets</span>
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-black">
                      {ownerTicketTotalCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSupportTabMode("faq")}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      supportTabMode === "faq"
                        ? "bg-card text-foreground shadow-sm shadow-black/5"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Help Center &amp; FAQs</span>
                    <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black">
                      Self-Service
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-semibold text-rose-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Critical: &lt;2h SLA
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-amber-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> High: &lt;12h SLA
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Standard: &lt;24h SLA
                  </span>
                </div>
              </div>

              {supportTabMode === "faq" ? (
                <SupportKnowledgeBase
                  onOpenTicketWithTopic={(category, subject) => {
                    setPrefilledTicketCategory(category);
                    setPrefilledTicketSubject(subject);
                    setIsCreateOwnerTicketOpen(true);
                  }}
                />
              ) : (
                <>
                  {/* KPI Telemetry Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span className="text-[10px] font-bold uppercase tracking-wider">All Cases</span>
                    <Ticket className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {ownerTicketTotalCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Total inquiries logged</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-red-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Open</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-red-600 mt-2 font-mono">
                    {ownerTicketStats?.open ?? 0}
                  </div>
                  <div className="text-[10px] text-red-600 dark:text-red-400 mt-1">Under review</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Awaiting My Reply</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-amber-600 mt-2 font-mono">
                    {ownerTicketStats?.waiting ?? 0}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Action required</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-emerald-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Resolved</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-600 mt-2 font-mono">
                    {ownerTicketStats?.resolved ?? 0}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Successfully closed</div>
                </div>
              </div>

              {/* Subnav Tabs */}
              {renderSubnavTabs([
                { key: "all", label: "All Tickets", count: ownerTicketTotalCount },
                { key: "open", label: "Open Tickets", count: ownerTicketStats?.open ?? 0 },
                { key: "in_progress", label: "In Progress", count: ownerTicketStats?.inProgress ?? 0 },
                { key: "waiting_on_customer", label: "Awaiting My Reply", count: ownerTicketStats?.waiting ?? 0 },
                { key: "resolved", label: "Resolved", count: ownerTicketStats?.resolved ?? 0 },
              ])}

              {/* Filtering Toolbar */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={ownerTicketSearch}
                      onChange={(e) => {
                        setOwnerTicketSearch(e.target.value);
                        setOwnerTicketPage(1);
                      }}
                      placeholder="Search tickets by subject, category, or ticket #ID..."
                      className="pl-8 text-xs h-9 rounded-xl"
                    />
                  </div>
                  {ownerTicketSearch && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setOwnerTicketSearch("");
                        setOwnerTicketPage(1);
                      }}
                      className="h-8 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Category Filter */}
                  <select
                    value={ownerTicketCategoryFilter}
                    onChange={(e) => {
                      setOwnerTicketCategoryFilter(e.target.value);
                      setOwnerTicketPage(1);
                    }}
                    className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="verification">Verification</option>
                    <option value="billing">Billing &amp; Finance</option>
                    <option value="technical">Technical</option>
                    <option value="listing">Listing &amp; Branches</option>
                    <option value="dispute">Disputes &amp; Reviews</option>
                    <option value="account">Account Access</option>
                    <option value="general">General</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={ownerTicketPriorityFilter}
                    onChange={(e) => {
                      setOwnerTicketPriorityFilter(e.target.value);
                      setOwnerTicketPage(1);
                    }}
                    className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">🚨 Critical SLA</option>
                    <option value="high">🔥 High Priority</option>
                    <option value="medium">🔵 Medium Priority</option>
                    <option value="low">⚪ Low Priority</option>
                  </select>
                </div>
              </div>

              {/* Tickets List (20 per page) */}
              {isOwnerTicketsLoading ? (
                <div className="p-16 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <RefreshCw className="w-7 h-7 mx-auto animate-spin text-primary" />
                  <p className="text-xs font-bold">Loading support tickets…</p>
                </div>
              ) : ownerTickets.length === 0 ? (
                <div className="p-16 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <Ticket className="w-12 h-12 mx-auto text-muted-foreground/40 mb-2" />
                  <h3 className="font-black text-foreground text-base">No support tickets found</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Need help with verification, billing, or technical issues? Click "Open New Ticket" to reach our dedicated platform staff.
                  </p>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsCreateOwnerTicketOpen(true)}
                    className="text-xs font-bold mt-2"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Open Ticket
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {ownerTickets.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedOwnerTicketForDetail(t)}
                      className="p-5 rounded-3xl bg-card border border-border/80 hover:border-primary/40 transition-all cursor-pointer shadow-xs space-y-3 group"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/20">
                            {t.id}
                          </span>
                          <Badge variant="outline" className="capitalize text-[10px] font-bold">
                            {t.category}
                          </Badge>
                          {t.priority === "critical" && (
                            <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[9px] font-black animate-pulse">
                              🚨 Critical SLA
                            </Badge>
                          )}
                          {t.priority === "high" && (
                            <Badge className="bg-orange-500/15 text-orange-600 border-orange-500/30 text-[9px] font-bold">
                              🔥 High
                            </Badge>
                          )}
                          {t.status === "open" && (
                            <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] font-bold">
                              🔴 Open
                            </Badge>
                          )}
                          {t.status === "in_progress" && (
                            <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-[10px] font-bold">
                              âš¡ In Progress
                            </Badge>
                          )}
                          {t.status === "waiting_on_customer" && (
                            <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-bold">
                              ⏳ Awaiting Your Reply
                            </Badge>
                          )}
                          {t.status === "resolved" && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                              ✓ Resolved
                            </Badge>
                          )}
                          {t.status === "closed" && (
                            <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30 text-[10px] font-bold">
                              🔒 Closed
                            </Badge>
                          )}
                        </div>

                        <span className="text-[11px] text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">
                          {t.subject}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {t.lastReply || (t.messages && t.messages[0]?.message) || "No response yet"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/80 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span>Staff Assigned: <strong className="text-foreground">{t.assignedAdmin || "Support Queue"}</strong></span>
                          <span>•</span>
                          <span>{t.messages?.length || 1} message{(t.messages?.length || 1) === 1 ? "" : "s"}</span>
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-bold gap-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOwnerTicketForDetail(t);
                          }}
                        >
                          <Eye className="w-3 h-3 text-primary" />
                          View Conversation
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ─── 20-ITEMS-PER-PAGE PAGINATION CONTROLS ───────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <div>
                  Showing{" "}
                  <strong className="text-foreground">
                    {ownerTicketTotalCount === 0 ? 0 : (ownerTicketPage - 1) * OWNER_TICKETS_PER_PAGE + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-foreground">
                    {Math.min(ownerTicketPage * OWNER_TICKETS_PER_PAGE, ownerTicketTotalCount)}
                  </strong>{" "}
                  of <strong className="text-foreground">{ownerTicketTotalCount}</strong> tickets (
                  <span className="font-semibold text-primary">20 per page</span>)
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Previous Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ownerTicketPage <= 1 || isOwnerTicketsLoading}
                    onClick={() => {
                      const prevPage = Math.max(1, ownerTicketPage - 1);
                      setOwnerTicketPage(prevPage);
                      fetchOwnerTickets(prevPage);
                    }}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>

                  {/* Dynamic Page Numbers */}
                  {Array.from({ length: Math.min(5, ownerTicketTotalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (ownerTicketTotalPages > 5 && ownerTicketPage > 3) {
                      pageNum = Math.min(
                        ownerTicketTotalPages - 4 + i,
                        Math.max(ownerTicketPage - 2 + i, i + 1)
                      );
                    }
                    if (pageNum < 1 || pageNum > ownerTicketTotalPages) return null;

                    const isActive = ownerTicketPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setOwnerTicketPage(pageNum);
                          fetchOwnerTickets(pageNum);
                        }}
                        disabled={isOwnerTicketsLoading}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-primary"
                            : "bg-card hover:bg-muted text-foreground border border-border"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {ownerTicketTotalPages > 5 && ownerTicketPage < ownerTicketTotalPages - 2 && (
                    <span className="px-1 text-muted-foreground">…</span>
                  )}

                  {/* Next Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ownerTicketPage >= ownerTicketTotalPages || isOwnerTicketsLoading}
                    onClick={() => {
                      const nextPage = Math.min(ownerTicketTotalPages, ownerTicketPage + 1);
                      setOwnerTicketPage(nextPage);
                      fetchOwnerTickets(nextPage);
                    }}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

          {/* ════════════════════════════════════════════════════════════════════
              13. 🚨 DISPUTES & MODERATION (5 PER PAGE)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "moderation" && (
            <div className="space-y-6 max-w-5xl mx-auto">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">Disputes & Moderation Desk</h2>
                    <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] font-bold">
                      {ownerReportTotalCount} Filed Cases
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    File infringement complaints, appeal biased customer reviews, and monitor live administrative rulings.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchOwnerReports(ownerReportPage)}
                    disabled={isOwnerReportsLoading}
                    className="text-xs font-bold gap-1.5 h-8"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isOwnerReportsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => {
                      setPreselectedReportTarget({
                        type: "business",
                        id: selectedBusiness?.id,
                        name: selectedBusiness?.name,
                      });
                      setIsRegisterOwnerReportOpen(true);
                    }}
                    className="gap-1.5 text-xs font-bold h-8 shadow-md shadow-red-500/15"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    File Incident / Dispute
                  </Button>
                </div>
              </div>

              {/* Status Tabs */}
              {renderSubnavTabs([
                { key: "all", label: "All Cases", count: ownerReportTotalCount },
                { key: "pending", label: "In Triage / Review", count: ownerReportStats?.underReviewCount },
                { key: "resolved", label: "Resolved Cases", count: ownerReportStats?.resolvedCount },
              ])}

              {/* Reports List - 5 per page */}
              {isOwnerReportsLoading ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <Loader2 className="w-7 h-7 mx-auto animate-spin text-primary" />
                  <p className="text-xs font-bold">Retrieving active moderation tickets…</p>
                </div>
              ) : ownerReports.length === 0 ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-60" />
                  <p className="font-bold text-foreground">No active disputes or reports</p>
                  <p className="text-xs text-muted-foreground">
                    Your business listing is currently in full compliance and has no open flags.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ownerReports
                    .filter((r) => {
                      if (activeSubnav === "pending") return r.status === "under_review" || r.status === "investigating" || r.status === "pending";
                      if (activeSubnav === "resolved") return r.status === "resolved" || r.status === "dismissed";
                      return true;
                    })
                    .map((r) => (
                      <div
                        key={r.id}
                        className="p-5 rounded-3xl bg-card border border-border/80 hover:border-border transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                              {r.id}
                            </span>
                            <Badge variant="outline" className="text-[9px] uppercase font-bold border-border text-muted-foreground">
                              {r.type}
                            </Badge>
                            {r.priority === "critical" && (
                              <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[9px] font-bold">
                                🔴 Critical
                              </Badge>
                            )}
                            {r.status === "resolved" ? (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-bold">
                                ✓ Resolved
                              </Badge>
                            ) : r.status === "investigating" ? (
                              <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-[10px] font-bold">
                                🔍 In Investigation
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-bold">
                                ⏳ Under Review
                              </Badge>
                            )}
                          </div>
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-bold text-foreground text-sm">{r.title}</h4>
                          <div className="text-xs text-muted-foreground mt-1">
                            Reason: <strong className="text-foreground">{r.reason}</strong> • Target: {r.targetName} • Reporter: {r.reporterName}
                          </div>
                          {r.details && (
                            <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2.5 rounded-xl">
                              {r.details}
                            </p>
                          )}
                        </div>

                        {r.resolutionNotes && (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                            <strong>Resolution Finding:</strong> {r.resolutionNotes}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-border/80 text-[11px] text-muted-foreground">
                          <span>Jurisdiction: {r.city || "Addis Ababa"}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedOwnerReportForDetail(r)}
                            className="text-xs font-bold h-7 gap-1"
                          >
                            <Eye className="w-3 h-3 text-primary" />
                            View Case File
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {/* ─── 5-ITEMS-PER-PAGE PAGINATION CONTROLS ───────────────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <div>
                  Showing{" "}
                  <strong className="text-foreground">
                    {ownerReportTotalCount === 0 ? 0 : (ownerReportPage - 1) * OWNER_REPORTS_PER_PAGE + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-foreground">
                    {Math.min(ownerReportPage * OWNER_REPORTS_PER_PAGE, ownerReportTotalCount)}
                  </strong>{" "}
                  of <strong className="text-foreground">{ownerReportTotalCount}</strong> cases (
                  <span className="font-semibold text-primary">5 per page</span>)
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ownerReportPage <= 1 || isOwnerReportsLoading}
                    onClick={() => setOwnerReportPage((p) => Math.max(1, p - 1))}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>

                  {/* Page Numbers */}
                  {Array.from({ length: Math.min(5, ownerReportTotalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (ownerReportTotalPages > 5 && ownerReportPage > 3) {
                      pageNum = Math.min(ownerReportTotalPages - 4 + i, ownerReportPage - 2 + i);
                    }
                    if (pageNum < 1 || pageNum > ownerReportTotalPages) return null;

                    const isActive = ownerReportPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setOwnerReportPage(pageNum)}
                        disabled={isOwnerReportsLoading}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/25 ring-1 ring-primary"
                            : "bg-card hover:bg-muted text-foreground border border-border"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ownerReportPage >= ownerReportTotalPages || isOwnerReportsLoading}
                    onClick={() => setOwnerReportPage((p) => Math.min(ownerReportTotalPages, p + 1))}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              14. ⚙️ SETTINGS
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "settings" && (
            <DashboardSettingsView
              business={selectedBusiness}
              onBusinessUpdated={handleUpdateBusiness}
            />
          )}

          {/* ════════════════════════════════════════════════════════════════════
              15. 🔐 SECURITY & ACCESS
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "security" && (
            <SecurityWorkstation
              portalType="owner"
              currentUserName={user?.fullName || selectedBusiness?.name || "Business Owner"}
              currentUserRole="owner"
              initialSubnav={activeSubnav === "security" ? "audit" : activeSubnav}
            />
          )}
          </div>{/* end animate-page-enter */}
        </main>
      </div>

      {/* ─── MODALS & DIALOGS ──────────────────────────────────────────────── */}

      {/* 1. Edit Full Listing Modal */}
      {isEditListingOpen && (
        <ListingEditorModal
          isOpen={isEditListingOpen}
          onClose={() => setIsEditListingOpen(false)}
          business={selectedBusiness}
          onSave={handleUpdateBusiness}
        />
      )}

      {/* 2. Media Uploader Modal */}
      {isMediaUploaderOpen && (
        <MediaUploaderModal
          isOpen={isMediaUploaderOpen}
          onClose={() => setIsMediaUploaderOpen(false)}
          business={selectedBusiness}
          onSaveMedia={(media, yt) => {
            handleUpdateBusiness({ ...selectedBusiness, media, youtubeVideoId: yt });
            setIsMediaUploaderOpen(false);
          }}
        />
      )}

      {/* 3. Hours Editor Modal */}
      {isHoursEditorOpen && (
        <HoursEditorModal
          isOpen={isHoursEditorOpen}
          onClose={() => setIsHoursEditorOpen(false)}
          business={selectedBusiness}
          onSaveHours={(hours) => {
            handleUpdateBusiness({ ...selectedBusiness, openingHours: hours });
            setIsHoursEditorOpen(false);
          }}
        />
      )}

      {/* 4. Add Branch Modal */}
      {isAddBranchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-foreground">Add New Branch Location</h3>
              <button onClick={() => setIsAddBranchOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddBranch} className="space-y-3 text-xs">
              <div><label className="font-bold block mb-1">Branch Name</label><Input value={newBranch.branchName} onChange={(e) => setNewBranch({ ...newBranch, branchName: e.target.value })} placeholder="e.g. Sarbet Branch" required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Country</label><Input value={newBranch.country} onChange={(e) => setNewBranch({ ...newBranch, country: e.target.value })} /></div>
                <div><label className="font-bold block mb-1">City</label><Input value={newBranch.city} onChange={(e) => setNewBranch({ ...newBranch, city: e.target.value })} /></div>
              </div>
              <div><label className="font-bold block mb-1">Address / Street</label><Input value={newBranch.addressLine} onChange={(e) => setNewBranch({ ...newBranch, addressLine: e.target.value })} placeholder="e.g. Next to International School" /></div>
              <div><label className="font-bold block mb-1">Phone Hotline</label><Input value={newBranch.phone} onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })} placeholder="+251 11 000 0000" /></div>
              <Button type="submit" variant="gradient" className="w-full font-bold mt-2">Add Branch Location</Button>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Service Modal */}
      {isAddServiceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-foreground">Add Menu / Service Item</h3>
              <button onClick={() => setIsAddServiceOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddService} className="space-y-3 text-xs">
              <div><label className="font-bold block mb-1">Service Name</label><Input value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} placeholder="e.g. VIP Table Degustation" required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Category</label><Input value={newService.category} onChange={(e) => setNewService({ ...newService, category: e.target.value })} /></div>
                <div><label className="font-bold block mb-1">Price</label><Input value={newService.price} onChange={(e) => setNewService({ ...newService, price: e.target.value })} placeholder="e.g. 500 ETB" /></div>
              </div>
              <div><label className="font-bold block mb-1">Description</label><Textarea value={newService.description} onChange={(e) => setNewService({ ...newService, description: e.target.value })} rows={2} /></div>
              <Button type="submit" variant="gradient" className="w-full font-bold mt-2">Add Service Item</Button>
            </form>
          </div>
        </div>
      )}

      {/* 6. Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-foreground">Add Retail Product</h3>
              <button onClick={() => setIsAddProductOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div><label className="font-bold block mb-1">Product Name</label><Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="e.g. Single Origin Beans" required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="font-bold block mb-1">Price (ETB)</label><Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })} /></div>
                <div><label className="font-bold block mb-1">Initial Stock</label><Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })} /></div>
              </div>
              <Button type="submit" variant="gradient" className="w-full font-bold mt-2">Add to Catalog</Button>
            </form>
          </div>
        </div>
      )}

      {/* 7. Create / Edit Offer Modal — Full-Featured */}
      {/* 7. Create / Edit Offer Modal — Live Smartphone Preview & 1-Click Presets */}
      {isAddOfferOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
                  <Gift className="w-4.5 h-4.5 text-white" style={{width:"1.125rem",height:"1.125rem"}} />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground">
                    {editingOffer ? "Edit Promotion & Deal" : "Create New Promotion & Deal"}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {editingOffer ? "Update promotion rules and settings" : "Launch an attractive customer discount or coupon code with live preview"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setIsAddOfferOpen(false); setEditingOffer(null); }}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: 2-Column Grid (Form + Live Customer Phone Preview) */}
            <div className="overflow-y-auto flex-1 px-6 py-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Controls (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                {/* 1-Click Presets */}
                {!editingOffer && (
                  <div className="space-y-1.5 p-3 rounded-2xl bg-muted/40 border border-border">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" /> 1-Click Deal Presets:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "âš¡ 20% Flash Sale", title: "20% OFF Flash Sale", type: "Percentage" as const, val: "20%", code: "FLASH20", desc: "Limited time 20% discount on entire menu/services." },
                        { label: "🍔 BOGO Special", title: "Buy 1 Get 1 Free Pastry", type: "BOGO" as const, val: "Free 2nd Item", code: "BOGODEAL", desc: "Purchase one item and receive the second of equal or lesser value free." },
                        { label: "💰 100 ETB First Visit", title: "100 ETB Welcome Voucher", type: "Fixed Amount" as const, val: "100 ETB", code: "WELCOME100", desc: "Instant 100 ETB discount on first orders over 400 ETB." },
                        { label: "☕ Weekend Special", title: "Weekend Brunch 25% Off", type: "Weekend Special" as const, val: "25%", code: "WEEKEND25", desc: "Valid exclusively on Saturdays and Sundays." },
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setNewOfferFull(prev => ({
                              ...prev,
                              title: preset.title,
                              type: preset.type,
                              discountValue: preset.val,
                              code: preset.code,
                              description: preset.desc,
                            }));
                            toast.success(`Loaded preset: ${preset.title}`);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-card hover:bg-primary/10 hover:text-primary text-[11px] font-bold border border-border transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <form
                  id="offer-form"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!newOfferFull.title.trim()) { toast.error("Offer title is required."); return; }
                    if (!newOfferFull.discountValue.trim()) { toast.error("Discount value is required."); return; }
                    const finalCode = newOfferFull.code.trim().toUpperCase() || `DEAL${Math.floor(1000 + Math.random() * 9000)}`;

                    if (editingOffer) {
                      const updated = offers.map(o => o.id === editingOffer.id ? {
                        ...o,
                        title: newOfferFull.title.trim(),
                        code: finalCode,
                        type: newOfferFull.type,
                        discountValue: newOfferFull.discountValue.trim(),
                        validFrom: newOfferFull.validFrom,
                        validTo: newOfferFull.validTo,
                        description: newOfferFull.description.trim(),
                        minOrderValue: newOfferFull.minOrderValue.trim(),
                        usageLimit: newOfferFull.usageLimit.trim() ? parseInt(newOfferFull.usageLimit.trim()) : null,
                        targetAudience: newOfferFull.targetAudience,
                        isHighlighted: newOfferFull.isHighlighted,
                      } : o);
                      persistOffers(updated);
                      toast.success(`Offer "${newOfferFull.title}" updated!`);
                    } else {
                      const off: OfferItem = {
                        id: `off-${Date.now()}`,
                        title: newOfferFull.title.trim(),
                        code: finalCode,
                        type: newOfferFull.type,
                        discountValue: newOfferFull.discountValue.trim(),
                        validFrom: newOfferFull.validFrom,
                        validTo: newOfferFull.validTo,
                        description: newOfferFull.description.trim(),
                        minOrderValue: newOfferFull.minOrderValue.trim(),
                        usageLimit: newOfferFull.usageLimit.trim() ? parseInt(newOfferFull.usageLimit.trim()) : null,
                        targetAudience: newOfferFull.targetAudience,
                        isHighlighted: newOfferFull.isHighlighted,
                        status: new Date(newOfferFull.validFrom) > new Date() ? "Scheduled" : "Active",
                        usageCount: 0,
                      };
                      persistOffers([off, ...offers]);
                      toast.success(`🎉 Promotion "${off.title}" published!`);
                    }

                    setIsAddOfferOpen(false);
                    setEditingOffer(null);
                    setNewOfferFull({
                      title: "", code: "", type: "Percentage", discountValue: "",
                      validFrom: new Date().toISOString().split("T")[0],
                      validTo: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
                      description: "", minOrderValue: "", usageLimit: "",
                      targetAudience: "All Customers", isHighlighted: false,
                    });
                  }}
                  className="space-y-4 text-xs"
                >
                  {/* Title */}
                  <div>
                    <label className="font-bold block mb-1 text-foreground">Offer Title *</label>
                    <Input
                      value={newOfferFull.title}
                      onChange={(e) => setNewOfferFull({ ...newOfferFull, title: e.target.value })}
                      placeholder="e.g. 20% OFF Friday Special"
                      className="h-10 rounded-xl text-sm"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="font-bold block mb-1 text-foreground">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
                    <Textarea
                      value={newOfferFull.description}
                      onChange={(e) => setNewOfferFull({ ...newOfferFull, description: e.target.value })}
                      placeholder="Describe what customers get with this deal..."
                      rows={2}
                      className="rounded-xl text-sm resize-none"
                    />
                  </div>

                  {/* Type + Discount Value */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-foreground">Offer Type *</label>
                      <select
                        value={newOfferFull.type}
                        onChange={(e) => setNewOfferFull({ ...newOfferFull, type: e.target.value as any })}
                        className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="Percentage">% Percentage Off</option>
                        <option value="Fixed Amount">Fixed Amount Off</option>
                        <option value="BOGO">Buy 1 Get 1 (BOGO)</option>
                        <option value="Weekend Special">Weekend Special</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-foreground">Discount Value *</label>
                      <Input
                        value={newOfferFull.discountValue}
                        onChange={(e) => setNewOfferFull({ ...newOfferFull, discountValue: e.target.value })}
                        placeholder={newOfferFull.type === "Percentage" ? "e.g. 20%" : newOfferFull.type === "Fixed Amount" ? "e.g. 100 ETB" : "Free 2nd Item"}
                        className="h-10 rounded-xl text-sm"
                        required
                      />
                    </div>
                  </div>

                  {/* Coupon Code + Generator */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-foreground">Promo Coupon Code</label>
                      <button
                        type="button"
                        onClick={() => {
                          const prefixes = ["DEAL", "SAVE", "PROMO", "SPECIAL", "VIP"];
                          const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
                          const num = Math.floor(10 + Math.random() * 90);
                          setNewOfferFull(f => ({ ...f, code: `${prefix}${num}` }));
                        }}
                        className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" /> Roll Random Code
                      </button>
                    </div>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        value={newOfferFull.code}
                        onChange={(e) => setNewOfferFull({ ...newOfferFull, code: e.target.value.toUpperCase() })}
                        placeholder="e.g. WEEKEND50"
                        className="pl-9 h-10 rounded-xl text-sm font-mono tracking-wider uppercase font-bold"
                      />
                    </div>
                  </div>

                  {/* Validity Dates */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-foreground">Start Date *</label>
                      <Input
                        type="date"
                        value={newOfferFull.validFrom}
                        onChange={(e) => setNewOfferFull({ ...newOfferFull, validFrom: e.target.value })}
                        className="h-10 rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-foreground">Expiry Date *</label>
                      <Input
                        type="date"
                        value={newOfferFull.validTo}
                        onChange={(e) => setNewOfferFull({ ...newOfferFull, validTo: e.target.value })}
                        className="h-10 rounded-xl text-sm"
                        min={newOfferFull.validFrom}
                        required
                      />
                    </div>
                  </div>

                  {/* Min Order + Usage Limit */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold block mb-1 text-foreground">Min. Order Requirement</label>
                      <Input
                        value={newOfferFull.minOrderValue}
                        onChange={(e) => setNewOfferFull({ ...newOfferFull, minOrderValue: e.target.value })}
                        placeholder="e.g. 300 ETB"
                        className="h-10 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="font-bold block mb-1 text-foreground">Redemptions Cap / Limit</label>
                      <Input
                        type="number"
                        value={newOfferFull.usageLimit}
                        onChange={(e) => setNewOfferFull({ ...newOfferFull, usageLimit: e.target.value })}
                        placeholder="e.g. 500 (blank = unlimited)"
                        className="h-10 rounded-xl text-sm"
                      />
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="font-bold block mb-1 text-foreground">Target Audience</label>
                    <select
                      value={newOfferFull.targetAudience}
                      onChange={(e) => setNewOfferFull({ ...newOfferFull, targetAudience: e.target.value })}
                      className="w-full h-10 rounded-xl border border-input bg-background px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="All Customers">All Customers</option>
                      <option value="New Customers Only">New Customers Only</option>
                      <option value="Returning Customers">Returning Customers Only</option>
                      <option value="Loyalty Members">Loyalty Members</option>
                    </select>
                  </div>

                  {/* Featured toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 border border-border">
                    <div className="flex items-center gap-2.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <div>
                        <div className="font-bold text-foreground text-sm">Feature on Profile</div>
                        <div className="text-[11px] text-muted-foreground">Highlight with gold badge on your public store profile</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewOfferFull(f => ({ ...f, isHighlighted: !f.isHighlighted }))}
                      className={`w-11 h-6 rounded-full transition-all shrink-0 ${
                        newOfferFull.isHighlighted ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform mx-0.5 ${
                        newOfferFull.isHighlighted ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Mobile Customer App Preview (5 cols) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-start">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> Customer Mobile App Live Preview
                </div>

                {/* Smartphone Mockup */}
                <div className="w-full max-w-[290px] rounded-[2.5rem] border-4 border-slate-800 bg-slate-950 p-2.5 shadow-2xl relative overflow-hidden">
                  {/* Phone Notch */}
                  <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

                  {/* App Screen Content */}
                  <div className="rounded-[1.8rem] bg-card text-foreground overflow-hidden border border-border/60 text-left">
                    {/* Store Header in App */}
                    <div className="p-3 bg-muted/60 border-b border-border/60 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                        {selectedBusiness?.name?.slice(0, 1) || "G"}
                      </div>
                      <div className="flex-1 truncate">
                        <div className="text-[11px] font-black truncate">{selectedBusiness?.name || "My Store"}</div>
                        <div className="text-[9px] text-muted-foreground">Special Promotion</div>
                      </div>
                      <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0 border-emerald-500/30">
                        Verified
                      </Badge>
                    </div>

                    {/* Promotional Voucher Card in App */}
                    <div className="p-3.5 space-y-3">
                      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-600 to-pink-600 text-white p-3.5 shadow-md">
                        <div className="flex items-center justify-between text-[10px] font-bold opacity-90 mb-1">
                          <span>{newOfferFull.type}</span>
                          {newOfferFull.isHighlighted && <span>★ FEATURED</span>}
                        </div>
                        <div className="text-xl font-black leading-tight">
                          {newOfferFull.discountValue || "20% OFF"}
                        </div>
                        <div className="text-xs font-bold mt-0.5 line-clamp-1">
                          {newOfferFull.title || "Special Promotion"}
                        </div>
                        {newOfferFull.description && (
                          <div className="text-[10px] opacity-85 mt-1 line-clamp-2">
                            {newOfferFull.description}
                          </div>
                        )}
                      </div>

                      {/* Monospace Code in App */}
                      <div className="p-2.5 rounded-xl bg-muted/50 border border-dashed border-primary/40 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] text-muted-foreground font-bold uppercase">Promo Code</div>
                          <div className="font-mono font-black text-xs text-primary">
                            {newOfferFull.code || "PROMO2026"}
                          </div>
                        </div>
                        <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">
                          Tap to Copy
                        </span>
                      </div>

                      {/* Terms in App */}
                      <div className="text-[10px] text-muted-foreground space-y-1 pt-1">
                        <div className="flex items-center justify-between">
                          <span>Valid:</span>
                          <span className="font-medium text-foreground">{newOfferFull.validFrom} to {newOfferFull.validTo}</span>
                        </div>
                        {newOfferFull.minOrderValue && (
                          <div className="flex items-center justify-between">
                            <span>Min. Order:</span>
                            <span className="font-medium text-foreground">{newOfferFull.minOrderValue}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Applies to:</span>
                          <span className="font-medium text-foreground">{newOfferFull.targetAudience}</span>
                        </div>
                      </div>

                      {/* Mock CTA Button */}
                      <button
                        type="button"
                        className="w-full py-2 rounded-xl bg-rose-600 text-white font-black text-xs shadow-md shadow-rose-600/20"
                      >
                        Claim & Redeem Voucher
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border shrink-0 flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={() => { setIsAddOfferOpen(false); setEditingOffer(null); }}
                className="flex-1 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="offer-form"
                className="flex-1 font-bold bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/25"
              >
                <Gift className="w-3.5 h-3.5 mr-1.5" />
                {editingOffer ? "Save Changes" : "Publish Offer"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 8. Share & QR Code Counter Voucher Modal */}
      {isShareOfferOpen && selectedOfferForShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground">Share & Counter QR Code</h3>
                  <p className="text-[11px] text-muted-foreground">{selectedOfferForShare.title}</p>
                </div>
              </div>
              <button
                onClick={() => { setIsShareOfferOpen(false); setSelectedOfferForShare(null); }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Counter Voucher Card */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div
                id="printable-counter-voucher"
                className="p-6 rounded-3xl bg-gradient-to-b from-card to-muted/50 border-2 border-primary/20 text-center space-y-4 shadow-sm"
              >
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    {selectedBusiness?.name || "GlobalBiz Partner Store"}
                  </div>
                  <h4 className="text-2xl font-black text-foreground mt-1">
                    {selectedOfferForShare.discountValue} OFF
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedOfferForShare.title}</p>
                </div>

                {/* Scaled SVG Vector QR Code */}
                <div className="w-44 h-44 mx-auto p-3 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-950">
                    {/* Finder 1 (Top Left) */}
                    <rect x="5" y="5" width="28" height="28" rx="4" fill="currentColor" />
                    <rect x="9" y="9" width="20" height="20" rx="2" fill="white" />
                    <rect x="13" y="13" width="12" height="12" rx="2" fill="currentColor" />

                    {/* Finder 2 (Top Right) */}
                    <rect x="67" y="5" width="28" height="28" rx="4" fill="currentColor" />
                    <rect x="71" y="9" width="20" height="20" rx="2" fill="white" />
                    <rect x="75" y="13" width="12" height="12" rx="2" fill="currentColor" />

                    {/* Finder 3 (Bottom Left) */}
                    <rect x="5" y="67" width="28" height="28" rx="4" fill="currentColor" />
                    <rect x="9" y="71" width="20" height="20" rx="2" fill="white" />
                    <rect x="13" y="75" width="12" height="12" rx="2" fill="currentColor" />

                    {/* Decorative QR Data Matrix Blocks */}
                    <rect x="38" y="8" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="50" y="8" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="38" y="20" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="50" y="24" width="8" height="8" rx="1.5" fill="currentColor" />

                    <rect x="8" y="38" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="20" y="38" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="24" y="50" width="8" height="8" rx="1.5" fill="currentColor" />

                    <rect x="38" y="38" width="10" height="10" rx="2" fill="#e11d48" />
                    <rect x="52" y="38" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="38" y="52" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="50" y="52" width="10" height="10" rx="2" fill="currentColor" />

                    <rect x="68" y="38" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="80" y="44" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="68" y="54" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="80" y="54" width="12" height="8" rx="1.5" fill="currentColor" />

                    <rect x="38" y="68" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="50" y="68" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="38" y="80" width="12" height="8" rx="1.5" fill="currentColor" />
                    <rect x="54" y="80" width="8" height="12" rx="1.5" fill="currentColor" />

                    <rect x="68" y="68" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="80" y="72" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="68" y="80" width="8" height="8" rx="1.5" fill="currentColor" />
                    <rect x="80" y="84" width="8" height="8" rx="1.5" fill="currentColor" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Promo Coupon Code:</div>
                  <div className="font-mono font-black text-xl text-primary tracking-widest">
                    {selectedOfferForShare.code}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Valid: {selectedOfferForShare.validFrom} to {selectedOfferForShare.validTo}
                  </div>
                </div>
              </div>

              {/* Share & Print Actions */}
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    const url = `https://globalbiz.et/offers/${selectedOfferForShare.code}`;
                    if (navigator?.clipboard) {
                      navigator.clipboard.writeText(url).catch(() => {});
                    }
                    toast.success(`Share link copied: ${url}`);
                  }}
                  variant="outline"
                  className="w-full gap-2 text-xs font-bold"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Customer Redeem Link
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => {
                      const url = `https://globalbiz.et/offers/${selectedOfferForShare.code}`;
                      const text = `🔥 Claim ${selectedOfferForShare.discountValue} OFF at ${selectedBusiness?.name || "our store"} with promo code: ${selectedOfferForShare.code}!`;
                      window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    variant="outline"
                    className="gap-1.5 text-xs font-bold text-sky-600 border-sky-500/30 hover:bg-sky-500/10"
                  >
                    <Send className="w-3.5 h-3.5" /> Share on Telegram
                  </Button>

                  <Button
                    onClick={() => {
                      const url = `https://globalbiz.et/offers/${selectedOfferForShare.code}`;
                      const text = `🔥 Claim ${selectedOfferForShare.discountValue} OFF at ${selectedBusiness?.name || "our store"} with promo code: ${selectedOfferForShare.code}! ${url}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
                    }}
                    variant="outline"
                    className="gap-1.5 text-xs font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Share on WhatsApp
                  </Button>
                </div>

                <Button
                  onClick={() => window.print()}
                  className="w-full gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Counter Standee / Flyer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Create Campaign Modal */}
      {isCreateCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground">Launch Sponsored Ad Campaign</h3>
                  <p className="text-[11px] text-muted-foreground">Reach high-intent local buyers in Addis Ababa</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateCampaignOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1 text-foreground">Selected Business</label>
                <div className="px-3 py-2 rounded-xl bg-muted/40 border border-border flex items-center gap-2 text-foreground font-semibold">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>{selectedBusiness?.name || "My Business"}</span>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-foreground">Campaign Name *</label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                  placeholder="e.g. Weekend Special Spotlight, Bole Festival Promo"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-foreground">Target Placement *</label>
                  <select
                    value={newCampaign.placement}
                    onChange={(e) => setNewCampaign({ ...newCampaign, placement: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                  >
                    <option value="search_top">Top Search Banner (Pinned #1)</option>
                    <option value="map_highlight">Map Spotlight Pin (Gold Marker)</option>
                    <option value="category_spotlight">Category Featured Card</option>
                    <option value="home_hero">Home Billboard Hero</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-foreground">Target Location *</label>
                  <select
                    value={newCampaign.targetLocation}
                    onChange={(e) => setNewCampaign({ ...newCampaign, targetLocation: e.target.value })}
                    className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                  >
                    <option value="All Sub-Cities">All Addis Ababa</option>
                    <option value="Bole">Bole Sub-City</option>
                    <option value="Kirkos">Kirkos Sub-City</option>
                    <option value="Yeka">Yeka Sub-City</option>
                    <option value="Arada">Arada Sub-City</option>
                    <option value="Nifas Silk-Lafto">Nifas Silk-Lafto</option>
                    <option value="Gulele">Gulele Sub-City</option>
                    <option value="Akaky Kaliti">Akaky Kaliti</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-foreground">Daily Budget (ETB) *</label>
                  <Input
                    type="number"
                    min="100"
                    step="50"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                    required
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[250, 500, 1000, 2500].map((amt) => (
                      <button
                        type="button"
                        key={amt}
                        onClick={() => setNewCampaign({ ...newCampaign, budget: amt })}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                          newCampaign.budget === amt
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-foreground">Duration (Days) *</label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={newCampaign.durationDays}
                    onChange={(e) => setNewCampaign({ ...newCampaign, durationDays: Number(e.target.value) })}
                    required
                  />
                  <div className="flex gap-1.5 mt-1.5">
                    {[7, 14, 30, 90].map((days) => (
                      <button
                        type="button"
                        key={days}
                        onClick={() => setNewCampaign({ ...newCampaign, durationDays: days })}
                        className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                          newCampaign.durationDays === days
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {days}d
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Estimate Summary Box */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-muted-foreground font-bold">Total Estimated Investment</div>
                  <div className="font-black text-foreground text-sm">
                    {(Number(newCampaign.budget || 0) * Number(newCampaign.durationDays || 0)).toLocaleString()} ETB
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground font-bold">Estimated Impressions</div>
                  <div className="font-black text-emerald-600">
                    ~{(Number(newCampaign.budget || 0) * 12).toLocaleString()} views / day
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateCampaignOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                  size="sm"
                  disabled={isCampaignSubmitting}
                  className="rounded-xl text-xs font-bold gap-1.5 shadow-md"
                >
                  {isCampaignSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deploying Campaign...</span>
                    </>
                  ) : (
                    <>
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>Deploy Campaign Now</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Create Support Ticket Modal */}
      {isCreateTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base text-foreground">Contact Platform Support</h3>
              <button onClick={() => setIsCreateTicketOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div><label className="font-bold block mb-1">Subject</label><Input value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} placeholder="e.g. Request to update verified phone line" required /></div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select value={newTicket.category} onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value as any })} className="w-full h-10 rounded-xl border border-input bg-background px-2 font-semibold">
                    <option>Verification</option>
                    <option>Billing</option>
                    <option>Listing Help</option>
                    <option>Bug Report</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Priority</label>
                  <select value={newTicket.priority} onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })} className="w-full h-10 rounded-xl border border-input bg-background px-2 font-semibold">
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
              </div>
              <div><label className="font-bold block mb-1">Message Details</label><Textarea value={newTicket.message} onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })} rows={3} required /></div>
              <Button type="submit" variant="gradient" className="w-full font-bold mt-2">Submit Ticket</Button>
            </form>
          </div>
        </div>
      )}

      {/* 10. Receipt / Invoice Modal */}
      {selectedInvoiceForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-black text-base text-foreground">Official Payment Receipt</h3>
                <span className="text-xs text-muted-foreground">{selectedInvoiceForModal.id}</span>
              </div>
              <button onClick={() => setSelectedInvoiceForModal(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Billed To:</span><span className="font-bold">{selectedBusiness.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Item Description:</span><span className="font-bold">{selectedInvoiceForModal.type} Plan</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment Date:</span><span>{selectedInvoiceForModal.date}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Method:</span><span>{selectedInvoiceForModal.billingMethod}</span></div>
              <div className="flex justify-between font-black text-sm border-t border-border pt-2"><span>Total Paid:</span><span className="text-emerald-600">{selectedInvoiceForModal.amount} {selectedInvoiceForModal.currency}</span></div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => { window.print(); }} className="w-full text-xs font-bold gap-1">
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </Button>
              <Button variant="gradient" size="sm" onClick={() => { toast.success("PDF receipt downloaded!"); setSelectedInvoiceForModal(null); }} className="w-full text-xs font-bold gap-1">
                <Download className="w-3.5 h-3.5" /> Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Category Registration & Edit Modals */}
      {isAddCatModalOpen && (
        <AddCategoryModal
          isOpen={isAddCatModalOpen}
          onClose={() => {
            setIsAddCatModalOpen(false);
            setDefaultParentForAdd(undefined);
          }}
          categories={categories}
          defaultParentId={defaultParentForAdd}
          onAddCategory={handleAddCategory}
        />
      )}

      {editingCategory && (
        <EditCategoryModal
          isOpen={!!editingCategory}
          category={editingCategory}
          categories={categories}
          onClose={() => setEditingCategory(null)}
          onUpdateCategory={handleUpdateCategory}
        />
      )}

      {/* Add / Register Customer Review Modal */}
      <AddReviewModal
        isOpen={isAddReviewModalOpen}
        onClose={() => setIsAddReviewModalOpen(false)}
        preselectedBusinessId={selectedBusiness?.id || undefined}
        preselectedBusinessName={selectedBusiness?.name || undefined}
        businesses={businesses.map((b) => ({ id: b.id, name: b.name }))}
        onReviewRegistered={() => {
          fetchDashboardReviews(1);
          fetchBusinesses(bizPage, portfolioScope, bizStatusFilter, bizSearch, bizSort);
        }}
      />

      {/* Media Lightbox Viewer Modal */}
      <MediaLightboxModal
        isOpen={Boolean(lightboxMedia)}
        onClose={() => setLightboxMedia(null)}
        media={lightboxMedia}
        canModerate={false}
        onSetAsCover={(item) => {
          handleUpdateBusiness({
            ...selectedBusiness,
            coverUrl: item.url,
          });
          toast.success("Cover updated!");
        }}
        onDelete={(id) => {
          const updated = (selectedBusiness.media || []).filter((item) => item.id !== id);
          handleUpdateBusiness({ ...selectedBusiness, media: updated });
          toast.success("Media item removed from listing");
        }}
      />

      {/* Register Real Analytics Event Modal */}
      <RegisterAnalyticsModal
        isOpen={isRegisterDashboardAnalyticsOpen}
        onClose={() => setIsRegisterDashboardAnalyticsOpen(false)}
        businessesList={businesses}
        preselectedBusinessId={selectedBusiness?.id}
        preselectedBusinessName={selectedBusiness?.name}
        currentAdminName="Business Owner"
        onAnalyticsRegistered={() => {
          fetchDashboardAnalytics(1);
          setDashboardAnalyticsPage(1);
        }}
      />

      {/* Register Real Dispute / Moderation Report Modal */}
      <RegisterReportModal
        isOpen={isRegisterOwnerReportOpen}
        onClose={() => setIsRegisterOwnerReportOpen(false)}
        businessesList={businesses}
        preselectedTargetType={preselectedReportTarget.type}
        preselectedTargetId={preselectedReportTarget.id}
        preselectedTargetName={preselectedReportTarget.name}
        currentAdminName="Business Owner (Verified)"
        onReportRegistered={() => {
          fetchOwnerReports(1);
          setOwnerReportPage(1);
        }}
      />

      {/* Report / Dispute Case File Modal */}
      <ReportDetailModal
        isOpen={Boolean(selectedOwnerReportForDetail)}
        onClose={() => setSelectedOwnerReportForDetail(null)}
        report={selectedOwnerReportForDetail}
        currentAdminName="Business Owner"
        onStatusUpdated={(updated) => {
          setOwnerReports((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          );
          fetchOwnerReports(ownerReportPage);
        }}
      />
      {/* Register Real Notification Modal */}
      <RegisterNotificationModal
        isOpen={isRegisterOwnerNotifOpen}
        onClose={() => setIsRegisterOwnerNotifOpen(false)}
        onNotificationRegistered={(newNotif) => {
          setOwnerNotificationsList((prev) => [newNotif, ...prev]);
          setOwnerNotifTotalCount((c) => c + 1);
          if (ownerNotifStats) {
            setOwnerNotifStats({ ...ownerNotifStats, total: ownerNotifStats.total + 1 });
          }
          fetchOwnerNotifications(1);
        }}
        currentSenderName={selectedBusiness?.name || "Business Owner"}
        defaultTarget="business"
        preselectedBusinessId={selectedBusiness?.id}
      />

      {/* Notification Detail Modal */}
      <NotificationDetailModal
        isOpen={Boolean(selectedOwnerNotifForDetail)}
        onClose={() => setSelectedOwnerNotifForDetail(null)}
        notification={selectedOwnerNotifForDetail}
        onDelete={handleOwnerDeleteNotification}
        onMarkRead={handleOwnerMarkRead}
        onMarkUnread={handleOwnerMarkUnread}
        onNavigate={(link) => {
          setSelectedOwnerNotifForDetail(null);
          if (link.includes("tab=reviews")) setActiveNav("reviews");
          else if (link.includes("tab=messages")) setActiveNav("messages");
          else if (link.includes("tab=billing")) setActiveNav("billing");
          else if (link.includes("tab=support")) setActiveNav("support");
          else if (link.includes("tab=moderation")) setActiveNav("moderation");
          else if (link.includes("tab=settings")) setActiveNav("settings");
          else if (link.startsWith("/")) window.open(link, "_blank");
        }}
      />

      {/* Support Ticket Detail & Reply Modal */}
      <SupportTicketDetailModal
        isOpen={Boolean(selectedOwnerTicketForDetail)}
        onClose={() => setSelectedOwnerTicketForDetail(null)}
        ticket={selectedOwnerTicketForDetail}
        currentUserName={selectedBusiness?.name || "Business Owner"}
        currentUserRole="owner"
        onTicketUpdated={(updated) => {
          setSelectedOwnerTicketForDetail(updated);
          setOwnerTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
          fetchOwnerTickets(ownerTicketPage);
        }}
        onTicketDeleted={(id) => {
          setSelectedOwnerTicketForDetail(null);
          setOwnerTickets((prev) => prev.filter((t) => t.id !== id));
          setOwnerTicketTotalCount((c) => Math.max(0, c - 1));
          fetchOwnerTickets(ownerTicketPage);
        }}
      />

      {/* Create Support Ticket Modal */}
      <CreateSupportTicketModal
        isOpen={isCreateOwnerTicketOpen}
        onClose={() => setIsCreateOwnerTicketOpen(false)}
        onTicketCreated={(newTicket) => {
          setOwnerTickets((prev) => [newTicket, ...prev]);
          setOwnerTicketTotalCount((c) => c + 1);
          fetchOwnerTickets(1);
        }}
        defaultBusinessId={selectedBusiness?.id}
        defaultBusinessName={selectedBusiness?.name}
        defaultUserId={user?.id || "user_owner"}
        defaultUserName={user?.fullName || selectedBusiness?.name || "Business Owner"}
        defaultUserEmail={user?.primaryEmailAddress?.emailAddress || "owner@bizfinder.et"}
        defaultUserRole="owner"
        initialCategory={prefilledTicketCategory}
        initialSubject={prefilledTicketSubject}
      />

      {/* Register Real Media & Photos Modal */}
      <RegisterMediaModal
        isOpen={isRegisterMediaOpen}
        onClose={() => setIsRegisterMediaOpen(false)}
        business={selectedBusiness}
        onMediaRegistered={(updatedMediaList, newCoverUrl) => {
          handleUpdateBusiness({
            ...selectedBusiness,
            media: updatedMediaList,
            coverUrl: newCoverUrl || selectedBusiness.coverUrl,
          });
          setOwnerMediaPage(1);
        }}
      />
    </div>

  );
}
