import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Megaphone, Zap, Globe } from 'lucide-react-native';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

interface AdBannerProps {
  type: 'premium' | 'standard' | 'google';
  onPress?: () => void;
}

export function AdBanner({ type, onPress }: AdBannerProps) {
  if (type === 'premium') {
    return (
      <TouchableOpacity style={styles.premiumBanner} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.premiumGradient}>
          <View style={styles.premiumContent}>
            <View style={styles.premiumBadge}>
              <Zap size={12} color={COLORS.primary} fill={COLORS.primary} />
              <Text style={styles.premiumBadgeText}>PREMIUM AD</Text>
            </View>
            <Text style={styles.premiumTitle}>Sell Faster on SellAdv.com!</Text>
            <Text style={styles.premiumDesc}>Boost your listing with Premium visibility across India</Text>
            <View style={styles.premiumCTA}>
              <Text style={styles.premiumCTAText}>Boost Now — ₹499</Text>
            </View>
          </View>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg?auto=compress&cs=tinysrgb&w=200' }}
            style={styles.premiumImage}
          />
        </View>
      </TouchableOpacity>
    );
  }

  if (type === 'standard') {
    return (
      <TouchableOpacity style={styles.standardBanner} onPress={onPress} activeOpacity={0.9}>
        <View style={styles.standardBadge}>
          <Megaphone size={10} color={COLORS.white} />
          <Text style={styles.standardBadgeText}>SPONSORED</Text>
        </View>
        <Text style={styles.standardTitle}>Get more buyers for your ad</Text>
        <Text style={styles.standardDesc}>Standard boost — ₹99/week</Text>
      </TouchableOpacity>
    );
  }

  // Google Ad Placeholder
  return (
    <View style={styles.googleBanner}>
      <View style={styles.googleBadge}>
        <Globe size={10} color={COLORS.textLight} />
        <Text style={styles.googleBadgeText}>Ad · Google</Text>
      </View>
      <View style={styles.googleContent}>
        <Text style={styles.googleTitle}>Advertisement</Text>
        <Text style={styles.googleDesc}>Your ad could appear here</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  premiumBanner: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    backgroundColor: COLORS.accent,
  },
  premiumGradient: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  premiumContent: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
    marginBottom: 8,
  },
  premiumBadgeText: {
    ...FONTS.badge,
    color: COLORS.primary,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  premiumDesc: {
    fontSize: 12,
    color: COLORS.primaryLight,
    marginBottom: 10,
    lineHeight: 16,
  },
  premiumCTA: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  premiumCTAText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.white,
  },
  premiumImage: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.sm,
  },
  standardBanner: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  standardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.adStandard,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 4,
    marginBottom: 8,
  },
  standardBadgeText: {
    ...FONTS.badge,
    color: COLORS.white,
  },
  standardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  standardDesc: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  googleBanner: {
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
  },
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  googleBadgeText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  googleContent: {
    alignItems: 'center',
  },
  googleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  googleDesc: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 2,
  },
});
