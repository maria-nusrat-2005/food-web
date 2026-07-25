'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/navbar';
import MenuCard from '@/components/menu-card';
import CartDrawer from '@/components/cart-drawer';
import ReviewSection from '@/components/review-section';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock, Flame, ShieldAlert, Heart, Star, ShoppingCart, CreditCard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Food, MenuItem } from '@/types';

import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { profile, isMockUser } = useAuth();
  const { foods, toggleFavorite, isFavorite } = useApp();
  const { addToCart, cart, updateQuantity, removeFromCart, clearCart } = useCart();

  const [food, setFood] = useState<Food | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  // Load reviews on mount
  useEffect(() => {
    async function loadReviews() {
      if (!params.id) return;
      try {
        if (!isMockUser) {
          const { data, error } = await supabase
            .from('reviews')
            .select('*')
            .eq('food_id', params.id)
            .order('created_at', { ascending: false });
          if (!error && data) {
            setReviews(data);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load reviews from Supabase. Falling back to local storage.', err);
      }

      // Local storage fallback
      const localReviews = JSON.parse(localStorage.getItem('flavor_haven_reviews') || '[]');
      const itemReviews = localReviews.filter((r: any) => r.food_id === params.id);
      setReviews(itemReviews);
    }
    loadReviews();
  }, [params.id, isMockUser]);

  useEffect(() => {
    if (params.id) {
      const found = foods.find((f) => f.id === params.id);
      if (found) {
        setFood(found);
      }
    }
  }, [params.id, foods]);

  if (!food) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4">
        <ShieldAlert className="h-14 w-14 text-rose-500 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Dish not found</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">The requested menu item does not exist or has been removed.</p>
        <Link href="/menu" className="px-6 py-2.5 bg-brand-medium text-white font-bold rounded-xl text-sm">
          Return to Menu
        </Link>
      </div>
    );
  }

  // Related foods (same category, limit 3)
  const relatedFoods = foods
    .filter((f) => f.category_id === food.category_id && f.id !== food.id)
    .slice(0, 3);

  const price = food.discount_price !== null ? food.discount_price : food.price;
  const isFav = isFavorite(food.id);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Submit review for this dish
  const handleReviewSubmission = async (name: string, rating: number, comment: string) => {
    if (!food) return { success: false, isLocalOnly: true };
    const tempId = `rev-${Date.now()}`;
    const newReview = {
      id: tempId,
      food_id: food.id,
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
            food_id: food.id,
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

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-8 text-sm font-bold text-slate-600 hover:text-brand-medium transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to catalog</span>
        </button>

        {/* Product core detail cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Left Column - Large Image */}
          <div className="relative aspect-video lg:aspect-auto lg:h-[480px] rounded-3xl overflow-hidden glass-panel border border-emerald-100/50 shadow-lg">
            {food.image ? (
              <img
                src={food.image}
                alt={food.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[300px] bg-gradient-to-tr from-brand-medium/20 to-emerald-500/10 flex flex-col items-center justify-center relative select-none">
                <span className="text-xs font-black tracking-widest text-brand-medium/40 uppercase mb-4">Flavor Haven</span>
                <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100/30 shadow-md text-brand-medium mb-2 text-3xl">
                  {food.category_id === 'c1000000-0000-0000-0000-000000000007' || food.category_id === '7' ? (
                    '☕'
                  ) : food.category_id === 'c1000000-0000-0000-0000-000000000006' || food.category_id === '6' ? (
                    '🍰'
                  ) : (
                    '🥘'
                  )}
                </div>
                <div className="text-6xl font-black text-slate-800/10 tracking-widest uppercase font-mono mt-2">
                  {food.title ? food.title.substring(0, 2) : 'FH'}
                </div>
              </div>
            )}
            {food.discount_price !== null && (
              <span className="absolute top-4 left-4 px-3.5 py-1.5 bg-brand-pink text-xs font-extrabold text-white rounded-xl uppercase tracking-wider shadow-md">
                {Math.round(((food.price - food.discount_price) / food.price) * 100)}% Off
              </span>
            )}
            <button
              onClick={() => toggleFavorite(food.id)}
              className="absolute top-4 right-4 p-3 bg-white/95 rounded-full border border-emerald-100/50 text-slate-600 hover:text-rose-500 shadow-md cursor-pointer hover:scale-105 transition-all"
              title="Add to Favorites"
            >
              <Heart className={`h-5 w-5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Right Column - Product details */}
          <div className="flex flex-col justify-between">
            <div className="space-y-6">
              {/* Category & Tags */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="px-3 py-1 bg-brand-medium text-white text-xs font-bold rounded-lg uppercase tracking-wider">
                  {food.category_id === '1' ? 'Burger' : food.category_id === '2' ? 'Drinks' : 'Coffee'}
                </span>
                {food.is_veg && <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">Veg 🍃</span>}
                {food.is_vegan && <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">Vegan 🌱</span>}
                {food.is_gluten_free && <span className="px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">GF 🌾</span>}
                {food.spicy_level > 0 && (
                  <span className="px-2.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-xs font-bold text-rose-700 flex items-center gap-0.5">
                    Spicy {Array(food.spicy_level).fill('🌶️').join('')}
                  </span>
                )}
              </div>

              {/* Title & Rating */}
              <div>
                <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-tight mb-2">
                  {food.title}
                </h1>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4.5 w-4.5 ${
                          i < Math.round(food.rating)
                            ? 'fill-brand-medium text-brand-medium'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-800">{food.rating} / 5.0</span>
                  <span className="text-xs text-slate-400 font-medium">({15 + Math.round(food.rating * 5)} reviews)</span>
                </div>
              </div>

              {/* Price Details */}
              <div className="flex items-baseline gap-4 py-2 border-y border-slate-100">
                {food.discount_price !== null ? (
                  <>
                    <span className="text-3xl font-extrabold text-brand-medium">{food.discount_price} Tk</span>
                    <span className="text-slate-450 line-through text-lg font-semibold">{food.price} Tk</span>
                  </>
                ) : (
                  <span className="text-3xl font-extrabold text-brand-medium">{food.price} Tk</span>
                )}
                <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                  food.stock > 0 ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'
                }`}>
                  {food.stock > 0 ? `In Stock (${food.stock})` : 'Out of Stock'}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-650 leading-relaxed">
                {food.description ||
                  'Delicately prepared using the finest fresh ingredients and crafted with absolute passion. Serves as a perfect blend of premium texture, mouthwatering flavor combinations, and fresh quality control.'}
              </p>

              {/* Quick specs */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Clock className="h-5 w-5 text-brand-medium" />
                  <div>
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Cooking Time</p>
                    <p className="text-sm font-extrabold text-slate-850">{food.cook_time} Minutes</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center gap-3">
                  <Flame className="h-5 w-5 text-brand-medium" />
                  <div>
                    <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Calories</p>
                    <p className="text-sm font-extrabold text-slate-850">{food.calories} kcal</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Ordering Controls */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => addToCart(food)}
                disabled={food.stock <= 0}
                className="flex-1 py-4 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                <ShoppingCart className="h-4.5 w-4.5" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => {
                  addToCart(food);
                  router.push('/cart');
                }}
                disabled={food.stock <= 0}
                className="flex-1 py-4 bg-brand-medium hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                <CreditCard className="h-4.5 w-4.5" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Nutritional Facts & Ingredients */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Ingredients</h3>
            <ul className="space-y-2 text-sm text-slate-650 list-disc list-inside">
              <li>100% locally sourced premium quality base elements</li>
              <li>Signature herbs, organic spices, and customized sauce glazes</li>
              <li>Fresh organic lettuce leaves, vine-ripened tomatoes, and pickles</li>
              <li>Melted high-quality cheddar cheese slices</li>
              <li>Free from artificial preservatives or coloring agents</li>
            </ul>
          </div>

          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40">
            <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Nutrition Facts (Per Portion)</h3>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-slate-650 border-b border-slate-100 pb-1.5">
                <span>Energy Calories</span>
                <span className="font-extrabold text-slate-850">{food.calories} kcal</span>
              </div>
              <div className="flex justify-between text-slate-650 border-b border-slate-100 pb-1.5">
                <span>Proteins</span>
                <span className="font-extrabold text-slate-850">{Math.round(food.calories * 0.03)} g</span>
              </div>
              <div className="flex justify-between text-slate-650 border-b border-slate-100 pb-1.5">
                <span>Fats</span>
                <span className="font-extrabold text-slate-850">{Math.round(food.calories * 0.02)} g</span>
              </div>
              <div className="flex justify-between text-slate-650 border-b border-slate-100 pb-1.5">
                <span>Carbohydrates</span>
                <span className="font-extrabold text-slate-850">{Math.round(food.calories * 0.08)} g</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related suggestions */}
        {relatedFoods.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">You May Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedFoods.map((rel) => {
                const item = {
                  id: rel.id,
                  name: rel.title,
                  description: rel.description,
                  price: rel.discount_price !== null ? rel.discount_price : rel.price,
                  category: rel.category_id === '1' ? 'burger' : rel.category_id === '2' ? 'drinks' : 'coffee',
                  image_url: rel.image,
                  rating: rel.rating,
                };
                return <MenuCard key={rel.id} item={item} onAddToCart={() => addToCart(rel)} />;
              })}
            </div>
          </div>
        )}

        {/* Review Form */}
        <ReviewSection
          reviews={reviews}
          onSubmitReview={handleReviewSubmission}
        />
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
}
