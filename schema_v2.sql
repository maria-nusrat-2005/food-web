-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    icon TEXT, -- Lucide icon name or emoji
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
CREATE POLICY "Allow user read own orders" ON orders FOR SELECT USING (true); -- simplified for local mock-up
CREATE POLICY "Allow user insert own orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin edit orders" ON orders FOR ALL USING (true);

-- Order Items policies
CREATE POLICY "Allow public read order items" ON order_items FOR SELECT USING (true);
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

-- Insert Category seeds
INSERT INTO categories (id, name, icon) VALUES
('c1000000-0000-0000-0000-000000000001', 'burger', 'Pizza'),
('c1000000-0000-0000-0000-000000000002', 'drinks', 'Wine'),
('c1000000-0000-0000-0000-000000000003', 'coffee', 'Coffee')
ON CONFLICT (name) DO UPDATE SET icon = EXCLUDED.icon;

-- Insert Food Seeds
INSERT INTO foods (title, description, price, discount_price, category_id, image, rating, calories, cook_time, stock, featured, is_veg, is_vegan, is_gluten_free, spicy_level) VALUES
('Our Special Burger', 'Juicy grilled burger with fresh lettuce, tomatoes, cheese, and our special sauce.', 900, 750, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9, 650, 15, 45, true, false, false, false, 1),
('Chicken Burger', 'Juicy grilled chicken burger with fresh lettuce, tomatoes, cheese, and mild herb sauce.', 600, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7, 580, 12, 50, false, false, false, false, 0),
('Chicken Cheese Burger', 'Grilled chicken patty with extra melted cheddar cheese, pickles, and our signature sauce.', 600, 550, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 620, 12, 35, true, false, false, false, 0),
('Cheese Burger', 'Classic beef patty burger loaded with double layers of melted cheese, lettuce, and pickles.', 600, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6, 610, 10, 40, false, false, false, false, 0),
('Student Special Burger', 'Delicious budget-friendly grilled chicken burger customized for students.', 150, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.5, 450, 8, 100, false, false, false, false, 0),
('Beef Burger', 'Premium ground beef patty grilled to order, with fresh onion rings, cheddar, and BBQ glaze.', 600, 500, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8, 680, 15, 30, true, false, false, false, 0),
('Vegetable Burger', 'Healthy plant-based patty with fresh garden greens, tomatoes, and vegan garlic aioli.', 200, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.4, 380, 10, 25, false, true, true, true, 0),
('Beef Naga Burger', 'Super spicy beef burger loaded with extremely hot Bangladeshi Naga chili paste and cheese.', 520, null, 'c1000000-0000-0000-0000-000000000001', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9, 700, 15, 20, true, false, false, false, 3),
('Orange Juice', 'Freshly squeezed sweet orange juice full of natural pulp and vitamin C.', 180, 150, 'c1000000-0000-0000-0000-000000000002', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.7, 120, 5, 60, false, true, true, true, 0),
('Papaya Juice', 'Creamy sweet papaya juice, served fresh and chilled.', 100, null, 'c1000000-0000-0000-0000-000000000002', '/Image/olivier-guillard-AjG1BkDH4Zs-unsplash.jpg', 4.5, 140, 5, 40, false, true, true, true, 0),
('Watermelon Juice', 'Freshly blended refreshing watermelon juice, perfect for hot summer days.', 200, 170, 'c1000000-0000-0000-0000-000000000002', '/Image/rohollah-saberi-21QZGQKpOYE-unsplash.jpg', 4.8, 90, 4, 80, true, true, true, true, 0),
('Special Orange Juice', 'Zesty signature orange juice blended with dynamic citrus ingredients.', 250, null, 'c1000000-0000-0000-0000-000000000002', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.9, 130, 5, 50, false, true, true, true, 0),
('Cappuccino', 'Authentic espresso base layered with steaming milk and rich, velvety milk foam.', 300, 260, 'c1000000-0000-0000-0000-000000000003', '/Image/nathan-dumlao-zUNs99PGDg0-unsplash.jpg', 4.9, 150, 6, 90, true, true, false, true, 0),
('Hot Coffee', 'Freshly brewed aromatic coffee, served steaming hot.', 100, null, 'c1000000-0000-0000-0000-000000000003', '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', 4.5, 5, 3, 200, false, true, true, true, 0),
('Iced Coffee', 'Chilled espresso poured over ice and finished with cream.', 180, null, 'c1000000-0000-0000-0000-000000000003', '/Image/nathan-dumlao-vZOZJH_xkUk-unsplash.jpg', 4.7, 180, 4, 150, false, true, false, true, 0),
('Our Special Coffee', 'Classic rich roast coffee brewed from house-roasted special organic beans.', 180, 160, 'c1000000-0000-0000-0000-000000000003', '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', 4.8, 10, 5, 120, true, true, true, true, 0);

-- Insert Coupon Seeds
INSERT INTO coupons (code, discount, expire_date) VALUES
('SAVE20', 20, now() + interval '30 days'),
('NEWUSER', 15, now() + interval '90 days'),
('FREESHIP', 60, now() + interval '15 days')
ON CONFLICT (code) DO NOTHING;

-- Insert Banner Seeds
INSERT INTO banners (title, image, link, active) VALUES
('20% Off on Special Coffee!', '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', '/menu', true),
('Try our Beef Naga Spicy Burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', '/menu', true),
('Refreshing Watermelon Blends', '/Image/rohollah-saberi-21QZGQKpOYE-unsplash.jpg', '/menu', true);
