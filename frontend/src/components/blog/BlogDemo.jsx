import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchBlogPosts, fetchBlogCategories, fetchFeaturedPosts } from '../../store/slices/blogSlice';
import BlogHero from '../../components/blog/BlogHero';
import BlogCard from '../../components/blog/BlogCard';
import BlogSidebar from '../../components/blog/BlogSidebar';
import { BlogLoading } from '../../components/blog/BlogSkeleton';

// Demo data yang akan menggunakan data dari Redux store
const BlogDemo = () => {
  const dispatch = useDispatch();
  const { 
    posts, 
    categories, 
    tags, 
    featuredPosts, 
    postsLoading,
    postsTotal,
    postsCurrentPage,
    postsTotalPages
  } = useSelector((state) => state.blog);

  const [searchParams, setSearchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  
  const currentCategory = searchParams.get('category');
  const currentTag = searchParams.get('tag');
  const currentSearch = searchParams.get('search');

  useEffect(() => {
    // Load initial data - will use dummy data from mock mode
    dispatch(fetchFeaturedPosts(3));
    dispatch(fetchBlogPosts({ 
      isPublic: true,
      page: currentPage,
      limit: 6,
      category_id: currentCategory,
      tag: currentTag,
      search: currentSearch
    }));
    dispatch(fetchBlogCategories());
  }, [dispatch, currentPage, currentCategory, currentTag, currentSearch]);

  const handleCategoryFilter = (categoryId) => {
    const params = new URLSearchParams(searchParams);
    if (categoryId) {
      params.set('category', categoryId);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset to first page when filtering
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleTagFilter = (tagSlug) => {
    const params = new URLSearchParams(searchParams);
    if (tagSlug) {
      params.set('tag', tagSlug);
    } else {
      params.delete('tag');
    }
    params.delete('page'); // Reset to first page when filtering
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleSearch = (searchTerm) => {
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set('search', searchTerm);
    } else {
      params.delete('search');
    }
    params.delete('page'); // Reset to first page when searching
    setSearchParams(params);
    setCurrentPage(1);
  };

  // Demo recent posts from current posts
  const recentPosts = posts.slice(0, 3);
  
  // Demo popular tags from Redux store
  const popularTags = tags.slice(0, 8);

  if (postsLoading && posts.length === 0) {
    return <BlogLoading />;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Blog Lyvia Nusa Boga
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Temukan resep lezat, tips memasak, dan informasi menarik seputar produk cakalang premium dari Sulawesi Utara
          </p>
        </div>

        {/* Featured Posts Hero */}
        <BlogHero featuredPosts={featuredPosts} />

        {/* Category Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Kategori Artikel
          </h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleCategoryFilter(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !currentCategory
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
              }`}
            >
              Semua Artikel ({postsTotal})
            </button>
            {categories.map((category) => (
              <button
                key={category.category_id}
                onClick={() => handleCategoryFilter(category.category_id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  currentCategory === category.category_id
                    ? 'text-white shadow-lg transform scale-105'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:opacity-80 border border-gray-200 dark:border-gray-600'
                }`}
                style={{
                  backgroundColor: currentCategory === category.category_id ? category.color : undefined
                }}
              >
                {category.name} ({category.posts_count})
              </button>
            ))}
          </div>
        </div>

        {/* Active Filters Display */}
        {(currentCategory || currentTag || currentSearch) && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Filter aktif:
                </span>
                {currentCategory && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Kategori: {categories.find(c => c.category_id === currentCategory)?.name}
                  </span>
                )}
                {currentTag && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Tag: {currentTag}
                  </span>
                )}
                {currentSearch && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                    Pencarian: "{currentSearch}"
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSearchParams({});
                  setCurrentPage(1);
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Hapus Semua Filter
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Posts Grid */}
          <div className="lg:col-span-2">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {posts.map((post) => (
                    <BlogCard key={post.post_id} post={post} />
                  ))}
                </div>

                {/* Pagination */}
                {postsTotalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Sebelumnya
                    </button>
                    
                    {Array.from({ length: Math.min(5, postsTotalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? 'text-white bg-green-600 border border-green-600'
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(postsTotalPages, currentPage + 1))}
                      disabled={currentPage === postsTotalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                    >
                      Selanjutnya
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Tidak ada artikel ditemukan
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Belum ada artikel yang sesuai dengan filter Anda. Coba ubah kriteria pencarian.
                </p>
                <button
                  onClick={() => {
                    setSearchParams({});
                    setCurrentPage(1);
                  }}
                  className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Lihat Semua Artikel
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar 
              categories={categories}
              recentPosts={recentPosts}
              popularTags={popularTags}
              onCategorySelect={handleCategoryFilter}
              onTagSelect={handleTagFilter}
              onSearch={handleSearch}
            />
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Jangan Lewatkan Resep Terbaru! 🍽️
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Berlangganan newsletter kami dan dapatkan resep eksklusif serta tips memasak langsung di email Anda.
          </p>
          <div className="max-w-md mx-auto flex space-x-3">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="px-6 py-3 bg-yellow-500 text-gray-900 font-semibold rounded-lg hover:bg-yellow-400 transition-colors">
              Berlangganan
            </button>
          </div>
          <p className="text-sm mt-3 opacity-75">
            * Gratis dan bisa berhenti kapan saja
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlogDemo;