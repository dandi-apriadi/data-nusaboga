import React, { useState } from 'react';
import { 
  MdClose, 
  MdStar, 
  MdStarBorder,
  MdShoppingCart, 
  MdLocalShipping,
  MdSecurity,
  MdVerified,
  MdStore,
  MdAdd,
  MdRemove,
  MdReviews,
  MdThumbUp,
  MdThumbDown,
  MdImage,
  MdZoomIn
} from 'react-icons/md';

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [reviewFilter, setReviewFilter] = useState('all');
  const [showImageModal, setShowImageModal] = useState(false);

  if (!isOpen || !product) return null;

  // Mock additional product data
  const productImages = [
    product.image,
    "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80",
    "https://images.unsplash.com/photo-1615937691194-97dbd19ac6e7?w=600&q=80",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=600&q=80"
  ];

  const productDetails = {
    weight: "250g",
    ingredients: "Ikan Cakalang, Garam, Gula, Bumbu Rempah Alami",
    nutrition: {
      calories: "180 kkal",
      protein: "25g",
      fat: "8g", 
      carbs: "2g"
    },
    storage: "Simpan di tempat sejuk dan kering",
    expiry: "6 bulan dari tanggal produksi",
    origin: "Manado, Sulawesi Utara"
  };

  const reviews = [
    {
      id: 1,
      name: "Sari Indah",
      rating: 5,
      date: "2024-09-15",
      comment: "Rasanya benar-benar autentik! Abon cakalangnya lembut dan bumbunya pas banget. Pasti beli lagi!",
      helpful: 12,
      verified: true
    },
    {
      id: 2,
      name: "Ahmad Fadli", 
      rating: 4,
      date: "2024-09-10",
      comment: "Produk berkualitas tinggi, packaging rapi. Hanya saja harganya sedikit mahal tapi worth it!",
      helpful: 8,
      verified: true
    },
    {
      id: 3,
      name: "Maya Sari",
      rating: 5,
      date: "2024-09-08",
      comment: "Sudah langganan dari tahun lalu. Konsisten rasanya, selalu fresh dan tahan lama.",
      helpful: 15,
      verified: true
    }
  ];

  const relatedProducts = [
    {
      id: 2,
      name: "Dendeng Cakalang Pedas",
      price: 95000,
      image: "https://images.unsplash.com/photo-1615937691194-97dbd19ac6e7?w=200&q=80",
      rating: 4.7
    },
    {
      id: 3,
      name: "Cakalang Fufu Asli",
      price: 120000,
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200&q=80",
      rating: 4.9
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      index < rating ? (
        <MdStar key={index} className="w-5 h-5 text-amber-400" />
      ) : (
        <MdStarBorder key={index} className="w-5 h-5 text-slate-300" />
      )
    ));
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    onAddToCart({ ...product, quantity });
    setQuantity(1);
  };

  const ImageModal = () => (
    <div className="fixed inset-0 bg-black/90 z-[200] flex items-center justify-center p-4">
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          onClick={() => setShowImageModal(false)}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
        >
          <MdClose className="w-8 h-8" />
        </button>
        <img
          src={productImages[selectedImageIndex]}
          alt={product.name}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {productImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h2 className="text-2xl font-bold text-slate-800">Detail Produk</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-full transition-colors"
            >
              <MdClose className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row max-h-[calc(95vh-80px)] overflow-hidden">
            {/* Left Section - Images */}
            <div className="lg:w-1/2 p-6">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative bg-slate-100 rounded-2xl overflow-hidden group">
                  <img
                    src={productImages[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-cover cursor-zoom-in"
                    onClick={() => setShowImageModal(true)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <MdZoomIn className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Badges */}
                  <div className="absolute top-4 left-4 space-y-2">
                    {product.discount > 0 && (
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        -{product.discount}%
                      </div>
                    )}
                    {product.isHot && (
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        🔥 HOT
                      </div>
                    )}
                  </div>
                </div>

                {/* Thumbnail Images */}
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === selectedImageIndex 
                          ? 'border-indigo-500' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Section - Details */}
            <div className="lg:w-1/2 flex flex-col">
              <div className="p-6 flex-1 overflow-y-auto">
                {/* Product Title & Rating */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-slate-800 mb-3">{product.name}</h1>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center space-x-1">
                      {renderStars(Math.floor(product.rating))}
                      <span className="text-lg font-semibold text-slate-700 ml-2">{product.rating}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600">{product.sold} terjual</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-green-600 font-medium">{product.stock} stok tersisa</span>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-3xl font-bold text-indigo-600">
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-xl text-slate-400 line-through">
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <div className="text-green-600 font-semibold">
                      Hemat {formatCurrency(product.originalPrice - product.price)} ({product.discount}%)
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="mb-6">
                  <div className="flex space-x-6 border-b border-slate-200">
                    {[
                      { id: 'description', label: 'Deskripsi' },
                      { id: 'details', label: 'Detail Produk' },
                      { id: 'reviews', label: `Ulasan (${reviews.length})` }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-3 px-1 font-medium transition-colors ${
                          activeTab === tab.id
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-slate-600 hover:text-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 max-h-64 overflow-y-auto">
                    {activeTab === 'description' && (
                      <div>
                        <p className="text-slate-700 leading-relaxed mb-4">
                          {product.description}
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm text-slate-600">Berat</div>
                            <div className="font-semibold">{productDetails.weight}</div>
                          </div>
                          <div className="bg-slate-50 p-3 rounded-lg">
                            <div className="text-sm text-slate-600">Asal</div>
                            <div className="font-semibold">{productDetails.origin}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'details' && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">Komposisi</h4>
                          <p className="text-slate-600">{productDetails.ingredients}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">Informasi Gizi (per 100g)</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex justify-between">
                              <span>Kalori</span>
                              <span className="font-medium">{productDetails.nutrition.calories}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Protein</span>
                              <span className="font-medium">{productDetails.nutrition.protein}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Lemak</span>
                              <span className="font-medium">{productDetails.nutrition.fat}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Karbohidrat</span>
                              <span className="font-medium">{productDetails.nutrition.carbs}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">Penyimpanan</h4>
                          <p className="text-slate-600">{productDetails.storage}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">Masa Simpan</h4>
                          <p className="text-slate-600">{productDetails.expiry}</p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'reviews' && (
                      <div className="space-y-4">
                        {/* Review Summary */}
                        <div className="bg-slate-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-4 mb-3">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-slate-800">{product.rating}</div>
                              <div className="flex justify-center mb-1">
                                {renderStars(Math.floor(product.rating))}
                              </div>
                              <div className="text-sm text-slate-600">{reviews.length} ulasan</div>
                            </div>
                          </div>
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-4">
                          {reviews.map((review) => (
                            <div key={review.id} className="border-b border-slate-200 pb-4">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-slate-800">{review.name}</span>
                                    {review.verified && (
                                      <MdVerified className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className="flex">
                                      {renderStars(review.rating)}
                                    </div>
                                    <span className="text-sm text-slate-500">{review.date}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-slate-700 mb-2">{review.comment}</p>
                              <div className="flex items-center space-x-4 text-sm">
                                <button className="flex items-center space-x-1 text-slate-600 hover:text-indigo-600">
                                  <MdThumbUp className="w-4 h-4" />
                                  <span>Membantu ({review.helpful})</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Action Section */}
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                {/* Quantity & Actions */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-600 font-medium">Jumlah:</span>
                    <div className="flex items-center border border-slate-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MdRemove className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="p-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <MdAdd className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Total Price */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-slate-800">Total:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(product.price * quantity)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                  >
                    <MdShoppingCart className="w-5 h-5 mr-2" />
                    {product.stock === 0 ? 'Stok Habis' : 'Tambah ke Keranjang'}
                  </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <MdLocalShipping className="w-4 h-4" />
                    <span>Gratis Ongkir</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MdSecurity className="w-4 h-4" />
                    <span>Pembayaran Aman</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MdVerified className="w-4 h-4" />
                    <span>Produk Original</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && <ImageModal />}
    </>
  );
};

export default ProductDetailModal;