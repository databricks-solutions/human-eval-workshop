/**
 * Workshop context for managing workshop state across the application
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Workshop } from '@/client';

interface WorkshopContextType {
  workshopId: string | null;
  workshop: Workshop | null;
  setWorkshopId: (id: string | null) => void;
  setWorkshop: (workshop: Workshop | null) => void;
  workflowMode: 'filled' | 'manual';
  setWorkflowMode: (mode: 'filled' | 'manual') => void;
  clearInvalidWorkshopId: () => void;
}

const WorkshopContext = createContext<WorkshopContextType | undefined>(undefined);

interface WorkshopProviderProps {
  children: ReactNode;
  restoredWorkshopId?: string | null;
}

// Get workshop ID from URL path or query params, or localStorage fallback
const getWorkshopIdFromUrl = (): string | null => {
  const path = window.location.pathname;
  const search = window.location.search;
  
  // Try URL path pattern: /workshop/id
  let workshopMatch = path.match(/\/workshop\/([a-f0-9-]{36})/);
  if (workshopMatch) {
    const workshopId = workshopMatch[1];
    console.log('📍 Workshop ID from path:', workshopId);
    
    // Clear localStorage if URL has a different workshop ID
    const savedWorkshopId = localStorage.getItem('workshop_id');
    if (savedWorkshopId && savedWorkshopId !== workshopId) {
      console.log('🧹 Clearing old workshop ID from localStorage:', savedWorkshopId);
      localStorage.removeItem('workshop_id');
    }
    
    return workshopId;
  }
  
  // Try query parameter: ?workshop=id
  const urlParams = new URLSearchParams(search);
  const workshopParam = urlParams.get('workshop');
  if (workshopParam && workshopParam.match(/^[a-f0-9-]{36}$/)) {
    console.log('📍 Workshop ID from query param:', workshopParam);
    
    // Clear localStorage if URL has a different workshop ID
    const savedWorkshopId = localStorage.getItem('workshop_id');
    if (savedWorkshopId && savedWorkshopId !== workshopParam) {
      console.log('🧹 Clearing old workshop ID from localStorage:', savedWorkshopId);
      localStorage.removeItem('workshop_id');
    }
    
    return workshopParam;
  }
  
  // Try localStorage as fallback, but validate it first
  const savedWorkshopId = localStorage.getItem('workshop_id');
  if (savedWorkshopId && savedWorkshopId.match(/^[a-f0-9-]{36}$/)) {
    // Check if this is the known invalid workshop ID and clear it
    if (savedWorkshopId === '569c0be9-3782-4587-a595-98033265c7dc') {
      console.log('🧹 Clearing invalid workshop ID from localStorage:', savedWorkshopId);
      localStorage.removeItem('workshop_id');
      return null;
    }
    console.log('📍 Workshop ID from localStorage:', savedWorkshopId);
    return savedWorkshopId;
  }
  
  // No workshop ID found
  console.log('⚠️ No workshop ID found in URL or localStorage');
  return null;
};

export function WorkshopProvider({ children, restoredWorkshopId }: WorkshopProviderProps) {
  // Get query client FIRST, before state initialization
  const queryClient = useQueryClient();
  
  const [workshopId, setWorkshopId] = useState<string | null>(() => {
    const urlWorkshopId = getWorkshopIdFromUrl();
    console.log('🚀 WorkshopProvider initializing with workshop ID:', urlWorkshopId);
    
    // Clear React Query cache if we have a workshop ID from URL
    // This ensures we don't use stale data from a previous workshop
    if (urlWorkshopId) {
      console.log('🧹 Clearing React Query cache on initialization due to URL workshop ID');
      queryClient.clear();
    }
    
    return urlWorkshopId;
  });
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [workflowMode, setWorkflowMode] = useState<'filled' | 'manual'>('filled');

  const handleSetWorkshopId = (id: string | null) => {
    if (id !== workshopId) {
      console.log('🔄 Switching workshop ID from', workshopId, 'to', id);
      
      // Clear all cached queries when workshop ID changes
      queryClient.invalidateQueries();
      queryClient.clear();
      setWorkshopId(id);
      setWorkshop(null);
      
      // Persist workshop ID to localStorage
      if (id) {
        localStorage.setItem('workshop_id', id);
        console.log('💾 Saved workshop ID to localStorage:', id);
      } else {
        localStorage.removeItem('workshop_id');
        console.log('🧹 Removed workshop ID from localStorage');
      }
    }
  };

  const clearInvalidWorkshopId = () => {
    console.log('🧹 Clearing invalid workshop ID due to 500 error');
    localStorage.removeItem('workshop_id');
    queryClient.invalidateQueries();
    queryClient.clear();
    setWorkshopId(null);
    setWorkshop(null);
  };

  // Handle restored workshop ID from user context
  React.useEffect(() => {
    if (restoredWorkshopId && !workshopId) {
      console.log('🔄 Restoring workshop ID from user data:', restoredWorkshopId);
      handleSetWorkshopId(restoredWorkshopId);
    }
  }, [restoredWorkshopId, workshopId]);

  // Force refresh when component mounts to ensure fresh data
  // REMOVED: This was causing old cached queries to refetch
  // React.useEffect(() => {
  //   queryClient.invalidateQueries();
  // }, []);

  // Listen for URL changes to update workshop ID
  React.useEffect(() => {
    const handleUrlChange = () => {
      const newWorkshopId = getWorkshopIdFromUrl();
      console.log('🔄 URL changed, workshop ID:', { current: workshopId, new: newWorkshopId });
      if (newWorkshopId && newWorkshopId !== workshopId) {
        console.log('✅ Updating workshop ID to:', newWorkshopId);
        
        // IMPORTANT: Clear ALL queries before switching workshop
        // This prevents stale data from old workshop ID
        console.log('🧹 Clearing all React Query cache before workshop switch');
        queryClient.clear();
        queryClient.removeQueries(); // More aggressive cleanup
        
        handleSetWorkshopId(newWorkshopId);
      }
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleUrlChange);
    
    // Check for URL changes on mount
    handleUrlChange();
    
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [workshopId, queryClient]);

  return (
    <WorkshopContext.Provider 
      value={{
        workshopId,
        workshop,
        setWorkshopId: handleSetWorkshopId,
        setWorkshop,
        workflowMode,
        setWorkflowMode,
        clearInvalidWorkshopId,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
}

export function useWorkshopContext() {
  const context = useContext(WorkshopContext);
  if (context === undefined) {
    throw new Error('useWorkshopContext must be used within a WorkshopProvider');
  }
  return context;
}