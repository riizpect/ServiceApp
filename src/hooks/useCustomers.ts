import { useCallback } from 'react';
import { useAsyncData } from './useAsyncData';
import { Customer } from '../types';
import { customerStorage } from '../services/storage';

interface UseCustomersOptions {
  includeArchived?: boolean;
  searchQuery?: string;
}

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  saveCustomer: (customer: Customer) => Promise<void>;
  archiveCustomer: (id: string) => Promise<void>;
  unarchiveCustomer: (id: string) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
}

export const useCustomers = (
  options: UseCustomersOptions = {}
): UseCustomersReturn => {
  const { includeArchived = false, searchQuery = '' } = options;

  const fetchCustomers = useCallback(async () => {
    let customers: Customer[];
    
    if (includeArchived) {
      customers = await customerStorage.getAllIncludingArchived();
    } else {
      customers = await customerStorage.getAll();
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      customers = customers.filter(customer =>
        customer.name.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone.toLowerCase().includes(query) ||
        customer.address.toLowerCase().includes(query)
      );
    }

    return customers;
  }, [includeArchived, searchQuery]);

  const { data, loading, error, refetch } = useAsyncData(fetchCustomers, [
    includeArchived,
    searchQuery,
  ]);

  const saveCustomer = useCallback(async (customer: Customer) => {
    try {
      await customerStorage.save(customer);
      await refetch();
    } catch (error) {
      console.error('Error saving customer:', error);
      throw error;
    }
  }, [refetch]);

  const archiveCustomer = useCallback(async (id: string) => {
    try {
      await customerStorage.archive(id);
      await refetch();
    } catch (error) {
      console.error('Error archiving customer:', error);
      throw error;
    }
  }, [refetch]);

  const unarchiveCustomer = useCallback(async (id: string) => {
    try {
      await customerStorage.unarchive(id);
      await refetch();
    } catch (error) {
      console.error('Error unarchiving customer:', error);
      throw error;
    }
  }, [refetch]);

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await customerStorage.deletePermanently(id);
      await refetch();
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }, [refetch]);

  return {
    customers: data || [],
    loading,
    error,
    refetch,
    saveCustomer,
    archiveCustomer,
    unarchiveCustomer,
    deleteCustomer,
  };
}; 