import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../card';
import { MdSchedule, MdVisibility, MdLocalOffer } from 'react-icons/md';

const BlogCard = ({ post, featured = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleClick = () => {
    navigate(`/blog/${post.slug}`);
  };

  const cardClassName = featured 
    ? "overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    : "overflow-hidden hover:shadow-lg transition-shadow cursor-pointer";

  return (
    <Card extra={cardClassName} onClick={handleClick}>
      <div className="relative">
        <img
          src={post.featured_image}
          alt={post.title}
          className={`w-full object-cover ${featured ? 'h-64' : 'h-48'}`}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span 
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white shadow-lg"
            style={{ backgroundColor: post.category.color }}
          >
            <MdLocalOffer className="w-3 h-3 mr-1" />
            {post.category.name}
          </span>
        </div>

        {/* Featured Badge */}
        {post.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg">
              ⭐ Pilihan
            </span>
          </div>
        )}

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className={`p-${featured ? '8' : '6'}`}>
        <h3 className={`font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2 ${
          featured ? 'text-xl' : 'text-lg'
        }`}>
          {post.title}
        </h3>
        
        <p className={`text-gray-600 dark:text-gray-300 mb-4 line-clamp-${featured ? '4' : '3'}`}>
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.tag_id}
                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                style={{ 
                  backgroundColor: `${tag.color}15`,
                  color: tag.color,
                  border: `1px solid ${tag.color}30`
                }}
              >
                {tag.name}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                +{post.tags.length - 3} lainnya
              </span>
            )}
          </div>
        )}

        {/* Post Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <MdSchedule className="w-4 h-4" />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>📖</span>
              <span>{post.reading_time} menit</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <MdVisibility className="w-4 h-4" />
            <span>{post.views_count}</span>
            {post.likes_count > 0 && (
              <>
                <span>•</span>
                <span>❤️ {post.likes_count}</span>
              </>
            )}
          </div>
        </div>

        {/* Read More Button */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button 
            className="w-full text-center text-green-600 dark:text-green-400 font-medium hover:text-green-700 dark:hover:text-green-300 transition-colors"
            onClick={handleClick}
          >
            Baca Selengkapnya →
          </button>
        </div>
      </div>
    </Card>
  );
};

export default BlogCard;