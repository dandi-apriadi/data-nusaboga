import React from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const Receipt = ({ orderData, type = "order" }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return format(new Date(date), "dd MMMM yyyy HH:mm", { locale: id });
  };

  const buildReceiptHtml = () => {
    if (!orderData) {
      console.error('[Receipt] ERROR: orderData is null or undefined');
      return '';
    }

    // Validasi data kritis sebelum render
    if (!orderData.items || orderData.items.length === 0) {
      console.error('[Receipt] ERROR: No items in orderData', orderData);
      alert('Error: Tidak ada item untuk dicetak');
      return '';
    }

    if (orderData.subtotal === undefined || orderData.subtotal === null) {
      console.warn('[Receipt] WARNING: subtotal is undefined/null, using calculated value');
    }

    if (orderData.total === undefined || orderData.total === null) {
      console.warn('[Receipt] WARNING: total is undefined/null, using calculated value');
    }

    // Log data untuk debugging
    console.log('[Receipt] Printing receipt with data:', {
      id: orderData.id,
      items_count: orderData.items?.length,
      subtotal: orderData.subtotal,
      discount: orderData.discount,
      total: orderData.total,
      type: type
    });

    const receiptStyles = `
      body { 
        font-family: 'Courier New', monospace; 
        width: 300px; 
        margin: 0 auto; 
        padding: 10px;
        line-height: 1.3;
        font-size: 13px;
      }
      .header { 
        text-align: center; 
        margin-bottom: 20px;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }
      .store-name {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      .store-tagline {
        font-size: 11px;
        margin-bottom: 3px;
      }
      .store-contact {
        font-size: 10px;
        color: #555;
      }
      .separator { 
        border-bottom: 1px dashed #000; 
        margin: 8px 0; 
      }
      .double-separator {
        border-bottom: 2px solid #000;
        margin: 10px 0;
      }
      .row { 
        display: flex; 
        justify-content: space-between; 
        margin: 3px 0;
        align-items: flex-start;
      }
      .row-left {
        flex: 1;
        text-align: left;
      }
      .row-right {
        text-align: right;
        min-width: 80px;
      }
      .bold { font-weight: bold; }
      .center { text-align: center; }
      .small { font-size: 10px; }
      .smaller { font-size: 9px; }
      .item-name {
        font-weight: bold;
        margin-bottom: 2px;
      }
      .item-details {
        font-size: 11px;
        color: #555;
        margin-bottom: 3px;
      }
      .status { 
        background: #fef3c7; 
        padding: 8px; 
        border-radius: 5px; 
        text-align: center; 
        margin: 10px 0;
        border: 1px solid #f59e0b;
        font-weight: bold;
      }
      .status.pending {
        background: #fef3c7;
        border-color: #f59e0b;
        color: #92400e;
      }
      .status.processing {
        background: #dbeafe;
        border-color: #3b82f6;
        color: #1d4ed8;
      }
      .status.completed {
        background: #d1fae5;
        border-color: #10b981;
        color: #065f46;
      }
      .payment-info {
        background: #f1f5f9;
        padding: 8px;
        border-radius: 5px;
        margin: 10px 0;
        border: 1px solid #cbd5e1;
      }
      .total-section {
        background: #f8fafc;
        padding: 8px;
        border: 2px solid #000;
        margin: 10px 0;
      }
      .footer-message {
        text-align: center;
        margin: 15px 0;
        font-size: 11px;
        line-height: 1.4;
      }
      .qr-section {
        text-align: center;
        margin: 10px 0;
        padding: 10px;
        border: 1px dashed #666;
      }
      @media print {
        body { margin: 0; }
        .no-print { display: none; }
      }
    `;

    const getStatusInfo = (status) => {
      if (!status) return { text: 'STATUS', class: 'pending', desc: '' };
      const normalized = status.toUpperCase();
      const statusMap = {
        'MENUNGGU': { text: 'MENUNGGU PEMBAYARAN', class: 'pending', desc: 'Silakan lakukan pembayaran' },
        'MENUNGGU_PEMBAYARAN': { text: 'MENUNGGU PEMBAYARAN', class: 'pending', desc: 'Silakan lakukan pembayaran' },
        'DIPROSES': { text: 'SEDANG DIPROSES', class: 'processing', desc: 'Pesanan sedang disiapkan' },
        'PROCESSING': { text: 'SEDANG DIPROSES', class: 'processing', desc: 'Pesanan sedang disiapkan' },
        'DIKIRIM': { text: 'DALAM PENGIRIMAN', class: 'processing', desc: 'Pesanan dalam perjalanan' },
        'SHIPPED': { text: 'DALAM PENGIRIMAN', class: 'processing', desc: 'Pesanan dalam perjalanan' },
        'SELESAI': { text: 'PESANAN SELESAI', class: 'completed', desc: 'Terima kasih atas pesanan Anda' },
        'COMPLETED': { text: 'PESANAN SELESAI', class: 'completed', desc: 'Terima kasih atas pesanan Anda' },
        'DIBATALKAN': { text: 'DIBATALKAN', class: 'pending', desc: 'Pesanan telah dibatalkan' },
        'CANCELLED': { text: 'DIBATALKAN', class: 'pending', desc: 'Pesanan telah dibatalkan' }
      };
      return statusMap[normalized] || { text: normalized, class: 'pending', desc: '' };
    };

    const statusInfo = getStatusInfo(orderData.status);

    // Ensure numeric values are valid (fallback to 0 if undefined/null)
    const safeSubtotal = orderData.subtotal || 0;
    const safeTotal = orderData.total || 0;
    const safeDiscountAmount = orderData.discountAmount || (orderData.discount > 0 ? safeSubtotal * orderData.discount / 100 : 0);
    const safeReceivedAmount = orderData.receivedAmount || safeTotal;
    const safeChange = orderData.change || 0;
    const safeProfit = orderData.profit || 0;

    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Struk ${type === 'pos' ? 'POS' : 'Pesanan'} - ${orderData.id}</title>
        <style>${receiptStyles}</style>
      </head>
      <body>
        <div class="header">
          <div class="store-name">LYVIA NUSA BOGA</div>
          <div class="store-tagline">Spesialis Produk Cakalang Khas Manado</div>
          <div class="store-contact">Jl. Raya Manado No. 123</div>
          <div class="store-contact">Telp: (0431) 123-4567</div>
          <div class="store-contact">WA: 62 811-488-068</div>
          <div class="store-contact smaller">www.lyvianusaboga.com</div>
        </div>
        
        <div class="row">
          <div class="row-left">No. ${type === 'pos' ? 'Transaksi' : 'Pesanan'}:</div>
          <div class="row-right bold">${orderData.id}</div>
        </div>
        <div class="row">
          <div class="row-left">Tanggal:</div>
          <div class="row-right">${formatDate(orderData.date)}</div>
        </div>
        ${orderData.customerInfo ? `
        <div class="row">
          <div class="row-left">Pelanggan:</div>
          <div class="row-right">${orderData.customerInfo.name}</div>
        </div>
        <div class="row">
          <div class="row-left">Telepon:</div>
          <div class="row-right">${orderData.customerInfo.phone}</div>
        </div>
        ` : ''}
        ${orderData.cashier ? `
        <div class="row">
          <div class="row-left">Kasir:</div>
          <div class="row-right">${orderData.cashier}</div>
        </div>
        ` : ''}
        
        ${orderData.status ? `
        <div class="status ${statusInfo.class}">
          ${statusInfo.text}
          ${statusInfo.desc ? `<div class="smaller">${statusInfo.desc}</div>` : ''}
        </div>
        ` : ''}
        
        <div class="separator"></div>
        
        <!-- Items Section -->
        ${orderData.items.map(item => `
          <div class="item-name">${item.name}</div>
          <div class="row">
            <div class="row-left item-details">${item.quantity} x ${formatCurrency(item.price)}</div>
            <div class="row-right bold">${formatCurrency(item.price * item.quantity)}</div>
          </div>
          <div class="separator"></div>
        `).join('')}
        
        <!-- Totals Section -->
        <div class="total-section">
          <div class="row">
            <div class="row-left">Subtotal:</div>
            <div class="row-right bold">${formatCurrency(safeSubtotal)}</div>
          </div>
          ${orderData.discount > 0 ? `
          <div class="row">
            <div class="row-left">Diskon (${orderData.discount}%):</div>
            <div class="row-right bold">-${formatCurrency(safeDiscountAmount)}</div>
          </div>
          ` : ''}
          ${orderData.shipping_cost ? `
          <div class="row">
            <div class="row-left">Ongkir:</div>
            <div class="row-right bold">${formatCurrency(orderData.shipping_cost)}</div>
          </div>
          ` : ''}
          <div class="double-separator"></div>
          <div class="row">
            <div class="row-left bold">TOTAL:</div>
            <div class="row-right bold" style="font-size: 16px;">${formatCurrency(safeTotal)}</div>
          </div>
        </div>
        
        <!-- Payment Info -->
        ${type !== 'pos' && orderData.status === 'MENUNGGU_PEMBAYARAN' ? `
        <div class="payment-info">
          <div class="center bold">INSTRUKSI PEMBAYARAN</div>
          <div class="separator"></div>
          <div class="row">
            <div class="row-left">Bank:</div>
            <div class="row-right bold">${orderData.bankDetails?.bankName || 'Bank BCA'}</div>
          </div>
          <div class="row">
            <div class="row-left">No. Rekening:</div>
            <div class="row-right bold">${orderData.bankDetails?.accountNumber || '1234567890'}</div>
          </div>
          <div class="row">
            <div class="row-left">Atas Nama:</div>
            <div class="row-right bold">${orderData.bankDetails?.accountName || 'CV. Lyvia Nusa Boga'}</div>
          </div>
          <div class="separator"></div>
          <div class="center">
            <div class="bold">Jumlah Transfer: ${formatCurrency(orderData.total)}</div>
            <div class="small">Transfer sesuai nominal di atas</div>
          </div>
        </div>
        ` : ''}
        
        <!-- POS Payment Info -->
        ${type === 'pos' && orderData.paymentMethod ? `
        <div class="separator"></div>
        <div class="row">
          <div class="row-left">Pembayaran:</div>
          <div class="row-right bold">${
            orderData.paymentMethod === 'cash' ? 'Tunai' : 
            orderData.paymentMethod === 'card' ? 'Kartu' : 'QR Code'
          }</div>
        </div>
        ${orderData.paymentMethod === 'cash' ? `
        <div class="row">
          <div class="row-left">Diterima:</div>
          <div class="row-right">${formatCurrency(safeReceivedAmount)}</div>
        </div>
        <div class="row">
          <div class="row-left">Kembalian:</div>
          <div class="row-right bold">${formatCurrency(safeChange)}</div>
        </div>
        ` : ''}
        ` : ''}
        
        <!-- Profit Info (Internal) -->
        ${orderData.profit && type === 'pos' ? `
        <div class="separator"></div>
        <div class="row small">
          <div class="row-left">Profit:</div>
          <div class="row-right bold">${formatCurrency(safeProfit)}</div>
        </div>
        ` : ''}
        
        <div class="separator"></div>
        
        <!-- Footer Messages -->
        <div class="footer-message">
          <div class="bold">Terima kasih atas ${type === 'pos' ? 'kunjungan' : 'pesanan'} Anda!</div>
          <div class="small">Nikmati kelezatan produk cakalang premium kami</div>
          ${type !== 'pos' ? `
          <div class="smaller" style="margin-top: 8px;">
            Setelah transfer, upload bukti pembayaran melalui:<br>
            • Website: www.lyvianusaboga.com<br>
            • WhatsApp: 62 811-488-068
          </div>
          ` : ''}
        </div>
        
        <!-- QR Code Section removed as requested -->
        
        <div class="center bold">*** LYVIA NUSA BOGA ***</div>
        
        <div class="separator"></div>
        <div class="center smaller">
          Dicetak: ${formatDate(new Date())}
        </div>
        
        <!-- Print Instructions -->
        <div class="no-print" style="margin-top: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #4f46e5; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Cetak Struk
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Tutup
          </button>
        </div>
      </body>
      </html>
    `;
    return receiptContent;
  };

  const printReceipt = () => {
    const receiptContent = buildReceiptHtml();
    if (!receiptContent) return;

    // Open new window for printing
    const printWindow = window.open('', '', 'width=400,height=700,scrollbars=yes');
    printWindow.document.write(receiptContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Auto print after a short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const downloadReceipt = (filename) => {
    const content = buildReceiptHtml();
    if (!content) return;
    try {
      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `struk-${orderData.id}.html`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (e) {
      console.error('[Receipt] Failed to download receipt:', e);
      alert('Gagal mengunduh struk');
    }
  };

  return {
    printReceipt,
    downloadReceipt,
    formatCurrency,
    formatDate
  };
};

export default Receipt;