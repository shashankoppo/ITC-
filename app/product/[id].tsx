import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  ArrowLeft, Heart, Share2, MapPin, ShieldCheck, 
  MessageCircle, Star, Zap, Phone, Clock, Crown, 
  Shield, CheckCircle2, Info, ChevronRight, Eye
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { productApi, favoriteApi, messageApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/database';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { MOCK_PRODUCTS } from '@/lib/mockData';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productApi.getProductById(id as string);
      setProduct(data);

      if (user) {
        const favorite = await favoriteApi.isFavorite(user.id, id as string);
        setIsFavorite(favorite);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      const mockProduct = MOCK_PRODUCTS.find(p => p.id === id);
      if (mockProduct) setProduct(mockProduct as any);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!user) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      if (isFavorite) {
        await favoriteApi.removeFavorite(user.id, id as string);
      } else {
        await favoriteApi.addFavorite(user.id, id as string);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Favorite toggle failed:', error);
    }
  };
  const handleChat = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    if (!product) return;

    try {
      // Check if conversation already exists or create new one
      const conversation = await messageApi.createConversation(
        product.id,
        user.id,
        product.user_id
      );
      router.push(`/conversation/${conversation.id}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      Alert.alert('Chat Error', 'Could not start conversation with seller.');
    }
  };

  const timeAgo = (date: string) => {
    const d = new Date(date);
    return `Posted ${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Listing not found</Text>
          <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
            <Text style={styles.goBackText}>Return to Explore</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=600'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          <ScrollView 
            horizontal 
            pagingEnabled 
            onScroll={(e) => {
              const x = e.nativeEvent.contentOffset.x;
              setActiveImage(Math.round(x / width));
            }}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((img, index) => (
              <Image key={index} source={{ uri: img }} style={styles.mainImage} resizeMode="cover" />
            ))}
          </ScrollView>
          
          <LinearGradient
            colors={['rgba(0,0,0,0.4)', 'transparent']}
            style={styles.imageOverlayTop}
          />
          
          <SafeAreaView edges={['top']} style={styles.imageHeader}>
            <TouchableOpacity onPress={() => router.back()} style={styles.circleBtn}>
              <ArrowLeft size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.circleBtn}>
                <Share2 size={20} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFavorite} style={styles.circleBtn}>
                <Heart 
                  size={20} 
                  color={isFavorite ? COLORS.error : COLORS.white} 
                  fill={isFavorite ? COLORS.error : 'transparent'} 
                />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          {images.length > 1 && (
            <View style={styles.paginationDots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, activeImage === i && styles.activeDot]} />
              ))}
            </View>
          )}

          {product.tier === 'premium' && (
            <View style={styles.premiumBadgeContainer}>
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDark]}
                style={styles.premiumBadge}
              >
                <Crown size={12} color={COLORS.primary} fill={COLORS.primary} />
                <Text style={styles.premiumBadgeText}>ELITE PREMIUM</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        {/* Content Section */}
        <View style={styles.mainContent}>
          <View style={styles.headerInfo}>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹ {product.price.toLocaleString('en-IN')}</Text>
              <View style={styles.viewCount}>
                <Eye size={12} color={COLORS.textLight} />
                <Text style={styles.viewCountText}>{(product.views_count || 124).toLocaleString()} views</Text>
              </View>
            </View>
            <Text style={styles.title}>{product.title}</Text>
            
            <View style={styles.locationContainer}>
              <MapPin size={14} color={COLORS.primary} />
              <Text style={styles.locationText}>{product.location || 'Pan India'}</Text>
              <View style={styles.dotSeparator} />
              <Clock size={14} color={COLORS.textLight} />
              <Text style={styles.timeText}>{timeAgo(product.created_at)}</Text>
            </View>

            {product.is_negotiable && (
              <View style={styles.negotiableTag}>
                <Zap size={10} color={COLORS.secondaryDark} fill={COLORS.secondaryDark} />
                <Text style={styles.negotiableLabel}>Negotiable Price</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          {/* Key Details Card */}
          <Text style={styles.sectionHeading}>Marketplace Specifications</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>{product.categories?.name || 'Top Tier'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Condition</Text>
              <Text style={styles.detailValue}>{product.condition?.replace('_', ' ') || 'Pristine'}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Listed by</Text>
              <Text style={styles.detailValue}>Individual Seller</Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Item Description</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          {/* Safety First Banner */}
          <LinearGradient
            colors={['rgba(35, 229, 219, 0.12)', 'rgba(255, 255, 255, 0.05)']}
            style={styles.safetyBanner}
          >
            <View style={styles.safetyIconBox}>
              <ShieldCheck size={24} color={COLORS.primary} />
            </View>
            <View style={styles.safetyContent}>
              <Text style={styles.safetyTitle}>Safety First on MPmarket</Text>
              <Text style={styles.safetyDesc}>Avoid advance payments. Always inspect the item in a public place before transacting.</Text>
            </View>
          </LinearGradient>

          {/* Seller Profile */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Seller Details</Text>
            <TouchableOpacity style={styles.sellerCard} activeOpacity={0.8}>
              <Image 
                source={{ uri: product.profiles?.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100' }} 
                style={styles.sellerAvatar} 
              />
              <View style={styles.sellerMain}>
                <View style={styles.sellerNameRow}>
                  <Text style={styles.sellerName}>{product.profiles?.full_name || 'Premium Seller'}</Text>
                  <CheckCircle2 size={16} color={COLORS.success} fill={COLORS.success + '20'} />
                </View>
                <View style={styles.sellerMeta}>
                  <Star size={12} color={COLORS.accentDark} fill={COLORS.accent} />
                  <Text style={styles.ratingText}>{product.profiles?.rating || '4.9'} · Member since 2023</Text>
                </View>
              </View>
              <ChevronRight size={20} color={COLORS.border} />
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Persistent Bottom Controls */}
      <View style={styles.footerContainer}>
        <LinearGradient
          colors={['rgba(255,255,255,0.9)', COLORS.white]}
          style={styles.footerGradient}
        >
          <View style={styles.footerInner}>
            <TouchableOpacity 
              style={[styles.footerBtn, styles.chatBtn]}
              onPress={handleChat}
            >
              <MessageCircle size={20} color={COLORS.primary} strokeWidth={2.5} />
              <Text style={styles.chatBtnText}>Chat now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.footerBtn, styles.callBtn]}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.callGradient}
              >
                <Phone size={20} color={COLORS.white} strokeWidth={2.5} />
                <Text style={styles.callBtnText}>Call Seller</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageSection: {
    width: width,
    height: width * 0.9,
    backgroundColor: COLORS.surface,
    position: 'relative',
  },
  mainImage: {
    width: width,
    height: width * 0.9,
  },
  imageOverlayTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  imageHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    width: 20,
    backgroundColor: COLORS.white,
  },
  premiumBadgeContainer: {
    position: 'absolute',
    top: 100,
    left: SPACING.md,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.xs,
    gap: 6,
    elevation: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  mainContent: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -20,
  },
  headerInfo: {
    marginBottom: SPACING.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -1,
  },
  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 6,
  },
  viewCountText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 28,
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  timeText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  negotiableTag: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.xs,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.secondaryLight,
  },
  negotiableLabel: {
    fontSize: 11,
    color: COLORS.secondaryDark,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surface,
    marginVertical: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: 16,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: 'rgba(35, 229, 219, 0.2)',
  },
  safetyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(35, 229, 219, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyContent: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  safetyDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
    gap: 12,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
  },
  sellerMain: {
    flex: 1,
  },
  sellerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  sellerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  footerGradient: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: 12,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    elevation: 20,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  footerInner: {
    flexDirection: 'row',
    gap: 12,
  },
  footerBtn: {
    flex: 1,
    height: 54,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  chatBtn: {
    backgroundColor: COLORS.accent,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  chatBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },
  callBtn: {
    overflow: 'hidden',
  },
  callGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  callBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.white,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  notFoundText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 20,
  },
  goBackBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
  },
  goBackText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});