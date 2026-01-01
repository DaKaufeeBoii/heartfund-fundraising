

import React, { useState, useRef } from 'react';
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
  const [description, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [category, setCategory] = useState('');
  const [endDate, setEndDate] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Simulation: Converting files to object URLs for immediate preview
      // In a real Supabase app, we'd upload these to a Storage Bucket
      // Fix: Explicitly cast file to File as it might be inferred as unknown in some environments
      const newUrls = Array.from(files).map(file => URL.createObjectURL(file as File));
      setImageUrls(prev => [...prev, ...newUrls].slice(0, 5)); // Limit to 5 images
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
        // If no images uploaded, add a few random placeholders so it doesn't look empty
        const finalImages = imageUrls.length > 0 
          ? imageUrls 
          : [`https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?w=800&h=500&fit=crop`];

        const newCampaign = {
            id: String(Date.now()),
            title,
            description,
            longDescription,
            goalAmount: parseInt(goalAmount),
            category,
            endDate,
            creator: user.name,
            // Track the owner's ID for donation restrictions
            creatorId: user.id,
            creatorAvatar: user.avatar,
            imageUrls: finalImages,
            currentAmount: 0,
            donors: 0,
        };
        addCampaign(newCampaign);
        navigate(`/campaign/${newCampaign.id}`);
    }
  };

  return (
    <Container className="py-12">
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-3xl shadow-2xl border border-gray-100">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-neutral tracking-tight">Start Your Fundraiser</h1>
          <p className="mt-3 text-gray-500 font-medium">Be the change you want to see. Authentic stories win hearts.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary border-b pb-2">Basic Information</h3>
            <InputField id="title" label="What are you raising funds for?" placeholder="e.g. Surgery for Little Timmy" value={title} onChange={e => setTitle(e.target.value)} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="goal" label="Goal Amount ($)" type="number" placeholder="5000" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} required />
              <InputField id="category" label="Campaign Category" placeholder="Health, Arts, Community..." value={category} onChange={e => setCategory(e.target.value)} required />
            </div>
            <InputField id="endDate" label="When should the campaign end?" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary border-b pb-2">The Story</h3>
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Catchy Summary (100 chars)</label>
              <textarea id="description" placeholder="A brief hook to interest donors..." value={description} onChange={e => setShortDescription(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required></textarea>
            </div>
             <div>
              <label htmlFor="longDescription" className="block text-sm font-bold text-gray-700 mb-1">Tell the full story</label>
              <textarea id="longDescription" placeholder="Detail the situation, the impact, and exactly how the funds will be used..." value={longDescription} onChange={e => setLongDescription(e.target.value)} rows={8} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required></textarea>
            </div>
          </div>

          {/* Evidence Upload Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary border-b pb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Verification & Evidence
            </h3>
            <p className="text-sm text-gray-500">Donors are 80% more likely to contribute if they see real proof. Upload photos of the person, location, or official documents.</p>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center hover:border-primary hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                multiple 
                accept="image/*" 
              />
              <div className="bg-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
              </div>
              <p className="font-bold text-neutral">Click to upload evidence photos</p>
              <p className="text-xs text-gray-400 mt-1">Up to 5 high-quality images (JPG, PNG)</p>
            </div>

            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={url} alt="Proof preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-8">
            <Button type="submit" variant="secondary" size="lg" className="w-full py-5 text-xl shadow-2xl shadow-red-100">
              Launch Campaign Now
            </Button>
            <p className="text-center text-xs text-gray-400 mt-4 italic">
              By clicking "Launch", you agree that all provided evidence is true and genuine.
            </p>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default CreateCampaignPage;