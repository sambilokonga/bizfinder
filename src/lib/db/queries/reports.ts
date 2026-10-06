import { connectToDatabase } from "@/lib/db/mongodb";
import { ReportModel } from "@/lib/db/models/Report";
import { SEED_REPORTS } from "@/lib/db/seed-data/reports";
import {
  IReport,
  PaginatedReportsResponse,
  ReportPriority,
  ReportStatus,
  ReportType,
  ReportStats,
  ReportActionTaken,
} from "@/types/report";

export interface GetReportsOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  priority?: string;
  targetId?: string;
  city?: string;
  country?: string;
  sort?: "desc" | "asc";
}

export interface CreateReportInput {
  id?: string;
  type: ReportType;
  title: string;
  reason: string;
  details?: string;
  targetId: string;
  targetName: string;
  targetType?: string;
  reporterName: string;
  reporterEmail?: string;
  reporterId?: string;
  reporterRole?: string;
  priority?: ReportPriority;
  status?: ReportStatus;
  evidenceUrls?: string[];
  city?: string;
  country?: string;
}

// In-memory store for zero-downtime development and offline mode
let inMemoryReports: IReport[] = [...SEED_REPORTS];

function calculateReportStats(items: IReport[]): ReportStats {
  let pendingCount = 0;
  let underReviewCount = 0;
  let investigatingCount = 0;
  let resolvedCount = 0;
  let dismissedCount = 0;
  let criticalCount = 0;
  let businessReportsCount = 0;
  let reviewReportsCount = 0;
  let userReportsCount = 0;
  let mediaReportsCount = 0;

  for (const r of items) {
    if (r.status === "pending") pendingCount++;
    else if (r.status === "under_review") underReviewCount++;
    else if (r.status === "investigating") investigatingCount++;
    else if (r.status === "resolved") resolvedCount++;
    else if (r.status === "dismissed") dismissedCount++;

    if (r.priority === "critical") criticalCount++;

    if (r.type === "business") businessReportsCount++;
    else if (r.type === "review") reviewReportsCount++;
    else if (r.type === "user") userReportsCount++;
    else if (r.type === "media") mediaReportsCount++;
  }

  return {
    totalReports: items.length,
    pendingCount,
    underReviewCount,
    investigatingCount,
    resolvedCount,
    dismissedCount,
    criticalCount,
    businessReportsCount,
    reviewReportsCount,
    userReportsCount,
    mediaReportsCount,
  };
}

export async function getReports(
  options: GetReportsOptions = {}
): Promise<PaginatedReportsResponse> {
  const {
    page = 1,
    limit = 5,
    search,
    type,
    status,
    priority,
    targetId,
    city,
    country,
    sort = "desc",
  } = options;

  const validLimit = Math.max(1, limit);
  const validPage = Math.max(1, page);

  try {
    const conn = await connectToDatabase();
    if (conn) {
      // Build MongoDB query
      const query: Record<string, any> = {};

      if (type && type !== "all") {
        query.type = type;
      }
      if (status && status !== "all") {
        query.status = status;
      }
      if (priority && priority !== "all") {
        query.priority = priority;
      }
      if (targetId) {
        query.targetId = targetId;
      }
      if (city && city !== "all") {
        query.city = city;
      }
      if (country && country !== "all") {
        query.country = country;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [
          { title: regex },
          { reason: regex },
          { details: regex },
          { targetName: regex },
          { reporterName: regex },
          { id: regex },
        ];
      }

      const totalMatching = await ReportModel.countDocuments(query);
      const totalAll = await ReportModel.countDocuments({});

      // If database is completely empty, seed it once
      if (totalAll === 0) {
        await ReportModel.insertMany(
          SEED_REPORTS.map((r) => ({
            ...r,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
          }))
        );
      }

      const sortDirection = sort === "asc" ? 1 : -1;
      const skip = (validPage - 1) * validLimit;

      const docs = await ReportModel.find(query)
        .sort({ createdAt: sortDirection })
        .skip(skip)
        .limit(validLimit)
        .lean();

      // Get stats across all records
      const allDocs = await ReportModel.find({}).lean();
      const mappedAll: IReport[] = allDocs.map((d: any) => ({
        id: d.id,
        type: d.type,
        title: d.title,
        reason: d.reason,
        details: d.details,
        targetId: d.targetId,
        targetName: d.targetName,
        targetType: d.targetType,
        reporterName: d.reporterName,
        reporterEmail: d.reporterEmail,
        reporterId: d.reporterId,
        reporterRole: d.reporterRole,
        status: d.status,
        priority: d.priority,
        resolutionNotes: d.resolutionNotes,
        resolvedBy: d.resolvedBy,
        resolvedAt: d.resolvedAt ? new Date(d.resolvedAt).toISOString() : undefined,
        actionTaken: d.actionTaken,
        evidenceUrls: d.evidenceUrls,
        city: d.city,
        country: d.country,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
      }));

      const stats = calculateReportStats(mappedAll);

      const items: IReport[] = docs.map((d: any) => ({
        id: d.id,
        type: d.type,
        title: d.title,
        reason: d.reason,
        details: d.details,
        targetId: d.targetId,
        targetName: d.targetName,
        targetType: d.targetType,
        reporterName: d.reporterName,
        reporterEmail: d.reporterEmail,
        reporterId: d.reporterId,
        reporterRole: d.reporterRole,
        status: d.status,
        priority: d.priority,
        resolutionNotes: d.resolutionNotes,
        resolvedBy: d.resolvedBy,
        resolvedAt: d.resolvedAt ? new Date(d.resolvedAt).toISOString() : undefined,
        actionTaken: d.actionTaken,
        evidenceUrls: d.evidenceUrls,
        city: d.city,
        country: d.country,
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
      }));

      const finalTotal = totalAll === 0 ? SEED_REPORTS.length : totalMatching;
      const totalPages = Math.ceil(finalTotal / validLimit) || 1;

      return {
        data: items,
        total: finalTotal,
        page: validPage,
        limit: validLimit,
        totalPages,
        stats,
      };
    }
  } catch (error) {
    console.warn("MongoDB connection failed or unavailable for reports. Using in-memory fallback:", error);
  }

  // In-Memory Fallback
  let filtered = [...inMemoryReports];

  if (type && type !== "all") {
    filtered = filtered.filter((r) => r.type === type);
  }
  if (status && status !== "all") {
    filtered = filtered.filter((r) => r.status === status);
  }
  if (priority && priority !== "all") {
    filtered = filtered.filter((r) => r.priority === priority);
  }
  if (targetId) {
    filtered = filtered.filter((r) => r.targetId === targetId);
  }
  if (city && city !== "all") {
    filtered = filtered.filter((r) => !r.city || r.city.toLowerCase() === city.toLowerCase());
  }
  if (country && country !== "all") {
    filtered = filtered.filter((r) => !r.country || r.country.toLowerCase() === country.toLowerCase());
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        (r.details && r.details.toLowerCase().includes(q)) ||
        r.targetName.toLowerCase().includes(q) ||
        r.reporterName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sort === "asc" ? dateA - dateB : dateB - dateA;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / validLimit) || 1;
  const startIndex = (validPage - 1) * validLimit;
  const data = filtered.slice(startIndex, startIndex + validLimit);
  const stats = calculateReportStats(inMemoryReports);

  return {
    data,
    total,
    page: validPage,
    limit: validLimit,
    totalPages,
    stats,
  };
}

export async function createReport(input: CreateReportInput): Promise<IReport> {
  const generatedId =
    input.id ||
    `REP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const now = new Date().toISOString();
  const newReport: IReport = {
    id: generatedId,
    type: input.type,
    title: input.title,
    reason: input.reason,
    details: input.details,
    targetId: input.targetId,
    targetName: input.targetName,
    targetType: input.targetType || input.type,
    reporterName: input.reporterName,
    reporterEmail: input.reporterEmail,
    reporterId: input.reporterId,
    reporterRole: input.reporterRole || "user",
    status: input.status || "pending",
    priority: input.priority || "medium",
    actionTaken: "none",
    evidenceUrls: input.evidenceUrls || [],
    city: input.city || "Addis Ababa",
    country: input.country || "Ethiopia",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const conn = await connectToDatabase();
    if (conn) {
      await ReportModel.create({
        ...newReport,
        createdAt: new Date(newReport.createdAt),
        updatedAt: new Date(newReport.updatedAt),
      });
    }
  } catch (error) {
    console.warn("Could not persist report to MongoDB, falling back to memory:", error);
  }

  inMemoryReports.unshift(newReport);
  return newReport;
}

export async function updateReportStatus(
  id: string,
  status: ReportStatus,
  actionTaken?: ReportActionTaken,
  resolutionNotes?: string,
  resolvedBy?: string
): Promise<IReport | null> {
  const now = new Date();

  try {
    const conn = await connectToDatabase();
    if (conn) {
      const updated = await ReportModel.findOneAndUpdate(
        { id },
        {
          $set: {
            status,
            actionTaken: actionTaken || "none",
            resolutionNotes,
            resolvedBy,
            resolvedAt: status === "resolved" || status === "dismissed" ? now : undefined,
            updatedAt: now,
          },
        },
        { new: true }
      ).lean();

      if (updated) {
        const mapped: IReport = {
          id: (updated as any).id,
          type: (updated as any).type,
          title: (updated as any).title,
          reason: (updated as any).reason,
          details: (updated as any).details,
          targetId: (updated as any).targetId,
          targetName: (updated as any).targetName,
          targetType: (updated as any).targetType,
          reporterName: (updated as any).reporterName,
          reporterEmail: (updated as any).reporterEmail,
          reporterId: (updated as any).reporterId,
          reporterRole: (updated as any).reporterRole,
          status: (updated as any).status,
          priority: (updated as any).priority,
          resolutionNotes: (updated as any).resolutionNotes,
          resolvedBy: (updated as any).resolvedBy,
          resolvedAt: (updated as any).resolvedAt
            ? new Date((updated as any).resolvedAt).toISOString()
            : undefined,
          actionTaken: (updated as any).actionTaken,
          evidenceUrls: (updated as any).evidenceUrls,
          city: (updated as any).city,
          country: (updated as any).country,
          createdAt: new Date((updated as any).createdAt).toISOString(),
          updatedAt: new Date((updated as any).updatedAt).toISOString(),
        };

        // Sync in-memory
        const idx = inMemoryReports.findIndex((r) => r.id === id);
        if (idx !== -1) {
          inMemoryReports[idx] = mapped;
        }
        return mapped;
      }
    }
  } catch (error) {
    console.warn("Could not update report in MongoDB:", error);
  }

  // Memory fallback
  const idx = inMemoryReports.findIndex((r) => r.id === id);
  if (idx !== -1) {
    inMemoryReports[idx] = {
      ...inMemoryReports[idx],
      status,
      actionTaken: actionTaken || inMemoryReports[idx].actionTaken || "none",
      resolutionNotes: resolutionNotes ?? inMemoryReports[idx].resolutionNotes,
      resolvedBy: resolvedBy ?? inMemoryReports[idx].resolvedBy,
      resolvedAt:
        status === "resolved" || status === "dismissed"
          ? now.toISOString()
          : inMemoryReports[idx].resolvedAt,
      updatedAt: now.toISOString(),
    };
    return inMemoryReports[idx];
  }

  return null;
}

export async function deleteReport(id: string): Promise<boolean> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      await ReportModel.deleteOne({ id });
    }
  } catch (error) {
    console.warn("Could not delete report from MongoDB:", error);
  }

  const initialLen = inMemoryReports.length;
  inMemoryReports = inMemoryReports.filter((r) => r.id !== id);
  return inMemoryReports.length < initialLen;
}

export async function getReportById(id: string): Promise<IReport | null> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const doc = await ReportModel.findOne({ id }).lean();
      if (doc) {
        return {
          id: (doc as any).id,
          type: (doc as any).type,
          title: (doc as any).title,
          reason: (doc as any).reason,
          details: (doc as any).details,
          targetId: (doc as any).targetId,
          targetName: (doc as any).targetName,
          targetType: (doc as any).targetType,
          reporterName: (doc as any).reporterName,
          reporterEmail: (doc as any).reporterEmail,
          reporterId: (doc as any).reporterId,
          reporterRole: (doc as any).reporterRole,
          status: (doc as any).status,
          priority: (doc as any).priority,
          resolutionNotes: (doc as any).resolutionNotes,
          resolvedBy: (doc as any).resolvedBy,
          resolvedAt: (doc as any).resolvedAt
            ? new Date((doc as any).resolvedAt).toISOString()
            : undefined,
          actionTaken: (doc as any).actionTaken,
          evidenceUrls: (doc as any).evidenceUrls,
          city: (doc as any).city,
          country: (doc as any).country,
          createdAt: new Date((doc as any).createdAt).toISOString(),
          updatedAt: new Date((doc as any).updatedAt).toISOString(),
        };
      }
    }
  } catch (error) {
    console.warn("Could not fetch report from MongoDB:", error);
  }

  return inMemoryReports.find((r) => r.id === id) || null;
}
