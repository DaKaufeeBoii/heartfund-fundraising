
import { Campaign, User, DonationRecord, UserHistory } from '../types';
import { MOCK_CAMPAIGNS } from '../constants';

const KEYS = {
  USERS: 'heartfund_users',
  CAMPAIGNS: 'heartfund_campaigns',
  CURRENT_USER: 'heartfund_current_user',
  HISTORY_PREFIX: 'heartfund_history_'
};

interface StoredUser extends User {
  password?: string;
}

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
  getCampaigns: (): Campaign[] => {
    const data = localStorage.getItem(KEYS.CAMPAIGNS);
    return data ? JSON.parse(data) : [];
  },

  saveCampaign: (campaign: Campaign) => {
    const campaigns = storage.getCampaigns();
    const updated = [campaign, ...campaigns];
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(updated));
  },

  updateDonation: (campaignId: string, amount: number) => {
    const campaigns = storage.getCampaigns();
    const updated = campaigns.map(c => 
      c.id === campaignId 
        ? { ...c, currentAmount: c.currentAmount + amount, donors: c.donors + 1 }
        : c
    );
    localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(updated));
  },

  getUsers: (): StoredUser[] => {
    const data = localStorage.getItem(KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUser: (user: StoredUser) => {
    const users = storage.getUsers();
    users.push(user);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  findUser: (email: string): StoredUser | undefined => {
    const users = storage.getUsers();
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

  // User History Logic
  getUserHistory: (userId: string): UserHistory => {
    const data = localStorage.getItem(`${KEYS.HISTORY_PREFIX}${userId}`);
    return data ? JSON.parse(data) : { donations: [], recentlyViewedIds: [] };
  },

  addDonationToHistory: (userId: string, record: DonationRecord) => {
    const history = storage.getUserHistory(userId);
    history.donations = [record, ...history.donations];
    localStorage.setItem(`${KEYS.HISTORY_PREFIX}${userId}`, JSON.stringify(history));
  },

  addRecentCampaign: (userId: string, campaignId: string) => {
    const history = storage.getUserHistory(userId);
    // Move to front if exists, or just add
    const filtered = history.recentlyViewedIds.filter(id => id !== campaignId);
    history.recentlyViewedIds = [campaignId, ...filtered].slice(0, 5);
    localStorage.setItem(`${KEYS.HISTORY_PREFIX}${userId}`, JSON.stringify(history));
  }
};
