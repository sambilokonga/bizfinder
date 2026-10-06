"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  Camera,
  Layers,
  Save,
  Edit3,
  AlertCircle,
  Compass,
  ShieldCheck,
  RotateCcw,
  Film,
  Plus,
  Trash2,
  Upload,
  Clock,
  DollarSign,
  FileText,
  Tag,
  Globe,
  ExternalLink,
  X,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SEED_CATEGORIES } from "@/lib/db/seed-data/categories";
import { Category } from "@/types/category";
import {
  WORLD_COUNTRIES,
  CountryConfig,
  getCountryByName,
  getRegionForCity,
  getCityCoordinates,
  getCitiesForRegion,
  getSubcityCoordinates,
} from "@/lib/data/world-locations";
import { COUNTRIES_WITH_CITIES, getCountryEntry, getCitiesForCountry, getSubcitiesForCity } from "@/lib/data/countries-cities";
import { LocationPinMap } from "@/components/dashboard/LocationPinMap";
import { BranchManager } from "@/components/dashboard/BranchManager";
import { BusinessBranch, BusinessType, BUSINESS_TYPE_OPTIONS } from "@/types/business";
import { toast } from "sonner";
import { extractYoutubeVideoId, getYoutubeThumbnail, getYoutubeEmbedUrl } from "@/lib/utils/youtube";

const DRAFT_STORAGE_KEY = "bizfinder_new_listing_draft_v2";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type DaySchedule = {
  open: boolean;
  openTime: string;
  closeTime: string;
};

type WeeklyHours = Record<string, DaySchedule>;

const DEFAULT_WEEKLY_HOURS: WeeklyHours = Object.fromEntries(
  DAYS_OF_WEEK.map((day) => [
    day,
    { open: !["Sunday"].includes(day), openTime: "08:00", closeTime: "18:00" },
  ])
);

type VerificationDoc = {
  id: string;
  name: string;
  url: string;
  type: string;
};

const WIZARD_STEPS = [
  { id: 1, icon: Tag,         label: "Identity",    sublabel: "Name & Scale"         },
  { id: 2, icon: Layers,      label: "Categories",  sublabel: "Industry Hierarchy"   },
  { id: 3, icon: MapPin,      label: "Location",    sublabel: "Map & Address"        },
  { id: 4, icon: Phone,       label: "Contact",     sublabel: "Channels & Branches"  },
  { id: 5, icon: Camera,      label: "Media",       sublabel: "Photos & Video"       },
  { id: 6, icon: Clock,       label: "Hours",       sublabel: "Schedule & Pricing"   },
  { id: 7, icon: ShieldCheck, label: "Submit",      sublabel: "Verify & Review"      },
] as const;

const PRICE_TIERS = [
  { value: "$",    label: "Budget",   desc: "Affordable & budget-friendly pricing" },
  { value: "$$",   label: "Moderate", desc: "Mid-range pricing for most customers" },
  { value: "$$$",  label: "Upscale",  desc: "Premium quality & upscale experience" },
  { value: "$$$$", label: "Luxury",   desc: "Exclusive luxury & fine dining level" },
] as const;

const DOC_TYPES = [
  { value: "business-license",  label: "Business License"  },
  { value: "trade-certificate", label: "Trade Certificate" },
  { value: "tax-registration",  label: "Tax Registration"  },
  { value: "health-permit",     label: "Health Permit"     },
  { value: "identity-document", label: "Owner ID / Passport" },
  { value: "other",             label: "Other Document"    },
];

// -----------------------------------------------------------------
// Reusable UI Helpers
// -----------------------------------------------------------------
function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-border">
      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm shrink-0">
        {step}
      </div>
      <div>
        <h3 className="text-base font-black text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground block mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function ReviewCard({
  title,
  icon,
  onEdit,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between pb-2 border-b border-border/70">
        <div className="flex items-center gap-2 font-black text-xs text-foreground">
          {icon}
          <span>{title}</span>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg text-primary hover:bg-primary/10 transition-colors"
        >
          <Edit3 className="w-3 h-3" /> Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function ReviewField({
  label,
  value,
  bold,
  mono,
  italic,
  truncate,
  className,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
  italic?: boolean;
  truncate?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="text-[11px] text-muted-foreground block font-medium">{label}</span>
      <span
        className={`text-xs ${
          bold ? "font-bold text-foreground" : "text-foreground/90"
        } ${mono ? "font-mono" : ""} ${italic ? "italic" : ""} ${truncate ? "line-clamp-2" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

// -----------------------------------------------------------------
// Props
// -----------------------------------------------------------------
export interface EmbeddedListingWizardProps {
  /** "fullscreen" = standalone page layout with back link.
   *  "embedded" = compact card layout inside the dashboard or admin portal. */
  mode?: "fullscreen" | "embedded";
  /** Called with the new business id after successful submission. */
  onSuccess?: (businessId: string) => void;
  /** Called when the user cancels. */
  onCancel?: () => void;
  /** Whether the wizard is running in Super Admin / Admin mode */
  isAdmin?: boolean;
  /** Redirect path after submission (defaults to "/dashboard" for owner mode, null to disable redirect). */
  redirectPath?: string | null;
  /** Initial country */
  defaultCountry?: string;
  /** Initial city */
  defaultCity?: string;
  /** Direct access to categories if already fetched */
  categories?: Category[];
}

// -----------------------------------------------------------------
// Main Component
// -----------------------------------------------------------------
export function EmbeddedListingWizard({
  mode = "fullscreen",
  onSuccess,
  onCancel,
  isAdmin = false,
  redirectPath,
  defaultCountry = "Ethiopia",
  defaultCity = "Addis Ababa",
  categories,
}: EmbeddedListingWizardProps) {
  const router = useRouter();
  const { user } = useUser();
  const draftStorageKey = user?.id ? `bizfinder_new_listing_draft_${user.id}` : DRAFT_STORAGE_KEY;
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Dynamic Categories from MongoDB
  const [dbCategories, setDbCategories] = useState<Category[]>(
    categories && categories.length > 0 ? categories : SEED_CATEGORIES
  );

  useEffect(() => {
    if (categories && categories.length > 0) {
      setDbCategories(categories);
      return;
    }
    fetch("/api/categories")
      .then((res) => (res.ok && res.headers.get("content-type")?.includes("application/json") ? res.json() : null))
      .then((data) => {
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          setDbCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to load categories in new listing:", err));
  }, [categories]);

  // Step 1: Identity & Brand
  const [name, setName] = useState("");
  const [businessLevel, setBusinessLevel] = useState<"Small" | "Medium" | "Large" | "International">("Small");
  const [businessType, setBusinessType] = useState<BusinessType | "">("");
  const [yearEstablished, setYearEstablished] = useState<string>("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Category Hierarchy
  const [categoryId, setCategoryId] = useState("cat-1");
  const [customCategories, setCustomCategories] = useState<{ id: string; name: string }[]>([]);
  const [customCategory, setCustomCategory] = useState("");

  const [subcategoryId, setSubcategoryId] = useState("");
  const [customSubcategories, setCustomSubcategories] = useState<{ id: string; name: string; parentId: string }[]>([]);
  const [customSubcategory, setCustomSubcategory] = useState("");

  const [listingOptionId, setListingOptionId] = useState("");
  const [customListingOptions, setCustomListingOptions] = useState<{ id: string; name: string; parentId: string }[]>([]);
  const [customListingOption, setCustomListingOption] = useState("");

  // Step 3: Location Worldwide
  const [customCountries, setCustomCountries] = useState<string[]>([]);
  const [customCountry, setCustomCountry] = useState("");
  const [countryName, setCountryName] = useState(defaultCountry || "Ethiopia");
  const [regionName, setRegionName] = useState(defaultCity || "Addis Ababa");
  const [customCitiesMap, setCustomCitiesMap] = useState<Record<string, string[]>>({});
  const [customCity, setCustomCity] = useState("");
  const [cityName, setCityName] = useState(defaultCity || "Addis Ababa");
  const [subcityName, setSubcityName] = useState("Bole");
  const [customSubcity, setCustomSubcity] = useState("");
  const [adminDirectApprove, setAdminDirectApprove] = useState(true);
  const [addressLine, setAddressLine] = useState("");
  const [latitude, setLatitude] = useState(9.010793);
  const [longitude, setLongitude] = useState(38.761252);
  const [buildingName, setBuildingName] = useState("");
  const [floorNumber, setFloorNumber] = useState("");

  // Step 4: Contact Channels & Branches
  const [telephone, setTelephone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [hasMultipleBranches, setHasMultipleBranches] = useState(false);
  const [branches, setBranches] = useState<BusinessBranch[]>([]);

  // Step 5: Media
  const [logoUrl, setLogoUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState(
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
  );
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [galleryPhotos, setGalleryPhotos] = useState<
    Array<{ id: string; url: string; title: string; type: string }>
  >([
    {
      id: "gal-1",
      url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
      title: "Main Ambience & Seating",
      type: "interior",
    },
    {
      id: "gal-2",
      url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      title: "Atmosphere & Ambience",
      type: "interior",
    },
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoType, setNewPhotoType] = useState("interior");

  // Step 6: Hours, Pricing & Amenities
  const [servicesAndMenu, setServicesAndMenu] = useState("");
  const [priceTier, setPriceTier] = useState<"$" | "$$" | "$$$" | "$$$$">("$$");
  const [weeklyHours, setWeeklyHours] = useState<WeeklyHours>(DEFAULT_WEEKLY_HOURS);
  const [wifi, setWifi] = useState(true);
  const [parking, setParking] = useState(true);
  const [delivery, setDelivery] = useState(false);
  const [acceptsCards, setAcceptsCards] = useState(true);
  const [outdoorSeating, setOutdoorSeating] = useState(false);
  const [airConditioning, setAirConditioning] = useState(true);
  const [petFriendly, setPetFriendly] = useState(false);
  const [accessible, setAccessible] = useState(true);

  // Step 7: Verification Docs
  const [verificationDocs, setVerificationDocs] = useState<VerificationDoc[]>([]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocType, setNewDocType] = useState("business-license");

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);

  // -----------------------------------------------------------------
  // Categories Hierarchy Calculations & Custom Recording
  // -----------------------------------------------------------------
  const level1Categories = useMemo(() => {
    const base = dbCategories
      .filter((c) => (c.level === 1 || !c.parentId) && c.id !== "cat-5" && c.name.toLowerCase() !== "shopping & retail")
      .map((c) => ({ id: c.id, name: c.name }));
    const custom = customCategories.map((c) => ({ id: c.id, name: c.name }));
    return [...base, ...custom];
  }, [dbCategories, customCategories]);

  const level2Categories = useMemo(() => {
    if (categoryId === "custom") return [];
    const base = dbCategories.filter((c) => c.parentId === categoryId).map((c) => ({
      id: c.id, name: c.name, parentId: c.parentId,
    }));
    const custom = customSubcategories.filter((c) => c.parentId === categoryId);
    return [...base, ...custom];
  }, [categoryId, dbCategories, customSubcategories]);

  const activeSubcategoryId = subcategoryId || (level2Categories[0]?.id ?? "");

  const level3Categories = useMemo(() => {
    if (!activeSubcategoryId || activeSubcategoryId === "custom") return [];
    const base = dbCategories.filter((c) => c.parentId === activeSubcategoryId).map((c) => ({
      id: c.id, name: c.name, parentId: c.parentId,
    }));
    const custom = customListingOptions.filter((c) => c.parentId === activeSubcategoryId);
    return [...base, ...custom];
  }, [activeSubcategoryId, dbCategories, customListingOptions]);

  const handleCategoryChange = (newCatId: string) => {
    if (newCatId === "custom") {
      setCategoryId("custom");
      setSubcategoryId("custom");
      setListingOptionId("custom");
      return;
    }
    setCategoryId(newCatId);
    setCustomCategory("");
    const subcats = dbCategories.filter((c) => c.parentId === newCatId);
    const customSubs = customSubcategories.filter((c) => c.parentId === newCatId);
    const allSubs = [...subcats, ...customSubs];
    if (allSubs.length > 0) {
      setSubcategoryId(allSubs[0].id);
      const opts = dbCategories.filter((c) => c.parentId === allSubs[0].id);
      const customOpts = customListingOptions.filter((c) => c.parentId === allSubs[0].id);
      setListingOptionId([...opts, ...customOpts][0]?.id || "");
    } else {
      setSubcategoryId("");
      setListingOptionId("");
    }
  };

  const recordCustomCategory = (nameInput: string) => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const existing = level1Categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setCategoryId(existing.id);
      setCustomCategory("");
      toast.info(`Primary Industry "${trimmed}" selected.`);
      return;
    }
    const newId = `custom-cat-${Date.now()}`;
    setCustomCategories((prev) => [...prev, { id: newId, name: trimmed }]);
    setCategoryId(newId);
    setCustomCategory("");
    setSubcategoryId("custom");
    setListingOptionId("custom");
    toast.success(`Primary Industry "${trimmed}" added.`);
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, level: 1 }),
    }).catch(() => {});
  };

  const handleSubcategoryChange = (newSubId: string) => {
    if (newSubId === "custom") {
      setSubcategoryId("custom");
      setListingOptionId("custom");
      return;
    }
    setSubcategoryId(newSubId);
    setCustomSubcategory("");
    const opts = dbCategories.filter((c) => c.parentId === newSubId);
    const customOpts = customListingOptions.filter((c) => c.parentId === newSubId);
    setListingOptionId([...opts, ...customOpts][0]?.id || "");
  };

  const recordCustomSubcategory = (nameInput: string) => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const existing = level2Categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setSubcategoryId(existing.id);
      setCustomSubcategory("");
      toast.info(`Subcategory "${trimmed}" selected.`);
      return;
    }
    const newId = `custom-subcat-${Date.now()}`;
    setCustomSubcategories((prev) => [...prev, { id: newId, name: trimmed, parentId: categoryId }]);
    setSubcategoryId(newId);
    setCustomSubcategory("");
    setListingOptionId("custom");
    toast.success(`Subcategory "${trimmed}" added.`);
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, parentId: categoryId !== "custom" ? categoryId : null, level: 2 }),
    }).catch(() => {});
  };

  const handleListingOptionChange = (newOptId: string) => {
    if (newOptId === "custom") {
      setListingOptionId("custom");
      return;
    }
    setListingOptionId(newOptId);
    setCustomListingOption("");
  };

  const recordCustomListingOption = (nameInput: string) => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const existing = level3Categories.find((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (existing) {
      setListingOptionId(existing.id);
      setCustomListingOption("");
      toast.info(`Listing Option "${trimmed}" selected.`);
      return;
    }
    const newId = `custom-opt-${Date.now()}`;
    setCustomListingOptions((prev) => [...prev, { id: newId, name: trimmed, parentId: activeSubcategoryId }]);
    setListingOptionId(newId);
    setCustomListingOption("");
    toast.success(`Listing Option "${trimmed}" added.`);
    fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed, parentId: activeSubcategoryId !== "custom" ? activeSubcategoryId : null, level: 3 }),
    }).catch(() => {});
  };

  // -----------------------------------------------------------------
  // Location Cascades & Helpers
  // -----------------------------------------------------------------
  const allCountriesList = useMemo(() => {
    const baseNames = COUNTRIES_WITH_CITIES.map((c) => c.name);
    return Array.from(new Set([...baseNames, ...customCountries]));
  }, [customCountries]);

  const effectiveCountryName = countryName === "custom" ? customCountry.trim() || "Unspecified Country" : countryName;

  const currentRegionCities = useMemo(() => {
    if (countryName === "custom") return customCitiesMap["custom"] || [];
    const fromRegion = getCitiesForRegion(effectiveCountryName, regionName);
    const fromCustom = customCitiesMap[countryName] || [];
    const combined = Array.from(new Set([...fromRegion, ...fromCustom]));
    if (cityName && cityName !== "custom" && !combined.includes(cityName)) {
      return [cityName, ...combined];
    }
    return combined;
  }, [effectiveCountryName, regionName, countryName, customCitiesMap, cityName]);

  const effectiveCityName = cityName === "custom" ? customCity.trim() || "Unspecified City" : cityName;

  const currentCitySubcities = useMemo(() => {
    if (countryName === "custom" || cityName === "custom") return [];
    return getSubcitiesForCity(effectiveCountryName, effectiveCityName);
  }, [effectiveCountryName, effectiveCityName, countryName, cityName]);

  const currentCountryConfig: CountryConfig | undefined = useMemo(() => {
    return getCountryByName(effectiveCountryName);
  }, [effectiveCountryName]);

  const divisionLabel = currentCountryConfig?.regionLabel || "Region / State";
  const availableDivisions = currentCountryConfig?.regions || [];

  const handleCountrySelect = (cName: string) => {
    if (cName === "custom") {
      setCountryName("custom");
      setCityName("custom");
      setSubcityName("custom");
      return;
    }
    setCountryName(cName);
    setCustomCountry("");
    const cfg = getCountryByName(cName);
    const firstRegion = cfg?.regions?.[0]?.name || "Central";
    setRegionName(firstRegion);

    const regionCities = getCitiesForRegion(cName, firstRegion);
    const firstCity = regionCities[0] || (firstRegion !== "Central" ? firstRegion : "Capital City");
    setCityName(firstCity);
    setCustomCity("");

    const subcities = getSubcitiesForCity(cName, firstCity);
    const firstSubcity = subcities[0] || "Downtown";
    setSubcityName(firstSubcity);
    setCustomSubcity("");

    const coords = getCityCoordinates(cName, firstCity, firstRegion);
    if (coords) {
      setLatitude(coords[0]);
      setLongitude(coords[1]);
    }
  };

  const handleRegionSelect = (rName: string) => {
    if (rName === "custom") {
      setRegionName("custom");
      return;
    }
    setRegionName(rName);

    // 1. Automatically update City / Municipality to first city of the selected region
    const regionCities = getCitiesForRegion(effectiveCountryName, rName);
    const firstCity = regionCities[0] || (rName !== "custom" ? rName : "Capital City");
    setCityName(firstCity);
    setCustomCity("");

    // 2. Automatically update District / Subcity to first subcity of that new city
    const subcities = getSubcitiesForCity(effectiveCountryName, firstCity);
    const firstSubcity = subcities[0] || "Downtown";
    setSubcityName(firstSubcity);
    setCustomSubcity("");

    // 3. Automatically update Pinpoint Map Position (coordinates)
    const coords = getCityCoordinates(effectiveCountryName, firstCity, rName);
    if (coords) {
      setLatitude(coords[0]);
      setLongitude(coords[1]);
    }
  };

  const recordCustomCountry = (nameInput: string) => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    if (!customCountries.includes(trimmed)) setCustomCountries((prev) => [...prev, trimmed]);
    setCountryName(trimmed);
    setCustomCountry("");
    setCityName("custom");
    setSubcityName("custom");
    toast.success(`Country "${trimmed}" registered.`);
  };

  const handleCitySelect = (cName: string) => {
    if (cName === "custom") {
      setCityName("custom");
      setSubcityName("custom");
      return;
    }
    setCityName(cName);
    setCustomCity("");

    // 1. Keep region in sync if the chosen city belongs to a specific region
    const derivedRegion = getRegionForCity(effectiveCountryName, cName, true);
    if (derivedRegion && derivedRegion !== regionName) {
      setRegionName(derivedRegion);
    }

    // 2. Automatically update District / Subcity
    const subcities = getSubcitiesForCity(effectiveCountryName, cName);
    const firstSubcity = subcities[0] || "Downtown";
    setSubcityName(firstSubcity);
    setCustomSubcity("");

    // 3. Automatically update Pinpoint Map Position
    const coords = getCityCoordinates(effectiveCountryName, cName, derivedRegion || regionName);
    if (coords) {
      setLatitude(coords[0]);
      setLongitude(coords[1]);
    }
  };

  const handleSubcitySelect = (sName: string) => {
    if (sName === "custom") {
      setSubcityName("custom");
      return;
    }
    setSubcityName(sName);
    setCustomSubcity("");

    // Automatically update Pinpoint Map Position if subcity coordinates exist
    const subcityCoords = getSubcityCoordinates(effectiveCountryName, effectiveCityName, sName);
    if (subcityCoords) {
      setLatitude(subcityCoords[0]);
      setLongitude(subcityCoords[1]);
    }
  };

  const recordCustomCity = (nameInput: string) => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    const parentKey = countryName === "custom" ? "custom" : countryName;
    setCustomCitiesMap((prev) => ({ ...prev, [parentKey]: [...(prev[parentKey] || []), trimmed] }));
    setCityName(trimmed);
    setCustomCity("");
    setSubcityName("custom");
    toast.success(`City "${trimmed}" added.`);
  };

  const recordCustomSubcity = (nameInput: string) => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    setSubcityName(trimmed);
    setCustomSubcity("");
    toast.success(`District / Subcity "${trimmed}" set.`);
  };

  // Video embed helper
  const videoEmbedUrl = useMemo(() => {
    if (!videoUrl) return null;
    const ytEmbed = getYoutubeEmbedUrl(videoUrl);
    if (ytEmbed) return ytEmbed;
    const vmMatch = videoUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    if (vmMatch?.[3]) return `https://player.vimeo.com/video/${vmMatch[3]}`;
    if (videoUrl.match(/\.(mp4|webm|ogg)$/i)) return videoUrl;
    return null;
  }, [videoUrl]);

  // File Upload Handlers – upload to Cloudinary via /api/upload
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Logo must be less than 5MB"); return; }
    const toastId = toast.loading("Uploading logo to Cloudinary...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "globalbiz/businesses/logos");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setLogoUrl(data.url);
        toast.success("Logo uploaded to Cloudinary!", { id: toastId });
      } else throw new Error(data.error || "Upload failed");
    } catch {
      // Fallback to local preview
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === "string") { setLogoUrl(reader.result); toast.warning("Logo previewed locally (Cloudinary key missing).", { id: toastId }); } };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast.error("Cover image must be less than 8MB"); return; }
    const toastId = toast.loading("Uploading cover to Cloudinary...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "globalbiz/businesses/covers");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setCoverUrl(data.url);
        toast.success("Cover photo uploaded to Cloudinary!", { id: toastId });
      } else throw new Error(data.error || "Upload failed");
    } catch {
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === "string") { setCoverUrl(reader.result); toast.warning("Cover previewed locally (Cloudinary key missing).", { id: toastId }); } };
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const toastId = toast.loading("Uploading photo to Cloudinary...");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "globalbiz/businesses/gallery");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setGalleryPhotos((prev) => [
          ...prev,
          { id: `gal-${Date.now()}`, url: data.url, title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "), type: "interior" },
        ]);
        toast.success("Gallery photo uploaded to Cloudinary!", { id: toastId });
      } else throw new Error(data.error || "Upload failed");
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setGalleryPhotos((prev) => [
            ...prev,
            { id: `gal-${Date.now()}`, url: reader.result as string, title: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "), type: "interior" },
          ]);
          toast.warning("Photo previewed locally (Cloudinary key missing).", { id: toastId });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateDayHours = (day: string, field: keyof DaySchedule, value: string | boolean) => {
    setWeeklyHours((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  // -----------------------------------------------------------------
  // Draft Storage
  // -----------------------------------------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name || parsed.description || parsed.addressLine) {
          setHasSavedDraft(true);
          setDraftSavedAt(parsed._savedAt || "Recently");
        }
      } else {
        setHasSavedDraft(false);
        setDraftSavedAt(null);
      }
    } catch (e) {
      console.error("Failed to read draft", e);
    }
  }, [draftStorageKey]);

  const saveDraft = (showMessage = true) => {
    const draft = {
      step, name, businessLevel, businessType, yearEstablished, tagline, description,
      categoryId, customCategories, customCategory,
      subcategoryId, customSubcategories, customSubcategory,
      listingOptionId, customListingOptions, customListingOption,
      countryName: effectiveCountryName, customCountries, regionName,
      cityName: effectiveCityName, customCitiesMap,
      subcityName: subcityName === "custom" ? customSubcity : subcityName,
      customCity, customSubcity, addressLine, latitude, longitude,
      buildingName, floorNumber,
      telephone, whatsapp, email, website, facebookUrl, instagramUrl, tiktokUrl,
      hasMultipleBranches, branches,
      logoUrl, coverUrl, videoUrl, videoTitle,
      servicesAndMenu, priceTier, weeklyHours,
      wifi, parking, delivery, acceptsCards, outdoorSeating, airConditioning, petFriendly, accessible,
      verificationDocs,
      _savedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    localStorage.setItem(draftStorageKey, JSON.stringify(draft));
    setDraftSavedAt(draft._savedAt);
    setHasSavedDraft(true);
    if (showMessage) toast.success("Draft Saved", { description: `Progress saved at ${draft._savedAt}.` });
  };

  const loadDraft = () => {
    try {
      const saved = localStorage.getItem(draftStorageKey);
      if (!saved) return;
      const d = JSON.parse(saved);
      if (d.step) setStep(d.step);
      if (d.name) setName(d.name);
      if (d.businessLevel) setBusinessLevel(d.businessLevel);
      if (d.businessType) setBusinessType(d.businessType);
      if (d.yearEstablished) setYearEstablished(d.yearEstablished);
      if (d.tagline) setTagline(d.tagline);
      if (d.description) setDescription(d.description);
      if (d.customCategories && Array.isArray(d.customCategories)) setCustomCategories(d.customCategories);
      if (d.customSubcategories && Array.isArray(d.customSubcategories)) setCustomSubcategories(d.customSubcategories);
      if (d.customListingOptions && Array.isArray(d.customListingOptions)) setCustomListingOptions(d.customListingOptions);
      if (d.customCategory) setCustomCategory(d.customCategory);
      if (d.customSubcategory) setCustomSubcategory(d.customSubcategory);
      if (d.customListingOption) setCustomListingOption(d.customListingOption);
      if (d.categoryId) setCategoryId(d.categoryId);
      if (d.subcategoryId) setSubcategoryId(d.subcategoryId);
      if (d.listingOptionId) setListingOptionId(d.listingOptionId);
      if (d.customCountries && Array.isArray(d.customCountries)) setCustomCountries(d.customCountries);
      if (d.customCitiesMap) setCustomCitiesMap(d.customCitiesMap);
      if (d.countryName) setCountryName(d.countryName);
      if (d.regionName) setRegionName(d.regionName);
      if (d.cityName) setCityName(d.cityName);
      if (d.subcityName) setSubcityName(d.subcityName);
      if (d.customCity) setCustomCity(d.customCity);
      if (d.customSubcity) setCustomSubcity(d.customSubcity);
      if (d.addressLine) setAddressLine(d.addressLine);
      if (d.latitude) setLatitude(d.latitude);
      if (d.longitude) setLongitude(d.longitude);
      if (d.buildingName) setBuildingName(d.buildingName);
      if (d.floorNumber) setFloorNumber(d.floorNumber);
      if (d.telephone) setTelephone(d.telephone);
      if (d.whatsapp) setWhatsapp(d.whatsapp);
      if (d.email) setEmail(d.email);
      if (d.website) setWebsite(d.website);
      if (d.facebookUrl) setFacebookUrl(d.facebookUrl);
      if (d.instagramUrl) setInstagramUrl(d.instagramUrl);
      if (d.tiktokUrl) setTiktokUrl(d.tiktokUrl);
      if (typeof d.hasMultipleBranches === "boolean") setHasMultipleBranches(d.hasMultipleBranches);
      if (d.branches && Array.isArray(d.branches)) setBranches(d.branches);
      if (d.logoUrl) setLogoUrl(d.logoUrl);
      if (d.coverUrl) setCoverUrl(d.coverUrl);
      if (d.videoUrl) setVideoUrl(d.videoUrl);
      if (d.videoTitle) setVideoTitle(d.videoTitle);
      if (d.servicesAndMenu) setServicesAndMenu(d.servicesAndMenu);
      if (d.priceTier) setPriceTier(d.priceTier);
      if (d.weeklyHours) setWeeklyHours(d.weeklyHours);
      if (typeof d.wifi === "boolean") setWifi(d.wifi);
      if (typeof d.parking === "boolean") setParking(d.parking);
      if (typeof d.delivery === "boolean") setDelivery(d.delivery);
      if (typeof d.acceptsCards === "boolean") setAcceptsCards(d.acceptsCards);
      if (typeof d.outdoorSeating === "boolean") setOutdoorSeating(d.outdoorSeating);
      if (typeof d.airConditioning === "boolean") setAirConditioning(d.airConditioning);
      if (typeof d.petFriendly === "boolean") setPetFriendly(d.petFriendly);
      if (typeof d.accessible === "boolean") setAccessible(d.accessible);
      if (d.verificationDocs && Array.isArray(d.verificationDocs)) setVerificationDocs(d.verificationDocs);
      toast.info("Draft Restored", { description: "Your previous progress has been restored." });
    } catch (e) {
      toast.error("Failed to restore draft");
    }
  };

  const clearDraft = () => {
    localStorage.removeItem(draftStorageKey);
    setHasSavedDraft(false);
    setDraftSavedAt(null);
    toast.info("Draft Cleared");
  };

  // -----------------------------------------------------------------
  // Derived display values
  // -----------------------------------------------------------------
  const selectedMainCategory = useMemo(() => {
    if (categoryId === "custom") return { id: "custom", name: customCategory.trim() || "Custom Industry" };
    return level1Categories.find((c) => c.id === categoryId) || dbCategories.find((c) => c.id === categoryId);
  }, [categoryId, customCategory, level1Categories, dbCategories]);

  const selectedSubcategory = useMemo(() => {
    if (subcategoryId === "custom") return { id: "custom", name: customSubcategory.trim() || "Other Sector" };
    return level2Categories.find((c) => c.id === activeSubcategoryId) || dbCategories.find((c) => c.id === activeSubcategoryId);
  }, [subcategoryId, customSubcategory, level2Categories, activeSubcategoryId, dbCategories]);

  const selectedListingOption = useMemo(() => {
    if (listingOptionId === "custom") return { id: "custom", name: customListingOption.trim() || "Other Specialty" };
    return level3Categories.find((c) => c.id === listingOptionId) || dbCategories.find((c) => c.id === listingOptionId);
  }, [listingOptionId, customListingOption, level3Categories, dbCategories]);

  const displayCountry = effectiveCountryName;
  const displayCountryFlag = COUNTRIES_WITH_CITIES.find((c) => c.name.toLowerCase() === effectiveCountryName.toLowerCase())?.flag || "🌐";
  const displayCity = effectiveCityName;
  const displaySubcity = subcityName === "custom" ? customSubcity || "Unspecified Area" : subcityName;

  const progressPct = Math.round((step / 7) * 100);

  // -----------------------------------------------------------------
  // Navigation & Submission
  // -----------------------------------------------------------------
  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 7) {
      setStep((step + 1) as any);
      saveDraft(false);
      if (mode === "fullscreen") window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setIsSubmitting(true);
      const activeOwner =
        user?.id ||
        (typeof window !== "undefined" ? localStorage.getItem("bizfinder_active_owner_id") : null) ||
        "user-owner-1";
      const DAY_INDEX_MAP: Record<string, number> = {
        Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
      };
      const openDays = Object.entries(weeklyHours).map(([day, v]) => ({
        dayOfWeek: DAY_INDEX_MAP[day] ?? 1,
        openTime: v.open ? v.openTime : undefined,
        closeTime: v.open ? v.closeTime : undefined,
        isClosed: !v.open,
        is24h: v.open && v.openTime === "00:00" && v.closeTime === "23:59",
      }));

      const payload = {
        ownerId: activeOwner,
        name: name.trim(),
        businessLevel,
        businessType: businessType || undefined,
        yearEstablished: yearEstablished ? parseInt(yearEstablished, 10) : undefined,
        categoryId,
        categoryName: selectedMainCategory?.name || "General Business",
        subcategoryId: subcategoryId || undefined,
        subcategoryName: selectedSubcategory?.name || undefined,
        subSubcategoryId: listingOptionId || undefined,
        subSubcategoryName: selectedListingOption?.name || undefined,
        countryName: displayCountry,
        regionName,
        cityName: displayCity,
        districtName: displaySubcity,
        addressLine: addressLine.trim() || `${displaySubcity}, ${displayCity}, ${displayCountry}`,
        building: buildingName.trim() || undefined,
        floorNumber: floorNumber.trim() || undefined,
        latitude,
        longitude,
        telephone: telephone.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        facebookUrl: facebookUrl.trim() || undefined,
        instagramUrl: instagramUrl.trim() || undefined,
        tiktokUrl: tiktokUrl.trim() || undefined,
        hasMultipleBranches,
        branchesCount: hasMultipleBranches ? branches.length : 0,
        branches: hasMultipleBranches && branches.length > 0 ? branches : undefined,
        description: description.trim() || tagline.trim() || `${name} business listing profile`,
        shortDescription: tagline.trim() || undefined,
        logoUrl: logoUrl.trim() || undefined,
        coverUrl: coverUrl.trim() || undefined,
        youtubeVideoId: extractYoutubeVideoId(videoUrl) || undefined,
        servicesAndMenu: servicesAndMenu.trim() || undefined,
        media: [
          coverUrl.trim() ? { id: "med-cover-1", type: "cover", url: coverUrl.trim(), title: `${name.trim()} - Cover Photo`, sortOrder: 1, uploadedAt: new Date().toISOString() } : null,
          logoUrl.trim() ? { id: "med-logo-1", type: "logo", url: logoUrl.trim(), title: `${name.trim()} - Brand Logo`, sortOrder: 2, uploadedAt: new Date().toISOString() } : null,
          ...galleryPhotos.map((p, idx) => ({ id: p.id || `med-gal-${idx + 1}`, type: p.type || "interior", url: p.url, title: p.title || `${name.trim()} Gallery`, sortOrder: idx + 3, uploadedAt: new Date().toISOString() })),
          videoUrl.trim() ? {
            id: "med-video-1",
            type: "video",
            url: videoUrl.trim(),
            thumbnailUrl: extractYoutubeVideoId(videoUrl) ? getYoutubeThumbnail(videoUrl) : undefined,
            title: videoTitle.trim() || `${name.trim()} Video Tour`,
            sortOrder: galleryPhotos.length + 3,
            uploadedAt: new Date().toISOString()
          } : null,
        ].filter(Boolean),
        attributes: { wifi, parking, delivery, acceptsCards, outdoorSeating, airConditioning, petFriendly, accessible, priceTier },
        openingHours: openDays,
        verificationDocuments: verificationDocs.length > 0 ? verificationDocs : undefined,
        services: servicesAndMenu
          ? servicesAndMenu.split("\n").map((line) => line.trim()).filter(Boolean).map((line, idx) => ({
              id: `svc-${idx + 1}`, name: line.replace(/^[\*\-\d\.]+\s*/, "").trim(), description: line,
            }))
          : [],
        isAdmin: Boolean(isAdmin),
        ...(isAdmin
          ? {
              approvalStatus: adminDirectApprove ? "approved" : "pending_city",
              isApproved: adminDirectApprove,
              isPublished: adminDirectApprove,
              isVerified: adminDirectApprove,
            }
          : {}),
      };

      try {
        const response = await fetch("/api/businesses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        if (!response.ok) {
          let errorMsg = "Failed to save listing.";
          if (response.headers.get("content-type")?.includes("application/json")) {
            const errData = await response.json().catch(() => null);
            if (errData?.error) errorMsg = errData.error;
          }
          toast.error("Submission Failed", { description: errorMsg, duration: 6000 });
          setIsSubmitting(false);
          return;
        }
        const data = await response.json().catch(() => ({}));
        if (data.business || data.success) {
          const newBizId = data.business?.id || "";
          if (newBizId && typeof window !== "undefined") {
            localStorage.setItem("bizfinder_last_created_biz", newBizId);
          }
          if (data.business?.ownerId && typeof window !== "undefined") {
            localStorage.setItem("bizfinder_active_owner_id", data.business.ownerId);
          }
          toast.success(
            isAdmin ? "Business Listing Created Successfully!" : "Listing Submitted Successfully!",
            {
              description: isAdmin
                ? `"${name}" in ${displayCity}, ${displayCountry} registered and live in database.`
                : `"${name}" in ${displayCity}, ${displayCountry} submitted for approval.`,
              duration: 5000,
            }
          );
          setIsSubmitting(false);
          setIsSubmitted(true);
          localStorage.removeItem(draftStorageKey);
          setHasSavedDraft(false);
          if (onSuccess) {
            setTimeout(() => onSuccess(newBizId), 1500);
          } else if (redirectPath) {
            setTimeout(() => router.push(redirectPath), 2000);
          } else if (redirectPath === undefined) {
            setTimeout(() => router.push("/dashboard"), 3000);
          }
        } else {
          toast.error("Submission Failed", { description: data.error || "Failed to save listing.", duration: 6000 });
          setIsSubmitting(false);
        }
      } catch (err: any) {
        toast.error("Submission Error", { description: err.message || "Could not connect to server.", duration: 6000 });
        setIsSubmitting(false);
      }
    }
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  const isEmbedded = mode === "embedded";

  return (
    <div className={isEmbedded ? "w-full space-y-4" : "w-full min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 flex items-start justify-center bg-background text-foreground"}>
      <div className={isEmbedded ? "w-full space-y-4" : "max-w-4xl w-full space-y-6"}>

        {/* Top Bar: back link (fullscreen) or cancel (embedded) */}
        <div className="flex items-center justify-between">
          {isEmbedded ? (
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-primary/25 bg-primary/10 text-primary">
                {isAdmin ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <Compass className="w-3.5 h-3.5" />}
                {isAdmin ? "Super Admin Business Creation Wizard" : "Worldwide Business Listing Wizard"}
              </div>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Business Dashboard
            </Link>
          )}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => saveDraft(true)}
              className="h-8 text-xs font-bold gap-1.5 border-border bg-card hover:bg-muted text-foreground"
            >
              <Save className="w-3.5 h-3.5" /> Save Draft
            </Button>
            {isEmbedded && onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 text-xs font-bold gap-1.5 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </Button>
            )}
            <div className="px-3 py-1 rounded-xl border border-border bg-muted/60 text-xs font-black text-foreground">
              Step <span className="text-primary">{step}</span> of 7
            </div>
          </div>
        </div>

        {/* HEADER CARD */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-7 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="space-y-1.5">
              {!isEmbedded && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border border-primary/25 bg-primary/10 text-primary">
                  <Compass className="w-3.5 h-3.5" />
                  Worldwide Business Listing Wizard
                </div>
              )}
              <h2 className={`${isEmbedded ? "text-xl" : "text-2xl sm:text-3xl"} font-black text-foreground tracking-tight`}>
                Register Your Business
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Follow all 7 steps to register and publish your business worldwide across directories and search results.
              </p>
            </div>
            {!isEmbedded && (
              <Link href="/dashboard/listings/new" target="_blank">
                <Button size="sm" variant="outline" className="text-xs font-bold gap-1.5 border-border">
                  <ExternalLink className="w-3.5 h-3.5" /> Open Fullscreen
                </Button>
              </Link>
            )}
          </div>

          {/* DRAFT RESTORE PROMPT */}
          {hasSavedDraft && !isSubmitted && (
            <div className="mb-5 p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs gap-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Saved draft available {draftSavedAt ? `(saved at ${draftSavedAt})` : ""}. Restore previous details?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={loadDraft}
                  className="h-7 text-xs font-bold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
                >
                  <RotateCcw className="w-3 h-3 mr-1" /> Restore
                </Button>
                <button
                  type="button"
                  onClick={clearDraft}
                  className="text-xs text-muted-foreground hover:text-red-500 transition-colors px-2"
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {/* STEPPER PROGRESS */}
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {WIZARD_STEPS.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id;
                const isAccessible = s.id <= step;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => isAccessible && setStep(s.id as any)}
                    disabled={!isAccessible}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all text-center ${
                      isActive
                        ? "border-primary bg-primary/10 shadow-xs ring-2 ring-primary/20"
                        : isDone
                        ? "border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15"
                        : "border-border/60 bg-muted/20 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-colors ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                          : isDone
                          ? "bg-emerald-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[10px] sm:text-xs font-black truncate ${isActive ? "text-primary" : isDone ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"}`}>
                        {s.label}
                      </div>
                      <div className="text-[9px] text-muted-foreground truncate hidden sm:block">
                        {s.sublabel}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {/* PROGRESS BAR */}
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* SUBMITTED SUCCESS BANNER WITH MULTI-TIER APPROVAL FLOW */}
        {isSubmitted ? (
          <div className="p-8 sm:p-10 rounded-3xl border border-indigo-500/30 bg-card text-center space-y-6 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto ring-8 ring-indigo-500/5">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Stage 1 of 3 Initiated
              </span>
              <h2 className="text-2xl font-black text-foreground">Listing Submitted for Multi-Tier Approval!</h2>
              <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                "{name}" has been recorded. To protect directory quality, your listing will undergo administrative verification before going live.
              </p>
            </div>

            {/* 3-Tier Approval Pipeline Tracker */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left max-w-2xl mx-auto pt-2">
              <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Stage 1: Pending</span>
                  <Clock className="w-4 h-4 text-amber-500 animate-pulse" />
                </div>
                <div className="text-xs font-black text-foreground">City Admin Review</div>
                <div className="text-[11px] text-muted-foreground">{displayCity} municipal team verifies address & subcity permits.</div>
              </div>

              <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-1.5 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stage 2: Queued</span>
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-xs font-black text-foreground">Country Lead Review</div>
                <div className="text-[11px] text-muted-foreground">{displayCountry} national compliance & tax identity checks.</div>
              </div>

              <div className="p-3.5 rounded-2xl border border-border bg-muted/20 space-y-1.5 opacity-80">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Stage 3: Queued</span>
                  <Crown className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="text-xs font-black text-foreground">Super Admin Posting</div>
                <div className="text-[11px] text-muted-foreground">Final global authorization & publication. (Super Admin may fast-track).</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-border bg-muted/40 text-xs text-muted-foreground max-w-lg mx-auto">
              💡 <strong>Note:</strong> Super Admins can fast-track approval without waiting for intermediate steps. You will receive real-time notifications as your listing progresses.
            </div>

            {isEmbedded ? (
              <div className="pt-2">
                <Button
                  onClick={() => onSuccess?.("")}
                  className="font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Back to My Businesses
                </Button>
              </div>
            ) : (
              <div className="pt-2">
                <Link href="/dashboard">
                  <Button className="font-bold bg-primary text-primary-foreground hover:bg-primary/90">
                    Go to Owner Dashboard
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* FORM CONTAINER */
          <form onSubmit={handleNext} className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-sm space-y-6">

            {/* STEP 1: IDENTITY & BRAND */}
            {step === 1 && (
              <div className="space-y-5">
                <StepHeader step={1} title="Business Identity & Brand" subtitle="Basic company name, scale, and descriptive overview." />

                <FormField label="Business Name" required>
                  <Input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Grand Palace Hotel & Luxury Suites"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground font-semibold"
                  />
                </FormField>

                {/* Business Scale / Level */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    Business Scale / Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {(["Small", "Medium", "Large", "International"] as const).map((lvl) => {
                      const isSel = businessLevel === lvl;
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setBusinessLevel(lvl)}
                          className={`p-3 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                            isSel
                              ? "border-primary bg-primary/10 ring-2 ring-primary/20 shadow-xs"
                              : "border-border bg-background hover:bg-muted/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isSel ? "text-primary" : "text-foreground"}`}>
                              {lvl}
                            </span>
                            {isSel ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            ) : (
                              <div className="w-3 h-3 rounded-full border border-border" />
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {lvl === "Small" && "Local boutique or shop"}
                            {lvl === "Medium" && "Growing multi-person firm"}
                            {lvl === "Large" && "Enterprise scale presence"}
                            {lvl === "International" && "Global corporate branch"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <FormField label="Tagline / Short Catchphrase">
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. World-class hospitality in the heart of the city"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </FormField>

                <FormField label="Detailed Description">
                  <Textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your business background, offerings, signature services, and customer promise..."
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </FormField>

                {/* Established Year + Business Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Established Year">
                    <Input
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={yearEstablished}
                      onChange={(e) => setYearEstablished(e.target.value)}
                      placeholder={`e.g. ${new Date().getFullYear() - 5}`}
                      className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono"
                    />
                    <p className="text-[11px] text-muted-foreground mt-1">Year the business was founded or officially registered.</p>
                  </FormField>

                  <FormField label="Business / Legal Type">
                    <select
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value as BusinessType | "")}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select business type...</option>
                      {BUSINESS_TYPE_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-muted-foreground mt-1">Legal or operational structure of your business.</p>
                  </FormField>
                </div>
              </div>
            )}

            {/* STEP 2: CATEGORIES HIERARCHY */}
            {step === 2 && (
              <div className="space-y-5">
                <StepHeader step={2} title="Industry & Category Taxonomy" subtitle="Select your primary sector, subcategory, and specialty listing tag." />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Level 1: Primary Industry */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">
                      1. Primary Industry <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => handleCategoryChange(e.target.value)}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {level1Categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                      <option value="custom">+ Other / Custom Industry...</option>
                    </select>
                    {categoryId === "custom" && (
                      <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                        <span className="text-[11px] font-bold text-muted-foreground">Register New Industry:</span>
                        <div className="flex gap-1.5">
                          <Input placeholder="e.g. Aerospace Engineering" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="bg-background border-border text-foreground text-xs" />
                          <Button type="button" size="sm" onClick={() => recordCustomCategory(customCategory)} className="text-xs shrink-0 font-bold"><Plus className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Level 2: Subcategory */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">2. Subcategory</label>
                    <select
                      value={subcategoryId}
                      onChange={(e) => handleSubcategoryChange(e.target.value)}
                      disabled={categoryId === "custom" && !customCategory}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      {level2Categories.map((sc) => (
                        <option key={sc.id} value={sc.id}>{sc.name}</option>
                      ))}
                      <option value="custom">+ Other / Custom Subcategory...</option>
                    </select>
                    {subcategoryId === "custom" && (
                      <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                        <span className="text-[11px] font-bold text-muted-foreground">Register New Subcategory:</span>
                        <div className="flex gap-1.5">
                          <Input placeholder="e.g. Drone Analytics" value={customSubcategory} onChange={(e) => setCustomSubcategory(e.target.value)} className="bg-background border-border text-foreground text-xs" />
                          <Button type="button" size="sm" onClick={() => recordCustomSubcategory(customSubcategory)} className="text-xs shrink-0 font-bold"><Plus className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Level 3: Listing Option */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground block">3. Specialty / Option</label>
                    <select
                      value={listingOptionId}
                      onChange={(e) => handleListingOptionChange(e.target.value)}
                      disabled={subcategoryId === "custom" && !customSubcategory}
                      className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                      {level3Categories.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                      <option value="custom">+ Other / Custom Specialty...</option>
                    </select>
                    {listingOptionId === "custom" && (
                      <div className="p-3 rounded-xl border border-border bg-muted/30 space-y-2">
                        <span className="text-[11px] font-bold text-muted-foreground">Register New Specialty:</span>
                        <div className="flex gap-1.5">
                          <Input placeholder="e.g. Autonomous Sensor R&D" value={customListingOption} onChange={(e) => setCustomListingOption(e.target.value)} className="bg-background border-border text-foreground text-xs" />
                          <Button type="button" size="sm" onClick={() => recordCustomListingOption(customListingOption)} className="text-xs shrink-0 font-bold"><Plus className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Hierarchy Breadcrumbs */}
                <div className="p-3.5 rounded-2xl border border-border bg-muted/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-muted-foreground font-semibold">Hierarchy Path:</span>
                    <Badge variant="outline" className="font-bold border-border bg-background text-foreground">{selectedMainCategory?.name || "General"}</Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge variant="outline" className="font-bold border-border bg-background text-foreground">{selectedSubcategory?.name || "All Branches"}</Badge>
                    <span className="text-muted-foreground">→</span>
                    <Badge className="font-bold bg-primary text-primary-foreground">{selectedListingOption?.name || "Standard Profile"}</Badge>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: LOCATION WORLDWIDE */}
            {step === 3 && (
              <div className="space-y-5">
                <StepHeader step={3} title="Worldwide Location & Pin Map" subtitle="Select territory, specify street address, and position pin precisely on interactive map." />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Country */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">Country <span className="text-red-500">*</span></label>
                    <select value={countryName} onChange={(e) => handleCountrySelect(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      {allCountriesList.map((c) => (<option key={c} value={c}>{c}</option>))}
                      <option value="custom">+ Other / Custom Country...</option>
                    </select>
                    {countryName === "custom" && (
                      <div className="pt-1.5 flex gap-1.5">
                        <Input placeholder="Country name" value={customCountry} onChange={(e) => setCustomCountry(e.target.value)} className="bg-background border-border text-foreground text-xs" />
                        <Button type="button" size="sm" onClick={() => recordCustomCountry(customCountry)} className="text-xs font-bold"><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                    )}
                  </div>

                  {/* Region / State */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">{divisionLabel} <span className="text-red-500">*</span></label>
                    {availableDivisions.length > 0 ? (
                      <select value={regionName} onChange={(e) => handleRegionSelect(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        {availableDivisions.map((d) => (<option key={d.name} value={d.name}>{d.name}</option>))}
                      </select>
                    ) : (
                      <Input value={regionName} onChange={(e) => handleRegionSelect(e.target.value)} placeholder="Enter province or state" className="bg-background border-border text-foreground text-xs" />
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">City / Municipality <span className="text-red-500">*</span></label>
                    <select value={cityName} onChange={(e) => handleCitySelect(e.target.value)} className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      {currentRegionCities.map((c) => (<option key={c} value={c}>{c}</option>))}
                      <option value="custom">+ Other / Custom City...</option>
                    </select>
                    {cityName === "custom" && (
                      <div className="pt-1.5 flex gap-1.5">
                        <Input placeholder="City name" value={customCity} onChange={(e) => setCustomCity(e.target.value)} className="bg-background border-border text-foreground text-xs" />
                        <Button type="button" size="sm" onClick={() => recordCustomCity(customCity)} className="text-xs font-bold"><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                    )}
                  </div>

                  {/* District / Subcity */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground block">District / Subcity</label>
                    {currentCitySubcities.length > 0 ? (
                      <select
                        value={subcityName}
                        onChange={(e) => handleSubcitySelect(e.target.value)}
                        className="w-full h-10 rounded-xl border border-border bg-background px-3 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {currentCitySubcities.map((s) => (<option key={s} value={s}>{s}</option>))}
                        <option value="custom">+ Other / Custom District...</option>
                      </select>
                    ) : (
                      <Input value={subcityName === "custom" ? customSubcity : subcityName} onChange={(e) => handleSubcitySelect(e.target.value)} placeholder="e.g. Downtown / Financial District" className="bg-background border-border text-foreground text-xs" />
                    )}
                    {subcityName === "custom" && (
                      <div className="pt-1.5 flex gap-1.5">
                        <Input placeholder="District name" value={customSubcity} onChange={(e) => setCustomSubcity(e.target.value)} className="bg-background border-border text-foreground text-xs" />
                        <Button type="button" size="sm" onClick={() => recordCustomSubcity(customSubcity)} className="text-xs font-bold"><Plus className="w-3.5 h-3.5" /></Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Street Address & Building Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <FormField label="Physical Street Address" required>
                      <Input required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="e.g. 102 Africa Avenue, Near Edna Mall" className="bg-background border-border text-foreground placeholder:text-muted-foreground" />
                    </FormField>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <FormField label="Building / Mall">
                      <Input value={buildingName} onChange={(e) => setBuildingName(e.target.value)} placeholder="e.g. Edna Mall" className="bg-background border-border text-foreground text-xs" />
                    </FormField>
                    <FormField label="Floor / Unit">
                      <Input value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} placeholder="e.g. 3rd Floor" className="bg-background border-border text-foreground text-xs" />
                    </FormField>
                  </div>
                </div>

                {/* Leaflet Interactive Pin Map */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> Pinpoint Map Position
                    </label>
                    <span className="text-[11px] text-muted-foreground">
                      Coordinates: <strong className="text-foreground font-mono">{latitude.toFixed(5)}, {longitude.toFixed(5)}</strong>
                    </span>
                  </div>
                  <div className="rounded-2xl border border-border overflow-hidden shadow-xs">
                    <LocationPinMap
                      latitude={latitude}
                      longitude={longitude}
                      businessName={name || "New Business Location"}
                      onChange={(lat: number, lng: number) => { setLatitude(lat); setLongitude(lng); }}
                    />
                  </div>
                </div>
                {/* Latitude / Longitude Manual Input */}
                <div className="p-4 rounded-2xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-foreground">Manual GPS Coordinates</div>
                      <div className="text-[11px] text-muted-foreground">Can't use the map? Enter latitude &amp; longitude directly (you can find these on Google Maps).</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Latitude">
                      <Input
                        type="number"
                        step="0.000001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 9.010793"
                        className="bg-background border-border text-foreground font-mono text-xs"
                      />
                    </FormField>
                    <FormField label="Longitude">
                      <Input
                        type="number"
                        step="0.000001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                        placeholder="e.g. 38.761252"
                        className="bg-background border-border text-foreground font-mono text-xs"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-5">
                <StepHeader step={4} title="Contact Channels & Branches" subtitle="Provide direct inquiry lines, WhatsApp, email, and configure chain branches." />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Telephone Number" required>
                    <Input required value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="+251 11 661 2345" className="bg-background border-border text-foreground font-mono" />
                  </FormField>
                  <FormField label="WhatsApp Business Number">
                    <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+251 91 123 4567" className="bg-background border-border text-foreground font-mono" />
                  </FormField>
                  <FormField label="Official Contact Email">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@grandhotel.com" className="bg-background border-border text-foreground" />
                  </FormField>
                  <FormField label="Official Website URL">
                    <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://www.grandhotel.com" className="bg-background border-border text-foreground font-mono" />
                  </FormField>
                </div>

                {/* Social Media Links */}
                <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-black text-foreground">
                    <Globe className="w-4 h-4 text-primary" />
                    <span>Social Media Profiles</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Add your business social media pages to help customers connect and follow you.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <FormField label="Facebook Page URL">
                      <Input
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/yourbusiness"
                        className="bg-background border-border text-foreground font-mono text-xs"
                      />
                    </FormField>
                    <FormField label="Instagram Profile URL">
                      <Input
                        value={instagramUrl}
                        onChange={(e) => setInstagramUrl(e.target.value)}
                        placeholder="https://instagram.com/yourbusiness"
                        className="bg-background border-border text-foreground font-mono text-xs"
                      />
                    </FormField>
                    <FormField label="TikTok Profile URL">
                      <Input
                        value={tiktokUrl}
                        onChange={(e) => setTiktokUrl(e.target.value)}
                        placeholder="https://tiktok.com/@yourbusiness"
                        className="bg-background border-border text-foreground font-mono text-xs"
                      />
                    </FormField>
                  </div>
                </div>

                {/* Multiple Branches Support */}
                <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-black text-foreground">Multi-Branch Chain Network</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Does this business have other physical branches or chain outlets?</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={hasMultipleBranches} onChange={(e) => setHasMultipleBranches(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  {hasMultipleBranches && (
                    <div className="pt-2 border-t border-border">
                      <BranchManager
                        businessName={name || "Business"}
                        defaultCountry={displayCountry}
                        defaultCity={displayCity}
                        defaultSubcity={displaySubcity}
                        defaultAddress={addressLine}
                        defaultPhone={telephone}
                        defaultEmail={email}
                        defaultLatitude={latitude}
                        defaultLongitude={longitude}
                        hasMultipleBranches={hasMultipleBranches}
                        onHasMultipleBranchesChange={setHasMultipleBranches}
                        branches={branches}
                        onBranchesChange={setBranches}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 5: MEDIA SHOWCASE */}
            {step === 5 && (
              <div className="space-y-5">
                <StepHeader step={5} title="Media Showcase (Photos & Video)" subtitle="Upload brand logo, cover banner, photo gallery, and promotional video." />

                {/* Logo Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Brand Logo URL or File</label>
                    <label className="cursor-pointer text-xs font-bold flex items-center gap-1 text-primary hover:underline">
                      <Camera className="w-3.5 h-3.5" /> Upload File
                      <input type="file" accept="image/*" onChange={handleLogoFileUpload} className="hidden" />
                    </label>
                  </div>
                  <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://images.unsplash.com/... or paste image URL" className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs" />
                  {logoUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-muted/20">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={logoUrl} alt="Logo Preview" className="w-12 h-12 rounded-xl object-cover border border-border shadow-xs" />
                      <div className="text-xs text-muted-foreground">
                        <div className="font-bold text-foreground">Logo Preview</div>
                        <div className="font-mono truncate max-w-[280px]">{logoUrl.startsWith("data:") ? "Uploaded Image File" : logoUrl}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Cover Photo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground">Cover Photo <span className="text-red-500">*</span></label>
                    <label className="cursor-pointer text-xs font-bold flex items-center gap-1 text-primary hover:underline">
                      <Camera className="w-3.5 h-3.5" /> Upload File
                      <input type="file" accept="image/*" onChange={handleCoverFileUpload} className="hidden" />
                    </label>
                  </div>
                  <Input required value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} placeholder="https://images.unsplash.com/..." className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs" />
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    <span className="text-muted-foreground font-semibold">Presets:</span>
                    {[
                      { label: "Restaurant", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80" },
                      { label: "Cafe",       url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80" },
                      { label: "Boutique",   url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80" },
                      { label: "Hotel",      url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80" },
                    ].map((p) => (
                      <button key={p.label} type="button" onClick={() => setCoverUrl(p.url)} className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium transition-all">{p.label}</button>
                    ))}
                  </div>
                  {coverUrl && (
                    <div className="relative aspect-[16/8] rounded-2xl overflow-hidden border border-border shadow-xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5" /> Cover Banner Preview
                      </div>
                    </div>
                  )}
                </div>

                {/* Gallery Photos */}
                <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                        <Layers className="w-4 h-4 text-primary" />
                        <span>Gallery Photos ({galleryPhotos.length})</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Showcase interior, exterior, signature products, or staff photos.</p>
                    </div>
                    <label className="cursor-pointer text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/10 text-primary hover:bg-primary/15 transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Upload Photo
                      <input type="file" accept="image/*" onChange={handleGalleryFileUpload} className="hidden" />
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Input placeholder="Photo URL..." value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} className="bg-background border-border text-foreground text-xs" />
                    <Input placeholder="Caption..." value={newPhotoTitle} onChange={(e) => setNewPhotoTitle(e.target.value)} className="bg-background border-border text-foreground text-xs" />
                    <div className="flex gap-1.5">
                      <select value={newPhotoType} onChange={(e) => setNewPhotoType(e.target.value)} className="text-xs font-semibold px-2 py-1.5 rounded-xl bg-background border border-border text-foreground focus:outline-none flex-1">
                        <option value="interior">Interior</option>
                        <option value="exterior">Exterior</option>
                        <option value="menu">Menu Item</option>
                        <option value="team">Team</option>
                      </select>
                      <Button type="button" size="sm" onClick={() => { if (!newPhotoUrl.trim()) return; setGalleryPhotos((prev) => [...prev, { id: `gal-${Date.now()}`, url: newPhotoUrl.trim(), title: newPhotoTitle.trim() || `${name || "Business"} Photo`, type: newPhotoType }]); setNewPhotoUrl(""); setNewPhotoTitle(""); toast.success("Gallery photo added!"); }} disabled={!newPhotoUrl.trim()} className="text-xs font-bold"><Plus className="w-3.5 h-3.5" /> Add</Button>
                    </div>
                  </div>
                  {galleryPhotos.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                      {galleryPhotos.map((p) => (
                        <div key={p.id} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-muted shadow-xs">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2.5 flex flex-col justify-between">
                            <Badge className="bg-primary/90 text-white text-[9px] w-fit capitalize">{p.type}</Badge>
                            <div className="flex items-center justify-between text-white text-xs">
                              <span className="truncate pr-1">{p.title}</span>
                              <button type="button" onClick={() => setGalleryPhotos((prev) => prev.filter((i) => i.id !== p.id))} className="p-1 rounded-md bg-red-600 hover:bg-red-500"><Trash2 className="w-3 h-3" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Promotional Video */}
                <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-foreground">
                      <Film className="w-4 h-4 text-purple-600" />
                      <span>Promotional Video (YouTube / Vimeo / MP4)</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold border-border">Optional</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Video URL</label>
                      <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs" />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-muted-foreground block mb-1">Video Title</label>
                      <Input value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="e.g. 360 Tour" className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs" />
                    </div>
                  </div>
                  {videoEmbedUrl && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-border bg-black shadow-xs">
                      {videoUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video controls className="w-full h-full object-contain" src={videoEmbedUrl}>Your browser does not support video.</video>
                      ) : (
                        <iframe src={videoEmbedUrl} title={videoTitle || "Business Video"} className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 6: HOURS, PRICING & AMENITIES */}
            {step === 6 && (
              <div className="space-y-6">
                <StepHeader step={6} title="Hours, Pricing & Amenities" subtitle="Set your price tier, weekly operating schedule, and client amenities." />

                {/* Price Tier */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-amber-500" /> Price Tier <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {PRICE_TIERS.map((tier) => {
                      const isSel = priceTier === tier.value;
                      return (
                        <button key={tier.value} type="button" onClick={() => setPriceTier(tier.value)}
                          className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${isSel ? "border-amber-500/50 bg-amber-500/10 ring-2 ring-amber-500/20 shadow-xs" : "border-border bg-background hover:bg-muted/40"}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-base font-black ${isSel ? "text-amber-600 dark:text-amber-400" : "text-foreground"}`}>{tier.value}</span>
                            {isSel ? <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> : <div className="w-3 h-3 rounded-full border border-border" />}
                          </div>
                          <div className={`text-xs font-bold ${isSel ? "text-amber-700 dark:text-amber-300" : "text-foreground"}`}>{tier.label}</div>
                          <div className="text-[10px] text-muted-foreground">{tier.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Services & Menu */}
                <FormField label="Services & Menu Items">
                  <Textarea rows={3} value={servicesAndMenu} onChange={(e) => setServicesAndMenu(e.target.value)} placeholder={"- Breakfast Buffet\n- Spa & Wellness\n- Conference Room\n- Airport Shuttle"} className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs" />
                </FormField>

                {/* Weekly Opening Hours */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-primary" /> Weekly Opening Hours
                    </label>
                    <button type="button" onClick={() => { const allOpen = Object.fromEntries(DAYS_OF_WEEK.map((d) => [d, { open: true, openTime: "08:00", closeTime: "20:00" }])); setWeeklyHours(allOpen); toast.info("All days set to Open 08:00 - 20:00"); }} className="text-xs font-bold text-primary hover:underline">
                      Set All Open (8am - 8pm)
                    </button>
                  </div>
                  <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
                    <div className="grid grid-cols-[1.2fr_2fr_2fr_auto] gap-3 px-4 py-2.5 bg-muted/60 border-b border-border text-[11px] font-black text-muted-foreground">
                      <span>Day</span><span>Opens</span><span>Closes</span><span className="text-right">Status</span>
                    </div>
                    {DAYS_OF_WEEK.map((day, idx) => {
                      const sched = weeklyHours[day];
                      return (
                        <div key={day} className={`grid grid-cols-[1.2fr_2fr_2fr_auto] gap-3 px-4 py-2.5 items-center transition-colors ${idx < DAYS_OF_WEEK.length - 1 ? "border-b border-border/60" : ""} ${sched.open ? "bg-card" : "bg-muted/10 opacity-70"}`}>
                          <span className={`text-xs font-bold ${sched.open ? "text-foreground" : "text-muted-foreground"}`}>{day}</span>
                          <input type="time" value={sched.openTime} disabled={!sched.open} onChange={(e) => updateDayHours(day, "openTime", e.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-mono text-foreground disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-primary" />
                          <input type="time" value={sched.closeTime} disabled={!sched.open} onChange={(e) => updateDayHours(day, "closeTime", e.target.value)} className="h-8 rounded-lg border border-input bg-background px-2 text-xs font-mono text-foreground disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-primary" />
                          <button type="button" onClick={() => updateDayHours(day, "open", !sched.open)} className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${sched.open ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30" : "bg-muted text-muted-foreground border border-border"}`}>
                            {sched.open ? "Open" : "Closed"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Amenities & Offerings */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-foreground block">Available Amenities & Features</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { label: "High-Speed WiFi",    state: wifi,           toggle: () => setWifi(!wifi)                     },
                      { label: "Dedicated Parking",  state: parking,        toggle: () => setParking(!parking)               },
                      { label: "Delivery Service",   state: delivery,       toggle: () => setDelivery(!delivery)             },
                      { label: "Accepts Cards",      state: acceptsCards,   toggle: () => setAcceptsCards(!acceptsCards)     },
                      { label: "Outdoor Seating",    state: outdoorSeating, toggle: () => setOutdoorSeating(!outdoorSeating) },
                      { label: "Air Conditioning",   state: airConditioning,toggle: () => setAirConditioning(!airConditioning)},
                      { label: "Pet Friendly",       state: petFriendly,    toggle: () => setPetFriendly(!petFriendly)       },
                      { label: "Accessible Entrance",state: accessible,     toggle: () => setAccessible(!accessible)         },
                    ].map((a) => (
                      <button key={a.label} type="button" onClick={a.toggle} className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between ${a.state ? "border-emerald-500/40 bg-emerald-500/10 text-foreground shadow-xs" : "border-border bg-background text-muted-foreground hover:bg-muted/40"}`}>
                        <span className="font-semibold text-xs">{a.label}</span>
                        <div className={`w-4 h-4 rounded-md border flex items-center justify-center ${a.state ? "border-emerald-600 bg-emerald-600 text-white" : "border-border"}`}>
                          {a.state && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: VERIFICATION DOCUMENTS & FINAL REVIEW */}
            {step === 7 && (
              <div className="space-y-6">
                <StepHeader step={7} title="Verification Documents & Final Review" subtitle="Attach verification credentials, audit summary details, and submit for live approval." />

                {/* Super Admin Direct Approval & Publication Control */}
                {isAdmin && (
                  <div className="p-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black text-foreground">Super Admin Publishing Control</span>
                      </div>
                      <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30 text-[10px] font-bold">
                        Super Admin Direct Authority
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setAdminDirectApprove(true)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          adminDirectApprove
                            ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/30"
                            : "bg-card border-border hover:bg-accent/40"
                        }`}
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-foreground">Directly Publish & Verify</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Immediately activates listing across 195 countries with verified checkmark.
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAdminDirectApprove(false)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                          !adminDirectApprove
                            ? "bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/30"
                            : "bg-card border-border hover:bg-accent/40"
                        }`}
                      >
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-foreground">Queue for Inspection</div>
                          <div className="text-[11px] text-muted-foreground mt-0.5">
                            Place listing in Municipal City Admin review queue for routine inspection.
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Verification Documents */}
                <div className="p-5 rounded-2xl border border-border bg-muted/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-foreground">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Business Verification Documents</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold border-emerald-500/30 text-emerald-600 dark:text-emerald-400">Speeds Up Approval</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Upload supporting government registration, trade licenses, or utility bills to earn instant verification badges.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <Input placeholder="Doc name (e.g. Trade License 2026)" value={newDocName} onChange={(e) => setNewDocName(e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground text-xs" />
                    <Input placeholder="Document URL or file link" value={newDocUrl} onChange={(e) => setNewDocUrl(e.target.value)} className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-xs" />
                    <div className="flex gap-2">
                      <select value={newDocType} onChange={(e) => setNewDocType(e.target.value)} className="text-xs font-semibold px-2.5 py-2 rounded-xl border border-border bg-background text-foreground focus:outline-none flex-1">
                        {DOC_TYPES.map((t) => (<option key={t.value} value={t.value}>{t.label}</option>))}
                      </select>
                      <Button type="button" size="sm" onClick={() => { if (!newDocName.trim() || !newDocUrl.trim()) return; setVerificationDocs((prev) => [...prev, { id: `doc-${Date.now()}`, name: newDocName.trim(), url: newDocUrl.trim(), type: newDocType }]); setNewDocName(""); setNewDocUrl(""); toast.success("Document added!"); }} disabled={!newDocName.trim() || !newDocUrl.trim()} className="text-xs font-bold gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add
                      </Button>
                    </div>
                  </div>

                  {verificationDocs.length > 0 ? (
                    <div className="space-y-2">
                      {verificationDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-xs">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"><FileText className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-bold text-foreground truncate">{doc.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono truncate">{doc.url}</div>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0 font-bold border-border">{DOC_TYPES.find((t) => t.value === doc.type)?.label || doc.type}</Badge>
                          <button type="button" onClick={() => setVerificationDocs((prev) => prev.filter((d) => d.id !== doc.id))} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 hover:bg-red-500/10 transition-colors shrink-0"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-xs text-muted-foreground bg-muted/40 rounded-xl border border-dashed border-border">
                      No verification documents added yet. (Optional, but recommended)
                    </div>
                  )}
                </div>

                {/* Final Review Summary Cards */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs font-black text-muted-foreground pb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Structured Review Summary</span>
                  </div>

                  <ReviewCard title="1. Business Identity & Scale" icon={<Tag className="w-4 h-4 text-primary" />} onEdit={() => setStep(1)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ReviewField label="Business Name" value={name || "Not specified"} bold />
                      <ReviewField label="Scale / Tier" value={businessLevel} />
                      <ReviewField label="Business Type" value={businessType || "Not specified"} />
                      <ReviewField label="Established Year" value={yearEstablished || "Not specified"} mono />
                      <ReviewField label="Tagline" value={tagline || "None"} italic />
                      <ReviewField label="Description" value={description || "None"} truncate />
                    </div>
                  </ReviewCard>

                  <ReviewCard title="2. Industry Taxonomy" icon={<Layers className="w-4 h-4 text-primary" />} onEdit={() => setStep(2)}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <ReviewField label="Primary Sector" value={selectedMainCategory?.name || "General"} bold />
                      <ReviewField label="Subcategory" value={selectedSubcategory?.name || "General"} />
                      <ReviewField label="Specialty Option" value={selectedListingOption?.name || "General"} />
                    </div>
                  </ReviewCard>

                  <ReviewCard title="3. Worldwide Location" icon={<MapPin className="w-4 h-4 text-primary" />} onEdit={() => setStep(3)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ReviewField label="Country & City" value={`${displayCountryFlag} ${displayCountry} — ${displayCity}`} bold />
                      <ReviewField label="District / Subcity" value={displaySubcity} />
                      <ReviewField label="Physical Address" value={addressLine || "Not specified"} />
                      <ReviewField label="GPS Coordinates" value={`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`} mono />
                    </div>
                  </ReviewCard>

                  <ReviewCard title="4. Contact & Channels" icon={<Phone className="w-4 h-4 text-primary" />} onEdit={() => setStep(4)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ReviewField label="Telephone" value={telephone || "None"} mono bold />
                      <ReviewField label="WhatsApp" value={whatsapp || "None"} mono />
                      <ReviewField label="Email" value={email || "None"} />
                      <ReviewField label="Website" value={website || "None"} />
                      {facebookUrl && <ReviewField label="Facebook" value={facebookUrl} />}
                      {instagramUrl && <ReviewField label="Instagram" value={instagramUrl} />}
                      {tiktokUrl && <ReviewField label="TikTok" value={tiktokUrl} />}
                    </div>
                  </ReviewCard>

                  <ReviewCard title="5. Hours & Price Tier" icon={<Clock className="w-4 h-4 text-primary" />} onEdit={() => setStep(6)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ReviewField label="Price Tier" value={`${priceTier} (${PRICE_TIERS.find((t) => t.value === priceTier)?.label})`} bold />
                      <ReviewField label="Operating Days" value={`${Object.values(weeklyHours).filter((v) => v.open).length} of 7 days open`} />
                    </div>
                  </ReviewCard>

                  {verificationDocs.length > 0 && (
                    <ReviewCard title="6. Attached Verification Documents" icon={<FileText className="w-4 h-4 text-emerald-600" />} onEdit={() => setStep(7)}>
                      <div className="space-y-1.5">
                        {verificationDocs.map((doc) => (
                          <div key={doc.id} className="flex items-center gap-2 text-xs">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="font-semibold text-foreground">{doc.name}</span>
                            <span className="text-muted-foreground text-[11px]">({DOC_TYPES.find((t) => t.value === doc.type)?.label})</span>
                          </div>
                        ))}
                      </div>
                    </ReviewCard>
                  )}
                </div>

                <div className="p-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 text-xs text-foreground space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <ShieldCheck className="w-4 h-4" /> Multi-Tier Approval Protocol
                  </div>
                  <div className="text-muted-foreground leading-relaxed">
                    By submitting this registration, you certify that all information is accurate. Your listing will go through 3 verification tiers: <strong>City Admin ({displayCity})</strong> &rarr; <strong>Country Lead ({displayCountry})</strong> &rarr; <strong>Super Admin (Global Posting)</strong>. A Super Admin can also fast-track and post your listing directly.
                  </div>
                </div>
              </div>
            )}

            {/* NAVIGATION FOOTER */}
            <div className="flex items-center justify-between pt-6 border-t border-border mt-4">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStep((step - 1) as any);
                    if (mode === "fullscreen") window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="font-bold border-border text-foreground hover:bg-muted"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" /> Previous
                </Button>
              ) : (
                isEmbedded && onCancel ? (
                  <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="font-semibold text-muted-foreground hover:text-foreground">
                    Cancel
                  </Button>
                ) : (
                  <Link href="/dashboard">
                    <Button type="button" variant="ghost" size="sm" className="font-semibold text-muted-foreground hover:text-foreground">
                      Cancel
                    </Button>
                  </Link>
                )
              )}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => saveDraft(true)}
                  className="font-semibold text-xs border-dashed border-border text-muted-foreground hover:text-foreground"
                >
                  <Save className="w-3.5 h-3.5 mr-1" /> Save Draft
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="font-bold gap-1.5 shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  {step === 7 ? (
                    isSubmitting ? <>Submitting...</> : <><ShieldCheck className="w-4 h-4" /> Submit for Approval</>
                  ) : (
                    <>Next Step <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
