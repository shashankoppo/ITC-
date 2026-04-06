import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable } from 'react-native';
import { Product } from '@/types/database';
import { Heart, MapPin, Zap, Megaphone, Crown, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

interface ProductCardProps {
  product: Product;
  onFavoriteToggle?: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({ product, onFavoriteToggle, isFavorite }: ProductCardProps) {
  const router = useRouter();
  const [localFavorite, setLocalFavorite] = useState(isFavorite);

  const handlePress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleFavoritePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalFavorite(!localFavorite);
    onFavoriteToggle?.(product.id);
  };

  const imageUrl = product.images && product.images.length > 0
    ? product.images[0]
    : 'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=400';

  const timeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - new Date(product.created_at).getTime()) / 1000);
    if (seconds < 3600) return 'Just now';
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(product.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  const getTierStyles = () => {
    switch (product.tier) {
      case 'premium':
        return {
          container: styles.premiumContainer,
          badge: styles.premiumBadge,
          badgeText: styles.premiumBadgeText,
          icon: <Crown size={10} color={COLORS.primary} fill={COLORS.primary} />,
          label: 'PREMIUM',
        };
      case 'standard':
        return {
          container: styles.standardContainer,
          badge: styles.standardBadge,
          badgeText: styles.standardBadgeText,
          icon: <Sparkles size={10} color={COLORS.white} fill={COLORS.white} />,
          label: 'FEATURED',
        };
      default:
        return null;
    }
  };

  const tierStyles = getTierStyles();

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={[styles.container, tierStyles?.container]} 
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        
        <Pressable onPress={handleFavoritePress} style={styles.favoriteButton}>
          <Heart
            size={16}
            color={localFavorite ? COLORS.error : COLORS.white}
            fill={localFavorite ? COLORS.error : 'transparent'}
            strokeWidth={2.5}
          />
        </Pressable>

        {tierStyles && (
          <View style={[styles.badgeBase, tierStyles.badge]}>
            {tierStyles.icon}
            <Text style={[styles.badgeTextBase, tierStyles.badgeText]}>{tierStyles.label}</Text>
          </View>
        )}
        
        {product.is_negotiable && !tierStyles && (
          <View style={styles.negotiableBadge}>
            <Text style={styles.negotiableText}>NEGOTIABLE</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹ {product.price.toLocaleString('en-IN')}</Text>
          {product.tier === 'premium' && (
            <Zap size={14} color={COLORS.accentDark} fill={COLORS.accent} />
          )}
        </View>
        
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        
        <View style={styles.divider} />
        
        <View style={styles.footerRow}>
          <View style={styles.locationRow}>
            <MapPin size={10} color={COLORS.textLight} />
            <Text style={styles.location} numberOfLines={1}>
              {product.location?.split(',')[0] || 'India'}
            </Text>
          </View>
          <Text style={styles.time}>{timeAgo()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    elevation: 3,
    shadowColor: '#002F34',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  premiumContainer: {
    borderColor: COLORS.accent,
    borderWidth: 1.5,
    elevation: 6,
    shadowColor: COLORS.accentDark,
    shadowOpacity: 0.15,
  },
  standardContainer: {
    borderColor: COLORS.secondary,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 130,
    backgroundColor: COLORS.surface,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeBase: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeTextBase: {
    ...FONTS.badge,
    fontSize: 9,
  },
  premiumBadge: {
    backgroundColor: COLORS.accent,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  premiumBadgeText: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  standardBadge: {
    backgroundColor: COLORS.secondary,
  },
  standardBadgeText: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  negotiableBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 47, 52, 0.65)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  negotiableText: {
    fontSize: 8,
    color: COLORS.white,
    fontWeight: '700',
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 47, 52, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    ...FONTS.price,
    fontSize: 17,
    color: COLORS.primary,
  },
  title: {
    ...FONTS.body,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    height: 36, // Fixed height for 2 lines
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: 8,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 3,
  },
  location: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  time: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});