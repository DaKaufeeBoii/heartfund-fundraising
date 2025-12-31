
import React, { createContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { Campaign } from '../types';
import { supabase } from '../services/supabase';

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, 'id' | 'currentAmount' | 'donors'>) => Promise<boolean>;
  updateDonation: (campaignId: string, amount: number) => Promise<boolean>;
  getCampaignById: (id: string) => Campaign | undefined;
}

export const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export const CampaignProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  const fetchCampaigns = useCallback(async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      setCampaigns(data);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const addCampaign = async (campaignData: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from('campaigns').insert([
      { ...campaignData, creator_id: user.id }
    ]);

    if (!error) {
      fetchCampaigns();
      return true;
    }
    return false;
  };

  const updateDonation = async (campaignId: string, amount: number) => {
    // In a real Supabase app, we'd use an RPC or transaction
    // For this example, we'll increment currentAmount and donors_count
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return false;

    const { error } = await supabase
      .from('campaigns')
      .update({ 
        currentAmount: (campaign.currentAmount || 0) + amount, 
        donors: (campaign.donors || 0) + 1 
      })
      .eq('id', campaignId);

    if (!error) {
      fetchCampaigns();
      return true;
    }
    return false;
  };
  
  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  const campaignValue = useMemo(() => ({
    campaigns,
    addCampaign,
    updateDonation,
    getCampaignById
  }), [campaigns, fetchCampaigns]);

  return (
    <CampaignContext.Provider value={campaignValue}>
      {children}
    </CampaignContext.Provider>
  );
};
