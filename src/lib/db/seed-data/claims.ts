export interface SeedClaim {
  id: string;
  businessId: string;
  businessName: string;
  userId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  businessRole: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  createdAt: string;
}

export const SEED_CLAIMS: SeedClaim[] = [
  {
    id: "claim-1",
    businessId: "biz-1",
    businessName: "Kategna Ethiopian Restaurant",
    userId: "user-owner-1",
    userEmail: "solomon@kategnarestaurant.com",
    userName: "Solomon Tadesse",
    userPhone: "+251 91 123 4567",
    businessRole: "Managing Director",
    status: "approved",
    notes: "Verified with trade license and TIN certificate registration.",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "claim-2",
    businessId: "biz-2",
    businessName: "Bole Pharmacy & Health Center",
    userId: "user-owner-2",
    userEmail: "owner@bolepharmacy.example.com",
    userName: "Yonas Alemu",
    userPhone: "+251 91 177 8899",
    businessRole: "Head Pharmacist & Owner",
    status: "pending",
    notes: "Submitted pharmacy license document for review.",
    createdAt: "2024-05-10T14:20:00Z",
  },
];
