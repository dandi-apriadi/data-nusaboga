import React, { useEffect, useState, useMemo } from "react";
import Card from "components/card";
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdHome, 
  MdWork, 
  MdCheckCircle, 
  MdLocationOn,
  MdPhone,
  MdPerson,
  MdClose,
  MdSave,
  MdLocationCity,
  MdPublic,
  MdLocalPostOffice,
  MdMyLocation,
  MdBusinessCenter,
  MdApartment,
  MdSearch,
  MdFilterList,
  MdSort,
  MdVisibility,
  MdVisibilityOff,
  MdContentCopy,
  MdFavorite,
  MdFavoriteBorder,
  MdTrendingUp,
  MdAccessTime,
  MdVerified,
  MdWarning
} from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import api from '../../api/axios';

const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [filteredAddresses, setFilteredAddresses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [newAddr, setNewAddr] = useState({ 
    label: "", 
    receiver_name: "",
    phone: "",
    address_detail: "", 
    district: "",
    city: "",
    province: "",
    postal_code: "",
    type: "home",
    notes: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [editAddr, setEditAddr] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const { user } = useSelector((state) => state.auth || {});

  // Helper functions - defined before they're used in hooks
  const getAddressCategory = (label) => {
    const lowerLabel = (label || "").toLowerCase();
    if (lowerLabel.includes('kantor') || lowerLabel.includes('office') || lowerLabel.includes('kerja')) {
      return 'work';
    }
    if (lowerLabel.includes('apartemen') || lowerLabel.includes('apartment') || lowerLabel.includes('kost')) {
      return 'apartment';
    }
    return 'home';
  };

  const getAddressTypeIcon = (label) => {
    const category = getAddressCategory(label);
    switch (category) {
      case 'work':
        return { icon: MdBusinessCenter, color: 'text-blue-600', bg: 'bg-blue-100', gradient: 'from-blue-500 to-blue-600' };
      case 'apartment':
        return { icon: MdApartment, color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-500 to-purple-600' };
      default:
        return { icon: MdHome, color: 'text-indigo-600', bg: 'bg-indigo-100', gradient: 'from-indigo-500 to-indigo-600' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const copyToClipboard = async (text, addressId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(addressId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const toggleFavorite = (addressId) => {
    const newFavorites = new Set(favoriteIds);
    if (newFavorites.has(addressId)) {
      newFavorites.delete(addressId);
    } else {
      newFavorites.add(addressId);
    }
    setFavoriteIds(newFavorites);
    // Here you could also sync with backend if needed
  };

  // Enhanced address statistics
  const addressStats = useMemo(() => {
    const totalAddresses = addresses.length;
    const defaultAddress = addresses.find(addr => addr.is_default);
    const addressTypes = addresses.reduce((acc, addr) => {
      const type = getAddressCategory(addr.label);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: totalAddresses,
      hasDefault: !!defaultAddress,
      types: addressTypes,
      mostUsedType: Object.keys(addressTypes).reduce((a, b) => addressTypes[a] > addressTypes[b] ? a : b, 'home'),
      recentlyAdded: addresses.filter(addr => {
        const created = new Date(addr.created_at);
        const daysDiff = (Date.now() - created) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      }).length
    };
  }, [addresses]);

  // Enhanced filtering and sorting
  useEffect(() => {
    let filtered = addresses.filter(addr => {
      const matchesSearch = !searchTerm || 
        addr.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.receiver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.address_detail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        addr.city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === "all" || 
        (filterType === "default" && addr.is_default) ||
        (filterType === "favorite" && favoriteIds.has(addr.address_id)) ||
        getAddressCategory(addr.label) === filterType;
      
      return matchesSearch && matchesFilter;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "label":
          return a.label.localeCompare(b.label);
        case "city":
          return (a.city || "").localeCompare(b.city || "");
        case "default":
          return b.is_default - a.is_default;
        default:
          return 0;
      }
    });

    setFilteredAddresses(filtered);
  }, [addresses, searchTerm, filterType, sortBy, favoriteIds]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/addresses");
      setAddresses(data || []);
      setError("");
    } catch (e) {
      setError(e?.response?.data?.msg || "Gagal memuat alamat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const validateAddress = (addr) => {
    const required = ['label', 'receiver_name', 'phone', 'address_detail', 'city', 'province'];
    const missing = required.filter(field => !addr[field]?.trim());
    return missing.length === 0 ? null : `Field wajib: ${missing.join(', ')}`;
  };

  const setDefault = async (id) => {
    try {
      setIsSubmitting(true);
      await api.put(`/addresses/${id}`, { is_default: true });
      await fetchAddresses();
    } catch (e) {
      setError(e?.response?.data?.msg || "Gagal menjadikan alamat utama");
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Yakin ingin menghapus alamat ini?')) return;
    try {
      setIsSubmitting(true);
      await api.delete(`/addresses/${id}`);
      setAddresses(prev => prev.filter(a => a.address_id !== id));
    } catch (e) {
      setError(e?.response?.data?.msg || "Gagal menghapus alamat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const add = async () => {
    const validation = validateAddress(newAddr);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      setIsSubmitting(true);
      await api.post(`/addresses`, {
        ...newAddr,
        is_default: addresses.length === 0,
      });
      setNewAddr({ 
        label: "", 
        receiver_name: "",
        phone: "",
        address_detail: "", 
        district: "",
        city: "",
        province: "",
        postal_code: "",
        type: "home",
        notes: ""
      });
      setShowAddForm(false);
      await fetchAddresses();
    } catch (e) {
      setError(e?.response?.data?.msg || "Gagal menambah alamat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (address) => {
    setEditingId(address.address_id);
    setEditAddr({
      label: address.label || "",
      receiver_name: address.receiver_name || "",
      phone: address.phone || "",
      address_detail: address.address_detail || "",
      district: address.district || "",
      city: address.city || "",
      province: address.province || "",
      postal_code: address.postal_code || "",
    });
  };

  const saveEdit = async () => {
    const validation = validateAddress(editAddr);
    if (validation) {
      setError(validation);
      return;
    }
    try {
      setIsSubmitting(true);
      await api.put(`/addresses/${editingId}`, editAddr);
      setEditingId(null);
      setEditAddr({});
      await fetchAddresses();
    } catch (e) {
      setError(e?.response?.data?.msg || "Gagal mengubah alamat");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditAddr({});
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20">
      {/* Header Section */}
      <div className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <MdLocationOn className="h-8 w-8" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-indigo-100 bg-clip-text text-transparent">
              Alamat Pengiriman
            </h1>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Kelola alamat pengiriman Anda untuk kemudahan berbelanja produk olahan cakalang terbaik
            </p>
            
            {/* Enhanced Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{addressStats.total}</div>
                  <MdLocationOn className="h-6 w-6 text-indigo-200" />
                </div>
                <div className="text-sm text-indigo-100">Total Alamat</div>
                {addressStats.recentlyAdded > 0 && (
                  <div className="text-xs text-indigo-200 mt-1">+{addressStats.recentlyAdded} minggu ini</div>
                )}
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{addressStats.hasDefault ? '1' : '0'}</div>
                  <MdCheckCircle className="h-6 w-6 text-green-200" />
                </div>
                <div className="text-sm text-indigo-100">Alamat Utama</div>
                <div className="text-xs text-indigo-200 mt-1">
                  {addressStats.hasDefault ? 'Sudah diatur' : 'Belum diatur'}
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{favoriteIds.size}</div>
                  <MdFavorite className="h-6 w-6 text-pink-200" />
                </div>
                <div className="text-sm text-indigo-100">Favorit</div>
                <div className="text-xs text-indigo-200 mt-1">Alamat tersimpan</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{Object.keys(addressStats.types).length}</div>
                  <MdApartment className="h-6 w-6 text-purple-200" />
                </div>
                <div className="text-sm text-indigo-100">Tipe Alamat</div>
                <div className="text-xs text-indigo-200 mt-1 capitalize">{addressStats.mostUsedType} terbanyak</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <Card extra="mb-6 bg-red-50 border-l-4 border-red-400">
            <div className="p-4 flex items-center">
              <div className="flex-shrink-0">
                <MdClose className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto">
                <button onClick={() => setError("")} className="text-red-400 hover:text-red-600">
                  <MdClose className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* Enhanced Filters and Search */}
        <Card extra="mb-6 overflow-hidden border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <MdSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari alamat, penerima, atau kota..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white/90 backdrop-blur-sm placeholder:text-slate-400"
                  />
                </div>
                
                {/* Filter */}
                <div className="relative">
                  <MdFilterList className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-12 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white/90 backdrop-blur-sm min-w-48"
                  >
                    <option value="all">Semua Alamat</option>
                    <option value="default">Alamat Utama</option>
                    <option value="favorite">Favorit</option>
                    <option value="home">Rumah</option>
                    <option value="work">Kantor</option>
                    <option value="apartment">Apartemen</option>
                  </select>
                </div>

                {/* Sort */}
                <div className="relative">
                  <MdSort className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-12 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white/90 backdrop-blur-sm min-w-52"
                  >
                    <option value="newest">Terbaru</option>
                    <option value="oldest">Terlama</option>
                    <option value="label">Nama A-Z</option>
                    <option value="city">Kota A-Z</option>
                    <option value="default">Utama Dulu</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between lg:justify-end gap-4">
                {/* Results Count */}
                <div className="text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-lg">
                  <span className="font-semibold text-indigo-600">{filteredAddresses.length}</span> dari {addresses.length} alamat
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Add Address Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <MdAdd className="mr-2 h-5 w-5" />
            {showAddForm ? 'Tutup Form' : 'Tambah Alamat Baru'}
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Address List */}
          <div className="xl:col-span-2">
            {loading ? (
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Memuat alamat...</p>
                </div>
              </Card>
            ) : filteredAddresses.length === 0 ? (
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    {searchTerm || filterType !== 'all' ? (
                      <MdSearch className="h-10 w-10 text-slate-400" />
                    ) : (
                      <MdLocationOn className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">
                    {searchTerm || filterType !== 'all' ? 'Tidak Ada Hasil' : 'Belum Ada Alamat'}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {searchTerm || filterType !== 'all' 
                      ? `Tidak ada alamat yang sesuai dengan pencarian "${searchTerm}" atau filter "${filterType}".`
                      : 'Tambahkan alamat pengiriman untuk mempermudah proses checkout pesanan Anda.'
                    }
                  </p>
                  {(!searchTerm && filterType === 'all') && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <MdAdd className="mr-2 h-5 w-5" />
                      Tambah Alamat Pertama
                    </button>
                  )}
                  {(searchTerm || filterType !== 'all') && (
                    <div className="flex justify-center space-x-3">
                      <button
                        onClick={() => setSearchTerm("")}
                        className="px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        Hapus Pencarian
                      </button>
                      <button
                        onClick={() => setFilterType("all")}
                        className="px-4 py-2 text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAddresses.map((address) => {
                  const typeInfo = getAddressTypeIcon(address.label);
                  const IconComponent = typeInfo.icon;
                  const isEditing = editingId === address.address_id;
                  
                  return (
                    <Card key={address.address_id} extra={`group overflow-hidden shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] ${address.is_default ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''}`}>
                      <div className="p-6">
                        {/* Address Header with Enhanced Actions */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.bg} flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                              <IconComponent className={`h-6 w-6 ${typeInfo.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{address.label}</h3>
                                {address.is_default && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                                    <MdCheckCircle className="mr-1 h-3 w-3" />
                                    Utama
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-slate-500">
                                  Ditambahkan {formatDate(address.created_at)}
                                </span>
                                {address.updated_at !== address.created_at && (
                                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                                    Diperbarui
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Enhanced Action Buttons */}
                          <div className="flex items-center space-x-1">
                            {!address.is_default && (
                              <button 
                                onClick={() => setDefault(address.address_id)}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
                              >
                                Jadikan Utama
                              </button>
                            )}
                            
                            <button 
                              onClick={() => startEdit(address)}
                              className="p-2 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-300 transform hover:scale-105"
                            >
                              <MdEdit className="h-4 w-4" />
                            </button>
                            
                            <button 
                              onClick={() => remove(address.address_id)}
                              disabled={isSubmitting}
                              className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-300 disabled:opacity-50 transform hover:scale-105"
                            >
                              <MdDelete className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        {isEditing ? (
                          // Edit Form
                          <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-slate-800">Edit Alamat</h3>
                              <div className="flex space-x-2">
                                <button
                                  onClick={saveEdit}
                                  disabled={isSubmitting}
                                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50"
                                >
                                  <MdSave className="mr-1 h-4 w-4" />
                                  Simpan
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="inline-flex items-center px-3 py-1.5 bg-slate-500 text-white rounded-lg hover:bg-slate-600 text-sm font-medium"
                                >
                                  <MdClose className="mr-1 h-4 w-4" />
                                  Batal
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Label Alamat</label>
                                <input
                                  value={editAddr.label || ""}
                                  onChange={(e) => setEditAddr({ ...editAddr, label: e.target.value })}
                                  placeholder="Rumah / Kantor / Apartemen"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Penerima</label>
                                <input
                                  value={editAddr.receiver_name || ""}
                                  onChange={(e) => setEditAddr({ ...editAddr, receiver_name: e.target.value })}
                                  placeholder="Nama lengkap penerima"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
                                <input
                                  value={editAddr.phone || ""}
                                  onChange={(e) => setEditAddr({ ...editAddr, phone: e.target.value })}
                                  placeholder="62 811-488-068"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kode Pos</label>
                                <input
                                  value={editAddr.postal_code || ""}
                                  onChange={(e) => setEditAddr({ ...editAddr, postal_code: e.target.value })}
                                  placeholder="12345"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap</label>
                                <textarea
                                  value={editAddr.address_detail || ""}
                                  onChange={(e) => setEditAddr({ ...editAddr, address_detail: e.target.value })}
                                  placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan"
                                  rows={3}
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kecamatan</label>
                                <input
                                  value={editAddr.district || ""}
                                  onChange={(e) => setEditAddr({ ...editAddr, district: e.target.value })}
                                  placeholder="Kecamatan"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Kota</label>
                                <input
                                  value={editAddr.city || ""}
                                  onChange={(e) => setEditAddr({ ...editAddr, city: e.target.value })}
                                  placeholder="Kota"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Provinsi</label>
                                <input
                                  value={editAddr.province || ""}
                                  onChange={(e) => setEditAddr({ ...editAddr, province: e.target.value })}
                                  placeholder="Provinsi"
                                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Display Mode
                          <div className="flex items-start space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeInfo.bg} flex-shrink-0`}>
                              <IconComponent className={`h-6 w-6 ${typeInfo.color}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-lg font-bold text-slate-800 truncate">{address.label}</h3>
                                {address.is_default && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <MdCheckCircle className="mr-1 h-3 w-3" />
                                    Alamat Utama
                                  </span>
                                )}
                              </div>
                              
                              <div className="space-y-2 text-sm text-slate-600">
                                {address.receiver_name && (
                                  <div className="flex items-center">
                                    <MdPerson className="h-4 w-4 mr-2 text-slate-400" />
                                    <span>{address.receiver_name}</span>
                                  </div>
                                )}
                                {address.phone && (
                                  <div className="flex items-center">
                                    <MdPhone className="h-4 w-4 mr-2 text-slate-400" />
                                    <span>{address.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-start">
                                  <MdLocationOn className="h-4 w-4 mr-2 text-slate-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="leading-relaxed">{address.address_detail}</p>
                                    {(address.district || address.city || address.province) && (
                                      <p className="mt-1 text-slate-500">
                                        {[address.district, address.city, address.province].filter(Boolean).join(', ')}
                                        {address.postal_code && ` ${address.postal_code}`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col space-y-2">
                              {!address.is_default && (
                                <button 
                                  onClick={() => setDefault(address.address_id)}
                                  disabled={isSubmitting}
                                  className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                >
                                  Jadikan Utama
                                </button>
                              )}
                              <button 
                                onClick={() => startEdit(address)}
                                className="p-2 text-slate-600 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                              >
                                <MdEdit className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => remove(address.address_id)}
                                disabled={isSubmitting}
                                className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                              >
                                <MdDelete className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Address Form */}
          {showAddForm && (
            <div className="xl:col-span-1">
              <Card extra="overflow-hidden shadow-lg border-0 bg-white/90 backdrop-blur-sm sticky top-6">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Tambah Alamat Baru</h3>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <MdClose className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Label Alamat *</label>
                      <input
                        value={newAddr.label}
                        onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                        placeholder="Rumah / Kantor / Apartemen"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nama Penerima *</label>
                      <input
                        value={newAddr.receiver_name}
                        onChange={(e) => setNewAddr({ ...newAddr, receiver_name: e.target.value })}
                        placeholder="Nama lengkap penerima"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon *</label>
                      <input
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        placeholder="62 811-488-068"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Alamat Lengkap *</label>
                      <textarea
                        value={newAddr.address_detail}
                        onChange={(e) => setNewAddr({ ...newAddr, address_detail: e.target.value })}
                        placeholder="Jalan, nomor, RT/RW, kelurahan, kecamatan"
                        rows={3}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kecamatan</label>
                      <input
                        value={newAddr.district}
                        onChange={(e) => setNewAddr({ ...newAddr, district: e.target.value })}
                        placeholder="Kecamatan"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kota *</label>
                      <input
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        placeholder="Kota"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Provinsi *</label>
                      <input
                        value={newAddr.province}
                        onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })}
                        placeholder="Provinsi"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Kode Pos</label>
                      <input
                        value={newAddr.postal_code}
                        onChange={(e) => setNewAddr({ ...newAddr, postal_code: e.target.value })}
                        placeholder="12345"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Catatan Tambahan</label>
                      <textarea
                        value={newAddr.notes}
                        onChange={(e) => setNewAddr({ ...newAddr, notes: e.target.value })}
                        placeholder="Catatan khusus untuk kurir (opsional)"
                        rows={2}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>
                    
                    <button 
                      onClick={add}
                      disabled={isSubmitting}
                      className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 transition-all duration-300 font-medium flex items-center justify-center disabled:opacity-50 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <MdAdd className="mr-2 h-5 w-5" />
                          Tambah Alamat
                        </>
                      )}
                    </button>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg">
                      <p className="text-xs text-slate-600 mb-1">
                        <MdWarning className="inline h-3 w-3 mr-1" />
                        <strong>Tips:</strong> Pastikan alamat lengkap untuk pengiriman yang akurat
                      </p>
                      <p className="text-xs text-slate-500">
                        * Field yang wajib diisi untuk proses pengiriman
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
