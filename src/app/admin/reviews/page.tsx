'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/navbar';
import { ShieldAlert, RefreshCw, Trash2, MessageSquare, X, AlertCircle, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Review } from '@/types';

export default function AdminReviewsPage() {
  const { profile, loading: authLoading } = useAuth();
  const { foods, isSupabaseConnected } = useApp();
  const router = useRouter();

  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Route guard
  useEffect(() => {
    if (!authLoading && !profile) {
      router.push('/?openAuth=true&redirect=/admin/reviews');
    }
  }, [profile, authLoading, router]);

  // Load reviews
  async function loadReviews() {
    try {
      setLoading(true);
      if (isSupabaseConnected) {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          setReviews(data);
        }
      } else {
        const local = JSON.parse(localStorage.getItem('flavor_haven_reviews') || '[]');
        setReviews(local);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (profile?.role === 'admin') {
      loadReviews();
    }
  }, [profile]);

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

  const handleOpenReplyModal = (review: any) => {
    setActiveReview(review);
    setReplyText(review.admin_reply || '');
    setReplyModalOpen(true);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReview) return;

    setIsSubmitting(true);

    try {
      if (isSupabaseConnected) {
        const { error } = await supabase
          .from('reviews')
          .update({ admin_reply: replyText.trim() || null })
          .eq('id', activeReview.id);

        if (error) throw error;
      }

      // Sync state and localStorage
      setReviews((prev) =>
        prev.map((r) => (r.id === activeReview.id ? { ...r, admin_reply: replyText.trim() || null } : r))
      );

      // Local storage sync
      const local = JSON.parse(localStorage.getItem('flavor_haven_reviews') || '[]');
      const updatedLocal = local.map((r: any) =>
        r.id === activeReview.id ? { ...r, admin_reply: replyText.trim() || null } : r
      );
      localStorage.setItem('flavor_haven_reviews', JSON.stringify(updatedLocal));

      setReplyModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to submit reply.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      if (isSupabaseConnected) {
        const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
        if (error) throw error;
      }

      // Sync state
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));

      // Local storage sync
      const local = JSON.parse(localStorage.getItem('flavor_haven_reviews') || '[]');
      const updatedLocal = local.filter((r: any) => r.id !== reviewId);
      localStorage.setItem('flavor_haven_reviews', JSON.stringify(updatedLocal));
    } catch (err) {
      console.error(err);
      alert('Failed to delete review.');
    }
  };

  const getFoodTitle = (foodId: string | null) => {
    if (!foodId) return 'General Testimonial';
    const food = foods.find((f) => f.id === foodId);
    return food ? food.title : 'Deleted Menu Item';
  };

  return (
    <div className="min-h-screen flex flex-col pb-16 bg-[#f0fdf4]">
      <Navbar searchQuery="" setSearchQuery={() => {}} activeCategory="all" setActiveCategory={() => {}} cartCount={0} onCartOpen={() => {}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span>Review Moderation Panel</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Review feedback, delete inappropriate postings, or publish Chef responses.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin" className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 rounded-xl text-xs shadow-sm">
              Back to Overview
            </Link>
          </div>
        </div>

        {/* Reviews list table */}
        <div className="glass-panel rounded-3xl p-6 border border-emerald-100/50 bg-white/40 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 border-4 border-brand-medium border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-bold text-slate-500">Loading reviews database...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No customer reviews found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 w-[150px]">Author</th>
                    <th className="pb-3 w-[100px]">Rating</th>
                    <th className="pb-3 w-[150px]">Food Reference</th>
                    <th className="pb-3">Comment</th>
                    <th className="pb-3">Chef Reply</th>
                    <th className="pb-3 text-right w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reviews.map((rev) => (
                    <tr key={rev.id}>
                      <td className="py-4 font-bold text-slate-800">
                        {rev.client_name}
                      </td>
                      <td className="py-4">
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                      </td>
                      <td className="py-4 font-bold text-slate-500 capitalize">
                        {getFoodTitle(rev.food_id)}
                      </td>
                      <td className="py-4 max-w-xs truncate" title={rev.comment}>
                        {rev.comment}
                      </td>
                      <td className="py-4 max-w-xs truncate text-emerald-700 font-bold" title={rev.admin_reply || ''}>
                        {rev.admin_reply ? `Chef: ${rev.admin_reply}` : <span className="text-slate-400 font-normal italic">None</span>}
                      </td>
                      <td className="py-4 text-right space-x-1">
                        <button
                          onClick={() => handleOpenReplyModal(rev)}
                          className="p-2 text-brand-medium hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                          title="Reply to Review"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer border-0 bg-transparent"
                          title="Delete Review"
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

      {/* Reply Modal overlay */}
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
            <p className="text-[11px] text-slate-500 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
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
                disabled={isSubmitting}
                className="w-full bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl text-xs transition-colors cursor-pointer border-0"
              >
                {isSubmitting ? 'Submitting Reply...' : 'Publish Reply'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
