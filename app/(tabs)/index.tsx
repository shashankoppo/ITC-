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
  Modal,
  Pressable,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, SlidersHorizontal, Bell, MapPin, ChevronDown, Rocket, Sparkles, TrendingUp, Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { productApi, categoryApi, favoriteApi } from '@/lib/api';
import { Product, Category } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { CategoryCard } from '@/components/CategoryCard';
import { AdBanner } from '@/components/AdBanner';
import { PremiumSlider } from '@/components/PremiumSlider';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
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
  const [sortBy, setSortBy] = useState('newest');
  const { selectedCity, setSelectedCity, availableCities } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  const SORT_OPTIONS = [
    { label: 'Newest First', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' },
  ];

  useEffect(() => {
    loadInitialData();
  }, [selectedCity, sortBy]);

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
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories(MOCK_CATEGORIES);
    }
  };

  const loadPremiumProducts = async () => {
    try {
      const data = await productApi.getPremiumProducts(10, selectedCity);
      setPremiumProducts(data);
    } catch (error) {
      setPremiumProducts(MOCK_PRODUCTS.filter(p => p.tier === 'premium').slice(0, 5));
    }
  };

  const loadProducts = async (pageNum: number, reset: boolean = false, query: string = searchQuery) => {
    try {
      let data;
      if (query.trim()) {
        data = await productApi.searchProducts(query, ITEMS_PER_PAGE, selectedCity, sortBy);
      } else {
        data = await productApi.getProducts(pageNum, ITEMS_PER_PAGE, selectedCity, sortBy);
      }

      const processedProducts = data.map((p: any, idx: number) => ({
        ...p,
        tier: p.tier || (idx % 7 === 0 ? 'premium' : idx % 3 === 0 ? 'standard' : 'free')
      })) as Product[];

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
      const data = await favoriteApi.getUserFavorites(user.id);
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

    try {
      if (isFavorite) {
        newFavorites.delete(productId);
        await favoriteApi.removeFavorite(user.id, productId);
      } else {
        newFavorites.add(productId);
        await favoriteApi.addFavorite(user.id, productId);
      }
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
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
          <View style={styles.headerBrand}>
            <Text style={styles.appName}>SellAdv.com</Text>
            <TouchableOpacity 
              style={styles.locationPicker}
              onPress={() => setShowLocationModal(true)}
            >
              <MapPin size={12} color={COLORS.white} />
              <Text style={styles.locationValueSmall}>{selectedCity}</Text>
              <ChevronDown size={12} color={COLORS.white} />
            </TouchableOpacity>
          </View>
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
          <TouchableOpacity 
            style={styles.filterBtn}
            onPress={() => setShowSortModal(true)}
          >
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

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowLocationModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.cityList}>
              {availableCities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    styles.cityItem,
                    selectedCity === city && styles.selectedCityItem
                  ]}
                  onPress={() => {
                    setSelectedCity(city);
                    setShowLocationModal(false);
                    setPage(0);
                  }}
                >
                  <Text style={[
                    styles.cityText,
                    selectedCity === city && styles.selectedCityText
                  ]}>
                    {city}
                  </Text>
                  {selectedCity === city && <MapPin size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Sort Selection Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Text style={styles.closeBtn}>Close</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cityList}>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.cityItem,
                    sortBy === option.value && styles.selectedCityItem
                  ]}
                  onPress={() => {
                    setSortBy(option.value);
                    setShowSortModal(false);
                    setPage(0);
                  }}
                >
                  <Text style={[
                    styles.cityText,
                    sortBy === option.value && styles.selectedCityText
                  ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && <Check size={16} color={COLORS.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
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
  headerBrand: {
    gap: 4,
  },
  appName: {
    ...FONTS.h1,
    fontSize: 22,
    color: COLORS.white,
    letterSpacing: 1,
    fontWeight: '900',
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    opacity: 0.9,
  },
  locationValueSmall: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  closeBtn: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  cityList: {
    padding: SPACING.md,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  selectedCityItem: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  cityText: {
    ...FONTS.body,
    fontSize: 16,
    color: COLORS.text,
  },
  selectedCityText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});