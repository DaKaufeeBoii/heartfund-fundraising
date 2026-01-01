
import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Container from './Container';
import Button from './Button';
import { HeartIcon, MenuIcon, CloseIcon } from './Icons';

const Header: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClasses = "text-gray-600 hover:text-primary transition-colors duration-200 px-3 py-2 rounded-md text-sm font-medium";
  const activeNavLinkClasses = "text-primary bg-blue-100";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? `${navLinkClasses} ${activeNavLinkClasses}` : navLinkClasses;

  const mobileMenu = (
    <div className="md:hidden bg-white shadow-lg absolute top-16 right-0 left-0 z-20">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <NavLink to="/browse" className={getNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Browse Campaigns</NavLink>
        <NavLink to="/about" className={getNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>About Us</NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/history" className={getNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>My History</NavLink>
            <NavLink to="/create" className={getNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Start a Campaign</NavLink>
          </>
        )}
      </div>
      <div className="pt-4 pb-3 border-t border-gray-200">
        {isAuthenticated ? (
          <div className="flex items-center px-5">
            <div className="flex-shrink-0">
              <img className="h-10 w-10 rounded-full" src={user?.avatar} alt="" />
            </div>
            <div className="ml-3">
              <div className="text-base font-medium text-gray-800">{user?.name}</div>
              <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              <button onClick={logout} className="mt-1 text-xs text-secondary font-bold hover:underline">Logout</button>
            </div>
          </div>
        ) : (
          <div className="px-5 flex gap-3">
            <Link to="/login" className="w-full"><Button variant="primary" size="sm" className="w-full">Login</Button></Link>
            <Link to="/register" className="w-full"><Button variant="accent" size="sm" className="w-full">Sign Up</Button></Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-primary">
              <HeartIcon className="h-8 w-8 text-secondary" />
              <span className="text-2xl font-extrabold tracking-tight">HeartFund</span>
            </Link>
            <nav className="hidden md:ml-10 md:flex md:space-x-4">
              <NavLink to="/browse" className={getNavLinkClass}>Browse</NavLink>
              <NavLink to="/about" className={getNavLinkClass}>About Us</NavLink>
              {isAuthenticated && (
                <NavLink to="/history" className={getNavLinkClass}>My History</NavLink>
              )}
            </nav>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/create">
                  <Button variant="secondary" size="sm">Start a Campaign</Button>
                </Link>
                <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
                  <img src={user?.avatar} alt="" className="h-8 w-8 rounded-full border border-gray-200" />
                  <Button onClick={logout} variant="primary" size="sm">Logout</Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"><Button variant="primary" size="sm">Login</Button></Link>
                <Link to="/register"><Button variant="accent" size="sm">Sign Up</Button></Link>
              </>
            )}
          </div>
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>
      </Container>
      {isMobileMenuOpen && mobileMenu}
    </header>
  );
};

export default Header;
