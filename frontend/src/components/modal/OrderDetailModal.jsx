import React, { useState } from 'react';
import {
  MdClose,
  MdPayment,
  MdAccountCircle,
  MdCancel,
  MdFileDownload,
  MdCheckCircle,
  MdLocationOn,
  MdAccessTime,
  MdLocalShipping,
  MdShoppingCart,
  MdPhone,
  MdEmail,
  MdEdit,
  MdSave,
  MdSend,
  MdWarning,
  MdCheck,
  MdHourglassEmpty
} from 'react-icons/md';
import Swal from 'sweetalert2';

import { buildImageUrl } from '../../utils/image';
import api from '../../utils/api';

const OrderDetailModal = ({ order, isOpen, open, onClose, onReorder, onCancelOrder, onDownloadInvoice, onRefresh }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    status: order?.status || 'pending',
    payment_status: order?.payment_status || 'unpaid',
    tracking_number: order?.tracking_number || '',
    estimated_delivery: order?.estimated_delivery || '',
    cancel_reason: order?.cancel_reason || ''
  });

  
  const visible = typeof isOpen !== 'undefined' ? isOpen : (typeof open !== 'undefined' ? open : false);
  
  // Update edit form when order changes
  React.useEffect(() => {
    if (order) {
      console.log('[OrderDetailModal] Order updated:', {
        order_id: order.order_id,
        status: order.status,
        payment_status: order.payment_status
      });
      setEditForm({
        status: order.status || 'pending',
        payment_status: order.payment_status || 'unpaid',
        tracking_number: order.tracking_number || '',
        estimated_delivery: order.estimated_delivery || '',
        cancel_reason: order.cancel_reason || ''
      });
    }
  }, [order]);
  
  if (!visible || !order) return null;

  // Normalize items for display: backend uses order_items, some mock/legacy may use items
  const items = (order.order_items && Array.isArray(order.order_items) && order.order_items.length > 0)
    ? order.order_items.map(oi => ({
        id: oi.order_item_id || oi.id,
        name: oi.name_snapshot || oi.name || 'Produk',
        quantity: oi.quantity || 0,
        price: Number(oi.price_unit || oi.price || oi.subtotal/ (oi.quantity||1) || 0),
        subtotal: Number(oi.subtotal || ( (oi.price_unit || oi.price || 0) * (oi.quantity||0) )),
      }))
    : (order.items || []).map(it => ({
        id: it.id,
        name: it.name,
        quantity: it.quantity || 0,
        price: Number(it.price || 0),
        subtotal: Number((it.price || 0) * (it.quantity || 0)),
      }));

  // Get customer info from order data
  const customer = {
    name: order.user?.fullname || order.ship_receiver_name || order._customer || 'Customer',
    email: order.user?.email || order._email || '-',
    phone: order.ship_phone || order._phone || '-'
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Payment Proofs Section
  const paymentProofs = order.paymentProofs || order.payment_proofs || order.PaymentProof || [];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Menunggu' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Diproses' },
      shipped: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Dikirim' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Selesai' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Dibatalkan' }
    };
    
    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleCancelOrder = () => {
    if (onCancelOrder) onCancelOrder(order.order_id || order.id);
    setShowCancelConfirm(false);
    onClose();
  };

  const handleDownloadInvoice = () => {
    if (typeof onDownloadInvoice === 'function') {
      onDownloadInvoice(order);
    }
  };

  const handleUpdateOrder = async () => {
    if (!order?.order_id && !order?.id) {
      Swal.fire('Error', 'Order ID tidak ditemukan', 'error');
      return;
    }

    const orderId = order.order_id || order.id;

    try {
      setUpdating(true);

      console.log('[OrderDetailModal] Updating order:', {
        orderId,
        editForm
      });

      // Update order status
      await api.patch(
        `/api/v1/orders/${orderId}/status`,
        {
          status: editForm.status,
          tracking_number: editForm.tracking_number,
          estimated_delivery: editForm.estimated_delivery,
          cancel_reason: editForm.cancel_reason
        }
      );

      console.log('[OrderDetailModal] Order status updated successfully');

      // Update payment status if changed
      if (editForm.payment_status !== order.payment_status) {
        await api.patch(
          `/api/v1/orders/${orderId}/payment-status`,
          { payment_status: editForm.payment_status }
        );
        console.log('[OrderDetailModal] Payment status updated successfully');
      }

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Status pesanan berhasil diupdate',
        timer: 2000,
        showConfirmButton: false
      });

      setIsEditing(false);
      
      // Refresh order data
      if (onRefresh) {
        await onRefresh();
      }
      
      // Close modal after successful update
      setTimeout(() => {
        if (onClose) onClose();
      }, 2100);
      
    } catch (error) {
      console.error('Error updating order:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error.response?.data?.msg || error.response?.data?.error || 'Gagal mengupdate pesanan'
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleSendWhatsApp = async () => {
    const phone = order.user?.phone || order.ship_phone || order.guest_whatsapp || order.guest_phone;
    
    if (!phone) {
      Swal.fire({
        icon: 'warning',
        title: 'Nomor WhatsApp Tidak Ada',
        text: 'Customer belum memiliki nomor WhatsApp yang terdaftar'
      });
      return;
    }

    try {
      const statusLabels = {
        pending: 'Menunggu Pembayaran',
        processing: 'Sedang Diproses',
        shipped: 'Dalam Pengiriman',
        completed: 'Selesai',
        cancelled: 'Dibatalkan'
      };

      const message = `*Halo ${customer.name}!* 👋

Pesanan Anda *${order.order_number}* telah *${statusLabels[order.status] || order.status}*

📦 *Detail Pesanan:*
• Total: ${formatCurrency(order.total)}
• Status: ${statusLabels[order.status] || order.status}
${order.tracking_number ? `• Resi: ${order.tracking_number}` : ''}
${order.estimated_delivery ? `• Estimasi: ${order.estimated_delivery}` : ''}

${order.status === 'shipped' ? '🚚 Pesanan Anda sedang dalam perjalanan! Mohon pantau nomor resi di atas.' : ''}
${order.status === 'completed' ? '✅ Terima kasih atas pesanan Anda! Jangan lupa berikan testimoni 🙏' : ''}

Terima kasih telah berbelanja di *Lyvia Nusa Boga* 🐟`;

      // Normalize phone number
      let waNumber = phone.replace(/\D/g, ''); // Remove non-digits
      
      // Convert 08xx to 628xx
      if (waNumber.startsWith('0')) {
        waNumber = '62' + waNumber.substring(1);
      }
      // Remove leading + if exists
      if (waNumber.startsWith('+')) {
        waNumber = waNumber.substring(1);
      }
      
      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // Open WhatsApp Web/App
      const whatsappUrl = `https://wa.me/${waNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal membuka WhatsApp'
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden shadow-xl">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Detail Pesanan</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">{order.order_number || order.id}</span>
                {getStatusBadge(order.status)}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Order Info */}
            <div className="p-4 space-y-4">
              
              {/* Customer & Order Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <MdAccountCircle className="w-4 h-4 mr-1" />
                    Pelanggan
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="text-gray-900 font-medium">{customer.name}</div>
                    <div className="flex items-center text-gray-600">
                      <MdEmail className="w-3 h-3 mr-1" />
                      {customer.email}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MdPhone className="w-3 h-3 mr-1" />
                      {customer.phone}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <MdShoppingCart className="w-4 h-4 mr-1" />
                    Info Pesanan
                  </h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tanggal:</span>
                      <span className="text-gray-900 text-xs">{formatDate(order.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Channel:</span>
                      <span className="text-gray-900 uppercase">{order.channel || 'Online'}</span>
                    </div>
                    {order.payment_method && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Metode:</span>
                        <span className="text-gray-900 text-xs">{order.payment_method}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Summary Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-200">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center">
                    <MdPayment className="w-4 h-4 mr-1" />
                    Ringkasan Pembayaran
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900 font-medium">{formatCurrency(order.subtotal || 0)}</span>
                    </div>
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Diskon:</span>
                        <span className="text-red-600 font-medium">-{formatCurrency(order.discount_amount)}</span>
                      </div>
                    )}
                    {order.shipping_cost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ongkir:</span>
                        <span className="text-gray-900 font-medium">{formatCurrency(order.shipping_cost)}</span>
                      </div>
                    )}
                    <div className="border-t border-indigo-200 pt-1.5">
                      <div className="flex justify-between font-bold">
                        <span className="text-indigo-900">Total:</span>
                        <span className="text-indigo-600 text-base">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* EDIT MODE SECTION */}
              {isEditing && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-indigo-200">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
                    <MdEdit className="w-4 h-4 mr-1" />
                    Edit Status Pesanan
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Order Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status Pesanan
                      </label>
                      <select
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="pending">Menunggu</option>
                        <option value="processing">Diproses</option>
                        <option value="shipped">Dikirim</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status Pembayaran
                      </label>
                      <select
                        value={editForm.payment_status}
                        onChange={(e) => setEditForm({ ...editForm, payment_status: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="unpaid">Belum Bayar</option>
                        <option value="paid">Lunas</option>
                        <option value="partial">Sebagian</option>
                        <option value="refunded">Refund</option>
                      </select>
                    </div>

                    {/* Tracking Number */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Nomor Resi
                      </label>
                      <input
                        type="text"
                        value={editForm.tracking_number}
                        onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                        placeholder="Masukkan nomor resi"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Estimated Delivery */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Estimasi Pengiriman
                      </label>
                      <input
                        type="text"
                        value={editForm.estimated_delivery}
                        onChange={(e) => setEditForm({ ...editForm, estimated_delivery: e.target.value })}
                        placeholder="e.g., 2-3 hari"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    {/* Cancel Reason (if status is cancelled) */}
                    {editForm.status === 'cancelled' && (
                      <div className="md:col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Alasan Pembatalan
                        </label>
                        <textarea
                          value={editForm.cancel_reason}
                          onChange={(e) => setEditForm({ ...editForm, cancel_reason: e.target.value })}
                          placeholder="Masukkan alasan pembatalan"
                          rows={2}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleUpdateOrder}
                      disabled={updating}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <MdSave className="w-4 h-4 mr-1" />
                      {updating ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={updating}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {/* PAYMENT DETAILS SECTION */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                <h3 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                  <MdPayment className="w-4 h-4 mr-1" />
                  Detail Pembayaran
                </h3>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Status:</span>
                    <span className={`text-sm font-bold ${
                      order.payment_status === 'paid' ? 'text-green-600' :
                      order.payment_status === 'partial' ? 'text-amber-600' :
                      order.payment_status === 'refunded' ? 'text-purple-600' :
                      'text-red-600'
                    }`}>
                      {order.payment_status === 'paid' ? '✓ Lunas' :
                       order.payment_status === 'partial' ? '◐ Sebagian' :
                       order.payment_status === 'refunded' ? '↺ Refund' :
                       '✗ Belum Bayar'}
                    </span>
                  </div>

                  {order.payment_method && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Metode:</span>
                      <span className="text-sm font-medium text-gray-800">{order.payment_method}</span>
                    </div>
                  )}

                  {order.paid_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Dibayar:</span>
                      <span className="text-sm text-gray-700">{formatDate(order.paid_at)}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Total Tagihan:</span>
                      <span className="text-lg font-bold text-green-700">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Items ({items.length})</h3>
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-600">
                          {item.quantity}x @ {formatCurrency(item.price)}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proofs */}
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                  <MdPayment className="w-4 h-4 mr-1" />
                  Bukti Pembayaran
                </h3>
                {Array.isArray(paymentProofs) && paymentProofs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {paymentProofs.map((proof, idx) => (
                      <div key={proof.proof_id || idx} className="flex items-center gap-3 bg-white rounded p-2 border border-slate-200">
                        <img
                          src={buildImageUrl(proof.file_url)}
                          alt={`Bukti Bayar ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded border border-slate-100"
                          onError={e => { e.target.onerror = null; e.target.src = '/uploads/placeholder.png'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-700 truncate">{proof.file_url}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Diupload: {proof.uploaded_at ? formatDate(proof.uploaded_at) : '-'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">Belum ada bukti pembayaran diunggah.</div>
                )}
              </div>

              {/* Shipping Address & Details - Combined in 2 columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Shipping Address */}
                {(order.ship_address_detail || order._address) && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <MdLocationOn className="w-4 h-4 mr-1" />
                      Alamat Pengiriman
                    </h3>
                    <div className="text-sm text-gray-700">
                      {order.ship_address_detail || order._address}
                    </div>
                    {order.ship_receiver_name && (
                      <div className="text-xs text-gray-600 mt-1">
                        Penerima: {order.ship_receiver_name}
                      </div>
                    )}
                  </div>
                )}

                {/* Shipping Details */}
                {(order.courier_name || order.shipping_method) && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <MdLocalShipping className="w-4 h-4 mr-1 text-indigo-600" />
                      Informasi Pengiriman
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Ekspedisi:</span>
                        <span className="text-sm font-bold text-indigo-700">
                          {order.courier_name || order.shipping_method || '-'}
                        </span>
                      </div>
                      {order.shipping_service && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Layanan:</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {order.shipping_service}
                            {order.shipping_service_name && ` (${order.shipping_service_name})`}
                          </span>
                        </div>
                      )}
                      {order.shipping_etd && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Estimasi:</span>
                          <span className="text-sm text-blue-600 font-medium">
                            {order.shipping_etd} hari
                          </span>
                        </div>
                      )}
                      {order.shipping_cost > 0 && (
                        <div className="flex items-center justify-between pt-2 border-t border-indigo-200">
                          <span className="text-xs text-gray-600">Biaya Pengiriman:</span>
                          <span className="text-sm font-bold text-indigo-600">
                            {formatCurrency(order.shipping_cost)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 border-t border-gray-200 bg-gray-50 gap-3 flex-none">
            <div className="flex gap-2 flex-wrap">
              {onDownloadInvoice && (
                <button
                  onClick={handleDownloadInvoice}
                  className="inline-flex items-center px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <MdFileDownload className="w-4 h-4 mr-1" />
                  Invoice
                </button>
              )}

              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 text-sm text-indigo-700 bg-indigo-50 border border-indigo-300 rounded-md hover:bg-indigo-100 transition-colors"
                >
                  <MdEdit className="w-4 h-4 mr-1" />
                  Edit Status
                </button>
              )}

              <button
                onClick={handleSendWhatsApp}
                className="inline-flex items-center px-3 py-2 text-sm text-white bg-green-600 border border-green-700 rounded-md hover:bg-green-700 transition-colors"
              >
                <MdSend className="w-4 h-4 mr-1" />
                Hubungi Pembeli
              </button>
            </div>
            
            <div className="flex gap-2 justify-end">
              {order.status === 'pending' && onCancelOrder && !isEditing && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-3 py-2 text-sm text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Batalkan
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-white bg-gray-600 rounded-md hover:bg-gray-700 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MdCancel className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Batalkan Pesanan?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailModal;