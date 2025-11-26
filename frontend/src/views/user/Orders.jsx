import React, { useState, useEffect, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders, fetchOrder } from 'store/slices/orderSlice';
import { buildImageUrl } from 'utils/image';
// Ensure unified receipt model with POS: id,date,items[],subtotal,discount,discountAmount,total,paymentMethod,receivedAmount,change,profit,cashier,status,shipping_cost,customerInfo
import Card from 'components/card';
import Receipt from 'components/Receipt';
import { 
  MdShoppingBag, 
  MdAccessTime, 
  MdCheckCircle, 
  MdCancel, 
  MdLocalShipping,
  MdReceipt,
  MdFilterList,
  MdSearch,MdPayment,
  MdRefresh,
  MdStar,
  MdTrendingUp,
  MdHistory,
  MdShoppingCart,
  MdVerified,
  MdTrackChanges
} from 'react-icons/md';

// Custom CSS untuk animasi (bisa dipindah ke file CSS terpisah)
const customStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out;
  }
`;

// Inject CSS ke document head
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: orders, loading, error, loadingDetail } = useSelector(s => s.orders);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  // Fetch orders from backend
  useEffect(() => { dispatch(fetchOrders({ page:1, pageSize:50 })); }, [dispatch]);

  useEffect(() => {
    // Debug: Log raw orders to see actual data structure
    console.log('[Orders] Raw orders from backend:', orders.map(o => ({ 
      id: o.order_id, 
      number: o.order_number, 
      status: o.status,
      payment_status: o.payment_status,
      OrderItems: o.OrderItems, // Capitalized (Sequelize)
      order_items: o.order_items, // Lowercase
      items: o.items, // Alternative
      Payments: o.Payments, // Capitalized
      payments: o.payments, // Lowercase
      payment_method: o.payment_method,
      PaymentMethod: o.PaymentMethod
    })));

    let filtered = orders.map(o => {
      // Determine items array - handle BOTH Sequelize PascalCase and snake_case
      const itemsArray = o.OrderItems || o.order_items || o.items || [];
      
      // Debug first order to see structure
      if (orders.indexOf(o) === 0) {
        console.log('[Orders] First order full structure:', {
          order_id: o.order_id,
          order_number: o.order_number,
          OrderItems: o.OrderItems,
          order_items: o.order_items,
          items: o.items,
          itemsArray_length: itemsArray.length,
          itemsArray_isArray: Array.isArray(itemsArray),
          first_item: itemsArray[0]
        });
        
        if (itemsArray.length === 0) {
          console.error('[Orders] WARNING: First order has NO ITEMS!', {
            raw_order: o,
            OrderItems: o.OrderItems,
            order_items: o.order_items,
            items: o.items
          });
        }
      }

      // Determine payment method from various possible sources
      let paymentMethodName = '-';
      
      // Try Payments array (Sequelize include)
      const paymentsArray = o.Payments || o.payments || [];
      if (paymentsArray && paymentsArray.length > 0) {
        const payment = paymentsArray[0];
        // payment.PaymentMethod or payment.payment_method
        const pm = payment.PaymentMethod || payment.payment_method;
        if (pm) {
          paymentMethodName = pm.name || pm.method_name || '-';
        } else {
          paymentMethodName = payment.method_name || payment.name || '-';
        }
      }
      // Fallback to direct field
      else if (o.payment_method) {
        paymentMethodName = typeof o.payment_method === 'string' 
          ? o.payment_method 
          : (o.payment_method.name || '-');
      }
      // Fallback to PaymentMethod association
      else if (o.PaymentMethod) {
        paymentMethodName = o.PaymentMethod.name || '-';
      }

      return {
        // normalize shape expected by UI
        id: o.order_id || o.id,
        orderNumber: o.order_number,
        date: o.created_at || o.date,
        estimatedDelivery: o.estimated_delivery,
        total: parseInt(o.total) || 0,
        subtotal: parseInt(o.subtotal) || 0,
        shippingCost: parseInt(o.shipping_cost) || 0,
        discount: parseInt(o.discount_amount) || 0,
        status: o.status,
        paymentStatus: o.payment_status,
        paymentMethod: paymentMethodName,
        trackingNumber: o.tracking_number,
        items: itemsArray.map((it, idx) => {
          // Handle Product association (could be nested or flat)
          const product = it.Product || it.product || {};
          
          // Debug logging for first item
          if (orders.indexOf(o) === 0 && idx === 0) {
            console.log('[Orders] First item detailed structure:', {
              raw_item: it,
              has_Product: !!it.Product,
              has_product: !!it.product,
              it_weight_grams: it.weight_grams,
              Product_weight_grams: it.Product?.weight_grams,
              product_weight_grams: it.product?.weight_grams,
              it_weight: it.weight,
              final_weight_will_be: it.weight_grams || it.weight || it.Product?.weight_grams || it.product?.weight_grams || 0
            });
          }
          
          // Multi-fallback untuk setiap field
          const name = it.name_snapshot || it.product_name || it.name || product.name || 'Produk';
          const price = parseInt(it.price_unit || it.price || product.price || 0);
          const quantity = parseInt(it.quantity || 1);
          // Priority: weight_grams snapshot dari order_items (NEW), fallback ke Product
          const weight = parseInt(it.weight_grams || it.weight || product.weight_grams || 0);
          const image = it.image_snapshot || it.image_url || product.image_url || buildImageUrl('/uploads/products/placeholder.png');
          
          return {
            id: it.order_item_id || it.id || idx,
            name: name,
            quantity: quantity,
            price: price,
            originalPrice: price,
            weight: weight,
            image: image,
            category: it.category || product.category || '-'
          };
        }),
        shipping: o.ship_address_detail ? {
          address: o.ship_address_detail,
          recipient: o.ship_receiver_name,
          phone: o.ship_phone,
          method: o.shipping_method || o.courier_name || '-',
          service: o.shipping_service || '-',
          insurance: !!o.shipping_insurance,
        } : null,
        notes: o.customer_note,
        cancelReason: o.cancel_reason,
      };
    });

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status?.toUpperCase() === selectedStatus.toUpperCase());
    }

    // Filter by time range
    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const orderDate = new Date();
      
      filtered = filtered.filter(order => {
        const orderDateTime = new Date(order.date);
        
        switch(selectedTimeRange) {
          case '7days':
            orderDate.setDate(now.getDate() - 7);
            return orderDateTime >= orderDate;
          case '30days':
            orderDate.setDate(now.getDate() - 30);
            return orderDateTime >= orderDate;
          case '90days':
            orderDate.setDate(now.getDate() - 90);
            return orderDateTime >= orderDate;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some(item => 
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    setFilteredOrders(filtered);
  }, [orders, selectedStatus, selectedTimeRange, searchQuery]);

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'MENUNGGU':
      case 'PENDING':
        return <MdAccessTime className="w-5 h-5 text-amber-600" />;
      case 'DIPROSES':
      case 'PROCESSING':
        return <MdTrackChanges className="w-5 h-5 text-blue-600" />;
      case 'DIKIRIM':
      case 'SHIPPED':
        return <MdLocalShipping className="w-5 h-5 text-indigo-600" />;
      case 'SELESAI':
      case 'DELIVERED':
      case 'COMPLETED':
        return <MdCheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'DIBATALKAN':
      case 'CANCELLED':
        return <MdCancel className="w-5 h-5 text-red-600" />;
      default:
        return <MdReceipt className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status?.toUpperCase()) {
      case 'MENUNGGU':
      case 'PENDING':
        return 'Menunggu Konfirmasi';
      case 'DIPROSES':
      case 'PROCESSING':
        return 'Sedang Diproses';
      case 'DIKIRIM':
      case 'SHIPPED':
        return 'Dalam Pengiriman';
      case 'SELESAI':
      case 'DELIVERED':
      case 'COMPLETED':
        return 'Pesanan Selesai';
      case 'DIBATALKAN':
      case 'CANCELLED':
        return 'Dibatalkan';
      default:
        return 'Status Tidak Diketahui';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'MENUNGGU':
      case 'PENDING':
        return 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 border border-amber-200';
      case 'DIPROSES':
      case 'PROCESSING':
        return 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 border border-blue-200';
      case 'DIKIRIM':
      case 'SHIPPED':
        return 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-800 border border-indigo-200';
      case 'SELESAI':
      case 'DELIVERED':
      case 'COMPLETED':
        return 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-800 border border-emerald-200';
      case 'DIBATALKAN':
      case 'CANCELLED':
        return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border border-red-200';
      default:
        return 'bg-gradient-to-r from-slate-50 to-gray-50 text-slate-800 border border-slate-200';
    }
  };

  const getPaymentStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <MdVerified className="w-4 h-4 text-emerald-600" />;
      case 'pending':
        return <MdAccessTime className="w-4 h-4 text-amber-600" />;
      case 'refunded':
        return <MdHistory className="w-4 h-4 text-blue-600" />;
      default:
        return <MdPayment className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTotalItems = (items) => items.reduce((total, item) => total + (item.quantity || 0), 0);

  const getTotalWeight = (items) => items.reduce((total, item) => total + ((item.weight || 0) * (item.quantity || 0)), 0);

  // Print receipt using Receipt utility (Receipt returns an object, not JSX)
  const printReceiptFromOrder = async (order) => {
    if (!order) return;
    
    // Debug: Check order structure
    console.log('[Orders] printReceiptFromOrder called with:', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      items_length: order.items?.length || 0,
      items: order.items,
      raw_order: order
    });
    
    // If items empty, try to fetch detail from backend
    if (!order.items || order.items.length === 0) {
      console.warn('[Orders] Items empty, fetching order detail from backend...');
      try {
        const result = await dispatch(fetchOrder(order.id));
        if (result.payload && result.payload.OrderItems && result.payload.OrderItems.length > 0) {
          console.log('[Orders] Successfully fetched order detail with items:', result.payload.OrderItems.length);
          
          // Map OrderItems to items format
          const mappedItems = result.payload.OrderItems.map((it, idx) => {
            const product = it.Product || it.product || {};
            return {
              id: it.order_item_id || it.id || idx,
              name: it.name_snapshot || it.product_name || it.name || product.name || 'Produk',
              quantity: parseInt(it.quantity || 1),
              price: parseInt(it.price_unit || it.price || product.price || 0),
              originalPrice: parseInt(it.price_unit || it.price || product.price || 0),
              weight: parseInt(it.weight_grams || it.weight || product.weight_grams || 0),
              image: it.image_snapshot || it.image_url || product.image_url || buildImageUrl('/uploads/products/placeholder.png'),
              category: it.category || product.category || '-'
            };
          });
          
          // Update order with fetched items
          order = { ...order, items: mappedItems };
          console.log('[Orders] Order updated with items:', order.items.length);
        } else {
          console.error('[Orders] Fetched order detail but still no items');
          alert('Tidak ada item di pesanan ini. Data mungkin rusak.');
          return;
        }
      } catch (error) {
        console.error('[Orders] Failed to fetch order detail:', error);
        alert('Gagal memuat detail pesanan. Silakan coba lagi.');
        return;
      }
    }
    
    // Validate items exist after fetch attempt
    if (!order.items || order.items.length === 0) {
      console.error('[Orders] ERROR: Still no items in order after fetch attempt');
      alert('Tidak ada item di pesanan ini. Data mungkin belum dimuat.');
      return;
    }
    
    const discountPercent = order.subtotal > 0 ? Math.round((order.discount / order.subtotal) * 100) : 0;
    // Unified model (align with POS)
    const receiptData = {
      id: order.orderNumber || order.id,
      date: order.date || order.created_at,
      items: (order.items || []).map(it => ({
        name: it.name,
        price: it.price,
        quantity: it.quantity,
      })),
      subtotal: order.subtotal || 0,
      discount: discountPercent,
      discountAmount: order.discount || 0,
      total: order.total || 0,
      paymentMethod: mapPaymentMethod(order.paymentMethod),
      receivedAmount: order.receivedAmount || order.total || 0,
      change: order.change || 0,
      profit: order.profit || undefined,
      cashier: order.cashier?.fullname || undefined,
      status: order.status || undefined,
      shipping_cost: order.shippingCost || 0,
      customerInfo: order.shipping?.recipient ? { name: order.shipping.recipient, phone: order.shipping.phone } : undefined,
    };
    
    console.log('[Orders] Receipt data prepared:', receiptData);
    
    const receipt = Receipt({ orderData: receiptData, type: 'order' });
    receipt.printReceipt();
  };

  const mapPaymentMethod = (raw) => {
    if (!raw) return undefined;
    const v = raw.toString().toLowerCase();
    if (['cash','tunai'].includes(v)) return 'cash';
    if (['card','kartu','debit','credit'].includes(v)) return 'card';
    if (['qr','qrcode','qris'].includes(v)) return 'qr';
    return raw; // fallback keep original
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Memuat Riwayat Pesanan</h3>
          <p className="text-slate-500">Mohon tunggu sebentar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold text-red-600 mb-2">Gagal memuat pesanan</h3>
          <p className="text-slate-600 text-sm mb-4">{error.msg || error.message || 'Terjadi kesalahan.'}</p>
          <button onClick={() => dispatch(fetchOrders())} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Coba Lagi</button>
        </div>
      </div>
    );
  }

  const getOrderStats = () => {
    const total = orders.length;
    const delivered = orders.filter(order => 
      ['SELESAI', 'DELIVERED', 'COMPLETED'].includes(order.status?.toUpperCase())
    ).length;
    const processing = orders.filter(order => 
      ['DIPROSES', 'PROCESSING'].includes(order.status?.toUpperCase())
    ).length;
    const shipped = orders.filter(order => 
      ['DIKIRIM', 'SHIPPED'].includes(order.status?.toUpperCase())
    ).length;
    const pending = orders.filter(order => 
      ['MENUNGGU', 'PENDING'].includes(order.status?.toUpperCase())
    ).length;
    
    return { total, delivered, processing, shipped, pending };
  };

  const stats = getOrderStats();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Full-width Header */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <MdHistory className="h-8 w-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
              Riwayat Transaksi
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Pantau dan kelola semua pesanan produk olahan cakalang Nusantara terbaik
            </p>
          </div>
          
          {/* Order Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
              <div className="text-sm text-indigo-100 flex items-center">
                <MdShoppingBag className="w-4 h-4 mr-1" />
                Total Pesanan
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-white mb-1">{stats.delivered}</div>
              <div className="text-sm text-indigo-100 flex items-center">
                <MdCheckCircle className="w-4 h-4 mr-1" />
                Selesai
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-white mb-1">{stats.shipped}</div>
              <div className="text-sm text-indigo-100 flex items-center">
                <MdLocalShipping className="w-4 h-4 mr-1" />
                Dalam Kirim
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold text-white mb-1">{stats.processing}</div>
              <div className="text-sm text-indigo-100 flex items-center">
                <MdAccessTime className="w-4 h-4 mr-1" />
                Diproses
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters and Search */}
        <Card extra="rounded-2xl border-0 shadow-lg bg-white mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cari Pesanan
                </label>
                <div className="relative">
                  <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Cari berdasarkan ID pesanan, nomor order, atau nama produk..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-56">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter Status
                </label>
                <div className="relative">
                  <MdFilterList className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white appearance-none"
                  >
                    <option value="all">Semua Status</option>
                    <option value="MENUNGGU">Menunggu Konfirmasi</option>
                    <option value="DIPROSES">Sedang Diproses</option>
                    <option value="DIKIRIM">Dalam Pengiriman</option>
                    <option value="SELESAI">Pesanan Selesai</option>
                    <option value="DIBATALKAN">Dibatalkan</option>
                  </select>
                </div>
              </div>

              {/* Time Range Filter */}
              <div className="lg:w-48">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Periode Waktu
                </label>
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                >
                  <option value="all">Semua Waktu</option>
                  <option value="7days">7 Hari Terakhir</option>
                  <option value="30days">30 Hari Terakhir</option>
                  <option value="90days">3 Bulan Terakhir</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Orders Table */}
        {filteredOrders.length === 0 ? (
          <Card extra="rounded-2xl border-0 shadow-lg bg-white">
            <div className="p-16 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
                  <MdShoppingBag className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Belum Ada Riwayat Pesanan</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  Anda belum pernah melakukan pemesanan produk olahan cakalang. 
                  Jelajahi koleksi produk premium kami dan nikmati cita rasa autentik Nusantara!
                </p>
                <button
                  onClick={() => navigate('/user/catalog')}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <MdShoppingCart className="mr-3 h-6 w-6" />
                  Mulai Belanja Sekarang
                </button>
                
                <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                  <div className="p-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MdLocalShipping className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="text-sm font-medium text-slate-700">Gratis Ongkir</div>
                    <div className="text-xs text-slate-500">Min. belanja 100k</div>
                  </div>
                  <div className="p-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MdVerified className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="text-sm font-medium text-slate-700">Kualitas Terjamin</div>
                    <div className="text-xs text-slate-500">100% Original</div>
                  </div>
                  <div className="p-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MdTrendingUp className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="text-sm font-medium text-slate-700">Produk Terlaris</div>
                    <div className="text-xs text-slate-500">Pilihan Terbaik</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card extra="rounded-2xl border-0 shadow-lg bg-white overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-slate-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <MdReceipt className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Daftar Pesanan</h2>
                  <p className="text-sm text-slate-600">{filteredOrders.length} pesanan ditemukan</p>
                </div>
              </div>
            </div>

            {/* Table Header */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">ID Pesanan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tanggal</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Produk</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Total</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map((order) => (
                    <Fragment key={order.id}>
                      <tr 
                        className="hover:bg-slate-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="font-semibold text-slate-800">{order.id}</div>
                              <div className="text-sm text-slate-500">#{order.orderNumber}</div>
                            </div>
                          </div>
                        </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-800">{formatDate(order.date)}</div>
                        {order.estimatedDelivery && (
                          <div className="text-xs text-slate-500">Est: {formatDate(order.estimatedDelivery)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-medium text-slate-800 truncate max-w-xs">
                            {order.items[0]?.name || '(Tidak ada produk)'}
                            {order.items.length > 1 && (
                              <span className="text-slate-500"> +{order.items.length - 1} lainnya</span>
                            )}
                          </div>
                          <div className="text-sm text-slate-500">
                            {getTotalItems(order.items)} item • {(getTotalWeight(order.items) / 1000).toFixed(1)} kg
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {getStatusText(order.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-lg text-slate-800">{formatCurrency(order.total)}</div>
                        {order.discount > 0 && (
                          <div className="text-sm text-emerald-600">Hemat {formatCurrency(order.discount)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2 flex-wrap gap-y-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); printReceiptFromOrder(order); }}
                            className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 font-medium transition-all duration-300 text-sm"
                          >
                            <MdReceipt className="w-4 h-4 inline mr-1" />
                            Struk
                          </button>
                          {['MENUNGGU', 'DIPROSES', 'PENDING', 'PROCESSING'].includes(order.status?.toUpperCase()) && (
                            <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium transition-all duration-300 text-sm">
                              <MdCancel className="w-4 h-4 inline mr-1" />
                              Batal
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Menampilkan {filteredOrders.length} dari {orders.length} pesanan
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors flex items-center gap-2"
                  >
                    <MdRefresh className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Orders;