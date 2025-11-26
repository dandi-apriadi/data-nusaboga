import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../card';
import { MdSchedule, MdVisibility, MdLocalOffer, MdTrendingUp } from 'react-icons/md';

const BlogHero = ({ featuredPosts = [] }) => {
  const navigate = useNavigate();

  if (!featuredPosts.length) return null;

  const mainPost = featuredPosts[0];
  const sidebarPosts = featuredPosts.slice(1, 3);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePostClick = (slug) => {
    navigate(`/blog/${slug}`);
  };

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <MdTrendingUp className="w-6 h-6 mr-2 text-green-600" />
          Artikel Pilihan
        </h2>
        <button
          onClick={() => navigate('/blog')}
          className="text-green-600 hover:text-green-700 font-medium text-sm"
        >
          Lihat Semua →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Featured Post */}
        <div className="lg:col-span-2">
          <Card extra="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
            <div className="relative">
              <img
                src={mainPost.featured_image}
                alt={mainPost.title}
                className="w-full h-80 object-cover"
                onClick={() => handlePostClick(mainPost.slug)}
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              
              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <div className="flex items-center space-x-3 mb-3">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: mainPost.category.color }}
                  >
                    <MdLocalOffer className="w-3 h-3 mr-1" />
                    {mainPost.category.name}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-400 to-orange-500">
                    ⭐ Pilihan Editor
                  </span>
                </div>
                
                <h3 
                  className="text-2xl font-bold mb-3 line-clamp-2 cursor-pointer hover:text-green-200 transition-colors"
                  onClick={() => handlePostClick(mainPost.slug)}
                >
                  {mainPost.title}
                </h3>
                
                <p className="text-gray-200 mb-4 line-clamp-2">
                  {mainPost.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-200">
                    <div className="flex items-center space-x-1">
                      <MdSchedule className="w-4 h-4" />
                      <span>{formatDate(mainPost.published_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📖</span>
                      <span>{mainPost.reading_time} menit</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-200">
                    <MdVisibility className="w-4 h-4" />
                    <span>{mainPost.views_count}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar Featured Posts */}
        <div className="space-y-4">
          {sidebarPosts.map((post, index) => (
            <Card 
              key={post.post_id} 
              extra="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePostClick(post.slug)}
            >
              <div className="flex">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-24 h-24 object-cover flex-shrink-0"
                />
                <div className="p-4 flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span 
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ backgroundColor: post.category.color }}
                    ></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {post.category.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      • {formatDate(post.published_at)}
                    </span>
                  </div>
                  
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 hover:text-green-600 transition-colors">
                    {post.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{post.reading_time} menit baca</span>
                    <div className="flex items-center space-x-1">
                      <MdVisibility className="w-3 h-3" />
                      <span>{post.views_count}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Call to Action */}
          <Card extra="bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 text-center">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Resep Spesial Minggu Ini
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Coba resep abon cakalang dengan sentuhan modern yang lezat dan bergizi!
            </p>
            <button 
              className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              onClick={() => navigate('/blog?category=1')}
            >
              Lihat Resep →
            </button>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default BlogHero;