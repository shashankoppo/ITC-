import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>SellAdv.com</Text>
            <Text style={styles.tagline}>Buy & Sell across India</Text>
          </View>

          {/* Welcome */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeTitle}>Welcome back</Text>
            <Text style={styles.welcomeSubtitle}>Sign in to continue buying and selling</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputContainer}>
                <Mail size={18} color={COLORS.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  placeholderTextColor={COLORS.textLight}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Lock size={18} color={COLORS.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  placeholderTextColor={COLORS.textLight}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={18} color={COLORS.textLight} />
                  ) : (
                    <Eye size={18} color={COLORS.textLight} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity>
              <Text style={styles.forgotPassword}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.9}>
              {loading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Login</Text>
                  <ArrowRight size={18} color={COLORS.primary} strokeWidth={2.5} />
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginTop: 50,
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  welcomeSection: {
    marginBottom: 30,
  },
  welcomeTitle: {
    ...FONTS.h1,
    fontSize: 26,
  },
  welcomeSubtitle: {
    ...FONTS.caption,
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.sm,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    height: 52,
    gap: 12,
  },
  input: {
    flex: 1,
    ...FONTS.body,
    fontSize: 15,
    color: COLORS.text,
  },
  forgotPassword: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 24,
  },
  loginButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.accent,
    height: 54,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...FONTS.button,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  signupLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});