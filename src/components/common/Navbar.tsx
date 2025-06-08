import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, Activity, FileText, ArrowUpNarrowWide, Menu, X, LogIn, LogOut } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignOutButton } from '@clerk/clerk-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
              <Brain className="h-8 w-8 mr-2" />
            </Link>
            <span className="ml-2 text-lg font-semibold text-gray-900">HMS Brain Activity Monitor</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 items-center">
            <NavItem 
              icon={<Activity />} 
              text="Monitor" 
              active={location.pathname === '/dashboard'}
              to="/dashboard"
            />
            <NavItem 
              icon={<ArrowUpNarrowWide />} 
              text="Analysis" 
              active={location.pathname === '/analysis'}
              to="/analysis"
            />            
            <NavItem 
              icon={<FileText />} 
              text="Reports" 
              active={location.pathname === '/reports'}
              to="/reports"
            />

            <SignedOut>
              <SignInButton mode="modal">
                <span className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                  <LogIn className="h-5 w-5 mr-1" />
                  Sign In
                </span>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <SignOutButton>
                <span className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                  <LogOut className="h-5 w-5 mr-1" />
                  Sign Out
                </span>
              </SignOutButton>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavItem 
              icon={<Activity />} 
              text="Monitor" 
              active={location.pathname === '/dashboard'}
              to="/dashboard"
            />
            <NavItem 
              icon={<ArrowUpNarrowWide />} 
              text="Analysis" 
              active={location.pathname === '/analysis'}
              to="/analysis"
            />
            <NavItem 
              icon={<FileText />} 
              text="Reports" 
              active={location.pathname === '/reports'}
              to="/reports"
            />

            <SignedOut>
              <SignInButton mode="modal">
                <span className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                  <LogIn className="h-5 w-5 mr-1" />
                  Sign In
                </span>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <SignOutButton>
                <span className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer">
                  <LogOut className="h-5 w-5 mr-1" />
                  Sign Out
                </span>
              </SignOutButton>
            </SignedIn>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavItem = ({ icon, text, active = false, to }: { icon: React.ReactNode; text: string; active?: boolean; to: string }) => (
  <Link to={to} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
    active
      ? 'text-blue-600 bg-blue-50'
      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
  }`}>
    {React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5 mr-1' })}
    {text}
  </Link>
);

export default Navbar;