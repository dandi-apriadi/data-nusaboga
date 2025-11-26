
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  MdShoppingCart,
  MdLocalShipping,
  MdSecurity,
  MdStarRate,
  MdArrowForward,
  MdCheckCircle,
  MdRestaurant,
  MdKitchen,
  MdLocalDining,
  MdFavorite,
  MdTrendingUp,
  MdSupport,
  MdVerified
} from 'react-icons/md';
import { FiShoppingBag, FiHeart, FiUser, FiArrowRight, FiPackage } from 'react-icons/fi';
import { apiGet, apiPost, getApiBase } from '../../utils/apiClient';
import Footer from '../../components/Footer';
import { bannerApi } from '../../api/bannerApi';
import ProductFlipCard from '../../components/ProductFlipCard';


// Default static slides (fallback)
const staticSlides = [
  {
    url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=900&q=80",
    alt: "Banner Iklan Lyvia Nusa Boga 1",
    title: "Abon Cakalang Premium",
    desc: "Rasakan gurihnya abon cakalang asli Manado."
  },
  {
    url: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=900&q=80",
    alt: "Banner Iklan Lyvia Nusa Boga 2",
    title: "Dendeng Cakalang Pedas",
    desc: "Pedas nikmat, cocok untuk lauk dan camilan."
  },
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    alt: "Banner Iklan Lyvia Nusa Boga 3",
    title: "Cakalang Fufu Asap",
    desc: "Cita rasa tradisional, aroma asap menggoda."
  }
];

const Homepage = () => {

  const [slideIdx, setSlideIdx] = useState(0);
  const [heroSlides, setHeroSlides] = useState(staticSlides);
  const slideInterval = useRef(null);
  const slideshowRef = useRef(null);
  const touchStartX = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [flippedCards, setFlippedCards] = useState({}); // State untuk flip cards
  
  // Toggle flip card
  const toggleFlip = (productId) => {
    console.log('Toggling flip for product:', productId);
    setFlippedCards(prev => {
      const newState = {
        ...prev,
        [productId]: !prev[productId]
      };
      console.log('New flipped state:', newState);
      return newState;
    });
  };
  
  // Fetch banners for hero section
  useEffect(() => {
    (async () => {
      try {
        const res = await bannerApi.getPublicBanners();
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          // Only show active banners, ordered
          const slides = res.data.filter(b => b.is_active).map(b => ({
            url: b.image_url,
            alt: b.title,
            title: b.title,
            desc: b.description || ''
          }));
          if (slides.length > 0) setHeroSlides(slides);
        }
      } catch (e) {
        // fallback to staticSlides
        setHeroSlides(staticSlides);
      }
    })();
  }, []);

  // Auto-slide with pause on hover and responsive to slides length
  useEffect(() => {
    // guard: no slides
    if (isPaused || !heroSlides || heroSlides.length === 0) return;
    // reset any previous interval
    if (slideInterval.current) clearInterval(slideInterval.current);
    slideInterval.current = setInterval(() => {
      setSlideIdx((prev) => {
        const len = heroSlides.length;
        if (!len) return 0;
        return (prev + 1) % len;
      });
    }, 4000);
    return () => {
      if (slideInterval.current) clearInterval(slideInterval.current);
    };
  }, [isPaused, heroSlides.length]);

  const goToSlide = (idx) => {
    const len = heroSlides?.length || 0;
    if (!len) return;
    const clamped = Math.max(0, Math.min(idx, len - 1));
    setSlideIdx(clamped);
  };
  const prevSlide = useCallback(() => {
    const len = heroSlides?.length || 0;
    if (!len) return;
    setSlideIdx((prev) => (prev - 1 + len) % len);
  }, [heroSlides.length]);
  const nextSlide = useCallback(() => {
    const len = heroSlides?.length || 0;
    if (!len) return;
    setSlideIdx((prev) => (prev + 1) % len);
  }, [heroSlides.length]);

  // When slides change (e.g., after fetching banners), ensure index is valid
  useEffect(() => {
    const len = heroSlides?.length || 0;
    if (!len) { setSlideIdx(0); return; }
    setSlideIdx((prev) => (prev >= len ? 0 : prev));
  }, [heroSlides.length]);

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) prevSlide();
    else if (diff < -50) nextSlide();
    touchStartX.current = null;
  };
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredProducts, setFeaturedProducts] = useState([]); // from /api/catalog/products-top/public
  // Testimonials removed per request
  const [publicStats, setPublicStats] = useState({ product_total: 0, customer_total: 0, avg_rating: 0 });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState(null);

  useEffect(() => {
    // Disable AOS on mobile for better performance
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      AOS.init({
        duration: 400,
        once: true,
        easing: 'ease-out',
        disable: 'mobile'
      });
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tops, stats] = await Promise.all([
        apiGet('/api/catalog/products-top/public?limit=4'),
          apiGet('/api/catalog/public-stats').catch(() => ({ product_total: 0, customer_total: 0, avg_rating: 0 }))
        ]);
      const apiBase = getApiBase();
      const resolveImage = (url) => {
        if (!url) return 'https://via.placeholder.com/400x300?text=Produk';
        if (url.startsWith('http')) return url;
        // relative path
        if (!apiBase) return url; // fallback (dev proxy)
        return apiBase + (url.startsWith('/') ? url : `/${url}`);
      };
        setFeaturedProducts(tops.map(p => ({
          id: p.product_id,
          name: p.name,
          price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
          image: resolveImage(p.image_url),
          rating: p.avg_rating || 0,
          stock: p.stock || 0,
          description: p.description || null,
          weight_grams: p.weight_grams || null
        })));
      setPublicStats(stats);
    } catch (e) {
      setError(e.message || 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const submitNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubmittingNewsletter(true);
    setNewsletterMsg(null);
    try {
      const res = await apiPost('/api/engagement/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterMsg(res.msg || 'Berhasil berlangganan');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterMsg(err.message || 'Gagal berlangganan');
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  // Derive top (most sold) product for hero (first in featuredProducts which already sorted by sold_count desc from API)
  const heroProduct = featuredProducts && featuredProducts.length ? featuredProducts[0] : null;

  return (

  <div className="font-sans bg-[#F6D4AC] overflow-x-hidden">
    {/* Hero Section - Bright & Vibrant Modern Design */}
    <section className="relative min-h-[50vh] md:min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden w-full bg-gradient-to-br from-[#FFF8F0] via-[#FFE8D6] to-[#FFF5E1]">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Colorful Gradient Blobs */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-20 -left-20 w-[600px] h-[600px] bg-gradient-to-br from-[#FFB88C] via-[#FFA07A] to-[#FF9E80] rounded-full blur-[100px] animate-blob-float" />
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-[#87CEEB] via-[#B0E0E6] to-[#ADD8E6] rounded-full blur-[90px] animate-blob-float animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-gradient-to-t from-[#FFD700] via-[#FFE55C] to-[#FFF59D] rounded-full blur-[95px] animate-blob-float animation-delay-4000" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-[#FFB6C1] via-[#FFC0CB] to-[#FFE4E1] rounded-full blur-[80px] animate-blob-float animation-delay-3000" />
        </div>

        {/* Dotted Pattern Overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle, #D08863 1.5px, transparent 1.5px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Colorful Floating Shapes */}
        <div className="hidden sm:block absolute left-[8%] top-[15%] w-24 h-24 bg-gradient-to-br from-[#FF6B6B] to-[#FFB88C] rounded-3xl rotate-12 animate-float-bounce shadow-2xl shadow-[#FF6B6B]/30" />
        <div className="hidden md:block absolute right-[10%] top-[25%] w-20 h-20 bg-gradient-to-br from-[#4ECDC4] to-[#87CEEB] rounded-full animate-float-spin shadow-2xl shadow-[#4ECDC4]/30" />
        <div className="hidden sm:block absolute left-[15%] bottom-[20%] w-28 h-28 bg-gradient-to-br from-[#FFE66D] to-[#FFD93D] rounded-2xl rotate-45 animate-float-swing shadow-2xl shadow-[#FFE66D]/30" />
        <div className="hidden md:block absolute right-[12%] bottom-[30%] w-22 h-22 bg-gradient-to-br from-[#A8E6CF] to-[#98D8C8] rounded-full animate-float-pulse shadow-2xl shadow-[#A8E6CF]/30" />
        
        {/* Sparkles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-sparkle-bright"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              background: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB'][Math.floor(Math.random() * 5)],
              borderRadius: '50%',
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              boxShadow: `0 0 20px currentColor`
            }}
          />
        ))}

        {/* Wave Patterns */}
        <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 Q300,20 600,50 T1200,50 L1200,120 L0,120 Z" fill="#D08863" />
        </svg>
        <svg className="absolute top-0 right-0 w-full opacity-10" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 Q300,80 600,50 T1200,50 L1200,0 L0,0 Z" fill="#A8D7D4" />
        </svg>

        {/* Decorative Circles with Borders */}
        <div className="hidden lg:block absolute left-[5%] top-[40%] w-32 h-32 border-4 border-[#FF6B6B]/30 rounded-full animate-spin-slow" />
        <div className="hidden lg:block absolute right-[8%] bottom-[25%] w-40 h-40 border-4 border-[#4ECDC4]/30 rounded-full animate-spin-reverse" />
      </div>

      {/* Advanced Bright Animations */}
      <style>{`
        @keyframes blob-float { 
          0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); } 
          33% { transform: translate(40px, -60px) scale(1.1) rotate(5deg); } 
          66% { transform: translate(-30px, 30px) scale(0.95) rotate(-5deg); } 
        }
        @keyframes float-bounce { 
          0%, 100% { transform: translate(0, 0) rotate(12deg); } 
          50% { transform: translate(0, -25px) rotate(18deg); } 
        }
        @keyframes float-spin { 
          0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); } 
          50% { transform: translate(-20px, 20px) rotate(180deg) scale(1.15); } 
        }
        @keyframes float-swing { 
          0%, 100% { transform: translate(0, 0) rotate(45deg); } 
          50% { transform: translate(20px, -20px) rotate(60deg); } 
        }
        @keyframes float-pulse { 
          0%, 100% { transform: scale(1); opacity: 0.8; } 
          50% { transform: scale(1.2); opacity: 1; } 
        }
        @keyframes sparkle-bright { 
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); } 
          50% { opacity: 1; transform: scale(1.5) rotate(180deg); } 
        }
        @keyframes spin-slow { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
        @keyframes spin-reverse { 
          from { transform: rotate(360deg); } 
          to { transform: rotate(0deg); } 
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-blob-float { animation: blob-float 25s ease-in-out infinite; }
        .animate-float-bounce { animation: float-bounce 4s ease-in-out infinite; }
        .animate-float-spin { animation: float-spin 6s ease-in-out infinite; }
        .animate-float-swing { animation: float-swing 5s ease-in-out infinite; }
        .animate-float-pulse { animation: float-pulse 3s ease-in-out infinite; }
        .animate-sparkle-bright { animation: sparkle-bright 3s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-spin-reverse { animation: spin-reverse 15s linear infinite; }
        .animate-gradient-x { animation: gradient-x 6s ease infinite; background-size: 200% 200%; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-3000 { animation-delay: 3s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      <div className="relative z-10 w-full px-4 md:px-8 lg:px-12 py-40 md:py-20 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-8 lg:gap-12 items-center">
          {/* Hero Content Left - Bright & Vibrant Modern */}
          <div className="w-full max-w-2xl mx-auto lg:mx-0 text-left space-y-6 lg:space-y-7">
            {/* Premium Badge - Bright Version */}
            <div className="inline-flex items-center backdrop-blur-sm bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#FF6B35] border-2 border-white/60 rounded-full px-5 py-2.5 lg:px-4 lg:py-2 shadow-2xl shadow-[#FF6B6B]/40 hover:shadow-[#FF6B6B]/60 transition-all duration-500 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative w-8 h-8 lg:w-7 lg:h-7 bg-white rounded-full flex items-center justify-center mr-2.5 lg:mr-2 shadow-lg shadow-white/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <MdVerified className="text-[#FF6B6B] w-5 h-5 lg:w-4 lg:h-4" />
              </div>
              <span className="relative text-white text-[10px] sm:text-xs lg:text-[11px] font-black tracking-wide drop-shadow-md">
                100% PRODUK LOKAL PREMIUM
              </span>
            </div>

            {/* Headline removed as requested */}

            {/* Description - Dark Text on Bright BG */}
            <div className="space-y-3 lg:space-y-2.5">
              <p className="text-xl sm:text-lg md:text-lg lg:text-base xl:text-base text-slate-700 leading-relaxed font-bold drop-shadow-sm">
                {heroSlides[slideIdx]?.desc}
              </p>

              {/* Animated Underline - Colorful (moved above the badge) */}
              <div className="mt-1 h-1.5 lg:h-1 w-28 lg:w-24 bg-gradient-to-r from-[#FF6B6B] via-[#FFD93D] to-[#4ECDC4] rounded-full shadow-lg shadow-[#FF6B6B]/40 animate-pulse" />

              <div className="flex items-center gap-2 lg:gap-2 text-[#A5352D] font-bold text-base sm:text-sm md:text-xs lg:text-xs xl:text-xs backdrop-blur-sm bg-white/70 rounded-2xl lg:rounded-xl px-3.5 sm:px-4 lg:px-3 py-2 lg:py-2 border-2 border-[#D08863]/30 w-fit shadow-lg shadow-slate-300/50">
                <div className="w-1.5 h-1.5 sm:w-1 sm:h-1 md:w-1 md:h-1 bg-[#FF6B6B] rounded-full animate-pulse shadow-lg shadow-[#FF6B6B]/50" />
                <span className="text-sm sm:text-xs md:text-xs lg:text-xs xl:text-xs">Langsung dari produsen terpercaya</span>
              </div>
            </div>

            {/* Stats Cards - Bright & Colorful */}
            <div className="grid grid-cols-3 gap-3 lg:gap-2.5">
              <div className="group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/90 to-white/70 border-2 border-[#FF6B6B]/30 rounded-2xl lg:rounded-xl p-4 lg:p-3 hover:border-[#FF6B6B] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FF6B6B]/30">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/0 to-[#FF6B6B]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl font-black bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] bg-clip-text text-transparent mb-0.5 lg:mb-0">
                    {publicStats.product_total || 20}+
                  </div>
                  <div className="text-xs sm:text-sm lg:text-xs text-slate-600 font-bold">Produk</div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/90 to-white/70 border-2 border-[#4ECDC4]/30 rounded-2xl lg:rounded-xl p-4 lg:p-3 hover:border-[#4ECDC4] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#4ECDC4]/30">
                <div className="absolute inset-0 bg-gradient-to-br from-[#4ECDC4]/0 to-[#4ECDC4]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl font-black bg-gradient-to-r from-[#4ECDC4] to-[#45B7D1] bg-clip-text text-transparent mb-0.5 lg:mb-0">
                    {publicStats.customer_total || 100}+
                  </div>
                  <div className="text-xs sm:text-sm lg:text-xs text-slate-600 font-bold">Pelanggan</div>
                </div>
              </div>
              
              <div className="group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-white/90 to-white/70 border-2 border-[#FFD93D]/30 rounded-2xl lg:rounded-xl p-4 lg:p-3 hover:border-[#FFD93D] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FFD93D]/30">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FFD93D]/0 to-[#FFD93D]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-3xl font-black bg-gradient-to-r from-[#FFD93D] to-[#FFC107] bg-clip-text text-transparent mb-0.5 lg:mb-0">
                    {publicStats.testimonial_total || 50}+
                  </div>
                  <div className="text-xs sm:text-sm lg:text-xs text-slate-600 font-bold">Review</div>
                </div>
              </div>
            </div>

            {/* CTA Buttons - Bright & Vibrant */}
            <div className="flex flex-col sm:flex-row gap-4 lg:gap-3 pt-4 lg:pt-3">
              <Link
                to="/auth/sign-in"
                className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-5 md:px-12 md:py-6 lg:px-8 lg:py-4 bg-gradient-to-r from-[#FF6347] via-[#FF4500] to-[#FF6347] text-xs sm:text-sm md:text-base lg:text-lg font-black rounded-2xl lg:rounded-xl shadow-2xl shadow-[#FF6347]/50 hover:shadow-[#FF6347]/70 transition-all duration-500 transform hover:scale-105 overflow-hidden border-2 border-white/40">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF4500] via-[#FF6347] to-[#FF4500] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300">
                  <div className="absolute inset-0 bg-white/30 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>
                <span className="relative flex items-center gap-2.5 lg:gap-2 drop-shadow-lg">
                  <FiShoppingBag className="w-6 h-6 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>MULAI BELANJA</span>
                  <FiArrowRight className="w-6 h-6 lg:w-5 lg:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Link>

              <Link
                to="/auth/products"
                className="group relative inline-flex items-center justify-center px-6 sm:px-10 py-3 sm:py-5 md:px-12 md:py-6 lg:px-8 lg:py-4 bg-white/90 backdrop-blur-md text-[#A5352D] text-xs sm:text-sm md:text-base lg:text-lg font-black rounded-2xl lg:rounded-xl shadow-xl shadow-slate-400/30 hover:shadow-2xl hover:shadow-slate-400/50 border-3 border-[#D08863] transition-all duration-500 transform hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFE8D6] via-[#FFF5E1] to-[#FFE8D6] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2.5 lg:gap-2">
                  <FiPackage className="w-6 h-6 lg:w-5 lg:h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>LIHAT PRODUK</span>
                  <FiArrowRight className="w-6 h-6 lg:w-5 lg:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </Link>
            </div>
          </div>

          {/* Hero Slideshow Right - Futuristic 3D Card */}
          <div
            className="w-full flex items-center justify-center"
            ref={slideshowRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative w-full max-w-2xl lg:max-w-none perspective-1000">
              {/* Bright Colorful Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/40 via-[#4ECDC4]/30 to-[#FFD93D]/40 rounded-[2.5rem] lg:rounded-[2rem] blur-3xl transform scale-105 animate-pulse-glow" />
              
              {/* Main Card Container - Bright Glassmorphism 
                  BANNER SPECS (16:9 Aspect Ratio):
                  - Recommended: 1920x1080px (16:9) Full HD ⭐
                  - Alternative: 1600x900px (16:9) for faster loading
                  - Cinematic: 1920x720px (21:9) for wide banners
                  - Format: JPG (80-85% quality) or PNG
                  - Max Size: 500 KB per image
                  - Display: object-contain (full image, no crop)
                  - Container: aspect-ratio 16/9 (automatic responsive scaling)
                  See: BANNER_GUIDELINES.md for complete guide
              */}
              <div className="relative w-full aspect-[16/9] rounded-[2.5rem] lg:rounded-[2rem] flex items-center justify-center backdrop-blur-md bg-white/40 border-3 border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] overflow-hidden transform-gpu hover:scale-[1.02] transition-all duration-700 group">
                
                {/* Inner Bright Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/10 via-[#4ECDC4]/10 to-[#FFD93D]/10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                {/* Animated Border Gradient - Colorful */}
                <div className="absolute inset-0 rounded-[2.5rem] p-[3px] bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#FFD93D] opacity-60 group-hover:opacity-100 transition-opacity duration-500 -z-10 animate-gradient-x">
                  <div className="w-full h-full bg-gradient-to-br from-[#FFF8F0] to-[#FFE8D6] rounded-[2.5rem]" />
                </div>

                {heroSlides.map((slide, idx) => (
                  <div
                    key={slide.url + idx}
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out ${
                      idx === slideIdx ? 'opacity-100 scale-100 z-10' : 'opacity-0 scale-90 z-0 pointer-events-none'
                    }`}
                    aria-hidden={idx !== slideIdx}
                  >
                    <div className="relative w-full h-full">
                      {/* Image Only - Clean & Simple - Full Contain */}
                      <img
                        src={slide.url}
                        alt={slide.alt}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        draggable="false"
                        onError={e => { e.currentTarget.src = 'https://via.placeholder.com/1200x600?text=Banner'; }}
                      />
                    </div>
                  </div>
                ))}

                {/* Navigation Arrows - Bright & Colorful */}
                <button
                  aria-label="Previous Slide"
                  onClick={prevSlide}
                  className="absolute left-6 lg:left-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 lg:w-11 lg:h-11 backdrop-blur-md bg-white/90 hover:bg-gradient-to-r hover:from-[#FF6B6B] hover:to-[#FF8E53] text-slate-700 hover:text-white rounded-2xl lg:rounded-xl shadow-2xl shadow-slate-400/40 border-2 border-white/80 hover:border-[#FF6B6B] transition-all duration-300 hover:scale-110 flex items-center justify-center group"
                >
                  <svg width="28" height="28" className="lg:w-6 lg:h-6 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M15 19l-7-7 7-7" />
                  </svg>
                  <div className="absolute inset-0 bg-[#FF6B6B]/0 group-hover:bg-[#FF6B6B]/20 rounded-2xl lg:rounded-xl transition-colors" />
                </button>
                
                <button
                  aria-label="Next Slide"
                  onClick={nextSlide}
                  className="absolute right-6 lg:right-4 top-1/2 -translate-y-1/2 z-30 w-14 h-14 lg:w-11 lg:h-11 backdrop-blur-md bg-white/90 hover:bg-gradient-to-r hover:from-[#4ECDC4] hover:to-[#44A08D] text-slate-700 hover:text-white rounded-2xl lg:rounded-xl shadow-2xl shadow-slate-400/40 border-2 border-white/80 hover:border-[#4ECDC4] transition-all duration-300 hover:scale-110 flex items-center justify-center group"
                >
                  <svg width="28" height="28" className="lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="absolute inset-0 bg-[#4ECDC4]/0 group-hover:bg-[#4ECDC4]/20 rounded-2xl lg:rounded-xl transition-colors" />
                </button>

                {/* Modern Progress Indicators - Bright */}
                <div className="absolute bottom-6 lg:bottom-4 left-1/2 -translate-x-1/2 flex gap-3 lg:gap-2 z-30">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      aria-label={`Go to slide ${idx + 1}`}
                      onClick={() => goToSlide(idx)}
                      className={`group relative transition-all duration-500 ${
                        slideIdx === idx ? 'w-12 lg:w-10' : 'w-4 lg:w-3'
                      }`}
                    >
                      <div className={`h-1.5 lg:h-1 rounded-full transition-all duration-500 ${
                        slideIdx === idx 
                          ? 'bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#FFD93D] shadow-lg shadow-[#FF6B6B]/60' 
                          : 'bg-slate-400/50 hover:bg-slate-600/70'
                      }`} />
                      {slideIdx === idx && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full blur-md opacity-50 animate-pulse" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Corner Accents */}
                <div className="absolute top-0 left-0 w-32 lg:w-24 h-32 lg:h-24 bg-gradient-to-br from-[#D08863]/20 to-transparent rounded-tl-[2.5rem] lg:rounded-tl-[2rem]" />
                <div className="absolute bottom-0 right-0 w-32 lg:w-24 h-32 lg:h-24 bg-gradient-to-tl from-[#A8D7D4]/20 to-transparent rounded-br-[2.5rem] lg:rounded-br-[2rem]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* Featured Products Section - Ultra Modern & Professional */}
      <section className="relative py-20 sm:py-24 lg:py-32 bg-gradient-to-br from-[#FAFAFA] via-[#FFFFFF] to-[#F5F5F5] overflow-hidden">
        {/* Sophisticated Background Pattern */}
        <div className="absolute inset-0 opacity-40">
          {/* Gradient Orbs */}
          <div className="absolute top-20 left-0 w-[500px] h-[500px] bg-gradient-to-br from-[#FF6B6B]/20 via-[#FF8E53]/10 to-transparent rounded-full blur-3xl animate-blob-float" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-[#4ECDC4]/20 via-[#87CEEB]/10 to-transparent rounded-full blur-3xl animate-blob-float animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-br from-[#FFD93D]/15 to-transparent rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, #A5352D 1px, transparent 1px), linear-gradient(to bottom, #A5352D 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Section Header */}
          <div className="text-center mb-12 sm:mb-16 lg:mb-20">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#FF6B6B] via-[#FF8E53] to-[#FFB347] text-white rounded-full text-xs sm:text-sm font-black mb-6 shadow-xl shadow-[#FF6B6B]/30 border-2 border-white/60 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
              <MdTrendingUp className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
              <span className="tracking-wide">PRODUK PILIHAN TERBAIK</span>
            </div>

            {/* Main Heading */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-6xl font-black mb-4 sm:mb-6">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#A5352D] via-[#D08863] to-[#A5352D] bg-[length:200%_100%] animate-gradient-x drop-shadow-sm">
                Produk Unggulan
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#4A90A4] via-[#4ECDC4] to-[#4A90A4] bg-[length:200%_100%] animate-gradient-x animation-delay-2000 drop-shadow-sm">
                Olahan Cakalang
              </span>
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-slate-600 max-w-3xl mx-auto font-medium leading-relaxed px-4">
              Nikmati kelezatan autentik dari <span className="font-bold text-[#A5352D]">samudra Indonesia</span> dengan produk pilihan yang paling disukai pelanggan kami
            </p>

            {/* Decorative Line */}
            <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8">
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-transparent to-[#FF6B6B] rounded-full" />
              <div className="w-3 h-3 bg-gradient-to-r from-[#FF6B6B] to-[#4ECDC4] rounded-full shadow-lg shadow-[#FF6B6B]/50" />
              <div className="w-16 sm:w-20 h-1 bg-gradient-to-l from-transparent to-[#4ECDC4] rounded-full" />
            </div>
          </div>

          {/* Premium Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-6 xl:gap-8 mb-12 sm:mb-16">
            {featuredProducts.map((product, index) => (
              <ProductFlipCard
                key={product.id}
                product={{
                  ...product,
                  name: product.name
                }}
                isFlipped={flippedCards[product.id]}
                onToggleFlip={() => toggleFlip(product.id)}
                onAddToCart={() => {
                  // Navigate to products page for full cart functionality
                  window.location.href = '/auth/products';
                }}
              />
            ))}
          </div>

          {/* Premium CTA Section */}
          <div className="text-center">
            {/* Stats Bar */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-8 sm:mb-10">
              {[
                { icon: MdRestaurant, label: '20+ Produk', color: 'from-[#FF6B6B] to-[#FF8E53]' },
                { icon: MdVerified, label: '100% Halal', color: 'from-[#4ECDC4] to-[#44A08D]' },
                { icon: MdStarRate, label: '4.8 Rating', color: 'from-[#FFD93D] to-[#FFB347]' }
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white rounded-xl shadow-md border border-slate-200/60 hover:shadow-lg hover:scale-105 transition-all duration-300">
                  <div className={`p-2 bg-gradient-to-r ${stat.color} rounded-lg`}>
                    <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm font-black text-slate-700">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* View All Button - Ultra Premium */}
            <Link
              to="/auth/products"
              className="group inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2 sm:py-4 bg-gradient-to-r from-[#4ECDC4] via-[#44A08D] to-[#4ECDC4] bg-[length:200%_100%] text-xs sm:text-sm md:text-base lg:text-lg font-black rounded-2xl hover:shadow-2xl hover:shadow-[#4ECDC4]/50 transition-all duration-500 transform hover:scale-105 active:scale-95 overflow-hidden relative border-2 border-white/30"
            >
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#44A08D] via-[#4ECDC4] to-[#44A08D] bg-[length:200%_100%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x" />
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              
              {/* Content */}
              <MdRestaurant className="relative h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative tracking-wide">Lihat Semua Produk</span>
              <MdArrowForward className="relative h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-6 sm:mt-8 text-[10px] sm:text-xs md:text-sm text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <MdCheckCircle className="w-4 h-4 text-[#4ECDC4]" />
                <span>Gratis Ongkir</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full" />
              <div className="flex items-center gap-1.5">
                <MdCheckCircle className="w-4 h-4 text-[#4ECDC4]" />
                <span>Garansi Kualitas</span>
              </div>
              <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <MdCheckCircle className="w-4 h-4 text-[#4ECDC4]" />
                <span>Produk Halal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements - Subtle */}
        <div className="absolute top-[15%] left-[3%] w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#FFD93D]/20 to-[#FFB347]/20 rounded-full blur-2xl animate-float-bounce" />
        <div className="absolute bottom-[20%] right-[5%] w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#FF6B6B]/20 to-[#FF8E53]/20 rounded-2xl blur-2xl animate-float-swing" />
        <div className="absolute top-[45%] right-[8%] w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-[#4ECDC4]/20 to-[#87CEEB]/20 rounded-full blur-2xl animate-float-pulse" />
      </section>

      {/* Features Section */}
  <section className="py-20 bg-[#A8D7D4]/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#A5352D] mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#374A47] max-w-2xl mx-auto">
              Spesialis produk olahan ikan cakalang berkualitas tinggi dengan resep tradisional turun temurun
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#A8D7D4] to-[#374A47] text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <MdVerified className="h-8 w-8" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#A5352D] mb-4">Ikan Cakalang Segar</h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#374A47] leading-relaxed">
                Menggunakan ikan cakalang segar pilihan langsung dari nelayan lokal dengan standar kualitas terbaik untuk hasil olahan premium.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#D08863] to-[#A5352D] text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <MdRestaurant className="h-8 w-8" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#A5352D] mb-4">Resep Tradisional</h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#374A47] leading-relaxed">
                Proses pengolahan menggunakan resep warisan nenek moyang dengan teknik tradisional yang telah terbukti menghasilkan cita rasa autentik.
              </p>
            </div>

            <div className="text-center group">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#A8D7D4] to-[#374A47] text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <MdLocalShipping className="h-8 w-8" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#A5352D] mb-4">Kemasan Vakum</h3>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-[#374A47] leading-relaxed">
                Packaging khusus dengan teknologi vakum untuk menjaga kesegaran, aroma, dan cita rasa produk hingga sampai ke tangan Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
  <footer className="bg-[#17221f] text-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                  <MdRestaurant className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Lyvia Nusa Boga
                </h3>
              </div>
              <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 mb-6 leading-7 md:leading-8">
                Spesialis produk olahan ikan cakalang berkualitas premium sejak 2020. Menghadirkan <span className="text-amber-300 font-semibold">abon, dendeng, fufu, dan sambal rica</span> dengan cita rasa autentik langsung ke rumah Anda.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4 mb-6">
                <div className="group w-12 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-[#D08863] hover:to-[#A5352D] transition-all duration-300 cursor-pointer transform hover:scale-110">
                  <span className="text-[10px] sm:text-xs font-bold text-white group-hover:text-white">FB</span>
                </div>
                <div className="group w-12 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-[#D08863] hover:to-[#A5352D] transition-all duration-300 cursor-pointer transform hover:scale-110">
                  <span className="text-[10px] sm:text-xs font-bold text-white group-hover:text-white">IG</span>
                </div>
                <div className="group w-12 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-[#D08863] hover:to-[#A5352D] transition-all duration-300 cursor-pointer transform hover:scale-110">
                  <span className="text-[10px] sm:text-xs font-bold text-white group-hover:text-white">WA</span>
                </div>
                <div className="group w-12 h-12 bg-[#2b2b2b] rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-[#D08863] hover:to-[#A5352D] transition-all duration-300 cursor-pointer transform hover:scale-110">
                  <span className="text-[10px] sm:text-xs font-bold text-white group-hover:text-white">YT</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-white/90">
                  <MdLocalShipping className="h-5 w-5 text-amber-300 mr-3" />
                  <span className="text-xs sm:text-sm">Pengiriman ke seluruh Indonesia</span>
                </div>
                <div className="flex items-center text-white/90">
                  <MdVerified className="h-5 w-5 text-amber-300 mr-3" />
                  <span className="text-xs sm:text-sm">Produk halal & terjamin kualitas</span>
                </div>
              </div>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-bold text-base sm:text-lg md:text-xl mb-6 text-amber-300">Produk Cakalang</h4>
              <ul className="space-y-3 text-xs sm:text-sm text-white/80">
                <li>
                  <Link to="/auth/products" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">
                    <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Abon Cakalang
                  </Link>
                </li>
                <li>
                  <Link to="/auth/products" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">   
                    <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Dendeng Cakalang
                  </Link>
                </li>
                <li>
                  <Link to="/auth/products" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">      
                    <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Cakalang Fufu
                  </Link>
                </li>
                <li>
                  <Link to="/auth/products" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">        
                    <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Sambal Rica
                  </Link>
                </li>
                <li>
                  <Link to="/auth/products" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">   
                    <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    Keripik Cakalang
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-base sm:text-lg md:text-xl mb-6 text-amber-300">Bantuan & Layanan</h4>
              <ul className="space-y-3 text-xs sm:text-sm text-white/80">
                <li>
                  <Link to="/auth/contact" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">
                    <MdSupport className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                    Pusat Bantuan
                  </Link>
                </li>
                <li>
                  <Link to="/auth/order-tracking" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">
                    <MdLocalShipping className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                    Info Pengiriman
                  </Link>
                </li>
                <li>
                  <Link to="/auth/contact" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">
                    <MdCheckCircle className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                    Kebijakan Return
                  </Link>
                </li>
                <li>
                  <Link to="/auth/contact" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">
                    <MdRestaurant className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                    Hubungi Kami
                  </Link>
                </li>
                <li>
                  <Link to="/auth/contact" className="flex items-center hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 transition-colors group">
                    <MdTrendingUp className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                    Pembelian Grosir
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border-t border-gray-700 pt-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h4 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-amber-400">Dapatkan Update Terbaru</h4>
                <p className="text-xs sm:text-sm text-gray-300">Subscribe untuk mendapatkan info produk baru dan promo menarik!</p>
              </div>
              <div className="flex gap-3">
                <form onSubmit={submitNewsletter} className="flex gap-3 w-full">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={e => setNewsletterEmail(e.target.value)}
                    placeholder="Masukkan email Anda"
                    className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    required
                  />
                  <button disabled={submittingNewsletter} className="px-6 py-3 bg-[#D08863] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl hover:bg-[#A5352D] transition-all duration-300 transform hover:scale-105">
                    {submittingNewsletter ? 'Mengirim...' : 'Subscribe'}
                  </button>
                </form>
              </div>
              {newsletterMsg && (
                <div className="md:col-span-2 text-xs sm:text-sm text-amber-300 mt-2">{newsletterMsg}</div>
              )}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-xs sm:text-sm mb-4 md:mb-0">
              © 2025 <span className="text-amber-400 font-semibold">Lyvia Nusa Boga</span> Marketplace. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <Link to="/auth/about" className="text-white/80 hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 text-xs sm:text-sm transition-colors">
                Kebijakan Privasi
              </Link>
              <Link to="/auth/about" className="text-white/80 hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 text-xs sm:text-sm transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link to="/auth/about" className="text-white/80 hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 text-xs sm:text-sm transition-colors">
                Tentang Kami
              </Link>
              <Link to="/auth/homepage" className="text-white/80 hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 text-xs sm:text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
