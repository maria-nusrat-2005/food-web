'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/navbar';
import CartDrawer from '@/components/cart-drawer';
import { ShoppingBag, Trash2, Plus, Minus, Ticket, Sparkles, CreditCard, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const {
    cart,
    subtotal,
    discount,
    vat,
    delivery,
    total,
    couponCode,
    applyCoupon,
    removeCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const { profile, openAuthModal } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmittingCoupon, setIsSubmittingCoupon] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const router = useRouter();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsSubmittingCoupon(true);
    setCouponMsg(null);

    const result = await applyCoupon(couponInput);
    if (result.success) {
      setCouponMsg({ type: 'success', text: result.message });
      setCouponInput('');
    } else {
      setCouponMsg({ type: 'error', text: result.message });
    }
    setIsSubmittingCoupon(false);
  };

  const handleCheckoutRedirect = () => {
    if (!profile) {
      openAuthModal();
    } else {
      router.push('/checkout');
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={cart.reduce((acc, item) => acc + item.quantity, 0)}
        onCartOpen={() => setIsCartDrawerOpen(true)}
        hideCategories={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
            <ShoppingBag className="h-9 w-9 text-brand-medium" />
            <span>Shopping Cart</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Review your delicacies and apply coupons for special discounts.</p>
        </div>

        {cart.length === 0 ? (
          <div className="py-20 text-center glass-panel rounded-3xl p-10 max-w-md mx-auto">
            <ShoppingBag className="h-16 w-16 text-slate-350 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Explore our special burgers, drinks, and coffees to place an order.
            </p>
            <Link
              href="/menu"
              className="px-6 py-3 bg-brand-medium text-white font-bold rounded-xl text-sm hover:bg-emerald-700 transition-colors inline-block"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider">
                <span>Food Item</span>
                <button
                  onClick={clearCart}
                  className="text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {cart.map((item) => {
                const itemPrice = item.food.discount_price !== null ? item.food.discount_price : item.food.price;
                return (
                  <div
                    key={item.food.id}
                    className="glass-panel rounded-2xl p-4 border border-emerald-100/50 bg-white/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-emerald-100"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.food.image || '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg'}
                        alt={item.food.title}
                        className="w-20 h-20 rounded-xl object-cover bg-slate-100 flex-shrink-0 border border-slate-200"
                      />
                      <div>
                        <h3 className="text-base font-extrabold text-slate-800">{item.food.title}</h3>
                        <p className="text-xs text-brand-medium font-bold mt-0.5">{itemPrice} Tk</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">
                          Calories: {item.food.calories} kcal
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.food.id, item.quantity - 1)}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-extrabold text-slate-850 min-w-[16px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.food.id, item.quantity + 1)}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <div className="text-right">
                        <p className="text-xs text-slate-400 font-medium">Subtotal</p>
                        <p className="text-base font-extrabold text-slate-850">{itemPrice * item.quantity} Tk</p>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.food.id)}
                        className="p-2 text-slate-450 hover:text-rose-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Remove Item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <Link
                href="/menu"
                className="inline-flex items-center gap-2 text-sm font-bold text-brand-medium hover:text-emerald-700 mt-4"
              >
                <ArrowLeft className="h-4.5 w-4.5" />
                <span>Continue Ordering Dishes</span>
              </Link>
            </div>

            {/* Calculations Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Coupon box */}
              <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40">
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2 mb-4">
                  <Ticket className="h-5 w-5 text-brand-medium" />
                  <span>Promo Codes</span>
                </h3>

                {couponCode ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Applied Code</p>
                      <p className="text-sm font-extrabold text-brand-medium uppercase tracking-wider">
                        {couponCode}
                      </p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SAVE20"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-grow px-3.5 py-2.5 rounded-xl glass-input text-xs uppercase"
                      required
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingCoupon}
                      className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs mt-3 border ${
                      couponMsg.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                    }`}
                  >
                    {couponMsg.text}
                  </div>
                )}
                
                <p className="text-[10px] text-slate-400 font-semibold mt-3">
                  Tip: Use coupon <code className="text-brand-medium font-bold bg-slate-100 px-1 py-0.5 rounded">SAVE20</code> or <code className="text-brand-medium font-bold bg-slate-100 px-1 py-0.5 rounded">NEWUSER</code> for discount savings.
                </p>
              </div>

              {/* Pricing breakdown summary */}
              <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-md">
                <h3 className="font-extrabold text-slate-800 text-base mb-4 pb-2 border-b border-slate-100">
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm text-slate-650 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-850 font-semibold">{subtotal} Tk</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-{discount} Tk</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>VAT (5%)</span>
                    <span className="text-slate-850 font-semibold">{vat} Tk</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-slate-850 font-semibold">{delivery} Tk</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-850 pt-3 border-t border-slate-100">
                    <span>Grand Total</span>
                    <span className="text-brand-medium">{total} Tk</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutRedirect}
                  className="w-full bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-4 px-4 rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
                >
                  <CreditCard className="h-4.5 w-4.5" />
                  <span>Proceed to Checkout</span>
                </button>
                <div className="text-center mt-3">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1">
                    <Sparkles className="h-3 w-3 text-brand-medium animate-pulse" />
                    Earn {Math.floor(total / 10)} Flavor Haven Reward Points on this order!
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />
    </div>
  );
}
