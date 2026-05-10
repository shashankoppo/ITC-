import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Settings,
  ShieldCheck,
  Heart,
  Package,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  Eye,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

export default function ProfileScreen() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.guestContainer}>
          <View style={styles.guestAvatarCircle}>
            <User size={48} color={COLORS.textLight} strokeWidth={1.5} />
          </View>
          <Text style={styles.guestTitle}>Welcome to SellAdv.com</Text>
          <Text style={styles.guestSubtitle}>India's trusted marketplace for buying and selling</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginBtnText}>Login / Sign Up</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const menuItems = [
    { icon: Package, label: 'My Ads', subtitle: 'Manage your listings', onPress: () => router.push('/profile/my-ads') },
    { icon: Heart, label: 'Favourites', subtitle: 'Saved ads', onPress: () => router.push('/profile/favourites') },
    { icon: ShieldCheck, label: 'Verify Account', subtitle: 'KYC & trust badge', onPress: () => router.push('/profile/verify') },
    ...(profile?.is_admin ? [{ icon: ShieldCheck, label: 'Admin Dashboard', subtitle: 'Platform Management', onPress: () => router.push('/admin') }] : []),
    { icon: Settings, label: 'Settings', subtitle: 'App preferences', onPress: () => router.push('/settings') },
    { icon: HelpCircle, label: 'Help & Support', subtitle: 'FAQs & contact', onPress: () => router.push('/help') },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[width > 1000 && { maxWidth: 1000, alignSelf: 'center', width: '100%' }]}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileRow}>
            <Image
              source={{
                uri: profile?.avatar_url || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=200',
              }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{profile?.full_name || 'SellAdv.com User'}</Text>
              <Text style={styles.memberSince}>Member since {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</Text>
              <View style={styles.ratingRow}>
                <Star size={14} color={COLORS.accent} fill={COLORS.accent} />
                <Text style={styles.ratingText}>{profile?.rating || '5.0'}</Text>
                <Text style={styles.reviewCount}>({profile?.total_reviews || 0} reviews)</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push('/profile/edit')}>
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <TouchableOpacity 
            style={styles.statsRow}
            onPress={() => router.push('/seller-dashboard')}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.active_listings_count || 0}</Text>
              <Text style={styles.statLabel}>Ads Posted</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.favorites_count || 0}</Text>
              <Text style={styles.statLabel}>Favourites</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{profile?.views_count || 0}</Text>
              <Text style={styles.statLabel}>Views</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sell Banner */}
        <TouchableOpacity style={styles.sellBanner} onPress={() => router.push('/(tabs)/add-listing')}>
          <View>
            <Text style={styles.sellBannerTitle}>Start Selling Today</Text>
            <Text style={styles.sellBannerSubtitle}>Post your first ad and reach millions</Text>
          </View>
          <View style={styles.sellBannerCTA}>
            <Text style={styles.sellBannerCTAText}>+ Post Ad</Text>
          </View>
        </TouchableOpacity>

        {/* Menu */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}>
              <View style={styles.menuIconContainer}>
                <item.icon size={20} color={COLORS.primary} strokeWidth={2} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <ChevronRight size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={20} color={COLORS.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SellAdv.com v1.0</Text>
          <Text style={styles.footerText}>by Evolucentsphere Pvt Ltd</Text>
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
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  guestAvatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  guestTitle: {
    ...FONTS.h2,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestSubtitle: {
    ...FONTS.caption,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: RADIUS.sm,
  },
  loginBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
  },
  profileHeader: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.surface,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...FONTS.h2,
    fontSize: 18,
  },
  memberSince: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  reviewCount: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  editBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
  },
  statNumber: {
    ...FONTS.h2,
    fontSize: 20,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  sellBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  sellBannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sellBannerSubtitle: {
    fontSize: 12,
    color: COLORS.primaryLight,
    marginTop: 2,
  },
  sellBannerCTA: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  sellBannerCTAText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.white,
  },
  menuSection: {
    backgroundColor: COLORS.white,
    marginTop: SPACING.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    gap: 14,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  menuSubtitle: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 1,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    marginTop: SPACING.md,
    backgroundColor: COLORS.white,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
});