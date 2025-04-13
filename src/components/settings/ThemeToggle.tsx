import React from 'react';

const ThemeToggle: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="flex items-center space-x-2">
      <span>Dark Mode:</span>
      <label className="inline-block relative p-1 cursor-pointer">
        <input
          type="checkbox"
          checked={isDarkMode}
          onChange={handleToggle}
          className="sr-only peer"
        />
        <div className="slider peer-checked:bg-gray-600 rounded-full"></div>
      </label>
    </div>
  );
};

export default ThemeToggle;