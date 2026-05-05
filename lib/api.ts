import { supabase } from './supabase';
import { Product, Review } from '@/types/database';
import { API_CONFIG, handleApiError } from './api_config';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_FAVORITES, MOCK_REVIEWS, MOCK_USERS } from './mockData';

export const productApi = {
  async getProducts(page: number = 0, limit: number = 12, location: string = 'India', sortBy: string = 'newest') {
    let filteredProducts = [...MOCK_PRODUCTS];
    const isGlobal = location === 'India' || location === 'All India';
    if (!isGlobal) {
      filteredProducts = filteredProducts.filter(p => 
        p.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Apply sorting
    if (sortBy === 'price_low') {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_high') {
      filteredProducts.sort((a, b) => b.price - a.price);
    } else {
      filteredProducts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    if (API_CONFIG.useMockData) return filteredProducts.slice(page * limit, (page + 1) * limit);

    try {
      const from = page * limit;
      const to = from + limit - 1;

      let query = supabase
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('status', 'active');
      
      if (location !== 'India') {
        query = query.ilike('location', `%${location}%`);
      }

      if (sortBy === 'price_low') {
        query = query.order('price', { ascending: true });
      } else if (sortBy === 'price_high') {
        query = query.order('price', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.range(from, to);

      if (error) throw error;
      return data;
    } catch (error) {
      return handleApiError(error, filteredProducts.slice(page * limit, (page + 1) * limit));
    }
  },

  async getProductById(id: string) {
    if (API_CONFIG.useMockData) {
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      if (!product) return null;
      
      // Get category and user for mock product
      const category = MOCK_CATEGORIES.find(c => c.id === product.category_id);
      const user = MOCK_USERS[0]; // All belong to mock-user-1
      
      return {
        ...product,
        categories: category,
        profiles: user,
      };
    }
    
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(*), categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getProductsByCategory(categoryId: string, page: number = 0, limit: number = 12, location: string = 'India') {
    let filteredProducts = MOCK_PRODUCTS.filter(p => p.category_id === categoryId);
    const isGlobal = location === 'India' || location === 'All India';
    if (!isGlobal) {
      filteredProducts = filteredProducts.filter(p => 
        p.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (API_CONFIG.useMockData) return filteredProducts.slice(page * limit, (page + 1) * limit);

    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('products')
      .select('*, profiles(*), categories(*)')
      .eq('category_id', categoryId)
      .eq('status', 'active');
    
    if (location !== 'India') {
      query = query.ilike('location', `%${location}%`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data;
  },

  async getUserProducts(userId: string) {
    if (API_CONFIG.useMockData) {
      return MOCK_PRODUCTS.filter(p => p.user_id === userId || p.user_id === 'mock-user-1'); // mock-user-1 is default mock user
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getUserActiveProductsCount(userId: string) {
    if (API_CONFIG.useMockData) {
      return MOCK_PRODUCTS.filter(p => (p.user_id === userId || p.user_id === 'mock-user-1') && p.status === 'active').length;
    }

    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) throw error;
    return count || 0;
  },

  async createProduct(product: Partial<Product>, imageUris?: string[]) {
    if (API_CONFIG.useMockData) {
      const newProduct = {
        ...product,
        id: `prod_${Date.now()}`,
        created_at: new Date().toISOString(),
        views_count: 0,
        images: imageUris || [
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800'
        ],
      };
      MOCK_PRODUCTS.unshift(newProduct as any);
      return newProduct;
    }

    let images: string[] = [];
    
    // Upload images if provided
    if (imageUris && imageUris.length > 0) {
      const uploadPromises = imageUris.map(uri => this.uploadImage(uri));
      images = await Promise.all(uploadPromises);
    }

    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, images: images.length > 0 ? images : product.images })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadImage(uri: string): Promise<string> {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const filePath = `product-images/${fileName}`;

      // This is a simplified version. In a real app, you'd convert the URI to a Blob/File
      // For now, we'll assume the URI is a local path and handle the upload
      const response = await fetch(uri);
      const blob = await response.blob();

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error('Image upload failed');
    }
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    if (API_CONFIG.useMockData) {
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index > -1) {
        MOCK_PRODUCTS.splice(index, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async incrementViews(id: string) {
    const { data: product } = await supabase
      .from('products')
      .select('views_count')
      .eq('id', id)
      .single();

    const newCount = (product?.views_count || 0) + 1;

    const { error } = await supabase
      .from('products')
      .update({ views_count: newCount })
      .eq('id', id);

    if (error) throw error;
    return newCount;
  },

  async searchProducts(query: string, limit: number = 20, location: string = 'India', sortBy: string = 'newest') {
    if (API_CONFIG.useMockData) {
      const q = query.toLowerCase();
      let filtered = MOCK_PRODUCTS.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q)
      );

      const isGlobal = location === 'India' || location === 'All India';
      if (!isGlobal) {
        filtered = filtered.filter(p => 
          p.location?.toLowerCase().includes(location.toLowerCase())
        );
      }

      if (sortBy === 'price_low') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price_high') {
        filtered.sort((a, b) => b.price - a.price);
      } else {
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }
      
      return filtered.slice(0, limit);
    }

    let sbQuery = supabase
      .from('products')
      .select('*, profiles(*), categories(*)')
      .eq('status', 'active')
      .ilike('title', `%${query}%`);

    if (location !== 'India') {
      sbQuery = sbQuery.ilike('location', `%${location}%`);
    }

    if (sortBy === 'price_low') {
      sbQuery = sbQuery.order('price', { ascending: true });
    } else if (sortBy === 'price_high') {
      sbQuery = sbQuery.order('price', { ascending: false });
    } else {
      sbQuery = sbQuery.order('created_at', { ascending: false });
    }

    const { data, error } = await sbQuery.limit(limit);

    if (error) throw error;
    return data;
  },

  async getPremiumProducts(limit: number = 10, location: string = 'India') {
    let filteredProducts = MOCK_PRODUCTS.filter(p => p.tier === 'premium');
    const isGlobal = location === 'India' || location === 'All India';
    if (!isGlobal) {
      filteredProducts = filteredProducts.filter(p => 
        p.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (API_CONFIG.useMockData) return filteredProducts.slice(0, limit);

    try {
      let query = supabase
        .from('products')
        .select('*, profiles(*), categories(*)')
        .eq('status', 'active')
        .eq('tier', 'premium');
      
      if (location !== 'India') {
        query = query.ilike('location', `%${location}%`);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleApiError(error, filteredProducts.slice(0, limit));
    }
  },
};

export const favoriteApi = {
  async addFavorite(userId: string, productId: string) {
    if (API_CONFIG.useMockData) {
      if (!MOCK_FAVORITES.includes(productId)) {
        MOCK_FAVORITES.push(productId);
      }
      return;
    }

    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, product_id: productId });

    if (error) throw error;
  },

  async removeFavorite(userId: string, productId: string) {
    if (API_CONFIG.useMockData) {
      const index = MOCK_FAVORITES.indexOf(productId);
      if (index > -1) {
        MOCK_FAVORITES.splice(index, 1);
      }
      return;
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async getUserFavorites(userId: string) {
    if (API_CONFIG.useMockData) {
      return MOCK_PRODUCTS.filter(p => MOCK_FAVORITES.includes(p.id)).map(p => ({
        id: `fav_${p.id}`,
        product_id: p.id,
        products: p
      }));
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('*, products(*, profiles(*), categories(*))')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async isFavorite(userId: string, productId: string) {
    if (API_CONFIG.useMockData) return MOCK_FAVORITES.includes(productId);

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};

export const messageApi = {
  async getConversations(userId: string) {
    if (API_CONFIG.useMockData) return MOCK_CONVERSATIONS;

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        products(*),
        buyer:profiles!conversations_buyer_id_fkey(*),
        seller:profiles!conversations_seller_id_fkey(*)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getConversation(id: string) {
    if (API_CONFIG.useMockData) {
      const conv = MOCK_CONVERSATIONS.find(c => c.id === id);
      if (!conv) throw new Error('Conversation not found');
      return conv;
    }

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        products(*),
        buyer:profiles!conversations_buyer_id_fkey(*),
        seller:profiles!conversations_seller_id_fkey(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createConversation(productId: string, buyerId: string, sellerId: string) {
    if (API_CONFIG.useMockData) {
      // Find existing or create new
      let conv = MOCK_CONVERSATIONS.find(c => c.product_id === productId && c.buyer_id === buyerId);
      if (conv) return conv;

      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      
      conv = {
        id: `conv_${Date.now()}`,
        product_id: productId,
        buyer_id: buyerId,
        seller_id: sellerId,
        last_message: '',
        last_message_at: new Date().toISOString(),
        unread_count: 0,
        products: product,
        seller: { full_name: 'Seller', avatar_url: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=100' },
      };
      MOCK_CONVERSATIONS.unshift(conv);
      return conv;
    }

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        product_id: productId,
        buyer_id: buyerId,
        seller_id: sellerId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getMessages(conversationId: string) {
    if (API_CONFIG.useMockData) return MOCK_MESSAGES.filter(m => m.conversation_id === conversationId);

    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
    if (API_CONFIG.useMockData) {
      const newMessage = {
        id: `msg_${Date.now()}`,
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        created_at: new Date().toISOString(),
        is_read: false,
      };
      MOCK_MESSAGES.push(newMessage);
      return newMessage;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        is_read: false,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const reviewApi = {
  async getUserReviews(userId: string) {
    if (API_CONFIG.useMockData) {
      return MOCK_REVIEWS.filter(r => r.reviewee_id === userId || (userId === 'mock-user-1' && r.reviewee_id === 'mock-user-1'));
    }
    const { data, error } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviews_reviewer_id_fkey(*), products(*)')
      .eq('reviewee_id', userId);

    if (error) throw error;
    return data;
  },

  async createReview(reviewerId: string, revieweeId: string, rating: number, comment: string, productId?: string) {
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        reviewer_id: reviewerId,
        reviewee_id: revieweeId,
        rating,
        comment,
        product_id: productId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAverageRating(userId: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', userId);

    if (error) throw error;

    if (!data || data.length === 0) return 0;

    const average = data.reduce((sum, review) => sum + review.rating, 0) / data.length;
    return Math.round(average * 100) / 100;
  },
};

export const categoryApi = {
  async getAllCategories() {
    if (API_CONFIG.useMockData) return MOCK_CATEGORIES;

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      return handleApiError(error, MOCK_CATEGORIES);
    }
  },

  async getCategoryBySlug(slug: string) {
    if (API_CONFIG.useMockData) return MOCK_CATEGORIES.find(c => c.slug === slug);
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (error) throw error;
    return data;
  },

  async getCategoryCount(categoryId: string) {
    if (API_CONFIG.useMockData) return MOCK_PRODUCTS.filter(p => p.category_id === categoryId).length;
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)
      .eq('status', 'active');

    if (error) throw error;
    return count || 0;
  },
};

export const userApi = {
  async getUserProfile(userId: string) {
    if (API_CONFIG.useMockData) {
      if (userId === 'mock-user-1') {
        return MOCK_USERS[0];
      }
      // Mock some realistic profiles for the mock user IDs
      return {
        id: userId,
        full_name: userId === 'u1' ? 'Rahul Kapoor' : userId === 'u2' ? 'Priya Verma' : `Seller ${userId}`,
        avatar_url: `https://picsum.photos/seed/${userId}/200/200`,
        phone: '+91 9876543210',
        location: 'Mumbai, Maharashtra',
        bio: 'Premium seller with a history of great products.',
        is_admin: false,
        rating: 4.8,
        total_reviews: 24,
        is_verified: true,
      };
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    if (API_CONFIG.useMockData) return;
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async verifyUser(userId: string) {
    if (API_CONFIG.useMockData) return;
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDashboardStats(userId: string) {
    if (API_CONFIG.useMockData) {
      return {
        totalViews: 1250,
        activeAds: 5,
        totalMessages: 42,
        totalFollowers: 18,
        avgRating: 4.8,
        soldCount: 12
      };
    }

    // This is a simplified version. In a real app, you'd use a single query or RPC
    const { count: activeAds } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    const { data: viewsData } = await supabase
      .from('products')
      .select('views_count')
      .eq('user_id', userId);
    
    const totalViews = viewsData?.reduce((sum, p) => sum + (p.views_count || 0), 0) || 0;

    const { count: totalFollowers } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    return {
      activeAds: activeAds || 0,
      totalViews,
      totalFollowers: totalFollowers || 0,
      // ... other stats
    };
  },

  async createProfile(userId: string, fullName: string) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: fullName,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const followerApi = {
  async followUser(followerId: string, followingId: string) {
    if (API_CONFIG.useMockData) return;

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });

    if (error) throw error;
  },

  async unfollowUser(followerId: string, followingId: string) {
    if (API_CONFIG.useMockData) return;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  },

  async isFollowing(followerId: string, followingId: string) {
    if (API_CONFIG.useMockData) return true; // Default to true for demo purposes
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async getFollowersCount(userId: string) {
    if (API_CONFIG.useMockData) return userId === 'mock-user-1' ? 1240 : 42;
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) throw error;
    return count || 0;
  },

  async getFollowingCount(userId: string) {
    if (API_CONFIG.useMockData) return userId === 'mock-user-1' ? 56 : 12;
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) throw error;
    return count || 0;
  },
};