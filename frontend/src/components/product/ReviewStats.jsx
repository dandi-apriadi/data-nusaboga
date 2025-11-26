import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { CheckBadgeIcon, PhotoIcon, ClockIcon } from '@heroicons/react/24/outline';

const ReviewStats = ({ stats }) => {
  if (!stats) return null;

  const getRatingPercentage = (rating) => {
    const count = stats.rating_distribution[rating] || 0;
    return stats.total_reviews > 0 ? (count / stats.total_reviews) * 100 : 0;
  };

  const formatRating = (rating) => {
    return rating ? rating.toFixed(1) : '0.0';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Rating */}
        <div className="text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
            <span className="text-4xl font-bold text-slate-900">
              {formatRating(stats.average_rating)}
            </span>
            <div className="flex items-center">
              {Array.from({ length: 5 }, (_, index) => (
                <StarIcon
                  key={index}
                  className={`w-6 h-6 ${
                    index < Math.round(stats.average_rating)
                      ? 'text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-slate-600">
            Berdasarkan {stats.total_reviews} review
          </p>
        </div>

        {/* Rating Distribution */}
        <div className="lg:col-span-2">
          <h4 className="font-medium text-slate-900 mb-4">Distribusi Rating</h4>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.rating_distribution[rating] || 0;
              const percentage = getRatingPercentage(rating);
              
              return (
                <div key={rating} className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1 w-16">
                    <span className="text-sm text-slate-600">{rating}</span>
                    <StarIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  <div className="w-12 text-right">
                    <span className="text-sm text-slate-600">{count}</span>
                  </div>
                  
                  <div className="w-12 text-right">
                    <span className="text-sm text-slate-500">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-100">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckBadgeIcon className="w-8 h-8 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.verified_purchases}</div>
          <div className="text-sm text-slate-600">Pembelian Terverifikasi</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.total_reviews > 0 ? Math.round((stats.verified_purchases / stats.total_reviews) * 100) : 0}% dari total review
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <PhotoIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.with_photos}</div>
          <div className="text-sm text-slate-600">Review dengan Foto</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.total_reviews > 0 ? Math.round((stats.with_photos / stats.total_reviews) * 100) : 0}% dengan foto
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <ClockIcon className="w-8 h-8 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.recent_reviews}</div>
          <div className="text-sm text-slate-600">Review Terbaru</div>
          <div className="text-xs text-slate-500 mt-1">
            30 hari terakhir
          </div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <StarIcon className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.helpful_reviews}</div>
          <div className="text-sm text-slate-600">Review Membantu</div>
          <div className="text-xs text-slate-500 mt-1">
            {'>'}10 vote membantu
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mt-6 pt-6 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-medium text-green-800 mb-2">Highlight Positif</h5>
            <div className="text-sm text-green-700">
              <div className="flex items-center justify-between mb-1">
                <span>Rating 4-5 bintang</span>
                <span className="font-medium">
                  {Math.round(((stats.rating_distribution[5] + stats.rating_distribution[4]) / stats.total_reviews) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Pembelian terverifikasi</span>
                <span className="font-medium">
                  {Math.round((stats.verified_purchases / stats.total_reviews) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-medium text-blue-800 mb-2">Engagement</h5>
            <div className="text-sm text-blue-700">
              <div className="flex items-center justify-between mb-1">
                <span>Review dengan foto</span>
                <span className="font-medium">
                  {Math.round((stats.with_photos / stats.total_reviews) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Review membantu</span>
                <span className="font-medium">
                  {Math.round((stats.helpful_reviews / stats.total_reviews) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;