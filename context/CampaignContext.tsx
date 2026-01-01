
import React, { createContext, useState, ReactNode, useMemo, useCallback, useEffect } from 'react';
import type { Campaign } from '../types';
import { storage } from '../services/storage';

interface CampaignContextType {
  campaigns: Campaign[];
  isLoading: boolean;
  addCampaign: (campaign: Campaign) => Promise<void>;
  updateDonation: (campaignId: string, amount: number) => Promise<void>;
  getCampaignById: (id: string) => Campaign | undefined;
}

export const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

interface CampaignProviderProps {
  children: ReactNode;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCampaigns = async () => {
    setIsLoading(true);
    const data = await storage.getCampaigns();
    setCampaigns(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const addCampaign = useCallback(async (campaign: Campaign) => {
    await storage.saveCampaign(campaign);
    await loadCampaigns();
  }, []);

  const updateDonation = useCallback(async (campaignId: string, amount: number) => {
    await storage.updateDonation(campaignId, amount);
    await loadCampaigns();
  }, []);
  
  const getCampaignById = useCallback((id: string) => {
    return campaigns.find(c => c.id === id);
  }, [campaigns]);

  const campaignValue = useMemo(() => ({
    campaigns,
    isLoading,
    addCampaign,
    updateDonation,
    getCampaignById
  }), [campaigns, isLoading, addCampaign, updateDonation, getCampaignById]);

  return (
    <CampaignContext.Provider value={campaignValue}>
      {children}
    </CampaignContext.Provider>
  );
};
