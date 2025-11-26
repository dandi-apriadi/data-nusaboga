import React, { useState, useEffect, useCallback } from "react";
import { apiGet } from "../../utils/apiClient";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Card from "components/card";
import { 
  MdShoppingCart, 
  MdPeople, 
  MdInventory, 
  MdTrendingUp,
  MdRefresh,
  MdFileDownload,
  MdArrowUpward,
  MdArrowDownward,
  MdNotifications,
  MdPrint
} from "react-icons/md";
import Receipt from "components/Receipt";
import ResponsiveTable from 'components/ResponsiveTable';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    ordersTrend: 0,
    customersTrend: 0,
    productsTrend: 0,
    revenueTrend: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersPageSize] = useState(5);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [printingOrderId, setPrintingOrderId] = useState(null);

  // API base ditangani langsung oleh apiClient (auto env + fallback)

  const mapStatusToID = (status) => {
    if(!status) return 'TIDAK DIKETAHUI';
    const s = status.toLowerCase();
    if (s === 'pending') return 'MENUNGGU';
    if (s === 'processing') return 'DIPROSES';
    if (s === 'shipped') return 'DIKIRIM';
    if (s === 'completed') return 'SELESAI';
    if (s === 'cancelled' || s === 'canceled') return 'DIBATALKAN';
    return status.toUpperCase();
  };

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await apiGet('/api/reports/dashboard');
      if(data?.stats) setStats(data.stats);
      if(data?.topProducts) setTopProducts(data.topProducts);
      setCurrentTime(new Date());
    } catch (err) {
      if (err.status === 401) {
        setErrorMsg('Belum login sebagai admin. Silakan login terlebih dahulu.');
      } else {
        setErrorMsg(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecentOrders = useCallback(async (page = 1) => {
    setIsLoadingOrders(true);
    try {
      const data = await apiGet(`/api/orders?page=${page}&pageSize=${ordersPageSize}`);
      if (data?.items) {
        const mapped = data.items.map(o => ({
          id: o.order_number || o.order_id,
          order_id: o.order_id,
            order_number: o.order_number,
          customer: o.User ? (o.User.fullname || 'Pelanggan') : 'Guest',
          total: Number(o.total) || 0,
          status: mapStatusToID(o.status),
          date: o.created_at ? (new Date(o.created_at).toISOString().slice(0,10)) : '',
          items: o.order_items ? o.order_items.length : (o.OrderItems ? o.OrderItems.length : 0)
        }));
        setRecentOrders(mapped);
        if (typeof data.total === 'number') setOrdersTotal(data.total);
        setOrdersPage(data.page || page);
      }
    } catch (e) {
      console.error('Gagal mengambil recent orders', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [ordersPageSize]);

  const handlePrintReceipt = async (order) => {
    if(!order?.id) return;
    setPrintingOrderId(order.id);
    try {
      const lookupId = order.order_id || order.id;
      const detail = await apiGet(`/api/orders/${lookupId}`);
      // Normalisasi data untuk komponen Receipt - prioritisasikan nama produk yang benar
      const rawItems = detail.order_items || detail.OrderItems || [];
      const items = rawItems.map((it, idx) => {
        const name = it.name_snapshot || it.product_name || it.name || it.Product?.name || it.ProductName || `Produk ${idx+1}`;
        const qty = it.quantity ?? it.qty ?? 1;
        const unitPrice = it.price_unit ?? it.price ?? it.unit_price ?? 0;
        return {
          name,
          quantity: qty,
          price: Number(unitPrice) || 0
        };
      });
      const subtotal = items.reduce((s,i)=> s + i.price * i.quantity, 0);
      const total = detail.total_amount || detail.total || subtotal;
      const receiptData = {
        id: detail.order_number || detail.order_id || detail.id,
        date: detail.createdAt || detail.created_at || new Date(),
        items,
        subtotal,
        discount: Number(detail.discount_amount || detail.discount || 0),
        discountAmount: Number(detail.discount_amount || detail.discount || 0),
        total,
        status: order.status || detail.status || 'SELESAI',
        customerInfo: detail.user ? { name: detail.user.fullname || detail.user.email || 'Guest', phone: detail.user.phone || '-' } : null,
        cashier: detail.cashier ? (detail.cashier.fullname || 'Admin') : 'Admin Dashboard'
      };
      const receipt = Receipt({ orderData: receiptData, type: 'order' });
      receipt.printReceipt();
    } catch (e) {
      alert(`Gagal mencetak struk: ${e.message}`);
    } finally {
      setPrintingOrderId(null);
    }
  };

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      MENUNGGU: { 
        bg: "bg-amber-100", 
        text: "text-amber-800", 
        dot: "bg-amber-500" 
      },
      DIPROSES: { 
        bg: "bg-blue-100", 
        text: "text-blue-800", 
        dot: "bg-blue-500" 
      },
      DIKIRIM: { 
        bg: "bg-purple-100", 
        text: "text-purple-800", 
        dot: "bg-purple-500" 
      },
      SELESAI: { 
        bg: "bg-green-100", 
        text: "text-green-800", 
        dot: "bg-green-500" 
      },
      DIBATALKAN: { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        dot: "bg-red-500" 
      }
    };
    
    const config = statusConfig[status] || { 
      bg: "bg-slate-100", 
      text: "text-slate-800", 
      dot: "bg-slate-500" 
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${config.bg} ${config.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`}></span>
        {status}
      </span>
    );
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) {
      return <MdArrowUpward className="w-4 h-4 text-green-600" />;
    } else if (trend < 0) {
      return <MdArrowDownward className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return "text-green-600";
    if (trend < 0) return "text-red-600";
    return "text-slate-600";
  };

  const handleRefresh = () => {
    fetchDashboard();
  };

  // Export recent orders (current page) to CSV (client-side)
  const handleExportRecentOrders = () => {
    try {
      const headers = ['Order ID', 'Tanggal', 'Pelanggan', 'Status', 'Jumlah Item', 'Total'];
      const escapeCsv = (val) => {
        const s = String(val ?? '').replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      };
      const rows = (recentOrders || []).map((o) => [
        o.id ?? '',
        o.date ?? '',
        o.customer ?? '',
        o.status ?? '',
        o.items ?? 0,
        Number(o.total || 0)
      ].map(escapeCsv).join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date();
      const tsStr = `${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}${String(ts.getDate()).padStart(2,'0')}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}${String(ts.getSeconds()).padStart(2,'0')}`;
      a.download = `dashboard-recent-orders-${tsStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengekspor CSV recent orders:', err);
      alert('Gagal mengekspor data');
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    fetchRecentOrders(ordersPage);
  }, [fetchRecentOrders, ordersPage]);

  const StatCard = ({ icon, title, value, trend, bgColor, iconColor, extra }) => (
    <Card extra={`relative overflow-hidden group ${extra}`}>
      <div className="flex items-center justify-between p-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{title}</p>
            {trend !== undefined && (
              <div className="flex items-center space-x-1.5">
                {getTrendIcon(trend)}
                <span className={`text-sm font-bold ${getTrendColor(trend)}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">
            {value}
          </h3>
          <div className="w-full bg-slate-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${bgColor.replace('gradient-to-br from-', '').replace('-100 to-', '-500').replace('-200', '')}`}
              style={{ width: `${Math.min(trend ? Math.abs(trend) * 2 : 50, 100)}%` }}
            ></div>
          </div>
        </div>
        <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${bgColor} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
          {React.cloneElement(icon, { className: `h-8 w-8 ${iconColor}` })}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <div className={`h-1 ${bgColor} opacity-60`}></div>
        <div className={`h-0.5 ${bgColor.replace('100', '300')}`}></div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Full-width Header Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                <MdTrendingUp className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Dashboard Admin
                </h1>
                <p className="text-slate-600 font-medium">
                  Lyvia Nusa Boga Management System
                </p>
                <p className="text-sm text-slate-500 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Terakhir diperbarui: {format(currentTime, "dd MMMM yyyy, HH:mm", { locale: id })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <MdRefresh className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>
              <button onClick={handleExportRecentOrders} disabled={isLoading || isLoadingOrders || recentOrders.length === 0} className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed">
                <MdFileDownload className="w-4 h-4 mr-2" />
                Unduh Laporan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert Section */}

        {/* Alert Section */}
        {errorMsg && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4">
            Terjadi kesalahan memuat data dashboard: {errorMsg}
          </div>
        )}
        {stats.pendingOrders > 0 && !errorMsg && (
          <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <MdNotifications className="w-6 h-6 text-amber-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-amber-800 mb-1">
                  Perhatian Admin!
                </h3>
                <p className="text-amber-700">
                  Ada <span className="font-bold">{stats.pendingOrders} pesanan</span> yang menunggu diproses dan perlu ditindaklanjuti segera.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards - Full Width Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MdShoppingCart />}
            title="Total Pesanan"
            value={stats.totalOrders.toLocaleString('id-ID')}
            trend={stats.ordersTrend}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
            extra="hover:shadow-xl hover:scale-105 transition-all duration-300 border border-indigo-100"
          />
          <StatCard
            icon={<MdPeople />}
            title="Total Pelanggan"
            value={stats.totalCustomers.toLocaleString('id-ID')}
            trend={stats.customersTrend}
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
            extra="hover:shadow-xl hover:scale-105 transition-all duration-300 border border-purple-100"
          />
          <StatCard
            icon={<MdInventory />}
            title="Total Produk"
            value={stats.totalProducts.toLocaleString('id-ID')}
            trend={stats.productsTrend}
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            iconColor="text-amber-600"
            extra="hover:shadow-xl hover:scale-105 transition-all duration-300 border border-amber-100"
          />
          <StatCard
            icon={<MdTrendingUp />}
            title="Total Pendapatan"
            value={formatCurrency(stats.totalRevenue)}
            trend={stats.revenueTrend}
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
            extra="hover:shadow-xl hover:scale-105 transition-all duration-300 border border-green-100"
          />
        </div>

        {/* Main Content - Full Width Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Recent Orders - Takes 3 columns on xl screens for full width */}
          <div className="xl:col-span-3">
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Pesanan Terbaru</h2>
                    <p className="text-slate-600">Kelola dan pantau pesanan pelanggan</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {isLoadingOrders ? 'Memuat...' : `${recentOrders.length} / ${ordersTotal} pesanan`}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => ordersPage > 1 && setOrdersPage(p => p - 1)}
                          disabled={isLoadingOrders || ordersPage === 1}
                          className="px-2 py-1 text-xs rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
                        >Prev</button>
                        <span className="text-xs text-slate-600">Hal {ordersPage} / {Math.max(1, Math.ceil(ordersTotal / ordersPageSize) || 1)}</span>
                        <button
                          onClick={() => (ordersPage * ordersPageSize < ordersTotal) && setOrdersPage(p => p + 1)}
                          disabled={isLoadingOrders || (ordersPage * ordersPageSize >= ordersTotal)}
                          className="px-2 py-1 text-xs rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-50"
                        >Next</button>
                      </div>
                    </div>
                    <button className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
                      Lihat Semua
                    </button>
                  </div>
                </div>
              </div>
              
              <ResponsiveTable>
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Detail Pesanan
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Informasi Pelanggan
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Nilai Transaksi
                      </th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Status Pesanan
                      </th>
                      <th className="text-center py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Tindakan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {(isLoadingOrders || isLoading) && (
                      <tr>
                        <td colSpan={5} className="py-8 px-6 text-center text-slate-500 text-sm">Memuat data...</td>
                      </tr>
                    )}
                    {!isLoading && !isLoadingOrders && recentOrders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 px-6 text-center text-slate-500 text-sm">Belum ada data order.</td>
                      </tr>
                    )}
                    {!isLoading && !isLoadingOrders && recentOrders.map((order, index) => (
                      <tr 
                        key={order.id} 
                        className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}
                      >
                        <td className="py-5 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-base">{order.id}</span>
                            <span className="text-sm text-slate-500 flex items-center mt-1">
                              <MdInventory className="w-4 h-4 mr-1" />
                              {order.items} item produk
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-800">{order.customer}</span>
                            <span className="text-sm text-slate-500 mt-1">{order.date}</span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-slate-800">
                              {formatCurrency(order.total)}
                            </span>
                            <span className="text-xs text-slate-500">
                              {order.items > 0 ? `${formatCurrency(order.total / order.items)} / item` : '-'}
                            </span>
                          </div>
                        </td>
                        <td className="py-5 px-6">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-5 px-6 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handlePrintReceipt(order)}
                              disabled={printingOrderId === order.id}
                              className="inline-flex items-center justify-center w-8 h-8 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded-lg transition-all duration-200 disabled:opacity-50"
                              title="Cetak Struk"
                            >
                              {printingOrderId === order.id ? (
                                <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                                </svg>
                              ) : (
                                <MdPrint className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            </Card>
          </div>

          {/* Sidebar Content - Takes 1 column */}
          <div className="space-y-6">
            {/* Top Products */}
            <Card extra="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-1">Produk Terlaris</h2>
                <p className="text-sm text-slate-600">Performa 30 hari terakhir</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {isLoading && (
                    <div className="text-sm text-slate-500">Memuat data...</div>
                  )}
                  {!isLoading && topProducts.length === 0 && (
                    <div className="text-sm text-slate-500">Belum ada data produk terjual.</div>
                  )}
                  {!isLoading && topProducts.map((product, index) => (
                    <div key={index} className="relative group">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 hover:from-indigo-50 hover:to-purple-50 rounded-xl border border-slate-200 hover:border-indigo-200 transition-all duration-300 hover:shadow-md">
                        <div className="flex-1 mr-4">
                          <h4 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2">
                            {product.name}
                          </h4>
                          <div className="flex items-center text-xs text-slate-600 space-x-3">
                            <span className="flex items-center">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                              {product.sold} terjual
                            </span>
                            <span className="font-medium text-indigo-600">
                              {formatCurrency(product.revenue)}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-indigo-600 mb-1">
                            #{index + 1}
                          </span>
                          <div className="w-8 h-1 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card extra="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-1">Status Cepat</h2>
                <p className="text-sm text-slate-600">Ringkasan sistem</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-amber-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700">Pesanan Menunggu</span>
                  </div>
                  <span className="font-bold text-amber-600">{isLoading ? '...' : stats.pendingOrders}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700">Stok Menipis</span>
                  </div>
                  <span className="font-bold text-red-600">{isLoading ? '...' : stats.lowStockProducts}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-slate-700">Sistem Aktif</span>
                  </div>
                  <span className="font-bold text-green-600">{isLoading ? '...' : '100%'}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
