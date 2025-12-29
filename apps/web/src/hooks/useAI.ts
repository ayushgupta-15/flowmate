import { useState } from 'react';
import { apiClient } from '@/lib/api-client';

export function useAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const codeReview = async (code: string, language: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.codeReview(code, language);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateTests = async (code: string, language: string, framework: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.generateTests(code, language, framework);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { codeReview, generateTests, loading, error };
}
