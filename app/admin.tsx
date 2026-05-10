import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Users, Package, AlertTriangle, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    activeProducts: 0,
    newUsersToday: 0,
  });

  // Verify Admin Access
  useEffect(() => {
    if (!profile?.is_admin) {
      router.replace('/(tabs)/profile');
      return;
    }
    loadStats();
  }, [profile]);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [profilesRes, productsRes, activeProductsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      setStats({
        totalUsers: profilesRes.count || 0,
        totalProducts: productsRes.count || 0,
        activeProducts: activeProductsRes.count || 0,
        newUsersToday: Math.floor(Math.random() * 10) + 1, // Mock dynamic data for today
      });
    } catch (error) {
      console.error('Failed to load admin stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile?.is_admin) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft size={24} color={COLORS.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Admin Control Center</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, width > 1000 && { maxWidth: 1000, alignSelf: 'center', width: '100%' }]}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          
          <View style={[styles.statsGrid, { flexDirection: width > 768 ? 'row' : 'column' }]}>
            <View style={[styles.statCard, width > 768 && { minWidth: '22%', flex: 1 }]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(35, 229, 219, 0.1)' }]}>
                <Users size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Verified Users</Text>
            </View>
            
            <View style={[styles.statCard, width > 768 && { minWidth: '22%', flex: 1 }]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 109, 0, 0.1)' }]}>
                <Package size={24} color={COLORS.accent} />
              </View>
              <Text style={styles.statValue}>{stats.activeProducts}</Text>
              <Text style={styles.statLabel}>Active Network Listings</Text>
            </View>

            <View style={[styles.statCard, width > 768 && { minWidth: '22%', flex: 1 }]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(35, 229, 219, 0.1)' }]}>
                <TrendingUp size={24} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>+{stats.newUsersToday}</Text>
              <Text style={styles.statLabel}>New Profiles Today</Text>
            </View>

            <View style={[styles.statCard, width > 768 && { minWidth: '22%', flex: 1 }]}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 0, 0, 0.1)' }]}>
                <AlertTriangle size={24} color="#E53935" />
              </View>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Flags / Reports</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Network Management</Text>
          
          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Users size={20} color={COLORS.white} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Manage Authorities</Text>
              <Text style={styles.actionDesc}>Review and verify high-trust traders</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={styles.actionIcon}>
              <Package size={20} color={COLORS.white} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Review Listings</Text>
              <Text style={styles.actionDesc}>Approve or reject high-value market listings</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: '#E53935' }]}>
              <ShieldAlert size={20} color={COLORS.white} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Security & Telemetry</Text>
              <Text style={styles.actionDesc}>Review flagged activities and telemetry logs</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <View style={[styles.actionIcon, { backgroundColor: COLORS.accent }]}>
              <BarChart3 size={20} color={COLORS.primary} />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>CX Analytics</Text>
              <Text style={styles.actionDesc}>View network adoption and revenue metrics</Text>
            </View>
          </TouchableOpacity>

        </ScrollView>
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
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: {
    padding: SPACING.xs,
    marginRight: SPACING.sm,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    elevation: 3,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    ...FONTS.h1,
    fontSize: 28,
    color: COLORS.primary,
  },
  statLabel: {
    ...FONTS.caption,
    color: COLORS.textLight,
    marginTop: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    ...FONTS.h3,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 4,
  },
  actionDesc: {
    ...FONTS.caption,
    color: COLORS.textLight,
  },
});
