import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { format } from "date-fns";
import { id } from "date-fns/locale";
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
  MdClose,
  MdLocalOffer,
  MdCheck,
  MdAccountBalanceWallet,
  MdCreditCard,
  MdQrCode,
  MdDiscount,
  MdLocalShipping,
  MdLocationCity,
  MdAccessTime,
  MdExpandMore,
  MdExpandLess
} from "react-icons/md";
import { fetchCategories, fetchProducts } from "../../store/slices/productSlice";
import { uploadPaymentProof, uploadPaymentProofGuest, fetchPaymentProofs } from "../../store/slices/paymentProofSlice";
import { validateReferral, clearReferral } from "../../store/slices/referralSlice";
import { posCheckout, clearLastOrder } from "../../store/slices/posSlice";
import api from "../../api/axios";
import { guestCheckoutApi } from "../../api/orders";
import { getProvinces, getCities, calculateShippingCost } from "../../api/shipping";
import { buildProductImageUrl, buildImageUrl, fallbackAvatar } from "../../utils/image";

/**
 * POSMenu Component
 * Wrapper untuk POS yang bisa digunakan di dalam modal untuk guest checkout
 * Menampilkan menu produk dan fitur POS dalam ukuran yang lebih kecil/responsif
 * 
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
 * - isGuest: boolean - apakah mode guest checkout
 * - onClose: function - callback saat modal ditutup
 * - layout: 'full' | 'products-only' - 'full' = menampilkan cart di bawah, 'products-only' = hanya produk
 * - onCartUpdate: function - callback saat cart berubah (untuk parent component)
 */
const POSMenu = ({ isGuest = false, onClose = null, layout = 'full', onCartUpdate = null }) => {
  const dispatch = useDispatch();
  const { info: referralInfo, error: referralError, loading: referralLoading } = useSelector(s => s.referral);
  const { lastOrder, loading: posLoading, error: posError } = useSelector(s => s.pos);
  const { categories, items: productItems } = useSelector(s => s.products || {});

  // Guest checkout data
  const [guestCheckoutData, setGuestCheckoutData] = useState(null);

  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [paymentMethod, setPaymentMethod] = useState('transfer');
  const [receivedAmount, setReceivedAmount] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [referralMsg, setReferralMsg] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paying, setPaying] = useState(false); // loading state for payment
  const [showPayingOverlay, setShowPayingOverlay] = useState(false); // overlay for loading
  const [showSuccessAnim, setShowSuccessAnim] = useState(false); // success animation
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const fileInputId = "pos-proof-file-input";
  const [selectedProofFile, setSelectedProofFile] = useState(null);
  const [selectedProofDataUrl, setSelectedProofDataUrl] = useState(null);
  const [uploadedProof, setUploadedProof] = useState(null);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [now, setNow] = useState(new Date());

  // Shipping states
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingCost, setShippingCost] = useState(0);
  const [expandedCouriers, setExpandedCouriers] = useState({}); // Track which courier groups are expanded

  // Bank account details for transfer payments (configurable via env, with sensible defaults)
  const bankDetails = React.useMemo(() => ({
    bankName: 'Bank BCA',
    accountNumber: '0262768897',
    accountName: 'SURIANA',
  }), []);

  // Load guest checkout data once
  useEffect(() => {
    try {
      const stored = localStorage.getItem('guestCheckoutData');
      if (stored) setGuestCheckoutData(JSON.parse(stored));
    } catch {}
  }, []);

  // Lightweight timer for header clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const result = await getProvinces();
        if (result.success) {
          setProvinces(result.data || []);
        }
      } catch (error) {
        console.error('[POSMenu] Error loading provinces:', error);
      }
    };
    loadProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    const loadCities = async () => {
      if (!selectedProvince) {
        setCities([]);
        return;
      }
      try {
        const result = await getCities(selectedProvince);
        if (result.success) {
          setCities(result.data || []);
        }
      } catch (error) {
        console.error('[POSMenu] Error loading cities:', error);
      }
    };
    loadCities();
  }, [selectedProvince]);

  // Calculate shipping when city changes
  useEffect(() => {
    const calcShipping = async () => {
      if (!selectedCity || cart.length === 0) {
        setShippingOptions([]);
        setSelectedShipping(null);
        setShippingCost(0);
        return;
      }

      setLoadingShipping(true);
      try {
        // Calculate total weight (assume 500g per item if no weight specified)
        const totalWeight = cart.reduce((sum, item) => {
          const itemWeight = item.weight || 500; // gram
          return sum + (itemWeight * item.quantity);
        }, 0);

        const result = await calculateShippingCost({
          origin: 330, // Manado city ID
          destination: selectedCity, // City ID from dropdown
          destination_province_id: selectedProvince, // Province ID
          weight: totalWeight
        });

        if (result.success) {
          setShippingOptions(result.data.shipping_options || []);
          // Auto-select cheapest option
          if (result.data.shipping_options && result.data.shipping_options.length > 0) {
            const cheapest = result.data.shipping_options[0];
            setSelectedShipping(cheapest);
            setShippingCost(cheapest.cost);
            
            // Auto-expand the cheapest courier group
            const cheapestCourierCode = cheapest.courier_code;
            setExpandedCouriers({ [cheapestCourierCode]: true });
          }
        }
      } catch (error) {
        console.error('[POSMenu] Error calculating shipping:', error);
        setShippingOptions([]);
      } finally {
        setLoadingShipping(false);
      }
    };

    calcShipping();
  }, [selectedCity, cart]);

  // Fetch categories once
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch products when category or search changes
  useEffect(() => {
    const category_id = selectedCategory !== 'all' ? selectedCategory : undefined;
    const q = searchTerm || undefined;
    dispatch(fetchProducts({ q, category_id, page: 1, pageSize: 100 }));
  }, [dispatch, selectedCategory, searchTerm]);

  const categoryChips = useMemo(() => {
    const base = [{ id: 'all', name: 'Semua Kategori' }];
    return base.concat((categories || []).map(c => ({ id: c.category_id, name: c.name })));
  }, [categories]);

  const products = useMemo(() => {
    return (productItems || []).map(p => {
      const rawImg = p.image_url || p.ProductImages?.find?.(im => im.is_primary)?.url || p.ProductImages?.[0]?.url;
      return {
        id: p.product_id,
        name: p.name,
        price: p.price,
        cost_price: p.cost_price,
        image: buildProductImageUrl(rawImg),
        stock: p.stock || 0,
        category: p.category_id || 'uncat',
        barcode: p.barcode,
      };
    });
  }, [productItems]);

  const filteredProducts = useMemo(() => {
    let result = [...products];
    const term = (searchTerm || '').trim().toLowerCase();
    if (term) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.barcode || '').toLowerCase().includes(term)
      );
    }
    
    if (stockFilter === 'available') {
      result = result.filter(p => p.stock > 0);
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter(p => p.stock <= 0);
    }
    
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'stock':
          return b.stock - a.stock;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    return result;
  }, [products, searchTerm, stockFilter, sortBy]);

  const paymentMethods = [
    { id: "transfer", name: "Transfer Rekening", icon: <MdAttachMoney />, color: "bg-blue-100 text-blue-600" },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const addToCart = (product) => {
    const existing = cart.find(c => c.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(c => 
          c.id === product.id ? { ...c, quantity: c.quantity + 1 } : c
        ));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const product = products.find(p => p.id === productId);
      if (product && quantity <= product.stock) {
        setCart(cart.map(c =>
          c.id === productId ? { ...c, quantity } : c
        ));
      }
    }
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const getCartTotal = () => {
    // Manual discounts removed: total = subtotal + shippingCost
    return Math.max(0, getSubtotal() + shippingCost);
  };

  const getCartItemCount = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Note: frontend no longer applies manual discounts. Discount computations
  // are handled server-side (referral/membership). This keeps POS simple
  // and avoids client-side overrides.

  const getChangeAmount = () => {
    if (paymentMethod !== 'cash') return 0;
    const received = parseFloat(receivedAmount) || 0;
    return Math.max(0, received - getCartTotal());
  };

  // profit calculation removed

  const clearCart = () => {
    setCart([]);
    setReferralCode("");
    setReferralMsg("");
    setSelectedProvince('');
    setSelectedCity('');
    setShippingOptions([]);
    setSelectedShipping(null);
    setShippingCost(0);
  };

  const applyReferral = async () => {
    if (!referralCode.trim()) {
      setReferralMsg("⚠️ Masukkan kode referral");
      return;
    }
    
    setReferralMsg("🔄 Memvalidasi kode...");
    
    const action = await dispatch(validateReferral(referralCode.trim()));
    
    if (validateReferral.fulfilled.match(action)) {
      // Do NOT apply discount client-side. Server will compute and apply
      // referral discounts during checkout. Here just show a friendly message.
      const data = action.payload;
      if (data.type === 'percent') {
        setReferralMsg(`✅ Kode valid. Diskon ${data.value}% akan diterapkan saat checkout.`);
      } else {
        setReferralMsg(`✅ Kode valid. Diskon ${formatCurrency(data.value)} akan diterapkan saat checkout.`);
      }
    } else {
      setReferralMsg(`❌ ${action.payload?.msg || 'Kode referral tidak valid'}`);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setStockFilter("all");
    setSearchTerm("");
    setSortBy("name");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== 'all') count++;
    if (stockFilter !== 'all') count++;
    if (searchTerm.trim()) count++;
    if (sortBy !== 'name') count++;
    return count;
  };

  const processPayment = async () => {
    if (cart.length === 0) {
      alert("Keranjang kosong!");
      return;
    }
    if (paying) return; // prevent double click
    setPaying(true);
    setShowPayingOverlay(true);

    // Only transfer allowed for guest checkout, cash removed

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
      shipping_cost: shippingCost,
      courier_name: selectedShipping?.courier_name || null, // NEW
      shipping_service: selectedShipping?.service || null, // NEW
      shipping_service_name: selectedShipping?.description || null, // NEW
      shipping_etd: selectedShipping?.etd || null, // NEW
      payment_fee: 0,
      total: getCartTotal(),
      received_amount: paymentMethod === 'cash' ? parseFloat(receivedAmount) : getCartTotal(),
      change_amount: paymentMethod === 'cash' ? getChangeAmount() : 0,
      customer_note: selectedShipping 
        ? `POS checkout - Pengiriman: ${selectedShipping.courier_name} ${selectedShipping.service}`
        : 'POS checkout',
      referral_code: referralCode ? referralCode.trim().toUpperCase() : undefined,
      shipping_info: selectedShipping ? {
        courier: selectedShipping.courier_code,
        service: selectedShipping.service,
        cost: selectedShipping.cost,
        etd: selectedShipping.etd,
        destination_city_id: selectedCity,
        destination_province_id: selectedProvince,
        requires_confirmation: selectedShipping.requires_confirmation || false,
        note: selectedShipping.note || null
      } : undefined
    };

    let paymentMethodId = null;
    try {
      const { data: methods } = await api.get('/payments/methods');
      const map = {
        cash: ['CASH', 'TUNAI'],
        transfer: ['TRANSFER', 'BANK_TRANSFER', 'MANUAL_TRANSFER', 'TF', 'REKENING']
      };
      const wanted = map[paymentMethod];
      const found = (methods || []).find(m => wanted.includes(m.code?.toUpperCase()) || wanted.includes(m.name?.toUpperCase()));
      paymentMethodId = found?.payment_method_id || null;
    } catch (e) {
      // fallback
    }
    if (paymentMethodId) payload.payment_method_id = paymentMethodId;

    try {
      let order;
      let isGuestCheckout = false;

      if (guestCheckoutData) {
        console.log('[POSMenu] Processing guest checkout:', guestCheckoutData);
        isGuestCheckout = true;
        
        const guestPayload = {
          ...payload,
          guest_nama: guestCheckoutData.nama,
          guest_alamat: guestCheckoutData.alamat,
          guest_whatsapp: guestCheckoutData.whatsapp,
        };

        try {
          const response = await guestCheckoutApi(guestPayload);
          order = response || {};
          console.log('[POSMenu] Guest checkout response:', order);
        } catch (e) {
          console.error('[POSMenu] Guest checkout error:', e);
          alert(`Gagal memproses guest checkout: ${e.response?.data?.msg || e.message}`);
          setPaying(false);
          return;
        }
      } else {
        const action = await dispatch(posCheckout(payload));
        if (!posCheckout.fulfilled.match(action)) {
          alert(action.payload?.msg || 'Gagal memproses POS checkout');
          setPaying(false);
          return;
        }
        order = action.payload || {};
      }

      const createdAt = order.created_at || order.completed_at || order.paid_at || new Date().toISOString();

      // If transfer and user selected a proof file earlier, upload it now using the created order_id
      if (paymentMethod === 'transfer' && selectedProofDataUrl && order?.order_id) {
        try {
          setUploadingProof(true);
          console.log('[POSMenu] Uploading payment proof:', {
            order_id: order.order_id,
            file_url: selectedProofDataUrl,
            mime_type: selectedProofFile?.type || 'image/png',
            file_size: selectedProofFile?.size || undefined
          });
          let action;
          if (isGuestCheckout) {
            action = await dispatch(uploadPaymentProofGuest({
              order_id: order.order_id,
              file_url: selectedProofDataUrl,
              mime_type: selectedProofFile?.type || 'image/png',
              file_size: selectedProofFile?.size || undefined,
            }));
          } else {
            action = await dispatch(uploadPaymentProof({
              order_id: order.order_id,
              file_url: selectedProofDataUrl,
              mime_type: selectedProofFile?.type || 'image/png',
              file_size: selectedProofFile?.size || undefined,
            }));
          }
          setUploadingProof(false);
          if (
            (isGuestCheckout && uploadPaymentProofGuest.fulfilled.match(action)) ||
            (!isGuestCheckout && uploadPaymentProof.fulfilled.match(action))
          ) {
            setUploadedProof(action.payload);
            console.log('[POSMenu] Payment proof upload success:', action.payload);
            // Best effort refresh
            try { await dispatch(fetchPaymentProofs({ order_id: order.order_id })); } catch {}
          } else {
            console.warn('[POSMenu] Upload bukti bayar gagal:', action.payload || action.error);
          }
        } catch (e) {
          setUploadingProof(false);
          console.warn('[POSMenu] Upload proof exception:', e);
        }
      }
      
      const tx = {
        id: order.order_number || `POS-${Date.now()}`,
        orderId: order.order_id,
        date: createdAt,
        items: cart,
        subtotal: getSubtotal(),
        discount: 0,
        discountAmount: 0,
        shippingCost: shippingCost,
        shippingInfo: selectedShipping,
        total: getCartTotal(),
        paymentMethod: paymentMethod,
        receivedAmount: paymentMethod === 'cash' ? (parseFloat(receivedAmount) || 0) : getCartTotal(),
        change: paymentMethod === 'cash' ? getChangeAmount() : 0,
  // profit removed
        cashier: guestCheckoutData ? guestCheckoutData.nama : 'Admin POS',
        status: 'SELESAI',
        referralCode: order.referral_code || (referralCode ? referralCode.trim().toUpperCase() : null),
        guestInfo: guestCheckoutData ? {
          nama: guestCheckoutData.nama,
          alamat: guestCheckoutData.alamat,
          whatsapp: guestCheckoutData.whatsapp
        } : null,
        isGuestCheckout: isGuestCheckout
      };

      setLastTransaction(tx);
      // Reset selected proof file after processing
      setSelectedProofFile(null);
      setSelectedProofDataUrl(null);
      clearCart();
      setShowPaymentModal(false);
      setReceivedAmount("");
      setShowReceiptModal(true);
      setPaying(false);
      setShowSuccessAnim(true);
      setTimeout(() => {
        setShowSuccessAnim(false);
        setShowPayingOverlay(false);
      }, 2000);
      
      if (isGuestCheckout) {
        localStorage.removeItem('guestCheckoutData');
        setGuestCheckoutData(null);
      }
      
      dispatch(fetchProducts({ q: undefined, category_id: undefined, page: 1, pageSize: 100 }));
    } catch (e) {
      console.error('[POSMenu] Payment error:', e);
      alert(`Error: ${e.message}`);
      setPaying(false);
      // Keep overlay open for manual close on error
    }
  };

  const validateCartStock = () => {
    let adjusted = false;
    const nextCart = cart.map(ci => {
      const product = products.find(p => p.id === ci.id);
      if (!product) return ci;
      if (typeof product.stock === 'number') {
        if (product.stock <= 0) {
          adjusted = true;
          return { ...ci, quantity: 0 };
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
      alert('Beberapa kuantitas produk telah disesuaikan dengan stok terbaru.');
      return false;
    }
    return true;
  };

  const onSelectProofFile = async (e) => {
    try {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      const allowed = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/pjpeg', 'image/heic', 'image/heif', 'image/webp', 'image/bmp', 'image/gif', 'application/pdf'
      ];
      if (!allowed.includes(file.type)) {
        alert('Hanya file gambar (JPG, PNG, HEIC, WEBP, BMP, GIF) atau PDF yang diizinkan');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5MB'); return; }
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result;
        // Store for upload after order creation
        setSelectedProofFile(file);
        setSelectedProofDataUrl(dataUrl);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Gagal memproses file');
    }
  };

  const handleClickUploadProof = () => {
    const input = document.getElementById(fileInputId);
    if (input) input.click();
  };

  const handleDownloadReceipt = () => {
    if (!lastTransaction) return;
    const orderData = {
      id: lastTransaction.id,
      date: lastTransaction.date,
      items: (lastTransaction.items || []).map(it => ({ name: it.name, price: it.price, quantity: it.quantity })),
      subtotal: lastTransaction.subtotal || 0,
      discount: lastTransaction.discount || 0,
      discountAmount: lastTransaction.discountAmount || 0,
      total: lastTransaction.total || 0,
      paymentMethod: lastTransaction.paymentMethod,
      receivedAmount: lastTransaction.receivedAmount || lastTransaction.total || 0,
      change: lastTransaction.change || 0,
      status: lastTransaction.status || 'completed',
      cashier: lastTransaction.cashier || 'Admin POS',
      customerInfo: lastTransaction.guestInfo ? {
        name: lastTransaction.guestInfo.nama,
        phone: lastTransaction.guestInfo.whatsapp
      } : undefined
    };
    const receipt = Receipt({ orderData, type: 'pos' });
    receipt.downloadReceipt(`struk-${orderData.id}.html`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Loading Overlay for Payment */}
      {showPayingOverlay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl shadow-2xl border-2 border-indigo-200 min-w-[320px]">
            {!showSuccessAnim ? (
              <>
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <div className="text-xl font-bold text-indigo-700">Memproses pembayaran...</div>
                <button
                  className="mt-2 px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow hover:from-indigo-700 hover:to-purple-700 transition-all"
                  onClick={() => setShowPayingOverlay(false)}
                >Tutup</button>
                <div className="text-xs text-slate-500 mt-2">Akan tertutup otomatis jika sukses</div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 flex items-center justify-center mb-2">
                  <svg className="animate-bounce" width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="32" fill="#4F46E5" />
                    <path d="M18 34L28 44L46 26" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-xl font-bold text-green-600">Pembayaran Berhasil!</div>
                <div className="text-xs text-slate-500 mt-2">Menutup dalam 2 detik...</div>
              </>
            )}
          </div>
        </div>
      )}
      {/* POS Header - Modern & Elevated */}
      <div className="mb-6 p-5 bg-white/95 backdrop-blur-sm rounded-2xl border border-white shadow-xl shadow-indigo-500/10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/50 transform hover:scale-105 transition-transform">
              <MdPointOfSale size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Kasir POS
              </h1>
              <p className="text-xs text-slate-500 font-medium">{format(now, 'dd MMM yyyy, HH:mm', { locale: id })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 border-2 border-indigo-200 text-indigo-700 text-sm font-bold shadow-sm">
              <span className="text-indigo-400 mr-1">●</span> {getCartItemCount()} item
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-200 text-purple-700 text-sm font-bold shadow-sm">
              {formatCurrency(getCartTotal())}
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner - Guest Checkout */}
      {guestCheckoutData && (
        <div className="mb-8 p-7 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-3xl shadow-2xl relative overflow-hidden min-h-[120px] sm:min-h-[140px]">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          <div className="relative flex items-center justify-between gap-8">
            <div className="flex items-center gap-6 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl shadow-lg border-2 border-white/30">
                {guestCheckoutData.nama.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-white truncate mb-2">{guestCheckoutData.nama}</p>
                <p className="text-base text-white/90 truncate flex items-center gap-2">
                  <span>📱</span> {guestCheckoutData.whatsapp}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 bg-white/20 backdrop-blur-sm rounded-xl px-6 py-5 border border-white/30">
              <p className="text-sm text-white/80 mb-2 font-medium">Total Belanja</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(getCartTotal())}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Bar - Enhanced */}
      <div className="mb-6 p-5 bg-white/95 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-slate-200/50 space-y-4">
        {/* Search Box */}
        <div className="relative group">
          <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-all duration-300 group-focus-within:scale-110" size={22} />
          <input
            type="text"
            placeholder="🔍 Cari nama produk..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <MdClose size={18} />
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category Filter */}
          <div className="relative">
            <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <MdCategory size={14} />
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white cursor-pointer transition-all appearance-none pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center'
              }}
            >
              {categoryChips.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="relative">
            <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <MdInventory size={14} />
              Stok
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white cursor-pointer transition-all appearance-none pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center'
              }}
            >
              <option value="all">Semua Stok</option>
              <option value="available">Tersedia</option>
              <option value="out_of_stock">Habis</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative">
            <label className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
              <MdFilterList size={14} />
              Urutkan
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white cursor-pointer transition-all appearance-none pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B7280' d='M1 4l5 5 5-5'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center'
              }}
            >
              <option value="name">Nama A-Z</option>
              <option value="price">Harga Terendah</option>
              <option value="stock">Stok Terbanyak</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="relative">
            <label className="text-xs font-semibold text-transparent mb-2 block">.</label>
            <button
              onClick={clearAllFilters}
              disabled={getActiveFiltersCount() === 0}
              className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                getActiveFiltersCount() > 0
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <MdClear size={16} />
              Reset Filter
            </button>
          </div>
        </div>

        {/* Content: Products (left) and POS Menu (right) */}
        <div className="mb-6 flex flex-col lg:flex-row gap-6">
          {/* Left: Products Grid - responsive */}
          <div className="flex-1 min-w-0">
            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
              {filteredProducts.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="mb-6">
                    <div className="bg-slate-200 p-8 rounded-full shadow-inner">
                      <MdShoppingBag size={64} className="text-slate-400" />
                    </div>
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 mb-2">Tidak ada produk yang tersedia</h3>
                  <p className="text-sm text-slate-600 mb-1 text-center max-w-md">
                    {searchTerm 
                      ? `Tidak ditemukan produk dengan kata kunci \"${searchTerm}\"` 
                      : stockFilter === 'out_of_stock'
                      ? 'Tidak ada produk yang habis stok'
                      : selectedCategory !== 'all'
                      ? 'Tidak ada produk dalam kategori ini'
                      : 'Coba ubah filter atau kata kunci pencarian'}
                  </p>
                  {getActiveFiltersCount() > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={clearAllFilters}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                      >
                        <MdClear size={18} />
                        Reset Semua Filter
                      </button>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-300 font-semibold rounded-xl transition-all flex items-center gap-2"
                        >
                          <MdClose size={18} />
                          Hapus Pencarian
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredProducts.map(product => (
                    <div
                      key={product.id}
                      className={`group relative bg-white/80 backdrop-blur-sm border-2 rounded-2xl p-5 transition-all duration-300 ${
                        product.stock <= 0 
                          ? 'cursor-not-allowed opacity-60 border-slate-200' 
                          : 'cursor-pointer border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/20 hover:-translate-y-1'
                      }`}
                    >
                      {/* Image Container - Enhanced */}
                      <div
                        className="relative w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden mb-4 cursor-pointer shadow-md group-hover:shadow-xl transition-all duration-300"
                        onClick={() => product.stock > 0 && addToCart(product)}
                        title={product.stock > 0 ? 'Klik untuk tambah ke keranjang' : 'Stok habis'}
                      >
                        {/* Out of Stock Overlay */}
                        {product.stock <= 0 && (
                          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                            <span className="text-white text-sm font-bold px-4 py-2 bg-red-600 rounded-lg shadow-lg mb-2">STOK HABIS</span>
                            <span className="text-white/70 text-xs">Segera Restock</span>
                          </div>
                        )}
                        
                        {/* Product Image */}
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => { try { e.target.src = fallbackAvatar(product.name || 'Product'); } catch (_) { e.target.src = ''; } }}
                        />
                        
                        {/* Stock Badge - Floating Top Right */}
                        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xl backdrop-blur-sm border-2 ${
                          product.stock > 10
                            ? 'bg-emerald-500/90 text-white border-emerald-300' 
                            : product.stock > 0
                            ? 'bg-amber-500/90 text-white border-amber-300'
                            : 'bg-red-600/90 text-white border-red-300'
                        }`}>
                          {product.stock > 0 ? (
                            <>
                              <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse shadow-sm"></span>
                              {product.stock} pcs
                            </>
                          ) : (
                            <span>0 pcs</span>
                          )}
                        </div>

                        {/* Quick Add Overlay on Hover */}
                        {product.stock > 0 && (
                          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 via-indigo-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                            <div className="text-white text-xs font-semibold flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/40">
                              <MdAdd size={16} />
                              Klik untuk tambah
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content - Enhanced */}
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        {/* Product Name */}
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </h4>
                        </div>

                        {/* Price Section - Modern */}
                        <div className="space-y-2">
                          {/* Cost Price as strikethrough (discount style) */}
                          {product.cost_price && product.cost_price > 0 && product.cost_price > product.price ? (
                            <>
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-semibold text-slate-400 line-through decoration-amber-500 decoration-2">
                                  {formatCurrency(product.cost_price)}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                  {formatCurrency(product.price)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-baseline gap-2">
                              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {formatCurrency(product.price)}
                              </span>
                            </div>
                          )}
                          {/* Stock Info Badge */}
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                              product.stock > 10 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : product.stock > 0 
                                ? 'bg-amber-100 text-amber-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {product.stock > 10 ? '✓ Tersedia' : product.stock > 0 ? '⚠ Terbatas' : '✗ Habis'}
                            </span>
                          </div>
                        </div>

                        {/* Add Button - Removed, only click on image to add */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: POS Menu / Cart Sidebar - Enhanced */}
          {layout === 'full' && (
            <div className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0">
              <div className="p-6 bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/20 border-2 border-indigo-200 rounded-2xl shadow-2xl shadow-indigo-500/10 space-y-4 backdrop-blur-sm">
                {/* Header - Modern */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-indigo-100">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/50">
                      <MdShoppingCart className="text-white" size={20} />
                    </div>
                    <span>Keranjang <span className="text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-lg text-sm ml-1">({getCartItemCount()})</span></span>
                  </h3>
                  <button
                    onClick={clearCart}
                    className="text-xs font-bold text-red-600 hover:text-white hover:bg-red-600 px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow-md"
                    title="Bersihkan keranjang"
                  >
                    <MdClear size={12} className="inline mr-1" />Hapus
                  </button>
                </div>

                {/* Empty state */}
                {cart.length === 0 ? (
                  <div className="text-center text-slate-500 text-sm py-6 bg-white rounded-xl border-2 border-slate-200">
                    Keranjang kosong
                  </div>
                ) : (
                  <>
                    {/* Cart Items - Scrollable */}
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 -mr-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-2.5 p-2.5 bg-white rounded-lg border-2 border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all group">
                          {/* Item Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-600 mt-0.5">{formatCurrency(item.price)} × {item.quantity} = <span className="font-bold text-indigo-600">{formatCurrency(item.price * item.quantity)}</span></p>
                          </div>

                          {/* Quantity Controls - Compact */}
                          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5 group-hover:bg-slate-200 transition-colors">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 text-slate-600 hover:text-slate-800 hover:bg-white rounded transition-colors active:scale-95 disabled:bg-slate-200"
                              title="Kurang"
                            >
                              <MdRemove size={13} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-7 text-center border-0 bg-transparent text-xs font-bold text-slate-800"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 text-slate-600 hover:text-slate-800 hover:bg-white rounded transition-colors active:scale-95 disabled:bg-slate-200"
                              disabled={item.quantity >= item.stock}
                              title="Tambah"
                            >
                              <MdAdd size={13} />
                            </button>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors active:scale-95"
                            title="Hapus item"
                          >
                            <MdDelete size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary - Compact */}
                    <div className="pt-3 border-t-2 border-indigo-300 space-y-2 bg-indigo-50 p-3 rounded-lg">
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-slate-700 font-medium">Subtotal:</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(getSubtotal())}</span>
                      </div>
                      {shippingCost > 0 && (
                        <div className="flex justify-between text-sm text-blue-600 font-bold py-2 px-3 bg-blue-50 rounded-lg">
                          <span className="flex items-center gap-1">
                            <MdLocalShipping size={16} />
                            Ongkir:
                          </span>
                          <span>+{formatCurrency(shippingCost)}</span>
                        </div>
                      )}
                      {referralCode && (
                        <div className="flex justify-between text-xs text-indigo-600 font-medium py-2 px-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <span>Kode Referral:</span>
                          <span className="font-bold tracking-wide">{referralCode.toUpperCase()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white p-4 rounded-xl shadow-lg shadow-indigo-500/50">
                        <span className="flex items-center gap-2">
                          <span className="text-2xl">💰</span>
                          Total:
                        </span>
                        <span className="text-xl">{formatCurrency(getCartTotal())}</span>
                      </div>
                    </div>

                    {/* Shipping Selection - Enhanced */}
                    <div className="pt-4 border-t-2 border-indigo-200 space-y-4">
                      <label className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <MdLocalShipping size={14} className="text-white" />
                        </div>
                        Pilih Pengiriman
                      </label>

                      {/* Province Selector - Modern */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 mb-2 block">Provinsi Tujuan</label>
                        <select
                          value={selectedProvince}
                          onChange={(e) => {
                            setSelectedProvince(e.target.value);
                            setSelectedCity('');
                            setShippingOptions([]);
                            setSelectedShipping(null);
                            setShippingCost(0);
                          }}
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm hover:shadow-md transition-all"
                        >
                          <option value="">-- Pilih Provinsi --</option>
                          {provinces.map(prov => (
                            <option key={prov.id} value={prov.id}>
                              {prov.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* City Selector - Modern */}
                      {selectedProvince && (
                        <div>
                          <label className="text-xs font-semibold text-slate-700 mb-2 block">Kota/Kabupaten</label>
                          <select
                            value={selectedCity}
                            onChange={(e) => {
                              setSelectedCity(e.target.value);
                            }}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">-- Pilih Kota --</option>
                            {cities.map(city => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Shipping Options */}
                      {selectedCity && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-slate-600">
                              {loadingShipping ? 'Menghitung ongkir...' : 'Pilih Layanan'}
                            </label>
                            {!loadingShipping && shippingOptions.length > 0 && (
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const grouped = shippingOptions.reduce((acc, option) => {
                                      if (!acc[option.courier_code]) acc[option.courier_code] = true;
                                      return acc;
                                    }, {});
                                    setExpandedCouriers(grouped);
                                  }}
                                  className="text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold px-2 py-0.5 rounded hover:bg-indigo-50 transition-colors"
                                >
                                  Buka Semua
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setExpandedCouriers({})}
                                  className="text-[10px] text-slate-600 hover:text-slate-700 font-semibold px-2 py-0.5 rounded hover:bg-slate-100 transition-colors"
                                >
                                  Tutup Semua
                                </button>
                              </div>
                            )}
                          </div>
                          {loadingShipping ? (
                            <div className="text-center py-6">
                              <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                              <p className="text-sm text-slate-600 mt-3 font-medium">Mencari layanan pengiriman terbaik...</p>
                            </div>
                          ) : shippingOptions.length > 0 ? (
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                              {/* Group options by courier */}
                              {(() => {
                                // Group by courier
                                const grouped = shippingOptions.reduce((acc, option) => {
                                  const courier = option.courier_code;
                                  if (!acc[courier]) acc[courier] = [];
                                  acc[courier].push(option);
                                  return acc;
                                }, {});

                                // Sort groups by cheapest option
                                const sortedCouriers = Object.keys(grouped).sort((a, b) => {
                                  const minA = Math.min(...grouped[a].map(o => o.cost));
                                  const minB = Math.min(...grouped[b].map(o => o.cost));
                                  return minA - minB;
                                });

                                return sortedCouriers.map((courierCode, groupIdx) => {
                                  const courierOptions = grouped[courierCode];
                                  const courierName = courierOptions[0].courier_name;
                                  const isExpanded = expandedCouriers[courierCode];
                                  
                                  // Toggle expand/collapse for this courier
                                  const toggleCourier = () => {
                                    setExpandedCouriers(prev => ({
                                      ...prev,
                                      [courierCode]: !prev[courierCode]
                                    }));
                                  };
                                  
                                  // Find cheapest option in this group for preview
                                  const cheapestOption = courierOptions.reduce((min, opt) => 
                                    opt.cost < min.cost ? opt : min
                                  , courierOptions[0]);
                                  
                                  return (
                                    <div key={courierCode} className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all">
                                      {/* Courier Header - Clickable to expand/collapse */}
                                      <button
                                        type="button"
                                        onClick={toggleCourier}
                                        className="w-full bg-gradient-to-r from-slate-50 to-slate-100 px-3 py-2.5 border-b border-slate-200 hover:from-slate-100 hover:to-slate-200 transition-all"
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                                              <MdLocalShipping className="text-indigo-600" size={18} />
                                            </div>
                                            <div className="text-left">
                                              <span className="font-bold text-sm text-slate-800 block">{courierName}</span>
                                              {!isExpanded && (
                                                <span className="text-[10px] text-slate-500">
                                                  Mulai dari {formatCurrency(cheapestOption.cost)}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                                              {courierOptions.length} paket
                                            </span>
                                            {isExpanded ? (
                                              <MdExpandLess className="text-slate-600" size={20} />
                                            ) : (
                                              <MdExpandMore className="text-slate-600" size={20} />
                                            )}
                                          </div>
                                        </div>
                                      </button>
                                      
                                      {/* Courier Services - Collapsible */}
                                      {isExpanded && (
                                        <div className="p-2 space-y-1.5 animate-fade-in-down">
                                          {courierOptions.map((option, idx) => {
                                          const isSelected = selectedShipping?.courier_code === option.courier_code && 
                                                           selectedShipping?.service === option.service;
                                          const isCheapest = idx === 0 && groupIdx === 0;
                                          const isFastest = option.etd && parseInt(option.etd.split('-')[0]) <= 1;
                                          
                                          return (
                                            <button
                                              key={idx}
                                              type="button"
                                              onClick={() => {
                                                setSelectedShipping(option);
                                                setShippingCost(option.cost);
                                              }}
                                              className={`w-full text-left p-3 rounded-lg border-2 transition-all relative group ${
                                                isSelected
                                                  ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md scale-[1.02]'
                                                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 hover:shadow'
                                              }`}
                                            >
                                              {/* Badges */}
                                              <div className="absolute top-2 right-2 flex gap-1">
                                                {isCheapest && (
                                                  <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                                    💰 TERMURAH
                                                  </span>
                                                )}
                                                {isFastest && (
                                                  <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold shadow-sm">
                                                    ⚡ KILAT
                                                  </span>
                                                )}
                                              </div>
                                              
                                              <div className="flex items-start justify-between gap-3 mt-1">
                                                <div className="flex-1 min-w-0">
                                                  {/* Service Name */}
                                                  <div className="flex items-center gap-2 mb-1.5">
                                                    {isSelected && (
                                                      <div className="w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <MdCheck className="text-white" size={12} />
                                                      </div>
                                                    )}
                                                    <p className={`text-sm font-bold truncate ${
                                                      isSelected ? 'text-indigo-900' : 'text-slate-800'
                                                    }`}>
                                                      {option.service}
                                                    </p>
                                                  </div>
                                                  
                                                  {/* Description */}
                                                  <p className="text-xs text-slate-600 line-clamp-2 mb-1.5">
                                                    {option.description}
                                                  </p>
                                                  
                                                  {/* ETD */}
                                                  <div className="flex items-center gap-1.5">
                                                    <MdAccessTime className="text-blue-500 flex-shrink-0" size={14} />
                                                    <span className="text-xs text-blue-600 font-semibold">
                                                      {option.etd} hari
                                                    </span>
                                                  </div>
                                                </div>
                                                
                                                {/* Price */}
                                                <div className="text-right flex-shrink-0">
                                                  <p className={`text-base font-black ${
                                                    isSelected ? 'text-indigo-600' : 'text-slate-800'
                                                  }`}>
                                                    {formatCurrency(option.cost)}
                                                  </p>
                                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                                    per order
                                                  </p>
                                                </div>
                                              </div>
                                            </button>
                                          );
                                        })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          ) : (
                            <div className="text-center py-6 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                              <MdLocalShipping className="mx-auto text-slate-400 mb-2" size={32} />
                              <p className="text-sm text-slate-600 font-medium">Tidak ada layanan pengiriman tersedia</p>
                              <p className="text-xs text-slate-500 mt-1">Pilih provinsi dan kota tujuan terlebih dahulu</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Alternatif Pengiriman (tanpa ekspedisi) */}
                      <div className="mt-4">
                        <label className="text-xs text-slate-700 mb-2.5 font-bold flex items-center gap-1.5">
                          <MdLocalOffer className="text-purple-600" size={16} />
                          Opsi Pengiriman Alternatif
                        </label>
                        <div className="space-y-2.5">
                          {/* Ambil Sendiri */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedShipping({
                                courier_code: 'PICKUP',
                                courier_name: 'Ambil Sendiri',
                                service: 'Pickup',
                                description: 'Customer mengambil pesanan langsung ke toko',
                                cost: 0,
                                etd: '0',
                                note: 'Memerlukan konfirmasi admin',
                                requires_confirmation: true
                              });
                              setShippingCost(0);
                              setSelectedProvince('');
                              setSelectedCity('');
                            }}
                            className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${
                              selectedShipping?.courier_code === 'PICKUP'
                                ? 'border-green-600 bg-green-50'
                                : 'border-slate-200 bg-white hover:border-green-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">
                                  🏪 Ambil Sendiri (Pickup)
                                </p>
                                <p className="text-[10px] text-slate-600 mt-0.5">
                                  Customer mengambil pesanan langsung ke toko
                                </p>
                                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                  ⚠️ Memerlukan konfirmasi admin
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold text-green-600">
                                  GRATIS
                                </p>
                              </div>
                            </div>
                          </button>

                          {/* Antar Langsung */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedShipping({
                                courier_code: 'DIRECT',
                                courier_name: 'Antar Langsung',
                                service: 'Direct Delivery',
                                description: 'Diantar langsung oleh kurir toko (untuk area tertentu)',
                                cost: 0,
                                etd: '1',
                                note: 'Biaya ditentukan admin sesuai jarak. Memerlukan konfirmasi',
                                requires_confirmation: true
                              });
                              setShippingCost(0);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${
                              selectedShipping?.courier_code === 'DIRECT'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-slate-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">
                                  🚗 Antar Langsung
                                </p>
                                <p className="text-[10px] text-slate-600 mt-0.5">
                                  Diantar langsung oleh kurir toko
                                </p>
                                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                  ⚠️ Biaya & ketersediaan dikonfirmasi admin
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold text-blue-600">
                                  Konfirmasi
                                </p>
                              </div>
                            </div>
                          </button>

                          {/* Custom / Lainnya */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedShipping({
                                courier_code: 'CUSTOM',
                                courier_name: 'Custom Shipping',
                                service: 'Custom',
                                description: 'Metode pengiriman lainnya (koordinasi dengan admin)',
                                cost: 0,
                                etd: '-',
                                note: 'Detail pengiriman diatur oleh admin',
                                requires_confirmation: true
                              });
                              setShippingCost(0);
                            }}
                            className={`w-full text-left p-2.5 rounded-lg border-2 transition-all ${
                              selectedShipping?.courier_code === 'CUSTOM'
                                ? 'border-purple-600 bg-purple-50'
                                : 'border-slate-200 bg-white hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="text-xs font-bold text-slate-800">
                                  📦 Metode Lainnya
                                </p>
                                <p className="text-[10px] text-slate-600 mt-0.5">
                                  Koordinasi pengiriman khusus dengan admin
                                </p>
                                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">
                                  ⚠️ Detail diatur oleh admin
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-bold text-purple-600">
                                  Konfirmasi
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      </div>

                      {selectedShipping && (
                        <div className={`border-2 rounded-lg p-3 ${
                          selectedShipping.requires_confirmation 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-blue-50 border-blue-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <MdLocalShipping className={selectedShipping.requires_confirmation ? 'text-amber-600' : 'text-blue-600'} size={18} />
                              <div>
                                <p className={`text-xs font-bold ${selectedShipping.requires_confirmation ? 'text-amber-900' : 'text-blue-900'}`}>
                                  {selectedShipping.courier_name} - {selectedShipping.service}
                                </p>
                                <p className={`text-[10px] ${selectedShipping.requires_confirmation ? 'text-amber-700' : 'text-blue-700'}`}>
                                  {selectedShipping.requires_confirmation 
                                    ? '⚠️ Menunggu konfirmasi admin' 
                                    : `Estimasi: ${selectedShipping.etd} hari`
                                  }
                                </p>
                              </div>
                            </div>
                            <p className={`text-sm font-bold ${selectedShipping.requires_confirmation ? 'text-amber-600' : 'text-blue-600'}`}>
                              {selectedShipping.cost === 0 ? (selectedShipping.requires_confirmation ? 'Pending' : 'GRATIS') : formatCurrency(selectedShipping.cost)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Referral Code & Discount Section */}
                    <div className="pt-3 border-t-2 border-indigo-200/60 space-y-3">
                      {/* Referral Code Input */}
                      <div>
                        <label className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                          <MdLocalOffer size={14} className="text-purple-600" />
                          Kode Referral
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={referralCode}
                            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                            placeholder="Contoh: NUSA10"
                            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                            maxLength={20}
                          />
                          <button
                            onClick={applyReferral}
                            disabled={!referralCode.trim() || referralLoading}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {referralLoading ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">...</span>
                              </>
                            ) : (
                              <>
                                <MdCheck size={16} />
                                <span className="hidden sm:inline">Terapkan</span>
                                <span className="sm:hidden">OK</span>
                              </>
                            )}
                          </button>
                        </div>
                        {referralMsg && (
                          <p className={`mt-2 text-xs font-medium px-3 py-1.5 rounded-lg ${
                            referralMsg.includes('✅') 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : referralMsg.includes('❌')
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {referralMsg}
                          </p>
                        )}
                      </div>

                      {/* Manual discount removed: discount now handled server-side (referral/membership) */}
                    </div>
                  </>
                )}

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    if (!validateCartStock()) return;
                    setShowPaymentModal(true);
                  }}
                  disabled={cart.length === 0}
                  className={`w-full mt-1 py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all ${
                    cart.length === 0
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl active:scale-95'
                  }`}
                >
                  <MdPayment size={18} /> 
                  <span>Bayar Sekarang</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Payment Modal - Premium Design */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden overflow-y-auto max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MdPayment size={24} />
                Konfirmasi Pembayaran
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-indigo-100 hover:text-white hover:bg-indigo-700 p-2 rounded-xl transition-all"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Total Amount Box */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-5 border-2 border-indigo-300 text-center">
                <p className="text-slate-600 text-sm font-medium mb-2">Total Pembayaran</p>
                <p className="text-4xl font-bold text-indigo-600">{formatCurrency(getCartTotal())}</p>
              </div>


              {/* Metode pembayaran dihilangkan, hanya transfer rekening */}

              {/* Bank account info (Transfer only) */}
              {paymentMethod === 'transfer' && (
                <div className="space-y-3 bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-amber-900">Transfer ke Rekening</p>
                      <p className="text-xs text-amber-700">Mohon transfer sesuai total dan upload bukti</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center justify-between bg-white rounded-xl border border-amber-200 p-2.5">
                      <span className="text-slate-700">Bank</span>
                      <span className="font-semibold text-slate-900">{bankDetails.bankName}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl border border-amber-200 p-2.5">
                      <span className="text-slate-700">No. Rekening</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 font-mono tracking-wide">{bankDetails.accountNumber}</span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await navigator.clipboard?.writeText(bankDetails.accountNumber);
                              setCopiedAcc(true);
                              setTimeout(() => setCopiedAcc(false), 1200);
                            } catch {}
                          }}
                          className="text-xs px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300"
                          title="Salin nomor rekening"
                        >Salin</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-white rounded-xl border border-amber-200 p-2.5">
                      <span className="text-slate-700">Atas Nama</span>
                      <span className="font-semibold text-slate-900">{bankDetails.accountName}</span>
                    </div>
                    {copiedAcc && (
                      <div className="text-center text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg py-1">Nomor rekening disalin</div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload Proof (Transfer only) */}
              {paymentMethod === 'transfer' && (
                <div className="space-y-3 bg-blue-50/50 rounded-2xl p-4 border-2 border-blue-200/60">
                  <label className="text-sm font-bold text-slate-800">Upload Bukti Pembayaran</label>
                  <input id={fileInputId} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={onSelectProofFile} />
                  <div className="flex gap-2">
                    <button
                      onClick={() => document.getElementById(fileInputId)?.click()}
                      className="flex-1 py-2.5 bg-white border-2 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl font-semibold transition-all disabled:opacity-60"
                      type="button"
                    >
                      {selectedProofFile ? 'Ganti File' : 'Pilih File'}
                    </button>
                    <button
                      onClick={() => { setSelectedProofFile(null); setSelectedProofDataUrl(null); }}
                      className="px-3 py-2.5 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200"
                      type="button"
                      disabled={!selectedProofFile}
                    >
                      Hapus
                    </button>
                  </div>
                  {selectedProofFile && (
                    <p className="text-xs text-slate-600">File dipilih: <span className="font-semibold">{selectedProofFile.name}</span></p>
                  )}
                  <p className="text-[11px] text-slate-500">Format: JPG, PNG, atau PDF (maks 5MB). Bukti akan diupload setelah transaksi dibuat.</p>
                </div>
              )}

              {/* Received Amount (Cash only) */}
              {paymentMethod === 'cash' && (
                <div className="space-y-4 bg-green-50/50 rounded-2xl p-5 border-2 border-green-200/50">
                  <label className="text-sm font-bold text-slate-800">Uang Diterima</label>
                  
                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[getCartTotal(), 50000, 100000, 200000].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setReceivedAmount(amount.toString())}
                        className={`py-2 px-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all border-2 ${
                          parseInt(receivedAmount) === amount
                            ? 'bg-green-600 text-white border-green-700 shadow-lg scale-105'
                            : 'bg-white text-green-700 border-green-300 hover:border-green-500 hover:bg-green-50'
                        }`}
                      >
                        {amount === getCartTotal() ? 'Pas' : (amount >= 1000000 
                          ? `${amount / 1000000}jt` 
                          : `${amount / 1000}k`)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Manual Input */}
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    placeholder="Atau ketik jumlah manual"
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:border-green-600 focus:ring-2 focus:ring-green-200 text-lg font-semibold"
                  />
                  
                  {/* Calculation Display */}
                  <div className="space-y-2 pt-3 border-t-2 border-green-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Total:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(getCartTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Diterima:</span>
                      <span className="font-bold text-slate-800">{formatCurrency(parseFloat(receivedAmount) || 0)}</span>
                    </div>
                    <div className={`flex justify-between text-base font-bold p-2 rounded-lg ${
                      getChangeAmount() >= 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <span>Kembalian:</span>
                      <span>{formatCurrency(Math.max(0, getChangeAmount()))}</span>
                    </div>
                    
                    {/* Warning if insufficient */}
                    {receivedAmount && getChangeAmount() < 0 && (
                      <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg border border-red-200">
                        ⚠️ Uang diterima kurang dari total pembayaran!
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t-2 border-slate-200">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 font-bold transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={processPayment}
                  disabled={paying || (paymentMethod === 'cash' && !receivedAmount)}
                  className={`flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:bg-slate-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 ${paying ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  {paying ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <MdCheck size={18} /> Bayar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal - Premium Design */}
      {showReceiptModal && lastTransaction && (
        <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Receipt Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 px-6 py-6 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <MdReceipt className="text-2xl text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Struk Transaksis</h3>
                  <p className="text-indigo-100 text-xs sm:text-sm">Order #{lastTransaction.id}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  if (onClose) onClose();
                }}
                className="text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Receipt Content - Scrollable */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Guest Info */}
              {lastTransaction.guestInfo && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-200/60 space-y-3">
                  <div className="flex items-center gap-2">
                    <MdShoppingCart className="text-blue-600" size={18} />
                    <p className="text-sm font-bold text-blue-900">Informasi Guest</p>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="flex justify-between"><span className="text-blue-700">Nama:</span> <span className="font-semibold text-blue-900">{lastTransaction.guestInfo.nama}</span></p>
                    <p className="flex justify-between"><span className="text-blue-700">WhatsApp:</span> <span className="font-semibold text-blue-900">{lastTransaction.guestInfo.whatsapp}</span></p>
                    <p className="flex justify-between items-start"><span className="text-blue-700">Alamat:</span> <span className="font-semibold text-blue-900 text-right">{lastTransaction.guestInfo.alamat}</span></p>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/50">
                <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <MdShoppingBag size={16} className="text-indigo-600" />
                  Rincian Barang
                </p>
                <div className="space-y-2">
                  {lastTransaction.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg border border-slate-100">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-slate-600 text-xs mt-0.5">{item.quantity}x @ {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-bold text-indigo-600 text-right ml-2">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Section */}
              <div className="space-y-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border-2 border-indigo-200/60">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700">Subtotal:</span>
                  <span className="font-semibold text-slate-800">{formatCurrency(lastTransaction.subtotal)}</span>
                </div>
                {lastTransaction.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-amber-600 font-semibold">
                    <span>Diskon:</span>
                    <span>-{formatCurrency(lastTransaction.discountAmount)}</span>
                  </div>
                )}
                {lastTransaction.shippingCost > 0 && (
                  <div className="flex justify-between text-sm text-blue-600 font-semibold">
                    <span>Ongkir:</span>
                    <span>+{formatCurrency(lastTransaction.shippingCost)}</span>
                  </div>
                )}
                <div className="pt-2 border-t-2 border-indigo-200 flex justify-between text-lg font-bold">
                  <span className="text-slate-800">Total:</span>
                  <span className="text-indigo-600">{formatCurrency(lastTransaction.total)}</span>
                </div>
              </div>

              {/* Shipping Info */}
              {lastTransaction.shippingInfo && (
                <div className="space-y-2 bg-blue-50 rounded-2xl p-4 border border-blue-200 text-sm">
                  <p className="font-bold text-slate-800 flex items-center gap-2">
                    <MdLocalShipping size={16} className="text-blue-600" />
                    Info Pengiriman
                  </p>
                  <div className="pt-2 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Ekspedisi:</span>
                      <span className="font-semibold text-slate-800">
                        {lastTransaction.shippingInfo.courier_name} - {lastTransaction.shippingInfo.service}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Estimasi:</span>
                      <span className="font-semibold text-slate-800">{lastTransaction.shippingInfo.etd} hari</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Biaya:</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(lastTransaction.shippingInfo.cost)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Details */}
              <div className="space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-200/50 text-sm">
                <p className="font-bold text-slate-800 flex items-center gap-2">
                  <MdPayment size={16} className="text-purple-600" />
                  Detail Pembayaran
                </p>
                <div className="pt-2 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Metode:</span>
                    <span className="font-semibold text-slate-800 capitalize">{lastTransaction.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Diterima:</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(lastTransaction.receivedAmount)}</span>
                  </div>
                  {lastTransaction.change > 0 && (
                    <div className="flex justify-between pt-1 border-t border-slate-200">
                      <span className="text-green-700 font-semibold">Kembalian:</span>
                      <span className="font-bold text-green-600">{formatCurrency(lastTransaction.change)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Info */}
              <div className="text-center space-y-2 pt-4 border-t-2 border-slate-200 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Terima kasih telah berbelanja! 🙏</p>
                <p className="font-bold text-indigo-600">LYVIA NUSA BOGA</p>
                <p>{format(new Date(lastTransaction.date), 'dd MMMM yyyy • HH:mm', { locale: id })}</p>
                <p className="text-slate-500 text-xs">Toko Olahan Ikan Cakalang</p>
                <p className="text-amber-600 font-semibold mt-2">Status: Menunggu konfirmasi admin.</p>
              </div>
            </div>

            {/* Close Button - Sticky */}
            <div className="sticky bottom-0 bg-white border-t-2 border-slate-200 p-4 flex-shrink-0">
              <div className="flex gap-3">
                {/* Tombol download struk & bukti bayar dihapus sesuai permintaan */}
                <button
                  onClick={() => {
                    setShowReceiptModal(false);
                    if (onClose) onClose();
                  }}
                  className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  ✓ Selesai & Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSMenu;
