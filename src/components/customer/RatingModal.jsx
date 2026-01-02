import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import StarRating from './StarRating';
import toast from 'react-hot-toast';

const RatingModal = ({ isOpen, onClose, menuItem, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment.trim() || null });
      toast.success('Rating submitted successfully!');
      onClose();
      // Reset form
      setRating(0);
      setComment('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-linear-to-br from-zinc-900 to-black border border-amber-500/20 rounded-2xl w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-amber-500/10">
          <div>
            <h3 className="text-xl font-bold text-white">Rate this item</h3>
            <p className="text-sm text-zinc-400 mt-1">{menuItem?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <X size={20} className="text-zinc-400" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Your Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-4">
              <StarRating rating={rating} onRatingChange={setRating} size={32} />
              {rating > 0 && (
                <span className="text-amber-400 font-semibold">{rating}/5</span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Review (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 bg-black/40 border border-amber-500/20 rounded-xl text-white 
                       placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none"
            />
            <p className="text-xs text-zinc-500 mt-1">{comment.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-zinc-700 text-zinc-300 
                       hover:bg-white/5 transition-colors font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 
                       text-black font-bold hover:from-amber-400 hover:to-yellow-500 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
