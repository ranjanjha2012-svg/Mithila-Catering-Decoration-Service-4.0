import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, User, ChevronRight, Sparkles } from 'lucide-react';
import { collection, doc, setDoc, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AuthModal from './AuthModal';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  reviewMessage: string;
  submittedAt: string;
  userId?: string;
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [reviewMessage, setReviewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user && !name) {
        setName(user.displayName || '');
      }
    });
    return () => unsub();
  }, []);

  // Fetch reviews in real-time
  useEffect(() => {
    const path = 'customerReviews';
    const q = query(
      collection(db, path),
      orderBy('submittedAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        items.push({
          id: doc.id,
          customerName: data.customerName || 'Anonymous',
          rating: Number(data.rating) || 5,
          reviewMessage: data.reviewMessage || '',
          submittedAt: data.submittedAt || '',
          userId: data.userId
        });
      });
      setReviews(items);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching customer reviews:', err);
      // Suppress alert, print detailed diagnostics
      handleFirestoreError(err, OperationType.LIST, path);
    });

    return () => unsubscribe();
  }, []);

  // Submit Review Handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !reviewMessage.trim()) {
      setError('Please fill in your name and review message.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess(false);

    const path = 'customerReviews';
    const reviewRef = doc(collection(db, path));
    const submittedAt = new Date().toISOString();

    const payload = {
      customerName: name.trim(),
      rating,
      reviewMessage: reviewMessage.trim(),
      submittedAt,
      userId: currentUser?.uid || ''
    };

    try {
      await setDoc(reviewRef, payload);
      setSuccess(true);
      setReviewMessage('');
      // Reset rating to 5 but keep the name for convenience
      setRating(5);
      
      // Auto dismiss success after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError('Failed to submit, please try again.');
      handleFirestoreError(err, OperationType.WRITE, path);
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render Star icons
  const renderStars = (count: number, isInteractive = false, onSelect?: (r: number) => void) => {
    return (
      <div className="flex gap-1 items-center">
        {[1, 2, 3, 4, 5].map((val) => {
          const filled = val <= count;
          return (
            <Star
              key={val}
              size={isInteractive ? 28 : 16}
              onClick={() => isInteractive && onSelect && onSelect(val)}
              className={`
                ${filled ? 'fill-amber-400 text-amber-400' : 'text-stone-300 dark:text-stone-700'} 
                ${isInteractive ? 'cursor-pointer hover:scale-110 active:scale-95 transition-all' : ''}
              `}
            />
          );
        })}
      </div>
    );
  };

  // Calculate stats to display
  const totalReviewsCount = reviews.length;
  const averageRating = totalReviewsCount > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviewsCount).toFixed(1) 
    : '5.0';

  return (
    <section id="reviews" className="py-20 relative overflow-hidden bg-stone-50 border-t border-b border-stone-200/60">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-orange-600 text-xs font-black uppercase tracking-widest rounded-full border border-orange-100 mb-4">
            <Sparkles size={14} className="text-orange-500 animate-pulse" /> Public Feedback Board
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-rose-950 uppercase tracking-tighter">
            Words From Our Customer Guests
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto font-bold text-xs md:text-sm mt-3">
            Real experiences from grand events, banqueting parties, and our regular Mithila tiffin service subscribers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Side: Submit Reviews Form (PART 4) */}
          <div className="lg:col-span-5 bg-white p-8 md:p-10 rounded-[2.5rem] border border-stone-200/60 shadow-xl space-y-6">
            <div>
              <span 
                className="text-xs font-black bg-orange-50 px-3 py-1 rounded-full uppercase tracking-widest border border-orange-100"
                style={{ color: '#000000' }}
              >
                Rate Our Service
              </span>
              <h3 
                className="text-2xl font-black tracking-tight mt-4" 
                style={{ color: '#000000' }}
              >
                Share Your Culinary Experience
              </h3>
              <p 
                className="text-xs font-bold uppercase mt-1"
                style={{ color: '#000000' }}
              >
                Your review will be instantly visible to others
              </p>
            </div>

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-xs font-bold flex items-center gap-2">
                <span className="bg-green-500 text-white rounded-full p-0.5 text-[8px] font-black">✓</span>
                Your review has been successfully posted. Thank you for your feedback!
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-xs font-bold leading-relaxed">
                ⚠️ {error}
              </div>
            )}

            {!currentUser ? (
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center space-y-4">
                <p 
                  className="text-xs font-extrabold uppercase tracking-wide leading-relaxed"
                  style={{ color: '#000000' }}
                >
                  Please register or sign in to submit a review.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-full bg-orange-100 border border-orange-300 font-extrabold py-3 px-4 rounded-xl hover:bg-orange-200 transition-all uppercase tracking-wider text-xs cursor-pointer"
                  style={{ color: '#000000' }}
                >
                  Login / Register
                </button>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label 
                    className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
                    style={{ color: '#000000' }}
                  >
                    <User size={13} style={{ color: '#000000' }} /> Your Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-stone-850 font-bold placeholder:text-stone-400 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label 
                    className="text-[11px] font-black uppercase tracking-wider block"
                    style={{ color: '#000000' }}
                  >
                    Select Rating
                  </label>
                  <div className="bg-stone-50 px-4 py-3.5 rounded-xl border border-stone-200 flex items-center justify-between">
                    {renderStars(rating, true, setRating)}
                    <span 
                      className="text-xs font-black uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200"
                      style={{ color: '#000000' }}
                    >
                      {rating} Star{rating > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label 
                    className="text-[11px] font-black uppercase tracking-wider flex items-center gap-1"
                    style={{ color: '#000000' }}
                  >
                    <MessageSquare size={13} style={{ color: '#000000' }} /> Review Message
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell others what you loved about our catering service..."
                    value={reviewMessage}
                    onChange={(e) => setReviewMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all text-stone-850 font-bold placeholder:text-stone-400 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-orange-50 hover:bg-orange-100 border border-orange-200 font-extrabold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50 cursor-pointer"
                  style={{ color: '#000000' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                  <Send size={14} style={{ color: '#000000' }} />
                </button>
              </form>
            )}
            
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
          </div>

          {/* Right Side: Public Approved Reviews Feed (PART 6) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Average Rating Banner at Top (PART 5/6 context) */}
            <div className="bg-gradient-to-r from-rose-950 to-orange-950 p-6 md:p-8 rounded-[2rem] border border-orange-900/20 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white/90">Our Average Rating</h3>
                <p className="text-xs text-orange-200/60 font-semibold mt-1">Based on total {totalReviewsCount} submitted customer reviews</p>
              </div>
              <div className="flex items-center gap-3.5 bg-white/10 px-5 py-4 rounded-2xl border border-white/10 shrink-0">
                <div className="text-right">
                  <p className="text-2xl font-black text-amber-400 tracking-tight">{averageRating} / 5</p>
                  <p className="text-[10px] text-stone-200/70 uppercase font-black tracking-widest">Satisfied Guests</p>
                </div>
                <div className="h-8 w-[1px] bg-white/10" />
                {renderStars(Math.round(Number(averageRating)))}
              </div>
            </div>

            {/* Scrollable Feed List */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-stone-200/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto" />
                  <p className="text-stone-405 text-xs font-bold mt-3">Loading authentic guest comments...</p>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[2rem] border border-stone-200/50 p-6">
                  <MessageSquare className="mx-auto text-stone-300 mb-2" size={32} />
                  <p className="text-stone-850 font-black text-sm uppercase tracking-tight">No Reviews Registered Yet</p>
                  <p className="text-xs text-stone-400 font-bold mt-1 max-w-sm mx-auto">Be the very first contributor to write feedback on Mithila Catering!</p>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-stone-200/60 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all space-y-3.5"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-1.5">
                          {rev.customerName}
                          {rev.userId && (
                            <span className="text-[9px] px-2 py-0.5 rounded font-black bg-blue-50 text-blue-700 uppercase">
                              Verified Guest
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                          Submitted on {rev.submittedAt ? new Date(rev.submittedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {renderStars(rev.rating)}
                      </div>
                    </div>
                    <p className="text-stone-650 leading-relaxed text-xs sm:text-sm font-semibold italic text-stone-600">
                      "{rev.reviewMessage}"
                    </p>
                  </div>
                ))
              )}
            </div>
            
          </div>

        </div>
      </div>
    </section>
  );
}
