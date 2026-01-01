
import { Campaign, User, DonationRecord, UserHistory } from '../types';
import { supabase } from './supabase';

/**
 * STORAGE SERVICE (Supabase Implementation)
 * This service handles all interactions with the PostgreSQL database and Storage buckets.
 */

export const storage = {
  // --- CAMPAIGN QUERIES ---
  
  getCampaigns: async (): Promise<Campaign[]> => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('id', { ascending: false });

    if (error) {
      console.error('Error fetching campaigns:', error);
      return [];
    }
    return data as Campaign[];
  },

  /**
   * Saves a new campaign. 
   * CRITICAL: 'creatorId' must match auth.uid() for Row Level Security to pass.
   */
  saveCampaign: async (campaign: Omit<Campaign, 'id'>): Promise<Campaign> => {
    // 1. Double check current session to ensure IDs match
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('You must be logged in to create a campaign.');
    }

    // Ensure the payload strictly matches what the UI provides and what DB expects
    const payload = {
      title: campaign.title,
      description: campaign.description,
      longDescription: campaign.longDescription,
      goalAmount: campaign.goalAmount,
      category: campaign.category,
      endDate: campaign.endDate,
      creator: campaign.creator,
      creatorAvatar: campaign.creatorAvatar,
      imageUrls: campaign.imageUrls,
      currentAmount: 0,
      donors: 0,
      creatorId: session.user.id, // Hard-enforce the ID for RLS
      createdat: new Date().toISOString()
    };

    console.log('[HEARTFUND] Attempting Insert:', payload);

    const { data, error } = await supabase
      .from('campaigns')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[HEARTFUND DATABASE ERROR]', error);
      
      // Map cryptic Postgres errors to helpful human messages
      if (error.message.includes('column "creatorAvatar" does not exist')) {
        throw new Error('Database Schema Error: The "creatorAvatar" column is missing. Run the ALTER TABLE SQL provided.');
      }
      
      if (error.message.includes('column "imageUrls" does not exist')) {
        throw new Error('Database Schema Error: The "imageUrls" column is missing. Ensure it is type text[] (array).');
      }

      if (error.code === '42501') {
        throw new Error('Security Policy Error: Your RLS policies are blocking the save. Ensure you have an INSERT policy for authenticated users.');
      }

      throw error;
    }

    console.log('[HEARTFUND] Campaign created successfully:', data.id);
    return data as Campaign;
  },

  updateDonation: async (campaignId: string, amount: number) => {
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

  // --- IMAGE STORAGE ---

  uploadImage: async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `campaigns/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('[HEARTFUND STORAGE ERROR]', uploadError);
        if (uploadError.message.includes('not found')) {
          throw new Error('Bucket "campaign-images" not found. Create it in Supabase > Storage.');
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (err: any) {
      console.error('[HEARTFUND] Image upload failed:', err.message);
      throw err;
    }
  },

  // --- GLOBAL ACTIVITY ---

  getGlobalRecentDonations: async (limit: number = 5): Promise<any[]> => {
    const { data, error } = await supabase
      .from('donations')
      .select(`*, profiles(name)`)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) return [];
    return data || [];
  },

  // --- USER PROFILE & AUTH ---

  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem('heartfund_current_user', JSON.stringify(user));
    else localStorage.removeItem('heartfund_current_user');
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
    await supabase.from('donations').insert([{
      userId: userId,
      campaignId: record.campaignId,
      campaignTitle: record.campaignTitle,
      amount: record.amount,
      transactionId: record.transactionId,
      date: record.date
    }]);
  },

  addRecentCampaign: async (userId: string, campaignId: string) => {
    try {
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
    } catch (e) {
      console.warn('Could not update recently viewed:', e);
    }
  }
};
