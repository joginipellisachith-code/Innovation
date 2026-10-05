import React, { useState } from 'react';
import { useMess } from '../../context/MessContext';
import { Star, X, Check, AlertTriangle, Heart } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { submitFeedback, selectedMealId, mealSessions } = useMess();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const currentMeal = mealSessions.find((m) => m.id === selectedMealId) || mealSessions[1];

  const quickTags = [
    'Delicious & Fresh 😋',
    'Perfect Spices 🌶️',
    'Soft Hot Rotis 🫓',
    'Tender Paneer 🧀',
    'Food was cold ❄️',
    'Too Salty 🧂',
    'Slow Refill ⏳',
    'Gulab Jamun was 🔥',
  ];

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitFeedback(rating, selectedTags, comment);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      // Reset form
      setRating(5);
      setSelectedTags([]);
      setComment('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-10 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3 shadow-xs">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Thanks for your review!</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              {rating < 3
                ? 'Your feedback has alerted the Kitchen Chef to look into counter quality.'
                : 'Your feedback helps the hostel mess chef keep the food delicious!'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wide">Meal Feedback</span>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">{currentMeal.title}</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                How was the taste, temperature, and service?
              </p>
            </div>

            {/* Star Rating Controls */}
            <div className="my-5 flex flex-col items-center">
              <div className="flex items-center gap-1.5 p-2 bg-amber-50/60 rounded-2xl border border-amber-100">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1.5 hover:scale-115 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-bold mt-2.5 text-slate-700">
                {rating === 5 && '🌟 Loved it! Super tasty'}
                {rating === 4 && '👍 Good quality meal'}
                {rating === 3 && '😐 Average / Decent'}
                {rating === 2 && '👎 Needs improvement'}
                {rating === 1 && '⚠️ Bad / Cold food'}
              </span>

              {rating < 3 && (
                <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Submitting &lt;3★ will notify the mess kitchen to fix temperature.</span>
                </div>
              )}
            </div>

            {/* Quick Feedback Tags */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                What stood out? (Tap tags)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1 rounded-full border transition-all ${
                        isSelected
                          ? 'bg-amber-100 border-amber-400 text-amber-900 font-semibold shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Input */}
            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Any suggestions for the Chef? (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="e.g. Counter 2 ran out of hot dal tadka, rotis were soft..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all shadow-sm shadow-amber-500/20 active:scale-95"
              >
                Send Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
