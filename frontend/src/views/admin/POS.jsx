import React, { useEffect, useMemo, useState } from "react";
import Card from "components/card";
import Receipt from "components/Receipt";
import { 
  MdPointOfSale, 
  MdAdd, 
  MdRemove, 
  MdShoppingCart, 
  MdPrint, 
  MdClear,
  MdSearch,
  MdFilterList,
  MdPayment,
  MdReceipt,
  MdInventory,
  MdAttachMoney,
  MdShoppingBag,
  MdCategory,
  MdDelete,
  MdEdit,
  MdCheck,
  MdAccountBalanceWallet,
  MdCreditCard,
  MdQrCode,
  MdCalculator,
  MdDiscount,
  MdLocalOffer
} from "react-icons/md";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchProducts } from "../../store/slices/productSlice";
import { validateReferral, clearReferral } from "../../store/slices/referralSlice";
import { posCheckout, clearLastOrder } from "../../store/slices/posSlice";
import api from "../../api/axios";
import { guestCheckoutApi } from "../../api/orders";
import { buildProductImageUrl, fallbackAvatar } from "../../utils/image";

const POS = () => {
  const dispatch = useDispatch();
  const { categories, items: productItems, loading: prodLoading } = useSelector(s => s.products);
  const { info: referralInfo, error: referralError, loading: referralLoading } = useSelector(s => s.referral);
  const { lastOrder, loading: posLoading, error: posError } = useSelector(s => s.pos);

  // Guest checkout data
  const [guestCheckoutData, setGuestCheckoutData] = useState(null);

  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all"); // all, available, out_of_stock
  const [sortBy, setSortBy] = useState("name"); // name, price_asc, price_desc, stock_desc
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [receivedAmount, setReceivedAmount] = useState("");
  // Manual discount removed: server-side discount will be applied (referral/membership)
  const [referralCode, setReferralCode] = useState("");
  const [referralMsg, setReferralMsg] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  // Load guest checkout data dari localStorage
  useEffect(() => {
    const storedGuestData = localStorage.getItem('guestCheckoutData');
    if (storedGuestData) {
      try {
        const parsedData = JSON.parse(storedGuestData);
        setGuestCheckoutData(parsedData);
      } catch (e) {
        console.warn('[POS] Failed to parse guest checkout data:', e);
      }
    }
  }, []);

  // Load categories and products
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch products whenever category changes (server-side filtering)
  useEffect(() => {
    const category_id = selectedCategory === 'all' ? undefined : selectedCategory;
    dispatch(fetchProducts({ q: searchTerm || undefined, category_id, page: 1, pageSize: 200 }));
  }, [dispatch, selectedCategory, searchTerm]);

  // Map backend categories to local UI chips (first entry is 'all')
  const categoryChips = useMemo(() => {
    const base = [{ id: 'all', name: 'Semua' }];
    return base.concat((categories || []).map(c => ({ id: c.category_id, name: c.name })));
  }, [categories]);

  // Normalize products from API to UI shape
  const products = useMemo(() => {
    const mapped = (productItems || []).map(p => {
      const rawImg = p.image_url || p.ProductImages?.find?.(im => im.is_primary)?.url || p.ProductImages?.[0]?.url;
      return ({
        id: p.product_id,
        name: p.name,
        price: Math.round(parseFloat(p.price || 0)),
        stock: p.stock || 0,
        category: p.category_id || 'uncat',
        image: buildProductImageUrl(rawImg, p.name),
        description: p.description || '',
        barcode: p.barcode || p.sku || p.product_id,
        profit: Math.max(0, Math.round((parseFloat(p.price || 0) - parseFloat(p.cost_price || 0))))
      });
    });
    if ((productItems || []).length === 0) {
      // Temporary debug to help identify why no products (remove in production)
      console.warn('[POS] No products returned. Check: API base URL env, backend /catalog/products data, active filter, category filter.');
    }
    return mapped;
  }, [productItems]);

  // Filtered products now only applies search on already server-filtered list (fallback guard)
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Apply local search filter
    const term = (searchTerm || '').trim().toLowerCase();
    if (term) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.barcode || '').toLowerCase().includes(term)
      );
    }
    
    // Apply stock filter
    if (stockFilter === 'available') {
      result = result.filter(p => p.stock > 0);
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter(p => p.stock <= 0);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'stock_desc':
          return b.stock - a.stock;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return result;
  }, [products, searchTerm, stockFilter, sortBy]);

  const paymentMethods = [
    { id: "cash", name: "Tunai", icon: <MdAccountBalanceWallet />, color: "bg-green-100 text-green-600" },
    { id: "card", name: "Kartu", icon: <MdCreditCard />, color: "bg-blue-100 text-blue-600" },
    { id: "qr", name: "QR Code", icon: <MdQrCode />, color: "bg-purple-100 text-purple-600" }
  ];

  // Enhanced Helper Functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) return '-';
      return format(d, "dd MMM yyyy HH:mm", { locale: id });
    } catch (e) {
      return '-';
    }
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      if (typeof product.stock === 'number' && product.stock > 0 && existingItem.quantity < product.stock) {
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      } else {
        // Cap reached; do nothing (avoid repetitive alert spam)
        window?.navigator?.vibrate?.(50);
      }
    } else {
      if (product.stock > 0) {
        setCart([...cart, { ...product, quantity: 1 }]);
      }
    }
  };
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      const product = products.find(p => p.id === productId);
      if (!product) return; // product missing from list
      const max = typeof product.stock === 'number' ? product.stock : newQuantity; // if undefined, allow
      if (newQuantity <= max) {
        setCart(cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
      } else {
        window?.navigator?.vibrate?.(30);
      }
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartTotal = () => {
    // No client-side discount: total equals subtotal
    return getSubtotal();
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalProfit = () => {
    return cart.reduce((total, item) => total + (item.profit * item.quantity), 0);
  };

  const getChangeAmount = () => {
    const received = parseFloat(receivedAmount) || 0;
    return received - getCartTotal();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong");
      return;
    }
    if (!validateCartStock()) return; // Adjustments made; user must re-confirm
    setShowPaymentModal(true);
  };

  const applyReferral = async () => {
    if (!referralCode) { setReferralMsg("Masukkan kode referal"); return; }
    const action = await dispatch(validateReferral(referralCode));
    if (validateReferral.fulfilled.match(action)) {
      const data = action.payload;
      // Do not set client-side discount. Inform user that discount will be applied at checkout.
      if (data.type === 'percent') {
        setReferralMsg(`✅ Kode valid. Diskon ${data.value}% akan diterapkan saat checkout.`);
      } else {
        setReferralMsg(`✅ Kode valid. Diskon ${new Intl.NumberFormat('id-ID').format(data.value)} akan diterapkan saat checkout.`);
      }
    } else {
      setReferralMsg(action.payload?.msg || 'Kode referal tidak valid');
    }
  };

  const processPayment = async () => {
    if (!validateCartStock()) return; // ensure still valid
    if (paymentMethod === "cash") {
      const received = parseFloat(receivedAmount) || 0;
      if (received < getCartTotal()) {
        alert("Jumlah uang yang diterima kurang!");
        return;
      }
    }
    // Map cart to backend payload
    const payload = {
      items: cart.map(it => ({
        product_id: it.id,
        quantity: it.quantity,
        price_unit: it.price,
        name_snapshot: it.name,
        discount_amount: 0,
      })),
      subtotal: getSubtotal(),
      discount_amount: 0,
      shipping_cost: 0,
      payment_fee: 0,
      total: getCartTotal(),
      received_amount: paymentMethod === 'cash' ? parseFloat(receivedAmount) : getCartTotal(),
      change_amount: paymentMethod === 'cash' ? getChangeAmount() : 0,
      customer_note: 'POS checkout',
      referral_code: referralCode ? referralCode.trim().toUpperCase() : undefined,
    };

    // If payment methods expect IDs, fetch mapping by code
    let paymentMethodId = null;
    try {
      const { data: methods } = await api.get('/payments/methods');
      const map = {
        cash: ['CASH', 'TUNAI'],
        card: ['CARD', 'KARTU'],
        qr: ['QR', 'QRCODE', 'QRIS']
      };
      const wanted = map[paymentMethod];
      const found = (methods || []).find(m => wanted.includes(m.code?.toUpperCase()) || wanted.includes(m.name?.toUpperCase()));
      paymentMethodId = found?.payment_method_id || null;
    } catch (e) {
      // fallback: let backend accept null/unknown
    }
  if (paymentMethodId) payload.payment_method_id = paymentMethodId;

    try {
      let order;
      let isGuestCheckout = false;

      // Jika ada guest data, gunakan endpoint guest checkout
      if (guestCheckoutData) {
        console.log('[POS] Processing guest checkout:', guestCheckoutData);
        isGuestCheckout = true;
        
        // Tambahkan guest info ke payload
        const guestPayload = {
          ...payload,
          guest_nama: guestCheckoutData.nama,
          guest_alamat: guestCheckoutData.alamat,
          guest_whatsapp: guestCheckoutData.whatsapp,
        };

        // Panggil endpoint guest checkout
        try {
          const response = await guestCheckoutApi(guestPayload);
          order = response || {};
          console.log('[POS] Guest checkout response:', order);
        } catch (e) {
          console.error('[POS] Guest checkout error:', e);
          alert(`Gagal memproses guest checkout: ${e.response?.data?.msg || e.message}`);
          return;
        }
      } else {
        // Gunakan endpoint POS admin checkout untuk user yang login
        const action = await dispatch(posCheckout(payload));
        if (!posCheckout.fulfilled.match(action)) {
          alert(action.payload?.msg || 'Gagal memproses POS checkout');
          return;
        }
        order = action.payload || {};
        console.log('[POS] Admin POS checkout response:', order);
      }
      
      // Debug logging
      console.log('[POS] Backend order response:', order);
      console.log('[POS] Local cart data:', cart);
      
      const createdAt = order.created_at || order.completed_at || order.paid_at || new Date().toISOString();
      
      // Gunakan cart lokal sebagai source of truth untuk values yang reliable
      // dan backend order hanya untuk metadata (id, timestamps, referral code)
      const tx = {
        id: order.order_number || `POS-${Date.now()}`,
        date: createdAt,
        items: cart, // ← Selalu gunakan cart lokal yang pasti valid
        subtotal: getSubtotal(), // ← Calculate dari cart lokal
        discount: 0,
        discountAmount: 0, // frontend no longer calculates discount
        total: getCartTotal(), // ← Calculate dari cart lokal
        paymentMethod: paymentMethod,
        receivedAmount: paymentMethod === 'cash' ? (parseFloat(receivedAmount) || 0) : getCartTotal(),
        change: paymentMethod === 'cash' ? getChangeAmount() : 0, // ← Calculate dari cart lokal
        // profit calculation removed from transaction payload (internal only)
        cashier: guestCheckoutData ? guestCheckoutData.nama : 'Admin POS',
        status: 'SELESAI',
        referralCode: order.referral_code || (referralCode ? referralCode.trim().toUpperCase() : null),
        // Guest info tambahan
        guestInfo: guestCheckoutData ? {
          nama: guestCheckoutData.nama,
          alamat: guestCheckoutData.alamat,
          whatsapp: guestCheckoutData.whatsapp
        } : null,
        isGuestCheckout: isGuestCheckout
      };
      
      // Validasi data kritis sebelum render receipt
      console.log('[POS] Transaction object for receipt:', tx);
      if (tx.items.length === 0) {
        console.error('[POS] ERROR: Transaction items adalah kosong!');
        alert('Error: Tidak ada item dalam transaksi');
        return;
      }
      if (tx.subtotal === 0) {
        console.warn('[POS] WARNING: Subtotal adalah 0');
      }
      
      setLastTransaction(tx);
      clearCart();
      setShowPaymentModal(false);
      setReceivedAmount("");
      setShowReceiptModal(true);
      
      // Jika guest checkout, bersihkan guest data dari localStorage
      if (isGuestCheckout) {
        localStorage.removeItem('guestCheckoutData');
        setGuestCheckoutData(null);
      }
      
      // Refresh product list to reflect new stock immediately
      dispatch(fetchProducts({ q: undefined, category_id: undefined, page: 1, pageSize: 200 }));
    } catch (e) {
      console.error('[POS] Payment error:', e);
      alert(`Error: ${e.message}`);
    }
  };

  const handlePrint = () => {
    if (cart.length === 0 && !lastTransaction) {
      alert("Tidak ada item untuk dicetak");
      return;
    }
    
    // Print current cart or last transaction
    const dataToPrint = lastTransaction || {
      id: `DRAFT${Date.now()}`,
      date: new Date(),
      items: [...cart],
      subtotal: getSubtotal(),
      discount: 0,
      discountAmount: 0,
      total: getCartTotal(),
      cashier: "Admin POS"
    };
    
    printReceipt(dataToPrint);
  };

  const printReceipt = (transaction) => {
    // Use Receipt component for printing POS receipts
    const receiptData = {
      ...transaction,
      status: 'SELESAI' // POS transactions are always completed
    };
    
    const receipt = Receipt({ orderData: receiptData, type: 'pos' });
    receipt.printReceipt();
  };

  // filteredProducts sudah didefinisikan di atas melalui useMemo (search-based)

  // Helper: Determine if item in cart reached stock limit
  const isAtStockLimit = (productId) => {
    const product = products.find(p => p.id === productId);
    const item = cart.find(c => c.id === productId);
    if (!product || !item) return false;
    if (typeof product.stock !== 'number') return false; // unknown stock -> treat as unlimited
    return item.quantity >= product.stock;
  };

  // Validate cart stock vs latest products list; adjust if needed
  const validateCartStock = () => {
    let adjusted = false;
    const nextCart = cart.map(ci => {
      const product = products.find(p => p.id === ci.id);
      if (!product) return ci; // product not found, leave as-is (could also remove)
      if (typeof product.stock === 'number') {
        if (product.stock <= 0) {
          adjusted = true;
          return { ...ci, quantity: 0 }; // mark for removal
        }
        if (ci.quantity > product.stock) {
          adjusted = true;
          return { ...ci, quantity: product.stock };
        }
      }
      return ci;
    }).filter(ci => ci.quantity > 0);
    if (adjusted) {
      setCart(nextCart);
      alert('Beberapa kuantitas produk telah disesuaikan dengan stok terbaru. Silakan periksa kembali sebelum melanjutkan.');
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Full-width Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <MdPointOfSale className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Point of Sale</h1>
                  <p className="text-indigo-100 text-lg">Sistem penjualan offline & cetak struk</p>
                  {guestCheckoutData && (
                    <div className="mt-2 text-sm text-indigo-200">
                      👤 {guestCheckoutData.nama} • 📱 {guestCheckoutData.whatsapp}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 lg:mt-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                {/* BETA badge removed */}
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3">
                  <MdShoppingCart className="h-5 w-5 text-white/80" />
                  <span className="text-white/90 text-sm font-medium">
                    {getCartItemCount()} item • {formatCurrency(getCartTotal())}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Products Section - Takes 3 columns */}
          <div className="xl:col-span-3 space-y-6">
            {/* Modern Filter Section */}
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                  
                  {/* Search Bar */}
                  <div className="relative flex-1 min-w-0">
                    <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari produk berdasarkan nama atau barcode..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200 hover:border-slate-400 text-sm"
                    />
                  </div>

                  {/* Filter Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    
                    {/* Category Dropdown */}
                    <div className="relative">
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-slate-400 min-w-[140px]"
                      >
                        <option value="all">Semua Kategori</option>
                        {(categories || []).map(cat => (
                          <option key={cat.category_id} value={cat.category_id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <MdCategory className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Stock Filter */}
                    <div className="relative">
                      <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value)}
                        className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-slate-400 min-w-[120px]"
                      >
                        <option value="all">Semua Stok</option>
                        <option value="available">Tersedia</option>
                        <option value="out_of_stock">Habis</option>
                      </select>
                      <MdInventory className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sort Dropdown (includes harga terendah -> tertinggi) */}
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none bg-white border border-slate-300 rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-slate-400 min-w-[110px]"
                      >
                        <option value="name">Nama A-Z</option>
                        <option value="price_asc">Harga: Terendah</option>
                        <option value="price_desc">Harga: Tertinggi</option>
                        <option value="stock_desc">Stok: Terbanyak</option>
                      </select>
                      <MdFilterList className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Clear Filters */}
                    {(selectedCategory !== 'all' || stockFilter !== 'all' || searchTerm || sortBy !== 'name') && (
                      <button
                        onClick={() => {
                          setSelectedCategory('all');
                          setStockFilter('all');
                          setSearchTerm('');
                          setSortBy('name');
                        }}
                        className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap"
                      >
                        <MdClear className="h-4 w-4" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Summary */}
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MdInventory className="h-4 w-4" />
                    <span className="font-medium">
                      {prodLoading ? 'Memuat...' : `${filteredProducts.length} produk`}
                    </span>
                  </div>
                  
                  {/* Active Filters */}
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                      <MdCategory className="h-3 w-3" />
                      {categories?.find(c => c.category_id === selectedCategory)?.name || 'Kategori'}
                    </span>
                  )}
                  
                  {stockFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium">
                      <MdInventory className="h-3 w-3" />
                      {stockFilter === 'available' ? 'Tersedia' : 'Habis'}
                    </span>
                  )}
                  
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                      <MdSearch className="h-3 w-3" />
                      "{searchTerm}"
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* Products Grid */}
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => {
                    const out = product.stock <= 0;
                    return (
                      <div
                        key={product.id}
                        onClick={() => { if (!out) addToCart(product); }}
                        className={`group relative bg-white border border-slate-200 rounded-xl p-4 transition-all duration-200 ${out ? 'opacity-55 cursor-not-allowed' : 'cursor-pointer hover:border-indigo-300 hover:shadow-lg hover:scale-105'}`}
                      >
                        <div className="aspect-square bg-slate-100 rounded-lg mb-3 overflow-hidden relative">
                          {out && (
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center z-10">
                              <span className="text-white text-xs font-semibold px-2 py-1 bg-red-600 rounded">HABIS</span>
                            </div>
                          )}
                          <img
                            src={product.image}
                            alt={product.name}
                            crossOrigin="anonymous"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => { e.target.src = fallbackAvatar(product.name); }}
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-lg font-bold text-indigo-600">{formatCurrency(product.price)}</p>
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">Stok: {product.stock}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            {out ? <span className="text-red-600 font-medium">Tidak Tersedia</span> : <span className="text-slate-400">Klik tambah</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mx-auto mb-6">
                      <MdInventory className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Produk tidak ditemukan</h3>
                    <p className="text-slate-600 mb-4">
                      {searchTerm ? "Coba ubah kata kunci pencarian" : "Pilih kategori lain atau ubah filter"}
                    </p>
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                      }}
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Reset Filter
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Cart Section - Takes 1 column */}
          <div className="xl:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Cart Header */}
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center">
                      <MdShoppingCart className="mr-2 h-6 w-6" />
                      Keranjang
                    </h2>
                    {cart.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-all duration-200"
                      >
                        <MdClear className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 text-sm">
                    <span className="bg-white/50 px-3 py-1 rounded-full">
                      {getCartItemCount()} item
                    </span>
                    <span className="bg-white/50 px-3 py-1 rounded-full font-medium">
                      {formatCurrency(getCartTotal())}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Cart Items */}
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <div className="p-4">
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.src = fallbackAvatar(item.name);
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-sm mb-1">{item.name}</h3>
                            <p className="text-xs text-slate-600 mb-2">{formatCurrency(item.price)}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <MdRemove className="h-3 w-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center transition-colors shadow-sm"
                                >
                                  <MdAdd className="h-3 w-3" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="w-7 h-7 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                              >
                                <MdDelete className="h-3 w-3" />
                              </button>
                            </div>
                            <div className="mt-2 text-right">
                              <span className="text-sm font-bold text-slate-800">
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {cart.length === 0 && (
                    <div className="text-center py-8">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mx-auto mb-4">
                        <MdShoppingBag className="h-8 w-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-800 mb-1">Keranjang Kosong</h3>
                      <p className="text-slate-600 text-sm">Tambahkan produk untuk memulai transaksi</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Cart Summary & Actions */}
              {cart.length > 0 && (
                <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <div className="p-6">
                    {/* Referral Code */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Kode Referal
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={referralCode}
                          onChange={(e) => setReferralCode(e.target.value)}
                          placeholder="Contoh: NUSA10"
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          onClick={applyReferral}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Terapkan
                        </button>
                      </div>
                      {referralMsg && (
                        <p className="mt-2 text-sm text-slate-600">{referralMsg}</p>
                      )}
                    </div>
                    {/* Cart Summary */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-medium text-slate-800">{formatCurrency(getSubtotal())}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-slate-800">Total:</span>
                          <span className="text-xl font-bold text-indigo-600">{formatCurrency(getCartTotal())}</span>
                        </div>
                      </div>
                      {/* Estimasi Profit removed from UI */}
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <button
                        onClick={handleCheckout}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-medium transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                      >
                        <MdPayment className="mr-2 h-5 w-5" />
                        Proses Pembayaran
                      </button>
                      <button
                        onClick={handlePrint}
                        className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-all duration-200 flex items-center justify-center"
                      >
                        <MdPrint className="mr-2 h-4 w-4" />
                        Cetak Struk
                      </button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
              
              <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Pembayaran</h3>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <MdClear className="h-5 w-5" />
                  </button>
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-3">Metode Pembayaran</label>
                  <div className="grid grid-cols-1 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                          paymentMethod === method.id
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${method.color}`}>
                          {method.icon}
                        </div>
                        <span className="font-medium text-slate-800">{method.name}</span>
                        {paymentMethod === method.id && (
                          <MdCheck className="ml-auto h-5 w-5 text-indigo-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash Payment Input */}
                {paymentMethod === "cash" && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Uang Diterima</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">Rp</span>
                      <input
                        type="number"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="0"
                      />
                    </div>
                    {receivedAmount && (
                      <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Total: {formatCurrency(getCartTotal())}</span>
                          <span>Diterima: {formatCurrency(parseFloat(receivedAmount) || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm font-bold mt-1">
                          <span>Kembalian:</span>
                          <span className={getChangeAmount() >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {formatCurrency(getChangeAmount())}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="flex-1 py-2 px-4 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={processPayment}
                    disabled={paymentMethod === "cash" && getChangeAmount() < 0}
                    className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Bayar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        {showReceiptModal && lastTransaction && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-slate-500 bg-opacity-75 backdrop-blur-sm"></div>
              
              <div className="inline-block w-full max-w-lg p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                {/* Receipt Header */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <MdCheck className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Pembayaran Berhasil!</h3>
                        <p className="text-green-100">Transaksi telah diselesaikan</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReceiptModal(false)}
                      className="text-white/80 hover:text-white"
                    >
                      <MdClear className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Receipt Content */}
                <div className="p-6">
                  {/* Store Info */}
                  <div className="text-center mb-6 pb-4 border-b border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">LYVIA NUSA BOGA</h2>
                    <p className="text-slate-600 text-sm">Spesialis Produk Cakalang Khas Manado</p>
                    <p className="text-slate-500 text-xs">Jl. Raya Manado No. 123 | Telp: (0431) 123-4567</p>
                  </div>

                  {/* Transaction Info */}
                  <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                    <div>
                      <span className="text-slate-600">No. Transaksi:</span>
                      <p className="font-bold text-slate-800">{lastTransaction.id}</p>
                    </div>
                    <div>
                      <span className="text-slate-600">Tanggal:</span>
                      <p className="font-bold text-slate-800">{formatDate(lastTransaction.date)}</p>
                    </div>
                    {lastTransaction.guestInfo ? (
                      <>
                        <div>
                          <span className="text-slate-600">Nama Pelanggan:</span>
                          <p className="font-bold text-slate-800">{lastTransaction.guestInfo.nama}</p>
                        </div>
                        <div>
                          <span className="text-slate-600">Nomor WhatsApp:</span>
                          <p className="font-bold text-slate-800">+62{lastTransaction.guestInfo.whatsapp}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <span className="text-slate-600">Kasir:</span>
                          <p className="font-bold text-slate-800">{lastTransaction.cashier}</p>
                        </div>
                        <div></div>
                      </>
                    )}
                    <div>
                      <span className="text-slate-600">Metode Pembayaran:</span>
                      <p className="font-bold text-slate-800">
                        {lastTransaction.paymentMethod === 'cash' ? 'Tunai' : 
                         lastTransaction.paymentMethod === 'card' ? 'Kartu' : 'QR Code'}
                      </p>
                    </div>
                  </div>

                  {/* Guest Address Info */}
                  {lastTransaction.guestInfo && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-600 font-semibold mb-1">Alamat Pengiriman:</p>
                      <p className="text-sm text-blue-900">{lastTransaction.guestInfo.alamat}</p>
                    </div>
                  )}

                  {/* Items */}
                  <div className="mb-6">
                    <h4 className="font-bold text-slate-800 mb-3 pb-2 border-b border-slate-200">Detail Pembelian</h4>
                    <div className="space-y-3">
                      {lastTransaction.items.map((item, index) => (
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

                  {/* Summary */}
                  <div className="bg-slate-50 rounded-lg p-4 mb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-medium text-slate-800">{formatCurrency(lastTransaction.subtotal)}</span>
                      </div>
                      {lastTransaction.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Diskon ({lastTransaction.discount}%):</span>
                          <span className="font-medium text-red-600">-{formatCurrency(lastTransaction.discountAmount)}</span>
                        </div>
                      )}
                      {lastTransaction.referralCode && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Referral:</span>
                          <span className="font-medium text-indigo-600">{lastTransaction.referralCode}</span>
                        </div>
                      )}
                      <div className="border-t border-slate-200 pt-2">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-slate-800">Total:</span>
                          <span className="text-xl font-bold text-indigo-600">{formatCurrency(lastTransaction.total)}</span>
                        </div>
                      </div>
                      
                      {lastTransaction.paymentMethod === 'cash' && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Diterima:</span>
                            <span className="font-medium text-slate-800">{formatCurrency(lastTransaction.receivedAmount)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Kembalian:</span>
                            <span className="font-bold text-green-600">{formatCurrency(lastTransaction.change)}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Profit Info (for internal use) */}
                  {/* Estimasi Profit removed from receipt UI */}

                  {/* Thank You Message */}
                  <div className="text-center bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 mb-6">
                    <p className="text-slate-800 font-medium mb-1">Terima kasih atas kunjungan Anda!</p>
                    <p className="text-slate-600 text-sm">Nikmati kelezatan produk cakalang premium kami</p>
                    <p className="text-indigo-600 font-bold text-sm mt-2">*** SELAMAT BERBELANJA ***</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <button
                      onClick={() => printReceipt(lastTransaction)}
                      className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-all duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
                    >
                      <MdPrint className="mr-2 h-5 w-5" />
                      Cetak Struk
                    </button>
                    <button
                      onClick={() => setShowReceiptModal(false)}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-all duration-200 flex items-center justify-center"
                    >
                      <MdCheck className="mr-2 h-4 w-4" />
                      Selesai
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POS;
