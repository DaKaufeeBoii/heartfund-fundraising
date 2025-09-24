import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCampaigns } from '../hooks/useCampaigns';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';

const CreateCampaignPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { addCampaign } = useCampaigns();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [category, setCategory] = useState('');
  const [endDate, setEndDate] = useState('');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
        const newCampaign = {
            id: String(Date.now()),
            title,
            description,
            longDescription,
            goalAmount: parseInt(goalAmount),
            category,
            endDate,
            creator: user.name,
            creatorAvatar: user.avatar,
            imageUrl: `https://picsum.photos/seed/${Date.now()}/600/400`,
            currentAmount: 0,
            donors: 0,
        };
        addCampaign(newCampaign);
        navigate(`/campaign/${newCampaign.id}`);
    }
  };

  return (
    <Container className="py-12">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-extrabold text-neutral mb-6 text-center">Start Your Campaign</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField id="title" label="Campaign Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required></textarea>
          </div>
           <div>
            <label htmlFor="longDescription" className="block text-sm font-medium text-gray-700 mb-1">Full Story</label>
            <textarea id="longDescription" value={longDescription} onChange={e => setLongDescription(e.target.value)} rows={6} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required></textarea>
          </div>
          <InputField id="goal" label="Goal Amount (₹)" type="number" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} required />
          <InputField id="category" label="Category" value={category} onChange={e => setCategory(e.target.value)} required />
          <InputField id="endDate" label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          <Button type="submit" variant="secondary" size="lg" className="w-full">Launch Campaign</Button>
        </form>
      </div>
    </Container>
  );
};

export default CreateCampaignPage;