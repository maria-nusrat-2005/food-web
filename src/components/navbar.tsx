'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Coffee, Wine, Pizza, Layers, Bell } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  cartCount: number;
  onCartOpen: () => void;
  hideCategories?: boolean;
}

const CATEGORIES = [
  { id: 'all', name: 'All Menu', icon: Layers },
  { id: 'appetizer', name: 'Appetizers', icon: Pizza },
  { id: 'main', name: 'Main Courses', icon: Pizza },
  { id: 'bangladeshi', name: 'Bangladeshi', icon: Layers },
  { id: 'fastfood', name: 'Fast Food', icon: Pizza },
  { id: 'seafood', name: 'Seafood', icon: Pizza },
  { id: 'dessert', name: 'Desserts', icon: Coffee },
  { id: 'drinks', name: 'Drinks', icon: Wine },
];

export default function Navbar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  cartCount,
  onCartOpen,
  hideCategories = false,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, markNotificationsAsRead } = useApp();

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const handleOpenNotif = () => {
    setNotifOpen(!notifOpen);
    if (!notifOpen && unreadNotifCount > 0) {
      markNotificationsAsRead();
    }
  };

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-100/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <div className="flex items-center">
            <span className="text-3xl mr-2 animate-bounce">🥘</span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-dark via-brand-medium to-emerald-700 bg-clip-text text-transparent drop-shadow-sm mr-8">
              Flavor Haven
            </span>

            {/* Desktop Site Routes */}
            <div className="hidden lg:flex items-center space-x-6">
              <Link href="/" className="text-sm font-bold text-slate-700 hover:text-brand-medium transition-all">Home</Link>
              <Link href="/menu" className="text-sm font-bold text-slate-700 hover:text-brand-medium transition-all">Menu</Link>
              <Link href="/about" className="text-sm font-bold text-slate-700 hover:text-brand-medium transition-all">Bookings</Link>
              <Link href="/contact" className="text-sm font-bold text-slate-700 hover:text-brand-medium transition-all">Support</Link>
              <Link href="/dashboard" className="text-sm font-bold text-slate-700 hover:text-brand-medium transition-all">Dashboard</Link>
            </div>
          </div>

          {/* Desktop Search input field */}
          {!hideCategories && (
            <div className="hidden md:flex items-center space-x-6 flex-1 max-w-xs mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full glass-input text-xs placeholder-slate-400 focus:ring-2 focus:ring-brand-medium/30"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-455" />
              </div>
            </div>
          )}

          {/* Right Side Options (Bell, Cart & Mobile trigger) */}
          <div className="flex items-center space-x-3">
            {/* Notifications Toggler */}
            <div className="relative">
              <button
                onClick={handleOpenNotif}
                className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-emerald-100/50 transition-all group cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-5 w-5 text-slate-700 group-hover:text-brand-medium transition-colors" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-pink text-[9px] font-extrabold text-white ring-2 ring-white">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Notifications list overlay */}
              {notifOpen && (
                <div className="absolute right-0 mt-3 w-72 glass-panel bg-white border border-emerald-100/50 rounded-2xl p-4 shadow-xl z-50 max-h-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-150">
                  <h4 className="font-extrabold text-slate-800 text-xs border-b border-slate-100 pb-2 mb-3">Notifications</h4>
                  {notifications.length === 0 ? (
                    <p className="text-[10px] text-slate-400 py-4 text-center">No new notifications.</p>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="text-[10px] leading-relaxed border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                          <p className="font-extrabold text-slate-750">{n.title}</p>
                          <p className="text-slate-500 font-medium mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Cart Button */}
            <button
              onClick={onCartOpen}
              className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 border border-emerald-100/50 transition-all group active:scale-95 cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="h-5 w-5 text-slate-700 group-hover:text-brand-medium transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-pink text-[9px] font-bold text-white ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg lg:hidden hover:bg-slate-100 text-slate-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Category Selector - Only shown on Menu page */}
        {!hideCategories && (
          <div className="hidden md:flex items-center justify-center space-x-2 pb-4 border-t border-emerald-100/20 pt-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-brand-medium text-white shadow shadow-brand-medium/20 scale-105'
                      : 'bg-slate-100/80 text-slate-650 hover:bg-slate-200 border border-emerald-100/30'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-panel border-t border-emerald-100/40 px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Site Pages Links */}
          <div className="flex flex-col gap-2 border-b border-slate-100 pb-3">
            <Link href="/" className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl">Home</Link>
            <Link href="/menu" className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl">Menu</Link>
            <Link href="/about" className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl">Bookings</Link>
            <Link href="/contact" className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl">Support</Link>
            <Link href="/dashboard" className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl">Dashboard</Link>
          </div>

          {/* Search in mobile */}
          {!hideCategories && (
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search delicious food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-xs placeholder-slate-400"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            </div>
          )}

          {/* Categories in mobile */}
          {!hideCategories && (
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive ? 'bg-brand-medium text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
