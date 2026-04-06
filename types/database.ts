export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  location?: string;
  bio?: string;
  is_admin: boolean;
  rating: number;
  total_reviews: number;
  active_listings_count?: number;
  favorites_count?: number;
  views_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition?: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images: string[];
  location?: string;
  latitude?: number;
  longitude?: number;
  is_negotiable: boolean;
  status: 'active' | 'sold' | 'archived' | 'pending';
  views_count: number;
  is_featured: boolean;
  tier: 'free' | 'standard' | 'premium';
  featured_until?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  categories?: Category;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  products?: Product;
}

export interface Conversation {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  last_message?: string;
  last_message_at: string;
  created_at: string;
  products?: Product;
  buyer?: Profile;
  seller?: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  product_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: Profile;
  products?: Product;
}

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string;
  criteria: any;
  notify_new_items: boolean;
  created_at: string;
}

/** 
 * CX Data Management (Contact Import / Location Sync) 
 * Added for Authority/Professional features 
 */
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  phone_number: string;
  email?: string;
  sync_type: 'manual' | 'auto';
  imported_at: string;
}

export interface UserActivityRecord {
  id: string;
  user_id: string;
  record_type: 'sms_meta' | 'call_meta' | 'location_meta';
  data_payload: any; // Using JSON payload for flexibility
  created_at: string;
}