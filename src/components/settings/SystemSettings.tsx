import React, { useState } from 'react';
import Button from "../common/Button";

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
    { label: "Username", type: "text", name: "username", defaultValue: "" },
    { label: "Email Address", type: "email", name: "email", defaultValue: "" },
    { label: "Password", type: "password", name: "password", defaultValue: "" },
    { label: "Confirm Password", type: "password", name: "confirmPassword", defaultValue: "" },
    { label: "First Name", type: "text", name: "firstName", defaultValue: "" },
    { label: "Last Name", type: "text", name: "lastName", defaultValue: "" },
    { label: "Language", type: "select", name: "language", defaultValue: "English" },
    { label: "Time Zone", type: "select", name: "timeZone", defaultValue: "(UTC-05:00)" },
    { label: "Notification Preferences", type: "checkbox", name: "notifications" }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically call an API or update state
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">System Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field, index) => (
          <div key={index} className="mb-4">
            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.type === "select" ? (
              <select
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(5)].map((_, i) => (
                  <option key={i} value={field.defaultValue}>
                    {field.defaultValue}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={formData[field.name]}
                onChange={(e) => handleInputChange(e)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={field.placeholder || ""}
              />
            )}
          </div>
        ))}

        <Button type="submit" variant="primary">
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default SystemSettings;