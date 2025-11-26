import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "components/card";
import Receipt from "components/Receipt";
import { 
  MdUpload, 
  MdImage, 
  MdCheck, 
  MdError, 
  MdArrowBack,
  MdCloudUpload,
  MdDescription,
  MdReceipt,
  MdPayment,
  MdCamera,
  MdDelete,
  MdVisibility,
  MdPrint,
  MdDownload
} from "react-icons/md";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const PaymentProofUpload = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [orderData, setOrderData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // Dummy order data for testing
  const dummyOrderData = {
    id: orderId,
    date: new Date(),
    items: [
      { id: 1, name: "Abon Cakalang Premium", price: 85000, quantity: 2, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=300&fit=crop" },
      { id: 2, name: "Sambal Rica Cakalang", price: 45000, quantity: 1, image: "https://images.unsplash.com/photo-1596560548464-f36b2ac51851?w=300&h=300&fit=crop" }
    ],
    subtotal: 215000,
    discount: 10,
    discountAmount: 21500,
    total: 193500,
    status: "MENUNGGU_PEMBAYARAN",
    paymentMethod: "TRANSFER",
    bankDetails: {
      bankName: "Bank BCA",
      accountNumber: "1234567890",
      accountName: "CV. Lyvia Nusa Boga"
    },
    customerInfo: {
      name: "Customer Test",
      email: "customer@test.com",
  phone: "62 811-488-068"
    }
  };

  useEffect(() => {
    // Simulate loading order data
    const loadOrderData = async () => {
      try {
        // In real app, fetch from API: /api/orders/${orderId}
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOrderData(dummyOrderData);
      } catch (error) {
        setError("Gagal memuat data pesanan");
      }
    };

    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

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

  const handleFileSelect = (file) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Format file tidak didukung. Gunakan JPG, PNG, atau WebP");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("Ukuran file terlalu besar. Maksimal 5MB");
      return;
    }

    setError("");
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Pilih file bukti pembayaran terlebih dahulu");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Simulate upload process with dummy backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dummy API call for uploading payment proof
      const uploadData = {
        orderId: orderId,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        description: description,
        uploadedAt: new Date().toISOString()
      };
      
      console.log('Dummy upload data:', uploadData);
      
      // Simulate updating order status to "VERIFIKASI_PEMBAYARAN"
      const updateStatusData = {
        orderId: orderId,
        status: 'VERIFIKASI_PEMBAYARAN',
        paymentProof: {
          fileName: selectedFile.name,
          uploadedAt: new Date().toISOString(),
          description: description
        }
      };
      
      console.log('Dummy status update:', updateStatusData);
      
      // Update local order data to reflect new status
      setOrderData(prev => ({
        ...prev,
        status: 'VERIFIKASI_PEMBAYARAN',
        paymentProof: updateStatusData.paymentProof
      }));
      
      setUploadSuccess(true);
      
      // Send notification (dummy)
      console.log('Dummy notification sent to admin:', {
        type: 'PAYMENT_PROOF_UPLOADED',
        orderId: orderId,
        customerName: orderData.customerInfo.name,
        amount: orderData.total
      });
      
    } catch (error) {
      console.error("Upload error:", error);
      setError("Gagal mengunggah bukti pembayaran. Silakan coba lagi");
    } finally {
      setUploading(false);
    }
  };

  const printReceipt = () => {
    if (!orderData) return;
    
    // Use Receipt component for printing
    const receiptData = {
      ...orderData,
      status: orderData.status || 'MENUNGGU_PEMBAYARAN'
    };
    
    const receipt = Receipt({ orderData: receiptData, type: 'order' });
    receipt.printReceipt();
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card extra="w-full max-w-md shadow-xl border-0 bg-white/70 backdrop-blur-sm">
          <div className="p-8 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">Memuat Data Pesanan</h3>
            <p className="text-slate-600">Mohon tunggu sebentar...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-green-800 shadow-xl">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <MdCheck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Upload Berhasil!</h1>
                  <p className="text-green-100 text-lg">Bukti pembayaran telah diterima</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Success Message */}
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="p-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto mb-6">
                  <MdCheck className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">Bukti Pembayaran Berhasil Diunggah</h2>
                <p className="text-slate-600 mb-6">
                  Terima kasih! Bukti pembayaran Anda sedang dalam proses verifikasi. 
                  Kami akan menghubungi Anda dalam 1-2 jam kerja untuk konfirmasi.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-6 mb-6">
                  <h3 className="font-medium text-blue-800 mb-2">Langkah Selanjutnya:</h3>
                  <ul className="text-sm text-blue-700 space-y-1 text-left">
                    <li>• Tim kami akan memverifikasi bukti pembayaran Anda</li>
                    <li>• Anda akan menerima notifikasi melalui WhatsApp/email</li>
                    <li>• Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
                    <li>• Estimasi pengiriman 1-3 hari kerja setelah konfirmasi</li>
                  </ul>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={printReceipt}
                    className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                  >
                    <MdPrint className="mr-2 h-5 w-5" />
                    Cetak Struk
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="flex items-center justify-center px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              </div>
            </Card>

            {/* Order Summary */}
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                <h3 className="text-xl font-bold text-slate-800">Ringkasan Pesanan</h3>
                <p className="text-slate-600">No. Pesanan: {orderData.id}</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {orderData.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff&size=64`;
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{item.name}</h4>
                        <p className="text-sm text-slate-600">{item.quantity} x {formatCurrency(item.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-slate-200 mt-6 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="text-slate-800">{formatCurrency(orderData.subtotal)}</span>
                  </div>
                  {orderData.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Diskon ({orderData.discount}%):</span>
                      <span className="text-red-600">-{formatCurrency(orderData.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-slate-800">Total:</span>
                    <span className="text-indigo-600">{formatCurrency(orderData.total)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
              >
                <MdArrowBack className="h-6 w-6 text-white" />
              </button>
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <MdUpload className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Upload Bukti Pembayaran</h1>
                <p className="text-indigo-100 text-lg">No. Pesanan: {orderData.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upload Section */}
            <div className="space-y-6">
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Upload Bukti Transfer</h2>
                  <p className="text-slate-600">Upload screenshot atau foto bukti transfer pembayaran Anda</p>
                </div>
                <div className="p-6">
                  {/* Payment Instructions */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                      <MdPayment className="mr-2 h-5 w-5" />
                      Informasi Pembayaran
                    </h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex justify-between">
                        <span>Bank:</span>
                        <span className="font-medium">{orderData.bankDetails.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>No. Rekening:</span>
                        <span className="font-medium">{orderData.bankDetails.accountNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Atas Nama:</span>
                        <span className="font-medium">{orderData.bankDetails.accountName}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                        <span>Jumlah Transfer:</span>
                        <span className="font-bold text-lg">{formatCurrency(orderData.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      dragOver 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : selectedFile 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-slate-300 hover:border-slate-400 bg-slate-50'
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    {selectedFile ? (
                      <div className="space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mx-auto">
                          <MdCheck className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-green-800 mb-1">File Dipilih</h3>
                          <p className="text-sm text-green-600">{selectedFile.name}</p>
                          <p className="text-xs text-green-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          onClick={removeFile}
                          className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800"
                        >
                          <MdDelete className="mr-1 h-4 w-4" />
                          Hapus File
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 mx-auto">
                          <MdCloudUpload className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800 mb-1">
                            {dragOver ? 'Lepas file di sini' : 'Pilih atau drag file ke sini'}
                          </h3>
                          <p className="text-sm text-slate-600">JPG, PNG, WebP maksimal 5MB</p>
                        </div>
                        <div className="flex items-center justify-center space-x-2">
                          <MdCamera className="h-4 w-4 text-slate-400" />
                          <span className="text-xs text-slate-500">Foto langsung dari kamera juga bisa</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preview */}
                  {previewUrl && (
                    <div className="mt-6">
                      <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                        <MdVisibility className="mr-2 h-4 w-4" />
                        Preview Bukti Pembayaran
                      </h4>
                      <div className="relative bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Preview bukti pembayaran"
                          className="w-full h-64 object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tambahkan catatan jika diperlukan..."
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="mt-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                      <MdError className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="mt-6">
                    <button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploading}
                      className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <MdUpload className="mr-2 h-5 w-5" />
                          Upload Bukti Pembayaran
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-slate-800">Ringkasan Pesanan</h3>
                  <p className="text-slate-600">Tanggal: {formatDate(orderData.date)}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    {orderData.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=6366f1&color=fff&size=64`;
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-800">{item.name}</h4>
                          <p className="text-sm text-slate-600">{item.quantity} x {formatCurrency(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="text-slate-800">{formatCurrency(orderData.subtotal)}</span>
                    </div>
                    {orderData.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Diskon ({orderData.discount}%):</span>
                        <span className="text-red-600">-{formatCurrency(orderData.discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-lg font-bold border-t border-slate-200 pt-3">
                      <span className="text-slate-800">Total Pembayaran:</span>
                      <span className="text-indigo-600">{formatCurrency(orderData.total)}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Print Receipt Button */}
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <div className="p-6">
                  <h4 className="font-medium text-slate-800 mb-4 flex items-center">
                    <MdReceipt className="mr-2 h-5 w-5" />
                    Struk Pembayaran
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    Cetak struk sebagai bukti pesanan dan panduan pembayaran
                  </p>
                  <button
                    onClick={printReceipt}
                    className="w-full flex items-center justify-center px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <MdPrint className="mr-2 h-5 w-5" />
                    Cetak Struk
                  </button>
                </div>
              </Card>

              {/* Contact Info */}
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <div className="p-6">
                  <h4 className="font-medium text-slate-800 mb-4">Butuh Bantuan?</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                        <span className="text-green-600 text-xs font-bold">WA</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">WhatsApp</p>
                        <p className="text-slate-600">62 811-488-068</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                        <span className="text-blue-600 text-xs font-bold">@</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">Email</p>
                        <p className="text-slate-600">cs@lyvianusaboga.com</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentProofUpload;