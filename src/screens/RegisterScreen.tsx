import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button } from 'react-native-paper';
import { COLORS } from '../constants';
import { useAuth } from '../contexts/AuthContext';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const { register, isLoading } = useAuth();

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || !authCode.trim()) {
      Alert.alert('Fel', 'Vänligen fyll i alla fält');
      return;
    }

    if (authCode.trim().toLowerCase() !== 'ferno2018') {
      Alert.alert('Fel', 'Fel autentiseringskod');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Fel', 'Lösenorden matchar inte');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Fel', 'Lösenordet måste vara minst 6 tecken långt');
      return;
    }

    try {
      await register({
        firstName,
        lastName,
        email,
        password,
      });
      
      // AuthContext hanterar automatiskt navigation till Main
      Alert.alert('Framgång', 'Kontot har skapats och du är nu inloggad!');
    } catch (error) {
      Alert.alert('Fel', error instanceof Error ? error.message : 'Registreringen misslyckades. Försök igen.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Tillbaka</Text>
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Text style={styles.logoText}>FN</Text>
              </View>
            </View>
            <Text style={styles.appTitle}>Ferno Norden Service</Text>
            <Text style={styles.title}>Skapa konto</Text>
            <Text style={styles.subtitle}>Fyll i dina uppgifter för att komma igång</Text>
          </View>

          {/* Register Form */}
          <View style={styles.form}>
            <View style={styles.nameRow}>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput
                  label="Förnamn"
                  value={firstName}
                  onChangeText={setFirstName}
                  mode="outlined"
                  style={styles.input}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                  disabled={isLoading}
                />
              </View>
              <View style={[styles.inputContainer, styles.halfWidth]}>
                <TextInput
                  label="Efternamn"
                  value={lastName}
                  onChangeText={setLastName}
                  mode="outlined"
                  style={styles.input}
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                  disabled={isLoading}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="E-post"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="email-outline" />}
                disabled={isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Lösenord"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
                disabled={isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Bekräfta lösenord"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                mode="outlined"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="lock-outline" />}
                right={
                  <TextInput.Icon 
                    icon={showConfirmPassword ? "eye-off" : "eye"} 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  />
                }
                disabled={isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                label="Autentiseringskod"
                value={authCode}
                onChangeText={setAuthCode}
                mode="outlined"
                style={styles.input}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                left={<TextInput.Icon icon="key-variant" />}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                disabled={isLoading}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={isLoading}
              disabled={isLoading}
              style={styles.registerButton}
              contentStyle={styles.registerButtonContent}
              labelStyle={styles.registerButtonText}
            >
              {isLoading ? 'Skapar konto...' : 'Skapa konto'}
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Har du redan ett konto?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Logga in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textInverse,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: 32,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    flex: 1,
  },
  input: {
    backgroundColor: COLORS.surface,
    fontSize: 16,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  registerButtonContent: {
    paddingVertical: 8,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
}); 