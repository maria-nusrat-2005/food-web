'use client';

import React, { useState } from 'react';
import Navbar from '@/components/navbar';
import CartDrawer from '@/components/cart-drawer';
import { useCart } from '@/context/CartContext';
import { useApp } from '@/context/AppContext';
import { Calendar, User, Phone, Users, ShieldCheck, Clock, Award, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { createReservation } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Form states
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resGuests, setResGuests] = useState(2);
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resName.trim() || !resPhone.trim() || !resDate || !resTime) return;

    setIsSubmitting(true);
    const success = await createReservation(resName, resPhone, resGuests, resDate, resTime);
    
    if (success) {
      setSuccessMsg(true);
      setResName('');
      setResPhone('');
      setResGuests(2);
      setResDate('');
      setResTime('');
      setTimeout(() => setSuccessMsg(false), 5000);
    }
    setIsSubmitting(false);
  };

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

        {/* Row 2: Table Reservations widget & opening hours */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-slate-150 pt-16">
          {/* Reservation Booking Form */}
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-md">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-brand-medium animate-pulse" />
                <span>Book a Table</span>
              </h2>
              <p className="text-xs text-slate-500 mb-6">Enjoy a cozy dining experience with reserved tables.</p>

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={resName}
                      onChange={(e) => setResName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                      placeholder="e.g. Maria Nusrat"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number
                    </label>
                    <input
                      type="tel"
                      value={resPhone}
                      onChange={(e) => setResPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-xs"
                      placeholder="e.g. +880 1712-345678"
                      required
                    />
                  </div>

                  {/* Guests */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" /> Number of Guests
                    </label>
                    <select
                      value={resGuests}
                      onChange={(e) => setResGuests(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-medium/20"
                    >
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'Guest' : 'Guests'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-650 uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        value={resDate}
                        onChange={(e) => setResDate(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl glass-input text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-655 uppercase tracking-wider">Time</label>
                      <input
                        type="time"
                        value={resTime}
                        onChange={(e) => setResTime(e.target.value)}
                        className="w-full px-3 py-3 rounded-xl glass-input text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {successMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-600 flex gap-2 items-start">
                    <ShieldCheck className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                    <span>Booking requested successfully! Check your Dashboard to track the table status.</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-brand-medium hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  {isSubmitting ? 'Requesting Table...' : 'Book Dining Table'}
                </button>
              </form>
            </div>
          </div>

          {/* Right: Info columns */}
          <div className="space-y-6">
            {/* Opening hours */}
            <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-md">
              <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-brand-medium" />
                <span>Opening Hours</span>
              </h3>
              <div className="space-y-3.5 text-xs text-slate-650">
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Sunday - Thursday:</span>
                  <span>11:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-slate-700">Friday - Saturday:</span>
                  <span>10:00 AM - 11:30 PM</span>
                </div>
              </div>
            </div>

            {/* Awards & Locations */}
            <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-md">
              <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Award className="h-4.5 w-4.5 text-brand-medium" />
                <span>Accolades</span>
              </h3>
              <ul className="space-y-3 text-xs text-slate-600 list-disc list-inside">
                <li>Best Gourmet Burger Award (2023)</li>
                <li>CO2-Friendly Local Food Sourcing Seal</li>
                <li>High Cleanliness Sanitation Grade: A+</li>
              </ul>
            </div>
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
