'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/navbar';
import { ShieldAlert, RefreshCw, Plus, Trash2, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';

export default function AdminCategoriesPage() {
  const { profile, loading: authLoading } = useAuth();
  const { categories, isSupabaseConnected, refreshCategories } = useApp();
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Pizza');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Route guard
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/?openAuth=true&redirect=/admin/categories');
    }
  }, [profile, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#f0fdf4]">
        <RefreshCw className="h-8 w-8 text-brand-medium animate-spin" />
        <p className="text-xs font-bold text-slate-500 mt-3">Verifying privileges...</p>
      </div>
    );
  }

  // Security gate
  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4 bg-[#f0fdf4]">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">
          You need Admin privileges to view this management console. (Currently signed in as: {profile?.role || 'Guest'})
        </p>
        <Link href="/" className="mt-6 px-5 py-2.5 bg-brand-medium text-white font-bold rounded-xl text-xs cursor-pointer">
          Return Home
        </Link>
      </div>
    );
  }

  const handleOpenAddModal = () => {
    setName('');
    setIcon('Pizza');
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isSupabaseConnected) {
        const { error: dbError } = await supabase
          .from('categories')
          .insert([{ name: name.trim().toLowerCase(), icon }]);

        if (dbError) throw dbError;
      }
      
      await refreshCategories();
      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to insert category.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catId: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete the category "${catName}"? This will unlink it from any associated menu items.`)) return;
    
    try {
      if (isSupabaseConnected) {
        const { error: dbError } = await supabase
          .from('categories')
          .delete()
          .eq('id', catId);
          
        if (dbError) throw dbError;
      }
      
      await refreshCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to delete category.');
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
              <span>Category Catalog Manager</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Configure filtering groups and categorizations for food menu dishes.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-550 rounded-xl text-xs shadow-sm">
              Back to Overview
            </Link>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-brand-medium hover:bg-emerald-750 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow shadow-brand-medium/10"
            >
              <Plus className="h-4 w-4" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* Database linkage alerts warnings */}
        {!isSupabaseConnected && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl text-xs text-amber-700 flex gap-2 items-start">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <span>
              Database connection missing. Changes will be updated locally on the screen but will not persist in the database. Link your credentials in <code>.env.local</code> to save updates.
            </span>
          </div>
        )}

        {/* Categories items list table */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden max-w-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Icon Type</th>
                  <th className="pb-3">Category Name</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td className="py-4">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-650 font-bold uppercase tracking-wider text-[9px]">
                        {cat.icon || 'Pizza'}
                      </span>
                    </td>
                    <td className="py-4 font-bold capitalize text-slate-800">
                      {cat.name}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                        title="Delete Category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Modal overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Menu Category</h3>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 rounded-xl flex gap-1.5 items-center">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-medium"
                  placeholder="e.g. Bangladeshi, Desserts, Pizza"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lucide Icon Class</label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-medium"
                >
                  <option value="Pizza">Pizza (Default)</option>
                  <option value="Coffee">Coffee (Drinks/Cafe)</option>
                  <option value="Layers">Layers (Bangladeshi/Sides)</option>
                  <option value="Utensils">Utensils (Appetizers)</option>
                  <option value="Wine">Wine (Beverages)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer border-0"
              >
                {isSubmitting ? 'Adding Category...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
