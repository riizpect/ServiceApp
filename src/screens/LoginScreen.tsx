import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/auth';
import { RootStackNavigationProp } from '../types';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const { login } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fel', 'Fyll i både e-post och lösenord');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ett fel uppstod vid inloggning';
      Alert.alert('Inloggningsfel', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  // Test-funktion för lösenordshashning (endast för utveckling)
  const testPasswordHashing = async () => {
    try {
      await authService.testPasswordHashing();
      Alert.alert('Test Slutfört', 'Kolla konsolen för resultat');
    } catch (error) {
      Alert.alert('Test Fel', 'Ett fel uppstod vid testning');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>ServiceApp</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Logga in för att komma åt dina serviceärenden
          </Text>

          <View style={styles.form}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              placeholder="E-post"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.surface, 
                color: colors.text,
                borderColor: colors.border 
              }]}
              placeholder="Lösenord"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Loggar in...' : 'Logga in'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={[styles.registerButtonText, { color: colors.primary }]}>
                Skapa nytt konto
              </Text>
            </TouchableOpacity>

            {/* Test-knapp för utveckling */}
            <TouchableOpacity
              style={[styles.testButton, { backgroundColor: colors.secondary }]}
              onPress={testPasswordHashing}
            >
              <Text style={styles.testButtonText}>
                🧪 Testa Lösenordshashning
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
  },
  form: {
    marginTop: 40,
  },
  input: {
    backgroundColor: 'transparent', // This will be overridden by inline style
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: 'transparent', // This will be overridden by inline style
    borderWidth: 2,
    borderColor: 'transparent', // This will be overridden by inline style
    shadowColor: 'transparent', // This will be overridden by inline style
    shadowOffset: { width: 0, height: 0 }, // This will be overridden by inline style
    shadowOpacity: 0, // This will be overridden by inline style
    shadowRadius: 0, // This will be overridden by inline style
    elevation: 0, // This will be overridden by inline style
  },
  loginButton: {
    backgroundColor: 'transparent', // This will be overridden by inline style
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: 'transparent', // This will be overridden by inline style
    shadowOffset: { width: 0, height: 0 }, // This will be overridden by inline style
    shadowOpacity: 0, // This will be overridden by inline style
    shadowRadius: 0, // This will be overridden by inline style
    elevation: 0, // This will be overridden by inline style
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: 'transparent', // This will be overridden by inline style
    letterSpacing: 0.5,
  },
  registerButton: {
    backgroundColor: 'transparent', // This will be overridden by inline style
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent', // This will be overridden by inline style
    shadowColor: 'transparent', // This will be overridden by inline style
    shadowOffset: { width: 0, height: 0 }, // This will be overridden by inline style
    shadowOpacity: 0, // This will be overridden by inline style
    shadowRadius: 0, // This will be overridden by inline style
    elevation: 0, // This will be overridden by inline style
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'transparent', // This will be overridden by inline style
  },
  testButton: {
    backgroundColor: 'transparent', // This will be overridden by inline style
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: 'transparent', // This will be overridden by inline style
    shadowOffset: { width: 0, height: 0 }, // This will be overridden by inline style
    shadowOpacity: 0, // This will be overridden by inline style
    shadowRadius: 0, // This will be overridden by inline style
    elevation: 0, // This will be overridden by inline style
  },
  testButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'transparent', // This will be overridden by inline style
  },
}); 