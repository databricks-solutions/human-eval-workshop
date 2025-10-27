import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UsersService } from '@/client';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'facilitator' | 'sme' | 'participant';
  workshop_id: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  last_active?: string;
}

export interface UserPermissions {
  can_view_discovery: boolean;
  can_create_findings: boolean;
  can_view_all_findings: boolean;
  can_create_rubric: boolean;
  can_view_rubric: boolean;
  can_annotate: boolean;
  can_view_all_annotations: boolean;
  can_view_results: boolean;
  can_manage_workshop: boolean;
  can_assign_annotations: boolean;
}

interface UserContextType {
  user: User | null;
  permissions: UserPermissions | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateLastActive: () => void;
  isLoading: boolean;
  error: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
  onWorkshopIdRestored?: (workshopId: string) => void;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children, onWorkshopIdRestored }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount with validation
  useEffect(() => {
    const initializeUser = async () => {
      const savedUser = localStorage.getItem('workshop_user');
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('🔄 Restoring user from localStorage:', userData.email);
          
          // Validate user exists by trying to fetch their data
          try {
            const validatedUser = await UsersService.getUserUsersUserIdGet(userData.id);
            console.log('✅ User validated successfully:', validatedUser.email);
            setUser(validatedUser);
            
            // Also restore workshop ID if user has one and it's not already set
            if (validatedUser.workshop_id) {
              const currentWorkshopId = localStorage.getItem('workshop_id');
              if (!currentWorkshopId) {
                localStorage.setItem('workshop_id', validatedUser.workshop_id);
                // Notify workshop context about the restored workshop ID
                onWorkshopIdRestored?.(validatedUser.workshop_id);
              }
            }
            
            await loadPermissions(validatedUser.id);
          } catch (validationError: any) {
            const is404 = validationError.status === 404 || validationError.message?.includes('404');
            if (is404) {
              console.log('🔧 Stale user detected - clearing and requiring re-login');
              localStorage.removeItem('workshop_user');
              setUser(null);
              setPermissions(null);
            } else {
              // Other errors - still try to use cached user but log the error
              console.error('⚠️ Failed to validate user, using cached data:', validationError);
              setUser(userData);
              await loadPermissions(userData.id);
            }
          }
        } catch (e) {
          console.error('Failed to parse saved user:', e);
          localStorage.removeItem('workshop_user');
        }
      }
      setIsLoading(false);
    };
    
    initializeUser();
  }, [onWorkshopIdRestored]);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('workshop_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('workshop_user');
    }
  }, [user]);

  const loadPermissions = async (userId: string) => {
    try {
      console.log('🔍 Loading permissions for user ID:', userId);
      const permissions = await UsersService.getUserPermissionsUsersUserIdPermissionsGet(userId);
      console.log('✅ Permissions loaded successfully:', permissions);
      setPermissions(permissions);
    } catch (error: any) {
      console.error('❌ Failed to load user permissions for user ID:', userId);
      console.error('Error details:', {
        status: error.status,
        message: error.message,
        body: error.body
      });
      
      // Auto-recovery: If user not found (404), clear stale user data
      const is404 = error.status === 404 || error.message?.includes('404') || error.body?.detail?.includes('not found');
      if (is404) {
        console.log('🔧 User not found - clearing stale user data and logging out');
        localStorage.removeItem('workshop_user');
        setUser(null);
        setPermissions(null);
        setError('Your session has expired. Please log in again.');
      } else {
        setError(`Failed to load user permissions: ${error.status || 'Unknown error'}`);
      }
    }
  };

  const updateLastActive = async () => {
    if (user) {
      try {
        await UsersService.updateLastActiveUsersUsersUserIdLastActivePut(user.id);
      } catch (error) {
        console.error('Failed to update last active:', error);
      }
    }
  };

  const setUserWithPermissions = async (newUser: User | null) => {
    console.log('👤 Setting user:', newUser);
    setUser(newUser);
    if (newUser) {
      console.log(`🔑 Loading permissions for user ${newUser.id} with role ${newUser.role}`);
      await loadPermissions(newUser.id);
    } else {
      console.log('🔑 Clearing permissions (user logged out)');
      setPermissions(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      
      const response = await fetch('/users/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      console.log('✅ Login successful:', data);
      console.log('🎭 User role automatically determined:', data.user.role);
      
      // Set the user with permissions
      await setUserWithPermissions(data.user);
      
      
      
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = () => {
    console.log('🚪 Logging out user');
    setUser(null);
    setPermissions(null);

    localStorage.removeItem('workshop_user');
  };

  return (
    <UserContext.Provider
      value={{
        user,
        permissions,
        setUser: setUserWithPermissions,
        login,
        logout,
        updateLastActive,
        isLoading,
        error
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Role-based access control helpers
export const useRoleCheck = () => {
  const { user, permissions } = useUser();
  
  // Debug: Log permissions state
  console.log('🔑 useRoleCheck - Current permissions:', {
    userId: user?.id,
    role: user?.role,
    permissions: permissions,
    can_create_findings: permissions?.can_create_findings
  });
  
  const isFacilitator = user?.role === 'facilitator';
  const isSME = user?.role === 'sme';
  const isParticipant = user?.role === 'participant';
  
  const canViewDiscovery = permissions?.can_view_discovery ?? false;
  const canCreateFindings = permissions?.can_create_findings ?? false;
  const canViewAllFindings = permissions?.can_view_all_findings ?? false;
  const canCreateRubric = permissions?.can_create_rubric ?? false;
  const canViewRubric = permissions?.can_view_rubric ?? false;
  const canAnnotate = permissions?.can_annotate ?? false;
  const canViewAllAnnotations = permissions?.can_view_all_annotations ?? false;
  const canViewResults = permissions?.can_view_results ?? false;
  const canManageWorkshop = permissions?.can_manage_workshop ?? false;
  const canAssignAnnotations = permissions?.can_assign_annotations ?? false;

  return {
    isFacilitator,
    isSME,
    isParticipant,
    canViewDiscovery,
    canCreateFindings,
    canViewAllFindings,
    canCreateRubric,
    canViewRubric,
    canAnnotate,
    canViewAllAnnotations,
    canViewResults,
    canManageWorkshop,
    canAssignAnnotations
  };
};