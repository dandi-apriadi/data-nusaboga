import React, { useEffect, useMemo } from "react";
import { useNavigate } from 'react-router-dom';
import Card from "components/card";
import Receipt from "components/Receipt";
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileSummary } from '../../store/slices/profileSlice';
import { fetchOrders } from '../../store/slices/orderSlice';
import { fetchProducts } from '../../store/slices/productSlice';
import { addToCartApi } from '../../store/slices/cartSlice';
import { 
  MdShoppingCart, 
  MdHistory, 
  MdPerson,
  MdAttachMoney,
  MdStars,
  MdLocalShipping,
  MdNotifications,
  MdTrendingUp,
  MdShoppingBag,
  MdAccountBalance,
  MdGift,
  MdLocalOffer,
  MdVerifiedUser,
  MdDashboard,
  MdExplore,
  MdBookmark,
  MdSettings,
  MdClose,
  MdAdd,
  MdRemove
} from "react-icons/md";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import buildProductImageUrl, { fallbackAvatar } from 'utils/image';

const Dashboard = () => {
  const dispatch = useDispatch();
  const profileState = useSelector(state => state.profile);
  const ordersState = useSelector(state => state.orders);
  const productsState = useSelector(state => state.products);
  const [page, setPage] = React.useState(1);
  const pageSize = 5; // items per page
  
  // Add to cart modal state (sama seperti Products.jsx)
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState(null);
  const [quantity, setQuantity] = React.useState(1);
  const [flippedCards, setFlippedCards] = React.useState({}); // Track flipped state for flip card
  const { adding, lastAddedId } = useSelector((state) => state.cart || {});

  // Fetch data on mount (profile summary already includes some orders & notifications)
  useEffect(() => {
    if (!profileState.user && !profileState.loading) {
      dispatch(fetchProfileSummary());
    }
    dispatch(fetchOrders({ page, pageSize }));
    // Fetch produk unggulan (ambil 4 teratas, bisa filter active/unggulan jika ada field)
    if (!productsState.items || productsState.items.length === 0) {
      dispatch(fetchProducts({ page: 1, pageSize: 8 }));
    }
  }, [dispatch, page, pageSize]);
  // Produk unggulan: ambil berdasarkan sold_count tertinggi
  const featuredProducts = useMemo(() => {
    let items = productsState.items || [];
    // Filter produk aktif
    items = items.filter(p => p.active !== false);
    // Urutkan berdasarkan sold_count (jumlah pembelian terverifikasi) descending
    items = items.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0));
    // Ambil 5 produk teratas (1 besar + 4 kecil)
    return items.slice(0, 5);
  }, [productsState.items]);
  // Komponen kartu produk unggulan
  // Routing
  const navigate = useNavigate();

  const FeaturedProductCard = ({ product, isMain, onClick }) => (
    <Card
      extra={`p-0 overflow-hidden border-2 transition-all duration-300 group bg-white cursor-pointer ${
        isMain
          ? 'border-amber-400 shadow-2xl shadow-amber-100 hover:shadow-amber-200 relative ring-4 ring-amber-100'
          : 'border-slate-200 hover:border-indigo-300 hover:shadow-xl transform hover:-translate-y-1'
      }`}
      onClick={onClick}
    >
      {/* Image Container with fixed aspect ratio */}
      <div className={`relative w-full overflow-hidden ${isMain ? 'h-56' : 'h-32 sm:h-36'} ${isMain ? 'bg-gradient-to-br from-amber-50 to-orange-50' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
        {product.image_url ? (
          <img
            src={buildProductImageUrl(product.image_url, product.name)}
            alt={product.name}
            className={`object-cover w-full h-full transition-transform duration-500 ${isMain ? 'scale-105 group-hover:scale-110' : 'group-hover:scale-110'}`}
            loading="lazy"
            onError={(e)=> { e.currentTarget.src = fallbackAvatar(product.name); }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className={isMain ? 'text-7xl' : 'text-4xl sm:text-5xl'}>🐟</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t ${isMain ? 'from-amber-900/20 via-transparent' : 'from-slate-900/10 via-transparent'} group-hover:from-slate-900/30 transition-all duration-300`}></div>
        
        {/* Price Badge */}
        <div className={`absolute ${isMain ? 'top-3 left-3' : 'top-2 left-2'} px-2.5 py-1 rounded-lg font-bold shadow-lg backdrop-blur-sm ${isMain ? 'text-sm' : 'text-xs'} ${
          isMain 
            ? 'bg-amber-500 text-white border-2 border-amber-300' 
            : 'bg-indigo-600 text-white'
        }`}>
          {formatCurrency(product.price)}
        </div>
        
        {/* Stock Badge */}
        <div className={`absolute ${isMain ? 'top-3 right-3' : 'top-2 right-2'} px-2 py-0.5 rounded-lg font-semibold shadow-lg backdrop-blur-sm ${isMain ? 'text-xs' : 'text-[10px]'} ${
          product.stock > 10 
            ? 'bg-green-500 text-white' 
            : product.stock > 0 
              ? 'bg-amber-500 text-white' 
              : 'bg-red-500 text-white'
        }`}>
          {product.stock > 0 ? `${product.stock}` : 'Habis'}
        </div>
        
        {/* Sold Count Badge */}
        {(product.sold_count || 0) > 0 && (
          <div className={`absolute ${isMain ? 'bottom-3 left-3' : 'bottom-2 left-2'} px-2 py-0.5 rounded-lg font-semibold shadow-lg backdrop-blur-sm bg-purple-600 text-white ${isMain ? 'text-xs' : 'text-[10px]'}`}>
            {product.sold_count} Terjual
          </div>
        )}
        
        {/* Featured Badge for Main Product */}
        {isMain && (
          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-1 bg-amber-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-amber-200 animate-pulse">
              <MdStars className="w-3 h-3" />
              <span>TOP</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className={`${isMain ? 'p-4' : 'p-2 sm:p-3'} flex flex-col ${isMain ? 'min-h-[140px]' : 'min-h-[90px] sm:min-h-[100px]'}`}> 
        <h3 className={`font-bold mb-1 line-clamp-1 transition-colors ${
          isMain 
            ? 'text-base text-amber-700 group-hover:text-amber-800' 
            : 'text-xs sm:text-sm text-slate-800 group-hover:text-indigo-700'
        }`}>
          {product.name}
        </h3>
        
        <p className={`mb-2 line-clamp-2 flex-grow ${
          isMain ? 'text-xs text-slate-600' : 'text-[10px] sm:text-[11px] text-slate-500'
        }`}>
          {product.description || 'Produk berkualitas premium dari cakalang pilihan terbaik.'}
        </p>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 mt-auto">
          <button
            className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 transform hover:scale-105 ${
              isMain 
                ? 'px-3 py-2 text-xs font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-300' 
                : 'px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-400'
            }`}
            onClick={(e) => { 
              e.stopPropagation(); 
              setSelectedProduct(product); 
              setQuantity(1); 
              setShowConfirm(true); 
            }}
            disabled={product.stock <= 0 || adding}
          >
            <MdShoppingCart className={isMain ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3'} />
            <span>{product.stock > 0 ? 'Add Cart' : 'Habis'}</span>
          </button>
          <button
            className={`flex-1 inline-flex items-center justify-center gap-1 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 transform hover:scale-105 ${
              isMain 
                ? 'px-3 py-2 text-xs font-semibold bg-white text-amber-700 border-2 border-amber-400 hover:bg-amber-50 focus:ring-amber-300' 
                : 'px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-[11px] font-semibold bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 focus:ring-amber-300'
            }`}
            onClick={e => { e.stopPropagation(); navigate(`/user/products?highlight=${product.product_id}`); }}
          >
            <MdExplore className={isMain ? 'w-3.5 h-3.5' : 'w-2.5 h-2.5 sm:w-3 sm:h-3'} />
            <span className="hidden sm:inline">Detail</span>
            <span className="sm:hidden">Info</span>
          </button>
        </div>
      </div>
    </Card>
  );

  // Derive stats from profile & orders
  const userStats = useMemo(() => {
    // Prefer global aggregates from profile summary (so pagination tidak mempengaruhi kartu statistik)
    const membership = profileState.membership || {};
    const ordersAggregate = profileState.orders || {}; // { total_orders, total_spent, avg_order_value }
    const points = (
      membership.total_points ||
      membership.current_points ||
      membership.points || 0
    );
    const memberLevel = (
      membership.membership_level ||
      membership.level_name ||
      membership.level || 'Bronze'
    );
    const nextLevelPoints = membership.points_to_next ?? membership.next_level_points ?? 0;
    // savings (penghematan) belum dihitung di backend profile summary => tetap placeholder 0
    return {
      totalOrders: ordersAggregate.total_orders ?? ordersState.total ?? 0,
      // tampilkan total belanja selesai jika ada, fallback ke total_spent
      totalSpent: ordersAggregate.completed_spent ?? ordersAggregate.total_spent ?? 0,
      recentOrdersCount: Math.min(3, ordersState.items?.length || 0),
      memberLevel,
      points,
      savings: 0,
      nextLevelPoints
    };
  }, [profileState.membership, profileState.orders, ordersState.items, ordersState.total]);

  // Recent orders mapping (limit 5)
  const recentOrders = useMemo(() => {
    const mapStatus = (s = '') => {
      const m = s.toLowerCase();
      switch (m) {
        case 'pending': return 'MENUNGGU';
        case 'processing': return 'DIPROSES';
        case 'shipped': return 'DIKIRIM';
        case 'completed': return 'SELESAI';
        case 'cancelled': return 'DIBATALKAN';
        default: return s.toUpperCase() || 'MENUNGGU';
      }
    };
    return (ordersState.items || []).map(o => {
      const rawItems = o.items || o.order_items || o.OrderItems || [];
      const itemNames = rawItems.map(i => i.name_snapshot || i.product_name || i.name || i.title).filter(Boolean);
      const total = parseFloat(o.total || o.grand_total || o.total_amount) || 0;
      const subtotal = parseFloat(o.subtotal) || rawItems.reduce((s,i)=> s + ((parseFloat(i.price_unit||i.unit_price||i.price)||0) * (i.quantity||1)),0);
      const discount = parseFloat(o.discount_amount) || Math.max(0, subtotal - total);
      const shipping = parseFloat(o.shipping_cost) || 0;
      const paymentFee = parseFloat(o.payment_fee) || 0;
      const paymentMethod = o.Payment?.PaymentMethod?.code || o.Payment?.PaymentMethod?.name || '-';
      const paymentStatus = (o.payment_status || '').toUpperCase();
      const pointsEarned = Math.floor(total / 1000); // client-side derived (selesai assumption not enforced here)
      return {
        id: o.order_number || o.order_code || `ORD-${o.order_id}`,
        items: itemNames.length ? itemNames : ['(Tidak ada item)'],
        total,
        status: mapStatus(o.status),
        date: o.created_at || o.createdAt,
        estimatedDelivery: o.estimated_delivery || o.estimated_delivery_date,
        rating: null,
        qty: rawItems.reduce((s,i)=> s + (i.quantity||0),0),
        discount,
        shipping,
        paymentFee,
        paymentMethod,
        paymentStatus,
        pointsEarned
      };
    });
  }, [ordersState.items]);

  // Notifications removed per request

  const buildReceiptData = (order) => {
    // Find original order object for richer data if needed
    const raw = (ordersState.items || []).find(o => (o.order_number || o.order_id) === order.id || o.order_number === order.id);
    const rawItems = raw?.items || raw?.order_items || raw?.OrderItems || [];
    const items = rawItems.map(it => ({
      name: it.name_snapshot || it.product_name || it.name || it.title || 'Item',
      price: Math.round(parseFloat(it.price_unit || it.unit_price || it.price || 0)),
      quantity: it.quantity || 1
    }));
    const subtotal = items.reduce((s,i)=> s + (i.price * i.quantity), 0);
    const total = Math.round(parseFloat(raw?.total || raw?.grand_total || raw?.total_amount) || order.total || subtotal);
    const discountAmount = Math.max(0, subtotal - total); // simple infer
    return {
      id: order.id,
      date: order.date || raw?.created_at || new Date().toISOString(),
      items: items.length ? items : order.items.map(name => ({ name, price: order.total, quantity: 1 })),
      subtotal,
      discount: discountAmount > 0 && subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0,
      discountAmount,
      total,
      profit: 0,
      cashier: profileState.user?.fullname || 'User',
      paymentMethod: (raw?.Payment?.PaymentMethod?.code || raw?.Payment?.PaymentMethod?.name || 'online').toLowerCase(),
      receivedAmount: total,
      change: 0,
      status: order.status,
      referralCode: raw?.referral_code || null
    };
  };

  const printOrderReceipt = (order) => {
    const data = buildReceiptData(order);
    const receipt = Receipt({ orderData: data, type: 'online' });
    if (receipt && typeof receipt.printReceipt === 'function') {
      receipt.printReceipt();
    } else {
      console.warn('[Dashboard] Receipt component missing printReceipt method');
    }
  };

  // Enhanced Helper Functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: id });
    } catch {
      return dateString;
    }
  };

  // relativeTime removed (notifications gone)

  const getRatingStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <MdStars
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-amber-400' : 'text-slate-300'
        }`}
      />
    ));
  };

  const getMemberLevelColor = (level) => {
    const colors = {
      Bronze: 'from-orange-400 to-orange-600',
      Silver: 'from-slate-400 to-slate-600',
      Gold: 'from-amber-400 to-amber-600',
      Platinum: 'from-purple-400 to-purple-600'
    };
    return colors[level] || colors.Bronze;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      MENUNGGU: { bg: "bg-amber-100", text: "text-amber-800", icon: "⏳" },
      DIPROSES: { bg: "bg-blue-100", text: "text-blue-800", icon: "🔄" },
      DIKIRIM: { bg: "bg-purple-100", text: "text-purple-800", icon: "🚚" },
      SELESAI: { bg: "bg-green-100", text: "text-green-800", icon: "✅" },
      DIBATALKAN: { bg: "bg-red-100", text: "text-red-800", icon: "❌" }
    };
    
    const config = statusConfig[status] || statusConfig.MENUNGGU;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs rounded-full font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {status}
      </span>
    );
  };

  // Component for Enhanced Stat Cards
  const StatCard = ({ icon, title, value, subtitle, trend, bgColor, iconColor, extra }) => (
    <Card extra={`overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm ${extra || ''}`}>
      <div className={`${bgColor} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ${iconColor}`}>
            {icon}
          </div>
          {trend && (
            <div className="flex items-center space-x-1">
              <MdTrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">+{trend}%</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Full-width Header with Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <MdDashboard className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Selamat Datang{profileState.user?.fullname ? `, ${profileState.user.fullname.split(' ')[0]}` : ''}!</h1>
                  <p className="text-indigo-100 text-lg">Nikmati pengalaman berbelanja produk cakalang premium</p>
                </div>
              </div>
              
            </div>
            
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <div className="text-center">
                    <p className="text-indigo-100 text-sm">Total Belanja</p>
                    <p className="text-white font-bold text-lg">{formatCurrency(userStats.totalSpent)}</p>
                  </div>
                </div>
                <button className="inline-flex items-center px-6 py-2.5 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <MdShoppingBag className="w-4 h-4 mr-2" />
                  Belanja Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Produk Unggulan Section */}
        <Card extra="mb-8 overflow-hidden shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-4 sm:p-6 border-b-4 border-amber-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <MdStars className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white mb-0.5 sm:mb-1 flex items-center gap-2">
                    Produk Unggulan
                    <span className="text-base sm:text-lg">✨</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-indigo-100">Terlaris & paling banyak dibeli pelanggan</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/user/products')}
                className="hidden lg:flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition-all duration-200 border border-white/30 hover:border-white/50 text-sm"
              >
                <span className="font-medium">Lihat Semua</span>
                <MdExplore className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            {productsState.loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4 mx-auto"></div>
                  <p className="text-slate-600 font-medium">Memuat produk unggulan...</p>
                </div>
              </div>
            )}
            
            {!productsState.loading && featuredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mx-auto mb-4">
                  <MdShoppingBag className="h-10 w-10 text-slate-400" />
                </div>
                <p className="text-slate-600 text-lg font-medium">Belum ada produk unggulan tersedia.</p>
                <p className="text-slate-500 text-sm mt-2">Produk akan segera ditambahkan</p>
              </div>
            )}
            
            {!productsState.loading && featuredProducts.length > 0 && (
              <div>
                {/* Single Row Layout: 1 Produk Besar (kiri) + 4 Produk Kecil (kanan dalam grid 2x2) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Produk #1 - Terlaris (Lebih Besar) */}
                  <div className="lg:col-span-1">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border-2 border-amber-200">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-bold">
                          #1
                        </div>
                        <h3 className="text-sm font-bold text-amber-700">Terlaris</h3>
                      </div>
                      <FeaturedProductCard
                        product={featuredProducts[0]}
                        isMain={true}
                        onClick={() => navigate(`/user/products?highlight=${featuredProducts[0].product_id}`)}
                      />
                    </div>
                  </div>

                  {/* Produk #2-5 - Grid 2x2 */}
                  <div className="lg:col-span-2">
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                      {featuredProducts.slice(1, 5).map((product, idx) => (
                        <div key={product.id}>
                          <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                            <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] sm:text-[10px] font-bold">
                              #{idx + 2}
                            </div>
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Top {idx + 2}</span>
                          </div>
                          <FeaturedProductCard
                            product={product}
                            isMain={false}
                            onClick={() => navigate(`/user/products?highlight=${product.product_id}`)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <MdVerifiedUser className="w-4 h-4 text-green-600" />
                    <span>Produk diurutkan berdasarkan jumlah pembelian terverifikasi</span>
                  </div>
                  <button 
                    onClick={() => navigate('/user/products')}
                    className="lg:hidden flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <span>Lihat Semua</span>
                    <MdExplore className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Enhanced Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MdShoppingCart className="w-6 h-6" />}
            title="Total Pesanan"
            value={userStats.totalOrders.toLocaleString()}
            subtitle="Transaksi berhasil"
            trend={15}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
          />
          <StatCard
            icon={<MdAttachMoney className="w-6 h-6" />}
            title="Penghematan"
            value={formatCurrency(userStats.savings)}
            subtitle="Dari promo & diskon"
            trend={25}
            bgColor="bg-gradient-to-br from-green-100 to-emerald-200"
            iconColor="text-green-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Orders List with Pagination */}
          <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-1">Daftar Pesanan</h2>
                  <p className="text-slate-600">Riwayat transaksi Anda</p>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600">
                  <MdHistory className="w-4 h-4" />
                  <span>Total: {ordersState.total}</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 overflow-x-auto">
              {ordersState.loading && (
                <div className="text-sm text-slate-500">Memuat pesanan...</div>
              )}
              {!ordersState.loading && recentOrders.length > 0 && (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 border border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">ID</th>
                      <th className="px-4 py-3 text-left font-semibold text-slate-700">Produk</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Item</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Diskon</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Ongkir</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-700">Total</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Metode</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Bayar</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Poin</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                      <th className="px-4 py-3 text-center font-semibold text-slate-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 align-top">
                          <div className="font-medium text-slate-800 break-all">{order.id}</div>
                          <div className="text-xs text-slate-500">{formatDate(order.date)}</div>
                        </td>
                        <td className="px-4 py-3 align-top max-w-xs">
                          <div className="text-slate-700 truncate">{order.items[0]}</div>
                          {order.items.length > 1 && (
                            <div className="text-xs text-slate-500">+{order.items.length - 1} lainnya</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center align-top font-semibold text-slate-700">{order.qty}</td>
                        <td className="px-4 py-3 text-right align-top">
                          {order.discount > 0 ? (
                            <span className="text-emerald-600 font-medium">{formatCurrency(order.discount)}</span>
                          ) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-3 text-right align-top">
                          {order.shipping > 0 ? formatCurrency(order.shipping) : <span className="text-slate-400">-</span>}
                        </td>
                        <td className="px-4 py-3 text-right align-top font-bold text-slate-800">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-3 text-center align-top">
                          <span className="inline-block max-w-[90px] truncate font-medium text-slate-700">{order.paymentMethod || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-center align-top">
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{order.paymentStatus || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-center align-top text-amber-600 font-semibold">{order.pointsEarned}</td>
                        <td className="px-4 py-3 text-center align-top">{getStatusBadge(order.status)}</td>
                        <td className="px-4 py-3 text-center align-top">
                          <button
                            onClick={() => printOrderReceipt(order)}
                            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 text-indigo-600 shadow-sm"
                          >Struk</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {!ordersState.loading && recentOrders.length === 0 && (
              <div className="p-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mx-auto mb-6">
                  <MdShoppingCart className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Belum Ada Pesanan</h3>
                <p className="text-slate-600 mb-6">Mulai jelajahi produk cakalang premium kami</p>
                <button className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                  <MdExplore className="w-4 h-4 mr-2" />
                  Mulai Belanja
                </button>
              </div>
            )}

            {/* Pagination Controls */}
            {!ordersState.loading && recentOrders.length > 0 && (
              <div className="px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Halaman {ordersState.page} dari {Math.max(1, Math.ceil(ordersState.total / ordersState.pageSize || pageSize))}
                    {` • Menampilkan ${(ordersState.items || []).length} data`}
                  </div>
                  <div className="inline-flex items-center space-x-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={ordersState.page <= 1 || ordersState.loading}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >Prev</button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, Math.max(1, Math.ceil(ordersState.total / ordersState.pageSize || pageSize))) }).map((_, idx) => {
                        const totalPages = Math.ceil(ordersState.total / ordersState.pageSize || pageSize) || 1;
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = idx + 1;
                        } else {
                          const current = ordersState.page;
                          const start = Math.min(Math.max(1, current - 2), totalPages - 4);
                          pageNumber = start + idx;
                        }
                        const active = pageNumber === ordersState.page;
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => setPage(pageNumber)}
                            className={`w-8 h-8 rounded-md text-sm font-medium border flex items-center justify-center transition-colors ${active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                          >{pageNumber}</button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={ordersState.page >= Math.ceil(ordersState.total / ordersState.pageSize || pageSize) || ordersState.loading}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >Next</button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions section removed as requested */}
      </div>

      {/* Add to Cart Confirmation Modal (sama seperti Products.jsx) */}
      {showConfirm && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=> !adding && setShowConfirm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <button 
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600" 
              onClick={()=> !adding && setShowConfirm(false)}
            >
              <MdClose className="h-5 w-5" />
            </button>
            
            <div className="flex items-start gap-4 mb-5">
              <img
                src={buildProductImageUrl(selectedProduct.image_url, selectedProduct.name)}
                alt={selectedProduct.name}
                className="w-24 h-24 object-cover rounded-xl border border-slate-100"
                onError={(e)=> { e.currentTarget.src = fallbackAvatar(selectedProduct.name); }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2">{selectedProduct.name}</h3>
                <p className="text-sm text-slate-600 line-clamp-2 mb-2">{selectedProduct.description || 'Produk berkualitas premium'}</p>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-indigo-600 font-bold text-lg">{formatCurrency(selectedProduct.price)}</span>
                </div>
                <div className="text-xs font-medium px-2 py-1 rounded-full inline-block bg-slate-100 text-slate-600">
                  Stok tersedia: {selectedProduct.stock}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah</label>
              <div className="flex items-center gap-3">
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
                  disabled={quantity <= 1 || adding}
                  onClick={()=> setQuantity(q => Math.max(1, q-1))}
                >
                  <MdRemove className="h-5 w-5"/>
                </button>
                <input
                  type="number"
                  min={1}
                  max={selectedProduct.stock}
                  value={quantity}
                  onChange={(e)=> { 
                    const val = parseInt(e.target.value,10); 
                    if(!isNaN(val)) setQuantity(Math.min(Math.max(1,val), selectedProduct.stock)); 
                  }}
                  className="w-20 text-center border border-slate-200 rounded-xl py-2 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
                  disabled={quantity >= selectedProduct.stock || adding}
                  onClick={()=> setQuantity(q => Math.min(selectedProduct.stock, q+1))}
                >
                  <MdAdd className="h-5 w-5"/>
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={()=> !adding && setShowConfirm(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
                disabled={adding}
              >
                Batal
              </button>
              <button
                onClick={()=> { 
                  if(!adding){ 
                    dispatch(addToCartApi({ 
                      product_id: selectedProduct.product_id, 
                      quantity, 
                      price_at_add: selectedProduct.price 
                    })).then(()=> { 
                      setShowConfirm(false); 
                    }); 
                  } 
                }}
                disabled={adding || selectedProduct.stock===0}
                className={`px-6 py-2.5 rounded-xl font-semibold inline-flex items-center shadow-md hover:shadow-lg transition-all 
                  ${selectedProduct.stock===0 ? 'bg-slate-400 text-white' : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'}`}
              >
                {adding ? (
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
    </div>
  );
};

export default Dashboard;
