import { supabase } from './supabase';
import { Product, Review } from '@/types/database';

export const productApi = {
  async getProducts(page: number = 0, limit: number = 12) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(*), categories(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data;
  },

  async getProductById(id: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(*), categories(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getProductsByCategory(categoryId: string, page: number = 0, limit: number = 12) {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(*), categories(*)')
      .eq('category_id', categoryId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;
    return data;
  },

  async getUserProducts(userId: string) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async createProduct(product: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
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

  async searchProducts(query: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('products')
      .select('*, profiles(*), categories(*)')
      .eq('status', 'active')
      .ilike('title', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data;
  },
};

export const favoriteApi = {
  async addFavorite(userId: string, productId: string) {
    const { error } = await supabase
      .from('favorites')
      .insert({ user_id: userId, product_id: productId });

    if (error) throw error;
  },

  async removeFavorite(userId: string, productId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;
  },

  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, products(*, profiles(*), categories(*))')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async isFavorite(userId: string, productId: string) {
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
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(conversationId: string, senderId: string, content: string) {
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
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  async getCategoryBySlug(slug: string) {
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserProfile(userId: string, updates: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
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