import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'technician' | 'admin';
  isActive: boolean;
  createdAt: Date;
  password: string; // Lägg till lösenord för demo
}

class AuthService {
  private readonly USER_KEY = '@ServiceApp:user';
  private readonly TOKEN_KEY = '@ServiceApp:token';
  private readonly USERS_KEY = '@ServiceApp:users';

  // Hämta alla användare från AsyncStorage
  private async getAllUsers(): Promise<User[]> {
    const data = await AsyncStorage.getItem(this.USERS_KEY);
    if (!data) {
      // Om ingen användare finns, skapa demo-konto
      const demoUser: User = {
        id: '1',
        email: 'demo@ferno.se',
        firstName: 'Demo',
        lastName: 'Tekniker',
        role: 'technician',
        isActive: true,
        createdAt: new Date(),
        password: 'password',
      };
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify([demoUser]));
      return [demoUser];
    }
    const users = JSON.parse(data);
    // Konvertera datumsträngar till Date-objekt
    return users.map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) }));
  }

  // Spara alla användare
  private async saveAllUsers(users: User[]): Promise<void> {
    await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const users = await this.getAllUsers();
    const user = users.find(u => u.email === email);
    if (!user || user.password !== password) {
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
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'technician',
      isActive: true,
      createdAt: new Date(),
      password: userData.password,
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
}

export const authService = new AuthService(); 