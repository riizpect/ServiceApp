import { useCallback } from 'react';
import { useAsyncData } from './useAsyncData';
import { ServiceCase, Customer, Product } from '../types';
import { serviceCaseStorage, customerStorage, productStorage } from '../services/storage';

interface UseServiceCasesOptions {
  includeCustomers?: boolean;
  includeProducts?: boolean;
  filterStatus?: ServiceCase['status'][];
  filterCustomerId?: string;
}

interface UseServiceCasesReturn {
  serviceCases: ServiceCase[];
  customers: Customer[];
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateServiceCase: (id: string, updates: Partial<ServiceCase>) => Promise<void>;
  deleteServiceCase: (id: string) => Promise<void>;
}

export const useServiceCases = (
  options: UseServiceCasesOptions = {}
): UseServiceCasesReturn => {
  const {
    includeCustomers = true,
    includeProducts = true,
    filterStatus,
    filterCustomerId,
  } = options;

  const fetchServiceCases = useCallback(async () => {
    const [cases, customers, products] = await Promise.all([
      serviceCaseStorage.getAllWithCustomers(),
      includeCustomers ? customerStorage.getAll() : Promise.resolve([]),
      includeProducts ? productStorage.getAll() : Promise.resolve([]),
    ]);

    // Apply filters
    let filteredCases = cases;
    
    if (filterStatus && filterStatus.length > 0) {
      filteredCases = filteredCases.filter(case_ => 
        filterStatus.includes(case_.status)
      );
    }
    
    if (filterCustomerId) {
      filteredCases = filteredCases.filter(case_ => 
        case_.customerId === filterCustomerId
      );
    }

    return {
      serviceCases: filteredCases,
      customers,
      products,
    };
  }, [includeCustomers, includeProducts, filterStatus, filterCustomerId]);

  const { data, loading, error, refetch } = useAsyncData(fetchServiceCases, [
    includeCustomers,
    includeProducts,
    filterStatus,
    filterCustomerId,
  ]);

  const updateServiceCase = useCallback(async (id: string, updates: Partial<ServiceCase>) => {
    try {
      await serviceCaseStorage.update(id, updates);
      // Refetch to get updated data
      await refetch();
    } catch (error) {
      console.error('Error updating service case:', error);
      throw error;
    }
  }, [refetch]);

  const deleteServiceCase = useCallback(async (id: string) => {
    try {
      await serviceCaseStorage.delete(id);
      // Refetch to get updated data
      await refetch();
    } catch (error) {
      console.error('Error deleting service case:', error);
      throw error;
    }
  }, [refetch]);

  return {
    serviceCases: data?.serviceCases || [],
    customers: data?.customers || [],
    products: data?.products || [],
    loading,
    error,
    refetch,
    updateServiceCase,
    deleteServiceCase,
  };
}; 