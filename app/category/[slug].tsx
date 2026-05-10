import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  useWindowDimensions,
  Modal,
  Pressable,
  ScrollView as RNScrollView,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Search, SlidersHorizontal, MapPin, ChevronDown, Check } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Category } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { productApi, categoryApi, favoriteApi } from '@/lib/api';
import { useLocation, INDIAN_STATES_AND_DISTRICTS } from '@/contexts/LocationContext';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function CategoryScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { slug } = useLocalSearchParams();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const { selectedCity, setSelectedCity, availableCities } = useLocation();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedStateForFilter, setSelectedStateForFilter] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    if (slug) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [slug, selectedCity]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const catData = await categoryApi.getCategoryBySlug(slug as string);
      if (!catData) throw new Error('Category not found');
      setCategory(catData);
      await loadProducts(catData.id, 0, true);
    } catch (error) {
      console.error('Error loading initial category data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (catId: string, pageNum: number, reset: boolean = false) => {
    try {
      const data = await productApi.getProductsByCategory(catId, pageNum, ITEMS_PER_PAGE, selectedCity);
      
      if (reset) {
        setProducts(data);
      } else {
        setProducts((prev) => [...prev, ...data]);
      }
      
      setHasMore(data.length === ITEMS_PER_PAGE);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading products for category:', error);
    }
  };

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id);

      setFavorites(new Set(data?.map((f) => f.product_id) || []));
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

  const loadMore = () => {
    if (!hasMore || loading || loadingMore || !category) return;

    setLoadingMore(true);
    loadProducts(category.id, page + 1).finally(() => setLoadingMore(false));
  };

  const numColumns = width > 1200 ? 5 : width > 768 ? 3 : 2;

  const renderItem = ({ item }: { item: Product }) => (
    <View style={[styles.productWrapper, { flex: 1 / numColumns - 0.02 }]}>
      <ProductCard
        product={item}
        onFavoriteToggle={handleFavoriteToggle}
        isFavorite={favorites.has(item.id)}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']} style={styles.headerInner}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <Text style={styles.categoryName} numberOfLines={1}>
                {category?.name || 'Category'}
              </Text>
              <TouchableOpacity 
                style={styles.locationPicker}
                onPress={() => setShowLocationModal(true)}
              >
                <MapPin size={10} color="rgba(255,255,255,0.8)" />
                <Text style={styles.locationTextSmall}>{selectedCity}</Text>
                <ChevronDown size={10} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </View>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.searchContainer}>
            <Search size={18} color={COLORS.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search in ${category?.name || 'category'}...`}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={COLORS.textLight}
            />
            <View style={styles.vDivider} />
            <TouchableOpacity style={styles.filterBtn}>
              <SlidersHorizontal size={18} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        key={numColumns}
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        columnWrapperStyle={styles.row}
        contentContainerStyle={[styles.listContent, width > 1200 && { maxWidth: 1200, alignSelf: 'center', width: '100%' }]}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.resultCount}>{products.length} Items Found</Text>
          </View>
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products found in this category</Text>
          </View>
        }
      />

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowLocationModal(false);
          setSelectedStateForFilter(null);
        }}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => {
            setShowLocationModal(false);
            setSelectedStateForFilter(null);
          }}
        >
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedStateForFilter ? `Select District in ${selectedStateForFilter}` : 'Select State'}
              </Text>
              <TouchableOpacity onPress={() => {
                setShowLocationModal(false);
                setSelectedStateForFilter(null);
              }}>
                <Text style={styles.closeBtn}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <RNScrollView style={styles.cityList}>
              {!selectedStateForFilter ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.cityItem,
                      selectedCity === 'All India' && styles.selectedCityItem
                    ]}
                    onPress={() => {
                      setSelectedCity('All India');
                      setShowLocationModal(false);
                      setPage(0);
                    }}
                  >
                    <Text style={[
                      styles.cityText,
                      selectedCity === 'All India' && styles.selectedCityText
                    ]}>
                      All India
                    </Text>
                    {selectedCity === 'All India' && <Check size={16} color={COLORS.primary} />}
                  </TouchableOpacity>
                  {Object.keys(INDIAN_STATES_AND_DISTRICTS).sort().map((state) => (
                    <TouchableOpacity
                      key={state}
                      style={styles.cityItem}
                      onPress={() => setSelectedStateForFilter(state)}
                    >
                      <Text style={styles.cityText}>{state}</Text>
                      <ChevronDown size={16} color={COLORS.textLight} />
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => setSelectedStateForFilter(null)}
                  >
                    <Text style={[styles.cityText, { color: COLORS.primary, fontWeight: '600' }]}>← Back to States</Text>
                  </TouchableOpacity>
                  {INDIAN_STATES_AND_DISTRICTS[selectedStateForFilter].map((district) => {
                    const fullLocation = `${district}, ${selectedStateForFilter}`;
                    return (
                      <TouchableOpacity
                        key={district}
                        style={[
                          styles.cityItem,
                          selectedCity === fullLocation && styles.selectedCityItem
                        ]}
                        onPress={() => {
                          setSelectedCity(fullLocation);
                          setShowLocationModal(false);
                          setSelectedStateForFilter(null);
                          setPage(0);
                        }}
                      >
                        <Text style={[
                          styles.cityText,
                          selectedCity === fullLocation && styles.selectedCityText
                        ]}>
                          {district}
                        </Text>
                        {selectedCity === fullLocation && <Check size={16} color={COLORS.primary} />}
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
            </RNScrollView>
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
    alignItems: 'center',
  },
  headerInner: {
    width: '100%',
    maxWidth: 1200,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  categoryName: {
    ...FONTS.h2,
    color: COLORS.white,
    fontWeight: '800',
  },
  locationPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    opacity: 0.9,
  },
  locationTextSmall: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 52,
    gap: 10,
    marginTop: SPACING.sm,
    elevation: 4,
    shadowColor: '#000',
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
  listContent: {
    paddingHorizontal: SPACING.sm,
    paddingBottom: SPACING.xl,
  },
  listHeader: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  resultCount: {
    ...FONTS.body,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '600',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xs,
  },
  productWrapper: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.xs,
  },
  footer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 100,
    alignItems: 'center',
  },
  emptyText: {
    ...FONTS.body,
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 47, 52, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  closeBtn: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  cityList: {
    paddingHorizontal: SPACING.md,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  selectedCityItem: {
    backgroundColor: 'rgba(35, 229, 219, 0.05)',
  },
  cityText: {
    ...FONTS.body,
    color: COLORS.text,
  },
  selectedCityText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});