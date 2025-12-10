import React, { createContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { Campaign } from '../types';
import { storage } from '../services/storage';

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Campaign) => void;
  updateDonation: (campaignId: string, amount: number) => void;
  getCampaignById: (id: string) => Campaign | undefined;
}

export const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Load campaigns from storage
  useEffect(() => {
    setCampaigns(storage.getCampaigns());
  }, []);

  const addCampaign = useCallback((campaign: Campaign) => {
    storage.saveCampaign(campaign);
    setCampaigns(storage.getCampaigns()); // Refresh from storage
  }, []);

  const updateDonation = useCallback((campaignId: string, amount: number) => {
    storage.updateDonation(campaignId, amount);
    setCampaigns(storage.getCampaigns()); // Refresh from storage
  }, []);
  
  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  const campaignValue = useMemo(() => ({
    campaigns,
    addCampaign,
    updateDonation,
    getCampaignById
  }), [campaigns, addCampaign, updateDonation, getCampaignById]);

  return (
    <CampaignContext.Provider value={campaignValue}>
      {children}
    </CampaignContext.Provider>
  );
};
