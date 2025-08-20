import { Customer, Product, ServiceCase, ServiceReminder } from '../types';

export class Validation {
  // Customer validation
  static validateCustomer(customer: Partial<Customer>): string[] {
    const errors: string[] = [];
    
    if (!customer.name?.trim()) {
      errors.push('Kundnamn är obligatoriskt');
    }
    
    if (!customer.address?.trim()) {
      errors.push('Adress är obligatorisk');
    }
    
    if (!customer.phone?.trim()) {
      errors.push('Telefonnummer är obligatoriskt');
    }
    
    if (customer.email && !this.isValidEmail(customer.email)) {
      errors.push('Ogiltig e-postadress');
    }
    
    return errors;
  }
  
  // Product validation
  static validateProduct(product: Partial<Product>): string[] {
    const errors: string[] = [];
    
    if (!product.name?.trim()) {
      errors.push('Produktnamn är obligatoriskt');
    }
    
    if (!product.categoryId) {
      errors.push('Kategori är obligatorisk');
    }
    
    if (!product.serialNumber?.trim()) {
      errors.push('Serienummer är obligatoriskt');
    }
    
    if (!product.type) {
      errors.push('Typ är obligatorisk');
    }
    
    return errors;
  }
  
  // Service case validation
  static validateServiceCase(serviceCase: Partial<ServiceCase>): string[] {
    const errors: string[] = [];
    
    if (!serviceCase.customerId) {
      errors.push('Kund är obligatorisk');
    }
    
    if (!serviceCase.title?.trim()) {
      errors.push('Titel är obligatorisk');
    }
    
    if (!serviceCase.description?.trim()) {
      errors.push('Beskrivning är obligatorisk');
    }
    
    if (!serviceCase.status) {
      errors.push('Status är obligatorisk');
    }
    
    if (!serviceCase.priority) {
      errors.push('Prioritet är obligatorisk');
    }
    
    if (!serviceCase.equipmentType) {
      errors.push('Utrustningstyp är obligatorisk');
    }
    
    return errors;
  }
  
  // Reminder validation
  static validateReminder(reminder: Partial<ServiceReminder>): string[] {
    const errors: string[] = [];
    
    if (!reminder.customerId) {
      errors.push('Kund är obligatorisk');
    }
    
    if (!reminder.title?.trim()) {
      errors.push('Titel är obligatorisk');
    }
    
    if (!reminder.dueDate) {
      errors.push('Förfallodatum är obligatoriskt');
    }
    
    if (!reminder.priority) {
      errors.push('Prioritet är obligatorisk');
    }
    
    return errors;
  }
  
  // Utility validation methods
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 6;
  }
  
  static isValidSerialNumber(serialNumber: string): boolean {
    return serialNumber.trim().length >= 3;
  }
  
  static isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
  
  static isFutureDate(date: Date): boolean {
    return this.isValidDate(date) && date > new Date();
  }
  
  static isPastDate(date: Date): boolean {
    return this.isValidDate(date) && date < new Date();
  }
  
  // Sanitize input
  static sanitizeString(input: string): string {
    return input.trim().replace(/\s+/g, ' ');
  }
  
  static sanitizePhone(phone: string): string {
    return phone.replace(/[^\d\s\-\+\(\)]/g, '');
  }
  
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
} 