'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/navbar';
import MenuCard from '@/components/menu-card';
import CartDrawer from '@/components/cart-drawer';
import { SlidersHorizontal, Eye, Flame, Clock, Heart, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function MenuPage() {
  const { foods, toggleFavorite, isFavorite } = useApp();
  const { addToCart, cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState(1000);
  const [maxTime, setMaxTime] = useState(30);

  // Dietary checkboxes
  const [isVeg, setIsVeg] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [spicyLevel, setSpicyLevel] = useState<number | null>(null);

  const resetFilters = () => {
    setSearchQuery('');
    setActiveCategory('all');
    setSortBy('default');
    setMaxPrice(1000);
    setMaxTime(30);
    setIsVeg(false);
    setIsVegan(false);
    setIsGlutenFree(false);
    setSpicyLevel(null);
  };

  // Compute filters
  const filteredFoods = foods
    .filter((food) => {
      const matchSearch =
        food.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = activeCategory === 'all' || food.category_id === activeCategory || (activeCategory === 'burger' && food.category_id === '1') || (activeCategory === 'drinks' && food.category_id === '2') || (activeCategory === 'coffee' && food.category_id === '3');
      const matchPrice = (food.discount_price !== null ? food.discount_price : food.price) <= maxPrice;
      const matchTime = food.cook_time <= maxTime;

      const matchVeg = !isVeg || food.is_veg;
      const matchVegan = !isVegan || food.is_vegan;
      const matchGF = !isGlutenFree || food.is_gluten_free;
      const matchSpicy = spicyLevel === null || food.spicy_level === spicyLevel;

      return matchSearch && matchCategory && matchPrice && matchTime && matchVeg && matchVegan && matchGF && matchSpicy;
    })
    .sort((a, b) => {
      const aPrice = a.discount_price !== null ? a.discount_price : a.price;
      const bPrice = b.discount_price !== null ? b.discount_price : b.price;
      if (sortBy === 'price-asc') return aPrice - bPrice;
      if (sortBy === 'price-desc') return bPrice - aPrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'cook-time') return a.cook_time - b.cook_time;
      return 0;
    });

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col pb-12">
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Breadcrumb / Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Our Aromatic Menu</h1>
          <p className="text-slate-500 text-sm mt-1">Browse and customize your dishes with local fresh ingredients.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 sticky top-36">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <SlidersHorizontal className="h-4.5 w-4.5 text-brand-medium" />
                  <span>Filters</span>
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-brand-medium hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Price range */}
              <div className="pt-4 space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Max Price: <span className="text-brand-medium font-extrabold">{maxPrice} Tk</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-medium"
                />
              </div>

              {/* Cook Time range */}
              <div className="pt-4 space-y-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Max Prep Time: <span className="text-brand-medium font-extrabold">{maxTime} mins</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={maxTime}
                  onChange={(e) => setMaxTime(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-medium"
                />
              </div>

              {/* Dietary check list */}
              <div className="pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Dietary Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVeg}
                      onChange={(e) => setIsVeg(e.target.checked)}
                      className="rounded border-slate-300 text-brand-medium focus:ring-brand-medium h-4 w-4"
                    />
                    <span>Vegetarian 🍃</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVegan}
                      onChange={(e) => setIsVegan(e.target.checked)}
                      className="rounded border-slate-300 text-brand-medium focus:ring-brand-medium h-4 w-4"
                    />
                    <span>Vegan 🌱</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGlutenFree}
                      onChange={(e) => setIsGlutenFree(e.target.checked)}
                      className="rounded border-slate-300 text-brand-medium focus:ring-brand-medium h-4 w-4"
                    />
                    <span>Gluten Free 🌾</span>
                  </label>
                </div>
              </div>

              {/* Spice Levels */}
              <div className="pt-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Spice Level</h4>
                <div className="flex gap-1.5">
                  {[0, 1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSpicyLevel(spicyLevel === lvl ? null : lvl)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                        spicyLevel === lvl
                          ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20'
                          : 'bg-white border-slate-200 text-slate-750 hover:bg-slate-50'
                      }`}
                    >
                      {lvl === 0 ? 'Mild' : Array(lvl).fill('🌶️').join('')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Navigation / Sort selection */}
              <div className="pt-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Sorting</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-medium/20"
                >
                  <option value="default">Default Catalog</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Customer Rated</option>
                  <option value="cook-time">Cooking Speed (Fastest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Catalog Items Column */}
          <div className="lg:col-span-3">
            {filteredFoods.length === 0 ? (
              <div className="py-24 text-center glass-panel rounded-3xl p-10 max-w-md mx-auto">
                <span className="text-4xl block mb-4">🔍</span>
                <h3 className="text-xl font-bold text-slate-800 mb-1.5">No items found</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We couldn't find any dishes matching your parameters. Try lowering your filters, resetting queries, or adjusting the price slider.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {filteredFoods.map((food) => {
                  // Transform Food type to fit MenuCard props temporarily or write custom cards
                  const menuItem = {
                    id: food.id,
                    name: food.title,
                    description: food.description,
                    price: food.discount_price !== null ? food.discount_price : food.price,
                    category: food.category_id === '1' ? 'burger' : food.category_id === '2' ? 'drinks' : 'coffee',
                    image_url: food.image,
                    rating: food.rating,
                  };

                  return (
                    <div key={food.id} className="relative group">
                      <MenuCard item={menuItem} onAddToCart={() => addToCart(food)} />
                      {/* Premium Details Redirect Button */}
                      <Link
                        href={`/menu/${food.id}`}
                        className="absolute top-3 left-3 p-2 bg-white/90 rounded-xl border border-emerald-100/50 text-slate-600 hover:text-brand-medium opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer hover:scale-105 z-20"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      {/* Favorite Button Toggler */}
                      <button
                        onClick={() => toggleFavorite(food.id)}
                        className="absolute top-3 left-13 p-2 bg-white/90 rounded-xl border border-emerald-100/50 opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer hover:scale-105 z-20"
                        title="Favorite"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            isFavorite(food.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-600'
                          }`}
                        />
                      </button>

                      {/* Nutritional/Time indicators */}
                      <div className="absolute top-14 left-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none">
                        <span className="px-2 py-0.5 rounded bg-emerald-600/90 text-[9px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1 shadow">
                          <Clock className="h-3 w-3" /> {food.cook_time}m
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800/90 text-[9px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1 shadow">
                          🔥 {food.calories} kcal
                        </span>
                      </div>

                      {/* Special badges */}
                      {food.discount_price !== null && (
                        <span className="absolute top-3 right-15 px-2.5 py-1 bg-brand-pink text-[9px] font-extrabold text-white rounded-lg uppercase tracking-wider shadow">
                          Sale
                        </span>
                      )}
                      {food.featured && (
                        <span className="absolute bottom-28 right-3 px-2 py-0.5 bg-amber-500 text-[8px] font-extrabold text-brand-dark rounded uppercase tracking-wider shadow">
                          Chef's Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
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
