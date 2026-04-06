import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Save, Trash2, ChevronDown } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, FONTS } from '@/constants/Theme';

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    condition: 'used_good',
    is_negotiable: false,
    category_id: '',
  });

  useEffect(() => {
    if (id) {
      loadListing();
    }
  }, [id]);

  const loadListing = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data.user_id !== user?.id) {
        Alert.alert('Unauthorized', 'You do not have permission to edit this listing');
        router.back();
        return;
      }

      setForm({
        title: data.title,
        description: data.description || '',
        price: data.price.toString(),
        location: data.location || '',
        condition: data.condition || 'used_good',
        is_negotiable: data.is_negotiable || false,
        category_id: data.category_id,
      });
    } catch (error) {
      console.error('Error loading listing:', error);
      Alert.alert('Error', 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title || !form.price) {
      Alert.alert('Error', 'Title and price are required');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          location: form.location,
          condition: form.condition,
          is_negotiable: form.is_negotiable,
        })
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Success', 'Listing updated successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      console.error('Error updating listing:', error);
      Alert.alert('Error', error.message || 'Failed to update listing');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to delete this listing? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const { error } = await supabase
                .from('products')
                .delete()
                .eq('id', id);

              if (error) throw error;

              Alert.alert('Success', 'Listing deleted');
              router.replace('/(tabs)/profile');
            } catch (error: any) {
              console.error('Error deleting listing:', error);
              Alert.alert('Error', 'Failed to delete listing');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EDIT OBJECT</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          disabled={saving}
          style={styles.headerBtn}>
          {saving ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Save size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>OBJECT TITLE</Text>
            <TextInput
              style={styles.input}
              value={form.title}
              onChangeText={(text) => setForm({ ...form, title: text })}
              placeholder="e.g. Mid-Century Modern Chair"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>PRICE (USD)</Text>
              <TextInput
                style={styles.input}
                value={form.price}
                onChangeText={(text) => setForm({ ...form, price: text.replace(/[^0-9.]/g, '') })}
                placeholder="0.00"
                keyboardType="decimal-pad"
                placeholderTextColor={COLORS.textLight}
              />
            </View>
            <View style={styles.negotiableContainer}>
              <Text style={styles.label}>NEGOTIABLE</Text>
              <Switch
                value={form.is_negotiable}
                onValueChange={(val) => setForm({ ...form, is_negotiable: val })}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>LOCATION</Text>
            <TextInput
              style={styles.input}
              value={form.location}
              onChangeText={(text) => setForm({ ...form, location: text })}
              placeholder="City, State"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CONDITION</Text>
            <TouchableOpacity style={styles.selectInput}>
              <Text style={styles.selectText}>{form.condition.replace('_', ' ').toUpperCase()}</Text>
              <ChevronDown size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>PROVENANCE & DESCRIPTION</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={form.description}
              onChangeText={(text) => setForm({ ...form, description: text })}
              placeholder="Describe the object's history, condition, and details..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              placeholderTextColor={COLORS.textLight}
            />
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={deleting}>
            {deleting ? (
              <ActivityIndicator size="small" color={COLORS.error} />
            ) : (
              <>
                <Trash2 size={18} color={COLORS.error} />
                <Text style={styles.deleteButtonText}>REMOVE FROM COLLECTION</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.saveButtonText}>UPDATE OBJECT</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.secondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    ...FONTS.h3,
    fontSize: 12,
    letterSpacing: 3,
  },
  headerBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  form: {
    padding: SPACING.md,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.lg,
  },
  label: {
    ...FONTS.caption,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
    color: COLORS.primary,
  },
  input: {
    ...FONTS.body,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  selectText: {
    ...FONTS.body,
    fontSize: 14,
    fontWeight: '600',
  },
  negotiableContainer: {
    paddingBottom: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: COLORS.error,
    borderStyle: 'dashed',
    gap: 8,
  },
  deleteButtonText: {
    ...FONTS.caption,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.error,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    ...FONTS.button,
    letterSpacing: 2,
  },
});
