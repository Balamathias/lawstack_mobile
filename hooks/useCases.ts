import { useState, useEffect, useCallback } from 'react';
import { stackbase } from '../lib/stackbase';
import { Case, CaseTag } from '../@types/cases';

export const useCases = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await stackbase.get('/cases');
      setCases(response.data.data || []);
      
    } catch (err) {
      console.error('Error fetching cases:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cases');
    } finally {
      setLoading(false);
    }
  }, []);

  const getCaseById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await stackbase.get(`/cases/${id}`);
      return response.data.data;
    } catch (err) {
      console.error(`Error fetching case ${id}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCase = useCallback(async (caseData: Partial<Case>) => {
    try {
      setLoading(true);
      const response = await stackbase.post('/cases', caseData);
      refresh();
      return response.data.data;
    } catch (err) {
      console.error('Error creating case:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases, refreshTrigger]);

  return {
    cases,
    loading,
    error,
    refresh,
    getCaseById,
    createCase
  };
};
