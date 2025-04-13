import React from 'react';
import SystemSettings from '../components/settings/SystemSettings';
import ThemeToggle from '../components/settings/ThemeToggle';
import UserProfile from '../components/settings/UserProfile';

const Settings: React.FC = () => {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Settings</h1>
            <div style={{ marginBottom: '20px' }}>
                <SystemSettings />
            </div>
            <div style={{ marginBottom: '20px' }}>
                <ThemeToggle />
            </div>
            <div>
                <UserProfile />
            </div>
        </div>
    );
};

export default Settings;