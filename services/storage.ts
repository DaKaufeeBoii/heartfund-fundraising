
import { Campaign, User, DonationRecord, UserHistory } from '../types';
import { supabase } from './supabase';

/**
 * STORAGE SERVICE (Supabase Implementation)
 * This service handles all interactions with the PostgreSQL database.
 */

export const storage = {
  // --- CAMPAIGN QUERIES ---
  
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
    return data as Campaign[];
  },

  saveCampaign: async (campaign: Campaign) => {
    const { error } = await supabase
      .from('campaigns')
      .insert([campaign]);

    if (error) throw error;
  },

  updateDonation: async (campaignId: string, amount: number) => {
    // Note: In production, consider using a database function (RPC) for atomicity
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('currentAmount, donors')
      .eq('id', campaignId)
      .single();

    if (campaign) {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          currentAmount: (campaign.currentAmount || 0) + amount,
          donors: (campaign.donors || 0) + 1 
        })
        .eq('id', campaignId);
      
      if (error) throw error;
    }
  },

  // --- USER PROFILE & AUTH ---

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('heartfund_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('heartfund_current_user');
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem('heartfund_current_user');
    return data ? JSON.parse(data) : null;
  },

  // --- IMPACT & HISTORY ---

  getUserHistory: async (userId: string): Promise<UserHistory> => {
    const { data: donations } = await supabase
      .from('donations')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });

    const { data: profile } = await supabase
      .from('profiles')
      .select('recentlyViewedIds')
      .eq('id', userId)
      .single();

    return {
      donations: (donations || []) as DonationRecord[],
      recentlyViewedIds: profile?.recentlyViewedIds || []
    };
  },

  addDonationToHistory: async (userId: string, record: DonationRecord) => {
    const { error } = await supabase
      .from('donations')
      .insert([{
        userId: userId,
        campaignId: record.campaignId,
        campaignTitle: record.campaignTitle,
        amount: record.amount,
        transactionId: record.transactionId,
        date: record.date
      }]);
    
    if (error) throw error;
  },

  addRecentCampaign: async (userId: string, campaignId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('recentlyViewedIds')
      .eq('id', userId)
      .single();

    const existingIds = profile?.recentlyViewedIds || [];
    const filtered = existingIds.filter((id: string) => id !== campaignId);
    const updatedIds = [campaignId, ...filtered].slice(0, 5);

    await supabase
      .from('profiles')
      .update({ recentlyViewedIds: updatedIds })
      .eq('id', userId);
  }
};
