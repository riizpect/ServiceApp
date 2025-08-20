import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  reset: () => void;
}

export const useAsyncData = <T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> => {
  const {
    immediate = true,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
    retryCountRef.current = 0;
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Cancel previous request if still pending
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      const result = await fetchFn();
      
      // Check if request was cancelled
      if (abortControllerRef.current.signal.aborted) {
        return;
      }
      
      setData(result);
      retryCountRef.current = 0;
      onSuccess?.(result);
    } catch (err) {
      // Check if request was cancelled
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Okänt fel';
      setError(errorMessage);
      
      // Retry logic
      if (retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => {
          refetch();
        }, retryDelay);
        return;
      }
      
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchFn, onSuccess, onError, retryCount, retryDelay]);

  useEffect(() => {
    if (immediate) {
      refetch();
    }
    
    // Cleanup function to abort pending requests
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, dependencies);

  return {
    data,
    loading,
    error,
    refetch,
    reset,
  };
}; 