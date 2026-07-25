'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/navbar';
import { ShieldAlert, RefreshCw, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Food } from '@/types';
import { supabase } from '@/lib/supabase';

export default function AdminFoodsPage() {
  const { profile, loading: authLoading } = useAuth();
  const { foods, categories, isSupabaseConnected, refreshFoods } = useApp();
  const router = useRouter();

  // Route guard: Redirect guest to homepage and pop Auth Modal
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/?openAuth=true&redirect=/admin/foods');
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

  const [localFoods, setLocalFoods] = useState<Food[]>(foods);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [categoryId, setCategoryId] = useState('1');
  const [image, setImage] = useState('');
  const [calories, setCalories] = useState('500');
  const [cookTime, setCookTime] = useState('15');
  const [stock, setStock] = useState('50');
  const [featured, setFeatured] = useState(false);
  const [isVeg, setIsVeg] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [spicyLevel, setSpicyLevel] = useState('0');

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const openAddModal = () => {
    setEditingFood(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    setCategoryId('1');
    setImage('/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg');
    setCalories('500');
    setCookTime('15');
    setStock('50');
    setFeatured(false);
    setIsVeg(false);
    setIsVegan(false);
    setIsGlutenFree(false);
    setSpicyLevel('0');
    setModalOpen(true);
  };

  const openEditModal = (food: Food) => {
    setEditingFood(food);
    setTitle(food.title);
    setDescription(food.description || '');
    setPrice(food.price.toString());
    setDiscountPrice(food.discount_price ? food.discount_price.toString() : '');
    setCategoryId(food.category_id || '1');
    setImage(food.image || '');
    setCalories(food.calories.toString());
    setCookTime(food.cook_time.toString());
    setStock(food.stock.toString());
    setFeatured(food.featured);
    setIsVeg(food.is_veg);
    setIsVegan(food.is_vegan);
    setIsGlutenFree(food.is_gluten_free);
    setSpicyLevel(food.spicy_level.toString());
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    setIsSubmitting(true);

    const foodData = {
      title,
      description: description || null,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : null,
      category_id: categoryId === '1' ? 'c1000000-0000-0000-0000-000000000001' : categoryId === '2' ? 'c1000000-0000-0000-0000-000000000002' : 'c1000000-0000-0000-0000-000000000003',
      image: image || null,
      calories: Number(calories),
      cook_time: Number(cookTime),
      stock: Number(stock),
      featured,
      is_veg: isVeg,
      is_vegan: isVegan,
      is_gluten_free: isGlutenFree,
      spicy_level: Number(spicyLevel),
      rating: editingFood ? editingFood.rating : 5.0,
    };

    try {
      if (isSupabaseConnected && editingFood) {
        // Edit in DB
        await supabase.from('foods').update(foodData).eq('id', editingFood.id);
      } else if (isSupabaseConnected && !editingFood) {
        // Add to DB
        await supabase.from('foods').insert([foodData]);
      }

      // Refresh global app foods memory catalog
      await refreshFoods();

      // Sync local state
      if (editingFood) {
        setLocalFoods((prev) =>
          prev.map((f) => (f.id === editingFood.id ? { ...f, ...foodData } : f))
        );
      } else {
        const newFood: Food = {
          id: `food-${Date.now()}`,
          ...foodData,
        };
        setLocalFoods((prev) => [newFood, ...prev]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
      setModalOpen(false);
    }
  };

  const handleDelete = async (foodId: string) => {
    if (!window.confirm('Are you sure you want to delete this food item?')) return;
    try {
      if (isSupabaseConnected) {
        await supabase.from('foods').delete().eq('id', foodId);
        await refreshFoods();
      }
      setLocalFoods((prev) => prev.filter((f) => f.id !== foodId));
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
              <span>Menu Catalog Manager</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Add, edit, or remove dishes from the Flavor Haven menus.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-xs shadow-sm">
              Back to Overview
            </Link>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-brand-medium hover:bg-emerald-750 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow shadow-brand-medium/10"
            >
              <Plus className="h-4 w-4" />
              <span>Add Menu Item</span>
            </button>
          </div>
        </div>

        {/* Database linkages alerts warnings */}
        {!isSupabaseConnected && (
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-3xl text-xs text-amber-700 flex gap-2 items-start">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <span>
              Database connection missing. Changes will be updated locally on the screen but will not persist in the database. Link your credentials in <code>.env.local</code> to save updates.
            </span>
          </div>
        )}

        {/* Foods items list table */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Photo</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Prep Time</th>
                  <th className="pb-3">Diet Category</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {localFoods.map((food) => (
                  <tr key={food.id}>
                    <td className="py-3">
                      <img
                        src={food.image || '/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg'}
                        alt={food.title}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-200"
                      />
                    </td>
                    <td className="py-3 font-bold text-slate-800">
                      <div>
                        <p>{food.title}</p>
                        {food.featured && (
                          <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold uppercase px-1.5 py-0.5 rounded tracking-wide mt-1 inline-block">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 font-semibold text-brand-medium">
                      {food.discount_price !== null ? (
                        <div>
                          <span>{food.discount_price} Tk</span>
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">{food.price} Tk</span>
                        </div>
                      ) : (
                        <span>{food.price} Tk</span>
                      )}
                    </td>
                    <td className="py-3 font-medium">{food.stock} portions</td>
                    <td className="py-3 font-medium">{food.cook_time} mins</td>
                    <td className="py-3 space-x-1">
                      {food.is_veg && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">Veg</span>}
                      {food.is_vegan && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">Vegan</span>}
                      {food.is_gluten_free && <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold">GF</span>}
                      {food.spicy_level > 0 && <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[9px] font-bold">Spicy</span>}
                    </td>
                    <td className="py-3 text-right space-x-1.5">
                      <button
                        onClick={() => openEditModal(food)}
                        className="p-2 bg-slate-100 text-slate-650 hover:bg-slate-200 rounded-xl cursor-pointer"
                        title="Edit Food"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(food.id)}
                        className="p-2 bg-rose-50 text-rose-500 hover:bg-rose-100 rounded-xl cursor-pointer"
                        title="Delete Food"
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

      {/* Edit/Add Food Modal overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative glass-panel bg-white border border-emerald-100/50 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-5">
              <h3 className="text-lg font-bold text-slate-800">
                {editingFood ? `Edit Details: ${editingFood.title}` : 'Add New Menu Item'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-450 hover:text-slate-700 p-1.5 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-650">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Food Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-medium"
                    placeholder="e.g. Garlic Bread"
                    required
                  />
                </div>

                {/* Category select */}
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-medium/20"
                  >
                    <option value="1">Burgers</option>
                    <option value="2">Drinks</option>
                    <option value="3">Coffee</option>
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Base Price (Tk) *</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-medium"
                    placeholder="e.g. 250"
                    required
                  />
                </div>

                {/* Discount price */}
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Discount Price (Optional)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-medium"
                    placeholder="e.g. 200"
                  />
                </div>

                {/* Image */}
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Image Asset Path</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-medium"
                    placeholder="/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg"
                  />
                </div>

                {/* Calories */}
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Calories (kcal)</label>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-medium"
                  />
                </div>

                {/* Prep time */}
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Preparation Cook Time (mins)</label>
                  <input
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-medium"
                  />
                </div>

                {/* Stock portions */}
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Inventory Portions Available</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-xs font-medium"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 col-span-2">
                <label className="uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl glass-input text-xs resize-none font-medium"
                  placeholder="Enter details of ingredients, preparation quality..."
                />
              </div>

              {/* Checkbox settings */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-brand-medium focus:ring-brand-medium"
                  />
                  <span>Featured Dish</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="rounded text-brand-medium focus:ring-brand-medium"
                  />
                  <span>Vegetarian 🍃</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVegan}
                    onChange={(e) => setIsVegan(e.target.checked)}
                    className="rounded text-brand-medium focus:ring-brand-medium"
                  />
                  <span>Vegan 🌱</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isGlutenFree}
                    onChange={(e) => setIsGlutenFree(e.target.checked)}
                    className="rounded text-brand-medium focus:ring-brand-medium"
                  />
                  <span>Gluten Free 🌾</span>
                </label>
              </div>

              {/* Spicy level select */}
              <div className="space-y-1 max-w-[150px]">
                <label className="uppercase tracking-wider">Spice Intensity</label>
                <select
                  value={spicyLevel}
                  onChange={(e) => setSpicyLevel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                >
                  <option value="0">0 (Mild)</option>
                  <option value="1">1 (Mildly Spicy)</option>
                  <option value="2">2 (Spicy 🌶️)</option>
                  <option value="3">3 (Extreme Naga 🌶️🌶️)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Saving item details...' : 'Save Menu Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
