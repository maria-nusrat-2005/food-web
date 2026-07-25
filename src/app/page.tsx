'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navbar';
import MenuCard from '@/components/menu-card';
import CartDrawer from '@/components/cart-drawer';
import ReviewSection from '@/components/review-section';
import { ArrowRight, Sparkles, ChefHat, Award, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const { foods, toggleFavorite, isFavorite, isSupabaseConnected } = useApp();
  const { addToCart, cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { profile, isMockUser } = useAuth();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);

  // Load reviews on mount
  useEffect(() => {
    async function loadReviews() {
      try {
        if (!isMockUser) {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .is('food_id', null)
            .order('created_at', { ascending: false });
          if (!error && data && data.length > 0) {
            setReviews(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load reviews from Supabase. Falling back to local storage.', err);
      }

      // Local storage fallback / initial seeding
      let localReviews = JSON.parse(localStorage.getItem('flavor_haven_reviews') || '[]');
      if (localReviews.length === 0) {
        localReviews = [
          {
            id: 'init-rev-1',
            client_name: 'Anvi Rahman',
            avatar_url: null,
            rating: 5,
            comment: 'The Kacchi Biryani here is absolutely authentic! Saffron notes, tender meat, and perfect grains of rice. Definitely coming back for more.',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'init-rev-2',
            client_name: 'Nafis Imtiaz',
            avatar_url: null,
            rating: 5,
            comment: 'Amazing customer service and cozy environment. The premium coffee is rich and smells heavenly. A great place to work or hang out with friends.',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'init-rev-3',
            client_name: 'Sajid Hasan',
            avatar_url: null,
            rating: 4,
            comment: 'Had their Beef Naga Burger. It\'s incredibly spicy but so delicious. The bun was soft and the patty was juicy. Highly recommended for spice lovers!',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];
        localStorage.setItem('flavor_haven_reviews', JSON.stringify(localReviews));
      }
      
      const generalReviews = localReviews.filter((r: any) => !r.food_id);
      setReviews(generalReviews);
    }
    loadReviews();
  }, [isMockUser]);

  // Rotating Banners Data
  const banners = [
    { title: '20% Off on Special Coffee!', desc: 'Enjoy our rich, house-roasted organic beans daily.', img: '/Image/clay-banks-_wkd7XBRfU4-unsplash.jpg' },
    { title: 'Try our Beef Naga Burger!', desc: 'Spiced with authentic local Naga chili paste and cheese.', img: '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg' },
    { title: 'Fresh Watermelon Juices!', desc: '100% natural, chilled blends for hot summer days.', img: '/Image/rohollah-saberi-21QZGQKpOYE-unsplash.jpg' }
  ];

  // Rotate banners automatically
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevBanner = () => {
    setActiveBannerIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const handleNextBanner = () => {
    setActiveBannerIdx((prev) => (prev + 1) % banners.length);
  };

  // Submit general review
  const handleReviewSubmission = async (name: string, rating: number, comment: string) => {
    const tempId = `rev-${Date.now()}`;
    const newReview = {
      id: tempId,
      food_id: null,
      user_id: profile?.id || null,
      client_name: name,
      avatar_url: profile?.avatar_url || null,
      rating,
      comment,
      created_at: new Date().toISOString(),
    };

    let success = false;
    let isLocalOnly = true;

    try {
      if (!isMockUser) {
        const { error } = await supabase.from('reviews').insert([
          {
            food_id: null,
            user_id: profile?.id || null,
            client_name: name,
            avatar_url: profile?.avatar_url || null,
            rating,
            comment,
          },
        ]);
        if (!error) {
          success = true;
          isLocalOnly = false;
        } else {
          console.error('Supabase review insert error:', error);
        }
      }
    } catch (err) {
      console.error('Failed to submit review to Supabase:', err);
    }

    // Save to local storage for offline / fallback
    const localHistory = JSON.parse(localStorage.getItem('flavor_haven_reviews') || '[]');
    localStorage.setItem('flavor_haven_reviews', JSON.stringify([newReview, ...localHistory]));

    if (isMockUser) {
      success = true;
      isLocalOnly = true;
    }

    if (success || isLocalOnly) {
      setReviews((prev) => [newReview, ...prev]);
      return { success: true, isLocalOnly };
    }

    return { success: false, isLocalOnly: true };
  };

  // Featured foods (Chef's Choice items)
  const featuredFoods = foods.filter((f) => f.featured).slice(0, 4);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col pb-12">
      {/* Warning banner */}
      {!isSupabaseConnected && (
        <div className="bg-amber-500/10 border-b border-amber-200/20 py-2.5 px-4 text-center text-xs font-medium text-amber-700 flex items-center justify-center gap-2">
          <span>Operating on mock local storage modes. Connect Supabase credentials in <code>.env.local</code>.</span>
        </div>
      )}

      {/* Sticky Navbar */}
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
        hideCategories={true}
      />

      {/* Hero Interactive Banner Slider */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="relative h-[320px] md:h-[420px] rounded-[36px] overflow-hidden shadow-xl border border-emerald-100/50">
          {/* Active Slide Image */}
          <img
            src={banners[activeBannerIdx].img}
            alt={banners[activeBannerIdx].title}
            className="absolute inset-0 w-full h-full object-cover brightness-[0.4] transition-all duration-700"
          />

          {/* Slide Text Content overlay */}
          <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center items-start text-white max-w-xl space-y-4">
            <span className="px-3 py-1 bg-brand-medium text-white text-[10px] font-bold rounded-lg uppercase tracking-wider flex items-center gap-1.5 shadow animate-pulse">
              <ChefHat className="h-3.5 w-3.5" /> Promotion
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {banners[activeBannerIdx].title}
            </h2>
            <p className="text-sm text-slate-200">{banners[activeBannerIdx].desc}</p>
            <Link
              href="/menu"
              className="px-6 py-3 bg-white text-slate-800 font-extrabold rounded-xl text-xs hover:bg-brand-medium hover:text-white transition-all shadow cursor-pointer active:scale-95"
            >
              Order Now
            </Link>
          </div>

          {/* Slider controls buttons */}
          <button
            onClick={handlePrevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 text-white cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 text-white cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Restaurant stats panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-8 glass-panel rounded-3xl border border-emerald-100/50 bg-white/40 shadow-sm text-center">
          <div>
            <p className="text-3xl font-extrabold text-brand-medium">50+</p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">Dishes List</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-brand-medium">10,000+</p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">Patrons served</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-brand-medium">4.9 Stars</p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">Review Averages</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-brand-medium">20 mins</p>
            <p className="text-xs text-slate-500 font-bold uppercase mt-1 tracking-wider">Fast Delivery</p>
          </div>
        </div>
      </section>

      {/* Featured dishes section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full space-y-8">
        <div className="flex justify-between items-end border-b border-slate-150 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
              <span>Chef's Featured Recommendations</span>
              <Sparkles className="h-6 w-6 text-brand-medium animate-pulse" />
            </h2>
            <p className="text-xs text-slate-550 mt-1">Savor our highly requested and award-winning recipes.</p>
          </div>
          <Link
            href="/menu"
            className="group px-5 py-2.5 bg-slate-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-brand-medium transition-all shadow cursor-pointer active:scale-95"
          >
            <span>Browse Full Menu</span>
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Featured list grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {featuredFoods.map((food) => {
            const item = {
              id: food.id,
              name: food.title,
              description: food.description,
              price: food.discount_price !== null ? food.discount_price : food.price,
              category: food.category_id === '1' ? 'burger' : food.category_id === '2' ? 'drinks' : 'coffee',
              image_url: food.image,
              rating: food.rating,
            };
            return <MenuCard key={food.id} item={item} onAddToCart={() => addToCart(food)} />;
          })}
        </div>
      </main>

      {/* Table Booking Callout Card banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        <div className="p-8 md:p-12 bg-gradient-to-r from-brand-medium to-emerald-600 rounded-[32px] text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-xl">
          <div className="space-y-3 max-w-xl">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
              Reserve Dining Table
            </span>
            <h3 className="text-3xl font-extrabold">Planning a dinner gathering or family event?</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Book a table in advance! We guarantee a warm atmosphere, cozy seating alignments, and customized banquet choices.
            </p>
          </div>
          <Link
            href="/about"
            className="px-8 py-4 bg-white text-slate-850 font-extrabold rounded-2xl text-sm shadow hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span>Book a Table Now</span>
          </Link>
        </div>
      </section>

      {/* General Testimonial sections */}
      <ReviewSection reviews={reviews} onSubmitReview={handleReviewSubmission} />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />

      {/* Footer */}
      <footer className="mt-12 py-10 border-t border-slate-150 bg-white/30 text-center text-xs text-slate-500 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🥘</span>
            <span className="font-extrabold text-slate-800 text-sm">Flavor Haven</span>
          </div>
          <p>© {new Date().getFullYear()} Flavor Haven Restaurant Ltd. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/about" className="hover:text-brand-medium transition-colors">About Us</Link>
            <Link href="/contact" className="hover:text-brand-medium transition-colors">Contact Support</Link>
            <Link href="/dashboard" className="hover:text-brand-medium transition-colors">User Panel</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
