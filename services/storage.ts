
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

  saveCampaign: async (campaign: Campaign) => {
    // Ensure the payload matches the database schema
    const { error } = await supabase
      .from('campaigns')
      .insert([{
        ...campaign,
        createdAt: new Date().toISOString()
      }]);

    if (error) {
      console.error('Database Error saving campaign:', error);
      throw error;
    }
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

      console.log(`[HEARTFUND] Attempting upload to bucket 'campaign-images': ${filePath}`);

      // Ensure bucket exists in Supabase Dashboard -> Storage
      const { error: uploadError } = await supabase.storage
        .from('campaign-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('[HEARTFUND STORAGE ERROR]', uploadError);
        // Helpful debugging for the user
        if (uploadError.message.includes('not found')) {
          throw new Error('Storage bucket "campaign-images" not found. Go to Supabase > Storage and create it.');
        }
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('campaign-images')
        .getPublicUrl(filePath);

      if (!urlData.publicUrl) {
        throw new Error('Failed to retrieve public URL for uploaded image.');
      }

      console.log(`[HEARTFUND] Upload successful. Public URL: ${urlData.publicUrl}`);
      return urlData.publicUrl;
    } catch (err: any) {
      console.error('[HEARTFUND] Image upload process failed:', err.message);
      throw err;
    }
  },

  // --- GLOBAL ACTIVITY ---

  getGlobalRecentDonations: async (limit: number = 5): Promise<any[]> => {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        profiles (
          name
        )
      `)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching global donations:', error);
      return [];
    }
    return data || [];
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
