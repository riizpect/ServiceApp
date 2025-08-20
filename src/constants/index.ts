// App-konstanter
export const APP_NAME = 'ServiceApp';

// Enterprise-grade färgpalett för Ferno Norden ServiceApp
export const COLORS = {
  // Primära färger - Ferno branding
  primary: '#E31837', // Ferno röd
  primaryLight: '#FF1F3D',
  primaryDark: '#B31414',
  
  // Sekundära färger - Professionella toner
  secondary: '#2C3E50', // Mörk blå-grå
  secondaryLight: '#34495E',
  accent: '#3498DB', // Ljusblå accent
  
  // Bakgrundsfärger - Eleganta toner
  background: '#F8FAFC', // Mycket ljusgrå bakgrund
  surface: '#FFFFFF', // Ren vit
  surfaceSecondary: '#F1F5F9', // Ljusgrå yta
  surfaceTertiary: '#E2E8F0', // Medium grå yta
  
  // Textfärger - Professionell typografi
  text: '#1E293B', // Mörk text
  textSecondary: '#64748B', // Medium grå text
  textTertiary: '#94A3B8', // Ljusgrå text
  textInverse: '#FFFFFF', // Vit text
  
  // Statusfärger - Mjuka toner
  success: '#10B981', // Grön
  successLight: '#34D399',
  warning: '#F59E0B', // Orange
  warningLight: '#FBBF24',
  error: '#EF4444', // Röd
  errorLight: '#F87171',
  info: '#3B82F6', // Blå
  infoLight: '#60A5FA',
  
  // Gränser och skuggor - Subtila
  border: '#E2E8F0', // Ljusgrå border
  borderLight: '#F1F5F9', // Mycket ljus border
  borderDark: '#CBD5E1', // Mörkare border
  shadow: 'rgba(0, 0, 0, 0.04)', // Mycket mjuk skugga
  shadowMedium: 'rgba(0, 0, 0, 0.08)', // Medium skugga
  shadowStrong: 'rgba(0, 0, 0, 0.12)', // Starkare skugga
  
  // Övriga
  overlay: 'rgba(0, 0, 0, 0.3)', // Mjuk overlay
  disabled: '#CBD5E1', // Grå för inaktiverade element
  
  // Gradient och specialfärger
  gradientStart: '#E31837',
  gradientEnd: '#B31414',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
  
  // Ferno-specifika färger
  fernoRed: '#E31837',
  fernoRedLight: '#FF1F3D',
  fernoRedDark: '#B31414',
};

// Status färger - Anpassade för röd/svart tema
export const STATUS_COLORS = {
  pending: COLORS.warning,
  in_progress: COLORS.primary,
  completed: COLORS.success,
  cancelled: COLORS.error,
} as const;

// Prioritet färger - Anpassade för röd/svart tema
export const PRIORITY_COLORS = {
  low: COLORS.textTertiary,
  medium: COLORS.warning,
  high: COLORS.primary,
  urgent: COLORS.error,
} as const;

// Equipment typer
export const EQUIPMENT_TYPES = {
  viper: 'Ferno VIPER',
  powertraxx: 'Transcend PowerTraxx',
  transcend: 'Transcend',
  fixed: 'Fast',
  other: 'Annan',
} as const;

// Produktkategorier
export const PRODUCT_CATEGORIES = {
  stretchers: 'Bårar',
  chairs: 'Stolar',
  accessories: 'Tillbehör',
  other: 'Övrigt',
} as const;

export const PRODUCT_CATEGORY_ICONS = {
  stretchers: 'medical-bag',
  chairs: 'seat',
  accessories: 'puzzle',
  other: 'help-circle-outline',
} as const;

export const PRODUCT_CATEGORY_COLORS = {
  stretchers: '#EF4444', // Red
  chairs: '#3B82F6',     // Blue
  accessories: '#10B981', // Green
  other: '#6B7280',      // Gray
} as const;

// Checklist kategorier
export const CHECKLIST_CATEGORIES = {
  safety: 'Säkerhet',
  maintenance: 'Underhåll',
  inspection: 'Inspektion',
  documentation: 'Dokumentation',
} as const;

// Bild typer
export const IMAGE_TYPES = {
  damage: 'Skada',
  serial_number: 'Serienummer',
  before_service: 'Före service',
  after_service: 'Efter service',
  other: 'Annan',
} as const;

export const SERVICE_LOG_TYPES = {
  note: 'Anteckning',
  status_update: 'Statusuppdatering',
  action: 'Åtgärd',
  photo: 'Foto',
  measurement: 'Mätning',
  part_replaced: 'Del bytt',
  test_result: 'Testresultat',
} as const;

export const SERVICE_LOG_ICONS = {
  note: 'note-text',
  status_update: 'update',
  action: 'wrench',
  photo: 'camera',
  measurement: 'ruler',
  part_replaced: 'package-variant',
  test_result: 'check-circle',
} as const;

export const SERVICE_LOG_COLORS = {
  note: '#3B82F6',        // Blue
  status_update: '#10B981', // Green
  action: '#F59E0B',      // Orange
  photo: '#8B5CF6',       // Purple
  measurement: '#06B6D4', // Cyan
  part_replaced: '#EF4444', // Red
  test_result: '#059669', // Dark Green
} as const;

// Standard checklista för VIPER
export const VIPER_CHECKLIST = [
  { title: 'Kontrollera batteriets laddning', category: 'safety' as const, order: 1 },
  { title: 'Testa bromsfunktion', category: 'safety' as const, order: 2 },
  { title: 'Kontrollera hjul och däck', category: 'inspection' as const, order: 3 },
  { title: 'Testa lyftfunktion', category: 'maintenance' as const, order: 4 },
  { title: 'Kontrollera kablar och kontakter', category: 'inspection' as const, order: 5 },
  { title: 'Rengöra och smörja rörliga delar', category: 'maintenance' as const, order: 6 },
  { title: 'Dokumentera serienummer', category: 'documentation' as const, order: 7 },
  { title: 'Ta bilder av eventuella skador', category: 'documentation' as const, order: 8 },
];

// Standard checklista för PowerTraxx
export const POWERTRAXX_CHECKLIST = [
  { title: 'Kontrollera batteriets laddning', category: 'safety' as const, order: 1 },
  { title: 'Testa rullfunktion', category: 'safety' as const, order: 2 },
  { title: 'Kontrollera hjul och däck', category: 'inspection' as const, order: 3 },
  { title: 'Testa stolens funktioner', category: 'maintenance' as const, order: 4 },
  { title: 'Kontrollera kablar och kontakter', category: 'inspection' as const, order: 5 },
  { title: 'Rengöra och smörja rörliga delar', category: 'maintenance' as const, order: 6 },
  { title: 'Dokumentera serienummer', category: 'documentation' as const, order: 7 },
  { title: 'Ta bilder av eventuella skador', category: 'documentation' as const, order: 8 },
];

// Navigation routes
export const ROUTES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  MAIN: 'Main',
  DASHBOARD: 'Dashboard',
  SERVICE_CASES: 'ServiceCases',
  CUSTOMERS: 'Customers',
  PRODUCTS: 'Products',
  REMINDERS: 'Reminders',
  SETTINGS: 'Settings',
  SERVICE_CASE_DETAIL: 'ServiceCaseDetail',
  SERVICE_LOG: 'ServiceLog',
  NEW_SERVICE_LOG_ENTRY: 'NewServiceLogEntry',
  EDIT_SERVICE_LOG_ENTRY: 'EditServiceLogEntry',
  NEW_SERVICE_CASE: 'NewServiceCase',
  EDIT_SERVICE_CASE: 'EditServiceCase',
  CUSTOMER_DETAIL: 'CustomerDetail',
  NEW_CUSTOMER: 'NewCustomer',
  EDIT_CUSTOMER: 'EditCustomer',
  NEW_PRODUCT: 'NewProduct',
  EDIT_PRODUCT: 'EditProduct',
  PRODUCT_DETAIL: 'ProductDetail',
  CAMERA: 'Camera',
  SIGNATURE: 'Signature',
} as const; 