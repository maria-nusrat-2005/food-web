'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { MenuItem, Review, CartItem } from '@/types';
import Navbar from '@/components/navbar';
import MenuCard from '@/components/menu-card';
import CartDrawer from '@/components/cart-drawer';
import ReviewSection from '@/components/review-section';
import { ArrowRight, Filter, ArrowUpDown, ShieldAlert, Sparkles, ChefHat } from 'lucide-react';

const MOCK_ITEMS: MenuItem[] = [
  { id: '1', name: 'Our Special Burger', description: 'Juicy grilled burger with fresh lettuce, tomatoes, cheese, and our special sauce.', price: 900, category: 'burger', image_url: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9 },
  { id: '2', name: 'Chicken Burger', description: 'Juicy grilled burger with fresh lettuce, tomatoes, cheese, and our special sauce.', price: 600, category: 'burger', image_url: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.7 },
  { id: '3', name: 'Chicken Cheese Burger', description: 'Juicy grilled burger with fresh lettuce, tomatoes, melted cheese, and our special sauce.', price: 600, category: 'burger', image_url: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8 },
  { id: '4', name: 'Cheese Burger', description: 'Classic burger with extra melted cheese, pickles, lettuce, and tomatoes.', price: 600, category: 'burger', image_url: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.6 },
  { id: '5', name: 'Student Special Burger', description: 'Affordable yet delicious juicy burger tailored for student budgets.', price: 150, category: 'burger', image_url: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.5 },
  { id: '6', name: 'Beef Burger', description: 'Premium beef patty grilled to perfection with onions, pickles, and cheddar.', price: 600, category: 'burger', image_url: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.8 },
  { id: '7', name: 'Vegetable Burger', description: 'Healthy plant-based patty with fresh garden greens and vegan mayo.', price: 200, category: 'burger', image_url: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.4 },
  { id: '8', name: 'Beef Naga Burger', description: 'Spiced up beef burger loaded with extremely spicy naga chili sauce and cheese.', price: 520, category: 'burger', image_url: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg', rating: 4.9 },
  { id: '9', name: 'Orange Juice', description: 'Freshly squeezed orange juice, full of vitamin C and natural sweetness.', price: 180, category: 'drinks', image_url: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.7 },
  { id: '10', name: 'Papaya Juice', description: 'Creamy papaya juice – smooth, sweet, and nourishing.', price: 100, category: 'drinks', image_url: '/Image/olivier-guillard-AjG1BkDH4Zs-unsplash.jpg', rating: 4.5 },
  { id: '11', name: 'Watermelon Juice', description: 'Fresh and hydrating watermelon juice, freshly blended on order.', price: 200, category: 'drinks', image_url: '/Image/rohollah-saberi-21QZGQKpOYE-unsplash.jpg', rating: 4.8 },
  { id: '12', name: 'Special Orange Juice', description: 'Our signature orange juice blend with a splash of tropical citrus zest.', price: 250, category: 'drinks', image_url: '/Image/abhishek-hajare-kkrXVKK-jhg-unsplash.jpg', rating: 4.9 },
  { id: '13', name: 'Cappuccino', description: 'A classic cappuccino topped with rich, creamy froth and a bold espresso base.', price: 300, category: 'coffee', image_url: '/Image/nathan-dumlao-zUNs99PGDg0-unsplash.jpg', rating: 4.9 },
  { id: '14', name: 'Hot Coffee', description: 'A steaming cup of hot coffee to kickstart your day.', price: 100, category: 'coffee', image_url: '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', rating: 4.5 },
  { id: '15', name: 'Iced Coffee', description: 'A refreshing chilled coffee served over ice, perfect for hot days.', price: 180, category: 'coffee', image_url: '/Image/nathan-dumlao-vZOZJH_xkUk-unsplash.jpg', rating: 4.7 },
  { id: '16', name: 'Our Special Coffee', description: 'A warm, aromatic drink made from special select roasted coffee beans.', price: 180, category: 'coffee', image_url: '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg', rating: 4.8 },
];

const MOCK_REVIEWS: Review[] = [
  { id: 'r1', client_name: 'Anvi Rahman', avatar_url: '/Image/avatar.png', rating: 5, comment: 'I like the cappuccino most, I recommend this.' },
  { id: 'r2', client_name: 'Safwan Islam', avatar_url: '/Image/avatar.png', rating: 5, comment: 'The Beef Naga Burger is absolutely phenomenal! Highly recommend for spice lovers.' },
  { id: 'r3', client_name: 'Nusrat Jahan', avatar_url: '/Image/avatar.png', rating: 4, comment: 'Really love their watermelon juice on hot summer days. Very cozy environment too!' },
  { id: 'r4', client_name: 'Rifat Chowdhury', avatar_url: '/Image/avatar.png', rating: 5, comment: 'Student special burger is a lifesaver. Delicious and so cheap!' },
];

export default function Home() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_ITEMS);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceLimit, setPriceLimit] = useState(1000);
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Fetch Menu Items & Reviews
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Attempt to fetch menu items
        const { data: menuData, error: menuErr } = await supabase
          .from('menu_items')
          .select('*')
          .order('name', { ascending: true });

        // Attempt to fetch reviews
        const { data: reviewsData, error: reviewsErr } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (!menuErr && menuData && menuData.length > 0) {
          setMenuItems(menuData);
          setIsSupabaseConnected(true);
        } else {
          console.log('Using local mock data for menu items (Supabase setup pending or empty table).');
        }

        if (!reviewsErr && reviewsData && reviewsData.length > 0) {
          setReviews(reviewsData);
        } else {
          console.log('Using local mock reviews (Supabase setup pending or empty table).');
        }
      } catch (err) {
        console.warn('Supabase fetch failed. Operating on fallback mock data.', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => ci.menuItem.id === item.id);
      if (existing) {
        return prevCart.map((ci) =>
          ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prevCart, { menuItem: item, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(itemId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((ci) =>
        ci.menuItem.id === itemId ? { ...ci, quantity: newQty } : ci
      )
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((ci) => ci.menuItem.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Submit Review logic
  const handleSubmitReview = async (
    name: string,
    rating: number,
    comment: string
  ): Promise<{ success: boolean; isLocalOnly: boolean }> => {
    const tempId = `temp-${Date.now()}`;
    const newRev: Review = {
      id: tempId,
      client_name: name,
      avatar_url: '/Image/avatar.png',
      rating,
      comment,
      created_at: new Date().toISOString(),
    };

    try {
      if (isSupabaseConnected) {
        const { data, error } = await supabase
          .from('reviews')
          .insert([
            {
              client_name: name,
              avatar_url: '/Image/avatar.png',
              rating,
              comment,
            },
          ])
          .select();

        if (error) throw error;
        if (data && data[0]) {
          setReviews((prev) => [data[0], ...prev]);
          return { success: true, isLocalOnly: false };
        }
      }

      // Fallback local update
      setReviews((prev) => [newRev, ...prev]);
      return { success: true, isLocalOnly: true };
    } catch (err) {
      console.warn('Database insert failed. Updating reviews locally.', err);
      setReviews((prev) => [newRev, ...prev]);
      return { success: true, isLocalOnly: true };
    }
  };

  // Filter and sort computation
  const filteredItems = menuItems
    .filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchPrice = item.price <= priceLimit;
      return matchSearch && matchCategory && matchPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // default
    });

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Banner Warning if Supabase is unconfigured */}
      {!isSupabaseConnected && !loading && (
        <div className="bg-amber-500/10 border-b border-amber-200/20 py-2.5 px-4 text-center text-xs font-medium text-amber-700 flex items-center justify-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-600" />
          <span>
            Database link missing. Operating on mock catalog. Configure <code>.env.local</code> and run <code>schema.sql</code> to link.
          </span>
        </div>
      )}

      {/* Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
      />

      {/* Hero Welcome Section */}
      <header className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 mb-6 text-brand-medium text-xs font-bold uppercase tracking-wider animate-pulse">
          <ChefHat className="h-4 w-4" />
          <span>Fine Culinary experience</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-800 tracking-tight leading-none mb-6">
          Welcome to{' '}
          <span className="bg-gradient-to-r from-brand-dark via-brand-medium to-emerald-650 bg-clip-text text-transparent hover:brightness-95 transition-all">
            Flavor Haven
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-650 max-w-2xl leading-relaxed mb-8">
          Experience the perfect blend of taste and ambiance. From freshly prepared dishes to a cozy
          atmosphere, we serve happiness on every plate. Crafted with organic, premium ingredients.
        </p>

        <button
          onClick={() => {
            const el = document.getElementById('menu-list');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="group px-7 py-4 bg-slate-800 text-white rounded-full font-extrabold text-sm flex items-center gap-2.5 shadow-xl hover:bg-brand-medium hover:text-white hover:shadow-brand-medium/10 transition-all duration-300 cursor-pointer active:scale-95 animate-bounce"
        >
          <span>Explore More</span>
          <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1.5 transition-transform" />
        </button>
      </header>

      {/* Main Catalog Area */}
      <main id="menu-list" className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Category Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
              <span>Our Special Menu</span>
              <Sparkles className="h-5 w-5 text-brand-medium" />
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Explore custom delicacies prepared by our world-class chefs.
            </p>
          </div>

          {/* Filtering and Sorting controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Price Limit slider */}
            <div className="flex items-center gap-3 bg-slate-100/80 px-4.5 py-2.5 rounded-2xl border border-emerald-100/30">
              <Filter className="h-4 w-4 text-brand-medium" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Max Price: {priceLimit} Tk
                </span>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={priceLimit}
                  onChange={(e) => setPriceLimit(Number(e.target.value))}
                  className="w-28 sm:w-36 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-medium mt-1"
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 bg-slate-100/80 px-4.5 py-2.5 rounded-2xl border border-emerald-100/30">
              <ArrowUpDown className="h-4 w-4 text-brand-medium" />
              <div className="flex flex-col">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                  Sort By
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 border-0 p-0 focus:ring-0 focus:outline-none cursor-pointer mt-0.5"
                >
                  <option value="default" className="bg-white text-slate-800">Default</option>
                  <option value="price-asc" className="bg-white text-slate-800">Price: Low to High</option>
                  <option value="price-desc" className="bg-white text-slate-800">Price: High to Low</option>
                  <option value="rating" className="bg-white text-slate-800">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Catalog Grid */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-brand-medium border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold text-slate-500">Loading fine delicacies...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-3xl p-10 max-w-md mx-auto">
            <span className="text-4xl block mb-4">🔍</span>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No items found</h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search criteria, category filters, or price slider.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>

      {/* Review Section */}
      <ReviewSection reviews={reviews} onSubmitReview={handleSubmitReview} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* Footer */}
      <footer className="mt-auto py-10 border-t border-slate-100 bg-white/30 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xl animate-bounce">🥘</span>
            <span className="font-extrabold text-slate-800 text-sm">Flavor Haven</span>
          </div>
          <p>© {new Date().getFullYear()} Flavor Haven Restaurant Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-medium transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-medium transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-medium transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
