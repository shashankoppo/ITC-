import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, CreditCard, ShieldCheck, CheckCircle2, Zap, Crown } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { supabase } from '@/lib/supabase';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { productId, tier, price } = params;
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    // Simulate payment processing
    setTimeout(async () => {
      try {
        if (productId && tier) {
          const { error } = await supabase
            .from('products')
            .update({ 
              tier: tier as any,
              is_featured: tier === 'premium' || tier === 'standard'
            })
            .eq('id', productId);
          
          if (error) throw error;
        }
        setSuccess(true);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        Alert.alert('Error', 'Payment failed. Please try again.');
      }
    }, 2000);
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle2 size={80} color={COLORS.success} strokeWidth={1.5} />
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successDesc}>
            Your listing has been upgraded to <Text style={{fontWeight: '700'}}>{tier}</Text> tier.
            It will now receive more visibility across SellAdv.com.
          </Text>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.push('/(tabs)/profile')}>
            <Text style={styles.doneBtnText}>Go to My Ads</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade Listing</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.priceCard}>
          <View style={styles.tierInfo}>
            {tier === 'premium' ? (
              <Crown size={24} color={COLORS.accentDark} fill={COLORS.accent} />
            ) : (
              <Zap size={24} color={COLORS.adStandard} fill={COLORS.adStandard} />
            )}
            <Text style={styles.tierName}>{tier?.toString().toUpperCase()} TIER</Text>
          </View>
          <Text style={styles.priceText}>{price}</Text>
          <Text style={styles.taxText}>Inc. all taxes</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PAYMENT METHOD</Text>
          <View style={styles.methodCard}>
            <View style={styles.methodRow}>
              <CreditCard size={20} color={COLORS.primary} />
              <Text style={styles.methodText}>UPI / Credit Card / Debit Card</Text>
            </View>
            <View style={styles.secureBadge}>
              <ShieldCheck size={14} color={COLORS.success} />
              <Text style={styles.secureText}>Secure Payment via SellAdv.com Pay</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Boost Charge</Text>
            <Text style={styles.summaryValue}>{price}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee</Text>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>FREE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>{price}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnDisabled]}
          onPress={handlePay}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : (
            <Text style={styles.payBtnText}>Pay Now</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.footer}>
          <ShieldCheck size={16} color={COLORS.textLight} />
          <Text style={styles.footerText}>Trust & Safety Guaranteed</Text>
        </View>
      </ScrollView>
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
  backBtn: { padding: 4 },
  headerTitle: { ...FONTS.h3, fontWeight: '700' },
  content: { flex: 1, padding: SPACING.md },
  priceCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tierName: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textLight,
  },
  priceText: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.primary,
  },
  taxText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 4,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textLight,
    marginBottom: 10,
    letterSpacing: 1,
  },
  methodCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  secureText: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: { fontSize: 14, color: COLORS.textSecondary },
  summaryValue: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  totalValue: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  payBtn: {
    backgroundColor: COLORS.accent,
    height: 54,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.white,
  },
  successTitle: {
    ...FONTS.h2,
    fontSize: 24,
    marginTop: 24,
    marginBottom: 12,
    color: COLORS.primary,
  },
  successDesc: {
    ...FONTS.body,
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginBottom: 32,
    lineHeight: 22,
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: RADIUS.sm,
  },
  doneBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});
