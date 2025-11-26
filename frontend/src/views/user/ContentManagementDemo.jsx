import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ReviewSection from '../../components/product/ReviewSection';
import ChatbotWidget from '../../components/chatbot/ChatbotWidget';
import { 
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon
} from '@heroicons/react/24/solid';

const ContentManagementDemo = () => {
  const dispatch = useDispatch();

  // Sample product data
  const sampleProduct = {
    id: '1',
    name: 'Abon Cakalang Premium',
    price: 45000,
    originalPrice: 55000,
    description: 'Abon cakalang berkualitas premium dengan cita rasa autentik Sulawesi Utara. Dibuat dari ikan cakalang segar pilihan dan bumbu rempah tradisional.',
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80'
    ],
    category: 'Abon Cakalang',
    weight: '200g',
    rating: 4.6,
    reviewCount: 147,
    inStock: true,
    features: [
      'Ikan cakalang segar premium',
      'Bumbu rempah tradisional',
      'Proses higienis dan modern',
      'Tahan 6 bulan sebelum dibuka',
      'Kemasan kedap udara'
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Content Management Demo</h1>
              <p className="text-slate-600 mt-2">
                Demo lengkap sistem review produk dan chatbot untuk Lyvia Nusa Boga
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Review System
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Chatbot Ready
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-w-1 aspect-h-1 rounded-xl overflow-hidden">
              <img
                src={sampleProduct.image}
                alt={sampleProduct.name}
                className="w-full h-96 object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {sampleProduct.images.slice(1).map((image, index) => (
                <div key={index} className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`${sampleProduct.name} ${index + 2}`}
                    className="w-full h-24 object-cover hover:opacity-90 cursor-pointer transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm font-medium">
                  {sampleProduct.category}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                  Ready Stock
                </span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {sampleProduct.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center space-x-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(sampleProduct.rating)
                          ? 'text-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-slate-600">
                  {sampleProduct.rating} ({sampleProduct.reviewCount} review)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-slate-900">
                Rp {sampleProduct.price.toLocaleString('id-ID')}
              </span>
              <span className="text-xl text-slate-500 line-through">
                Rp {sampleProduct.originalPrice.toLocaleString('id-ID')}
              </span>
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                18% OFF
              </span>
            </div>

            {/* Description */}
            <p className="text-slate-700 leading-relaxed">
              {sampleProduct.description}
            </p>

            {/* Features */}
            <div>
              <h3 className="font-medium text-slate-900 mb-3">Keunggulan Produk:</h3>
              <ul className="space-y-2">
                {sampleProduct.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <button className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2">
                  <ShoppingCartIcon className="w-5 h-5" />
                  <span>Tambah ke Keranjang</span>
                </button>
                <button className="p-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  <HeartIcon className="w-6 h-6 text-slate-600" />
                </button>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-slate-600">
                <TruckIcon className="w-5 h-5" />
                <span className="text-sm">Gratis ongkir untuk pembelian minimal Rp 150.000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mb-12">
          <ReviewSection 
            productId={sampleProduct.id}
            productName={sampleProduct.name}
          />
        </div>

        {/* Demo Information */}
        <div className="bg-white border border-slate-200 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Informasi Demo</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                🌟 Fitur Review System
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li>• Rating dan komentar produk</li>
                <li>• Upload foto review</li>
                <li>• Filter dan sorting review</li>
                <li>• Review statistics & analytics</li>
                <li>• Tanya jawab produk</li>
                <li>• Admin response system</li>
                <li>• Helpful/unhelpful voting</li>
                <li>• Verified purchase badges</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                🤖 Fitur Chatbot
              </h3>
              <ul className="space-y-2 text-slate-700">
                <li>• AI conversation flow</li>
                <li>• Knowledge base integration</li>
                <li>• Quick reply suggestions</li>
                <li>• Product information support</li>
                <li>• Order assistance</li>
                <li>• Shipping cost calculator</li>
                <li>• FAQ automation</li>
                <li>• Conversation history</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 p-6 bg-indigo-50 border border-indigo-200 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-2">💡 Cara Testing</h4>
            <div className="text-indigo-800 text-sm space-y-1">
              <p><strong>Review System:</strong> Klik "Tulis Review" untuk mencoba form review, atau "Tanya Jawab" untuk sistem Q&A</p>
              <p><strong>Chatbot:</strong> Klik ikon chatbot di pojok kanan bawah untuk memulai percakapan</p>
              <p><strong>Data:</strong> Semua menggunakan data dummy yang realistis untuk testing UI/UX</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget position="bottom-right" />
    </div>
  );
};

export default ContentManagementDemo;