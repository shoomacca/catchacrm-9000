/**
 * useSupabaseData Hook
 *
 * Handles loading CRM data from Supabase with fallback to localStorage.
 * Provides real-time sync for mutations.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  loadAllCRMData,
  isDemoMode,
  DEMO_ORG_ID,
  insertRecord,
  updateRecord,
  deleteRecord,
  resetDemoOrganization,
  type CRMData
} from '../services/supabaseData';

export type DataSource = 'supabase' | 'localStorage' | 'loading';

interface UseSupabaseDataResult {
  data: CRMData | null;
  dataSource: DataSource;
  isLoading: boolean;
  error: string | null;
  isSupabaseConnected: boolean;
  isDemoMode: boolean;
  orgId: string;
  reload: () => Promise<void>;
  resetDemo: () => Promise<{ success: boolean; message: string }>;
  syncToSupabase: <T>(table: string, action: 'insert' | 'update' | 'delete', record: T, id?: string) => Promise<T | null>;
}

export function useSupabaseData(): UseSupabaseDataResult {
  const [data, setData] = useState<CRMData | null>(null);
  const [dataSource, setDataSource] = useState<DataSource>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);
  const [orgId, setOrgId] = useState(DEMO_ORG_ID);

  const demoMode = isDemoMode();

  // Check Supabase connection
  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (!supabase) {
      console.log('Supabase client not initialized');
      return false;
    }

    try {
      // Quick health check - try to count organizations
      const { count, error } = await supabase
        .from('organizations')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log('Supabase connection check failed:', error.message);
        return false;
      }

      console.log('Supabase connection verified');
      return true;
    } catch (err) {
      console.log('Supabase connection error:', err);
      return false;
    }
  }, []);

  // Load data from Supabase
  const loadFromSupabase = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const connected = await checkConnection();
      setIsSupabaseConnected(connected);

      if (connected) {
        console.log('Loading data from Supabase...');
        const crmData = await loadAllCRMData();
        setData(crmData);
        setDataSource('supabase');
        setOrgId(demoMode ? DEMO_ORG_ID : DEMO_ORG_ID); // TODO: Get user's org when auth is implemented
        console.log('Data loaded from Supabase successfully');
      } else {
        console.log('Supabase not available, will use localStorage');
        setDataSource('localStorage');
      }
    } catch (err) {
      console.error('Error loading from Supabase:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
      setDataSource('localStorage');
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection, demoMode]);

  // Initial load
  useEffect(() => {
    loadFromSupabase();
  }, [loadFromSupabase]);

  // Reload data
  const reload = useCallback(async () => {
    await loadFromSupabase();
  }, [loadFromSupabase]);

  // Reset demo data
  const resetDemo = useCallback(async () => {
    if (!isSupabaseConnected) {
      return { success: false, message: 'Supabase not connected' };
    }

    const result = await resetDemoOrganization();
    if (result.success) {
      // Reload data after reset
      await reload();
    }
    return result;
  }, [isSupabaseConnected, reload]);

  // Sync a mutation to Supabase
  const syncToSupabase = useCallback(async <T>(
    table: string,
    action: 'insert' | 'update' | 'delete',
    record: T,
    id?: string
  ): Promise<T | null> => {
    if (!isSupabaseConnected) {
      console.log('Supabase not connected, skipping sync');
      return record;
    }

    try {
      switch (action) {
        case 'insert':
          return await insertRecord<T>(table as any, record as any);
        case 'update':
          if (!id) {
            console.error('Update requires an id');
            return null;
          }
          return await updateRecord<T>(table as any, id, record as any);
        case 'delete':
          if (!id) {
            console.error('Delete requires an id');
            return null;
          }
          await deleteRecord(table as any, id);
          return null;
        default:
          return null;
      }
    } catch (err) {
      console.error(`Error syncing ${action} to Supabase:`, err);
      return null;
    }
  }, [isSupabaseConnected]);

  return {
    data,
    dataSource,
    isLoading,
    error,
    isSupabaseConnected,
    isDemoMode: demoMode,
    orgId,
    reload,
    resetDemo,
    syncToSupabase
  };
}

export default useSupabaseData;
