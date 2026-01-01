
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
      .order('created_at', { ascending: false });

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
    // Note: In a production app, use a RPC (Database Function) to prevent race conditions
    // This simple approach fetches then updates
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('currentAmount, donors')
      .eq('id', campaignId)
      .single();

    if (campaign) {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          currentAmount: campaign.currentAmount + amount,
          donors: campaign.donors + 1 
        })
        .eq('id', campaignId);
      
      if (error) throw error;
    }
  },

  // --- USER PROFILE & AUTH ---

  setCurrentUser: (user: User | null) => {
    // Auth state is managed by Supabase Auth, but we can cache the profile in memory
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
    // Fetch donations from the 'donations' table
    const { data: donations, error: dError } = await supabase
      .from('donations')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    // Fetch recently viewed from 'user_profiles'
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('recently_viewed_ids')
      .eq('id', userId)
      .single();

    return {
      donations: (donations || []) as DonationRecord[],
      recentlyViewedIds: profile?.recently_viewed_ids || []
    };
  },

  addDonationToHistory: async (userId: string, record: DonationRecord) => {
    const { error } = await supabase
      .from('donations')
      .insert([{
        user_id: userId,
        campaign_id: record.campaignId,
        campaign_title: record.campaignTitle,
        amount: record.amount,
        transaction_id: record.transactionId,
        date: record.date
      }]);
    
    if (error) throw error;
  },

  addRecentCampaign: async (userId: string, campaignId: string) => {
    // Get existing list
    const { data: profile } = await supabase
      .from('profiles')
      .select('recently_viewed_ids')
      .eq('id', userId)
      .single();

    const existingIds = profile?.recently_viewed_ids || [];
    const filtered = existingIds.filter((id: string) => id !== campaignId);
    const updatedIds = [campaignId, ...filtered].slice(0, 5);

    await supabase
      .from('profiles')
      .update({ recently_viewed_ids: updatedIds })
      .eq('id', userId);
  }
};
