import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Heart, 
  Package, 
  ChevronRight,
  Plus,
  BarChart3,
  Users,
  Star
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';
import { userApi } from '@/lib/api';

const { width } = Dimensions.get('window');

export default function SellerDashboardScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    totalViews: 0,
    activeAds: 0,
    totalMessages: 0,
    totalFollowers: 0,
    avgRating: 0,
    soldCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    try {
      const data = await userApi.getDashboardStats(user!.id);
      setStats({
        ...stats,
        ...data,
        avgRating: profile?.rating || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller Dashboard</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(tabs)/add-listing')}>
          <Plus size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome, {profile?.full_name?.split(' ')[0] || 'Seller'}!</Text>
          <Text style={styles.welcomeSubtitle}>Your selling performance this month</Text>
        </View>

        {/* Key Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard icon={Package} label="Active Ads" value={stats.activeAds} color={COLORS.primary} />
          <StatCard icon={Eye} label="Total Views" value={stats.totalViews} color="#10B981" />
          <StatCard icon={MessageSquare} label="Chats" value={stats.totalMessages} color="#6366F1" />
          <StatCard icon={Star} label="Rating" value={stats.avgRating} color={COLORS.accent} />
        </View>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Insights & Growth</Text>
            <TrendingUp size={20} color={COLORS.primary} />
          </View>
          
          <TouchableOpacity style={styles.growthCard}>
            <View style={styles.growthIconContainer}>
                <BarChart3 size={24} color={COLORS.white} />
            </View>
            <View style={styles.growthInfo}>
                <Text style={styles.growthTitle}>Upgrade to Premium Seller</Text>
                <Text style={styles.growthSubtitle}>Get verified, list unlimited items, and see detailed analytics.</Text>
            </View>
            <ChevronRight size={18} color={COLORS.border} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Manage Your Business</Text>
          <View style={styles.actionList}>
            <TouchableOpacity 
                style={styles.actionItem}
                onPress={() => router.push('/profile/my-ads')}
            >
              <Package size={20} color={COLORS.text} />
              <Text style={styles.actionLabel}>Manage Listings</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{stats.activeAds}</Text></View>
              <ChevronRight size={18} color={COLORS.border} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <Users size={20} color={COLORS.text} />
              <Text style={styles.actionLabel}>Followers</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{stats.totalFollowers}</Text></View>
              <ChevronRight size={18} color={COLORS.border} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionItem}>
              <Star size={20} color={COLORS.text} />
              <Text style={styles.actionLabel}>Reviews</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>12</Text></View>
              <ChevronRight size={18} color={COLORS.border} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  welcomeTitle: {
    ...FONTS.h2,
    fontSize: 24,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  statCard: {
    width: (width / 2) - SPACING.md,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    margin: SPACING.sm / 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  featuredSection: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  growthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  growthIconContainer: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  growthInfo: {
    flex: 1,
  },
  growthTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  growthSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
    lineHeight: 16,
  },
  activitySection: {
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.md,
  },
  actionList: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: 'hidden',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  badge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
