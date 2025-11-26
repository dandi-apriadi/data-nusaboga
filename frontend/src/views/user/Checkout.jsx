import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Receipt from "components/Receipt";
import { 
  MdLocationOn, 
  MdEdit, 
  MdPayment, 
  MdShoppingCart, 
  MdArrowBack,
  MdSecurity,
  MdLocalShipping,
  MdCheckCircle,
  MdInfo,
  MdVerifiedUser,
  MdSchedule,
  MdPhone,
  MdEmail,
  MdClose,
  MdPrint
} from "react-icons/md";
import { fetchCart } from "../../store/slices/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items: cartItems, loading: cartLoading, cart } = useSelector(state => state.cart);
  const { user } = useSelector(state => state.auth);

  const [selectedAddress, setSelectedAddress] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [selectedShipping, setSelectedShipping] = useState("regular");
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");
  const [referral, setReferral] = useState({ code: null, type: null, value: 0, message: null });
  const [notes, setNotes] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const fetchedCartRef = useRef(false);

  useEffect(() => {
    // Fetch cart only once per mount if cart not yet loaded
    if (!fetchedCartRef.current && !cart && !cartLoading) {
      fetchedCartRef.current = true;
      dispatch(fetchCart());
    }
  }, [dispatch, cart, cartLoading]);

  // Enhanced mock data untuk produk cakalang dengan data lengkap
  const mockCartItems = cartItems && cartItems.length ? cartItems : [
    {
      id: 1,
      name: "Abon Cakalang Premium Asli Manado",
      price: 125000,
      quantity: 2,
      image: "/uploads/abon-cakalang-premium.jpg",
      weight: 250,
      description: "Abon cakalang asli dari ikan cakalang segar Manado, diproses dengan teknologi modern",
      category: "Abon Cakalang",
      brand: "Lyvia Nusa Boga",
      stock: 50
    },
    {
      id: 2,
      name: "Dendeng Cakalang Pedas Rica-Rica",
      price: 145000,
      quantity: 1,
      image: "/uploads/dendeng-cakalang-rica.jpg",
      weight: 200,
      description: "Dendeng cakalang dengan bumbu rica-rica khas Manado yang autentik",
      category: "Dendeng Cakalang",
      brand: "Lyvia Nusa Boga",
      stock: 30
    },
    {
      id: 3,
      name: "Cakalang Fufu Asap Tradisional",
      price: 89000,
      quantity: 1,
      image: "/uploads/cakalang-fufu.jpg",
      weight: 300,
      description: "Cakalang fufu asap dengan proses tradisional turun temurun",
      category: "Cakalang Fufu",
      brand: "Lyvia Nusa Boga",
      stock: 25
    }
  ];

  const addresses = [
    {
      id: 1,
      label: "Rumah Utama",
      receiver: user?.name || "Budi Santoso",
  phone: user?.phone || "62 811-488-068",
      detail: "Jl. Raya Manado-Tomohon No. 123, Komplek Griya Indah Blok C-15",
      district: "Pineleng",
      city: "Minahasa",
      province: "Sulawesi Utara",
      postalCode: "95361",
      isDefault: true
    },
    {
      id: 2,
      label: "Kantor",
      receiver: user?.name || "Budi Santoso",
  phone: user?.phone || "62 811-488-068", 
      detail: "Gedung Perkantoran Mega Center Lt. 8 Suite 805, Jl. Sam Ratulangi No. 456",
      district: "Wenang",
      city: "Manado",
      province: "Sulawesi Utara",
      postalCode: "95111",
      isDefault: false
    }
  ];

  const paymentMethods = [
    {
      id: "bank_transfer",
      name: "Transfer Bank",
      description: "BCA, Mandiri, BNI, BRI, Bank Sulutgo",
      fee: 0,
      processingTime: "Instan setelah konfirmasi",
      icon: "🏦",
      popular: true
    },
    {
      id: "cod",
      name: "Bayar di Tempat (COD)",
      description: "Bayar tunai saat barang tiba di lokasi",
      fee: 0,
      processingTime: "Langsung saat pengiriman",
      icon: "💰",
      popular: false
    },
    {
      id: "ewallet",
      name: "E-Wallet & QRIS",
      description: "GoPay, OVO, Dana, LinkAja, ShopeePay",
      fee: 0,
      processingTime: "Instan",
      icon: "📱",
      popular: false
    }
  ];

  const shippingOptions = [
    {
      id: "regular",
      name: "Pengiriman Reguler",
      description: "3-5 hari kerja",
      price: 18000,
      icon: "🚚"
    },
    {
      id: "express",
      name: "Pengiriman Express", 
      description: "1-2 hari kerja",
      price: 35000,
      icon: "⚡"
    },
    {
      id: "same_day",
      name: "Same Day Delivery",
      description: "Hari yang sama (area Manado)",
      price: 45000,
      icon: "🏃‍♂️"
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getSubtotal = () => {
    return mockCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalWeight = () => {
    return mockCartItems.reduce((total, item) => total + (item.weight * item.quantity), 0);
  };

  const selectedShippingCost = shippingOptions.find(s => s.id === selectedShipping)?.price || 18000;
  const selectedPaymentFee = 0; // Remove payment fees
  const discountAmount = referral.type === 'percent'
    ? Math.floor((getSubtotal() * referral.value) / 100)
    : (referral.type === 'fixed' ? referral.value : 0);
  const total = Math.max(0, getSubtotal() + selectedShippingCost + selectedPaymentFee - discountAmount);

  const validateReferral = async () => {
    if (!referralCode.trim()) {
      setReferral({ code: null, type: null, value: 0, message: "Masukkan kode referal" });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Dummy referral validation without database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Dummy referral codes for testing
      const dummyReferralCodes = {
        'DISKON10': { type: 'percent', value: 10 },
        'DISKON20': { type: 'percent', value: 20 },
        'HEMAT50K': { type: 'fixed', value: 50000 },
        'NEWBIE15': { type: 'percent', value: 15 },
        'CAKALANG25': { type: 'percent', value: 25 }
      };
      
      const upperCode = referralCode.toUpperCase();
      const referralData = dummyReferralCodes[upperCode];
      
      if (referralData) {
        setReferral({ 
          code: upperCode, 
          type: referralData.type, 
          value: referralData.value, 
          message: `🎉 Berhasil! Diskon ${referralData.type === 'percent' ? referralData.value + '%' : formatCurrency(referralData.value)} diterapkan` 
        });
      } else {
        setReferral({ 
          code: null, 
          type: null, 
          value: 0, 
          message: 'Kode referal tidak valid atau sudah kedaluwarsa' 
        });
      }
    } catch (error) {
      setReferral({ 
        code: null, 
        type: null, 
        value: 0, 
        message: 'Gagal memvalidasi kode referal. Silakan coba lagi.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const printCheckoutReceipt = () => {
    if (!mockCartItems || mockCartItems.length === 0) {
      alert("Keranjang kosong, tidak dapat mencetak struk");
      return;
    }

    // Create receipt data in the format expected by Receipt component
    const receiptData = {
      id: `DRAFT-${Date.now()}`,
      date: new Date(),
      items: mockCartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal: getSubtotal(),
      discount: referral.type === 'percent' ? referral.value : 0,
      discountAmount: discountAmount,
      total: total,
      status: 'DRAFT_PESANAN',
      paymentMethod: paymentMethod.toUpperCase(),
      bankDetails: {
        bankName: "Bank BCA",
        accountNumber: "1234567890",
        accountName: "CV. Lyvia Nusa Boga"
      },
      customerInfo: {
        name: user?.name || "Customer",
        email: user?.email || "customer@email.com",
  phone: user?.phone || "62 811-488-068"
      },
      shipping_cost: selectedShippingCost,
      notes: notes
    };

    // Use Receipt component for printing
    const receipt = Receipt({ orderData: receiptData, type: 'order' });
    receipt.printReceipt();
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("⚠️ Silakan pilih alamat pengiriman terlebih dahulu");
      return;
    }

    setIsLoading(true);
    
    try {
      // Dummy function - simulate order processing without database
      const orderData = {
        items: mockCartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        address_id: selectedAddress,
        payment_method: paymentMethod,
        shipping_method: selectedShipping,
        subtotal: getSubtotal(),
        shipping_cost: selectedShippingCost,
        payment_fee: selectedPaymentFee,
        discount: discountAmount,
        referral_code: referral.code,
        total: total,
        notes: notes,
        total_weight: getTotalWeight()
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate dummy order ID
      const orderId = 'ORD-' + Date.now();
      
      // Simulate successful response
      const dummyResult = {
        success: true,
        message: 'Pesanan berhasil dibuat',
        data: {
          id: orderId,
          order_number: orderId,
          status: 'MENUNGGU',
          total: total,
          created_at: new Date().toISOString()
        }
      };

      // Show success message
      alert(`✅ Pesanan berhasil dibuat!\n\nNomor Pesanan: ${orderId}\nTotal: ${formatCurrency(total)}\nStatus: Menunggu Pembayaran\n\nAnda akan diarahkan ke halaman upload bukti pembayaran.`);
      
      // Redirect to payment proof upload page
      console.log('Order created successfully:', dummyResult);
      
      // Navigate to payment proof upload page with order ID
      navigate(`/user/payment-proof/${orderId}`);
      
    } catch (error) {
      console.error("Error placing order:", error);
      alert(`❌ ${error.message}. Silakan coba lagi.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Enhanced Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToCart}
                className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 group"
              >
                <MdArrowBack className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="border-l border-slate-200 pl-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Checkout Pembelian
                </h1>
                <p className="text-slate-500 text-xs mt-0.5">
                  Selesaikan pembelian produk cakalang terbaik dari Lyvia Nusa Boga
                </p>
              </div>
            </div>
            
            {/* Enhanced Progress Indicator */}
            <div className="hidden lg:flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                  <MdCheckCircle className="h-4 w-4 text-white" />
                </div>
                <span className="ml-2 text-xs font-semibold text-green-600">Keranjang</span>
              </div>
              <div className="w-8 h-1 bg-green-500 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <span className="ml-2 text-xs font-bold text-indigo-600">Checkout</span>
              </div>
              <div className="w-8 h-1 bg-slate-200 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-slate-400 text-xs font-bold">3</span>
                </div>
                <span className="ml-2 text-xs font-medium text-slate-400">Pembayaran</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-6 pb-6">
          {/* Main Form Section */}
          <div className="xl:col-span-8 space-y-4 lg:space-y-5">
            {/* Shipping Address Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 px-4 sm:px-6 py-4 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <MdLocationOn className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Alamat Pengiriman</h2>
                    <p className="text-slate-600 text-xs mt-0.5">Pilih alamat tujuan pengiriman produk cakalang</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                      selectedAddress === address.id
                        ? 'border-indigo-400 bg-indigo-50/60 shadow-md ring-2 ring-indigo-200/50'
                        : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedAddress(address.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`mt-0.5 w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                        selectedAddress === address.id
                          ? 'border-indigo-500 bg-indigo-500 shadow-sm'
                          : 'border-slate-300 group-hover:border-indigo-300'
                      }`}>
                        {selectedAddress === address.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-md ${
                              selectedAddress === address.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-md">
                                Utama
                              </span>
                            )}
                          </div>
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <MdEdit className="h-3 w-3" />
                          </button>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">{address.receiver}</h3>
                        <div className="flex items-center text-xs text-slate-600 font-medium mb-2">
                          <MdPhone className="h-3 w-3 mr-1 text-slate-400" />
                          {address.phone}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {address.detail}<br />
                          {address.district}, {address.city}<br />
                          <span className="font-semibold">{address.province} {address.postalCode}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Options */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 px-4 sm:px-6 py-4 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <MdLocalShipping className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Metode Pengiriman</h2>
                    <p className="text-slate-600 text-xs mt-0.5">Pilih layanan pengiriman untuk produk cakalang Anda</p>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                      selectedShipping === option.id
                        ? 'border-blue-400 bg-blue-50/60 shadow-md ring-2 ring-blue-200/50'
                        : 'border-slate-200 hover:border-blue-200 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedShipping(option.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                          selectedShipping === option.id
                            ? 'border-blue-500 bg-blue-500 shadow-sm'
                            : 'border-slate-300 group-hover:border-blue-300'
                        }`}>
                          {selectedShipping === option.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="text-lg">{option.icon}</div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{option.name}</h3>
                          <p className="text-xs text-slate-600">{option.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-900">{formatCurrency(option.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 px-4 sm:px-6 py-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <MdPayment className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">Metode Pembayaran</h2>
                      <p className="text-slate-600 text-xs mt-0.5">Pilih cara pembayaran yang mudah untuk Anda</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentInfo(true)}
                    className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors duration-200"
                  >
                    <MdInfo className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-4 sm:p-5 space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                      paymentMethod === method.id
                        ? 'border-purple-400 bg-purple-50/60 shadow-md ring-2 ring-purple-200/50'
                        : 'border-slate-200 hover:border-purple-200 hover:shadow-sm'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                          paymentMethod === method.id
                            ? 'border-purple-500 bg-purple-500 shadow-sm'
                            : 'border-slate-300 group-hover:border-purple-300'
                        }`}>
                          {paymentMethod === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <div className="text-lg">{method.icon}</div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-base font-bold text-slate-900">{method.name}</h3>
                            {method.popular && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-md">
                                Populer
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-0.5">{method.description}</p>
                          <p className="text-xs text-slate-500">⏰ {method.processingTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral Code & Notes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Referral Code */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-amber-50 to-amber-100/80 px-4 py-3 border-b border-amber-200">
                  <h3 className="text-base font-bold text-amber-900">Kode Referal</h3>
                  <p className="text-amber-700 text-xs mt-0.5">Dapatkan diskon dengan kode referal</p>
                </div>
                <div className="p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      placeholder="Masukkan kode referal"
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    <button
                      onClick={validateReferral}
                      disabled={isLoading || !referralCode.trim()}
                      className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm"
                    >
                      {isLoading ? "⏳" : "Gunakan"}
                    </button>
                  </div>
                  {referral.message && (
                    <div className={`mt-2 p-2 rounded-md text-xs ${
                      referral.code 
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {referral.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 px-4 py-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Catatan Pesanan</h3>
                  <p className="text-slate-600 text-xs mt-0.5">Tambahkan pesan khusus (opsional)</p>
                </div>
                <div className="p-4">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Contoh: Tolong kirim di pagi hari, atau instruksi khusus lainnya..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none text-sm"
                    maxLength={500}
                  />
                  <div className="mt-1 text-right">
                    <span className="text-xs text-slate-500">{notes.length}/500 karakter</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-4">
            <div className="sticky top-20 space-y-4">
              {/* Cart Items Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100/80 px-4 py-4 border-b border-indigo-200">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-2">
                      <MdShoppingCart className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-indigo-900">Ringkasan Pesanan</h3>
                      <p className="text-indigo-700 text-xs">{mockCartItems.length} produk cakalang pilihan</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 max-h-64 overflow-y-auto">
                  {mockCartItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 py-3 border-b border-slate-100 last:border-b-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg bg-slate-100"
                        onError={(e) => {
                          // Prevent infinite loop by checking if fallback already applied
                          if (!e.target.hasAttribute('data-fallback')) {
                            e.target.setAttribute('data-fallback', 'true');
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjFGNUY5Ii8+CjxwYXRoIGQ9Ik0yNCAzMkMyNCAyNy41ODE3IDI3LjU4MTcgMjQgMzIgMjRDMzYuNDE4MyAyNCA0MCAyNy41ODE3IDQwIDMyQzQwIDM2LjQxODMgMzYuNDE4MyA0MCAzMiA0MEMyNy41ODE3IDQwIDI0IDM2LjQxODMgMjQgMzJaIiBmaWxsPSIjQ0JEMkQ5Ii8+CjxwYXRoIGQ9Ik0yOSAyOUMzMC4xMDQ2IDI5IDMxIDI4LjEwNDYgMzEgMjdDMzEgMjUuODk1NCAzMC4xMDQ2IDI1IDI5IDI1QzI3Ljg5NTQgMjUgMjcgMjUuODk1NCAyNyAyN0MyNyAyOC4xMDQ2IDI3Ljg5NTQgMjkgMjkgMjlaIiBmaWxsPSIjOTQ5MEE0Ii8+CjxwYXRoIGQ9Ik0yNSAzNkwyOCAzM0wzMSAzNkwzNSAzMkwzOSAzNlYzOUgyNVYzNloiIGZpbGw9IiM5NDkwQTQiLz4KPC9zdmc+';
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-slate-500">
                            {item.quantity}x • {item.weight}g
                          </span>
                          <span className="text-xs font-bold text-indigo-600">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                            {item.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100/80 px-4 py-3 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900">Rincian Biaya</h3>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Subtotal Produk</span>
                    <span className="font-semibold text-slate-900 text-sm">{formatCurrency(getSubtotal())}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 flex items-center text-sm">
                      <MdLocalShipping className="h-3 w-3 mr-1" />
                      Biaya Pengiriman
                    </span>
                    <span className="font-semibold text-slate-900 text-sm">{formatCurrency(selectedShippingCost)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 flex items-center text-sm">
                        🎉 Diskon Referal
                      </span>
                      <span className="font-semibold text-green-600 text-sm">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                    <span>Total Berat</span>
                    <span>{getTotalWeight()}g</span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-slate-900">Total Pembayaran</span>
                      <span className="text-lg font-bold text-indigo-600">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Quick Print Receipt Button */}
                  <div className="pt-2">
                    <button
                      onClick={printCheckoutReceipt}
                      disabled={!mockCartItems || mockCartItems.length === 0}
                      className="w-full bg-slate-50 text-slate-600 font-medium py-2 px-3 rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-slate-200 hover:border-slate-300 text-sm"
                    >
                      <div className="flex items-center justify-center">
                        <MdPrint className="h-4 w-4 mr-1.5" />
                        Preview & Cetak Struk
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms and Place Order */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
                <div className="p-4 space-y-4">
                  {/* Place Order Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !selectedAddress}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Memproses Pesanan...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <MdSecurity className="h-4 w-4 mr-2" />
                        Buat Pesanan Sekarang
                      </div>
                    )}
                  </button>

                  {/* Print Receipt Button */}
                  <button
                    onClick={printCheckoutReceipt}
                    disabled={!mockCartItems || mockCartItems.length === 0}
                    className="w-full bg-slate-100 text-slate-700 font-medium py-2.5 px-4 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-slate-300 hover:border-slate-400"
                  >
                    <div className="flex items-center justify-center">
                      <MdPrint className="h-4 w-4 mr-2" />
                      Cetak Struk Preview
                    </div>
                  </button>

                  {/* Support Contact */}
                  <div className="bg-slate-50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-600 mb-2">Butuh bantuan? Hubungi kami:</p>
                    <div className="flex items-center justify-center space-x-3 text-xs">
                      <a 
                        href="tel:+62811488068" 
                        className="flex items-center text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <MdPhone className="h-3 w-3 mr-1" />
                        62 811-488-068
                      </a>
                      <div className="w-px h-3 bg-slate-300"></div>
                      <a 
                        href="mailto:info@lyvianusaboga.com" 
                        className="flex items-center text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <MdEmail className="h-3 w-3 mr-1" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Info Modal */}
      {showPaymentInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Informasi Pembayaran</h3>
              <button
                onClick={() => setShowPaymentInfo(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{method.icon}</div>
                    <div>
                      <h4 className="font-bold text-slate-900">{method.name}</h4>
                      <p className="text-sm text-slate-600 mb-2">{method.description}</p>
                      <p className="text-xs text-slate-500">⏰ {method.processingTime}</p>
                      {method.fee > 0 && (
                        <p className="text-xs text-amber-600 font-semibold mt-1">
                          Biaya admin: {formatCurrency(method.fee)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;