import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Camera, Image as ImageIcon, Zap, ArrowRight, 
  ChevronRight, Crown, Sparkles, Check, Info, Plus, MapPin
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { productApi, categoryApi } from '@/lib/api';
import { Category } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { MOCK_CATEGORIES } from '@/lib/mockData';

const conditions = [
  { label: 'Brand New', value: 'new' },
  { label: 'Like New', value: 'like_new' },
  { label: 'Good', value: 'good' },
  { label: 'Fair', value: 'fair' },
];

const adTiers = [
  { label: 'Free Ad', value: 'free', price: '₹0', desc: 'Active for 30 days', icon: ImageIcon },
  { label: 'Standard Boost', value: 'standard', price: '₹99', desc: '2x Visibility in feed', icon: Sparkles },
  { label: 'Premium Elite', value: 'premium', price: '₹499', desc: 'Top placement + Crown badge', icon: Crown },
];

export default function AddListingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [selectedAdTier, setSelectedAdTier] = useState('free');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category_id: '',
    condition: 'good',
    location: '',
    is_negotiable: true,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [activeProductsCount, setActiveProductsCount] = useState(0);

  useEffect(() => {
    loadCategories();
    if (user) {
      checkActiveListings();
    }
  }, [user]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      setCategories(MOCK_CATEGORIES);
    }
  };

  const checkActiveListings = async () => {
    if (!user) return;
    try {
      const count = await productApi.getUserActiveProductsCount(user.id);
      setActiveProductsCount(count);
    } catch {
      setActiveProductsCount(0);
    }
  };


  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Incomplete Form', 'Please fill in all mandatory fields.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setLoading(true);

    try {
      await productApi.createProduct({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category_id,
        condition: formData.condition as any,
        location: formData.location,
        is_negotiable: formData.is_negotiable,
        status: 'active',
        tier: selectedAdTier as any,
        images: [], // Images would be handled by imageUris param
      });

      setLoading(false);
      Alert.alert('Listing Active! 🚀', 'Your item is now live on SellAdv.com.', [
        { text: 'Great!', onPress: () => router.push('/(tabs)') }
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Post Failed', 'Could not activate your listing. Please try again.');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <View style={styles.headerTitleRow}>
              <ImageIcon size={24} color={COLORS.accent} />
              <Text style={styles.headerTitle}>Start Selling</Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
        <View style={styles.authPrompt}>
          <View style={styles.authIconCircle}>
            <Sparkles size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.authTitle}>Unlock Selling Power</Text>
          <Text style={styles.authSubtitle}>Join thousands of elite sellers across India. List your items in seconds.</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.signInBtnText}>Sign In to Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTitleRow}>
            <Plus size={24} color={COLORS.accent} />
            <View>
              <Text style={styles.headerTitle}>Create New Ad</Text>
              <Text style={styles.headerSubtitle}>Selling made simple for India</Text>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Photo Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Showcase your Item</Text>
          <TouchableOpacity style={styles.imageUploadArea} activeOpacity={0.8}>
            <LinearGradient
              colors={['rgba(35, 229, 219, 0.05)', 'rgba(255, 255, 255, 0.05)']}
              style={styles.imageUploadGradient}
            >
              <Camera size={40} color={COLORS.primary} strokeWidth={1.5} />
              <Text style={styles.imageUploadTitle}>Upload up to 12 Photos</Text>
              <Text style={styles.imageUploadHint}>High-quality photos get 3x more interest</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Ad Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Essential Information</Text>
          <View style={styles.detailsCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Title of your ad</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                placeholder="e.g. Pristine iPhone 15 Pro Max 256GB"
                placeholderTextColor={COLORS.textLight}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Pick a Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.chip, formData.category_id === category.id && styles.chipActive]}
                    onPress={() => {
                        Haptics.selectionAsync();
                        setFormData({ ...formData, category_id: category.id });
                    }}>
                    <Text style={[styles.chipText, formData.category_id === category.id && styles.chipTextActive]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Detailed Description</Text>
              <TextInput
                style={[styles.textArea, errors.description && styles.inputError]}
                placeholder="What makes your item special? List features and condition..."
                placeholderTextColor={COLORS.textLight}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        {/* Pricing & Location Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Value & Location</Text>
          <View style={styles.detailsCard}>
             <View style={styles.priceContainer}>
                <View style={styles.currencyFlag}>
                  <Text style={styles.currencySign}>₹</Text>
                </View>
                <TextInput
                  style={[styles.priceInput, errors.price && styles.inputError]}
                  placeholder="Ask Price"
                  placeholderTextColor={COLORS.textLight}
                  value={formData.price}
                  onChangeText={(text) => setFormData({ ...formData, price: text })}
                  keyboardType="numeric"
                />
                <TouchableOpacity 
                  style={[styles.negotiableBox, formData.is_negotiable && styles.negotiableBoxActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFormData({ ...formData, is_negotiable: !formData.is_negotiable });
                  }}
                >
                  <Text style={[styles.negotiableText, formData.is_negotiable && styles.negotiableTextActive]}>
                    NEGOTIABLE
                  </Text>
                </TouchableOpacity>
             </View>

             <View style={[styles.inputGroup, { marginTop: 20 }]}>
                <Text style={styles.inputLabel}>Product Location</Text>
                <View style={styles.locationWrapper}>
                  <MapPin size={18} color={COLORS.primary} style={styles.locationIcon} />
                  <TextInput
                    style={[styles.locationInput, errors.location && styles.inputError]}
                    placeholder="e.g. Bandra, Mumbai"
                    placeholderTextColor={COLORS.textLight}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />
                </View>
             </View>
          </View>
        </View>

        {/* Premium Boost Options */}
        <View style={styles.section}>
          <View style={styles.tierHeader}>
            <Text style={styles.sectionHeading}>Elite Visibility Packs</Text>
            <View style={styles.safetyInfo}>
                <Info size={14} color={COLORS.primary} />
                <Text style={styles.safetyText}>Sell 4x faster with premium</Text>
            </View>
          </View>

          {adTiers.map((tier) => {
            const isFreeDisabled = tier.value === 'free' && activeProductsCount >= 1;
            const isSelected = selectedAdTier === tier.value;
            const Icon = tier.icon;
            
            return (
              <TouchableOpacity
                key={tier.value}
                style={[
                  styles.tierCard, 
                  isSelected && styles.tierCardActive,
                  isFreeDisabled && styles.tierCardDisabled,
                  tier.value === 'premium' && isSelected && styles.premiumSelected
                ]}
                onPress={() => {
                   if (!isFreeDisabled) {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setSelectedAdTier(tier.value);
                   }
                }}
                disabled={isFreeDisabled}>
                
                <View style={[styles.tierIconBox, isSelected && styles.tierIconBoxActive]}>
                  <Icon size={24} color={isSelected ? COLORS.white : COLORS.primary} strokeWidth={2} />
                </View>

                <View style={styles.tierMain}>
                  <View style={styles.tierTitleRow}>
                    <Text style={[styles.tierTitle, isSelected && styles.tierTitleActive]}>{tier.label}</Text>
                    {tier.value === 'premium' && (
                        <View style={styles.recommendedBadge}>
                            <Text style={styles.recommendedText}>ELITE CHOICE</Text>
                        </View>
                    )}
                  </View>
                  <Text style={styles.tierSubtitle}>{isFreeDisabled ? 'Free listing used' : tier.desc}</Text>
                </View>

                <View style={styles.tierRight}>
                   <Text style={[styles.tierPriceText, isSelected && styles.tierPriceActive]}>{tier.price}</Text>
                   {isSelected && <Check size={18} color={COLORS.primary} strokeWidth={3} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit Action */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}>
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDark]}
            style={styles.submitGradient}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Launch Your Ad</Text>
                <ArrowRight size={20} color={COLORS.primary} strokeWidth={2.5} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.termsBox}>
           <Text style={styles.termsText}>By posting, you agree to SellAdv.com's elite seller guidelines.</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    gap: 12,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    fontSize: 22,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  section: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  imageUploadArea: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    elevation: 3,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  imageUploadGradient: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(35, 229, 219, 0.2)',
    borderStyle: 'dashed',
    borderRadius: RADIUS.lg,
  },
  imageUploadTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 12,
  },
  imageUploadHint: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    opacity: 0.7,
  },
  input: {
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    fontWeight: '600',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  textArea: {
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    minHeight: 140,
    fontWeight: '500',
  },
  chipRow: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  currencyFlag: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencySign: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.accent,
  },
  priceInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
  },
  negotiableBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.xs,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
  },
  negotiableBoxActive: {
    backgroundColor: COLORS.secondary + '20',
    borderColor: COLORS.secondaryDark,
  },
  negotiableText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textLight,
  },
  negotiableTextActive: {
    color: COLORS.secondaryDark,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 12,
  },
  locationIcon: {
    marginRight: 10,
  },
  locationInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    paddingVertical: 14,
    fontWeight: '600',
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  safetyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  safetyText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: 12,
    elevation: 3,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  tierCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.white,
  },
  premiumSelected: {
    backgroundColor: 'rgba(35, 229, 219, 0.05)',
  },
  tierCardDisabled: {
    opacity: 0.5,
    backgroundColor: COLORS.surface,
  },
  tierIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tierIconBoxActive: {
    backgroundColor: COLORS.primary,
  },
  tierMain: {
    flex: 1,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  tierTitleActive: {
    color: COLORS.primary,
  },
  recommendedBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  recommendedText: {
    fontSize: 8,
    fontWeight: '900',
    color: COLORS.accent,
  },
  tierSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  tierRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  tierPriceText: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },
  tierPriceActive: {
    color: COLORS.primary,
  },
  submitButton: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: COLORS.accentDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    gap: 12,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: -0.2,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  termsBox: {
    marginTop: 20,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  authPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  authIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  authTitle: {
    ...FONTS.h2,
    fontSize: 24,
    marginBottom: 12,
    color: COLORS.primary,
  },
  authSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  signInBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: RADIUS.md,
  },
  signInBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
});
