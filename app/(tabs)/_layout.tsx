import { Tabs } from 'expo-router';
import { Hop as Home, Grid2x2 as Grid, CirclePlus as PlusCircle, MessageCircle, User } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/Theme';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 68 + insets.bottom / 2,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12 + insets.bottom / 2,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          backgroundColor: COLORS.white,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => <Home size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ size, color }) => <Grid size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="add-listing"
        options={{
          title: 'Sell',
          tabBarIcon: ({ size, color }) => (
            <View style={styles.sellButton}>
              <PlusCircle size={28} color={COLORS.primary} strokeWidth={2.5} />
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Chat',
          tabBarIcon: ({ size, color }) => <MessageCircle size={22} color={color} strokeWidth={2} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Account',
          tabBarIcon: ({ size, color }) => <User size={22} color={color} strokeWidth={2} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  sellButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 3,
    borderColor: COLORS.white,
  },
});