'use client';

import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Coffee, Wine, Pizza, Layers } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  cartCount: number;
  onCartOpen: () => void;
}

const CATEGORIES = [
  { id: 'all', name: 'All Menu', icon: Layers },
  { id: 'burger', name: 'Burgers 🍔', icon: Pizza },
  { id: 'drinks', name: 'Drinks 🍹', icon: Wine },
  { id: 'coffee', name: 'Coffee 🍵', icon: Coffee },
];

export default function Navbar({
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  cartCount,
  onCartOpen,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-emerald-100/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand Name */}
          <div className="flex items-center">
            <span className="text-3xl mr-2 animate-bounce">🥘</span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-brand-dark via-brand-medium to-emerald-700 bg-clip-text text-transparent drop-shadow-sm">
              Flavor Haven
            </span>
          </div>

          {/* Desktop Search & Filters */}
          <div className="hidden md:flex items-center space-x-6 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search delicious food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full glass-input text-sm placeholder-slate-400 focus:ring-2 focus:ring-brand-medium/30"
              />
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            </div>
          </div>

          {/* Right Side Options (Cart & Mobile menu trigger) */}
          <div className="flex items-center space-x-4">
            {/* Cart Button */}
            <button
              onClick={onCartOpen}
              className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200/80 border border-emerald-100/50 transition-all group active:scale-95 cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="h-6 w-6 text-slate-700 group-hover:text-brand-medium transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-pink text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg md:hidden hover:bg-slate-100 text-slate-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Category Selector */}
        <div className="hidden md:flex items-center justify-center space-x-2 pb-4 border-t border-emerald-100/20 pt-4">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-medium text-white shadow-lg shadow-brand-medium/20 scale-105'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200 border border-emerald-100/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-emerald-100/40 px-4 pt-4 pb-6 space-y-4 animate-in slide-in-from-top duration-200">
          {/* Search in mobile */}
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search delicious food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm placeholder-slate-400"
            />
            <Search className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-400" />
          </div>

          {/* Categories in mobile */}
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
        </div>
      )}
    </nav>
  );
}
