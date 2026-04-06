// Demo Data for MP Marketing
// Created by Evolucentsphere Private Limited

export const DEMO_CREDENTIALS = {
  // Test Buyer Account
  buyer: {
    email: 'buyer@demo.mpmarketing.com',
    password: 'DemoPass@123',
    name: 'John Buyer'
  },
  // Test Seller Account
  seller: {
    email: 'seller@demo.mpmarketing.com',
    password: 'DemoPass@123',
    name: 'Sarah Seller'
  },
  // Admin Account
  admin: {
    email: 'admin@demo.mpmarketing.com',
    password: 'AdminPass@123',
    name: 'Admin User'
  }
};

export const DEMO_PRODUCTS = [
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
  },
  {
    title: 'Sectional Sofa - Modern Gray',
    description: 'L-shaped sectional sofa, gray fabric. Excellent condition. Moving sale. Must go this week!',
    price: 450,
    condition: 'good',
    category_slug: 'home-garden',
    location: 'Chicago, IL',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg']
  },
  {
    title: 'Mountain Bike Trek X-Caliber',
    description: 'Professional grade mountain bike. 27-speed, full suspension. Great for trail riding.',
    price: 650,
    condition: 'good',
    category_slug: 'sports-outdoors',
    location: 'Denver, CO',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/276517/pexels-photo-276517.jpeg']
  },
  {
    title: 'Python Developer - Remote',
    description: 'Seeking experienced Python developer for remote position. Full-time, competitive salary, benefits included.',
    price: 0,
    condition: 'new',
    category_slug: 'jobs',
    location: 'Remote',
    is_negotiable: false,
    images: ['https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg']
  },
  {
    title: 'Home Cleaning Service',
    description: 'Professional house cleaning. Eco-friendly products. Weekly, bi-weekly, or monthly packages available.',
    price: 150,
    condition: 'new',
    category_slug: 'services',
    location: 'Austin, TX',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/3735857/pexels-photo-3735857.jpeg']
  },
  {
    title: 'Golden Retriever Puppies',
    description: 'Adorable golden retriever puppies, 8 weeks old. Well-socialized, vaccinated. Great family pets.',
    price: 800,
    condition: 'new',
    category_slug: 'pets',
    location: 'Portland, OR',
    is_negotiable: false,
    images: ['https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg']
  },
  {
    title: 'Harry Potter Complete Collection',
    description: 'All 7 books in excellent condition. First editions. Perfect gift for Harry Potter fans.',
    price: 85,
    condition: 'good',
    category_slug: 'books-media',
    location: 'Seattle, WA',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/3635301/pexels-photo-3635301.jpeg']
  },
  {
    title: 'Sony WH-1000XM4 Headphones',
    description: 'Industry-leading noise cancellation. Excellent sound quality. Like new, rarely used.',
    price: 280,
    condition: 'like_new',
    category_slug: 'electronics',
    location: 'Atlanta, GA',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/3587478/pexels-photo-3587478.jpeg']
  },
  {
    title: 'Gaming Laptop - ASUS ROG',
    description: 'High performance gaming laptop. RTX 3060, 16GB RAM, 512GB SSD. Perfect for gaming and streaming.',
    price: 1200,
    condition: 'good',
    category_slug: 'electronics',
    location: 'Vegas, NV',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/18105/pexels-photo.jpeg']
  },
  {
    title: '2015 Honda Civic',
    description: 'Reliable sedan, 85k miles, clean interior and exterior. Recent oil change and tire rotation.',
    price: 9500,
    condition: 'good',
    category_slug: 'vehicles',
    location: 'Phoenix, AZ',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg']
  },
  {
    title: '2-Bedroom House for Rent',
    description: 'Spacious 2-bedroom, 1-bathroom house. Pet-friendly. Large backyard. Move-in ready.',
    price: 1800,
    condition: 'new',
    category_slug: 'property',
    location: 'Houston, TX',
    is_negotiable: true,
    images: ['https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg']
  }
];

export const DEMO_USERS = [
  {
    email: 'buyer@demo.mpmarketing.com',
    full_name: 'John Buyer',
    location: 'New York, NY',
    bio: 'Always looking for great deals!',
    is_admin: false
  },
  {
    email: 'seller@demo.mpmarketing.com',
    full_name: 'Sarah Seller',
    location: 'San Francisco, CA',
    bio: 'Quality products at fair prices',
    is_admin: false
  },
  {
    email: 'admin@demo.mpmarketing.com',
    full_name: 'Admin User',
    location: 'New York, NY',
    bio: 'Platform administrator',
    is_admin: true
  },
  {
    email: 'alice.johnson@demo.mpmarketing.com',
    full_name: 'Alice Johnson',
    location: 'Los Angeles, CA',
    bio: 'Loves vintage items',
    is_admin: false
  },
  {
    email: 'bob.smith@demo.mpmarketing.com',
    full_name: 'Bob Smith',
    location: 'Chicago, IL',
    bio: 'Tech enthusiast',
    is_admin: false
  }
];

export const DEMO_REVIEWS = [
  {
    rating: 5,
    comment: 'Great seller! Fast shipping and item exactly as described.',
    reviewer_email: 'buyer@demo.mpmarketing.com',
    reviewee_email: 'seller@demo.mpmarketing.com'
  },
  {
    rating: 4,
    comment: 'Good communication. Product arrived in good condition.',
    reviewer_email: 'alice.johnson@demo.mpmarketing.com',
    reviewee_email: 'sarah.seller@demo.mpmarketing.com'
  },
  {
    rating: 5,
    comment: 'Excellent transaction. Highly recommended!',
    reviewer_email: 'bob.smith@demo.mpmarketing.com',
    reviewee_email: 'seller@demo.mpmarketing.com'
  }
];