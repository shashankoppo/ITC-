import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, MoreVertical, Edit2, Trash2, Eye, MessageSquare, Zap } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/database';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

export default function MyAdsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMyAds();
    }
  }, [user]);

  const loadMyAds = async () => {
    try {
      setLoading(true);
      const data = await productApi.getUserProducts(user?.id || '');
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading my ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (productId: string) => {
    Alert.alert('Delete Listing', 'Are you sure you want to delete this listing permanently?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await productApi.deleteProduct(productId);
            setProducts(products.filter(p => p.id !== productId));
          } catch (error) {
            Alert.alert('Error', 'Could not delete the listing.');
          }
        } 
      },
    ]);
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.images[0] || 'https://via.placeholder.com/150' }} 
        style={styles.productImage} 
      />
      <View style={styles.productInfo}>
        <View style={styles.titleRow}>
          <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Trash2 size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>
        <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Eye size={14} color={COLORS.textLight} />
            <Text style={styles.statText}>{item.views_count || 0} views</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={[styles.statusText, { color: item.status === 'active' ? '#10B981' : COLORS.textLight }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push(`/product/${item.id}`)}
          >
            <Text style={styles.actionBtnText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => router.push(`/product/edit/${item.id}`)}
          >
            <Text style={[styles.actionBtnText, { color: COLORS.white }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.boostBtn]}
            onPress={() => router.push(`/payment/checkout?productId=${item.id}`)}
          >
            <Zap size={14} color={COLORS.primary} fill={COLORS.primary} />
            <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>Boost</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Ads</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>You haven't posted any ads yet</Text>
              <TouchableOpacity 
                style={styles.postBtn}
                onPress={() => router.push('/(tabs)/add-listing')}
              >
                <Text style={styles.postBtnText}>Post an Ad Now</Text>
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
    padding: SPACING.md,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: 120,
    height: 120,
  },
  productInfo: {
    flex: 1,
    padding: SPACING.sm + 4,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  editBtn: {
    backgroundColor: COLORS.primary,
  },
  boostBtn: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  postBtnText: {
    color: COLORS.white,
    fontWeight: '700',
  },
});
