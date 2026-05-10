import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import {
  ArrowLeft,
  Star,
  CheckCircle2,
  Phone,
  MessageCircle,
  Video,
  UserPlus,
  UserMinus,
  MapPin,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { userApi, productApi, followerApi } from '@/lib/api';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/types/database';

export default function PublicProfileScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadProfile();
      loadProducts();
      loadReviews();
      checkFollowStatus();
    }
  }, [id]);

  const loadProfile = async () => {
    try {
      const data = await userApi.getUserProfile(id as string);
      setProfile(data);
      
      const followers = await followerApi.getFollowersCount(id as string);
      const following = await followerApi.getFollowingCount(id as string);
      setFollowersCount(followers);
      setFollowingCount(following);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const data = await productApi.getUserProducts(id as string);
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadReviews = async () => {
    try {
      const data = await userApi.getUserReviews(id as string);
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || currentUser.id === id) return;
    try {
      const status = await followerApi.isFollowing(currentUser.id, id as string);
      setIsFollowing(status);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      router.push('/(auth)/login');
      return;
    }
    if (currentUser.id === id) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followerApi.unfollowUser(currentUser.id, id as string);
        setFollowersCount(prev => prev - 1);
      } else {
        await followerApi.followUser(currentUser.id, id as string);
        setFollowersCount(prev => prev + 1);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    // In a real app, you'd need a product ID to start a conversation context
    // or just a generic conversation. Here we'll just go back or to messages.
    router.push('/(tabs)/messages');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <Head>
          <title>User Not Found | SellAdv</title>
          <meta name="robots" content="noindex" />
        </Head>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>User not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Head>
        <title>{`${profile.full_name}'s Profile | SellAdv`}</title>
        <meta name="description" content={`View ${profile.full_name}'s listings on SellAdv. ${profile.bio || ''}`} />
        <meta property="og:title" content={`${profile.full_name}'s Profile`} />
        <meta property="og:description" content={`View ${profile.full_name}'s listings and connect directly.`} />
        <meta property="og:image" content={profile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg'} />
      </Head>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[width > 1200 && { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.profileCard}>
          <View style={styles.profileMain}>
            <Image
              source={{
                uri: profile.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200',
              }}
              style={styles.avatar}
            />
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{profile.full_name}</Text>
                <CheckCircle2 size={18} color={COLORS.success} fill={COLORS.success + '20'} />
              </View>
              <View style={styles.locationRow}>
                <MapPin size={14} color={COLORS.textLight} />
                <Text style={styles.locationText}>{profile.location || 'Pan India'}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
                <Text style={styles.ratingText}>{profile.rating || '5.0'}</Text>
                <Text style={styles.reviewCount}>({profile.total_reviews || 0} reviews)</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{products.length}</Text>
              <Text style={styles.statLabel}>Listings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followersCount}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{followingCount}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </View>
          </View>

          {profile.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.bioText}>{profile.bio}</Text>
            </View>
          )}

          <View style={styles.actionButtons}>
            {currentUser?.id !== id && (
              <TouchableOpacity
                style={[
                  styles.followBtn,
                  isFollowing && styles.followingBtn
                ]}
                onPress={handleFollow}
                disabled={followLoading}
              >
                {followLoading ? (
                  <ActivityIndicator size="small" color={isFollowing ? COLORS.primary : COLORS.white} />
                ) : (
                  <>
                    {isFollowing ? (
                      <UserMinus size={18} color={COLORS.primary} />
                    ) : (
                      <UserPlus size={18} color={COLORS.white} />
                    )}
                    <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                      {isFollowing ? 'Unfollow' : 'Follow'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
              <MessageCircle size={18} color={COLORS.primary} />
              <Text style={styles.messageBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listingsHeader}>
          <Text style={styles.listingsTitle}>Active Listings</Text>
          <Text style={styles.listingsCount}>{products.length} items</Text>
        </View>

        <View style={styles.listingsGrid}>
          {products.length > 0 ? (
            products.map((item) => {
              const numColumns = width > 1200 ? 5 : width > 768 ? 3 : 2;
              return (
                <View key={item.id} style={[styles.productWrapper, { width: `${100 / numColumns}%` }]}>
                  <ProductCard product={item} />
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No active listings</Text>
            </View>
          )}
        </View>

        <View style={styles.listingsHeader}>
          <Text style={styles.listingsTitle}>Customer Reviews</Text>
          <Text style={styles.listingsCount}>{reviews.length} reviews</Text>
        </View>

        <View style={styles.reviewsList}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <View key={review.id} style={styles.reviewItem}>
                <View style={styles.reviewHeader}>
                  <Image source={{ uri: review.reviewer?.avatar_url || 'https://picsum.photos/seed/user/100/100' }} style={styles.reviewerAvatar} />
                  <View style={styles.reviewerInfo}>
                    <Text style={styles.reviewerName}>{review.reviewer?.full_name || 'Anonymous'}</Text>
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={12} color={s <= review.rating ? COLORS.accent : COLORS.border} fill={s <= review.rating ? COLORS.accent : 'transparent'} />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>5d ago</Text>
                </View>
                <Text style={styles.reviewComment}>{review.comment}</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No reviews yet</Text>
            </View>
          )}
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  profileMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f5',
    borderRadius: RADIUS.md,
    paddingVertical: 12,
    marginBottom: SPACING.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#dee2e6',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  bioSection: {
    marginBottom: SPACING.lg,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  followBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  followingBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  followBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  followingBtnText: {
    color: COLORS.primary,
  },
  messageBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  messageBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  listingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  listingsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  listingsCount: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  listingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  productWrapper: {
    width: '50%',
    padding: 4,
  },
  emptyState: {
    width: '100%',
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  reviewsList: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  reviewItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
