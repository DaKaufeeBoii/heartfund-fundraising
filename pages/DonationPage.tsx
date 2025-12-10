import React, { useState } from 'react';
import { useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
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
  const [showPaypal, setShowPaypal] = useState(false);

  const campaign = id ? getCampaignById(id) : undefined;

  if (!id) return <Navigate to="/browse" />;

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

  const handleProceed = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = parseFloat(amount);
    if (!isNaN(donationAmount) && donationAmount > 0) {
      setShowPaypal(true);
    }
  };

  // SUCCESS HANDLER
  const handleApprove = async (data: any, actions: any) => {
    try {
        const order = await actions.order.capture();
        console.log("Order Successful:", order);
        
        const donationAmount = parseInt(amount) || 0;
        updateDonation(campaign.id, donationAmount);
        setIsDonated(true);
    } catch (err) {
        console.error("Capture Error:", err);
        // Suppress alerts for user friendliness on capture failure unless critical
    }
  };

  // CREATE ORDER HANDLER
  const handleCreateOrder = (data: any, actions: any) => {
      return actions.order.create({
          purchase_units: [{
              description: `Donation to ${campaign.title}`.substring(0, 127),
              amount: { value: amount }
          }]
      });
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

        {!showPaypal ? (
            <form onSubmit={handleProceed} className="space-y-6">
                <InputField 
                    id="donationAmount" 
                    label="Donation Amount (USD)" 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                    min="1"
                    placeholder="Enter amount"
                />
                <Button type="submit" variant="secondary" size="lg" className="w-full">
                    Proceed to Payment
                </Button>
            </form>
        ) : (
            // Using "test" Client ID for generic sandbox testing
            <PayPalScriptProvider options={{ 
                "clientId": "test", 
                "currency": "USD",
                "intent": "capture"
            }}>
                <div className="space-y-4">
                     <p className="text-center font-semibold text-lg">Donating: ${amount}</p>
                     
                     <div className="min-h-[150px] relative z-0">
                        <PayPalButtons 
                            style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" } as any}
                            createOrder={handleCreateOrder}
                            onApprove={handleApprove}
                            onError={(err: any) => {
                                // Extract message safely from error object or string
                                const errorString = typeof err === "object" && err !== null && "message" in err 
                                    ? String(err.message) 
                                    : String(err);
                                const msg = errorString.toLowerCase();
                                
                                // Aggressively filter known benign errors from the SDK
                                if (
                                    msg.includes("window host") || 
                                    msg.includes("paypal_js_sdk_v5_unhandled_exception") ||
                                    msg.includes("script error") ||
                                    msg.includes("popup_close") ||
                                    msg.includes("object object")
                                ) {
                                    return;
                                }
                                console.error("PayPal Error:", err);
                            }}
                        />
                     </div>

                     <button 
                        onClick={() => setShowPaypal(false)}
                        className="text-sm text-gray-500 hover:text-gray-700 w-full text-center underline"
                     >
                        Cancel and change amount
                     </button>
                </div>
            </PayPalScriptProvider>
        )}

        <p className="text-xs text-gray-500 mt-6 text-center">
          Secure payment processed by PayPal. Your contribution directly supports this cause.
        </p>
      </div>
    </Container>
  );
};

export default DonationPage;