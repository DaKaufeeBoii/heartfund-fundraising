
import { Campaign, User, DonationRecord, UserHistory } from '../types';
import { MOCK_CAMPAIGNS } from '../constants';

// In a real environment, we'd use the `supabase` client from ./supabase.ts
// Here we simulate the async database behavior to maintain functionality while preparing for a real connection

const KEYS = {
  USERS: 'heartfund_users',
  CAMPAIGNS: 'heartfund_campaigns',
  CURRENT_USER: 'heartfund_current_user',
  HISTORY_PREFIX: 'heartfund_history_'
};

const initializeDB = () => {
  if (!localStorage.getItem(KEYS.CAMPAIGNS)) {
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(MOCK_CAMPAIGNS));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
};

initializeDB();

export const storage = {
  // SIMULATED SUPABASE QUERIES
  getCampaigns: async (): Promise<Campaign[]> => {
    // Simulate: supabase.from('campaigns').select('*')
    const data = localStorage.getItem(KEYS.CAMPAIGNS);
    return data ? JSON.parse(data) : [];
  },

  saveCampaign: async (campaign: Campaign) => {
    // Simulate: supabase.from('campaigns').insert(campaign)
    const campaigns = await storage.getCampaigns();
    const updated = [campaign, ...campaigns];
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(updated));
  },

  updateDonation: async (campaignId: string, amount: number) => {
    // Simulate: supabase.rpc('increment_donation', { cid: campaignId, val: amount })
    const campaigns = await storage.getCampaigns();
    const updated = campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, currentAmount: c.currentAmount + amount, donors: c.donors + 1 }
        : c
    );
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(updated));
  },

  getUsers: async (): Promise<any[]> => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUser: async (user: any) => {
    const users = await storage.getUsers();
    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  findUser: async (email: string): Promise<any | undefined> => {
    const users = await storage.getUsers();
    return users.find(u => u.email === email);
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  getUserHistory: async (userId: string): Promise<UserHistory> => {
    // Simulate: supabase.from('history').select('*').eq('user_id', userId)
    const data = localStorage.getItem(`${KEYS.HISTORY_PREFIX}${userId}`);
    return data ? JSON.parse(data) : { donations: [], recentlyViewedIds: [] };
  },

  addDonationToHistory: async (userId: string, record: DonationRecord) => {
    const history = await storage.getUserHistory(userId);
    const newRecord = {
      ...record,
      transactionId: record.transactionId || `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };
    history.donations = [newRecord, ...history.donations];
    localStorage.setItem(`${KEYS.HISTORY_PREFIX}${userId}`, JSON.stringify(history));
  },

  addRecentCampaign: async (userId: string, campaignId: string) => {
    const history = await storage.getUserHistory(userId);
    const filtered = history.recentlyViewedIds.filter(id => id !== campaignId);
    history.recentlyViewedIds = [campaignId, ...filtered].slice(0, 5);
    localStorage.setItem(`${KEYS.HISTORY_PREFIX}${userId}`, JSON.stringify(history));
  }
};
