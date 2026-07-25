'use client';

import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Sparkles } from 'lucide-react';
import { CartItem } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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
  const { profile, openAuthModal } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.food.discount_price !== null ? item.food.discount_price : item.food.price;
    return acc + price * item.quantity;
  }, 0);
  const vat = Math.round(subtotal * 0.05); // 5% VAT
  const delivery = subtotal > 0 ? 60 : 0; // 60 Tk flat rate
  const total = subtotal + vat + delivery;

  const handleCheckout = () => {
    if (!profile) {
      onClose(); // Close cart drawer so Auth modal is visible
      openAuthModal();
      return;
    }

    onClose();
    router.push('/checkout');
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
                  className="w-full mt-6 bg-brand-medium hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-xl shadow-lg shadow-brand-medium/10 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer border-0"
                >
                  <CreditCard className="h-4.5 w-4.5" />
                  <span>Proceed to Checkout ({total} Tk)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
