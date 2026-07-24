'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Sparkles } from 'lucide-react';
import { CartItem } from '@/types';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.food.discount_price !== null ? item.food.discount_price : item.food.price;
    return acc + price * item.quantity;
  }, 0);
  const vat = Math.round(subtotal * 0.05); // 5% VAT
  const delivery = subtotal > 0 ? 60 : 0; // 60 Tk flat rate
  const total = subtotal + vat + delivery;

  const handleCheckout = () => {
    setCheckingOut(true);
    setTimeout(() => {
      setCheckingOut(false);
      setSuccessModal(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#3b82f6', '#db2777'],
      });
      onClearCart();
    }, 2000);
  };

  return (
    <>
      {/* Sidebar Cart Drawer */}
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Overlay backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        />

        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <div className="w-screen max-w-md transform transition-all duration-300 ease-in-out glass-panel border-l border-emerald-100/50 flex flex-col h-full bg-white/95">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-brand-medium animate-bounce" />
                <h2 className="text-lg font-extrabold text-slate-800">Your Order</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingBag className="h-16 w-16 text-slate-300 mb-4" />
                  <p className="text-slate-700 font-bold text-lg">Your cart is empty</p>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    Browse our menu and add items to begin placing your order.
                  </p>
                </div>
              ) : (
                cartItems.map((item) => {
                  const price = item.food.discount_price !== null ? item.food.discount_price : item.food.price;
                  return (
                    <div
                      key={item.food.id}
                      className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-xl p-3.5 hover:border-emerald-100/50 transition-colors"
                    >
                      <img
                        src={item.food.image || '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg'}
                        alt={item.food.title}
                        className="w-16 h-16 rounded-lg object-cover bg-slate-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{item.food.title}</h4>
                        <p className="text-xs text-brand-medium font-bold mt-0.5">
                          {price} Tk
                        </p>
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => onUpdateQuantity(item.food.id, item.quantity - 1)}
                            className="p-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 min-w-[12px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.food.id, item.quantity + 1)}
                            className="p-1 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveItem(item.food.id)}
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Calculation */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-100 px-6 py-6 bg-slate-50/50">
                <div className="space-y-2.5 text-sm text-slate-650">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-slate-800 font-semibold">{subtotal} Tk</span>
                  </div>
                  <div className="flex justify-between">
                    <span>VAT (5%)</span>
                    <span className="text-slate-800 font-semibold">{vat} Tk</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span className="text-slate-800 font-semibold">{delivery} Tk</span>
                  </div>
                  <div className="flex justify-between text-base font-extrabold text-slate-850 pt-2.5 border-t border-slate-200">
                    <span>Total Amount</span>
                    <span className="text-brand-medium">{total} Tk</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full mt-6 bg-brand-medium hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-lg shadow-brand-medium/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:scale-100 cursor-pointer"
                >
                  {checkingOut ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4.5 w-4.5" />
                      <span>Place Order ({total} Tk)</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setSuccessModal(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative glass-panel bg-white border border-emerald-100/50 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Sparkles className="h-8 w-8 text-emerald-600 animate-pulse" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-850 mb-2">Order Confirmed!</h3>
            <p className="text-sm text-slate-650 leading-relaxed mb-6">
              Thank you for ordering from Flavor Haven! We are preparing your meal. It will arrive shortly.
            </p>
            <button
              onClick={() => {
                setSuccessModal(false);
                onClose();
              }}
              className="w-full py-3 bg-brand-medium hover:bg-emerald-750 text-white font-bold rounded-xl transition-all cursor-pointer"
            >
              Great, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
