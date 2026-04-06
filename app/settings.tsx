import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Lock, 
  Languages, 
  Smartphone, 
  HelpCircle, 
  Info,
  ChevronRight,
  LogOut,
  MapPin,
  Settings,
  Eye,
  Trash2
} from 'lucide-react-native';
import { useState } from 'react';
import { COLORS, SPACING, RADIUS, FONTS } from '@/constants/Theme';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [locationServices, setLocationServices] = useState(true);

  const SettingItem = ({ 
    icon: Icon, 
    label, 
    value, 
    onPress, 
    type = 'link',
    isLast = false,
    color = COLORS.primary
  }: { 
    icon: any, 
    label: string, 
    value?: any, 
    onPress?: () => void,
    type?: 'link' | 'switch',
    isLast?: boolean,
    color?: string
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, isLast && styles.lastItem]} 
      onPress={type === 'link' ? onPress : undefined}
      activeOpacity={type === 'link' ? 0.7 : 1}
    >
      <View style={[styles.settingIconContainer, { backgroundColor: color + '10' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      {type === 'link' ? (
        <View style={styles.settingValueContainer}>
          {value && <Text style={styles.settingValueText}>{value}</Text>}
          <ChevronRight size={18} color={COLORS.border} />
        </View>
      ) : (
        <Switch 
          value={value} 
          onValueChange={onPress as any}
          trackColor={{ false: '#D1D5DB', true: COLORS.primary + '80' }}
          thumbColor={value ? COLORS.primary : '#F3F4F6'}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.header}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <ArrowLeft size={24} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Settings size={20} color={COLORS.accent} style={{ marginRight: 8 }} />
              <Text style={styles.headerTitle}>Account Settings</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account & Profile</Text>
        </View>
        <View style={styles.section}>
          <SettingItem 
            icon={User} 
            label="Personal Information" 
            onPress={() => router.push('/profile/edit')} 
          />
          <SettingItem icon={Lock} label="Security & Password" />
          <SettingItem icon={MapPin} label="Manage Locations" value="2 active" />
          <SettingItem 
            icon={Shield} 
            label="Privacy & Permissions" 
            isLast={true} 
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
        </View>
        <View style={styles.section}>
          <SettingItem 
            icon={Bell} 
            label="Push Notifications" 
            type="switch" 
            value={notifications}
            onPress={() => setNotifications(!notifications)}
            color={COLORS.secondaryDark}
          />
          <SettingItem 
            icon={Smartphone} 
            label="Device Analytics" 
            type="switch" 
            value={locationServices}
            onPress={() => setLocationServices(!locationServices)}
            color="#6366F1"
          />
          <SettingItem 
            icon={Languages} 
            label="App Language" 
            value="English (INR)" 
            isLast={true}
            color="#F59E0B"
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>About & Support</Text>
        </View>
        <View style={styles.section}>
          <SettingItem icon={HelpCircle} label="Help & FAQ Centre" color={COLORS.info} />
          <SettingItem icon={Info} label="About mpmarketing" color="#64748B" />
          <SettingItem icon={Shield} label="Privacy Policy" color="#64748B" />
          <SettingItem 
            icon={Lock} 
            label="Terms of Service" 
            isLast={true}
            color="#64748B"
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
          <LinearGradient
            colors={['#FEF2F2', '#FEE2E2']}
            style={styles.logoutGradient}
          >
            <LogOut size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Sign Out Account</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.dangerZone}>
          <TouchableOpacity style={styles.deleteAccountBtn}>
            <Trash2 size={16} color={COLORS.textLight} />
            <Text style={styles.deleteAccountText}>Deactivate or Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>mpmarketing for India — v1.2.4</Text>
          <Text style={styles.buildText}>Elite Marketplace Edition</Text>
        </View>
      </ScrollView>
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
    elevation: 8,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.white,
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: COLORS.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '600',
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  logoutBtn: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
  },
  dangerZone: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
  },
  deleteAccountText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '700',
  },
  buildText: {
    fontSize: 11,
    color: COLORS.textLight,
    opacity: 0.6,
    marginTop: 2,
  },
});
