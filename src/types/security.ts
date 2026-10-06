export type SecuritySeverity = "critical" | "high" | "medium" | "low" | "info";

export type SecurityStatus = "logged" | "investigating" | "blocked" | "resolved" | "dismissed";

export type SecurityEventType =
  | "login_success"
  | "login_failed"
  | "brute_force_blocked"
  | "unauthorized_access_attempt"
  | "two_factor_enabled"
  | "two_factor_disabled"
  | "password_changed"
  | "api_key_generated"
  | "api_key_revoked"
  | "ip_blocked"
  | "ip_whitelisted"
  | "session_revoked"
  | "role_elevated"
  | "firewall_rule_added"
  | "ddos_mitigated"
  | "maintenance_triggered"
  | "sensitive_data_export";

export type SecurityActionTaken =
  | "allowed"
  | "blocked"
  | "session_terminated"
  | "account_locked"
  | "2fa_challenged"
  | "flagged"
  | "quarantined";

export interface ISecurityEvent {
  id: string;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  status: SecurityStatus;
  title: string;
  description: string;
  actorId?: string;
  actorName: string;
  actorEmail?: string;
  actorRole: "super_admin" | "admin" | "country_admin" | "city_admin" | "owner" | "user" | "anonymous" | "system";
  targetResource?: string;
  ipAddress: string;
  city?: string;
  country?: string;
  device?: "Desktop" | "Mobile" | "Tablet" | "Server" | "Bot";
  browser?: string;
  os?: string;
  actionTaken: SecurityActionTaken;
  metadata?: Record<string, any>;
  isFlagged?: boolean;
  resolvedBy?: string;
  resolvedAt?: string | Date;
  resolutionNotes?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface SecurityStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  blockedCount: number;
  activeThreats: number;
  mfaEvents: number;
  suspiciousAttempts: number;
}

export interface PaginatedSecurityResponse {
  success: boolean;
  events: ISecurityEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: SecurityStats;
  error?: string;
}

export interface SecurityFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  severity?: string;
  status?: string;
  eventType?: string;
  actorRole?: string;
  city?: string;
  country?: string;
  sort?: "desc" | "asc";
}
