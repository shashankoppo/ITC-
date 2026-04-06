import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Product } from '@/types/database';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { Zap, Crown, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.82;
const ITEM_HEIGHT = 200;
const ITEM_SPACING = SPACING.md;

interface PremiumSliderProps {
  products: Product[];
}

export function PremiumSlider({ products }: PremiumSliderProps) {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % products.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, products.length]);

  if (products.length === 0) return null;

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={() => router.push(`/product/${item.id}`)}
      style={styles.card}>
      <Image
        source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0, 47, 52, 0.8)', COLORS.primary]}
        style={styles.overlay}
      >
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Crown size={12} color={COLORS.primary} fill={COLORS.primary} />
            <Text style={styles.badgeText}>PREMIUM AD</Text>
          </View>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>{item.condition?.replace('_', ' ').toUpperCase() || 'EXCELLENT'}</Text>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.price}>₹ {item.price.toLocaleString('en-IN')}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.locationRow}>
            <MapPin size={12} color="rgba(255,255,255,0.7)" />
            <Text style={styles.location} numberOfLines={1}>
              {item.location || 'India'}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + ITEM_SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH + ITEM_SPACING,
          offset: (ITEM_WIDTH + ITEM_SPACING) * index,
          index,
        })}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / (ITEM_WIDTH + ITEM_SPACING));
          setCurrentIndex(index);
        }}
      />
      
      {/* Pagination Pattern */}
      <View style={styles.pagination}>
        {products.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.dot, 
              currentIndex === index && styles.activeDot
            ]} 
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    gap: ITEM_SPACING,
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.primaryDark,
    elevation: 10,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  badgeText: {
    ...FONTS.badge,
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '800',
  },
  conditionBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.xs,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  conditionText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  info: {
    gap: 2,
  },
  price: {
    ...FONTS.price,
    fontSize: 22,
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  title: {
    ...FONTS.body,
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '600',
    opacity: 0.95,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  location: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: SPACING.md,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.divider,
    opacity: 0.5,
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.primary,
    opacity: 1,
  },
});
