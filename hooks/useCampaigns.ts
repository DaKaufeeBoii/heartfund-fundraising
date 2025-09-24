
import { useContext } from 'react';
import { CampaignContext } from '../context/CampaignContext';

export const useCampaigns = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignProvider');
  }
  return context;
};
