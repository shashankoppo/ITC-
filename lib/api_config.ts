/**
 * API Configuration for SellAdv.com
 * This utility manages the switching between different data sources:
 * 1. Supabase (Cloud or Self-Hosted)
 * 2. Mock Data (For offline development or UI testing)
 */

export const API_CONFIG = {
  // Check if we should use mock data based on env variable
  useMockData: process.env.EXPO_PUBLIC_USE_MOCK_DATA === 'true',
  
  // High-authority mode (logs all API interactions for debugging self-hosted connections)
  debugMode: process.env.NODE_ENV === 'development',
  
  // Timeout for API calls (important for self-hosted instances on slow networks)
  timeout: 10000,
};

/**
 * Utility to handle API errors and potentially fallback to mock data
 */
export const handleApiError = (error: any, fallbackData: any) => {
  if (API_CONFIG.debugMode) {
    console.error('[API ERROR]:', error);
  }
  
  // If explicitly using mock data or if the network is unreachable, return fallback
  if (API_CONFIG.useMockData || error?.message?.includes('Network request failed') || error?.message?.includes('failed to fetch')) {
    return fallbackData;
  }
  
  throw error;
};
