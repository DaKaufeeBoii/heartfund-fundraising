
import { campaigns, User, DonationRecord, UserHistory } from '../types';
import { supabase } from './supabase';

/**
 * STORAGE SERVICE (Supabase Implementation)
 * This service handles all interactions with the PostgreSQL database and Storage buckets.
 */

export const storage = {
  // --- campaigns QUERIES ---
  
  getcampaignss: async (): Promise<campaigns[]> => {
    const { data, error } = await supabase
      .from('campaignss')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching campaignss:', error);
      return [];
    }
    return data as campaigns[];
  },

  /**
   * Saves a new campaigns. 
   * CRITICAL: 'creatorId' must match auth.uid() for Row Level Security to pass.
   */
  savecampaigns: async (campaigns: Omit<campaigns, 'id'>): Promise<campaigns> => {
    // 1. Double check current session to ensure IDs match
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('You must be logged in to create a campaigns.');
    }

    // Ensure the payload strictly matches what the UI provides and what DB expects.
    // Use "created_at" (camelCase) to match the SQL column we created with quotes.
    const payload = {
      title: campaigns.title,
      description: campaigns.description,
      longDescription: campaigns.longDescription,
      goalAmount: campaigns.goalAmount,
      category: campaigns.category,
      endDate: campaigns.endDate,
      creator: campaigns.creator,
      creator_avatar: campaigns.creator_avatar,
      imageUrls: campaigns.imageUrls,
      currentAmount: 0,
      donors: 0,
      creatorId: session.user.id, 
      created_at: new Date().toISOString()
    };

    console.log('[HEARTFUND] Final Insert Payload:', payload);

    const { data, error } = await supabase
      .from('campaignss')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[HEARTFUND DATABASE ERROR]', error);
      
      // Clear error mapping for common PostgREST schema cache issues
      if (error.message.includes('column "created_at" does not exist') || error.message.includes('created_at')) {
        throw new Error('Database Schema Error: The "created_at" column is missing or incorrectly named. Please run the provided SQL in your Supabase SQL Editor.');
      }
      
      if (error.message.includes('creator_avatar')) {
        throw new Error('Database Schema Error: The "creator_avatar" column is missing.');
      }

      if (error.code === '42501') {
        throw new Error('Security Policy Error: Your RLS policies are blocking this action.');
      }

      throw error;
    }

    console.log('[HEARTFUND] campaigns successfully launched:', data.id);
    return data as campaigns;
  },

  updateDonation: async (campaignsId: string, amount: number) => {
    const { data: campaigns } = await supabase
      .from('campaignss')
      .select('currentAmount, donors')
      .eq('id', campaignsId)
      .single();

    if (campaigns) {
      const { error } = await supabase
        .from('campaignss')
        .update({ 
          currentAmount: (campaigns.currentAmount || 0) + amount,
          donors: (campaigns.donors || 0) + 1 
        })
        .eq('id', campaignsId);
      
      if (error) throw error;
    }
  },

  // --- IMAGE STORAGE ---

  uploadImage: async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `campaignss/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campaigns-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('[HEARTFUND STORAGE ERROR]', uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from('campaigns-images')
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
      campaignsId: record.campaignsId,
      campaignsTitle: record.campaignsTitle,
      amount: record.amount,
      transactionId: record.transactionId,
      date: record.date
    }]);
  },

  addRecentcampaigns: async (userId: string, campaignsId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('recentlyViewedIds')
        .eq('id', userId)
        .single();

      const existingIds = profile?.recentlyViewedIds || [];
      const filtered = existingIds.filter((id: string) => id !== campaignsId);
      const updatedIds = [campaignsId, ...filtered].slice(0, 5);

      await supabase
        .from('profiles')
        .update({ recentlyViewedIds: updatedIds })
        .eq('id', userId);
    } catch (e) {
      console.warn('Could not update recently viewed:', e);
    }
  }
};
