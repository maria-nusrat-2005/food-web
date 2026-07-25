'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/navbar';
import CartDrawer from '@/components/cart-drawer';
import { Calendar, Users, Clock, Phone, User, CheckCircle2, ChevronRight, ArrowLeft, Utensils, Star, Sparkles } from 'lucide-react';
import Link from 'next/link';

// Predefined dining time slots mapped to 24h format for database storage
const TIME_SLOTS = [
  { label: '12:00 PM (Lunch)', value: '12:00' },
  { label: '1:00 PM (Lunch)', value: '13:00' },
  { label: '2:00 PM (Lunch)', value: '14:00' },
  { label: '3:00 PM (Lunch)', value: '15:00' },
  { label: '6:00 PM (Dinner)', value: '18:00' },
  { label: '7:00 PM (Dinner)', value: '19:00' },
  { label: '8:00 PM (Dinner)', value: '20:00' },
  { label: '9:00 PM (Dinner)', value: '21:00' },
  { label: '10:00 PM (Dinner)', value: '22:00' },
];

export default function BookTablePage() {
  const { profile } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { createReservation } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Form states
  const [resName, setResName] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resGuests, setResGuests] = useState(2);
  const [resDate, setResDate] = useState('');
  const [resTime, setResTime] = useState(''); // Stores the 24h string value e.g. "19:00"
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Prefill details if user profile is loaded
  useEffect(() => {
    if (profile) {
      setResName(profile.name || '');
      setResPhone(profile.phone || '');
    }
  }, [profile]);

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setResDate(today);
  }, []);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!resName.trim() || !resPhone.trim() || !resDate || !resTime) {
      setErrorMsg('Please fill in all fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await createReservation(resName, resPhone, resGuests, resDate, resTime);
      if (success) {
        // Find time label for displaying on the ticket
        const timeLabel = TIME_SLOTS.find(t => t.value === resTime)?.label || resTime;
        setSuccessTicket({
          id: `res-${Date.now().toString().slice(-6)}`.toUpperCase(),
          name: resName,
          phone: resPhone,
          guests: resGuests,
          date: resDate,
          time: timeLabel,
          status: 'pending',
        });
        
        // Reset form except defaults
        setResName(profile?.name || '');
        setResPhone(profile?.phone || '');
        setResGuests(2);
        setResTime('');
      } else {
        setErrorMsg('Failed to submit booking. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getGuestOptionDescription = (count: number) => {
    if (count <= 2) return 'Cozy Date Table';
    if (count <= 4) return 'Small Family Dining';
    if (count <= 6) return 'Standard Group Space';
    return 'Premium Banquet Feast';
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col font-sans">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
        hideCategories={true}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        {successTicket ? (
          /* Premium Animate-In Dining Ticket Success Screen */
          <div className="max-w-md w-full mx-auto animate-in zoom-in-95 duration-300">
            <div className="text-center mb-8">
              <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm animate-bounce">
                <CheckCircle2 className="h-9 w-9 text-brand-medium" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Table Reserved!</h2>
              <p className="text-slate-500 text-xs mt-1">Your reservation request has been submitted successfully.</p>
            </div>

            {/* Ticket Card */}
            <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-xl relative">
              {/* Top Notch styling */}
              <div className="bg-[#166534] text-white px-6 py-5 text-center relative">
                <div className="absolute top-3 left-4 flex gap-1 items-center">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  <span className="text-[8px] uppercase tracking-widest font-bold">Premium Seat</span>
                </div>
                <h3 className="text-sm font-extrabold tracking-wider uppercase">Dining Reservation</h3>
                <p className="text-[10px] text-emerald-100 font-semibold mt-0.5">Flavor Haven Restaurant</p>
              </div>

              {/* Ticket Details */}
              <div className="p-6 space-y-4 text-xs font-semibold text-slate-700">
                <div className="flex justify-between border-b border-slate-100 pb-3">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Reservation ID</span>
                  <span className="font-extrabold text-slate-800 font-mono text-sm">{successTicket.id}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-1">Date</span>
                    <span className="text-slate-800 text-xs font-extrabold">{successTicket.date}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-1">Time</span>
                    <span className="text-slate-800 text-xs font-extrabold">{successTicket.time}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-1">Guest Size</span>
                    <span className="text-slate-800 text-xs font-extrabold flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-brand-medium" />
                      {successTicket.guests} People
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block mb-1">Status</span>
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 font-extrabold rounded-full text-[9px] inline-block uppercase">
                      {successTicket.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pb-2">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Customer Name</span>
                    <span className="text-slate-800 font-bold">{successTicket.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px] block">Contact Phone</span>
                    <span className="text-slate-850 font-bold">{successTicket.phone}</span>
                  </div>
                </div>

                {/* Simulated ticket circular side-cuts */}
                <div className="relative border-t-2 border-dashed border-slate-100 my-4 pt-4 text-center">
                  <div className="absolute -left-[33px] -top-3 w-6 h-6 bg-[#FFFDF8] rounded-full border border-slate-200/80"></div>
                  <div className="absolute -right-[33px] -top-3 w-6 h-6 bg-[#FFFDF8] rounded-full border border-slate-200/80"></div>
                  <p className="text-[10px] text-slate-400 italic">Please show this ticket on arrival or mention your ID.</p>
                </div>
              </div>
            </div>

            {/* Actions below ticket */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/my-reservations"
                className="px-6 py-3 bg-[#166534] hover:bg-[#114f29] text-white text-xs font-bold rounded-xl text-center shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer border-0"
              >
                <span>View My Bookings</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => setSuccessTicket(null)}
                className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl text-center transition-all cursor-pointer"
              >
                Book Another Table
              </button>
            </div>
          </div>
        ) : (
          /* Booking Layout Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Visual Promos & Opening Hours */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
              <div className="glass-panel rounded-3xl p-6 border border-emerald-100/30 bg-white/40 shadow-sm flex-1 flex flex-col justify-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#D4A017] mb-2 block">Premium Experience</span>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight mb-4">
                  Book A dining Table
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  Skip the lines and secure your table at Flavor Haven today. Enjoy cozy seating, candlelight ambience, and chef special gourmet menu options.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 text-brand-medium rounded-xl border border-emerald-100">
                      <Clock className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Opening Hours</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Sun - Thu: 11:00 AM - 10:00 PM</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Fri - Sat: 10:00 AM - 11:30 PM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-emerald-50 text-brand-medium rounded-xl border border-emerald-100">
                      <Utensils className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-805">Bespoke Dining Options</h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Custom birthday/anniversary layouts.</p>
                      <p className="text-[10px] text-slate-500 font-semibold">Vegetarian & vegan menus available.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Snippet */}
              <div className="glass-panel rounded-3xl p-5 border border-emerald-100/30 bg-[#166534] text-white shadow-sm">
                <div className="flex text-amber-300 mb-2.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-[10.5px] italic opacity-90 leading-relaxed">
                  "The booking process was seamless, and on arrival, our candlelit window table was beautifully prepared. Highly recommended!"
                </p>
                <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/10 text-[9.5px] font-bold opacity-80">
                  <span>Maria N. (Dhaka)</span>
                  <span>Verified Customer</span>
                </div>
              </div>
            </div>

            {/* Right Column: Reservation Form */}
            <div className="lg:col-span-8">
              <div className="glass-panel bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-md">
                <h2 className="text-xl font-extrabold text-slate-800 mb-1 flex items-center gap-2">
                  <Calendar className="h-5.5 w-5.5 text-brand-medium" />
                  <span>Reserve Table Details</span>
                </h2>
                <p className="text-[11px] text-slate-500 mb-6">Complete this request details to lock your table slot.</p>

                {errorMsg && (
                  <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 font-bold rounded-xl text-[11px]">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-5 text-slate-650 text-xs font-bold">
                  {/* Name and Phone Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
                      </label>
                      <input
                        type="text"
                        value={resName}
                        onChange={(e) => setResName(e.target.value)}
                        placeholder="e.g. Maria Nusrat"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#166534] bg-slate-50/50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number
                      </label>
                      <input
                        type="tel"
                        value={resPhone}
                        onChange={(e) => setResPhone(e.target.value)}
                        placeholder="e.g. +880 1712-345678"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#166534] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Guest count selector buttons */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-slate-400" /> Party Size (Guests)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setResGuests(num)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            resGuests === num
                              ? 'bg-[#166534] text-white border-[#166534] shadow-sm scale-105'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-[#166534]'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9.5px] text-slate-400 font-semibold italic mt-1">
                      Option: {getGuestOptionDescription(resGuests)} (Need more than 10? Please call us directly).
                    </p>
                  </div>

                  {/* Date Input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" /> Dining Date
                    </label>
                    <input
                      type="date"
                      value={resDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setResDate(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-[#166534] bg-slate-50/50"
                    />
                  </div>

                  {/* Time slot selector buttons */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" /> Dining Time Slot
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot.value}
                          type="button"
                          onClick={() => setResTime(slot.value)}
                          className={`py-3 px-3 rounded-xl text-left text-[11px] font-bold border transition-all flex flex-col justify-center cursor-pointer border-solid ${
                            resTime === slot.value
                              ? 'bg-[#166534] text-white border-[#166534] shadow-sm scale-[1.02]'
                              : 'bg-white text-slate-750 border-slate-200 hover:border-[#166534]'
                          }`}
                        >
                          <span>{slot.label.split(' ')[0] + ' ' + slot.label.split(' ')[1]}</span>
                          <span className={`text-[8.5px] uppercase tracking-wider font-extrabold mt-0.5 ${
                            resTime === slot.value ? 'text-emerald-100' : 'text-slate-400'
                          }`}>\
                            {slot.label.includes('Lunch') ? 'Lunch Period' : 'Dinner Period'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#166534] hover:bg-[#114f29] text-white font-extrabold rounded-xl text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 mt-4 border-0"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4.5 h-4.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting Table Reservation...</span>
                      </>
                    ) : (
                      <>
                        <span>Secure Table Reservation</span>
                        <ChevronRight className="h-4.5 w-4.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

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

      {/* Cart Drawer */}
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
