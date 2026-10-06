import { connectToDatabase } from "@/lib/db/mongodb";
import { TicketModel } from "@/lib/db/models/Ticket";
import { SEED_TICKETS } from "@/lib/db/seed-data/tickets";
import {
  ISupportTicket,
  PaginatedTicketsResponse,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  TicketStats,
  ITicketMessage,
} from "@/types/ticket";

export interface GetTicketsOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  priority?: string;
  userId?: string;
  businessId?: string;
  assignedAdmin?: string;
  sort?: "desc" | "asc";
}

export interface CreateTicketInput {
  id?: string;
  subject: string;
  category: TicketCategory;
  priority?: TicketPriority;
  status?: TicketStatus;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userRole?: string;
  businessId?: string;
  businessName?: string;
  assignedAdmin?: string;
  assignedAdminId?: string;
  tags?: string[];
  initialMessage: string;
  city?: string;
  country?: string;
}

export interface AddMessageInput {
  senderId?: string;
  senderName: string;
  senderRole: "user" | "owner" | "admin" | "super_admin";
  message: string;
  attachments?: string[];
  newStatus?: TicketStatus;
}

// In-memory store for zero-downtime development and offline mode
let inMemoryTickets: ISupportTicket[] = [...SEED_TICKETS];

function calculateTicketStats(items: ISupportTicket[]): TicketStats {
  let open = 0;
  let inProgress = 0;
  let waiting = 0;
  let resolved = 0;
  let closed = 0;
  let critical = 0;
  let high = 0;

  for (const t of items) {
    if (t.status === "open") open++;
    else if (t.status === "in_progress") inProgress++;
    else if (t.status === "waiting_on_customer") waiting++;
    else if (t.status === "resolved") resolved++;
    else if (t.status === "closed") closed++;

    if (t.priority === "critical") critical++;
    else if (t.priority === "high") high++;
  }

  return {
    total: items.length,
    open,
    inProgress,
    waiting,
    resolved,
    closed,
    critical,
    high,
  };
}

export async function getTickets(
  options: GetTicketsOptions = {}
): Promise<PaginatedTicketsResponse> {
  const {
    page = 1,
    limit = 20,
    search,
    category,
    status,
    priority,
    userId,
    businessId,
    assignedAdmin,
    sort = "desc",
  } = options;

  try {
    const mongoose = await connectToDatabase();

    if (mongoose) {
      // Ensure seed tickets exist if collection is empty
      const existingCount = await TicketModel.countDocuments();
      if (existingCount === 0) {
        await TicketModel.insertMany(
          SEED_TICKETS.map((t) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
            lastReplyAt: t.lastReplyAt ? new Date(t.lastReplyAt) : new Date(t.createdAt),
            messages: t.messages.map((m) => ({
              ...m,
              createdAt: new Date(m.createdAt),
            })),
          }))
        );
      }

      const filter: Record<string, any> = {};

      if (category && category !== "all") {
        filter.category = category;
      }

      if (status && status !== "all") {
        if (status === "pending") {
          filter.status = "in_progress";
        } else {
          filter.status = status;
        }
      }

      if (priority && priority !== "all") {
        filter.priority = priority;
      }

      if (userId) {
        filter.userId = userId;
      }

      if (businessId) {
        filter.businessId = businessId;
      }

      if (assignedAdmin && assignedAdmin !== "all") {
        filter.assignedAdmin = assignedAdmin;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        filter.$or = [
          { subject: regex },
          { id: regex },
          { userName: regex },
          { userEmail: regex },
          { businessName: regex },
          { lastReply: regex },
          { tags: regex },
        ];
      }

      const total = await TicketModel.countDocuments(filter);
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const skip = (page - 1) * limit;

      const docs = await TicketModel.find(filter)
        .sort({ createdAt: sort === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Aggregate global category/status counts
      const allDocs = await TicketModel.find(userId ? { userId } : {}).lean();
      const allStats = calculateTicketStats(allDocs as any);

      const tickets: ISupportTicket[] = docs.map((d: any) => ({
        id: d.id,
        subject: d.subject,
        category: d.category,
        priority: d.priority,
        status: d.status,
        userId: d.userId,
        userName: d.userName,
        userEmail: d.userEmail,
        userPhone: d.userPhone,
        userRole: d.userRole,
        businessId: d.businessId,
        businessName: d.businessName,
        assignedAdmin: d.assignedAdmin,
        assignedAdminId: d.assignedAdminId,
        tags: d.tags || [],
        messages: (d.messages || []).map((m: any) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.senderName,
          senderRole: m.senderRole,
          message: m.message,
          attachments: m.attachments,
          createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
        })),
        lastReply: d.lastReply,
        lastReplyAt: d.lastReplyAt instanceof Date ? d.lastReplyAt.toISOString() : d.lastReplyAt,
        city: d.city,
        country: d.country,
        createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : String(d.createdAt),
        updatedAt: d.updatedAt instanceof Date ? d.updatedAt.toISOString() : String(d.updatedAt),
      }));

      return {
        tickets,
        total,
        page,
        limit,
        totalPages,
        counts: {
          all: allStats.total,
          open: allStats.open,
          inProgress: allStats.inProgress,
          waiting: allStats.waiting,
          resolved: allStats.resolved,
          closed: allStats.closed,
        },
        stats: allStats,
      };
    }
  } catch (err) {
    console.warn("[getTickets] DB query fallback to memory store:", err);
  }

  // In-memory fallback
  let filtered = [...inMemoryTickets];

  if (userId) {
    filtered = filtered.filter((t) => t.userId === userId);
  }

  if (businessId) {
    filtered = filtered.filter((t) => t.businessId === businessId);
  }

  if (category && category !== "all") {
    filtered = filtered.filter((t) => t.category === category);
  }

  if (status && status !== "all") {
    if (status === "pending") {
      filtered = filtered.filter((t) => t.status === "in_progress");
    } else {
      filtered = filtered.filter((t) => t.status === status);
    }
  }

  if (priority && priority !== "all") {
    filtered = filtered.filter((t) => t.priority === priority);
  }

  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.userName.toLowerCase().includes(q) ||
        t.userEmail.toLowerCase().includes(q) ||
        (t.businessName && t.businessName.toLowerCase().includes(q)) ||
        (t.lastReply && t.lastReply.toLowerCase().includes(q)) ||
        (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(q)))
    );
  }

  const allStats = calculateTicketStats(
    userId ? inMemoryTickets.filter((t) => t.userId === userId) : inMemoryTickets
  );

  filtered.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return sort === "asc" ? timeA - timeB : timeB - timeA;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  return {
    tickets: paginated,
    total,
    page,
    limit,
    totalPages,
    counts: {
      all: allStats.total,
      open: allStats.open,
      inProgress: allStats.inProgress,
      waiting: allStats.waiting,
      resolved: allStats.resolved,
      closed: allStats.closed,
    },
    stats: allStats,
  };
}

export async function getTicketById(id: string): Promise<ISupportTicket | null> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const doc: any = await TicketModel.findOne({ id }).lean();
      if (doc) {
        return {
          id: doc.id,
          subject: doc.subject,
          category: doc.category,
          priority: doc.priority,
          status: doc.status,
          userId: doc.userId,
          userName: doc.userName,
          userEmail: doc.userEmail,
          userPhone: doc.userPhone,
          userRole: doc.userRole,
          businessId: doc.businessId,
          businessName: doc.businessName,
          assignedAdmin: doc.assignedAdmin,
          assignedAdminId: doc.assignedAdminId,
          tags: doc.tags || [],
          messages: (doc.messages || []).map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderRole,
            message: m.message,
            attachments: m.attachments,
            createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
          })),
          lastReply: doc.lastReply,
          lastReplyAt: doc.lastReplyAt instanceof Date ? doc.lastReplyAt.toISOString() : doc.lastReplyAt,
          city: doc.city,
          country: doc.country,
          createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt),
          updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt),
        };
      }
    }
  } catch (err) {
    console.warn("[getTicketById] DB fallback to memory store:", err);
  }

  const found = inMemoryTickets.find((t) => t.id === id);
  return found || null;
}

export async function createTicket(input: CreateTicketInput): Promise<ISupportTicket> {
  const generatedId =
    input.id || `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const initialMsg: ITicketMessage = {
    id: `msg-${Date.now()}`,
    senderId: input.userId,
    senderName: input.userName,
    senderRole: (input.userRole as any) || "owner",
    message: input.initialMessage,
    createdAt: now,
  };

  const newTicket: ISupportTicket = {
    id: generatedId,
    subject: input.subject,
    category: input.category || "general",
    priority: input.priority || "medium",
    status: input.status || "open",
    userId: input.userId,
    userName: input.userName,
    userEmail: input.userEmail,
    userPhone: input.userPhone,
    userRole: input.userRole || "owner",
    businessId: input.businessId,
    businessName: input.businessName,
    assignedAdmin: input.assignedAdmin || "Unassigned",
    assignedAdminId: input.assignedAdminId,
    tags: input.tags || [],
    messages: [initialMsg],
    lastReply: `${input.userName}: ${input.initialMessage.slice(0, 70)}...`,
    lastReplyAt: now,
    city: input.city || "Addis Ababa",
    country: input.country || "Ethiopia",
    createdAt: now,
    updatedAt: now,
  };

  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      await TicketModel.create({
        ...newTicket,
        createdAt: new Date(now),
        updatedAt: new Date(now),
        lastReplyAt: new Date(now),
        messages: [
          {
            ...initialMsg,
            createdAt: new Date(now),
          },
        ],
      });
    }
  } catch (err) {
    console.warn("[createTicket] DB insert fallback to memory store:", err);
  }

  inMemoryTickets.unshift(newTicket);
  return newTicket;
}

export async function addTicketMessage(
  ticketId: string,
  input: AddMessageInput
): Promise<ISupportTicket | null> {
  const now = new Date().toISOString();
  const newMsg: ITicketMessage = {
    id: `msg-${Date.now()}`,
    senderId: input.senderId,
    senderName: input.senderName,
    senderRole: input.senderRole,
    message: input.message,
    attachments: input.attachments,
    createdAt: now,
  };

  const replySummary = `${input.senderName}: ${input.message.slice(0, 70)}...`;

  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const updateDoc: Record<string, any> = {
        $push: { messages: { ...newMsg, createdAt: new Date(now) } },
        $set: {
          lastReply: replySummary,
          lastReplyAt: new Date(now),
          updatedAt: new Date(now),
        },
      };

      if (input.newStatus) {
        updateDoc.$set.status = input.newStatus;
      }

      const updated: any = await TicketModel.findOneAndUpdate(
        { id: ticketId },
        updateDoc,
        { new: true }
      ).lean();

      if (updated) {
        const mapped: ISupportTicket = {
          id: updated.id,
          subject: updated.subject,
          category: updated.category,
          priority: updated.priority,
          status: updated.status,
          userId: updated.userId,
          userName: updated.userName,
          userEmail: updated.userEmail,
          userPhone: updated.userPhone,
          userRole: updated.userRole,
          businessId: updated.businessId,
          businessName: updated.businessName,
          assignedAdmin: updated.assignedAdmin,
          assignedAdminId: updated.assignedAdminId,
          tags: updated.tags || [],
          messages: (updated.messages || []).map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderRole,
            message: m.message,
            attachments: m.attachments,
            createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
          })),
          lastReply: updated.lastReply,
          lastReplyAt: updated.lastReplyAt instanceof Date ? updated.lastReplyAt.toISOString() : updated.lastReplyAt,
          city: updated.city,
          country: updated.country,
          createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt),
          updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : String(updated.updatedAt),
        };

        // Also update memory store
        inMemoryTickets = inMemoryTickets.map((t) => (t.id === ticketId ? mapped : t));
        return mapped;
      }
    }
  } catch (err) {
    console.warn("[addTicketMessage] DB update fallback to memory store:", err);
  }

  const idx = inMemoryTickets.findIndex((t) => t.id === ticketId);
  if (idx !== -1) {
    const current = inMemoryTickets[idx];
    const updated: ISupportTicket = {
      ...current,
      status: input.newStatus || current.status,
      messages: [...current.messages, newMsg],
      lastReply: replySummary,
      lastReplyAt: now,
      updatedAt: now,
    };
    inMemoryTickets[idx] = updated;
    return updated;
  }

  return null;
}

export async function updateTicket(
  ticketId: string,
  updates: Partial<ISupportTicket>
): Promise<ISupportTicket | null> {
  const now = new Date().toISOString();

  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      const updated: any = await TicketModel.findOneAndUpdate(
        { id: ticketId },
        { $set: { ...updates, updatedAt: new Date(now) } },
        { new: true }
      ).lean();

      if (updated) {
        const mapped: ISupportTicket = {
          id: updated.id,
          subject: updated.subject,
          category: updated.category,
          priority: updated.priority,
          status: updated.status,
          userId: updated.userId,
          userName: updated.userName,
          userEmail: updated.userEmail,
          userPhone: updated.userPhone,
          userRole: updated.userRole,
          businessId: updated.businessId,
          businessName: updated.businessName,
          assignedAdmin: updated.assignedAdmin,
          assignedAdminId: updated.assignedAdminId,
          tags: updated.tags || [],
          messages: (updated.messages || []).map((m: any) => ({
            id: m.id,
            senderId: m.senderId,
            senderName: m.senderName,
            senderRole: m.senderRole,
            message: m.message,
            attachments: m.attachments,
            createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : String(m.createdAt),
          })),
          lastReply: updated.lastReply,
          lastReplyAt: updated.lastReplyAt instanceof Date ? updated.lastReplyAt.toISOString() : updated.lastReplyAt,
          city: updated.city,
          country: updated.country,
          createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : String(updated.createdAt),
          updatedAt: updated.updatedAt instanceof Date ? updated.updatedAt.toISOString() : String(updated.updatedAt),
        };
        inMemoryTickets = inMemoryTickets.map((t) => (t.id === ticketId ? mapped : t));
        return mapped;
      }
    }
  } catch (err) {
    console.warn("[updateTicket] DB update fallback to memory store:", err);
  }

  const idx = inMemoryTickets.findIndex((t) => t.id === ticketId);
  if (idx !== -1) {
    const current = inMemoryTickets[idx];
    const updated: ISupportTicket = {
      ...current,
      ...updates,
      updatedAt: now,
    };
    inMemoryTickets[idx] = updated;
    return updated;
  }

  return null;
}

export async function deleteTicket(ticketId: string): Promise<boolean> {
  try {
    const mongoose = await connectToDatabase();
    if (mongoose) {
      await TicketModel.deleteOne({ id: ticketId });
    }
  } catch (err) {
    console.warn("[deleteTicket] DB delete fallback:", err);
  }

  inMemoryTickets = inMemoryTickets.filter((t) => t.id !== ticketId);
  return true;
}
