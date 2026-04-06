
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const supabaseUrl = env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEMO_CREDENTIALS = {
  buyer: { email: 'buyer@demo.mpmarketing.com', password: 'DemoPass@123', name: 'John Buyer' },
  seller: { email: 'seller@demo.mpmarketing.com', password: 'DemoPass@123', name: 'Sarah Seller' },
  admin: { email: 'admin@demo.mpmarketing.com', password: 'AdminPass@123', name: 'Admin User' }
};

const DEMO_PRODUCTS = [
  {
    title: 'iPhone 14 Pro Max 256GB',
    description: 'Excellent condition, bought 6 months ago. Comes with original box and accessories. Minor scratches on body.',
    price: 899,
    condition: 'like_new',
    category_slug: 'electronics',
    location: 'New York, NY',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg']
  },
  {
    title: 'MacBook Air M1 13-inch',
    description: 'Perfect for developers and designers. 8GB RAM, 256GB SSD. Very fast and quiet. Battery lasts all day.',
    price: 899,
    condition: 'good',
    category_slug: 'electronics',
    location: 'San Francisco, CA',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/18105/pexels-photo.jpeg']
  },
  {
    title: '2020 Toyota Camry SE',
    description: 'Low mileage (45k miles), one owner, regular maintenance. Clean title. Great family car.',
    price: 18500,
    condition: 'good',
    category_slug: 'vehicles',
    location: 'Los Angeles, CA',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg']
  },
  {
    title: 'Studio Apartment in Downtown',
    description: 'Newly renovated studio apartment. Hardwood floors, modern kitchen, gym access. Available immediately.',
    price: 1500,
    condition: 'new',
    category_slug: 'property',
    location: 'Boston, MA',
    is_negotiable: false,
    images: ['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg']
  },
  {
    title: 'Designer Leather Handbag',
    description: 'Authentic Coach handbag in brown leather. Comes with dust bag. Barely used, like new condition.',
    price: 200,
    condition: 'like_new',
    category_slug: 'fashion',
    location: 'Miami, FL',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/3622613/pexels-photo-3622613.jpeg']
  }
];

async function seed() {
  console.log('Starting seed process...');

  // 1. Get Category IDs
  const { data: categories, error: catError } = await supabase.from('categories').select('id, slug');
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }
  const categoryMap = {};
  categories.forEach(c => categoryMap[c.slug] = c.id);

  const userIds = {};

  // 2. Create/Sign-in Users
  for (const [key, creds] of Object.entries(DEMO_CREDENTIALS)) {
    console.log(`Checking user: ${creds.email}`);
    
    // Try to sign up
    let { data, error } = await supabase.auth.signUp({
      email: creds.email,
      password: creds.password,
      options: {
        data: {
          full_name: creds.name
        }
      }
    });

    if (error && error.message.includes('already registered')) {
      console.log(`User ${creds.email} already exists, signing in...`);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: creds.email,
        password: creds.password
      });
      if (signInError) {
        console.error(`Error signing in ${creds.email}:`, signInError);
        continue;
      }
      data = signInData;
    } else if (error) {
      console.error(`Error signing up ${creds.email}:`, error);
      continue;
    }

    const userId = data.user.id;
    userIds[key] = userId;

    // 3. Ensure Profile exists
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: creds.name,
      is_admin: key === 'admin',
      location: creds.email.includes('buyer') ? 'New York, NY' : 'San Francisco, CA'
    });

    if (profileError) {
      console.error(`Error upserting profile for ${creds.email}:`, profileError);
    } else {
      console.log(`Profile for ${creds.email} is ready.`);
    }
  }

  // 4. Insert Products
  console.log('Signing in as seller to insert products...');
  const { error: sellerSignInError } = await supabase.auth.signInWithPassword({
    email: DEMO_CREDENTIALS.seller.email,
    password: DEMO_CREDENTIALS.seller.password
  });

  if (sellerSignInError) {
    console.error('Error signing in as seller for product insertion:', sellerSignInError);
    return;
  }

  console.log('Inserting products...');
  for (const product of DEMO_PRODUCTS) {
    const categoryId = categoryMap[product.category_slug];
    if (!categoryId) {
      console.warn(`Category slug ${product.category_slug} not found, skipping product.`);
      continue;
    }

    const { error: productError } = await supabase.from('products').insert({
      user_id: userIds.seller,
      category_id: categoryId,
      title: product.title,
      description: product.description,
      price: product.price,
      condition: product.condition,
      images: product.images,
      location: product.location,
      is_negotiable: product.is_negotiable,
      status: 'active'
    });

    if (productError) {
      console.error(`Error inserting product ${product.title}:`, productError);
    } else {
      console.log(`Product ${product.title} inserted.`);
    }
  }

  console.log('Seed process completed!');
}

seed();
