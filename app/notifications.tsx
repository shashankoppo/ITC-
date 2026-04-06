import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, MessageSquare, Tag, Info, ChevronRight, CheckCircle2, Zap, Crown, AlertTriangle, Filter, CheckCircle } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for notifications since we are developing the UI/UX
const MOCK_NOTIFICATIONS = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    message: 'John Doe sent you a message about "iPhone 13 Pro"',
    time: '2 mins ago',
    is_read: false,
    icon: MessageSquare,
    iconColor: COLORS.primary,
  },
  {
    id: '2',
    type: 'price_drop',
    title: 'Price Drop Alert!',
    message: 'An item in your wishlist "Bose Headphones" has dropped in price by ₹2,000.',
    time: '1 hour ago',
    is_read: false,
    icon: Tag,
    iconColor: COLORS.secondaryDark,
  },
  {
    id: '3',
    type: 'system',
    title: 'Profile Verified',
    message: 'Congratulations! Your profile has been verified. You now have the trust badge.',
    time: '5 hours ago',
    is_read: true,
    icon: CheckCircle2,
    iconColor: COLORS.success,
  },
  {
    id: '4',
    type: 'premium',
    title: 'Ad Boosted! 🚀',
    message: 'Your ad for "Honda City 2021" is now featured at the top of the feed.',
    time: '12 hours ago',
    is_read: true,
    icon: Crown,
    iconColor: COLORS.accentDark,
  },
  {
    id: '5',
    type: 'alert',
    title: 'Listing Expiring',
    message: 'Your ad for "Old Furniture" will expire in 2 days. Tap to renew.',
    time: '1 day ago',
    is_read: true,
    icon: AlertTriangle,
    iconColor: COLORS.error,
  },
  {
    id: '6',
    type: 'info',
    title: 'Selling Tip',
    message: 'Add more photos to your listings to attract 2x more buyers.',
    time: '2 days ago',
    is_read: true,
    icon: Info,
    iconColor: COLORS.textLight,
  },
];

const FILTERS = ['All', 'Unread', 'Messages', 'Offers'];

export default function NotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  const renderNotification = ({ item }: { item: typeof MOCK_NOTIFICATIONS[0] }) => (
    <TouchableOpacity 
        style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
        activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: item.iconColor + '15' }]}>
        <item.icon size={22} color={item.iconColor} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.notifTitle, !item.is_read && styles.unreadTitle]}>{item.title}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
        <Text style={styles.notifMessage} numberOfLines={2}>
          {item.message}
        </Text>
      </View>
      <View style={styles.rightAction}>
        {!item.is_read && <View style={styles.unreadDot} />}
        <ChevronRight size={16} color={COLORS.border} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
            <TouchableOpacity style={styles.markReadBtn}>
              <CheckCircle size={20} color={COLORS.accent} />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.filtersScroll}
            contentContainerStyle={styles.filtersContent}
          >
            {FILTERS.map(filter => (
              <TouchableOpacity 
                key={filter} 
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip, 
                  activeFilter === filter && styles.activeFilterChip
                ]}
              >
                <Text style={[
                  styles.filterText, 
                  activeFilter === filter && styles.activeFilterText
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Bell size={48} color={COLORS.primary} strokeWidth={1} />
            </View>
            <Text style={styles.emptyTitle}>Stay Tuned!</Text>
            <Text style={styles.emptySubtitle}>You'll get notified about messages, price drops, and elite deals here.</Text>
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
  header: {
    paddingBottom: SPACING.md,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    fontSize: 20,
  },
  markReadBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersScroll: {
    marginTop: SPACING.sm,
  },
  filtersContent: {
    paddingHorizontal: SPACING.md,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  activeFilterChip: {
    backgroundColor: COLORS.accent,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.white,
    fontWeight: '600',
  },
  activeFilterText: {
    color: COLORS.primary,
  },
  listContent: {
    flexGrow: 1,
    paddingTop: SPACING.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    marginBottom: 8,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  unreadItem: {
    backgroundColor: COLORS.white,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: '800',
    color: COLORS.primary,
  },
  notifMessage: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
    marginBottom: 8,
  },
  rightAction: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    ...FONTS.h2,
    color: COLORS.primary,
    fontSize: 22,
  },
  emptySubtitle: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginTop: 12,
    lineHeight: 22,
    fontSize: 15,
  },
});
