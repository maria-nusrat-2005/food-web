'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navbar';
import { CreditCard, ShoppingBag, Truck, MapPin, Phone, User, AlertCircle, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { cart, discount, vat, delivery, total, placeOrder } = useCart();
  const { profile } = useAuth();
  const router = useRouter();

  // Redirect if cart is empty
  useEffect(() => {
    if (cart.length === 0) {
      router.push('/cart');
    }
  }, [cart, router]);

  // Form states
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'stripe' | 'sslcommerz' | 'bkash' | 'nagad'>('cod');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      if (profile.phone) setPhone(profile.phone);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setErrorMsg('Please fill in all required delivery fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fullAddress = `${address}, ${city}`;
      const result = await placeOrder(fullAddress, phone, paymentMethod, notes);

      if (result.success && result.orderId) {
        // Redirect to tracking page
        router.push(`/orders/${result.orderId}`);
      } else {
        setErrorMsg('Failed to process checkout. Please try again.');
        setIsSubmitting(false);
      }
    } catch (e) {
      setErrorMsg('An unexpected error occurred during order submission.');
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onCartOpen={() => {}}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <Truck className="h-9 w-9 text-brand-medium" />
            <span>Secure Checkout</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Provide your delivery details and choose your preferred payment method.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery address details */}
            <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40">
              <h3 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-medium" />
                <span>Delivery Details</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1">
                    <User className="h-3 w-3 text-slate-450" />
                    <span>Recipient Name *</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="e.g. Maria Nusrat"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-450" />
                    <span>Contact Number *</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="e.g. +880 1712-345678"
                    required
                  />
                </div>

                {/* Delivery address */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 uppercase tracking-wider flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-450" />
                    <span>Address *</span>
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                    placeholder="e.g. Flat 3A, House 24, Road 5, Dhanmondi"
                    required
                  />
                </div>

                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">City *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-medium/20 focus:border-brand-medium"
                    required
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 uppercase tracking-wider">Instructions (Optional)</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                    placeholder="e.g. Please make it extra spicy, ring doorbell"
                  />
                </div>
              </div>
            </div>

            {/* Payment methods */}
            <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40">
              <h3 className="text-lg font-bold text-slate-800 mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-brand-medium" />
                <span>Payment Options</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Cash on delivery */}
                <label
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    paymentMethod === 'cod'
                      ? 'bg-emerald-50/50 border-brand-medium'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Cash</span>
                    <span className="text-lg">💵</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-tight">Pay with cash when order arrives at your door.</p>
                </label>

                {/* bKash */}
                <label
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    paymentMethod === 'bkash'
                      ? 'bg-emerald-50/50 border-brand-medium'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="bkash"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider text-pink-600">bKash</span>
                    <span className="text-lg">📱</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-tight">Pay instantly using your bKash digital wallet.</p>
                </label>

                {/* Nagad */}
                <label
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    paymentMethod === 'nagad'
                      ? 'bg-emerald-50/50 border-brand-medium'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="nagad"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider text-orange-650">Nagad</span>
                    <span className="text-lg">💸</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-tight">Fast digital checkout with Nagad mobile payment.</p>
                </label>

                {/* Stripe */}
                <label
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-28 ${
                    paymentMethod === 'stripe'
                      ? 'bg-emerald-50/50 border-brand-medium'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="sr-only"
                  />
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider text-indigo-650">Credit Card</span>
                    <span className="text-lg">💳</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-tight">Pay with Visa, Mastercard, or Amex via Stripe.</p>
                </label>
              </div>
            </div>
          </div>

          {/* Pricing detail breakdown summary */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-md">
              <h3 className="font-extrabold text-slate-800 text-base mb-5 pb-2 border-b border-slate-100 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-medium" />
                <span>Order Summary</span>
              </h3>

              <div className="space-y-3.5 max-h-[160px] overflow-y-auto pr-1 mb-5">
                {cart.map((ci) => {
                  const itemPrice = ci.food.discount_price !== null ? ci.food.discount_price : ci.food.price;
                  return (
                    <div key={ci.food.id} className="flex justify-between items-center text-xs text-slate-700">
                      <span className="truncate max-w-[150px] font-medium">
                        {ci.food.title} <span className="text-brand-medium font-bold">x{ci.quantity}</span>
                      </span>
                      <span className="font-bold">{itemPrice * ci.quantity} Tk</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4 mb-6">
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount Applied</span>
                    <span>-{discount} Tk</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>VAT (5%)</span>
                  <span className="text-slate-800 font-bold">{vat} Tk</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-slate-800 font-bold">{delivery} Tk</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-850 pt-3 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-brand-medium text-base">{total} Tk</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-600 mb-4 flex gap-2 items-start">
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-4 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5" />
                    <span>Place Order ({total} Tk)</span>
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-slate-400 mt-4 leading-normal">
                By placing the order you agree to our terms of service and delivery conditions.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
