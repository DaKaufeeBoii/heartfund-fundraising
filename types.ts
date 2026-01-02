
export interface Campaign {
  id: string;
  title: string;
  creator: string;
  // Unique identifier for the campaign creator
  creatorid: string;
  creatoravatar: string;
  description: string;
  longdescription: string;
  imageurls: string[]; 
  goalamount: number;
  currentamount: number;
  donors: number;
  category: string;
  enddate: string;
  createdat?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface DonationRecord {
  id: string;
  campaignid: string;
  campaigntitle: string;
  amount: number;
  date: string;
  transactionid: string;
}

export interface UserHistory {
  donations: DonationRecord[];
  recentlyviewedids: string[];
}
