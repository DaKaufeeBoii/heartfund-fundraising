
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
  const isExpired = campaign ? new Date(campaign.enddate) < new Date() : false;

  if (!id) return <Navigate to="/browse" />;
  
  if (isExpired) {
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

  if (user && campaign.creatorid === user.id) {
    return (
      <Container className="py-20 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-red-100">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h1 className="text-2xl font-black text-neutral mb-2">Self-Donation Restricted</h1>
            <p className="text-gray-500 mb-8 font-medium">You cannot donate to a campaign you created.</p>
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
        campaignid: campaign.id,
        campaigntitle: campaign.title,
        amount: donationAmount,
        date: new Date().toISOString(),
        transactionid: transactionId
      });
    }
    
    setTimeout(() => {
        setIsProcessing(false);
        setIsDonated(true);
    }, 1500);
  };

  const handleApprove = async (data: any, actions: any) => {
    try {
        const order = await actions.order.capture();
        finalizeDonation(order.id);
    } catch (err) {
        setSimulationMsg({ type: 'error', text: 'An unexpected error occurred during PayPal capture.' });
    }
  };

  const handleCreateOrder = (data: any, actions: any) => {
      return actions.order.create({
          purchase_units: [{
              description: `HeartFund Donation: ${campaign.title}`.substring(0, 127),
              amount: { value: amount }
          }]
      });
  };

  const simulateScenario = (scenario: string) => {
    setSimulationMsg(null);
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      switch(scenario) {
        case 'success':
          finalizeDonation(`SIM-PAYPAL-${Math.random().toString(36).substr(2, 8).toUpperCase()}`);
          break;
        case 'insufficient':
          setSimulationMsg({ type: 'error', text: 'Transaction Rejected: Insufficient funds.' });
          break;
        case '3ds':
          setSimulationMsg({ type: 'warning', text: 'Action Required: 3D Secure verification needed.' });
          break;
        case 'blocked':
          setSimulationMsg({ type: 'error', text: 'Fraud Alert: Transaction blocked.' });
          break;
      }
    }, 1500);
  };

  const downloadReceipt = () => {
    const content = `
HEARTFUND DONATION RECEIPT
--------------------------
Transaction ID: ${lastTransactionId}
Date: ${new Date().toLocaleString()}
Donor: ${user?.name}
Campaign: ${campaign.title}
Amount: $${parseFloat(amount).toFixed(2)} USD

Thank you for your support.
    `.trim();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${lastTransactionId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isDonated) {
    return (
        <Container className="py-20 animate-in fade-in duration-700">
            <div className="max-w-xl mx-auto space-y-8">
              <div className="text-center">
                  <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h1 className="text-4xl font-black text-neutral mb-2">Donation Complete</h1>
                  <p className="text-lg text-gray-500 font-medium tracking-tight">Thank you for your impact.</p>
              </div>

              <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] border border-gray-100 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-10 border-b border-dashed border-gray-200 pb-8">
                    <HeartIcon className="h-10 w-10 text-secondary" />
                    <h2 className="text-2xl font-black text-primary tracking-tighter">HeartFund</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center"><span className="text-gray-400 font-bold text-[10px] uppercase">Donor</span><span className="font-black text-neutral">{user?.name}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400 font-bold text-[10px] uppercase">Cause</span><span className="font-black text-primary max-w-[200px] text-right">{campaign.title}</span></div>
                    <div className="flex justify-between items-center"><span className="text-gray-400 font-bold text-[10px] uppercase">Reference</span><span className="font-mono text-xs text-gray-500">{lastTransactionId}</span></div>
                    <div className="flex justify-between items-end pt-8 border-t border-gray-100">
                      <span className="text-gray-400 font-bold text-[10px] uppercase">Total Gift</span>
                      <span className="text-5xl font-black text-secondary">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={downloadReceipt} variant="primary" className="py-4 rounded-2xl flex items-center justify-center gap-2">Save as .txt</Button>
                <Button onClick={() => window.print()} variant="accent" className="py-4 rounded-2xl flex items-center justify-center gap-2">Print PDF</Button>
                <Button onClick={() => navigate(`/campaign/${campaign.id}`)} variant="secondary" className="sm:col-span-2 py-5 text-xl rounded-2xl">Return to Campaign</Button>
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
              <h1 className="text-4xl font-black text-neutral tracking-tight">Checkout</h1>
              <p className="text-gray-500 font-medium">Supporting "{campaign.title}"</p>
          </div>

          {isProcessing && (
            <div className="mb-8 p-5 bg-primary/5 text-primary rounded-2xl flex items-center gap-4 border border-primary/10 animate-pulse">
               <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
               <span className="font-black text-xs uppercase tracking-[0.2em]">Processing...</span>
            </div>
          )}

          {!showPaypal ? (
              <form onSubmit={handleProceed} className="space-y-8">
                  <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                    <InputField id="donationAmount" label="Pledge Amount (USD)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required min="1" placeholder="0.00" className="text-2xl font-black h-16 p-6" />
                  </div>
                  <Button type="submit" variant="secondary" size="lg" className="w-full py-5 text-xl rounded-2xl">Next: Choose Payment Method</Button>
              </form>
          ) : (
              <div className="space-y-10">
                  <div className="p-8 bg-neutral text-white rounded-[2rem] border-4 border-accent shadow-2xl flex justify-between items-center">
                    <div>
                      <span className="text-5xl font-black tracking-tighter">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <HeartIcon className="h-12 w-12 text-secondary opacity-50" />
                  </div>

                  <div className="relative z-0 min-h-[150px]">
                    <PayPalScriptProvider options={{ "clientId": "test", "currency": "USD", "intent": "capture" }}>
                      <PayPalButtons 
                        style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" } as any}
                        createOrder={handleCreateOrder}
                        onApprove={handleApprove}
                        disabled={isProcessing}
                      />
                    </PayPalScriptProvider>
                  </div>

                  <div className="border-4 border-dashed border-gray-100 p-8 rounded-[2rem] bg-gray-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => simulateScenario('success')} disabled={isProcessing} className="py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Force Success</button>
                      <button onClick={() => simulateScenario('insufficient')} disabled={isProcessing} className="py-4 bg-white text-red-600 border-2 border-red-100 rounded-2xl font-black text-[10px] uppercase tracking-widest">Insuff. Funds</button>
                    </div>
                  </div>

                  <button onClick={() => setShowPaypal(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-800 w-full text-center p-2">
                      ← Go back
                  </button>
              </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default DonationPage;
