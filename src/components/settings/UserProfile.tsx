import React, { useState } from 'react';
import { UserCircleIcon } from 'lucide-react';
import Button from "../common/Button";

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
  };

  const handleSaveEdit = () => {
    if (newUsername && newUsername.trim() !== '') {
      // Here you would typically update the username in your backend or state
      console.log(`Username updated to: ${newUsername}`);
      setIsEditing(false);
    } else {
      console.log('Username cannot be empty');
    }
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
    <div className="flex items-center space-x-4 cursor-pointer hover:text-blue-500">
      <div className={`flex items-center space-x-2 ${isEditing ? 'bg-gray-100 p-1' : ''}`}>
        <UserCircleIcon className="h-6 w-6" />
        {isEditing ? (
          <input
            type="text"
            value={newUsername || ''}
            onChange={handleUsernameChange}
            className="w-20 text-center"
            placeholder="New username"
          />
        ) : (
          <span>{username || 'Guest'}</span>
        )}
      </div>
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          className="px-2 py-1"
        >
          Edit
        </Button>
      )}
      {onDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDelete}
          className="px-2 py-1"
        >
          Delete
        </Button>
      )}
    </div>
  );
};

export default UserProfile;