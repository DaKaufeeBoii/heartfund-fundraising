import React from 'react';
import { Link } from 'react-router-dom';
import type { Campaign } from '../types';
import ProgressBar from './ProgressBar';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const { id, title, description, imageUrl, currentAmount, goalAmount, creator, category } = campaign;
  const percentage = Math.round((currentAmount / goalAmount) * 100);

  return (
    <Link to={`/campaign/${id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        <div className="relative">
          <img src={imageUrl} alt={title} className="h-48 w-full object-cover" />
           <span className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full">{category}</span>
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-neutral group-hover:text-primary transition-colors duration-200 truncate">{title}</h3>
          <p className="text-sm text-gray-600 mt-1 mb-4 flex-grow">{description}</p>
          
          <div className="mt-auto">
            <ProgressBar current={currentAmount} goal={goalAmount} />
            <div className="flex justify-between items-center mt-2 text-sm">
              <p className="font-semibold text-primary">
                ₹{currentAmount.toLocaleString()} <span className="font-normal text-gray-500">raised</span>
              </p>
              <p className="font-semibold text-neutral">{percentage}%</p>
            </div>
             <p className="text-xs text-gray-500 mt-2">by {creator}</p>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;