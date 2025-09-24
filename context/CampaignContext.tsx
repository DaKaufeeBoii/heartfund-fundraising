
import React, { createContext, useState, ReactNode, useMemo, useCallback } from 'react';
import type { Campaign } from '../types';
import { MOCK_CAMPAIGNS } from '../constants';

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
  const [campaigns, setCampaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);

  const addCampaign = useCallback((campaign: Campaign) => {
    setCampaigns(prev => [campaign, ...prev]);
  }, []);

  const updateDonation = useCallback((campaignId: string, amount: number) => {
    setCampaigns(prev =>
      prev.map(c =>
        c.id === campaignId
          ? {
              ...c,
              currentAmount: c.currentAmount + amount,
              donors: c.donors + 1,
            }
          : c
      )
    );
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
