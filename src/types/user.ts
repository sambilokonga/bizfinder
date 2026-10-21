export type UserRole =
  | "user"
  | "owner"
  | "city_admin"
  | "country_admin"
  | "admin"
  | "super_admin";

export interface User {
  id: string;
  clerkId?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  assignedCountry?: string; // e.g. "Ethiopia", "United States", "Canada"
  assignedCity?: string;    // e.g. "Addis Ababa", "Toronto", "Baku"
  country?: string;
  city?: string;
  status?: "active" | "suspended" | "pending" | "rejected";
  approvalStatus?: "approved" | "pending" | "rejected";
  nominatedBy?: {
    name?: string;
    email?: string;
    role?: string;
    country?: string;
    date?: string;
  };
  isActive?: boolean;
  createdAt: string;
  claimedBusinessIds?: string[];
}

