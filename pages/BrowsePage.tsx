
import React, { useState, useMemo } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import CampaignCard from '../components/CampaignCard';
import Container from '../components/Container';

const BrowsePage: React.FC = () => {
  const { campaigns } = useCampaigns();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(campaigns.map(c => c.category))], [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'All' || campaign.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [campaigns, searchTerm, category]);

  return (
    <Container className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-neutral tracking-tight">Explore Campaigns</h1>
        <p className="mt-2 text-lg text-gray-600">Find a cause that speaks to you.</p>
      </div>

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
        <div className="w-full md:w-1/2 lg:w-2/3">
          <input
            type="text"
            placeholder="Search for a campaign..."
            className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-auto">
           <select 
             className="w-full px-4 py-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
             value={category}
             onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
           </select>
        </div>
      </div>
      
      {filteredCampaigns.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
         <div className="text-center py-16">
            <p className="text-xl text-gray-600">No campaigns found. Try a different search!</p>
         </div>
      )}
    </Container>
  );
};

export default BrowsePage;
