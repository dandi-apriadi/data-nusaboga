import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Card from "components/card";

import api from "api/axios";
import { adaptBackendProducts } from "utils/productAdapter";
import { formatIDRCurrency } from "utils/format";
import { ProductFormModal, DeleteConfirmModal, ProductDetailModal } from "components/modals/ProductModals";
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdFilterList, 
  MdInventory,
  MdVisibility,
  MdMoreVert,
  MdGridView,
  MdFileDownload,
  MdCloudUpload,
  MdTrendingUp,
  MdRefresh,
  MdSettings
} from "react-icons/md";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime] = useState(new Date());
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: "all", name: "Semua Kategori", count: 0 }]);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedProductData, setSelectedProductData] = useState(null);

  // Derived normalized products + map
  const adaptedProducts = useMemo(() => adaptBackendProducts(products), [products]);
  const adaptedMap = useMemo(() => Object.fromEntries(adaptedProducts.map(p => [p.product_id, p])), [adaptedProducts]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/catalog/categories");
      // Will compute counts after products fetched
      const mapped = data.map((c) => ({ id: c.category_id, name: c.name, count: 0 }));
      setCategories([{ id: "all", name: "Semua Kategori", count: 0 }, ...mapped]);
    } catch (e) {
      console.error("Gagal mengambil kategori:", e);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = { page: 1, pageSize: 100 };
      if (searchTerm) params.q = searchTerm;
      if (selectedCategory !== "all") params.category_id = selectedCategory;
      const { data } = await api.get("/catalog/products", { params });
      const items = data.items || data || [];
      
      // Debug logging
      console.log('Fetched products:', items.length);
      if (items.length > 0) {
        console.log('First product sample:', {
          name: items[0].name,
          category_id: items[0].category_id,
          ProductCategory: items[0].ProductCategory
        });
      }
      
      setProducts(items);
      // Update category counts based on items
      setCategories((prev) => {
        const base = prev.filter((c) => c.id === "all").concat(
          prev.filter((c) => c.id !== "all").map((c) => ({ ...c, count: 0 }))
        );
        const counts = new Map();
        items.forEach((p) => {
          const cid = p.category_id || p.ProductCategory?.category_id;
          if (!cid) return;
          counts.set(cid, (counts.get(cid) || 0) + 1);
        });
        const updated = base.map((c) =>
          c.id === "all" ? { ...c, count: items.length } : { ...c, count: counts.get(c.id) || 0 }
        );
        return updated;
      });
    } catch (e) {
      console.error("Gagal mengambil produk:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedCategory]);

  const stats = useMemo(() => ({
    totalProducts: adaptedProducts.length,
    activeProducts: adaptedProducts.filter(p => p.active).length,
    outOfStock: adaptedProducts.filter(p => p.stock === 0).length,
    lowStock: adaptedProducts.filter(p => p.stock > 0 && p.stock <= 10).length
  }), [adaptedProducts]);

  const formatCurrency = formatIDRCurrency;

  // Helper function to get category name by ID
  const getCategoryName = (product) => {
    // Try adapted product first
    if (product.categoryName) return product.categoryName;
    
    // Try ProductCategory relation
    if (product.ProductCategory?.name) return product.ProductCategory.name;
    
    // Try finding in categories list by ID
    const categoryId = product.categoryId || product.category_id || product.ProductCategory?.category_id;
    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category && category.name !== "Semua Kategori") {
        return category.name;
      }
      // If not found in categories list but has ID, log it
      console.log(`Category ID ${categoryId} not found in categories list for product:`, product.name);
    }
    
    // Debug log when no category found
    console.log('No category found for product:', {
      name: product.name,
      categoryId: product.categoryId,
      category_id: product.category_id,
      ProductCategory: product.ProductCategory,
      categoriesAvailable: categories.map(c => ({ id: c.id, name: c.name }))
    });
    
    return 'Tanpa Kategori';
  };

  const getStockBadge = (stock) => {
    if (stock === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs rounded-full font-medium bg-red-100 text-red-800 border border-red-200">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1.5"></span>
          Habis
        </span>
      );
    } else if (stock <= 10) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs rounded-full font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
          Menipis
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs rounded-full font-medium bg-green-100 text-green-800 border border-green-200">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
          Tersedia
        </span>
      );
    }
  };

  const getStatusBadge = (active) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs rounded-full font-medium border ${
        active 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-slate-100 text-slate-600 border-slate-200'
      }`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          active ? 'bg-green-500' : 'bg-slate-400'
        }`}></span>
        {active ? 'Aktif' : 'Nonaktif'}
      </span>
    );
  };

  const getRatingStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-amber-400' : 'text-slate-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="text-xs text-slate-600 ml-1">({rating})</span>
      </div>
    );
  };

  const handleRefresh = async () => {
    await fetchProducts();
  };
  const filteredProducts = useMemo(() => {
    return adaptedProducts.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [adaptedProducts, searchTerm, selectedCategory]);

  // Ekspor produk (berdasarkan filter saat ini) ke CSV
  const handleExportCsv = () => {
    try {
      const headers = [
        'ID Produk',
        'Nama',
        'Kategori',
        'Harga',
        'Harga Asli',
        'Harga Pokok',
        'Stok',
        'Berat (gram)',
        'Aktif',
        'Rating',
        'Jumlah Ulasan',
        'Terjual',
        'Dibuat',
        'Diperbarui',
        'Slug',
        'Gambar URL'
      ];

      const escapeCsv = (val) => {
        if (val === null || val === undefined) return '';
        const s = String(val);
        if (/[",\n]/.test(s)) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const rows = filteredProducts.map((p) => {
        const categoryName = getCategoryName(p);
        const created = p.createdAt || p.created_at || p.created || null;
        const updated = p.updatedAt || p.updated_at || p.updated || null;
        return [
          p.product_id || p.id || '',
          p.name || '',
          categoryName || '',
          (p.price ?? ''),
          (p.original_price ?? ''),
          (p.cost_price ?? ''),
          (p.stock ?? ''),
          (p.weightGrams ?? p.weight_grams ?? ''),
          typeof p.active === 'boolean' ? (p.active ? 'true' : 'false') : '',
          (p.rating ?? p.rating_avg ?? ''),
          (p.reviews ?? p.reviews_count ?? ''),
          (p.sold ?? p.sold_count ?? 0),
          created ? format(new Date(created), 'yyyy-MM-dd HH:mm') : '',
          updated ? format(new Date(updated), 'yyyy-MM-dd HH:mm') : '',
          p.slug || '',
          p.image || p.image_url || ''
        ].map(escapeCsv).join(',');
      });

      const csv = ['\uFEFF' + headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const filename = `produk_${format(now, 'yyyy-MM-dd_HH-mm')}.csv`;
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Gagal mengekspor CSV:', e);
      alert('Gagal mengekspor data. Coba lagi.');
    }
  };

  const openAddProduct = () => {
    setSelectedProductData(null);
    setOpenForm(true);
  };

  const openEditProduct = (p) => {
    const a = adaptedMap[p.product_id];
    setSelectedProductData({
      id: p.product_id,
      name: a?.name || p.name,
      description: a?.description || p.description,
      price: a?.price ?? Number(p.price || 0),
      original_price: a?.originalPrice ?? Number(p.original_price || 0),
      cost_price: a?.costPrice ?? Number(p.cost_price || 0),
      stock: a?.stock ?? Number(p.stock || 0),
      weight_grams: a?.weightGrams ?? Number(p.weight_grams || 500),
      category_id: a?.categoryId || p.category_id || p.ProductCategory?.category_id || '',
      image: a?.image || '',
      slug: a?.slug || p.slug || '',
      active: a?.active ?? !!p.active,
      created: a?.createdAt || p.created_at,
      rating: a?.rating ?? Number(p.rating_avg || 0),
      reviews: a?.reviews ?? Number(p.reviews_count || 0),
    });
    setOpenForm(true);
  };

  const openViewProduct = (p) => {
    const a = adaptedMap[p.product_id];
    const categoryName = a?.categoryName || p.ProductCategory?.name || (() => {
      const cid = a?.categoryId || p.category_id || p.ProductCategory?.category_id;
      const found = categories.find(c => c.id === cid);
      return found?.name || '-';
    })();
    const baseData = {
      id: p.product_id,
      name: a?.name || p.name,
      description: a?.description || p.description,
      price: a?.price ?? Number(p.price || 0),
      original_price: a?.originalPrice ?? Number(p.original_price || 0),
      cost_price: a?.costPrice ?? Number(p.cost_price || 0),
      stock: a?.stock ?? Number(p.stock || 0),
      weight_grams: a?.weightGrams ?? Number(p.weight_grams || 500),
      category_id: a?.categoryId || p.category_id || p.ProductCategory?.category_id || '',
      category_name: categoryName,
      image: a?.image || '',
      slug: a?.slug || p.slug || '',
      active: a?.active ?? !!p.active,
      created: a?.createdAt || p.created_at,
      updated: a?.updatedAt || p.updated_at,
      rating: a?.rating ?? Number(p.rating_avg || 0),
      reviews: a?.reviews ?? Number(p.reviews_count || 0),
      sold: 0,
      revenue: 0,
      total_profit: 0,
      loading_stats: true,
      profit_per_unit: ((a?.price ?? Number(p.price || 0)) - (a?.costPrice ?? Number(p.cost_price || 0))) || 0,
    };
    setSelectedProductData(baseData);
    setOpenDetail(true);

    api.get(`/catalog/products/${p.product_id}/stats`)
      .then(res => {
        setSelectedProductData(prev => prev && prev.id === p.product_id ? {
          ...prev,
          sold: res.data.sold ?? prev.sold,
          revenue: res.data.revenue ?? prev.revenue,
          total_profit: res.data.total_profit ?? prev.total_profit,
          profit_per_unit: res.data.profit_per_unit ?? prev.profit_per_unit,
          margin_percent: res.data.margin_percent ?? prev.margin_percent,
          loading_stats: false,
        } : prev);
      })
      .catch(err => {
        console.error('Gagal mengambil statistik produk', err?.response?.data || err.message);
        setSelectedProductData(prev => prev && prev.id === p.product_id ? { ...prev, loading_stats: false } : prev);
      });
  };

  const openDeleteProduct = (p) => {
    setSelectedProductData({ id: p.product_id, name: p.name });
    setOpenDelete(true);
  };

  const handleSaveProduct = async (formDataPayload) => {
    try {
      console.log("Received FormData from modal");
      
      // Debug FormData contents
      console.log("FormData contents:");
      for (let [key, value] of formDataPayload.entries()) {
        console.log(key, value);
      }
      
      let response;  
      
      // Check if this is an update (has ID) or create (no ID)
      const productId = formDataPayload.get('id');
      
      if (productId) {
        // Update existing product
        response = await api.put(`/catalog/products/${productId}`, formDataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log("Product updated successfully:", response.data);
      } else {
        // Create new product
        response = await api.post("/catalog/products", formDataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        console.log("Product created successfully:", response.data);
      }
      
      // Refresh the products list
      await fetchProducts();
      
      // Close the modal
      setOpenForm(false);
      setSelectedProductData(null);
      
    } catch (error) {
      const productId = formDataPayload.get('id');
      console.error("Error saving product:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      // You can add user-friendly error display here
      alert(`Error ${productId ? 'updating' : 'creating'} product: ${error.response?.data?.msg || error.message}`);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedProductData?.id) return;
    await api.delete(`/catalog/products/${selectedProductData.id}`, { params: { force: true } });
    setOpenDelete(false);
    setSelectedProductData(null);
    await fetchProducts();
  };

  const handleDeactivateProduct = async () => {
    if (!selectedProductData?.id) return;
    await api.put(`/catalog/products/${selectedProductData.id}`, { active: false });
    setOpenDelete(false);
    // If detail modal was open, close it too
    setOpenDetail(false);
    setSelectedProductData(null);
    await fetchProducts();
  };

  const StatCard = ({ icon, title, value, subtitle, bgColor, iconColor, trend }) => (
    <Card extra="relative overflow-hidden group hover:shadow-xl hover:scale-105 transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bgColor} group-hover:scale-110 transition-transform duration-300`}>
            {React.cloneElement(icon, { className: `h-6 w-6 ${iconColor}` })}
          </div>
          {trend && (
            <div className="flex items-center text-green-600">
              <MdTrendingUp className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">+{trend}%</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-1">{value}</h3>
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className={`absolute bottom-0 left-0 right-0 h-1 ${bgColor}`}></div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Full-width Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                <MdInventory className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Kelola Produk
                </h1>
                <p className="text-slate-600 font-medium">
                  Manajemen produk olahan cakalang premium
                </p>
                <p className="text-sm text-slate-500 mt-1 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Terakhir diperbarui: {format(currentTime, "dd MMMM yyyy, HH:mm", { locale: id })}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <MdRefresh className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                
                <button
                  onClick={handleExportCsv}
                  disabled={isLoading || filteredProducts.length === 0}
                  title="Ekspor produk yang sedang difilter ke CSV"
                  className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <MdFileDownload className="w-4 h-4 mr-2" />
                  Ekspor Data
                </button>
              </div>
              
              <button onClick={openAddProduct} className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg">
                <MdAdd className="w-4 h-4 mr-2" />
                Tambah Produk Baru
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MdInventory />}
            title="Total Produk"
            value={stats.totalProducts}
            subtitle="Semua kategori"
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
            trend={12}
          />
          <StatCard
            icon={<MdVisibility />}
            title="Produk Aktif"
            value={stats.activeProducts}
            subtitle="Dapat dipesan"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
            trend={8}
          />
          <StatCard
            icon={<MdDelete />}
            title="Stok Habis"
            value={stats.outOfStock}
            subtitle="Perlu restock"
            bgColor="bg-gradient-to-br from-red-100 to-red-200"
            iconColor="text-red-600"
          />
          <StatCard
            icon={<MdFilterList />}
            title="Stok Menipis"
            value={stats.lowStock}
            subtitle="≤ 10 item"
            bgColor="bg-gradient-to-br from-amber-100 to-amber-200"
            iconColor="text-amber-600"
          />
        </div>
        {/* Advanced Filters & Search */}
        <Card extra="mb-8 overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative flex-1 min-w-0">
                  <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari produk berdasarkan nama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200 hover:border-slate-400"
                  />
                </div>
                
                <div className="relative">
                  <MdFilterList className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white shadow-sm transition-all duration-200 hover:border-slate-400 min-w-[200px]"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-600 font-medium">
                  {isLoading ? 'Memuat…' : `${filteredProducts.length} produk ditemukan`}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Products Content */}
          // Grid View - Compact Modern Design
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.product_id} extra="group relative overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 ease-out hover:-translate-y-1">
                {/* Compact Image Section */}
                <div className="relative overflow-hidden h-40">
                  <img
                    src={product.image}
                    alt={product.name}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name || 'Produk')}&background=6366f1&color=fff&size=300`;
                    }}
                  />
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Compact Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] rounded-md font-medium ${
                      product.active 
                        ? 'bg-green-500 text-white' 
                        : 'bg-slate-400 text-white'
                    }`}>
                      {product.active ? '●' : '○'}
                    </span>
                  </div>
                  
                  {/* Compact Stock Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] rounded-md font-medium ${
                      product.stock === 0 
                        ? 'bg-red-500 text-white' 
                        : product.stock <= 10 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {product.stock}
                    </span>
                  </div>
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 p-2">
                    <button 
                      onClick={() => openViewProduct(product)} 
                      className="bg-white/95 hover:bg-white text-indigo-600 p-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
                      title="Detail"
                    >
                      <MdVisibility className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openEditProduct(product)} 
                      className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
                      title="Edit"
                    >
                      <MdEdit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => openDeleteProduct(product)} 
                      className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-xs font-medium transition-all duration-200 shadow-lg"
                      title="Hapus"
                    >
                      <MdDelete className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {/* Compact Content Section */}
                <div className="p-3">
                  {/* Compact Category Badge */}
                  <div className="mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-full border border-indigo-100">
                      {getCategoryName(product)}
                    </span>
                  </div>
                  
                  {/* Compact Product Name */}
                  <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 min-h-[40px] leading-tight">
                    {product.name}
                  </h3>
                  
                  {/* Compact Price */}
                  <div className="mb-2">
                    <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatCurrency(product.price)}
                    </p>
                    {product.original_price && product.original_price > product.price && (
                      <p className="text-[10px] text-slate-400 line-through">
                        {formatCurrency(product.original_price)}
                      </p>
                    )}
                  </div>
                  
                  {/* Compact Stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <MdTrendingUp className="w-3 h-3 text-green-600" />
                      <span className="font-medium">{product.sold || 0}</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-2.5 h-2.5 ${i < Math.floor(Number(product.rating_avg || 0)) ? 'text-amber-400' : 'text-slate-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Bottom Accent Line */}
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </Card>
            ))}
          </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <Card extra="p-12 text-center shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="max-w-md mx-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mx-auto mb-6">
                <MdInventory className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                {searchTerm || selectedCategory !== "all" ? "Produk tidak ditemukan" : "Belum ada produk"}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {searchTerm || selectedCategory !== "all" 
                  ? "Coba ubah kata kunci pencarian atau filter kategori yang dipilih."
                  : "Mulai dengan menambahkan produk olahan cakalang premium pertama Anda untuk memperluas katalog."
                }
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                {(searchTerm || selectedCategory !== "all") && (
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
                <button onClick={openAddProduct} className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg">
                  <MdAdd className="w-4 h-4 mr-2" />
                  Tambah Produk Baru
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions Floating Button removed as requested */}
      </div>
      {/* Modals */}
      <ProductFormModal
        isOpen={openForm}
        onClose={() => setOpenForm(false)}
        product={selectedProductData}
        onSave={handleSaveProduct}
        categories={categories.filter(c => c.id !== 'all').map(c => ({ id: c.id, name: c.name }))}
      />
      <DeleteConfirmModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleConfirmDelete}
        onDeactivate={handleDeactivateProduct}
        productName={selectedProductData?.name || ''}
      />
      <ProductDetailModal
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        product={selectedProductData}
      />
    </div>
  );
};

export default Products;
