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
  MdCategory,
  MdDescription,
  MdLink,
  MdWarning,
  MdCheckCircle,
  MdFileUpload,
  MdTableChart,
  MdInventory
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

// Category Detail Modal
export const CategoryDetailModal = ({ isOpen, onClose, category }) => {
  if (!category) return null;
  // Support both product_count (backend field) and legacy productCount naming
  const productCount = category.product_count ?? category.productCount ?? 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Detail Kategori</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
        {/* Category Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3">
              <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-lg flex items-center justify-center">
                <MdCategory className="w-20 h-20 text-indigo-600" />
              </div>
            </div>
            <div className="lg:w-2/3">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{category.name}</h3>
                  <span className="inline-flex items-center px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                    <MdCategory className="w-4 h-4 mr-1" />
                    Kategori
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-indigo-600 mb-1">{productCount}</p>
                  <p className="text-sm text-slate-600">Produk</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Total Produk</p>
                      <p className="text-2xl font-bold text-green-700">{productCount}</p>
                    </div>
                    <MdInventory className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-600 mb-2">Deskripsi</h4>
                <p className="text-slate-600 leading-relaxed">{category.description || "Tidak ada deskripsi tersedia."}</p>
              </div>

              {category.slug && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Slug</h4>
                  <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-800 text-sm font-mono rounded-full">
                    {category.slug}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Details */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Informasi Detail</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">ID Kategori</label>
                <p className="text-slate-800 font-medium">#{category.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Nama Kategori</label>
                <p className="text-slate-800 font-medium">{category.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Slug URL</label>
                <p className="text-slate-800 font-medium font-mono">{category.slug || "Belum ada"}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Tanggal Dibuat</label>
                <p className="text-slate-800 font-medium">
                  {category.created ? format(new Date(category.created), "dd MMMM yyyy", { locale: id }) : "Tidak diketahui"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Jumlah Produk</label>
                <p className="text-indigo-600 font-bold">{productCount} produk</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Status</label>
                <div className="mt-1">
                  <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                    Aktif
                  </span>
                </div>
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
            Edit Kategori
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Category Form Modal (Add/Edit)
export const CategoryFormModal = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: ''
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Nama kategori wajib diisi";
    if (formData.name.length > 120) newErrors.name = "Nama kategori maksimal 120 karakter";
    if (formData.slug && formData.slug.length > 160) newErrors.slug = "Slug maksimal 160 karakter";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        id: category?.id, // keep undefined for create
        slug: formData.slug || generateSlug(formData.name),
      };
      await onSave(payload);
      onClose();
    } catch (error) {
      console.error("Error saving category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug when name changes (only for new categories)
    if (field === 'name' && !category) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {category ? 'Edit Kategori' : 'Tambah Kategori Baru'}
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
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informasi Kategori</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.name ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="Masukkan nama kategori"
                  maxLength={120}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                <p className="mt-1 text-xs text-slate-500">{formData.name.length}/120 karakter</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Slug URL
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.slug ? 'border-red-300' : 'border-slate-300'
                  }`}
                  placeholder="slug-kategori (otomatis dibuat dari nama)"
                  maxLength={160}
                />
                {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                <p className="mt-1 text-xs text-slate-500">
                  Slug akan otomatis dibuat dari nama jika dikosongkan. {formData.slug.length}/160 karakter
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Deskripsi Kategori
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Masukkan deskripsi kategori (opsional)"
                />
                <p className="mt-1 text-xs text-slate-500">Deskripsi untuk membantu mengidentifikasi kategori</p>
              </div>
            </div>
          </div>

          {/* Preview */}
          {formData.name && (
            <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
              <h4 className="text-sm font-medium text-slate-600 mb-2">Preview</h4>
              <div className="flex items-center space-x-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100">
                  <MdCategory className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">{formData.name}</p>
                  <p className="text-xs text-slate-500">{formData.slug || generateSlug(formData.name)}</p>
                </div>
              </div>
            </div>
          )}
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
                {category ? 'Update Kategori' : 'Simpan Kategori'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Delete Confirm Modal
export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, categoryName }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
          <MdWarning className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus Kategori</h3>
          <p className="text-slate-600">
            Apakah Anda yakin ingin menghapus kategori <strong>"{categoryName}"</strong>?
          </p>
          <p className="text-sm text-red-600 mt-2">
            Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi produk yang terkait.
          </p>
        </div>

        <div className="flex justify-center space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Batal
          </button>
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
      alert(`${actionType === 'import' ? 'Import' : 'Export'} kategori berhasil!`);
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
        title: 'Import Kategori',
        icon: <MdFileUpload className="w-8 h-8 text-blue-600" />,
        description: 'Upload file CSV untuk menambahkan kategori secara massal',
        actionLabel: 'Import Kategori'
      };
    } else {
      return {
        title: 'Export Kategori',
        icon: <MdTableChart className="w-8 h-8 text-green-600" />,
        description: 'Download data kategori dalam format CSV',
        actionLabel: 'Export Kategori'
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

        {actionType === 'import' ? (
          /* File Upload for Import */
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

            {/* Template Download */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Download Template</h4>
              <p className="text-blue-700 text-sm mb-3">
                Gunakan template CSV yang sudah disediakan untuk memastikan format yang benar.
              </p>
              <button className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                <MdFileUpload className="w-4 h-4 mr-1" />
                Download Template
              </button>
            </div>
          </div>
        ) : (
          /* Export Options */
          <div className="mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Format Export</h4>
              <p className="text-green-700 text-sm mb-3">
                Data kategori akan diexport dalam format CSV dengan kolom: Nama, Slug, Deskripsi, Tanggal Dibuat.
              </p>
            </div>
          </div>
        )}

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
            disabled={(actionType === 'import' && !file) || isProcessing}
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