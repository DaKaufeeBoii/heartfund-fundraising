
import React, { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useCampaigns } from '../hooks/useCampaigns';
import { useAuth } from '../hooks/useAuth';
import { storage } from '../services/storage';
import Container from '../components/Container';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { HeartIcon } from '../components/Icons';

const DonationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getCampaignById, updateDonation } = useCampaigns();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [isDonated, setIsDonated] = useState(false);
  const [showPaypal, setShowPaypal] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState('');
  const [simulationMsg, setSimulationMsg] = useState<{ type: 'error' | 'info' | 'warning', text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const campaign = id ? getCampaignById(id) : undefined;
  const isExpired = campaign ? new Date(campaign.endDate) < new Date() : false;

  if (!id) return <Navigate to="/browse" />;
  
  // Strict redirect if discontinued
  if (isExpired) {
    console.error(`[BLOCK] Blocked donation attempt on discontinued campaign ID: ${id}`);
    return <Navigate to={`/campaign/${id}`} />;
  }

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

  // SELF-DONATION GUARD
  if (user && campaign.creatorId === user.id) {
    return (
      <Container className="py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-red-100">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-2xl font-black text-neutral mb-2">Self-Donation Restricted</h1>
            <p className="text-gray-500 mb-8 font-medium">For security and integrity reasons, you cannot donate to a campaign you created.</p>
            <Button onClick={() => navigate(`/campaign/${campaign.id}`)} variant="primary" className="w-full">
                Return to Campaign
            </Button>
        </div>
      </Container>
    );
  }

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = parseFloat(amount);
    if (!isNaN(donationAmount) && donationAmount > 0) {
      setShowPaypal(true);
      setSimulationMsg(null);
    }
  };

  const finalizeDonation = async (transactionId: string) => {
    setIsProcessing(true);
    const donationAmount = parseFloat(amount) || 0;
    
    await updateDonation(campaign.id, donationAmount);
    setLastTransactionId(transactionId);
    
    if (user) {
      await storage.addDonationToHistory(user.id, {
        id: `donate-${Date.now()}`,
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        amount: donationAmount,
        date: new Date().toISOString(),
        transactionId: transactionId
      });
    }
    
    setTimeout(() => {
        setIsProcessing(false);
        setIsDonated(true);
    }, 1500);
  };

  const simulateScenario = (scenario: string) => {
    setSimulationMsg(null);
    setIsProcessing(true);
    
    // Simulate API network latency
    const latency = Math.floor(Math.random() * 800) + 1000;

    setTimeout(() => {
      setIsProcessing(false);
      switch(scenario) {
        case 'success':
          finalizeDonation(`SIM-TX-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
          break;
        case 'insufficient':
          setSimulationMsg({ type: 'error', text: 'Payment Rejected: Insufficient balance on the providing account.' });
          break;
        case 'timeout':
          setSimulationMsg({ type: 'error', text: 'Gateway Timeout: The credit card processor failed to authorize in time.' });
          break;
        case '3ds':
          setSimulationMsg({ type: 'warning', text: 'Verification Pending: Your bank requires 3D Secure 2.0 confirmation. Check your mobile app.' });
          break;
        case 'blocked':
          setSimulationMsg({ type: 'error', text: 'Card Blocked: This transaction was flagged as high-risk/fraudulent by your bank.' });
          break;
        case 'network':
          setSimulationMsg({ type: 'error', text: 'ERR_CONNECTION_RESET: A network error occurred while communicating with the server.' });
          break;
      }
    }, latency);
  };

  if (isDonated) {
    return (
        <Container className="py-20">
            <div className="max-w-xl mx-auto space-y-8">
              <div className="text-center">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h1 className="text-4xl font-black text-neutral mb-2 text-primary">Contribution Received</h1>
                  <p className="text-lg text-gray-600 font-medium">Your generosity has been logged and verified.</p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-[100px]"></div>
                <div className="flex items-center space-x-3 mb-10 border-b border-dashed border-gray-200 pb-8">
                  <HeartIcon className="h-10 w-10 text-secondary" />
                  <div>
                    <h2 className="text-2xl font-black text-primary tracking-tighter">HeartFund</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction Verified</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Beneficiary</span><span className="font-black text-primary">{campaign.title}</span></div>
                  <div className="flex justify-between items-center"><span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Reference ID</span><span className="font-mono text-xs text-gray-500">{lastTransactionId}</span></div>
                  <div className="flex justify-between items-end pt-8 border-t border-gray-100">
                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-1">Total Gifted</span>
                    <span className="text-5xl font-black text-secondary">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <Button onClick={() => navigate(`/campaign/${campaign.id}`)} variant="secondary" className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-red-100">Return to Campaign</Button>
                <Link to="/history" className="text-center text-sm font-bold text-primary hover:underline">View in My Impact History →</Link>
              </div>
            </div>
        </Container>
    );
  }

  return (
    <Container className="py-12 sm:py-20">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
          <div className="text-center mb-10">
              <h1 className="text-3xl font-black text-neutral tracking-tight">Checkout</h1>
              <p className="text-gray-500 font-medium">Supporting "{campaign.title}"</p>
          </div>

          {isProcessing && (
            <div className="mb-8 p-5 bg-primary/5 text-primary rounded-2xl flex items-center gap-4 border border-primary/10 shadow-inner">
               <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span className="font-black text-sm uppercase tracking-widest">Validating with Bank Tier...</span>
            </div>
          )}

          {simulationMsg && (
            <div className={`mb-8 p-5 rounded-2xl text-sm font-bold border-2 animate-in fade-in slide-in-from-top-2 ${
              simulationMsg.type === 'error' ? 'bg-red-50 text-red-700 border-red-100' : 
              simulationMsg.type === 'warning' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
              'bg-blue-50 text-blue-700 border-blue-100'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="uppercase text-[10px] tracking-widest">System Message</span>
              </div>
              {simulationMsg.text}
            </div>
          )}

          {!showPaypal ? (
              <form onSubmit={handleProceed} className="space-y-8">
                  <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                    <InputField id="donationAmount" label="Pledge Amount ($)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" placeholder="0.00" className="text-2xl font-black p-4 h-16" />
                  </div>
                  <Button type="submit" variant="secondary" size="lg" className="w-full py-5 text-xl rounded-2xl shadow-xl shadow-red-100">Proceed to Payment</Button>
              </form>
          ) : (
              <div className="space-y-8">
                  <div className="p-8 bg-neutral text-white rounded-[2rem] border-4 border-accent shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-.39-.08-.77-.21-1.12-.39-1.34-.73-1.89-1.63-2.02-2.7h2.18c.09.43.33.86.82 1.13.43.24.89.36 1.35.36.46 0 .91-.12 1.34-.36.49-.27.73-.7.82-1.13.09-.43-.09-.85-.54-1.11-.45-.25-.97-.48-1.57-.69-.6-.21-1.2-.44-1.81-.69-.61-.25-1.17-.58-1.68-.99-.51-.41-.9-1.02-1.17-1.83-.27-.81-.12-1.83.45-2.7s1.42-1.42 2.55-1.66V4h2.82v1.91c.39.08.77.21 1.12.39 1.34.73 1.89 1.63 2.02 2.7h-2.18c-.09-.43-.33-.86-.82-1.13-.43-.24-.89-.36-1.35-.36-.46 0-.91.12-1.34.36-.49.27-.73.7-.82 1.13-.09.43.09.85.54 1.11.45.25.97.48 1.57.69.6.21 1.2.44 1.81.69.61.25 1.17.58 1.68.99.51.41.9 1.02 1.17 1.83.27.81.12 1.83-.45 2.7-1.42 1.28-2.55 1.42-2.55 1.42z" /></svg>
                    </div>
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] text-accent block mb-2">Authenticated Total</span>
                    <span className="text-6xl font-black tracking-tighter">${amount}</span>
                  </div>

                  <div className="border-4 border-dashed border-gray-100 p-8 rounded-[2rem] bg-gray-50/50">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 text-center">Dev / QA Sandbox Terminal</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => simulateScenario('success')} disabled={isProcessing} className="py-4 px-4 bg-green-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100 active:scale-95">
                        Confirm Success
                      </button>
                      <button onClick={() => simulateScenario('insufficient')} disabled={isProcessing} className="py-4 px-4 bg-white text-red-600 border-2 border-red-100 rounded-2xl font-black uppercase text-xs hover:bg-red-50 transition-all active:scale-95">
                        Insuff. Balance
                      </button>
                      <button onClick={() => simulateScenario('timeout')} disabled={isProcessing} className="py-4 px-4 bg-white text-gray-800 border-2 border-gray-200 rounded-2xl font-black uppercase text-xs hover:bg-gray-100 transition-all active:scale-95">
                        Test Timeout
                      </button>
                      <button onClick={() => simulateScenario('3ds')} disabled={isProcessing} className="py-4 px-4 bg-accent text-neutral rounded-2xl font-black uppercase text-xs hover:shadow-xl transition-all active:scale-95">
                        3D Secure 2.0
                      </button>
                      <button onClick={() => simulateScenario('blocked')} disabled={isProcessing} className="py-4 px-4 bg-red-100 text-red-800 rounded-2xl font-black uppercase text-xs hover:bg-red-200 transition-all active:scale-95">
                        Fraud Flag
                      </button>
                      <button onClick={() => simulateScenario('network')} disabled={isProcessing} className="py-4 px-4 bg-white text-gray-400 border-2 border-gray-100 rounded-2xl font-black uppercase text-xs hover:text-gray-600 transition-all active:scale-95">
                        ISP Latency Err
                      </button>
                    </div>
                  </div>

                  <button onClick={() => setShowPaypal(false)} className="text-sm text-gray-400 hover:text-gray-800 w-full text-center font-black tracking-tighter uppercase p-2">
                      ← Abandon Session / Change Amount
                  </button>
              </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default DonationPage;
