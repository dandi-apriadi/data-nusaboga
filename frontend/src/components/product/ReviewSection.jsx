import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StarIcon } from '@heroicons/react/24/solid';
import { 
  FunnelIcon, 
  PlusIcon,
  ChatBubbleLeftRightIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import ReviewStats from './ReviewStats';
import ReviewQuestions from './ReviewQuestions';
import { 
  fetchProductReviews, 
  submitReview, 
  markReviewHelpful,
  setCurrentSort,
  setRatingFilter,
  setCurrentPage,
  toggleReviewForm,
  clearErrors
} from '../../store/slices/reviewSlice';

const ReviewSection = ({ productId, productName }) => {
  const dispatch = useDispatch();
  const {
    reviews,
    reviewStats,
    currentPage,
    totalPages,
    currentSort,
    currentRatingFilter,
    loading,
    submitting,
    error,
    submitError,
    showReviewForm
  } = useSelector(state => state.reviews);

  const [showFilters, setShowFilters] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  useEffect(() => {
    dispatch(fetchProductReviews({ 
      productId, 
      page: currentPage, 
      sort: currentSort,
      rating: currentRatingFilter 
    }));
  }, [dispatch, productId, currentPage, currentSort, currentRatingFilter]);

  const handleSubmitReview = async (reviewData) => {
    const result = await dispatch(submitReview(reviewData));
    if (result.type === 'reviews/submitReview/fulfilled') {
      // Refresh reviews after successful submission
      dispatch(fetchProductReviews({ productId, page: 1 }));
    }
  };

  const handleMarkHelpful = async (reviewId, helpful) => {
    await dispatch(markReviewHelpful({ reviewId, helpful }));
  };

  const handleSortChange = (sort) => {
    dispatch(setCurrentSort(sort));
    dispatch(setCurrentPage(1));
  };

  const handleRatingFilter = (rating) => {
    dispatch(setRatingFilter(rating === currentRatingFilter ? null : rating));
    dispatch(setCurrentPage(1));
  };

  const handlePageChange = (page) => {
    dispatch(setCurrentPage(page));
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPages = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(totalPages, startPage + maxPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
            i === currentPage
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Sebelumnya
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Selanjutnya
        </button>
      </div>
    );
  };

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'highest', label: 'Rating Tertinggi' },
    { value: 'lowest', label: 'Rating Terendah' },
    { value: 'helpful', label: 'Paling Membantu' }
  ];

  const ratingFilters = [5, 4, 3, 2, 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">
          Review Produk
          {reviewStats && (
            <span className="text-lg font-normal text-slate-600 ml-2">
              ({reviewStats.total_reviews} review)
            </span>
          )}
        </h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="w-5 h-5" />
            <span>Tanya Jawab</span>
          </button>
          
          <button
            onClick={() => dispatch(toggleReviewForm())}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Tulis Review</span>
          </button>
        </div>
      </div>

      {/* Review Stats */}
      {reviewStats && <ReviewStats stats={reviewStats} />}

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          productId={productId}
          onSubmit={handleSubmitReview}
          onClose={() => dispatch(toggleReviewForm())}
          loading={submitting}
          error={submitError}
        />
      )}

      {/* Questions Section */}
      {showQuestions && (
        <ReviewQuestions productId={productId} productName={productName} />
      )}

      {/* Filters and Sort */}
      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <AdjustmentsHorizontalIcon className="w-5 h-5" />
            <span>Filter & Urutkan</span>
          </button>
          
          <div className="flex items-center space-x-4">
            {/* Quick rating filters */}
            <div className="flex items-center space-x-2">
              {ratingFilters.map(rating => (
                <button
                  key={rating}
                  onClick={() => handleRatingFilter(rating)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    currentRatingFilter === rating
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <StarIcon className="w-4 h-4" />
                  <span>{rating}</span>
                </button>
              ))}
            </div>
            
            {/* Sort dropdown */}
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Extended filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter Rating
                </label>
                <div className="space-y-2">
                  {ratingFilters.map(rating => (
                    <label key={rating} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={currentRatingFilter === rating}
                        onChange={() => handleRatingFilter(rating)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="flex items-center ml-2">
                        {Array.from({ length: rating }, (_, i) => (
                          <StarIcon key={i} className="w-4 h-4 text-amber-500" />
                        ))}
                        <span className="text-sm text-slate-600 ml-1">& ke atas</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Jenis Review
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-600 ml-2">Dengan foto</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-600 ml-2">Pembelian terverifikasi</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Waktu Review
                </label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option value="">Semua waktu</option>
                  <option value="7">7 hari terakhir</option>
                  <option value="30">30 hari terakhir</option>
                  <option value="90">3 bulan terakhir</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active filters display */}
      {(currentRatingFilter || currentSort !== 'newest') && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-600">Filter aktif:</span>
          {currentRatingFilter && (
            <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm">
              <StarIcon className="w-4 h-4" />
              <span>{currentRatingFilter} bintang</span>
              <button
                onClick={() => dispatch(setRatingFilter(null))}
                className="ml-1 text-amber-600 hover:text-amber-800"
              >
                ×
              </button>
            </span>
          )}
          {currentSort !== 'newest' && (
            <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-sm">
              {sortOptions.find(opt => opt.value === currentSort)?.label}
              <button
                onClick={() => dispatch(setCurrentSort('newest'))}
                className="ml-1 text-slate-600 hover:text-slate-800"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => dispatch(clearErrors())}
            className="text-red-600 hover:text-red-800 text-sm mt-2"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-16 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reviews list */}
      {!loading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map(review => (
            <ReviewCard
              key={review.review_id}
              review={review}
              onMarkHelpful={handleMarkHelpful}
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
            <StarIcon className="w-12 h-12 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            Belum ada review
          </h3>
          <p className="text-slate-600 mb-4">
            Jadilah yang pertama memberikan review untuk produk ini
          </p>
          <button
            onClick={() => dispatch(toggleReviewForm())}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Tulis Review Pertama
          </button>
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
};

export default ReviewSection;