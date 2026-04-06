# MP Marketing - Testing & Demo Guide

## Quick Start for Demo

### Test Accounts (Pre-configured)

You can use these credentials to test the app:

#### Buyer Account
```
Email: buyer@demo.mpmarketing.com
Password: DemoPass@123
Name: John Buyer
```

#### Seller Account
```
Email: seller@demo.mpmarketing.com
Password: DemoPass@123
Name: Sarah Seller
```

#### Admin Account
```
Email: admin@demo.mpmarketing.com
Password: DemoPass@123
Name: Admin User
```

**Note:** These accounts need to be created first via Supabase Auth dashboard or via the signup process.

---

## Setting Up Demo Accounts

### Option 1: Create via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Authentication → Users**
3. Click **Add user**
4. Create each demo account:

**Buyer Account:**
- Email: `buyer@demo.mpmarketing.com`
- Password: `DemoPass@123`
- Auto-confirm email (toggle on)

**Seller Account:**
- Email: `seller@demo.mpmarketing.com`
- Password: `DemoPass@123`
- Auto-confirm email (toggle on)

**Admin Account:**
- Email: `admin@demo.mpmarketing.com`
- Password: `DemoPass@123`
- Auto-confirm email (toggle on)

### Option 2: Create via App Signup

1. Open the app
2. Click **"Create one"** link on login screen
3. Sign up with the demo credentials above
4. After signing up, your profile is automatically created

---

## Adding Demo Products

Once demo accounts are created and profiles exist, you can add products:

### Via the App

1. **Log in** with seller account
2. Go to **"Sell"** tab (plus icon)
3. Fill in product details:
   - Title: "iPhone 14 Pro Max 256GB"
   - Category: "Electronics"
   - Price: 899
   - Condition: "Like New"
   - Description: "Excellent condition, bought 6 months ago."
   - Location: "New York, NY"
   - Price Negotiable: Toggle ON
4. Click **"Post Listing"**

### Sample Products to Create

```
1. iPhone 14 Pro Max 256GB
   - Price: $899
   - Category: Electronics
   - Condition: Like New
   - Location: New York, NY
   - Negotiable: Yes

2. MacBook Air M1
   - Price: $899
   - Category: Electronics
   - Condition: Good
   - Location: San Francisco, CA
   - Negotiable: Yes

3. 2020 Toyota Camry SE
   - Price: $18,500
   - Category: Vehicles
   - Condition: Good
   - Location: Los Angeles, CA
   - Negotiable: Yes

4. Studio Apartment Downtown
   - Price: $1,500
   - Category: Property
   - Condition: New
   - Location: Boston, MA
   - Negotiable: No

5. Designer Leather Handbag
   - Price: $200
   - Category: Fashion
   - Condition: Like New
   - Location: Miami, FL
   - Negotiable: Yes

6. Mountain Bike Trek
   - Price: $650
   - Category: Sports & Outdoors
   - Condition: Good
   - Location: Denver, CO
   - Negotiable: Yes
```

---

## Testing Features

### 1. Home Feed Testing
✅ **Infinite Scroll**
- Open Home tab
- Scroll down to see products load in batches of 12
- Check that ads appear after every 6 products

✅ **Category Carousel**
- Swipe left/right to browse categories
- Click category to filter products

✅ **Pull to Refresh**
- Pull down on the feed to refresh

### 2. Browsing & Search
✅ **Search Functionality**
- Click search bar at top of home
- Type product name (e.g., "iPhone")
- See filtered results

✅ **Category Filtering**
- Click "Categories" tab
- Click category to view products in that category
- See item count for each category

### 3. Product Details
✅ **View Product Details**
- Click any product card
- See full description, images, price
- See seller information and ratings
- See featured badge if applicable

✅ **Favorite Products**
- Click heart icon on product
- Product saves to favorites
- Navigate to Profile to see saved items

### 4. Messaging System
✅ **Send Message to Seller**
- View a product as buyer account
- Click "Contact Seller"
- Type message and send
- Conversation appears in Messages tab

✅ **Receive Messages**
- Log in with seller account
- Go to Messages tab
- See buyer's message
- Reply to conversation

✅ **Real-time Updates**
- Messages appear instantly
- Conversation list updates automatically
- Last message preview displays

### 5. User Profiles
✅ **View Profile**
- Click Profile tab
- See user information
- View active listings
- See statistics (listings, favorites, followers)

✅ **Edit Profile**
- Click edit button (pencil icon)
- Update profile information
- Save changes

### 6. Listings Management
✅ **Create Listing**
- Click Sell tab
- Fill form and post
- Listing appears on home feed

✅ **View My Listings**
- Go to Profile tab
- See "My Listings" section
- View status and view counts

✅ **Manage Listings**
- Click listing to edit or view details
- Update listing information
- Mark as sold

### 7. Authentication
✅ **Sign Up**
- Click "Create one" on login
- Enter full name, email, password
- Account created automatically
- Logged in and redirected to home

✅ **Sign In**
- Enter email and password
- Click "Sign In"
- Verified and redirected to home

✅ **Sign Out**
- Go to Profile tab
- Scroll to Settings
- Click "Sign Out"
- Redirected to login

---

## Demo Credentials Quick Reference

### Copy-Paste Ready

**Buyer Account:**
```
buyer@demo.mpmarketing.com
DemoPass@123
```

**Seller Account:**
```
seller@demo.mpmarketing.com
DemoPass@123
```

**Admin Account:**
```
admin@demo.mpmarketing.com
DemoPass@123
```

---

## UI/UX Testing Checklist

### Visual Design
- [ ] Color scheme (blue primary, red accents) consistent
- [ ] Typography readable and properly sized
- [ ] Buttons responsive and properly styled
- [ ] Icons display correctly and are recognizable
- [ ] Forms are well-organized and easy to use
- [ ] Loading states visible (spinners, indicators)
- [ ] Error messages clear and helpful

### Responsiveness
- [ ] Layout works on mobile (375px width)
- [ ] Works on tablet (iPad size)
- [ ] Works on web browsers
- [ ] Safe area respected (notches, home indicators)
- [ ] No horizontal scroll (except intentional carousels)
- [ ] Touch targets are at least 44x44 pixels

### Navigation
- [ ] Tab navigation works smoothly
- [ ] Back button returns to previous screen
- [ ] Deep linking works (direct product URLs)
- [ ] No infinite loops or dead ends
- [ ] Screen transitions are smooth

### Performance
- [ ] Home feed loads quickly
- [ ] Images display without excessive delay
- [ ] Search responds quickly
- [ ] Messages send/receive instantly
- [ ] No lag when typing in forms

---

## Testing with Multiple Devices

### iOS Devices
- iPhone 12, 13, 14, 15
- iPhone SE
- iPad
- Test Safe Area with notches

### Android Devices
- Pixel 6, 7, 8
- Samsung Galaxy S21+
- OnePlus devices
- Test with different screen sizes

### Web Browsers
- Chrome/Chromium
- Safari
- Firefox
- Edge
- Test responsive view (375px - 1920px)

---

## Performance Benchmarks

Target metrics:
- **Home feed load:** < 2 seconds
- **Product detail page:** < 1 second
- **Message send:** < 500ms
- **Search results:** < 1 second
- **Login:** < 2 seconds

---

## Known Limitations (For Testing)

1. **Image Upload:** Currently placeholder - ready for Supabase Storage integration
2. **Location Map:** Location fields for text only currently - ready for Maps integration
3. **Notifications:** Push notifications ready for Expo Notifications integration
4. **Payment:** Ready for Stripe/PayPal integration
5. **Admin Dashboard:** Ready to be built

---

## Troubleshooting

### "Login Failed" Error
**Solution:** Ensure demo account exists in Supabase Auth dashboard

### "Can't Send Message"
**Solution:** Make sure you're logged in and not trying to message yourself

### "Product Won't Post"
**Solution:** Check that all required fields are filled and you're logged in

### "Infinite Loop on Home"
**Solution:** Pull to refresh to reset the feed

### "Messages Not Updating"
**Solution:** Refresh the Messages tab or navigate away and back

---

## Company Information

**MP Marketing** is developed by:
- **Evolucentsphere Private Limited**
- **Technical Partner:** Evolucentsphere Development Team
- **Version:** 1.0.0
- **Released:** March 2025

---

## Support

For issues or questions:
1. Check this guide first
2. Review QUICKSTART.md for user guide
3. Check IMPLEMENTATION.md for technical details
4. Contact support@mpmarketing.com

---

**Happy Testing! 🚀**