import React, { useEffect, useMemo, useState } from "react";
import ProductFlipCard from '../../components/ProductFlipCard';
import Card from "components/card";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, fetchProducts } from '../../store/slices/productSlice';
import { addWishlistItem, removeWishlistItem, fetchWishlist } from '../../store/slices/wishlistSlice';
import { addToCartApi } from '../../store/slices/cartSlice';
import { PRODUCT_PLACEHOLDER } from '../../utils/media';
import { adaptBackendProducts } from '../../utils/productAdapter';
import { formatIDRCurrency } from '../../utils/format';
import { 
  MdSearch, 
  MdFilterList, 
  MdShoppingCart, 
  MdGridView, 
  MdViewList, 
  MdSort, 
  MdLocalOffer, 
  MdStar, 
  MdTrendingUp,
  MdClose,
  MdAdd,
  MdRemove
} from "react-icons/md";

const Products = () => {
    const [flippedCards, setFlippedCards] = useState({});
    // Toggle flip card
    const toggleFlip = (productId) => {
      setFlippedCards(prev => ({ ...prev, [productId]: !prev[productId] }));
    };
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  // Confirmation modal state
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const dispatch = useDispatch();
  const { categories, items, loading } = useSelector((state) => state.products);
  const wishlistItems = useSelector((state)=> state.wishlist?.items || []);
  const { adding, lastAddedId } = useSelector((state) => state.cart || {});

  // Fetch initial categories & products
  useEffect(() => { dispatch(fetchCategories()); }, [dispatch]);
  useEffect(() => { dispatch(fetchProducts({ q: searchTerm || undefined, category_id: selectedCategory !== 'all' ? selectedCategory : undefined, page: 1, pageSize: 100 })); }, [dispatch, searchTerm, selectedCategory]);

  // Derived categories list
  const allCategories = useMemo(() => [{ id: "all", name: "Semua Produk" }, ...(categories || []).map(c => ({ id: c.category_id, name: c.name }))], [categories]);

  const formatCurrency = formatIDRCurrency;

  // Map backend products to UI shape (no dummy fields)
  const products = useMemo(() => {
    const adapted = adaptBackendProducts(items || []);
    return adapted.map(p => {
      const hasSold = typeof p.sold === 'number' && !Number.isNaN(p.sold);
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        originalPrice: p.originalPrice && p.originalPrice > 0 && p.originalPrice !== p.price ? p.originalPrice : null,
        category: p.categoryId || 'all',
        image: p.image || PRODUCT_PLACEHOLDER,
        stock: p.stock,
        rating: p.rating,
        sold: hasSold ? p.sold : p.reviews, // only fallback when sold is undefined
      };
    });
  }, [items]);

  // Local sort (server returns created_at desc by default). Keeping client sort for UX.
  const sortedProducts = useMemo(() => {
    const list = [...products];
    list.sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        case 'sold': return b.sold - a.sold;
        default: return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [products, sortBy]);

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: "Habis", color: "text-red-600" };
    if (stock <= 5) return { text: "Terbatas", color: "text-amber-600" };
    return { text: "Tersedia", color: "text-green-600" };
  };

  return (
    <>
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Full-width Header */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <MdLocalOffer className="h-8 w-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
              Katalog Produk
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Jelajahi koleksi produk olahan cakalang berkualitas.
            </p>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm text-indigo-100">Total Produk</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{categories.length}</div>
                <div className="text-sm text-indigo-100">Kategori</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="text-2xl font-bold">{products.length ? (products.reduce((s,p)=> s + p.rating,0)/products.length).toFixed(1) : 0}</div>
                <div className="text-sm text-indigo-100">Rata Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters */}
        <Card extra="mb-8 overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari produk..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full sm:w-80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white/90"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="relative">
                  <MdFilterList className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white/90 min-w-48"
                  >
                    {allCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Sort */}
                <div className="relative">
                  <MdSort className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-12 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white/90 min-w-52"
                  >
                    <option value="name">Urutkan: Nama A-Z</option>
                    <option value="price-low">Urutkan: Harga Terendah</option>
                    <option value="price-high">Urutkan: Harga Tertinggi</option>
                    <option value="rating">Urutkan: Rating Tertinggi</option>
                    <option value="sold">Urutkan: Terlaris</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-slate-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md ${viewMode==='grid' ? 'bg-white text-indigo-600 shadow-sm':'text-slate-600'}`}
                  >
                    <MdGridView className="h-5 w-5"/>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md ${viewMode==='list' ? 'bg-white text-indigo-600 shadow-sm':'text-slate-600'}`}
                  >
                    <MdViewList className="h-5 w-5"/>
                  </button>
                </div>
                
                {/* Results Count */}
                <div className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-indigo-600">{loading? '...' : sortedProducts.length}</span> produk
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Products Grid/List */}
        {viewMode==='grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedProducts.map(p => {
              return (
                <ProductFlipCard
                  key={p.id}
                  product={{
                    ...p,
                    price: formatCurrency(p.price),
                    originalPrice: p.originalPrice && p.originalPrice > p.price ? formatCurrency(p.originalPrice) : null,
                  }}
                  isFlipped={!!flippedCards[p.id]}
                  onToggleFlip={() => toggleFlip(p.id)}
                  onAddToCart={() => {
                    setSelectedProduct(p);
                    setQuantity(1);
                    setShowConfirm(true);
                  }}
                />
              );
            })}
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {sortedProducts.map(p => {
              return (
                <ProductFlipCard
                  key={p.id}
                  product={{
                    ...p,
                    price: formatCurrency(p.price),
                  }}
                  isFlipped={!!flippedCards[p.id]}
                  onToggleFlip={() => toggleFlip(p.id)}
                  onAddToCart={() => {
                    setSelectedProduct(p);
                    setQuantity(1);
                    setShowConfirm(true);
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedProducts.length === 0 && (
          <Card extra="rounded-2xl p-16 text-center border-0 bg-white/80 backdrop-blur-sm">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <MdSearch className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">Produk tidak ditemukan</h3>
              <p className="text-slate-600 mb-6">Coba ubah filter atau kata kunci pencarian.</p>
              <button
                onClick={()=> { setSearchTerm(''); setSelectedCategory('all'); setSortBy('name'); }}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                Reset Semua Filter
              </button>
            </div>
          </Card>
        )}
      </div>
    </div>
    {showConfirm && selectedProduct && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=> !adding && setShowConfirm(false)} />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
          <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600" onClick={()=> !adding && setShowConfirm(false)}>
            <MdClose className="h-5 w-5" />
          </button>
          <div className="flex items-start gap-4 mb-5">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-24 h-24 object-cover rounded-xl border border-slate-100"
              onError={(e)=> { e.target.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80'; }}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-slate-800 text-lg mb-1 line-clamp-2">{selectedProduct.name}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-2">{selectedProduct.description}</p>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-indigo-600 font-bold text-lg">{formatCurrency(selectedProduct.price)}</span>
                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                  <span className="text-xs text-slate-400 line-through">{formatCurrency(selectedProduct.originalPrice)}</span>
                )}
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full inline-block bg-slate-100 text-slate-600">Stok tersedia: {selectedProduct.stock}</div>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Jumlah</label>
            <div className="flex items-center gap-3">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
                disabled={quantity <= 1 || adding}
                onClick={()=> setQuantity(q => Math.max(1, q-1))}
              ><MdRemove className="h-5 w-5"/></button>
              <input
                type="number"
                min={1}
                max={selectedProduct.stock}
                value={quantity}
                onChange={(e)=> { const val = parseInt(e.target.value,10); if(!isNaN(val)) setQuantity(Math.min(Math.max(1,val), selectedProduct.stock)); }}
                className="w-20 text-center border border-slate-200 rounded-xl py-2 font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500"
              />
              <button
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40"
                disabled={quantity >= selectedProduct.stock || adding}
                onClick={()=> setQuantity(q => Math.min(selectedProduct.stock, q+1))}
              ><MdAdd className="h-5 w-5"/></button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={()=> !adding && setShowConfirm(false)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
              disabled={adding}
            >Batal</button>
            <button
              onClick={()=> { if(!adding){ dispatch(addToCartApi({ product_id: selectedProduct.id, quantity, price_at_add: selectedProduct.price })).then(()=> { setShowConfirm(false); }); } }}
              disabled={adding || selectedProduct.stock===0}
              className={`px-6 py-2.5 rounded-xl font-semibold inline-flex items-center shadow-md hover:shadow-lg transition-all 
                ${selectedProduct.stock===0 ? 'bg-slate-400 text-white' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'}`}
            >
              {adding ? (
                <>
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" /> Menambahkan...
                </>
              ) : (
                <>
                  <MdShoppingCart className="mr-2 h-5 w-5"/> Tambahkan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default Products;
