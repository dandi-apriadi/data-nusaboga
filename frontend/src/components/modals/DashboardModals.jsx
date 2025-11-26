import React, { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  MdClose, 
  MdNotifications,
  MdTrendingUp,
  MdShoppingCart,
  MdPeople,
  MdInventory,
  MdAttachMoney,
  MdWarning,
  MdInfo,
  MdCheckCircle,
  MdRefresh,
  MdSettings,
  MdVisibility,
  MdMoreVert,
  MdFilterList,
  MdCalendarToday,
  MdArrowUpward,
  MdArrowDownward,
  MdInsights,
  MdAnalytics,
  MdBarChart,
  MdShowChart
} from "react-icons/md";

// Base Modal Component
const Modal = ({ isOpen, onClose, children, size = "lg" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 max-h-[90vh] overflow-hidden`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Quick Stats Modal - Dashboard Detail
export const QuickStatsModal = ({ isOpen, onClose, statsData }) => {
  if (!statsData) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
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

  // Mock detailed stats data
  const detailedStats = {
    revenue: {
      current: 25500000,
      previous: 22100000,
      trend: 15.4,
      breakdown: [
        { period: "Hari ini", value: 1250000, percentage: 4.9 },
        { period: "Minggu ini", value: 8750000, percentage: 34.3 },
        { period: "Bulan ini", value: 25500000, percentage: 100 }
      ]
    },
    orders: {
      current: 150,
      previous: 132,
      trend: 13.6,
      breakdown: [
        { period: "Hari ini", value: 8, percentage: 5.3 },
        { period: "Minggu ini", value: 45, percentage: 30 },
        { period: "Bulan ini", value: 150, percentage: 100 }
      ]
    },
    customers: {
      current: 89,
      previous: 76,
      trend: 17.1,
      breakdown: [
        { period: "Pelanggan baru", value: 23, percentage: 25.8 },
        { period: "Pelanggan kembali", value: 66, percentage: 74.2 }
      ]
    },
    products: {
      current: 45,
      lowStock: 5,
      outOfStock: 2,
      bestseller: "Abon Cakalang Premium"
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <MdInsights className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Detail Statistik Dashboard</h2>
              <p className="text-indigo-100">Analisis mendalam performa bisnis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-6 space-y-6">
        {/* Revenue Analysis */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                <MdAttachMoney className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Analisis Pendapatan</h3>
                <p className="text-slate-600">Detail revenue dan tren pertumbuhan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-700">{formatCurrency(detailedStats.revenue.current)}</p>
              <div className="flex items-center justify-end space-x-1">
                {getTrendIcon(detailedStats.revenue.trend)}
                <span className={`text-sm font-medium ${getTrendColor(detailedStats.revenue.trend)}`}>
                  {Math.abs(detailedStats.revenue.trend)}% vs bulan lalu
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {detailedStats.revenue.breakdown.map((item, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">{item.period}</p>
                <p className="font-bold text-slate-800">{formatCurrency(item.value)}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600 ml-2">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Orders Analysis */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100">
                <MdShoppingCart className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Analisis Pesanan</h3>
                <p className="text-slate-600">Breakdown pesanan dan tren pembelian</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-indigo-700">{detailedStats.orders.current}</p>
              <div className="flex items-center justify-end space-x-1">
                {getTrendIcon(detailedStats.orders.trend)}
                <span className={`text-sm font-medium ${getTrendColor(detailedStats.orders.trend)}`}>
                  {Math.abs(detailedStats.orders.trend)}% vs bulan lalu
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {detailedStats.orders.breakdown.map((item, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-3">
                <p className="text-xs text-slate-600 mb-1">{item.period}</p>
                <p className="font-bold text-slate-800">{item.value} pesanan</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="w-full bg-indigo-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-600 ml-2">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customers Analysis */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                <MdPeople className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Analisis Pelanggan</h3>
                <p className="text-slate-600">Segmentasi dan loyalitas pelanggan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-purple-700">{detailedStats.customers.current}</p>
              <div className="flex items-center justify-end space-x-1">
                {getTrendIcon(detailedStats.customers.trend)}
                <span className={`text-sm font-medium ${getTrendColor(detailedStats.customers.trend)}`}>
                  {Math.abs(detailedStats.customers.trend)}% vs bulan lalu
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {detailedStats.customers.breakdown.map((item, index) => (
              <div key={index} className="bg-white/50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-2">{item.period}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xl font-bold text-slate-800">{item.value}</p>
                  <span className="text-lg font-medium text-purple-600">{item.percentage}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Analysis */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100">
                <MdInventory className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Analisis Produk</h3>
                <p className="text-slate-600">Status inventori dan produk terlaris</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Total Produk</p>
              <p className="text-2xl font-bold text-slate-800">{detailedStats.products.current}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Stok Menipis</p>
              <p className="text-2xl font-bold text-amber-600">{detailedStats.products.lowStock}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Stok Habis</p>
              <p className="text-2xl font-bold text-red-600">{detailedStats.products.outOfStock}</p>
            </div>
            <div className="bg-white/50 rounded-lg p-4">
              <p className="text-xs text-slate-600 mb-1">Bestseller</p>
              <p className="text-sm font-bold text-slate-800">{detailedStats.products.bestseller}</p>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Key Insights & Rekomendasi</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <MdCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Performa Positif</p>
                <p className="text-sm text-green-700">Revenue naik 15.4% dengan tren pelanggan baru yang baik</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <MdWarning className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-800">Perhatian</p>
                <p className="text-sm text-amber-700">5 produk dengan stok menipis perlu restock segera</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <MdTrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Peluang</p>
                <p className="text-sm text-blue-700">Tingkatkan stocking produk bestseller untuk maksimalkan sales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          <button className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
            <MdAnalytics className="w-4 h-4 mr-2" />
            Lihat Laporan Detail
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Notification Modal - Detail System Notifications
export const NotificationModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'order',
      title: 'Pesanan Baru Masuk',
      message: '5 pesanan baru menunggu konfirmasi dari pelanggan',
      time: '2 menit lalu',
      priority: 'high',
      read: false,
      action: 'Lihat Pesanan'
    },
    {
      id: 2,
      type: 'inventory',
      title: 'Stok Menipis',
      message: 'Abon Cakalang Premium tersisa 3 unit',
      time: '15 menit lalu',
      priority: 'medium',
      read: false,
      action: 'Update Stok'
    },
    {
      id: 3,
      type: 'customer',
      title: 'Pelanggan VIP Baru',
      message: 'Rina Kartika telah mencapai status VIP dengan total belanja Rp 2.850.000',
      time: '1 jam lalu',
      priority: 'low',
      read: true,
      action: 'Lihat Profil'
    },
    {
      id: 4,
      type: 'system',
      title: 'Backup Otomatis Selesai',
      message: 'Backup database telah berhasil dilakukan',
      time: '3 jam lalu',
      priority: 'low',
      read: true,
      action: null
    },
    {
      id: 5,
      type: 'order',
      title: 'Pesanan Dibatalkan',
      message: 'Pesanan ORD006 dibatalkan oleh pelanggan',
      time: '5 jam lalu',
      priority: 'medium',
      read: true,
      action: 'Lihat Detail'
    }
  ];

  const tabs = [
    { id: 'all', label: 'Semua', count: notifications.length },
    { id: 'unread', label: 'Belum Dibaca', count: notifications.filter(n => !n.read).length },
    { id: 'order', label: 'Pesanan', count: notifications.filter(n => n.type === 'order').length },
    { id: 'inventory', label: 'Inventori', count: notifications.filter(n => n.type === 'inventory').length },
    { id: 'system', label: 'Sistem', count: notifications.filter(n => n.type === 'system').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const getNotificationIcon = (type) => {
    const icons = {
      order: <MdShoppingCart className="w-5 h-5 text-blue-600" />,
      inventory: <MdInventory className="w-5 h-5 text-amber-600" />,
      customer: <MdPeople className="w-5 h-5 text-purple-600" />,
      system: <MdSettings className="w-5 h-5 text-slate-600" />
    };
    return icons[type] || <MdInfo className="w-5 h-5 text-slate-600" />;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-l-red-500 bg-red-50',
      medium: 'border-l-amber-500 bg-amber-50',
      low: 'border-l-slate-500 bg-slate-50'
    };
    return colors[priority] || colors.low;
  };

  const markAllAsRead = () => {
    // Implementation to mark all notifications as read
    console.log('Marking all notifications as read');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
              <MdNotifications className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Notifikasi Sistem</h2>
              <p className="text-slate-200">Kelola dan pantau aktivitas sistem</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={markAllAsRead}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
            >
              Tandai Semua Dibaca
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-slate-200 px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    activeTab === tab.id 
                      ? 'bg-indigo-100 text-indigo-600' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96 p-6">
          {filteredNotifications.length > 0 ? (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-l-4 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                    getPriorityColor(notification.priority)
                  } ${!notification.read ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-semibold ${
                            !notification.read ? 'text-slate-800' : 'text-slate-600'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className={`text-sm mb-2 ${
                          !notification.read ? 'text-slate-700' : 'text-slate-500'
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500">{notification.time}</span>
                          {notification.action && (
                            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                              {notification.action}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MdMoreVert className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mx-auto mb-4">
                <MdNotifications className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">Tidak ada notifikasi</h3>
              <p className="text-slate-600">
                {activeTab === 'all' 
                  ? 'Belum ada notifikasi yang tersedia'
                  : `Tidak ada notifikasi untuk kategori "${tabs.find(t => t.id === activeTab)?.label}"`
                }
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <div className="text-sm text-slate-600">
            {filteredNotifications.filter(n => !n.read).length} notifikasi belum dibaca
          </div>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-3 py-1.5 text-sm text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <MdSettings className="w-4 h-4 mr-1" />
              Pengaturan
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};