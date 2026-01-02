
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
   */
  saveCampaign: async (campaign: Omit<Campaign, 'id'>): Promise<Campaign> => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('You must be logged in to create a campaign.');
    }

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

    const { data, error } = await supabase
      .from('campaigns')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[HEARTFUND DATABASE ERROR]', error);
      throw error;
    }

    return data as Campaign;
  },

  /**
   * Updates campaign totals.
   */
  updateDonation: async (campaignId: string, amount: number) => {
    // We use a fetch-and-update pattern here. In a production app, 
    // a PostgreSQL RPC (function) with an atomic increment would be better.
    const { data: campaign, error: fetchError } = await supabase
      .from('campaigns')
      .select('currentamount, donors')
      .eq('id', campaignId)
      .maybeSingle(); // Use maybeSingle to avoid 406 error if not found

    if (fetchError) {
      console.error('[HEARTFUND] Error fetching campaign for update:', fetchError);
      throw fetchError;
    }

    if (!campaign) {
      throw new Error(`Campaign with ID ${campaignId} not found in database.`);
    }

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

      if (uploadError) throw uploadError;

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

  /**
   * Manual join to avoid relationship errors.
   */
  getGlobalRecentDonations: async (limit: number = 5): Promise<any[]> => {
    const { data: donations, error: donationError } = await supabase
      .from('donations')
      .select('id, amount, date, campaignid, campaigntitle, userid')
      .order('date', { ascending: false })
      .limit(limit);

    if (donationError) {
      console.error('[HEARTFUND] Fetch donations failed:', donationError);
      return [];
    }

    if (!donations || donations.length === 0) return [];

    const userIds = [...new Set(donations.map(d => d.userid))];
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', userIds);

    if (profileError) {
      console.error('[HEARTFUND] Fetch profiles failed:', profileError);
      return donations.map(d => ({ ...d, donorName: 'Anonymous Donor' }));
    }

    const profileMap = (profiles || []).reduce((acc: any, p: any) => {
      acc[p.id] = p.name;
      return acc;
    }, {});

    return donations.map(d => ({
      ...d,
      donorName: profileMap[d.userid] || 'Anonymous Donor'
    }));
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

  /**
   * Records a donation in the user history.
   */
  addDonationToHistory: async (userId: string, record: Omit<DonationRecord, 'id'>) => {
    // Ensure the profile exists before inserting the donation
    await storage.ensureProfileExists(userId);

    const { error } = await supabase.from('donations').insert([{
      userid: userId,
      campaignid: record.campaignid,
      campaigntitle: record.campaigntitle,
      amount: record.amount,
      transactionid: record.transactionid,
      date: record.date
    }]);
    
    if (error) {
      console.error('[HEARTFUND] Donation history insert failed:', error.message, error.details);
      throw error;
    }
  },

  ensureProfileExists: async (userId: string) => {
    const user = storage.getCurrentUser();
    // Using upsert with id as conflict target to ensure profile exists without throwing error if it does
    const { error } = await supabase.from('profiles').upsert({ 
      id: userId, 
      name: user?.name || 'Anonymous Donor',
    }, { onConflict: 'id' });

    if (error) {
      console.warn('[HEARTFUND] Profile sync warning (non-fatal):', error.message);
    }
  },

  addRecentCampaign: async (userId: string, campaignId: string) => {
    try {
      await storage.ensureProfileExists(userId);
      const { data: profile } = await supabase
        .from('profiles')
        .select('recentlyviewedids')
        .eq('id', userId)
        .maybeSingle();

      const existingIds = profile?.recentlyviewedids || [];
      const filtered = existingIds.filter((id: string) => id !== campaignId);
      const updatedIds = [campaignId, ...filtered].slice(0, 5);

      await supabase
        .from('profiles')
        .update({ recentlyviewedids: updatedIds })
        .eq('id', userId);
    } catch (e) {
      console.debug('[HEARTFUND] Profile updates unavailable');
    }
  }
};
