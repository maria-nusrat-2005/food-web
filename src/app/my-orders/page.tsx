'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/navbar';
import CartDrawer from '@/components/cart-drawer';
import { ShoppingBag, Calendar, MapPin, Phone, CreditCard, ExternalLink, ChevronDown, ChevronUp, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface OrderItemInfo {
  food_title: string;
  food_image?: string;
  quantity: number;
  price: number;
}

interface UserOrder {
  id: string;
  created_at: string;
  status: string;
  total: number;
  payment_method: string;
  address: string;
  phone: string;
  notes?: string;
  discount_applied?: number;
  code_used?: string;
  items?: OrderItemInfo[];
}

export default function MyOrdersPage() {
  const { profile, isMockUser } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        if (!isMockUser && profile) {
          // Fetch orders from Supabase
          const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false });

          if (orderError) throw orderError;

          if (orderData && orderData.length > 0) {
            // Fetch order items for each order
            const ordersWithItems = await Promise.all(
              orderData.map(async (order) => {
                const { data: itemData } = await supabase
                  .from('order_items')
                  .select('quantity, price, foods(title, image)')
                  .eq('order_id', order.id);

                const formattedItems: OrderItemInfo[] = (itemData || []).map((it: any) => ({
                  food_title: it.foods?.title || 'Unknown Food Item',
                  food_image: it.foods?.image || '',
                  quantity: it.quantity,
                  price: Number(it.price),
                }));

                return {
                  ...order,
                  total: Number(order.total),
                  discount_applied: Number(order.discount_applied || 0),
                  items: formattedItems,
                };
              })
            );

            setOrders(ordersWithItems);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to load orders from Supabase. Falling back to local storage history.', err);
      }

      // Local storage fallback
      const localOrders = JSON.parse(localStorage.getItem('flavor_haven_orders') || '[]');
      localOrders.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setOrders(localOrders);
      setLoading(false);
    }

    loadOrders();
  }, [profile, isMockUser]);

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'received':
        return { label: 'Received', color: 'bg-blue-50 text-blue-700 border-blue-150', icon: Clock };
      case 'preparing':
        return { label: 'Preparing', color: 'bg-amber-50 text-amber-700 border-amber-150', icon: Clock };
      case 'cooking':
        return { label: 'Cooking', color: 'bg-yellow-50 text-yellow-700 border-yellow-150', icon: Clock };
      case 'delivery':
        return { label: 'On The Way', color: 'bg-orange-50 text-orange-700 border-orange-150', icon: Truck };
      case 'delivered':
        return { label: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-150', icon: CheckCircle2 };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-rose-50 text-rose-700 border-rose-150', icon: XCircle };
      default:
        return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-150', icon: Clock };
    }
  };

  const formatPaymentMethod = (method: string) => {
    const methods: { [key: string]: string } = {
      cod: 'Cash on Delivery',
      stripe: 'Credit Card (Stripe)',
      sslcommerz: 'SSLCommerz (Card/Net Banking)',
      bkash: 'bKash Mobile Wallet',
      nagad: 'Nagad Mobile Wallet',
    };
    return methods[method.toLowerCase()] || method.toUpperCase();
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

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-10 text-center md:text-left">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4A017] mb-2 block">
            Flavor Haven Order Status
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            My Orders
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your live orders and view your previous dining history.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#166534] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-xs mt-4 font-medium">Retrieving order database records...</p>
          </div>
        ) : !profile ? (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto">
            <ShoppingBag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Account Access Required</h3>
            <p className="text-slate-500 text-xs mt-2 mb-6">
              Please sign in to your Flavor Haven account to view your past orders.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#166534] hover:bg-[#114f29] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-[#166534]/10"
            >
              Go to Account Panel
            </Link>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-12 text-center shadow-sm max-w-md mx-auto">
            <div className="h-16 w-16 bg-[#FFFDF8] rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-50">
              <ShoppingBag className="h-8 w-8 text-[#D4A017]" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">No Orders Placed Yet</h3>
            <p className="text-slate-550 text-xs mt-2 mb-6 max-w-xs mx-auto leading-relaxed">
              You haven't ordered any delicious food yet. Head over to our catalog to place your first order.
            </p>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#166534] hover:bg-[#114f29] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Browse Our Menu
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              const isExpanded = expandedOrderId === order.id;
              const isLive = !['delivered', 'cancelled'].includes(order.status.toLowerCase());

              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#E5E7EB] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  {/* Order Card Header Summary */}
                  <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#E5E7EB] bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-extrabold text-slate-800 text-sm tracking-tight">
                          Order #{order.id.slice(-8).toUpperCase()}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConfig.color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                        {isLive && (
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 font-medium gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</p>
                        <p className="text-lg font-black text-[#166534]">{order.total.toFixed(0)} Tk</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isLive && (
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#166534] hover:bg-[#114f29] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            <span>Track Live</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                        <button
                          onClick={() => toggleExpand(order.id)}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors cursor-pointer"
                          title={isExpanded ? 'Collapse' : 'Expand details'}
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible details section */}
                  {isExpanded && (
                    <div className="p-5 md:p-6 border-t border-slate-100 divide-y divide-slate-150 animate-in fade-in slide-in-from-top-3 duration-250">
                      {/* Items Ordered */}
                      <div className="pb-5">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Items Ordered</h4>
                        <div className="space-y-3">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {item.food_image ? (
                                  <img
                                    src={item.food_image}
                                    alt={item.food_title}
                                    className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                                  />
                                ) : (
                                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-100 text-brand-medium font-bold text-xs select-none">
                                    🥘
                                  </div>
                                )}
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{item.food_title}</p>
                                  <p className="text-[10px] text-slate-500 font-medium">Qty: {item.quantity} × {item.price} Tk</p>
                                </div>
                              </div>
                              <p className="text-xs font-extrabold text-slate-700">{(item.quantity * item.price)} Tk</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Delivery Details */}
                      <div className="py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Delivery Details</h4>
                          
                          <div className="flex items-start gap-2.5 text-xs text-slate-650 font-medium leading-relaxed">
                            <MapPin className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-slate-800 font-bold">Shipping Address</p>
                              <p className="text-slate-500 mt-0.5">{order.address}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2.5 text-xs text-slate-650 font-medium">
                            <Phone className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-slate-800 font-bold">Contact Number</p>
                              <p className="text-slate-500 mt-0.5">{order.phone}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Payment Summary</h4>

                          <div className="flex items-start gap-2.5 text-xs text-slate-650 font-medium">
                            <CreditCard className="h-4 w-4 text-[#D4A017] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-slate-800 font-bold">Payment Method</p>
                              <p className="text-slate-500 mt-0.5">{formatPaymentMethod(order.payment_method)}</p>
                            </div>
                          </div>

                          {order.notes && (
                            <div className="bg-[#FFFDF8] border border-amber-100 rounded-xl p-3 text-xs mt-2 text-slate-600">
                              <span className="font-bold text-slate-700">Driver Notes:</span> {order.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Coupon Discount Details */}
                      {(order.discount_applied && order.discount_applied > 0) ? (
                        <div className="pt-4 flex items-center justify-between text-xs font-medium text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-black rounded-md">
                              COUPON {order.code_used || 'DISCOUNT'}
                            </span>
                            <span>Applied Discount</span>
                          </div>
                          <span className="text-rose-600 font-bold">-{order.discount_applied} Tk</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
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
