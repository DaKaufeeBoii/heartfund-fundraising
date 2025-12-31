
export interface Campaign {
  id: string;
  title: string;
  creator: string;
  creatorAvatar: string;
  description: string;
  longDescription: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  donors: number;
  category: string;
  endDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface DonationRecord {
  id: string;
  campaignId: string;
  campaignTitle: string;
  amount: number;
  date: string;
  transactionId: string;
}

export interface UserHistory {
  donations: DonationRecord[];
  recentlyViewedIds: string[];
}
