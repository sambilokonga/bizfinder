export type ReportType = "business" | "review" | "user" | "media";

export type ReportStatus =
  | "pending"
  | "under_review"
  | "investigating"
  | "resolved"
  | "dismissed";

export type ReportPriority = "critical" | "high" | "medium" | "low";

export type ReportActionTaken =
  | "none"
  | "dismissed"
  | "penalty_applied"
  | "content_removed"
  | "user_suspended"
  | "warning_issued";

export interface IReport {
  id: string; // e.g. "REP-2026-001"
  type: ReportType;
  title: string;
  reason: string;
  details?: string;
  targetId: string;
  targetName: string;
  targetType: string;
  reporterName: string;
  reporterEmail?: string;
  reporterId?: string;
  reporterRole?: string;
  status: ReportStatus;
  priority: ReportPriority;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string | Date;
  actionTaken?: ReportActionTaken;
  evidenceUrls?: string[];
  city?: string;
  country?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ReportStats {
  totalReports: number;
  pendingCount: number;
  underReviewCount: number;
  investigatingCount: number;
  resolvedCount: number;
  dismissedCount: number;
  criticalCount: number;
  businessReportsCount: number;
  reviewReportsCount: number;
  userReportsCount: number;
  mediaReportsCount: number;
}

export interface PaginatedReportsResponse {
  data: IReport[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: ReportStats;
}
