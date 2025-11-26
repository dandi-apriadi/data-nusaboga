import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon,
  CheckBadgeIcon,
  PhotoIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

const ReviewCard = ({ 
  review, 
  onMarkHelpful, 
  showFullReview = false,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(showFullReview);
  const [helpfulLoading, setHelpfulLoading] = useState(false);
  
  const handleMarkHelpful = async (helpful = true) => {
    setHelpfulLoading(true);
    try {
      await onMarkHelpful(review.review_id, helpful);
    } catch (error) {
      console.error('Error marking review helpful:', error);
    } finally {
      setHelpfulLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const isFilled = index < rating;
      return isFilled ? (
        <StarIcon key={index} className="w-4 h-4 text-amber-500" />
      ) : (
        <StarOutlineIcon key={index} className="w-4 h-4 text-slate-300" />
      );
    });
  };

  const shouldShowExpandButton = review.comment && review.comment.length > 200;
  const displayComment = isExpanded ? review.comment : review.comment?.slice(0, 200);

  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow ${className}`}>
      {/* Header dengan rating dan user info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {review.user_avatar ? (
              <img
                src={review.user_avatar}
                alt={review.user_name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium">
                  {review.user_name?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          {/* User info dan rating */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-slate-900">{review.user_name}</h4>
              {review.verified_purchase && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckBadgeIcon className="w-4 h-4" />
                  <span className="text-xs font-medium">Pembelian Terverifikasi</span>
                </div>
              )}
            </div>
            
            {/* Rating stars */}
            <div className="flex items-center space-x-1 mb-1">
              {renderStars(review.rating)}
              <span className="text-sm text-slate-600 ml-2">
                {formatDate(review.created_at)}
              </span>
            </div>
            
            {/* Review title */}
            {review.title && (
              <h5 className="font-medium text-slate-800 mb-2">{review.title}</h5>
            )}
          </div>
        </div>
      </div>

      {/* Review content */}
      <div className="mb-4">
        <p className="text-slate-700 leading-relaxed">
          {displayComment}
          {shouldShowExpandButton && !isExpanded && '...'}
        </p>
        
        {shouldShowExpandButton && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 flex items-center"
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="w-4 h-4 mr-1" />
                Sembunyikan
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4 mr-1" />
                Baca selengkapnya
              </>
            )}
          </button>
        )}
      </div>

      {/* Review images */}
      {review.images && review.images.length > 0 && (
        <div className="mb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {review.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Review foto ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-slate-200 hover:opacity-90 cursor-pointer transition-opacity"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all flex items-center justify-center">
                  <PhotoIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Admin response */}
      {review.response && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-indigo-600 font-medium text-sm">LN</span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-medium text-slate-900">{review.response.admin_name}</span>
                <span className="text-xs text-slate-500">
                  {formatDate(review.response.created_at)}
                </span>
              </div>
              <p className="text-slate-700 text-sm">{review.response.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => handleMarkHelpful(true)}
            disabled={helpfulLoading}
            className="flex items-center space-x-1 text-slate-600 hover:text-green-600 transition-colors disabled:opacity-50"
          >
            <HandThumbUpIcon className="w-4 h-4" />
            <span className="text-sm">Membantu</span>
          </button>
          
          <button
            onClick={() => handleMarkHelpful(false)}
            disabled={helpfulLoading}
            className="flex items-center space-x-1 text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <HandThumbDownIcon className="w-4 h-4" />
            <span className="text-sm">Tidak membantu</span>
          </button>
        </div>
        
        {review.helpful_count > 0 && (
          <span className="text-sm text-slate-500">
            {review.helpful_count} orang merasa terbantu
          </span>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;