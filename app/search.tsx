import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal, X, MapPin } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';
import { ProductCard } from '@/components/ProductCard';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { FilterModal } from '@/components/FilterModal';

export default function SearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [query, setQuery] = useState(params.q as string || '');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    condition: 'all',
    negotiable: false,
  });

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (searchFilters = filters) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      let supabaseQuery = supabase
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`);

      // Apply price filters
      if (searchFilters.minPrice) {
        supabaseQuery = supabaseQuery.gte('price', parseFloat(searchFilters.minPrice));
      }
      if (searchFilters.maxPrice) {
        supabaseQuery = supabaseQuery.lte('price', parseFloat(searchFilters.maxPrice));
      }

      // Apply condition filter
      if (searchFilters.condition && searchFilters.condition !== 'all') {
        supabaseQuery = supabaseQuery.eq('condition', searchFilters.condition);
      }

      // Apply negotiable filter
      if (searchFilters.negotiable) {
        supabaseQuery = supabaseQuery.eq('is_negotiable', true);
      }

      const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (newFilters: any) => {
    setFilters(newFilters);
    handleSearch(newFilters);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productWrapper}>
      <ProductCard product={item} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <SearchIcon size={18} color={COLORS.textLight} />
          <TextInput 
            placeholder="Search SellAdv.com..." 
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            autoFocus={!params.q}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <X size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={() => setShowFilters(true)}
        >
          <SlidersHorizontal size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filtersBar}>
        <TouchableOpacity style={styles.pillActive}>
          <Text style={styles.pillTextActive}>Relevant</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>Recent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.pill}>
          <Text style={styles.pillText}>Price Low-High</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            query ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No results found for "{query}"</Text>
                <Text style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
              </View>
            ) : (
              <View style={styles.suggestContainer}>
                <Text style={styles.suggestTitle}>Popular Searches</Text>
                {['iPhone 14', 'Bicycles', 'Apartments', 'Used Cars', 'Macbook Pro'].map((tag) => (
                  <TouchableOpacity 
                    key={tag} 
                    style={styles.suggestPill}
                    onPress={() => {
                        setQuery(tag);
                        handleSearch();
                    }}
                  >
                    <SearchIcon size={14} color={COLORS.textLight} />
                    <Text style={styles.suggestText}>{tag}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )
          }
        />
      )}

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={applyFilters}
        initialFilters={filters}
      />
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.white,
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: RADIUS.md,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterBtn: {
    padding: 4,
  },
  filtersBar: {
    flexDirection: 'row',
    padding: SPACING.md,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  pillActive: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  pillText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  pillTextActive: {
    fontSize: 13,
    color: COLORS.white,
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
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 8,
    textAlign: 'center',
  },
  suggestContainer: {
    padding: SPACING.md,
  },
  suggestTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: 12,
  },
  suggestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  suggestText: {
    fontSize: 15,
    color: COLORS.text,
  },
});
