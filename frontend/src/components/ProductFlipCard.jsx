import React from 'react';
import { Link } from 'react-router-dom';
import {
  MdShoppingCart,
  MdRestaurant,
  MdVerified
} from 'react-icons/md';
import { FiHeart, FiArrowRight, FiPackage } from 'react-icons/fi';

const ProductFlipCard = ({ product, isFlipped, onToggleFlip, onAddToCart }) => {
  return (
    <div
      className={`flip-card ${isFlipped ? 'flipped' : ''}`}
      style={{ minHeight: '450px' }}
    >
      <div className="flip-card-inner">
        {/* FRONT SIDE - Product Card */}
        <div className="flip-card-front">
          <div className="group relative bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200/60 hover:border-[#FF6B6B]/30 h-full">
            {/* Premium Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B6B]/0 via-transparent to-[#4ECDC4]/0 group-hover:from-[#FF6B6B]/5 group-hover:to-[#4ECDC4]/5 transition-all duration-300 rounded-3xl pointer-events-none z-[5]" />
            
            {/* Image Container */}
            <div className="relative overflow-hidden rounded-t-3xl aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50">
              <img
                src={product.image}
                alt={product.name}
                crossOrigin="anonymous"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300/F5F5F5/A5352D?text=Produk';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ease-out"
              />
              {/* Top Badges */}
              <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-start justify-between">
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-white px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-black shadow-lg shadow-[#FFD700]/40 backdrop-blur-sm border border-white/30 transform hover:scale-110 transition-transform duration-300">
                  <span>⭐</span>
                  <span className="hidden sm:inline">TERLARIS</span>
                  <span className="sm:hidden">★</span>
                </div>
              </div>
              {/* Bottom Info */}
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-end justify-between">
                {/* Detail button only, no sold info */}
                <div />
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                  <button 
                    onClick={onToggleFlip}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl hover:bg-[#4ECDC4] hover:text-white transition-all duration-300 text-[10px] sm:text-xs font-black group/quick border border-white/60"
                  >
                    <span className="hidden sm:inline">Detail</span>
                    <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover/quick:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
            {/* Product Info */}
            <div className="p-3 sm:p-4 lg:p-5 relative z-20">
              <h3 className="font-black text-base sm:text-lg text-slate-800 mb-3 sm:mb-4 group-hover:text-[#A5352D] transition-colors line-clamp-2 min-h-[2.5rem] leading-snug">
                {product.name}
              </h3>
              <div className="flex items-center justify-between pt-3 sm:pt-4 border-t-2 border-slate-100 group-hover:border-[#FF6B6B]/20 transition-colors">
                <div className="flex-1">
                  <p className="text-[10px] text-slate-500 font-semibold mb-0.5 tracking-wide uppercase">Harga</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl lg:text-2xl font-black bg-gradient-to-r from-[#A5352D] via-[#D08863] to-[#A5352D] bg-clip-text text-transparent">
                      {product.price}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddToCart) {
                      onAddToCart();
                    }
                  }}
                  disabled={product.stock === 0}
                  aria-label="Add to cart"
                  className="relative p-2.5 sm:p-3 bg-gradient-to-r from-[#FF6347] via-[#FF4500] to-[#FF6347] text-white rounded-xl hover:shadow-2xl hover:shadow-[#FF6347]/50 transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed group/cart overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover/cart:translate-x-full transition-transform duration-700" />
                  <MdShoppingCart className="relative h-4 w-4 sm:h-5 sm:w-5 group-hover/cart:rotate-12 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* BACK SIDE - Description */}
        <div className="flip-card-back">
          <div className="relative bg-gradient-to-br from-[#A5352D] via-[#D08863] to-[#A5352D] rounded-3xl shadow-xl border-2 border-white/20 h-full overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}></div>
            </div>
            <div className="relative z-10 p-4 sm:p-5 flex flex-col h-full">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFlip();
                }}
                className="absolute top-3 right-3 z-50 p-1.5 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/40 hover:scale-110 transition-all duration-300 group cursor-pointer"
                aria-label="Kembali"
                type="button"
              >
                <svg className="w-4 h-4 text-white group-hover:rotate-90 transition-transform duration-300 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 className="text-lg sm:text-xl font-black text-white mb-3 pr-8 leading-tight">
                {product.name}
              </h3>
              <div className="flex-1 overflow-y-auto mb-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                  <h4 className="text-xs font-bold text-white/90 mb-1.5 flex items-center gap-1.5">
                    <MdRestaurant className="w-3.5 h-3.5" />
                    Deskripsi Produk
                  </h4>
                  <p className="text-xs text-white/80 leading-relaxed">
                    {product.description || 'Produk olahan ikan cakalang premium dengan kualitas terjamin. Diproses dengan resep tradisional dan bahan-bahan pilihan untuk menghasilkan cita rasa autentik yang lezat.'}
                  </p>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <MdVerified className="w-4 h-4 text-white/90" />
                    <span className="font-semibold">Stok:</span>
                    <span className="text-white/90">
                      {product.stock > 0 ? `${product.stock} tersedia` : 'Stok habis'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFlipCard;
