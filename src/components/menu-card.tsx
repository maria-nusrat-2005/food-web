'use client';

import React, { useState } from 'react';
import { Star, Plus, Check, Info } from 'lucide-react';
import { MenuItem } from '@/types';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const [added, setAdded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleAddToCart = () => {
    onAddToCart(item);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl overflow-hidden flex flex-col h-full relative group">
      {/* Product Image / Dynamic Placeholder */}
      <div className="relative aspect-video w-full overflow-hidden bg-emerald-950/5 flex items-stretch">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-brand-medium/25 to-emerald-500/10 flex flex-col items-center justify-center relative select-none flex-1">
            <span className="text-[9px] font-black tracking-widest text-brand-medium/35 uppercase mb-1.5">Flavor Haven</span>
            <div className="h-9 w-9 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100/30 shadow-sm text-brand-medium mb-0.5">
              {item.category?.toLowerCase() === 'drinks' || item.category?.toLowerCase() === 'coffee' ? (
                <span className="text-lg">☕</span>
              ) : item.category?.toLowerCase() === 'dessert' ? (
                <span className="text-lg">🍰</span>
              ) : (
                <span className="text-lg">🥘</span>
              )}
            </div>
            <div className="text-2xl font-black text-slate-800/10 tracking-widest uppercase font-mono">
              {item.name ? item.name.substring(0, 2) : 'FH'}
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md border border-emerald-100/50 flex items-center gap-1 z-10">
          <Star className="h-3.5 w-3.5 fill-brand-medium text-brand-medium" />
          <span className="text-xs font-bold text-slate-800">{item.rating}</span>
        </div>
        <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-brand-pink text-xs font-bold text-white uppercase tracking-wider shadow-md z-10">
          {item.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-brand-medium transition-colors">
            {item.name}
          </h3>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-grow">
          {item.description || 'Delicately prepared using the finest fresh ingredients and crafted with passion.'}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Price</p>
            <p className="text-xl font-extrabold text-brand-medium">
              {item.price} <span className="text-sm font-semibold text-slate-500">Tk</span>
            </p>
          </div>

          <div className="flex gap-2">
            {/* Info Trigger */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-emerald-100/50 text-slate-600 transition-all cursor-pointer"
              title="See details"
            >
              <Info className="h-4.5 w-4.5" />
            </button>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer ${
                added
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-slate-800 text-white hover:bg-brand-medium shadow-md shadow-black/10'
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4 stroke-[3]" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Info Drawer/Overlay */}
      {showDetails && (
        <div className="absolute inset-0 bg-white/95 backdrop-blur-md p-6 flex flex-col justify-between z-10 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <h4 className="text-lg font-extrabold text-brand-dark mb-1">{item.name}</h4>
            <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-brand-medium rounded-md mb-4 uppercase">
              Category: {item.category}
            </span>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              {item.description || 'No description available.'}
            </p>
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Preparation Time:</span>
                <span className="text-slate-700 font-medium">15-20 mins</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Serving Size:</span>
                <span className="text-slate-700 font-medium">Standard Portion</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Ingredients:</span>
                <span className="text-slate-700 font-medium">Fresh & Premium Sourced</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowDetails(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-emerald-100/50 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                handleAddToCart();
                setShowDetails(false);
              }}
              className="px-4 py-2 bg-brand-medium text-white rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
            >
              Add to Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
