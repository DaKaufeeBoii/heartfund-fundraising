
import React from 'react';
import Container from './Container';
import { HeartIcon } from './Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-neutral text-white mt-12">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2">
            <HeartIcon className="h-7 w-7 text-secondary" />
            <span className="text-xl font-bold">HeartFund</span>
          </div>
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} HeartFund. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
