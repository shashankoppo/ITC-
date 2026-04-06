import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Bell, MapPin, ChevronDown, Rocket, Sparkles, TrendingUp } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { AdBanner } from '@/components/AdBanner';
import { PremiumSlider } from '@/components/PremiumSlider';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 12;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('India');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([
      loadCategories(),
      loadProducts(0, true),
      loadPremiumProducts(),
    ]);
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        setCategories(MOCK_CATEGORIES);
      } else if (data && data.length > 0) {
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(MOCK_CATEGORIES);
    }
  };

  const loadPremiumProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('status', 'active')
        .eq('tier', 'premium')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        setPremiumProducts(MOCK_PRODUCTS.filter(p => p.tier === 'premium').slice(0, 5));
      } else {
        setPremiumProducts(data || []);
      }
    } catch (error) {
      setPremiumProducts(MOCK_PRODUCTS.filter(p => p.tier === 'premium').slice(0, 5));
    }
  };

  const loadProducts = async (pageNum: number, reset: boolean = false, query: string = searchQuery) => {
    try {
      const from = pageNum * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      let supabaseQuery = supabase
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (query.trim()) {
        supabaseQuery = supabaseQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
      }

      const { data, error } = await supabaseQuery;

      let processedProducts: Product[] = [];
      if (error || !data || data.length === 0) {
        // Use mock data if DB is empty or fails
        processedProducts = MOCK_PRODUCTS;
        if (query.trim()) {
          processedProducts = processedProducts.filter(p => 
            p.title.toLowerCase().includes(query.toLowerCase()) || 
            p.description.toLowerCase().includes(query.toLowerCase())
          );
        }
      } else {
        processedProducts = (data || []).map((p, idx) => ({
          ...p,
          tier: p.tier || (idx % 7 === 0 ? 'premium' : idx % 3 === 0 ? 'standard' : 'free')
        })) as Product[];
      }

      if (reset) {
        setProducts(processedProducts);
      } else {
        setProducts((prev) => [...prev, ...processedProducts]);
      }

      setHasMore(data ? data.length === ITEMS_PER_PAGE : false);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading products:', error);
      if (reset) setProducts(MOCK_PRODUCTS);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts(0, true, searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map((f) => f.product_id) || []);
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleFavoriteToggle = async (productId: string) => {
    if (!user) return;

    const isFavorite = favorites.has(productId);
    const newFavorites = new Set(favorites);

    if (isFavorite) {
      newFavorites.delete(productId);
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    } else {
      newFavorites.add(productId);
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: productId });
    }

    setFavorites(newFavorites);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadInitialData(),
      loadFavorites(),
    ]);
    setRefreshing(false);
  }, [user]);

  const loadMore = () => {
    if (!loadingMore && hasMore && products.length > 0 && products.length < 50) {
      setLoadingMore(true);
      loadProducts(page + 1).finally(() => setLoadingMore(false));
    }
  };

  const renderItem = ({ item, index }: { item: Product; index: number }) => {
    return (
      <View style={styles.productWrapper}>
        <ProductCard
          product={item}
          onFavoriteToggle={handleFavoriteToggle}
          isFavorite={favorites.has(item.id)}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footerIndicator}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching India's best deals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ backgroundColor: COLORS.primary }} edges={['top']} />
      
      {/* Premium Header with Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.locationPicker}>
            <View style={styles.locationIconCircle}>
              <MapPin size={16} color={COLORS.white} />
            </View>
            <View>
              <Text style={styles.locationLabel}>Your location</Text>
              <View style={styles.locationValueRow}>
                <Text style={styles.locationValue}>{selectedCity}</Text>
                <ChevronDown size={14} color={COLORS.white} />
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerBtn}
              onPress={() => router.push('/notifications')}
            >
              <Bell size={22} color={COLORS.white} />
              <View style={styles.notificationDot} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search with Premium Look */}
        <View style={styles.searchContainer}>
          <Search size={18} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Cars, iPhones, Properties..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textLight}
          />
          <View style={styles.vDivider} />
          <TouchableOpacity style={styles.filterBtn}>
            <SlidersHorizontal size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
        }
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Premium Sliding Products */}
            <View style={styles.premiumSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.rowAlign}>
                  <Sparkles size={20} color={COLORS.accent} fill={COLORS.accent} />
                  <Text style={styles.sectionTitle}>Exclusive Premium</Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.seeAll}>Featured</Text>
                </TouchableOpacity>
              </View>
              <PremiumSlider products={premiumProducts} />
            </View>

            {/* Premium Ad */}
            <View style={styles.adPadding}>
              <AdBanner type="premium" />
            </View>

            {/* Categories */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Explore Categories</Text>
              <TouchableOpacity onPress={() => router.push('/categories')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContent}>
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </ScrollView>

            {/* Fresh Recommendations Container */}
            <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
              <View style={styles.rowAlign}>
                <TrendingUp size={20} color={COLORS.primary} />
                <Text style={styles.sectionTitle}>Fresh Recommendations</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>NEW</Text>
              </View>
            </View>
          </View>
        }
      />
    </View>
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
    gap: 16,
  },
  loadingText: {
    ...FONTS.body,
    color: COLORS.primary,
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
    elevation: 8,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm + 4,
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  locationValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationValue: {
    fontSize: 15,
    color: COLORS.white,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 52,
    gap: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchInput: {
    flex: 1,
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.text,
  },
  vDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.divider,
  },
  filterBtn: {
    padding: 4,
  },
  listHeader: {
    backgroundColor: COLORS.background,
  },
  premiumSection: {
    paddingVertical: SPACING.md,
  },
  adPadding: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  categoriesScroll: {
    marginBottom: SPACING.md,
  },
  categoriesContent: {
    paddingHorizontal: SPACING.md,
    gap: 12,
    paddingRight: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  rowAlign: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...FONTS.h2,
    fontSize: 18,
    color: COLORS.primary,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
  },
  listContent: {
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  productWrapper: {
    flex: 0.485,
    marginBottom: SPACING.md,
  },
  footerIndicator: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
});