import React, { useState } from 'react';
import { UserCircleIcon } from 'lucide-react';
import Button from '../common/Button';

interface UserProfileProps {
  username?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ username, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState<string | undefined>(username);

  const handleEditClick = () => {
    setIsEditing(true);
    setNewUsername(username);
    if (onEdit) onEdit();
  };

  const handleSaveEdit = () => {
    if (newUsername && newUsername.trim() !== '') {
      console.log(`Username updated to: ${newUsername}`);
      setIsEditing(false);
    } else {
      console.log('Username cannot be empty');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUsername(username);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUsername(e.target.value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
      <div
        className={`flex items-center space-x-2 transition-all duration-300 ${
          isEditing ? 'bg-gray-100 p-2 rounded-lg' : ''
        }`}
      >
        <UserCircleIcon className="h-6 w-6 text-gray-600" />
        {isEditing ? (
          <input
            type="text"
            value={newUsername || ''}
            onChange={handleUsernameChange}
            className="px-3 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            placeholder="New username"
          />
        ) : (
          <span className="text-gray-800 font-medium">{username || 'Guest'}</span>
        )}
      </div>
      <div className="flex space-x-2">
        {isEditing ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
            >
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelEdit}
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditClick}
              className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-100 text-red-700 border border-red-300 rounded-lg hover:bg-red-200 transition-all duration-300 transform hover:scale-105"
            >
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfile;