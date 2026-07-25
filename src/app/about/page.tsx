'use client';

import React, { useState } from 'react';
import Navbar from '@/components/navbar';
import CartDrawer from '@/components/cart-drawer';
import { useCart } from '@/context/CartContext';

export default function AboutPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
        hideCategories={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-16">
        {/* Row 1: Restaurant Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-brand-medium text-xs font-bold uppercase tracking-wider">
              Our Legacy
            </span>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
              The Story of Flavor Haven
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Established in 2021, Flavor Haven was born out of a simple passion: to serve premium,
              freshly made delicacies in an ambiance that feels like a second home. Over the years, we
              have sourced our ingredients directly from local farms in Bangladesh, ensuring every bite represents
              absolute quality and freshness.
            </p>
            <p className="text-sm text-slate-650 leading-relaxed">
              Our chefs combine classical cooking principles with custom modern culinary art. Whether you are tasting
              our zesty Burgers, custom freshly blended Juices, or organic Coffee roasts, we guarantee a savory
              experience that you will cherish.
            </p>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              <div>
                <p className="text-2xl font-extrabold text-brand-medium">50+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Specialties</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-medium">10k+</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Patrons served</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-brand-medium">4.9</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Average Rating</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-3xl overflow-hidden aspect-video lg:aspect-auto lg:h-[380px] shadow-lg border border-slate-200">
            <img
              src="/Image/rohollah-saberi-nw7rJ98OBcE-unsplash.jpg"
              alt="Restaurant Interior"
              className="w-full h-full object-cover"
            />
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
