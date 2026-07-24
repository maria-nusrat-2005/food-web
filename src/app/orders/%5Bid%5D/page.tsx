'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/navbar';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Order } from '@/types';
import { Check, Clock, Truck, ChefHat, MapPin, Phone, CreditCard, ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const STATUS_STAGES = [
  { id: 'received', name: 'Order Received', icon: Clock, progress: 10 },
  { id: 'preparing', name: 'Preparing', icon: ChefHat, progress: 35 },
  { id: 'cooking', name: 'Cooking', icon: ChefHat, progress: 60 },
  { id: 'delivery', name: 'Out for Delivery', icon: Truck, progress: 85 },
  { id: 'delivered', name: 'Delivered', icon: Check, progress: 100 },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Order
  useEffect(() => {
    async function loadOrder() {
      if (!params.id) return;
      try {
        setLoading(true);
        // Attempt Supabase fetch
        const { data, error } = await supabase.from('orders').select('*').eq('id', params.id).single();
        if (!error && data) {
          setOrder(data);
        } else {
          // Fallback to local history
          const localHistory = JSON.parse(localStorage.getItem('flavor_haven_orders') || '[]');
          const found = localHistory.find((o: Order) => o.id === params.id);
          if (found) {
            setOrder(found);
          }
        }
      } catch (e) {
        console.error('Error fetching order', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [params.id]);

  // Simulate real-time status progression for demo purposes
  useEffect(() => {
    if (!order || order.status === 'delivered' || order.status === 'cancelled') return;

    const currentStageIndex = STATUS_STAGES.findIndex((s) => s.id === order.status);
    if (currentStageIndex === -1 || currentStageIndex === STATUS_STAGES.length - 1) return;

    const interval = setInterval(() => {
      setOrder((prev) => {
        if (!prev) return null;
        const nextStage = STATUS_STAGES[currentStageIndex + 1].id as any;
        const updated = { ...prev, status: nextStage };

        // Save progress locally
        const localHistory = JSON.parse(localStorage.getItem('flavor_haven_orders') || '[]');
        const updatedHistory = localHistory.map((o: Order) => (o.id === prev.id ? updated : o));
        localStorage.setItem('flavor_haven_orders', JSON.stringify(updatedHistory));

        return updated;
      });
    }, 15000); // Progress stage every 15 seconds

    return () => clearInterval(interval);
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-brand-medium border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4">
        <h2 className="text-xl font-bold text-slate-800">Order not found</h2>
        <p className="text-slate-500 text-sm mt-1 mb-6">We couldn't locate order #{params.id}.</p>
        <Link href="/menu" className="px-6 py-2.5 bg-brand-medium text-white font-bold rounded-xl text-sm">
          Return to Menu
        </Link>
      </div>
    );
  }

  const currentStage = STATUS_STAGES.find((s) => s.id === order.status) || STATUS_STAGES[0];
  const stageIndex = STATUS_STAGES.findIndex((s) => s.id === order.status);

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Navbar
        searchQuery=""
        setSearchQuery={() => {}}
        activeCategory="all"
        setActiveCategory={() => {}}
        cartCount={0}
        onCartOpen={() => {}}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Tracker title */}
        <div className="mb-10 text-center">
          <span className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-brand-medium text-xs font-bold uppercase tracking-wider mb-3">
            Live Order Status
          </span>
          <h1 className="text-3xl font-extrabold text-slate-800">Track Your Delicacies</h1>
          <p className="text-slate-500 text-sm mt-1">Order ID: #{order.id.substring(0, 15)}...</p>
        </div>

        {/* Tracking progress bar visual widget */}
        <div className="glass-panel rounded-3xl p-8 border border-emerald-100/50 bg-white/40 shadow-md mb-8">
          <div className="relative mb-8">
            {/* Progress bar line background */}
            <div className="absolute top-5 left-4 right-4 h-1 bg-slate-200 -z-10 rounded" />
            {/* Active progress bar line */}
            <div
              className="absolute top-5 left-4 h-1 bg-brand-medium -z-10 rounded transition-all duration-500"
              style={{ width: `${(stageIndex / (STATUS_STAGES.length - 1)) * 96}%` }}
            />

            {/* Stages nodes */}
            <div className="flex justify-between">
              {STATUS_STAGES.map((stage, idx) => {
                const StageIcon = stage.icon;
                const isPassed = idx <= stageIndex;
                const isCurrent = idx === stageIndex;
                return (
                  <div key={stage.id} className="flex flex-col items-center max-w-[80px]">
                    <div
                      className={`h-11 w-11 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isPassed
                          ? 'bg-brand-medium border-brand-medium text-white shadow-lg shadow-brand-medium/20 scale-105'
                          : 'bg-white border-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-emerald-100 animate-pulse' : ''}`}
                    >
                      <StageIcon className="h-4.5 w-4.5" />
                    </div>
                    <span
                      className={`text-[9px] font-bold text-center mt-3 uppercase tracking-wider leading-tight ${
                        isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🛵</span>
              <div>
                <p className="text-xs text-slate-500 font-medium">Estimated Arrival Time</p>
                <p className="text-sm font-extrabold text-slate-850">
                  {order.status === 'delivered'
                    ? 'Delivered!'
                    : `${20 - stageIndex * 4} Minutes (approx)`}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 font-medium">Current Stage</p>
              <p className="text-sm font-extrabold text-brand-medium uppercase tracking-wider">
                {currentStage.name}
              </p>
            </div>
          </div>
        </div>

        {/* Order specs panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left panel: Info summary */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-brand-medium" />
              <span>Receipt details</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-650">
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-bold text-slate-800">
                  {new Date(order.created_at).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Payment Method:</span>
                <span className="font-bold text-slate-800 uppercase">{order.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span>Notes for Kitchen:</span>
                <span className="font-bold text-slate-800 italic">
                  {order.notes || 'No custom requests'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-3.5 border-t border-slate-100">
                <span>Amount Paid:</span>
                <span className="text-brand-medium">{order.total} Tk</span>
              </div>
            </div>
          </div>

          {/* Right panel: Destination info */}
          <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="h-4.5 w-4.5 text-brand-medium" />
              <span>Delivery Destination</span>
            </h3>

            <div className="space-y-3.5 text-xs text-slate-650">
              <div className="flex gap-2">
                <span className="font-semibold min-w-[70px]">Address:</span>
                <span className="font-bold text-slate-800">{order.address}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[70px]">Phone:</span>
                <span className="font-bold text-slate-800">{order.phone}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[70px]">Recipient:</span>
                <span className="font-bold text-slate-800">{profile?.name || 'Customer Patron'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Home navigation links */}
        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full font-bold text-sm shadow hover:bg-slate-900 transition-all cursor-pointer active:scale-95"
          >
            <span>Explore More Dishes</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
