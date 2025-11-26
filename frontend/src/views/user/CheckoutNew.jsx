import React, { useState } from "react";
import { 
  MdLocationOn, 
  MdAdd, 
  MdEdit, 
  MdPayment, 
  MdShoppingCart, 
  MdArrowBack,
  MdSecurity,
  MdLocalShipping,
  MdCheckCircle
} from "react-icons/md";

const Checkout = () => {
  const [selectedAddress, setSelectedAddress] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - nanti akan diganti dengan Redux store
  const cartItems = [
    {
      id: 1,
      name: "Abon Cakalang Premium",
      price: 85000,
      quantity: 2,
      image: "/uploads/abon-premium.jpg"
    },
    {
      id: 2,
      name: "Dendeng Cakalang Pedas",
      price: 95000,
      quantity: 1,
      image: "/uploads/dendeng-pedas.jpg"
    }
  ];

  const addresses = [
    {
      id: 1,
      label: "Rumah",
      receiver: "Ahmad Fauzi",
  phone: "62 811-488-068",
      detail: "Jl. Merdeka No. 123, RT 05/RW 03",
      district: "Tanah Abang",
      city: "Jakarta Pusat",
      province: "DKI Jakarta",
      postalCode: "10160"
    },
    {
      id: 2,
      label: "Kantor",
      receiver: "Ahmad Fauzi",
  phone: "62 811-488-068", 
      detail: "Gedung Sudirman Lt. 15, Jl. Sudirman No. 456",
      district: "Setiabudi",
      city: "Jakarta Selatan",
      province: "DKI Jakarta",
      postalCode: "12920"
    }
  ];

  const paymentMethods = [
    {
      id: "bank_transfer",
      name: "Transfer Bank",
      description: "BCA, Mandiri, BNI, BRI",
      fee: 0
    },
    {
      id: "cod",
      name: "Bayar di Tempat (COD)",
      description: "Bayar tunai saat barang tiba",
      fee: 5000
    },
    {
      id: "ewallet",
      name: "E-Wallet",
      description: "GoPay, OVO, Dana, LinkAja",
      fee: 2500
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
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const shippingCost = 15000;
  const selectedPaymentFee = paymentMethods.find(p => p.id === paymentMethod)?.fee || 0;
  const total = getSubtotal() + shippingCost + selectedPaymentFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert("Pilih alamat pengiriman terlebih dahulu");
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement order placement
      const orderData = {
        items: cartItems,
        address_id: selectedAddress,
        payment_method: paymentMethod,
        subtotal: getSubtotal(),
        shipping_cost: shippingCost,
        payment_fee: selectedPaymentFee,
        total: total
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log("Placing order:", orderData);
      alert("Pesanan berhasil dibuat! Anda akan dialihkan ke halaman pembayaran.");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCart = () => {
    // TODO: Navigate back to cart
    console.log("Back to cart");
    alert("Kembali ke keranjang...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Clean Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToCart}
                className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 group"
              >
                <MdArrowBack className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>
              <div className="border-l border-slate-200 pl-4">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Checkout</h1>
                <p className="text-slate-500 text-sm mt-1">Selesaikan pembelian Anda</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-sm">
                  <MdCheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-sm font-semibold text-green-600">Keranjang</span>
              </div>
              <div className="w-16 h-1 bg-green-500 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="ml-3 text-sm font-bold text-indigo-600">Checkout</span>
              </div>
              <div className="w-16 h-1 bg-slate-200 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-slate-400 text-sm font-bold">3</span>
                </div>
                <span className="ml-3 text-sm font-medium text-slate-400">Pembayaran</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trust Indicators */}
        <div className="mb-8 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-center space-x-8">
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <MdSecurity className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-semibold text-slate-700">SSL Secured</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <MdLocalShipping className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-semibold text-slate-700">Fast Delivery</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex items-center text-sm">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <MdCheckCircle className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="font-semibold text-slate-700">Trusted Platform</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Form Section */}
          <div className="xl:col-span-8 space-y-8">
            {/* Shipping Address Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mr-4">
                      <MdLocationOn className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Alamat Pengiriman</h2>
                      <p className="text-slate-600 text-sm mt-1">Pilih alamat tujuan pengiriman produk</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddAddress(true)}
                    className="inline-flex items-center px-4 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors duration-200"
                  >
                    <MdAdd className="h-4 w-4 mr-2" />
                    Tambah Alamat
                  </button>
                </div>
              </div>

              {/* Address Cards */}
              <div className="p-8 space-y-5">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 group ${
                      selectedAddress === address.id
                        ? 'border-indigo-400 bg-indigo-50/60 shadow-md'
                        : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedAddress(address.id)}
                  >
                    <div className="flex items-start space-x-5">
                      {/* Custom Radio */}
                      <div className={`mt-1 w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                        selectedAddress === address.id
                          ? 'border-indigo-500 bg-indigo-500 shadow-sm'
                          : 'border-slate-300 group-hover:border-indigo-300'
                      }`}>
                        {selectedAddress === address.id && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>

                      {/* Address Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg ${
                            selectedAddress === address.id
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {address.label}
                          </span>
                          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                            <MdEdit className="h-4 w-4" />
                          </button>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-2">{address.receiver}</h3>
                        <p className="text-sm text-slate-600 font-medium mb-3">{address.phone}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">
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

            {/* Payment Method Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                    <MdPayment className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Metode Pembayaran</h2>
                    <p className="text-slate-600 text-sm mt-1">Pilih metode pembayaran yang sesuai</p>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="p-8 space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`relative p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 group ${
                      paymentMethod === method.id
                        ? 'border-indigo-400 bg-indigo-50/60 shadow-md'
                        : 'border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                    }`}
                    onClick={() => setPaymentMethod(method.id)}
                  >
                    <div className="flex items-center space-x-5">
                      {/* Custom Radio */}
                      <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                        paymentMethod === method.id
                          ? 'border-indigo-500 bg-indigo-500 shadow-sm'
                          : 'border-slate-300 group-hover:border-indigo-300'
                      }`}>
                        {paymentMethod === method.id && (
                          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                        )}
                      </div>

                      {/* Method Content */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{method.name}</h3>
                            <p className="text-sm text-slate-600">{method.description}</p>
                          </div>
                          <div className="text-right">
                            {method.fee > 0 ? (
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-800 rounded-lg">
                                +{formatCurrency(method.fee)}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-green-100 text-green-700 rounded-lg">
                                GRATIS
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="xl:col-span-4">
            <div className="sticky top-32">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden">
                {/* Summary Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                      <MdShoppingCart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Ringkasan Pesanan</h2>
                      <p className="text-indigo-100 text-sm">{cartItems.length} produk dipilih</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  {/* Product Items */}
                  <div className="space-y-5 mb-8">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-slate-50 rounded-xl">
                        <div className="relative flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl shadow-sm"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/64x64/6366f1/ffffff?text=IMG';
                            }}
                          />
                          <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-900 text-sm mb-1 truncate">{item.name}</h3>
                          <p className="text-xs text-slate-500 mb-2">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                          <p className="font-bold text-indigo-600">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Subtotal</span>
                      <span className="font-bold">{formatCurrency(getSubtotal())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 font-medium">Ongkos Kirim</span>
                      <span className="font-bold">{formatCurrency(shippingCost)}</span>
                    </div>
                    {selectedPaymentFee > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-600 font-medium">Biaya Admin</span>
                        <span className="font-bold">{formatCurrency(selectedPaymentFee)}</span>
                      </div>
                    )}
                    
                    <div className="border-t-2 border-slate-200 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-slate-900">Total Bayar</span>
                        <span className="text-2xl font-bold text-indigo-600">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isLoading || !selectedAddress}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Memproses Pesanan...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <MdShoppingCart className="mr-3 h-5 w-5" />
                        Buat Pesanan Sekarang
                      </div>
                    )}
                  </button>

                  {/* Security Badge */}
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center justify-center">
                      <MdSecurity className="h-4 w-4 text-green-600 mr-2" />
                      <p className="text-sm text-green-800 font-semibold">Transaksi 100% Aman & Terenkripsi</p>
                    </div>
                  </div>

                  {/* Terms */}
                  <p className="text-xs text-slate-500 text-center mt-4 leading-relaxed">
                    Dengan melanjutkan, Anda menyetujui{" "}
                    <a href="#" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">
                      Syarat & Ketentuan
                    </a>{" "}
                    yang berlaku
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
