import { connectToDatabase } from "@/lib/db/mongodb";
import { PaymentModel } from "@/lib/db/models/Payment";
import { SEED_PAYMENTS } from "@/lib/db/seed-data/payments";
import { SEED_BUSINESSES } from "@/lib/db/seed-data/businesses";
import {
  IPayment,
  PaginatedPaymentsResponse,
  PaymentProvider,
  PaymentStatus,
  PaymentType,
  PaymentCurrency,
  PaymentStats,
  GeoPaymentSummary,
} from "@/types/payment";

export interface GetPaymentsOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  provider?: string;
  businessId?: string;
  country?: string;
  city?: string;
  sort?: "desc" | "asc";
}

export interface CreatePaymentInput {
  id?: string;
  businessId?: string;
  businessName: string;
  cityName?: string;
  countryName?: string;
  payerName: string;
  payerEmail?: string;
  payerPhone?: string;
  amount: number;
  currency?: PaymentCurrency;
  provider: PaymentProvider;
  paymentType?: PaymentType;
  status?: PaymentStatus;
  reference?: string;
  description?: string;
  metadata?: Record<string, any>;
  registeredBy?: string;
}

/**
 * Calculates summary financial metrics across payments
 */
function calculateStats(items: IPayment[]): PaymentStats {
  let totalRevenueETB = 0;
  let totalRevenueUSD = 0;
  let countCompleted = 0;
  let countPending = 0;
  let countRefunded = 0;
  let countFailed = 0;

  for (const p of items) {
    if (p.status === "completed") {
      countCompleted++;
      if (p.currency === "USD") {
        totalRevenueUSD += p.amount;
      } else {
        totalRevenueETB += p.amount;
      }
    } else if (p.status === "pending") {
      countPending++;
    } else if (p.status === "refunded") {
      countRefunded++;
    } else if (p.status === "failed") {
      countFailed++;
    }
  }

  const avgOrderValueETB =
    countCompleted > 0 ? Math.round(totalRevenueETB / countCompleted) : 0;

  return {
    totalRevenueETB,
    totalRevenueUSD,
    countCompleted,
    countPending,
    countRefunded,
    countFailed,
    avgOrderValueETB,
  };
}

/**
 * Aggregates payment status and financial volume grouped by country and city
 */
export function calculateGeoBreakdown(items: IPayment[]): GeoPaymentSummary[] {
  const map = new Map<string, GeoPaymentSummary>();

  for (const p of items) {
    const country = p.countryName || "Ethiopia";
    const city = p.cityName || "Addis Ababa";
    const key = `${country}:::${city}`;

    let entry = map.get(key);
    if (!entry) {
      entry = {
        country,
        city,
        totalAmount: 0,
        currency: p.currency || "ETB",
        count: 0,
        completedCount: 0,
        pendingCount: 0,
        failedCount: 0,
        refundedCount: 0,
      };
      map.set(key, entry);
    }

    entry.count++;
    if (p.status === "completed") {
      entry.completedCount++;
      entry.totalAmount += p.amount;
    } else if (p.status === "pending") {
      entry.pendingCount++;
    } else if (p.status === "failed") {
      entry.failedCount++;
    } else if (p.status === "refunded") {
      entry.refundedCount++;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

/**
 * Fetch paginated payments with search, filters, and financial stats
 * Default limit: 20 per page
 */
export async function getPayments(
  options: GetPaymentsOptions = {}
): Promise<PaginatedPaymentsResponse> {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.max(1, Number(options.limit) || 20);
  const search = options.search?.trim().toLowerCase();
  const status = options.status;
  const provider = options.provider;
  const businessId = options.businessId;
  const country = options.country?.trim();
  const city = options.city?.trim();

  const mongoose = await connectToDatabase();

  if (mongoose) {
    try {
      // Check if collection is empty, auto-populate if so
      const countTotalInDb = await PaymentModel.countDocuments();
      if (countTotalInDb === 0 && SEED_PAYMENTS.length > 0) {
        try {
          await PaymentModel.insertMany(SEED_PAYMENTS);
        } catch (seedErr) {
          console.warn("[Payments DB] Auto-seed error, continuing:", seedErr);
        }
      }

      // Build MongoDB Query
      const andClauses: any[] = [];

      if (status && status !== "all") {
        andClauses.push({ status });
      }

      if (provider && provider !== "all") {
        andClauses.push({ provider });
      }

      if (businessId) {
        andClauses.push({ businessId });
      }

      if (search) {
        andClauses.push({
          $or: [
            { id: { $regex: search, $options: "i" } },
            { businessName: { $regex: search, $options: "i" } },
            { payerName: { $regex: search, $options: "i" } },
            { payerEmail: { $regex: search, $options: "i" } },
            { reference: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { cityName: { $regex: search, $options: "i" } },
            { countryName: { $regex: search, $options: "i" } },
          ],
        });
      }

      // Territory resolution: look up all businesses in target territory so any payment
      // belonging to a business in that city/country appears on City Admin and Country Admin dashboards.
      let territoryBizIds: string[] = [];
      let territoryBizNames: string[] = [];
      const hasCountryFilter = !!(country && country !== "all");
      const hasCityFilter = !!(city && city !== "all");

      if (hasCountryFilter || hasCityFilter) {
        try {
          const { BusinessModel } = await import("@/lib/db/models/Business");
          const bizConditions: any[] = [];
          if (hasCountryFilter) {
            const cRx = new RegExp(`^${country.trim()}$`, "i");
            bizConditions.push({ $or: [{ countryName: cRx }, { country: cRx }] });
          }
          if (hasCityFilter) {
            const ciRx = new RegExp(`^${city.trim()}$`, "i");
            bizConditions.push({ $or: [{ cityName: ciRx }, { city: ciRx }] });
          }
          const bizDocs = await BusinessModel.find(bizConditions.length > 0 ? { $and: bizConditions } : {}).select("id name").lean();
          for (const b of bizDocs as any[]) {
            if (b.id) territoryBizIds.push(b.id);
            if (b.name) territoryBizNames.push(b.name);
          }
          for (const sb of SEED_BUSINESSES) {
            const matchC = !hasCountryFilter || sb.countryName?.toLowerCase() === country.toLowerCase();
            const matchCi = !hasCityFilter || sb.cityName?.toLowerCase() === city.toLowerCase();
            if (matchC && matchCi) {
              if (sb.id) territoryBizIds.push(sb.id);
              if (sb.name) territoryBizNames.push(sb.name);
            }
          }
          territoryBizIds = Array.from(new Set(territoryBizIds));
          territoryBizNames = Array.from(new Set(territoryBizNames));

          // Also self-heal / backfill any unpopulated payments for these businesses
          if (territoryBizIds.length > 0 || territoryBizNames.length > 0) {
            const setFields: any = {};
            if (hasCountryFilter) setFields.countryName = country.trim();
            if (hasCityFilter) setFields.cityName = city.trim();
            PaymentModel.updateMany(
              {
                $and: [
                  {
                    $or: [
                      ...(territoryBizIds.length > 0 ? [{ businessId: { $in: territoryBizIds } }] : []),
                      ...(territoryBizNames.length > 0 ? [{ businessName: { $in: territoryBizNames } }] : []),
                    ],
                  },
                  {
                    $or: [
                      { cityName: { $exists: false } },
                      { cityName: null },
                      { cityName: "" },
                      { countryName: { $exists: false } },
                      { countryName: null },
                      { countryName: "" },
                    ],
                  },
                ],
              },
              { $set: setFields }
            ).catch(() => {});
          }
        } catch (bizErr) {
          console.warn("[getPayments] Error resolving territory businesses:", bizErr);
        }
      }

      // Geo filters with territory business cross-reference
      if (hasCountryFilter) {
        const countryRegex = new RegExp(`^${country}$`, "i");
        const cOr: any[] = [{ countryName: countryRegex }];
        if (territoryBizIds.length > 0) {
          cOr.push({ businessId: { $in: territoryBizIds } });
        }
        if (territoryBizNames.length > 0) {
          cOr.push({ businessName: { $in: territoryBizNames } });
        }
        andClauses.push({ $or: cOr });
      }

      if (hasCityFilter) {
        const cityRegex = new RegExp(`^${city}$`, "i");
        const ciOr: any[] = [{ cityName: cityRegex }];
        if (territoryBizIds.length > 0) {
          ciOr.push({ businessId: { $in: territoryBizIds } });
        }
        if (territoryBizNames.length > 0) {
          ciOr.push({ businessName: { $in: territoryBizNames } });
        }
        andClauses.push({ $or: ciOr });
      }

      const query = andClauses.length > 0 ? { $and: andClauses } : {};

      const total = await PaymentModel.countDocuments(query);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const skip = (page - 1) * limit;

      const docs = await PaymentModel.find(query)
        .sort({ createdAt: options.sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Retrieve all matching documents to compute accurate stats and geo breakdown for this filtered view
      const allMatchingDocs = await PaymentModel.find(query).lean();
      const allFormatted = (allMatchingDocs as any[]).map((d) => ({
        id: d.id,
        businessId: d.businessId,
        businessName: d.businessName,
        cityName: d.cityName || "Addis Ababa",
        countryName: d.countryName || "Ethiopia",
        payerName: d.payerName,
        payerEmail: d.payerEmail,
        payerPhone: d.payerPhone,
        amount: d.amount,
        currency: d.currency || "ETB",
        provider: d.provider,
        paymentType: d.paymentType || "subscription",
        status: d.status || "completed",
        reference: d.reference,
        description: d.description,
        metadata: d.metadata,
        registeredBy: d.registeredBy || "system",
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
      }));

      const stats = calculateStats(allFormatted);
      const geoBreakdown = calculateGeoBreakdown(allFormatted);

      const payments: IPayment[] = docs.map((d: any) => ({
        id: d.id,
        businessId: d.businessId,
        businessName: d.businessName,
        cityName: d.cityName || "Addis Ababa",
        countryName: d.countryName || "Ethiopia",
        payerName: d.payerName,
        payerEmail: d.payerEmail,
        payerPhone: d.payerPhone,
        amount: d.amount,
        currency: d.currency || "ETB",
        provider: d.provider,
        paymentType: d.paymentType || "subscription",
        status: d.status || "completed",
        reference: d.reference,
        description: d.description,
        metadata: d.metadata,
        registeredBy: d.registeredBy || "system",
        createdAt: d.createdAt ? new Date(d.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: d.updatedAt ? new Date(d.updatedAt).toISOString() : new Date().toISOString(),
      }));

      return {
        success: true,
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats,
        geoBreakdown,
      };
    } catch (err) {
      console.warn("[Payments DB] Query error, falling back to local memory:", err);
    }
  }

  // Fallback in-memory processing
  let filtered = [...SEED_PAYMENTS];

  if (status && status !== "all") {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (provider && provider !== "all") {
    filtered = filtered.filter((p) => p.provider === provider);
  }

  if (businessId) {
    filtered = filtered.filter((p) => p.businessId === businessId);
  }

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.id.toLowerCase().includes(search) ||
        p.businessName.toLowerCase().includes(search) ||
        p.payerName.toLowerCase().includes(search) ||
        (p.payerEmail && p.payerEmail.toLowerCase().includes(search)) ||
        (p.reference && p.reference.toLowerCase().includes(search)) ||
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.cityName && p.cityName.toLowerCase().includes(search)) ||
        (p.countryName && p.countryName.toLowerCase().includes(search))
    );
  }

  // Geo filters for in-memory fallback
  if (country && country !== "all") {
    filtered = filtered.filter(
      (p) =>
        p.countryName?.toLowerCase() === country.toLowerCase() ||
        (p.businessId && SEED_BUSINESSES.some((sb) => sb.id === p.businessId && sb.countryName?.toLowerCase() === country.toLowerCase()))
    );
  }
  if (city && city !== "all") {
    filtered = filtered.filter(
      (p) =>
        p.cityName?.toLowerCase() === city.toLowerCase() ||
        (p.businessId && SEED_BUSINESSES.some((sb) => sb.id === p.businessId && sb.cityName?.toLowerCase() === city.toLowerCase()))
    );
  }

  // Sort by date descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginatedItems = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    payments: paginatedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    stats: calculateStats(filtered),
    geoBreakdown: calculateGeoBreakdown(filtered),
  };
}

/**
 * Register/Create a new actual payment
 */
export async function createPayment(
  input: CreatePaymentInput
): Promise<IPayment> {
  const providerPrefixMap: Record<PaymentProvider, string> = {
    telebirr: "TEL",
    cbebirr: "CBE",
    mpesa: "MPE",
    card: "STR",
    chapa: "CHP",
    bank_transfer: "BNK",
    cash: "CSH",
  };

  const prefix = providerPrefixMap[input.provider] || "PAY";
  const uniqueNum = Math.floor(100000 + Math.random() * 900000);
  const id = input.id || `TX-${prefix}-${uniqueNum}`;

  // Automatically resolve cityName and countryName if missing
  let resolvedCity = input.cityName?.trim();
  let resolvedCountry = input.countryName?.trim();

  if (!resolvedCity || !resolvedCountry) {
    // 1. Look up business in MongoDB BusinessModel
    try {
      const { BusinessModel } = await import("@/lib/db/models/Business");
      const dbBiz = await BusinessModel.findOne({
        $or: [
          ...(input.businessId ? [{ id: input.businessId }] : []),
          ...(input.businessName ? [{ name: new RegExp(`^${input.businessName.trim()}$`, "i") }] : []),
        ],
      }).lean();
      if (dbBiz) {
        resolvedCity = resolvedCity || (dbBiz as any).cityName;
        resolvedCountry = resolvedCountry || (dbBiz as any).countryName;
      }
    } catch (e) {
      console.warn("[createPayment] Error resolving business geo from MongoDB:", e);
    }

    // 2. Check SEED_BUSINESSES fallback
    if (!resolvedCity || !resolvedCountry) {
      const matchBiz = SEED_BUSINESSES.find(
        (b) =>
          (input.businessId && b.id === input.businessId) ||
          (input.businessName && b.name?.toLowerCase() === input.businessName?.trim().toLowerCase())
      );
      if (matchBiz) {
        resolvedCity = resolvedCity || matchBiz.cityName;
        resolvedCountry = resolvedCountry || matchBiz.countryName;
      }
    }
  }

  resolvedCity = resolvedCity || "Addis Ababa";
  resolvedCountry = resolvedCountry || "Ethiopia";

  const newPayment: IPayment = {
    id,
    businessId: input.businessId,
    businessName: input.businessName,
    cityName: resolvedCity,
    countryName: resolvedCountry,
    payerName: input.payerName,
    payerEmail: input.payerEmail,
    payerPhone: input.payerPhone,
    amount: Number(input.amount),
    currency: input.currency || "ETB",
    provider: input.provider,
    paymentType: input.paymentType || "subscription",
    status: input.status || "completed",
    reference:
      input.reference ||
      `${prefix}-REF-${Date.now().toString().slice(-6)}`,
    description: input.description || `${input.paymentType || "Service"} Payment`,
    metadata: input.metadata || {},
    registeredBy: input.registeredBy || "Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mongoose = await connectToDatabase();
  if (mongoose) {
    try {
      const doc = await PaymentModel.create({
        ...newPayment,
        createdAt: new Date(newPayment.createdAt),
        updatedAt: new Date(newPayment.updatedAt),
      });
      return {
        ...newPayment,
        id: doc.id,
      };
    } catch (err) {
      console.warn("[Payments DB] Failed to save in MongoDB, stored locally:", err);
    }
  }

  // Also prepend to local seed array if in fallback mode
  SEED_PAYMENTS.unshift(newPayment);
  return newPayment;
}

/**
 * Update status of an existing payment (e.g. mark Paid, Refund)
 */
export async function updatePaymentStatus(
  id: string,
  status: PaymentStatus,
  notes?: string
): Promise<IPayment | null> {
  const mongoose = await connectToDatabase();

  if (mongoose) {
    try {
      const updateData: Record<string, any> = {
        status,
        updatedAt: new Date(),
      };
      if (notes) {
        updateData["metadata.statusNotes"] = notes;
      }

      const doc = await PaymentModel.findOneAndUpdate(
        { id },
        { $set: updateData },
        { new: true }
      ).lean();

      if (doc) {
        return {
          id: (doc as any).id,
          businessId: (doc as any).businessId,
          businessName: (doc as any).businessName,
          cityName: (doc as any).cityName || "Addis Ababa",
          countryName: (doc as any).countryName || "Ethiopia",
          payerName: (doc as any).payerName,
          payerEmail: (doc as any).payerEmail,
          payerPhone: (doc as any).payerPhone,
          amount: (doc as any).amount,
          currency: (doc as any).currency || "ETB",
          provider: (doc as any).provider,
          paymentType: (doc as any).paymentType,
          status: (doc as any).status,
          reference: (doc as any).reference,
          description: (doc as any).description,
          metadata: (doc as any).metadata,
          registeredBy: (doc as any).registeredBy,
          createdAt: new Date((doc as any).createdAt).toISOString(),
          updatedAt: new Date((doc as any).updatedAt).toISOString(),
        };
      }
    } catch (err) {
      console.warn("[Payments DB] Update error:", err);
    }
  }

  // Fallback update in SEED_PAYMENTS
  const item = SEED_PAYMENTS.find((p) => p.id === id);
  if (item) {
    item.status = status;
    item.updatedAt = new Date().toISOString();
    if (notes) {
      item.metadata = { ...item.metadata, statusNotes: notes };
    }
    return item;
  }

  return null;
}

/**
 * Get payment by ID
 */
export async function getPaymentById(id: string): Promise<IPayment | null> {
  const mongoose = await connectToDatabase();
  if (mongoose) {
    try {
      const doc = await PaymentModel.findOne({ id }).lean();
      if (doc) {
        return {
          id: (doc as any).id,
          businessId: (doc as any).businessId,
          businessName: (doc as any).businessName,
          cityName: (doc as any).cityName || "Addis Ababa",
          countryName: (doc as any).countryName || "Ethiopia",
          payerName: (doc as any).payerName,
          payerEmail: (doc as any).payerEmail,
          payerPhone: (doc as any).payerPhone,
          amount: (doc as any).amount,
          currency: (doc as any).currency || "ETB",
          provider: (doc as any).provider,
          paymentType: (doc as any).paymentType,
          status: (doc as any).status,
          reference: (doc as any).reference,
          description: (doc as any).description,
          metadata: (doc as any).metadata,
          registeredBy: (doc as any).registeredBy,
          createdAt: new Date((doc as any).createdAt).toISOString(),
          updatedAt: new Date((doc as any).updatedAt).toISOString(),
        };
      }
    } catch (err) {
      console.warn("[Payments DB] getPaymentById error:", err);
    }
  }

  return SEED_PAYMENTS.find((p) => p.id === id) || null;
}
