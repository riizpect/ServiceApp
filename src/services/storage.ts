import AsyncStorage from '@react-native-async-storage/async-storage';
import { Customer, Product, ProductCategory, ServiceCase, ServiceReminder, ChecklistItem, ServiceImage, ServiceLogEntry } from '../types';

// Storage keys
const STORAGE_KEYS = {
  CUSTOMERS: 'customers',
  PRODUCTS: 'products',
  PRODUCT_CATEGORIES: 'product_categories',
  SERVICE_CASES: 'service_cases',
  REMINDERS: 'reminders',
  CHECKLIST_ITEMS: 'checklist_items',
  SERVICE_IMAGES: 'service_images',
  SERVICE_LOG_ENTRIES: 'service_log_entries',
} as const;

// Utility functions
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Rensa all data
export const clearAllData = async (): Promise<void> => {
  try {
    console.log('Börjar rensa all data...');
    
    // Kontrollera vad som finns innan rensning
    const beforeData = await AsyncStorage.multiGet([
      STORAGE_KEYS.CUSTOMERS,
      STORAGE_KEYS.PRODUCTS,
      STORAGE_KEYS.PRODUCT_CATEGORIES,
      STORAGE_KEYS.SERVICE_CASES,
      STORAGE_KEYS.REMINDERS,
      STORAGE_KEYS.CHECKLIST_ITEMS,
      STORAGE_KEYS.SERVICE_IMAGES,
      STORAGE_KEYS.SERVICE_LOG_ENTRIES,
    ]);
    
    console.log('Data innan rensning:', beforeData.map(([key, value]) => ({
      key,
      hasData: !!value,
      dataLength: value ? JSON.parse(value).length : 0
    })));
    
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CUSTOMERS,
      STORAGE_KEYS.PRODUCTS,
      STORAGE_KEYS.PRODUCT_CATEGORIES,
      STORAGE_KEYS.SERVICE_CASES,
      STORAGE_KEYS.REMINDERS,
      STORAGE_KEYS.CHECKLIST_ITEMS,
      STORAGE_KEYS.SERVICE_IMAGES,
      STORAGE_KEYS.SERVICE_LOG_ENTRIES,
    ]);
    
    // Kontrollera vad som finns efter rensning
    const afterData = await AsyncStorage.multiGet([
      STORAGE_KEYS.CUSTOMERS,
      STORAGE_KEYS.PRODUCTS,
      STORAGE_KEYS.PRODUCT_CATEGORIES,
      STORAGE_KEYS.SERVICE_CASES,
      STORAGE_KEYS.REMINDERS,
      STORAGE_KEYS.CHECKLIST_ITEMS,
      STORAGE_KEYS.SERVICE_IMAGES,
      STORAGE_KEYS.SERVICE_LOG_ENTRIES,
    ]);
    
    console.log('Data efter rensning:', afterData.map(([key, value]) => ({
      key,
      hasData: !!value,
      dataLength: value ? JSON.parse(value).length : 0
    })));
    
    console.log('All data rensad');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// Mer aggressiv rensning - tar bort ALLT från AsyncStorage
export const clearEverythingFromStorage = async (): Promise<void> => {
  try {
    console.log('Börjar aggressiv rensning av allt...');
    
    // Hämta alla nycklar från AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    console.log('Alla nycklar i AsyncStorage:', allKeys);
    
    // Ta bort ALLT
    await AsyncStorage.multiRemove(allKeys);
    
    console.log('Allt rensat från AsyncStorage');
  } catch (error) {
    console.error('Error clearing everything:', error);
  }
};

// Customer storage
export const customerStorage = {
  async getAll(): Promise<Customer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const customers = data ? JSON.parse(data) : [];
      // Returnera endast aktiva kunder (inte arkiverade)
      return customers.filter((customer: Customer) => !customer.isArchived);
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  },

  async getArchived(): Promise<Customer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      const customers = data ? JSON.parse(data) : [];
      // Returnera endast arkiverade kunder
      return customers.filter((customer: Customer) => customer.isArchived);
    } catch (error) {
      console.error('Error getting archived customers:', error);
      return [];
    }
  },

  async getAllIncludingArchived(): Promise<Customer[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting all customers:', error);
      return [];
    }
  },

  async save(customer: Customer): Promise<void> {
    try {
      const customers = await this.getAllIncludingArchived();
      const existingIndex = customers.findIndex(c => c.id === customer.id);
      
      if (existingIndex >= 0) {
        customers[existingIndex] = { ...customer, updatedAt: new Date() };
      } else {
        customers.push({ ...customer, id: generateId(), createdAt: new Date(), updatedAt: new Date() });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    } catch (error) {
      console.error('Error saving customer:', error);
      throw error;
    }
  },

  async archive(id: string): Promise<void> {
    try {
      const customers = await this.getAllIncludingArchived();
      const customerIndex = customers.findIndex(c => c.id === id);
      
      if (customerIndex >= 0) {
        customers[customerIndex] = {
          ...customers[customerIndex],
          isArchived: true,
          archivedAt: new Date(),
          updatedAt: new Date(),
        };
        
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
    } catch (error) {
      console.error('Error archiving customer:', error);
      throw error;
    }
  },

  async unarchive(id: string): Promise<void> {
    try {
      const customers = await this.getAllIncludingArchived();
      const customerIndex = customers.findIndex(c => c.id === id);
      
      if (customerIndex >= 0) {
        customers[customerIndex] = {
          ...customers[customerIndex],
          isArchived: false,
          archivedAt: undefined,
          updatedAt: new Date(),
        };
        
        await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      }
    } catch (error) {
      console.error('Error unarchiving customer:', error);
      throw error;
    }
  },

  async deletePermanently(id: string): Promise<void> {
    try {
      const customers = await this.getAllIncludingArchived();
      const filtered = customers.filter(c => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error permanently deleting customer:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Customer | null> {
    try {
      const customers = await this.getAll();
      return customers.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error getting customer by id:', error);
      return null;
    }
  },
};

// Product category storage
export const productCategoryStorage = {
  async getAll(): Promise<ProductCategory[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCT_CATEGORIES);
      const categories = data ? JSON.parse(data) : [];
      
      // Convert date strings back to Date objects
      return categories.map((category: any) => ({
        ...category,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting product categories:', error);
      return [];
    }
  },

  async save(category: ProductCategory): Promise<void> {
    try {
      const categories = await this.getAll();
      const existingIndex = categories.findIndex(c => c.id === category.id);
      
      if (existingIndex >= 0) {
        categories[existingIndex] = { ...category, updatedAt: new Date() };
      } else {
        categories.push({ ...category, id: generateId(), createdAt: new Date(), updatedAt: new Date() });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCT_CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving product category:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const categories = await this.getAll();
      const filtered = categories.filter(c => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCT_CATEGORIES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting product category:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<ProductCategory | null> {
    try {
      const categories = await this.getAll();
      return categories.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error getting product category by id:', error);
      return null;
    }
  },
};

// Service log storage
export const serviceLogStorage = {
  async getAll(): Promise<ServiceLogEntry[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_LOG_ENTRIES);
      const entries = data ? JSON.parse(data) : [];
      
      // Convert date strings back to Date objects
      return entries.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      }));
    } catch (error) {
      console.error('Error getting service log entries:', error);
      return [];
    }
  },

  async getByServiceCaseId(serviceCaseId: string): Promise<ServiceLogEntry[]> {
    try {
      const entries = await this.getAll();
      return entries
        .filter(entry => entry.serviceCaseId === serviceCaseId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Newest first
    } catch (error) {
      console.error('Error getting service log entries by service case id:', error);
      return [];
    }
  },

  async save(entry: ServiceLogEntry): Promise<void> {
    try {
      const entries = await this.getAll();
      const existingIndex = entries.findIndex(e => e.id === entry.id);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = { ...entry, timestamp: new Date() };
      } else {
        entries.push({ ...entry, id: generateId(), timestamp: new Date() });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_LOG_ENTRIES, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving service log entry:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const entries = await this.getAll();
      const filtered = entries.filter(e => e.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_LOG_ENTRIES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting service log entry:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<ServiceLogEntry | null> {
    try {
      const entries = await this.getAll();
      return entries.find(e => e.id === id) || null;
    } catch (error) {
      console.error('Error getting service log entry by id:', error);
      return null;
    }
  },
};

// Product storage
export const productStorage = {
  async getAll(): Promise<Product[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      console.log('Storage - Raw products data from AsyncStorage:', data);
      
      const products = data ? JSON.parse(data) : [];
      console.log('Storage - Parsed products:', products.length, products);
      
      // Convert date strings back to Date objects
      const productsWithDates = products.map((product: any) => ({
        ...product,
        purchaseDate: product.purchaseDate ? new Date(product.purchaseDate) : undefined,
        warrantyExpiryDate: product.warrantyExpiryDate ? new Date(product.warrantyExpiryDate) : undefined,
        createdAt: new Date(product.createdAt),
        updatedAt: new Date(product.updatedAt),
      }));
      
      console.log('Storage - Products with converted dates:', productsWithDates.length, productsWithDates);
      return productsWithDates;
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },

  async getByCustomerId(customerId: string): Promise<Product[]> {
    try {
      const products = await this.getAll();
      return products.filter(p => p.customerId === customerId && p.isActive);
    } catch (error) {
      console.error('Error getting products by customer id:', error);
      return [];
    }
  },

  async getStandaloneProducts(): Promise<Product[]> {
    try {
      const products = await this.getAll();
      console.log('Storage - All products before filtering:', products.length, products);
      
      const standaloneProducts = products.filter(p => p.isStandalone && p.isActive);
      console.log('Storage - Standalone products after filtering:', standaloneProducts.length, standaloneProducts);
      
      return standaloneProducts;
    } catch (error) {
      console.error('Error getting standalone products:', error);
      return [];
    }
  },

  async getByCategoryId(categoryId: string): Promise<Product[]> {
    try {
      const products = await this.getAll();
      return products.filter(p => p.categoryId === categoryId && p.isActive);
    } catch (error) {
      console.error('Error getting products by category id:', error);
      return [];
    }
  },

  async save(product: Product): Promise<void> {
    try {
      console.log('Storage - Saving product:', product);
      
      const products = await this.getAll();
      console.log('Storage - Existing products before save:', products.length);
      
      const existingIndex = products.findIndex(p => p.id === product.id);
      
      if (existingIndex >= 0) {
        products[existingIndex] = { ...product, updatedAt: new Date() };
        console.log('Storage - Updated existing product');
      } else {
        const newProduct = { ...product, id: generateId(), createdAt: new Date(), updatedAt: new Date() };
        products.push(newProduct);
        console.log('Storage - Added new product with ID:', newProduct.id);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      console.log('Storage - Products saved to storage, total count:', products.length);
    } catch (error) {
      console.error('Error saving product:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const products = await this.getAll();
      const filtered = products.filter(p => p.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const products = await this.getAll();
      return products.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting product by id:', error);
      return null;
    }
  },

  async update(id: string, updatedProduct: Partial<Product>): Promise<void> {
    try {
      const products = await this.getAll();
      const existingIndex = products.findIndex(p => p.id === id);
      
      if (existingIndex >= 0) {
        products[existingIndex] = { 
          ...products[existingIndex], 
          ...updatedProduct, 
          updatedAt: new Date() 
        };
        await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },
};

// Service case storage
export const serviceCaseStorage = {
  async getAll(): Promise<ServiceCase[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_CASES);
      const cases = data ? JSON.parse(data) : [];
      
      // Convert date strings back to Date objects
      return cases.map((serviceCase: any) => ({
        ...serviceCase,
        scheduledDate: serviceCase.scheduledDate ? new Date(serviceCase.scheduledDate) : undefined,
        completedDate: serviceCase.completedDate ? new Date(serviceCase.completedDate) : undefined,
        createdAt: new Date(serviceCase.createdAt),
        updatedAt: new Date(serviceCase.updatedAt),
      }));
    } catch (error) {
      console.error('Error getting service cases:', error);
      return [];
    }
  },

  async getAllWithCustomers(): Promise<ServiceCase[]> {
    try {
      const [cases, customers] = await Promise.all([
        this.getAll(),
        customerStorage.getAll(),
      ]);
      
      // Lägg till kunddata till varje serviceärende
      return cases.map(serviceCase => {
        const customer = customers.find(c => c.id === serviceCase.customerId);
        return {
          ...serviceCase,
          customer,
        };
      });
    } catch (error) {
      console.error('Error getting service cases with customers:', error);
      return [];
    }
  },

  async save(serviceCase: ServiceCase): Promise<void> {
    try {
      const cases = await this.getAll();
      const existingIndex = cases.findIndex(c => c.id === serviceCase.id);
      
      if (existingIndex >= 0) {
        cases[existingIndex] = { ...serviceCase, updatedAt: new Date() };
      } else {
        cases.push({ ...serviceCase, id: generateId(), createdAt: new Date(), updatedAt: new Date() });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_CASES, JSON.stringify(cases));
    } catch (error) {
      console.error('Error saving service case:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const cases = await this.getAll();
      const filtered = cases.filter(c => c.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_CASES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting service case:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<ServiceCase | null> {
    try {
      const cases = await this.getAll();
      return cases.find(c => c.id === id) || null;
    } catch (error) {
      console.error('Error getting service case by id:', error);
      return null;
    }
  },

  async getByCustomerId(customerId: string): Promise<ServiceCase[]> {
    try {
      const cases = await this.getAll();
      return cases.filter(c => c.customerId === customerId);
    } catch (error) {
      console.error('Error getting service cases by customer id:', error);
      return [];
    }
  },

  async update(id: string, updatedServiceCase: Partial<ServiceCase>): Promise<void> {
    try {
      const cases = await this.getAll();
      const existingIndex = cases.findIndex(c => c.id === id);
      
      if (existingIndex >= 0) {
        cases[existingIndex] = { 
          ...cases[existingIndex], 
          ...updatedServiceCase, 
          updatedAt: new Date() 
        };
        await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_CASES, JSON.stringify(cases));
      }
    } catch (error) {
      console.error('Error updating service case:', error);
      throw error;
    }
  },
};

// Reminder storage
export const reminderStorage = {
  async getAll(): Promise<ServiceReminder[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.REMINDERS);
      const reminders = data ? JSON.parse(data) : [];
      
      // Convert date strings back to Date objects
      return reminders.map((reminder: any) => ({
        ...reminder,
        dueDate: new Date(reminder.dueDate),
        completedAt: reminder.completedAt ? new Date(reminder.completedAt) : undefined,
        createdAt: new Date(reminder.createdAt),
      }));
    } catch (error) {
      console.error('Error getting reminders:', error);
      return [];
    }
  },

  async save(reminder: ServiceReminder): Promise<void> {
    try {
      const reminders = await this.getAll();
      const existingIndex = reminders.findIndex(r => r.id === reminder.id);
      
      if (existingIndex >= 0) {
        reminders[existingIndex] = reminder;
      } else {
        reminders.push({ ...reminder, id: generateId(), createdAt: new Date() });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
    } catch (error) {
      console.error('Error saving reminder:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const reminders = await this.getAll();
      const filtered = reminders.filter(r => r.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },
};

// Checklist item storage
export const checklistItemStorage = {
  async getByServiceCaseId(serviceCaseId: string): Promise<ChecklistItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST_ITEMS);
      const items = data ? JSON.parse(data) : [];
      return items.filter((item: ChecklistItem) => item.serviceCaseId === serviceCaseId);
    } catch (error) {
      console.error('Error getting checklist items:', error);
      return [];
    }
  },

  async save(item: ChecklistItem): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST_ITEMS);
      const items = data ? JSON.parse(data) : [];
      const existingIndex = items.findIndex((i: ChecklistItem) => i.id === item.id);
      
      if (existingIndex >= 0) {
        items[existingIndex] = item;
      } else {
        items.push({ ...item, id: generateId() });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST_ITEMS, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving checklist item:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.CHECKLIST_ITEMS);
      const items = data ? JSON.parse(data) : [];
      const filtered = items.filter((item: ChecklistItem) => item.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.CHECKLIST_ITEMS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting checklist item:', error);
      throw error;
    }
  },
};

// Service image storage
export const serviceImageStorage = {
  async getByServiceCaseId(serviceCaseId: string): Promise<ServiceImage[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_IMAGES);
      const images = data ? JSON.parse(data) : [];
      return images.filter((image: ServiceImage) => image.serviceCaseId === serviceCaseId);
    } catch (error) {
      console.error('Error getting service images:', error);
      return [];
    }
  },

  async save(image: ServiceImage): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_IMAGES);
      const images = data ? JSON.parse(data) : [];
      const existingIndex = images.findIndex((i: ServiceImage) => i.id === image.id);
      
      if (existingIndex >= 0) {
        images[existingIndex] = image;
      } else {
        images.push({ ...image, id: generateId(), createdAt: new Date() });
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_IMAGES, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving service image:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SERVICE_IMAGES);
      const images = data ? JSON.parse(data) : [];
      const filtered = images.filter((image: ServiceImage) => image.id !== id);
      await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_IMAGES, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting service image:', error);
      throw error;
    }
  },
}; 

// Direct functions for backward compatibility
export const getCustomers = async (): Promise<Customer[]> => {
  return customerStorage.getAll();
};

export const getServiceCases = async (): Promise<ServiceCase[]> => {
  return serviceCaseStorage.getAll();
};

export const getServiceLogs = async (): Promise<ServiceLogEntry[]> => {
  return serviceLogStorage.getAll();
};

export const addTestData = async (): Promise<void> => {
  try {
    // Create test customers
    const testCustomers = [
      { name: 'Sahlgrenska Universitetssjukhuset', address: 'Blå Stråket 5, Göteborg', phone: '031-342 10 00', email: 'info@sahlgrenska.se' },
      { name: 'Karolinska Universitetssjukhuset', address: 'Eugeniavägen 3, Stockholm', phone: '08-517 700 00', email: 'info@karolinska.se' },
      { name: 'Danderyds Sjukhus', address: 'Mörbygårdsvägen 1, Danderyd', phone: '08-123 50 000', email: 'info@danderyd.se' },
    ];

    for (const customerData of testCustomers) {
      await customerStorage.save({
        id: '',
        name: customerData.name,
        address: customerData.address,
        phone: customerData.phone,
        email: customerData.email,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create test service cases
    const customers = await customerStorage.getAll();
    const testServiceCases = [
      { title: 'Rutinservice VIPER XTS', status: 'completed' as const, description: 'Rutinmässig service av VIPER XTS', customerId: customers[0]?.id || '' },
      { title: 'Batteri bytt PowerTraxx', status: 'in_progress' as const, description: 'Batteri bytt på PowerTraxx', customerId: customers[1]?.id || '' },
      { title: 'Kontroll Transcend', status: 'pending' as const, description: 'Kontroll av Transcend system', customerId: customers[2]?.id || '' },
    ];

    for (const caseData of testServiceCases) {
      await serviceCaseStorage.save({
        id: '',
        customerId: caseData.customerId,
        title: caseData.title,
        description: caseData.description,
        status: caseData.status,
        priority: 'medium',
        equipmentType: 'other',
        images: [],
        checklistItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create test service logs
    const serviceCases = await serviceCaseStorage.getAll();
    const testLogEntries = [
      { title: 'Rutinkontroll utförd', content: 'Alla funktioner testade och fungerar bra.', serviceCaseId: serviceCases[0]?.id || '' },
      { title: 'Batteri bytt', content: 'Nytt batteri installerat och testat.', serviceCaseId: serviceCases[1]?.id || '' },
      { title: 'Kontroll av bromsar', content: 'Bromsar kontrollerade och justerade.', serviceCaseId: serviceCases[2]?.id || '' },
    ];

    for (const logData of testLogEntries) {
      await serviceLogStorage.save({
        id: '',
        serviceCaseId: logData.serviceCaseId,
        type: 'note',
        title: logData.title,
        content: logData.content,
        timestamp: new Date(),
      });
    }

    // Create test reminders
    const testReminders = [
      { title: 'Rutinservice VIPER XTS', description: 'Påminnelse för rutinservice', customerId: customers[0]?.id || '', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      { title: 'Batterikontroll PowerTraxx', description: 'Påminnelse för batterikontroll', customerId: customers[1]?.id || '', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    ];

    for (const reminderData of testReminders) {
      await reminderStorage.save({
        id: '',
        customerId: reminderData.customerId,
        title: reminderData.title,
        description: reminderData.description,
        dueDate: reminderData.dueDate,
        isCompleted: false,
        priority: 'medium',
        createdAt: new Date(),
      });
    }

    console.log('Test data added successfully');
  } catch (error) {
    console.error('Error adding test data:', error);
    throw error;
  }
};

export const removeTestData = async (): Promise<void> => {
  try {
    // Remove test customers (identified by specific names)
    const testCustomerNames = [
      'Sahlgrenska Universitetssjukhuset',
      'Karolinska Universitetssjukhuset',
      'Danderyds Sjukhus',
    ];

    const customers = await customerStorage.getAllIncludingArchived();
    for (const customer of customers) {
      if (testCustomerNames.includes(customer.name)) {
        await customerStorage.deletePermanently(customer.id);
      }
    }

    // Remove test service cases (identified by specific titles)
    const testCaseTitles = [
      'Rutinservice VIPER XTS',
      'Batteri bytt PowerTraxx',
      'Kontroll Transcend',
    ];

    const serviceCases = await serviceCaseStorage.getAll();
    for (const serviceCase of serviceCases) {
      if (testCaseTitles.includes(serviceCase.title)) {
        await serviceCaseStorage.delete(serviceCase.id);
      }
    }

    // Remove test service logs (identified by specific titles)
    const testLogTitles = [
      'Rutinkontroll utförd',
      'Batteri bytt',
      'Kontroll av bromsar',
    ];

    const logEntries = await serviceLogStorage.getAll();
    for (const logEntry of logEntries) {
      if (testLogTitles.includes(logEntry.title)) {
        await serviceLogStorage.delete(logEntry.id);
      }
    }

    // Remove test reminders (identified by specific titles)
    const testReminderTitles = [
      'Rutinservice VIPER XTS',
      'Batterikontroll PowerTraxx',
    ];

    const reminders = await reminderStorage.getAll();
    for (const reminder of reminders) {
      if (testReminderTitles.includes(reminder.title)) {
        await reminderStorage.delete(reminder.id);
      }
    }

    console.log('Test data removed successfully');
  } catch (error) {
    console.error('Error removing test data:', error);
    throw error;
  }
}; 