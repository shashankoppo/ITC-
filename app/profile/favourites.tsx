import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Trash2, Heart } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

export default function FavouritesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavourites();
    }
  }, [user]);

  const loadFavourites = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('favorites')
        .select('*, products(*, profiles(*), categories(*))')
        .eq('user_id', user?.id);

      if (error) throw error;
      
      const favoriteProducts = data
        ?.map((fav: any) => fav.products)
        .filter((p: any) => p !== null);
        
      setProducts(favoriteProducts || []);
    } catch (error) {
      console.error('Error loading favourites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard
        product={item}
        onFavoriteToggle={() => handleRemoveFavorite(item.id)}
        isFavorite={true}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favourites</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Heart size={64} color={COLORS.border} strokeWidth={1} />
              <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
              <Text style={styles.emptySubtitle}>Save items you love and see them here.</Text>
              <TouchableOpacity 
                style={styles.browseBtn}
                onPress={() => router.push('/(tabs)')}
              >
                <Text style={styles.browseBtnText}>Explore Marketplace</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
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
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    ...FONTS.h3,
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: SPACING.md,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  productWrapper: {
    flex: 0.48,
    marginBottom: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: SPACING.xl,
  },
  emptyTitle: {
    ...FONTS.h3,
    marginTop: SPACING.lg,
    color: COLORS.text,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: COLORS.textLight,
    marginTop: 8,
    marginBottom: SPACING.xl,
  },
  browseBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  browseBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
