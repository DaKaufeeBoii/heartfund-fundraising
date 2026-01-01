
import React, { useState, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCampaigns } from '../hooks/useCampaigns';
import { storage } from '../services/storage';
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
  
  // Track actual File objects for uploading
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  // Track preview URLs for UI
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const selectedFiles = Array.from(files);
      const newFiles = [...imageFiles, ...selectedFiles].slice(0, 5);
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      
      setImageFiles(newFiles);
      setPreviewUrls(newUrls);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    let finalImageUrls: string[] = [];

    try {
      // 1. Upload images to Supabase Storage sequentially
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          setUploadProgress(`Uploading image ${i + 1} of ${imageFiles.length}...`);
          const publicUrl = await storage.uploadImage(imageFiles[i]);
          finalImageUrls.push(publicUrl);
        }
      } else {
        // Fallback placeholder
        finalImageUrls = [`https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?w=800&h=500&fit=crop`];
      }

      setUploadProgress('Finalizing campaign details...');

      // 2. Save campaign record to database
      const newCampaign = {
          id: String(Date.now()),
          title,
          description,
          longDescription,
          goalAmount: parseInt(goalAmount),
          category,
          endDate,
          creator: user.name,
          creatorId: user.id,
          creatorAvatar: user.avatar,
          imageUrls: finalImageUrls,
          currentAmount: 0,
          donors: 0,
      };

      await addCampaign(newCampaign);
      navigate(`/campaign/${newCampaign.id}`);
    } catch (err) {
      console.error('Failed to launch campaign:', err);
      alert('There was an error creating your campaign. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
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
            <InputField id="title" label="What are you raising funds for?" placeholder="e.g. Surgery for Little Timmy" value={title} onChange={e => setTitle(e.target.value)} required disabled={isSubmitting} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField id="goal" label="Goal Amount ($)" type="number" placeholder="5000" value={goalAmount} onChange={e => setGoalAmount(e.target.value)} required disabled={isSubmitting} />
              <InputField id="category" label="Campaign Category" placeholder="Health, Arts, Community..." value={category} onChange={e => setCategory(e.target.value)} required disabled={isSubmitting} />
            </div>
            <InputField id="endDate" label="When should the campaign end?" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required disabled={isSubmitting} />
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary border-b pb-2">The Story</h3>
            <div>
              <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-1">Catchy Summary (100 chars)</label>
              <textarea id="description" placeholder="A brief hook to interest donors..." value={description} onChange={e => setShortDescription(e.target.value)} rows={2} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required disabled={isSubmitting}></textarea>
            </div>
             <div>
              <label htmlFor="longDescription" className="block text-sm font-bold text-gray-700 mb-1">Tell the full story</label>
              <textarea id="longDescription" placeholder="Detail the situation, the impact, and exactly how the funds will be used..." value={longDescription} onChange={e => setLongDescription(e.target.value)} rows={8} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" required disabled={isSubmitting}></textarea>
            </div>
          </div>

          {/* Evidence Upload Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-primary border-b pb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Verification & Evidence
            </h3>
            <p className="text-sm text-gray-500">Donors are 80% more likely to contribute if they see real proof. Images are stored securely.</p>
            
            {!isSubmitting && (
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
                <p className="text-xs text-gray-400 mt-1">Up to 5 images (JPG, PNG)</p>
              </div>
            )}

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <img src={url} alt="Proof preview" className="w-full h-full object-cover" />
                    {!isSubmitting && (
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-8">
            <Button 
              type="submit" 
              variant="secondary" 
              size="lg" 
              className="w-full py-5 text-xl shadow-2xl shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {uploadProgress || 'Launching...'}
                </span>
              ) : 'Launch Campaign Now'}
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
