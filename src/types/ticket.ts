export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting_on_customer"
  | "resolved"
  | "closed";

export type TicketPriority = "critical" | "high" | "medium" | "low";

export type TicketCategory =
  | "verification"
  | "billing"
  | "technical"
  | "account"
  | "listing"
  | "dispute"
  | "general";

export interface ITicketMessage {
  id: string;
  senderId?: string;
  senderName: string;
  senderRole: "user" | "owner" | "admin" | "super_admin";
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface ISupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
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
  messages: ITicketMessage[];
  lastReply?: string;
  lastReplyAt?: string;
  city?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waiting: number;
  resolved: number;
  closed: number;
  critical: number;
  high: number;
}

export interface PaginatedTicketsResponse {
  tickets: ISupportTicket[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: {
    all: number;
    open: number;
    inProgress: number;
    waiting: number;
    resolved: number;
    closed: number;
  };
  stats?: TicketStats;
}
