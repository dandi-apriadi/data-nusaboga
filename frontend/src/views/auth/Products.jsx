import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Footer from '../../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { MdShoppingCart, MdStarRate, MdSearch, MdGridView, MdViewList, MdFavorite, MdVerified, MdLocalShipping, MdSort, MdFilterList, MdClose, MdAdd, MdRemove } from 'react-icons/md';
import { FiHeart, FiEye, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
// API helpers (ensure path stays within src folder)
import { apiGet, apiPost, getApiBase } from '../../utils/apiClient';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProductFlipCard from '../../components/ProductFlipCard';

const Products = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popular');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]); // dynamic
  const [products, setProducts] = useState([]); // dynamic
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [adding, setAdding] = useState({}); // product_id => 'cart' | 'wishlist'
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  // Cart modal state
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const auth = useSelector(state => state.auth);
  const user = auth?.user;
  const navigate = useNavigate();
  const [authMessage, setAuthMessage] = useState(null);
  const [flippedCards, setFlippedCards] = useState({}); // State untuk flip cards

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    AOS.init({
      duration: 400,
      once: true,
      easing: 'ease-out',
      disable: isMobile ? 'mobile' : false
    });
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await apiGet('/api/catalog/categories');
      // adapt to expected shape id/name/count
      const mapped = data.map(c => ({
        id: c.category_id,
        name: c.name,
        count: c.product_count || 0
      }));
      // prepend "all"
      const total = mapped.reduce((a,b)=>a + (b.count||0),0);
      setCategories([{ id: 'all', name: 'Semua Produk', count: total }, ...mapped]);
    } catch (e) {
      console.error('Fetch categories error', e);
      setError(e.message || 'Gagal memuat kategori');
    }
  }, []);

  // Fetch products with query params
  // Helper: pilih URL gambar dari record produk
  const resolveImage = (p) => {
    // Prioritas: product_images primary -> product_images[0] -> image_url
    let candidate = null;
    if (Array.isArray(p.product_images) && p.product_images.length) {
      const primary = p.product_images.find(img => img.is_primary);
      candidate = primary?.url || p.product_images[0].url;
    }
    if (!candidate && p.image_url) candidate = p.image_url;
    if (!candidate) return 'https://via.placeholder.com/400x300?text=Produk';
    // Lengkapi jika relative
    const base = getApiBase();
    if (/^https?:\/\//i.test(candidate)) return candidate;
    // hapus double slash
    return base ? `${base.replace(/\/$/, '')}${candidate.startsWith('/') ? candidate : '/' + candidate}` : candidate;
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (filterCategory !== 'all' && filterCategory) params.append('category_id', filterCategory);
      // backend supports pagination; keep simple for now
      const data = await apiGet('/api/catalog/products?' + params.toString());
      const items = data.items || [];
      // Map to expected properties for render compatibility
      const mapped = items.map(p => {
        const stockValue = p.stock ?? p.stock_count ?? p.quantity ?? p.available_stock ?? 0;
        return {
          id: p.product_id,
          name: p.name,
          category: p.category_id,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : null,
          rating: p.rating_avg ? Number(p.rating_avg) : 0,
          reviews: p.reviews_count || 0,
          sold: p.sold_count || 0,
          stock: Number(stockValue) < 0 ? 0 : Number(stockValue),
          image: resolveImage(p),
          badge: deriveBadge(p),
          description: p.description || '',
          weight_grams: p.weight_grams !== undefined ? p.weight_grams : null
        };
      });
      setProducts(mapped);
    } catch (e) {
      console.error('Fetch products error', e);
      setError(e.message || 'Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterCategory]);

  // Determine badge (simple heuristic)
  const deriveBadge = (p) => {
    if (p.sold_count > 50) return 'Terlaris';
    if (p.original_price && Number(p.original_price) > Number(p.price)) return 'Promo';
    if (p.rating_avg && Number(p.rating_avg) >= 4.8) return 'Premium';
    return null;
  };

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Top 3 products by sold (with rating tiebreaker)
  const topProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    const arr = [...products];
    arr.sort((a,b) => {
      if (b.sold === a.sold) return b.rating - a.rating;
      return b.sold - a.sold;
    });
    return arr.slice(0,3);
  }, [products]);

  const requireLogin = (actionLabel) => {
    setAuthMessage(`Silakan login untuk ${actionLabel}. Mengarahkan ke halaman login...`);
    setTimeout(() => navigate('/auth/login'), 900);
  };

  // Toggle flip card
  const toggleFlip = (productId) => {
    setFlippedCards(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // Open cart modal replacing direct add
  const openCartModal = (product) => {
    if (!user) { requireLogin('menambah ke keranjang'); return; }
    setSelectedProduct(product);
    setQuantity(1);
    setCartModalOpen(true);
  };

  const closeCartModal = () => {
    if (adding[selectedProduct?.id] === 'cart') return; // block close while submitting
    setCartModalOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
  };

  const commitAddToCart = async () => {
    if (!selectedProduct) return;
    if (adding[selectedProduct.id]) return;
    if (selectedProduct.stock !== undefined && quantity > selectedProduct.stock) {
      toast.error('Jumlah melebihi stok tersedia', { autoClose: 2200 });
      return;
    }
    setAdding(a => ({ ...a, [selectedProduct.id]: 'cart' }));
    try {
      await apiPost('/api/cart/items', { product_id: selectedProduct.id, quantity, price_at_add: selectedProduct.price });
      toast.success('Produk ditambahkan ke keranjang', { autoClose: 2000 });
      closeCartModal();
    } catch (e) {
      console.error('Add to cart failed', e);
      setError(e.message || 'Gagal menambah ke keranjang');
      toast.error(e.message || 'Gagal menambah ke keranjang', { autoClose: 2600 });
    } finally {
      setAdding(a => ({ ...a, [selectedProduct.id]: null }));
    }
  };

  const increaseQty = () => setQuantity(q => {
    if (!selectedProduct) return q;
    const max = selectedProduct.stock ?? 9999;
    return q >= max ? q : q + 1;
  });
  const decreaseQty = () => setQuantity(q => (q <= 1 ? 1 : q - 1));
  const onChangeQty = (val) => {
    if (!selectedProduct) return;
    let num = parseInt(val, 10);
    if (isNaN(num) || num < 1) num = 1;
    const max = selectedProduct.stock ?? 9999;
    if (num > max) num = max;
    setQuantity(num);
  };

  // Fetch existing wishlist items once user is known
  const loadWishlist = useCallback(async () => {
    if (!user) { setWishlistIds(new Set()); return; }
    setLoadingWishlist(true);
    try {
      const data = await apiGet('/api/wishlist');
      // Normalize possible shapes: data.items, data, array of items each maybe has product_id or Product.product_id
      const rawItems = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
      const ids = new Set();
      rawItems.forEach(it => {
        if (it.product_id) ids.add(it.product_id);
        else if (it.productId) ids.add(it.productId);
        else if (it.Product && (it.Product.product_id || it.Product.id)) ids.add(it.Product.product_id || it.Product.id);
      });
      setWishlistIds(ids);
    } catch (e) {
      console.error('Load wishlist failed', e);
    } finally {
      setLoadingWishlist(false);
    }
  }, [user]);

  useEffect(() => { loadWishlist(); }, [loadWishlist]);

  const handleAddWishlist = async (product) => {
    if (adding[product.id]) return;
    if (!user) { requireLogin('menambah ke wishlist'); return; }
    if (wishlistIds.has(product.id)) {
      // Already wishlisted: no action (could implement removal later)
      return;
    }
    setAdding(a => ({ ...a, [product.id]: 'wishlist' }));
    try {
      await apiPost('/api/wishlist', { product_id: product.id });
      setWishlistIds(prev => new Set(prev).add(product.id));
      toast.success('Ditambahkan ke wishlist', { position: 'top-right', autoClose: 2200 });
    } catch (e) {
      console.error('Add wishlist failed', e);
      setError(e.message || 'Gagal menambah wishlist');
      toast.error(e.message || 'Gagal menambah wishlist', { position: 'top-right', autoClose: 2800 });
    } finally {
      setAdding(a => ({ ...a, [product.id]: null }));
    }
  };

  const filteredProducts = products; // backend already filtered

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id.localeCompare ? b.id.localeCompare(a.id) : 0; // UUID ordering fallback
      default:
        return b.sold - a.sold; // popular
    }
  });

  const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Terlaris': return 'bg-red-500';
      case 'Baru': return 'bg-green-500';
      case 'Premium': return 'bg-purple-500';
      case 'Promo': return 'bg-orange-500';
      default: return 'bg-blue-500';
    }
  };

  // State untuk collapse kategori (harus di luar callback render)
  const [collapsed, setCollapsed] = useState({});
  const toggleCollapse = (catId) => setCollapsed(prev => ({ ...prev, [catId]: !prev[catId] }));

  return (
    <div className="min-h-screen bg-slate-50">
      <ToastContainer theme="light" newestOnTop pauseOnFocusLoss={false} closeOnClick draggable pauseOnHover={false} />
      {/* Hero Section - Creative Design */}
      <section className="relative min-h-[70vh] md:min-h-[85vh] lg:min-h-[90vh] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        {/* Creative Background Elements */}
        <div className="absolute inset-0">
          {/* Geometric Shapes */}
          <div className="hidden sm:block absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full filter blur-xl animate-pulse"></div>
          <div className="hidden md:block absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-3xl rotate-45 animate-float"></div>
          <div className="hidden sm:block absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full filter blur-2xl animate-pulse delay-1000"></div>
          
          {/* Enhanced Floating Food Elements with Blue Accents */}
          <div className="absolute top-1/4 right-1/3 opacity-10 animate-float delay-500">
            <div className="text-6xl filter drop-shadow-lg">🐟</div>
          </div>
          <div className="absolute bottom-1/3 left-1/4 opacity-8 animate-float delay-1000">
            <div className="text-4xl filter drop-shadow-lg">🍽️</div>
          </div>
          <div className="absolute top-1/2 left-10 opacity-6 animate-float delay-700">
            <div className="text-3xl filter drop-shadow-lg">⭐</div>
          </div>
          
          {/* Blue Accent Orbs */}
          <div className="absolute top-1/3 left-1/2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-cyan-500/20 rounded-full filter blur-lg animate-pulse delay-300"></div>
          <div className="absolute bottom-1/4 right-1/3 w-20 h-20 bg-gradient-to-br from-white/10 to-blue-300/15 rounded-full filter blur-xl animate-pulse delay-700"></div>
          
          {/* Animated Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.1) 2px, transparent 2px)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left Content */}
            <div className="text-left space-y-8">
              {/* Creative Badge */}
              <div className="inline-flex items-center">
                <div className="flex items-center px-4 py-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-full border border-amber-400/30">
                  <span className="w-3 h-3 bg-amber-400 rounded-full mr-3 animate-ping"></span>
                  <span className="text-amber-300 font-semibold text-sm tracking-wide">PRODUK TERLARIS</span>
                </div>
                <div className="ml-3 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                  <span className="text-white text-xs font-bold">🔥 HOT</span>
                </div>
              </div>

              {/* Creative Typography */}
              <div>
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                  <span className="block text-white">Cita Rasa</span>
                  <span className="relative">
                    <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent animate-gradient">
                      Nusantara
                    </span>
                    <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"></div>
                  </span>
                  <span className="block text-white mt-2">Dalam Setiap</span>
                  <span className="block">
                    <span className="text-amber-400">Gigitan</span>
                    <span className="text-white"> 🍴</span>
                  </span>
                </h1>
              </div>

              {/* Creative Description */}
              <div>
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 max-w-lg">
                  Jelajahi kekayaan kuliner <span className="text-amber-300 font-semibold">Nusantara</span> melalui 
                  koleksi produk olahan ikan cakalang premium yang dibuat dengan resep turun-temurun.
                </p>
                
                {/* Feature Highlights */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs sm:text-sm font-medium border border-green-500/30">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    100% Alami
                  </span>
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs sm:text-sm font-medium border border-blue-500/30">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    Tanpa Pengawet
                  </span>
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs sm:text-sm font-medium border border-purple-500/30">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    Kualitas Premium
                  </span>
                </div>
              </div>

              {/* Creative CTA */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    const productsSection = document.getElementById('products-section');
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <span className="mr-2">🛒</span>
                    <span>Belanja Sekarang</span>
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </button>
                
                <button className="px-8 py-4 border-2 border-slate-400/50 text-slate-300 font-semibold rounded-2xl hover:bg-white/5 hover:border-slate-300 transition-all duration-300 backdrop-blur-sm">
                  <span className="mr-2">📖</span>
                  Pelajari Lebih Lanjut
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">25+</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Produk</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">4.8★</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">1K+</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Terjual</div>
                </div>
              </div>
            </div>

            {/* Right Content - Creative Product Showcase (dynamic top 3 sold) */}
            <div className="relative">
              {(() => {
                const main = topProducts[0];
                const second = topProducts[1];
                const third = topProducts[2];
                const placeholderImg = 'https://via.placeholder.com/400x300?text=Produk';
                return (
                  <div className="relative z-10 mx-auto max-w-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 to-orange-500/30 rounded-full filter blur-3xl animate-pulse"></div>
                    <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                      {/* Main Product (Top #1) */}
                      <div className="relative mb-6">
                        <img
                          src={main?.image || placeholderImg}
                          alt={main?.name || 'Produk Teratas'}
                          className="w-full h-48 object-cover rounded-2xl shadow-lg"
                          loading="lazy"
                        />
                        <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                          {main ? '🔥 #1' : '...' }
                        </div>
                        {main && (
                          <div className="absolute bottom-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                            <MdShoppingCart className="w-3 h-3" /> {main.sold} terjual
                          </div>
                        )}
                      </div>
                      {/* Product Grid (Top #2 & #3) */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                          <img
                            src={second?.image || placeholderImg}
                            alt={second?.name || 'Produk Kedua'}
                            className="w-full h-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                          <div className="absolute top-1 left-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">#2</div>
                          {second && (
                            <div className="absolute bottom-2 left-2 text-white text-[11px] font-semibold line-clamp-1 pr-4">
                              {second.name}
                            </div>
                          )}
                        </div>
                        <div className="relative group">
                          <img
                            src={third?.image || placeholderImg}
                            alt={third?.name || 'Produk Ketiga'}
                            className="w-full h-24 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl"></div>
                          <div className="absolute top-1 left-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-1.5 py-0.5 rounded">#3</div>
                          {third && (
                            <div className="absolute bottom-2 left-2 text-white text-[11px] font-semibold line-clamp-1 pr-4">
                              {third.name}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Product Info (Title dynamic) */}
                      <div className="mt-6 text-center">
                        <h3 className="text-white font-bold text-lg mb-2">
                          {main ? main.name : 'Koleksi Premium'}
                        </h3>
                        <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                          {main ? (main.description || 'Produk unggulan dengan penjualan tertinggi.') : 'Pilihan terbaik dari Nusa Tenggara'}
                        </p>
                        {main && (
                          <div className="flex items-center justify-center space-x-2 text-xs text-white/80">
                            <span className="font-semibold text-amber-300">{formatPrice(main.price)}</span>
                            {main.originalPrice && main.originalPrice > main.price && (
                              <span className="line-through text-white/50">{formatPrice(main.originalPrice)}</span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">{main.sold} terjual</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Floating Elements (preserved) */}
                    <div className="absolute -top-6 -left-6 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-float">
                      <span className="text-white font-bold">⭐</span>
                    </div>
                    <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-float delay-500">
                      <span className="text-white font-bold text-sm">100%</span>
                    </div>
                    <div className="absolute top-1/2 -left-8 w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full animate-float delay-1000"></div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Bottom Section - Customer Trust */}
          <div className="mt-20 text-center">
            <p className="text-slate-400 mb-6">Dipercaya oleh ribuan pelanggan di seluruh Indonesia</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              <div className="flex items-center space-x-2">
                <span className="text-amber-400">⭐⭐⭐⭐⭐</span>
                <span className="text-slate-300 text-sm">500+ Ulasan</span>
              </div>
              <div className="w-px h-6 bg-slate-600"></div>
              <div className="flex items-center space-x-2">
                <span className="text-green-400">✓</span>
                <span className="text-slate-300 text-sm">Pengiriman Aman</span>
              </div>
              <div className="w-px h-6 bg-slate-600"></div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-400">🏆</span>
                <span className="text-slate-300 text-sm">Kualitas Terjamin</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter & Search Section - Improved */}
      <section id="products-section" className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md w-full">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Cari produk cakalang..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6347] focus:border-transparent transition-all text-slate-700 placeholder-slate-400"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 w-full lg:w-auto">
              {/* Category Filter */}
              <div className="relative flex-1 lg:flex-none">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none w-full lg:w-auto pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6347] text-slate-700 bg-white cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
              </div>

              {/* Sort Filter */}
              <div className="relative flex-1 lg:flex-none">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none w-full lg:w-auto pl-4 pr-10 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6347] text-slate-700 bg-white cursor-pointer"
                >
                  <option value="popular">Terpopuler</option>
                  <option value="newest">Terbaru</option>
                  <option value="price-low">Harga Terendah</option>
                  <option value="price-high">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 pointer-events-none" />
              </div>

              {/* View Mode */}
              <div className="flex border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-[#FF6347] text-white shadow-sm' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MdGridView className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 transition-all ${
                    viewMode === 'list' 
                      ? 'bg-[#FF6347] text-white shadow-sm' 
                      : 'bg-transparent text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MdViewList className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results Info */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-slate-600 text-sm">
              Menampilkan <span className="font-semibold text-slate-900">{sortedProducts.length}</span> produk
              {filterCategory !== 'all' && (
                <span> dalam kategori <span className="font-semibold text-[#A5352D]">"{categories.find(c => c.id === filterCategory)?.name}"</span></span>
              )}
              {searchQuery && (
                <span> untuk <span className="font-semibold text-[#A5352D]">"{searchQuery}"</span></span>
              )}
            </p>
          </div>
        </div>
      </section>

      {authMessage && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm flex items-center justify-between gap-4">
            <span>{authMessage}</span>
            <button onClick={() => setAuthMessage(null)} className="text-xs font-semibold underline">Tutup</button>
          </div>
        </div>
      )}

      {/* Products Section - Ultra Modern & Professional */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-[#FAFAFA] via-[#FFFFFF] to-[#F5F5F5]">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {viewMode === 'grid' ? (
            (() => {
              // Kelompokkan produk berdasarkan kategori
              const grouped = {};
              sortedProducts.forEach((p) => {
                const catId = p.category || 'tanpa_kategori';
                if (!grouped[catId]) grouped[catId] = [];
                grouped[catId].push(p);
              });
              // Tentukan kategori yang akan ditampilkan
              let showCategories = categories.filter(c => c.id !== 'all');
              if (filterCategory !== 'all') {
                showCategories = showCategories.filter(c => c.id === filterCategory);
              }

              // Render baris per kategori
              return (
                <div className="space-y-16">
                  {showCategories.map((cat, idx) => (
                    <div key={cat.id} className="relative">
                      {/* Category Header - Bright Theme */}
                      <div className="mb-8 flex items-center justify-between cursor-pointer select-none group" onClick={() => toggleCollapse(cat.id)}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6347] to-[#FF8E53] rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                            <div className="relative px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6347] to-[#FF8E53] text-white font-black text-lg shadow-lg group-hover:shadow-xl transition-all">
                              {cat.name}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="px-4 py-2 bg-white rounded-xl shadow-sm border-2 border-slate-200">
                              <span className="text-slate-700 text-sm font-bold">{cat.count}</span>
                              <span className="text-slate-500 text-xs ml-1">produk</span>
                            </div>
                            <button className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm border-2 border-slate-200 hover:border-[#FF6347] hover:bg-[#FFF5F0] transition-all">
                              <span className="text-slate-600 font-bold transition-transform duration-300" style={{ transform: collapsed[cat.id] ? 'rotate(0deg)' : 'rotate(180deg)' }}>
                                ▼
                              </span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Decorative Line */}
                        <div className="hidden lg:block flex-1 ml-6 h-px bg-gradient-to-r from-slate-200 to-transparent" />
                      </div>

                      {/* Products Grid - Enhanced */}
                      {!collapsed[cat.id] && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                          {(grouped[cat.id] || []).length === 0 ? (
                            <div className="col-span-full text-center py-12">
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mb-4">
                                <FiShoppingBag className="w-8 h-8 text-slate-400" />
                              </div>
                              <p className="text-slate-500 text-sm font-medium">Tidak ada produk dalam kategori ini</p>
                            </div>
                          ) : (
                            (grouped[cat.id] || []).map((product, index) => {
                              // Transform product data untuk ProductFlipCard
                              const flipCardProduct = {
                                id: product.id,
                                name: product.name,
                                price: formatPrice(product.price),
                                image: product.image,
                                rating: product.rating || 0,
                                sold: `${product.sold}+ terjual`,
                                stock: product.stock || 0,
                                description: product.description || ''
                              };

                              return (
                                <ProductFlipCard
                                  key={product.id}
                                  product={flipCardProduct}
                                  isFlipped={flippedCards[product.id] || false}
                                  onToggleFlip={() => toggleFlip(product.id)}
                                  onAddToCart={() => openCartModal(product)}
                                />
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (
            /* List View - Ultra Modern & Professional */
            <div className="space-y-6">
              {sortedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/60 hover:border-[#FF6B6B]/30"
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    <div className="relative lg:w-80 xl:w-96 h-64 lg:h-auto overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                        crossOrigin="anonymous"
                        loading="lazy"
                      />
                      
                      {/* Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
                        {product.badge && (
                          <div className={`flex items-center gap-1.5 ${getBadgeColor(product.badge)} text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg backdrop-blur-sm border border-white/30`}>
                            {product.badge === 'Terlaris' && <span>🔥</span>}
                            {product.badge === 'Premium' && <span>⭐</span>}
                            {product.badge === 'Promo' && <span>%</span>}
                            <span>{product.badge.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Sold Counter */}
                      <div className="absolute bottom-4 left-4 z-20">
                        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/60">
                          <div className="relative w-2 h-2">
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                            <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                          </div>
                          <span className="text-sm font-black text-slate-700">{product.sold}+ terjual</span>
                        </div>
                      </div>
                      
                      {/* Stock Warning */}
                      {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute bottom-4 right-4 z-20">
                          <div className="flex items-center gap-1.5 bg-amber-500 text-white px-3 py-2 rounded-xl text-xs font-bold shadow-lg">
                            <span>⚡</span>
                            <span>Stok Terbatas!</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Section */}
                    <div className="flex-1 p-6 lg:p-8">
                      <div className="flex flex-col h-full">
                          {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 mb-3 group-hover:text-[#A5352D] transition-colors leading-tight">
                            {product.name}
                          </h3>
                          <p className="text-slate-600 text-xs sm:text-sm lg:text-base mb-6 leading-relaxed line-clamp-3">
                            {product.description}
                          </p>
                          
                          {/* Features/Highlights */}
                          <div className="flex flex-wrap gap-2 mb-6">
                            <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold border border-green-200">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                              100% Halal
                            </span>
                            <span className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2" />
                              Kualitas Premium
                            </span>
                            <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-semibold border border-purple-200">
                              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2" />
                              Tanpa Pengawet
                            </span>
                          </div>
                        </div>
                        
                        {/* Price & Actions */}
                        <div className="border-t-2 border-slate-100 pt-6 mt-auto">
                          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                            {/* Price Section */}
                            <div>
                              <p className="text-xs text-slate-500 font-semibold mb-2 tracking-wide uppercase">Harga Spesial</p>
                              <div className="flex items-baseline gap-3 mb-2">
                                <span className="text-3xl lg:text-4xl font-black bg-gradient-to-r from-[#A5352D] to-[#D08863] bg-clip-text text-transparent">
                                  {formatPrice(product.price)}
                                </span>
                                {product.originalPrice && product.originalPrice > product.price && (
                                  <span className="text-lg text-slate-400 line-through">
                                    {formatPrice(product.originalPrice)}
                                  </span>
                                )}
                              </div>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6347] text-white rounded-lg text-xs font-black">
                                  <span>🔥</span>
                                  <span>HEMAT {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%</span>
                                </div>
                              )}
                              {product.stock !== undefined && (
                                <div className="mt-2">
                                  <span className={`text-xs font-semibold px-3 py-1 rounded-lg inline-block ${
                                    product.stock === 0 
                                      ? 'bg-red-100 text-red-700' 
                                      : product.stock <= 5
                                      ? 'bg-amber-100 text-amber-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {product.stock === 0 ? 'Stok Habis' : `Stok tersedia: ${product.stock}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[300px]">
                              <button
                                onClick={() => openCartModal(product)}
                                disabled={product.stock !== undefined && product.stock === 0}
                                className="flex-1 relative px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF6347] via-[#FF4500] to-[#FF6347] text-white font-black text-base shadow-lg hover:shadow-2xl hover:shadow-[#FF6347]/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group/cart overflow-hidden"
                              >
                                {/* Shine Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover/cart:translate-x-full transition-transform duration-700" />
                                
                                {/* Content */}
                                <div className="relative flex items-center justify-center gap-3">
                                  <MdShoppingCart className="h-6 w-6 group-hover/cart:rotate-12 transition-transform duration-300" />
                                  <span>{product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}</span>
                                </div>
                                
                                {/* Badge */}
                                {product.stock > 0 && (
                                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                                    <span className="text-sm font-black text-slate-900">+</span>
                                  </div>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State - Enhanced */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FiShoppingBag className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Produk tidak ditemukan</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Maaf, tidak ada produk yang sesuai dengan kriteria pencarian Anda. 
                Coba ubah filter atau kata kunci pencarian.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setFilterCategory('all');
                  setSortBy('popular');
                }}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900 mb-4">Mengapa Memilih Kami?</h2>
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
              Komitmen kami adalah memberikan produk berkualitas tinggi dengan pelayanan terbaik untuk kepuasan Anda.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <MdVerified className="h-10 w-10" />
                <div className="absolute -inset-2 bg-green-500/20 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Kualitas Terjamin</h3>
              <p className="text-slate-600 leading-relaxed">
                Semua produk telah melalui kontrol kualitas ketat dengan standar internasional 
                untuk memastikan kesegaran dan cita rasa terbaik.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <MdLocalShipping className="h-10 w-10" />
                <div className="absolute -inset-2 bg-indigo-500/20 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Pengiriman Cepat</h3>
              <p className="text-slate-600 leading-relaxed">
                Kemasan aman dengan sistem pengiriman cepat ke seluruh Indonesia. 
                Produk dijamin sampai dalam kondisi segar dan berkualitas.
              </p>
            </div>
            
            <div className="text-center group" data-aos="fade-up" data-aos-delay="200">
              <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <MdFavorite className="h-10 w-10" />
                <div className="absolute -inset-2 bg-amber-500/20 rounded-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Kepuasan Pelanggan</h3>
              <p className="text-slate-600 leading-relaxed">
                Garansi uang kembali 100% jika tidak puas dengan produk kami. 
                Customer service siap melayani 24/7 untuk kepuasan Anda.
              </p>
            </div>
          </div>
          
          {/* Additional Trust Indicators */}
          <div className="mt-16 pt-12 border-t border-slate-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div data-aos="fade-up" data-aos-delay="300">
                <div className="text-3xl font-bold text-indigo-600 mb-2">500+</div>
                <div className="text-slate-600 text-sm">Pelanggan Puas</div>
              </div>
              <div data-aos="fade-up" data-aos-delay="350">
                <div className="text-3xl font-bold text-indigo-600 mb-2">24/7</div>
                <div className="text-slate-600 text-sm">Customer Support</div>
              </div>
              <div data-aos="fade-up" data-aos-delay="400">
                <div className="text-3xl font-bold text-indigo-600 mb-2">99%</div>
                <div className="text-slate-600 text-sm">Rating Positif</div>
              </div>
              <div data-aos="fade-up" data-aos-delay="450">
                <div className="text-3xl font-bold text-indigo-600 mb-2">5★</div>
                <div className="text-slate-600 text-sm">Rating Toko</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    {cartModalOpen && selectedProduct && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeCartModal} />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
          <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600" onClick={closeCartModal}>
            <MdClose className="h-5 w-5" />
          </button>
          <div className="flex items-start gap-4 mb-5">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-24 h-24 object-cover rounded-xl border border-slate-100"
              onError={(e)=> { e.target.src='https://via.placeholder.com/120x120?text=Produk'; }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2">{selectedProduct.name}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-2">{selectedProduct.description}</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-600 font-bold text-lg">{formatPrice(selectedProduct.price)}</span>
                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                  <span className="text-xs text-slate-400 line-through">{formatPrice(selectedProduct.originalPrice)}</span>
                )}
              </div>
              {selectedProduct.stock !== undefined && (
                <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${selectedProduct.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                  Stok tersedia: {selectedProduct.stock}
                </div>
              )}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah</label>
            <div className="flex items-center gap-3">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
                disabled={quantity <= 1 || adding[selectedProduct.id]==='cart'}
                onClick={decreaseQty}
              ><MdRemove className="h-5 w-5"/></button>
              <input
                type="number"
                min={1}
                max={selectedProduct.stock ?? 9999}
                value={quantity}
                onChange={(e)=> onChangeQty(e.target.value)}
                className="w-20 text-center border border-slate-200 rounded-xl py-2 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
                disabled={(selectedProduct.stock !== undefined && quantity >= selectedProduct.stock) || adding[selectedProduct.id]==='cart'}
                onClick={increaseQty}
              ><MdAdd className="h-5 w-5"/></button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={closeCartModal}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
              disabled={adding[selectedProduct.id]==='cart'}
            >Batal</button>
            <button
              onClick={commitAddToCart}
              disabled={adding[selectedProduct.id]==='cart' || selectedProduct.stock === 0}
              className={`px-6 py-2.5 rounded-xl font-semibold inline-flex items-center shadow-md hover:shadow-lg transition-all ${selectedProduct.stock === 0 ? 'bg-slate-400 text-white' : 'bg-gradient-to-r from-[#FF6347] to-[#FF4500] text-white hover:from-[#FF4500] hover:to-[#D84315]'}`}
            >
              {adding[selectedProduct.id]==='cart' ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" /> Menambahkan...
                </>
              ) : (
                <>
                  <MdShoppingCart className="mr-2 h-5 w-5"/> Tambahkan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
      <Footer />
    </div>
  );
};

export default Products;
