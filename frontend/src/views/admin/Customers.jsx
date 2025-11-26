import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Card from "components/card";
import ResponsiveTable from 'components/ResponsiveTable';
import api from "api/axios";
import { 
  MdSearch, 
  MdEmail, 
  MdPhone, 
  MdLocationOn, 
  MdPerson,
  MdStar,
  MdShoppingCart,
  MdAttachMoney,
  MdTrendingUp,
  MdMoreVert,
  MdVisibility,
  MdEdit,
  MdRefresh,
  MdFileDownload,
  MdFilterList,
  MdCalendarToday,
  MdWorkspacePremium,
  MdNotifications,
  MdGroup,
  MdPersonAdd,
  MdClose,
  MdSave,
  MdDelete,
  MdHistory,
  MdDateRange,
  MdLocationCity,
  MdCheck,
  MdCancel,
  MdStarBorder,
  MdTrendingDown
} from "react-icons/md";

// Modal Components
const Modal = ({ isOpen, onClose, children, size = "lg" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg", 
    lg: "max-w-xl",
    xl: "max-w-3xl",
    full: "max-w-5xl"
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-all duration-200"
          onClick={onClose}
        />
        <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} transform transition-all duration-300 max-h-[90vh] overflow-hidden`}>
          {children}
        </div>
      </div>
    </div>
  );
};

const CustomerDetailModal = ({ isOpen, onClose, customer }) => {
  if (!customer) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(amount);
  };

  const getCustomerLevel = (totalSpent) => {
    if (totalSpent >= 1000000) {
      return { 
        level: "VIP", 
        color: "text-purple-600", 
        bg: "bg-purple-100",
        icon: <MdWorkspacePremium className="w-4 h-4" />
      };
    } else if (totalSpent >= 500000) {
      return { 
        level: "Gold", 
        color: "text-amber-600", 
        bg: "bg-amber-100",
        icon: <MdStar className="w-4 h-4" />
      };
    } else if (totalSpent >= 200000) {
      return { 
        level: "Silver", 
        color: "text-slate-600", 
        bg: "bg-slate-100",
        icon: <MdStar className="w-4 h-4" />
      };
    } else {
      return { 
        level: "Bronze", 
        color: "text-orange-600", 
        bg: "bg-orange-100",
        icon: <MdStar className="w-4 h-4" />
      };
    }
  };

  const customerLevel = getCustomerLevel(customer.totalSpent);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      {/* Compact Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <MdPerson className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Detail Pelanggan</h2>
              <p className="text-white/80 text-xs">Informasi lengkap pelanggan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
        {/* Customer Profile Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.fullName || "User")}&background=6366f1&color=fff&size=80`}
                alt={customer.fullName || "User"}
                className="w-20 h-20 rounded-xl object-cover shadow-lg border-2 border-white ring-2 ring-indigo-100"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{customer.fullName || "Tidak Ada Nama"}</h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center px-3 py-1 text-xs rounded-xl font-semibold ${customerLevel.bg} ${customerLevel.color} border border-current/20`}>
                    {customerLevel.icon}
                    <span className="ml-1">{customerLevel.level}</span>
                  </span>
                  {getStatusBadge(customer.isActive)}
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <div className="flex items-center text-slate-700 bg-slate-50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <MdEmail className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Email</p>
                    <p className="font-medium text-sm">{customer.email}</p>
                  </div>
                </div>
                <div className="flex items-center text-slate-700 bg-slate-50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <MdPhone className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Telepon</p>
                    <p className="font-medium text-sm">{customer.phoneNumber || "Tidak ada"}</p>
                  </div>
                </div>
                <div className="flex items-center text-slate-700 bg-slate-50 rounded-lg p-3 lg:col-span-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <MdCalendarToday className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500">Bergabung</p>
                    <p className="font-medium text-sm">{customer.createdAt ? format(new Date(customer.createdAt), "dd MMM yyyy", { locale: id }) : "Tidak diketahui"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="p-6 border-b border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-4">Statistik Belanja</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <MdShoppingCart className="w-4 h-4" />
                </div>
                <MdTrendingUp className="w-4 h-4 text-white/60" />
              </div>
              <p className="text-white/90 text-sm font-medium">Total Pesanan</p>
              <p className="text-2xl font-bold">{customer.totalOrders || 0}</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <MdAttachMoney className="w-4 h-4" />
                </div>
                <MdTrendingUp className="w-4 h-4 text-white/60" />
              </div>
              <p className="text-white/90 text-sm font-medium">Total Belanja</p>
              <p className="text-xl font-bold">{formatCurrency(customer.totalSpent || 0)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-4 rounded-xl text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <MdTrendingUp className="w-4 h-4" />
                </div>
                <MdStar className="w-4 h-4 text-white/60" />
              </div>
              <p className="text-white/90 text-sm font-medium">Rata-rata</p>
              <p className="text-xl font-bold">{formatCurrency((customer.totalSpent || 0) / Math.max(1, customer.totalOrders || 1))}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-6 border-b border-slate-200">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Informasi Kontak</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <MdEmail className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="text-slate-800">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <MdPhone className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Telepon</p>
                  <p className="text-slate-800">{customer.phone}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <MdLocationOn className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Alamat Lengkap</p>
                  <p className="text-slate-800">{customer.address}</p>
                  <p className="text-sm text-slate-500">{customer.city}, {customer.province}</p>
                </div>
              </div>
              {customer.birthday && (
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                    <MdDateRange className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Tanggal Lahir</p>
                    <p className="text-slate-800">{format(new Date(customer.birthday), "dd MMMM yyyy", { locale: id })}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 p-6 bg-slate-50">
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Tutup
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors">
            Edit Pelanggan
          </button>
        </div>
      </div>
    </Modal>
  );
};

const CustomerFormModal = ({ isOpen, onClose, customer = null, onSave }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    isActive: true
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || "",
        email: customer.email || "",
        phoneNumber: customer.phoneNumber || "",
        password: "", // Don't prefill password for security
        isActive: customer.isActive !== undefined ? customer.isActive : true
      });
    } else {
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        password: "",
        isActive: true
      });
    }
    setErrors({});
  }, [customer, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = "Nama lengkap wajib diisi";
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = "Email wajib diisi";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Format email tidak valid";
    }

    if (formData.phoneNumber && !/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Format nomor telepon tidak valid";
    }

    // Password validation - only required for new customers
    if (!customer && (!formData.password || formData.password.length < 6)) {
      newErrors.password = "Password minimal 6 karakter untuk customer baru";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        id: customer?.id || Date.now(),
        avatar: formData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.fullName)}&background=6366f1&color=fff&size=96`
      });
      onClose();
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              {customer ? <MdEdit className="w-4 h-4 text-white" /> : <MdPersonAdd className="w-4 h-4 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {customer ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}
              </h2>
              <p className="text-white/80 text-xs">
                {customer ? "Perbarui informasi pelanggan" : "Buat akun pelanggan baru"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
        {/* Personal Information */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
              <MdPerson className="w-3 h-3 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Informasi Personal</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.fullName ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-indigo-500'
                }`}
                placeholder="Masukkan nama lengkap"
              />
              {errors.fullName && (
                <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-indigo-500'
                }`}
                placeholder="contoh@email.com"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-slate-50 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
              <MdPhone className="w-3 h-3 text-green-600" />
            </div>
            <h3 className="font-semibold text-slate-900">Informasi Kontak</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 transition-colors ${
                  errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-green-500'
                }`}
                placeholder="+62 812 3456 7890"
              />
              {errors.phoneNumber && (
                <p className="text-red-600 text-xs mt-1">{errors.phoneNumber}</p>
              )}
            </div>

            {!customer && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 transition-colors ${
                    errors.password ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-purple-500'
                  }`}
                  placeholder="Minimal 6 karakter"
                />
                {errors.password && (
                  <p className="text-red-600 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <MdSave className="w-4 h-4" />
                <span>{customer ? "Update" : "Simpan"}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Confirm Modal Component
const ConfirmModal = ({ isOpen, onClose, action, onConfirm }) => {
  if (!action) return null;

  const typeConfig = {
    danger: {
      bgColor: "bg-red-600",
      iconColor: "text-red-600",
      buttonColor: "bg-red-600 hover:bg-red-700",
      icon: <MdDelete className="w-6 h-6" />
    },
    warning: {
      bgColor: "bg-amber-600", 
      iconColor: "text-amber-600",
      buttonColor: "bg-amber-600 hover:bg-amber-700",
      icon: <MdCancel className="w-6 h-6" />
    }
  };

  const config = typeConfig[action.type] || typeConfig.danger;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className={`${config.bgColor} px-6 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {config.icon}
            <h2 className="text-xl font-bold">{action.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <MdClose className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6">
        <p className="text-slate-700 mb-6">{action.message}</p>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
          >
            Batal
          </button>
          <button
            onClick={() => {
              action.onConfirm();
              onClose();
            }}
            className={`px-6 py-2 text-white rounded-lg focus:ring-2 transition-all duration-200 ${config.buttonColor}`}
          >
            Konfirmasi
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Utility Functions
const getStatusBadge = (isActive) => {
  if (isActive) {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-2xl text-sm font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
        Aktif
      </span>
    );
  } else {
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-2xl text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
        <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
        Tidak Aktif
      </span>
    );
  }
};

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = "default" }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Error in confirmation action:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconColor: "text-red-600",
          bgColor: "bg-red-100",
          buttonColor: "bg-red-600 hover:bg-red-700",
          icon: <MdDelete className="w-6 h-6" />
        };
      case "warning":
        return {
          iconColor: "text-amber-600",
          bgColor: "bg-amber-100",
          buttonColor: "bg-amber-600 hover:bg-amber-700",
          icon: <MdCancel className="w-6 h-6" />
        };
      case "success":
        return {
          iconColor: "text-green-600",
          bgColor: "bg-green-100",
          buttonColor: "bg-green-600 hover:bg-green-700",
          icon: <MdCheck className="w-6 h-6" />
        };
      default:
        return {
          iconColor: "text-slate-600",
          bgColor: "bg-slate-100",
          buttonColor: "bg-slate-600 hover:bg-slate-700",
          icon: <MdCheck className="w-6 h-6" />
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${typeStyles.bgColor}`}>
            <div className={typeStyles.iconColor}>
              {typeStyles.icon}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="text-slate-600 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`inline-flex items-center px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${typeStyles.buttonColor}`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Memproses...
              </>
            ) : (
              "Konfirmasi"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Main Customers Component
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  
  // Modal States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime] = useState(new Date());
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    growth: 0
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    isActive: true,
  });

  // Fetch customers from backend
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching customers...");
      const response = await api.get('/customers');
      console.log("Response:", response.data);
      
      // Try multiple possible response structures
      const customersData = response.data.data || 
                           response.data.customers || 
                           response.data || 
                           [];
      
      console.log("Customers data:", customersData);
      console.log("Number of customers:", customersData.length);
      
      // If no data from backend, add some test data to verify table works
      let finalCustomersData = Array.isArray(customersData) ? customersData : [];
      
      if (finalCustomersData.length === 0) {
        console.log("No customers from backend, adding test data");
        finalCustomersData = [
          {
            id: "test-1",
            fullName: "John Doe Test",
            email: "john@test.com",
            phoneNumber: "62 811-488-068",
            isActive: true,
            totalSpent: 150000,
            totalOrders: 3,
            customerLevel: "Bronze",
            status: "active",
            createdAt: new Date().toISOString(),
            avatar: "https://ui-avatars.com/api/?name=John%20Doe&background=6366f1&color=fff&size=64"
          }
        ];
      }
      
      setCustomers(finalCustomersData);
      setError(null);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError('Gagal memuat data pelanggan: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch customer statistics
  const fetchStats = useCallback(async () => {
    try {
      console.log("Fetching customer stats...");
      const response = await api.get('/customers/stats');
      console.log("Stats response:", response.data);
      
      const statsData = response.data.data || response.data || { total: 0, active: 0, inactive: 0, growth: 0, vipCustomers: 0 };
      console.log("Setting stats to:", statsData);
      
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching customer stats:', err);
      // Set default stats on error
      setStats({ total: 0, active: 0, inactive: 0, growth: 0, vipCustomers: 0 });
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    fetchCustomers();
    fetchStats();
  }, [fetchCustomers, fetchStats]);

  const statusOptions = [
    { value: "all", label: "Semua Status", count: customers.length },
    { value: "active", label: "Aktif", count: customers.filter(c => c.isActive === true).length },
    { value: "inactive", label: "Tidak Aktif", count: customers.filter(c => c.isActive === false).length },
  ];

  const levelOptions = [
    { value: "all", label: "Semua Level" },
    { value: "VIP", label: "VIP" },
    { value: "Gold", label: "Gold" },
    { value: "Silver", label: "Silver" },
    { value: "Bronze", label: "Bronze" }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), "dd MMM yyyy", { locale: id });
  };

  const getStatusBadge = (isActive) => {
    const statusConfig = {
      active: { 
        bg: "bg-green-100", 
        text: "text-green-800", 
        dot: "bg-green-500",
        border: "border-green-200",
        label: "Aktif"
      },
      inactive: { 
        bg: "bg-slate-100", 
        text: "text-slate-600", 
        dot: "bg-slate-400",
        border: "border-slate-200",
        label: "Tidak Aktif"
      }
    };
    
    const config = isActive ? statusConfig.active : statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 text-xs rounded-full font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${config.dot} ${isActive ? 'animate-pulse' : ''}`}></span>
        {config.label}
      </span>
    );
  };

  const getCustomerLevel = (totalSpent) => {
    if (totalSpent >= 2000000) {
      return { 
        level: "VIP", 
        color: "text-purple-600", 
        bg: "bg-purple-100",
        icon: <MdWorkspacePremium className="w-4 h-4" />
      };
    } else if (totalSpent >= 1000000) {
      return { 
        level: "Gold", 
        color: "text-amber-600", 
        bg: "bg-amber-100",
        icon: <MdStar className="w-4 h-4" />
      };
    } else if (totalSpent >= 500000) {
      return { 
        level: "Silver", 
        color: "text-slate-600", 
        bg: "bg-slate-100",
        icon: <MdStar className="w-4 h-4" />
      };
    } else {
      return { 
        level: "Bronze", 
        color: "text-orange-600", 
        bg: "bg-orange-100",
        icon: <MdStar className="w-4 h-4" />
      };
    }
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
    setIsLoading(true);
    await fetchCustomers();
    await fetchStats();
    setIsLoading(false);
  };

  // Export customers data
  const handleExportData = async () => {
    try {
      setIsLoading(true);
      
      // Try to use backend export first
      try {
        const response = await api.get('/customers/export?format=csv', {
          responseType: 'blob'
        });
        
        // Create and download file from backend response
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `data-pelanggan-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        alert('Data pelanggan berhasil diekspor!');
        return;
      } catch (backendError) {
        console.warn('Backend export failed, using frontend export:', backendError);
      }
      
      // Fallback to frontend export
      const csvHeaders = ['No', 'Nama Lengkap', 'Email', 'No. Telepon', 'Status', 'Total Pesanan', 'Total Belanja', 'Tanggal Daftar'];
      const csvData = filteredCustomers.map((customer, index) => [
        index + 1,
        customer.fullName || '-',
        customer.email || '-',
        customer.phoneNumber || '-',
        customer.isActive ? 'Aktif' : 'Tidak Aktif',
        customer.totalOrders || 0,
        `Rp ${(customer.totalSpent || 0).toLocaleString('id-ID')}`,
        customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('id-ID') : '-'
      ]);
      
      // Combine headers and data
      const csvContent = [csvHeaders, ...csvData]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `data-pelanggan-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Data pelanggan berhasil diekspor!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Gagal mengekspor data pelanggan');
    } finally {
      setIsLoading(false);
    }
  };

  // Create customer
  const handleCreateCustomer = async (customerData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/customers', customerData);
      if (response.data.success) {
        await fetchCustomers();
        await fetchStats();
        setShowFormModal(false);
        setFormData({
          fullName: "",
          email: "",
          phoneNumber: "",
          isActive: true,
        });
        alert("Customer baru berhasil ditambahkan!");
      }
    } catch (err) {
      console.error('Error creating customer:', err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat menambah customer");
    } finally {
      setIsLoading(false);
    }
  };

  // Update customer
  const handleUpdateCustomer = async (customerId, customerData) => {
    try {
      setIsLoading(true);
      const response = await api.put(`/customers/${customerId}`, customerData);
      if (response.data.success) {
        await fetchCustomers();
        await fetchStats();
        setShowFormModal(false);
        setSelectedCustomer(null);
        alert("Customer berhasil diupdate!");
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat update customer");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId) => {
    try {
      setIsLoading(true);
      const response = await api.delete(`/customers/${customerId}`);
      if (response.data.success) {
        await fetchCustomers();
        await fetchStats();
        alert("Customer berhasil dihapus!");
      }
    } catch (err) {
      console.error('Error deleting customer:', err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat menghapus customer");
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate customer
  const handleDeactivateCustomer = async (customerId) => {
    try {
      setIsLoading(true);
      const response = await api.patch(`/customers/${customerId}/status`, { isActive: false });
      if (response.data.success) {
        await fetchCustomers();
        await fetchStats();
        alert("Customer berhasil dinonaktifkan!");
      }
    } catch (err) {
      console.error('Error deactivating customer:', err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat menonaktifkan customer");
    } finally {
      setIsLoading(false);
    }
  };

  // Reactivate customer
  const handleReactivateCustomer = async (customerId) => {
    try {
      setIsLoading(true);
      const response = await api.patch(`/customers/${customerId}/status`, { isActive: true });
      if (response.data.success) {
        await fetchCustomers();
        await fetchStats();
        alert("Customer berhasil diaktifkan kembali!");
      }
    } catch (err) {
      console.error('Error reactivating customer:', err);
      alert(err.response?.data?.message || "Terjadi kesalahan saat mengaktifkan kembali customer");
    } finally {
      setIsLoading(false);
    }
  };

  // Modal Handler Functions
  const handleViewCustomer = (customer) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setFormData({
      fullName: customer.fullName || "",
      email: customer.email || "",
      phoneNumber: customer.phoneNumber || "",
      isActive: customer.isActive
    });
    setShowFormModal(true);
  };

  const handleAddCustomer = () => {
    setSelectedCustomer(null);
    setFormData({
      fullName: "",
      email: "",
      phoneNumber: "",
      isActive: true,
    });
    setShowFormModal(true);
  };

  const handleSaveCustomer = async (customerData) => {
    if (selectedCustomer) {
      await handleUpdateCustomer(selectedCustomer.id, customerData);
    } else {
      await handleCreateCustomer(customerData);
    }
  };

  const handleDeleteClick = (customer) => {
    setSelectedCustomer(customer);
    setConfirmAction({
      type: "danger",
      title: "Hapus Pelanggan",
      message: `Apakah Anda yakin ingin menghapus pelanggan "${customer.fullName || customer.name}"? Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        await handleDeleteCustomer(customer.id);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeactivateClick = (customer) => {
    setSelectedCustomer(customer);
    setConfirmAction({
      type: "warning",
      title: "Nonaktifkan Pelanggan",
      message: `Apakah Anda yakin ingin menonaktifkan pelanggan "${customer.fullName || customer.name}"?`,
      onConfirm: async () => {
        await handleDeactivateCustomer(customer.id);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleReactivateClick = (customer) => {
    setSelectedCustomer(customer);
    setConfirmAction({
      type: "success",
      title: "Aktifkan Kembali Pelanggan",
      message: `Aktifkan kembali pelanggan "${customer.fullName || customer.name}"?`,
      onConfirm: async () => {
        await handleReactivateCustomer(customer.id);
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const closeAllModals = () => {
    setShowDetailModal(false);
    setShowFormModal(false);
    setShowConfirmModal(false);
    setSelectedCustomer(null);
    setConfirmAction(null);
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = (customer.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.phoneNumber || "").includes(searchTerm);
    
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && customer.isActive) ||
                         (selectedStatus === "inactive" && !customer.isActive);
    
    const customerLevel = getCustomerLevel(customer.totalSpent || 0);
    const matchesLevel = selectedLevel === "all" || customerLevel.level === selectedLevel;
    
    return matchesSearch && matchesStatus && matchesLevel;
  });

  // Debug logging
  console.log("Customers array:", customers);
  console.log("Filtered customers:", filteredCustomers);
  console.log("Loading state:", loading);
  console.log("Error state:", error);
  console.log("Stats state:", stats);

  // Note: Stats now come from backend API, keeping this for backwards compatibility
  const localStats = {
    total: customers.length,
    active: customers.filter(c => c.isActive === true).length,
    inactive: customers.filter(c => c.isActive === false).length,
    totalRevenue: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
    averageOrderValue: customers.length > 0 ? customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / Math.max(1, customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0)) : 0,
    vipCustomers: customers.filter(c => getCustomerLevel(c.totalSpent || 0).level === 'VIP').length,
  };

  const StatCard = ({ icon, title, value, subtitle, bgColor, iconColor, trend, extra }) => (
    <Card extra={`relative overflow-hidden group hover:shadow-xl hover:scale-105 transition-all duration-300 ${extra}`}>
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

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="text-red-600 text-xl mb-4">{error}</div>
            <button 
              onClick={fetchCustomers}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Full-width Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                <MdGroup className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Manajemen Pelanggan
                </h1>
                <p className="text-slate-600 font-medium">
                  Kelola data dan aktivitas pelanggan premium
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
                  Refresh Data
                </button>
                
                <button 
                  onClick={handleExportData}
                  disabled={isLoading || filteredCustomers.length === 0}
                  className="inline-flex items-center px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MdFileDownload className="w-4 h-4 mr-2" />
                  Ekspor Data ({filteredCustomers.length})
                </button>
              </div>
              
              <button 
                onClick={handleAddCustomer}
                className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <MdPersonAdd className="w-4 h-4 mr-2" />
                Tambah Pelanggan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Alert for new customers */}
        {stats.new > 0 && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <MdNotifications className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-1">
                  Pelanggan Baru!
                </h3>
                <p className="text-blue-700">
                  Ada <span className="font-bold">{stats.new} pelanggan baru</span> yang baru bergabung. Berikan pengalaman terbaik untuk mereka!
                </p>
              </div>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
                Lihat Detail
              </button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MdGroup />}
            title="Total Pelanggan"
            value={stats.total || 0}
            subtitle="Terdaftar"
            bgColor="bg-gradient-to-br from-indigo-100 to-indigo-200"
            iconColor="text-indigo-600"
            trend={stats.growth > 0 ? Math.round(stats.growth) : undefined}
          />
          <StatCard
            icon={<MdCheck />}
            title="Pelanggan Aktif"
            value={stats.active || 0}
            subtitle="Status aktif"
            bgColor="bg-gradient-to-br from-green-100 to-green-200"
            iconColor="text-green-600"
          />
          <StatCard
            icon={<MdCancel />}
            title="Pelanggan Tidak Aktif"
            value={stats.inactive || 0}
            subtitle="Status tidak aktif"
            bgColor="bg-gradient-to-br from-red-100 to-red-200"
            iconColor="text-red-600"
          />
          <StatCard
            icon={<MdWorkspacePremium />}
            title="Pelanggan VIP"
            value={stats.vipCustomers || 0}
            subtitle="Member premium"
            bgColor="bg-gradient-to-br from-purple-100 to-purple-200"
            iconColor="text-purple-600"
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
                    placeholder="Cari pelanggan berdasarkan nama, email, telepon, atau kota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm transition-all duration-200 hover:border-slate-400"
                  />
                </div>
                
                <div className="flex space-x-4">
                  <div className="relative">
                    <MdFilterList className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="pl-12 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white shadow-sm transition-all duration-200 hover:border-slate-400 min-w-[180px]"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} ({option.count})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="relative">
                    <MdStar className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="pl-12 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white shadow-sm transition-all duration-200 hover:border-slate-400 min-w-[150px]"
                    >
                      {levelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-slate-600 font-medium">
                  {filteredCustomers.length} pelanggan ditemukan
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Customers Table */}
        <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <ResponsiveTable>
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-100 to-slate-200">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Profil Pelanggan
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Informasi Kontak
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Aktivitas Belanja
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Level & Rating
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Riwayat & Status
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Tindakan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredCustomers.map((customer, index) => {
                  const customerLevel = getCustomerLevel(customer.totalSpent);
                  return (
                    <tr 
                      key={customer.id} 
                      className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                      }`}
                    >
                      <td className="py-5 px-6">
                        <div className="flex items-center">
                          <img
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(customer.fullName || "User")}&background=6366f1&color=fff&size=64`}
                            alt={customer.fullName || "User"}
                            className="w-16 h-16 rounded-full object-cover mr-4 shadow-md border-2 border-white"
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 text-base mb-1">{customer.fullName || "Tidak Ada Nama"}</h3>
                            <div className="flex items-center text-sm text-slate-600 mb-1">
                              <MdEmail className="w-4 h-4 mr-1" />
                              <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center text-xs text-slate-500">
                              <MdCalendarToday className="w-3 h-3 mr-1" />
                              <span>Bergabung {customer.createdAt ? formatDate(customer.createdAt) : "Tidak diketahui"}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-slate-600">
                            <MdEmail className="w-4 h-4 mr-2 text-slate-400" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-slate-600">
                            <MdPhone className="w-4 h-4 mr-2 text-slate-400" />
                            <span>{customer.phoneNumber || "Tidak ada"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Total Pesanan:</span>
                            <span className="font-bold text-slate-800">{customer.totalOrders || 0}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Total Belanja:</span>
                            <span className="font-bold text-green-600">{formatCurrency(customer.totalSpent || 0)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">Rata-rata:</span>
                            <span className="text-xs font-medium text-slate-600">{formatCurrency((customer.totalSpent || 0) / Math.max(1, customer.totalOrders || 1))}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${customerLevel.bg} ${customerLevel.color}`}>
                              {customerLevel.icon}
                              <span className="ml-1">{customerLevel.level}</span>
                            </span>
                          </div>
                          {getStatusBadge(customer.isActive)}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col space-y-2">
                          {getStatusBadge(customer.isActive)}
                          <div className="text-sm text-slate-600">
                            <strong>Bergabung:</strong> {customer.createdAt ? formatDate(customer.createdAt) : "Tidak diketahui"}
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex flex-col items-center space-y-2">
                          <button 
                            onClick={() => handleViewCustomer(customer)}
                            className="inline-flex items-center justify-center w-8 h-8 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 rounded-lg transition-all duration-200"
                            title="Lihat Detail"
                          >
                            <MdVisibility className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditCustomer(customer)}
                            className="inline-flex items-center justify-center w-8 h-8 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200"
                            title="Edit Customer"
                          >
                            <MdEdit className="w-4 h-4" />
                          </button>
                          <div className="relative group">
                            <button className="inline-flex items-center justify-center w-8 h-8 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all duration-200">
                              <MdMoreVert className="w-4 h-4" />
                            </button>
                            {/* Dropdown Menu */}
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleViewCustomer(customer)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <MdVisibility className="w-4 h-4 mr-3" />
                                  Lihat Detail
                                </button>
                                <button
                                  onClick={() => handleEditCustomer(customer)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                >
                                  <MdEdit className="w-4 h-4 mr-3" />
                                  Edit Data
                                </button>
                                {customer.isActive ? (
                                  <button
                                    onClick={() => handleDeactivateClick(customer)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-amber-700 hover:bg-amber-50"
                                  >
                                    <MdCancel className="w-4 h-4 mr-3" />
                                    Nonaktifkan
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleReactivateClick(customer)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                  >
                                    <MdCheck className="w-4 h-4 mr-3" />
                                    Aktifkan Kembali
                                  </button>
                                )}
                                <div className="border-t border-slate-100 my-1"></div>
                                <button
                                  onClick={() => handleDeleteClick(customer)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  <MdDelete className="w-4 h-4 mr-3" />
                                  Hapus Customer
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ResponsiveTable>
        </Card>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <Card extra="p-12 text-center shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <div className="max-w-md mx-auto">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-slate-100 to-slate-200 mx-auto mb-6">
                <MdSearch className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">
                {searchTerm || selectedStatus !== "all" || selectedLevel !== "all" 
                  ? "Pelanggan tidak ditemukan" 
                  : "Belum ada pelanggan"
                }
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {searchTerm || selectedStatus !== "all" || selectedLevel !== "all"
                  ? "Coba ubah kata kunci pencarian atau filter yang dipilih."
                  : "Pelanggan akan muncul di sini ketika mereka mulai berbelanja produk cakalang premium Anda."
                }
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                {(searchTerm || selectedStatus !== "all" || selectedLevel !== "all") && (
                  <button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedStatus("all");
                      setSelectedLevel("all");
                    }}
                    className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
                <button 
                  onClick={handleAddCustomer}
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 border border-transparent rounded-lg text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <MdPersonAdd className="w-4 h-4 mr-2" />
                  Tambah Pelanggan
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Modals */}
      <CustomerDetailModal
        isOpen={showDetailModal}
        onClose={closeAllModals}
        customer={selectedCustomer}
      />

      <CustomerFormModal
        isOpen={showFormModal}
        onClose={closeAllModals}
        customer={selectedCustomer}
        onSave={handleSaveCustomer}
      />

      {confirmAction && (
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={closeAllModals}
          onConfirm={confirmAction.onConfirm}
          title={confirmAction.title}
          message={confirmAction.message}
          type={confirmAction.type}
        />
      )}
    </div>
  );
};

export default Customers;
