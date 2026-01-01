
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
    <Link to={`/campaign/${id}`} className="block group">
      <div className={`bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 h-full flex flex-col ${isExpired ? 'opacity-90 grayscale-[0.3]' : ''}`}>
        <div className="relative overflow-hidden aspect-[16/10]">
          <img 
            src={mainImage} 
            alt={title} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
           <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">{category}</span>
           
           {isExpired && (
             <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-4">
                <div className="bg-secondary text-white text-xs font-black uppercase tracking-widest px-3 py-2 rounded shadow-xl border border-white/20">
                  Donations Closed
                </div>
             </div>
           )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-neutral group-hover:text-primary transition-colors duration-200 line-clamp-1">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 mb-4 flex-grow line-clamp-2">{description}</p>
          
          <div className="mt-auto">
            <ProgressBar current={currentAmount} goal={goalAmount} />
            <div className="flex justify-between items-center mt-2 text-sm">
              <p className="font-semibold text-primary">
                ${currentAmount.toLocaleString()} <span className="font-normal text-gray-500 text-xs">raised</span>
              </p>
              <p className="font-semibold text-neutral">{percentage}%</p>
            </div>
             <p className="text-[11px] text-gray-400 mt-2 italic">by {creator}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
