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

-- Insert Food Seeds
INSERT INTO foods (title, description, price, discount_price, category_id, image, rating, calories, cook_time, stock, featured, is_veg, is_vegan, is_gluten_free, spicy_level) VALUES
-- Appetizers
('French Fries', 'Crispy golden French fries seasoned with salt and spices.', 150, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6, 312, 10, 50, false, true, true, true, 0),
('Chicken Wings', 'Deep fried crispy chicken wings tossed in spicy buffalo sauce.', 350, 320, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 450, 12, 45, true, false, false, false, 2),
('Spring Rolls', 'Crispy fried rolls filled with fresh sautéed vegetables.', 180, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.4, 220, 8, 40, false, true, true, false, 0),
('Garlic Bread', 'Toasted baguette slices brushed with garlic butter and herbs.', 120, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.5, 180, 6, 60, false, true, false, false, 0),
('Soup', 'Warm, comforting vegetable broth soup with rich herbs.', 200, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.5, 150, 10, 30, false, true, true, true, 0),
('Salad', 'Fresh garden greens with cucumbers, tomatoes, and olive oil dressing.', 220, 200, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 120, 5, 40, false, true, true, true, 0),

-- Main Courses
('Fried Rice', 'Classic wok-tossed jasmine rice with vegetables and light soy.', 300, null, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6, 550, 12, 40, false, true, false, true, 0),
('Biryani', 'Aromatic basmati rice cooked with rich local spices and mutton.', 450, 400, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9, 750, 15, 35, true, false, false, false, 1),
('Pizza', 'Hand-tossed crust topped with rich marinara sauce and mozzarella.', 800, null, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 950, 20, 30, true, true, false, false, 0),
('Classic Burger', 'Beef patty loaded with melted cheese, lettuce, and pickles.', 350, null, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 650, 12, 45, false, false, false, false, 0),
('Pasta', 'Penne pasta tossed in a creamy, velvety white sauce with garlic.', 400, 360, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6, 580, 15, 35, false, true, false, false, 0),
('Sandwich', 'Grilled club sandwich loaded with layers of cheese and vegetables.', 250, null, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.5, 420, 8, 50, false, true, false, false, 0),
('Steak', 'Premium ribeye steak grilled to order, served with garlic mash.', 1200, 1100, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9, 850, 22, 15, true, false, false, true, 0),
('Grilled Chicken', 'Tender chicken breast marinated in herbs and grilled to perfection.', 650, null, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 520, 18, 25, false, false, false, true, 0),
('Noodles', 'Wok fried egg noodles tossed with scallions and mixed julienned veggies.', 280, null, 'c1000000-0000-0000-0000-000000000002', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.5, 480, 10, 40, false, false, false, false, 1),

-- Bangladeshi Dishes
('Kacchi Biryani', 'Traditional kacchi biryani with fragrant basmati and tender mutton.', 500, 450, 'c1000000-0000-0000-0000-000000000003', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9, 850, 18, 30, true, false, false, false, 1),
('Tehari', 'Fragrant mustard-infused rice cooked with tender cubes of spiced beef.', 350, null, 'c1000000-0000-0000-0000-000000000003', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 720, 15, 45, true, false, false, false, 2),
('Chicken Curry', 'Home style chicken curry cooked with potatoes and local spices.', 280, null, 'c1000000-0000-0000-0000-000000000003', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6, 490, 15, 50, false, false, false, true, 2),
('Beef Curry', 'Rich, slow cooked beef curry with a thick aromatic gravy.', 380, 350, 'c1000000-0000-0000-0000-000000000003', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9, 580, 20, 40, false, false, false, true, 2),
('Mutton Curry', 'Tender mutton cooked in traditional bhuna masala and spices.', 480, null, 'c1000000-0000-0000-0000-000000000003', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 620, 20, 25, false, false, false, true, 2),
('Polao', 'Aromatic chinigura rice cooked with ghee, raisins, and cardamoms.', 200, null, 'c1000000-0000-0000-0000-000000000003', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6, 400, 10, 50, false, true, false, true, 0),
('Bhuna Khichuri', 'Lentils and rice cooked together in bhuna spices, rich and thick.', 320, null, 'c1000000-0000-0000-0000-000000000003', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 550, 15, 35, false, true, false, true, 1),
('Fish Curry', 'Fresh water Rui fish cooked in mustard paste gravy, traditional style.', 260, 240, 'c1000000-0000-0000-0000-000000000003', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.5, 380, 12, 30, false, false, false, true, 2),

-- Fast Food
('Fried Chicken', 'Crispy, deep fried chicken pieces coated in seasoned flour.', 300, 270, 'c1000000-0000-0000-0000-000000000004', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 480, 12, 60, false, false, false, false, 1),
('Hot Dogs', 'Grilled chicken sausage in a soft bun topped with mustard sauce.', 220, null, 'c1000000-0000-0000-0000-000000000004', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.4, 390, 8, 50, false, false, false, false, 0),
('Shawarma', 'Spiced chicken shavings wrapped in flatbread with garlic sauce.', 280, null, 'c1000000-0000-0000-0000-000000000004', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 420, 10, 80, true, false, false, false, 1),
('Wraps', 'Tortilla wrap filled with crispy chicken tenders and honey mustard.', 240, null, 'c1000000-0000-0000-0000-000000000004', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.5, 350, 8, 60, false, false, false, false, 1),
('Club Sandwiches', 'Classic double decker bread sandwich filled with chicken and eggs.', 320, 290, 'c1000000-0000-0000-0000-000000000004', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6, 460, 10, 45, false, false, false, false, 0),

-- Seafood
('Grilled Fish', 'Fresh red snapper fillet grilled with garlic butter and lemon.', 600, 550, 'c1000000-0000-0000-0000-000000000005', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 420, 15, 20, true, false, false, true, 0),
('Fried Shrimp', 'Crispy breaded jumbo shrimps deep fried, served with tartar sauce.', 450, null, 'c1000000-0000-0000-0000-000000000005', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 380, 10, 35, false, false, false, false, 0),
('Prawns', 'Wok tossed fresh prawns in a garlic, butter and coriander sauce.', 550, null, 'c1000000-0000-0000-0000-000000000005', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 320, 12, 25, false, false, false, true, 1),
('Crab', 'Whole crab cooked in local spicy tomato and chili masala paste.', 700, null, 'c1000000-0000-0000-0000-000000000005', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9, 350, 18, 15, true, false, false, true, 3),

-- Desserts
('Ice Cream', 'Rich and creamy double scoop vanilla bean ice cream.', 150, null, 'c1000000-0000-0000-0000-000000000006', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 250, 3, 100, false, true, false, true, 0),
('Brownie', 'Warm, gooey chocolate fudge brownie loaded with walnuts.', 180, null, 'c1000000-0000-0000-0000-000000000006', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 340, 5, 80, false, true, false, false, 0),
('Cheesecake', 'Classic New York style baked cheesecake with a graham crust.', 255, null, 'c1000000-0000-0000-0000-000000000006', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9, 410, 5, 45, true, true, false, false, 0),
('Gulab Jamun', 'Traditional sweet milk dumplings fried and soaked in sugar syrup.', 100, null, 'c1000000-0000-0000-0000-000000000006', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 180, 3, 150, false, true, false, false, 0),
('Firni', 'Creamy local ground rice pudding flavored with saffron and almonds.', 120, null, 'c1000000-0000-0000-0000-000000000006', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6, 200, 5, 70, false, true, false, true, 0),
('Jorda', 'Sweet saffron rice cooked with nuts, raisins, and baby sweets.', 140, null, 'c1000000-0000-0000-0000-000000000006', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 220, 5, 60, false, true, false, true, 0),

-- Drinks
('Soft Drinks', 'Chilled carbonated soft drinks served in a glass with ice.', 50, null, 'c1000000-0000-0000-0000-000000000007', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.2, 140, 2, 200, false, true, true, true, 0),
('Fresh Juice', 'Freshly squeezed pulp juice from sweet seasonal fruits.', 180, 150, 'c1000000-0000-0000-0000-000000000007', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.8, 120, 5, 120, true, true, true, true, 0),
('Premium Coffee', 'Rich freshly brewed hot black roast from premium espresso beans.', 150, null, 'c1000000-0000-0000-0000-000000000007', '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', 4.9, 5, 4, 150, false, true, true, true, 0),
('Aromatic Tea', 'Traditional spiced masala milk tea brewed with fresh cardamom.', 60, null, 'c1000000-0000-0000-0000-000000000007', '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', 4.6, 10, 3, 300, false, true, false, true, 0),
('Milkshake', 'Rich chocolate milkshake blended with milk and thick vanilla ice cream.', 220, 200, 'c1000000-0000-0000-0000-000000000007', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.8, 380, 6, 90, false, true, false, true, 0),
('Smoothie', 'Chilled blend of fresh strawberries, bananas, and vanilla yogurt.', 240, null, 'c1000000-0000-0000-0000-000000000007', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.7, 280, 6, 80, false, true, false, true, 0),
('Mocktails', 'Chilled mint mojito mocktail with fresh lime, mint, and club soda.', 260, null, 'c1000000-0000-0000-0000-000000000007', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.9, 150, 5, 75, true, true, true, true, 0);

-- Insert Coupon Seeds
INSERT INTO coupons (code, discount, expire_date) VALUES
('SAVE20', 20, now() + interval '30 days'),
('NEWUSER', 15, now() + interval '90 days'),
('FREESHIP', 60, now() + interval '15 days')
ON CONFLICT (code) DO NOTHING;

-- Insert Banner Seeds
INSERT INTO banners (title, image, link, active) VALUES
('20% Off on Special Coffee!', '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', '/menu', true),
('Refreshing Watermelon Blends', '/Image/rohollah-saberi-21QZGQKpOYE-unsplash.jpg', '/menu', true);

-- Helper script to promote a user to admin in the database:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';

-- Migration: Add admin_reply to reviews
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT;

-- Migration: Create support_queries table
CREATE TABLE IF NOT EXISTS support_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
