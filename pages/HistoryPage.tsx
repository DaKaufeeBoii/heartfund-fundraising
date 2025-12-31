
import React, { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCampaigns } from '../hooks/useCampaigns';
import { storage } from '../services/storage';
import Container from '../components/Container';
import CampaignCard from '../components/CampaignCard';

const HistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { getCampaignById } = useCampaigns();

  const history = useMemo(() => {
    return user ? storage.getUserHistory(user.id) : { donations: [], recentlyViewedIds: [] };
  }, [user]);

  const recentlyViewed = useMemo(() => {
    return history.recentlyViewedIds
      .map(id => getCampaignById(id))
      .filter((c): c is any => !!c);
  }, [history.recentlyViewedIds, getCampaignById]);

  const totalDonated = useMemo(() => {
    return history.donations.reduce((sum, d) => sum + d.amount, 0);
  }, [history.donations]);

  if (!user) return null;

  return (
    <Container className="py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-neutral tracking-tight">My Impact Dashboard</h1>
        <p className="mt-2 text-lg text-gray-600">Track your journey with HeartFund causes.</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-primary text-white p-6 rounded-xl shadow-lg transform transition hover:scale-105">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Total Donated</p>
          <p className="text-3xl font-bold mt-1">${totalDonated.toLocaleString()}</p>
        </div>
        <div className="bg-secondary text-white p-6 rounded-xl shadow-lg transform transition hover:scale-105">
          <p className="text-red-200 text-sm font-semibold uppercase tracking-wider">Causes Supported</p>
          <p className="text-3xl font-bold mt-1">{history.donations.length}</p>
        </div>
        <div className="bg-accent text-neutral p-6 rounded-xl shadow-lg transform transition hover:scale-105">
          <p className="text-amber-800 text-sm font-semibold uppercase tracking-wider">Recently Viewed</p>
          <p className="text-3xl font-bold mt-1">{recentlyViewed.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Payment History List */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-neutral mb-6">Payment History</h2>
          {history.donations.length > 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-100">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.donations.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(d.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-primary">
                        {d.campaignTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-neutral">
                        ${d.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-10 text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-500">You haven't made any donations yet.</p>
            </div>
          )}
        </div>

        {/* Recently Viewed Sidebar */}
        <div>
          <h2 className="text-2xl font-bold text-neutral mb-6">Recently Viewed</h2>
          <div className="space-y-6">
            {recentlyViewed.length > 0 ? (
              recentlyViewed.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))
            ) : (
              <p className="text-gray-500 italic">No recently viewed campaigns.</p>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

export default HistoryPage;
