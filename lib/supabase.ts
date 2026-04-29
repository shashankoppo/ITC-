import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Configuration for potential self-hosted or cloud instance
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
  console.warn('⚠️ EXPO_PUBLIC_SUPABASE_URL is missing. Check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false, // Recommended for React Native
  },
  global: {
    headers: { 'x-client-info': 'selladv-self-hosted' },
  },
});