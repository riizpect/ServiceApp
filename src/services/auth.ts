import AsyncStorage from '@react-native-async-storage/async-storage';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'technician' | 'admin';
  isActive: boolean;
  createdAt: Date;
  password: string; // Nu hashat lösenord
}

class AuthService {
  private readonly USER_KEY = '@ServiceApp:user';
  private readonly TOKEN_KEY = '@ServiceApp:token';
  private readonly USERS_KEY = '@ServiceApp:users';
  private readonly SALT_ROUNDS = 12; // Rekommenderat antal salt rounds för bcrypt

  // Hasha lösenord säkert
  private async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Jämför lösenord med hash
  private async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Migrera befintliga användare med klartext-lösenord till hashade
  private async migrateUserPasswords(users: User[]): Promise<User[]> {
    const migratedUsers = [];
    
    for (const user of users) {
      // Kontrollera om lösenordet redan är hashat (bcrypt hash börjar med $2a$ eller $2b$)
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        migratedUsers.push(user);
      } else {
        // Hasha klartext-lösenord
        const hashedPassword = await this.hashPassword(user.password);
        migratedUsers.push({
          ...user,
          password: hashedPassword
        });
      }
    }
    
    return migratedUsers;
  }

  // Hämta alla användare från AsyncStorage
  private async getAllUsers(): Promise<User[]> {
    const data = await AsyncStorage.getItem(this.USERS_KEY);
    if (!data) {
      // Om ingen användare finns, skapa demo-konto med hashat lösenord
      const hashedPassword = await this.hashPassword('password');
      const demoUser: User = {
        id: '1',
        email: 'demo@ferno.se',
        firstName: 'Demo',
        lastName: 'Tekniker',
        role: 'technician',
        isActive: true,
        createdAt: new Date(),
        password: hashedPassword,
      };
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify([demoUser]));
      return [demoUser];
    }
    
    let users = JSON.parse(data);
    // Konvertera datumsträngar till Date-objekt
    users = users.map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) }));
    
    // Migrera lösenord om nödvändigt
    users = await this.migrateUserPasswords(users);
    
    // Spara migrerade användare
    await this.saveAllUsers(users);
    
    return users;
  }

  // Spara alla användare
  private async saveAllUsers(users: User[]): Promise<void> {
    await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Felaktig e-post eller lösenord');
    }
    
    // Jämför lösenord säkert
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Felaktig e-post eller lösenord');
    }
    
    const token = `mock_token_${user.id}_${Date.now()}`;
    await this.saveUser(user);
    await this.saveToken(token);
    return { user, token };
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const users = await this.getAllUsers();
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      throw new Error('En användare med denna e-post finns redan');
    }
    
    // Hasha lösenord säkert
    const hashedPassword = await this.hashPassword(userData.password);
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'technician',
      isActive: true,
      createdAt: new Date(),
      password: hashedPassword,
    };
    
    users.push(newUser);
    await this.saveAllUsers(users);
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    await this.saveUser(newUser);
    await this.saveToken(token);
    return { user: newUser, token };
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([this.USER_KEY, this.TOKEN_KEY]);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  private async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  private async saveToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
      throw error;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Publik metod för att hämta alla användare (utan lösenord)
  async getAllUsersPublic(): Promise<Omit<User, 'password'>[]> {
    const users = await this.getAllUsers();
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  // Test-metod för att verifiera lösenordshashning (endast för utveckling)
  async testPasswordHashing(): Promise<void> {
    console.log('🧪 Testing password hashing...');
    
    const testPassword = 'test123';
    const hashedPassword = await this.hashPassword(testPassword);
    
    console.log('Original password:', testPassword);
    console.log('Hashed password:', hashedPassword);
    console.log('Hash starts with $2a$:', hashedPassword.startsWith('$2a$'));
    
    const isValid = await this.comparePassword(testPassword, hashedPassword);
    console.log('Password comparison result:', isValid);
    
    const isInvalid = await this.comparePassword('wrongpassword', hashedPassword);
    console.log('Wrong password comparison result:', isInvalid);
    
    console.log('✅ Password hashing test completed');
  }
}

export const authService = new AuthService(); 