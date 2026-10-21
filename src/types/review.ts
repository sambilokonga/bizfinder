export interface ReviewReply {
  ownerId: string;
  ownerName: string;
  comment: string;
  createdAt: string;
}

export interface Review {
  id: string;
  businessId: string;
  businessName?: string;
  cityName?: string;
  countryName?: string;
  timeframeType?: "historical" | "recent" | "future_scheduled";
  dateFormatted?: string;
  isVerifiedCitizen?: boolean;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  photos?: string[];
  likesCount?: number;
  reply?: ReviewReply;
  status?: "published" | "pending" | "reported" | "removed";
  isFlagged?: boolean;
  createdAt: string;
}
