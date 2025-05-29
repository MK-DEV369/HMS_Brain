import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, UserContextType, USER_ROLES } from '../utils/types';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem('hms-user');
        if (storedUser) {
          const userData: User = JSON.parse(storedUser);
          if (userData.token) {
            setCurrentUser(userData);
          } else {
            localStorage.removeItem('hms-user');
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Authentication check failed:', err);
        setError('Failed to authenticate. Please log in again.');
        setCurrentUser(null);
        localStorage.removeItem('hms-user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      if (username && password) {
        const userData: User = {
          id: 'user123',
          username,
          name: username === 'admin' ? 'Admin User' : 'Doctor Smith',
          role: username === 'admin' ? USER_ROLES.ADMIN : USER_ROLES.DOCTOR,
          token: 'mock-jwt-token-' + Date.now(),
          permissions: [],
          profileImage: null
        };

        if (userData.role === USER_ROLES.ADMIN) {
          userData.permissions = ['read', 'write', 'update', 'delete', 'manage_users'];
        } else if (userData.role === USER_ROLES.DOCTOR) {
          userData.permissions = ['read', 'write', 'update'];
        } else {
          userData.permissions = ['read'];
        }

        setCurrentUser(userData);
        localStorage.setItem('hms-user', JSON.stringify(userData));

        return { success: true, user: userData };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please try again.');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('hms-user');
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) {
      setError('You must be logged in to update your profile');
      return { success: false, error: 'Not authenticated' };
    }

    setIsLoading(true);

    try {
      const updatedUser = {
        ...currentUser,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      setCurrentUser(updatedUser);
      localStorage.setItem('hms-user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err: any) {
      console.error('Profile update failed:', err);
      setError(err.message || 'Failed to update profile');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = (permission: string) => {
    if (!currentUser || !currentUser.permissions) return false;
    return currentUser.permissions.includes(permission);
  };

  const hasRole = (role: string) => {
    if (!currentUser) return false;
    return currentUser.role === role;
  };

  const getPatientAccess = () => {
    if (!currentUser) return [];
    switch (currentUser.role) {
      case USER_ROLES.ADMIN:
        return ['all_patients'];
      case USER_ROLES.DOCTOR:
        return ['patient-001', 'patient-002', 'patient-003'];
      case USER_ROLES.TECHNICIAN:
        return ['patient-001'];
      default:
        return [];
    }
  };

  const value: UserContextType = {
    currentUser,
    isAuthenticated: !!currentUser,
    isLoading,
    error,
    login,
    logout,
    updateUserProfile,
    hasPermission,
    hasRole,
    getPatientAccess,
    USER_ROLES
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
