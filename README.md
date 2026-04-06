# mpmarketing - Multi Place Marketing

A comprehensive mobile and web marketplace app built with Expo and Supabase, featuring infinite scrolling, categories, real-time messaging, and advanced user management.

## Features

### Core Marketplace Features
- **Infinite Scrolling Home Feed** - Browse products with smooth infinite scroll
- **Category Browsing** - 10+ predefined categories with product filtering
- **Product Listings** - Create, edit, and manage product listings
- **Sponsored Ads** - Ads appear after every 6 products
- **Real-time Search** - Search across products and categories

### User Features
- **User Authentication** - Email/password signup and login with Supabase Auth
- **User Profiles** - Display user info, ratings, reviews, and seller badges
- **Favorites/Wishlist** - Save favorite products for later
- **User Ratings** - 5-star rating system with review counts
- **Profile Management** - Edit profile, manage listings, view statistics

### Messaging & Communication
- **Real-time Chat** - Direct messaging between buyers and sellers
- **Conversation List** - View all active conversations with last message preview
- **Product Context** - Messages tied to specific product listings
- **Notification Indicators** - Unread message tracking

### Seller Tools
- **Create Listings** - Post products with title, description, price, images, condition
- **Manage Listings** - View active listings with status and view counts
- **Price Negotiation** - Mark items as negotiable
- **Featured Listings** - Promote items with featured badge

### Search & Filtering
- **Advanced Search** - Search by keywords, location, price range
- **Category Filters** - Filter by condition, price, negotiability
- **Saved Searches** - Save frequent searches with notifications
- **Product Conditions** - New, Like New, Good, Fair, Poor

## Project Structure

```
app/
├── _layout.tsx                 # Root layout with auth provider
├── (tabs)/                     # Tab-based main navigation
│   ├── _layout.tsx            # Tab navigation layout
│   ├── index.tsx              # Home screen with infinite scroll
│   ├── categories.tsx         # Browse all categories
│   ├── add-listing.tsx        # Create new listing
│   ├── messages.tsx           # Messaging hub
│   └── profile.tsx            # User profile & account
├── (auth)/                     # Authentication screens
│   ├── _layout.tsx            # Auth layout
│   ├── login.tsx              # Login screen
│   └── signup.tsx             # Signup screen
├── product/
│   └── [id].tsx               # Product detail screen
├── category/
│   └── [slug].tsx             # Category products screen
└── conversation/
    └── [id].tsx               # Chat/messaging screen

components/
├── ProductCard.tsx            # Reusable product card component
└── CategoryCard.tsx           # Reusable category card component

contexts/
└── AuthContext.tsx            # Global auth state management

lib/
└── supabase.ts               # Supabase client initialization

types/
└── database.ts               # TypeScript interfaces for all data types

supabase/migrations/
└── create_mp_marketing_schema.sql    # Database schema
```

## Database Schema

### Tables

1. **profiles** - User accounts with ratings and badges
2. **categories** - Marketplace categories with icons
3. **products** - Listings with images, pricing, conditions
4. **favorites** - Saved products by users
5. **conversations** - Chat threads between buyers/sellers
6. **messages** - Individual chat messages
7. **reviews** - User ratings and testimonials
8. **reported_items** - Reported/flagged listings
9. **saved_searches** - Saved search criteria

### Security

- **Row Level Security (RLS)** enabled on all tables
- Users can only modify their own data
- Public read access for active products
- Private access for messages and favorites
- Admin-only access for moderation

## Getting Started

### Prerequisites

- Node.js 16+
- Expo CLI
- Supabase account

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type checking
npm run typecheck

# Web build
npm run build:web
```

### Environment Setup

The app uses these Supabase environment variables (already configured):

- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Public anon key for client

## Key Technologies

- **Framework**: React Native with Expo
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password)
- **Real-time**: Supabase Realtime for messaging
- **Navigation**: Expo Router
- **Icons**: Lucide React Native
- **Language**: TypeScript

## Features Explained

### Infinite Scrolling
- Home page loads 12 products per page
- Loads more as user scrolls near bottom
- Includes ads after every 6 items

### Categories
- 10 main categories with subcategories support
- Category icons for visual identification
- Product count per category
- Deep linking to category products

### Product Listings
- Upload up to 10 photos
- Set condition (New, Like New, Good, Fair, Poor)
- Mark price as negotiable
- Add location and GPS coordinates
- Featured listing badge support

### Real-time Messaging
- Create conversation when clicking "Contact Seller"
- Real-time message delivery
- Message history per conversation
- Automatic conversation creation

### User Ratings
- 5-star rating system
- Automatic rating calculation from reviews
- Review count tracking
- Seller badges for verified users

## Usage Examples

### Creating a Listing

1. Tap "Sell" tab
2. Fill in product details
3. Select category and condition
4. Set price and location
5. Add photos
6. Tap "Post Listing"

### Contacting a Seller

1. Browse or search for product
2. Tap product card to view details
3. Tap "Contact Seller" button
4. Type message and send
5. Receive real-time responses

### Saving Favorites

1. On product card, tap heart icon
2. Product added to favorites
3. View saved items in profile

### Browsing Categories

1. Tap "Categories" tab
2. Select category to view products
3. Use search/filters to narrow results
4. Tap product to view details

## Performance Optimizations

- Pagination for infinite scroll
- Image optimization
- Lazy loading for product images
- Real-time message subscriptions
- Indexed database queries
- Debounced search

## Future Enhancements

- Video listings
- Admin dashboard
- Advanced analytics
- Payment integration
- Email notifications
- Push notifications
- Advanced filters
- Recommendation engine
- Social features
- Product comparison

## Contributing

This is a complete marketplace solution. All core features are implemented and ready for deployment.

## License

Private project - mpmarketing