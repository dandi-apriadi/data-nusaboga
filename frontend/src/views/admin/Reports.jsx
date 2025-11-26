import React, { useState, useEffect, useCallback } from "react";
import Card from "components/card";
import { 
  MdDateRange, 
  MdTrendingUp, 
  MdShoppingCart, 
  MdPeople,
  MdBarChart,
  MdAssessment,
  MdTrendingDown,
  MdInsights,
  MdShowChart,
  MdTableChart,
  MdStars,
  MdInventory,
  MdAttachMoney,
  MdPercent
} from "react-icons/md";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import api from "api/axios";
import ResponsiveTable from 'components/ResponsiveTable';

const Reports = () => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [viewMode, setViewMode] = useState("overview"); // overview, detailed, analytics
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackAllTime, setFallbackAllTime] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [noGlobalData, setNoGlobalData] = useState(false);
  const [didFallbackFetch, setDidFallbackFetch] = useState(false);

  // Data state fetched from backend
  const [salesData, setSalesData] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [dailySales, setDailySales] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [customerSegments, setCustomerSegments] = useState([]); // derived from sales summary
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [weekdaySales, setWeekdaySales] = useState([]);

  const fetchReports = useCallback(async (useAllTimeFallback=false) => {
    if (!initialized) return;
    setLoading(true);
    setError(null);
    try {
      const params = useAllTimeFallback ? {} : (dateFrom && dateTo ? { from: dateFrom, to: dateTo } : {});
      const [summaryRes, topProductsRes, dailyRes, categoryPerfRes, statusRes, weekdayRes] = await Promise.all([
        api.get('/reports/summary/extended', { params }),
        api.get('/reports/top-products', { params: { ...params, limit: 5 } }),
        api.get('/reports/daily', { params }),
        api.get('/reports/category-performance', { params }),
        api.get('/reports/status-breakdown', { params }),
        api.get('/reports/weekday-sales', { params })
      ]);
      setSalesData(summaryRes.data);
      setTopProducts((topProductsRes.data || []).map((p, idx) => ({
        id: p.product_id || idx,
        name: p.name || 'Produk',
        sold: Number(p.sold) || 0,
        revenue: Number(p.revenue) || 0,
        profit: Number(p.profit) || 0,
        rating: 0,
        stock: p.stock || 0,
        category: p.category || '-' 
      })));
      setDailySales((dailyRes.data || []).map(r => ({
        date: r.date,
        orders: Number(r.orders) || 0,
        revenue: Number(r.revenue) || 0,
        profit: Number(r.profit) || 0,
        customers: 0
      })));
      setCategoryPerformance((categoryPerfRes.data || []).map(r => ({
        name: r.name,
        revenue: Number(r.revenue) || 0,
        orders: Number(r.orders) || 0,
        profit: Number(r.profit) || 0,
        growth: Number(r.growth) || 0
      })));

      if (summaryRes.data) {
        const { returningCustomers = 0, newCustomers = 0, totalCustomers = 0, totalRevenue = 0 } = summaryRes.data;
        const safeTotal = totalRevenue || 1;
        const returningRevenue = (totalRevenue * 0.6);
        const newRevenue = totalRevenue - returningRevenue;
        setCustomerSegments([
          { segment: 'Returning Customers', count: returningCustomers, revenue: returningRevenue, percentage: returningRevenue / safeTotal * 100 },
          { segment: 'New Customers', count: newCustomers, revenue: newRevenue, percentage: newRevenue / safeTotal * 100 },
        ]);
      }

      setStatusBreakdown(statusRes.data || []);
      setWeekdaySales(weekdayRes.data || []);

      // Fallback trigger: if not already fallback and selected range had zero meaningful data
      if (!useAllTimeFallback) {
        if (summaryRes.data && summaryRes.data.totalOrders === 0 && !didFallbackFetch) {
          setFallbackAllTime(true);
          setDidFallbackFetch(true);
          // fetch global data once
          const globalSummary = await api.get('/reports/summary/extended');
          const globalTop = await api.get('/reports/top-products', { params: { limit: 5 } });
          const globalDaily = await api.get('/reports/daily');
          const globalCat = await api.get('/reports/category-performance');
          // only overwrite if global has data
          if (globalSummary.data.totalOrders > 0) {
            setSalesData(globalSummary.data);
            setTopProducts((globalTop.data || []).map((p, idx) => ({
              id: p.product_id || idx,
              name: p.name || 'Produk',
              sold: Number(p.sold) || 0,
              revenue: Number(p.revenue) || 0,
              profit: Number(p.profit) || 0,
              rating: 0,
              stock: p.stock || 0,
              category: p.category || '-' 
            })));
            setDailySales((globalDaily.data || []).map(r => ({
              date: r.date,
              orders: Number(r.orders) || 0,
              revenue: Number(r.revenue) || 0,
              profit: Number(r.profit) || 0,
              customers: 0
            })));
            setCategoryPerformance((globalCat.data || []).map(r => ({
              name: r.name,
              revenue: Number(r.revenue) || 0,
              orders: Number(r.orders) || 0,
              profit: Number(r.profit) || 0,
              growth: Number(r.growth) || 0
            })));
          }
        } else if (summaryRes.data && summaryRes.data.totalOrders > 0) {
          setFallbackAllTime(false);
          setDidFallbackFetch(false);
        }
      }
      if (useAllTimeFallback) setFallbackAllTime(true);
      if (summaryRes.data && summaryRes.data.totalOrders === 0 && (useAllTimeFallback || didFallbackFetch)) {
        setNoGlobalData(true);
      } else if (summaryRes.data && summaryRes.data.totalOrders > 0) {
        setNoGlobalData(false);
      }
    } catch (e) {
      console.error('Gagal mengambil laporan', e);
      setError(e?.response?.data?.msg || 'Gagal memuat data laporan');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, initialized, didFallbackFetch]);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await api.get('/reports/orders/date-range');
        if (res.data.hasData) {
          const max = new Date(res.data.maxDate);
            const min = new Date(res.data.minDate);
            // default: last 7 days or full span if shorter than 7 days
            const sevenDaysAgo = new Date(max.getTime() - 6*24*60*60*1000);
            const fromDate = sevenDaysAgo < min ? min : sevenDaysAgo;
            setDateFrom(fromDate.toISOString().slice(0,10));
            setDateTo(max.toISOString().slice(0,10));
        } else {
          // no orders at all
          setNoGlobalData(true);
        }
      } catch (e) {
        console.error('Gagal inisialisasi rentang tanggal', e);
      } finally {
        setInitialized(true);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (initialized) fetchReports(false);
  }, [initialized, fetchReports]);

  const safeSales = salesData || { totalRevenue: 0, totalOrders: 0, totalCustomers: 0, avgOrderValue: 0, growthRate: 0, conversionRate: 0, lowStockProducts: 0 };

  // Hide trend if both current and previous effectively zero
  const trendRevenue = (safeSales.totalRevenue === 0 && (salesData?.growthRate === 0)) ? undefined : (salesData?.growthRate || 0);
  const trendOrders = (safeSales.totalOrders === 0 && (salesData?.growthOrders === 0)) ? undefined : (salesData?.growthOrders || 0);
  const trendAOV = (safeSales.avgOrderValue === 0 && (salesData?.growthAOV === 0)) ? undefined : (salesData?.growthAOV || 0);

  // Helper Functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';
    return format(d, "dd MMM yyyy", { locale: id });
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value) => {
    return value >= 0 ? (
      <MdTrendingUp className="w-4 h-4 text-green-500" />
    ) : (
      <MdTrendingDown className="w-4 h-4 text-red-500" />
    );
  };

  const getTrendColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Component for Enhanced Stat Cards
  const StatCard = ({ icon, title, value, subtitle, trend, bgColor, iconColor, extra }) => (
    <Card extra={`overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm ${extra || ''}`}>
      <div className={`${bgColor} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ${iconColor}`}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className="flex items-center space-x-1">
              {getTrendIcon(trend)}
              <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
                {formatPercentage(trend)}
              </span>
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

  // Export functionality removed alongside report type selector per simplification request.

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Full-width Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <MdAssessment className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Laporan & Analitik</h1>
                  <p className="text-indigo-100 text-lg">Insight mendalam untuk bisnis cakalang Anda</p>
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <MdDateRange className="h-5 w-5 text-white/80" />
                  <span className="text-white/90 text-sm font-medium">
                    {initialized ? `${formatDate(dateFrom)} - ${formatDate(dateTo)}` : 'Memuat rentang...'}
                  </span>
                </div>
                <button className="inline-flex items-center px-6 py-2.5 bg-white text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                  <MdInsights className="w-4 h-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            {error}
          </div>
        )}
        {/* View Mode Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
            {[
              { id: 'overview', label: 'Ringkasan', icon: <MdBarChart /> },
              { id: 'detailed', label: 'Detail', icon: <MdTableChart /> },
              { id: 'analytics', label: 'Analitik', icon: <MdShowChart /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  viewMode === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Filters & Export Section */}
        <Card extra="mb-8 overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-200">
                    <MdDateRange className="h-5 w-5 text-slate-400" />
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Dari:</label>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="border-0 focus:ring-0 focus:outline-none bg-transparent text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 bg-white rounded-lg px-4 py-3 shadow-sm border border-slate-200">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Sampai:</label>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="border-0 focus:ring-0 focus:outline-none bg-transparent text-slate-700 font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Report type selector removed */}
              </div>

              <div className="flex items-center">
                <span className="text-sm text-slate-600 font-medium">
                  Periode: {dateFrom} - {dateTo} • {safeSales.totalOrders} transaksi
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Summary Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            icon={<MdAttachMoney className="w-6 h-6" />}
            title="Total Pendapatan"
            value={formatCurrency(safeSales.totalRevenue)}
            subtitle="9 hari terakhir"
            trend={trendRevenue}
            bgColor="bg-gradient-to-br from-green-100 to-emerald-200"
            iconColor="text-green-600"
          />
          <StatCard
            icon={<MdShoppingCart className="w-6 h-6" />}
            title="Total Pesanan"
            value={safeSales.totalOrders.toLocaleString()}
            subtitle="Transaksi selesai"
            trend={trendOrders}
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
          />
          <StatCard
            icon={<MdPeople className="w-6 h-6" />}
            title="Total Pelanggan"
            value={safeSales.totalCustomers.toLocaleString()}
            subtitle={`${safeSales.newCustomers || 0} pelanggan baru`}
            trend={0}
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
          />
          <StatCard
            icon={<MdTrendingUp className="w-6 h-6" />}
            title="Rata-rata Pesanan"
            value={formatCurrency(safeSales.avgOrderValue || 0)}
            subtitle="Per transaksi"
            trend={trendAOV}
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            iconColor="text-amber-600"
          />
          <StatCard
            icon={<MdPercent className="w-6 h-6" />}
            title="Conversion Rate"
            value={`${safeSales.conversionRate || 0}%`}
            subtitle="Dari total kunjungan"
            trend={0}
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={<MdInventory className="w-6 h-6" />}
            title="Stok Rendah"
            value={safeSales.lowStockProducts.toLocaleString()}
            subtitle="Produk perlu restock"
            trend={0}
            bgColor="bg-gradient-to-br from-red-100 to-red-200"
            iconColor="text-red-600"
          />
        </div>

        {/* Content based on view mode */}
        {viewMode === 'overview' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Top Products */}
            <Card extra="xl:col-span-2 overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Produk Terlaris</h2>
                    <p className="text-slate-600">Performa penjualan produk unggulan</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                    <MdStars className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {fallbackAllTime && !noGlobalData && (
                  <div className="mb-2 text-xs inline-flex items-center px-2 py-1 rounded bg-amber-100 text-amber-700 font-medium">
                    Rentang dipilih kosong. Menampilkan data keseluruhan periode.
                  </div>
                )}
                {noGlobalData && (
                  <div className="mb-2 text-xs inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 font-medium">
                    Belum ada transaksi sama sekali.
                  </div>
                )}
                {(!loading && !error && topProducts.length === 0 && !fallbackAllTime && !noGlobalData) && <p className="text-slate-500 text-sm">Tidak ada data produk.</p>}
                {loading && <p className="text-slate-500 text-sm">Memuat data produk...</p>}
                {error && <p className="text-red-600 text-sm">{error}</p>}
                {!loading && !error && topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group">
                    <div className="flex items-center flex-1">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg mr-4 group-hover:scale-105 transition-transform duration-200">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 mb-1">{product.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span className="flex items-center">
                            <MdShoppingCart className="w-4 h-4 mr-1" />
                            {product.sold} terjual
                          </span>
                          <span className="flex items-center">
                            <MdStars className="w-4 h-4 mr-1 text-amber-500" />
                            {product.rating}
                          </span>
                          <span className="bg-slate-200 px-2 py-1 rounded-full text-xs">
                            {product.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 text-lg">{formatCurrency(product.revenue)}</p>
                      <p className="text-sm text-green-600 font-medium">
                        Profit: {formatCurrency(product.profit)}
                      </p>
                      <p className="text-xs text-slate-500">Stok: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Daily Sales Chart */}
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Tren Harian</h2>
                    <p className="text-slate-600">{dailySales.length > 0 ? `Periode: ${formatDate(dailySales[0].date)} - ${formatDate(dailySales[dailySales.length - 1].date)}` : 'Tidak ada data'}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-green-500 to-emerald-600">
                    <MdShowChart className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {dailySales.map((day, index) => {
                    const revenues = dailySales.map(d => d.revenue).filter(r => typeof r === 'number');
                    const maxRevenue = revenues.length ? Math.max(...revenues, 0) : 0;
                    const percentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-slate-800">{formatDate(day.date)}</h3>
                            <p className="text-slate-500 text-sm">{day.orders} pesanan • {day.customers} pelanggan</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-slate-800">{formatCurrency(day.revenue)}</p>
                            <p className="text-xs text-green-600">+{formatCurrency(day.profit)}</p>
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-8">
            {/* Category Performance */}
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-1">Performa Kategori Produk</h2>
                <p className="text-slate-600">Analisis penjualan berdasarkan kategori</p>
              </div>
              
              <ResponsiveTable>
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Kategori</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Pendapatan</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Pesanan</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Pertumbuhan</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Market Share</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {categoryPerformance.map((category, index) => {
                      const marketShare = (category.revenue / salesData.totalRevenue) * 100;
                      return (
                        <tr key={index} className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${
                          index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        }`}>
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-800">{category.name}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-800">{formatCurrency(category.revenue)}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="font-medium text-slate-600">{category.orders}</div>
                          </td>
                          <td className="py-4 px-6">
                            <div className={`flex items-center space-x-1 font-medium ${getTrendColor(category.growth)}`}>
                              {getTrendIcon(category.growth)}
                              <span>{formatPercentage(category.growth)}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-slate-200 rounded-full h-2">
                                <div 
                                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" 
                                  style={{ width: `${marketShare}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-slate-600">{marketShare.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </ResponsiveTable>
            </Card>

            {/* Customer Segments */}
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-800 mb-1">Segmentasi Pelanggan</h2>
                <p className="text-slate-600">Distribusi pendapatan berdasarkan segmen pelanggan</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {customerSegments.map((segment, index) => (
                    <div key={index} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                      <div className="text-center">
                        <h3 className="font-bold text-slate-800 text-lg mb-2">{segment.segment}</h3>
                        <div className="space-y-2">
                          <p className="text-sm text-slate-600">{segment.count} pelanggan</p>
                          <p className="text-2xl font-bold text-slate-800">{formatCurrency(segment.revenue)}</p>
                          <div className="flex items-center justify-center space-x-1">
                            <div className="w-16 bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" 
                                style={{ width: `${segment.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-600">{segment.percentage.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-8">
            {/* Derived Metrics Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card extra="p-5 shadow-md border-0 bg-white/70 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Margin Profit Keseluruhan</p>
                <p className="text-2xl font-bold text-slate-800">{(() => {
                  const totalRev = dailySales.reduce((a,b)=> a + b.revenue,0);
                  const totalProfit = dailySales.reduce((a,b)=> a + b.profit,0);
                  return totalRev ? ((totalProfit/totalRev)*100).toFixed(1) + '%': '0%';
                })()}</p>
              </Card>
              <Card extra="p-5 shadow-md border-0 bg-white/70 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Returning vs New</p>
                <p className="text-2xl font-bold text-slate-800">{(() => {
                  const returning = salesData?.returningCustomers || 0;
                  const baru = salesData?.newCustomers || 0;
                  const total = returning + baru || 1;
                  return `${returning} (${(returning/total*100).toFixed(1)}%) / ${baru} (${(baru/total*100).toFixed(1)}%)`;
                })()}</p>
              </Card>
              <Card extra="p-5 shadow-md border-0 bg-white/70 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-1">Kategori Teratas</p>
                <p className="text-2xl font-bold text-slate-800">{categoryPerformance[0] ? categoryPerformance[0].name : '-'}</p>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Status Breakdown */}
              <Card extra="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Status Pesanan</h3>
                <div className="space-y-3">
                  {statusBreakdown.map(s => (
                    <div key={s.status} className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-medium text-slate-700 mb-1 capitalize">{s.status}</p>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${s.percentage.toFixed(1)}%` }}></div>
                        </div>
                      </div>
                      <div className="text-right w-32">
                        <p className="text-sm font-semibold text-slate-800">{s.orders} pesanan</p>
                        <p className="text-xs text-slate-500">{s.percentage.toFixed(1)}%</p>
                      </div>
                    </div>
                  ))}
                  {statusBreakdown.length === 0 && <p className="text-sm text-slate-500">Tidak ada data.</p>}
                </div>
              </Card>

              {/* Weekday Pattern */}
              <Card extra="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Pola Hari Dalam Minggu</h3>
                <div className="space-y-3">
                  {weekdaySales.map(w => {
                    const maxOrders = Math.max(...weekdaySales.map(x => x.orders), 0);
                    const pct = maxOrders ? (w.orders / maxOrders) * 100 : 0;
                    const namaHari = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][parseInt(w.weekday,10)];
                    return (
                      <div key={w.weekday} className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-medium text-slate-700 mb-1">{namaHari}</p>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <div className="text-right w-28">
                          <p className="text-sm font-semibold text-slate-800">{w.orders} ord</p>
                          <p className="text-xs text-slate-500">{formatCurrency(w.revenue)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {weekdaySales.length === 0 && <p className="text-sm text-slate-500">Tidak ada data.</p>}
                </div>
              </Card>

              {/* Category Share */}
              <Card extra="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Kontribusi Kategori</h3>
                <div className="space-y-3">
                  {categoryPerformance.slice(0,8).map(c => {
                    const totalRev = categoryPerformance.reduce((a,b)=> a + b.revenue,0) || 1;
                    const pct = (c.revenue / totalRev) * 100;
                    return (
                      <div key={c.name} className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-sm font-medium text-slate-700 mb-1">{c.name}</p>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-600" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>
                        <div className="text-right w-32">
                          <p className="text-sm font-semibold text-slate-800">{pct.toFixed(1)}%</p>
                          <p className="text-xs text-slate-500">{formatCurrency(c.revenue)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {categoryPerformance.length === 0 && <p className="text-sm text-slate-500">Tidak ada data.</p>}
                </div>
              </Card>
            </div>

            {/* Profit & AOV Trend (simple table using dailySales) */}
            <Card extra="p-6 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Trend Pendapatan & Margin</h3>
              <ResponsiveTable>
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600 border-b border-slate-200">
                      <th className="py-2 pr-4 font-medium">Tanggal</th>
                      <th className="py-2 pr-4 font-medium">Revenue</th>
                      <th className="py-2 pr-4 font-medium">Profit</th>
                      <th className="py-2 pr-4 font-medium">Orders</th>
                      <th className="py-2 pr-4 font-medium">AOV</th>
                      <th className="py-2 pr-4 font-medium">Margin %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailySales.map(d => {
                      const aov = d.orders ? d.revenue / d.orders : 0;
                      const marginPct = d.revenue ? (d.profit / d.revenue * 100) : 0;
                      return (
                        <tr key={d.date} className="border-b last:border-none border-slate-100">
                          <td className="py-2 pr-4 font-medium text-slate-700">{formatDate(d.date)}</td>
                          <td className="py-2 pr-4 text-slate-700">{formatCurrency(d.revenue)}</td>
                          <td className="py-2 pr-4 text-slate-700">{formatCurrency(d.profit)}</td>
                          <td className="py-2 pr-4 text-slate-700">{d.orders}</td>
                          <td className="py-2 pr-4 text-slate-700">{formatCurrency(Math.round(aov))}</td>
                          <td className="py-2 pr-4 text-slate-700">{marginPct.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                    {dailySales.length === 0 && (
                      <tr><td colSpan="6" className="py-4 text-center text-slate-500">Tidak ada data.</td></tr>
                    )}
                  </tbody>
                </table>
              </ResponsiveTable>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
