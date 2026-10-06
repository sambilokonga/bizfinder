"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Globe,
  Building2,
  Shield,
  Crown,
  Search,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Users,
  MapPin,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  UserPlus,
  RefreshCw,
  SlidersHorizontal,
  Download,
  Layers,
  Check,
  X,
  FileSpreadsheet,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { COUNTRIES_WITH_CITIES, getCitiesForCountry } from "@/lib/data/countries-cities";
import { AssignGeoAdminModal } from "@/components/admin/AssignGeoAdminModal";
import { GeoAdminRecord } from "@/app/api/admin/geo-admins/route";
import { TerritoryMap, TerritoryMapPin } from "@/components/admin/TerritoryMap";
import { toast } from "sonner";

export interface TerritoryNodeRecord {
  id: string;
  _id?: string;
  name: string;
  type: "country" | "region" | "zone" | "woreda" | "city" | "subcity" | "district" | string;
  parentId?: string | null;
  latitude: number;
  longitude: number;
  countryCode?: string;
  businessCount?: number;
  updatedAt?: string;
}

interface TerritoryAdministrationViewProps {
  currentRole: "super_admin" | "country_admin" | "city_admin" | "admin";
  currentCountry?: string;
  currentCity?: string;
  onRoleChange?: (role: "super_admin" | "country_admin" | "city_admin" | "admin") => void;
  onCountryChange?: (country: string) => void;
  onCityChange?: (city: string) => void;
}

export function TerritoryAdministrationView({
  currentRole,
  currentCountry = "Ethiopia",
  currentCity = "Addis Ababa",
  onRoleChange,
  onCountryChange,
  onCityChange,
}: TerritoryAdministrationViewProps) {
  // Main view tabs: 1. Map Radar | 2. Hierarchy Tree | 3. Country Leads (195) | 4. City Admins (30/country) | 5. Operations & Sync
  const [activeTab, setActiveTab] = useState<
    "map_radar" | "hierarchy_tree" | "country_leads" | "city_admins" | "operations_sync"
  >("map_radar");

  // Live Data Lists from DB
  const [territoriesList, setTerritoriesList] = useState<TerritoryNodeRecord[]>([]);
  const [adminsList, setAdminsList] = useState<GeoAdminRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClerkSyncing, setIsClerkSyncing] = useState(false);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "assigned" | "unassigned">("all");
  const [selectedCountryForCities, setSelectedCountryForCities] = useState(
    currentRole === "country_admin" ? currentCountry : "Ethiopia"
  );
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | undefined>(undefined);

  // Modal: Assign Admin
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [modalRole, setModalRole] = useState<"country_admin" | "city_admin">("country_admin");
  const [modalCountry, setModalCountry] = useState(currentCountry);
  const [modalCity, setModalCity] = useState("");

  // Modal: Add / Edit Territory Node (DB CRUD)
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [nodeModalMode, setNodeModalMode] = useState<"create" | "edit">("create");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [nodeFormName, setNodeFormName] = useState("");
  const [nodeFormType, setNodeFormType] = useState("subcity");
  const [nodeFormParentId, setNodeFormParentId] = useState("");
  const [nodeFormLatitude, setNodeFormLatitude] = useState(9.010793);
  const [nodeFormLongitude, setNodeFormLongitude] = useState(38.761252);
  const [nodeFormCountryCode, setNodeFormCountryCode] = useState("ET");

  const isSuperAdmin = currentRole === "super_admin";
  const isCountryAdmin = currentRole === "country_admin";
  const isCityAdmin = currentRole === "city_admin";

  // ─── Fetch Data ─────────────────────────────────────────────────────────────
  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [terrRes, admRes] = await Promise.all([
        fetch("/api/admin/territories"),
        fetch("/api/admin/geo-admins"),
      ]);

      const terrData = await terrRes.json();
      const admData = await admRes.json();

      if (terrData.territories) {
        setTerritoriesList(terrData.territories);
      }
      if (admData.admins) {
        setAdminsList(admData.admins);
      }
    } catch (e) {
      console.error("Failed to load territory administration data", e);
      toast.error("Failed to load territory data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // ─── Mapping Dictionaries ──────────────────────────────────────────────────
  const countryAdminMap = useMemo(() => {
    const map = new Map<string, GeoAdminRecord>();
    adminsList
      .filter((a) => a.role === "country_admin" && a.assignedCountry)
      .forEach((a) => {
        map.set(a.assignedCountry!.toLowerCase(), a);
      });
    return map;
  }, [adminsList]);

  const cityAdminMap = useMemo(() => {
    const map = new Map<string, GeoAdminRecord>();
    adminsList
      .filter((a) => a.role === "city_admin" && a.assignedCountry && a.assignedCity)
      .forEach((a) => {
        const key = `${a.assignedCountry!.toLowerCase()}::${a.assignedCity!.toLowerCase()}`;
        map.set(key, a);
      });
    return map;
  }, [adminsList]);

  // ─── Map Pins Assembly ─────────────────────────────────────────────────────
  const mapPins: TerritoryMapPin[] = useMemo(() => {
    return territoriesList.map((t) => {
      let assignedAdmin: any = undefined;
      if (t.type === "country") {
        assignedAdmin = countryAdminMap.get(t.name.toLowerCase());
      } else if (t.type === "city") {
        const parentCountry = territoriesList.find((p) => p.id === t.parentId)?.name || "Ethiopia";
        const key = `${parentCountry.toLowerCase()}::${t.name.toLowerCase()}`;
        assignedAdmin = cityAdminMap.get(key);
      }

      return {
        id: t.id,
        name: t.name,
        type: t.type,
        latitude: t.latitude,
        longitude: t.longitude,
        countryCode: t.countryCode,
        flag: t.type === "country" ? COUNTRIES_WITH_CITIES.find((c) => c.name.toLowerCase() === t.name.toLowerCase())?.flag : undefined,
        assignedAdmin: assignedAdmin
          ? {
              name: assignedAdmin.name,
              email: assignedAdmin.email,
              role: assignedAdmin.role,
            }
          : undefined,
        businessCount: t.businessCount ?? 0,
      };
    });
  }, [territoriesList, countryAdminMap, cityAdminMap]);

  // ─── Telemetry Calculations ────────────────────────────────────────────────
  const totalAssignedCountries = countryAdminMap.size;
  const totalCountries = COUNTRIES_WITH_CITIES.length; // 195
  const countryCoveragePercent = ((totalAssignedCountries / totalCountries) * 100).toFixed(1);
  const totalAssignedCityAdmins = adminsList.filter((a) => a.role === "city_admin").length;
  const totalBusinessesMapped = territoriesList.reduce((acc, t) => acc + (t.businessCount || 0), 0);

  // ─── Node CRUD Handlers ────────────────────────────────────────────────────
  const handleOpenCreateNode = (defaultParent?: string, defaultType: string = "subcity") => {
    setNodeModalMode("create");
    setEditingNodeId(null);
    setNodeFormName("");
    setNodeFormType(defaultType);
    setNodeFormParentId(defaultParent || "");
    setNodeFormLatitude(9.010793);
    setNodeFormLongitude(38.761252);
    setNodeFormCountryCode(isCountryAdmin ? "ET" : "ET");
    setIsNodeModalOpen(true);
  };

  const handleOpenEditNode = (node: TerritoryNodeRecord) => {
    setNodeModalMode("edit");
    setEditingNodeId(node.id);
    setNodeFormName(node.name);
    setNodeFormType(node.type);
    setNodeFormParentId(node.parentId || "");
    setNodeFormLatitude(node.latitude);
    setNodeFormLongitude(node.longitude);
    setNodeFormCountryCode(node.countryCode || "ET");
    setIsNodeModalOpen(true);
  };

  const handleSaveNode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeFormName.trim()) {
      toast.error("Please enter a territory name.");
      return;
    }

    try {
      if (nodeModalMode === "create") {
        const res = await fetch("/api/admin/territories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nodeFormName.trim(),
            type: nodeFormType,
            parentId: nodeFormParentId || null,
            latitude: Number(nodeFormLatitude),
            longitude: Number(nodeFormLongitude),
            countryCode: nodeFormCountryCode,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || `Territory "${nodeFormName}" added successfully!`);
          setIsNodeModalOpen(false);
          fetchAllData();
        } else {
          toast.error(data.error || "Failed to create territory node.");
        }
      } else {
        const res = await fetch("/api/admin/territories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingNodeId,
            name: nodeFormName.trim(),
            type: nodeFormType,
            parentId: nodeFormParentId || null,
            latitude: Number(nodeFormLatitude),
            longitude: Number(nodeFormLongitude),
            countryCode: nodeFormCountryCode,
          }),
        });
        const data = await res.json();
        if (data.success) {
          toast.success(data.message || "Territory updated successfully!");
          setIsNodeModalOpen(false);
          fetchAllData();
        } else {
          toast.error(data.error || "Failed to update territory.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while saving territory.");
    }
  };

  const handleDeleteNode = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the territory "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/territories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Territory "${name}" deleted.`);
        fetchAllData();
      } else {
        toast.error(data.error || "Failed to delete territory.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error deleting territory.");
    }
  };

  const handleRevokeAdmin = async (adminId: string, name: string) => {
    if (!confirm(`Revoke administrative jurisdiction for ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/geo-admins?id=${adminId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Jurisdiction revoked for ${name}.`);
        fetchAllData();
      } else {
        toast.error("Failed to revoke administrator.");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to revoke admin.");
    }
  };

  const openAssignModal = (
    role: "country_admin" | "city_admin",
    countryName: string,
    cityName?: string
  ) => {
    setModalRole(role);
    setModalCountry(countryName);
    setModalCity(cityName || "");
    setIsAssignModalOpen(true);
  };

  // ─── Filtered Country Roster (195 Nations) ──────────────────────────────────
  const filteredCountries = useMemo(() => {
    return COUNTRIES_WITH_CITIES.filter((c) => {
      const isAssigned = countryAdminMap.has(c.name.toLowerCase());
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        countryAdminMap.get(c.name.toLowerCase())?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        countryAdminMap.get(c.name.toLowerCase())?.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterStatus === "assigned") return isAssigned;
      if (filterStatus === "unassigned") return !isAssigned;
      return true;
    });
  }, [searchQuery, filterStatus, countryAdminMap]);

  // ─── Filtered City Roster (30 Cities) ──────────────────────────────────────
  const selectedCountryCities = useMemo(() => {
    return getCitiesForCountry(selectedCountryForCities);
  }, [selectedCountryForCities]);

  const filteredCities = useMemo(() => {
    return selectedCountryCities.filter((city) => {
      const key = `${selectedCountryForCities.toLowerCase()}::${city.toLowerCase()}`;
      const isAssigned = cityAdminMap.has(key);
      const matchesSearch =
        city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cityAdminMap.get(key)?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cityAdminMap.get(key)?.email.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (filterStatus === "assigned") return isAssigned;
      if (filterStatus === "unassigned") return !isAssigned;
      return true;
    });
  }, [selectedCountryCities, selectedCountryForCities, searchQuery, filterStatus, cityAdminMap]);

  // ─── Filtered Hierarchy Tree ───────────────────────────────────────────────
  const filteredHierarchyNodes = useMemo(() => {
    return territoriesList.filter((node) => {
      if (filterType !== "all" && node.type !== filterType) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          node.name.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query) ||
          (node.countryCode && node.countryCode.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [territoriesList, filterType, searchQuery]);

  // ─── Export Roster to CSV ──────────────────────────────────────────────────
  const handleExportCSV = () => {
    const rows = [
      ["Territory ID", "Name", "Type", "Parent ID", "Latitude", "Longitude", "Country Code", "Business Count"],
      ...territoriesList.map((t) => [
        t.id,
        `"${t.name}"`,
        t.type,
        t.parentId || "",
        t.latitude,
        t.longitude,
        t.countryCode || "",
        t.businessCount || 0,
      ]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `BizFinder_Territories_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Territory roster exported to CSV!");
  };

  return (
    <div className="space-y-6">
      {/* ═══════════════════════════════════════════════════════════════════════
          1. HERO COMMAND BAR — JURISDICTION & AUTHORITY BADGES
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-3xl border border-border bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl shadow-inner shrink-0">
              {isSuperAdmin && "👑"}
              {isCountryAdmin && (COUNTRIES_WITH_CITIES.find((c) => c.name === currentCountry)?.flag || "🌍")}
              {isCityAdmin && "🏙️"}
              {currentRole === "admin" && "🛡️"}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>Territory Administration & Geo-Governance</span>
                </h1>
                <Badge
                  variant="outline"
                  className="bg-white/10 text-white border-white/30 text-xs font-bold py-1 px-3"
                >
                  {isSuperAdmin && "👑 Worldwide Sovereign Authority (195 Nations)"}
                  {isCountryAdmin && `🌍 National Lead (${currentCountry})`}
                  {isCityAdmin && `🏙️ Municipal Lead (${currentCity})`}
                  {currentRole === "admin" && "🛡️ Operations Jurisdiction"}
                </Badge>
              </div>

              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                {isSuperAdmin &&
                  "Direct unrestricted global command. Manage territorial nodes across all 195 nations, appoint Country Main Admins, oversee municipal delegations, and enforce platform zoning rules."}
                {isCountryAdmin &&
                  `National sovereign oversight for ${currentCountry}. Manage all 30 municipal districts, appoint and oversee City Admins, and direct local business verification.`}
                {isCityAdmin &&
                  `Municipal jurisdiction for ${currentCity}, ${currentCountry}. Regulate subcities, zones, neighborhood clusters, and manage local directory listings.`}
                {currentRole === "admin" &&
                  "Operations administrative portal with full territorial moderation and geographic node inspection."}
              </p>
            </div>
          </div>

          {/* Super Admin Perspective Controls */}
          {isSuperAdmin && onRoleChange && (
            <div className="flex flex-wrap items-center gap-2 bg-black/40 backdrop-blur-md p-2 rounded-2xl border border-white/10 text-xs">
              <span className="text-[11px] font-bold text-slate-400 pl-2">Simulate Scope:</span>
              <button
                type="button"
                onClick={() => {
                  onRoleChange("super_admin");
                  if (onCountryChange) onCountryChange("all");
                  if (onCityChange) onCityChange("all");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  currentRole === "super_admin" ? "bg-primary text-white shadow" : "text-slate-300 hover:text-white"
                }`}
              >
                👑 Global
              </button>
              <button
                type="button"
                onClick={() => {
                  onRoleChange("country_admin");
                  if (onCountryChange) onCountryChange("Ethiopia");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  (currentRole as string) === "country_admin" ? "bg-amber-500 text-slate-950 shadow" : "text-slate-300 hover:text-white"
                }`}
              >
                🌍 National Lead
              </button>
              <button
                type="button"
                onClick={() => {
                  onRoleChange("city_admin");
                  if (onCountryChange) onCountryChange("Ethiopia");
                  if (onCityChange) onCityChange("Addis Ababa");
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  (currentRole as string) === "city_admin" ? "bg-sky-500 text-white shadow" : "text-slate-300 hover:text-white"
                }`}
              >
                🏙️ City Lead
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          2. KPI TELEMETRY CARDS (5 METRICS)
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Geographic Hierarchy Nodes */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Territory Nodes</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{territoriesList.length}</div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Live in MongoDB Database
            </div>
          </div>
        </div>

        {/* Metric 2: Country Leadership Coverage */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Country Leads</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {totalAssignedCountries}{" "}
              <span className="text-xs text-muted-foreground font-normal">/ {totalCountries} Nations</span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>{countryCoveragePercent}% Global Coverage</span>
            </div>
          </div>
        </div>

        {/* Metric 3: City Admins Appointed */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">City Admins</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{totalAssignedCityAdmins}</div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
              30 Municipalities per Nation
            </div>
          </div>
        </div>

        {/* Metric 4: Directory Listings Mapped */}
        <div className="p-5 rounded-3xl border border-border bg-card shadow-sm flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Directory Density</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">{totalBusinessesMapped}</div>
            <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
              Listings Assigned to Nodes
            </div>
          </div>
        </div>

        {/* Metric 5: Quick Add Territory Node */}
        <div className="p-5 rounded-3xl border border-dashed border-indigo-500/40 bg-indigo-500/5 shadow-sm flex flex-col justify-between gap-3">
          <div>
            <div className="font-black text-xs text-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Add Territory Node</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Create subcity, zone, city or nation node.
            </p>
          </div>
          <Button
            size="sm"
            variant="gradient"
            onClick={() => handleOpenCreateNode()}
            className="text-xs font-bold gap-1.5 w-full h-8"
          >
            <Plus className="w-3.5 h-3.5" />
            New Geographic Node
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          3. NAVIGATION TABS BAR
         ═══════════════════════════════════════════════════════════════════════ */}
      <div className="p-4 rounded-3xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tab 1: Map Radar */}
            <button
              type="button"
              onClick={() => setActiveTab("map_radar")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "map_radar"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>1. Geographic Radar Map</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                Interactive
              </Badge>
            </button>

            {/* Tab 2: Hierarchy Tree (Full Real CRUD) */}
            <button
              type="button"
              onClick={() => setActiveTab("hierarchy_tree")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "hierarchy_tree"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Hierarchy Nodes (CRUD)</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {territoriesList.length}
              </Badge>
            </button>

            {/* Tab 3: Country Leads (195) */}
            {!isCountryAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab("country_leads")}
                className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === "country_leads"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Crown className="w-4 h-4" />
                <span>3. Country Leads (195 Nations)</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {totalAssignedCountries} / 195
                </Badge>
              </button>
            )}

            {/* Tab 4: City Admins (30/country) */}
            <button
              type="button"
              onClick={() => setActiveTab("city_admins")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "city_admins"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>4. City Admins (30 per Nation)</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {totalAssignedCityAdmins}
              </Badge>
            </button>

            {/* Tab 5: Operations & Clerk Sync */}
            <button
              type="button"
              onClick={() => setActiveTab("operations_sync")}
              className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === "operations_sync"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-900 text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>5. Operations & Clerk Sync</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleExportCSV}
              className="text-xs font-bold gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchAllData}
              className="text-xs font-bold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 1: 🌍 INTERACTIVE GEOGRAPHIC RADAR MAP
           ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "map_radar" && (
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Map View */}
              <div className="flex-1">
                <TerritoryMap
                  territories={mapPins}
                  selectedTerritoryId={selectedTerritoryId}
                  onSelectTerritory={(id) => setSelectedTerritoryId(id)}
                  className="h-[560px] w-full"
                />
              </div>

              {/* Map Explorer Sidebar */}
              <div className="w-full lg:w-80 shrink-0 p-4 rounded-3xl border border-border bg-card/60 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <div className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Territory Directory ({territoriesList.length})</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenCreateNode()}
                    className="h-7 text-xs px-2"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add
                  </Button>
                </div>

                <div className="max-h-[480px] overflow-y-auto space-y-2 pr-1">
                  {territoriesList.slice(0, 40).map((t) => {
                    const isSelected = t.id === selectedTerritoryId;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTerritoryId(t.id)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/60 bg-card hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground truncate">{t.name}</span>
                          <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 capitalize font-mono">
                            {t.type}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1.5">
                          <span>{t.businessCount ?? 0} businesses</span>
                          <span className="font-mono text-[10px]">
                            {t.latitude.toFixed(2)}, {t.longitude.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 2: 🏛️ GEOGRAPHIC HIERARCHY TREE (FULL DB CRUD)
           ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "hierarchy_tree" && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Search hierarchy nodes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-xs rounded-xl bg-background"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="all">All Administrative Types</option>
                  <option value="country">Countries</option>
                  <option value="region">Regions / States</option>
                  <option value="city">Cities</option>
                  <option value="subcity">Subcities / Zones</option>
                  <option value="district">Districts / Woredas</option>
                </select>

                <Button
                  size="sm"
                  variant="gradient"
                  onClick={() => handleOpenCreateNode()}
                  className="text-xs font-bold gap-1.5 h-9"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Node
                </Button>
              </div>
            </div>

            {/* Table of Nodes */}
            <div className="rounded-3xl border border-border overflow-hidden bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Node Name</th>
                      <th className="py-3 px-4">Administrative Level</th>
                      <th className="py-3 px-4">Parent Entity</th>
                      <th className="py-3 px-4">Coordinates (Lat, Lng)</th>
                      <th className="py-3 px-4">Businesses</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredHierarchyNodes.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No geographic nodes found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredHierarchyNodes.map((node) => {
                        const parent = territoriesList.find((p) => p.id === node.parentId);
                        return (
                          <tr key={node.id} className="hover:bg-accent/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-foreground flex items-center gap-2">
                                <span>
                                  {node.type === "country" ? "👑" : node.type === "city" ? "🏙️" : "📍"}
                                </span>
                                <span>{node.name}</span>
                                {node.countryCode && (
                                  <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">
                                    {node.countryCode}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono">{node.id}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={`text-[10px] uppercase font-bold capitalize ${
                                  node.type === "country"
                                    ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                    : node.type === "city"
                                    ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/30"
                                    : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                }`}
                              >
                                {node.type}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {parent ? (
                                <span className="font-medium text-foreground">{parent.name}</span>
                              ) : (
                                <span className="text-muted-foreground/60 italic">Root Sovereign</span>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                              {node.latitude.toFixed(4)}, {node.longitude.toFixed(4)}
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-bold text-primary font-mono">
                                {node.businessCount ?? 0}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenCreateNode(node.id, node.type === "country" ? "city" : "subcity")}
                                  title="Add Child Territory"
                                  className="h-7 w-7 p-0"
                                >
                                  <Plus className="w-3.5 h-3.5 text-primary" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenEditNode(node)}
                                  title="Edit Territory"
                                  className="h-7 w-7 p-0"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteNode(node.id, node.name)}
                                  title="Delete Territory"
                                  className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 3: 👑 COUNTRY MAIN ADMINS (195 SOVEREIGN NATIONS)
           ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "country_leads" && !isCountryAdmin && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-muted/30 border border-border">
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Search 195 nations or assigned leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-xs rounded-xl bg-background"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === "all" ? "bg-primary text-primary-foreground shadow" : "bg-card text-muted-foreground border"
                  }`}
                >
                  All (195)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("assigned")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === "assigned" ? "bg-emerald-600 text-white shadow" : "bg-card text-muted-foreground border"
                  }`}
                >
                  Assigned ({totalAssignedCountries})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("unassigned")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterStatus === "unassigned" ? "bg-amber-500 text-slate-950 shadow" : "bg-card text-muted-foreground border"
                  }`}
                >
                  Vacant ({195 - totalAssignedCountries})
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCountries.slice(0, 60).map((country) => {
                const assignedAdmin = countryAdminMap.get(country.name.toLowerCase());
                return (
                  <div
                    key={country.code}
                    className={`p-5 rounded-3xl border transition-all ${
                      assignedAdmin
                        ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm"
                        : "border-border bg-card hover:border-border/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{country.flag}</span>
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{country.name}</h4>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            ISO: {country.code} • 30 Municipalities
                          </span>
                        </div>
                      </div>

                      {assignedAdmin ? (
                        <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                          ✓ Covered
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                          Vacant
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60">
                      {assignedAdmin ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground flex items-center gap-1">
                              <Crown className="w-3.5 h-3.5 text-amber-500" />
                              {assignedAdmin.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {assignedAdmin.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">{assignedAdmin.email}</div>

                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignModal("country_admin", country.name)}
                              className="text-xs font-bold flex-1 h-8"
                            >
                              Reassign
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeAdmin(assignedAdmin.id, assignedAdmin.name)}
                              className="text-xs text-destructive hover:bg-destructive/10 h-8 px-2.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            No sovereign country lead assigned yet.
                          </p>
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => openAssignModal("country_admin", country.name)}
                            className="w-full text-xs font-bold gap-1.5 h-8"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Appoint Country Lead
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 4: 🏙️ CITY ADMINISTRATORS (30 PER NATION)
           ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "city_admins" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-muted/30 border border-border">
              {!isCountryAdmin && (
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-muted-foreground shrink-0">Nation Scope:</label>
                  <select
                    value={selectedCountryForCities}
                    onChange={(e) => setSelectedCountryForCities(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                  >
                    {COUNTRIES_WITH_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.flag} {c.name} (30 Cities)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2 flex-1 max-w-sm">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input
                  placeholder="Search city or admin name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-9 text-xs rounded-xl bg-background"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${filterStatus === "all" ? "bg-primary text-white" : "border text-muted-foreground"}`}
                >
                  All (30)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("assigned")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${filterStatus === "assigned" ? "bg-emerald-600 text-white" : "border text-muted-foreground"}`}
                >
                  Assigned
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("unassigned")}
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${filterStatus === "unassigned" ? "bg-amber-500 text-slate-950" : "border text-muted-foreground"}`}
                >
                  Vacant
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCities.map((cityName) => {
                const key = `${selectedCountryForCities.toLowerCase()}::${cityName.toLowerCase()}`;
                const assignedAdmin = cityAdminMap.get(key);
                return (
                  <div
                    key={cityName}
                    className={`p-5 rounded-3xl border transition-all ${
                      assignedAdmin
                        ? "border-purple-500/30 bg-purple-500/5 shadow-sm"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                          <span>🏙️</span>
                          <span>{cityName}</span>
                        </h4>
                        <span className="text-[10px] text-muted-foreground">
                          {selectedCountryForCities} Municipal District
                        </span>
                      </div>

                      {assignedAdmin ? (
                        <Badge className="bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 text-[10px] font-bold">
                          ✓ Assigned
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                          Vacant
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60">
                      {assignedAdmin ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">
                              {assignedAdmin.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {assignedAdmin.managedListingsCount ?? 0} listings
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground truncate">{assignedAdmin.email}</div>

                          <div className="flex items-center gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openAssignModal("city_admin", selectedCountryForCities, cityName)}
                              className="text-xs font-bold flex-1 h-8"
                            >
                              Reassign
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeAdmin(assignedAdmin.id, assignedAdmin.name)}
                              className="text-xs text-destructive hover:bg-destructive/10 h-8 px-2.5"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            No municipal administrator assigned.
                          </p>
                          <Button
                            size="sm"
                            variant="gradient"
                            onClick={() => openAssignModal("city_admin", selectedCountryForCities, cityName)}
                            className="w-full text-xs font-bold gap-1.5 h-8"
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                            Appoint City Admin
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════
            TAB 5: ⚡ OPERATIONS, INGESTION & CLERK DASHBOARD SYNC HUB
           ═════════════════════════════════════════════════════════════════════ */}
        {activeTab === "operations_sync" && (
          <div className="space-y-6">
            {/* 1. Ingest CBE 500 Branches Banner */}
            <div className="p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-purple-950/80 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xl">🏦</span>
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                    Commercial Bank of Ethiopia (CBE) — 500 Branches & 30 City Admins
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-bold">
                    Production Ingestion
                  </Badge>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Seeds and updates all 500 CBE branches across 30 Ethiopian cities with real subcities (Bole, Kirkos, Arada, Yeka, Menaharia, Kezira, etc.), coordinates, operating hours, and appoints <strong>1 Ethiopia Country Main Admin</strong> and <strong>30 City Admins</strong>.
                </p>
              </div>

              <Button
                size="default"
                disabled={isSeeding}
                onClick={async () => {
                  setIsSeeding(true);
                  try {
                    toast.info("Ingesting 500 CBE branches & 30 city admins...");
                    const res = await fetch("/api/admin/seed-cbe", { method: "POST" });
                    const data = await res.json();
                    if (data.success) {
                      toast.success(data.message || "500 CBE Branches & 30 City Admins uploaded successfully!");
                      fetchAllData();
                    } else {
                      toast.error(data.error || "Failed to seed CBE branches.");
                    }
                  } catch (err: any) {
                    toast.error(err.message || "Network error during CBE ingestion.");
                  } finally {
                    setIsSeeding(false);
                  }
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs px-5 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 shrink-0"
              >
                {isSeeding ? "Ingesting..." : "Ingest / Sync 500 CBE Branches"}
              </Button>
            </div>

            {/* 2. Seed 195 Sovereign Countries & Subcities */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <Globe className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-sm sm:text-base font-black text-foreground">
                    Seed 195 Sovereign Countries & Municipal Hierarchy into MongoDB
                  </h3>
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-[10px] font-bold">
                    Database Seeder
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Populates all 195 ISO-standard countries, 30 Ethiopian cities, and authentic municipal subcities (Bole, Kirkos, Arada, etc.) directly into MongoDB <code>LocationModel</code> for full hierarchical querying.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={isSeeding}
                onClick={async () => {
                  setIsSeeding(true);
                  try {
                    toast.info("Seeding 195 sovereign nations and subcities...");
                    const res = await fetch("/api/admin/territories/seed", { method: "POST" });
                    const data = await res.json();
                    if (data.success) {
                      toast.success(data.message || "Territories seeded successfully!");
                      fetchAllData();
                    } else {
                      toast.error(data.error || "Failed to seed territories.");
                    }
                  } catch (e: any) {
                    toast.error(e.message || "Network error seeding territories.");
                  } finally {
                    setIsSeeding(false);
                  }
                }}
                className="text-xs font-bold gap-1.5 shrink-0"
              >
                <Layers className="w-3.5 h-3.5" />
                Seed 195 Countries & Subcities
              </Button>
            </div>

            {/* 3. Clerk Dashboard publicMetadata Synchronization */}
            <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-xs">
                    🔐
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-foreground">
                    Clerk Dashboard PublicMetadata Two-Way Synchronization
                  </h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                    Live Role Sync
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Synchronizes all Country Main Admins and City Admins to your <strong>Clerk Dashboard</strong> under <code>publicMetadata</code> (<code>role</code>, <code>assignedCountry</code>, <code>assignedCity</code>, <code>countryFlag</code>, <code>jurisdiction</code>, and <code>permissions</code>) so user sessions and middleware immediately recognize their administrative jurisdiction.
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={isClerkSyncing}
                onClick={async () => {
                  setIsClerkSyncing(true);
                  try {
                    toast.info("Synchronizing territory administrators to Clerk Dashboard...");
                    const res = await fetch("/api/admin/clerk-sync", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "sync_ethiopia_all" }),
                    });
                    const data = await res.json();
                    if (data.success) {
                      toast.success("Successfully synchronized all Country Leads & City Admins to Clerk Dashboard!");
                    } else {
                      toast.info(data.message || "Clerk sync verified.");
                    }
                  } catch (e: any) {
                    toast.error(e.message || "Network error during Clerk sync.");
                  } finally {
                    setIsClerkSyncing(false);
                  }
                }}
                className="text-xs font-bold gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isClerkSyncing ? "animate-spin" : ""}`} />
                Sync All Admins to Clerk Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL 1: ADD / EDIT GEOGRAPHIC TERRITORY NODE (DB PERSISTED)
         ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isNodeModalOpen} onOpenChange={setIsNodeModalOpen}>
        <DialogContent className="max-w-md p-6 bg-card border-border rounded-3xl">
          <DialogTitle className="text-lg font-black text-foreground flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" />
            <span>{nodeModalMode === "create" ? "Add Territory Node" : "Edit Territory Node"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Create or edit a geographic node in the MongoDB directory hierarchy.
          </DialogDescription>

          <form onSubmit={handleSaveNode} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-foreground">Territory Name *</label>
              <Input
                placeholder="e.g. Bole Medhanealem, Kazanchis, Nairobi"
                value={nodeFormName}
                onChange={(e) => setNodeFormName(e.target.value)}
                required
                className="mt-1 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground">Administrative Level</label>
                <select
                  value={nodeFormType}
                  onChange={(e) => setNodeFormType(e.target.value)}
                  className="mt-1 w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
                >
                  <option value="country">Country</option>
                  <option value="region">State / Region</option>
                  <option value="city">City</option>
                  <option value="subcity">Subcity / Zone</option>
                  <option value="district">District / Woreda</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Country Code</label>
                <Input
                  placeholder="e.g. ET, US, CA"
                  value={nodeFormCountryCode}
                  onChange={(e) => setNodeFormCountryCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  className="mt-1 text-xs rounded-xl uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Parent Geographic Entity</label>
              <select
                value={nodeFormParentId}
                onChange={(e) => setNodeFormParentId(e.target.value)}
                className="mt-1 w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
              >
                <option value="">None (Top-Level Sovereign Node)</option>
                {territoriesList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.type.toUpperCase()}: {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-foreground">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  value={nodeFormLatitude}
                  onChange={(e) => setNodeFormLatitude(Number(e.target.value))}
                  required
                  className="mt-1 text-xs rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-foreground">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  value={nodeFormLongitude}
                  onChange={(e) => setNodeFormLongitude(Number(e.target.value))}
                  required
                  className="mt-1 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNodeModalOpen(false)}
                className="text-xs font-bold"
              >
                Cancel
              </Button>
              <Button type="submit" variant="gradient" className="text-xs font-bold">
                {nodeModalMode === "create" ? "Create Territory Node" : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL 2: ASSIGN JURISDICTION ADMIN (CLERK & MONGO SYNC)
         ═══════════════════════════════════════════════════════════════════════ */}
      <AssignGeoAdminModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAdminAssigned={() => {
          fetchAllData();
          setIsAssignModalOpen(false);
        }}
        initialRole={modalRole}
        initialCountry={modalCountry}
        initialCity={modalCity}
        currentAdminRole={currentRole}
        currentAdminCountry={currentCountry}
      />
    </div>
  );
}
