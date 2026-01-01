
import React from 'react';
import { Link } from 'react-router-dom';
import Container from './Container';
import { HeartIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral text-white mt-12">
      <Container className="py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <HeartIcon className="h-7 w-7 text-secondary" />
              <span className="text-xl font-bold">HeartFund</span>
            </div>
            <p className="text-gray-400 text-sm max-w-sm">
              Your compassion in action. Join a community of changemakers supporting causes that matter.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/browse" className="hover:text-white transition-colors">Browse Campaigns</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/create" className="hover:text-white transition-colors">Start a Fundraiser</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Socials</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} HeartFund. All rights reserved.</p>
          <div className="flex space-x-6 text-xs text-gray-500">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
