"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Copy,
  Crown,
  Search,
  CheckCircle2,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Globe,
  Sliders,
  ChevronDown,
  ChevronRight,
  Phone,
  Mail,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BusinessBranch } from "@/types/business";
import {
  COUNTRIES_WITH_CITIES,
  getCitiesForCountry,
  getSubcitiesForCity,
} from "@/lib/data/countries-cities";
import { toast } from "sonner";

interface BranchManagerProps {
  businessName: string;
  defaultCountry: string;
  defaultCity: string;
  defaultSubcity: string;
  defaultAddress: string;
  defaultPhone: string;
  defaultEmail: string;
  defaultLatitude: number;
  defaultLongitude: number;
  hasMultipleBranches: boolean;
  onHasMultipleBranchesChange: (enabled: boolean) => void;
  branches: BusinessBranch[];
  onBranchesChange: (branches: BusinessBranch[]) => void;
}

export function BranchManager({
  businessName,
  defaultCountry,
  defaultCity,
  defaultSubcity,
  defaultAddress,
  defaultPhone,
  defaultEmail,
  defaultLatitude,
  defaultLongitude,
  hasMultipleBranches,
  onHasMultipleBranchesChange,
  branches,
  onBranchesChange,
}: BranchManagerProps) {
  // Modal / Tab States
  const [activeTab, setActiveTab] = useState<"list" | "add_manual" | "bulk_generator" | "paste_import">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("all");

  // Single Branch Form State
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [branchCountry, setBranchCountry] = useState(defaultCountry || "Ethiopia");
  const [branchCity, setBranchCity] = useState(defaultCity || "Addis Ababa");
  const [branchSubcity, setBranchSubcity] = useState(defaultSubcity || "Bole");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [branchManager, setBranchManager] = useState("");
  const [isHq, setIsHq] = useState(false);

  // Bulk Generator State
  const [bulkCountry, setBulkCountry] = useState("Ethiopia");
  const [selectedBulkCities, setSelectedBulkCities] = useState<string[]>(["Addis Ababa", "Hawassa", "Bahir Dar", "Dire Dawa"]);
  const [branchesPerCity, setBranchesPerCity] = useState(2);
  const [bulkNamingPattern, setBulkNamingPattern] = useState("{business} - {city} {subcity} Branch");

  // Paste Import State
  const [pasteText, setPasteText] = useState("");

  // Sync cities and subcities for single branch form
  const availableCities = useMemo(() => getCitiesForCountry(branchCountry), [branchCountry]);
  const availableSubcities = useMemo(() => getSubcitiesForCity(branchCountry, branchCity), [branchCountry, branchCity]);

  // Bulk available cities
  const bulkAvailableCities = useMemo(() => getCitiesForCountry(bulkCountry), [bulkCountry]);

  // Ensure default HQ branch exists if list is empty when enabled
  useEffect(() => {
    if (hasMultipleBranches && branches.length === 0) {
      const hqBranch: BusinessBranch = {
        id: `br-hq-${Date.now()}`,
        name: `${businessName ? `${businessName} - ` : ""}Headquarters (Main Branch)`,
        branchCode: "HQ-01",
        isHeadquarters: true,
        countryName: defaultCountry || "Ethiopia",
        cityName: defaultCity || "Addis Ababa",
        subcityName: defaultSubcity || "Bole",
        districtName: defaultSubcity || "Bole",
        addressLine: defaultAddress || "Main Corporate Avenue",
        phone: defaultPhone || "",
        email: defaultEmail || "",
        latitude: defaultLatitude,
        longitude: defaultLongitude,
        status: "open",
      };
      onBranchesChange([hqBranch]);
    }
  }, [hasMultipleBranches]);

  // Reset/populate form for adding or editing
  const resetForm = () => {
    setEditingBranchId(null);
    setBranchName("");
    setBranchCode(`BR-${branches.length + 1}`);
    setBranchCountry(defaultCountry || "Ethiopia");
    setBranchCity(defaultCity || "Addis Ababa");
    setBranchSubcity(defaultSubcity || "Bole");
    setBranchAddress("");
    setBranchPhone(defaultPhone || "");
    setBranchEmail("");
    setBranchManager("");
    setIsHq(false);
  };

  const startEditBranch = (br: BusinessBranch) => {
    setEditingBranchId(br.id);
    setBranchName(br.name);
    setBranchCode(br.branchCode || "");
    setBranchCountry(br.countryName);
    setBranchCity(br.cityName);
    setBranchSubcity(br.subcityName || br.districtName || "");
    setBranchAddress(br.addressLine);
    setBranchPhone(br.phone || "");
    setBranchEmail(br.email || "");
    setBranchManager(br.managerName || "");
    setIsHq(!!br.isHeadquarters);
    setActiveTab("add_manual");
  };

  const handleSaveManualBranch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!branchName.trim()) {
      toast.error("Branch name is required");
      return;
    }

    if (editingBranchId) {
      // Update existing
      const updated = branches.map((br) => {
        if (br.id === editingBranchId) {
          return {
            ...br,
            name: branchName.trim(),
            branchCode: branchCode.trim() || undefined,
            isHeadquarters: isHq,
            countryName: branchCountry,
            cityName: branchCity,
            subcityName: branchSubcity,
            districtName: branchSubcity,
            addressLine: branchAddress.trim() || `${branchSubcity}, ${branchCity}`,
            phone: branchPhone.trim() || undefined,
            email: branchEmail.trim() || undefined,
            managerName: branchManager.trim() || undefined,
          };
        }
        // If this branch is made HQ, remove HQ from other branches
        return isHq ? { ...br, isHeadquarters: false } : br;
      });
      onBranchesChange(updated);
      toast.success("Branch updated successfully!");
    } else {
      // Add new branch
      const newBranch: BusinessBranch = {
        id: `br-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: branchName.trim(),
        branchCode: branchCode.trim() || `BR-${branches.length + 1}`,
        isHeadquarters: isHq,
        countryName: branchCountry,
        cityName: branchCity,
        subcityName: branchSubcity,
        districtName: branchSubcity,
        addressLine: branchAddress.trim() || `${branchSubcity}, ${branchCity}`,
        phone: branchPhone.trim() || defaultPhone,
        email: branchEmail.trim() || undefined,
        managerName: branchManager.trim() || undefined,
        status: "open",
      };

      const nextBranches = isHq
        ? [newBranch, ...branches.map((b) => ({ ...b, isHeadquarters: false }))]
        : [...branches, newBranch];

      onBranchesChange(nextBranches);
      toast.success(`Branch "${branchName}" added!`);
    }

    resetForm();
    setActiveTab("list");
  };

  const handleDeleteBranch = (id: string) => {
    if (branches.length <= 1) {
      toast.error("At least one branch or headquarters is required for a multi-branch business.");
      return;
    }
    const filtered = branches.filter((b) => b.id !== id);
    onBranchesChange(filtered);
    toast.success("Branch removed.");
  };

  const handleDuplicateBranch = (br: BusinessBranch) => {
    const copy: BusinessBranch = {
      ...br,
      id: `br-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${br.name} (Copy)`,
      branchCode: `${br.branchCode || "BR"}-COPY`,
      isHeadquarters: false,
    };
    onBranchesChange([...branches, copy]);
    toast.success("Branch duplicated!");
  };

  const handleSetHq = (id: string) => {
    const updated = branches.map((b) => ({
      ...b,
      isHeadquarters: b.id === id,
    }));
    onBranchesChange(updated);
    toast.success("Headquarters branch updated!");
  };

  // --------------------------------------------------------------------------
  // Bulk Multi-Branch Generator Logic
  // --------------------------------------------------------------------------
  const handleBulkGenerate = () => {
    if (selectedBulkCities.length === 0) {
      toast.error("Please select at least one city.");
      return;
    }

    const generated: BusinessBranch[] = [];
    let count = branches.length + 1;

    selectedBulkCities.forEach((city) => {
      const subcities = getSubcitiesForCity(bulkCountry, city);
      const subcityList = subcities.length > 0 ? subcities : ["Central District", "Main Sector", "East Zone"];

      for (let i = 0; i < branchesPerCity; i++) {
        const subcity = subcityList[i % subcityList.length];
        const rawName = bulkNamingPattern
          .replace(/{business}/g, businessName || "Branch")
          .replace(/{city}/g, city)
          .replace(/{subcity}/g, subcity)
          .replace(/{number}/g, String(i + 1));

        generated.push({
          id: `br-bulk-${Date.now()}-${count}`,
          name: rawName,
          branchCode: `BR-${count}`,
          isHeadquarters: false,
          countryName: bulkCountry,
          cityName: city,
          subcityName: subcity,
          districtName: subcity,
          addressLine: `${subcity} Main Commercial Avenue, ${city}`,
          phone: defaultPhone || "+251 11 000 0000",
          status: "open",
        });
        count++;
      }
    });

    onBranchesChange([...branches, ...generated]);
    toast.success(`Generated ${generated.length} branches across ${selectedBulkCities.length} cities!`);
    setActiveTab("list");
  };

  // --------------------------------------------------------------------------
  // Paste / CSV Import Logic
  // --------------------------------------------------------------------------
  const handlePasteImport = () => {
    if (!pasteText.trim()) {
      toast.error("Please paste branch list lines.");
      return;
    }

    const lines = pasteText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const imported: BusinessBranch[] = [];
    let idx = branches.length + 1;

    lines.forEach((line) => {
      // Parses format: "Branch Name, City, Subcity, Address, Phone" or just "Branch Name"
      const parts = line.split(",").map((p) => p.trim());
      const name = parts[0] || `Branch #${idx}`;
      const city = parts[1] || defaultCity || "Addis Ababa";
      const subcity = parts[2] || defaultSubcity || "Bole";
      const address = parts[3] || `${subcity}, ${city}`;
      const phone = parts[4] || defaultPhone;

      imported.push({
        id: `br-import-${Date.now()}-${idx}`,
        name: name,
        branchCode: `BR-${idx}`,
        isHeadquarters: false,
        countryName: defaultCountry || "Ethiopia",
        cityName: city,
        subcityName: subcity,
        districtName: subcity,
        addressLine: address,
        phone: phone,
        status: "open",
      });
      idx++;
    });

    onBranchesChange([...branches, ...imported]);
    toast.success(`Successfully imported ${imported.length} branches!`);
    setPasteText("");
    setActiveTab("list");
  };

  // Filtered branches for view list
  const uniqueCitiesInBranches = useMemo(() => {
    return Array.from(new Set(branches.map((b) => b.cityName)));
  }, [branches]);

  const filteredBranches = useMemo(() => {
    return branches.filter((br) => {
      if (filterCity !== "all" && br.cityName !== filterCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          br.name.toLowerCase().includes(q) ||
          br.cityName.toLowerCase().includes(q) ||
          (br.subcityName || "").toLowerCase().includes(q) ||
          (br.branchCode || "").toLowerCase().includes(q) ||
          (br.addressLine || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [branches, filterCity, searchQuery]);

  return (
    <div className="space-y-6">
      {/* ─── Multi-Branch Network Enable Switcher ─────────────────────────────── */}
      <div className="p-5 rounded-3xl border border-border bg-gradient-to-br from-card via-slate-50/50 dark:via-slate-900/50 to-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xl shadow-inner">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-foreground">
                  Multi-Branch & Chain Location Network
                </h3>
                {hasMultipleBranches && (
                  <Badge variant="default" className="bg-indigo-600 text-white text-[10px] font-bold">
                    {branches.length} Branches Added
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Enable for businesses, banks, retail chains, clinics, or franchises with dozens or hundreds of branches.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasMultipleBranches}
                onChange={(e) => onHasMultipleBranchesChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              <span className="ml-2 text-xs font-bold text-foreground">
                {hasMultipleBranches ? "Multi-Branch Active" : "Single Location"}
              </span>
            </label>
          </div>
        </div>

        {hasMultipleBranches && (
          <div className="pt-3 border-t border-border/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>
                Each branch is indexed with its own city, subcity/district, address, and coordinates for accurate discovery on search and maps.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant={activeTab === "list" ? "default" : "outline"}
                onClick={() => setActiveTab("list")}
                className="text-xs font-bold gap-1.5 h-8"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>View Branches ({branches.length})</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant={activeTab === "add_manual" ? "default" : "outline"}
                onClick={() => {
                  resetForm();
                  setActiveTab("add_manual");
                }}
                className="text-xs font-bold gap-1.5 h-8"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Branch</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant={activeTab === "bulk_generator" ? "default" : "outline"}
                onClick={() => setActiveTab("bulk_generator")}
                className="text-xs font-bold gap-1.5 h-8 bg-purple-600 text-white hover:bg-purple-700"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🚀 Bulk City Generator</span>
              </Button>

              <Button
                type="button"
                size="sm"
                variant={activeTab === "paste_import" ? "default" : "outline"}
                onClick={() => setActiveTab("paste_import")}
                className="text-xs font-bold gap-1.5 h-8"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Paste / CSV</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {hasMultipleBranches && (
        <>
          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: VIEW & MANAGE BRANCHES LIST
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "list" && (
            <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden space-y-4">
              {/* Header & Filter Toolbar */}
              <div className="p-4 sm:p-5 border-b border-border bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-foreground">
                    Configured Branch Network ({branches.length} Locations)
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Covering {uniqueCitiesInBranches.length} Cities worldwide.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Filter by City */}
                  {uniqueCitiesInBranches.length > 1 && (
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="h-8 rounded-xl border border-input bg-background px-2.5 text-xs font-bold shadow-sm"
                    >
                      <option value="all">🌐 All Cities ({uniqueCitiesInBranches.length})</option>
                      {uniqueCitiesInBranches.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Search branches */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search branches..."
                      className="h-8 pl-8 text-xs w-44 sm:w-56"
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    onClick={() => {
                      resetForm();
                      setActiveTab("add_manual");
                    }}
                    className="text-xs font-bold h-8 gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Branch
                  </Button>
                </div>
              </div>

              {/* Branches Grid */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[520px] overflow-y-auto">
                {filteredBranches.length === 0 ? (
                  <div className="col-span-full p-12 text-center space-y-2">
                    <Building2 className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
                    <p className="text-xs font-bold text-foreground">No branches match your search filter.</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSearchQuery("");
                        setFilterCity("all");
                      }}
                      className="text-xs"
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  filteredBranches.map((br, index) => (
                    <div
                      key={br.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        br.isHeadquarters
                          ? "border-amber-500/50 bg-amber-500/5 shadow-sm ring-1 ring-amber-500/20"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-mono font-bold text-muted-foreground">
                                #{index + 1}
                              </span>
                              <h5 className="font-black text-xs text-foreground line-clamp-1">
                                {br.name}
                              </h5>
                            </div>
                            {br.branchCode && (
                              <Badge variant="outline" className="text-[9px] font-mono py-0">
                                {br.branchCode}
                              </Badge>
                            )}
                          </div>

                          {br.isHeadquarters ? (
                            <Badge className="bg-amber-500 text-white text-[9px] font-black shrink-0 flex items-center gap-1">
                              <Crown className="w-2.5 h-2.5" />
                              Headquarters
                            </Badge>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetHq(br.id)}
                              className="text-[10px] text-muted-foreground hover:text-amber-500 font-bold transition-colors"
                              title="Set as Main Headquarters"
                            >
                              Make HQ
                            </button>
                          )}
                        </div>

                        <div className="text-xs space-y-1 text-muted-foreground">
                          <div className="flex items-center gap-1.5 font-medium text-foreground text-[11px]">
                            <MapPin className="w-3 h-3 text-primary shrink-0" />
                            <span className="truncate">
                              {br.subcityName ? `${br.subcityName}, ` : ""}
                              {br.cityName}, {br.countryName}
                            </span>
                          </div>
                          {br.addressLine && (
                            <p className="text-[11px] truncate pl-4 text-muted-foreground">
                              {br.addressLine}
                            </p>
                          )}
                          {br.phone && (
                            <div className="flex items-center gap-1.5 pl-4 text-[10px] font-mono">
                              <Phone className="w-2.5 h-2.5" />
                              <span>{br.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEditBranch(br)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit branch details"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateBranch(br)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Duplicate branch"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteBranch(br.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-[11px] font-bold flex items-center gap-1"
                          title="Remove branch"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: ADD OR EDIT SINGLE BRANCH FORM
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "add_manual" && (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    {editingBranchId ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">
                      {editingBranchId ? "Edit Branch Details" : "Add Individual Branch / Outlet"}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Configure custom branch name, city, subcity, street address, and contact lines.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("list")}
                  className="text-xs font-bold"
                >
                  Back to List
                </Button>
              </div>

              <div
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
                    e.preventDefault();
                    handleSaveManualBranch();
                  }
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* Branch Name */}
                  <div className="lg:col-span-2">
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Branch Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      required
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      placeholder="e.g. Bole Medhanialem Super Branch"
                      className="text-xs"
                    />
                  </div>

                  {/* Branch Code */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Branch Code / ID
                    </label>
                    <Input
                      value={branchCode}
                      onChange={(e) => setBranchCode(e.target.value)}
                      placeholder="e.g. CBE-104 / BR-05"
                      className="text-xs font-mono"
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Country</label>
                    <select
                      value={branchCountry}
                      onChange={(e) => {
                        const newCountry = e.target.value;
                        setBranchCountry(newCountry);
                        const cities = getCitiesForCountry(newCountry);
                        const firstCity = cities[0] || "";
                        setBranchCity(firstCity);
                        const subcities = getSubcitiesForCity(newCountry, firstCity);
                        setBranchSubcity(subcities[0] || "");
                      }}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {COUNTRIES_WITH_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">City / Municipality</label>
                    <select
                      value={branchCity}
                      onChange={(e) => {
                        const newCity = e.target.value;
                        setBranchCity(newCity);
                        const subcities = getSubcitiesForCity(branchCountry, newCity);
                        setBranchSubcity(subcities[0] || "");
                      }}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {availableCities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Subcity / District */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Sub-city / District</label>
                    <select
                      value={branchSubcity}
                      onChange={(e) => setBranchSubcity(e.target.value)}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {availableSubcities.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Street Address */}
                  <div className="lg:col-span-2">
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Street Address & Specific Landmark
                    </label>
                    <Input
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                      placeholder="e.g. Cameroon St, In Front of Medhanialem Mall, Building 4"
                      className="text-xs"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Branch Direct Phone</label>
                    <Input
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      placeholder="e.g. +251 11 661 2345"
                      className="text-xs font-mono"
                    />
                  </div>

                  {/* Branch Email */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Branch Email</label>
                    <Input
                      type="email"
                      value={branchEmail}
                      onChange={(e) => setBranchEmail(e.target.value)}
                      placeholder="e.g. bole.branch@bank.com"
                      className="text-xs"
                    />
                  </div>

                  {/* Branch Manager */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Branch Manager / Lead</label>
                    <Input
                      value={branchManager}
                      onChange={(e) => setBranchManager(e.target.value)}
                      placeholder="e.g. Samuel Yohannes"
                      className="text-xs"
                    />
                  </div>

                  {/* HQ Checkbox */}
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="branch-is-hq"
                      checked={isHq}
                      onChange={(e) => setIsHq(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <label htmlFor="branch-is-hq" className="text-xs font-bold text-foreground cursor-pointer">
                      👑 Mark as Primary Headquarters
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("list")}
                    className="text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSaveManualBranch()}
                    variant="gradient"
                    size="sm"
                    className="text-xs font-bold gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {editingBranchId ? "Update Branch" : "Save Branch"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 3: BULK MULTI-BRANCH CITY GENERATOR
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "bulk_generator" && (
            <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-card via-purple-500/5 to-card p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">
                      Multi-City Branch Rapid Network Generator
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Select multiple cities and sub-cities to auto-generate hundreds of branches across regions in seconds.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("list")}
                  className="text-xs font-bold"
                >
                  Back to List
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Select Country */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">Country</label>
                    <select
                      value={bulkCountry}
                      onChange={(e) => {
                        setBulkCountry(e.target.value);
                        setSelectedBulkCities([]);
                      }}
                      className="w-full h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold focus:ring-2 focus:ring-primary shadow-sm"
                    >
                      {COUNTRIES_WITH_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Branches per City */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Branches per Selected City
                    </label>
                    <Input
                      type="number"
                      min={1}
                      max={50}
                      value={branchesPerCity}
                      onChange={(e) => setBranchesPerCity(Number(e.target.value) || 1)}
                      className="text-xs font-bold"
                    />
                  </div>

                  {/* Naming Pattern */}
                  <div>
                    <label className="text-xs font-bold text-foreground block mb-1">
                      Naming Formula
                    </label>
                    <Input
                      value={bulkNamingPattern}
                      onChange={(e) => setBulkNamingPattern(e.target.value)}
                      placeholder="{business} - {city} {subcity} Branch"
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                {/* City Picker Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      Select Target Cities in {bulkCountry} ({selectedBulkCities.length} Selected)
                    </label>

                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedBulkCities(bulkAvailableCities)}
                        className="font-bold text-primary hover:underline"
                      >
                        Select All 30 Cities
                      </button>
                      <span className="text-muted-foreground">•</span>
                      <button
                        type="button"
                        onClick={() => setSelectedBulkCities([])}
                        className="font-bold text-muted-foreground hover:underline"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border">
                    {bulkAvailableCities.map((city) => {
                      const isSelected = selectedBulkCities.includes(city);
                      return (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            setSelectedBulkCities((prev) =>
                              isSelected ? prev.filter((c) => c !== city) : [...prev, city]
                            );
                          }}
                          className={`p-2 rounded-xl text-left text-xs font-bold transition-all flex items-center justify-between gap-1 border ${
                            isSelected
                              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                              : "bg-background border-border text-foreground hover:border-purple-400"
                          }`}
                        >
                          <span className="truncate">{city}</span>
                          {isSelected && <CheckCircle2 className="w-3 h-3 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generator Action Banner */}
                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-muted-foreground">
                    Will generate:{" "}
                    <strong className="text-foreground">
                      {selectedBulkCities.length * branchesPerCity} New Branches
                    </strong>{" "}
                    across {selectedBulkCities.length} cities with automatic sub-cities, addresses, and phone lines.
                  </div>

                  <Button
                    type="button"
                    onClick={handleBulkGenerate}
                    disabled={selectedBulkCities.length === 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-purple-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate {selectedBulkCities.length * branchesPerCity} Branches Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 4: PASTE / CSV BATCH IMPORTER
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === "paste_import" && (
            <div className="rounded-3xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">
                      Paste / CSV Branch Batch Importer
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Paste a list of your branch locations (one per line) to batch-import dozens or hundreds at once.
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab("list")}
                  className="text-xs font-bold"
                >
                  Back to List
                </Button>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-muted-foreground bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-border space-y-1 font-mono text-[11px]">
                  <p className="font-bold text-foreground">Supported Line Formats:</p>
                  <p>1. Bole Medhanialem Branch, Addis Ababa, Bole, Cameroon St, +251 11 661 2345</p>
                  <p>2. Hawassa Menaharia Branch, Hawassa, Menaharia, Main Ave</p>
                  <p>3. Piassa Heritage Branch, Addis Ababa</p>
                </div>

                <textarea
                  rows={8}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder={`Bole Medhanialem Branch, Addis Ababa, Bole, Cameroon St, +251 11 661 2345\nHawassa Menaharia Branch, Hawassa, Menaharia, Main Ave, +251 46 220 1234\nBahir Dar Tana Branch, Bahir Dar, Tana, Kebele 04\nDire Dawa Kezira Branch, Dire Dawa, Kezira, Station Rd`}
                  className="w-full p-3.5 rounded-2xl border border-input bg-background font-mono text-xs focus:ring-2 focus:ring-primary shadow-sm"
                />

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {pasteText.split("\n").filter((l) => l.trim()).length} lines detected
                  </span>

                  <Button
                    type="button"
                    variant="gradient"
                    onClick={handlePasteImport}
                    disabled={!pasteText.trim()}
                    className="text-xs font-bold gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Import Branches
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
