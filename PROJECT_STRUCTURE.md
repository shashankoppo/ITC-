# MP Marketing - Project Structure

## Directory Tree

```
mp-marketing/
├── app/                              # Expo Router app directory
│   ├── _layout.tsx                   # Root layout with AuthProvider
│   ├── +not-found.tsx                # 404 fallback
│   │
│   ├── (auth)/                       # Authentication routes group
│   │   ├── _layout.tsx               # Auth layout
│   │   ├── login.tsx                 # Login screen
│   │   └── signup.tsx                # Signup screen
│   │
│   ├── (tabs)/                       # Main tab navigation group
│   │   ├── _layout.tsx               # Tab navigator configuration
│   │   ├── index.tsx                 # Home screen (infinite scroll)
│   │   ├── categories.tsx            # Categories browsing screen
│   │   ├── add-listing.tsx           # Create/post listing screen
│   │   ├── messages.tsx              # Messaging hub screen
│   │   └── profile.tsx               # User profile screen
│   │
│   ├── product/                      # Dynamic product routes
│   │   └── [id].tsx                  # Product detail screen
│   │
│   ├── category/                     # Dynamic category routes
│   │   └── [slug].tsx                # Category products screen
│   │
│   └── conversation/                 # Dynamic conversation routes
│       └── [id].tsx                  # Chat/messaging screen
│
├── components/                       # Reusable React components
│   ├── ProductCard.tsx               # Product listing card component
│   └── CategoryCard.tsx              # Category icon card component
│
├── contexts/                         # React Context providers
│   └── AuthContext.tsx               # Global authentication state
│
├── lib/                              # Utility and service files
│   ├── supabase.ts                   # Supabase client initialization
│   └── api.ts                        # API service layer with functions
│
├── types/                            # TypeScript type definitions
│   ├── database.ts                   # Database table interfaces
│   └── env.d.ts                      # Environment variable types
│
├── assets/                           # Static assets
│   └── images/                       # App icons and images
│       ├── icon.png
│       ├── favicon.png
│       └── ...
│
├── supabase/                         # Supabase configurations
│   └── migrations/                   # Database migrations
│       └── create_mp_marketing_schema.sql
│
├── .env                              # Environment variables (local)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── .prettierrc                       # Code formatting config
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies and scripts
├── expo-env.d.ts                     # Expo environment types
├── app.json                          # Expo app configuration
│
├── README.md                         # Main project readme
├── FEATURES.md                       # Complete feature list
├── QUICKSTART.md                     # User guide and setup
├── IMPLEMENTATION.md                 # Implementation details
└── PROJECT_STRUCTURE.md              # This file
```

## Screen Structure

### Authentication Flow
```
Login/Signup
    ↓
    ├─→ Home (if authenticated)
    └─→ Login (if not)
```

### Main Navigation (Tab-based)
```
┌──────────────────────────────────────┐
│         MP Marketing (Header)         │
├──────────────────────────────────────┤
│                                      │
│      Current Screen Content          │
│      (Home, Categories, etc.)        │
│                                      │
├──────────────────────────────────────┤
│ Home │ Categories │ Sell │ Messages │ Profile │
└──────────────────────────────────────┘
```

### Home Screen Layout
```
┌─────────────────────────┐
│ Logo + Search + Filters │  ← Header
├─────────────────────────┤
│   Category Carousel     │  ← Horizontal scroll
├─────────────────────────┤
│ Product 1 │ Product 2   │
├───────────┼─────────────┤
│ Product 3 │ Product 4   │  ← Infinite scroll grid
├───────────┼─────────────┤
│    Sponsored Ad Area    │  ← After every 6 items
├───────────┼─────────────┤
│ Product 5 │ Product 6   │
│ Product 7 │ Product 8   │
└─────────────────────────┘
```

### Product Detail Screen
```
┌─────────────────────────┐
│ Back │ Share │ Favorite │  ← Header
├─────────────────────────┤
│                         │
│    Product Image        │  ← Large image display
│                         │
├─────────────────────────┤
│ Title                   │
│ Price (Large, Blue)     │  ← Key info
│ Location • Date         │
├─────────────────────────┤
│ Seller Card             │  ← Seller info
│ [Avatar] Name Rating    │
├─────────────────────────┤
│ Description Section     │  ← Full details
├─────────────────────────┤
│ Details Section         │
│ Condition │ Category    │
│ Negotiable │ Views      │
├─────────────────────────┤
│  Contact │ Report       │  ← Action buttons
└─────────────────────────┘
```

### Add Listing Form
```
┌──────────────────────────────┐
│ Post New Listing Header      │
├──────────────────────────────┤
│ [Add Photos Area]            │
├──────────────────────────────┤
│ Title Input                  │
├──────────────────────────────┤
│ Category Selector            │
├──────────────────────────────┤
│ Description (Textarea)       │
├──────────────────────────────┤
│ Price Input                  │
│ ☐ Price is negotiable        │
├──────────────────────────────┤
│ Condition Selector           │
├──────────────────────────────┤
│ Location Input               │
├──────────────────────────────┤
│ [Post Listing Button]        │
└──────────────────────────────┘
```

### Messaging Screen
```
┌──────────────────────────────┐
│ Messages Header              │
├──────────────────────────────┤
│ Conversation 1               │
│ [Thumb] Seller • Time        │
│ Product • Last message...    │
├──────────────────────────────┤
│ Conversation 2               │
│ [Thumb] Buyer • Time         │
│ Product • Last message...    │
├──────────────────────────────┤
│ Conversation 3               │
│ [Thumb] Seller • Time        │
│ Product • Last message...    │
└──────────────────────────────┘
```

### Chat Conversation
```
┌──────────────────────────────┐
│ Back │ Name │ Product │ [Pic]│  ← Header
├──────────────────────────────┤
│                              │
│ Their message                │  ← Received (gray)
│ 10:30 AM                     │
│                              │
│                Your message  │  ← Sent (blue)
│                10:35 AM      │
│                              │
│ Their message                │
│ 10:40 AM                     │
│                              │
├──────────────────────────────┤
│ Message input [Type...]  [→] │  ← Input area
└──────────────────────────────┘
```

## Data Models

### Profile
```typescript
{
  id: string (UUID)
  full_name: string
  avatar_url?: string
  phone?: string
  location?: string
  bio?: string
  is_admin: boolean
  rating: numeric(3,2)
  total_reviews: integer
  created_at: timestamptz
  updated_at: timestamptz
}
```

### Product
```typescript
{
  id: string (UUID)
  user_id: string (FK to Profile)
  category_id: string (FK to Category)
  title: string
  description: string
  price: numeric(10,2)
  currency: string
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor'
  images: string[] (URLs array)
  location?: string
  latitude?: number
  longitude?: number
  is_negotiable: boolean
  status: 'active' | 'sold' | 'archived' | 'pending'
  views_count: integer
  is_featured: boolean
  featured_until?: timestamptz
  created_at: timestamptz
  updated_at: timestamptz
}
```

### Conversation
```typescript
{
  id: string (UUID)
  product_id: string (FK to Product)
  buyer_id: string (FK to Profile)
  seller_id: string (FK to Profile)
  last_message?: string
  last_message_at: timestamptz
  created_at: timestamptz
}
```

### Message
```typescript
{
  id: string (UUID)
  conversation_id: string (FK to Conversation)
  sender_id: string (FK to Profile)
  content: string
  is_read: boolean
  created_at: timestamptz
}
```

## Component Hierarchy

```
RootLayout (AuthProvider)
├── Stack Navigation
│   ├── (tabs) - TabLayout
│   │   ├── index (Home)
│   │   │   ├── CategoryCard (array)
│   │   │   └── ProductCard (array)
│   │   ├── categories (Categories)
│   │   ├── add-listing (AddListing)
│   │   ├── messages (Messages)
│   │   └── profile (Profile)
│   │
│   ├── (auth) - AuthLayout
│   │   ├── login (Login)
│   │   └── signup (Signup)
│   │
│   ├── product/[id] (ProductDetail)
│   ├── category/[slug] (CategoryDetail)
│   │   └── ProductCard (array)
│   └── conversation/[id] (Conversation)
│       └── Messages (array)
```

## State Management

```
AuthContext (Global)
├── session: Supabase.Session | null
├── user: Supabase.User | null
├── profile: Profile | null
├── loading: boolean
└── Methods:
    ├── signIn(email, password)
    ├── signUp(email, password, fullName)
    ├── signOut()
    └── refreshProfile()

Component State (Local)
├── Home: products, categories, favorites, loading, page
├── Profile: listings, favorites, loading
├── AddListing: formData, errors, loading
├── Messages: conversations, loading
├── ProductDetail: product, isFavorite, loading
├── Category: category, products, favorites, page, loading
└── Conversation: messages, inputText, loading
```

## API Call Flow

```
Component
    ↓
useAuth() or direct API call
    ↓
api.ts (Service layer)
    ↓
supabase.ts (Client)
    ↓
Supabase Backend
    ↓
PostgreSQL Database
    ↓
Response back to Component
```

## File Dependencies

```
App Root
└── _layout.tsx
    ├── AuthProvider (AuthContext.tsx)
    │   └── supabase.ts
    ├── Stack Navigation
    └── All Screens
        ├── useAuth() → AuthContext
        ├── API calls → api.ts
        │   └── supabase.ts
        ├── useRouter() → expo-router
        ├── useLocalSearchParams() → expo-router
        └── Components
            ├── ProductCard.tsx
            └── CategoryCard.tsx

TypeScript Types
└── types/database.ts
    └── Used by all screens and components

Environment
└── .env
    └── Used by supabase.ts
```

## Key Technologies

```
Frontend Framework
├── React Native
├── Expo
├── Expo Router (Navigation)
├── TypeScript
└── React Hooks

UI Components
├── React Native Core (View, Text, etc.)
├── SafeAreaView (react-native-safe-area-context)
├── Lucide Icons (lucide-react-native)
└── Custom Components

State Management
├── React Context (AuthContext)
├── React Hooks (useState, useEffect)
└── Supabase Realtime

Backend & Database
├── Supabase
├── PostgreSQL
├── Supabase Auth
├── Supabase Realtime
└── Row Level Security

Development Tools
├── TypeScript Compiler
├── ESLint
├── Prettier
└── Expo CLI
```

## Deployment Architecture

```
Development
├── Local Machine
├── npm run dev
└── Expo CLI Server

Web Deployment
├── npm run build:web
├── Static exports
└── Deploy to Vercel/Netlify

Mobile Deployment
├── EAS Build
├── iOS/Android Binary
└── App Store/Play Store

Backend
├── Supabase Hosting
├── PostgreSQL Database
├── Real-time Features
└── Authentication
```

---

**Last Updated**: March 14, 2025
**Framework Version**: Expo 54
**Status**: Complete and Production Ready