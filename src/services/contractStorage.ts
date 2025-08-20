import AsyncStorage from '@react-native-async-storage/async-storage';
import { ServiceContract, ContractSchedule } from '../types';

const CONTRACTS_KEY = 'service_contracts';
const CONTRACT_SCHEDULES_KEY = 'contract_schedules';

class ContractStorage {
  // Get all contracts
  async getAllContracts(): Promise<ServiceContract[]> {
    try {
      const contractsJson = await AsyncStorage.getItem(CONTRACTS_KEY);
      if (contractsJson) {
        const contracts = JSON.parse(contractsJson);
        return contracts.map((contract: any) => ({
          ...contract,
          startDate: new Date(contract.startDate),
          endDate: new Date(contract.endDate),
          createdAt: new Date(contract.createdAt),
          updatedAt: new Date(contract.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting contracts:', error);
      return [];
    }
  }

  // Get contract by ID
  async getContractById(id: string): Promise<ServiceContract | null> {
    try {
      const contracts = await this.getAllContracts();
      const contract = contracts.find(c => c.id === id);
      return contract || null;
    } catch (error) {
      console.error('Error getting contract by ID:', error);
      return null;
    }
  }

  // Get contracts by customer ID
  async getContractsByCustomerId(customerId: string): Promise<ServiceContract[]> {
    try {
      const contracts = await this.getAllContracts();
      return contracts.filter(c => c.customerId === customerId);
    } catch (error) {
      console.error('Error getting contracts by customer ID:', error);
      return [];
    }
  }

  // Get active contracts
  async getActiveContracts(): Promise<ServiceContract[]> {
    try {
      const contracts = await this.getAllContracts();
      return contracts.filter(c => c.status === 'active');
    } catch (error) {
      console.error('Error getting active contracts:', error);
      return [];
    }
  }

  // Save contract
  async saveContract(contract: ServiceContract): Promise<void> {
    try {
      const contracts = await this.getAllContracts();
      const existingIndex = contracts.findIndex(c => c.id === contract.id);
      
      if (existingIndex >= 0) {
        contracts[existingIndex] = {
          ...contract,
          updatedAt: new Date(),
        };
      } else {
        contracts.push({
          ...contract,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      await AsyncStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
    } catch (error) {
      console.error('Error saving contract:', error);
      throw error;
    }
  }

  // Delete contract
  async deleteContract(id: string): Promise<void> {
    try {
      const contracts = await this.getAllContracts();
      const filteredContracts = contracts.filter(c => c.id !== id);
      await AsyncStorage.setItem(CONTRACTS_KEY, JSON.stringify(filteredContracts));
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  }

  // Generate contract number
  async generateContractNumber(): Promise<string> {
    try {
      const contracts = await this.getAllContracts();
      const year = new Date().getFullYear();
      const contractCount = contracts.filter(c => 
        c.contractNumber.startsWith(`CON-${year}`)
      ).length;
      return `CON-${year}-${String(contractCount + 1).padStart(4, '0')}`;
    } catch (error) {
      console.error('Error generating contract number:', error);
      const year = new Date().getFullYear();
      return `CON-${year}-0001`;
    }
  }

  // Contract Schedule Methods
  async getAllSchedules(): Promise<ContractSchedule[]> {
    try {
      const schedulesJson = await AsyncStorage.getItem(CONTRACT_SCHEDULES_KEY);
      if (schedulesJson) {
        const schedules = JSON.parse(schedulesJson);
        return schedules.map((schedule: any) => ({
          ...schedule,
          scheduledDate: new Date(schedule.scheduledDate),
          completedDate: schedule.completedDate ? new Date(schedule.completedDate) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting schedules:', error);
      return [];
    }
  }

  async getSchedulesByContractId(contractId: string): Promise<ContractSchedule[]> {
    try {
      const schedules = await this.getAllSchedules();
      return schedules.filter(s => s.contractId === contractId);
    } catch (error) {
      console.error('Error getting schedules by contract ID:', error);
      return [];
    }
  }

  async saveSchedule(schedule: ContractSchedule): Promise<void> {
    try {
      const schedules = await this.getAllSchedules();
      const existingIndex = schedules.findIndex(s => s.id === schedule.id);
      
      if (existingIndex >= 0) {
        schedules[existingIndex] = schedule;
      } else {
        schedules.push(schedule);
      }
      
      await AsyncStorage.setItem(CONTRACT_SCHEDULES_KEY, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  }

  async deleteSchedule(id: string): Promise<void> {
    try {
      const schedules = await this.getAllSchedules();
      const filteredSchedules = schedules.filter(s => s.id !== id);
      await AsyncStorage.setItem(CONTRACT_SCHEDULES_KEY, JSON.stringify(filteredSchedules));
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw error;
    }
  }
}

export const contractStorage = new ContractStorage(); 