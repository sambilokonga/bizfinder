import { connectToDatabase } from "@/lib/db/mongodb";
import { SecurityEventModel } from "@/lib/db/models/SecurityEvent";
import { SEED_SECURITY_EVENTS } from "@/lib/db/seed-data/security";
import {
  ISecurityEvent,
  PaginatedSecurityResponse,
  SecurityFilterOptions,
  SecurityStats,
  SecuritySeverity,
  SecurityStatus,
  SecurityEventType,
  SecurityActionTaken,
} from "@/types/security";

/**
 * Calculates aggregate security telemetry from events
 */
function calculateSecurityStats(items: ISecurityEvent[]): SecurityStats {
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;
  let blockedCount = 0;
  let activeThreats = 0;
  let mfaEvents = 0;
  let suspiciousAttempts = 0;

  for (const item of items) {
    if (item.severity === "critical") critical++;
    else if (item.severity === "high") high++;
    else if (item.severity === "medium") medium++;
    else if (item.severity === "low") low++;

    if (item.status === "blocked" || item.actionTaken === "blocked" || item.actionTaken === "quarantined") {
      blockedCount++;
    }

    if (item.status === "investigating" || (item.isFlagged && item.status !== "resolved")) {
      activeThreats++;
    }

    if (item.eventType === "two_factor_enabled" || item.eventType === "two_factor_disabled") {
      mfaEvents++;
    }

    if (
      item.eventType === "brute_force_blocked" ||
      item.eventType === "unauthorized_access_attempt" ||
      item.eventType === "login_failed"
    ) {
      suspiciousAttempts++;
    }
  }

  return {
    total: items.length,
    critical,
    high,
    medium,
    low,
    blockedCount,
    activeThreats,
    mfaEvents,
    suspiciousAttempts,
  };
}

/**
 * Fetches paginated security events with exact 20 per page default
 */
export async function getSecurityEvents(
  options: SecurityFilterOptions = {}
): Promise<PaginatedSecurityResponse> {
  await connectToDatabase();

  const page = Math.max(1, options.page || 1);
  const limit = Math.max(1, options.limit || 20); // Exactly 20 items per page default
  const skip = (page - 1) * limit;

  // Auto-seed collection if empty
  const currentCount = await SecurityEventModel.countDocuments();
  if (currentCount === 0) {
    console.log("[Security Engine] Auto-seeding initial real security audit events...");
    await SecurityEventModel.insertMany(SEED_SECURITY_EVENTS, { ordered: false });
  }

  // Build MongoDB query filter
  const query: Record<string, any> = {};

  if (options.search && options.search.trim()) {
    const q = options.search.trim();
    const regex = new RegExp(q, "i");
    query.$or = [
      { title: regex },
      { description: regex },
      { actorName: regex },
      { actorEmail: regex },
      { ipAddress: regex },
      { targetResource: regex },
      { city: regex },
      { country: regex },
    ];
  }

  if (options.severity && options.severity !== "all") {
    query.severity = options.severity;
  }

  if (options.status && options.status !== "all") {
    query.status = options.status;
  }

  if (options.eventType && options.eventType !== "all") {
    query.eventType = options.eventType;
  }

  if (options.actorRole && options.actorRole !== "all") {
    query.actorRole = options.actorRole;
  }

  if (options.city && options.city !== "all") {
    query.city = new RegExp(options.city, "i");
  }

  if (options.country && options.country !== "all") {
    query.country = new RegExp(options.country, "i");
  }

  const sortDirection = options.sort === "asc" ? 1 : -1;

  // Execute queries in parallel
  const [total, docs, allDocsForStats] = await Promise.all([
    SecurityEventModel.countDocuments(query),
    SecurityEventModel.find(query)
      .sort({ createdAt: sortDirection })
      .skip(skip)
      .limit(limit)
      .lean(),
    SecurityEventModel.find({}).select("severity status actionTaken eventType isFlagged").lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const events: ISecurityEvent[] = docs.map((d: any) => ({
    id: d.id || d._id?.toString(),
    eventType: d.eventType,
    severity: d.severity,
    status: d.status,
    title: d.title,
    description: d.description,
    actorId: d.actorId,
    actorName: d.actorName,
    actorEmail: d.actorEmail,
    actorRole: d.actorRole,
    targetResource: d.targetResource,
    ipAddress: d.ipAddress,
    city: d.city,
    country: d.country,
    device: d.device,
    browser: d.browser,
    os: d.os,
    actionTaken: d.actionTaken,
    metadata: d.metadata,
    isFlagged: d.isFlagged,
    resolvedBy: d.resolvedBy,
    resolvedAt: d.resolvedAt ? new Date(d.resolvedAt).toISOString() : undefined,
    resolutionNotes: d.resolutionNotes,
    createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : undefined,
  }));

  const stats = calculateSecurityStats(allDocsForStats as any);

  return {
    success: true,
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
    stats,
  };
}

export interface CreateSecurityEventInput {
  id?: string;
  eventType: SecurityEventType;
  severity?: SecuritySeverity;
  status?: SecurityStatus;
  title: string;
  description: string;
  actorId?: string;
  actorName: string;
  actorEmail?: string;
  actorRole?: "super_admin" | "admin" | "country_admin" | "city_admin" | "owner" | "user" | "anonymous" | "system";
  targetResource?: string;
  ipAddress: string;
  city?: string;
  country?: string;
  device?: "Desktop" | "Mobile" | "Tablet" | "Server" | "Bot";
  browser?: string;
  os?: string;
  actionTaken?: SecurityActionTaken;
  metadata?: Record<string, any>;
  isFlagged?: boolean;
}

/**
 * Registers a real security incident or log event to MongoDB
 */
export async function createSecurityEvent(
  input: CreateSecurityEventInput
): Promise<ISecurityEvent> {
  await connectToDatabase();

  const id = input.id || `sec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newDoc = await SecurityEventModel.create({
    id,
    eventType: input.eventType,
    severity: input.severity || "medium",
    status: input.status || "logged",
    title: input.title,
    description: input.description,
    actorId: input.actorId,
    actorName: input.actorName,
    actorEmail: input.actorEmail,
    actorRole: input.actorRole || "user",
    targetResource: input.targetResource || "/admin/security",
    ipAddress: input.ipAddress || "127.0.0.1",
    city: input.city || "Addis Ababa",
    country: input.country || "Ethiopia",
    device: input.device || "Desktop",
    browser: input.browser || "Chrome 128",
    os: input.os || "Windows 11",
    actionTaken: input.actionTaken || "allowed",
    metadata: input.metadata || {},
    isFlagged: input.isFlagged !== undefined ? input.isFlagged : input.severity === "critical" || input.severity === "high",
  });

  return {
    id: newDoc.id,
    eventType: newDoc.eventType,
    severity: newDoc.severity,
    status: newDoc.status,
    title: newDoc.title,
    description: newDoc.description,
    actorId: newDoc.actorId,
    actorName: newDoc.actorName,
    actorEmail: newDoc.actorEmail,
    actorRole: newDoc.actorRole,
    targetResource: newDoc.targetResource,
    ipAddress: newDoc.ipAddress,
    city: newDoc.city,
    country: newDoc.country,
    device: newDoc.device,
    browser: newDoc.browser,
    os: newDoc.os,
    actionTaken: newDoc.actionTaken,
    metadata: newDoc.metadata,
    isFlagged: newDoc.isFlagged,
    createdAt: newDoc.createdAt.toISOString(),
    updatedAt: newDoc.updatedAt.toISOString(),
  };
}

/**
 * Updates security incident status (e.g. resolve, block, dismiss)
 */
export async function updateSecurityEventStatus(
  id: string,
  updates: {
    status?: SecurityStatus;
    actionTaken?: SecurityActionTaken;
    resolutionNotes?: string;
    resolvedBy?: string;
  }
): Promise<ISecurityEvent | null> {
  await connectToDatabase();

  const updateFields: Record<string, any> = { ...updates };
  if (updates.status === "resolved" || updates.status === "dismissed") {
    updateFields.resolvedAt = new Date();
    updateFields.isFlagged = false;
  }

  const doc = await SecurityEventModel.findOneAndUpdate(
    { id },
    { $set: updateFields },
    { new: true }
  ).lean();

  if (!doc) return null;
  const eventDoc = doc as any;

  return {
    id: eventDoc.id,
    eventType: eventDoc.eventType,
    severity: eventDoc.severity,
    status: eventDoc.status,
    title: eventDoc.title,
    description: eventDoc.description,
    actorId: eventDoc.actorId,
    actorName: eventDoc.actorName,
    actorEmail: eventDoc.actorEmail,
    actorRole: eventDoc.actorRole,
    targetResource: eventDoc.targetResource,
    ipAddress: eventDoc.ipAddress,
    city: eventDoc.city,
    country: eventDoc.country,
    device: eventDoc.device,
    browser: eventDoc.browser,
    os: eventDoc.os,
    actionTaken: eventDoc.actionTaken,
    metadata: eventDoc.metadata,
    isFlagged: eventDoc.isFlagged,
    resolvedBy: eventDoc.resolvedBy,
    resolvedAt: eventDoc.resolvedAt?.toISOString(),
    resolutionNotes: eventDoc.resolutionNotes,
    createdAt: eventDoc.createdAt?.toISOString(),
    updatedAt: eventDoc.updatedAt?.toISOString(),
  };
}

/**
 * Deletes a security event record
 */
export async function deleteSecurityEvent(id: string): Promise<boolean> {
  await connectToDatabase();
  const res = await SecurityEventModel.deleteOne({ id });
  return res.deletedCount > 0;
}

/**
 * Rapid 1-click IP Block action
 */
export async function blockIpAddress(
  ip: string,
  reason: string,
  blockedBy: string = "Super Admin"
): Promise<ISecurityEvent> {
  return createSecurityEvent({
    eventType: "ip_blocked",
    severity: "high",
    status: "blocked",
    title: `Firewall Rule: IP Blocked (${ip})`,
    description: `Access from IP ${ip} permanently blocked. Reason: ${reason}`,
    actorName: blockedBy,
    actorRole: "super_admin",
    targetResource: "Perimeter Firewall",
    ipAddress: ip,
    actionTaken: "blocked",
    isFlagged: true,
    metadata: { reason, blockedBy, blockedAt: new Date().toISOString() },
  });
}
