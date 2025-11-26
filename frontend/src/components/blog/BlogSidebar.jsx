import React from 'react';
import Card from '../card';
import { MdSearch, MdLocalOffer } from 'react-icons/md';

const BlogSidebar = ({ 
  categories = [], 
  recentPosts = [], 
  popularTags = [],
  onCategorySelect,
  onTagSelect,
  onSearch 
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Widget */}
      <Card extra="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <MdSearch className="w-5 h-5 mr-2 text-green-600" />
          Cari Artikel
        </h3>
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari resep, tips, atau artikel..."
            className="w-full px-4 py-3 pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white transition-colors"
          />
          <MdSearch className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            Cari
          </button>
        </form>
      </Card>

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            📰 Artikel Terbaru
          </h3>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.post_id} className="flex space-x-3 group cursor-pointer">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0 group-hover:opacity-90 transition-opacity"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-green-600 transition-colors">
                    {post.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span 
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: post.category.color }}
                    ></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(post.published_at).toLocaleDateString('id-ID', { 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {post.reading_time} menit
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <MdLocalOffer className="w-5 h-5 mr-2 text-green-600" />
            Kategori
          </h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div 
                key={category.category_id} 
                className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group transition-colors"
                onClick={() => onCategorySelect && onCategorySelect(category.category_id)}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                  {category.posts_count}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <Card extra="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            🏷️ Tag Populer
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <span
                key={tag.slug}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer hover:scale-105 transition-transform shadow-sm"
                style={{ 
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  border: `1px solid ${tag.color}30`
                }}
                onClick={() => onTagSelect && onTagSelect(tag.slug)}
              >
                {tag.name}
                <span className="ml-1 text-xs opacity-70">({tag.posts_count})</span>
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Newsletter Subscription */}
      <Card extra="p-6 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          📬 Newsletter
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Dapatkan resep terbaru dan tips memasak langsung di email Anda!
        </p>
        <form className="space-y-3">
          <input
            type="email"
            placeholder="Masukkan email Anda"
            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <button
            type="submit"
            className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
          >
            Berlangganan
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          * Kami tidak akan mengirim spam
        </p>
      </Card>

      {/* Social Media */}
      <Card extra="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🌐 Ikuti Kami
        </h3>
        <div className="flex space-x-3">
          <a
            href="#"
            className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            title="Facebook"
          >
            📘
          </a>
          <a
            href="#"
            className="flex items-center justify-center w-10 h-10 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="WhatsApp"
          >
            📱
          </a>
          <a
            href="#"
            className="flex items-center justify-center w-10 h-10 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            title="Instagram"
          >
            📷
          </a>
          <a
            href="#"
            className="flex items-center justify-center w-10 h-10 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            title="YouTube"
          >
            📹
          </a>
        </div>
      </Card>
    </div>
  );
};

export default BlogSidebar;