import React from 'react';
import SystemSettings from '../components/settings/SystemSettings';
import ThemeToggle from '../components/settings/ThemeToggle';
import UserProfile from '../components/settings/UserProfile';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-white p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8 animate-fade-in">
          Settings
        </h1>
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up">
            <SystemSettings />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up delay-100">
            <ThemeToggle />
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 animate-slide-up delay-200">
            <UserProfile username="JohnDoe" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;