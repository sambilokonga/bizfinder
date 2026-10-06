export type AnalyticsEventType =
  | "view"
  | "search"
  | "click_phone"
  | "click_direction"
  | "click_website"
  | "favorite"
  | "share"
  | "ad_click"
  | "review";

export type AnalyticsDeviceType = "desktop" | "mobile" | "tablet";

export interface IAnalyticsEvent {
  id: string; // e.g. EVT-202609-00124
  eventType: AnalyticsEventType;
  businessId?: string;
  businessName?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  city: string;
  country: string;
  searchTerm?: string;
  device: AnalyticsDeviceType;
  browser?: string;
  os?: string;
  ip?: string;
  duration?: number; // seconds
  metadata?: Record<string, any>;
  registeredBy: string; // "system", "client_telemetry", "super_admin", or admin name
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface AnalyticsStats {
  totalEvents: number;
  totalViews: number;
  totalSearches: number;
  totalCalls: number;
  totalDirections: number;
  totalWebsites: number;
  ctr: number; // Click-through rate percentage
  topKeywords: Array<{
    keyword: string;
    count: number;
    trend: string;
  }>;
  geoDistribution: Array<{
    city: string;
    country: string;
    count: number;
    percentage: number;
  }>;
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  counts: {
    all: number;
    view: number;
    search: number;
    click_phone: number;
    click_direction: number;
    click_website: number;
    favorite: number;
    share: number;
    ad_click: number;
  };
  timeSeriesData: Array<{
    date: string;
    views: number;
    calls: number;
    directions: number;
    clicks: number;
    impressions: number;
  }>;
}

export interface PaginatedAnalyticsResponse {
  success: boolean;
  events: IAnalyticsEvent[];
  pagination: {
    page: number;
    limit: number; // 20
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  stats: AnalyticsStats;
}

export interface RegisterAnalyticsInput {
  id?: string;
  eventType: AnalyticsEventType;
  businessId?: string;
  businessName?: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  city?: string;
  country?: string;
  searchTerm?: string;
  device?: AnalyticsDeviceType;
  browser?: string;
  os?: string;
  ip?: string;
  duration?: number;
  metadata?: Record<string, any>;
  registeredBy?: string;
  batchCount?: number; // For batch registering 1-100 events
}
