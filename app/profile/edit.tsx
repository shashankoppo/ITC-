import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Save, User, MapPin, Phone, FileText } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, FONTS } from '@/constants/Theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, profile, refreshProfile } = useAuth();
  
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!fullName.trim()) {
      Alert.alert('Error', 'Full name is required');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          location: location.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDIT PROFILE</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading} style={styles.saveButton}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Save size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>PERSONAL DETAILS</Text>
            
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <User size={16} color={COLORS.textLight} />
                <Text style={styles.inputLabel}>FULL NAME</Text>
              </View>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <MapPin size={16} color={COLORS.textLight} />
                <Text style={styles.inputLabel}>LOCATION</Text>
              </View>
              <TextInput
                style={styles.input}
                value={location}
                onChangeText={setLocation}
                placeholder="City, Country"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Phone size={16} color={COLORS.textLight} />
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
              </View>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. +1 234 567 8900"
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.textLight}
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <FileText size={16} color={COLORS.textLight} />
                <Text style={styles.inputLabel}>BIO</Text>
              </View>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell others about yourself..."
                multiline
                numberOfLines={4}
                placeholderTextColor={COLORS.textLight}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSave}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitButtonText}>SAVE CHANGES</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.secondary,
  },
  headerTitle: {
    ...FONTS.h3,
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: '800',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  scrollContent: {
    padding: SPACING.md,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionLabel: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: SPACING.lg,
    color: COLORS.textLight,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  inputLabel: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  input: {
    ...FONTS.body,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingVertical: 10,
    color: COLORS.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: SPACING.md,
    borderRadius: 0,
  },
  submitButtonText: {
    ...FONTS.button,
    letterSpacing: 2,
  },
});
