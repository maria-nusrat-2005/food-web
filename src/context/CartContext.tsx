'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Food, Order, OrderItem } from '@/types';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';
import confetti from 'canvas-confetti';

interface CartContextType {
  cart: CartItem[];
  subtotal: number;
  discount: number;
  vat: number;
  delivery: number;
  total: number;
  couponCode: string;
  couponDiscountPercent: number;
  addToCart: (food: Food) => void;
  updateQuantity: (foodId: string, qty: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  placeOrder: (
    address: string,
    phone: string,
    paymentMethod: 'cod' | 'stripe' | 'sslcommerz' | 'bkash' | 'nagad',
    notes: string
  ) => Promise<{ success: boolean; orderId: string | null }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(0);
  const { profile, updatePoints, isMockUser } = useAuth();

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('flavor_haven_cart');
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading cart', e);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('flavor_haven_cart', JSON.stringify(newCart));
  };

  const addToCart = (food: Food) => {
    const existing = cart.find((ci) => ci.food.id === food.id);
    let newCart: CartItem[];
    if (existing) {
      newCart = cart.map((ci) =>
        ci.food.id === food.id ? { ...ci, quantity: ci.quantity + 1 } : ci
      );
    } else {
      newCart = [...cart, { food, quantity: 1 }];
    }
    saveCart(newCart);
  };

  const updateQuantity = (foodId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(foodId);
      return;
    }
    const newCart = cart.map((ci) =>
      ci.food.id === foodId ? { ...ci, quantity: qty } : ci
    );
    saveCart(newCart);
  };

  const removeFromCart = (foodId: string) => {
    const newCart = cart.filter((ci) => ci.food.id !== foodId);
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setCouponCode('');
    setCouponDiscountPercent(0);
  };

  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const upperCode = code.toUpperCase().trim();
    
    // Static coupon validation for demo speed & fallback
    if (upperCode === 'SAVE20') {
      setCouponCode(upperCode);
      setCouponDiscountPercent(20);
      return { success: true, message: 'Coupon code SAVE20 (20% Off) applied successfully!' };
    }
    if (upperCode === 'NEWUSER') {
      setCouponCode(upperCode);
      setCouponDiscountPercent(15);
      return { success: true, message: 'Coupon code NEWUSER (15% Off) applied successfully!' };
    }
    if (upperCode === 'FREESHIP') {
      setCouponCode(upperCode);
      setCouponDiscountPercent(10); // Simulated free shipping as 10% discount for convenience
      return { success: true, message: 'Coupon code FREESHIP applied successfully!' };
    }

    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', upperCode)
        .gt('expire_date', new Date().toISOString())
        .single();

      if (!error && data) {
        setCouponCode(data.code);
        setCouponDiscountPercent(Number(data.discount));
        return { success: true, message: `Coupon ${data.code} applied successfully!` };
      }
    } catch (e) {
      // ignore
    }

    return { success: false, message: 'Invalid or expired coupon code.' };
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscountPercent(0);
  };

  // Calculations
  const subtotal = cart.reduce((acc, ci) => {
    const price = ci.food.discount_price !== null ? ci.food.discount_price : ci.food.price;
    return acc + price * ci.quantity;
  }, 0);
  const discount = Math.round((subtotal * couponDiscountPercent) / 100);
  const vat = Math.round((subtotal - discount) * 0.05); // 5% VAT
  const delivery = subtotal > 0 ? 60 : 0;
  const total = subtotal - discount + vat + delivery;

  const placeOrder = async (
    address: string,
    phone: string,
    paymentMethod: 'cod' | 'stripe' | 'sslcommerz' | 'bkash' | 'nagad',
    notes: string
  ): Promise<{ success: boolean; orderId: string | null }> => {
    if (cart.length === 0) return { success: false, orderId: null };

    const orderId = `ord-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      user_id: profile?.id || null,
      status: 'received',
      total,
      payment_method: paymentMethod,
      address,
      phone,
      notes: notes || null,
      discount_applied: discount,
      code_used: couponCode || null,
      created_at: new Date().toISOString(),
    };

    try {
      if (!isMockUser && profile) {
        // 1. Insert order record into database
        const { error: orderErr } = await supabase.from('orders').insert([
          {
            id: orderId,
            user_id: profile.id,
            status: 'received',
            total,
            payment_method: paymentMethod,
            address,
            phone,
            notes: notes || null,
            discount_applied: discount,
            code_used: couponCode || null,
          },
        ]);

        if (orderErr) throw orderErr;

        // 2. Insert order items
        const orderItemsData = cart.map((ci) => ({
          order_id: orderId,
          food_id: ci.food.id,
          quantity: ci.quantity,
          price: ci.food.discount_price !== null ? ci.food.discount_price : ci.food.price,
        }));

        const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsData);
        if (itemsErr) throw itemsErr;

        // 3. Add order notification
        await supabase.from('notifications').insert([
          {
            user_id: profile.id,
            title: 'Order Received!',
            message: `Your order #${orderId.substring(0, 8)} of ${total} Tk has been placed.`,
          },
        ]);
      } else {
        // For mock user, save to local storage order history simulator
        const mockHistory = JSON.parse(localStorage.getItem('flavor_haven_orders') || '[]');
        localStorage.setItem('flavor_haven_orders', JSON.stringify([newOrder, ...mockHistory]));
      }

      // Add Reward Points (1 point for every 10 Tk spent)
      const earnedPoints = Math.floor(total / 10);
      updatePoints(earnedPoints);

      // Trigger Confetti
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#3b82f6', '#db2777'],
      });

      clearCart();
      return { success: true, orderId };
    } catch (e) {
      console.error('Order insertion failed', e);
      // Fallback local placement
      const mockHistory = JSON.parse(localStorage.getItem('flavor_haven_orders') || '[]');
      localStorage.setItem('flavor_haven_orders', JSON.stringify([newOrder, ...mockHistory]));
      clearCart();
      return { success: true, orderId };
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        subtotal,
        discount,
        vat,
        delivery,
        total,
        couponCode,
        couponDiscountPercent,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
