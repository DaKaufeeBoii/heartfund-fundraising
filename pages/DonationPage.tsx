import React, { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';

const DonationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCampaignById, updateDonation } = useCampaigns();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [isDonated, setIsDonated] = useState(false);

  if (!id) {
    return <Navigate to="/browse" />;
  }

  const campaign = getCampaignById(id);

  if (!campaign) {
    return (
      <Container className="py-20 text-center">
        <h1 className="text-3xl font-bold">Campaign not found</h1>
        <p className="mt-4">The campaign you are looking for does not exist.</p>
        <Link to="/browse" className="mt-6 inline-block">
            <Button variant="primary">Back to Campaigns</Button>
        </Link>
      </Container>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = parseInt(amount);
    if (!isNaN(donationAmount) && donationAmount > 0) {
      updateDonation(campaign.id, donationAmount);
      setIsDonated(true);
    }
  };

  if (isDonated) {
    return (
        <Container className="py-20 text-center">
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-xl">
                <h1 className="text-3xl font-extrabold text-green-600 mb-4">Thank You!</h1>
                <p className="text-lg text-gray-700 mb-6">Your generous donation of ₹{amount} to "{campaign.title}" is greatly appreciated.</p>
                <Button onClick={() => navigate(`/campaign/${campaign.id}`)} variant="primary">
                    Back to Campaign
                </Button>
            </div>
        </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-20">
      <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-xl border border-gray-200">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-neutral tracking-tight">Support "{campaign.title}"</h1>
            <p className="mt-2 text-md text-gray-600">by {campaign.creator}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <InputField 
                id="donationAmount" 
                label="Donation Amount (₹)" 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
                min="1"
                placeholder="Enter amount"
            />
            <Button type="submit" variant="secondary" size="lg" className="w-full">
                Donate ₹{amount || '0'}
            </Button>
        </form>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Your contribution will directly support this cause. HeartFund ensures your donation gets to where it's needed most.
        </p>
      </div>
    </Container>
  );
};

export default DonationPage;