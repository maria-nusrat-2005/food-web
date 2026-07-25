'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/navbar';
import {
  ShieldAlert,
  RefreshCw,
  BarChart3,
  DollarSign,
  ShoppingBag,
  Calendar,
  Users,
  Key,
  Utensils,
  ClipboardList,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Mail,
  Star,
  Layers,
  Heart
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Order, Food, Category, Profile } from '@/types';
import { supabase } from '@/lib/supabase';

const ORDER_STATUS_OPTIONS = ['received', 'preparing', 'cooking', 'delivery', 'delivered', 'cancelled'];

export default function AdminConsolePage() {
  const router = useRouter();
  const { profile, loading: authLoading, adminViewMode, toggleAdminViewMode } = useAuth();
  const { foods, categories, refreshFoods, refreshCategories, isSupabaseConnected } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'foods' | 'categories' | 'orders' | 'reviews' | 'users' | 'queries'>('overview');

  // Stats Counters
  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [registeredUsersCount, setRegisteredUsersCount] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [queriesCount, setQueriesCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users Directory Tab State
  const [usersList, setUsersList] = useState<Profile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Customer Queries Tab State
  const [queriesList, setQueriesList] = useState<any[]>([]);
  const [loadingQueries, setLoadingQueries] = useState(false);

  // Foods Catalog Tab State
  const [localFoods, setLocalFoods] = useState<Food[]>(foods);
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Food Form States
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [discountPrice, setDiscountPrice] = useState('');
  const [foodCategoryId, setFoodCategoryId] = useState('');
  const [image, setImage] = useState('');
  const [calories, setCalories] = useState('500');
  const [cookTime, setCookTime] = useState('15');
  const [stock, setStock] = useState('50');
  const [featured, setFeatured] = useState(false);
  const [isVeg, setIsVeg] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [spicyLevel, setSpicyLevel] = useState('0');
  const [isSubmittingFood, setIsSubmittingFood] = useState(false);

  // Category Tab State
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('Pizza');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  // Reviews Tab State
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Client-side route guard: Redirect guest to homepage and pop Auth Modal
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/?openAuth=true&redirect=/admin');
    }
  }, [profile, authLoading, router]);

  // Load active tab from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (['overview', 'foods', 'categories', 'orders', 'reviews', 'users', 'queries'].includes(tab || '')) {
        setActiveTab(tab as any);
      }
    }
  }, []);

  // Sync foods when AppContext updates
  useEffect(() => {
    setLocalFoods(foods);
    if (categories.length > 0 && !foodCategoryId) {
      setFoodCategoryId(categories[0].id);
    }
  }, [foods, categories]);

  // Load General Statistics
  const loadStatsData = async () => {
    try {
      setLoadingStats(true);
      
      // Load orders
      const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);

      // Load registered users count
      const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      if (uCount !== null) setRegisteredUsersCount(uCount);

      // Load total reviews count
      const { count: rCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
      if (rCount !== null) setReviewsCount(rCount);

      // Load total support queries count
      const { count: qCount } = await supabase.from('support_queries').select('*', { count: 'exact', head: true });
      if (qCount !== null) setQueriesCount(qCount);

      // Reservations local fallback
      const savedRes = localStorage.getItem('flavor_haven_reservations');
      if (savedRes) setReservations(JSON.parse(savedRes));
    } catch (e) {
      console.error('Error fetching admin overview metrics', e);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadStatsData();
    }
  }, [profile]);

  // Load Users tab
  useEffect(() => {
    if (activeTab === 'users' && profile?.role === 'admin') {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setUsersList(data);
        setLoadingUsers(false);
      };
      fetchUsers();
    }
  }, [activeTab, profile]);

  // Load Queries tab
  useEffect(() => {
    if (activeTab === 'queries' && profile?.role === 'admin') {
      const fetchQueries = async () => {
        setLoadingQueries(true);
        const { data } = await supabase.from('support_queries').select('*').order('created_at', { ascending: false });
        if (data) setQueriesList(data);
        setLoadingQueries(false);
      };
      fetchQueries();
    }
  }, [activeTab, profile]);

  // Load Reviews tab
  useEffect(() => {
    if (activeTab === 'reviews' && profile?.role === 'admin') {
      const fetchReviews = async () => {
        setLoadingReviews(true);
        const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (data) setReviewsList(data);
        setLoadingReviews(false);
      };
      fetchReviews();
    }
  }, [activeTab, profile]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#FFFDF8]">
        <RefreshCw className="h-8 w-8 text-brand-medium animate-spin" />
        <p className="text-xs font-bold text-slate-500 mt-3">Verifying privileges...</p>
      </div>
    );
  }

  // Security gate
  if (profile?.role !== 'admin' || adminViewMode !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center py-20 px-4 bg-[#FFFDF8]">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-3 animate-pulse" />
        <h2 className="text-xl font-bold text-slate-800">Access Denied</h2>
        <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">
          You need active Admin privileges to view this management console. (Viewing Mode: {adminViewMode === 'customer' ? 'Customer View' : 'Guest'})
        </p>
        <Link href="/" className="mt-6 px-5 py-2.5 bg-brand-medium text-white font-bold rounded-xl text-xs cursor-pointer">
          Return Home
        </Link>
      </div>
    );
  }

  // Calculations
  const grossRevenue = orders.reduce((acc, o) => (o.status !== 'cancelled' ? acc + Number(o.total) : acc), 0);
  const activeOrdersCount = orders.filter((o) => ['received', 'preparing', 'cooking', 'delivery'].includes(o.status)).length;
  const pendingReservationsCount = reservations.filter((r) => r.status === 'pending').length;

  // -- ORDER ACTIONS --
  const handleOrderStatusChange = async (orderId: string, nextStatus: any) => {
    try {
      await supabase.from('orders').update({ status: nextStatus }).eq('id', orderId);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)));
    } catch (e) {
      console.error(e);
    }
  };

  // -- CATEGORY ACTIONS --
  const handleOpenCatModal = () => {
    setCatName('');
    setCatIcon('Pizza');
    setCatError(null);
    setCategoryModalOpen(true);
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setIsSubmittingCat(true);
    setCatError(null);

    try {
      const { error: dbError } = await supabase
        .from('categories')
        .insert([{ name: catName.trim().toLowerCase(), icon: catIcon }]);

      if (dbError) throw dbError;
      
      await refreshCategories();
      setCategoryModalOpen(false);
      loadStatsData();
    } catch (err: any) {
      setCatError(err.message || 'Failed to insert category.');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleCatDelete = async (catId: string, name: string) => {
    if (!window.confirm(`Delete the category "${name}"? This unlinksassociated menu items.`)) return;
    try {
      await supabase.from('categories').delete().eq('id', catId);
      await refreshCategories();
      loadStatsData();
    } catch (err) {
      console.error(err);
    }
  };

  // -- FOOD ACTIONS --
  const handleOpenAddFoodModal = () => {
    setEditingFood(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setDiscountPrice('');
    if (categories.length > 0) setFoodCategoryId(categories[0].id);
    setImage('/Image/amirali-mirhashemian-sc5sTPMrVfk-unsplash.jpg');
    setCalories('500');
    setCookTime('15');
    setStock('50');
    setFeatured(false);
    setIsVeg(false);
    setIsVegan(false);
    setIsGlutenFree(false);
    setSpicyLevel('0');
    setFoodModalOpen(true);
  };

  const handleOpenEditFoodModal = (food: Food) => {
    setEditingFood(food);
    setTitle(food.title);
    setDescription(food.description || '');
    setPrice(food.price.toString());
    setDiscountPrice(food.discount_price ? food.discount_price.toString() : '');
    setFoodCategoryId(food.category_id || '');
    setImage(food.image || '');
    setCalories(food.calories.toString());
    setCookTime(food.cook_time.toString());
    setStock(food.stock.toString());
    setFeatured(food.featured);
    setIsVeg(food.is_veg);
    setIsVegan(food.is_vegan);
    setIsGlutenFree(food.is_gluten_free);
    setSpicyLevel(food.spicy_level.toString());
    setFoodModalOpen(true);
  };

  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    setIsSubmittingFood(true);
    const foodData = {
      title,
      description: description || null,
      price: Number(price),
      discount_price: discountPrice ? Number(discountPrice) : null,
      category_id: foodCategoryId || null,
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
      if (editingFood) {
        await supabase.from('foods').update(foodData).eq('id', editingFood.id);
      } else {
        await supabase.from('foods').insert([foodData]);
      }
      await refreshFoods();
      setFoodModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingFood(false);
    }
  };

  const handleFoodDelete = async (foodId: string) => {
    if (!window.confirm('Delete this food item?')) return;
    try {
      await supabase.from('foods').delete().eq('id', foodId);
      await refreshFoods();
    } catch (e) {
      console.error(e);
    }
  };

  // -- REVIEWS ACTIONS --
  const handleOpenReplyModal = (review: any) => {
    setActiveReview(review);
    setReplyText(review.admin_reply || '');
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;
    setIsSubmittingReply(true);

    try {
      await supabase.from('reviews').update({ admin_reply: replyText.trim() || null }).eq('id', activeReview.id);
      setReviewsList((prev) =>
        prev.map((r) => (r.id === activeReview.id ? { ...r, admin_reply: replyText.trim() || null } : r))
      );
      setReplyModalOpen(false);
      loadStatsData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await supabase.from('reviews').delete().eq('id', reviewId);
      setReviewsList((prev) => prev.filter((r) => r.id !== reviewId));
      loadStatsData();
    } catch (err) {
      console.error(err);
    }
  };

  // -- SUPPORT QUERY ACTIONS --
  const handleDeleteQuery = async (queryId: string) => {
    if (!window.confirm('Delete support query?')) return;
    try {
      await supabase.from('support_queries').delete().eq('id', queryId);
      setQueriesList((prev) => prev.filter((q) => q.id !== queryId));
      loadStatsData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-[#FFFDF8]">
      <Navbar searchQuery="" setSearchQuery={() => {}} activeCategory="all" setActiveCategory={() => {}} cartCount={0} onCartOpen={() => {}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Header Banner */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Key className="h-8 w-8 text-brand-medium" />
              <span>Admin Console</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Manage food menus, categories, live orders, customer reviews, and support queries.</p>
          </div>

          <button
            onClick={toggleAdminViewMode}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border-0 shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Switch to Customer View</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar Navigation Tabs */}
          <div className="lg:col-span-1 space-y-2.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer border-0 ${
                activeTab === 'overview'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span>Overview Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('foods')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer border-0 ${
                activeTab === 'foods'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <Utensils className="h-5 w-5" />
              <span>Menu Items ({foods.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer border-0 ${
                activeTab === 'categories'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <Layers className="h-5 w-5" />
              <span>Categories ({categories.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer border-0 relative ${
                activeTab === 'orders'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <ClipboardList className="h-5 w-5" />
              <span>Live Orders Queue</span>
              {activeOrdersCount > 0 && (
                <span className="absolute right-4 top-4.5 px-2 py-0.5 bg-rose-500 text-white font-extrabold text-[9px] rounded-full">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer border-0 ${
                activeTab === 'reviews'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <MessageSquare className="h-5 w-5" />
              <span>Review Moderation ({reviewsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer border-0 ${
                activeTab === 'users'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <Users className="h-5 w-5" />
              <span>User Profiles ({registeredUsersCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('queries')}
              className={`w-full p-4 rounded-2xl text-left text-sm font-bold flex items-center gap-3 transition-all cursor-pointer border-0 relative ${
                activeTab === 'queries'
                  ? 'bg-brand-medium text-white shadow-md shadow-brand-medium/20 scale-[1.02]'
                  : 'bg-white/60 text-slate-700 hover:bg-white border border-emerald-100/25'
              }`}
            >
              <Mail className="h-5 w-5" />
              <span>Support Queries</span>
              {queriesCount > 0 && (
                <span className="absolute right-4 top-4.5 px-2 py-0.5 bg-blue-500 text-white font-extrabold text-[9px] rounded-full">
                  {queriesCount}
                </span>
              )}
            </button>
          </div>

          {/* Right Panel Contents */}
          <div className="lg:col-span-3">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-brand-medium rounded-2xl">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Revenue</p>
                      <p className="text-2xl font-extrabold text-slate-800">{grossRevenue} Tk</p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Orders</p>
                      <p className="text-2xl font-extrabold text-slate-800">{activeOrdersCount} Queue</p>
                    </div>
                  </div>

                  <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Reservations</p>
                      <p className="text-2xl font-extrabold text-slate-800">{pendingReservationsCount} Bookings</p>
                    </div>
                  </div>
                </div>

                {/* Sales Chart Mockup */}
                <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm space-y-6">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <BarChart3 className="h-4.5 w-4.5 text-brand-medium" />
                    <span>Business Income Analytics</span>
                  </h3>
                  <div className="h-[220px] flex items-end justify-between gap-2.5 pt-6 px-4">
                    {[
                      { m: 'Jan', val: 40 },
                      { m: 'Feb', val: 55 },
                      { m: 'Mar', val: 48 },
                      { m: 'Apr', val: 70 },
                      { m: 'May', val: 65 },
                      { m: 'Jun', val: 90 },
                      { m: 'Jul', val: 82 },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                        <span className="text-[9px] font-extrabold text-emerald-800 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.val * 350} Tk
                        </span>
                        <div
                          style={{ height: `${item.val}%` }}
                          className="w-full bg-emerald-100 group-hover:bg-brand-medium rounded-t-xl transition-all duration-300 shadow-sm"
                        />
                        <span className="text-[10px] font-bold text-slate-500">{item.m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Foods Tab */}
            {activeTab === 'foods' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Menu Items Catalog</h3>
                  <button
                    onClick={handleOpenAddFoodModal}
                    className="px-4 py-2.5 bg-brand-medium hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow shadow-brand-medium/10 border-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Menu Item</span>
                  </button>
                </div>

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
                            <td className="py-3 font-bold text-slate-800">{food.title}</td>
                            <td className="py-3 font-bold text-slate-600">{food.price} Tk</td>
                            <td className="py-3 font-semibold">{food.stock} left</td>
                            <td className="py-3 font-semibold">{food.cook_time} mins</td>
                            <td className="py-3 text-right space-x-1">
                              <button
                                onClick={() => handleOpenEditFoodModal(food)}
                                className="p-2 text-slate-600 hover:text-brand-medium hover:bg-slate-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleFoodDelete(food.id)}
                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
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
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">Menu Categories</h3>
                  <button
                    onClick={handleOpenCatModal}
                    className="px-4 py-2.5 bg-brand-medium hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow shadow-brand-medium/10 border-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Category</span>
                  </button>
                </div>

                <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden max-w-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="pb-3">Icon</th>
                        <th className="pb-3">Name</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {categories.map((cat) => (
                        <tr key={cat.id}>
                          <td className="py-4">
                            <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-650 font-bold uppercase tracking-wider text-[9px]">
                              {cat.icon || 'Pizza'}
                            </span>
                          </td>
                          <td className="py-4 font-bold capitalize text-slate-800">{cat.name}</td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleCatDelete(cat.id, cat.name)}
                              className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
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
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800 font-extrabold">Live Order Queue</h3>
                
                <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                          <th className="pb-3">Address</th>
                          <th className="pb-3">Phone</th>
                          <th className="pb-3">Payment</th>
                          <th className="pb-3">Total Amount</th>
                          <th className="pb-3">Order Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="py-4 font-medium max-w-[150px] truncate" title={order.address}>{order.address}</td>
                            <td className="py-4 font-semibold">{order.phone}</td>
                            <td className="py-4 capitalize font-semibold">{order.payment_method}</td>
                            <td className="py-4 font-bold text-slate-800">{order.total} Tk</td>
                            <td className="py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-medium"
                              >
                                {ORDER_STATUS_OPTIONS.map((opt) => (
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
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Review Moderation Panel</h3>

                <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden">
                  {loadingReviews ? (
                    <div className="py-12 flex justify-center"><RefreshCw className="h-8 w-8 animate-spin text-brand-medium" /></div>
                  ) : reviewsList.length === 0 ? (
                    <p className="py-8 text-center text-slate-400 text-xs font-medium">No customer reviews yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3">Author</th>
                            <th className="pb-3">Rating</th>
                            <th className="pb-3">Comment</th>
                            <th className="pb-3">Chef Reply</th>
                            <th className="pb-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {reviewsList.map((rev) => (
                            <tr key={rev.id}>
                              <td className="py-4 font-bold text-slate-800">{rev.client_name}</td>
                              <td className="py-4">
                                <div className="flex text-amber-400">
                                  {Array.from({ length: rev.rating }).map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-current" />
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 max-w-xs truncate" title={rev.comment}>{rev.comment}</td>
                              <td className="py-4 max-w-xs truncate text-emerald-700 font-bold" title={rev.admin_reply || ''}>
                                {rev.admin_reply ? `Chef: ${rev.admin_reply}` : <span className="text-slate-450 italic font-normal">None</span>}
                              </td>
                              <td className="py-4 text-right space-x-1">
                                <button
                                  onClick={() => handleOpenReplyModal(rev)}
                                  className="p-2 text-brand-medium hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all border-0 bg-transparent cursor-pointer"
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleReviewDelete(rev.id)}
                                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border-0 bg-transparent cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">User Profiles Directory</h3>

                <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden">
                  {loadingUsers ? (
                    <div className="py-12 flex justify-center"><RefreshCw className="h-8 w-8 animate-spin text-brand-medium" /></div>
                  ) : usersList.length === 0 ? (
                    <p className="py-8 text-center text-slate-400 text-xs font-medium">No accounts found.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3">Full Name</th>
                            <th className="pb-3">Email Address</th>
                            <th className="pb-3">Role Authority</th>
                            <th className="pb-3">Reward Points</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {usersList.map((u) => (
                            <tr key={u.id}>
                              <td className="py-4 font-bold text-slate-850">{u.name}</td>
                              <td className="py-4 text-slate-600">{u.email}</td>
                              <td className="py-4">
                                <span className={`px-2 py-0.5 rounded-full text-[8.5px] font-extrabold tracking-wide uppercase ${
                                  u.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="py-4 font-bold text-slate-800">{u.reward_points} Pts</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Queries Tab */}
            {activeTab === 'queries' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-800">Support Inquiries Message Log</h3>

                <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden">
                  {loadingQueries ? (
                    <div className="py-12 flex justify-center"><RefreshCw className="h-8 w-8 animate-spin text-brand-medium" /></div>
                  ) : queriesList.length === 0 ? (
                    <p className="py-8 text-center text-slate-400 text-xs font-medium">No message log reports loaded.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                            <th className="pb-3">Date</th>
                            <th className="pb-3 w-[150px]">Customer</th>
                            <th className="pb-3 w-[180px]">Email</th>
                            <th className="pb-3">Message Details</th>
                            <th className="pb-3 text-right w-[80px]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {queriesList.map((q) => (
                            <tr key={q.id}>
                              <td className="py-4 text-slate-400 text-[10px]">
                                {new Date(q.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="py-4 font-bold text-slate-850">{q.name}</td>
                              <td className="py-4 text-slate-600">{q.email}</td>
                              <td className="py-4 text-slate-650 leading-relaxed italic">"{q.message}"</td>
                              <td className="py-4 text-right">
                                <button
                                  onClick={() => handleDeleteQuery(q.id)}
                                  className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all border-0 bg-transparent cursor-pointer animate-in zoom-in-95 duration-200"
                                  title="Delete Query Log"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ADD/EDIT FOOD MODAL OVERLAY --- */}
      {foodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setFoodModalOpen(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setFoodModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-855 mb-4">
              {editingFood ? 'Edit Catalog Item' : 'Add Menu Item'}
            </h3>

            <form onSubmit={handleFoodSubmit} className="space-y-4 text-slate-650 text-xs font-bold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Food Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-medium"
                    placeholder="e.g. Naga Pasta"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Image Link / Path</label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Price (Tk)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Discount Price (Tk)</label>
                  <input
                    type="number"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Category</label>
                  <select
                    value={foodCategoryId}
                    onChange={(e) => setFoodCategoryId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="uppercase tracking-wider">Stock Count</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="uppercase tracking-wider">Description Details</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold resize-none focus:outline-none focus:border-brand-medium"
                />
              </div>

              {/* Checkboxes */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-700">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded text-brand-medium focus:ring-brand-medium"
                  />
                  <span>Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                    className="rounded text-brand-medium focus:ring-brand-medium"
                  />
                  <span>Veg 🍃</span>
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

              <div className="space-y-1 max-w-[150px]">
                <label className="uppercase tracking-wider">Spicy Level</label>
                <select
                  value={spicyLevel}
                  onChange={(e) => setSpicyLevel(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-750 focus:outline-none"
                >
                  <option value="0">0 (Mild)</option>
                  <option value="1">1 (Medium)</option>
                  <option value="2">2 (Spicy 🌶️)</option>
                  <option value="3">3 (Extreme 🌶️🌶️)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmittingFood}
                className="w-full bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer border-0"
              >
                {isSubmittingFood ? 'Saving item details...' : 'Save Menu Item'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD CATEGORY MODAL OVERLAY --- */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setCategoryModalOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCategoryModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4">Add Menu Category</h3>

            {catError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 rounded-xl flex gap-1.5 items-center">
                <AlertCircle className="h-4 w-4" />
                <span>{catError}</span>
              </div>
            )}

            <form onSubmit={handleCatSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-medium"
                  placeholder="e.g. Bangladeshi, Desserts, Pizza"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Lucide Icon Class</label>
                <select
                  value={catIcon}
                  onChange={(e) => setCatIcon(e.target.value)}
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
                disabled={isSubmittingCat}
                className="w-full bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer border-0"
              >
                {isSubmittingCat ? 'Adding Category...' : 'Save Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- REVIEW REPLY MODAL OVERLAY --- */}
      {replyModalOpen && activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setReplyModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setReplyModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer border-0 bg-transparent"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-2">Reply to Review</h3>
            <p className="text-[11px] text-slate-500 mb-4 bg-slate-550 p-2.5 rounded-xl border border-slate-100">
              <strong>{activeReview.client_name}:</strong> "{activeReview.comment}"
            </p>

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Chef Response</label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-medium resize-none"
                  placeholder="Thank you for the wonderful feedback! We look forward to serving you again..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingReply}
                className="w-full bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer border-0"
              >
                {isSubmittingReply ? 'Submitting Reply...' : 'Publish Reply'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
