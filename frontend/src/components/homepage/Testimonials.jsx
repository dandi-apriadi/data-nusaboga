import React, { useState, useEffect } from 'react';
import { BsArrowLeft, BsArrowRight, BsCalendar3, BsPerson, BsTag } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import api from 'api/axios';

// This would be used as fallback if API fails
const dummyBlogPosts = [
    {
        id: 1,
        title: 'Manfaat Abon Cakalang untuk Kesehatan Keluarga',
        excerpt: 'Mengenal kandungan gizi tinggi dalam abon cakalang dan manfaatnya untuk tumbuh kembang anak.',
        image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80',
        date: '2024-03-15T14:30:00',
        author: 'Admin Lyvia',
        category: 'Kesehatan',
        slug: 'manfaat-abon-cakalang-kesehatan'
    },
    {
        id: 2,
        title: 'Resep Nasi Goreng Abon Cakalang yang Lezat',
        excerpt: 'Kreasi masakan rumahan dengan abon cakalang premium untuk menu keluarga yang istimewa.',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=80',
        date: '2024-03-10T09:15:00',
        author: 'Admin Lyvia',
        category: 'Resep',
        slug: 'resep-nasi-goreng-abon-cakalang'
    },
    {
        id: 3,
        title: 'Cara Menyimpan Abon Cakalang Agar Tahan Lama',
        excerpt: 'Tips praktis menyimpan abon cakalang dengan benar agar tetap segar dan tahan lama.',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=1200&q=80',
        date: '2024-03-05T16:45:00',
        author: 'Admin Lyvia',
        category: 'Tips & Trick',
        slug: 'cara-menyimpan-abon-cakalang'
    },
    {
        id: 4,
        title: 'Perbedaan Kualitas Abon Cakalang Premium dan Biasa',
        excerpt: 'Mengetahui ciri-ciri abon cakalang berkualitas premium dan tips memilih produk terbaik.',
        image: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        date: '2024-03-02T11:20:00',
        author: 'Admin Lyvia',
        category: 'Edukasi',
        slug: 'perbedaan-kualitas-abon-cakalang'
    },
    {
        id: 5,
        title: 'Sejarah dan Budaya Cakalang Fufu di Sulawesi Utara',
        excerpt: 'Mengenal asal-usul dan tradisi pembuatan cakalang fufu sebagai kuliner khas Manado.',
        image: 'https://images.unsplash.com/photo-1530716222358-0a3577f5d8be?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        date: '2024-02-28T13:45:00',
        author: 'Admin Lyvia',
        category: 'Budaya',
        slug: 'sejarah-cakalang-fufu-sulawesi'
    },
    {
        id: 6,
        title: 'Kandungan Nutrisi Ikan Cakalang dan Manfaatnya',
        excerpt: 'Analisis kandungan protein, omega-3, dan vitamin pada ikan cakalang untuk kesehatan optimal.',
        image: 'https://images.unsplash.com/photo-1571732262721-64accf5a3602?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
        date: '2024-02-25T10:30:00',
        author: 'Admin Lyvia',
        category: 'Nutrisi',
        slug: 'kandungan-nutrisi-ikan-cakalang'
    },
    // More blog posts can be added here
];

export const Testimonials = () => {
    // Rename to BlogCards when you update the file name
    const [blogPosts, setBlogPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const cardsPerPage = 6;
    const totalPages = Math.ceil(blogPosts.length / cardsPerPage);

    // Fetch blog posts from API
    useEffect(() => {
        const fetchBlogs = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch blogs using the public blogs endpoint
                const response = await api.get('/blog/posts/public', {
                    params: {
                        page: 1,
                        limit: 10,
                        status: 'PUBLISHED'
                    }
                });

                if (response.data && response.data.success) {
                    const blogsData = response.data.data.posts || [];

                    // Format blog data to match our component's expected structure
                    const formattedBlogs = blogsData.map(blog => ({
                        id: blog.post_id,
                        title: blog.title,
                        excerpt: blog.excerpt || blog.content.substring(0, 150) + '...',
                        image: blog.featured_image || 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80',
                        date: blog.published_at || blog.created_at,
                        author: 'Admin Lyvia',
                        category: blog.category?.name || 'Artikel',
                        slug: blog.slug || `blog-${blog.post_id}`
                    }));

                    setBlogPosts(formattedBlogs);
                } else {
                    // If API response is not successful, use dummy data as fallback
                    console.warn('API returned unsuccessful status, using dummy data');
                    setBlogPosts(dummyBlogPosts);
                }
            } catch (err) {
                console.error('Error fetching blogs:', err);
                setError('Failed to load blog posts. Using demo data.');
                // Use dummy data as fallback
                setBlogPosts(dummyBlogPosts);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // Get current blog posts
    const getCurrentBlogPosts = () => {
        const start = currentPage * cardsPerPage;
        const end = start + cardsPerPage;
        return blogPosts.slice(start, end);
    };

    return (
        <section className="relative py-24 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/80 
            dark:from-navy-900/80 dark:via-navy-800 dark:to-navy-900/80 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] 
                dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900
                        dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent mb-4">
                        Latest Articles
                    </h2>
                    <div className="w-20 h-1 bg-gradient-to-r from-brand-500 to-brand-600 mx-auto mb-4 rounded-full" />
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        Discover the latest insights, guides, and news from the vaping world
                    </p>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-brand-500"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading articles...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !isLoading && (
                    <div className="text-center mb-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Navigation Buttons */}
                {!isLoading && blogPosts.length > 0 && (
                    <>
                        {/* Left Button */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                            <button
                                onClick={() => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)}
                                className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-md 
                                    hover:bg-white transition-colors duration-200 
                                    dark:bg-navy-800/90 dark:hover:bg-navy-800"
                            >
                                <BsArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300 
                                    group-hover:text-gray-900 dark:group-hover:text-white" />
                            </button>
                        </div>

                        {/* Blog Posts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {getCurrentBlogPosts().map((post, index) => (
                                <div
                                    key={`${currentPage}-${post.id}`}
                                    className="opacity-0 transform translate-y-10 animate-[fadeIn_0.5s_ease-out_forwards]"
                                    style={{ animationDelay: `${index * 150}ms` }}
                                >
                                    {/* Card Content */}
                                    <Link to={`/user/blog/${post.id}`} className="block h-full">
                                        <div className="relative h-full flex flex-col bg-gradient-to-br from-white to-gray-50/95 
                                            dark:from-navy-800 dark:to-navy-900/95 rounded-2xl shadow-lg 
                                            hover:shadow-xl transition-all duration-300 border border-gray-100/80 
                                            dark:border-navy-700/80 backdrop-blur-sm overflow-hidden">

                                            {/* Blog Image */}
                                            <div className="h-48 w-full overflow-hidden">
                                                <img
                                                    crossOrigin="anonymous"
                                                    src={post.image}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 
                                                        hover:scale-105"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                                                    }}
                                                />
                                            </div>

                                            {/* Category Badge */}
                                            <div className="absolute top-4 right-4">
                                                <span className="px-3 py-1 bg-brand-500 text-white text-sm font-medium 
                                                    rounded-full shadow-lg">
                                                    {post.category}
                                                </span>
                                            </div>

                                            {/* Content */}
                                            <div className="relative z-10 p-6 flex flex-col flex-grow">
                                                {/* Title */}
                                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 
                                                    line-clamp-2">{post.title}</h3>

                                                {/* Excerpt */}
                                                <p className="text-gray-700 dark:text-gray-300 mb-4 flex-grow 
                                                    line-clamp-3">{post.excerpt}</p>

                                                {/* Metadata */}
                                                <div className="flex items-center justify-between text-sm text-gray-500 
                                                    dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-navy-700">
                                                    <div className="flex items-center">
                                                        <BsCalendar3 className="w-4 h-4 mr-1" />
                                                        {new Date(post.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <BsPerson className="w-4 h-4 mr-1" />
                                                        {post.author}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* Right Navigation Button */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                            <button
                                onClick={() => setCurrentPage((prev) => (prev + 1) % totalPages)}
                                className="p-3 rounded-full bg-white/90 backdrop-blur-sm shadow-md 
                                    hover:bg-white transition-colors duration-200 
                                    dark:bg-navy-800/90 dark:hover:bg-navy-800"
                            >
                                <BsArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300 
                                    group-hover:text-gray-900 dark:group-hover:text-white" />
                            </button>
                        </div>

                        {/* Page Indicators */}
                        <div className="flex justify-center gap-2 mt-8">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`w-2 h-2 rounded-full transition-all duration-200
                                        ${currentPage === i
                                            ? 'w-6 bg-brand-500'
                                            : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* No Posts State */}
                {!isLoading && !error && blogPosts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-600 dark:text-gray-300">No articles found. Check back later for updates.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Testimonials;