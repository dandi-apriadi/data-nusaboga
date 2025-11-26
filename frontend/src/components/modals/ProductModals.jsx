import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  MdClose, 
  MdSave, 
  MdEdit,
  MdVisibility,
  MdDelete,
  MdCloudUpload,
  MdImage,
  MdInventory,
  MdAttachMoney,
  MdCategory,
  MdDescription,
  MdStar,
  MdTrendingUp,
  MdShoppingCart,
  MdWarning,
  MdCheckCircle,
  MdCancel,
  MdFileUpload,
  MdTableChart
} from "react-icons/md";

// Base Modal Component
const Modal = ({ isOpen, onClose, children, size = "lg" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
        <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} transform transition-all duration-300 max-h-[90vh] overflow-hidden`}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Product Detail Modal
export const ProductDetailModal = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  // Safely format dates to avoid runtime errors when value is null/undefined/invalid
  const safeFormatDate = (value, fmt) => {
    if (!value) return '-';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d?.getTime?.())) return '-';
    try {
      return format(d, fmt, { locale: id });
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Habis", color: "text-red-600", bg: "bg-red-100" };
    if (stock <= 10) return { label: "Menipis", color: "text-amber-600", bg: "bg-amber-100" };
    return { label: "Tersedia", color: "text-green-600", bg: "bg-green-100" };
  };

  const stockStatus = getStockStatus(product.stock);
  const cost = Number(product.cost_price || 0);
  const original = Number(product.original_price || product.price || 0);
  const sell = Number(product.price || 0);
  // Prefer backend-provided profit_per_unit & margin if present
  const profitPerUnit = product.profit_per_unit !== undefined ? Number(product.profit_per_unit) : ((sell - cost) > 0 ? (sell - cost) : 0);
  const marginPct = product.margin_percent !== undefined ? Number(product.margin_percent) : (sell > 0 && profitPerUnit > 0 ? (profitPerUnit / sell) * 100 : 0);
  const discountPct = original > sell && original > 0 ? ((original - sell) / original) * 100 : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Detail Produk</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
        {/* Product Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <img
                src={product.image}
                alt={product.name}
                crossOrigin="anonymous"
                className="w-full h-64 object-cover rounded-xl shadow-lg"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=6366f1&color=fff&size=300`;
                }}
              />
            </div>
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{product.name}</h3>
                  <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                    {product.category_name || '-'}
                  </span>
                </div>
                <div className="text-right">
                  <div className="mb-1">
                    <p className="text-3xl font-bold text-indigo-600 leading-tight">{formatCurrency(sell)}</p>
                    {original && original !== sell && (
                      <div className="text-sm text-slate-500 line-through">{formatCurrency(original)}</div>
                    )}
                  </div>
                  {(discountPct > 0) && (
                    <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-600 mr-2">
                      -{discountPct.toFixed(0)}%
                    </div>
                  )}
                  <div className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                    <MdInventory className="w-4 h-4 mr-1" />
                    {stockStatus.label} ({product.stock})
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Terjual</p>
                      <p className="text-2xl font-bold text-green-700">{product.loading_stats ? '...' : product.sold}</p>
                    </div>
                    <MdShoppingCart className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">Revenue</p>
                      <p className="text-2xl font-bold text-purple-700">{product.loading_stats ? '...' : formatCurrency(product.revenue)}</p>
                    </div>
                    <MdAttachMoney className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <MdStar 
                      key={i} 
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                  <span className="ml-2 text-slate-600">({product.rating}) • {product.reviews} ulasan</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed mb-4">{product.description || "Tidak ada deskripsi tersedia."}</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Berat</p>
                  <p className="text-sm font-semibold text-slate-700">{product.weight_grams || 0} g</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Cost Price</p>
                  <p className="text-sm font-semibold text-slate-700">{formatCurrency(cost)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Profit/Unit</p>
                  <p className="text-sm font-semibold text-green-600">{formatCurrency(profitPerUnit)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Margin</p>
                  <p className="text-sm font-semibold text-indigo-600">{marginPct.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Diskon</p>
                  <p className="text-sm font-semibold text-rose-600">{discountPct.toFixed(1)}%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-xs text-slate-500">Slug</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono text-slate-700 truncate max-w-[110px]">/{product.slug || '-'}</p>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(product.slug || '')}
                      className="text-indigo-600 hover:text-indigo-800 text-xs"
                    >Copy</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Informasi Detail</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">ID Produk</label>
                <p className="text-slate-800 font-medium">#{product.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                    product.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {product.active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Kategori</label>
                <p className="text-slate-800 font-medium">{product.category_name || '-'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Tanggal Dibuat</label>
                <p className="text-slate-800 font-medium">{safeFormatDate(product.created, "dd MMMM yyyy")}</p>
              </div>
              {(
                // Render section only if we have some value, but still format safely
                product.updated !== undefined && product.updated !== null
              ) && (
                <div>
                  <label className="text-sm font-medium text-slate-600">Terakhir Diperbarui</label>
                  <p className="text-slate-800 font-medium">{safeFormatDate(product.updated, "dd MMMM yyyy HH:mm")}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-600">Profit per Unit (Computed)</label>
                <p className="text-green-600 font-bold">{formatCurrency(profitPerUnit)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Total Profit</label>
                <p className="text-green-600 font-bold">{product.loading_stats ? '...' : formatCurrency(product.total_profit !== undefined ? product.total_profit : (profitPerUnit * (product.sold || 0)))}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Tutup
          </button>
          <button className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 flex items-center">
            <MdEdit className="w-4 h-4 mr-2" />
            Edit Produk
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Product Form Modal (Add/Edit)
export const ProductFormModal = ({ isOpen, onClose, product, onSave, categories = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    original_price: '',
    cost_price: '',
    stock: '',
    weight_grams: '',
    category_id: '', // store id directly
    image: null,
    imagePreview: '',
    slug: '',
    active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Helper function to generate slug from name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim(); // Remove leading/trailing spaces
  };

  // categories now provided via props (id, name)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        original_price: product.original_price || '',
        cost_price: product.cost_price || '',
        stock: product.stock || '',
        weight_grams: product.weight_grams || '',
        category_id: product.category_id || '',
        image: null,
        imagePreview: product.image || '',
        slug: product.slug || '',
        active: product.active !== undefined ? product.active : true
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        cost_price: '',
        stock: '',
        weight_grams: '',
        category_id: '',
        image: null,
        imagePreview: '',
        slug: '',
        active: true
      });
    }
    setErrors({});
  }, [product, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Nama produk wajib diisi";
    if (!formData.price || formData.price <= 0) newErrors.price = "Harga harus lebih dari 0";
    if (!formData.stock || formData.stock < 0) newErrors.stock = "Stok tidak boleh negatif";
  if (!formData.category_id) newErrors.category_id = "Kategori wajib dipilih";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log("Modal formData:", formData);
      console.log("Product prop:", product);
      
      // Create FormData for file upload
      const formDataPayload = new FormData();
      
      // Add all form fields
      formDataPayload.append('name', formData.name || '');
      if (formData.category_id) formDataPayload.append('category_id', formData.category_id);
      formDataPayload.append('description', formData.description || '');
      formDataPayload.append('price', parseFloat(formData.price) || 0);
      formDataPayload.append('original_price', parseFloat(formData.original_price) || 0);
      formDataPayload.append('cost_price', parseFloat(formData.cost_price) || 0);
  formDataPayload.append('stock', parseInt(formData.stock) || 0);
      formDataPayload.append('weight_grams', parseInt(formData.weight_grams) || 500);
      formDataPayload.append('slug', formData.slug || '');
      formDataPayload.append('active', formData.active ? true : false);
      
      // Add product ID if editing
      if (product?.id) {
        formDataPayload.append('id', product.id);
        console.log("Adding product ID for update:", product.id);
      }
      
      // Add image file if selected
      if (formData.image) {
        formDataPayload.append('image', formData.image);
      }
      
      // Debug FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formDataPayload.entries()) {
        console.log(key, value);
      }
      
      await onSave(formDataPayload);
      onClose();
    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-generate slug when name changes
      if (field === 'name' && value.trim()) {
        newData.slug = generateSlug(value);
      }
      
      return newData;
    });
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, image: 'Format file harus JPG, PNG, atau WebP' }));
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Ukuran file maksimal 5MB' }));
        return;
      }

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ 
          ...prev, 
          image: file,
          imagePreview: reader.result 
        }));
      };
      reader.readAsDataURL(file);

      // Clear any previous errors
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-h-[calc(90vh-80px)] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Dasar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Produk *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.name ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Masukkan nama produk"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleInputChange('category_id', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.category_id ? 'border-red-300' : 'border-slate-300'
                  }`}
                >
                  <option value="">Pilih kategori</option>
                  {/* Current category first */}
                  {formData.category_id && categories.find(c => c.id === formData.category_id) && (
                    <option key={`current-${formData.category_id}`} value={formData.category_id}>
                      {categories.find(c => c.id === formData.category_id)?.name} (saat ini)
                    </option>
                  )}
                  {categories
                    .filter(cat => cat.id !== 'all' && cat.id !== formData.category_id)
                    .map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
                {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Harga (Rp) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.price ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Stok *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleInputChange('stock', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.stock ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="0"
                  min="0"
                />
                {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Harga Asli (Rp)
                </label>
                <input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => handleInputChange('original_price', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-500">Harga sebelum diskon (opsional)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Harga Modal (Rp)
                </label>
                <input
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => handleInputChange('cost_price', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-500">Harga pokok produksi</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Berat (gram)
                </label>
                <input
                  type="number"
                  value={formData.weight_grams}
                  onChange={(e) => handleInputChange('weight_grams', e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="500"
                  min="0"
                />
                <p className="mt-1 text-xs text-slate-500">Berat produk dalam gram</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug URL (Otomatis)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  readOnly
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                  placeholder="Akan dibuat otomatis dari nama produk"
                />
                <p className="mt-1 text-xs text-slate-500">
                  URL ramah SEO - dibuat otomatis dari nama produk
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Deskripsi Produk
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Masukkan deskripsi produk (opsional)"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gambar Produk
            </label>
            <div className="space-y-4">
              {/* File Upload Area */}
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                errors.image ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-slate-400'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center">
                    <MdCloudUpload className="w-12 h-12 text-slate-400 mb-3" />
                    <p className="text-slate-600 font-medium mb-1">
                      Klik untuk upload gambar
                    </p>
                    <p className="text-sm text-slate-500">
                      JPG, PNG, atau WebP maksimal 5MB
                    </p>
                  </div>
                </label>
              </div>

              {errors.image && (
                <p className="text-sm text-red-600 flex items-center">
                  <MdWarning className="w-4 h-4 mr-1" />
                  {errors.image}
                </p>
              )}

              {/* Image Preview */}
              {formData.imagePreview && (
                <div className="relative">
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    crossOrigin="anonymous"
                    className="w-full max-w-xs h-48 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: null, imagePreview: '' }))}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                  >
                    <MdClose className="w-4 h-4" />
                  </button>
                  <div className="mt-2 text-sm text-slate-600">
                    {formData.image instanceof File ? (
                      <span className="flex items-center">
                        <MdImage className="w-4 h-4 mr-1" />
                        {formData.image.name} ({(formData.image.size / 1024 / 1024).toFixed(1)} MB)
                      </span>
                    ) : (
                      <span className="text-slate-500">Gambar saat ini</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Preview */}
          {formData.name && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-sm font-medium text-slate-600 mb-3">Preview Produk</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Nama:</span>
                  <span className="font-medium text-slate-800">{formData.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">URL Slug:</span>
                  <span className="font-mono text-sm text-indigo-600">
                    /{formData.slug || generateSlug(formData.name)}
                  </span>
                </div>
                {formData.price && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Harga:</span>
                    <span className="font-bold text-indigo-600">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(formData.price)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => handleInputChange('active', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-700">Produk aktif (dapat dipesan)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Menyimpan...
              </>
            ) : (
              <>
                <MdSave className="w-4 h-4 mr-2" />
                {product ? 'Update Produk' : 'Simpan Produk'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Delete Confirm Modal
export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, onDeactivate, productName }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    setErrorMsg('');
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting product:", error);
      const msg = error?.response?.data?.msg || error?.message || 'Terjadi kesalahan saat menghapus produk.';
      setErrorMsg(msg);
      setErrorCode(error?.response?.data?.code || '');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!onDeactivate) return;
    setIsDeactivating(true);
    try {
      await onDeactivate();
      onClose();
    } catch (error) {
      console.error('Error deactivating product:', error);
      const msg = error?.response?.data?.msg || error?.message || 'Gagal menonaktifkan produk.';
      setErrorMsg(msg);
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <MdWarning className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Produk</h3>
          <p className="text-slate-600">
            Apakah Anda yakin ingin menghapus produk <strong>"{productName}"</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Tindakan ini tidak dapat dibatalkan.
          </p>
          {errorMsg && (
            <div className="mt-3 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
              {errorMsg}
            </div>
          )}
          {errorCode === 'HAS_DEPENDENCIES' && (
            <div className="mt-2 text-sm text-slate-600">
              Anda dapat menonaktifkan produk agar tidak bisa dipesan tanpa menghapus riwayat transaksi.
            </div>
          )}
        </div>

        <div className="flex justify-center flex-wrap gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          {(errorCode === 'HAS_DEPENDENCIES' || errorMsg) && onDeactivate && (
            <button
              onClick={handleDeactivate}
              disabled={isDeactivating}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isDeactivating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Menonaktifkan...
                </>
              ) : (
                <>Nonaktifkan Produk</>
              )}
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Menghapus...
              </>
            ) : (
              <>
                <MdDelete className="w-4 h-4 mr-2" />
                Ya, Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Bulk Action Modal
export const BulkActionModal = ({ isOpen, onClose, actionType }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState(null);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    setFile(uploadedFile);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`${actionType === 'import' ? 'Import' : 'Update stok'} berhasil!`);
      onClose();
    } catch (error) {
      console.error("Error processing:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getModalContent = () => {
    if (actionType === 'import') {
      return {
        title: 'Import Produk',
        icon: <MdFileUpload className="w-8 h-8 text-blue-600" />,
        description: 'Upload file CSV untuk menambahkan produk secara massal',
        actionLabel: 'Import Produk'
      };
    } else {
      return {
        title: 'Update Stok Massal',
        icon: <MdTableChart className="w-8 h-8 text-green-600" />,
        description: 'Upload file CSV untuk mengupdate stok produk secara massal',
        actionLabel: 'Update Stok'
      };
    }
  };

  const content = getModalContent();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{content.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full">
            {content.icon}
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{content.title}</h3>
          <p className="text-slate-600">{content.description}</p>
        </div>

        {/* File Upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Upload File CSV
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <MdCloudUpload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 mb-1">Klik untuk upload file CSV</p>
              <p className="text-xs text-slate-500">Maksimal 5MB</p>
            </label>
            {file && (
              <div className="mt-3 text-sm text-slate-700">
                File dipilih: <strong>{file.name}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Template Download */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Download Template</h4>
          <p className="text-blue-700 text-sm mb-3">
            Gunakan template CSV yang sudah disediakan untuk memastikan format yang benar.
          </p>
          <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            <MdFileUpload className="w-4 h-4 mr-1" />
            Download Template
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleProcess}
            disabled={!file || isProcessing}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Memproses...
              </>
            ) : (
              <>
                <MdCheckCircle className="w-4 h-4 mr-2" />
                {content.actionLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};