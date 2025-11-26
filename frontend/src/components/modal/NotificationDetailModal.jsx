import React, { useState } from 'react';
import { 
  MdClose, 
  MdNotifications,
  MdShoppingCart,
  MdLocalOffer,
  MdSecurity,
  MdInfo,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdDelete,
  MdMarkAsUnread,
  MdMarkEmailRead,
  MdFilterList,
  MdSelectAll
} from 'react-icons/md';

const NotificationDetailModal = ({ isOpen, onClose, notifications = [], onMarkAsRead, onDeleteNotification }) => {
  const [filter, setFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  if (!isOpen) return null;

  // Enhanced mock notifications with more details
  const enhancedNotifications = notifications.length > 0 ? notifications : [
    {
      id: 1,
      type: 'order',
      title: 'Pesanan Sedang Dikirim',
      message: 'Pesanan ORD001 sedang dalam perjalanan menuju alamat Anda. Estimasi tiba: 2 hari.',
      time: '2 jam lalu',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      details: {
        orderId: 'ORD001',
        trackingNumber: 'JNE123456789',
        estimatedDelivery: '2024-09-22'
      }
    },
    {
      id: 2,
      type: 'promo',
      title: 'Flash Sale 50% OFF!',
      message: 'Jangan lewatkan kesempatan emas! Diskon hingga 50% untuk semua produk abon cakalang premium.',
      time: '4 jam lalu',
      isRead: false,
      priority: 'medium',
      actionRequired: false,
      details: {
        promoCode: 'FLASH50',
        validUntil: '2024-09-25',
        minPurchase: 100000
      }
    },
    {
      id: 3,
      type: 'points',
      title: 'Selamat! Poin Bertambah',
      message: 'Anda mendapat 50 poin reward dari pesanan terakhir. Total poin: 1,250.',
      time: '1 hari lalu',
      isRead: true,
      priority: 'low',
      actionRequired: false,
      details: {
        pointsEarned: 50,
        totalPoints: 1250,
        orderId: 'ORD001'
      }
    },
    {
      id: 4,
      type: 'security',
      title: 'Login dari Perangkat Baru',
      message: 'Terdeteksi login dari perangkat baru. Jika ini bukan Anda, segera ubah password.',
      time: '2 hari lalu',
      isRead: true,
      priority: 'high',
      actionRequired: true,
      details: {
        device: 'Chrome on Windows',
        location: 'Jakarta, Indonesia',
        ipAddress: '192.168.1.1'
      }
    },
    {
      id: 5,
      type: 'info',
      title: 'Update Kebijakan Privasi',
      message: 'Kami telah memperbarui kebijakan privasi. Silakan tinjau perubahan terbaru.',
      time: '3 hari lalu',
      isRead: false,
      priority: 'medium',
      actionRequired: false,
      details: {
        effectiveDate: '2024-10-01',
        changesUrl: '/privacy-policy'
      }
    }
  ];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return <MdShoppingCart className="w-6 h-6 text-blue-600" />;
      case 'promo':
        return <MdLocalOffer className="w-6 h-6 text-green-600" />;
      case 'points':
        return <MdCheckCircle className="w-6 h-6 text-purple-600" />;
      case 'security':
        return <MdSecurity className="w-6 h-6 text-red-600" />;
      case 'info':
        return <MdInfo className="w-6 h-6 text-indigo-600" />;
      default:
        return <MdNotifications className="w-6 h-6 text-slate-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-amber-500 bg-amber-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-slate-500 bg-slate-50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">Tinggi</span>;
      case 'medium':
        return <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">Sedang</span>;
      case 'low':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Rendah</span>;
      default:
        return null;
    }
  };

  const filteredNotifications = enhancedNotifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return notification.type === filter;
  });

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkMarkAsRead = () => {
    selectedNotifications.forEach(id => {
      onMarkAsRead && onMarkAsRead(id);
    });
    setSelectedNotifications([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Hapus ${selectedNotifications.length} notifikasi yang dipilih?`)) {
      selectedNotifications.forEach(id => {
        onDeleteNotification && onDeleteNotification(id);
      });
      setSelectedNotifications([]);
    }
  };

  const formatTime = (timeString) => {
    // In real app, you would use a proper date formatting library
    return timeString;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <MdNotifications className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Pusat Notifikasi</h2>
              <p className="text-sm text-slate-600">
                {filteredNotifications.filter(n => !n.isRead).length} notifikasi belum dibaca
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <MdClose className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Filters and Actions */}
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex items-center space-x-2">
              <MdFilterList className="w-5 h-5 text-slate-600" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">Semua</option>
                <option value="unread">Belum Dibaca</option>
                <option value="read">Sudah Dibaca</option>
                <option value="order">Pesanan</option>
                <option value="promo">Promosi</option>
                <option value="points">Poin</option>
                <option value="security">Keamanan</option>
                <option value="info">Informasi</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">
                  {selectedNotifications.length} dipilih
                </span>
                <button
                  onClick={handleBulkMarkAsRead}
                  className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Tandai Dibaca
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            )}

            {/* Select All */}
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
            >
              <MdSelectAll className="w-4 h-4" />
              <span>
                {selectedNotifications.length === filteredNotifications.length ? 'Batal Pilih' : 'Pilih Semua'}
              </span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[calc(95vh-200px)] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MdNotifications className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Tidak Ada Notifikasi</h3>
              <p className="text-slate-600">
                {filter === 'all' 
                  ? 'Anda belum memiliki notifikasi apapun.'
                  : `Tidak ada notifikasi dengan filter "${filter}".`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-slate-50 transition-colors border-l-4 ${
                    !notification.isRead ? 'bg-indigo-50/30' : ''
                  } ${getPriorityColor(notification.priority)}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={() => handleSelectNotification(notification.id)}
                      className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                    />

                    {/* Icon */}
                    <div className="flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <h3 className={`text-lg font-semibold ${
                            !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                          }`}>
                            {notification.title}
                          </h3>
                          {getPriorityBadge(notification.priority)}
                          {notification.actionRequired && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full font-medium">
                              Perlu Tindakan
                            </span>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-500">
                            {formatTime(notification.time)}
                          </span>
                          <div className="flex space-x-1">
                            {!notification.isRead && (
                              <button
                                onClick={() => onMarkAsRead && onMarkAsRead(notification.id)}
                                className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                title="Tandai sebagai dibaca"
                              >
                                <MdMarkEmailRead className="w-4 h-4" />
                              </button>
                            )}
                            {notification.isRead && (
                              <button
                                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                title="Tandai sebagai belum dibaca"
                              >
                                <MdMarkAsUnread className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteNotification && onDeleteNotification(notification.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                              title="Hapus notifikasi"
                            >
                              <MdDelete className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <p className={`text-sm leading-relaxed mb-3 ${
                        !notification.isRead ? 'text-slate-800' : 'text-slate-600'
                      }`}>
                        {notification.message}
                      </p>

                      {/* Additional Details */}
                      {notification.details && (
                        <div className="bg-white/70 rounded-lg p-3 space-y-2">
                          {notification.type === 'order' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-slate-500">ID Pesanan:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.orderId}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">No. Resi:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.trackingNumber}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Estimasi Tiba:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.estimatedDelivery}
                                </span>
                              </div>
                            </div>
                          )}

                          {notification.type === 'promo' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-slate-500">Kode Promo:</span>
                                <span className="font-bold text-green-600 ml-1">
                                  {notification.details.promoCode}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Berlaku Hingga:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.validUntil}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Min. Pembelian:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  Rp {notification.details.minPurchase?.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          )}

                          {notification.type === 'points' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-slate-500">Poin Didapat:</span>
                                <span className="font-bold text-purple-600 ml-1">
                                  +{notification.details.pointsEarned}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Total Poin:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.totalPoints}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Dari Pesanan:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.orderId}
                                </span>
                              </div>
                            </div>
                          )}

                          {notification.type === 'security' && (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                              <div>
                                <span className="text-slate-500">Perangkat:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.device}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">Lokasi:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.location}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">IP Address:</span>
                                <span className="font-medium text-slate-800 ml-1">
                                  {notification.details.ipAddress}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons */}
                      {notification.actionRequired && (
                        <div className="flex space-x-2 mt-3">
                          {notification.type === 'order' && (
                            <button className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                              Lacak Pesanan
                            </button>
                          )}
                          {notification.type === 'promo' && (
                            <button className="px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                              Gunakan Promo
                            </button>
                          )}
                          {notification.type === 'security' && (
                            <button className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                              Ubah Password
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600">
            Menampilkan {filteredNotifications.length} dari {enhancedNotifications.length} notifikasi
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;