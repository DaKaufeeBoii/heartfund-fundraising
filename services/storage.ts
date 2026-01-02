
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
      .order('createdat', { ascending: false });

    if (error) {
      console.error('[HEARTFUND] Fetch campaigns error:', error);
      return [];
    }
    return data as Campaign[];
  },

  /**
   * Saves a new campaign. 
   * CRITICAL: The 'id' column must have a DEFAULT (gen_random_uuid()) in the DB.
   */
  saveCampaign: async (campaign: Omit<Campaign, 'id'>): Promise<Campaign> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('You must be logged in to create a campaign.');
    }

    // Explicitly mapping payload to ensure NO 'id' is sent.
    // This allows the database's DEFAULT gen_random_uuid() to kick in.
    const payload = {
      title: campaign.title,
      description: campaign.description,
      longdescription: campaign.longdescription,
      goalamount: campaign.goalamount,
      category: campaign.category,
      enddate: campaign.enddate,
      creator: campaign.creator,
      creatoravatar: campaign.creatoravatar,
      imageurls: campaign.imageurls,
      currentamount: 0,
      donors: 0,
      creatorid: session.user.id, 
      createdat: new Date().toISOString()
    };

    console.log('[HEARTFUND] Attempting DB Insert with payload:', payload);

    const { data, error } = await supabase
      .from('campaigns')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[HEARTFUND DATABASE ERROR]', error);
      
      // Specific handling for the "null value in column id" error
      if (error.message.includes('null value in column "id"')) {
        throw new Error('Database Configuration Error: The "id" column is not auto-generating. Please run: ALTER TABLE campaigns ALTER COLUMN id SET DEFAULT gen_random_uuid();');
      }

      if (error.message.includes('column') && error.message.includes('not exist')) {
        throw new Error(`Schema Mismatch: ${error.message}. Ensure all table columns are lowercase.`);
      }
      
      if (error.code === '42501') {
        throw new Error('Security Policy (RLS) Error: You do not have permission to insert into this table.');
      }

      throw error;
    }

    console.log('[HEARTFUND] Campaign successfully launched with ID:', data.id);
    return data as Campaign;
  },

  updateDonation: async (campaignId: string, amount: number) => {
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('currentamount, donors')
      .eq('id', campaignId)
      .single();

    if (fetchError) {
      console.error('[HEARTFUND] Error fetching campaign for update:', fetchError);
      return;
    }

    if (campaign) {
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ 
          currentamount: (campaign.currentamount || 0) + amount,
          donors: (campaign.donors || 0) + 1 
        })
        .eq('id', campaignId);
      
      if (updateError) {
        console.error('[HEARTFUND] Error updating donation amounts:', updateError);
        throw updateError;
      }
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
        throw new Error(`Storage Error: ${uploadError.message}. Ensure the "campaign-images" bucket exists and is public.`);
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
      .select(`*`)
      .order('date', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('[HEARTFUND] Global activity fetch failed:', error.message);
      return [];
    }
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
      .eq('userid', userId)
      .order('date', { ascending: false });

    // Using .maybeSingle() instead of .single() to avoid 406 error for new users
    const { data: profile } = await supabase
      .from('profiles')
      .select('recentlyviewedids')
      .eq('id', userId)
      .maybeSingle();

    return {
      donations: (donations || []) as DonationRecord[],
      recentlyviewedids: profile?.recentlyviewedids || []
    };
  },

  addDonationToHistory: async (userId: string, record: DonationRecord) => {
    const { error } = await supabase.from('donations').insert([{
      userid: userId,
      campaignid: record.campaignid,
      campaigntitle: record.campaigntitle,
      amount: record.amount,
      transactionid: record.transactionid,
      date: record.date
    }]);
    
    if (error) console.error('[HEARTFUND] Failed to record donation history:', error);
  },

  addRecentCampaign: async (userId: string, campaignId: string) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('recentlyviewedids')
        .eq('id', userId)
        .maybeSingle();

      const existingIds = profile?.recentlyviewedids || [];
      const filtered = existingIds.filter((id: string) => id !== campaignId);
      const updatedIds = [campaignId, ...filtered].slice(0, 5);

      if (!profile) {
        // Create the profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({ id: userId, recentlyviewedids: updatedIds });
      } else {
        await supabase
          .from('profiles')
          .update({ recentlyviewedids: updatedIds })
          .eq('id', userId);
      }
    } catch (e) {
      console.debug('[HEARTFUND] Profile updates unavailable');
    }
  }
};
