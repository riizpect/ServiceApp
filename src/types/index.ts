// Datamodeller för ServiceApp
// Här definierar vi alla interfaces som används i appen

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  customerId?: string; // Optional - can be standalone product
  categoryId: string;
  name: string;
  type: 'viper' | 'powertraxx' | 'transcend' | 'fixed' | 'other';
  serialNumber: string;
  model?: string;
  purchaseDate?: Date;
  warrantyExpiryDate?: Date;
  location?: string;
  notes?: string;
  isActive: boolean;
  isStandalone: boolean; // true if not tied to a specific customer
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
  isArchived: boolean;
  archivedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistItem {
  id: string;
  serviceCaseId: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  order: number;
  category?: 'safety' | 'maintenance' | 'inspection' | 'documentation';
}

export interface ServiceCase {
  id: string;
  customerId: string;
  customer?: Customer; // För att kunna visa kundinfo direkt
  productId?: string; // Koppling till specifik produkt
  product?: Product; // För att kunna visa produktinfo direkt
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  equipmentType: 'viper' | 'powertraxx' | 'other';
  equipmentSerialNumber?: string;
  scheduledDate?: Date;
  completedDate?: Date;
  technicianId?: string;
  technicianName?: string;
  location?: string;
  notes?: string;
  images: ServiceImage[];
  signature?: string; // Base64-encoded signature
  checklistItems: ChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceLogEntry {
  id: string;
  serviceCaseId: string;
  type: 'note' | 'status_update' | 'action' | 'photo' | 'measurement' | 'part_replaced' | 'test_result';
  title: string;
  content: string;
  images?: string[]; // URIs to images
  timestamp: Date;
  technicianId?: string;
  technicianName?: string;
  location?: string;
  tags?: string[]; // For categorizing entries
  isImportant?: boolean; // Mark important entries
}

// Extended interface for display purposes in ServiceLogListScreen
export interface ServiceLogDisplay extends ServiceLogEntry {
  customer?: string;
  date?: Date;
  summary?: string;
  technician?: string;
  typeIcon?: string;
}

export interface ServiceImage {
  id: string;
  serviceCaseId: string;
  uri: string;
  description?: string;
  type: 'damage' | 'serial_number' | 'before_service' | 'after_service' | 'other';
  createdAt: Date;
}

export interface Technician {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

export interface ServiceReminder {
  id: string;
  customerId: string;
  serviceCaseId?: string;
  title: string;
  description?: string;
  dueDate: Date;
  isCompleted: boolean;
  completedAt?: Date;
  priority: 'low' | 'medium' | 'high';
  equipmentType?: 'viper' | 'powertraxx' | 'other';
  equipmentSerialNumber?: string;
  createdAt: Date;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: { 
    screen?: keyof MainTabParamList; 
    params?: Record<string, unknown>;
  };
  Dashboard: undefined;
  Products: undefined;
  Reminders: undefined;
  ServiceCaseDetail: { serviceCaseId: string };
  ServiceLog: { serviceCaseId: string };
  ServiceLogList: undefined;
  NewServiceLogEntry: { 
    serviceCaseId: string; 
    prefillData?: { title: string; content: string; }
  };
  EditServiceLogEntry: { entryId: string; serviceCaseId: string };
  NewServiceCase: undefined;
  EditServiceCase: { serviceCaseId: string };
  CustomerDetail: { customerId: string };
  NewCustomer: undefined;
  EditCustomer: { customerId: string };
  NewProduct: { customerId?: string };
  EditProduct: { productId: string };
  ProductDetail: { productId: string };
  CustomerArchive: undefined;
  Camera: { serviceCaseId: string; type: ServiceImage['type'] };
  Signature: { serviceCaseId: string };
  Settings: undefined;
  NewReminder: undefined;
  // Settings sub-screens
  Statistics: undefined;
  Notifications: undefined;
  ThemeSettings: undefined;
  ExportData: undefined;
  ImportData: undefined;
  Backup: undefined;
  About: undefined;
  Support: undefined;
  Terms: undefined;
  Privacy: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  ServiceCases: { initialFilter?: 'active' | 'completed' };
  ServiceLog: undefined;
  Reminders: undefined;
  Customers: undefined;
  Products: undefined;
  Settings: undefined;
};

// Navigation prop types
export type RootStackNavigationProp = import('@react-navigation/stack').StackNavigationProp<RootStackParamList>;
export type MainTabNavigationProp = import('@react-navigation/bottom-tabs').BottomTabNavigationProp<MainTabParamList>;

// Route prop types
export type RootStackRouteProp<T extends keyof RootStackParamList> = {
  key: string;
  name: T;
  params: RootStackParamList[T];
};
export type MainTabRouteProp<T extends keyof MainTabParamList> = {
  key: string;
  name: T;
  params: MainTabParamList[T];
}; 