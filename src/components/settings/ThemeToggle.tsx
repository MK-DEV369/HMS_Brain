import React, { useState } from 'react';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode);
    // Optionally apply dark mode to the document
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm font-medium text-gray-700">Dark Mode</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={handleToggle}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-all duration-300`}
        >
          <div
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-all duration-300 ${
              isDarkMode ? 'translate-x-5' : 'translate-x-0'
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default ThemeToggle;