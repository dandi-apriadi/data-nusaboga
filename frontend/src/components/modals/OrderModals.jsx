import React, { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  MdClose, 
  MdEdit,
  MdVisibility,
  MdLocalShipping,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdPayment,
  MdInventory,
  MdAttachMoney,
  MdPrint,
  MdCancel,
  MdCheckCircle,
  MdMoreVert,
  MdInfo,
  MdWarning,
  MdTrendingUp,
  MdShoppingCart,
  MdPerson,
  MdCalendarToday,
  MdHistory,
  MdCheck,
  MdSave
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

// Order Detail Modal
export const OrderDetailModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency", 
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMMM yyyy, HH:mm", { locale: id });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      MENUNGGU: { 
        bg: "bg-amber-100", 
        text: "text-amber-800", 
        dot: "bg-amber-500",
        border: "border-amber-200"
      },
      DIPROSES: { 
        bg: "bg-blue-100", 
        text: "text-blue-800", 
        dot: "bg-blue-500",
        border: "border-blue-200"
      },
      DIKIRIM: { 
        bg: "bg-purple-100", 
        text: "text-purple-800", 
        dot: "bg-purple-500",
        border: "border-purple-200"
      },
      SELESAI: { 
        bg: "bg-green-100", 
        text: "text-green-800", 
        dot: "bg-green-500",
        border: "border-green-200"
      },
      DIBATALKAN: { 
        bg: "bg-red-100", 
        text: "text-red-800", 
        dot: "bg-red-500",
        border: "border-red-200"
      }
    };
    
    const config = statusConfig[status] || statusConfig.MENUNGGU;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm rounded-full font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${config.dot} animate-pulse`}></span>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    if (priority === "high") {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
          Prioritas Tinggi
        </span>
      );
    }
    return null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Detail Pesanan</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              {order.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
        {/* Order Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Status */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">Status Pesanan</h3>
                <MdInfo className="w-5 h-5 text-slate-600" />
              </div>
              <div className="space-y-2">
                {getStatusBadge(order.status)}
                {getPriorityBadge(order.priority)}
              </div>
              {order.trackingNumber && (
                <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-600 font-medium">Tracking Number</p>
                  <p className="text-sm font-bold text-blue-800">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Total & Payment */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">Total Pembayaran</h3>
                <MdAttachMoney className="w-5 h-5 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-green-700">{formatCurrency(order.total)}</p>
                <div className="flex items-center text-sm text-green-600">
                  <MdPayment className="w-4 h-4 mr-1" />
                  <span>{order.paymentMethod}</span>
                </div>
                <p className="text-xs text-green-600">
                  {order.items.reduce((sum, item) => sum + item.qty, 0)} item produk
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-800">Timeline</h3>
                <MdHistory className="w-5 h-5 text-purple-600" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-purple-700">
                  <MdCalendarToday className="w-4 h-4 mr-2" />
                  <span>Dibuat: {formatDate(order.createdAt)}</span>
                </div>
                {order.estimatedDelivery && order.status !== "SELESAI" && order.status !== "DIBATALKAN" && (
                  <div className="flex items-center text-purple-600">
                    <MdLocalShipping className="w-4 h-4 mr-2" />
                    <span>Est. Tiba: {formatDate(order.estimatedDelivery)}</span>
                  </div>
                )}
                {order.completedAt && (
                  <div className="flex items-center text-green-600">
                    <MdCheckCircle className="w-4 h-4 mr-2" />
                    <span>Selesai: {formatDate(order.completedAt)}</span>
                  </div>
                )}
                {order.cancelledAt && (
                  <div className="flex items-center text-red-600">
                    <MdCancel className="w-4 h-4 mr-2" />
                    <span>Dibatalkan: {formatDate(order.cancelledAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Pelanggan</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                  <MdPerson className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{order.customer}</p>
                  <p className="text-sm text-slate-600">Nama Pelanggan</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <MdEmail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{order.email}</p>
                  <p className="text-sm text-slate-600">Email</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <MdPhone className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{order.phone}</p>
                  <p className="text-sm text-slate-600">Nomor Telepon</p>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 flex-shrink-0">
                  <MdLocationOn className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 mb-1">Alamat Pengiriman</p>
                  <p className="text-slate-600 leading-relaxed">{order.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Note */}
          {order.customerNote && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Catatan Pelanggan</h4>
              <p className="text-blue-700">{order.customerNote}</p>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Detail Produk</h3>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                    <MdInventory className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{item.name}</h4>
                    <p className="text-sm text-slate-600">
                      {item.qty} x {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-800">
                    {formatCurrency(item.price * item.qty)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.qty), 0))}
                </span>
              </div>
              <div className="border-t border-slate-200 pt-2">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-slate-800">Total:</span>
                  <span className="text-xl font-bold text-indigo-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Reason (if cancelled) */}
        {order.status === "DIBATALKAN" && order.cancelReason && (
          <div className="p-6 border-b border-slate-200">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-800 mb-2">Alasan Pembatalan</h4>
              <p className="text-red-700">{order.cancelReason}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
              <MdPrint className="w-4 h-4 mr-2" />
              Cetak
            </button>
            <button className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
              <MdEdit className="w-4 h-4 mr-2" />
              Edit Pesanan
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Status Update Modal
export const StatusUpdateModal = ({ isOpen, onClose, order, onUpdateStatus }) => {
  const [selectedStatus, setSelectedStatus] = useState(order?.status || 'MENUNGGU');
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const statusOptions = [
    { value: 'MENUNGGU', label: 'Menunggu', color: 'text-amber-600', description: 'Pesanan menunggu diproses' },
    { value: 'DIPROSES', label: 'Diproses', color: 'text-blue-600', description: 'Pesanan sedang diproses' },
    { value: 'DIKIRIM', label: 'Dikirim', color: 'text-purple-600', description: 'Pesanan sedang dikirim' },
    { value: 'SELESAI', label: 'Selesai', color: 'text-green-600', description: 'Pesanan telah selesai' },
    { value: 'DIBATALKAN', label: 'Dibatalkan', color: 'text-red-600', description: 'Pesanan dibatalkan' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const updateData = {
        status: selectedStatus,
        notes,
        ...(selectedStatus === 'DIKIRIM' && trackingNumber && { trackingNumber })
      };
      
      await onUpdateStatus(order.id, updateData);
      onClose();
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Update Status Pesanan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        {/* Order Info */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-slate-800">{order.id}</h3>
              <p className="text-sm text-slate-600">{order.customer}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-800">{order.total ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(order.total) : 'N/A'}</p>
              <p className="text-sm text-slate-600">Status saat ini: <strong>{order.status}</strong></p>
            </div>
          </div>
        </div>

        {/* Status Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Pilih Status Baru
          </label>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <label
                key={status.value}
                className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedStatus === status.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={status.value}
                  checked={selectedStatus === status.value}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="sr-only"
                />
                <div className="flex-1">
                  <div className={`font-semibold ${status.color}`}>{status.label}</div>
                  <div className="text-sm text-slate-600">{status.description}</div>
                </div>
                {selectedStatus === status.value && (
                  <MdCheck className="w-5 h-5 text-indigo-600" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Tracking Number (for DIKIRIM status) */}
        {selectedStatus === 'DIKIRIM' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nomor Resi (Opsional)
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Masukkan nomor resi pengiriman"
            />
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Catatan (Opsional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Tambahkan catatan untuk update status ini..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isUpdating}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Mengupdate...
              </>
            ) : (
              <>
                <MdSave className="w-4 h-4 mr-2" />
                Update Status
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Order Tracking Modal
export const OrderTrackingModal = ({ isOpen, onClose, order }) => {
  if (!order) return null;

  const trackingSteps = [
    {
      status: 'MENUNGGU',
      label: 'Pesanan Diterima',
      description: 'Pesanan telah diterima dan menunggu konfirmasi',
      icon: <MdCheckCircle className="w-5 h-5" />,
      completed: true,
      date: order.createdAt
    },
    {
      status: 'DIPROSES', 
      label: 'Sedang Diproses',
      description: 'Pesanan sedang diproses dan dikemas',
      icon: <MdInventory className="w-5 h-5" />,
      completed: ['DIPROSES', 'DIKIRIM', 'SELESAI'].includes(order.status),
      date: order.processedAt
    },
    {
      status: 'DIKIRIM',
      label: 'Dalam Pengiriman', 
      description: 'Pesanan sedang dalam perjalanan',
      icon: <MdLocalShipping className="w-5 h-5" />,
      completed: ['DIKIRIM', 'SELESAI'].includes(order.status),
      date: order.shippedAt
    },
    {
      status: 'SELESAI',
      label: 'Pesanan Selesai',
      description: 'Pesanan telah diterima pelanggan',
      icon: <MdTrendingUp className="w-5 h-5" />,
      completed: order.status === 'SELESAI',
      date: order.completedAt
    }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: id });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold">Tracking Pesanan</h2>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
              {order.id}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Order Summary */}
        <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Pelanggan</p>
              <p className="font-semibold text-slate-800">{order.customer}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Total</p>
              <p className="font-semibold text-slate-800">
                {order.total ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(order.total) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status Saat Ini</p>
              <p className="font-semibold text-slate-800">{order.status}</p>
            </div>
          </div>
          
          {order.trackingNumber && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Nomor Resi</p>
              <p className="text-lg font-bold text-blue-800">{order.trackingNumber}</p>
            </div>
          )}
        </div>

        {/* Tracking Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Timeline Pengiriman</h3>
          
          {trackingSteps.map((step, index) => (
            <div key={step.status} className="flex items-start space-x-4">
              {/* Timeline Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                step.completed 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step.icon}
              </div>
              
              {/* Timeline Content */}
              <div className="flex-1">
                <div className={`flex items-center space-x-2 mb-1 ${
                  step.completed ? 'text-green-600' : 'text-slate-400'
                }`}>
                  <h4 className="font-semibold">{step.label}</h4>
                  {step.completed && <MdCheck className="w-4 h-4" />}
                </div>
                <p className="text-sm text-slate-600 mb-1">{step.description}</p>
                {step.date && (
                  <p className="text-xs text-slate-500">{formatDate(step.date)}</p>
                )}
              </div>
              
              {/* Timeline Line */}
              {index < trackingSteps.length - 1 && (
                <div className={`absolute left-[2.5rem] mt-10 w-0.5 h-6 ${
                  step.completed ? 'bg-green-300' : 'bg-slate-200'
                }`} style={{ marginLeft: '1.25rem' }}></div>
              )}
            </div>
          ))}
        </div>

        {/* Estimated Delivery */}
        {order.estimatedDelivery && order.status !== 'SELESAI' && order.status !== 'DIBATALKAN' && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-3">
              <MdCalendarToday className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-purple-800">Estimasi Tiba</p>
                <p className="text-purple-700">{formatDate(order.estimatedDelivery)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          {order.trackingNumber && (
            <button className="inline-flex items-center px-4 py-2 text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors">
              <MdVisibility className="w-4 h-4 mr-2" />
              Cek di Website Kurir
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};