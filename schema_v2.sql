-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT, -- Lucide icon name
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create foods table
CREATE TABLE IF NOT EXISTS foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL CHECK (price >= 0),
    discount_price NUMERIC CHECK (discount_price >= 0),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    image TEXT, -- path or URL
    rating NUMERIC DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    calories INTEGER DEFAULT 0,
    cook_time INTEGER DEFAULT 15, -- in minutes
    stock INTEGER DEFAULT 50 CHECK (stock >= 0),
    featured BOOLEAN DEFAULT false,
    is_veg BOOLEAN DEFAULT false,
    is_vegan BOOLEAN DEFAULT false,
    is_gluten_free BOOLEAN DEFAULT false,
    spicy_level INTEGER DEFAULT 0 CHECK (spicy_level >= 0 AND spicy_level <= 3), -- 0=none, 1=mild, 2=spicy, 3=naga
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- references auth.users(id)
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'delivery')),
    reward_points INTEGER DEFAULT 0 CHECK (reward_points >= 0),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount NUMERIC NOT NULL CHECK (discount > 0), -- percentage or absolute
    expire_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'cooking', 'delivery', 'delivered', 'cancelled')),
    total NUMERIC NOT NULL CHECK (total >= 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'stripe', 'sslcommerz', 'bkash', 'nagad')),
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    notes TEXT,
    discount_applied NUMERIC DEFAULT 0,
    code_used TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC NOT NULL CHECK (price >= 0)
);

-- 7. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    likes INTEGER DEFAULT 0 CHECK (likes >= 0),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    UNIQUE(user_id, food_id)
);

-- 9. Create banners table
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image TEXT NOT NULL,
    link TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Create reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    guests INTEGER NOT NULL CHECK (guests > 0),
    date DATE NOT NULL,
    time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Clean up existing policies if any to prevent duplicate policy crashes
DROP POLICY IF EXISTS "Allow public read categories" ON categories;
DROP POLICY IF EXISTS "Allow public read foods" ON foods;
DROP POLICY IF EXISTS "Allow public read banners" ON banners;
DROP POLICY IF EXISTS "Allow public read reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public insert reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow user edit own profile" ON profiles;
DROP POLICY IF EXISTS "Allow user insert own profile" ON profiles;
DROP POLICY IF EXISTS "Allow public read coupons" ON coupons;
DROP POLICY IF EXISTS "Allow user read own orders" ON orders;
DROP POLICY IF EXISTS "Allow user insert own orders" ON orders;
DROP POLICY IF EXISTS "Allow admin edit orders" ON orders;
DROP POLICY IF EXISTS "Allow public read order items" ON order_items;
DROP POLICY IF EXISTS "Allow public insert order items" ON order_items;
DROP POLICY IF EXISTS "Allow user check own favorites" ON favorites;
DROP POLICY IF EXISTS "Allow user insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Allow user delete own favorites" ON favorites;
DROP POLICY IF EXISTS "Allow user check own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow user update own notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public insert reservations" ON reservations;
DROP POLICY IF EXISTS "Allow user read own reservations" ON reservations;

-- Define Row Level Security Policies
CREATE POLICY "Allow public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read foods" ON foods FOR SELECT USING (true);
CREATE POLICY "Allow public read banners" ON banners FOR SELECT USING (true);
CREATE POLICY "Allow public read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Allow public insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Profiles policies
CREATE POLICY "Allow public read profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Allow user edit own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow user insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Coupons policy
CREATE POLICY "Allow public read coupons" ON coupons FOR SELECT USING (true);

-- Orders policies
CREATE POLICY "Allow user read own orders" ON orders FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Allow user insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Allow admin edit orders" ON orders FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Order Items policies
CREATE POLICY "Allow user read own order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
    )
);
CREATE POLICY "Allow public insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Favorites policies
CREATE POLICY "Allow user check own favorites" ON favorites FOR SELECT USING (true);
CREATE POLICY "Allow user insert own favorites" ON favorites FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow user delete own favorites" ON favorites FOR DELETE USING (true);

-- Notifications policies
CREATE POLICY "Allow user check own notifications" ON notifications FOR SELECT USING (true);
CREATE POLICY "Allow user update own notifications" ON notifications FOR UPDATE USING (true);

-- Reservations policies
CREATE POLICY "Allow public insert reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow user read own reservations" ON reservations FOR SELECT USING (true);

-- Admin write policies for catalog tables
DROP POLICY IF EXISTS "Allow admin manage categories" ON categories;
DROP POLICY IF EXISTS "Allow admin manage foods" ON foods;
DROP POLICY IF EXISTS "Allow admin manage coupons" ON coupons;
DROP POLICY IF EXISTS "Allow admin manage banners" ON banners;

CREATE POLICY "Allow admin manage categories" ON categories FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Allow admin manage foods" ON foods FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Allow admin manage coupons" ON coupons FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Allow admin manage banners" ON banners FOR ALL USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Clean up existing foods and categories
TRUNCATE TABLE order_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE foods RESTART IDENTITY CASCADE;
TRUNCATE TABLE categories RESTART IDENTITY CASCADE;

-- Insert Category seeds
INSERT INTO categories (id, name, icon) VALUES
('c1000000-0000-0000-0000-000000000001', 'appetizer', 'Pizza'),
('c1000000-0000-0000-0000-000000000002', 'main', 'Pizza'),
('c1000000-0000-0000-0000-000000000003', 'bangladeshi', 'Layers'),
('c1000000-0000-0000-0000-000000000004', 'fastfood', 'Pizza'),
('c1000000-0000-0000-0000-000000000005', 'seafood', 'Pizza'),
('c1000000-0000-0000-0000-000000000006', 'dessert', 'Coffee'),
('c1000000-0000-0000-0000-000000000007', 'drinks', 'Wine')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon;

-- Insert Food Seeds (Cleared to remove mock data)

-- Insert Coupon Seeds (Cleared to remove mock data)

-- Insert Banner Seeds (Cleared to remove mock data)

-- Helper script to promote a user to admin in the database:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Migration: Add admin_reply to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT;

-- Migration: Create support_queries table
CREATE TABLE IF NOT EXISTS support_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Migration: Create restaurant_settings table
CREATE TABLE IF NOT EXISTS restaurant_settings (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    location_details TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    twitter_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO restaurant_settings (id, phone, email, address, location_details, facebook_url, instagram_url, twitter_url)
VALUES (
    'contact_info',
    '+880 1712-345678',
    'support@flavorhaven.com',
    'Road 12/A, Dhanmondi, Dhaka',
    'Near SMUCT Campus. Dedicated parking available.',
    'https://facebook.com/flavorhaven',
    'https://instagram.com/flavorhaven',
    'https://twitter.com/flavorhaven'
)
ON CONFLICT (id) DO NOTHING;

-- Migration: Add admin_reply to support_queries
ALTER TABLE support_queries ADD COLUMN IF NOT EXISTS admin_reply TEXT;

-- Migration: Create food-images storage bucket & configure RLS policies
INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public read of food-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin upload to food-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin update food-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin delete food-images" ON storage.objects;

CREATE POLICY "Allow public read of food-images" ON storage.objects FOR SELECT USING (bucket_id = 'food-images');
CREATE POLICY "Allow admin upload to food-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'food-images' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Allow admin update food-images" ON storage.objects FOR UPDATE USING (bucket_id = 'food-images' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Allow admin delete food-images" ON storage.objects FOR DELETE USING (bucket_id = 'food-images' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
