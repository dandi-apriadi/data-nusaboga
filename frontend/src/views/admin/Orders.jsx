import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Card from "components/card";
import Receipt from "components/Receipt";
import ResponsiveTable from 'components/ResponsiveTable';
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders as fetchOrdersThunk, updateOrderStatus as updateOrderStatusThunk, fetchOrder as fetchOrderThunk, updatePaymentStatus as updatePaymentStatusThunk } from "../../store/slices/orderSlice";
import OrderDetailModal from "components/modal/OrderDetailModal";
import { 
  MdSearch, 
  MdFilterList, 
  MdVisibility, 
  MdEdit,
  MdShoppingCart,
  MdLocalShipping,
  MdCheckCircle,
  MdCancel,
  MdPeople,
  MdAttachMoney,
  MdRefresh,
  MdFileDownload,
  MdMoreVert,
  MdPhone,
  MdEmail,
  MdLocationOn,
  MdPayment,
  MdInventory,
  MdTrendingUp,
  MdNotifications,
  MdPrint,
  MdCheck,
  MdClear,
  MdCloudDownload
} from "react-icons/md";
import { fetchPaymentProofs } from "../../store/slices/paymentProofSlice";
import { buildImageUrl } from "../../utils/image";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState(null);
  // Remove modal state for receipt
  // Local loading flags for optimistic updates
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const dispatch = useDispatch();
  const { items: orders, page, pageSize, total, loading, error } = useSelector((s) => s.orders || { items: [], page: 1, pageSize: 50, total: 0, loading: false, error: null });
  const paymentProofState = useSelector(s => s.paymentProof || {});
  const { selected: selectedOrder, loadingDetail } = useSelector((s) => s.orders || {});

  const statusIdToEn = {
    MENUNGGU: "pending",
    DIPROSES: "processing",
    DIKIRIM: "shipped",
    SELESAI: "completed",
    DIBATALKAN: "cancelled",
  };
  const statusEnToId = {
    pending: "MENUNGGU",
    processing: "DIPROSES",
    shipped: "DIKIRIM",
    completed: "SELESAI",
    cancelled: "DIBATALKAN",
  };

  const computeStatusCounts = (list) => {
    const counts = { MENUNGGU: 0, DIPROSES: 0, DIKIRIM: 0, SELESAI: 0, DIBATALKAN: 0 };
    for (const o of list) {
      const idStatus = statusEnToId[o.status] || o.status;
      if (counts[idStatus] !== undefined) counts[idStatus] += 1;
    }
    return counts;
  };

  const statusOptions = useMemo(() => {
    const counts = computeStatusCounts(orders);
    return [
      { value: "all", label: "Semua Status", count: orders.length },
      { value: "MENUNGGU", label: "Menunggu", count: counts.MENUNGGU },
      { value: "DIPROSES", label: "Diproses", count: counts.DIPROSES },
      { value: "DIKIRIM", label: "Dikirim", count: counts.DIKIRIM },
      { value: "SELESAI", label: "Selesai", count: counts.SELESAI },
      { value: "DIBATALKAN", label: "Dibatalkan", count: counts.DIBATALKAN },
    ];
  }, [orders]);

  // Presentation-enriched orders for UI rendering
  const ordersView = useMemo(() => {
    const parsePhoneFromNote = (note) => {
      if (!note) return null;
      // Common patterns: WA: xxx, Whatsapp: xxx, Telp: xxx, Telepon: xxx, HP: xxx
      const patterns = [
        /WA\s*[:\-]\s*([+0-9\s-]+)/i,
        /Whatsapp\s*[:\-]\s*([+0-9\s-]+)/i,
        /Telp(?:on)?\s*[:\-]\s*([+0-9\s-]+)/i,
        /HP\s*[:\-]\s*([+0-9\s-]+)/i,
        /Phone\s*[:\-]\s*([+0-9\s-]+)/i,
      ];
      for (const re of patterns) {
        const m = String(note).match(re);
        if (m && m[1]) return m[1].trim();
      }
      return null;
    };

    const derivePhone = (o) => {
      return (
        o.user?.phone ||
        o.ship_phone ||
        o.guest_whatsapp ||
        o.guest_phone ||
        parsePhoneFromNote(o.customer_note) ||
        null
      );
    };

    return (orders || []).map((o) => {
      const firstPayment = (o.payments || [])[0];
      const paymentMethodName = firstPayment?.payment_method?.name || firstPayment?.payment_method?.code || '-';
      const customerName = o.user?.fullname || o.ship_receiver_name || o.guest_nama || (o.channel === 'pos' ? 'POS Customer' : (o.channel === 'guest' ? 'Guest' : '-'));
      const customerEmail = o.user?.email || '-';
      const cashierName = o.cashier?.fullname || (o.channel === 'pos' ? 'Kasir' : null);
      const phone = derivePhone(o) || '-';
      return {
        ...o,
        _displayId: o.order_number || o.order_id,
        _customer: customerName,
        _email: customerEmail,
        _phone: phone,
        _address: [o.ship_address_detail, o.ship_district, o.ship_city, o.ship_province, o.ship_postal_code].filter(Boolean).join(', '),
        _statusId: statusEnToId[o.status] || o.status,
        _paymentMethod: paymentMethodName,
        _channel: o.channel,
        _cashier: cashierName,
      };
    });
  }, [orders]);

  // Fetch orders from API via Redux thunk
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const status = selectedStatus !== "all" ? (statusIdToEn[selectedStatus] || selectedStatus) : undefined;
      const res = await dispatch(fetchOrdersThunk({ status, page, pageSize }));
      if (res.meta.requestStatus === "fulfilled") {
        setCurrentTime(new Date());
        if ((res.payload?.items || []).length === 0) {
          console.debug('[Orders] API responded successfully but returned 0 items.');
        } else {
          console.debug('[Orders] Orders fetched count:', res.payload.items.length);
        }
      } else if (res.meta.requestStatus === 'rejected') {
        console.warn('[Orders] Fetch rejected:', res.payload || res.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStatus, page, pageSize]);

  const stats = useMemo(() => {
    const totals = orders.reduce(
      (acc, o) => {
        const idStatus = o._statusId || statusEnToId[o.status] || o.status;
        acc.total += 1;
        acc.sumTotal += Number(o.total || 0);
        if (idStatus === "MENUNGGU") acc.pending += 1;
        if (idStatus === "DIPROSES") acc.processing += 1;
        if (idStatus === "DIKIRIM") acc.shipped += 1;
        if (idStatus === "SELESAI") acc.completed += 1;
        if (idStatus === "DIBATALKAN") acc.cancelled += 1;
        return acc;
      },
      { total: 0, sumTotal: 0, pending: 0, processing: 0, shipped: 0, completed: 0, cancelled: 0 }
    );
    const average = totals.total > 0 ? totals.sumTotal / totals.total : 0;
    return {
      totalOrders: totals.total,
      pendingOrders: totals.pending,
      processingOrders: totals.processing,
      shippedOrders: totals.shipped,
      completedOrders: totals.completed,
      cancelledOrders: totals.cancelled,
      totalRevenue: totals.sumTotal,
      averageOrderValue: average,
    };
  }, [orders]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: id });
  };

  const isValidEstimatedDelivery = (estimatedDate, orderDate) => {
    if (!estimatedDate) return false;
    
    const estDate = new Date(estimatedDate);
    const createdDate = new Date(orderDate);
    const currentDate = new Date();
    
    // Check if date is in the past before 2020 (dummy dates)
    if (estDate.getFullYear() < 2020) return false;
    
    // Check if estimated delivery is before order creation
    if (estDate < createdDate) return false;
    
    // Check if date is too far in future (more than 1 year)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(currentDate.getFullYear() + 1);
    if (estDate > oneYearFromNow) return false;
    
    return true;
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
    
    const config = statusConfig[status] || { 
      bg: "bg-slate-100", 
      text: "text-slate-800", 
      dot: "bg-slate-500",
      border: "border-slate-200"
    };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs rounded-full font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${config.dot} animate-pulse`}></span>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    if (priority === "high") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
          Prioritas Tinggi
        </span>
      );
    }
    return null;
  };

  const getStatusActions = (status, orderId) => {
    const statusFlow = {
      MENUNGGU: { next: "DIPROSES", label: "Proses Pesanan", icon: <MdEdit className="w-4 h-4" />, color: "bg-blue-600 hover:bg-blue-700" },
      DIPROSES: { next: "DIKIRIM", label: "Kirim Pesanan", icon: <MdLocalShipping className="w-4 h-4" />, color: "bg-purple-600 hover:bg-purple-700" },
      DIKIRIM: { next: "SELESAI", label: "Selesaikan", icon: <MdCheckCircle className="w-4 h-4" />, color: "bg-green-600 hover:bg-green-700" },
      SELESAI: null,
      DIBATALKAN: null
    };

    const nextStatus = statusFlow[status];
    
    if (!nextStatus) return null;

    const isLoading = updatingStatusId === orderId;
    return (
      <button
        onClick={() => !isLoading && handleStatusUpdate(orderId, nextStatus.next)}
        disabled={isLoading}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${nextStatus.color}`}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          nextStatus.icon
        )}
        <span className="ml-1.5">{isLoading ? 'Memproses...' : nextStatus.label}</span>
      </button>
    );
  };

  const handleStatusUpdate = async (orderId, newStatusId) => {
    const status = statusIdToEn[newStatusId] || newStatusId;
    console.log('[handleStatusUpdate] Updating order:', {
      orderId,
      newStatusId,
      mappedStatus: status
    });
    
    try {
      setUpdatingStatusId(orderId);
      const res = await dispatch(updateOrderStatusThunk({ orderId, status }));
      
      console.log('[handleStatusUpdate] Response:', res);
      
      if (res.meta.requestStatus === 'fulfilled') {
        // Refetch single order to ensure full fresh associations (payments, items, etc.)
        const detailRes = await dispatch(fetchOrderThunk(orderId));
        // WhatsApp notification logic
        const order = detailRes?.payload || {};
        // Use derivePhone logic from above
        const phone = (
          order.user?.phone ||
          order.ship_phone ||
          order.guest_whatsapp ||
          order.guest_phone ||
          (order.customer_note && (() => {
            // Common patterns: WA: xxx, Whatsapp: xxx, Telp: xxx, Telepon: xxx, HP: xxx
            const patterns = [
              /WA\s*[:\-]\s*([+0-9\s-]+)/i,
              /Whatsapp\s*[:\-]\s*([+0-9\s-]+)/i,
              /Telp(?:on)?\s*[:\-]\s*([+0-9\s-]+)/i,
              /HP\s*[:\-]\s*([+0-9\s-]+)/i,
              /Phone\s*[:\-]\s*([+0-9\s-]+)/i,
            ];
            for (const re of patterns) {
              const m = String(order.customer_note).match(re);
              if (m && m[1]) return m[1].trim();
            }
            return null;
          })()) ||
          null
        );
        if (!phone) {
          alert('WhatsApp tidak terdaftar');
        }
      } else if (res.meta.requestStatus === 'rejected') {
        console.error('[handleStatusUpdate] Update rejected:', res.payload || res.error);
        const errorMsg = res.payload?.msg || res.payload?.message || res.error?.message || 'Gagal mengubah status order';
        alert(`Error: ${errorMsg}`);
      }
    } catch (error) {
      console.error('[handleStatusUpdate] Exception:', error);
      alert(`Terjadi kesalahan: ${error.message}`);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Single payment status button (cycle logic with limited statuses: unpaid -> paid -> refunded -> paid ...)
  const getPaymentStatusButton = (order) => {
    const current = order.payment_status || 'unpaid';
    const mapping = {
      unpaid: { next: 'paid', label: 'Tandai Lunas', color: 'bg-indigo-600 hover:bg-indigo-700', icon: <MdCheck className="w-3.5 h-3.5" /> },
      partial: { next: 'paid', label: 'Set Lunas', color: 'bg-indigo-600 hover:bg-indigo-700', icon: <MdCheck className="w-3.5 h-3.5" /> },
      paid: { next: 'refunded', label: 'Refund', color: 'bg-red-600 hover:bg-red-700', icon: <MdClear className="w-3.5 h-3.5" /> },
      refunded: { next: 'paid', label: 'Set Lunas', color: 'bg-indigo-600 hover:bg-indigo-700', icon: <MdCheck className="w-3.5 h-3.5" /> },
    };
    const cfg = mapping[current] || mapping.unpaid;
    const isUpdating = updatingPaymentId === order.order_id;
    return (
      <button
        onClick={() => !isUpdating && handlePaymentStatusUpdate(order.order_id, cfg.next)}
        disabled={isUpdating}
        className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${cfg.color}`}
        title={isUpdating ? 'Memperbarui...' : `Ubah status pembayaran menjadi ${cfg.next}`}
      >
        {isUpdating ? (
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {cfg.icon}
            <span className="ml-1">{cfg.label}</span>
          </>
        )}
      </button>
    );
  };

  const handlePaymentStatusUpdate = async (orderId, payment_status) => {
    if (!payment_status) return;
    try {
      setUpdatingPaymentId(orderId);
      const res = await dispatch(updatePaymentStatusThunk({ orderId, payment_status }));
      if (res.meta.requestStatus === 'fulfilled') {
        // Refetch complete order data for consistency
        await dispatch(fetchOrderThunk(orderId));
      } else if (res.meta.requestStatus === 'rejected') {
        alert('Gagal update status pembayaran');
      }
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleRefresh = async () => {
    await fetchOrders();
  };

  // Export filtered orders to CSV (client-side)
  const handleExportCsv = () => {
    try {
      const headers = [
        'Order ID',
        'Tanggal Order',
        'Status',
        'Total',
        'Pelanggan',
        'Email',
        'Telepon',
        'Alamat',
        'Metode Pembayaran',
        'Channel',
        'Kasir',
        'Jumlah Item',
        'Kurir',
        'Layanan',
        'No. Resi'
      ];

      const escapeCsv = (val) => {
        const s = String(val ?? '').replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      };

      const rows = filteredOrders.map((o) => {
        const itemCount = (o.OrderItems || o.order_items || []).reduce((sum, it) => sum + (it.quantity || 0), 0);
        return [
          o._displayId ?? o.order_id ?? '',
          o.created_at ? format(new Date(o.created_at), 'yyyy-MM-dd HH:mm', { locale: id }) : '',
          o._statusId || o.status || '',
          Number(o.total || 0),
          o._customer || '',
          o._email || '',
          o._phone || '',
          o._address || '',
          o._paymentMethod || '',
          o._channel || '',
          o._cashier || '',
          itemCount,
          o.courier_name || '',
          o.shipping_service || '',
          o.tracking_number || ''
        ].map(escapeCsv).join(',');
      });

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date();
      const tsStr = `${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}${String(ts.getDate()).padStart(2,'0')}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}${String(ts.getSeconds()).padStart(2,'0')}`;
      a.download = `orders-${tsStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengekspor CSV pesanan:', err);
      alert('Gagal mengekspor data pesanan');
    }
  };

  const openDetail = async (orderId) => {
    setDetailId(orderId);
    const res = await dispatch(fetchOrderThunk(orderId));
    if (res.meta.requestStatus === 'fulfilled') {
      setDetailOpen(true);
    }
  };

  const handleDownloadProof = async (order) => {
    if (!order?.order_id) return;
    console.log('[DownloadProof] order:', order);
    // Prefer payment proof from order detail if available
    let proofs = order.paymentProofs || order.payment_proofs || order.PaymentProof || [];
    if (!Array.isArray(proofs) || proofs.length === 0) {
      // Fetch order detail from backend if not present
      console.log('[DownloadProof] Proofs not found in order, fetching detail from backend...');
      const res = await dispatch(fetchOrderThunk(order.order_id));
      const detail = res?.payload;
      proofs = detail?.paymentProofs || detail?.payment_proofs || detail?.PaymentProof || [];
      if (!Array.isArray(proofs) || proofs.length === 0) {
        // Fetch proofs list directly and use returned payload to avoid stale state
        console.log('[DownloadProof] Dispatching fetchPaymentProofs for order_id', order.order_id);
        const listRes = await dispatch(fetchPaymentProofs({ order_id: order.order_id }));
        proofs = (listRes?.payload?.list) || [];
        console.log('[DownloadProof] Proofs from API list:', proofs);
      } else {
        console.log('[DownloadProof] Proofs from backend detail:', proofs);
      }
    } else {
      console.log('[DownloadProof] Using proofs from order detail:', proofs);
    }
    if (!proofs.length) {
      console.warn('[DownloadProof] No payment proofs found for order', order.order_id);
      alert('Bukti pembayaran belum ada / belum diupload.');
      return;
    }
    // Ambil proof pertama (atau yang approved lebih dulu)
    const preferred = proofs.find(p => p.status === 'approved') || proofs[0];
    console.log('[DownloadProof] Preferred proof:', preferred);
    if (!preferred.file_url) { 
      console.warn('[DownloadProof] Preferred proof has no file_url:', preferred);
      alert('URL bukti pembayaran tidak tersedia.'); 
      return; 
    }
    try {
      // Jika file_url adalah data URL langsung buka
      if (preferred.file_url.startsWith('data:')) {
        console.log('[DownloadProof] Downloading data URL');
        const a = document.createElement('a');
        a.href = preferred.file_url;
        a.download = `bukti-${order.order_number || order.order_id}.png`;
        a.click();
        return;
      }
      // Jika relative path, build absolute via env
      const url = buildImageUrl(preferred.file_url);
      console.log('[DownloadProof] Downloading from URL:', url);
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = `bukti-${order.order_number || order.order_id}`;
      a.click();
    } catch(e){
      console.error('[DownloadProof] error', e);
      alert('Gagal mengunduh bukti pembayaran');
    }
  };

  const printReceipt = (order) => {
    try {
      // Transform order data to receipt format like in POS
      
      // Check for different possible data structures from backend
      // Sequelize include returns PascalCase (OrderItems), API might return snake_case (order_items)
      const orderItems = order.OrderItems || order.order_items || [];
      
      if (orderItems.length === 0) {
        console.warn(`[PRINT DEBUG] Order ${order.order_number}: No order items for printing!`);
      }
      
      const receiptData = {
        id: order.order_number || order.order_id,
        date: order.created_at || new Date(),
        items: orderItems.map(item => ({
          name: item.name_snapshot || item.product_name || item.name || 'Produk',
          price: Math.round(parseFloat(item.price_unit || item.unit_price || item.price || 0)),
          quantity: item.quantity || 1
        })),
        subtotal: Math.round(parseFloat(order.subtotal || 0)),
        discount: 0, // Could be calculated if discount data exists
        discountAmount: Math.round(parseFloat(order.discount_amount || 0)),
        total: Math.round(parseFloat(order.total || 0)),
        paymentMethod: order.payment_method || 'cash',
        receivedAmount: Math.round(parseFloat(order.received_amount || order.total || 0)),
        change: Math.round(parseFloat(order.change_amount || 0)),
        profit: Math.round(parseFloat(order.profit_amount || 0)),
        cashier: 'Admin Orders',
        status: order.status || 'completed',
        referralCode: order.referral_code || null,
        customer: {
          name: order._customer || order.User?.fullname || order.ship_receiver_name || 'POS Customer',
          phone: order._phone || order.User?.phone || order.ship_phone || order.guest_whatsapp || '-',
          email: order._email || order.User?.email || '-'
        }
      };
      
      // Use Receipt component for printing
      const receipt = Receipt({ orderData: receiptData, type: 'order' });
      receipt.printReceipt();
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Gagal mencetak struk. Silakan coba lagi.');
    }
  };

  // Remove previewReceipt, print directly instead
  const printReceiptDirect = (order) => {
    try {
      // Check for different possible data structures from backend
      const orderItems = order.OrderItems || order.order_items || [];
      if (orderItems.length === 0) {
        console.warn(`[PRINT DEBUG] Order ${order.order_number}: No order items for printing!`);
      }
      const receiptData = {
        id: order.order_number || order.order_id,
        date: order.created_at || new Date(),
        items: orderItems.map(item => ({
          name: item.name_snapshot || item.product_name || item.name || 'Produk',
          price: Math.round(parseFloat(item.price_unit || item.unit_price || item.price || 0)),
          quantity: item.quantity || 1
        })),
        subtotal: Math.round(parseFloat(order.subtotal || 0)),
        discount: 0, // Could be calculated if discount data exists
        discountAmount: Math.round(parseFloat(order.discount_amount || 0)),
        total: Math.round(parseFloat(order.total || 0)),
        paymentMethod: order.payment_method || 'cash',
        receivedAmount: Math.round(parseFloat(order.received_amount || order.total || 0)),
        change: Math.round(parseFloat(order.change_amount || 0)),
        profit: Math.round(parseFloat(order.profit_amount || 0)),
        cashier: 'Admin Orders',
        status: order.status || 'completed',
        referralCode: order.referral_code || null,
        customer: {
          name: order._customer || order.User?.fullname || order.ship_receiver_name || 'POS Customer',
          phone: order._phone || order.User?.phone || order.ship_phone || order.guest_whatsapp || '-',
          email: order._email || order.User?.email || '-'
        }
      };
      // Use Receipt component for printing
      const receipt = Receipt({ orderData: receiptData, type: 'order' });
      receipt.printReceipt();
    } catch (error) {
      console.error('Error printing receipt:', error);
      alert('Gagal mencetak struk. Silakan coba lagi.');
    }
  };

  const getPaymentProofBadge = (summary) => {
    if (!summary || summary.count === 0) {
      return <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600 border border-slate-200">Tidak ada</span>;
    }
    const status = summary.latest_status;
    const statusMap = {
      approved: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'Disetujui' },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Menunggu' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'Ditolak' }
    };
    const cfg = statusMap[status] || { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200', label: status };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs rounded-full font-medium ${cfg.bg} ${cfg.text} ${cfg.border}`}>
        {cfg.label}
        {summary.count > 1 && <span className="ml-1 text-[10px] opacity-70">({summary.count})</span>}
      </span>
    );
  };

  const filteredOrders = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return ordersView.filter((order) => {
      const matchesSearch =
        (order._displayId || "").toLowerCase().includes(term) ||
        (order._customer || "").toLowerCase().includes(term) ||
        (order._phone || "").toLowerCase().includes(term);
      const idStatus = order._statusId || statusEnToId[order.status] || order.status;
      const matchesStatus = selectedStatus === "all" || idStatus === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [ordersView, searchTerm, selectedStatus]);

  const StatCard = ({ icon, title, value, subtitle, bgColor, iconColor, trend, extra }) => (
    <Card extra={`relative overflow-hidden group hover:shadow-xl hover:scale-105 transition-all duration-300 ${extra}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
            {React.cloneElement(icon, { className: `h-6 w-6 ${iconColor}` })}
          </div>
          {trend && (
            <div className="flex items-center text-green-600">
              <MdTrendingUp className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">+{trend}%</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${bgColor}`}></div>
    </Card>
  );

  // Customer Segmentation (New vs Returning) + Offline (POS)
  const segmentation = useMemo(() => {
    const onlineOrders = (orders || []).filter(o => o.channel !== 'pos' && o.user?.user_id);
    const userGroups = new Map();
    for (const o of onlineOrders) {
      const uid = o.user.user_id;
      userGroups.set(uid, (userGroups.get(uid) || 0) + 1);
    }
    let newCustomers = new Set();
    let returningCustomers = new Set();
    let newRevenue = 0; let returningRevenue = 0;
    for (const o of onlineOrders) {
      const uid = o.user.user_id;
      const count = userGroups.get(uid) || 0;
      if (count <= 1) {
        newCustomers.add(uid);
        newRevenue += Number(o.total || 0);
      } else {
        returningCustomers.add(uid);
        returningRevenue += Number(o.total || 0);
      }
    }
    const offlineOrders = (orders || []).filter(o => o.channel === 'pos');
    const offlineRevenue = offlineOrders.reduce((s, o) => s + Number(o.total || 0), 0);
    const totalRevenueAll = newRevenue + returningRevenue + offlineRevenue;
    const pct = (val) => totalRevenueAll > 0 ? ((val / totalRevenueAll) * 100).toFixed(1) : '0.0';
    return {
      newCount: newCustomers.size,
      returningCount: returningCustomers.size,
      offlineCount: offlineOrders.length,
      newRevenue,
      returningRevenue,
      offlineRevenue,
      totalRevenueAll,
      pctNew: pct(newRevenue),
      pctReturning: pct(returningRevenue),
      pctOffline: pct(offlineRevenue)
    };
  }, [orders]);

  // Presentational subcomponents to keep main JSX concise
  const PageHeader = () => (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
              <MdShoppingCart className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Kelola Pesanan</h1>
              <p className="text-slate-600 font-medium">Manajemen status pesanan dan pengiriman premium</p>
              <p className="text-sm text-slate-500 mt-1 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Terakhir diperbarui: {format(currentTime, "dd MMMM yyyy, HH:mm", { locale: id })}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center space-x-3">
              <button onClick={handleRefresh} disabled={isLoading} className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md">
                <MdRefresh className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Data
              </button>

              <button onClick={handleExportCsv} disabled={isLoading || filteredOrders.length === 0} className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                <MdFileDownload className="w-4 h-4 mr-2" /> Ekspor Laporan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const ErrorAlert = () => (
    <div className="mb-8 border border-red-200 bg-red-50 text-red-700 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start">
        <div className="mr-4 mt-0.5"><MdCancel className="w-6 h-6 text-red-500" /></div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-800 mb-1">Gagal memuat pesanan</h3>
          <p className="text-sm leading-relaxed">{error.msg || error.message || 'Terjadi kesalahan yang tidak diketahui.'}</p>
          {String(error.msg || error.message || '').toLowerCase().includes('login') && (
            <p className="text-sm mt-2">Silakan login kembali sebagai admin lalu tekan tombol <strong>Refresh Data</strong>.</p>
          )}
          <div className="mt-4 flex gap-3">
            <button onClick={fetchOrders} className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-colors"><MdRefresh className="w-4 h-4 mr-2" /> Coba Lagi</button>
          </div>
        </div>
      </div>
    </div>
  );

  const PendingAlert = () => (
    <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100"><MdNotifications className="w-6 h-6 text-amber-600" /></div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-amber-800 mb-1">Perhatian Admin!</h3>
          <p className="text-amber-700">Ada <span className="font-bold">{stats.pendingOrders} pesanan</span> yang menunggu diproses dan perlu ditindaklanjuti segera.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg">Proses Sekarang</button>
      </div>
    </div>
  );

  const OrdersStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard icon={<MdShoppingCart />} title="Total Pesanan" value={stats.totalOrders} subtitle="Semua status" bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200" iconColor="text-indigo-600" trend={12} />
      <StatCard icon={<MdAttachMoney />} title="Total Revenue" value={formatCurrency(stats.totalRevenue)} subtitle="Pendapatan kotor" bgColor="bg-gradient-to-br from-green-100 to-green-200" iconColor="text-green-600" trend={8} />
      <StatCard icon={<MdLocalShipping />} title="Sedang Dikirim" value={stats.shippedOrders} subtitle="Dalam perjalanan" bgColor="bg-gradient-to-br from-purple-100 to-purple-200" iconColor="text-purple-600" />
      <StatCard icon={<MdPeople />} title="Nilai Rata-rata" value={formatCurrency(stats.averageOrderValue)} subtitle="Per pesanan" bgColor="bg-gradient-to-br from-amber-100 to-amber-200" iconColor="text-amber-600" trend={5} />
    </div>
  );

  const SegmentationCard = () => (
    <Card extra="mb-10 overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-1 flex items-center"><MdPeople className="w-5 h-5 mr-2" /> Segmentasi Pelanggan</h2>
        <p className="text-sm text-slate-600">Distribusi pendapatan berdasarkan segmen pelanggan (Online & Offline)</p>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-green-800">Returning Customers</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">{segmentation.pctReturning}%</span>
          </div>
          <div className="text-2xl font-bold text-green-700 mb-1">{segmentation.returningCount} pelanggan</div>
          <div className="text-sm font-semibold text-green-800 mb-2">{formatCurrency(segmentation.returningRevenue)}</div>
          <p className="text-xs text-green-700">Pelanggan yang sudah pernah membeli sebelumnya</p>
        </div>

        <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-indigo-800">New Customers</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">{segmentation.pctNew}%</span>
          </div>
          <div className="text-2xl font-bold text-indigo-700 mb-1">{segmentation.newCount} pelanggan</div>
          <div className="text-sm font-semibold text-indigo-800 mb-2">{formatCurrency(segmentation.newRevenue)}</div>
          <p className="text-xs text-indigo-700">Pelanggan yang baru pertama kali membeli</p>
        </div>

        <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-amber-800">Offline (POS)</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">{segmentation.pctOffline}%</span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mb-1">{segmentation.offlineCount} transaksi</div>
          <div className="text-sm font-semibold text-amber-800 mb-2">{formatCurrency(segmentation.offlineRevenue)}</div>
          <p className="text-xs text-amber-700">Transaksi yang dilakukan melalui kasir / POS</p>
        </div>
      </div>
      <div className="px-6 pb-6 text-xs text-slate-500 flex flex-wrap gap-4">
        <span>Total Pendapatan Gabungan: <strong>{formatCurrency(segmentation.totalRevenueAll)}</strong></span>
        <span>| New: {segmentation.pctNew}% • Returning: {segmentation.pctReturning}% • Offline: {segmentation.pctOffline}%</span>
      </div>
    </Card>
  );

  const FiltersCard = () => (
    <Card extra="mb-8 overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1 min-w-0">
              <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input type="text" placeholder="Cari pesanan, pelanggan, email, atau nomor telepon..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200 hover:border-slate-400" />
            </div>

            <div className="relative">
              <MdFilterList className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="pl-12 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white shadow-sm transition-all duration-200 hover:border-slate-400 min-w-[200px]">
                {statusOptions.map((option) => (<option key={option.value} value={option.value}>{option.label} ({option.count})</option>))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-4"><span className="text-sm text-slate-600 font-medium">{filteredOrders.length} pesanan ditemukan</span></div>
        </div>
      </div>
    </Card>
  );

  const OrdersTable = () => (
    <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <ResponsiveTable>
        <table className="w-full">
          <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
            <tr>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Detail Pesanan</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Informasi Pelanggan</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Nilai & Pembayaran</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Status & Prioritas</th>
              <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Tanggal & Alamat</th>
              <th className="text-center py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">Tindakan</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {filteredOrders.map((order, index) => (
              <tr key={order.order_id} className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                <td className="py-5 px-6">
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-2 mb-2"><span className="font-bold text-slate-800 text-base">{order._displayId}</span>{getPriorityBadge(order.priority)}</div>
                    <div className="flex items-center text-sm text-slate-600 mb-1"><MdInventory className="w-4 h-4 mr-1" />
                      <span>{(() => { const items = order.OrderItems || order.order_items || []; if (!items.length) return '0 produk'; const totalQty = items.reduce((sum, it) => sum + (it.quantity || 0), 0); return `${totalQty} produk`; })()} | {order._channel?.toUpperCase()}</span>
                    </div>
                    <div className="text-xs text-slate-500">{(() => { const orderItems = order.OrderItems || order.order_items || []; const names = orderItems.map(item => item.name_snapshot || item.product_name || item.name || 'Produk').filter(Boolean); const joined = names.join(', '); if (joined.length <= 50) return joined || '-'; return joined.substring(0, 50) + '...'; })()}</div>
                    {order.customer_note && (<div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 line-clamp-2"><strong>Catatan:</strong> {order.customer_note.length > 60 ? order.customer_note.substring(0, 60) + '...' : order.customer_note}</div>)}
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex flex-col space-y-1"><span className="font-semibold text-slate-800">{order._customer}</span>
                    {order._email && order._email !== '-' && (<div className="flex items-center text-sm text-slate-600"><MdEmail className="w-4 h-4 mr-1" /><span>{order._email}</span></div>)}
                    {order._phone && order._phone !== '-' && (<div className="flex items-center text-sm text-slate-600"><MdPhone className="w-4 h-4 mr-1" /><span>{order._phone}</span></div>)}
                    {(!order._email || order._email === '-') && (!order._phone || order._phone === '-') && (<span className="text-xs text-slate-400 italic">Tidak ada kontak</span>)}
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-slate-800 mb-1">{formatCurrency(order.total)}</span>
                    {order._paymentMethod && (<span className="text-xs text-slate-500 mb-1">{order._paymentMethod}</span>)}
                    {order._cashier && (<span className="text-xs text-slate-500">Kasir: {order._cashier}</span>)}
                    {order.payment_proof_summary && (<div className="mt-1"><span className="text-[11px] text-slate-500 mr-1">Bukti bayar:</span>{getPaymentProofBadge(order.payment_proof_summary)}</div>)}
                    <span className="text-xs text-slate-500">{(order.OrderItems || order.order_items || []).reduce((sum, item) => sum + (item.quantity || 0), 0)} item total</span>
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex flex-col space-y-2">{getStatusBadge(order._statusId || statusEnToId[order.status] || order.status)}
                    {order.courier_name && (<div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-md border border-indigo-200"><MdLocalShipping className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0" /><div className="flex flex-col"><span className="text-xs font-semibold text-indigo-700">{order.courier_name}</span>{order.shipping_service && (<span className="text-[10px] text-indigo-600">{order.shipping_service}{order.shipping_etd && ` • ${order.shipping_etd} hari`}</span>)}</div></div>)}
                    {order.tracking_number && (<div className="text-xs text-slate-600"><strong>Tracking:</strong> {order.tracking_number}</div>)}
                    {order.estimated_delivery && (order._statusId || statusEnToId[order.status]) !== "SELESAI" && (order._statusId || statusEnToId[order.status]) !== "DIBATALKAN" && (<div className="text-xs text-slate-600"><strong>Est:</strong> {isValidEstimatedDelivery(order.estimated_delivery, order.created_at) ? formatDate(order.estimated_delivery) : <span className="text-slate-400 italic">Belum diatur</span>}</div>)}
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex flex-col space-y-1"><span className="text-sm font-medium text-slate-800">{formatDate(order.created_at)}</span>
                    <div className="flex items-start text-xs text-slate-600"><MdLocationOn className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" /><span className="line-clamp-2">{order._address}</span></div>
                    {order.completed_at && (<div className="text-xs text-green-600"><strong>Selesai:</strong> {formatDate(order.completed_at)}</div>)}
                    {order.cancelled_at && (<div className="text-xs text-red-600"><strong>Dibatalkan:</strong> {formatDate(order.cancelled_at)}{order.cancel_reason && (<div className="mt-1">Alasan: {order.cancel_reason}</div>)}</div>)}
                  </div>
                </td>
                <td className="py-5 px-6">
                  <div className="flex items-center justify-center space-x-2">
                    <button onClick={() => openDetail(order.order_id)} className="inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-all duration-200" title="Lihat Detail">{loadingDetail && detailId === order.order_id ? (<span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>) : (<MdVisibility className="w-4 h-4" />)}</button>
                    <button onClick={() => printReceiptDirect(order)} className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-all duration-200" title="Cetak Struk"><MdPrint className="w-4 h-4" /></button>
                    {getStatusActions(order._statusId || statusEnToId[order.status] || order.status, order.order_id)}
                    {(order.payment_proof_summary?.count > 0 || (order._channel !== 'pos' && (order.payment_method || order._paymentMethod || '').toLowerCase() !== 'cod')) && (<button onClick={() => handleDownloadProof(order)} className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-all duration-200" title="Download Bukti Pembayaran"><MdCloudDownload className="w-4 h-4" /></button>)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>
    </Card>
  );

  const EmptyStateCard = () => (
    <Card extra="p-12 text-center shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <div className="max-w-md mx-auto">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mx-auto mb-6"><MdSearch className="h-10 w-10 text-slate-400" /></div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">{searchTerm || selectedStatus !== "all" ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}</h3>
        <p className="text-slate-600 mb-6 leading-relaxed">{searchTerm || selectedStatus !== "all" ? "Coba ubah kata kunci pencarian atau filter status yang dipilih." : "Pesanan akan muncul di sini ketika pelanggan mulai berbelanja produk cakalang premium Anda."}</p>
        {(searchTerm || selectedStatus !== "all") && (<button onClick={() => { setSearchTerm(""); setSelectedStatus("all"); }} className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">Reset Filter</button>)}
      </div>
    </Card>
  );

  // Final composed return
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <PageHeader />
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {error && <ErrorAlert />}
        {stats.pendingOrders > 0 && <PendingAlert />}
        <OrdersStats />
        <SegmentationCard />
        <FiltersCard />
        {filteredOrders.length > 0 ? <OrdersTable /> : <EmptyStateCard />}
      </div>

      <OrderDetailModal key={selectedOrder?.order_id || detailId} open={detailOpen} onClose={() => { setDetailOpen(false); setDetailId(null); }} order={selectedOrder} onRefresh={async () => { await dispatch(fetchOrdersThunk({ page, pageSize })); if (selectedOrder?.order_id || detailId) { const orderId = selectedOrder?.order_id || detailId; await dispatch(fetchOrderThunk(orderId)); } }} />
    </div>
  );

}

export default Orders;
