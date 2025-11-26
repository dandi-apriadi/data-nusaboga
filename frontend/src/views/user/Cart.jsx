import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Card from "components/card";
import Receipt from "components/Receipt";
import { 
  MdDelete, 
  MdAdd, 
  MdRemove, 
  MdShoppingCart, 
  MdArrowForward,
  MdArrowBack,
  MdShoppingBag,
  MdLocalShipping,
  MdSecurity,
  MdDiscount,
  MdVerified,
  MdStore,
  MdLocationOn, 
  MdEdit, 
  MdPayment, 
  MdCheckCircle,
  MdInfo,
  MdSchedule,
  MdPhone,
  MdEmail,
  MdClose,
  MdPrint,
  MdUpload, 
  MdCheck, 
  MdError,
  MdCloudUpload,
  MdDescription,
  MdReceipt,
  MdCamera,
  MdExpandMore,
  MdExpandLess
} from "react-icons/md";
import { fetchCart, updateCartItem, removeCartItem } from "../../store/slices/cartSlice";
import { fetchAddresses } from "../../store/slices/addressSlice";
import { getProvinces, getCities, calculateShippingCost } from "../../api/shipping";
import api from "../../api/axios"; // for fetching payment methods
import buildImageUrl from "../../utils/image";
import { placeOrder } from "../../store/slices/orderCreateSlice";
import { validateReferral, clearReferral } from "../../store/slices/referralSlice";
import { uploadPaymentProof } from "../../store/slices/paymentProofSlice";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// NOTE: Payment methods will be fetched from API
const PAYMENT_METHODS = [
  { id: "bank_transfer", name: "Transfer Bank", description: "BCA, Mandiri, BNI, BRI", fee: 0, processingTime: "Instan setelah konfirmasi", icon: "🏦", popular: true },
  { id: "cod", name: "Bayar di Tempat (COD)", description: "Bayar tunai saat barang tiba", fee: 0, processingTime: "Langsung", icon: "💰", popular: false },
  { id: "ewallet", name: "E-Wallet & QRIS", description: "GoPay, OVO, Dana", fee: 0, processingTime: "Instan", icon: "📱", popular: false }
];

const Cart = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const { items: cartItems, loading: cartLoading, cart } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const { items: addresses, loading: addressLoading } = useSelector(s => s.addresses || { items: [] });
  const referralState = useSelector(s => s.referral);
  const orderCreate = useSelector(s => s.orderCreate || {});
  const paymentProofState = useSelector(s => s.paymentProof || {});

  const [currentStep, setCurrentStep] = useState(() => orderId ? 3 : 1);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [paymentMethods, setPaymentMethods] = useState([]); // fetched from backend
  const [notes, setNotes] = useState("");
  const [referralInput, setReferralInput] = useState("");
  const [orderData, setOrderData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [codDone, setCodDone] = useState(false); // COD bypass flag
  const [orderError, setOrderError] = useState(null); // Detailed order creation error
  
  // Manual address input states
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState({
    receiver_name: '',
    phone: '',
    address_detail: '',
    postal_code: '',
    label: 'Alamat Baru'
  });
  
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

  const fetchedCartRef = useRef(false);
  const fetchedAddressRef = useRef(false);

  // Filter items to only those owned by current user (defensive client-side)
  const userCartItems = useMemo(() => {
    // Backend cart items do not contain user ownership; ownership is at cart level.
    // If logged in user matches cart.user_id (or cart.user_id is null meaning guest), then display all items.
    if (!cartItems) return [];
    if (!user) return cartItems; // allow guest cart usage
    const uid = user.user_id || user.id;
    if (!uid) return cartItems;
    if (cart && cart.user_id && String(cart.user_id) !== String(uid)) {
      // Different user's cart (shouldn't happen) => hide items for safety
      return [];
    }
    return cartItems;
  }, [cartItems, user, cart]);

  // Fetch cart & addresses
  useEffect(() => {
    if (!fetchedCartRef.current && !cartLoading) { fetchedCartRef.current = true; dispatch(fetchCart()); }
  }, [dispatch, cartLoading]);
  useEffect(() => { if (!fetchedAddressRef.current) { fetchedAddressRef.current = true; dispatch(fetchAddresses()); } }, [dispatch]);
  
  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const result = await getProvinces();
        if (result.success) {
          setProvinces(result.data || []);
        }
      } catch (error) {
        console.error('[Cart] Error loading provinces:', error);
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
        console.error('[Cart] Error loading cities:', error);
      }
    };
    loadCities();
  }, [selectedProvince]);

  // Calculate shipping when city changes
  useEffect(() => {
    const calcShipping = async () => {
      if (!selectedCity || userCartItems.length === 0) {
        setShippingOptions([]);
        setSelectedShipping(null);
        setShippingCost(0);
        return;
      }

      setLoadingShipping(true);
      try {
        // Calculate total weight from cart items (assume 500g per item if no weight specified)
        const totalWeight = userCartItems.reduce((sum, item) => {
          const p = normalizeProduct(item);
          const itemWeight = p.weight_grams || 500; // gram
          return sum + (itemWeight * item.quantity);
        }, 0);

        const result = await calculateShippingCost({
          origin: 330, // Manado city ID
          destination: selectedCity,
          destination_province_id: selectedProvince,
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
        console.error('[Cart] Error calculating shipping:', error);
        setShippingOptions([]);
      } finally {
        setLoadingShipping(false);
      }
    };

    calcShipping();
  }, [selectedCity, userCartItems]);
  
  // Fetch active payment methods once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/payments/methods');
        if (mounted) setPaymentMethods(data || []);
      } catch(e){ console.warn('[Cart] Gagal mengambil metode pembayaran', e.response?.data || e.message); }
    })();
    return () => { mounted = false; };
  }, []);
  useEffect(() => { if (addresses && addresses.length && selectedAddress == null) { setSelectedAddress(addresses.find(a => a.is_default) ?.address_id || addresses[0].address_id); } }, [addresses, selectedAddress]);

  // Load existing order (payment upload step via URL) - minimal fetch using existing endpoint
  useEffect(() => { if (orderId && currentStep === 3 && !orderData) { /* Could fetch order detail via orderSlice if needed */ } }, [orderId, currentStep, orderData]);

  const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (date) => format(new Date(date), "dd MMMM yyyy HH:mm", { locale: id });

  // Build full image URL from possibly relative path (centralized helper)

  const PLACEHOLDER_IMG = '/placeholder-product.png'; // optionally place a file in public folder

  // Derived totals
  // Helper to normalize product object (handle various possible keys from API / legacy)
  const normalizeProduct = (it) => {
    const raw = it.Product || it.product || it.product_data || {};
    const num = (v, d = 0) => {
      const n = Number(v);
      return isNaN(n) ? d : n;
    };
    const weightCandidate = raw.weight_grams ?? raw.weight ?? raw.berat_gram;
    return {
      id: raw.product_id || it.product_id,
      name: raw.name || raw.title || raw.product_name || null,
      description: raw.description || raw.desc || null,
      price: num(it.price_at_add ?? raw.price ?? raw.unit_price ?? 0, 0),
      original_price: raw.original_price != null ? num(raw.original_price, null) : null,
      weight_grams: weightCandidate != null ? num(weightCandidate, null) : null,
      image_url: raw.image_url || raw.image || raw.thumbnail || null,
      stock: raw.stock != null ? num(raw.stock, null) : (raw.stok != null ? num(raw.stok, null) : null),
      rating_avg: num(raw.rating_avg ?? raw.rating ?? 0, 0),
      reviews_count: num(raw.reviews_count ?? raw.review_count ?? 0, 0),
      category_id: raw.category_id || null
    };
  };

  const getSubtotal = () => userCartItems.reduce((t, it) => {
    const p = normalizeProduct(it);
    return t + (p.price * it.quantity);
  }, 0);
  const getTotalItems = () => userCartItems.reduce((t, it)=> t + it.quantity, 0);
  const getTotalWeight = () => userCartItems.reduce((t,it)=> {
    const p = normalizeProduct(it);
    return t + ((p.weight_grams || 0) * it.quantity);
  }, 0);
  // Use dynamic shipping cost from API instead of static options
  const selectedShippingCost = shippingCost || 0;
  // Frontend will no longer apply referral discounts locally. The server
  // will compute and apply referral/membership discounts during checkout.
  const referralDiscount = 0;
  const total = Math.max(0, getSubtotal() + selectedShippingCost);

  // Cart item quantity update
  const updateQuantity = (cart_item_id, newQty) => {
    const owned = userCartItems.find(i => i.cart_item_id === cart_item_id);
    if (!owned) return; // ignore non-owned items silently
    if (newQty <= 0) { dispatch(removeCartItem(cart_item_id)); return; }
    dispatch(updateCartItem({ cart_item_id, quantity: newQty }));
  };
  const removeFromCart = (cart_item_id) => {
    const owned = userCartItems.find(i => i.cart_item_id === cart_item_id);
    if (!owned) return;
    dispatch(removeCartItem(cart_item_id));
  };
  const clearCart = () => { userCartItems.forEach(it => dispatch(removeCartItem(it.cart_item_id))); };

  // Step transitions
  const goToCheckout = () => { if (!userCartItems.length) { alert('Keranjang kosong'); return; } setCurrentStep(2); };
  const goBackToCart = () => setCurrentStep(1);
  const goToPaymentUpload = (createdOrder, isCOD = false) => {
    setOrderData(createdOrder);
    if (isCOD) {
      // COD: no upload needed, mark as done and stay at step 3 but show COD success UI
      setCodDone(true);
      setCurrentStep(3);
    } else {
      setCodDone(false);
      setCurrentStep(3);
    }
  };

  // Place order
  const handlePlaceOrder = async () => {
    // Basic front-end validations
    if (!userCartItems.length) { alert('Keranjang kosong'); return; }
    
    // Validasi alamat
    if (useManualAddress) {
      // Validasi manual address
      if (!manualAddress.receiver_name || !manualAddress.phone || !manualAddress.address_detail) {
        alert('Silakan lengkapi data alamat (nama penerima, telepon, dan detail alamat)');
        return;
      }
      // Validasi provinsi dan kota dari API selection
      if (!selectedProvince || !selectedCity) {
        alert('Silakan pilih Provinsi dan Kota/Kabupaten di bagian Pengiriman');
        return;
      }
    } else {
      // Validasi selected address
      if (!selectedAddress) { 
        alert('Silakan pilih alamat atau gunakan input manual'); 
        return; 
      }
    }
    
    if (!paymentMethod) { alert('Pilih metode pembayaran'); return; }
    if (!selectedShipping) { alert('Silakan pilih metode pengiriman'); return; }

    const itemsPayload = userCartItems.map(it => ({
      product_id: it.product_id || it.Product?.product_id || it.Product?.product_id,
      quantity: it.quantity,
      price_unit: (it.price_at_add || it.Product?.price || 0)
    })).filter(i => i.product_id);

    if (!itemsPayload.length) { alert('Produk tidak valid di keranjang'); return; }

    // Resolve payment_method_id (backend uses UUID)
    const selectedPayment = paymentMethods.find(pm => pm.code === paymentMethod || pm.payment_method_id === paymentMethod);
    const payload = {
      channel: 'online',
      items: itemsPayload,
      subtotal: getSubtotal(),
      discount_amount: 0,
      shipping_cost: selectedShippingCost || 0,
      total, // backend akan validasi ulang
      customer_note: notes || null,
      referral_code: referralState.info?.code || null,
      payment_method_id: selectedPayment ? selectedPayment.payment_method_id : null,
      // Shipping info from API
      courier_name: selectedShipping?.courier_name || null,
      shipping_service: selectedShipping?.service || null,
      shipping_service_name: selectedShipping?.description || null,
      shipping_etd: selectedShipping?.etd || null,
      shipping_info: selectedShipping ? {
        courier: selectedShipping.courier_code,
        service: selectedShipping.service,
        cost: selectedShipping.cost,
        etd: selectedShipping.etd,
        destination_city_id: selectedCity,
        destination_province_id: selectedProvince,
        requires_confirmation: selectedShipping.requires_confirmation || false,
        note: selectedShipping.note || null
      } : null,
    };

    // Handle address - either existing or manual
    if (useManualAddress) {
      // Get province and city names from API selection
      const selectedProvinceObj = provinces.find(p => p.id === selectedProvince);
      const selectedCityObj = cities.find(c => c.id === selectedCity);
      
      payload.manual_address = {
        ...manualAddress,
        province: selectedProvinceObj?.name || '',
        city: selectedCityObj?.name || '',
        district: '' // Opsional, bisa diisi manual di address_detail
      };
    } else {
      payload.address_id = selectedAddress;
    }

    if (!payload.payment_method_id) {
      alert('Metode pembayaran tidak valid / belum dipilih');
      return;
    }

    // Debug log (bisa dihapus di produksi)
    console.debug('[Order][SubmitPayload]', payload);
    const action = await dispatch(placeOrder(payload));
    if (placeOrder.fulfilled.match(action)) {
      // Build local orderData minimal for payment step
  const created = { id: action.payload.order_id, order_number: action.payload.order_number, date: new Date(), items: userCartItems.map(it => ({ id: it.cart_item_id, name: it.Product?.name, price: it.price_at_add || it.Product?.price, quantity: it.quantity, image: it.Product?.image_url })), subtotal: payload.subtotal, discount: 0, discountAmount: 0, total, status: action.payload.status, paymentMethod: paymentMethod.toUpperCase(), bankDetails: { bankName: 'Bank BCA', accountNumber: '0262768897', accountName: 'CV. Lyvia Nusa Boga' }, customerInfo: { name: user?.name || user?.fullname || 'Customer', email: user?.email, phone: user?.phone }, referralCode: referralState.info?.code || null };
      const isCOD = paymentMethod === 'cod';
      goToPaymentUpload(created, isCOD);
    } else {
      // Enhanced error display with full details
      const errorData = action.payload || action.error || {};
      console.error('[Order][Error] Full Response:', errorData);
      
      // Store error data for modal display
      setOrderError({
        msg: errorData.msg || 'Gagal membuat pesanan',
        error: errorData.error,
        message: errorData.message,
        errors: errorData.errors,
        code: errorData.code,
        fullData: errorData
      });
      
      // Also show alert for immediate feedback
      let errorMessage = '❌ GAGAL MEMBUAT PESANAN\n\n';
      
      if (errorData.msg) {
        errorMessage += `Pesan: ${errorData.msg}\n`;
      }
      
      if (errorData.error) {
        errorMessage += `Detail: ${errorData.error}\n`;
      }
      
      if (errorData.message) {
        errorMessage += `Info: ${errorData.message}\n`;
      }
      
      // Add additional error details if available
      if (errorData.errors && Array.isArray(errorData.errors)) {
        errorMessage += '\nKesalahan:\n';
        errorData.errors.forEach((err, idx) => {
          errorMessage += `${idx + 1}. ${err}\n`;
        });
      }
      
      // Add technical details for debugging
      if (errorData.code) {
        errorMessage += `\nKode Error: ${errorData.code}`;
      }
      
      // Fallback message
      if (!errorData.msg && !errorData.error && !errorData.message) {
        errorMessage += 'Terjadi kesalahan yang tidak diketahui.\nSilakan coba lagi atau hubungi admin.';
      }
      
      alert(errorMessage);
    }
  };

  // Referral apply
  const applyReferral = () => { if (!referralInput) return; dispatch(validateReferral(referralInput)); };
  const resetReferral = () => { dispatch(clearReferral()); setReferralInput(''); };

  // File upload handling (convert to base64 for simple backend consumption)
  const handleFileSelect = (file) => {
    const allowed = ['image/jpeg','image/jpg','image/png','image/webp'];
    if (!allowed.includes(file.type)) { setError('Format file tidak didukung'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Ukuran file maksimal 5MB'); return; }
    setError(''); setSelectedFile(file);
    const reader = new FileReader(); reader.onload = e => setPreviewUrl(e.target.result); reader.readAsDataURL(file);
  };
  const handleFileChange = (e) => { const f = e.target.files[0]; if (f) handleFileSelect(f); };
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setDragOver(false); };
  const removeFile = () => { setSelectedFile(null); setPreviewUrl(null); setError(''); };

  const handleUpload = async () => {
    if (!selectedFile || !orderData) { setError('Pilih file dan pastikan order tersedia'); return; }
    setUploading(true); setError('');
    try {
      const action = await dispatch(uploadPaymentProof({ order_id: orderData.id, file_url: previewUrl, mime_type: selectedFile.type, file_size: selectedFile.size }));
      if (uploadPaymentProof.fulfilled.match(action)) {
        // Optimistic: mark success UI and prefetch proofs so Orders page immediately shows Download button
        setUploadSuccess(true);
        // Attempt lightweight fetch of just this order's proofs (silently ignore errors)
        try {
          // Lazy import thunk to avoid circular import top (already imported uploadPaymentProof) - we can reuse same slice if available globally
          const { fetchMyPaymentProofs } = await import('../../store/slices/paymentProofSlice');
          // Dispatch to hydrate byOrder cache
          dispatch(fetchMyPaymentProofs({ order_id: orderData.id }));
        } catch(e) { console.debug('[PaymentProof][PrefetchAfterUpload] gagal memuat ulang:', e.message); }
        setTimeout(()=> navigate('/user/orders'), 1200);
      }
      else setError(action.payload?.msg || 'Gagal upload');
    } finally { setUploading(false); }
  };

  const printReceipt = () => { if (!orderData) return; try { const receipt = Receipt({ orderData, type: 'payment' }); receipt.printReceipt(); } catch(e){ console.error(e); } };
  const handleContinueShopping = () => navigate('/user/products');

  // UI render helpers kept minimal; due to length, skip rest of previous large UI sections replaced with shorter functional version or reuse existing markup (omitted for brevity in edit diff context)
  // ...existing code for step indicators & UI retained below unchanged...

  // BEGIN RENDER (reuse original step rendering but referencing new variables)
  // ...existing code...

  // We'll reuse original large UI; for patch brevity not re-listed; ensure handlers refer to updated functions.

  return (
    <div className="p-4">
      {/* Simplified placeholder while full redesign integration ongoing */}
      {currentStep === 1 && (
        <div>
          <h1 className="text-2xl font-bold mb-4 flex items-center"><MdShoppingCart className="mr-2"/>Keranjang</h1>
          {cartLoading && <p>Memuat keranjang...</p>}
          {!cartLoading && !userCartItems.length && <p>Keranjang kosong</p>}
          <div className="space-y-4">
            {userCartItems.map(it => {
              const p = normalizeProduct(it);
              const displayName = p.name || `Produk #${p.id || 'Tidak Diketahui'}`;
              return (
              <Card key={it.cart_item_id} extra="p-4">
                <div className="flex items-start gap-4">
                  {/* Product Image */}
                  <div className="flex-shrink-0">
                    {p.image_url ? (
                      <img 
                        src={buildImageUrl(p.image_url) || ''} 
                        alt={displayName} 
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 shadow-sm"
                        crossOrigin="anonymous"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    {/* Fallback when no image or image fails to load */}
                    <div 
                      className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center shadow-sm"
                      style={{ display: p.image_url ? 'none' : 'flex' }}
                    >
                      <MdShoppingBag className="text-gray-400 text-2xl" />
                    </div>
                  </div>
                  
                  {/* Product Info and Controls */}
                  <div className="flex-1 flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      {/* Product Name & Basic Info */}
                      <div className="mb-2">
                        <h3 className="font-semibold text-gray-900 mb-1 leading-tight">
                          {displayName}
                        </h3>
                        {p.description && (
                          <p className="text-xs text-gray-600 mb-1" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {p.description.length > 100 
                              ? `${p.description.substring(0, 100)}...` 
                              : p.description}
                          </p>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="space-y-1 mb-3">
                        {/* Price Information */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatCurrency(p.price)}
                          </span>
                          {p.original_price && p.original_price > p.price && (
                            <span className="text-xs text-gray-500 line-through">
                              {formatCurrency(p.original_price)}
                            </span>
                          )}
                          <span className="text-xs text-gray-500">per unit</span>
                        </div>

                        {/* Additional Product Info */}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {p.weight_grams && (
                            <span className="flex items-center gap-1">
                              <span>⚖️</span>
                              {p.weight_grams}g
                            </span>
                          )}
                          {p.stock !== null && p.stock !== undefined && (
                            <span className={`flex items-center gap-1 ${p.stock < 10 ? 'text-orange-600' : 'text-green-600'}`}>
                              <span>📦</span>
                              Stok: {p.stock}
                            </span>
                          )}
                          {(() => {
                            const r = Number(p.rating_avg);
                            return r > 0 ? (
                              <span className="flex items-center gap-1">
                                <span>⭐</span>
                                {r.toFixed(1)} ({p.reviews_count || 0})
                              </span>
                            ) : null;
                          })()}
                        </div>

                        {/* Quantity and Subtotal */}
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <span className="text-sm text-gray-600">
                            Kuantitas: <span className="font-medium">{it.quantity}</span>
                          </span>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-indigo-600">
                              {formatCurrency(p.price * it.quantity)}
                            </div>
                            <div className="text-xs text-gray-500">
                              ({formatCurrency(p.price)} × {it.quantity})
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Quantity Controls - Compact Version */}
                    <div className="flex flex-col items-end gap-2">
                      {/* Quantity Adjuster */}
                      <div className="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm">
                        <button 
                          onClick={()=> updateQuantity(it.cart_item_id, it.quantity - 1)} 
                          disabled={it.quantity<=1} 
                          className="px-2 py-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 transition-colors"
                          title="Kurangi kuantitas"
                        >
                          <MdRemove size={14}/>
                        </button>
                        <span className="px-3 py-1 border-x bg-gray-50 min-w-[2.5rem] text-center font-medium text-sm">
                          {it.quantity}
                        </span>
                        <button 
                          onClick={()=> updateQuantity(it.cart_item_id, it.quantity + 1)} 
                          className="px-2 py-1 hover:bg-gray-50 text-gray-600 transition-colors"
                          title="Tambah kuantitas"
                        >
                          <MdAdd size={14}/>
                        </button>
                      </div>
                      
                      {/* Remove Button */}
                      <button 
                        onClick={()=> removeFromCart(it.cart_item_id)} 
                        className="text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus dari keranjang"
                      >
                        <MdDelete size={16}/>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );})}
          </div>
          {userCartItems.length>0 && (
            <div className="mt-6">
              {/* Cart Summary */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MdReceipt className="mr-2 text-indigo-600" />
                  Ringkasan Belanja
                </h3>
                
                {/* Items Count */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    Total Item ({getTotalItems()} produk)
                  </span>
                  <span className="font-medium">
                    {userCartItems.length} jenis produk
                  </span>
                </div>
                
                {/* Weight */}
                {getTotalWeight() > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Berat</span>
                    <span className="font-medium">{(getTotalWeight() / 1000).toFixed(2)} kg</span>
                  </div>
                )}
                
                {/* Subtotal */}
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(getSubtotal())}</span>
                </div>
                
                {/* Shipping */}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkir (perkiraan)</span>
                  <span className="font-medium">{formatCurrency(selectedShippingCost)}</span>
                </div>
                
                {/* Total */}
                <div className="flex justify-between text-lg font-bold border-t pt-2 text-indigo-600">
                  <span>Total Pembayaran</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 space-y-3">
                <button 
                  onClick={goToCheckout} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <MdArrowForward className="mr-2" />
                  Lanjut Checkout
                </button>
                <button 
                  onClick={handleContinueShopping} 
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  <MdStore className="mr-2" />
                  Belanja Lagi
                </button>
                <button 
                  onClick={clearCart} 
                  className="w-full text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <MdDelete className="mr-2" />
                  Kosongkan Keranjang
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {currentStep === 2 && (
        <div>
          <button onClick={goBackToCart} className="mb-4 flex items-center text-sm text-indigo-600"><MdArrowBack className="mr-1"/>Kembali</button>
          <h2 className="text-xl font-semibold mb-4">Checkout</h2>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center"><MdLocationOn className="mr-1"/>Alamat Pengiriman</h3>
              <button
                type="button"
                onClick={() => {
                  setUseManualAddress(!useManualAddress);
                  if (!useManualAddress) {
                    setSelectedAddress(null);
                  }
                }}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                {useManualAddress ? '📍 Pilih dari Alamat Tersimpan' : '✏️ Input Alamat Manual'}
              </button>
            </div>

            {!useManualAddress ? (
              <>
                {addressLoading && <p className="text-sm text-slate-500">Memuat alamat...</p>}
                {!addressLoading && (!addresses || !addresses.length) && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                    <p className="font-medium mb-1">Belum ada alamat tersimpan</p>
                    <p className="text-xs">Klik "Input Alamat Manual" untuk menggunakan alamat baru</p>
                  </div>
                )}
                <div className="space-y-2">
                  {addresses && addresses.map(a => (
                    <label key={a.address_id} className={`block p-3 border-2 rounded-xl cursor-pointer transition-all ${selectedAddress===a.address_id? 'border-indigo-600 bg-indigo-50 shadow-md':'border-slate-200 hover:border-indigo-300'}`}> 
                      <input type="radio" name="address" className="mr-2" checked={selectedAddress===a.address_id} onChange={()=> setSelectedAddress(a.address_id)} />
                      <span className="font-semibold text-slate-800">{a.label || 'Alamat'}:</span>
                      <span className="text-sm text-slate-600 ml-2">{a.address_detail || a.detail}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 space-y-3 border-2 border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Nama Penerima *</label>
                    <input
                      type="text"
                      value={manualAddress.receiver_name}
                      onChange={(e) => setManualAddress({...manualAddress, receiver_name: e.target.value})}
                      placeholder="Nama lengkap penerima"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Nomor Telepon *</label>
                    <input
                      type="tel"
                      value={manualAddress.phone}
                      onChange={(e) => setManualAddress({...manualAddress, phone: e.target.value})}
                      placeholder="08xxxxxxxxxx"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1 block">Alamat Lengkap *</label>
                  <textarea
                    value={manualAddress.address_detail}
                    onChange={(e) => setManualAddress({...manualAddress, address_detail: e.target.value})}
                    placeholder="Jalan, nomor rumah, RT/RW, kecamatan, nama gedung, dll"
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Kode Pos</label>
                    <input
                      type="text"
                      value={manualAddress.postal_code}
                      onChange={(e) => setManualAddress({...manualAddress, postal_code: e.target.value})}
                      placeholder="12345"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Label Alamat</label>
                    <input
                      type="text"
                      value={manualAddress.label}
                      onChange={(e) => setManualAddress({...manualAddress, label: e.target.value})}
                      placeholder="Contoh: Rumah, Kantor, Kos"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-500">
                  * Wajib diisi. Provinsi & kota akan diambil dari pilihan pengiriman di bawah
                </div>
              </div>
            )}
          </div>
          <div className="mb-6">
            <h3 className="font-medium mb-2 flex items-center"><MdPayment className="mr-1"/>Metode Pembayaran</h3>
            <div className="space-y-2">
                  {paymentMethods.length === 0 && <p className="text-xs text-slate-500">Memuat / belum ada metode pembayaran aktif.</p>}
                  {paymentMethods.map(pm => (
                    <label key={pm.payment_method_id} className={`block p-3 border rounded cursor-pointer ${paymentMethod===pm.code? 'border-indigo-600 bg-indigo-50':'border-slate-200'}`}>
                      <input type="radio" name="payment" className="mr-2" checked={paymentMethod===pm.code} onChange={()=> setPaymentMethod(pm.code)} />
                      {pm.name} {pm.description && <span className="text-xs text-slate-500 ml-2">{pm.description}</span>}
                    </label>
                  ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-medium mb-2 flex items-center"><MdLocalShipping className="mr-1"/>Pengiriman</h3>
            
            {/* Province Selector */}
            <div className="mb-3">
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
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
              >
                <option value="">-- Pilih Provinsi --</option>
                {provinces.map(prov => (
                  <option key={prov.id} value={prov.id}>
                    {prov.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Selector */}
            {selectedProvince && (
              <div className="mb-3">
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Kota/Kabupaten</label>
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                  }}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm"
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
                  <label className="text-xs font-semibold text-slate-700">
                    {loadingShipping ? 'Menghitung ongkir...' : 'Pilih Layanan Pengiriman'}
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
                  <div className="text-center py-6 bg-slate-50 rounded-xl">
                    <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-600 mt-3 font-medium">Mencari layanan pengiriman terbaik...</p>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {/* Group options by courier */}
                    {(() => {
                      const grouped = shippingOptions.reduce((acc, option) => {
                        const courier = option.courier_code;
                        if (!acc[courier]) acc[courier] = [];
                        acc[courier].push(option);
                        return acc;
                      }, {});

                      const sortedCouriers = Object.keys(grouped).sort((a, b) => {
                        const minA = Math.min(...grouped[a].map(o => o.cost));
                        const minB = Math.min(...grouped[b].map(o => o.cost));
                        return minA - minB;
                      });

                      return sortedCouriers.map((courierCode, groupIdx) => {
                        const courierOptions = grouped[courierCode];
                        const courierName = courierOptions[0].courier_name;
                        const isExpanded = expandedCouriers[courierCode];
                        
                        const toggleCourier = () => {
                          setExpandedCouriers(prev => ({
                            ...prev,
                            [courierCode]: !prev[courierCode]
                          }));
                        };
                        
                        const cheapestOption = courierOptions.reduce((min, opt) => 
                          opt.cost < min.cost ? opt : min
                        , courierOptions[0]);
                        
                        return (
                          <div key={courierCode} className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
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
                            
                            {isExpanded && (
                              <div className="p-2 space-y-1.5">
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
                                      className={`w-full text-left p-3 rounded-lg border-2 transition-all relative ${
                                        isSelected
                                          ? 'border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md'
                                          : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'
                                      }`}
                                    >
                                      <div className="flex justify-between items-start mb-1">
                                        <div className="flex-1">
                                          <div className="font-bold text-sm text-slate-800">{option.service}</div>
                                          <div className="text-xs text-slate-600">{option.description}</div>
                                        </div>
                                        <div className="text-right ml-2">
                                          <div className="font-bold text-sm text-indigo-600">{formatCurrency(option.cost)}</div>
                                          <div className="text-[10px] text-slate-500">ETD: {option.etd} hari</div>
                                        </div>
                                      </div>
                                      
                                      {(isCheapest || isFastest) && (
                                        <div className="flex gap-1 mt-2">
                                          {isCheapest && (
                                            <span className="text-[9px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                              💰 TERMURAH
                                            </span>
                                          )}
                                          {isFastest && (
                                            <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                                              ⚡ KILAT
                                            </span>
                                          )}
                                        </div>
                                      )}
                                      
                                      {option.requires_confirmation && (
                                        <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                          ⚠️ Perlu konfirmasi ketersediaan
                                        </div>
                                      )}
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
                  <div className="text-center py-4 bg-slate-50 rounded-xl">
                    <p className="text-sm text-slate-500">Tidak ada layanan pengiriman tersedia</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mb-6">
            <h3 className="font-medium mb-2 flex items-center"><MdDiscount className="mr-1"/>Kode Referal</h3>
            {referralState.info ? (
              <div className="p-3 border rounded bg-green-50 flex justify-between items-center">
                <div>
                  <div className="font-medium">{referralState.info.code}</div>
                  <div className="text-xs text-green-700 ml-1">Kode valid — diskon akan diterapkan saat checkout</div>
                </div>
                <button onClick={resetReferral} className="text-red-600 text-sm">Hapus</button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <input value={referralInput} onChange={e=> setReferralInput(e.target.value)} placeholder="Masukkan kode" className="flex-1 border rounded px-3 py-2 text-sm" />
                <button onClick={applyReferral} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">Apply</button>
              </div>
            )}
            {referralState.error && <p className="text-xs text-red-600 mt-1">{referralState.error.msg || referralState.error.message}</p>}
          </div>
          <div className="mb-6">
            <h3 className="font-medium mb-2 flex items-center"><MdDescription className="mr-1"/>Catatan</h3>
            <textarea className="w-full border rounded px-3 py-2 text-sm" rows={3} value={notes} onChange={e=> setNotes(e.target.value)} />
          </div>
          <div className="p-4 border rounded mb-6 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(getSubtotal())}</span></div>
            {referralState.info && <div className="flex justify-between text-green-600"><span>Diskon:</span><span className="font-medium">Akan diterapkan saat checkout</span></div>}
            <div className="flex justify-between"><span>Ongkir</span><span>{formatCurrency(selectedShippingCost)}</span></div>
            <div className="flex justify-between font-semibold"><span>Total</span><span>{formatCurrency(total)}</span></div>
          </div>
          <button disabled={orderCreate.loading} onClick={handlePlaceOrder} className="w-full bg-indigo-600 text-white py-3 rounded flex items-center justify-center">
            {orderCreate.loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>}
            Buat Pesanan
          </button>
        </div>
      )}
      {currentStep === 3 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center"><MdUpload className="mr-2"/>Upload Bukti Pembayaran</h2>
          {!orderData && <p>Memuat data pesanan...</p>}
          {/* COD success state (no upload required) */}
          {orderData && codDone && (
            <div className="text-center p-8 border rounded bg-green-50 space-y-4">
              <MdCheckCircle className="mx-auto mb-4 text-green-600" size={48} />
              <p className="font-medium text-lg">Pesanan COD berhasil dibuat!</p>
              <p className="text-sm text-slate-600">Silakan siapkan pembayaran tunai saat pesanan dikirim.</p>
              <div className="text-sm border rounded p-4 bg-white text-left inline-block">
                <div className="font-semibold mb-2">Ringkasan</div>
                <div className="flex justify-between"><span>No. Order</span><span>{orderData.order_number || orderData.id}</span></div>
                <div className="flex justify-between"><span>Total</span><span>{formatCurrency(orderData.total)}</span></div>
                <div className="flex justify-between"><span>Status</span><span className="text-indigo-600">{orderData.status}</span></div>
              </div>
              <div className="space-x-2">
                <button onClick={printReceipt} className="px-4 py-2 bg-slate-200 rounded text-sm">Cetak Struk</button>
                <button onClick={()=> navigate('/user/orders')} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">Lihat Pesanan</button>
              </div>
            </div>
          )}
          {orderData && !uploadSuccess && !codDone && (
            <div className="space-y-6">
              <div className="p-4 border rounded">
                <div className="font-medium mb-2">Order #{orderData.order_number || orderData.id}</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between"><span>Tanggal</span><span>{formatDate(orderData.date)}</span></div>
                  <div className="flex justify-between"><span>Total</span><span>{formatCurrency(orderData.total)}</span></div>
                </div>
              </div>
              {error && <div className="p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">{error}</div>}
              <div onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave} className={`relative border-2 border-dashed rounded p-6 text-center ${dragOver? 'border-indigo-400 bg-indigo-50': selectedFile? 'border-green-400 bg-green-50':'border-slate-300'}`}>
                {selectedFile ? (
                  <div className="space-y-2">
                    {previewUrl && <img src={previewUrl} alt="preview" className="mx-auto max-h-48 rounded" />}
                    <div className="text-xs">{selectedFile.name} ({(selectedFile.size/1024/1024).toFixed(2)} MB)</div>
                    <button onClick={removeFile} className="text-red-600 text-xs">Hapus</button>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600">
                    <MdCamera className="mx-auto mb-2 text-slate-400" size={40} />
                    <p>Drag & drop atau klik untuk memilih file (JPG/PNG/WebP &lt;5MB)</p>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Keterangan (opsional)</label>
                <textarea rows={3} value={description} onChange={e=> setDescription(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <button disabled={!selectedFile || uploading} onClick={handleUpload} className="w-full bg-indigo-600 text-white py-3 rounded flex items-center justify-center">
                {uploading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"/>}
                Upload Bukti Pembayaran
              </button>
              <button onClick={()=> setCurrentStep(2)} className="w-full border py-2 rounded text-sm">Kembali ke Checkout</button>
            </div>
          )}
          {uploadSuccess && (
            <div className="text-center p-8 border rounded bg-green-50">
              <MdCheckCircle className="mx-auto mb-4 text-green-600" size={48} />
              <p className="font-medium mb-2">Bukti pembayaran berhasil diunggah!</p>
              <button onClick={printReceipt} className="px-4 py-2 bg-slate-200 rounded mr-2 text-sm">Cetak Struk</button>
              <button onClick={()=> navigate('/user/orders')} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm">Lihat Pesanan</button>
            </div>
          )}
        </div>
      )}

      {/* Error Modal */}
      {orderError && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto">
            {/* Header */}
            <div className="bg-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <MdError size={32} />
                  <div>
                    <h3 className="text-xl font-bold">Pesanan Gagal Dibuat</h3>
                    <p className="text-red-100 text-sm mt-1">Terjadi kesalahan saat memproses pesanan Anda</p>
                  </div>
                </div>
                <button
                  onClick={() => setOrderError(null)}
                  className="text-white hover:bg-red-700 rounded-lg p-1 transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Main Error Message */}
              {orderError.msg && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <MdError className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Pesan Error:</h4>
                      <p className="text-red-800 text-sm">{orderError.msg}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Detail */}
              {orderError.error && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <MdInfo className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-amber-900 mb-1">Detail Teknis:</h4>
                      <p className="text-amber-800 text-sm font-mono bg-amber-100 px-2 py-1 rounded">
                        {orderError.error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Message */}
              {orderError.message && orderError.message !== orderError.error && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <MdInfo className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">Informasi:</h4>
                      <p className="text-blue-800 text-sm">{orderError.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Multiple Errors */}
              {orderError.errors && Array.isArray(orderError.errors) && orderError.errors.length > 0 && (
                <div className="bg-slate-50 border-l-4 border-slate-500 p-4 rounded">
                  <h4 className="font-semibold text-slate-900 mb-2">Daftar Kesalahan:</h4>
                  <ul className="space-y-1 text-sm text-slate-700">
                    {orderError.errors.map((err, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-slate-400">•</span>
                        <span>{err}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Error Code */}
              {orderError.code && (
                <div className="text-xs text-slate-500 border-t pt-3">
                  <strong>Kode Error:</strong> <code className="bg-slate-100 px-2 py-0.5 rounded">{orderError.code}</code>
                </div>
              )}

              {/* Troubleshooting Tips */}
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                  <MdInfo size={18} />
                  Langkah Penyelesaian:
                </h4>
                <ul className="space-y-1.5 text-sm text-indigo-800">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400">1.</span>
                    <span>Periksa kembali data alamat dan metode pengiriman</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400">2.</span>
                    <span>Pastikan produk masih tersedia (stok cukup)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400">3.</span>
                    <span>Coba refresh halaman dan ulangi proses checkout</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400">4.</span>
                    <span>Jika masalah berlanjut, hubungi customer service</span>
                  </li>
                </ul>
              </div>

              {/* Full Data (Debug Mode) */}
              {process.env.NODE_ENV === 'development' && orderError.fullData && (
                <details className="text-xs text-slate-600 border rounded p-3 bg-slate-50">
                  <summary className="cursor-pointer font-semibold text-slate-700 hover:text-slate-900">
                    🔧 Debug Info (Development Only)
                  </summary>
                  <pre className="mt-2 overflow-auto text-[10px] bg-slate-900 text-green-400 p-2 rounded">
                    {JSON.stringify(orderError.fullData, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t bg-slate-50 p-4 rounded-b-2xl flex gap-3">
              <button
                onClick={() => setOrderError(null)}
                className="flex-1 px-4 py-2.5 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-white transition-colors"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  setOrderError(null);
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;