
import React from 'react';
import { Link } from 'react-router-dom';
import type { Campaign } from '../types';
import ProgressBar from './ProgressBar';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const { id, title, description, imageUrls, currentAmount, goalAmount, creator, category, endDate } = campaign;
  const percentage = Math.round((currentAmount / goalAmount) * 100);
  const mainImage = imageUrls && imageUrls.length > 0 ? imageUrls[0] : 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb8?w=800';
  
  const isExpired = new Date(endDate) < new Date();

  return (
    <Link to={`/campaign/${id}`} className="block group h-full">
      <div className={`bg-white rounded-3xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] overflow-hidden transform hover:-translate-y-2 transition-all duration-500 h-full flex flex-col border border-gray-100 hover:shadow-2xl hover:shadow-blue-100 ${isExpired ? 'opacity-90 grayscale-[0.3]' : ''}`}>
        <div className="relative overflow-hidden aspect-[16/10]">
          <img 
            src={mainImage} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
           <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">{category}</span>
           
           {isExpired && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                <div className="bg-secondary text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-xl border border-white/20">
                  Fundraising Closed
                </div>
             </div>
           )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-black text-neutral group-hover:text-primary transition-colors duration-200 line-clamp-1 mb-2 leading-tight">{title}</h3>
          <p className="text-sm text-gray-500 font-medium mb-6 flex-grow line-clamp-2 leading-relaxed">{description}</p>
          
          <div className="mt-auto space-y-3">
            <ProgressBar current={currentAmount} goal={goalAmount} />
            <div className="flex justify-between items-end">
              <div>
                <p className="text-lg font-black text-primary leading-none">
                  ${currentAmount.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Raised of ${goalAmount.toLocaleString()}</p>
              </div>
              <p className="text-2xl font-black text-neutral/20 leading-none group-hover:text-accent transition-colors">{percentage}%</p>
            </div>
            
            <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">by {creator}</p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
