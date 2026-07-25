'use client';

import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, User, Send, Heart, AlertCircle } from 'lucide-react';
import { Review } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface ReviewSectionProps {
  reviews: Review[];
  onSubmitReview: (name: string, rating: number, comment: string) => Promise<{ success: boolean; isLocalOnly: boolean }>;
}

export default function ReviewSection({ reviews, onSubmitReview }: ReviewSectionProps) {
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msgStatus, setMsgStatus] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  useEffect(() => {
    if (profile?.name && !name) {
      setName(profile.name);
    }
  }, [profile]);

  // Simple like states for reviews
  const [likedReviews, setLikedReviews] = useState<Record<string, boolean>>({});

  const toggleLike = (reviewId: string) => {
    setLikedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      setMsgStatus({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    setIsSubmitting(true);
    setMsgStatus(null);

    try {
      const result = await onSubmitReview(name, rating, comment);
      if (result.success) {
        setName('');
        setRating(5);
        setComment('');
        if (result.isLocalOnly) {
          setMsgStatus({
            type: 'warning',
            text: 'Review saved locally! Connect Supabase credentials in .env.local to persist reviews in the database.',
          });
        } else {
          setMsgStatus({
            type: 'success',
            text: 'Thank you! Your review has been published successfully.',
          });
        }
      } else {
        setMsgStatus({
          type: 'error',
          text: 'Failed to submit review. Please try again.',
        });
      }
    } catch (err) {
      setMsgStatus({
        type: 'error',
        text: 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
      // Auto-hide success or info messages after 5 seconds
      setTimeout(() => {
        setMsgStatus((prev) => (prev?.type !== 'error' ? null : prev));
      }, 5000);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 mt-10">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-extrabold text-slate-800 mb-4 tracking-tight">
          What Our Clients Say
        </h2>
        <p className="text-slate-600">
          Hear from our patrons about their dining experiences, favorite delicacies, and cozy memories at Flavor Haven.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Testimonials List */}
        <div className="lg:col-span-2 space-y-6 max-h-[600px] overflow-y-auto pr-2">
          {reviews.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-bold text-slate-700">No reviews yet</p>
              <p className="text-sm mt-1">Be the first to share your experience!</p>
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="glass-panel rounded-2xl p-6 transition-all duration-300 hover:border-emerald-100/50"
              >
                <div className="flex justify-between items-start gap-4">
                  {/* Client Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-brand-medium overflow-hidden">
                      {rev.avatar_url ? (
                        <img src={rev.avatar_url} alt={rev.client_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{rev.client_name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {rev.created_at
                          ? new Date(rev.created_at).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Recent patron'}
                      </p>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rev.rating
                            ? 'fill-brand-medium text-brand-medium'
                            : 'text-slate-250'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-sm text-slate-650 leading-relaxed mt-4 italic">
                  "{rev.comment}"
                </p>

                {/* Micro interaction - Like button */}
                <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => toggleLike(rev.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      likedReviews[rev.id] ? 'text-rose-500 scale-105' : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${likedReviews[rev.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{likedReviews[rev.id] ? 'Liked!' : 'Like'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Submit Review Form */}
        <div className="lg:col-span-1">
          <div className="glass-panel rounded-3xl p-6 sticky top-28 border border-emerald-100/50 shadow-xl bg-white/40">
            <h3 className="text-xl font-extrabold text-slate-800 mb-1.5">Share Your Experience</h3>
            <p className="text-xs text-slate-500 mb-6">
              Your feedback helps us perfect our menus and hospitality services.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Anvi Rahman"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              {/* Star Rating Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Overall Rating
                </label>
                <div className="flex gap-1.5 items-center">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isLit = hoverRating !== null ? star <= hoverRating : star <= rating;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Star
                          className={`h-7 w-7 transition-all duration-150 transform hover:scale-110 active:scale-95 ${
                            isLit
                              ? 'fill-brand-medium text-brand-medium'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="text-xs font-bold text-slate-500 ml-2">
                    ({rating} / 5)
                  </span>
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Your Review
                </label>
                <textarea
                  placeholder="What did you think of the taste, plating, and ambiance?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl glass-input text-sm resize-none"
                  required
                />
              </div>

              {/* Status Message */}
              {msgStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex gap-2 items-start border ${
                    msgStatus.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                      : msgStatus.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-600'
                      : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                  }`}
                >
                  <AlertCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                  <span>{msgStatus.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-medium hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm shadow-md shadow-brand-medium/5 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Publishing Review...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Publish Review</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
