import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from 'store/slices/orderSlice';
import Receipt from 'components/Receipt';
import { MdArrowBack, MdPrint, MdCheck, MdClear } from 'react-icons/md';

const OrderDetail = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { selected, loadingDetail, error } = useSelector(s => s.orders);
  const [printed, setPrinted] = useState(false);

  useEffect(() => {
    if (orderId) {
      dispatch(fetchOrder(orderId));
    }
  }, [orderId, dispatch]);

  const order = useMemo(() => {
    if (!selected) return null;
    return {
      id: selected.order_id || selected.id,
      orderNumber: selected.order_number,
      date: selected.created_at,
      total: parseInt(selected.total) || 0,
      subtotal: parseInt(selected.subtotal) || 0,
      shippingCost: parseInt(selected.shipping_cost) || 0,
      discount: parseInt(selected.discount_amount) || 0,
      status: selected.status,
      paymentStatus: selected.payment_status,
      paymentMethod: selected.payments && selected.payments[0]?.payment_method?.name || '-',
      paymentDate: selected.paid_at,
      items: (selected.order_items || []).map((it, i) => ({ id: it.order_item_id || i, name: it.name_snapshot || it.name || 'Produk', quantity: it.quantity, price: parseInt(it.price_unit) || 0 })),
      shipping: selected.ship_address_detail ? { address: selected.ship_address_detail, recipient: selected.ship_receiver_name, phone: selected.ship_phone, method: selected.shipping_method || '-', service: selected.shipping_service || '-' } : null,
      notes: selected.customer_note
    };
  }, [selected]);

  const formatCurrency = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';
  const formatDateTime = (d) => d ? new Date(d).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

  const printReceipt = () => {
    if (!order) return;
    const discountPercent = order.subtotal > 0 ? Math.round((order.discount / order.subtotal) * 100) : 0;
    const receiptData = {
      id: order.orderNumber || order.id,
      date: order.date,
      items: order.items.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
      subtotal: order.subtotal,
      discount: discountPercent,
      discountAmount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      shipping_cost: order.shippingCost,
      status: order.status?.toUpperCase(),
      customerInfo: order.shipping ? { name: order.shipping.recipient, phone: order.shipping.phone } : undefined,
    };
    try {
      const r = Receipt({ orderData: receiptData, type: 'order' });
      r.printReceipt();
      setPrinted(true);
    } catch (e) {
      console.error('Print receipt failed', e);
    }
  };

  if (loadingDetail && !order) {
    return <div className="w-full min-h-screen flex items-center justify-center"><div className="text-center"><div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" /><p className="text-slate-600 text-sm">Memuat pesanan...</p></div></div>;
  }
  if (error && !order) {
    return <div className="w-full min-h-screen flex items-center justify-center"><div className="text-center max-w-sm"><p className="font-semibold text-red-600 mb-2">Gagal memuat pesanan</p><p className="text-slate-600 text-sm mb-4">{error.msg || error.message}</p><button onClick={() => dispatch(fetchOrder(orderId))} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Coba Lagi</button></div></div>;
  }
  if (!order) {
    return <div className="w-full min-h-screen flex items-center justify-center"><div className="text-center max-w-sm"><p className="font-semibold text-slate-700 mb-2">Pesanan tidak ditemukan</p><p className="text-slate-600 text-sm mb-4">ID: {orderId}</p><button onClick={() => navigate('/user/orders')} className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm">Kembali</button></div></div>;
  }

  // Adopt exact POS receipt modal design (green success header, store info, grid, items, summary, thank you)
  const discountPercent = order.subtotal > 0 ? Math.round((order.discount / order.subtotal) * 100) : 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 flex items-start justify-center">
      <div className="w-full max-w-lg">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/user/orders')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <MdArrowBack className="w-4 h-4" />
            Kembali
          </button>
        </div>

        {/* Receipt Modal Style - Exact POS Design */}
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Receipt Header - Green Success Style from POS */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <MdCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Struk Pesanan</h3>
                  <p className="text-green-100">Detail pesanan Anda</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/user/orders')}
                className="text-white/80 hover:text-white"
              >
                <MdClear className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Receipt Content - Exact POS Structure */}
          <div className="p-6">
            {/* Store Info - Same as POS */}
            <div className="text-center mb-6 pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800 mb-1">LYVIA NUSA BOGA</h2>
              <p className="text-slate-600 text-sm">Spesialis Produk Cakalang Khas Manado</p>
              <p className="text-slate-500 text-xs">Jl. Raya Manado No. 123 | Telp: (0431) 123-4567</p>
            </div>

            {/* Transaction Info - POS Grid Style */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <span className="text-slate-600">No. Pesanan:</span>
                <p className="font-bold text-slate-800">{order.orderNumber || order.id}</p>
              </div>
              <div>
                <span className="text-slate-600">Tanggal:</span>
                <p className="font-bold text-slate-800">{formatDate(order.date)}</p>
              </div>
              <div>
                <span className="text-slate-600">Status:</span>
                <p className="font-bold text-green-600 capitalize">{order.status}</p>
              </div>
              <div>
                <span className="text-slate-600">Metode Pembayaran:</span>
                <p className="font-bold text-slate-800">{order.paymentMethod || '-'}</p>
              </div>
            </div>

            {/* Items - POS Style */}
            <div className="mb-6">
              <h4 className="font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">Detail Pembelian</h4>
              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <h5 className="font-medium text-slate-800 text-sm">{item.name}</h5>
                      <p className="text-xs text-slate-600">
                        {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary - POS Style */}
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal:</span>
                  <span className="font-medium text-slate-800">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Diskon {discountPercent > 0 && `(${discountPercent}%)`}:</span>
                    <span className="font-medium text-red-600">-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.shippingCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ongkos Kirim:</span>
                    <span className="font-medium text-slate-800">{formatCurrency(order.shippingCost)}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-800">Total:</span>
                    <span className="text-xl font-bold text-indigo-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Info (Order specific) */}
            {order.shipping && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <h5 className="font-bold text-slate-800 mb-2 text-sm">Informasi Pengiriman</h5>
                <div className="space-y-1 text-xs">
                  <p className="font-medium text-slate-800">{order.shipping.recipient}</p>
                  <p className="text-slate-600">{order.shipping.address}</p>
                  {order.shipping.phone && <p className="text-slate-600">Tel: {order.shipping.phone}</p>}
                  <p className="text-slate-600">{order.shipping.method} {order.shipping.service && `(${order.shipping.service})`}</p>
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <h5 className="font-bold text-slate-800 mb-2 text-sm">Catatan</h5>
                <p className="text-slate-600 text-xs italic">"{order.notes}"</p>
              </div>
            )}

            {/* Thank You Message - Exact POS Style */}
            <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
              <p className="text-slate-800 font-medium mb-1">Terima kasih atas pesanan Anda!</p>
              <p className="text-slate-600 text-sm">Nikmati kelezatan produk cakalang premium kami</p>
              <p className="text-indigo-600 font-bold text-sm mt-2">*** SELAMAT BERBELANJA ***</p>
            </div>

            {/* Action Buttons - POS Style */}
            <div className="flex space-x-3">
              <button
                onClick={printReceipt}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                <MdPrint className="mr-2 h-5 w-5" />
                Cetak Struk
              </button>
              <button
                onClick={() => navigate('/user/orders')}
                className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-all duration-200 flex items-center justify-center"
              >
                <MdCheck className="mr-2 h-4 w-4" />
                Selesai
              </button>
            </div>
            
            {printed && (
              <div className="mt-3 text-xs text-emerald-600 font-medium text-center">
                Struk berhasil dikirim ke printer / jendela cetak.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;