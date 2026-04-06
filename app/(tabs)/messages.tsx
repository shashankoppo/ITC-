import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MessageCircle, Search } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Conversation } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          products(*),
          buyer:profiles!conversations_buyer_id_fkey(*),
          seller:profiles!conversations_seller_id_fkey(*)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderConversation = ({ item }: { item: Conversation }) => {
    const otherUser = item.buyer_id === user?.id ? item.seller : item.buyer;
    const productImage =
      item.products?.images && item.products.images.length > 0
        ? item.products.images[0]
        : 'https://images.pexels.com/photos/1029243/pexels-photo-1029243.jpeg?auto=compress&cs=tinysrgb&w=100';

    const timeAgo = (date: string) => {
      const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
      if (seconds < 60) return 'Now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
      return `${Math.floor(seconds / 86400)}d`;
    };

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => router.push(`/conversation/${item.id}`)}
        activeOpacity={0.8}>
        <Image source={{ uri: productImage }} style={styles.productImage} />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.userName} numberOfLines={1}>
              {otherUser?.full_name || 'User'}
            </Text>
            <Text style={styles.time}>{timeAgo(item.last_message_at)}</Text>
          </View>
          <Text style={styles.productTitle} numberOfLines={1}>
            ₹{item.products?.price?.toLocaleString('en-IN')} · {item.products?.title}
          </Text>
          {item.last_message && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Chats</Text>
        </View>
        <View style={styles.emptyState}>
          <MessageCircle size={56} color={COLORS.borderLight} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>Sign in to view chats</Text>
          <Text style={styles.emptySubtitle}>Chat directly with buyers and sellers</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity>
          <Search size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MessageCircle size={56} color={COLORS.borderLight} strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>No messages yet</Text>
          <Text style={styles.emptySubtitle}>
            When you contact a seller or receive a message, it will show up here
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...FONTS.h1,
    fontSize: 22,
  },
  listContent: {
    paddingTop: 0,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  productImage: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    marginRight: 14,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  userName: {
    ...FONTS.h3,
    fontSize: 15,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  productTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...FONTS.h3,
    fontSize: 17,
    marginTop: 16,
  },
  emptySubtitle: {
    ...FONTS.caption,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  signInButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xl,
  },
  signInButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
});