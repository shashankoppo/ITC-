import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle2, Crown, ShieldCheck, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

const PLANS = [
  {
    id: 'standard',
    title: 'Standard Boost',
    price: 99,
    days: 7,
    features: ['Top of category search', 'Sponsored tag'],
    color: '#10B981',
    icon: Zap,
  },
  {
    id: 'premium',
    title: 'Premium Ad',
    price: 499,
    days: 30,
    features: ['Homepage Premium Slider', 'Top of all searches', 'Premium Crown icon', '2x larger photos'],
    color: COLORS.accent,
    icon: Crown,
    popular: true,
  },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!productId) {
      Alert.alert('Error', 'No product selected.');
      return;
    }

    setProcessing(true);

    try {
      // Simulate network request / payment gateway
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update product tier
      const { error } = await supabase
        .from('products')
        .update({ tier: selectedPlan, is_featured: true })
        .eq('id', productId);

      if (error) throw error;

      Alert.alert('Payment Successful!', 'Your ad has been boosted.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Something went wrong.');
    } finally {
      setProcessing(false);
    }
  };

  const planInfo = PLANS.find(p => p.id === selectedPlan);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => !processing && router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Boost Your Ad</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Get up to 10x more buyers quickly.</Text>
        
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  isSelected && { borderColor: plan.color }
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.9}
              >
                {plan.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: plan.color }]}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                <View style={styles.planHeader}>
                  <View style={[styles.iconBox, { backgroundColor: plan.color + '20' }]}>
                    <plan.icon size={24} color={plan.color === COLORS.accent ? COLORS.primary : plan.color} />
                  </View>
                  <View style={styles.planTitleBox}>
                    <Text style={styles.planTitle}>{plan.title}</Text>
                    <Text style={styles.planDays}>Valid for {plan.days} days</Text>
                  </View>
                  <Text style={styles.planPrice}>₹{plan.price}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.features}>
                  {plan.features.map((feature, idx) => (
                    <View key={idx} style={styles.featureRow}>
                      <CheckCircle2 size={16} color={plan.color === COLORS.accent ? COLORS.primary : plan.color} />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.secureBox}>
          <ShieldCheck size={20} color="#10B981" />
          <Text style={styles.secureText}>100% Secure Payment with SellAdv.com Trust</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Amount to pay</Text>
          <Text style={styles.totalValue}>₹{planInfo?.price}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, processing && { opacity: 0.7 }]}
          onPress={handleCheckout}
          disabled={processing}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.primaryDark]}
            style={styles.checkoutGradient}
          >
            {processing ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.checkoutBtnText}>Pay Securely</Text>
            )}
          </LinearGradient>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...FONTS.h2,
    fontSize: 18,
    color: COLORS.primary,
  },
  content: {
    padding: SPACING.lg,
  },
  subtitle: {
    ...FONTS.body,
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  plansContainer: {
    gap: SPACING.lg,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: '#FAFAFA',
    transform: [{ scale: 1.02 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  popularText: {
    ...FONTS.badge,
    fontSize: 10,
    color: COLORS.primary,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  planTitleBox: {
    flex: 1,
  },
  planTitle: {
    ...FONTS.h3,
    fontSize: 18,
    color: COLORS.text,
  },
  planDays: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  planPrice: {
    ...FONTS.h2,
    fontSize: 22,
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  features: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  secureBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: SPACING.xxl,
    padding: SPACING.md,
    backgroundColor: '#ECFDF5',
    borderRadius: RADIUS.sm,
  },
  secureText: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '600',
  },
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalLabel: {
    ...FONTS.h3,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  totalValue: {
    ...FONTS.price,
    fontSize: 24,
    color: COLORS.primary,
  },
  checkoutBtn: {
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  checkoutGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutBtnText: {
    ...FONTS.button,
    fontSize: 16,
    color: COLORS.white,
  },
});
