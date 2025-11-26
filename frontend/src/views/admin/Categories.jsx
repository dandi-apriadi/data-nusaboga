import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Card from "components/card";
import api from "api/axios";
// ResponsiveTable removed: categories will use card-only grid view
import { CategoryFormModal, DeleteConfirmModal, CategoryDetailModal } from "components/modals/CategoryModals";
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdSearch, 
  MdFilterList, 
  MdCategory,
  MdVisibility,
  MdMoreVert,
  MdFileDownload,
  MdCloudUpload,
  MdTrendingUp,
  MdRefresh,
  MdSettings
} from "react-icons/md";

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  // viewMode removed: categories will display as cards only
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime] = useState(new Date());
  const [categories, setCategories] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/catalog/categories");
      setCategories(data || []);
    } catch (e) {
      console.error("Gagal mengambil kategori:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const stats = useMemo(() => ({
    totalCategories: categories.length,
    activeCategories: categories.filter(c => c.active !== false).length,
    categoriesWithProducts: categories.filter(c => (c.product_count || 0) > 0).length,
    emptyCategories: categories.filter(c => !c.product_count || c.product_count === 0).length
  }), [categories]);

  const handleRefresh = async () => {
    await fetchCategories();
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [categories, searchTerm]);

  const openAddCategory = () => {
    setSelectedCategoryData(null);
    setOpenForm(true);
  };

  const openEditCategory = (c) => {
    // Map backend category to modal form shape
    setSelectedCategoryData({
      id: c.category_id,
      name: c.name,
      slug: c.slug || "",
      description: c.description || "",
      created: c.created_at,
      product_count: c.product_count || 0
    });
    setOpenForm(true);
  };

  const openViewCategory = (c) => {
    setSelectedCategoryData({
      id: c.category_id,
      name: c.name,
      slug: c.slug || "",
      description: c.description || "",
      created: c.created_at,
      product_count: c.product_count || 0
    });
    setOpenDetail(true);
  };

  const openDeleteCategory = (c) => {
    setSelectedCategoryData({ id: c.category_id, name: c.name });
    setOpenDelete(true);
  };

  const handleSaveCategory = async (formCategory) => {
    // Map modal category shape to backend payload
    const payload = {
      name: formCategory.name,
      slug: formCategory.slug || null,
      description: formCategory.description || null,
    };
    if (!formCategory.id) {
      await api.post("/catalog/categories", payload);
    } else {
      await api.put(`/catalog/categories/${formCategory.id}`, payload);
    }
    await fetchCategories();
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategoryData?.id) return;
    try {
      await api.delete(`/catalog/categories/${selectedCategoryData.id}`);
      setOpenDelete(false);
      setSelectedCategoryData(null);
      await fetchCategories();
    } catch (e) {
      const msg = e?.response?.data?.msg || 'Gagal menghapus kategori';
      if (e?.response?.status === 400 && e?.response?.data?.product_count > 0) {
        alert(`${msg}. Masih ada ${e.response.data.product_count} produk dalam kategori ini. Pindahkan atau hapus produk terlebih dahulu.`);
      } else {
        alert(msg);
      }
    }
  };

  // Export filtered categories to CSV (client-side)
  const handleExportCsv = () => {
    try {
      const headers = [
        'ID',
        'Nama',
        'Slug',
        'Deskripsi',
        'Jumlah Produk',
        'Dibuat'
      ];

      const escapeCsv = (val) => {
        const s = String(val ?? '').replace(/"/g, '""');
        return /[",\n]/.test(s) ? `"${s}"` : s;
      };

      const rows = filteredCategories.map((c) => [
        c.category_id ?? '',
        c.name ?? '',
        c.slug ?? '',
        c.description ?? '',
        c.product_count ?? 0,
        c.created_at ? format(new Date(c.created_at), 'yyyy-MM-dd HH:mm', { locale: id }) : ''
      ].map(escapeCsv).join(','));

      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date();
      const tsStr = `${ts.getFullYear()}${String(ts.getMonth()+1).padStart(2,'0')}${String(ts.getDate()).padStart(2,'0')}-${String(ts.getHours()).padStart(2,'0')}${String(ts.getMinutes()).padStart(2,'0')}${String(ts.getSeconds()).padStart(2,'0')}`;
      a.download = `categories-${tsStr}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengekspor CSV kategori:', err);
      alert('Gagal mengekspor data kategori');
    }
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
                <MdCategory className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Kelola Kategori
                </h1>
                <p className="text-slate-600 font-medium">
                  Manajemen kategori produk olahan cakalang
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
                
                <button onClick={handleExportCsv} disabled={isLoading || filteredCategories.length === 0} className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                  <MdFileDownload className="w-4 h-4 mr-2" />
                  Ekspor Data
                </button>
              </div>
              
              <button onClick={openAddCategory} className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg">
                <MdAdd className="w-4 h-4 mr-2" />
                Tambah Kategori Baru
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
            icon={<MdCategory />}
            title="Total Kategori"
            value={stats.totalCategories}
            subtitle="Semua kategori"
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
            trend={5}
          />
          <StatCard
            icon={<MdVisibility />}
            title="Kategori Aktif"
            value={stats.activeCategories}
            subtitle="Tersedia"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
            trend={3}
          />
          <StatCard
            icon={<MdSettings />}
            title="Ada Produk"
            value={stats.categoriesWithProducts}
            subtitle="Kategori berisi produk"
            bgColor="bg-gradient-to-br from-blue-100 to-blue-200"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={<MdFilterList />}
            title="Kategori Kosong"
            value={stats.emptyCategories}
            subtitle="Tanpa produk"
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
                    placeholder="Cari kategori berdasarkan nama atau deskripsi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200 hover:border-slate-400"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-slate-600 font-medium">
                  {isLoading ? 'Memuat…' : `${filteredCategories.length} kategori ditemukan`}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Categories Content */}
        {/* Grid View (card-only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.category_id} extra="group hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-100 to-purple-100 group-hover:scale-110 transition-transform duration-300">
                    <MdCategory className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-slate-600">{category.product_count || 0} produk</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-bold text-slate-800 text-lg mb-1 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{category.description || "Tidak ada deskripsi"}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button onClick={() => openEditCategory(category)} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center">
                    <MdEdit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                  <button onClick={() => openDeleteCategory(category)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <MdDelete className="w-4 h-4" />
                  </button>
                  <button onClick={() => openViewCategory(category)} className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                    <MdMoreVert className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <Card extra="p-12 text-center shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="max-w-md mx-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mx-auto mb-6">
                <MdCategory className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                {searchTerm ? "Kategori tidak ditemukan" : "Belum ada kategori"}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {searchTerm 
                  ? "Coba ubah kata kunci pencarian untuk menemukan kategori yang diinginkan."
                  : "Mulai dengan menambahkan kategori produk untuk mengorganisir inventori Anda."
                }
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Reset Pencarian
                  </button>
                )}
                <button onClick={openAddCategory} className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg">
                  <MdAdd className="w-4 h-4 mr-2" />
                  Tambah Kategori Baru
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions Floating Button removed as requested */}
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={openForm}
        onClose={() => setOpenForm(false)}
        category={selectedCategoryData}
        onSave={handleSaveCategory}
      />
      <DeleteConfirmModal
        isOpen={openDelete}
        onClose={() => setOpenDelete(false)}
        onConfirm={handleConfirmDelete}
        categoryName={selectedCategoryData?.name || ''}
      />
      <CategoryDetailModal
        isOpen={openDetail}
        onClose={() => setOpenDetail(false)}
        category={selectedCategoryData}
      />
    </div>
  );
};

export default Categories;