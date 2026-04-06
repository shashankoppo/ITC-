import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="product/edit/[id]" />
        <Stack.Screen name="category/[slug]" />
        <Stack.Screen name="conversation/[id]" />
        <Stack.Screen name="profile/edit" />
      </Stack>
      <StatusBar style="light" />
    </AuthProvider>
  );
}
