export type GlobalVisitorType = "actual" | "future";
export type GlobalVisitorAction =
  | "view"
  | "call"
  | "direction"
  | "website"
  | "saved"
  | "share"
  | "inquiry"
  | "meeting"
  | "delegation";

export type GlobalVisitorStatus =
  | "active"
  | "completed"
  | "scheduled"
  | "confirmed"
  | "in_transit"
  | "arrived";

export type EscalationTarget = "none" | "country_admin" | "super_admin";

export interface GlobalVisitorCountry {
  country: string;
  countryCode: string;
  flag: string;
  continent: string;
  visitorCount: number;
  percentage: number;
  topOriginCities: string[];
  trend: string;
}

export interface GlobalUserSession {
  id: string;
  visitorType: GlobalVisitorType;
  visitorName?: string;
  visitorCountry: string;
  visitorCountryCode: string;
  visitorCity: string;
  visitorFlag: string;
  visitorDevice: string;
  visitorIp: string;
  targetBusinessId?: string;
  targetBusinessName: string;
  targetBusinessCity: string;
  targetBusinessCountry: string;
  action: GlobalVisitorAction;
  purpose: string;
  status: GlobalVisitorStatus;
  scheduledDate?: string;
  delegationSize?: number;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  registeredBy: string;
  jurisdictionLevel: "city" | "country" | "global";
  escalatedTo: EscalationTarget;
  escalationNotes?: string;
  timestamp: string;
  relativeTime: string;
  referrer: string;
}

export interface GlobalVisitorsSummary {
  jurisdictionType: "country" | "city" | "global";
  jurisdictionName: string;
  totalGlobalViews: number;
  uniqueGlobalVisitors: number;
  countriesRepresentedCount: number;
  topOriginCountry: string;
  topOriginFlag: string;
  internationalSharePercent: number;
  topViewedCity: string;
  peakHour: string;
  growthRate: string;
  actualVisitorsCount: number;
  futureVisitorsCount: number;
  escalatedCount: number;
}

export interface GlobalVisitorsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface GlobalVisitorsResponse {
  success: boolean;
  summary: GlobalVisitorsSummary;
  visitorCountries: GlobalVisitorCountry[];
  cityBreakdown: Array<{ city: string; views: number; percentage: number }>;
  recentSessions: GlobalUserSession[];
  futureDelegations: GlobalUserSession[];
  timeSeries: Array<{ date: string; internationalViews: number; domesticViews: number }>;
  pagination: GlobalVisitorsPagination;
}

export interface RegisterGlobalVisitorInput {
  visitorType?: GlobalVisitorType;
  visitorName?: string;
  visitorCountry: string;
  visitorCountryCode?: string;
  visitorCity: string;
  visitorFlag?: string;
  visitorDevice?: string;
  visitorIp?: string;
  targetBusinessId?: string;
  targetBusinessName: string;
  targetBusinessCity?: string;
  targetBusinessCountry?: string;
  action?: GlobalVisitorAction;
  purpose?: string;
  status?: GlobalVisitorStatus;
  scheduledDate?: string;
  delegationSize?: number;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  registeredBy?: string;
  jurisdictionLevel?: "city" | "country" | "global";
  escalatedTo?: EscalationTarget;
  escalationNotes?: string;
  referrer?: string;
}

// Global visitor origins with authentic diaspora and international business hubs (pure client-safe data)
export const GLOBAL_VISITOR_ORIGINS = [
  { country: "United States", code: "US", flag: "🇺🇸", continent: "North America", cities: ["Washington, D.C.", "New York", "Atlanta", "Dallas", "Seattle", "Los Angeles", "Chicago"], weight: 0.32 },
  { country: "United Kingdom", code: "GB", flag: "🇬🇧", continent: "Europe", cities: ["London", "Manchester", "Birmingham", "Leeds"], weight: 0.18 },
  { country: "United Arab Emirates", code: "AE", flag: "🇦🇪", continent: "Middle East", cities: ["Dubai", "Abu Dhabi", "Sharjah"], weight: 0.14 },
  { country: "Germany", code: "DE", flag: "🇩🇪", continent: "Europe", cities: ["Frankfurt", "Berlin", "Munich", "Hamburg"], weight: 0.09 },
  { country: "Canada", code: "CA", flag: "🇨🇦", continent: "North America", cities: ["Toronto", "Calgary", "Ottawa", "Vancouver"], weight: 0.08 },
  { country: "Kenya", code: "KE", flag: "🇰🇪", continent: "Africa", cities: ["Nairobi", "Mombasa", "Kisumu"], weight: 0.06 },
  { country: "Saudi Arabia", code: "SA", flag: "🇸🇦", continent: "Middle East", cities: ["Riyadh", "Jeddah", "Dammam"], weight: 0.04 },
  { country: "Sweden", code: "SE", flag: "🇸🇪", continent: "Europe", cities: ["Stockholm", "Gothenburg", "Malmö"], weight: 0.03 },
  { country: "Australia", code: "AU", flag: "🇦🇺", continent: "Oceania", cities: ["Melbourne", "Sydney", "Perth", "Brisbane"], weight: 0.02 },
  { country: "Djibouti", code: "DJ", flag: "🇩🇯", continent: "Africa", cities: ["Djibouti City"], weight: 0.02 },
  { country: "France", code: "FR", flag: "🇫🇷", continent: "Europe", cities: ["Paris", "Lyon", "Marseille"], weight: 0.01 },
  { country: "India", code: "IN", flag: "🇮🇳", continent: "Asia", cities: ["Mumbai", "New Delhi", "Bengaluru"], weight: 0.01 },
  { country: "China", code: "CN", flag: "🇨🇳", continent: "Asia", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"], weight: 0.02 },
  { country: "South Africa", code: "ZA", flag: "🇿🇦", continent: "Africa", cities: ["Johannesburg", "Cape Town", "Durban"], weight: 0.01 },
  { country: "Italy", code: "IT", flag: "🇮🇹", continent: "Europe", cities: ["Rome", "Milan", "Turin"], weight: 0.01 },
  { country: "Netherlands", code: "NL", flag: "🇳🇱", continent: "Europe", cities: ["Amsterdam", "Rotterdam", "The Hague"], weight: 0.01 },
];

export function getCountryFlag(countryName: string, code?: string): string {
  const found = GLOBAL_VISITOR_ORIGINS.find(
    (c) => c.country.toLowerCase() === countryName.toLowerCase() || (code && c.code.toLowerCase() === code.toLowerCase())
  );
  if (found) return found.flag;

  const FLAGS: Record<string, string> = {
    "united states": "🇺🇸",
    "usa": "🇺🇸",
    "us": "🇺🇸",
    "united kingdom": "🇬🇧",
    "uk": "🇬🇧",
    "gb": "🇬🇧",
    "united arab emirates": "🇦🇪",
    "uae": "🇦🇪",
    "germany": "🇩🇪",
    "canada": "🇨🇦",
    "kenya": "🇰🇪",
    "saudi arabia": "🇸🇦",
    "sweden": "🇸🇪",
    "australia": "🇦🇺",
    "djibouti": "🇩🇯",
    "france": "🇫🇷",
    "india": "🇮🇳",
    "china": "🇨🇳",
    "south africa": "🇿🇦",
    "italy": "🇮🇹",
    "netherlands": "🇳🇱",
    "ethiopia": "🇪🇹",
  };
  return FLAGS[countryName.toLowerCase()] || "🌐";
}

export function getCountryCode(countryName: string): string {
  const found = GLOBAL_VISITOR_ORIGINS.find(
    (c) => c.country.toLowerCase() === countryName.toLowerCase()
  );
  if (found) return found.code;
  return countryName.slice(0, 2).toUpperCase();
}
