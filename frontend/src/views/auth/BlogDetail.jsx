import React, { useEffect, useState } from 'react';
import Footer from '../../components/Footer';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const BlogDetail = () => {
  const { slug } = useParams();
  const { baseURL } = useSelector((state) => state.auth);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      try {
        if (!baseURL) {
          // Fallback demo data if API baseURL not set
          if (isMounted) {
            setPost({
              title: slug?.replace(/-/g, ' ') || 'Artikel',
              content:
                'Konten artikel belum tersedia. Ini adalah tampilan contoh untuk halaman detail artikel.',
              image: 'https://via.placeholder.com/1200x600?text=Article+Image',
              author: 'Admin',
              created_at: new Date().toISOString(),
              category: 'Umum',
            });
          }
          return;
        }

        setLoading(true);
        setError(null);
        // Assuming future endpoint like /api/engagement/blogs/:slug
        const res = await baseURL.get(`/api/engagement/blogs/${slug}`);
        if (isMounted) {
          const data = res?.data?.data?.blog || null;
          setPost(data);
        }
      } catch (e) {
        if (isMounted) setError('Gagal memuat artikel.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => {
      isMounted = false;
    };
  }, [slug, baseURL]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="h-72 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <p className="text-red-600">{error}</p>
        <Link to="/auth/artikel" className="text-indigo-600 underline mt-4 inline-block">
          Kembali ke daftar artikel
        </Link>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  return (
    <>
      <article className="max-w-5xl mx-auto px-6 py-10">
      <nav className="text-xs sm:text-sm mb-6 text-gray-600">
        <Link to="/auth/homepage" className="hover:underline">Beranda</Link>
        <span className="mx-2">/</span>
        <Link to="/auth/artikel" className="hover:underline">Artikel</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{post.title}</span>
      </nav>

      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-3">{post.title}</h1>
      <div className="text-xs sm:text-sm text-gray-500 mb-6">
        <span>{post.author || 'Anonim'}</span>
        <span className="mx-2">·</span>
        <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString('id-ID')}</time>
        {post.category && (
          <>
            <span className="mx-2">·</span>
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] sm:text-xs">{post.category}</span>
          </>
        )}
      </div>

      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-72 md:h-96 object-cover rounded-xl mb-8"
          crossOrigin="anonymous"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/1200x600?text=No+Image';
          }}
        />
      )}

      <div className="prose max-w-none prose-p:leading-7 text-xs sm:text-sm md:text-base">
        {post.content || 'Konten belum tersedia.'}
      </div>
      </article>
      <Footer />
    </>
  );
};

export default BlogDetail;
