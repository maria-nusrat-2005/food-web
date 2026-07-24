'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/navbar';
import { ShieldAlert, RefreshCw, AlertCircle, ShoppingBag, ArrowUpDown, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/types';
import { supabase } from '@/lib/supabase';

const STATUS_OPTIONS = ['received', 'preparing', 'cooking', 'delivery', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const { profile, toggleMockRole } = useAuth();
  const { isSupabaseConnected } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders
  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setOrders(data);
        } else {
          const localHistory = JSON.parse(localStorage.getItem('flavor_haven_orders') || '[]');
          setOrders(localHistory);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    if (profile?.role === 'admin') {
      loadOrders();
    }
  }, [profile]);

  // Security gate
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4 bg-[#f0fdf4]">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">
          You need Admin privileges to view this management console.
        </p>
        <button
          onClick={toggleMockRole}
          className="mt-6 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Switch to Admin Profile</span>
        </button>
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, nextStatus: any) => {
    try {
      if (isSupabaseConnected) {
        await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
      }

      // Sync state & local storage
      setOrders((prev) => {
        const updated = prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
        localStorage.setItem('flavor_haven_orders', JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-[#f0fdf4]">
      <Navbar searchQuery="" setSearchQuery={() => {}} activeCategory="all" setActiveCategory={() => {}} cartCount={0} onCartOpen={() => {}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-brand-medium" />
              <span>Live Order Monitor</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Accept, reject, and monitor customer orders in real time.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-xs shadow-sm">
              Back to Overview
            </Link>
          </div>
        </div>

        {/* Database linkage warning */}
        {!isSupabaseConnected && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl text-xs text-amber-700 flex gap-2 items-start">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <span>
              Database connection missing. Updates will change on screen and sync to mock local storage history, but will not save to live Supabase servers.
            </span>
          </div>
        )}

        {/* Orders list log */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-brand-medium border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading live order queue...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No orders logged in history queue.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Time Placed</th>
                    <th className="pb-3">Shipping Address</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Grand Total</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Live Status</th>
                    <th className="pb-3 text-right">Update Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {orders.map((ord) => (
                    <tr key={ord.id}>
                      <td className="py-3.5 font-bold text-slate-800">
                        #{ord.id.substring(0, 12)}...
                      </td>
                      <td className="py-3.5">
                        {new Date(ord.created_at).toLocaleDateString()} {new Date(ord.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3.5 max-w-[180px] truncate" title={ord.address}>
                        {ord.address}
                      </td>
                      <td className="py-3.5 font-medium">{ord.phone}</td>
                      <td className="py-3.5 font-extrabold text-brand-medium">
                        {ord.total} Tk
                      </td>
                      <td className="py-3.5 font-bold uppercase text-[10px] text-slate-500">
                        {ord.payment_method}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          ord.status === 'delivered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : ord.status === 'cancelled'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value as any)}
                          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-medium cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
