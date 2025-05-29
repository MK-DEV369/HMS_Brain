import React, { useState } from 'react';
import Button from '../common/Button';

interface FormField {
  label: string;
  type: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
}

const SystemSettings: React.FC = () => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const formFields: FormField[] = [
    { label: 'Username', type: 'text', name: 'username', defaultValue: '', placeholder: 'Enter username' },
    { label: 'Email Address', type: 'email', name: 'email', defaultValue: '', placeholder: 'Enter email' },
    { label: 'Password', type: 'password', name: 'password', defaultValue: '', placeholder: 'Enter password' },
    {
      label: 'Confirm Password',
      type: 'password',
      name: 'confirmPassword',
      defaultValue: '',
      placeholder: 'Confirm password',
    },
    { label: 'First Name', type: 'text', name: 'firstName', defaultValue: '', placeholder: 'Enter first name' },
    { label: 'Last Name', type: 'text', name: 'lastName', defaultValue: '', placeholder: 'Enter last name' },
    { label: 'Language', type: 'select', name: 'language', defaultValue: 'English' },
    { label: 'Time Zone', type: 'select', name: 'timeZone', defaultValue: '(UTC-05:00)' },
    { label: 'Notification Preferences', type: 'checkbox', name: 'notifications' },
  ];

  const languageOptions = ['English', 'Spanish', 'French', 'German', 'Chinese'];
  const timeZoneOptions = [
    '(UTC-05:00)',
    '(UTC+00:00)',
    '(UTC+01:00)',
    '(UTC+08:00)',
    '(UTC-08:00)',
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field, index) => (
          <div key={index} className="mb-4">
            <label
              htmlFor={field.name}
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {field.label}
            </label>
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name] || field.defaultValue}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                {field.name === 'language'
                  ? languageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))
                  : timeZoneOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                checked={!!formData[field.name]}
                onChange={handleInputChange}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 transition-all duration-200"
              />
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name] || ''}
                onChange={handleInputChange}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            )}
          </div>
        ))}
        <Button
          type="submit"
          variant="primary"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-md"
        >
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default SystemSettings;