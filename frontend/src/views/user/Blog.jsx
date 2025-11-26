import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Card from "components/card";
import { 
  MdSearch, 
  MdFilterList, 
  MdLocalOffer,
  MdSchedule,
  MdVisibility,
  MdArrowBack,
  MdShare,
  MdBookmark,
  MdBookmarkBorder,
  MdFavorite,
  MdFavoriteBorder,
  MdCategory,
  MdCalendarToday
} from "react-icons/md";
import {
  fetchBlogPosts,
  fetchBlogCategories,
  fetchBlogTags,
  fetchBlogPostById,
  clearCurrentPost
} from "store/slices/blogSlice";

// Sample data untuk demo
const demoRecentPosts = [
  {
    post_id: '1',
    title: 'Resep Nasi Goreng Abon Cakalang Special',
    slug: 'resep-nasi-goreng-abon-cakalang-special',
    excerpt: 'Kreasi nasi goreng dengan abon cakalang premium yang lezat dan bergizi.',
    featured_image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=300&q=80',
    published_at: '2024-09-20T10:00:00Z',
    reading_time: 5,
    views_count: 245,
    category: { name: 'Resep & Masakan', color: '#10b981' }
  },
  {
    post_id: '2', 
    title: 'Tips Menyimpan Abon Cakalang Agar Awet',
    slug: 'tips-menyimpan-abon-cakalang-awet',
    excerpt: 'Panduan lengkap cara menyimpan abon cakalang dengan benar agar tahan lama.',
    featured_image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=300&q=80',
    published_at: '2024-09-18T14:30:00Z',
    reading_time: 4,
    views_count: 189,
    category: { name: 'Tips & Trik', color: '#3b82f6' }
  },
  {
    post_id: '3',
    title: 'Manfaat Kesehatan Ikan Cakalang',
    slug: 'manfaat-kesehatan-ikan-cakalang',
    excerpt: 'Kandungan nutrisi dan manfaat luar biasa ikan cakalang untuk kesehatan keluarga.',
    featured_image: 'https://images.unsplash.com/photo-1571732262721-64accf5a3602?auto=format&fit=crop&w=300&q=80',
    published_at: '2024-09-15T09:15:00Z',
    reading_time: 6,
    views_count: 312,
    category: { name: 'Kesehatan & Nutrisi', color: '#f59e0b' }
  }
];

const demoPopularTags = [
  { name: 'Abon Cakalang', slug: 'abon-cakalang', posts_count: 12, color: '#10b981' },
  { name: 'Resep Praktis', slug: 'resep-praktis', posts_count: 8, color: '#8b5cf6' },
  { name: 'Makanan Sehat', slug: 'makanan-sehat', posts_count: 6, color: '#ef4444' },
  { name: 'Tips Dapur', slug: 'tips-dapur', posts_count: 5, color: '#06b6d4' },
  { name: 'Nutrisi', slug: 'nutrisi', posts_count: 4, color: '#84cc16' }
];

// Featured blog posts untuk hero section
const demoFeaturedPosts = [
  {
    post_id: '1',
    title: 'Rahasia Membuat Abon Cakalang Premium yang Lezat dan Bergizi',
    slug: 'rahasia-abon-cakalang-premium',
    excerpt: 'Temukan teknik khusus pembuatan abon cakalang dengan cita rasa autentik yang telah diwariskan turun temurun dari Sulawesi Utara.',
    featured_image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
    published_at: '2024-09-15T10:30:00Z',
    reading_time: 5,
    views_count: 245,
    is_featured: true,
    category: { name: 'Resep & Masakan', color: '#10b981' }
  },
  {
    post_id: '4',
    title: 'Kandungan Nutrisi Ikan Cakalang dan Manfaatnya untuk Kesehatan',
    slug: 'nutrisi-ikan-cakalang-kesehatan',
    excerpt: 'Analisis mendalam tentang kandungan gizi ikan cakalang dan berbagai manfaat kesehatan yang luar biasa untuk seluruh anggota keluarga.',
    featured_image: 'https://images.unsplash.com/photo-1571732262721-64accf5a3602?auto=format&fit=crop&w=800&q=80',
    published_at: '2024-09-08T16:45:00Z',
    reading_time: 8,
    views_count: 312,
    is_featured: true,
    category: { name: 'Kesehatan & Nutrisi', color: '#f59e0b' }
  },
  {
    post_id: '5',
    title: 'Sejarah dan Tradisi Cakalang Fufu di Sulawesi Utara',
    slug: 'sejarah-cakalang-fufu-sulawesi',
    excerpt: 'Mengenal lebih dalam tentang warisan budaya cakalang fufu, makanan tradisional khas Sulawesi Utara yang sarat dengan nilai sejarah.',
    featured_image: 'https://images.unsplash.com/photo-1530716222358-0a3577f5d8be?auto=format&fit=crop&w=800&q=80',
    published_at: '2024-09-05T12:00:00Z',
    reading_time: 10,
    views_count: 198,
    is_featured: true,
    category: { name: 'Budaya & Tradisi', color: '#8b5cf6' }
  }
];

// Blog List Component
const BlogList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { 
    posts, 
    categories, 
    tags, 
    postsLoading, 
    postsTotal,
    postsCurrentPage,
    postsTotalPages,
    postsPerPage
  } = useSelector((state) => state.blog);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("created_at");

  useEffect(() => {
    dispatch(fetchBlogCategories({ isPublic: true }));
    dispatch(fetchBlogTags({ isPublic: true }));
    handleSearch();
  }, [dispatch]);

  const handleSearch = (page = 1) => {
    const params = {
      page,
      limit: postsPerPage,
      isPublic: true,
      status: 'PUBLISHED',
      sort_by: sortBy,
      sort_order: 'DESC',
      ...(searchTerm && { search: searchTerm }),
      ...(selectedCategory && { category_id: selectedCategory }),
      ...(selectedTag && { tag: selectedTag })
    };
    dispatch(fetchBlogPosts(params));
  };

  const handlePageChange = (page) => {
    handleSearch(page);
  };

  const handlePostClick = (post) => {
    navigate(`/blog/${post.post_id}`);
  };

  const featuredPosts = posts.filter(post => post.is_featured).slice(0, 3);
  const regularPosts = posts.filter(post => !post.is_featured);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Blog Lyvia Nusa Boga</h1>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
              Temukan tips, resep, dan cerita menarik seputar olahan ikan cakalang
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-xl" />
                <input
                  type="text"
                  placeholder="Cari artikel blog..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Semua Kategori</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="created_at">Terbaru</option>
                <option value="views_count">Terpopuler</option>
                <option value="title">A-Z</option>
              </select>
              
              <button
                onClick={() => handleSearch()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
              >
                <MdFilterList className="text-xl" />
                <span className="hidden lg:inline">Filter</span>
              </button>
            </div>
          </div>

          {/* Quick Filter Tags */}
          {tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-slate-600 font-medium">Tags populer:</span>
                {tags.slice(0, 8).map((tag) => (
                  <button
                    key={tag.tag_id}
                    onClick={() => {
                      setSelectedTag(selectedTag === tag.slug ? "" : tag.slug);
                      setTimeout(() => handleSearch(), 100);
                    }}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTag === tag.slug
                        ? 'text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                    style={{ 
                      backgroundColor: selectedTag === tag.slug ? tag.color : `${tag.color}20`,
                      borderColor: tag.color,
                      border: `1px solid ${tag.color}40`
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Artikel Pilihan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Card
                  key={post.post_id}
                  extra="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => handlePostClick(post)}
                >
                  {post.featured_image && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {post.category && (
                        <span
                          className="px-2 py-1 text-xs font-medium rounded-full"
                          style={{ 
                            backgroundColor: `${post.category.color}20`, 
                            color: post.category.color 
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-amber-500">
                        <MdFavorite className="text-sm" />
                        <span className="text-xs font-medium">Featured</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <MdCalendarToday />
                          {format(new Date(post.published_at || post.created_at), "dd MMM yyyy", { locale: id })}
                        </div>
                        <div className="flex items-center gap-1">
                          <MdVisibility />
                          {post.views_count || 0}
                        </div>
                      </div>
                      {post.reading_time && (
                        <div className="flex items-center gap-1">
                          <MdSchedule />
                          {post.reading_time} min
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              {featuredPosts.length > 0 ? 'Artikel Lainnya' : 'Semua Artikel'}
            </h2>
            <div className="text-sm text-slate-600">
              {postsTotal} artikel ditemukan
            </div>
          </div>

          {postsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} extra="overflow-hidden animate-pulse">
                  <div className="aspect-video bg-slate-200"></div>
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded"></div>
                      <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : regularPosts.length === 0 ? (
            <Card extra="p-12 text-center">
              <div className="text-slate-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Tidak ada artikel ditemukan</h3>
              <p className="text-slate-600">Coba ubah filter pencarian Anda</p>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post) => (
                  <Card
                    key={post.post_id}
                    extra="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                    onClick={() => handlePostClick(post)}
                  >
                    {post.featured_image && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={post.featured_image}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        {post.category && (
                          <span
                            className="px-2 py-1 text-xs font-medium rounded-full"
                            style={{ 
                              backgroundColor: `${post.category.color}20`, 
                              color: post.category.color 
                            }}
                          >
                            {post.category.name}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <MdCalendarToday />
                            {format(new Date(post.published_at || post.created_at), "dd MMM yyyy", { locale: id })}
                          </div>
                          <div className="flex items-center gap-1">
                            <MdVisibility />
                            {post.views_count || 0}
                          </div>
                        </div>
                        {post.reading_time && (
                          <div className="flex items-center gap-1">
                            <MdSchedule />
                            {post.reading_time} min
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {postsTotalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex gap-2">
                    {Array.from({ length: postsTotalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                          page === postsCurrentPage
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Blog Detail Component
const BlogDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { currentPost, loading, error } = useSelector((state) => state.blog);

  useEffect(() => {
    if (id) {
      dispatch(fetchBlogPostById({ id, increment_views: true, isPublic: true }));
    }
    
    return () => {
      dispatch(clearCurrentPost());
    };
  }, [dispatch, id]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPost.title,
          text: currentPost.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link berhasil disalin ke clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat artikel...</p>
        </div>
      </div>
    );
  }

  if (error || !currentPost) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card extra="p-12 text-center">
          <div className="text-slate-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Artikel tidak ditemukan</h3>
          <p className="text-slate-600 mb-6">Artikel yang Anda cari mungkin telah dihapus atau tidak tersedia</p>
          <button
            onClick={() => navigate('/blog')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Kembali ke Blog
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/blog')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <MdArrowBack className="text-xl" />
              <span className="font-medium">Kembali ke Blog</span>
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="p-2 text-slate-600 hover:text-indigo-600 transition-colors"
                title="Bagikan artikel"
              >
                <MdShare className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article>
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {currentPost.category && (
                <span
                  className="px-3 py-1 text-sm font-medium rounded-full"
                  style={{ 
                    backgroundColor: `${currentPost.category.color}20`, 
                    color: currentPost.category.color 
                  }}
                >
                  {currentPost.category.name}
                </span>
              )}
              {currentPost.is_featured && (
                <div className="flex items-center gap-1 text-amber-500">
                  <MdFavorite className="text-sm" />
                  <span className="text-sm font-medium">Featured</span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              {currentPost.title}
            </h1>
            
            {currentPost.excerpt && (
              <p className="text-xl text-slate-600 mb-6">
                {currentPost.excerpt}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-slate-500 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-1">
                <MdCalendarToday />
                <span>
                  {format(new Date(currentPost.published_at || currentPost.created_at), "dd MMMM yyyy", { locale: id })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MdVisibility />
                <span>{currentPost.views_count || 0} views</span>
              </div>
              {currentPost.reading_time && (
                <div className="flex items-center gap-1">
                  <MdSchedule />
                  <span>{currentPost.reading_time} min read</span>
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {currentPost.featured_image && (
            <div className="mb-8">
              <img
                src={currentPost.featured_image}
                alt={currentPost.title}
                className="w-full h-64 lg:h-96 object-cover rounded-xl"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-slate max-w-none lg:prose-lg">
            <div 
              className="text-slate-700 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: currentPost.content.replace(/\n/g, '<br />') 
              }}
            />
          </div>

          {/* Tags */}
          {currentPost.tags && currentPost.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-slate-200">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Tags:</h4>
              <div className="flex flex-wrap gap-2">
                {currentPost.tags.map((tag) => (
                  <span
                    key={tag.tag_id}
                    className="px-3 py-1 text-sm rounded-full"
                    style={{ 
                      backgroundColor: `${tag.color}20`, 
                      color: tag.color,
                      border: `1px solid ${tag.color}40`
                    }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

// Main Blog Component
const Blog = () => {
  const { id } = useParams();
  
  return id ? <BlogDetail /> : <BlogList />;
};

export default Blog;