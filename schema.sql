-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL, -- 'burger', 'drinks', 'coffee'
    image_url TEXT,
    rating NUMERIC DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_name TEXT NOT NULL,
    avatar_url TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public read access to menu items
CREATE POLICY "Allow public read access to menu_items" 
ON menu_items FOR SELECT USING (true);

-- Allow public read access to reviews
CREATE POLICY "Allow public read access to reviews" 
ON reviews FOR SELECT USING (true);

-- Allow public inserts to reviews (so users can submit reviews)
CREATE POLICY "Allow public insert access to reviews" 
ON reviews FOR INSERT WITH CHECK (true);

-- Seed menu items
INSERT INTO menu_items (name, description, price, category, image_url, rating) VALUES
('Our Special Burger', 'Juicy grilled burger with fresh lettuce, tomatoes, cheese, and our special sauce.', 900, 'burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9),
('Chicken Burger', 'Juicy grilled burger with fresh lettuce, tomatoes, cheese, and our special sauce.', 600, 'burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.7),
('Chicken Cheese Burger', 'Juicy grilled burger with fresh lettuce, tomatoes, melted cheese, and our special sauce.', 600, 'burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8),
('Cheese Burger', 'Classic burger with extra melted cheese, pickles, lettuce, and tomatoes.', 600, 'burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.6),
('Student Special Burger', 'Affordable yet delicious juicy burger tailored for student budgets.', 150, 'burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.5),
('Beef Burger', 'Premium beef patty grilled to perfection with onions, pickles, and cheddar.', 600, 'burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.8),
('Vegetable Burger', 'Healthy plant-based patty with fresh garden greens and vegan mayo.', 200, 'burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.4),
('Beef Naga Burger', 'Spiced up beef burger loaded with extremely spicy naga chili sauce and cheese.', 520, 'burger', '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', 4.9),
('Orange Juice', 'Freshly squeezed orange juice, full of vitamin C and natural sweetness.', 180, 'drinks', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.7),
('Papaya Juice', 'Creamy papaya juice – smooth, sweet, and nourishing.', 100, 'drinks', '/Image/olivier-guillard-AjG1BkDH4Zs-unsplash.jpg', 4.5),
('Watermelon Juice', 'Fresh and hydrating watermelon juice, freshly blended on order.', 200, 'drinks', '/Image/rohollah-saberi-21QZGQKpOYE-unsplash.jpg', 4.8),
('Special Orange Juice', 'Our signature orange juice blend with a splash of tropical citrus zest.', 250, 'drinks', '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', 4.9),
('Cappuccino', 'A classic cappuccino topped with rich, creamy froth and a bold espresso base.', 300, 'coffee', '/Image/nathan-dumlao-zUNs99PGDg0-unsplash.jpg', 4.9),
('Hot Coffee', 'A steaming cup of hot coffee to kickstart your day.', 100, 'coffee', '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', 4.5),
('Iced Coffee', 'A refreshing chilled coffee served over ice, perfect for hot days.', 180, 'coffee', '/Image/nathan-dumlao-vZOZJH_xkUk-unsplash.jpg', 4.7),
('Our Special Coffee', 'A warm, aromatic drink made from special select roasted coffee beans.', 180, 'coffee', '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', 4.8);

-- Seed reviews
INSERT INTO reviews (client_name, avatar_url, rating, comment) VALUES
('Anvi Rahman', '/Image/avatar.png', 5, 'I like the cappuccino most, I recommend this.'),
('Safwan Islam', '/Image/avatar.png', 5, 'The Beef Naga Burger is absolutely phenomenal! Highly recommend for spice lovers.'),
('Nusrat Jahan', '/Image/avatar.png', 4, 'Really love their watermelon juice on hot summer days. Very cozy environment too!'),
('Rifat Chowdhury', '/Image/avatar.png', 5, 'Student special burger is a lifesaver. Delicious and so cheap!');
