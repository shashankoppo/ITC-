# MP Marketing - System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Mobile/Web)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    React Native + Expo                           │  │
│  │  ┌──────────────┐  ┌─────────────┐  ┌──────────────────┐        │  │
│  │  │ Tab Screen   │  │  Auth Stack │  │ Dynamic Routes   │        │  │
│  │  │              │  │             │  │                  │        │  │
│  │  │ • Home       │  │ • Login     │  │ • Product [id]   │        │  │
│  │  │ • Categories │  │ • Signup    │  │ • Category [slug]│        │  │
│  │  │ • Sell       │  │             │  │ • Chat [id]      │        │  │
│  │  │ • Messages   │  │             │  │                  │        │  │
│  │  │ • Profile    │  │             │  │                  │        │  │
│  │  └──────────────┘  └─────────────┘  └──────────────────┘        │  │
│  │                                                                   │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │              Context & State Management                  │   │  │
│  │  │  ┌─────────────────────────────────────────────────────┐ │   │  │
│  │  │  │  AuthContext (user, session, profile, methods)     │ │   │  │
│  │  │  └─────────────────────────────────────────────────────┘ │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │                                                                   │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │           Components (ProductCard, CategoryCard)        │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              ↓↑                                         │
│                        API Service Layer                               │
│              (productApi, favoriteApi, messageApi, etc.)              │
│                                                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓↑
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER (Supabase)                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────┐      ┌──────────────────────────────┐        │
│  │  Supabase Auth       │      │  Supabase Database           │        │
│  │                      │      │                              │        │
│  │ • Email/Password     │      │  PostgreSQL Tables:          │        │
│  │ • Session Mgmt       │      │  • profiles                  │        │
│  │ • JWT Tokens         │      │  • categories                │        │
│  │ • User Verification  │      │  • products                  │        │
│  └──────────────────────┘      │  • favorites                 │        │
│                                │  • conversations             │        │
│  ┌──────────────────────┐      │  • messages                  │        │
│  │  Supabase Realtime   │      │  • reviews                   │        │
│  │                      │      │  • reported_items            │        │
│  │ • Message Subscriptions      │  • saved_searches            │        │
│  │ • Live Updates       │      └──────────────────────────────┘        │
│  │ • Real-time Channels │                                              │
│  └──────────────────────┘      ┌──────────────────────────────┐        │
│                                │  Security (RLS)              │        │
│  ┌──────────────────────┐      │                              │        │
│  │  Supabase Storage    │      │ • Row Level Security         │        │
│  │  (Future)            │      │ • Authentication Policies    │        │
│  │                      │      │ • Authorization Checks       │        │
│  │ • Image Storage      │      │ • Data Isolation             │        │
│  │ • File Upload        │      │ • Automatic Triggers         │        │
│  └──────────────────────┘      └──────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↓↑
┌─────────────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER (PostgreSQL)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      Data Persistence                            │  │
│  │                                                                   │  │
│  │  Tables:                                                         │  │
│  │  ├─ profiles          (Users with ratings)                      │  │
│  │  ├─ categories        (10 marketplace categories)               │  │
│  │  ├─ products          (Product listings with images)            │  │
│  │  ├─ favorites         (User wishlist items)                     │  │
│  │  ├─ conversations     (Chat threads)                            │  │
│  │  ├─ messages          (Chat messages)                           │  │
│  │  ├─ reviews           (User ratings & comments)                 │  │
│  │  ├─ reported_items    (Moderation reports)                      │  │
│  │  └─ saved_searches    (User search preferences)                 │  │
│  │                                                                   │  │
│  │  Security Features:                                              │  │
│  │  ├─ 20+ RLS Policies                                            │  │
│  │  ├─ Foreign Key Constraints                                     │  │
│  │  ├─ Automatic Triggers                                          │  │
│  │  ├─ Performance Indexes                                         │  │
│  │  └─ Data Backups                                                │  │
│  │                                                                   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### User Sign Up Flow
```
User Input (SignupScreen)
    ↓
Form Validation
    ↓
supabase.auth.signUp(email, password)
    ↓
Supabase Auth Creates User
    ↓
Trigger: Create Profile Record
    ↓
AuthContext Updates
    ↓
Redirect to Home (Tabs Layout)
    ↓
User Logged In ✓
```

### Product Browsing Flow
```
Home Screen Loads
    ↓
loadProducts(page=0, limit=12)
    ↓
API Call → Supabase Query
    ↓
SELECT * FROM products
    ORDER BY created_at DESC
    LIMIT 12
    ↓
Return ProductCards Array
    ↓
Render 2-Column Grid
    ↓
User Scrolls Down
    ↓
onEndReached() Triggers
    ↓
Load More (page=1)
    ↓
Append New Products
    ↓
Ad Display Every 6 Items
```

### Product Listing Creation Flow
```
AddListingScreen Form
    ↓
User Fills Form Fields
    ↓
Form Validation Check
    ↓
All Fields Required?
    ↓ No → Show Error
    ↓ Yes
    ↓
createProduct({
  user_id,
  category_id,
  title,
  description,
  price,
  condition,
  location,
  is_negotiable,
  status: 'active',
  images: []
})
    ↓
Insert into Products Table
    ↓
Auto-set created_at, updated_at
    ↓
Success Notification
    ↓
Form Reset & Redirect Home
```

### Real-time Messaging Flow
```
Product Detail Screen
    ↓
User Taps "Contact Seller"
    ↓
Check Auth Status
    ↓ Not Logged In → Redirect Login
    ↓ Logged In
    ↓
Find/Create Conversation
    ↓
SELECT * FROM conversations
    WHERE product_id = X
    AND buyer_id = Y
    AND seller_id = Z
    ↓
No Conversation Found?
    ↓ Yes → Create New
    ↓ No → Use Existing
    ↓
Navigate to Conversation Screen
    ↓
Subscribe to Messages
    ↓
supabase.channel(`messages-{id}`)
    .on('INSERT', ...)
    .subscribe()
    ↓
Load Message History
    ↓
Display Chat UI
    ↓
User Types & Sends Message
    ↓
INSERT into messages table
    ↓
Trigger: Update conversation.last_message
    ↓
Real-time Update Received
    ↓
Message Appears Instantly
```

## Component Hierarchy

```
RootLayout (App)
│
├─ AuthProvider (Context)
│  └─ All Routes Have Access to Auth State
│
├─ Stack Navigator
│  │
│  ├─ (tabs) Group
│  │  └─ TabLayout
│  │     ├─ index (Home)
│  │     │  ├─ CategoryCard (Horizontal Scroll)
│  │     │  └─ ProductCard (2-Column Grid)
│  │     ├─ categories (Categories)
│  │     │  └─ CategoryCard (List)
│  │     ├─ add-listing (AddListing)
│  │     ├─ messages (Messages)
│  │     │  └─ Conversation Items
│  │     └─ profile (Profile)
│  │        └─ ProductCard (Listings)
│  │
│  ├─ (auth) Group
│  │  └─ AuthLayout
│  │     ├─ login (Login)
│  │     └─ signup (Signup)
│  │
│  ├─ product/[id] (ProductDetail)
│  │
│  ├─ category/[slug] (CategoryDetail)
│  │  └─ ProductCard (Grid)
│  │
│  └─ conversation/[id] (Conversation)
│     └─ Message Bubbles
│
└─ StatusBar
```

## State Management Flow

```
AuthContext
├─ session (Supabase.Session | null)
├─ user (Supabase.User | null)
├─ profile (Profile | null)
├─ loading (boolean)
└─ Methods
   ├─ signIn()
   ├─ signUp()
   ├─ signOut()
   └─ refreshProfile()

Component Local State
├─ Home
│  ├─ products: Product[]
│  ├─ categories: Category[]
│  ├─ favorites: Set<string>
│  ├─ loading: boolean
│  ├─ page: number
│  └─ hasMore: boolean
│
├─ AddListing
│  ├─ formData: FormData
│  ├─ errors: ErrorMap
│  └─ loading: boolean
│
├─ Conversation
│  ├─ messages: Message[]
│  ├─ inputText: string
│  └─ sending: boolean
│
└─ [Other Components...]
   └─ [Component-Specific State]
```

## Database Schema Relationships

```
profiles
├─ id (PK)
├─ full_name
├─ avatar_url
├─ location
├─ rating
├─ total_reviews
└─ [Other Profile Fields]

categories
├─ id (PK)
├─ name
├─ slug
├─ icon
├─ parent_id (FK → categories)
└─ [Other Category Fields]

products
├─ id (PK)
├─ user_id (FK → profiles)
├─ category_id (FK → categories)
├─ title
├─ description
├─ price
├─ images (JSON array)
├─ location
├─ status
├─ views_count
└─ [Other Product Fields]

favorites
├─ id (PK)
├─ user_id (FK → profiles)
├─ product_id (FK → products)
└─ created_at

conversations
├─ id (PK)
├─ product_id (FK → products)
├─ buyer_id (FK → profiles)
├─ seller_id (FK → profiles)
├─ last_message
├─ last_message_at
└─ created_at

messages
├─ id (PK)
├─ conversation_id (FK → conversations)
├─ sender_id (FK → profiles)
├─ content
├─ is_read
└─ created_at

reviews
├─ id (PK)
├─ reviewer_id (FK → profiles)
├─ reviewee_id (FK → profiles)
├─ product_id (FK → products)
├─ rating
├─ comment
└─ created_at

reported_items
├─ id (PK)
├─ reporter_id (FK → profiles)
├─ product_id (FK → products)
├─ reason
├─ description
├─ status
└─ created_at

saved_searches
├─ id (PK)
├─ user_id (FK → profiles)
├─ name
├─ criteria (JSON)
├─ notify_new_items
└─ created_at
```

## API Service Layer

```
api.ts Modules:
│
├─ productApi
│  ├─ getProducts(page, limit)
│  ├─ getProductById(id)
│  ├─ getProductsByCategory(categoryId)
│  ├─ getUserProducts(userId)
│  ├─ createProduct(product)
│  ├─ updateProduct(id, updates)
│  ├─ deleteProduct(id)
│  ├─ incrementViews(id)
│  └─ searchProducts(query)
│
├─ favoriteApi
│  ├─ addFavorite(userId, productId)
│  ├─ removeFavorite(userId, productId)
│  ├─ getUserFavorites(userId)
│  └─ isFavorite(userId, productId)
│
├─ messageApi
│  ├─ getConversations(userId)
│  ├─ getConversation(id)
│  ├─ createConversation(...)
│  ├─ getMessages(conversationId)
│  └─ sendMessage(...)
│
├─ reviewApi
│  ├─ getUserReviews(userId)
│  ├─ createReview(...)
│  └─ getAverageRating(userId)
│
├─ categoryApi
│  ├─ getAllCategories()
│  ├─ getCategoryBySlug(slug)
│  └─ getCategoryCount(categoryId)
│
└─ userApi
   ├─ getUserProfile(userId)
   ├─ updateUserProfile(userId, updates)
   └─ createProfile(userId, fullName)
```

## Security Architecture

```
┌─────────────────────────────────────────────────┐
│          Row Level Security (RLS)               │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│  Policies per Table (20+)                       │
│                                                  │
│  profiles:                                      │
│  • Anyone can view                              │
│  • Users can edit their own                     │
│                                                  │
│  products:                                      │
│  • Anyone can view active                       │
│  • Owners can see all their own                 │
│  • Owners can modify their own                  │
│                                                  │
│  messages:                                      │
│  • Only participants can view                   │
│  • Only sender can modify                       │
│                                                  │
│  favorites:                                     │
│  • Only owner can view/modify                   │
│                                                  │
│  conversations:                                 │
│  • Only participants can view                   │
│                                                  │
│  reviews:                                       │
│  • Anyone can view                              │
│  • Authenticated users can create               │
│                                                  │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│     Authentication Layer (Supabase Auth)        │
│                                                  │
│  • JWT Token Verification                       │
│  • Session Management                           │
│  • Password Hashing                             │
│  • Email Verification (Ready)                   │
│                                                  │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│      Transport Security (HTTPS)                 │
│                                                  │
│  • Encrypted In Transit                         │
│  • No Plaintext Secrets                         │
│  • Secure Cookies                               │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Deployment Architecture

```
Development Environment
├─ npm run dev
├─ Expo CLI
└─ Local Testing

Web Deployment
├─ npm run build:web
├─ dist/ folder created
├─ Deploy to:
│  ├─ Vercel
│  ├─ Netlify
│  └─ Custom Server
└─ CDN distribution

Mobile Deployment (iOS)
├─ eas build --platform ios
├─ Creates .ipa file
├─ Upload to:
│  ├─ App Store Connect
│  └─ App Store Review
└─ Users download from App Store

Mobile Deployment (Android)
├─ eas build --platform android
├─ Creates .aab file
├─ Upload to:
│  ├─ Google Play Console
│  └─ Google Play Review
└─ Users download from Play Store

Backend Infrastructure
├─ Supabase Hosting
├─ PostgreSQL Database
├─ Auto Backups
├─ Real-time Subscriptions
└─ 99.95% Uptime SLA
```

---

**Architecture Version**: 1.0
**Last Updated**: March 14, 2025
**Status**: Production Ready