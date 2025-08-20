import { Alert } from 'react-native';

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  static handle(error: any, context: string = 'App'): void {
    console.error(`${context} - Error:`, error);
    
    let message = 'Ett oväntat fel uppstod';
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    } else if (error?.message) {
      message = error.message;
    }
    
    Alert.alert('Fel', message);
  }
  
  static handleSilent(error: any, context: string = 'App'): void {
    console.error(`${context} - Silent Error:`, error);
    // Log error but don't show alert to user
  }
  
  static handleWithRetry(
    error: any, 
    context: string = 'App',
    retryAction?: () => void
  ): void {
    console.error(`${context} - Error with retry:`, error);
    
    let message = 'Ett fel uppstod. Vill du försöka igen?';
    
    if (error instanceof Error) {
      message = `${error.message}\n\nVill du försöka igen?`;
    }
    
    Alert.alert(
      'Fel',
      message,
      [
        { text: 'Avbryt', style: 'cancel' },
        { 
          text: 'Försök igen', 
          onPress: retryAction,
          style: 'default'
        }
      ]
    );
  }
  
  static validateRequired(value: any, fieldName: string): string | null {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return `${fieldName} är obligatoriskt`;
    }
    return null;
  }
  
  static validateEmail(email: string): string | null {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Ogiltig e-postadress';
    }
    return null;
  }
  
  static validatePhone(phone: string): string | null {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone)) {
      return 'Ogiltigt telefonnummer';
    }
    return null;
  }
} 