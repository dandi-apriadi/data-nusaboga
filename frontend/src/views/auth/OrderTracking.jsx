import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdSearch, MdShoppingCart, MdLocalShipping, MdCheckCircle, MdCancel, MdLocationOn, MdPayment, MdCalendarToday, MdInventory, MdReceipt, MdError, MdArrowBack } from "react-icons/md";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import api from "api/axios";

const OrderTracking = () => {
  const { orderId } = useParams(); // Ambil order_id dari URL parameter
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Auto-load order jika ada orderId di URL
  useEffect(() => {
    if (orderId) {
      trackOrderById(orderId);
    }
  }, [orderId]);

  const statusConfig = {
    pending: {
      label: "Menunggu Pembayaran",
      icon: <MdShoppingCart className="w-6 h-6" />,
      color: "bg-amber-500",
      bgLight: "bg-amber-50",
      textColor: "text-amber-700",
      borderColor: "border-amber-200"
    },
    processing: {
      label: "Diproses",
      icon: <MdInventory className="w-6 h-6" />,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200"
    },
    shipped: {
      label: "Dalam Pengiriman",
      icon: <MdLocalShipping className="w-6 h-6" />,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200"
    },
    completed: {
      label: "Selesai",
      icon: <MdCheckCircle className="w-6 h-6" />,
      color: "bg-green-500",
      bgLight: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200"
    },
    cancelled: {
      label: "Dibatalkan",
      icon: <MdCancel className="w-6 h-6" />,
      color: "bg-red-500",
      bgLight: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200"
    }
  };

  // Fungsi untuk tracking berdasarkan order_id langsung (dari link WhatsApp)
  const trackOrderById = async (id) => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    setOrder(null);

    try {
      const { data } = await api.get(`/orders/track/${id}`);
      
      if (data.success) {
        setOrder(data.data);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Error tracking order by ID:", err);
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err.response?.data?.message || "Gagal melacak pesanan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    let queryValue = searchQuery.trim();
    
    if (!queryValue) {
      setError("Mohon masukkan nomor pesanan");
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);
    setOrder(null);

    try {
      const { data } = await api.get(`/orders/track`, {
        params: {
          order_number: queryValue
        }
      });

      if (data.success && data.data) {
        console.log('Track response:', data);
        setOrder(data.data);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error("Error tracking order:", err);
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(err.response?.data?.message || "Gagal melacak pesanan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return format(date, "dd MMMM yyyy, HH:mm", { locale: id });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.pending;
  };

  const getStatusProgress = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'completed'];
    const currentIndex = steps.indexOf(status);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  // Reusable Order Card Component
  const OrderCard = ({ orderData, index }) => {
    if (!orderData) return null;
    
    const currentStatus = orderData.status || 'pending';
    const statusInfo = getStatusConfig(currentStatus);
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
        {/* Premium Status Card */}
        <div className={`rounded-3xl shadow-2xl border-2 overflow-hidden backdrop-blur-sm ${statusInfo.bgLight} ${statusInfo.borderColor}`}>
          <div className="p-6 sm:p-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
              <div className="flex items-center space-x-5">
                <div className={`${statusInfo.color} p-5 rounded-2xl text-white shadow-2xl transform hover:scale-110 transition-transform`}>
                  {statusInfo.icon}
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-2">
                    {statusInfo.label}
                  </h2>
                  <p className="text-xs sm:text-sm md:text-base text-slate-600 font-semibold">
                    Pesanan #{orderData.order_number || '-'}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right bg-white rounded-2xl p-5 shadow-lg border-2 border-indigo-100">
                <p className="text-xs sm:text-sm text-slate-600 mb-2 font-bold">Total Pembayaran</p>
                <p className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatCurrency(orderData.total)}
                </p>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            {currentStatus !== 'cancelled' && (
              <div className="relative">
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <div
                    className={`h-full ${statusInfo.color} transition-all duration-700 ease-out shadow-lg`}
                    style={{ width: `${getStatusProgress(currentStatus)}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[
                    { key: 'pending', label: 'Menunggu', color: 'amber' },
                    { key: 'processing', label: 'Diproses', color: 'blue' },
                    { key: 'shipped', label: 'Dikirim', color: 'purple' },
                    { key: 'completed', label: 'Selesai', color: 'green' }
                  ].map((step) => {
                    const isActive = currentStatus === step.key;
                    const steps = ['pending', 'processing', 'shipped', 'completed'];
                    const isPassed = steps.indexOf(currentStatus) >= steps.indexOf(step.key);
                    
                    return (
                      <div key={step.key} className="text-center">
                        <div className={`w-3 h-3 rounded-full mx-auto mb-2 transition-all ${
                          isActive 
                            ? `bg-${step.color}-600 ring-4 ring-${step.color}-200 scale-125` 
                            : isPassed 
                            ? `bg-${step.color}-400` 
                            : 'bg-slate-300'
                        }`}></div>
                        <span className={`text-xs font-bold ${
                          isActive 
                            ? `text-${step.color}-700` 
                            : isPassed 
                            ? `text-${step.color}-600` 
                            : 'text-slate-500'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Premium Order Info Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200/50 p-6 sm:p-10">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
            Informasi Pesanan
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
              <div className="bg-indigo-600 p-3 rounded-xl">
                <MdCalendarToday className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1 font-bold">Tanggal Pemesanan</p>
                <p className="font-bold text-slate-900 text-base sm:text-lg">{formatDate(orderData.created_at)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100">
              <div className="bg-purple-600 p-3 rounded-xl">
                <MdPayment className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-slate-600 mb-1 font-bold">Status Pembayaran</p>
                <p className="font-bold text-base sm:text-lg">
                  {orderData.payment_status === 'paid' ? (
                    <span className="text-green-700 flex items-center gap-1">
                      <MdCheckCircle className="w-5 h-5" /> Lunas
                    </span>
                  ) : orderData.payment_status === 'partial' ? (
                    <span className="text-amber-700">Sebagian</span>
                  ) : orderData.payment_status === 'refunded' ? (
                    <span className="text-purple-700">Refund</span>
                  ) : (
                    <span className="text-red-700">Belum Dibayar</span>
                  )}
                </p>
                {orderData.payment_method?.name || orderData.PaymentMethod?.name ? (
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    via {orderData.payment_method?.name || orderData.PaymentMethod?.name}
                  </p>
                ) : null}
              </div>
            </div>

            {orderData.ship_receiver_name && (
              <div className="flex items-start space-x-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                <div className="bg-blue-600 p-3 rounded-xl">
                  <MdLocationOn className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 font-bold">Penerima</p>
                  <p className="font-bold text-slate-900 text-base sm:text-lg">{orderData.ship_receiver_name}</p>
                  <p className="text-xs sm:text-sm text-slate-600 font-semibold">{orderData.ship_phone || '-'}</p>
                </div>
              </div>
            )}

            {orderData.tracking_number && (
              <div className="flex items-start space-x-4 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100">
                <div className="bg-green-600 p-3 rounded-xl">
                  <MdLocalShipping className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-slate-600 mb-1 font-bold">Nomor Resi</p>
                  <p className="font-bold text-slate-900 text-base sm:text-lg">{orderData.tracking_number}</p>
                </div>
              </div>
            )}
          </div>

          {/* Customer Note */}
          {orderData.customer_note && (
            <div className="mt-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl">
              <p className="text-xs sm:text-sm text-amber-800 font-semibold mb-1">Catatan Pesanan:</p>
              <p className="text-slate-700 text-xs sm:text-sm">{orderData.customer_note}</p>
            </div>
          )}

          {/* Timeline Dates */}
          {(orderData.paid_at || orderData.shipped_at || orderData.completed_at || orderData.estimated_delivery) && (
            <div className="mt-6 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs sm:text-sm font-bold text-slate-700 mb-3">Timeline Pesanan</p>
              <div className="space-y-2">
                {orderData.paid_at && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MdCheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-slate-600">Pembayaran:</span>
                    <span className="font-semibold text-slate-800">{formatDate(orderData.paid_at)}</span>
                  </div>
                )}
                {orderData.shipped_at && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MdLocalShipping className="w-4 h-4 text-blue-600" />
                    <span className="text-slate-600">Dikirim:</span>
                    <span className="font-semibold text-slate-800">{formatDate(orderData.shipped_at)}</span>
                  </div>
                )}
                {orderData.estimated_delivery && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MdCalendarToday className="w-4 h-4 text-purple-600" />
                    <span className="text-slate-600">Estimasi Tiba:</span>
                    <span className="font-semibold text-slate-800">{formatDate(orderData.estimated_delivery)}</span>
                  </div>
                )}
                {orderData.completed_at && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <MdCheckCircle className="w-4 h-4 text-green-700" />
                    <span className="text-slate-600">Selesai:</span>
                    <span className="font-semibold text-slate-800">{formatDate(orderData.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {orderData.ship_address_detail && (
            <div className="mt-8 pt-8 border-t-2 border-slate-200">
              <div className="flex items-start space-x-4 bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200">
                <div className="bg-slate-700 p-3 rounded-xl">
                  <MdLocationOn className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 mb-2 font-bold">Alamat Pengiriman</p>
                  <p className="text-slate-900 font-semibold text-xs sm:text-base leading-relaxed">
                    {orderData.ship_address_detail}
                    {orderData.ship_district && `, ${orderData.ship_district}`}
                    {orderData.ship_city && `, ${orderData.ship_city}`}
                    {orderData.ship_province && `, ${orderData.ship_province}`}
                    {orderData.ship_postal_code && ` ${orderData.ship_postal_code}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Premium Order Items Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200/50 p-6 sm:p-10">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
            Detail Produk
          </h3>
          
          <div className="space-y-4">
            {(orderData.OrderItems || orderData.order_items || []).map((item, itemIndex) => {
              // Priority: image_snapshot (from order_items) > Product.image_url (from product join)
              const productImage = item.image_snapshot || item.Product?.image_url;
              
              // Build full URL if needed
              let imageUrl = null;
              if (productImage) {
                if (productImage.startsWith('http://') || productImage.startsWith('https://')) {
                  // Already a full URL
                  imageUrl = productImage;
                } else {
                  // Relative path, construct full URL
                  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
                  imageUrl = `${apiBase}${productImage.startsWith('/') ? '' : '/'}${productImage}`;
                }
              }

              // Get category name
              const categoryName = item.Product?.ProductCategory?.name || null;

              return (
                <div key={itemIndex} className="group flex items-center gap-5 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl overflow-hidden group-hover:scale-110 transition-transform shadow-lg relative">
                    {imageUrl && (
                      <img 
                        src={imageUrl}
                        alt={item.name_snapshot || item.product_name || item.name || 'Produk'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide image and show icon on error
                          e.target.style.display = 'none';
                          const iconContainer = e.target.parentElement.querySelector('.fallback-icon');
                          if (iconContainer) {
                            iconContainer.style.display = 'flex';
                          }
                        }}
                      />
                    )}
                    <div 
                      className="fallback-icon absolute inset-0 w-full h-full flex items-center justify-center"
                      style={{ display: imageUrl ? 'none' : 'flex' }}
                    >
                      <MdInventory className="w-10 h-10 text-indigo-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 mb-1 text-base sm:text-lg truncate">
                      {item.name_snapshot || item.product_name || item.name}
                    </h4>
                    {categoryName && (
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium mb-2 flex items-center gap-1">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        {categoryName}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                        {item.quantity} pcs
                      </span>
                      <span className="mx-2">×</span>
                      <span className="text-slate-700">
                        {formatCurrency(item.price_unit || item.unit_price || item.price)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg sm:text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency((item.quantity || 1) * (item.price_unit || item.unit_price || item.price || 0))}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced Summary */}
          <div className="mt-8 pt-8 border-t-2 border-slate-200 space-y-4">
            <div className="flex justify-between items-center text-slate-700 text-xs sm:text-base">
              <span className="font-semibold">Subtotal Produk</span>
              <span className="font-bold">{formatCurrency(orderData.subtotal || 0)}</span>
            </div>
            
            {orderData.shipping_cost > 0 && (
              <div className="flex justify-between items-center text-slate-700 text-xs sm:text-base">
                <span className="font-semibold">Ongkos Kirim</span>
                <span className="font-bold text-blue-600">{formatCurrency(orderData.shipping_cost)}</span>
              </div>
            )}
            
            {orderData.discount_amount > 0 && (
              <div className="flex justify-between items-center text-xs sm:text-base">
                <span className="font-semibold text-green-700">Diskon</span>
                <span className="font-bold text-green-600">-{formatCurrency(orderData.discount_amount)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-5 border-t-2 border-slate-300">
              <span className="text-lg sm:text-xl font-black text-slate-900">Total Pembayaran</span>
              <span className="text-xl sm:text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {formatCurrency(orderData.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Note */}
        {orderData.customer_note && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 p-3 rounded-xl">
                <MdReceipt className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-black text-blue-900 mb-3 text-base sm:text-lg">Catatan Pelanggan</h4>
                <p className="text-blue-800 font-medium leading-relaxed text-xs sm:text-sm">{orderData.customer_note}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Clean Modern Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <MdLocalShipping className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Lacak Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Masukkan nomor pesanan untuk melacak status pengiriman Anda
          </p>
        </div>

        {/* Clean Search Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Nomor Pesanan
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    let value = e.target.value;
                    
                    if (orderId && value) {
                      navigate('/auth/order-tracking', { replace: true });
                    }
                    
                    setSearchQuery(value);
                    setError(null);
                    setNotFound(false);
                  }}
                  placeholder="Contoh: NB-251103-A123"
                  className="w-full px-4 py-3 pl-12 rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-900 placeholder-slate-400"
                  required
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <MdShoppingCart className="w-5 h-5 text-slate-400" />
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500">
                Format: <span className="font-semibold text-slate-700">NB-YYMMDD-XXXX</span> atau ID pesanan
              </p>
            </div>

            {/* Simple Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Mencari...</span>
                </>
              ) : (
                <>
                  <MdSearch className="w-5 h-5" />
                  <span>Lacak Pesanan</span>
                </>
              )}
            </button>
          </form>

          {/* Clean Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <MdError className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-red-900 mb-1">Terjadi Kesalahan</p>
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Simple Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
              Mencari Pesanan...
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">Mohon tunggu sebentar</p>
          </div>
        )}

        {/* Clean Not Found State */}
        {notFound && (
          <div className="bg-white border border-amber-200 rounded-2xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <MdError className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Pesanan Tidak Ditemukan</h3>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 max-w-md mx-auto">
              Periksa kembali nomor pesanan Anda. Pastikan format sudah benar.
            </p>
            <button
              onClick={() => {
                setNotFound(false);
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* Single Order Display */}
        {!loading && !notFound && order && (
          <OrderCard orderData={order} index={0} />
        )}

        {/* Legacy Order Details (Backup - Can be removed later) */}
        {false && order && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Modern Status Card */}
            <div className={`rounded-xl shadow-sm border overflow-hidden ${getStatusConfig(order.status).bgLight} ${getStatusConfig(order.status).borderColor}`}>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`${getStatusConfig(order.status).color} p-3 rounded-xl text-white shadow-md`}>
                      {getStatusConfig(order.status).icon}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1">
                        {getStatusConfig(order.status).label}
                      </h2>
                      <p className="text-sm text-slate-600 font-medium">
                        #{order.order_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                    <p className="text-xs text-slate-600 mb-1 font-medium">Total Pembayaran</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>

                {/* Clean Progress Bar */}
                {order.status !== 'cancelled' && (
                  <div className="bg-white/60 rounded-lg p-4 border border-slate-200">
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-4">
                      <div
                        className={`h-full ${getStatusConfig(order.status).color} transition-all duration-500`}
                        style={{ width: `${getStatusProgress(order.status)}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { key: 'pending', label: 'Menunggu', icon: <MdShoppingCart className="w-4 h-4" /> },
                        { key: 'processing', label: 'Diproses', icon: <MdInventory className="w-4 h-4" /> },
                        { key: 'shipped', label: 'Dikirim', icon: <MdLocalShipping className="w-4 h-4" /> },
                        { key: 'completed', label: 'Selesai', icon: <MdCheckCircle className="w-4 h-4" /> }
                      ].map((step) => {
                        const isActive = order.status === step.key;
                        const steps = ['pending', 'processing', 'shipped', 'completed'];
                        const isPassed = steps.indexOf(order.status) >= steps.indexOf(step.key);
                        
                        return (
                          <div key={step.key} className="text-center">
                            <div className={`w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center transition-all ${
                              isActive 
                                ? 'bg-indigo-600 text-white ring-2 ring-indigo-200' 
                                : isPassed 
                                ? 'bg-indigo-100 text-indigo-600' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {step.icon}
                            </div>
                            <span className={`text-xs font-medium ${
                              isActive || isPassed ? 'text-slate-900' : 'text-slate-500'
                            }`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Order Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-indigo-600 rounded-full"></div>
                Informasi Pesanan
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-4 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-2xl border border-indigo-100">
                  <div className="bg-indigo-600 p-3 rounded-xl">
                    <MdCalendarToday className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1 font-bold">Tanggal Pemesanan</p>
                    <p className="font-bold text-slate-900 text-lg">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-100">
                  <div className="bg-purple-600 p-3 rounded-xl">
                    <MdPayment className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1 font-bold">Metode Pembayaran</p>
                    <p className="font-bold text-slate-900 text-lg">
                      {order.payment_method?.name || order.PaymentMethod?.name || "Transfer Bank"}
                    </p>
                  </div>
                </div>

                {order.ship_receiver_name && (
                  <div className="flex items-start space-x-4 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl border border-blue-100">
                    <div className="bg-blue-600 p-3 rounded-xl">
                      <MdLocationOn className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1 font-bold">Penerima</p>
                      <p className="font-bold text-slate-900 text-lg">{order.ship_receiver_name}</p>
                      <p className="text-sm text-slate-600 font-semibold">{order.ship_phone}</p>
                    </div>
                  </div>
                )}

                {order.tracking_number && (
                  <div className="flex items-start space-x-4 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-100">
                    <div className="bg-green-600 p-3 rounded-xl">
                      <MdLocalShipping className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1 font-bold">Nomor Resi</p>
                      <p className="font-bold text-slate-900 text-lg">{order.tracking_number}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Information Section - NEW */}
              {(order.courier_name || order.shipping_service) && (
                <div className="mt-8 pt-8 border-t-2 border-slate-200">
                  <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-indigo-200 shadow-lg">
                    <h4 className="text-base font-black text-indigo-900 mb-4 flex items-center gap-2">
                      <MdLocalShipping className="w-5 h-5" />
                      Informasi Pengiriman
                    </h4>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {order.courier_name && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-indigo-100">
                          <p className="text-xs text-slate-600 mb-1 font-semibold">Ekspedisi</p>
                          <p className="font-black text-indigo-700 text-lg">{order.courier_name}</p>
                        </div>
                      )}
                      
                      {order.shipping_service && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-purple-100">
                          <p className="text-xs text-slate-600 mb-1 font-semibold">Layanan</p>
                          <p className="font-black text-purple-700 text-base">
                            {order.shipping_service}
                          </p>
                          {order.shipping_service_name && (
                            <p className="text-xs text-slate-600 mt-1 font-medium">
                              {order.shipping_service_name}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {order.shipping_etd && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-blue-100">
                          <p className="text-xs text-slate-600 mb-1 font-semibold">Estimasi Tiba</p>
                          <p className="font-black text-blue-700 text-lg">{order.shipping_etd} hari</p>
                        </div>
                      )}
                      
                      {order.shipping_cost > 0 && (
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-green-100">
                          <p className="text-xs text-slate-600 mb-1 font-semibold">Biaya Kirim</p>
                          <p className="font-black text-green-700 text-base">{formatCurrency(order.shipping_cost)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {order.ship_address_detail && (
                <div className="mt-8 pt-8 border-t-2 border-slate-200">
                  <div className="flex items-start space-x-4 bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-slate-200">
                    <div className="bg-slate-700 p-3 rounded-xl">
                      <MdLocationOn className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-2 font-bold">Alamat Pengiriman</p>
                      <p className="text-slate-900 font-semibold text-base leading-relaxed">
                        {order.ship_address_detail}
                        {order.ship_district && `, ${order.ship_district}`}
                        {order.ship_city && `, ${order.ship_city}`}
                        {order.ship_province && `, ${order.ship_province}`}
                        {order.ship_postal_code && ` ${order.ship_postal_code}`}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Premium Order Items Card */}
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200/50 p-6 sm:p-10">
              <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
                Detail Produk
              </h3>
              
              <div className="space-y-4">
                {(order.OrderItems || order.order_items || []).map((item, index) => (
                  <div key={index} className="group flex items-center gap-5 p-5 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border-2 border-slate-200 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <MdInventory className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 mb-2 text-lg truncate">
                        {item.name_snapshot || item.product_name || item.name}
                      </h4>
                      <p className="text-sm text-slate-600 font-semibold">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                          {item.quantity} pcs
                        </span>
                        <span className="mx-2">×</span>
                        <span className="text-slate-700">
                          {formatCurrency(item.price_unit || item.unit_price || item.price)}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency((item.quantity || 1) * (item.price_unit || item.unit_price || item.price || 0))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Summary */}
              <div className="mt-8 pt-8 border-t-2 border-slate-200 space-y-4">
                <div className="flex justify-between items-center text-slate-700 text-base">
                  <span className="font-semibold">Subtotal Produk</span>
                  <span className="font-bold">{formatCurrency(order.subtotal || 0)}</span>
                </div>
                
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between items-center text-slate-700 text-base">
                    <span className="font-semibold">Ongkos Kirim</span>
                    <span className="font-bold text-blue-600">{formatCurrency(order.shipping_cost)}</span>
                  </div>
                )}
                
                {order.discount_amount > 0 && (
                  <div className="flex justify-between items-center text-base">
                    <span className="font-semibold text-green-700">Diskon</span>
                    <span className="font-bold text-green-600">-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-5 border-t-2 border-slate-300">
                  <span className="text-xl font-black text-slate-900">Total Pembayaran</span>
                  <span className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Note */}
            {order.customer_note && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-3xl p-6 sm:p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-600 p-3 rounded-xl">
                    <MdReceipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-blue-900 mb-3 text-lg">Catatan Pelanggan</h4>
                    <p className="text-blue-800 font-medium leading-relaxed">{order.customer_note}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Status Info */}
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200/50 p-6 sm:p-10">
              <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-green-600 to-emerald-600 rounded-full"></div>
                Informasi Pembayaran
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2 font-semibold">Status Pembayaran</p>
                  <p className="text-lg font-black">
                    {order.payment_status === 'paid' ? (
                      <span className="text-green-700 flex items-center gap-2">
                        <MdCheckCircle className="w-6 h-6" /> Lunas
                      </span>
                    ) : order.payment_status === 'partial' ? (
                      <span className="text-amber-700">Sebagian</span>
                    ) : order.payment_status === 'refunded' ? (
                      <span className="text-purple-700">Refund</span>
                    ) : (
                      <span className="text-red-700">Belum Dibayar</span>
                    )}
                  </p>
                </div>

                {order.PaymentMethod?.name && (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-2xl border border-indigo-200">
                    <p className="text-sm text-slate-600 mb-2 font-semibold">Metode Pembayaran</p>
                    <p className="text-lg font-black text-indigo-700">{order.PaymentMethod.name}</p>
                  </div>
                )}

                {order.paid_at && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border border-green-200">
                    <p className="text-sm text-slate-600 mb-2 font-semibold">Tanggal Pembayaran</p>
                    <p className="text-base font-bold text-green-700">{formatDate(order.paid_at)}</p>
                  </div>
                )}

                {order.channel && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-200">
                    <p className="text-sm text-slate-600 mb-2 font-semibold">Channel Pemesanan</p>
                    <p className="text-lg font-black text-purple-700 uppercase">{order.channel}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline Section */}
            {(order.paid_at || order.shipped_at || order.completed_at || order.cancelled_at || order.estimated_delivery) && (
              <div className="bg-white rounded-3xl shadow-2xl border-2 border-slate-200/50 p-6 sm:p-10">
                <h3 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  Timeline Pesanan
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                    <div className="bg-slate-600 p-3 rounded-xl">
                      <MdShoppingCart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 font-semibold">Pesanan Dibuat</p>
                      <p className="text-base font-bold text-slate-800">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {order.paid_at && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="bg-green-600 p-3 rounded-xl">
                        <MdCheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-semibold">Pembayaran Diterima</p>
                        <p className="text-base font-bold text-green-800">{formatDate(order.paid_at)}</p>
                      </div>
                    </div>
                  )}

                  {order.shipped_at && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                      <div className="bg-blue-600 p-3 rounded-xl">
                        <MdLocalShipping className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-semibold">Pesanan Dikirim</p>
                        <p className="text-base font-bold text-blue-800">{formatDate(order.shipped_at)}</p>
                      </div>
                    </div>
                  )}

                  {order.estimated_delivery && order.status !== 'completed' && order.status !== 'cancelled' && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                      <div className="bg-purple-600 p-3 rounded-xl">
                        <MdCalendarToday className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-semibold">Estimasi Tiba</p>
                        <p className="text-base font-bold text-purple-800">{formatDate(order.estimated_delivery)}</p>
                      </div>
                    </div>
                  )}

                  {order.completed_at && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                      <div className="bg-green-700 p-3 rounded-xl">
                        <MdCheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-green-700 font-semibold">Pesanan Selesai</p>
                        <p className="text-base font-bold text-green-900">{formatDate(order.completed_at)}</p>
                      </div>
                    </div>
                  )}

                  {order.cancelled_at && (
                    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                      <div className="bg-red-600 p-3 rounded-xl">
                        <MdCancel className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-red-600 font-semibold">Pesanan Dibatalkan</p>
                        <p className="text-base font-bold text-red-800">{formatDate(order.cancelled_at)}</p>
                        {order.cancel_reason && (
                          <p className="text-sm text-red-700 mt-1">Alasan: {order.cancel_reason}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTracking;
