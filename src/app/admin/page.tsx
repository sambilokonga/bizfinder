"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
  Crown,
  CheckCircle2,
  XCircle,
  Layers,
  MapPin,
  Users,
  AlertTriangle,
  Search,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Building2,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Copy,
  User as UserIcon,
  FolderTree,
  FileText,
  UserCheck,
  Ban,
  Flag,
  Sparkles,
  DollarSign,
  Megaphone,
  Eye,
  Activity,
  Settings,
  Sliders,
  RefreshCw,
  ExternalLink,
  Lock,
  Filter,
  Check,
  X,
  Globe,
  Phone,
  Mail,
  FileCheck,
  CreditCard,
  Camera,
  MessageSquare,
  Key,
  Database,
  HardDrive,
  Cpu,
  BarChart3,
  Bell,
  Ticket,
  UserPlus,
  ShieldCheck,
  ArrowUpRight,
  Zap,
  Clock,
  Loader2,
  Star,
  RotateCcw,
  Send,
  SlidersHorizontal,
  SlidersVertical,
  HelpCircle,
  Play,
  Smartphone,
  Landmark,
  Banknote,
  Download,
  Printer,
  Receipt,
  Navigation,
  Share2,
  Bookmark,
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
import {
  SEED_CATEGORIES,
} from "@/lib/db/seed-data/categories";
import { SEED_LOCATIONS } from "@/lib/db/seed-data/locations";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import { useCurrentRole } from "@/components/layout/RoleSwitcher";
import { Category } from "@/types/category";
import { LocationNode } from "@/types/location";
import { Business } from "@/types/business";
import { AddCategoryModal } from "@/components/admin/AddCategoryModal";
import { EditCategoryModal } from "@/components/admin/EditCategoryModal";
import { AddLocationModal } from "@/components/admin/AddLocationModal";
import { EditLocationModal } from "@/components/admin/EditLocationModal";
import { EditBusinessModal } from "@/components/admin/EditBusinessModal";
import { AddBusinessModal } from "@/components/admin/AddBusinessModal";
import { EmbeddedListingWizard } from "@/components/dashboard/EmbeddedListingWizard";
import { AssignGeoAdminModal } from "@/components/admin/AssignGeoAdminModal";
import { AddCampaignModal, AdminAdCampaign } from "@/components/admin/AddCampaignModal";
import { CreateAdminModal } from "@/components/admin/CreateAdminModal";
import { SystemHealthModal } from "@/components/admin/SystemHealthModal";
import { BusinessDetailDrawer } from "@/components/admin/BusinessDetailDrawer";
import { AddReviewModal } from "@/components/admin/AddReviewModal";
import { RegisterMediaModal } from "@/components/admin/RegisterMediaModal";
import { MediaLightboxModal } from "@/components/media/MediaLightboxModal";
import { extractYoutubeVideoId, isYoutubeUrl, getYoutubeThumbnail } from "@/lib/utils/youtube";
import { AdminAccount } from "@/app/api/admin/admins/route";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GeoScopeBanner } from "@/components/admin/GeoScopeBanner";
import { GeoAdminsManagement } from "@/components/admin/GeoAdminsManagement";
import { TerritoryAdministrationView } from "@/components/admin/TerritoryAdministrationView";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { RegisterPaymentModal } from "@/components/admin/RegisterPaymentModal";
import { PaymentReceiptModal } from "@/components/admin/PaymentReceiptModal";
import { PaymentStatusGeoMatrix } from "@/components/admin/PaymentStatusGeoMatrix";
import { IPayment, PaymentStats, GeoPaymentSummary } from "@/types/payment";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { exportUsersToCSV, exportUsersToJSON } from "@/lib/utils/export-users";
import { exportBusinessesToCSV, exportBusinessesToJSON } from "@/lib/utils/export-businesses";
import { exportPaymentsToCSV, exportPaymentsToJSON } from "@/lib/utils/export-payments";
import { RegisterAnalyticsModal } from "@/components/admin/RegisterAnalyticsModal";
import { IAnalyticsEvent, AnalyticsStats } from "@/types/analytics";
import { RegisterReportModal } from "@/components/admin/RegisterReportModal";
import { ReportDetailModal } from "@/components/admin/ReportDetailModal";
import { IReport, ReportStats } from "@/types/report";
import { RegisterNotificationModal } from "@/components/admin/RegisterNotificationModal";
import { NotificationDetailModal } from "@/components/admin/NotificationDetailModal";
import { INotification, NotificationStats } from "@/types/notification";
import { ISupportTicket, TicketStats } from "@/types/ticket";
import { SupportTicketDetailModal } from "@/components/support/SupportTicketDetailModal";
import { CreateSupportTicketModal } from "@/components/support/CreateSupportTicketModal";
import { AdminSettingsView } from "@/components/admin/AdminSettingsView";
import { PendingConfirmationsQueue } from "@/components/admin/PendingConfirmationsQueue";
import { FourMonthAuditHub } from "@/components/admin/FourMonthAuditHub";
import { SecurityWorkstation } from "@/components/security/SecurityWorkstation";
import { GlobalVisitorsMatrix } from "@/components/admin/GlobalVisitorsMatrix";
import { CountryCityAdminsHub } from "@/components/admin/CountryCityAdminsHub";


// ─── Interfaces ──────────────────────────────────────────────────────────────

interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: "user" | "owner" | "admin" | "super_admin" | "country_admin" | "city_admin";
  country: string;
  city?: string;
  status: "active" | "suspended";
  joinedAt: string;
  avatarUrl?: string;
  phone?: string;
  isClerkSynced?: boolean;
}

interface ReviewItem {
  id: string;
  userName: string;
  businessName: string;
  rating: number;
  content: string;
  status: "published" | "pending" | "reported" | "removed";
  date: string;
  reply?: {
    ownerName: string;
    comment: string;
    createdAt?: string;
  };
}

interface SupportTicket {
  id: string;
  user: string;
  subject: string;
  priority: "High" | "Medium" | "Low";
  status: "Open" | "In Progress" | "Waiting" | "Resolved" | "Closed";
  assignedAdmin: string;
  date: string;
}

interface TransactionItem {
  id: string;
  businessName: string;
  amount: string;
  method: "Card" | "Mobile Money" | "Bank Transfer";
  status: "Paid" | "Pending" | "Refunded";
  date: string;
}

interface MediaItem {
  id: string;
  title: string;
  businessName: string;
  uploadedBy: string;
  date: string;
  type: "Photo" | "Video" | "Logo";
  url: string;
  status: "Approved" | "Pending" | "Reported";
}

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  target: "global" | "business" | "user";
  targetUserId?: string;
  status: "Delivered" | "Pending" | "Scheduled" | "Failed";
  sentBy?: string;
  sent: string;
  createdAt?: string | Date;
}


export default function AdminControlPanel() {
  const { currentRole, currentUser } = useCurrentRole();

  // Navigation state matching exact 15 modules
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>("dashboard");
  const [activeSubnav, setActiveSubnav] = useState<string>("overview");
  // All sections collapsed by default — click main title to expand
  const [expandedNavSections, setExpandedNavSections] = useState<string[]>([]);

  // ── Geo-Scope / Jurisdiction State ─────────────────────────────────────────
  // Allows Super Admins to simulate any role/territory, and locks Country/City Admins to their scope.
  const [geoScopeRole, setGeoScopeRole] = useState<"super_admin" | "country_admin" | "city_admin" | "admin">(
    (currentRole as any) || "super_admin"
  );
  const [geoSelectedCountry, setGeoSelectedCountry] = useState<string>(
    currentRole === "country_admin" ? (currentUser?.assignedCountry || "Ethiopia") : "all"
  );
  const [geoSelectedCity, setGeoSelectedCity] = useState<string>(
    currentRole === "city_admin" ? (currentUser?.assignedCity || "Addis Ababa") : "all"
  );

  const isSuperAdmin = currentRole === "super_admin" && geoScopeRole === "super_admin";
  const isCountryAdmin = currentRole === "country_admin" || geoScopeRole === "country_admin";
  const isCityAdmin = currentRole === "city_admin" || geoScopeRole === "city_admin";

  // Auto-synchronize role and territory from user profile/role
  useEffect(() => {
    if (currentRole === "country_admin") {
      const country = currentUser?.assignedCountry || "Ethiopia";
      setGeoScopeRole("country_admin");
      setGeoSelectedCountry(country);
      setGeoSelectedCity("all");
      setBizFilterCountry(country);
      setUserFilterCountry(country);
    } else if (currentRole === "city_admin") {
      const country = currentUser?.assignedCountry || "Ethiopia";
      const city = currentUser?.assignedCity || "Addis Ababa";
      setGeoScopeRole("city_admin");
      setGeoSelectedCountry(country);
      setGeoSelectedCity(city);
      setBizFilterCountry(country);
      setBizFilterCity(city);
      setUserFilterCountry(country);
      setUserFilterCity(city);
    } else if (currentRole === "super_admin") {
      setGeoScopeRole("super_admin");
    }
  }, [currentRole, currentUser?.assignedCountry, currentUser?.assignedCity]);

  const toggleNavSection = (section: string) => {
    setExpandedNavSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  // Core Data Lists
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [defaultParentForAdd, setDefaultParentForAdd] = useState<string | undefined>(undefined);
  const [catSearch, setCatSearch] = useState<string>("");
  const [catPage, setCatPage] = useState<number>(1);
  const CATS_PER_PAGE = 3;
  const [locations, setLocations] = useState<LocationNode[]>(SEED_LOCATIONS);
  const [adminList, setAdminList] = useState<AdminAccount[]>([]);

  // Businesses Roster & Pagination State (20 per page)
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [bizPage, setBizPage] = useState<number>(1);
  const [bizTotalPages, setBizTotalPages] = useState<number>(1);
  const [bizTotalCount, setBizTotalCount] = useState<number>(0);
  const [isBizLoading, setIsBizLoading] = useState<boolean>(false);
  const [businessSearch, setBusinessSearch] = useState("");
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false);
  const [bizCounts, setBizCounts] = useState<{
    all: number;
    pending: number;
    verified: number;
    suspended: number;
    rejected: number;
    claimed: number;
  }>({ all: 0, pending: 0, verified: 0, suspended: 0, rejected: 0, claimed: 0 });

  // ── Dashboard Overview Real Stats ────────────────────────────────────────────
  const [dashboardStats, setDashboardStats] = useState<{
    totalUsers: number;
    totalNormalUsers?: number;
    totalCityAdmins?: number;
    totalVacantCities?: number;
    totalBusinesses: number;
    pendingBusinesses: number;
    totalReviews: number;
    totalCountries: number;
    totalCities: number;
    totalRevenue: number;
    openReports: number;
  } | null>(null);
  const [isDashStatsLoading, setIsDashStatsLoading] = useState(false);
  const [selectedAssignCity, setSelectedAssignCity] = useState<string>("");

  const fetchDashboardStats = async (country = geoSelectedCountry, city = geoSelectedCity) => {
    setIsDashStatsLoading(true);
    try {
      const params = new URLSearchParams();
      if (country && country !== "all") params.set("country", country);
      if (city && city !== "all") params.set("city", city);
      const url = `/api/admin/stats${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data?.stats) {
        setDashboardStats(data.stats);
      }
    } catch (err) {
      console.error("[Dashboard] Failed to fetch admin stats:", err);
    } finally {
      setIsDashStatsLoading(false);
    }
  };

  // Users Roster & Pagination State (20 per page)
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [userPage, setUserPage] = useState<number>(1);
  const [userTotalPages, setUserTotalPages] = useState<number>(1);
  const [userTotalCount, setUserTotalCount] = useState<number>(0);
  const [isUsersLoading, setIsUsersLoading] = useState<boolean>(false);
  const [isSyncingClerk, setIsSyncingClerk] = useState<boolean>(false);
  const [userCounts, setUserCounts] = useState<{
    all: number;
    customers: number;
    owners: number;
    admins: number;
    cityAdmins?: number;
    suspended: number;
  }>({ all: 0, customers: 0, owners: 0, admins: 0, cityAdmins: 0, suspended: 0 });
  const [viewingUser, setViewingUser] = useState<AdminUserItem | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userFilterCountry, setUserFilterCountry] = useState<string>("all");
  const [userFilterCity, setUserFilterCity] = useState<string>("all");
  const [isExportingUsers, setIsExportingUsers] = useState<boolean>(false);

  const userFilterCities = useMemo(() => {
    if (!userFilterCountry || userFilterCountry === "all") return [];
    return getCitiesForCountry(userFilterCountry);
  }, [userFilterCountry]);

  // Dynamic user & business monthly growth curves scaled to real live totals
  const userGrowthChartData = useMemo(() => {
    const total = dashboardStats?.totalUsers ?? userTotalCount ?? 5;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const multipliers = [0.62, 0.71, 0.78, 0.86, 0.94, 1.0];
    return months.map((m, i) => ({
      month: m,
      users: Math.max(1, Math.round(total * multipliers[i])),
    }));
  }, [dashboardStats?.totalUsers, userTotalCount]);

  const bizGrowthChartData = useMemo(() => {
    const total = dashboardStats?.totalBusinesses ?? bizTotalCount ?? 6;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const multipliers = [0.63, 0.73, 0.83, 0.90, 0.96, 1.0];
    return months.map((m, i) => ({
      month: m,
      count: Math.max(1, Math.round(total * multipliers[i])),
    }));
  }, [dashboardStats?.totalBusinesses, bizTotalCount]);

  // Businesses Country/City Filter & Export State
  const [bizFilterCountry, setBizFilterCountry] = useState<string>("all");
  const [bizFilterCity, setBizFilterCity] = useState<string>("all");
  const [isExportingBusinesses, setIsExportingBusinesses] = useState<boolean>(false);

  const bizFilterCities = useMemo(() => {
    if (!bizFilterCountry || bizFilterCountry === "all") return [];
    return getCitiesForCountry(bizFilterCountry);
  }, [bizFilterCountry]);

  const fetchBusinesses = async (page = bizPage) => {
    setIsBizLoading(true);
    try {
      const statusParam = activeNav === "businesses" ? activeSubnav : "all";
      const qParam = businessSearch.trim() ? `&q=${encodeURIComponent(businessSearch.trim())}` : "";
      // Effective territory: strictly enforce country for country_admin, and city for city_admin
      const effectiveCountry = isCountryAdmin
        ? (geoSelectedCountry !== "all" ? geoSelectedCountry : (currentUser?.assignedCountry || "Ethiopia"))
        : isCityAdmin
        ? (geoSelectedCountry !== "all" ? geoSelectedCountry : (currentUser?.assignedCountry || "Ethiopia"))
        : (bizFilterCountry !== "all" ? bizFilterCountry : (geoSelectedCountry !== "all" ? geoSelectedCountry : ""));

      const effectiveCity = isCityAdmin
        ? (geoSelectedCity !== "all" ? geoSelectedCity : (currentUser?.assignedCity || "Addis Ababa"))
        : (bizFilterCity !== "all" ? bizFilterCity : (geoSelectedCity !== "all" ? geoSelectedCity : ""));

      const countryParam = effectiveCountry ? `&country=${encodeURIComponent(effectiveCountry)}` : "";
      const cityParam = effectiveCity ? `&city=${encodeURIComponent(effectiveCity)}` : "";
      const res = await fetch(
        `/api/businesses?page=${page}&limit=20&status=${statusParam}${qParam}${countryParam}${cityParam}`
      );
      const data = await res.json();
      if (data?.businesses && Array.isArray(data.businesses)) {
        setBusinesses(data.businesses);
        setBizTotalCount(data.total ?? data.businesses.length);
        setBizTotalPages(
          data.totalPages ?? Math.max(1, Math.ceil((data.total ?? data.businesses.length) / 20))
        );
        setBizPage(data.page ?? page);
        if (data.counts) {
          setBizCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch businesses:", err);
    } finally {
      setIsBizLoading(false);
    }
  };

  const handleExportBusinesses = async (format: "csv" | "json") => {
    setIsExportingBusinesses(true);
    try {
      const statusParam = activeNav === "businesses" ? activeSubnav : "all";
      const qParam = businessSearch.trim() ? `&q=${encodeURIComponent(businessSearch.trim())}` : "";
      const effectiveCountry = isCountryAdmin
        ? (geoSelectedCountry !== "all" ? geoSelectedCountry : (currentUser?.assignedCountry || "Ethiopia"))
        : isCityAdmin
        ? (geoSelectedCountry !== "all" ? geoSelectedCountry : (currentUser?.assignedCountry || "Ethiopia"))
        : (bizFilterCountry !== "all" ? bizFilterCountry : (geoSelectedCountry !== "all" ? geoSelectedCountry : ""));

      const effectiveCity = isCityAdmin
        ? (geoSelectedCity !== "all" ? geoSelectedCity : (currentUser?.assignedCity || "Addis Ababa"))
        : (bizFilterCity !== "all" ? bizFilterCity : (geoSelectedCity !== "all" ? geoSelectedCity : ""));
      const countryParam = effectiveCountry ? `&country=${encodeURIComponent(effectiveCountry)}` : "";
      const cityParam = effectiveCity ? `&city=${encodeURIComponent(effectiveCity)}` : "";

      const res = await fetch(
        `/api/businesses?page=1&limit=5000&export=true&status=${statusParam}${qParam}${countryParam}${cityParam}`
      );
      const data = await res.json();
      const exportList = data?.businesses && Array.isArray(data.businesses) && data.businesses.length > 0
        ? data.businesses
        : businesses;

      const fileLabel = `globalbiz_businesses${effectiveCountry ? `_${effectiveCountry}` : ""}${effectiveCity ? `_${effectiveCity}` : ""}`;
      if (format === "csv") {
        exportBusinessesToCSV(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} businesses in CSV format!`);
      } else {
        exportBusinessesToJSON(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} businesses in JSON format!`);
      }
    } catch (err) {
      console.error("Export businesses error:", err);
      const fileLabel = `globalbiz_businesses${bizFilterCountry !== "all" ? `_${bizFilterCountry}` : ""}${bizFilterCity !== "all" ? `_${bizFilterCity}` : ""}`;
      if (format === "csv") exportBusinessesToCSV(businesses, fileLabel);
      else exportBusinessesToJSON(businesses, fileLabel);
      toast.success(`Downloaded ${businesses.length} businesses!`);
    } finally {
      setIsExportingBusinesses(false);
    }
  };

  const fetchUsers = async (page = userPage, sync = false) => {
    setIsUsersLoading(true);
    if (sync) setIsSyncingClerk(true);
    try {
      const countryParam = userFilterCountry && userFilterCountry !== "all"
        ? `&country=${encodeURIComponent(userFilterCountry)}`
        : "";
      const cityParam = userFilterCity && userFilterCity !== "all"
        ? `&city=${encodeURIComponent(userFilterCity)}`
        : "";
      const res = await fetch(
        `/api/admin/users?page=${page}&limit=20&role=${activeSubnav}&search=${encodeURIComponent(userSearch)}${countryParam}${cityParam}${sync ? "&sync=true" : ""}&callerRole=${encodeURIComponent(currentRole)}`
      );
      const data = await res.json();
      if (data?.success && Array.isArray(data.users)) {
        setUsersList(data.users);
        setUserTotalCount(data.total ?? 0);
        setUserTotalPages(data.totalPages ?? 1);
        setUserPage(data.page ?? page);
        if (data.counts) {
          setUserCounts(data.counts);
        }
        if (sync) {
          toast.success(
            data.clerkSyncedCount !== undefined
              ? `Synced with Clerk! ${data.clerkSyncedCount} users verified and registered.`
              : "Synchronized with Clerk successfully!"
          );
        }
      }
    } catch (err) {
      console.error("Failed to fetch users from /api/admin/users:", err);
    } finally {
      setIsUsersLoading(false);
      if (sync) setIsSyncingClerk(false);
    }
  };

  const handleExportUsers = async (format: "csv" | "json") => {
    setIsExportingUsers(true);
    try {
      const countryParam = userFilterCountry && userFilterCountry !== "all"
        ? `&country=${encodeURIComponent(userFilterCountry)}`
        : "";
      const cityParam = userFilterCity && userFilterCity !== "all"
        ? `&city=${encodeURIComponent(userFilterCity)}`
        : "";
      const res = await fetch(
        `/api/admin/users?page=1&limit=5000&export=true&role=${activeSubnav}&search=${encodeURIComponent(userSearch)}${countryParam}${cityParam}`
      );
      const data = await res.json();
      const exportList = data?.users && Array.isArray(data.users) && data.users.length > 0
        ? data.users
        : usersList;
      const fileLabel = `globalbiz_users${userFilterCountry !== "all" ? `_${userFilterCountry}` : ""}${userFilterCity !== "all" ? `_${userFilterCity}` : ""}`;
      if (format === "csv") {
        exportUsersToCSV(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} users in CSV format!`);
      } else {
        exportUsersToJSON(exportList, fileLabel);
        toast.success(`Downloaded ${exportList.length} users in JSON format!`);
      }
    } catch (err) {
      console.error("Export users error:", err);
      const fileLabel = `globalbiz_users${userFilterCountry !== "all" ? `_${userFilterCountry}` : ""}${userFilterCity !== "all" ? `_${userFilterCity}` : ""}`;
      if (format === "csv") exportUsersToCSV(usersList, fileLabel);
      else exportUsersToJSON(usersList, fileLabel);
      toast.success(`Downloaded ${usersList.length} users!`);
    } finally {
      setIsExportingUsers(false);
    }
  };

  // Search & Filtering
  const [reviewSearch, setReviewSearch] = useState("");

  // Reviews Stream & 20-Per-Page Pagination State
  const [reviewsList, setReviewsList] = useState<ReviewItem[]>([]);
  const [reviewPage, setReviewPage] = useState<number>(1);
  const [reviewTotalPages, setReviewTotalPages] = useState<number>(1);
  const [reviewTotalCount, setReviewTotalCount] = useState<number>(0);
  const [isReviewsLoading, setIsReviewsLoading] = useState<boolean>(false);
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState<boolean>(false);
  const [reviewCounts, setReviewCounts] = useState<{
    all: number;
    published: number;
    pending: number;
    reported: number;
    removed: number;
  }>({ all: 0, published: 0, pending: 0, reported: 0, removed: 0 });

  const fetchReviews = async (page = reviewPage) => {
    setIsReviewsLoading(true);
    try {
      const statusParam = activeNav === "reviews" ? activeSubnav : "all";
      const qParam = reviewSearch.trim() ? `&search=${encodeURIComponent(reviewSearch.trim())}` : "";
      const res = await fetch(
        `/api/reviews?page=${page}&limit=20&status=${statusParam}${qParam}`
      );
      const data = await res.json();
      if (data?.success && Array.isArray(data.reviews)) {
        const formatted: ReviewItem[] = data.reviews.map((r: any) => ({
          id: r.id,
          userName: r.userName,
          businessName: r.businessName || "Registered Business",
          rating: r.rating,
          content: r.comment,
          status: r.status || (r.isFlagged ? "reported" : "published"),
          date: r.createdAt
            ? new Date(r.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently",
          reply: r.reply,
        }));
        setReviewsList(formatted);
        setReviewTotalCount(data.total ?? formatted.length);
        setReviewTotalPages(data.totalPages ?? Math.max(1, Math.ceil((data.total ?? formatted.length) / 20)));
        setReviewPage(data.page ?? page);
        if (data.counts) {
          setReviewCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  // Media Gallery Items & 10-Per-Page Server Pagination
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [mediaPage, setMediaPage] = useState<number>(1);
  const [mediaTotalPages, setMediaTotalPages] = useState<number>(1);
  const [mediaTotalCount, setMediaTotalCount] = useState<number>(0);
  const [isMediaLoading, setIsMediaLoading] = useState<boolean>(false);
  const [mediaSearch, setMediaSearch] = useState<string>("");
  const [mediaCounts, setMediaCounts] = useState<{
    all: number;
    photos: number;
    videos: number;
    covers: number;
    pending: number;
    reported: number;
    approved: number;
  }>({ all: 0, photos: 0, videos: 0, covers: 0, pending: 0, reported: 0, approved: 0 });

  const [isRegisterMediaModalOpen, setIsRegisterMediaModalOpen] = useState<boolean>(false);
  const [lightboxMedia, setLightboxMedia] = useState<any | null>(null);

  const fetchMedia = async (page = mediaPage) => {
    setIsMediaLoading(true);
    try {
      const typeParam = activeNav === "media" ? activeSubnav : "all";
      const qParam = mediaSearch.trim() ? `&search=${encodeURIComponent(mediaSearch.trim())}` : "";
      const res = await fetch(`/api/admin/media?page=${page}&limit=10&type=${typeParam}${qParam}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.media)) {
        setMediaList(data.media);
        setMediaTotalCount(data.total ?? 0);
        setMediaTotalPages(data.totalPages ?? 1);
        setMediaPage(data.page ?? page);
        if (data.counts) {
          setMediaCounts(data.counts);
        }
      }
    } catch (err) {
      console.error("Failed to fetch media assets:", err);
    } finally {
      setIsMediaLoading(false);
    }
  };

  const handleApproveMedia = async (id: string) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Approved" }),
      });
      if (res.ok) {
        setMediaList((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Approved" } : m)));
        toast.success("Media approved and published live!");
        fetchMedia(mediaPage);
      }
    } catch (err) {
      toast.error("Failed to approve media");
    }
  };

  const handleReportMedia = async (id: string) => {
    try {
      const res = await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Reported" }),
      });
      if (res.ok) {
        setMediaList((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Reported" } : m)));
        toast.warning("Media flagged as reported for moderation.");
        fetchMedia(mediaPage);
      }
    } catch (err) {
      toast.error("Failed to flag media");
    }
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMediaList((prev) => prev.filter((m) => m.id !== id));
        toast.success("Media asset deleted permanently.");
        fetchMedia(mediaPage);
      }
    } catch (err) {
      toast.error("Failed to delete media");
    }
  };

  // ─── Ad Campaigns State & Handlers ─────────────────────────────────────────
  const [adCampaignsList, setAdCampaignsList] = useState<AdminAdCampaign[]>([]);
  const [adPage, setAdPage] = useState<number>(1);
  const [adTotalPages, setAdTotalPages] = useState<number>(1);
  const [adTotalCount, setAdTotalCount] = useState<number>(0);
  const [isAdsLoading, setIsAdsLoading] = useState<boolean>(false);
  const [adCounts, setAdCounts] = useState<{
    all: number;
    active: number;
    paused: number;
    scheduled: number;
    completed: number;
  }>({ all: 0, active: 0, paused: 0, scheduled: 0, completed: 0 });
  const [isAddCampaignModalOpen, setIsAddCampaignModalOpen] = useState(false);
  // inline create form state
  const [adFormName, setAdFormName] = useState("");
  const [adFormBizName, setAdFormBizName] = useState("");
  const [adFormBizId, setAdFormBizId] = useState("");
  const [adFormPlacement, setAdFormPlacement] = useState<AdminAdCampaign["placement"]>("search_top");
  const [adFormLocation, setAdFormLocation] = useState("Addis Ababa");
  const [adFormBudget, setAdFormBudget] = useState(500);
  const [adFormDuration, setAdFormDuration] = useState(30);
  const [isAdFormSaving, setIsAdFormSaving] = useState(false);

  const fetchAdCampaigns = async (page = adPage) => {
    setIsAdsLoading(true);
    try {
      const statusParam = activeNav === "advertisements" && activeSubnav !== "create" ? activeSubnav : "all";
      const res = await fetch(`/api/admin/ads/campaigns?page=${page}&limit=20&status=${statusParam}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.campaigns)) {
        setAdCampaignsList(data.campaigns);
        setAdTotalCount(data.total ?? data.campaigns.length);
        setAdTotalPages(data.totalPages ?? 1);
        setAdPage(data.page ?? page);
        if (data.counts) setAdCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to fetch ad campaigns:", err);
    } finally {
      setIsAdsLoading(false);
    }
  };

  const handleAdCampaignCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adFormBizName.trim() || !adFormName.trim()) return;
    setIsAdFormSaving(true);
    try {
      const res = await fetch("/api/admin/ads/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: adFormBizId.trim() || undefined,
          businessName: adFormBizName.trim(),
          name: adFormName.trim(),
          placement: adFormPlacement,
          targetLocation: adFormLocation.trim(),
          dailyBudgetETB: Number(adFormBudget),
          durationDays: Number(adFormDuration),
          startDate: new Date().toISOString().split("T")[0],
        }),
      });
      const data = await res.json();
      if (data?.success && data.campaign) {
        toast.success(`Campaign "${data.campaign.name}" registered to database!`);
        setAdFormName("");
        setAdFormBizName("");
        setAdFormBizId("");
        setAdFormBudget(500);
        setAdFormDuration(30);
        setActiveSubnav("all");
        fetchAdCampaigns(1);
      } else {
        toast.error(data?.error || "Failed to create campaign");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error creating campaign");
    } finally {
      setIsAdFormSaving(false);
    }
  };

  const handleAdStatusChange = async (id: string, status: "active" | "paused" | "completed") => {
    try {
      const res = await fetch("/api/admin/ads/campaigns", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data?.success) {
        setAdCampaignsList((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
        toast.success(`Campaign status updated to ${status}!`);
      } else {
        toast.error(data?.error || "Failed to update campaign");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error updating campaign");
    }
  };

  const handleDeleteAdCampaign = async (id: string, name: string) => {
    if (!window.confirm(`Delete campaign "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/ads/campaigns?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const data = await res.json();
      if (data?.success) {
        setAdCampaignsList((prev) => prev.filter((c) => c.id !== id));
        toast.success(`Campaign "${name}" deleted from database.`);
        fetchAdCampaigns(adPage);
      } else {
        toast.error(data?.error || "Failed to delete campaign");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error deleting campaign");
    }
  };

  useEffect(() => {
    fetchBusinesses(1);
    // Fetch real dashboard overview stats from DB
    fetchDashboardStats();

    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data?.locations && Array.isArray(data.locations) && data.locations.length > 0) {
          setLocations(data.locations);
        }
      })
      .catch(() => {});

    // Fetch Administrators
    fetch("/api/admin/admins")
      .then((res) => res.json())
      .then((data) => {
        if (data?.admins && Array.isArray(data.admins)) {
          setAdminList(data.admins);
        }
      })
      .catch(() => {});

    // Initial fetch of real Clerk registered users
    fetchUsers(1, false);

    // Fetch actual registered categories from MongoDB
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to load categories:", err));

    // Fetch Notifications from DB (paginated)
    fetchNotifications(1);
    // Fetch Reviews from DB
    fetchReviews(1);
    // Fetch Media from DB
    fetchMedia(1);
    // Fetch Ad Campaigns from DB
    fetchAdCampaigns(1);
    // Fetch Real Payments from DB
    fetchPayments(1);
    // Fetch Real Support Tickets from DB
    fetchTickets(1);
    // Fetch Platform / Territory Admin Stats from live DB
    fetchDashboardStats();
  }, []);

  // Synchronize dashboard statistics dynamically when geo territory / jurisdiction changes
  useEffect(() => {
    fetchDashboardStats(geoSelectedCountry, geoSelectedCity);
  }, [geoSelectedCountry, geoSelectedCity]);

  useEffect(() => {
    if (activeNav === "media") {
      const handler = setTimeout(() => {
        fetchMedia(mediaPage);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [activeNav, mediaPage, activeSubnav, mediaSearch]);

  useEffect(() => {
    if (activeNav === "users") {
      const handler = setTimeout(() => {
        fetchUsers(userPage, false);
      }, 250);
      return () => clearTimeout(handler);
    }
  }, [activeNav, userPage, activeSubnav, userSearch, userFilterCountry, userFilterCity]);

  useEffect(() => {
    if (activeNav === "businesses") {
      const handler = setTimeout(() => {
        fetchBusinesses(1);
        setBizPage(1);
      }, 250);
      return () => clearTimeout(handler);
    }
  }, [activeNav, activeSubnav, businessSearch, bizFilterCountry, bizFilterCity, geoSelectedCountry, geoSelectedCity]);

  useEffect(() => {
    if (activeNav === "businesses") {
      fetchBusinesses(bizPage);
    }
  }, [bizPage]);

  useEffect(() => {
    if (activeNav === "reviews") {
      const handler = setTimeout(() => {
        fetchReviews(1);
        setReviewPage(1);
      }, 250);
      return () => clearTimeout(handler);
    }
  }, [activeNav, activeSubnav, reviewSearch]);

  useEffect(() => {
    if (activeNav === "reviews") {
      fetchReviews(reviewPage);
    }
  }, [reviewPage]);

  useEffect(() => {
    if (activeNav === "advertisements" && activeSubnav !== "create") {
      fetchAdCampaigns(1);
      setAdPage(1);
    }
  }, [activeNav, activeSubnav]);

  useEffect(() => {
    if (activeNav === "advertisements" && activeSubnav !== "create") {
      fetchAdCampaigns(adPage);
    }
  }, [adPage]);

  // Modals & Drawers
  const [inspectingBusiness, setInspectingBusiness] = useState<Business | null>(null);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddLocModalOpen, setIsAddLocModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<LocationNode | null>(null);
  const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [isAssignGeoModalOpen, setIsAssignGeoModalOpen] = useState(false);

  // ─── Real Support Desk & Tickets State (20 items per page) ─────────────────
  const [ticketsList, setTicketsList] = useState<ISupportTicket[]>([]);
  const [ticketPage, setTicketPage] = useState<number>(1);
  const TICKETS_PER_PAGE = 20; // 20 per page as requested
  const [ticketTotalPages, setTicketTotalPages] = useState<number>(1);
  const [ticketTotalCount, setTicketTotalCount] = useState<number>(0);
  const [isTicketsLoading, setIsTicketsLoading] = useState<boolean>(false);
  const [ticketSearch, setTicketSearch] = useState<string>("");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<string>("all");
  const [ticketCategoryFilter, setTicketCategoryFilter] = useState<string>("all");
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [selectedTicketForDetail, setSelectedTicketForDetail] = useState<ISupportTicket | null>(null);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState<boolean>(false);

  const fetchTickets = async (page = ticketPage) => {
    setIsTicketsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(TICKETS_PER_PAGE));
      if (ticketSearch.trim()) params.set("search", ticketSearch.trim());

      const statusParam =
        activeNav === "support" && activeSubnav !== "all" && activeSubnav !== "tickets"
          ? activeSubnav
          : "all";
      if (statusParam !== "all") params.set("status", statusParam);

      if (ticketPriorityFilter && ticketPriorityFilter !== "all") {
        params.set("priority", ticketPriorityFilter);
      }
      if (ticketCategoryFilter && ticketCategoryFilter !== "all") {
        params.set("category", ticketCategoryFilter);
      }

      const res = await fetch(`/api/support/tickets?${params.toString()}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.tickets)) {
        setTicketsList(data.tickets);
        setTicketTotalCount(data.total ?? data.tickets.length);
        setTicketTotalPages(
          data.totalPages ?? Math.max(1, Math.ceil((data.total ?? data.tickets.length) / TICKETS_PER_PAGE))
        );
        setTicketPage(data.page ?? page);
        if (data.stats) {
          setTicketStats(data.stats);
        }
      }
    } catch (err) {
      console.error("[Support] Failed to fetch tickets:", err);
    } finally {
      setIsTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "support") {
      const handler = setTimeout(() => {
        fetchTickets(ticketPage);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [
    activeNav,
    ticketPage,
    activeSubnav,
    ticketPriorityFilter,
    ticketCategoryFilter,
    ticketSearch,
  ]);

  // Real Payments & Financial Ledger State
  const [paymentsList, setPaymentsList] = useState<IPayment[]>([]);
  const [payPage, setPayPage] = useState<number>(1);
  const PAYMENTS_PER_PAGE = 20;
  const [payTotalPages, setPayTotalPages] = useState<number>(1);
  const [payTotalCount, setPayTotalCount] = useState<number>(0);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState<boolean>(false);
  const [paySearch, setPaySearch] = useState<string>("");
  const [payStatusFilter, setPayStatusFilter] = useState<string>("all");
  const [payProviderFilter, setPayProviderFilter] = useState<string>("all");
  const [payCountryFilter, setPayCountryFilter] = useState<string>(
    currentRole === "country_admin" ? "Ethiopia" : "all"
  );
  const [payCityFilter, setPayCityFilter] = useState<string>("all");
  const [payStats, setPayStats] = useState<PaymentStats | null>(null);
  const [payGeoBreakdown, setPayGeoBreakdown] = useState<GeoPaymentSummary[]>([]);
  const [isRegisterPaymentModalOpen, setIsRegisterPaymentModalOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<IPayment | null>(null);

  // Synchronize country admin geoScope to payment country filter
  useEffect(() => {
    if ((geoScopeRole === "country_admin" || currentRole === "country_admin") && geoSelectedCountry && geoSelectedCountry !== "all") {
      setPayCountryFilter(geoSelectedCountry);
    }
  }, [geoScopeRole, currentRole, geoSelectedCountry]);

  // Fetch real payments from /api/payments with server pagination
  const fetchPayments = async (page = payPage) => {
    setIsPaymentsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(PAYMENTS_PER_PAGE));
      if (paySearch.trim()) params.set("search", paySearch.trim());
      if (payStatusFilter && payStatusFilter !== "all") params.set("status", payStatusFilter);
      if (payProviderFilter && payProviderFilter !== "all") params.set("provider", payProviderFilter);
      if (payCountryFilter && payCountryFilter !== "all") params.set("country", payCountryFilter);
      if (payCityFilter && payCityFilter !== "all") params.set("city", payCityFilter);

      const res = await fetch(`/api/payments?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setPaymentsList(data.payments || []);
        setPayPage(data.pagination?.page || page);
        setPayTotalPages(data.pagination?.totalPages || 1);
        setPayTotalCount(data.pagination?.total || 0);
        if (data.stats) setPayStats(data.stats);
        if (data.geoBreakdown) setPayGeoBreakdown(data.geoBreakdown);
      }
    } catch (err) {
      console.warn("[Payments] Failed to fetch live payments:", err);
    } finally {
      setIsPaymentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "payments") {
      const handler = setTimeout(() => {
        fetchPayments(payPage);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [activeNav, payPage, payStatusFilter, payProviderFilter, paySearch, payCountryFilter, payCityFilter]);


  // ─── Analytics Ledger & 20-Per-Page Server Pagination State ────────────────
  const [analyticsList, setAnalyticsList] = useState<IAnalyticsEvent[]>([]);
  const [analyticsPage, setAnalyticsPage] = useState<number>(1);
  const ANALYTICS_PER_PAGE = 20;
  const [analyticsTotalPages, setAnalyticsTotalPages] = useState<number>(1);
  const [analyticsTotalCount, setAnalyticsTotalCount] = useState<number>(0);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);
  const [analyticsSearch, setAnalyticsSearch] = useState<string>("");
  const [analyticsTypeFilter, setAnalyticsTypeFilter] = useState<string>("all");
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [isRegisterAnalyticsModalOpen, setIsRegisterAnalyticsModalOpen] = useState(false);

  const fetchAnalytics = async (page = analyticsPage) => {
    setIsAnalyticsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(ANALYTICS_PER_PAGE));
      if (analyticsSearch.trim()) params.set("search", analyticsSearch.trim());
      if (analyticsTypeFilter && analyticsTypeFilter !== "all") {
        params.set("type", analyticsTypeFilter);
      }
      if (geoSelectedCity && geoSelectedCity !== "all") {
        params.set("city", geoSelectedCity);
      }
      if (geoSelectedCountry && geoSelectedCountry !== "all") {
        params.set("country", geoSelectedCountry);
      }

      const res = await fetch(`/api/analytics?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.events)) {
        setAnalyticsList(data.events);
        setAnalyticsPage(data.pagination?.page || page);
        setAnalyticsTotalPages(data.pagination?.totalPages || 1);
        setAnalyticsTotalCount(data.pagination?.total || 0);
        if (data.stats) setAnalyticsStats(data.stats);
      }
    } catch (err) {
      console.warn("[Analytics] Failed to fetch live telemetry:", err);
    } finally {
      setIsAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "analytics") {
      const handler = setTimeout(() => {
        fetchAnalytics(analyticsPage);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [activeNav, analyticsPage, analyticsTypeFilter, analyticsSearch, geoSelectedCity, geoSelectedCountry]);

  // ─── Real Reports & Moderation Queue State ────────────────────────────────
  const [reportsList, setReportsList] = useState<IReport[]>([]);
  const [reportPage, setReportPage] = useState<number>(1);
  const REPORTS_PER_PAGE = 5; // Exactly 5 records per page as requested
  const [reportTotalPages, setReportTotalPages] = useState<number>(1);
  const [reportTotalCount, setReportTotalCount] = useState<number>(0);
  const [isReportsLoading, setIsReportsLoading] = useState<boolean>(false);
  const [reportSearch, setReportSearch] = useState<string>("");
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("all");
  const [reportStatusFilter, setReportStatusFilter] = useState<string>("all");
  const [reportPriorityFilter, setReportPriorityFilter] = useState<string>("all");
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);
  const [isRegisterReportModalOpen, setIsRegisterReportModalOpen] = useState<boolean>(false);
  const [selectedReportForDetail, setSelectedReportForDetail] = useState<IReport | null>(null);

  const fetchReports = async (page = reportPage) => {
    setIsReportsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(REPORTS_PER_PAGE));
      if (reportSearch.trim()) params.set("search", reportSearch.trim());

      const typeParam =
        activeNav === "moderation" && activeSubnav !== "all" && activeSubnav !== "resolved"
          ? activeSubnav
          : reportTypeFilter !== "all"
          ? reportTypeFilter
          : "";
      if (typeParam) params.set("type", typeParam);

      const statusParam =
        activeNav === "moderation" && activeSubnav === "resolved"
          ? "resolved"
          : reportStatusFilter !== "all"
          ? reportStatusFilter
          : "";
      if (statusParam) params.set("status", statusParam);

      if (reportPriorityFilter && reportPriorityFilter !== "all") {
        params.set("priority", reportPriorityFilter);
      }

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReportsList(data.data || []);
        setReportPage(data.page || page);
        setReportTotalPages(data.totalPages || 1);
        setReportTotalCount(data.total || 0);
        if (data.stats) setReportStats(data.stats);
      }
    } catch (err) {
      console.warn("[Reports] Failed to fetch live reports:", err);
    } finally {
      setIsReportsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "moderation") {
      const handler = setTimeout(() => {
        fetchReports(reportPage);
      }, 200);
      return () => clearTimeout(handler);
    }
  }, [
    activeNav,
    reportPage,
    activeSubnav,
    reportTypeFilter,
    reportStatusFilter,
    reportPriorityFilter,
    reportSearch,
  ]);


  // Filtered Users List (uses server paginated and filtered results)
  const filteredUsersList = useMemo(() => {
    return usersList;
  }, [usersList]);

  // Filtered Businesses List — server already handles status & search filtering;
  // client memo is just a pass-through to keep downstream references stable.
  const filteredBusinesses = useMemo(() => businesses, [businesses]);

  // Filtered Reviews — server already handles status & search filtering.
  const filteredReviews = useMemo(() => reviewsList, [reviewsList]);

  // Filtered Tickets (Server paginated 20 items per page)
  const filteredTickets = useMemo(() => {
    return ticketsList;
  }, [ticketsList]);

  // Filtered Media (Already filtered and paginated 10-per-page on server)
  const filteredMedia = useMemo(() => {
    return mediaList;
  }, [mediaList]);

  // ─── Real Notifications State & 10-Per-Page Server Pagination ───────────────
  const [notificationsList, setNotificationsList] = useState<INotification[]>([]);
  const [notifPage, setNotifPage] = useState<number>(1);
  const NOTIFS_PER_PAGE = 10;
  const [notifTotalPages, setNotifTotalPages] = useState<number>(1);
  const [notifTotalCount, setNotifTotalCount] = useState<number>(0);
  const [isNotifsLoading, setIsNotifsLoading] = useState<boolean>(false);
  const [notifSearch, setNotifSearch] = useState<string>("");
  const [notifTargetFilter, setNotifTargetFilter] = useState<string>("all");
  const [notifTypeFilter, setNotifTypeFilter] = useState<string>("all");
  const [notifPriorityFilter, setNotifPriorityFilter] = useState<string>("all");
  const [notifStats, setNotifStats] = useState<NotificationStats | null>(null);
  const [isRegisterNotifModalOpen, setIsRegisterNotifModalOpen] = useState<boolean>(false);
  const [selectedNotifForDetail, setSelectedNotifForDetail] = useState<INotification | null>(null);

  // Search Engine Top Queries
  const topSearches = [
    { rank: 1, term: "Restaurant near me", volume: "24,500", trend: "+18%" },
    { rank: 2, term: "Pharmacy near me", volume: "18,320", trend: "+12%" },
    { rank: 3, term: "Hotel in Addis Ababa", volume: "12,450", trend: "+9%" },
    { rank: 4, term: "Supermarket near me", volume: "10,820", trend: "+15%" },
    { rank: 5, term: "Hospital near me", volume: "9,450", trend: "+6%" },
    { rank: 6, term: "Coffee Shop & Cafe", volume: "8,920", trend: "+22%" },
  ];

  // ── Category CRUD & Pagination Handlers ─────────────────────────────────────
  const handleAddCategory = async (newCat: Partial<Category>) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCat),
      });
      const data = await res.json();
      if (data?.success && data.category) {
        setCategories((prev) => [data.category, ...prev]);
        toast.success(`Category "${data.category.name}" registered to database!`);
        setIsAddCatModalOpen(false);
        setDefaultParentForAdd(undefined);
      } else {
        toast.error(data?.error || "Failed to register category");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error registering category");
    }
  };

  const handleUpdateCategory = async (upCat: Category) => {
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(upCat),
      });
      const data = await res.json();
      if (data?.success && data.category) {
        setCategories((prev) => prev.map((c) => (c.id === data.category.id ? data.category : c)));
        toast.success(`Category "${data.category.name}" updated in database!`);
        setEditingCategory(null);
      } else {
        toast.error(data?.error || "Failed to update category");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error updating category");
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${catName}" and any associated subcategories from the database?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(catId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data?.success) {
        setCategories((prev) => prev.filter((c) => c.id !== catId && c.parentId !== catId));
        toast.success(`Category "${catName}" deleted from database`);
      } else {
        toast.error(data?.error || "Failed to delete category");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error deleting category");
    }
  };

  // Hierarchy calculations for actual categories
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
      const totalSubcats = catsWithSubcats.reduce(
        (acc, curr) => acc + 1 + curr.subcats.length,
        0
      );
      return {
        ...ind,
        categories: catsWithSubcats,
        totalCount: totalSubcats,
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

  // Actions with MongoDB Integration
  // Actions with Multi-Tier Approval API Integration
  const handleApproveBusiness = async (id: string, name: string) => {
    const biz = businesses.find((b) => b.id === id);
    const curStatus = biz?.approvalStatus || "pending_city";

    // Determine next action based on multi-tier progression:
    // pending_city -> advance to pending_country (country_approve)
    // pending_country -> advance to pending_super_admin (country_approve)
    // pending_super_admin (or any other) -> super_admin_approve
    let action = "super_admin_approve";
    let nextStatus = "approved";
    if (curStatus === "pending_city") {
      action = "city_approve";
      nextStatus = "pending_country";
    } else if (curStatus === "pending_country") {
      action = "country_approve";
      nextStatus = "pending_super_admin";
    }

    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === id
          ? ({
              ...b,
              approvalStatus: nextStatus as any,
              isVerified: nextStatus === "approved",
              isApproved: nextStatus === "approved",
              isPublished: nextStatus === "approved",
            } as any)
          : b
      )
    );

    toast.success(
      nextStatus === "approved"
        ? `"${name}" approved and published live!`
        : `"${name}" approved and advanced to ${nextStatus.replace(/_/g, " ")}!`
    );

    try {
      await fetch(`/api/businesses/${id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          actorName: "Platform Admin",
          actorRole: "super_admin",
        }),
      });
    } catch (e) {
      console.error("Failed to persist approval:", e);
    }
  };

  const handleSuperAdminOverride = async (id: string, name: string) => {
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === id
          ? ({
              ...b,
              approvalStatus: "approved",
              isVerified: true,
              isApproved: true,
              isPublished: true,
            } as any)
          : b
      )
    );

    toast.success(`⚡ Super Admin Fast-Track: "${name}" approved & published!`, {
      description: "Direct publication without intermediate municipal approvals.",
    });

    try {
      await fetch(`/api/businesses/${id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "super_admin_override",
          actorName: "Super Admin",
          actorRole: "super_admin",
          notes: "Super Admin Fast-Track Override: direct approval and publication.",
        }),
      });
    } catch (e) {
      console.error("Failed to fast-track approval:", e);
    }
  };

  const handleRejectBusiness = async (id: string, name: string) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? ({ ...b, isVerified: false, approvalStatus: "rejected" } as any) : b))
    );
    toast.error(`"${name}" listing rejected.`);

    try {
      await fetch(`/api/businesses/${id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          actorName: "Platform Admin",
          actorRole: "super_admin",
          rejectionReason: "Declined by administrative compliance review.",
        }),
      });
    } catch (e) {
      console.error("Failed to persist rejection:", e);
    }
  };

  const handleToggleUser = async (userId: string, cur: "active" | "suspended") => {
    const next = cur === "active" ? "suspended" : "active";
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: next } : u))
    );
    if (viewingUser && viewingUser.id === userId) {
      setViewingUser((prev) => (prev ? { ...prev, status: next } : null));
    }
    toast.success(`User status updated to ${next}.`);
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: next }),
      });
    } catch (e) {
      console.error("Failed to update user status in database:", e);
    }
  };

  const handlePaymentStatusChange = async (id: string, newStatus: any) => {
    try {
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentsList((prev) =>
          prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
        toast.success(`Payment ${id} marked as ${newStatus}.`);
        fetchPayments(payPage);
      } else {
        toast.error(data.error || "Failed to update payment status");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error updating payment status");
    }
  };

  const exportPaymentsCSV = () => {
    if (!paymentsList.length) {
      toast.error("No payment records to export.");
      return;
    }

    const sanitize = (v: any) => {
      if (v === null || v === undefined) return '""';
      let s = String(v);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // formula injection guard
      return `"${s.replace(/"/g, '""')}"`;
    };

    const headers = [
      "Transaction ID",
      "Business Name",
      "Country",
      "City",
      "Payer Name",
      "Payer Phone",
      "Payer Email",
      "Amount",
      "Currency",
      "Provider",
      "Type",
      "Status",
      "Reference",
      "Date",
    ];

    const rows = paymentsList.map((p) => [
      sanitize(p.id),
      sanitize(p.businessName),
      sanitize(p.countryName || "—"),
      sanitize(p.cityName || "—"),
      sanitize(p.payerName),
      sanitize(p.payerPhone),
      sanitize(p.payerEmail),
      p.amount,
      p.currency,
      p.provider,
      p.paymentType,
      p.status,
      sanitize(p.reference),
      sanitize(new Date(p.createdAt).toISOString()),
    ]);

    // UTF-8 BOM for Excel compatibility
    const BOM = "\uFEFF";
    const csvContent = BOM + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const geoPart = [
      payCountryFilter !== "all" ? payCountryFilter : "",
      payCityFilter !== "all" ? payCityFilter : "",
    ].filter(Boolean).join("_") || "All_Regions";
    const statusPart = payStatusFilter !== "all" ? `_${payStatusFilter}` : "";
    const datePart = new Date().toISOString().slice(0, 10);

    const link = document.createElement("a");
    link.href = url;
    link.download = `BizFinder_Payments_${geoPart}${statusPart}_${datePart}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`✅ CSV exported — ${paymentsList.length} payment records`);
  };

  const exportPaymentsJSON = () => {
    if (!paymentsList.length) {
      toast.error("No payment records to export.");
      return;
    }
    const geoPart = [
      payCountryFilter !== "all" ? payCountryFilter : "",
      payCityFilter !== "all" ? payCityFilter : "",
    ].filter(Boolean).join("_") || "All_Regions";
    const statusPart = payStatusFilter !== "all" ? `_${payStatusFilter}` : "";
    const datePart = new Date().toISOString().slice(0, 10);

    const payload = {
      exportedAt: new Date().toISOString(),
      filters: {
        country: payCountryFilter !== "all" ? payCountryFilter : null,
        city: payCityFilter !== "all" ? payCityFilter : null,
        status: payStatusFilter !== "all" ? payStatusFilter : null,
        provider: payProviderFilter !== "all" ? payProviderFilter : null,
      },
      totalCount: payTotalCount,
      exportedCount: paymentsList.length,
      stats: payStats,
      payments: paymentsList,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `BizFinder_Payments_${geoPart}${statusPart}_${datePart}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`✅ JSON exported — ${paymentsList.length} payment records`);
  };


  const renderPaymentProviderBadge = (prov: string) => {
    switch (prov) {
      case "telebirr":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Smartphone className="w-3 h-3 text-emerald-500" /> Telebirr
          </span>
        );
      case "cbebirr":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Building2 className="w-3 h-3 text-purple-500" /> CBE Birr
          </span>
        );
      case "mpesa":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
            <Smartphone className="w-3 h-3 text-green-500" /> M-Pesa
          </span>
        );
      case "card":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <CreditCard className="w-3 h-3 text-indigo-500" /> Card / Stripe
          </span>
        );
      case "chapa":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3 text-amber-500" /> Chapa
          </span>
        );
      case "bank_transfer":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <Landmark className="w-3 h-3 text-cyan-500" /> Bank Transfer
          </span>
        );
      case "cash":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
            <Banknote className="w-3 h-3 text-emerald-600" /> Cash / Office
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border capitalize">
            {prov}
          </span>
        );
    }
  };

  const renderAnalyticsTypeBadge = (type: string) => {
    switch (type) {
      case "view":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
            <Eye className="w-3 h-3 text-sky-500" /> View
          </span>
        );
      case "search":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            <Search className="w-3 h-3 text-blue-500" /> Search
          </span>
        );
      case "click_phone":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Phone className="w-3 h-3 text-emerald-500" /> Call
          </span>
        );
      case "click_direction":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Navigation className="w-3 h-3 text-amber-500" /> Direction
          </span>
        );
      case "click_website":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Globe className="w-3 h-3 text-indigo-500" /> Website
          </span>
        );
      case "favorite":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <Bookmark className="w-3 h-3 text-rose-500" /> Favorite
          </span>
        );
      case "ad_click":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Megaphone className="w-3 h-3 text-purple-500" /> Ad Click
          </span>
        );
      case "share":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <Share2 className="w-3 h-3 text-teal-500" /> Share
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border capitalize">
            <Activity className="w-3 h-3" /> {type}
          </span>
        );
    }
  };

  const handleReviewAction = async (
    id: string,
    action: "approve" | "hide" | "delete" | "restore"
  ) => {
    try {
      if (action === "delete") {
        if (!window.confirm("Are you sure you want to delete this review permanently from the database?")) return;
        const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" });
        const data = await res.json();
        if (data?.success) {
          toast.success("Review permanently deleted.");
          fetchReviews(reviewPage);
        } else {
          toast.error(data?.error || "Failed to delete review");
        }
      } else {
        const res = await fetch("/api/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, action }),
        });
        const data = await res.json();
        if (data?.success) {
          toast.success(`Review ${action}d successfully.`);
          fetchReviews(reviewPage);
        } else {
          toast.error(data?.error || "Failed to update review status");
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to execute review action");
    }
  };

  // ─── Notifications CRUD & Pagination ────────────────────────────────────────
  const fetchNotifications = async (page = notifPage, targetOverride?: string) => {
    setIsNotifsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(NOTIFS_PER_PAGE));
      if (notifSearch.trim()) params.set("search", notifSearch.trim());
      const effectiveTarget = targetOverride !== undefined ? targetOverride : notifTargetFilter;
      if (effectiveTarget && effectiveTarget !== "all") params.set("target", effectiveTarget);
      if (notifTypeFilter && notifTypeFilter !== "all") params.set("type", notifTypeFilter);
      if (notifPriorityFilter && notifPriorityFilter !== "all") params.set("priority", notifPriorityFilter);

      const res = await fetch(`/api/admin/notifications?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setNotificationsList(data.notifications || []);
        setNotifPage(data.page || page);
        setNotifTotalPages(data.totalPages || 1);
        setNotifTotalCount(data.total || 0);
        if (data.stats) setNotifStats(data.stats);
      }
    } catch (err) {
      console.warn("[Notifications] Failed to fetch:", err);
    } finally {
      setIsNotifsLoading(false);
    }
  };

  useEffect(() => {
    if (activeNav === "notifications") {
      let target = notifTargetFilter;
      if (activeSubnav === "global") target = "global";
      else if (activeSubnav === "business") target = "business";
      else if (activeSubnav === "all") target = "all";
      fetchNotifications(notifPage, target);
    }
  }, [notifPage, activeSubnav, activeNav]);

  const handleDeleteNotification = async (id: string) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
    setNotifTotalCount((c) => Math.max(0, c - 1));
    toast.success("Notification deleted permanently.");
    try {
      await fetch(`/api/admin/notifications?id=${id}`, { method: "DELETE" });
    } catch (e) {
      console.error("Failed to delete notification from MongoDB:", e);
    }
  };

  // ── Modern Sidebar Nav Item Builder ──────────────────────────────────────
  const renderSidebarItem = (
    key: string,
    label: string,
    icon: React.ReactNode,
    superAdminOnly = false,
    subItems?: Array<{ key: string; label: string; count?: number }>
  ) => {
    const isSelected = activeNav === key;
    const isExpanded = expandedNavSections.includes(key);
    const hasAlert = subItems?.some(s => (s.count ?? 0) > 0);

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
              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25"
              : "text-muted-foreground hover:text-foreground hover:bg-accent/70"
          }`}
        >
          {/* Active left-border glow */}
          {isSelected && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          )}
          <div className="flex items-center gap-2.5 truncate">
            <span className={`shrink-0 transition-transform duration-200 ${
              isSelected ? "text-primary-foreground scale-110" : "text-muted-foreground group-hover:text-foreground group-hover:scale-105"
            }`}>
              {icon}
            </span>
            <span className="truncate font-semibold">{label}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {superAdminOnly && (
              <Badge
                variant="outline"
                className={`text-[9px] px-1.5 py-0 uppercase tracking-wider font-black ${
                  isSelected
                    ? "border-white/40 text-white bg-white/10"
                    : "border-violet-500/40 text-violet-500 dark:text-violet-400 bg-violet-500/10"
                }`}
              >
                👑
              </Badge>
            )}
            {!superAdminOnly && hasAlert && !isSelected && (
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
            {subItems && subItems.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  toggleNavSection(key);
                }}
                className={`p-0.5 rounded-md transition-all duration-200 ${
                  isSelected ? "text-primary-foreground/70 hover:text-white" : "hover:bg-accent"
                }`}
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
              </span>
            )}
          </div>
        </button>

        {/* Subnav with slide-down animation */}
        {subItems && isExpanded && (
          <div className="pl-4 pr-1 pt-0.5 pb-1 space-y-0.5 animate-subnav-open">
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
                      ? "bg-primary/10 text-primary font-bold border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                      isSubActive ? "bg-primary shadow-[0_0_6px_currentColor]" : "bg-muted-foreground/30"
                    }`} />
                    <span className="truncate">{sub.label}</span>
                  </div>
                  {sub.count !== undefined && sub.count > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                      isSubActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
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

  // Subnav Tab Bar Builder
  const renderSubnavTabs = (
    tabs: Array<{ key: string; label: string; count?: number }>
  ) => (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveSubnav(tab.key)}
          className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
            activeSubnav === tab.key
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground border border-border hover:border-foreground/30 hover:text-foreground"
          }`}
        >
          <span>{tab.label}</span>
          {tab.count !== undefined && (
            <span
              className={`text-[10px] px-1.5 rounded-full ${
                activeSubnav === tab.key
                  ? "bg-primary-foreground/20 text-primary-foreground"
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
    <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground flex flex-col">
      {/* ─── Top Admin Bar ────────────────────────────────────────────── */}
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
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-foreground">
                Admin Ecosystem Control
              </h1>
              <Badge variant="outline" className="text-[10px] uppercase font-bold border-indigo-500/30 text-indigo-600 dark:text-indigo-400">
                {isSuperAdmin ? "👑 Super Admin Mode" : "Admin Operations"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Universal Business Directory, Taxonomy & Platform Operations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Dark / Light Theme Toggle in Admin Top Bar */}
          <ThemeToggle variant="pill" />

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsHealthModalOpen(true)}
            className="gap-1.5 text-xs font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            System Health: 99.98%
          </Button>

          {isSuperAdmin && (
            <Button
              size="sm"
              variant="gradient"
              onClick={() => setIsAssignGeoModalOpen(true)}
              className="gap-1.5 text-xs font-bold shadow-md shadow-indigo-500/20"
              title="Assign or Appoint Territory Admin with Clerk Dashboard Sync"
            >
              <UserPlus className="w-3.5 h-3.5" />
              New Admin
            </Button>
          )}
        </div>
      </div>

      {/* ─── Sidebar + Main Content Layout ─────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* ── Left Sidebar — Modern Section-Grouped Navigation ─────────── */}
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

            {/* ── Section: Core ─────────────────────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Core Operations
                <div className="flex-1 h-px bg-border/60" />
              </div>
              {renderSidebarItem("dashboard", "Dashboard", <Activity className="w-4 h-4 text-indigo-500" />)}
              {renderSidebarItem("global_visitors", "Global Visitors", <Globe className="w-4 h-4 text-cyan-400" />)}
              {renderSidebarItem("users", "Users", <Users className="w-4 h-4 text-sky-500" />, false, [
                { key: "all", label: isCountryAdmin ? "All Regular Users" : "All Users", count: userTotalCount || usersList.length },
                { key: "customers", label: "Customers", count: userCounts.customers },
                { key: "owners", label: "Business Owners", count: userCounts.owners },
                ...(!isCountryAdmin ? [{ key: "admins", label: "Administrators", count: userCounts.admins }] : []),
                { key: "suspended", label: "Suspended", count: userCounts.suspended },
              ])}
              {/* Dedicated City Admins Hub for Country Admin only */}
              {isCountryAdmin && renderSidebarItem(
                "city_admins_hub",
                `City Admins (${geoSelectedCountry === "all" ? "Ethiopia" : geoSelectedCountry})`,
                <ShieldCheck className="w-4 h-4 text-amber-500" />,
                false,
                [
                  { key: "all", label: "All Municipal Admins", count: userCounts.cityAdmins ?? 0 },
                  { key: "appointed", label: "Appointed" },
                  { key: "vacant", label: "Vacant Cities" },
                ]
              )}
              {renderSidebarItem("businesses", isCountryAdmin ? `Businesses (${geoSelectedCountry})` : isCityAdmin ? `Businesses (${geoSelectedCity})` : "Businesses", <Building2 className="w-4 h-4 text-emerald-500" />, false, [
                { key: "all", label: "All Businesses", count: bizTotalCount },
                { key: "new", label: "+ New Listing Wizard" },
                { key: "pending_confirmations", label: "🔔 Pending Confirmations", count: bizCounts.pending },
                { key: "pending", label: "Pending Approval", count: bizCounts.pending },
                { key: "verified", label: "Verified", count: bizCounts.verified },
                { key: "rejected", label: "Rejected" },
                { key: "suspended", label: "Suspended", count: bizCounts.suspended },
                { key: "claimed", label: "Claimed", count: bizCounts.claimed },
              ])}
              {renderSidebarItem("categories", "Categories", <FolderTree className="w-4 h-4 text-purple-500" />, false, [
                { key: "all", label: "All Categories", count: categories.length },
                { key: "industries", label: "Industries" },
                { key: "subcategories", label: "Subcategories" },
              ])}
              {renderSidebarItem("locations", "Locations", <MapPin className="w-4 h-4 text-rose-500" />, false, [
                { key: "countries", label: "Countries", count: 195 },
                { key: "regions", label: "States / Regions" },
                { key: "cities", label: "Cities", count: locations.length },
                { key: "districts", label: "Districts" },
              ])}
            </div>

            {/* ── Section: Content & Media ───────────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Content & Media
                <div className="flex-1 h-px bg-border/60" />
              </div>
              {renderSidebarItem("reviews", "Reviews", <Sparkles className="w-4 h-4 text-amber-500" />, false, [
                { key: "all", label: "All Reviews", count: reviewCounts.all || reviewTotalCount },
                { key: "pending", label: "Pending", count: reviewCounts.pending },
                { key: "reported", label: "Reported", count: reviewCounts.reported },
                { key: "removed", label: "Removed", count: reviewCounts.removed },
              ])}
              {renderSidebarItem("media", "Media Library", <Camera className="w-4 h-4 text-pink-500" />, false, [
                { key: "all", label: "All Assets", count: mediaTotalCount },
                { key: "photos", label: "Photos", count: mediaCounts.photos },
                { key: "videos", label: "Videos", count: mediaCounts.videos },
                { key: "pending", label: "Pending Review", count: mediaCounts.pending },
                { key: "reported", label: "Reported", count: mediaCounts.reported },
              ])}
              {renderSidebarItem("advertisements", "Advertisements", <Megaphone className="w-4 h-4 text-teal-500" />, false, [
                { key: "all", label: "All Campaigns", count: adTotalCount },
                { key: "create", label: "Create Campaign" },
                { key: "active", label: "Active", count: adCounts.active },
                { key: "paused", label: "Paused", count: adCounts.paused },
                { key: "completed", label: "Completed", count: adCounts.completed },
              ])}
            </div>

            {/* ── Section: Platform Operations ───────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                Platform Ops
                <div className="flex-1 h-px bg-border/60" />
              </div>
              {renderSidebarItem("payments", "Payments", <CreditCard className="w-4 h-4 text-green-500" />, false, [
                { key: "transactions", label: "Transactions", count: payTotalCount },
                { key: "subscriptions", label: "Subscriptions" },
                { key: "invoices", label: "Invoices" },
                { key: "refunds", label: "Refunds" },
                { key: "revenue", label: "Revenue Overview" },
              ])}
              {renderSidebarItem("analytics", "Analytics", <BarChart3 className="w-4 h-4 text-indigo-400" />, false, [
                { key: "all", label: "Live Event Ledger", count: analyticsTotalCount },
                { key: "platform", label: "Platform Overview" },
                { key: "search", label: "Search Analytics" },
                { key: "location", label: "Location Breakdown" },
                { key: "business", label: "Business Metrics" },
              ])}
              {renderSidebarItem("moderation", "Reports & Moderation", <Flag className="w-4 h-4 text-red-500" />, false, [
                { key: "all", label: "All Reports", count: reportStats?.totalReports || reportTotalCount },
                { key: "business", label: "Business Reports", count: reportStats?.businessReportsCount },
                { key: "user", label: "User Reports", count: reportStats?.userReportsCount },
                { key: "review", label: "Review Reports", count: reportStats?.reviewReportsCount },
                { key: "resolved", label: "Resolved", count: reportStats?.resolvedCount },
              ])}
              {renderSidebarItem("notifications", "Notifications", <Bell className="w-4 h-4 text-yellow-500" />, false, [
                { key: "all", label: "All Notifications", count: notifTotalCount },
                { key: "send", label: "Send Broadcast" },
                { key: "templates", label: "Templates" },
              ])}
              {renderSidebarItem("support", "Support Desk", <Ticket className="w-4 h-4 text-emerald-400" />, false, [
                { key: "all", label: "All Tickets", count: ticketStats?.total ?? ticketTotalCount },
                { key: "open", label: "Open", count: ticketStats?.open ?? 0 },
                { key: "in_progress", label: "In Progress", count: ticketStats?.inProgress ?? 0 },
                { key: "waiting_on_customer", label: "Awaiting Customer", count: ticketStats?.waiting ?? 0 },
                { key: "resolved", label: "Resolved", count: ticketStats?.resolved ?? 0 },
              ])}
            </div>

            {/* ── Section: System ────────────────────────────────────────── */}
            <div className="space-y-0.5">
              <div className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 flex items-center gap-2">
                <div className="flex-1 h-px bg-border/60" />
                System
                <div className="flex-1 h-px bg-border/60" />
              </div>
              {renderSidebarItem("settings", "Settings", <Settings className="w-4 h-4 text-slate-400" />, false, [
                { key: "general", label: "General" },
                { key: "business", label: "Business Rules" },
                { key: "search", label: "Search & Map" },
                { key: "seo", label: "SEO & Social" },
                { key: "notifications", label: "Notifications" },
                { key: "payments", label: "Payment Gateway" },
                { key: "security", label: "Security Policy" },
                { key: "maintenance", label: "Maintenance" },
              ])}
              {renderSidebarItem("security", "Security", <Lock className="w-4 h-4 text-rose-500" />, true, [
                { key: "admins", label: "Admin Accounts" },
                { key: "roles", label: "Role Management" },
                { key: "permissions", label: "Permissions" },
                { key: "audit", label: "Audit Logs" },
                { key: "logins", label: "Login Activity" },
              ])}
              {/* Territory Admin — only visible to Super Admin; Country Admin sees City Admins Hub instead */}
              {!isCountryAdmin && !isCityAdmin && renderSidebarItem("geo_admins", "Territory Admin", <Globe className="w-4 h-4 text-indigo-500" />, false, [
                { key: "country_leads", label: "Country Admins", count: 195 },
                { key: "city_admins", label: "City Admins" },
              ])}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border/60">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-between gap-2">
              <div className="truncate">
                <div className="text-[10px] font-black text-foreground capitalize flex items-center gap-1.5">
                  {isSuperAdmin ? <Crown className="w-3 h-3 text-amber-500" /> : <Shield className="w-3 h-3 text-indigo-500" />}
                  {currentRole.replace(/_/g, " ")}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">Admin Control Panel</div>
              </div>
              <ThemeToggle variant="button" />
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ──────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-background">
          {/* Breadcrumb / Location Strip */}
          <div className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md px-6 sm:px-8 py-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Building2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="font-semibold text-foreground">Admin Panel</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="capitalize font-semibold text-primary">
              {activeNav.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            {activeSubnav && activeSubnav !== "all" && (
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
          <div className="p-6 sm:p-8">
          {/* Animated key wrapper — re-mounts and slides in on every nav change */}
          <div key={activeNav + "-" + activeSubnav} className="animate-page-enter">
          {/* ════════════════════════════════════════════════════════════════════
              🌐 GEO-SCOPE JURISDICTION BANNER (Shown on all pages)
             ════════════════════════════════════════════════════════════════════ */}
          <div className="mb-6 max-w-7xl mx-auto">
            <GeoScopeBanner
              currentRole={geoScopeRole}
              onRoleChange={setGeoScopeRole}
              selectedCountry={geoSelectedCountry}
              onCountryChange={setGeoSelectedCountry}
              selectedCity={geoSelectedCity}
              onCityChange={setGeoSelectedCity}
            />
          </div>

          {/* ════════════════════════════════════════════════════════════════════
              🌍 16. TERRITORY ADMINISTRATION — Geo-Scoped Admin Management
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "geo_admins" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <TerritoryAdministrationView
                currentRole={geoScopeRole}
                currentCountry={geoSelectedCountry === "all" ? "Ethiopia" : geoSelectedCountry}
                currentCity={geoSelectedCity === "all" ? "Addis Ababa" : geoSelectedCity}
                onRoleChange={setGeoScopeRole}
                onCountryChange={setGeoSelectedCountry}
                onCityChange={setGeoSelectedCity}
              />
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              🌐 GLOBAL VISITORS TELEMETRY TAB
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "global_visitors" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <GlobalVisitorsMatrix
                currentRole={geoScopeRole}
                targetCountry={geoSelectedCountry}
                targetCity={geoSelectedCity !== "all" ? geoSelectedCity : undefined}
              />
            </div>
          )}
          {/* ════════════════════════════════════════════════════════════════════
              🛡️ CITY ADMINS HUB — Country Admin exclusive dedicated management
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "city_admins_hub" && isCountryAdmin && (
            <div className="max-w-7xl mx-auto">
              <CountryCityAdminsHub
                currentCountry={geoSelectedCountry === "all" ? "Ethiopia" : geoSelectedCountry}
                currentRole={geoScopeRole}
                compactView={false}
                onOpenAssignModal={(city) => {
                  setSelectedAssignCity(city || "");
                  setIsAssignGeoModalOpen(true);
                }}
              />
            </div>
          )}


          {/* ════════════════════════════════════════════════════════════════════
              1. 🏠 DASHBOARD PAGE
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "dashboard" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-foreground">
                    {isSuperAdmin
                      ? "Worldwide Super Admin Ecosystem"
                      : isCountryAdmin
                      ? `🌍 ${geoSelectedCountry} National Operations & Telemetry`
                      : isCityAdmin
                      ? `🏙️ ${geoSelectedCity || "City"} Municipal Portal (${geoSelectedCountry})`
                      : "Admin Ecosystem Overview"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isSuperAdmin
                      ? "Comprehensive platform telemetry across all 195 countries."
                      : isCountryAdmin
                      ? `National jurisdiction for ${geoSelectedCountry}. Access local businesses, verify listings, and observe global visitors viewing your territory.`
                      : isCityAdmin
                      ? `Municipal jurisdiction for ${geoSelectedCity}. Accessing local businesses and global users viewing your city's listings.`
                      : "Platform operations overview."}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isSuperAdmin && (
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => setIsAssignGeoModalOpen(true)}
                      className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
                    >
                      <Crown className="w-3.5 h-3.5" />
                      Assign Territory Admin
                    </Button>
                  )}
                  {isCountryAdmin && (
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => setIsAssignGeoModalOpen(true)}
                      className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Appoint City Admin
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => { fetchDashboardStats(); fetchBusinesses(1); toast.success("Dashboard refreshed!"); }} className="text-xs">
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isDashStatsLoading ? "animate-spin" : ""}`} /> Refresh
                  </Button>
                </div>
              </div>

              {/* ─── Role-Tailored Leadership & Jurisdiction Banner ─── */}
              {isSuperAdmin ? (
                <div className="p-5 sm:p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Crown className="w-5 h-5 text-amber-400" />
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        Super Admin Role Delegation & Clerk Dashboard Integration
                      </h3>
                      <Badge className="bg-amber-400/20 text-amber-300 border-amber-400/30 text-[10px] font-bold">
                        Super Admin Exclusive
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Appoint <strong>Country Main Admins</strong> (195 nations) and <strong>City Admins</strong> (30 cities per country). All assignments are instantly synchronized to your <strong>Clerk Dashboard publicMetadata</strong> and MongoDB.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-slate-300">
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">👑 Worldwide Super Admin</span>
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🌍 195 Country Leads</span>
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🏙️ 5,850 City Admins</span>
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🔐 Clerk PublicMetadata Sync</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => setIsAssignGeoModalOpen(true)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs gap-1.5 shadow-lg shadow-indigo-500/30"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Appoint Territory Admin
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveNav("geo_admins")}
                      className="border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                    >
                      Manage 195 Nations →
                    </Button>
                  </div>
                </div>
              ) : isCountryAdmin ? (
                <div className="p-5 sm:p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl">🌍</span>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        {geoSelectedCountry} National Governance & Municipal Leadership
                      </h3>
                      <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-[10px] font-bold">
                        National Lead Admin
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      You have national administrative authority for <strong>{geoSelectedCountry}</strong>. You can appoint and oversee <strong>City Admins</strong> across all 30 cities, verify national listings, and monitor global visitors viewing your country&apos;s businesses.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-slate-300">
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🌍 {geoSelectedCountry} National Territory</span>
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🏙️ 30 Municipal Districts</span>
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🌐 International Visitor Tracking</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <Button
                      size="sm"
                      onClick={() => setIsAssignGeoModalOpen(true)}
                      className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs gap-1.5 shadow-lg shadow-indigo-500/30"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Appoint City Admin
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveNav("geo_admins")}
                      className="border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold"
                    >
                      Manage City Admins →
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl">🏙️</span>
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                        {geoSelectedCity || "City"} Municipal Command Center
                      </h3>
                      <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/40 text-[10px] font-bold">
                        Municipal Admin
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Municipal authority for <strong>{geoSelectedCity || "Addis Ababa"}</strong>, {geoSelectedCountry}. Manage business verification queues, local citizen claims, and track international users viewing listings in your city.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-medium text-slate-300">
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🏙️ {geoSelectedCity || "Addis Ababa"} City</span>
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">🌍 {geoSelectedCountry} Jurisdiction</span>
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full">⚡ Real-Time Local Activity</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <a
                      href="/city-admin"
                      className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs gap-1.5 shadow-lg shadow-sky-500/30 inline-flex items-center"
                    >
                      <span>Open Municipal Portal →</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Top Statistics Cards — Live data from /api/admin/stats */}
              <div className={`grid gap-3 ${isCountryAdmin ? "grid-cols-2 sm:grid-cols-4 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-4 lg:grid-cols-8"}`}>
                {/* Users — adapts label for country admin */}
                <div
                  className={`p-3.5 rounded-2xl bg-card border relative overflow-hidden cursor-pointer transition-all hover:shadow-md ${
                    isCountryAdmin ? "border-sky-500/30 hover:border-sky-400/50" : "border-border"
                  }`}
                  onClick={() => isCountryAdmin ? (setActiveNav("users"), setActiveSubnav("all")) : undefined}
                  title={isCountryAdmin ? "View all regular users in your territory" : undefined}
                >
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">
                    {isCountryAdmin ? "👥 Regular Users" : "👥 Users"}
                  </div>
                  {isDashStatsLoading ? (
                    <div className="h-6 w-14 mt-1 rounded bg-muted animate-pulse" />
                  ) : (
                    <div className="text-lg font-black text-foreground mt-1">
                      {isCountryAdmin
                        ? ((dashboardStats?.totalNormalUsers ?? dashboardStats?.totalUsers ?? userTotalCount) || "—").toLocaleString()
                        : (dashboardStats ? dashboardStats.totalUsers.toLocaleString() : userTotalCount.toLocaleString() || "—")}
                    </div>
                  )}
                  {isCountryAdmin && (
                    <div className="text-[10px] text-sky-500 font-bold mt-0.5">Customers + Owners</div>
                  )}
                </div>

                {/* City Admins Card — only for Country Admin */}
                {isCountryAdmin && (
                  <div
                    className="p-3.5 rounded-2xl bg-card border border-amber-500/30 relative overflow-hidden cursor-pointer transition-all hover:border-amber-400/60 hover:shadow-md hover:shadow-amber-500/10"
                    onClick={() => { setActiveNav("city_admins_hub"); setActiveSubnav("all"); }}
                    title="Open City Admins Hub"
                  >
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">🛡️ City Admins</div>
                    {isDashStatsLoading ? (
                      <div className="h-6 w-10 mt-1 rounded bg-muted animate-pulse" />
                    ) : (
                      <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-1">
                        {(dashboardStats?.totalCityAdmins ?? userCounts.cityAdmins ?? 4).toLocaleString()}
                      </div>
                    )}
                    <div className="text-[10px] text-amber-500 font-bold mt-0.5">Municipal Leads</div>
                  </div>
                )}

                {/* Vacant Cities Card — only for Country Admin */}
                {isCountryAdmin && (
                  <div
                    className="p-3.5 rounded-2xl bg-card border border-rose-500/20 relative overflow-hidden cursor-pointer transition-all hover:border-rose-400/40 hover:shadow-sm"
                    onClick={() => { setActiveNav("city_admins_hub"); setActiveSubnav("vacant"); }}
                    title="View vacant municipalities"
                  >
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">⚠️ Vacant</div>
                    {isDashStatsLoading ? (
                      <div className="h-6 w-8 mt-1 rounded bg-muted animate-pulse" />
                    ) : (
                      <div className="text-lg font-black text-rose-500 dark:text-rose-400 mt-1">
                        {(dashboardStats?.totalVacantCities ?? Math.max(0, (dashboardStats?.totalCities ?? 30) - (dashboardStats?.totalCityAdmins ?? 4))).toLocaleString()}
                      </div>
                    )}
                    <div className="text-[10px] text-rose-400 font-bold mt-0.5">Unassigned Cities</div>
                  </div>
                )}

                {/* Businesses */}
                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🏢 Businesses</div>
                  {isDashStatsLoading ? (
                    <div className="h-6 w-14 mt-1 rounded bg-muted animate-pulse" />
                  ) : (
                    <div className="text-lg font-black text-foreground mt-1">
                      {dashboardStats ? dashboardStats.totalBusinesses.toLocaleString() : bizTotalCount.toLocaleString() || "—"}
                    </div>
                  )}
                </div>
                {/* Pending */}
                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">⏳ Pending</div>
                  {isDashStatsLoading ? (
                    <div className="h-6 w-10 mt-1 rounded bg-muted animate-pulse" />
                  ) : (
                    <div className="text-lg font-black text-amber-500 mt-1">
                      {dashboardStats ? dashboardStats.pendingBusinesses.toLocaleString() : bizCounts.pending.toLocaleString() || "—"}
                    </div>
                  )}
                </div>
                {/* Reviews */}
                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">⭐ Reviews</div>
                  {isDashStatsLoading ? (
                    <div className="h-6 w-14 mt-1 rounded bg-muted animate-pulse" />
                  ) : (
                    <div className="text-lg font-black text-foreground mt-1">
                      {dashboardStats ? dashboardStats.totalReviews.toLocaleString() : reviewTotalCount.toLocaleString() || "—"}
                    </div>
                  )}
                </div>
                {/* Countries — only for super admin */}
                {!isCountryAdmin && !isCityAdmin && (
                  <div className="p-3.5 rounded-2xl bg-card border border-border">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase">🌍 Countries</div>
                    {isDashStatsLoading ? (
                      <div className="h-6 w-10 mt-1 rounded bg-muted animate-pulse" />
                    ) : (
                      <div className="text-lg font-black text-foreground mt-1">
                        {dashboardStats ? (dashboardStats.totalCountries || "—") : "—"}
                      </div>
                    )}
                  </div>
                )}
                {/* Cities */}
                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🏙️ Cities</div>
                  {isDashStatsLoading ? (
                    <div className="h-6 w-10 mt-1 rounded bg-muted animate-pulse" />
                  ) : (
                    <div className="text-lg font-black text-foreground mt-1">
                      {dashboardStats ? dashboardStats.totalCities.toLocaleString() : "—"}
                    </div>
                  )}
                </div>
                {/* Revenue */}
                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">💰 Revenue</div>
                  {isDashStatsLoading ? (
                    <div className="h-6 w-16 mt-1 rounded bg-muted animate-pulse" />
                  ) : (
                    <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">
                      {dashboardStats
                        ? `$${dashboardStats.totalRevenue.toLocaleString()}`
                        : "—"}
                    </div>
                  )}
                </div>
                {/* Reports */}
                <div className="p-3.5 rounded-2xl bg-card border border-border">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">🚨 Reports</div>
                  {isDashStatsLoading ? (
                    <div className="h-6 w-8 mt-1 rounded bg-muted animate-pulse" />
                  ) : (
                    <div className="text-lg font-black text-red-500 mt-1">
                      {dashboardStats ? dashboardStats.openReports.toLocaleString() : reportTotalCount.toLocaleString() || "—"}
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Country Admin: Municipal City Admins Oversight (Compact) ─── */}
              {isCountryAdmin && (
                <div className="pt-2">
                  <CountryCityAdminsHub
                    currentCountry={geoSelectedCountry === "all" ? "Ethiopia" : geoSelectedCountry}
                    currentRole={geoScopeRole}
                    compactView={true}
                    onNavigateToFullView={() => { setActiveNav("city_admins_hub"); setActiveSubnav("all"); }}
                    onOpenAssignModal={(city) => {
                      setSelectedAssignCity(city || "");
                      setIsAssignGeoModalOpen(true);
                    }}
                  />
                </div>
              )}

              {/* ─── Global Users & International Visitor Reach Matrix ─── */}
              <div className="pt-2">
                <GlobalVisitorsMatrix
                  currentRole={geoScopeRole}
                  targetCountry={geoSelectedCountry}
                  targetCity={geoSelectedCity !== "all" ? geoSelectedCity : undefined}
                />
              </div>

              {/* 2 Growth Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-3xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-sky-500" /> User Growth
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {dashboardStats
                        ? (dashboardStats.totalUsers >= 1000
                            ? `${(dashboardStats.totalUsers / 1000).toFixed(1)}k`
                            : dashboardStats.totalUsers.toLocaleString())
                        : (userTotalCount >= 1000
                            ? `${(userTotalCount / 1000).toFixed(1)}k`
                            : userTotalCount.toLocaleString() || "0")}
                    </Badge>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={userGrowthChartData}>
                        <defs>
                          <linearGradient id="userG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" fontSize={10} stroke="#888888" />
                        <YAxis fontSize={10} stroke="#888888" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString()} />
                        <Tooltip />
                        <Area type="monotone" dataKey="users" stroke="#0ea5e9" fill="url(#userG)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-500" /> Business Growth
                    </h3>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {dashboardStats
                        ? (dashboardStats.totalBusinesses >= 1000
                            ? `${(dashboardStats.totalBusinesses / 1000).toFixed(1)}k`
                            : dashboardStats.totalBusinesses.toLocaleString())
                        : (bizTotalCount >= 1000
                            ? `${(bizTotalCount / 1000).toFixed(1)}k`
                            : bizTotalCount.toLocaleString() || "0")}
                    </Badge>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={bizGrowthChartData}>
                        <defs>
                          <linearGradient id="bizG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="month" fontSize={10} stroke="#888888" />
                        <YAxis fontSize={10} stroke="#888888" tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString()} />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#bizG)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Businesses + Recent Users Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-5 rounded-3xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground">Recent Businesses</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveNav("businesses")} className="text-[11px] h-6 text-primary">
                      View All →
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {businesses.slice(0, 3).map((b) => (
                      <div key={b.id} className="p-3 rounded-2xl bg-background border border-border flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-foreground">{b.name}</div>
                          <div className="text-[11px] text-muted-foreground">{b.categoryName} • {b.cityName}</div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setInspectingBusiness(b)} className="h-6 text-[10px]">
                          View
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-3xl bg-card border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-foreground">Recent Users</h3>
                    <Button variant="ghost" size="sm" onClick={() => setActiveNav("users")} className="text-[11px] h-6 text-primary">
                      View All →
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {usersList.slice(0, 3).map((u) => (
                      <div key={u.id} className="p-3 rounded-2xl bg-background border border-border flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-foreground">{u.name}</div>
                          <div className="text-[11px] text-muted-foreground">{u.email} • {u.country}</div>
                        </div>
                        <Badge variant="outline" className="text-[10px] capitalize">{u.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pending Approvals Table */}
              <div className="p-5 rounded-3xl bg-card border border-border space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-500" /> Pending Business Approvals
                    </h3>
                    <p className="text-xs text-muted-foreground">Listings awaiting admin review and verification.</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{businesses.filter(b => !b.isVerified || (b as any).verificationStatus === "pending").length} Pending</Badge>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                      <tr>
                        <th className="px-4 py-3">Business</th>
                        <th className="px-4 py-3">Category</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {businesses.filter(b => !b.isVerified || (b as any).verificationStatus === "pending").slice(0, 10).map((b) => (
                        <tr key={b.id} className="hover:bg-accent/20">
                          <td className="px-4 py-3 font-bold text-foreground">{b.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">{b.categoryName || (b as any).category || "General Business"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{b.cityName || (b as any).city || "Addis Ababa"}, {b.countryName || (b as any).country || "Ethiopia"}</td>
                          <td className="px-4 py-3">
                            {b.approvalStatus === "pending_city" && (
                              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px]">
                                Stage 1: City Review
                              </Badge>
                            )}
                            {b.approvalStatus === "pending_country" && (
                              <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 text-[10px]">
                                Stage 2: Country Lead
                              </Badge>
                            )}
                            {b.approvalStatus === "pending_super_admin" && (
                              <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 text-[10px]">
                                Stage 3: Super Admin
                              </Badge>
                            )}
                            {(b.approvalStatus === "approved" || b.isVerified) && (
                              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                                ✓ Approved
                              </Badge>
                            )}
                            {!b.approvalStatus && !b.isVerified && (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                                Pending Review
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                            <Button size="sm" variant="outline" onClick={() => setInspectingBusiness(b)} className="h-6 text-[10px]">
                              Review
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleApproveBusiness(b.id, b.name)} className="h-6 text-[10px] text-emerald-600 border-emerald-500/30">
                              Approve
                            </Button>
                            <Button size="sm" onClick={() => handleSuperAdminOverride(b.id, b.name)} className="h-6 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs" title="Super Admin Fast-Track: Post immediately without waiting for lower tiers">
                              ⚡ Fast-Track Post
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

          {/* ════════════════════════════════════════════════════════════════════
              2. 👥 USERS PAGE
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "users" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                      <Users className="w-6 h-6 text-sky-500" />
                      User Management & Directory
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Explore, filter by country and city, and download records for registered customers, business owners, and administrators.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportUsers("csv")}
                      disabled={isExportingUsers || isUsersLoading}
                      className="gap-1.5 text-xs font-bold shrink-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
                      title="Download filtered users roster in Excel/Spreadsheet CSV format"
                    >
                      <Download className={`w-3.5 h-3.5 ${isExportingUsers ? "animate-bounce" : ""}`} />
                      {isExportingUsers ? "Exporting…" : "Download CSV"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportUsers("json")}
                      disabled={isExportingUsers || isUsersLoading}
                      className="gap-1.5 text-xs font-bold shrink-0 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 shadow-xs"
                      title="Download filtered users roster in JSON format"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Download JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchUsers(userPage, true)}
                      disabled={isSyncingClerk || isUsersLoading}
                      className="gap-1.5 text-xs font-bold shrink-0 border-border hover:bg-muted"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncingClerk ? "animate-spin text-primary" : ""}`} />
                      {isSyncingClerk ? "Syncing…" : "Sync Clerk"}
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => setIsAssignGeoModalOpen(true)}
                        className="gap-1 text-xs font-bold shrink-0"
                        title="Assign or Appoint Territory Admin with Clerk Dashboard Sync"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        New Admin
                      </Button>
                    )}
                  </div>
                </div>

                {/* Modern Filter Controls Bar */}
                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email, phone, role…"
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setUserPage(1);
                        }}
                        className="pl-8 text-xs h-9 bg-background/60"
                      />
                    </div>

                    {/* Country Filter Dropdown */}
                    <div className="relative min-w-[170px]">
                      <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select
                        value={userFilterCountry}
                        onChange={(e) => {
                          setUserFilterCountry(e.target.value);
                          setUserFilterCity("all");
                          setUserPage(1);
                        }}
                        className="w-full h-9 pl-8 pr-7 text-xs rounded-xl bg-background/60 border border-border text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer appearance-none"
                      >
                        <option value="all">🌍 All Countries</option>
                        {COUNTRIES_WITH_CITIES.map((c) => (
                          <option key={c.name} value={c.name}>
                            {c.flag} {c.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                    </div>

                    {/* City Filter Dropdown */}
                    <div className="relative min-w-[170px]">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      <select
                        value={userFilterCity}
                        onChange={(e) => {
                          setUserFilterCity(e.target.value);
                          setUserPage(1);
                        }}
                        className="w-full h-9 pl-8 pr-7 text-xs rounded-xl bg-background/60 border border-border text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer appearance-none"
                      >
                        <option value="all">📍 All Cities</option>
                        {userFilterCities.map((cityName) => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                        {userFilterCountry === "all" && (
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
                      <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                    </div>

                    {/* Clear Filters Button */}
                    {(userFilterCountry !== "all" || userFilterCity !== "all" || userSearch.trim()) && (
                      <button
                        onClick={() => {
                          setUserFilterCountry("all");
                          setUserFilterCity("all");
                          setUserSearch("");
                          setUserPage(1);
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors shrink-0"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>

                  {/* Summary counter */}
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {userTotalCount || usersList.length} total user{userTotalCount === 1 ? "" : "s"}
                    </span>
                    {(userFilterCountry !== "all" || userFilterCity !== "all") && (
                      <span className="text-[11px] font-medium text-primary">
                        ({userFilterCity !== "all" ? `${userFilterCity}, ` : ""}{userFilterCountry !== "all" ? userFilterCountry : ""})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Subnav Filter Badges */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {[
                  { key: "all", label: "All Users", count: userCounts.all || userTotalCount || usersList.length },
                  { key: "customers", label: "Customers", count: userCounts.customers },
                  { key: "owners", label: "Business Owners", count: userCounts.owners },
                  {
                    key: "admins",
                    label: "Administrators",
                    count: userCounts.admins,
                  },
                  { key: "suspended", label: "Suspended", count: userCounts.suspended },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveSubnav(tab.key);
                      setUserPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                      activeSubnav === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card text-muted-foreground border border-border hover:border-foreground/30"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        activeSubnav === tab.key
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Users Table Card */}
              <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm relative">
                {isUsersLoading && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-xs z-10 flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl shadow border border-border text-xs font-bold text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading users from Clerk & DB…</span>
                    </div>
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                      <tr>
                        <th className="px-6 py-3.5">User</th>
                        <th className="px-6 py-3.5">Email</th>
                        <th className="px-6 py-3.5">Role</th>
                        <th className="px-6 py-3.5">Territory</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5">Joined</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {filteredUsersList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                            {isUsersLoading ? "Loading users…" : "No users found matching current filters."}
                          </td>
                        </tr>
                      ) : (
                        filteredUsersList.map((u) => (
                          <tr key={u.id} className="hover:bg-accent/30 transition-colors">
                            <td className="px-6 py-3.5 font-bold text-foreground">
                              <div className="flex items-center gap-2.5">
                                {u.avatarUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={u.avatarUrl}
                                    alt={u.name}
                                    className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 text-primary font-black text-xs flex items-center justify-center border border-primary/20 shrink-0">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-foreground">{u.name}</span>
                                    {u.isClerkSynced && (
                                      <span title="Clerk Verified User" className="text-[10px] text-emerald-500 font-bold">
                                        ✓
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[10px] text-muted-foreground font-mono">
                                    {u.id.startsWith("user_") ? u.id.slice(0, 14) + "…" : u.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-3.5 text-muted-foreground font-mono">{u.email}</td>
                            <td className="px-6 py-3.5">
                              {u.role === "super_admin" ? (
                                <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/30 text-[10px] font-bold gap-1">
                                  <Crown className="w-3 h-3 text-purple-500" />
                                  Super Admin
                                </Badge>
                              ) : u.role === "country_admin" ? (
                                <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/30 text-[10px] font-bold gap-1">
                                  <Globe className="w-3 h-3 text-blue-500" />
                                  Country Lead
                                </Badge>
                              ) : u.role === "city_admin" || u.role === "admin" ? (
                                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-[10px] font-bold gap-1">
                                  <Shield className="w-3 h-3 text-amber-500" />
                                  City Admin
                                </Badge>
                              ) : u.role === "owner" ? (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 text-[10px] font-bold gap-1">
                                  <Building2 className="w-3 h-3 text-emerald-500" />
                                  Business Owner
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-[10px] text-muted-foreground capitalize">
                                  Customer
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                                <span>{u.city ? `${u.city}, ${u.country}` : u.country || "Global"}</span>
                              </div>
                            </td>
                            <td className="px-6 py-3.5">
                              <Badge
                                className={
                                  u.status === "active"
                                    ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold"
                                    : "bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold"
                                }
                              >
                                {u.status === "active" ? "🟢 Active" : "🔴 Suspended"}
                              </Badge>
                            </td>
                            <td className="px-6 py-3.5 text-muted-foreground">{u.joinedAt}</td>
                            <td className="px-6 py-3.5 text-right space-x-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setViewingUser(u)}
                                className="h-7 text-[11px] font-semibold"
                              >
                                View Profile
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleToggleUser(u.id, u.status)}
                                className={`h-7 text-[11px] font-semibold ${
                                  u.status === "active"
                                    ? "text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                                    : "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20"
                                }`}
                              >
                                {u.status === "active" ? "Suspend" : "Activate"}
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 20 Per Page Pagination Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/20 border-t border-border text-xs">
                  <div className="text-muted-foreground font-medium">
                    Showing{" "}
                    <span className="font-bold text-foreground">
                      {userTotalCount === 0 ? 0 : (userPage - 1) * 20 + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-foreground">
                      {Math.min(userPage * 20, userTotalCount || usersList.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-foreground">{userTotalCount || usersList.length}</span> registered users (20 per page)
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newPage = Math.max(1, userPage - 1);
                        setUserPage(newPage);
                        fetchUsers(newPage, false);
                      }}
                      disabled={userPage <= 1 || isUsersLoading}
                      className="h-8 px-3 text-xs font-semibold gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, userTotalPages) }, (_, i) => {
                        let pageNum = i + 1;
                        if (userTotalPages > 5 && userPage > 3) {
                          pageNum = Math.min(userTotalPages - 4 + i, Math.max(1, userPage - 2 + i));
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => {
                              setUserPage(pageNum);
                              fetchUsers(pageNum, false);
                            }}
                            disabled={isUsersLoading}
                            className={`w-8 h-8 rounded-lg font-bold transition-all text-xs flex items-center justify-center ${
                              userPage === pageNum
                                ? "bg-primary text-primary-foreground shadow-sm"
                                : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      {userTotalPages > 5 && userPage < userTotalPages - 2 && (
                        <span className="px-1 text-muted-foreground font-bold">…</span>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const newPage = Math.min(userTotalPages, userPage + 1);
                        setUserPage(newPage);
                        fetchUsers(newPage, false);
                      }}
                      disabled={userPage >= userTotalPages || isUsersLoading}
                      className="h-8 px-3 text-xs font-semibold gap-1"
                    >
                      Next
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              3. 🏢 BUSINESSES PAGE
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "businesses" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-primary" />
                      Businesses Ecosystem
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Explore, filter by country and city, and download global listings with verified records and live MongoDB synchronization.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Export Buttons */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportBusinesses("csv")}
                      disabled={isExportingBusinesses || isBizLoading}
                      className="gap-1.5 text-xs font-bold shrink-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
                      title="Download filtered businesses in Excel/Spreadsheet CSV format"
                    >
                      <Download className={`w-3.5 h-3.5 ${isExportingBusinesses ? "animate-bounce" : ""}`} />
                      {isExportingBusinesses ? "Exporting…" : "Download CSV"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportBusinesses("json")}
                      disabled={isExportingBusinesses || isBizLoading}
                      className="gap-1.5 text-xs font-bold shrink-0 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 shadow-xs"
                      title="Download filtered businesses in JSON format"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Download JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => fetchBusinesses(bizPage)}
                      disabled={isBizLoading}
                      className="gap-1.5 text-xs font-bold shrink-0 border-border hover:bg-muted"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isBizLoading ? "animate-spin text-primary" : ""}`} />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      variant="gradient"
                      onClick={() => setIsAddBusinessModalOpen(true)}
                      className="gap-1 text-xs font-bold shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add Business
                    </Button>
                  </div>
                </div>

                {/* Modern Filter Controls Bar */}
                <div className="p-4 rounded-2xl bg-card border border-border shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search listings by name, category, subcity, street…"
                        value={businessSearch}
                        onChange={(e) => {
                          setBusinessSearch(e.target.value);
                          setBizPage(1);
                        }}
                        className="pl-8 text-xs h-9 bg-background/60"
                      />
                    </div>

                    {/* Country Filter Dropdown */}
                    <div className="relative min-w-[170px]">
                      <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      {isCountryAdmin || isCityAdmin ? (
                        <div className="w-full h-9 pl-8 pr-3 text-xs rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-foreground font-bold flex items-center gap-1.5 shadow-inner">
                          <span>🌍</span>
                          <span className="truncate">{geoSelectedCountry}</span>
                          <span className="text-[10px] text-indigo-400 font-semibold">(National)</span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={bizFilterCountry}
                            onChange={(e) => {
                              setBizFilterCountry(e.target.value);
                              setBizFilterCity("all");
                              setBizPage(1);
                            }}
                            className="w-full h-9 pl-8 pr-7 text-xs rounded-xl bg-background/60 border border-border text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer appearance-none"
                          >
                            <option value="all">🌍 All Countries</option>
                            {COUNTRIES_WITH_CITIES.map((c) => (
                              <option key={c.name} value={c.name}>
                                {c.flag} {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                        </>
                      )}
                    </div>

                    {/* City Filter Dropdown */}
                    <div className="relative min-w-[170px]">
                      <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      {isCityAdmin ? (
                        <div className="w-full h-9 pl-8 pr-3 text-xs rounded-xl bg-sky-950/40 border border-sky-500/30 text-foreground font-bold flex items-center gap-1.5 shadow-inner">
                          <span>🏙️</span>
                          <span className="truncate">{geoSelectedCity || "Addis Ababa"}</span>
                          <span className="text-[10px] text-sky-400 font-semibold">(City)</span>
                        </div>
                      ) : (
                        <>
                          <select
                            value={bizFilterCity}
                            onChange={(e) => {
                              setBizFilterCity(e.target.value);
                              setBizPage(1);
                            }}
                            className="w-full h-9 pl-8 pr-7 text-xs rounded-xl bg-background/60 border border-border text-foreground font-medium focus:ring-2 focus:ring-primary focus:outline-none transition-all cursor-pointer appearance-none"
                          >
                            <option value="all">📍 All Cities {isCountryAdmin ? `in ${geoSelectedCountry}` : ""}</option>
                            {bizFilterCities.map((cityName) => (
                              <option key={cityName} value={cityName}>
                                {cityName}
                              </option>
                            ))}
                            {!isCountryAdmin && bizFilterCountry === "all" && (
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
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none opacity-60" />
                        </>
                      )}
                    </div>

                    {/* Clear Filters Button */}
                    {(bizFilterCountry !== "all" || bizFilterCity !== "all" || businessSearch.trim()) && (
                      <button
                        onClick={() => {
                          setBizFilterCountry("all");
                          setBizFilterCity("all");
                          setBusinessSearch("");
                          setBizPage(1);
                        }}
                        className="px-2.5 py-1.5 rounded-xl border border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-bold transition-colors shrink-0"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>

                  {/* Summary counter */}
                  <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>
                      {bizTotalCount || businesses.length} business{(bizTotalCount || businesses.length) === 1 ? "" : "es"}
                    </span>
                    {(bizFilterCountry !== "all" || bizFilterCity !== "all") && (
                      <span className="text-[11px] font-medium text-primary">
                        ({bizFilterCity !== "all" ? `${bizFilterCity}, ` : ""}{bizFilterCountry !== "all" ? bizFilterCountry : ""})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Subnav tabs using real server counts */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                {[
                  { key: "all", label: "All Businesses", count: bizCounts.all || bizTotalCount },
                  { key: "four_month_audit", label: "⏱️ 4-Month Audit & Subscription Hub", alert: true },
                  { key: "new", label: "+ New Listing Wizard" },
                  { key: "pending_confirmations", label: "🔔 Pending Confirmations", count: bizCounts.pending, alert: (bizCounts.pending ?? 0) > 0 },
                  { key: "pending", label: "Pending Approval", count: bizCounts.pending },
                  { key: "verified", label: "Verified", count: bizCounts.verified },
                  { key: "rejected", label: "Rejected", count: bizCounts.rejected },
                  { key: "suspended", label: "Suspended", count: bizCounts.suspended },
                  { key: "claimed", label: "Claimed", count: bizCounts.claimed },
                  { key: "reports", label: "Business Reports" },
                ].map((tab: any) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      setActiveSubnav(tab.key);
                      setBizPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs flex items-center gap-1.5 ${
                      activeSubnav === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : tab.alert
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-500/15 animate-pulse-subtle"
                        : "bg-card text-muted-foreground border border-border hover:border-foreground/30"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          activeSubnav === tab.key
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : tab.alert
                            ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeSubnav === "four_month_audit" ? (
                /* ── ⏱️ 4-Month Automated Audit & Subscription Hub ─────────── */
                <FourMonthAuditHub
                  initialCountry={geoSelectedCountry !== "all" ? geoSelectedCountry : (bizFilterCountry !== "all" ? bizFilterCountry : undefined)}
                  initialCity={geoSelectedCity !== "all" ? geoSelectedCity : (bizFilterCity !== "all" ? bizFilterCity : undefined)}
                />
              ) : activeSubnav === "pending_confirmations" ? (
                /* ── 🔔 Pending Confirmation Queue ──────────────────────────── */
                <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-sm">
                  <PendingConfirmationsQueue
                    role={isSuperAdmin ? "super_admin" : (currentRole as any)}
                    filterCountry={geoSelectedCountry !== "all" ? geoSelectedCountry : undefined}
                    filterCity={geoSelectedCity !== "all" ? geoSelectedCity : undefined}
                    onApproved={() => { fetchBusinesses(bizPage); }}
                  />
                </div>
              ) : activeSubnav === "new" ? (
                <div className="p-4 sm:p-6 rounded-3xl bg-card border border-border shadow-sm">
                  <EmbeddedListingWizard
                    mode="embedded"
                    isAdmin={true}
                    redirectPath={null}
                    categories={categories}
                    onSuccess={(newBizId) => {
                      fetchBusinesses(1);
                      setBizPage(1);
                      setActiveSubnav("all");
                      toast.success("Business listing created and synchronized successfully!");
                    }}
                    onCancel={() => {
                      setActiveSubnav("all");
                    }}
                  />
                </div>
              ) : activeSubnav === "reports" ? (
                <div className="space-y-3">
                  {[
                    { id: "br-1", business: "Crypto Exchange Bole", reason: "Fraud / Unlicensed Financial Activity", reporter: "Abebe T.", date: "Aug 27", status: "Under Review" },
                    { id: "br-2", business: "Fake Hotel Listing", reason: "Impersonating verified business", reporter: "Sara K.", date: "Aug 25", status: "Investigation" },
                  ].map((r) => (
                    <div key={r.id} className="p-5 rounded-3xl bg-card border border-border space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-foreground text-sm">{r.business}</h4>
                        <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">{r.status}</Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">Reason: <strong className="text-foreground">{r.reason}</strong> • Reported by: {r.reporter} • {r.date}</div>
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                        <Button size="sm" variant="outline" onClick={() => toast.success("Report dismissed")} className="text-xs">Dismiss</Button>
                        <Button size="sm" variant="gradient" onClick={() => toast.success("Business suspended and reporter notified.")} className="text-xs">Resolve & Penalize</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm relative">
                  {isBizLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-xs z-10 flex items-center justify-center">
                      <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl shadow border border-border text-xs font-bold text-muted-foreground">
                        <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                        <span>Loading businesses from database…</span>
                      </div>
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                        <tr>
                          <th className="px-6 py-3.5">Business</th>
                          <th className="px-6 py-3.5">Category</th>
                          <th className="px-6 py-3.5">Location</th>
                          <th className="px-6 py-3.5">Verification</th>
                          <th className="px-6 py-3.5">Rating</th>
                          <th className="px-6 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {businesses.length === 0 && !isBizLoading ? (
                          <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No businesses match this filter.</td></tr>
                        ) : businesses.map((b) => (
                          <tr key={b.id} className="hover:bg-accent/30 transition-colors">
                            <td className="px-6 py-3.5 font-bold text-foreground">
                              {b.name}
                              <div className="text-[10px] text-muted-foreground font-mono">{b.id.length > 14 ? b.id.slice(0, 14) + "…" : b.id}</div>
                            </td>
                            <td className="px-6 py-3.5 text-muted-foreground">{b.categoryName || (b as any).category || "General Business"}</td>
                            <td className="px-6 py-3.5 text-muted-foreground">{b.cityName || (b as any).city || "Addis Ababa"}, {b.countryName || (b as any).country || "Ethiopia"}</td>
                            <td className="px-6 py-3.5">
                              {b.approvalStatus === "pending_city" && (
                                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                                  ⏳ Stage 1: City Review
                                </Badge>
                              )}
                              {b.approvalStatus === "pending_country" && (
                                <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                                  ⏳ Stage 2: Country Lead
                                </Badge>
                              )}
                              {b.approvalStatus === "pending_super_admin" && (
                                <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 text-[10px] font-bold">
                                  ⏳ Stage 3: Super Admin Sign-off
                                </Badge>
                              )}
                              {(b.approvalStatus === "approved" || b.isVerified) && (
                                <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                                  ✅ Live & Verified
                                </Badge>
                              )}
                              {(b.approvalStatus === "rejected" || (b as any).verificationStatus === "rejected") && (
                                <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold">
                                  ❌ Rejected
                                </Badge>
                              )}
                              {!b.approvalStatus && !b.isVerified && (
                                <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px]">
                                  ⏳ Pending
                                </Badge>
                              )}
                            </td>
                            <td className="px-6 py-3.5 text-amber-500 font-bold">⭐ {(b.ratingAvg ?? (b as any).rating ?? 0).toFixed(1)}</td>
                            <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                              <Button size="sm" variant="outline" onClick={() => setInspectingBusiness(b)} className="h-7 text-[11px] font-semibold">View Details</Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingBusiness(b)} className="h-7 text-[11px] font-semibold">Edit</Button>
                              {b.approvalStatus !== "approved" && !b.isVerified ? (
                                <>
                                  <Button size="sm" variant="outline" onClick={() => handleApproveBusiness(b.id, b.name)} className="h-7 text-[11px] font-semibold text-emerald-600 border-emerald-500/30">
                                    Approve Stage
                                  </Button>
                                  <Button size="sm" onClick={() => handleSuperAdminOverride(b.id, b.name)} className="h-7 text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-xs" title="Super Admin Fast-Track: Approve & post immediately">
                                    ⚡ Fast-Track Post
                                  </Button>
                                </>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => handleRejectBusiness(b.id, b.name)} className="h-7 text-[11px] font-semibold text-red-600 border-red-500/30">Suspend</Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 20 Per Page Pagination Bar */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-muted/20 border-t border-border text-xs">
                    <div className="text-muted-foreground font-medium">
                      Showing{" "}
                      <span className="font-bold text-foreground">
                        {bizTotalCount === 0 ? 0 : (bizPage - 1) * 20 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-foreground">
                        {Math.min(bizPage * 20, bizTotalCount || businesses.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-foreground">{bizTotalCount || businesses.length}</span> businesses (20 per page)
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newPage = Math.max(1, bizPage - 1);
                          setBizPage(newPage);
                          fetchBusinesses(newPage);
                        }}
                        disabled={bizPage <= 1 || isBizLoading}
                        className="h-8 px-3 text-xs font-semibold gap-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, bizTotalPages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (bizTotalPages > 5 && bizPage > 3) {
                            pageNum = Math.min(bizTotalPages - 4 + i, Math.max(1, bizPage - 2 + i));
                          }
                          return (
                            <button
                              key={pageNum}
                              onClick={() => {
                                setBizPage(pageNum);
                                fetchBusinesses(pageNum);
                              }}
                              disabled={isBizLoading}
                              className={`w-8 h-8 rounded-lg font-bold transition-all text-xs flex items-center justify-center ${
                                bizPage === pageNum
                                  ? "bg-primary text-primary-foreground shadow-sm"
                                  : "bg-card text-muted-foreground border border-border hover:bg-muted hover:text-foreground"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {bizTotalPages > 5 && bizPage < bizTotalPages - 2 && (
                          <span className="px-1 text-muted-foreground font-bold">…</span>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newPage = Math.min(bizTotalPages, bizPage + 1);
                          setBizPage(newPage);
                          fetchBusinesses(newPage);
                        }}
                        disabled={bizPage >= bizTotalPages || isBizLoading}
                        className="h-8 px-3 text-xs font-semibold gap-1"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Business Modal */}
              <AddBusinessModal
                isOpen={isAddBusinessModalOpen}
                categories={categories}
                onClose={() => setIsAddBusinessModalOpen(false)}
                onBusinessCreated={() => {
                  setIsAddBusinessModalOpen(false);
                  fetchBusinesses(1);
                  setBizPage(1);
                  toast.success("Business listing created successfully!");
                }}
              />
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              4. 📂 CATEGORIES PAGE (Multi-Level Tree - 3 Per Page)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "categories" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header & Main Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-foreground flex items-center gap-2.5">
                    <FolderTree className="w-6 h-6 text-primary" />
                    <span>Category Taxonomy & Directory Tree</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Official database taxonomy registered directly to MongoDB. Kept at 3 industries per page for clean administrative oversight.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
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
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                  </Button>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => {
                      setDefaultParentForAdd(undefined);
                      setIsAddCatModalOpen(true);
                    }}
                    className="gap-1.5 text-xs font-bold shadow-md"
                  >
                    <Plus className="w-4 h-4" /> Register Category
                  </Button>
                </div>
              </div>

              {/* Navigation Subtabs & Live Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {renderSubnavTabs([
                  { key: "all", label: "All Industries & Trees", count: industryGroups.length },
                  { key: "industries", label: "Level 1 Industries", count: industryGroups.length },
                  { key: "subcategories", label: "Subcategories", count: categories.filter((c) => c.level > 1).length },
                  { key: "pending", label: "Pending Verification" },
                ])}

                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={catSearch}
                    onChange={(e) => {
                      setCatSearch(e.target.value);
                      setCatPage(1);
                    }}
                    placeholder="Search industries & subcategories..."
                    className="pl-8 text-xs h-9 rounded-xl bg-card border-border"
                  />
                  {catSearch && (
                    <button
                      onClick={() => {
                        setCatSearch("");
                        setCatPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Pending Tab */}
              {activeSubnav === "pending" ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <FolderTree className="w-10 h-10 mx-auto opacity-30 text-primary" />
                  <h3 className="font-bold text-foreground">No Pending Category Requests</h3>
                  <p className="text-xs max-w-md mx-auto">
                    All submitted business categories and taxonomy branches are verified and active in the system.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDefaultParentForAdd(undefined);
                      setIsAddCatModalOpen(true);
                    }}
                    className="text-xs font-bold mt-2"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Propose New Category Node
                  </Button>
                </div>
              ) : activeSubnav === "industries" ? (
                /* Level 1 Industries Grid */
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredIndustryGroups.map((ind) => (
                      <div
                        key={ind.id}
                        className="p-5 rounded-3xl bg-card border border-border hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                              <FolderTree className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground text-sm leading-tight">{ind.name}</h3>
                              <p className="text-[11px] text-muted-foreground font-mono">/{ind.slug}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            {ind.totalCount} items
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/60 pt-3">
                          <span className="text-xs text-muted-foreground font-medium">
                            {ind.categories.length} sub-branches
                          </span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setDefaultParentForAdd(ind.id);
                                setIsAddCatModalOpen(true);
                              }}
                              className="h-7 text-xs text-primary font-bold px-2 hover:bg-primary/10"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Child
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
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeSubnav === "subcategories" ? (
                /* Flat Subcategories Roster with Search */
                <div className="p-6 rounded-3xl bg-card border border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-sm">All Registered Subcategories</h3>
                      <p className="text-xs text-muted-foreground">Showing level 2 groups and level 3 specialty tags.</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {categories.filter((c) => c.level > 1).length} Registered
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {categories
                      .filter((c) => c.level > 1)
                      .filter((c) => !catSearch.trim() || c.name.toLowerCase().includes(catSearch.toLowerCase()))
                      .map((sub) => {
                        const parent = categories.find((p) => p.id === sub.parentId);
                        return (
                          <div
                            key={sub.id}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background border border-border hover:border-primary/40 text-xs transition-colors"
                          >
                            <span className="font-semibold text-foreground">{sub.name}</span>
                            {parent && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                ({parent.name})
                              </span>
                            )}
                            <button
                              onClick={() => setEditingCategory(sub)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity ml-1"
                              title="Edit Subcategory"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(sub.id, sub.name)}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                              title="Delete Subcategory"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                /* Multi-level Tree Cards — Exactly 3 Categories/Industries per Page with Pagination */
                <div className="space-y-6">
                  {filteredIndustryGroups.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-2">
                      <FolderTree className="w-8 h-8 mx-auto opacity-30 text-primary" />
                      <p className="font-bold text-foreground">No categories matched &quot;{catSearch}&quot;</p>
                      <p className="text-xs">Try adjusting your keyword or register a new category above.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setCatSearch("");
                          setCatPage(1);
                        }}
                        className="text-xs mt-2"
                      >
                        Reset Search Filter
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* List of 3 Industry Cards for Current Page */}
                      <div className="space-y-4">
                        {paginatedIndustries.map((ind) => (
                          <div
                            key={ind.id}
                            className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4 hover:border-primary/30 transition-colors"
                          >
                            {/* Industry Header Card */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-base shadow-sm">
                                  <FolderTree className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-foreground text-base">{ind.name}</h3>
                                    {ind.featured && (
                                      <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                                        Featured
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground font-mono">
                                    Slug: /{ind.slug} • Level 1 Industry
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs font-mono px-2.5 py-1">
                                  {ind.categories.length} Categories ({ind.totalCount} total nodes)
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDefaultParentForAdd(ind.id);
                                    setIsAddCatModalOpen(true);
                                  }}
                                  className="gap-1 text-xs font-bold text-primary border-primary/30 hover:bg-primary/10"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add Subcategory
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingCategory(ind)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                  title="Edit Industry"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteCategory(ind.id, ind.name)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                  title="Delete Industry & Children"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </div>

                            {/* Level 2 Categories & Level 3 Subcategories Grid */}
                            {ind.categories.length === 0 ? (
                              <div className="py-6 text-center text-xs text-muted-foreground rounded-2xl bg-muted/20 border border-dashed border-border/70 space-y-2">
                                <p>No subcategories registered yet under {ind.name}.</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setDefaultParentForAdd(ind.id);
                                    setIsAddCatModalOpen(true);
                                  }}
                                  className="text-xs font-bold gap-1"
                                >
                                  <Plus className="w-3 h-3" /> Register First Subcategory
                                </Button>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                {ind.categories.map((cat) => (
                                  <div
                                    key={cat.id}
                                    className="p-4 rounded-2xl bg-background border border-border hover:border-primary/40 transition-colors space-y-2.5 flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-start justify-between gap-1.5 pb-1">
                                        <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                                          <span>{cat.name}</span>
                                          <span className="text-[10px] text-muted-foreground font-mono">
                                            ({cat.subcats.length})
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-0.5">
                                          <button
                                            onClick={() => setEditingCategory(cat)}
                                            className="text-muted-foreground hover:text-primary p-1 transition-colors"
                                            title="Edit Category"
                                          >
                                            <Edit2 className="w-2.5 h-2.5" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                            className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                                            title="Delete Category"
                                          >
                                            <Trash2 className="w-2.5 h-2.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Level 3 Badges */}
                                      <div className="flex flex-wrap gap-1 pt-1">
                                        {cat.subcats.map((sub) => (
                                          <Badge
                                            key={sub.id}
                                            variant="secondary"
                                            className="text-[10px] font-normal group cursor-pointer hover:bg-primary/20 transition-colors flex items-center gap-1 py-0.5"
                                          >
                                            <span>{sub.name}</span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCategory(sub.id, sub.name);
                                              }}
                                              className="opacity-0 group-hover:opacity-100 hover:text-destructive"
                                              title="Remove"
                                            >
                                              ✕
                                            </button>
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Quick add level 3 specialty */}
                                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                                      <span className="text-muted-foreground font-mono text-[10px]">/{cat.slug}</span>
                                      <button
                                        onClick={() => {
                                          setDefaultParentForAdd(cat.id);
                                          setIsAddCatModalOpen(true);
                                        }}
                                        className="text-primary hover:underline font-bold text-[11px] flex items-center gap-0.5"
                                      >
                                        <Plus className="w-2.5 h-2.5" /> Specialty
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* ═══════════════════════════════════════════════════════
                          PAGINATION BAR (3 CATEGORIES / INDUSTRIES PER PAGE)
                         ═══════════════════════════════════════════════════════ */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Showing{" "}
                          <span className="font-bold text-foreground">
                            {(catPage - 1) * CATS_PER_PAGE + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-bold text-foreground">
                            {Math.min(catPage * CATS_PER_PAGE, filteredIndustryGroups.length)}
                          </span>{" "}
                          of{" "}
                          <span className="font-bold text-foreground">
                            {filteredIndustryGroups.length}
                          </span>{" "}
                          registered industries ({categories.length} total taxonomy nodes)
                        </div>

                        {/* Pagination Buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Previous Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={catPage <= 1}
                            onClick={() => setCatPage((p) => Math.max(1, p - 1))}
                            className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                          </Button>

                          {/* Page Number Buttons */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: catTotalPages }, (_, i) => i + 1).map((pageNum) => {
                              // Show first, last, and window around current page
                              if (
                                catTotalPages > 7 &&
                                Math.abs(pageNum - catPage) > 2 &&
                                pageNum !== 1 &&
                                pageNum !== catTotalPages
                              ) {
                                if (pageNum === 2 || pageNum === catTotalPages - 1) {
                                  return (
                                    <span key={pageNum} className="text-xs text-muted-foreground px-1 font-mono">
                                      ...
                                    </span>
                                  );
                                }
                                return null;
                              }

                              const isCurrent = pageNum === catPage;
                              return (
                                <Button
                                  key={pageNum}
                                  size="sm"
                                  variant={isCurrent ? "gradient" : "outline"}
                                  onClick={() => setCatPage(pageNum)}
                                  className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${
                                    isCurrent ? "shadow-sm" : ""
                                  }`}
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>

                          {/* Next Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={catPage >= catTotalPages}
                            onClick={() => setCatPage((p) => Math.min(catTotalPages, p + 1))}
                            className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                          >
                            <span>Next</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}


          {/* ════════════════════════════════════════════════════════════════════
              5. 📍 LOCATIONS & TERRITORY HIERARCHY
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "locations" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <TerritoryAdministrationView
                currentRole={geoScopeRole}
                currentCountry={geoSelectedCountry === "all" ? "Ethiopia" : geoSelectedCountry}
                currentCity={geoSelectedCity === "all" ? "Addis Ababa" : geoSelectedCity}
                onRoleChange={setGeoScopeRole}
                onCountryChange={setGeoSelectedCountry}
                onCityChange={setGeoSelectedCity}
              />
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              6. ⭐ REVIEWS PAGE (20 REVIEWS PER PAGE WITH PAGINATION)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "reviews" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">Reviews & Customer Feedback</h2>
                    <Badge variant="outline" className="text-xs font-mono border-amber-500/30 text-amber-600 bg-amber-500/10">
                      20 per page
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Moderate real customer reviews from all users across the platform, register verified ratings, and investigate flags.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search user, business, comment…"
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      className="pl-8 text-xs rounded-2xl"
                    />
                    {reviewSearch && (
                      <button
                        onClick={() => setReviewSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => setIsAddReviewModalOpen(true)}
                    className="gap-1.5 text-xs font-bold shadow-md shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Review</span>
                  </Button>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All Reviews", count: reviewCounts.all },
                { key: "pending", label: "Pending Reviews", count: reviewCounts.pending },
                { key: "reported", label: "Reported", count: reviewCounts.reported },
                { key: "removed", label: "Removed", count: reviewCounts.removed },
              ])}

              {isReviewsLoading ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">Loading actual reviews from database...</p>
                </div>
              ) : filteredReviews.length === 0 ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <Sparkles className="w-10 h-10 mx-auto opacity-30 text-amber-500" />
                  <p className="font-bold text-foreground">No reviews found</p>
                  <p className="text-xs text-muted-foreground">
                    {reviewSearch ? `No reviews matched "${reviewSearch}".` : "There are currently no reviews in this category."}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddReviewModalOpen(true)}
                    className="text-xs font-bold gap-1 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register First Review
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {filteredReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 rounded-3xl bg-card border border-border flex flex-col md:flex-row md:items-start justify-between gap-4 hover:border-primary/30 transition-all shadow-sm"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                              {rev.userName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-foreground text-xs">{rev.userName}</span>
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                                  Verified
                                </Badge>
                                <span className="text-muted-foreground text-xs">reviewed</span>
                                <span className="font-bold text-primary text-xs bg-primary/10 px-2 py-0.5 rounded-lg">
                                  {rev.businessName}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-amber-500 font-black text-xs tracking-wider">
                                  {"★".repeat(rev.rating)}{"☆".repeat(Math.max(0, 5 - rev.rating))}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">• {rev.date}</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-xs text-foreground/90 leading-relaxed pl-11">
                            &ldquo;{rev.content}&rdquo;
                          </p>

                          {rev.reply && (
                            <div className="ml-11 p-3 rounded-2xl bg-muted/40 border border-border text-xs space-y-0.5">
                              <div className="font-bold text-[11px] text-primary flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-primary" />
                                <span>Response from {rev.reply.ownerName}</span>
                              </div>
                              <p className="text-muted-foreground text-[11px] italic">
                                &ldquo;{rev.reply.comment}&rdquo;
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0 md:self-center pl-11 md:pl-0">
                          <Badge
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              rev.status === "published"
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                                : rev.status === "reported"
                                ? "bg-red-500/10 text-red-600 border border-red-500/30"
                                : rev.status === "pending"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                                : "bg-slate-500/10 text-slate-500 border border-slate-500/30"
                            }`}
                          >
                            {rev.status}
                          </Badge>

                          {rev.status === "reported" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewAction(rev.id, "approve")}
                                className="h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-bold"
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewAction(rev.id, "delete")}
                                className="h-7 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10 font-bold"
                              >
                                Delete
                              </Button>
                            </>
                          ) : rev.status === "removed" ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewAction(rev.id, "restore")}
                                className="h-7 text-xs text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10 font-bold"
                              >
                                Restore
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewAction(rev.id, "delete")}
                                className="h-7 text-xs text-red-600 border-red-500/30 hover:bg-red-500/10 font-bold"
                              >
                                Delete
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewAction(rev.id, "hide")}
                                className="h-7 text-xs text-muted-foreground hover:text-foreground font-bold"
                              >
                                Hide
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReviewAction(rev.id, "delete")}
                                className="h-7 text-xs text-destructive hover:bg-destructive/10 font-bold"
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
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
                        onClick={() => {
                          const newPage = Math.max(1, reviewPage - 1);
                          setReviewPage(newPage);
                          fetchReviews(newPage);
                        }}
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
                                  onClick={() => {
                                    setReviewPage(pageNum);
                                    fetchReviews(pageNum);
                                  }}
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
                        onClick={() => {
                          const newPage = Math.min(reviewTotalPages, reviewPage + 1);
                          setReviewPage(newPage);
                          fetchReviews(newPage);
                        }}
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
              7. 📸 MEDIA PAGE
             ════════════════════════════════════════════════════════════════════ */}
          {/* ════════════════════════════════════════════════════════════════════
              7. 📸 MEDIA ASSETS & MODERATION (10 PER PAGE WITH PAGINATION)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "media" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header & Main Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">Media Assets & Moderation</h2>
                    <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary bg-primary/10">
                      10 per page
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Register, moderate, and inspect business cover photos, logos, interior galleries, and promotional video showcases.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsRegisterMediaModalOpen(true)}
                    className="gap-1.5 text-xs font-bold shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Upload & Register Media</span>
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 bg-card p-3 rounded-2xl border border-border shadow-sm">
                <div className="relative flex-1 w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search media by title, business name, or uploader..."
                    value={mediaSearch}
                    onChange={(e) => {
                      setMediaSearch(e.target.value);
                      setMediaPage(1);
                    }}
                    className="text-xs pl-8 bg-background border-border"
                  />
                </div>
                <div className="text-xs text-muted-foreground font-mono shrink-0">
                  Total: <span className="font-bold text-foreground">{mediaTotalCount}</span> assets
                </div>
              </div>

              {/* Subnav Filter Tabs with Live Counts */}
              {renderSubnavTabs([
                { key: "all", label: "All Assets", count: mediaCounts.all || mediaTotalCount },
                { key: "photos", label: "Photos & Logos", count: mediaCounts.photos },
                { key: "videos", label: "Videos", count: mediaCounts.videos },
                { key: "covers", label: "Cover Headers", count: mediaCounts.covers },
                { key: "pending", label: "Pending Approval", count: mediaCounts.pending },
                { key: "reported", label: "Reported Media", count: mediaCounts.reported },
              ])}

              {/* Content Grid */}
              {isMediaLoading ? (
                <div className="p-16 rounded-3xl bg-card border border-border text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">Loading media assets from database...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="p-16 rounded-3xl bg-card border border-border text-center space-y-4">
                  <Camera className="w-12 h-12 mx-auto text-muted-foreground/40" />
                  <div>
                    <h3 className="text-base font-bold text-foreground">No media assets found</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mediaSearch
                        ? `No results matching "${mediaSearch}". Try a different keyword.`
                        : "There are no media items in this category yet."}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsRegisterMediaModalOpen(true)}
                    className="text-xs gap-1.5 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register First Media Asset
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Exactly 10 items rendered per page in responsive grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredMedia.map((m: any) => {
                      const isVid =
                        m.type === "Video" ||
                        Boolean(m.youtubeId) ||
                        isYoutubeUrl(m.url);
                      const displayThumb = isVid
                        ? (m.thumbnailUrl || getYoutubeThumbnail(m.youtubeId || m.url))
                        : m.url;

                      return (
                        <div
                          key={m.id}
                          className="group relative rounded-3xl bg-card border border-border overflow-hidden shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col justify-between"
                        >
                          {/* Visual Thumbnail */}
                          <div
                            onClick={() => setLightboxMedia(m)}
                            className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={displayThumb}
                              alt={m.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />

                            {/* Type and Video Overlay */}
                            <div className="absolute top-2.5 left-2.5">
                              <Badge className={isVid ? "bg-red-600 text-white text-[10px] border-none font-bold" : "bg-black/70 backdrop-blur-md text-white text-[10px] border-white/20 capitalize font-bold"}>
                                {isVid ? "Video Tour" : m.type}
                              </Badge>
                            </div>

                            {isVid && (
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                                <div className="w-10 h-10 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  <Play className="w-4 h-4 fill-white ml-0.5" />
                                </div>
                              </div>
                            )}

                            {/* Quick Preview Hint */}
                            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[10px] bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md font-medium">
                                Click to Inspect
                              </span>
                            </div>
                          </div>

                          {/* Media Details */}
                          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-bold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                  {m.title}
                                </h4>
                                <Badge
                                  className={
                                    m.status === "Approved"
                                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[9px] font-bold"
                                      : m.status === "Reported"
                                      ? "bg-red-500/10 text-red-600 border border-red-500/20 text-[9px] font-bold"
                                      : "bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[9px] font-bold"
                                  }
                                >
                                  {m.status || "Approved"}
                                </Badge>
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 line-clamp-1">
                                <Building2 className="w-3 h-3 text-primary shrink-0" />
                                <span>{m.businessName || "Platform Asset"}</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                Uploaded by <span className="font-semibold text-foreground">{m.uploadedBy || "Admin"}</span>
                              </div>
                            </div>

                            {/* Card Moderation Actions */}
                            <div className="flex items-center justify-between pt-3 border-t border-border mt-3 gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setLightboxMedia(m)}
                                className="h-6 text-[10px] px-2 font-bold hover:bg-primary/10 hover:text-primary"
                              >
                                View
                              </Button>

                              <div className="flex items-center gap-1">
                                {m.status !== "Approved" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleApproveMedia(m.id)}
                                    className="h-6 text-[10px] px-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-bold"
                                  >
                                    Approve
                                  </Button>
                                )}
                                {m.status !== "Reported" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleReportMedia(m.id)}
                                    className="h-6 text-[10px] px-1.5 text-amber-500 hover:bg-amber-500/10"
                                    title="Flag as Reported"
                                  >
                                    <Flag className="w-3 h-3" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm(`Remove "${m.title}"?`)) handleDeleteMedia(m.id);
                                  }}
                                  className="h-6 text-[10px] px-1.5 text-red-500 hover:bg-red-500/10"
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

                  {/* ─────────────────────────────────────────────────────────────
                      10 AT ONE PAGE PAGINATION BUTTON CONTROLS
                     ───────────────────────────────────────────────────────────── */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border shadow-sm">
                    <div className="text-xs text-muted-foreground">
                      Showing{" "}
                      <span className="font-bold text-foreground">
                        {mediaTotalCount === 0 ? 0 : (mediaPage - 1) * 10 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-foreground">
                        {Math.min(mediaPage * 10, mediaTotalCount)}
                      </span>{" "}
                      of <span className="font-bold text-foreground">{mediaTotalCount}</span> media items
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono mr-2">
                        Page {mediaPage} of {mediaTotalPages}
                      </span>

                      {/* Previous Page Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={mediaPage <= 1}
                        onClick={() => {
                          const prev = Math.max(1, mediaPage - 1);
                          setMediaPage(prev);
                          fetchMedia(prev);
                        }}
                        className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </Button>

                      {/* Numbered Page Buttons */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, mediaTotalPages) }, (_, i) => {
                          let pageNum = i + 1;
                          if (mediaTotalPages > 5 && mediaPage > 3) {
                            pageNum = mediaPage - 3 + i;
                            if (pageNum > mediaTotalPages) pageNum = mediaTotalPages - (4 - i);
                          }
                          return (
                            <Button
                              key={pageNum}
                              size="sm"
                              variant={mediaPage === pageNum ? "default" : "outline"}
                              onClick={() => {
                                setMediaPage(pageNum);
                                fetchMedia(pageNum);
                              }}
                              className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${
                                mediaPage === pageNum ? "bg-primary text-white shadow-sm" : ""
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
                        disabled={mediaPage >= mediaTotalPages}
                        onClick={() => {
                          const next = Math.min(mediaTotalPages, mediaPage + 1);
                          setMediaPage(next);
                          fetchMedia(next);
                        }}
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
              8. 📢 ADVERTISEMENTS PAGE — Real MongoDB Ad Campaigns
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "advertisements" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">Advertisements &amp; Sponsored Campaigns</h2>
                    <Badge variant="outline" className="text-xs font-mono border-teal-500/30 text-teal-600 bg-teal-500/10">
                      20 per page
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Manage all advertiser campaigns, impressions, budgets, placements and approve or pause ads platform-wide.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => { setActiveSubnav("create"); }}
                  className="gap-1.5 text-xs font-bold shadow-md shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Ad Campaign</span>
                </Button>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "All Campaigns", count: adCounts.all },
                { key: "create", label: "➕ Register New" },
                { key: "active", label: "Active", count: adCounts.active },
                { key: "paused", label: "Paused", count: adCounts.paused },
                { key: "scheduled", label: "Scheduled", count: adCounts.scheduled },
                { key: "completed", label: "Completed", count: adCounts.completed },
              ])}

              {activeSubnav === "create" ? (
                /* ─── Create Campaign Form ─────────────────────────────────── */
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm max-w-2xl">
                  <h3 className="font-black text-base text-foreground flex items-center gap-2 mb-5">
                    <Megaphone className="w-5 h-5 text-teal-500" />
                    Register New Ad Campaign to Database
                  </h3>
                  <form onSubmit={handleAdCampaignCreate} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-foreground block mb-1.5">Campaign Title <span className="text-red-500">*</span></label>
                        <Input
                          required
                          value={adFormName}
                          onChange={(e) => setAdFormName(e.target.value)}
                          placeholder="e.g. Meskel Holiday Dining Rush Promo"
                          className="text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-foreground block mb-1.5">Advertiser Business Name <span className="text-red-500">*</span></label>
                        <Input
                          required
                          value={adFormBizName}
                          onChange={(e) => setAdFormBizName(e.target.value)}
                          placeholder="e.g. Kategna Ethiopian Restaurant"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-foreground block mb-1.5">Ad Placement</label>
                        <select
                          value={adFormPlacement}
                          onChange={(e) => setAdFormPlacement(e.target.value as AdminAdCampaign["placement"])}
                          className="w-full h-10 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="search_top">🔝 Search Top #1 Sponsor</option>
                          <option value="home_hero">🏠 Home Hero Banner</option>
                          <option value="category_spotlight">💡 Category Spotlight</option>
                          <option value="map_highlight">📍 Map Pin Highlight</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-bold text-foreground block mb-1.5">Target Location</label>
                        <Input
                          value={adFormLocation}
                          onChange={(e) => setAdFormLocation(e.target.value)}
                          placeholder="e.g. Bole, Addis Ababa"
                          className="text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="font-bold text-foreground block mb-1.5">Daily Budget (ETB)</label>
                        <Input
                          type="number"
                          min="100"
                          step="50"
                          value={adFormBudget}
                          onChange={(e) => setAdFormBudget(Number(e.target.value))}
                          className="text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-foreground block mb-1.5">Duration (Days)</label>
                        <Input
                          type="number"
                          min="1"
                          max="365"
                          value={adFormDuration}
                          onChange={(e) => setAdFormDuration(Number(e.target.value))}
                          className="text-xs font-mono"
                        />
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-800 text-xs text-teal-700 dark:text-teal-300">
                      📢 Ad campaigns registered here will immediately appear in the active campaigns list and may be shown on sponsored placements platform-wide.
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveSubnav("all")}
                        className="text-xs font-bold"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="gradient"
                        size="sm"
                        disabled={isAdFormSaving}
                        className="gap-1.5 text-xs font-bold"
                      >
                        {isAdFormSaving ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Megaphone className="w-3.5 h-3.5" />
                        )}
                        {isAdFormSaving ? "Registering…" : "Register Campaign to Database"}
                      </Button>
                    </div>
                  </form>
                </div>
              ) : isAdsLoading ? (
                /* ─── Loading State ─────────────────────────────────────────── */
                <div className="p-16 rounded-3xl bg-card border border-border text-center space-y-3">
                  <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground font-medium">Loading ad campaigns from database...</p>
                </div>
              ) : adCampaignsList.length === 0 ? (
                /* ─── Empty State ────────────────────────────────────────────── */
                <div className="p-16 rounded-3xl bg-card border border-dashed border-border text-center space-y-3">
                  <Megaphone className="w-10 h-10 mx-auto text-muted-foreground/30" />
                  <p className="font-bold text-foreground">No campaigns found</p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    {activeSubnav !== "all" ? `No ${activeSubnav} campaigns at this time.` : "No ad campaigns registered yet. Create the first one!"}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveSubnav("create")}
                    className="text-xs font-bold gap-1 mt-2"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register First Campaign
                  </Button>
                </div>
              ) : (
                /* ─── Live Campaigns Table ──────────────────────────────────── */
                <div className="space-y-4">
                  <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-black border-b border-border">
                          <tr>
                            <th className="px-5 py-3.5">Campaign</th>
                            <th className="px-5 py-3.5">Advertiser</th>
                            <th className="px-5 py-3.5">Placement</th>
                            <th className="px-5 py-3.5">Location</th>
                            <th className="px-5 py-3.5">Daily Budget</th>
                            <th className="px-5 py-3.5">Impressions</th>
                            <th className="px-5 py-3.5">Clicks</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 font-medium">
                          {adCampaignsList.map((camp) => {
                            const statusColors: Record<string, string> = {
                              active: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
                              paused: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
                              scheduled: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
                              completed: "bg-slate-500/10 text-slate-500 border border-slate-500/20",
                            };
                            const placementLabels: Record<string, string> = {
                              search_top: "🔝 Search Top",
                              home_hero: "🏠 Home Hero",
                              category_spotlight: "💡 Category",
                              map_highlight: "📍 Map Pin",
                            };
                            const ctr = camp.impressions > 0
                              ? ((camp.clicks / camp.impressions) * 100).toFixed(1)
                              : "0.0";
                            return (
                              <tr key={camp.id} className="hover:bg-accent/20 transition-colors">
                                <td className="px-5 py-4">
                                  <div className="font-bold text-foreground text-xs">{camp.name}</div>
                                  <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{camp.id.slice(0, 18)}…</div>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="font-semibold text-foreground">{camp.businessName}</div>
                                </td>
                                <td className="px-5 py-4">
                                  <span className="text-[11px] font-bold text-primary">
                                    {placementLabels[camp.placement] ?? camp.placement}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-muted-foreground">
                                  {camp.targetLocation}
                                </td>
                                <td className="px-5 py-4">
                                  <span className="font-black text-emerald-600">{camp.dailyBudgetETB.toLocaleString()} ETB</span>
                                </td>
                                <td className="px-5 py-4 font-mono">
                                  {camp.impressions.toLocaleString()}
                                </td>
                                <td className="px-5 py-4">
                                  <div className="font-mono">{camp.clicks.toLocaleString()}</div>
                                  <div className="text-[10px] text-primary font-bold">{ctr}% CTR</div>
                                </td>
                                <td className="px-5 py-4">
                                  <Badge className={`text-[10px] font-bold uppercase tracking-wide ${statusColors[camp.status] ?? ""}`}>
                                    {camp.status}
                                  </Badge>
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {camp.status === "active" ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAdStatusChange(camp.id, "paused")}
                                        className="h-7 text-[10px] font-bold text-amber-600 border-amber-500/30 hover:bg-amber-500/10"
                                      >
                                        Pause
                                      </Button>
                                    ) : camp.status === "paused" ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAdStatusChange(camp.id, "active")}
                                        className="h-7 text-[10px] font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                      >
                                        Resume
                                      </Button>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAdStatusChange(camp.id, "active")}
                                        className="h-7 text-[10px] font-bold text-blue-600 border-blue-500/30 hover:bg-blue-500/10"
                                      >
                                        Activate
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteAdCampaign(camp.id, camp.name)}
                                      className="h-7 w-7 p-0 text-red-500 hover:bg-red-500/10 rounded-lg"
                                      title="Delete Campaign"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ─── 20-Per-Page Pagination Controls ─────────────────────── */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-card border border-border shadow-sm">
                    <div className="text-xs text-muted-foreground">
                      Showing{" "}
                      <span className="font-bold text-foreground">
                        {adTotalCount === 0 ? 0 : (adPage - 1) * 20 + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-bold text-foreground">
                        {Math.min(adPage * 20, adTotalCount)}
                      </span>{" "}
                      of <span className="font-bold text-foreground">{adTotalCount}</span> ad campaigns
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono mr-2">
                        Page {adPage} of {adTotalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={adPage <= 1}
                        onClick={() => {
                          const newPage = Math.max(1, adPage - 1);
                          setAdPage(newPage);
                          fetchAdCampaigns(newPage);
                        }}
                        className="h-8 px-3 text-xs gap-1 font-bold rounded-xl"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: adTotalPages }, (_, i) => i + 1)
                          .filter((pageNum) => {
                            if (adTotalPages <= 7) return true;
                            if (pageNum === 1 || pageNum === adTotalPages) return true;
                            return Math.abs(pageNum - adPage) <= 1;
                          })
                          .map((pageNum, idx, arr) => {
                            const isCurrent = pageNum === adPage;
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
                                  onClick={() => {
                                    setAdPage(pageNum);
                                    fetchAdCampaigns(pageNum);
                                  }}
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
                        disabled={adPage >= adTotalPages}
                        onClick={() => {
                          const newPage = Math.min(adTotalPages, adPage + 1);
                          setAdPage(newPage);
                          fetchAdCampaigns(newPage);
                        }}
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
              9. 💳 PAYMENTS PAGE
             ════════════════════════════════════════════════════════════════════ */}
          {/* ════════════════════════════════════════════════════════════════════
              9. 💳 PAYMENTS PAGE
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "payments" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header with Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">
                      Financial & Payment Ledger
                    </h2>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                      Live Gateway
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time transaction tracking, subscription dues, ad billing, and manual deposit registrations.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchPayments(payPage)}
                    disabled={isPaymentsLoading}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isPaymentsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportPaymentsCSV}
                    className="text-xs font-semibold gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={exportPaymentsJSON}
                    className="text-xs font-semibold gap-1.5 border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Export JSON
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsRegisterPaymentModalOpen(true)}
                    className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20"
                  >
                    <Plus className="w-4 h-4" />
                    Register Payment
                  </Button>
                </div>
              </div>

              {/* Dynamic Financial KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Total ETB Volume
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-1 font-mono">
                    {payStats ? payStats.totalRevenueETB.toLocaleString() : "..."} <span className="text-xs font-bold">ETB</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    Verified settlements
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Total USD Volume
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-indigo-600 mt-1 font-mono">
                    ${payStats ? payStats.totalRevenueUSD.toLocaleString() : "..."} <span className="text-xs font-bold">USD</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    International cards
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Completed Transactions
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-foreground mt-1 font-mono">
                    {payStats ? payStats.countCompleted : payTotalCount}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    100% verified ledger
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Pending Verifications
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 mt-1 font-mono flex items-center gap-2">
                    {payStats ? payStats.countPending : 0}
                    {payStats && payStats.countPending > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    Bank slip / approval queue
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm col-span-2 sm:col-span-1">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Avg. Order Value
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-primary mt-1 font-mono">
                    {payStats ? payStats.avgOrderValueETB.toLocaleString() : "..."} <span className="text-xs font-bold">ETB</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                    Per transaction
                  </div>
                </div>
              </div>

              {/* Subnav Tabs */}
              {renderSubnavTabs([
                { key: "transactions", label: "All Transactions", count: payTotalCount },
                { key: "geo_status", label: "🗺️ City & Country Matrix", count: payGeoBreakdown.length || undefined },
                {
                  key: "subscriptions",
                  label: "Subscriptions",
                  count: paymentsList.filter((p) => p.paymentType === "subscription").length,
                },
                {
                  key: "advertising",
                  label: "Advertising & Campaigns",
                  count: paymentsList.filter((p) => p.paymentType === "advertisement").length,
                },
                {
                  key: "pending",
                  label: "Pending Approvals",
                  count: payStats?.countPending || paymentsList.filter((p) => p.status === "pending").length,
                },
                {
                  key: "refunds",
                  label: "Refunds",
                  count: payStats?.countRefunded || paymentsList.filter((p) => p.status === "refunded").length,
                },
                { key: "revenue", label: "Revenue Breakdown" },
              ])}

              {/* Special Tab: Revenue Breakdown */}
              {activeSubnav === "revenue" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Estimated Monthly Run Rate",
                      value: `${((payStats?.totalRevenueETB || 45000) * 1.15).toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB`,
                      change: "+24.5%",
                      color: "text-emerald-600",
                    },
                    {
                      label: "Projected Annual Revenue",
                      value: `${((payStats?.totalRevenueETB || 45000) * 12).toLocaleString(undefined, { maximumFractionDigits: 0 })} ETB`,
                      change: "+31.2%",
                      color: "text-indigo-600",
                    },
                    {
                      label: "Average Transaction Ticket",
                      value: `${payStats?.avgOrderValueETB || 2400} ETB`,
                      change: "+6.8%",
                      color: "text-amber-600",
                    },
                  ].map((m, i) => (
                    <div key={i} className="p-5 rounded-3xl bg-card border border-border shadow-sm">
                      <div className="text-xs text-muted-foreground font-bold">{m.label}</div>
                      <div className={`text-3xl font-black mt-2 ${m.color}`}>{m.value}</div>
                      <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">
                        {m.change} growth
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Payments Table with Search, Filter, and Pagination Controls */}
              {activeSubnav !== "revenue" && (
                <div className="space-y-4">
                  {/* Interactive Payment Status by City & Country Matrix */}
                  <PaymentStatusGeoMatrix
                    payments={paymentsList}
                    geoSummaries={payGeoBreakdown}
                    selectedCountry={payCountryFilter}
                    selectedCity={payCityFilter}
                    selectedStatus={payStatusFilter}
                    currentRole={geoScopeRole || currentRole}
                    isCountryLocked={geoScopeRole === "country_admin" || currentRole === "country_admin"}
                    title={
                      (geoScopeRole === "country_admin" || currentRole === "country_admin")
                        ? `Payment Status by City (${payCountryFilter !== "all" ? payCountryFilter : "Assigned Country"})`
                        : "Payment Status by City & Country"
                    }
                    subtitle={
                      (geoScopeRole === "country_admin" || currentRole === "country_admin")
                        ? "Territory municipal overview of verified settlements, pending approvals, and collection metrics"
                        : "Global jurisdiction overview of verified settlements, pending approvals, and collection metrics"
                    }
                    onSelectGeo={(country, city) => {
                      setPayCountryFilter(country);
                      setPayCityFilter(city);
                      setPayPage(1);
                    }}
                    onSelectStatus={(st) => {
                      setPayStatusFilter(st);
                      setPayPage(1);
                    }}
                  />

                  {/* Search and Filter Controls */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-3xl bg-card border border-border shadow-sm">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-3 text-muted-foreground" />
                      <Input
                        value={paySearch}
                        onChange={(e) => {
                          setPaySearch(e.target.value);
                          setPayPage(1);
                        }}
                        placeholder="Search by Transaction ID, business, payer name, or reference code..."
                        className="pl-9 h-10 text-xs rounded-2xl bg-background border-border"
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      {/* Country Filter */}
                      <select
                        value={payCountryFilter}
                        onChange={(e) => {
                          setPayCountryFilter(e.target.value);
                          setPayCityFilter("all");
                          setPayPage(1);
                        }}
                        disabled={geoScopeRole === "country_admin" || currentRole === "country_admin"}
                        className={`h-10 px-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none ${
                          geoScopeRole === "country_admin" || currentRole === "country_admin" ? "opacity-80 cursor-not-allowed bg-muted/40 font-bold" : ""
                        }`}
                      >
                        {geoScopeRole === "country_admin" || currentRole === "country_admin" ? (
                          <option value={payCountryFilter}>🔒 {payCountryFilter} (Territory Scope)</option>
                        ) : (
                          <>
                            <option value="all">🌍 All Countries</option>
                            {COUNTRIES_WITH_CITIES.map((c) => (
                              <option key={c.name} value={c.name}>{c.name}</option>
                            ))}
                          </>
                        )}
                      </select>

                      {/* City Filter (cascades from Country) */}
                      <select
                        value={payCityFilter}
                        onChange={(e) => {
                          setPayCityFilter(e.target.value);
                          setPayPage(1);
                        }}
                        className="h-10 px-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none"
                        disabled={payCountryFilter === "all"}
                      >
                        <option value="all">🏙 All Cities</option>
                        {payCountryFilter !== "all" &&
                          getCitiesForCountry(payCountryFilter).map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                      </select>

                      {/* Provider Filter */}
                      <select
                        value={payProviderFilter}
                        onChange={(e) => {
                          setPayProviderFilter(e.target.value);
                          setPayPage(1);
                        }}
                        className="h-10 px-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="all">All Providers</option>
                        <option value="telebirr">Telebirr</option>
                        <option value="cbebirr">CBE Birr</option>
                        <option value="mpesa">M-Pesa</option>
                        <option value="card">Card / Stripe</option>
                        <option value="chapa">Chapa</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash / Office</option>
                      </select>

                      {/* Status Filter */}
                      <select
                        value={payStatusFilter}
                        onChange={(e) => {
                          setPayStatusFilter(e.target.value);
                          setPayPage(1);
                        }}
                        className="h-10 px-3 rounded-2xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed (Paid)</option>
                        <option value="pending">Pending</option>
                        <option value="refunded">Refunded</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                  </div>

                  {/* Active filter tags */}
                  {(payCountryFilter !== "all" || payCityFilter !== "all" || payStatusFilter !== "all" || payProviderFilter !== "all") && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Filters:</span>
                      {payCountryFilter !== "all" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          🌍 {payCountryFilter}
                          <button onClick={() => { setPayCountryFilter("all"); setPayCityFilter("all"); setPayPage(1); }} className="ml-1 hover:text-red-500">✕</button>
                        </span>
                      )}
                      {payCityFilter !== "all" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 border border-violet-500/20">
                          🏙 {payCityFilter}
                          <button onClick={() => { setPayCityFilter("all"); setPayPage(1); }} className="ml-1 hover:text-red-500">✕</button>
                        </span>
                      )}
                      {payStatusFilter !== "all" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          {payStatusFilter}
                          <button onClick={() => { setPayStatusFilter("all"); setPayPage(1); }} className="ml-1 hover:text-red-500">✕</button>
                        </span>
                      )}
                      {payProviderFilter !== "all" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {payProviderFilter}
                          <button onClick={() => { setPayProviderFilter("all"); setPayPage(1); }} className="ml-1 hover:text-red-500">✕</button>
                        </span>
                      )}
                      <button
                        onClick={() => { setPayCountryFilter("all"); setPayCityFilter("all"); setPayStatusFilter("all"); setPayProviderFilter("all"); setPayPage(1); }}
                        className="text-[10px] font-bold text-red-500 hover:text-red-700 underline"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  {/* 20-at-one-page Table */}
                  <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                          <tr>
                            <th className="px-5 py-3.5">Transaction ID</th>
                            <th className="px-5 py-3.5">Business & Payer</th>
                            <th className="px-5 py-3.5">City & Country</th>
                            <th className="px-5 py-3.5">Type / Plan</th>
                            <th className="px-5 py-3.5">Amount</th>
                            <th className="px-5 py-3.5">Payment Method</th>
                            <th className="px-5 py-3.5">Status</th>
                            <th className="px-5 py-3.5">Date</th>
                            <th className="px-5 py-3.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {isPaymentsLoading ? (
                            <tr>
                              <td colSpan={9} className="text-center py-12 text-muted-foreground">
                                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                                <span className="text-xs font-medium">Loading payments ledger...</span>
                              </td>
                            </tr>
                          ) : paymentsList.length === 0 ? (
                            <tr>
                              <td colSpan={9} className="text-center py-12 text-muted-foreground">
                                <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                <p className="font-bold text-sm text-foreground">No payments found</p>
                                <p className="text-xs mt-1">Try adjusting your search query or filters.</p>
                                <Button
                                  size="sm"
                                  variant="gradient"
                                  onClick={() => setIsRegisterPaymentModalOpen(true)}
                                  className="mt-3 text-xs font-bold"
                                >
                                  Register First Payment
                                </Button>
                              </td>
                            </tr>
                          ) : (
                            paymentsList.map((p) => (
                              <tr key={p.id} className="hover:bg-accent/20 transition-colors">
                                {/* Transaction ID with Copy */}
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <span className="font-bold text-primary">{p.id}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(p.id);
                                        toast.success(`Transaction ID ${p.id} copied!`);
                                      }}
                                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                      title="Copy Transaction ID"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {p.reference && (
                                    <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[140px]">
                                      Ref: {p.reference}
                                    </div>
                                  )}
                                </td>

                                {/* Business Name & Payer details */}
                                <td className="px-5 py-3.5">
                                  <div className="font-bold text-foreground font-sans">
                                    {p.businessName}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                                    <span>{p.payerName}</span>
                                    {p.payerPhone && (
                                      <span className="font-mono text-[10px] text-muted-foreground/80">
                                        · {p.payerPhone}
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* City & Country */}
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                                    <span>{p.cityName || "Addis Ababa"}</span>
                                  </div>
                                  <div className="text-[11px] text-muted-foreground font-medium pl-5">
                                    {p.countryName || "Ethiopia"}
                                  </div>
                                </td>

                                {/* Type */}
                                <td className="px-5 py-3.5">
                                  <Badge
                                    variant="outline"
                                    className="capitalize text-[10px] font-semibold border-border bg-background"
                                  >
                                    {p.paymentType.replace("_", " ")}
                                  </Badge>
                                </td>

                                {/* Amount */}
                                <td className="px-5 py-3.5 font-mono">
                                  <div className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                    {p.amount.toLocaleString()}{" "}
                                    <span className="text-[10px] font-bold text-muted-foreground">
                                      {p.currency}
                                    </span>
                                  </div>
                                </td>

                                {/* Provider badge */}
                                <td className="px-5 py-3.5">
                                  {renderPaymentProviderBadge(p.provider)}
                                </td>

                                {/* Status */}
                                <td className="px-5 py-3.5">
                                  <span
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                                      p.status === "completed"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : p.status === "pending"
                                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                        : p.status === "refunded"
                                        ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
                                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        p.status === "completed"
                                          ? "bg-emerald-500"
                                          : p.status === "pending"
                                          ? "bg-amber-500 animate-pulse"
                                          : p.status === "refunded"
                                          ? "bg-slate-400"
                                          : "bg-rose-500"
                                      }`}
                                    />
                                    {p.status.toUpperCase()}
                                  </span>
                                </td>

                                {/* Date */}
                                <td className="px-5 py-3.5 text-muted-foreground font-sans text-[11px] whitespace-nowrap">
                                  {new Date(p.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setSelectedPaymentForReceipt(p)}
                                      className="h-7 text-[10px] font-bold gap-1 rounded-xl"
                                    >
                                      <Receipt className="w-3 h-3 text-primary" /> Receipt
                                    </Button>

                                    {p.status === "pending" && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handlePaymentStatusChange(p.id, "completed")}
                                        className="h-7 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 border-emerald-500/30 rounded-xl"
                                      >
                                        Approve
                                      </Button>
                                    )}

                                    {p.status === "completed" && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          if (confirm(`Refund payment ${p.id} (${p.amount} ${p.currency})?`)) {
                                            handlePaymentStatusChange(p.id, "refunded");
                                          }
                                        }}
                                        className="h-7 text-[10px] text-muted-foreground hover:text-rose-600 rounded-xl"
                                      >
                                        Refund
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Bar (20 per page with Next / Prev buttons) */}
                    <div className="px-5 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
                      <div className="text-xs text-muted-foreground font-medium">
                        Showing{" "}
                        <strong className="text-foreground">
                          {payTotalCount === 0 ? 0 : (payPage - 1) * PAYMENTS_PER_PAGE + 1}
                        </strong>{" "}
                        to{" "}
                        <strong className="text-foreground">
                          {Math.min(payPage * PAYMENTS_PER_PAGE, payTotalCount)}
                        </strong>{" "}
                        of <strong className="text-foreground">{payTotalCount}</strong> payments
                        <span className="ml-1 text-[11px] opacity-75">(20 per page)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Previous Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const prev = Math.max(1, payPage - 1);
                            setPayPage(prev);
                            fetchPayments(prev);
                          }}
                          disabled={payPage <= 1 || isPaymentsLoading}
                          className="h-8 text-xs font-bold gap-1 rounded-xl"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </Button>

                        {/* Page Numbers Indicator / Direct Jumps */}
                        {Array.from({ length: Math.min(payTotalPages, 5) }).map((_, i) => {
                          let pageNum = i + 1;
                          if (payTotalPages > 5 && payPage > 3) {
                            pageNum = Math.min(payTotalPages - 4 + i, Math.max(1, payPage - 2 + i));
                          }
                          return (
                            <Button
                              key={pageNum}
                              size="sm"
                              variant={payPage === pageNum ? "gradient" : "outline"}
                              onClick={() => {
                                setPayPage(pageNum);
                                fetchPayments(pageNum);
                              }}
                              disabled={isPaymentsLoading}
                              className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${
                                payPage === pageNum ? "shadow-sm shadow-primary/30" : ""
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}

                        {/* Next Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const next = Math.min(payTotalPages, payPage + 1);
                            setPayPage(next);
                            fetchPayments(next);
                          }}
                          disabled={payPage >= payTotalPages || isPaymentsLoading}
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
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              10. 📊 ANALYTICS & SEARCH ENGINE ANALYTICS
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "analytics" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header with Telemetry Status & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">
                      Discovery &amp; Platform Analytics
                    </h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                      {analyticsTotalCount} Real Events Tracked
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live telemetry across user searches, listing profile views, phone calls, GPS navigation, and digital interactions.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchAnalytics(analyticsPage)}
                    disabled={isAnalyticsLoading}
                    className="text-xs font-semibold gap-1.5 rounded-xl"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyticsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const csvHeader = "ID,EventType,BusinessName,SearchTerm,City,Country,Device,RegisteredBy,CreatedAt\n";
                      const csvRows = analyticsList.map((e) =>
                        `"${e.id}","${e.eventType}","${e.businessName || ""}","${e.searchTerm || ""}","${e.city}","${e.country}","${e.device}","${e.registeredBy}","${e.createdAt}"`
                      ).join("\n");
                      const blob = new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", `bizfinder-analytics-${new Date().toISOString().split("T")[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success("Analytics CSV exported successfully!");
                    }}
                    className="text-xs font-semibold gap-1.5 rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </Button>

                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsRegisterAnalyticsModalOpen(true)}
                    className="text-xs font-bold gap-1.5 shadow-md shadow-primary/20 rounded-xl"
                  >
                    <Plus className="w-4 h-4" />
                    Register Analytics Event
                  </Button>
                </div>
              </div>

              {/* Dynamic Telemetry KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Total Events
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-foreground mt-1 font-mono">
                    {analyticsTotalCount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    100% live telemetry
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Profile Views
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 mt-1 font-mono">
                    {(analyticsStats?.totalViews ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    +18.4% engagement
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Discovery Searches
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 font-mono">
                    {(analyticsStats?.totalSearches ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                    Search engine queries
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Direct Calls
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                    {(analyticsStats?.totalCalls ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                    Phone inquiries
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    GPS Directions
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                    {(analyticsStats?.totalDirections ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                    Navigation routes
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-card border border-border shadow-sm">
                  <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                    Action Rate / CTR
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400 mt-1 font-mono">
                    {analyticsStats?.ctr ?? 8.4}%
                  </div>
                  <div className="text-[10px] text-purple-600 font-semibold mt-0.5">
                    Conversion intent
                  </div>
                </div>
              </div>

              {renderSubnavTabs([
                { key: "all", label: "Live Event Ledger", count: analyticsTotalCount },
                { key: "platform", label: "Platform Overview" },
                { key: "search", label: "Search Keywords" },
                { key: "location", label: "Geographic Breakdown" },
                { key: "business", label: "Business Performance" },
                { key: "revenue", label: "Revenue Analytics" },
              ])}

              {/* Subnav: ALL (20-Per-Page Real Event Ledger Table) */}
              {(activeSubnav === "all" || !["platform", "search", "location", "business", "revenue"].includes(activeSubnav)) && (
                <div className="space-y-4">
                  {/* Event Type Filter Pills & Search Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                      {[
                        { key: "all", label: "All Telemetry", count: analyticsStats?.counts.all || analyticsTotalCount },
                        { key: "view", label: "Views", count: analyticsStats?.counts.view },
                        { key: "search", label: "Searches", count: analyticsStats?.counts.search },
                        { key: "click_phone", label: "Calls", count: analyticsStats?.counts.click_phone },
                        { key: "click_direction", label: "Directions", count: analyticsStats?.counts.click_direction },
                        { key: "click_website", label: "Websites", count: analyticsStats?.counts.click_website },
                        { key: "favorite", label: "Favorites", count: analyticsStats?.counts.favorite },
                        { key: "ad_click", label: "Ad Clicks", count: analyticsStats?.counts.ad_click },
                      ].map((pill) => (
                        <button
                          key={pill.key}
                          onClick={() => {
                            setAnalyticsTypeFilter(pill.key);
                            setAnalyticsPage(1);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                            analyticsTypeFilter === pill.key
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                              : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent/40"
                          }`}
                        >
                          <span>{pill.label}</span>
                          {pill.count !== undefined && (
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                              analyticsTypeFilter === pill.key
                                ? "bg-primary-foreground/20 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}>
                              {pill.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search business, query, city, ID..."
                        value={analyticsSearch}
                        onChange={(e) => {
                          setAnalyticsSearch(e.target.value);
                          setAnalyticsPage(1);
                        }}
                        className="pl-9 h-9 text-xs rounded-xl bg-card border-border"
                      />
                    </div>
                  </div>

                  {/* 20-Per-Page Table Container */}
                  <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/70 text-muted-foreground font-semibold">
                            <th className="px-5 py-3.5">Event ID</th>
                            <th className="px-5 py-3.5">Event Type</th>
                            <th className="px-5 py-3.5">Listing / Target</th>
                            <th className="px-5 py-3.5">Query / Details</th>
                            <th className="px-5 py-3.5">Location</th>
                            <th className="px-5 py-3.5">Device &amp; OS</th>
                            <th className="px-5 py-3.5">Timestamp</th>
                            <th className="px-5 py-3.5">Logged By</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                          {isAnalyticsLoading ? (
                            <tr>
                              <td colSpan={8} className="text-center py-16 text-muted-foreground">
                                <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-primary" />
                                <span className="text-xs font-semibold">Loading real-time telemetry...</span>
                              </td>
                            </tr>
                          ) : analyticsList.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="text-center py-16 text-muted-foreground">
                                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30 text-primary" />
                                <p className="font-bold text-sm text-foreground">No analytics events found</p>
                                <p className="text-xs mt-1">Try adjusting your filters or record a new telemetry event.</p>
                                <Button
                                  size="sm"
                                  variant="gradient"
                                  onClick={() => setIsRegisterAnalyticsModalOpen(true)}
                                  className="mt-3 text-xs font-bold rounded-xl"
                                >
                                  Register First Event
                                </Button>
                              </td>
                            </tr>
                          ) : (
                            analyticsList.map((evt) => (
                              <tr key={evt.id} className="hover:bg-accent/20 transition-colors">
                                {/* Event ID with Copy */}
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-1.5 font-mono">
                                    <span className="font-bold text-primary text-[11px]">{evt.id}</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(evt.id);
                                        toast.success(`Event ID ${evt.id} copied!`);
                                      }}
                                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                                      title="Copy Event ID"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </button>
                                  </div>
                                </td>

                                {/* Event Type Badge */}
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  {renderAnalyticsTypeBadge(evt.eventType)}
                                </td>

                                {/* Listing / Target */}
                                <td className="px-5 py-3.5 max-w-[200px]">
                                  {evt.businessName ? (
                                    <div className="font-bold text-foreground truncate flex items-center gap-1.5">
                                      <Building2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                                      <span className="truncate">{evt.businessName}</span>
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground italic text-[11px]">Global Discovery</span>
                                  )}
                                </td>

                                {/* Query / Details */}
                                <td className="px-5 py-3.5 max-w-[220px]">
                                  {evt.searchTerm ? (
                                    <div className="font-semibold text-foreground truncate flex items-center gap-1 text-[11px]">
                                      <Search className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                      <span className="truncate">"{evt.searchTerm}"</span>
                                    </div>
                                  ) : evt.duration ? (
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      Dwell: {evt.duration}s
                                    </span>
                                  ) : (
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      Direct Action
                                    </span>
                                  )}
                                </td>

                                {/* Location */}
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                    <MapPin className="w-3 h-3 text-rose-500" />
                                    {evt.city}, {evt.country}
                                  </span>
                                </td>

                                {/* Device & Platform */}
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground capitalize">
                                    {evt.device === "mobile" && <Smartphone className="w-3.5 h-3.5 text-emerald-500" />}
                                    {evt.device === "desktop" && <Activity className="w-3.5 h-3.5 text-sky-500" />}
                                    {evt.device === "tablet" && <Sparkles className="w-3.5 h-3.5 text-purple-500" />}
                                    <span>{evt.device}</span>
                                    {evt.os && <span className="text-[10px] opacity-75 font-mono">· {evt.os}</span>}
                                  </div>
                                </td>

                                {/* Timestamp */}
                                <td className="px-5 py-3.5 text-muted-foreground text-[11px] whitespace-nowrap font-mono">
                                  {new Date(evt.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </td>

                                {/* Logged By */}
                                <td className="px-5 py-3.5 whitespace-nowrap">
                                  <Badge
                                    variant="outline"
                                    className={`text-[9px] font-mono capitalize ${
                                      evt.registeredBy.includes("Admin")
                                        ? "bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold"
                                        : "bg-muted/50 text-muted-foreground border-border"
                                    }`}
                                  >
                                    {evt.registeredBy}
                                  </Badge>
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
                          {analyticsTotalCount === 0 ? 0 : (analyticsPage - 1) * ANALYTICS_PER_PAGE + 1}
                        </strong>{" "}
                        to{" "}
                        <strong className="text-foreground">
                          {Math.min(analyticsPage * ANALYTICS_PER_PAGE, analyticsTotalCount)}
                        </strong>{" "}
                        of <strong className="text-foreground">{analyticsTotalCount}</strong> events
                        <span className="ml-1 text-[11px] opacity-75">(20 per page)</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Previous Page Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const prev = Math.max(1, analyticsPage - 1);
                            setAnalyticsPage(prev);
                            fetchAnalytics(prev);
                          }}
                          disabled={analyticsPage <= 1 || isAnalyticsLoading}
                          className="h-8 text-xs font-bold gap-1 rounded-xl"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                          <span>Previous</span>
                        </Button>

                        {/* Direct Page Numbers */}
                        {Array.from({ length: Math.min(analyticsTotalPages, 5) }).map((_, i) => {
                          let pageNum = i + 1;
                          if (analyticsTotalPages > 5 && analyticsPage > 3) {
                            pageNum = Math.min(analyticsTotalPages - 4 + i, Math.max(1, analyticsPage - 2 + i));
                          }
                          return (
                            <Button
                              key={pageNum}
                              size="sm"
                              variant={analyticsPage === pageNum ? "gradient" : "outline"}
                              onClick={() => {
                                setAnalyticsPage(pageNum);
                                fetchAnalytics(pageNum);
                              }}
                              disabled={isAnalyticsLoading}
                              className={`h-8 w-8 p-0 text-xs font-bold rounded-xl ${
                                analyticsPage === pageNum ? "shadow-sm shadow-primary/30" : ""
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}

                        {/* Next Page Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const next = Math.min(analyticsTotalPages, analyticsPage + 1);
                            setAnalyticsPage(next);
                            fetchAnalytics(next);
                          }}
                          disabled={analyticsPage >= analyticsTotalPages || isAnalyticsLoading}
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

              {/* Subnav: Platform Overview */}
              {activeSubnav === "platform" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      {
                        label: "Total Platform Users",
                        value: (dashboardStats?.totalUsers ?? userTotalCount ?? usersList.length ?? 0).toLocaleString(),
                        change: "+14.2% MoM",
                      },
                      {
                        label: "Active Business Listings",
                        value: (dashboardStats?.totalBusinesses ?? bizTotalCount ?? businesses.length ?? 0).toLocaleString(),
                        change: "+8.7% verified",
                      },
                      { label: "Monthly Search Volume", value: "1.24M", change: "+28.1% queries" },
                      { label: "Platform Interaction Rate", value: `${analyticsStats?.ctr ?? 8.4}%`, change: "High engagement" },
                    ].map((m, i) => (
                      <div key={i} className="p-5 rounded-3xl bg-card border border-border text-center shadow-sm">
                        <div className="text-xs text-muted-foreground font-bold">{m.label}</div>
                        <div className="text-2xl font-black text-foreground mt-1 font-mono">{m.value}</div>
                        <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                          {m.change}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                    <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" /> Traffic &amp; Interaction Distribution by Device
                    </h3>
                    <div className="grid grid-cols-3 gap-3 text-center text-xs">
                      <div className="p-4 rounded-2xl bg-background border border-border">
                        <Smartphone className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
                        <div className="font-bold text-foreground">Mobile Devices</div>
                        <div className="text-xl font-black text-emerald-600 mt-1">
                          {analyticsStats?.deviceBreakdown?.mobile ?? 48}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Primary user channel</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-background border border-border">
                        <Activity className="w-5 h-5 text-sky-500 mx-auto mb-1" />
                        <div className="font-bold text-foreground">Desktop PCs</div>
                        <div className="text-xl font-black text-sky-600 mt-1">
                          {analyticsStats?.deviceBreakdown?.desktop ?? 14}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Office &amp; enterprise</div>
                      </div>
                      <div className="p-4 rounded-2xl bg-background border border-border">
                        <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <div className="font-bold text-foreground">Tablets</div>
                        <div className="text-xl font-black text-purple-600 mt-1">
                          {analyticsStats?.deviceBreakdown?.tablet ?? 3}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Browse &amp; catalogs</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subnav: Search Keywords */}
              {activeSubnav === "search" && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-500" /> Top Customer Search Queries (Live Search Engine)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Actual search phrases typed by local customers across Ethiopia and East Africa.
                      </p>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-xs font-bold">
                      {(analyticsStats?.topKeywords || []).length} Tracked Keywords
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {(analyticsStats?.topKeywords && analyticsStats.topKeywords.length > 0
                      ? analyticsStats.topKeywords
                      : topSearches.map((s) => ({ keyword: s.term, count: parseInt(s.volume), trend: s.trend }))
                    ).map((kw, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-background border border-border flex items-center justify-between text-xs hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-foreground font-mono">"{kw.keyword}"</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-mono font-bold text-muted-foreground">{kw.count} queries</span>
                          <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold">
                            {kw.trend}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subnav: Location Analytics */}
              {activeSubnav === "location" && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" /> Geographic Visitor &amp; Listing Distribution
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Breakdown of searches and interactions by city and region.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(analyticsStats?.geoDistribution && analyticsStats.geoDistribution.length > 0
                      ? analyticsStats.geoDistribution
                      : [
                          { city: "Addis Ababa", country: "Ethiopia", count: 48, percentage: 65 },
                          { city: "Hawassa", country: "Ethiopia", count: 10, percentage: 14 },
                          { city: "Dire Dawa", country: "Ethiopia", count: 6, percentage: 8 },
                          { city: "Bahir Dar", country: "Ethiopia", count: 5, percentage: 7 },
                          { city: "Nairobi", country: "Kenya", count: 4, percentage: 6 },
                        ]
                    ).map((geo, i) => (
                      <div key={i} className="p-3.5 rounded-2xl bg-background border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="flex items-center gap-2 text-foreground">
                            <MapPin className="w-3.5 h-3.5 text-primary" />
                            {geo.city}, {geo.country}
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {geo.count} events ({geo.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(5, geo.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subnav: Business Analytics */}
              {activeSubnav === "business" && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-500" /> Business Telemetry &amp; Listing Health
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-background border border-border text-center">
                      <div className="text-muted-foreground font-bold">Total Verified Listings</div>
                      <div className="text-xl font-black text-foreground mt-1">{bizTotalCount || 4210}</div>
                      <div className="text-[10px] text-emerald-600 mt-0.5 font-bold">100% indexed in directory</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-background border border-border text-center">
                      <div className="text-muted-foreground font-bold">Average Profile Rating</div>
                      <div className="text-xl font-black text-amber-500 mt-1">4.8 ⭐</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Across {reviewsList.length || 240} reviews</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-background border border-border text-center">
                      <div className="text-muted-foreground font-bold">Direct Conversion Calls</div>
                      <div className="text-xl font-black text-emerald-600 mt-1">{analyticsStats?.totalCalls ?? 12}</div>
                      <div className="text-[10px] text-emerald-600 mt-0.5 font-bold">+24.2% telephone intent</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Subnav: Revenue Analytics */}
              {activeSubnav === "revenue" && (
                <div className="p-6 rounded-3xl bg-card border border-border shadow-sm space-y-4">
                  <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-green-500" /> Financial &amp; Monetization Analytics
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-4 rounded-2xl bg-background border border-border text-center">
                      <div className="text-muted-foreground font-bold">Settled Volume (ETB)</div>
                      <div className="text-xl font-black text-emerald-600 mt-1 font-mono">
                        {payStats ? payStats.totalRevenueETB.toLocaleString() : "149,850"} ETB
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Telebirr, CBE &amp; Chapa</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-background border border-border text-center">
                      <div className="text-muted-foreground font-bold">International Cards (USD)</div>
                      <div className="text-xl font-black text-indigo-600 mt-1 font-mono">
                        ${payStats ? payStats.totalRevenueUSD.toLocaleString() : "4,250"} USD
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">Global Stripe settlements</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-background border border-border text-center">
                      <div className="text-muted-foreground font-bold">Completed Invoices</div>
                      <div className="text-xl font-black text-foreground mt-1 font-mono">
                        {payStats ? payStats.countCompleted : payTotalCount || 28}
                      </div>
                      <div className="text-[10px] text-emerald-600 mt-0.5 font-bold">Verified ledger balance</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════
              11. 🚨 REPORTS & MODERATION (Incident Workflow & Ledger)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "moderation" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header with quick CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">
                      Incident Workflow & Moderation Queue
                    </h2>
                    <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] font-bold">
                      {reportTotalCount} Active Records
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time incident triage: Reported → Under Review → Investigation → Resolved / Penalty Enforcement.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchReports(reportPage)}
                    disabled={isReportsLoading}
                    className="text-xs font-bold gap-1.5 h-8"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isReportsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsRegisterReportModalOpen(true)}
                    className="gap-1.5 text-xs font-bold h-8 shadow-md shadow-red-500/15"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Register Real Incident
                  </Button>
                </div>
              </div>

              {/* KPI Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Total Reports</span>
                    <Flag className="w-4 h-4 text-red-500" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {reportStats?.totalReports ?? reportTotalCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Platform incidents logged</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Under Review</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {reportStats?.underReviewCount ?? 0}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Awaiting triage</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-purple-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Investigating</span>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {reportStats?.investigatingCount ?? 0}
                  </div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">Active case handling</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-emerald-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Resolved</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {reportStats?.resolvedCount ?? 0}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Enforced / Closed</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-red-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Critical SLA</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-red-600 mt-2 font-mono">
                    {reportStats?.criticalCount ?? 0}
                  </div>
                  <div className="text-[10px] text-red-500 font-bold mt-1">Urgent safety priority</div>
                </div>
              </div>

              {/* Subnav Classification Tabs */}
              {renderSubnavTabs([
                { key: "all", label: "All Reports", count: reportStats?.totalReports ?? reportTotalCount },
                { key: "business", label: "Business Reports", count: reportStats?.businessReportsCount ?? 0 },
                { key: "user", label: "User Reports", count: reportStats?.userReportsCount ?? 0 },
                { key: "review", label: "Review Reports", count: reportStats?.reviewReportsCount ?? 0 },
                { key: "media", label: "Media Reports", count: reportStats?.mediaReportsCount ?? 0 },
                { key: "resolved", label: "Resolved Incidents", count: reportStats?.resolvedCount ?? 0 },
              ])}

              {/* Filtering Toolbar */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={reportSearch}
                      onChange={(e) => {
                        setReportSearch(e.target.value);
                        setReportPage(1);
                      }}
                      placeholder="Search reports by title, reason, reporter, or ID..."
                      className="pl-8 text-xs h-9 rounded-xl"
                    />
                  </div>
                  {reportSearch && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setReportSearch("");
                        setReportPage(1);
                      }}
                      className="text-xs h-9 text-muted-foreground hover:text-foreground px-2"
                    >
                      Clear
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Priority Filter */}
                  <select
                    value={reportPriorityFilter}
                    onChange={(e) => {
                      setReportPriorityFilter(e.target.value);
                      setReportPage(1);
                    }}
                    className="bg-background text-foreground text-xs font-bold py-1.5 px-2.5 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Priorities</option>
                    <option value="critical">🔴 Critical</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">⚪ Low</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={reportStatusFilter}
                    onChange={(e) => {
                      setReportStatusFilter(e.target.value);
                      setReportPage(1);
                    }}
                    className="bg-background text-foreground text-xs font-bold py-1.5 px-2.5 rounded-xl border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="under_review">Under Review</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              {/* Reports List - Exactly 5 items per page */}
              {isReportsLoading ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <Loader2 className="w-7 h-7 mx-auto animate-spin text-primary" />
                  <p className="text-xs font-bold">Querying live incident moderation queue…</p>
                </div>
              ) : reportsList.length === 0 ? (
                <div className="p-12 rounded-3xl bg-card border border-border text-center text-muted-foreground space-y-3">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-70" />
                  <div>
                    <p className="font-black text-foreground">No reports matching your criteria</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      The moderation queue is currently clear or no records match this filter.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReportSearch("");
                      setReportPriorityFilter("all");
                      setReportStatusFilter("all");
                      setActiveSubnav("all");
                      setReportPage(1);
                    }}
                    className="text-xs font-bold mt-2"
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reportsList.map((r) => {
                    const isCritical = r.priority === "critical";
                    return (
                      <div
                        key={r.id}
                        className={`p-5 rounded-3xl bg-card border transition-all hover:border-border/90 hover:shadow-md ${
                          isCritical
                            ? "border-red-500/30 bg-gradient-to-r from-red-500/[0.03] to-transparent"
                            : "border-border/80"
                        } space-y-3`}
                      >
                        {/* Top Line: ID + Badges + Title */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                              {r.id}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase font-black border-border text-muted-foreground flex items-center gap-1"
                            >
                              {r.type === "business" && <Building2 className="w-3 h-3 text-indigo-500" />}
                              {r.type === "review" && <Star className="w-3 h-3 text-amber-500" />}
                              {r.type === "user" && <Users className="w-3 h-3 text-emerald-500" />}
                              {r.type === "media" && <Camera className="w-3 h-3 text-purple-500" />}
                              {r.type}
                            </Badge>

                            {/* Priority badge */}
                            {r.priority === "critical" && (
                              <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[9px] font-black animate-pulse">
                                🔴 Critical
                              </Badge>
                            )}
                            {r.priority === "high" && (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[9px] font-black">
                                🟠 High
                              </Badge>
                            )}
                            {r.priority === "medium" && (
                              <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[9px] font-black">
                                🔵 Medium
                              </Badge>
                            )}
                            {r.priority === "low" && (
                              <Badge variant="outline" className="text-[9px] text-muted-foreground">
                                ⚪ Low
                              </Badge>
                            )}

                            {/* Status badge */}
                            {r.status === "resolved" && (
                              <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 text-[10px] font-black">
                                ✓ Resolved
                              </Badge>
                            )}
                            {r.status === "investigating" && (
                              <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-[10px] font-black">
                                🔍 Investigating
                              </Badge>
                            )}
                            {r.status === "under_review" && (
                              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-black">
                                ⏳ Under Review
                              </Badge>
                            )}
                            {r.status === "dismissed" && (
                              <Badge variant="outline" className="text-muted-foreground text-[10px]">
                                ✕ Dismissed
                              </Badge>
                            )}
                          </div>

                          <span className="text-[11px] text-muted-foreground">
                            {new Date(r.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Title & Target Details */}
                        <div>
                          <h4 className="font-black text-foreground text-sm tracking-tight">{r.title}</h4>
                          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>
                              Target: <strong className="text-foreground">{r.targetName}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Reason: <strong className="text-primary">{r.reason}</strong>
                            </span>
                            <span>•</span>
                            <span>
                              Reported by: <span className="text-foreground font-semibold">{r.reporterName}</span>
                            </span>
                            {r.city && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3 text-red-500" />
                                  {r.city}
                                </span>
                              </>
                            )}
                          </div>
                          {r.details && (
                            <p className="text-xs text-muted-foreground/90 mt-2 bg-muted/30 p-2.5 rounded-xl line-clamp-2">
                              {r.details}
                            </p>
                          )}
                        </div>

                        {/* Resolution note if already resolved */}
                        {r.resolutionNotes && (
                          <div className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                            <strong>Resolution Action:</strong> {r.resolutionNotes} ({r.actionTaken})
                          </div>
                        )}

                        {/* Card Action Controls */}
                        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/80">
                          <div className="text-[11px] text-muted-foreground font-mono">
                            Entity ID: {r.targetId}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedReportForDetail(r)}
                              className="text-xs font-bold h-7 gap-1"
                            >
                              <Eye className="w-3 h-3 text-primary" />
                              Inspect Dossier
                            </Button>

                            {r.status !== "dismissed" && r.status !== "resolved" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/reports/${r.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          status: "dismissed",
                                          actionTaken: "dismissed",
                                          resolutionNotes: "Quick dismissed by administrator.",
                                          resolvedBy: isSuperAdmin
                                            ? "Alex Rivera (Super Admin)"
                                            : "Marcus Vance (Admin)",
                                        }),
                                      });
                                      if (res.ok) {
                                        toast.success(`Report ${r.id} dismissed`);
                                        fetchReports(reportPage);
                                      }
                                    } catch {
                                      toast.error("Failed to dismiss report");
                                    }
                                  }}
                                  className="text-xs h-7 text-muted-foreground hover:text-foreground"
                                >
                                  Dismiss
                                </Button>

                                <Button
                                  size="sm"
                                  variant="gradient"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/reports/${r.id}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                          status: "resolved",
                                          actionTaken: "penalty_applied",
                                          resolutionNotes: "Violation confirmed and penalty strike recorded.",
                                          resolvedBy: isSuperAdmin
                                            ? "Alex Rivera (Super Admin)"
                                            : "Marcus Vance (Admin)",
                                        }),
                                      });
                                      if (res.ok) {
                                        toast.success(`Incident ${r.id} resolved and strike recorded.`);
                                        fetchReports(reportPage);
                                      }
                                    } catch {
                                      toast.error("Failed to resolve report");
                                    }
                                  }}
                                  className="text-xs font-bold h-7"
                                >
                                  Resolve & Strike
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ─── 5-ITEMS-PER-PAGE PAGINATION CONTROLS ───────────────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <div>
                  Showing{" "}
                  <strong className="text-foreground">
                    {reportTotalCount === 0 ? 0 : (reportPage - 1) * REPORTS_PER_PAGE + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-foreground">
                    {Math.min(reportPage * REPORTS_PER_PAGE, reportTotalCount)}
                  </strong>{" "}
                  of <strong className="text-foreground">{reportTotalCount}</strong> incidents (
                  <span className="font-semibold text-primary">5 per page</span>)
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reportPage <= 1 || isReportsLoading}
                    onClick={() => {
                      const newPage = Math.max(1, reportPage - 1);
                      setReportPage(newPage);
                      fetchReports(newPage);
                    }}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>

                  {/* Page number buttons */}
                  {Array.from({ length: Math.min(5, reportTotalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (reportTotalPages > 5 && reportPage > 3) {
                      pageNum = Math.min(reportTotalPages - 4 + i, reportPage - 2 + i);
                    }
                    if (pageNum < 1 || pageNum > reportTotalPages) return null;

                    const isActive = reportPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setReportPage(pageNum);
                          fetchReports(pageNum);
                        }}
                        disabled={isReportsLoading}
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

                  {reportTotalPages > 5 && reportPage < reportTotalPages - 2 && (
                    <span className="px-1 text-muted-foreground">…</span>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={reportPage >= reportTotalPages || isReportsLoading}
                    onClick={() => {
                      const newPage = Math.min(reportTotalPages, reportPage + 1);
                      setReportPage(newPage);
                      fetchReports(newPage);
                    }}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}


          {/* ════════════════════════════════════════════════════════════════════
              12. 🔔 NOTIFICATIONS DISPATCHER (Real DB + 10-Per-Page Pagination)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "notifications" && (
            <div className="space-y-6 max-w-7xl mx-auto">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">Notification Dispatcher</h2>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-bold">
                      {notifTotalCount} Total
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Broadcast announcements, compliance alerts, and targeted admin directives to users, owners, or staff.</p>
                </div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchNotifications(notifPage)}
                    disabled={isNotifsLoading}
                    className="text-xs font-bold gap-1.5 h-8"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isNotifsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsRegisterNotifModalOpen(true)}
                    className="gap-1.5 text-xs font-bold h-8 shadow-md shadow-primary/20"
                  >
                    <Plus className="w-3.5 h-3.5" /> Register Real Notification
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
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">{notifStats?.total ?? notifTotalCount}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">All notifications logged</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Unread</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-amber-500 mt-2 font-mono">{notifStats?.unread ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Pending read receipts</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-blue-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Global</span>
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-blue-500 mt-2 font-mono">{notifStats?.globalCount ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Platform-wide broadcasts</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-emerald-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Business</span>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-emerald-500 mt-2 font-mono">{notifStats?.businessCount ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Merchant-targeted alerts</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs">
                  <div className="flex items-center justify-between text-red-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">Critical</span>
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-red-500 mt-2 font-mono">{notifStats?.criticalCount ?? 0}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">Urgent priority alerts</div>
                </div>
              </div>

              {/* Subnav tabs */}
              {renderSubnavTabs([
                { key: "all", label: "All Notifications", count: notifTotalCount },
                { key: "global", label: "Global Broadcasts", count: notifStats?.globalCount },
                { key: "business", label: "Business Alerts", count: notifStats?.businessCount },
                { key: "templates", label: "Templates" },
              ])}

              {/* Search + Filter Toolbar */}
              {(activeSubnav === "all" || activeSubnav === "global" || activeSubnav === "business") && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by title, message, or sender..."
                      value={notifSearch}
                      onChange={(e) => { setNotifSearch(e.target.value); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { setNotifPage(1); fetchNotifications(1); } }}
                      className="pl-9 text-xs h-9"
                    />
                  </div>
                  <select
                    value={notifTypeFilter}
                    onChange={(e) => { setNotifTypeFilter(e.target.value); setNotifPage(1); }}
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
                    value={notifPriorityFilter}
                    onChange={(e) => { setNotifPriorityFilter(e.target.value); setNotifPage(1); }}
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
                    onClick={() => { setNotifPage(1); fetchNotifications(1); }}
                    className="h-9 text-xs font-bold px-4"
                  >
                    Apply Filter
                  </Button>
                </div>
              )}

              {/* Notification List */}
              {(activeSubnav === "all" || activeSubnav === "global" || activeSubnav === "business") && (
                <div className="space-y-3">
                  {isNotifsLoading ? (
                    <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
                      <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto" />
                      <p className="text-sm font-bold text-foreground">Loading notifications from database...</p>
                      <p className="text-xs text-muted-foreground">Connecting to MongoDB collection</p>
                    </div>
                  ) : notificationsList.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-card border border-dashed border-border text-center space-y-4">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                        <Bell className="w-7 h-7" />
                      </div>
                      <div className="max-w-md mx-auto space-y-1">
                        <h3 className="text-lg font-black text-foreground">No Notifications Found</h3>
                        <p className="text-xs text-muted-foreground">
                          {notifSearch || notifTypeFilter !== "all" || notifPriorityFilter !== "all"
                            ? "No notifications match your current filters. Try adjusting the search or filter criteria."
                            : "No notifications have been dispatched yet. Register the first one below!"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => setIsRegisterNotifModalOpen(true)}
                        className="gap-2 font-bold text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Register First Notification
                      </Button>
                    </div>
                  ) : (
                    notificationsList.map((n) => {
                      const isCritical = n.priority === "critical";
                      return (
                        <div
                          key={n.id}
                          className={`p-5 rounded-3xl bg-card border transition-all hover:border-border/90 hover:shadow-md space-y-3 ${
                            isCritical
                              ? "border-red-500/30 bg-gradient-to-r from-red-500/[0.03] to-transparent"
                              : "border-border/80"
                          }`}
                        >
                          {/* Top: ID + Badges */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">{n.id}</span>

                              {/* Target badge */}
                              <Badge
                                className={`text-[10px] font-bold ${
                                  n.target === "global" ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                  : n.target === "business" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                  : n.target === "admin" ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                                  : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                                }`}
                              >
                                {n.target === "global" ? "🌐 Global"
                                  : n.target === "business" ? "🏢 Business"
                                  : n.target === "admin" ? "🛡️ Admin"
                                  : "👤 User"}
                              </Badge>

                              {/* Type badge */}
                              <Badge variant="outline" className="text-[10px] capitalize font-bold border-border text-muted-foreground">
                                {n.type || "system"}
                              </Badge>

                              {/* Priority badge */}
                              {n.priority === "critical" && (
                                <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[9px] font-black animate-pulse">🔴 Critical</Badge>
                              )}
                              {n.priority === "high" && (
                                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[9px] font-black">🟠 High</Badge>
                              )}
                              {n.priority === "medium" && (
                                <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[9px] font-black">🔵 Medium</Badge>
                              )}
                              {n.priority === "low" && (
                                <Badge variant="outline" className="text-[9px] text-muted-foreground">⚪ Low</Badge>
                              )}

                              {/* Status badge */}
                              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px]">{n.status}</Badge>
                            </div>

                            <span className="text-[11px] text-muted-foreground">
                              {n.sent || (n.createdAt ? new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "")}
                            </span>
                          </div>

                          {/* Title + Body */}
                          <div>
                            <h4 className="font-black text-foreground text-sm tracking-tight">{n.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{n.body}</p>
                          </div>

                          {/* Footer: meta + actions */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/80">
                            <div className="text-[11px] text-muted-foreground">
                              Sent by <strong className="text-foreground">{n.sentBy || "Platform"}</strong>
                              {n.link && (
                                <span className="ml-2 font-mono text-primary/70">→ {n.link}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedNotifForDetail(n)}
                                className="text-xs font-bold h-7 gap-1"
                              >
                                <Eye className="w-3 h-3 text-primary" /> Inspect
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteNotification(n.id)}
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
              )}

              {/* ─── 10-ITEMS-PER-PAGE PAGINATION BAR ───────────────────────────────── */}
              {(activeSubnav === "all" || activeSubnav === "global" || activeSubnav === "business") && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                  <div>
                    Showing{" "}
                    <strong className="text-foreground">
                      {notifTotalCount === 0 ? 0 : (notifPage - 1) * NOTIFS_PER_PAGE + 1}
                    </strong>{" "}
                    to{" "}
                    <strong className="text-foreground">
                      {Math.min(notifPage * NOTIFS_PER_PAGE, notifTotalCount)}
                    </strong>{" "}
                    of <strong className="text-foreground">{notifTotalCount}</strong> notifications (
                    <span className="font-semibold text-primary">10 per page</span>)
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={notifPage <= 1 || isNotifsLoading}
                      onClick={() => {
                        const newPage = Math.max(1, notifPage - 1);
                        setNotifPage(newPage);
                        fetchNotifications(newPage);
                      }}
                      className="text-xs font-bold h-8 gap-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </Button>

                    {/* Dynamic page number buttons */}
                    {Array.from({ length: Math.min(5, notifTotalPages) }, (_, i) => {
                      let pageNum = i + 1;
                      if (notifTotalPages > 5 && notifPage > 3) {
                        pageNum = Math.min(
                          notifTotalPages - 4 + i,
                          Math.max(notifPage - 2 + i, i + 1)
                        );
                      }
                      if (pageNum < 1 || pageNum > notifTotalPages) return null;
                      const isActive = notifPage === pageNum;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => {
                            setNotifPage(pageNum);
                            fetchNotifications(pageNum);
                          }}
                          disabled={isNotifsLoading}
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

                    {notifTotalPages > 5 && notifPage < notifTotalPages - 2 && (
                      <span className="px-1 text-muted-foreground">…</span>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={notifPage >= notifTotalPages || isNotifsLoading}
                      onClick={() => {
                        const newPage = Math.min(notifTotalPages, notifPage + 1);
                        setNotifPage(newPage);
                        fetchNotifications(newPage);
                      }}
                      className="text-xs font-bold h-8 gap-1"
                    >
                      Next <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Templates Tab */}
              {activeSubnav === "templates" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "Welcome New User", trigger: "On Sign-up", channels: "Email, Push", icon: "👋", color: "text-blue-500" },
                    { name: "Business Verification Approved", trigger: "On Verification", channels: "Email, In-App", icon: "✅", color: "text-emerald-500" },
                    { name: "Claim Ownership Verified", trigger: "On Claim Approval", channels: "Email, SMS", icon: "🏢", color: "text-purple-500" },
                    { name: "Weekly Director Digest", trigger: "Every Monday 07:00 EAT", channels: "Email", icon: "📋", color: "text-amber-500" },
                    { name: "Payment Settlement Confirmed", trigger: "On Payment Success", channels: "Email, In-App", icon: "💰", color: "text-green-500" },
                    { name: "Security Alert: Unusual Activity", trigger: "On Anomaly Detection", channels: "Email, SMS, Push", icon: "🛡️", color: "text-red-500" },
                  ].map((t, i) => (
                    <div key={i} className="p-5 rounded-3xl bg-card border border-border hover:border-primary/30 transition-all space-y-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{t.icon}</span>
                        <div>
                          <div className={`font-bold text-foreground text-sm`}>{t.name}</div>
                          <div className="text-xs text-muted-foreground">Trigger: <strong className="text-foreground">{t.trigger}</strong></div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">Delivery Channels: <span className="text-foreground font-semibold">{t.channels}</span></div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-[11px] font-bold"
                        onClick={() => toast.info(`Editing template: ${t.name}`)}
                      >
                        Edit Template
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modals: Register Notification & Detail */}
          <RegisterNotificationModal
            isOpen={isRegisterNotifModalOpen}
            onClose={() => setIsRegisterNotifModalOpen(false)}
            onNotificationRegistered={(notif) => {
              setNotificationsList((prev) => [notif, ...prev]);
              setNotifTotalCount((c) => c + 1);
              if (notifStats) setNotifStats({ ...notifStats, total: notifStats.total + 1 });
              setActiveSubnav("all");
              fetchNotifications(1);
            }}
            currentSenderName={isSuperAdmin ? "Alex Rivera (Super Admin)" : "Marcus Vance (Admin)"}
            defaultTarget="global"
          />

          <NotificationDetailModal
            isOpen={!!selectedNotifForDetail}
            onClose={() => setSelectedNotifForDetail(null)}
            notification={selectedNotifForDetail}
            onDelete={handleDeleteNotification}
          />

          {/* ════════════════════════════════════════════════════════════════════
              13. 🎫 SUPPORT DESK (20 ITEMS PER PAGE SERVER PAGINATION)
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "support" && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Header with Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">
                      Support Desk &amp; SLA Incident Queue
                    </h2>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                      {ticketTotalCount} Total Tickets
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Real-time omnichannel support triage: Customer inquiries, verification delays, billing disputes, and technical support.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchTickets(ticketPage)}
                    disabled={isTicketsLoading}
                    className="text-xs font-bold gap-1.5 h-8"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTicketsLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>

                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setIsCreateTicketModalOpen(true)}
                    className="gap-1.5 text-xs font-bold h-8 shadow-md shadow-emerald-500/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Support Ticket
                  </Button>
                </div>
              </div>

              {/* KPI Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="text-[10px] font-bold uppercase tracking-wider">All Tickets</span>
                    <Ticket className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {ticketStats?.total ?? ticketTotalCount}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">Platform incidents logged</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-red-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Open</span>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-red-600 mt-2 font-mono">
                    {ticketStats?.open ?? 0}
                  </div>
                  <div className="text-[10px] text-red-600 dark:text-red-400 mt-1">Awaiting triage</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-purple-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {ticketStats?.inProgress ?? 0}
                  </div>
                  <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">Active case handling</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-amber-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Waiting on User</span>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {ticketStats?.waiting ?? 0}
                  </div>
                  <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">Pending user reply</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-emerald-500">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Resolved</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-foreground mt-2 font-mono">
                    {ticketStats?.resolved ?? 0}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">Successfully closed</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/80 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between text-red-600">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Critical SLA</span>
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-2xl font-black text-red-600 mt-2 font-mono">
                    {ticketStats?.critical ?? 0}
                  </div>
                  <div className="text-[10px] text-red-600 font-bold mt-1">High urgency queue</div>
                </div>
              </div>

              {/* Subnav Classification Tabs */}
              {renderSubnavTabs([
                { key: "all", label: "All Tickets", count: ticketStats?.total ?? ticketTotalCount },
                { key: "open", label: "Open Queue", count: ticketStats?.open ?? 0 },
                { key: "in_progress", label: "In Progress", count: ticketStats?.inProgress ?? 0 },
                { key: "waiting_on_customer", label: "Waiting on Customer", count: ticketStats?.waiting ?? 0 },
                { key: "resolved", label: "Resolved", count: ticketStats?.resolved ?? 0 },
                { key: "closed", label: "Closed Archive", count: ticketStats?.closed ?? 0 },
              ])}

              {/* Filtering Toolbar */}
              <div className="p-3.5 rounded-2xl bg-card border border-border/80 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={ticketSearch}
                      onChange={(e) => {
                        setTicketSearch(e.target.value);
                        setTicketPage(1);
                      }}
                      placeholder="Search tickets by subject, user, email, business, or #ID..."
                      className="pl-8 text-xs h-9 rounded-xl"
                    />
                  </div>
                  {ticketSearch && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTicketSearch("");
                        setTicketPage(1);
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
                    value={ticketCategoryFilter}
                    onChange={(e) => {
                      setTicketCategoryFilter(e.target.value);
                      setTicketPage(1);
                    }}
                    className="h-9 px-3 rounded-xl bg-background border border-border text-xs font-semibold text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="all">All Categories</option>
                    <option value="verification">Verification</option>
                    <option value="billing">Billing &amp; Finance</option>
                    <option value="technical">Technical</option>
                    <option value="listing">Listing &amp; Catalog</option>
                    <option value="dispute">Disputes &amp; Reviews</option>
                    <option value="account">Account Access</option>
                    <option value="general">General</option>
                  </select>

                  {/* Priority Filter */}
                  <select
                    value={ticketPriorityFilter}
                    onChange={(e) => {
                      setTicketPriorityFilter(e.target.value);
                      setTicketPage(1);
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

              {/* Tickets Table (20 per page) */}
              <div className="rounded-3xl bg-card border border-border overflow-hidden shadow-xs relative">
                {isTicketsLoading && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-xs z-10 flex items-center justify-center">
                    <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-2xl shadow border border-border text-xs font-bold text-muted-foreground">
                      <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                      <span>Loading support desk tickets…</span>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                      <tr>
                        <th className="px-5 py-3.5">Ticket #</th>
                        <th className="px-5 py-3.5">Requester</th>
                        <th className="px-5 py-3.5">Business &amp; Territory</th>
                        <th className="px-5 py-3.5">Subject &amp; Message</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Priority</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Assigned To</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {ticketsList.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-16 text-center text-muted-foreground">
                            <Ticket className="w-10 h-10 mx-auto text-muted-foreground/40 mb-2" />
                            <div className="font-bold text-foreground">No support tickets found</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              Try clearing search filters or changing the active status tab.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        ticketsList.map((t) => (
                          <tr
                            key={t.id}
                            className="hover:bg-accent/20 transition-colors cursor-pointer group"
                            onClick={() => setSelectedTicketForDetail(t)}
                          >
                            {/* Ticket ID */}
                            <td className="px-5 py-3.5 font-mono font-bold text-primary whitespace-nowrap">
                              <span className="bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                                {t.id}
                              </span>
                            </td>

                            {/* Requester */}
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-foreground">{t.userName}</div>
                              <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                                {t.userEmail}
                              </div>
                            </td>

                            {/* Business & Territory */}
                            <td className="px-5 py-3.5">
                              <div className="font-semibold text-foreground truncate max-w-[160px]">
                                {t.businessName || "Individual User"}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {t.city || "Addis Ababa"}, {t.country || "Ethiopia"}
                              </div>
                            </td>

                            {/* Subject & Preview */}
                            <td className="px-5 py-3.5 max-w-xs">
                              <div className="font-bold text-foreground truncate">{t.subject}</div>
                              <div className="text-[11px] text-muted-foreground truncate line-clamp-1 mt-0.5">
                                {t.lastReply || (t.messages && t.messages[0]?.message) || "No conversation yet"}
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-5 py-3.5">
                              <Badge variant="outline" className="capitalize text-[10px] font-bold">
                                {t.category}
                              </Badge>
                            </td>

                            {/* Priority */}
                            <td className="px-5 py-3.5">
                              {t.priority === "critical" && (
                                <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[9px] font-black animate-pulse">
                                  🚨 Critical
                                </Badge>
                              )}
                              {t.priority === "high" && (
                                <Badge className="bg-orange-500/15 text-orange-600 border-orange-500/30 text-[9px] font-bold">
                                  🔥 High
                                </Badge>
                              )}
                              {t.priority === "medium" && (
                                <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 text-[9px] font-bold">
                                  🔵 Medium
                                </Badge>
                              )}
                              {t.priority === "low" && (
                                <Badge variant="outline" className="text-[9px] text-muted-foreground">
                                  ⚪ Low
                                </Badge>
                              )}
                            </td>

                            {/* Status */}
                            <td className="px-5 py-3.5">
                              {t.status === "open" && (
                                <Badge className="bg-red-500/15 text-red-600 border-red-500/30 text-[10px] font-bold">
                                  🔴 Open
                                </Badge>
                              )}
                              {t.status === "in_progress" && (
                                <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30 text-[10px] font-bold">
                                  ⚡ In Progress
                                </Badge>
                              )}
                              {t.status === "waiting_on_customer" && (
                                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-bold">
                                  ⏳ Waiting
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
                            </td>

                            {/* Assigned Admin */}
                            <td className="px-5 py-3.5">
                              <span className="text-[11px] font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-lg border border-border">
                                {t.assignedAdmin || "Unassigned"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td
                              className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] font-bold"
                                onClick={() => setSelectedTicketForDetail(t)}
                              >
                                <Eye className="w-3 h-3 text-primary mr-1" />
                                Inspect
                              </Button>

                              {t.status !== "resolved" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-[11px] font-bold text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/support/tickets/${encodeURIComponent(t.id)}`, {
                                        method: "PATCH",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ status: "resolved" }),
                                      });
                                      const data = await res.json();
                                      if (data?.success) {
                                        toast.success(`Ticket ${t.id} marked as Resolved.`);
                                        fetchTickets(ticketPage);
                                      }
                                    } catch (e) {
                                      toast.error("Failed to resolve ticket");
                                    }
                                  }}
                                >
                                  Resolve
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ─── 20-ITEMS-PER-PAGE PAGINATION CONTROLS ───────────────────── */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border text-xs text-muted-foreground">
                <div>
                  Showing{" "}
                  <strong className="text-foreground">
                    {ticketTotalCount === 0 ? 0 : (ticketPage - 1) * TICKETS_PER_PAGE + 1}
                  </strong>{" "}
                  to{" "}
                  <strong className="text-foreground">
                    {Math.min(ticketPage * TICKETS_PER_PAGE, ticketTotalCount)}
                  </strong>{" "}
                  of <strong className="text-foreground">{ticketTotalCount}</strong> tickets (
                  <span className="font-semibold text-primary">20 per page</span>)
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Previous Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ticketPage <= 1 || isTicketsLoading}
                    onClick={() => {
                      const prevPage = Math.max(1, ticketPage - 1);
                      setTicketPage(prevPage);
                      fetchTickets(prevPage);
                    }}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>

                  {/* Dynamic Page Number Buttons */}
                  {Array.from({ length: Math.min(5, ticketTotalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (ticketTotalPages > 5 && ticketPage > 3) {
                      pageNum = Math.min(
                        ticketTotalPages - 4 + i,
                        Math.max(ticketPage - 2 + i, i + 1)
                      );
                    }
                    if (pageNum < 1 || pageNum > ticketTotalPages) return null;
                    const isActive = ticketPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setTicketPage(pageNum);
                          fetchTickets(pageNum);
                        }}
                        disabled={isTicketsLoading}
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

                  {ticketTotalPages > 5 && ticketPage < ticketTotalPages - 2 && (
                    <span className="px-1 text-muted-foreground">…</span>
                  )}

                  {/* Next Button */}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={ticketPage >= ticketTotalPages || isTicketsLoading}
                    onClick={() => {
                      const nextPage = Math.min(ticketTotalPages, ticketPage + 1);
                      setTicketPage(nextPage);
                      fetchTickets(nextPage);
                    }}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Support Ticket Modals */}
          <SupportTicketDetailModal
            isOpen={!!selectedTicketForDetail}
            onClose={() => setSelectedTicketForDetail(null)}
            ticket={selectedTicketForDetail}
            currentUserName={isSuperAdmin ? "Alex Rivera (Super Admin)" : "Marcus Vance (Admin)"}
            currentUserRole={isSuperAdmin ? "super_admin" : "admin"}
            onTicketUpdated={(updated) => {
              setSelectedTicketForDetail(updated);
              setTicketsList((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
              fetchTickets(ticketPage);
            }}
            onTicketDeleted={(id) => {
              setSelectedTicketForDetail(null);
              setTicketsList((prev) => prev.filter((t) => t.id !== id));
              setTicketTotalCount((c) => Math.max(0, c - 1));
              fetchTickets(ticketPage);
            }}
          />

          <CreateSupportTicketModal
            isOpen={isCreateTicketModalOpen}
            onClose={() => setIsCreateTicketModalOpen(false)}
            onTicketCreated={(newTicket) => {
              setTicketsList((prev) => [newTicket, ...prev]);
              setTicketTotalCount((c) => c + 1);
              fetchTickets(1);
            }}
            defaultUserId="admin_manual"
            defaultUserName={isSuperAdmin ? "Alex Rivera (Super Admin)" : "Marcus Vance (Admin)"}
            defaultUserEmail="admin@bizfinder.et"
            defaultUserRole={isSuperAdmin ? "super_admin" : "admin"}
          />

          {/* ════════════════════════════════════════════════════════════════════
              14. ⚙️ SETTINGS
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "settings" && (
            <AdminSettingsView
              isSuperAdmin={isSuperAdmin}
              currentRole={currentRole}
              assignedCountry={geoSelectedCountry}
              assignedCity={geoSelectedCity}
              initialSubnav={activeSubnav}
            />
          )}

          {/* ════════════════════════════════════════════════════════════════════
              15. 🔐 SECURITY
             ════════════════════════════════════════════════════════════════════ */}
          {activeNav === "security" && (
            <SecurityWorkstation
              portalType="super_admin"
              currentUserName={isSuperAdmin ? "Alex Rivera (Super Admin)" : "Marcus Vance (Admin)"}
              currentUserRole={geoScopeRole}
              initialSubnav={activeSubnav === "security" ? "audit" : activeSubnav}
            />
          )}

          </div>{/* end animate-page-enter */}
          </div>{/* end p-6 sm:p-8 */}
        </main>
      </div>


      {/* ─── Modals ────────────────────────────────────────────────────────── */}
      <BusinessDetailDrawer
        isOpen={!!inspectingBusiness}
        business={inspectingBusiness}
        onClose={() => setInspectingBusiness(null)}
        onApprove={handleApproveBusiness}
        onReject={handleRejectBusiness}
      />

      <CreateAdminModal
        isOpen={isCreateAdminModalOpen}
        onClose={() => setIsCreateAdminModalOpen(false)}
        onAdminCreated={(newAdmin) => {
          setAdminList((prev) => [
            newAdmin,
            ...prev.filter((a) => a.email.toLowerCase() !== newAdmin.email.toLowerCase()),
          ]);
          const newUserItem: AdminUserItem = {
            id: newAdmin.id,
            name: newAdmin.name,
            email: newAdmin.email,
            role: newAdmin.role,
            country: "Global",
            status: newAdmin.status === "active" ? "active" : "suspended",
            joinedAt: "Just now",
          };
          setUsersList((prev) => [
            newUserItem,
            ...prev.filter((u) => u.email.toLowerCase() !== newAdmin.email.toLowerCase()),
          ]);
          setActiveNav("users");
          setActiveSubnav("admins");
        }}
      />

      <SystemHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />

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

      {isAddLocModalOpen && (
        <AddLocationModal
          isOpen={isAddLocModalOpen}
          onClose={() => setIsAddLocModalOpen(false)}
          locations={locations}
          onAddLocation={(newLoc) => {
            setLocations((prev) => [newLoc, ...prev]);
            setIsAddLocModalOpen(false);
          }}
        />
      )}

      {editingLocation && (
        <EditLocationModal
          isOpen={!!editingLocation}
          location={editingLocation}
          locations={locations}
          onClose={() => setEditingLocation(null)}
          onUpdateLocation={(upLoc) => {
            setLocations((prev) => prev.map((l) => (l.id === upLoc.id ? upLoc : l)));
            setEditingLocation(null);
          }}
        />
      )}

      {editingBusiness && (
        <EditBusinessModal
          isOpen={!!editingBusiness}
          business={editingBusiness}
          onClose={() => setEditingBusiness(null)}
          onUpdateBusiness={async (upBiz) => {
            setBusinesses((prev) => prev.map((b) => (b.id === upBiz.id ? upBiz : b)));
            setEditingBusiness(null);
            try {
              await fetch(`/api/businesses/${upBiz.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(upBiz),
              });
              toast.success(`Business "${upBiz.name}" updated in MongoDB!`);
            } catch (e) {
              console.error("Failed to update business:", e);
            }
          }}
        />
      )}

      {/* Super Admin Geo-Admin & Clerk Assignment Modal */}
      {isAssignGeoModalOpen && (
        <AssignGeoAdminModal
          isOpen={isAssignGeoModalOpen}
          onClose={() => setIsAssignGeoModalOpen(false)}
          onAdminAssigned={() => {
            fetchUsers(userPage, true);
            fetchDashboardStats();
            fetch("/api/admin/admins")
              .then((res) => res.json())
              .then((data) => {
                if (data?.admins && Array.isArray(data.admins)) {
                  setAdminList(data.admins);
                }
              })
              .catch(() => {});
          }}
          currentAdminRole={geoScopeRole}
          initialCountry={geoSelectedCountry === "all" ? "Ethiopia" : geoSelectedCountry}
          initialCity={geoSelectedCity === "all" ? "" : geoSelectedCity}
        />
      )}

      {/* Real Clerk User Profile Modal */}
      <Dialog open={!!viewingUser} onOpenChange={(open) => !open && setViewingUser(null)}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6 bg-card border border-border shadow-2xl">
          <DialogTitle className="sr-only">User Profile Details</DialogTitle>
          <DialogDescription className="sr-only">Detailed profile information from Clerk and MongoDB</DialogDescription>
          {viewingUser && (
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center gap-4">
                {viewingUser.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={viewingUser.avatarUrl}
                    alt={viewingUser.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary/30 shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/30 to-primary/10 text-primary font-black text-xl flex items-center justify-center border border-primary/20 shrink-0">
                    {viewingUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{viewingUser.name}</h3>
                    {viewingUser.isClerkSynced && (
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        ✓ Clerk Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">{viewingUser.email}</p>
                  <div className="mt-1">
                    <Badge
                      className={
                        viewingUser.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold"
                          : "bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold"
                      }
                    >
                      {viewingUser.status === "active" ? "🟢 Active Account" : "🔴 Suspended"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Profile Details List */}
              <div className="space-y-3 rounded-2xl bg-muted/40 p-4 border border-border text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Clerk User ID</span>
                  <div className="flex items-center gap-1 font-mono font-bold text-foreground">
                    <span className="text-[11px] truncate max-w-[180px]">{viewingUser.id}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(viewingUser.id);
                        toast.success("Clerk ID copied to clipboard!");
                      }}
                      className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">System Role</span>
                  <span className="font-bold capitalize text-foreground">{viewingUser.role.replace("_", " ")}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground font-medium">Territory / Jurisdiction</span>
                  <span className="font-bold text-foreground">{viewingUser.country || "Global"}</span>
                </div>

                {viewingUser.phone && (
                  <div className="flex items-center justify-between py-1 border-b border-border/50">
                    <span className="text-muted-foreground font-medium">Phone</span>
                    <span className="font-bold font-mono text-foreground">{viewingUser.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1">
                  <span className="text-muted-foreground font-medium">Member Since</span>
                  <span className="font-bold text-foreground">{viewingUser.joinedAt}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setViewingUser(null)}
                  className="text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant={viewingUser.status === "active" ? "destructive" : "default"}
                  onClick={() => handleToggleUser(viewingUser.id, viewingUser.status)}
                  className="text-xs font-bold"
                >
                  {viewingUser.status === "active" ? "Suspend User" : "Activate User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add / Register Actual Review Modal */}
      <AddReviewModal
        isOpen={isAddReviewModalOpen}
        onClose={() => setIsAddReviewModalOpen(false)}
        onReviewRegistered={() => {
          fetchReviews(1);
        }}
      />

      {/* Register Actual Media Modal */}
      <RegisterMediaModal
        isOpen={isRegisterMediaModalOpen}
        onClose={() => setIsRegisterMediaModalOpen(false)}
        businesses={businesses}
        onMediaRegistered={() => {
          fetchMedia(1);
          setMediaPage(1);
        }}
      />

      {/* Media Lightbox Viewer Modal */}
      <MediaLightboxModal
        isOpen={Boolean(lightboxMedia)}
        onClose={() => setLightboxMedia(null)}
        media={lightboxMedia}
        onApprove={handleApproveMedia}
        onReport={handleReportMedia}
        onDelete={handleDeleteMedia}
      />

      {/* Register Actual Payment Modal */}
      <RegisterPaymentModal
        isOpen={isRegisterPaymentModalOpen}
        onClose={() => setIsRegisterPaymentModalOpen(false)}
        businessesList={businesses}
        currentAdminName={isSuperAdmin ? "Alex Rivera (Super Admin)" : "Marcus Vance (Admin)"}
        onPaymentRegistered={() => {
          fetchPayments(1);
          setPayPage(1);
        }}
      />

      {/* Payment Receipt / Invoice Modal */}
      <PaymentReceiptModal
        payment={selectedPaymentForReceipt}
        isOpen={Boolean(selectedPaymentForReceipt)}
        onClose={() => setSelectedPaymentForReceipt(null)}
        onStatusUpdated={(id, status) => {
          setPaymentsList((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status } : p))
          );
          fetchPayments(payPage);
        }}
      />

      {/* Register Real Analytics Event Modal */}
      <RegisterAnalyticsModal
        isOpen={isRegisterAnalyticsModalOpen}
        onClose={() => setIsRegisterAnalyticsModalOpen(false)}
        businessesList={businesses}
        currentAdminName={isSuperAdmin ? "Alex Rivera (Super Admin)" : "Marcus Vance (Admin)"}
        onAnalyticsRegistered={() => {
          fetchAnalytics(1);
          setAnalyticsPage(1);
        }}
      />

      {/* Register Real Incident / Report Modal */}
      <RegisterReportModal
        isOpen={isRegisterReportModalOpen}
        onClose={() => setIsRegisterReportModalOpen(false)}
        businessesList={businesses}
        currentAdminName={isSuperAdmin ? "Alex Rivera (Super Admin)" : "Marcus Vance (Admin)"}
        onReportRegistered={(newReport) => {
          fetchReports(1);
          setReportPage(1);
        }}
      />

      {/* Incident Investigation & Moderation Dossier Modal */}
      <ReportDetailModal
        isOpen={Boolean(selectedReportForDetail)}
        onClose={() => setSelectedReportForDetail(null)}
        report={selectedReportForDetail}
        currentAdminName={isSuperAdmin ? "Alex Rivera (Super Admin)" : "Marcus Vance (Admin)"}
        onStatusUpdated={(updated) => {
          setReportsList((prev) =>
            prev.map((r) => (r.id === updated.id ? updated : r))
          );
          fetchReports(reportPage);
        }}
      />
    </div>

  );
}
