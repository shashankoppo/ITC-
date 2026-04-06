import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Search, SlidersHorizontal } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Product, Category } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';

export default function CategoryScreen() {
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

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    if (slug) {
      loadCategoryAndProducts();
    }
  }, [slug]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadCategoryAndProducts = async () => {
    try {
      const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

      if (catError) throw catError;
      setCategory(catData);

      const from = 0;
      const to = ITEMS_PER_PAGE - 1;

      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('category_id', catData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (prodError) throw prodError;
      setProducts(prodData || []);
      setHasMore((prodData?.length || 0) === ITEMS_PER_PAGE);
      setPage(0);
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
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
    if (!hasMore || loading) return;

    const from = (page + 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    supabase
      .from('products')
      .select('*, profiles(*), categories(*)')
      .eq('category_id', category?.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to)
      .then(({ data }) => {
        setProducts((prev) => [...prev, ...(data || [])]);
        setHasMore((data?.length || 0) === ITEMS_PER_PAGE);
        setPage((prev) => prev + 1);
      });
  };

  const renderItem = ({ item }: { item: Product }) => (
    <ProductCard
      product={item}
      onFavoriteToggle={handleFavoriteToggle}
      isFavorite={favorites.has(item.id)}
    />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a73e8" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#222" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.categoryName} numberOfLines={1}>
            {category?.name}
          </Text>
          <Text style={styles.itemCount}>
            {products.length} items
          </Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search in category..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        <SlidersHorizontal size={20} color="#666" />
      </View>

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footer}>
              <ActivityIndicator size="large" color="#1a73e8" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No products in this category</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  itemCount: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginHorizontal: 8,
  },
  listContent: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});