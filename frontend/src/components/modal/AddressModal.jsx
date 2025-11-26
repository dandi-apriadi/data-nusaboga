import React, { useState } from 'react';
import { 
  MdClose, 
  MdLocationOn,
  MdHome,
  MdWork,
  MdAdd,
  MdEdit,
  MdDelete,
  MdCheck,
  MdMyLocation
} from 'react-icons/md';

const AddressModal = ({ isOpen, onClose, onSave, editingAddress = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    label: editingAddress?.label || '',
    receiver: editingAddress?.receiver || '',
    phone: editingAddress?.phone || '',
    detail: editingAddress?.detail || '',
    district: editingAddress?.district || '',
    city: editingAddress?.city || '',
    province: editingAddress?.province || '',
    postalCode: editingAddress?.postalCode || '',
    notes: editingAddress?.notes || '',
    isDefault: editingAddress?.isDefault || false
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const provinces = [
    'DKI Jakarta',
    'Jawa Barat', 
    'Jawa Tengah',
    'Jawa Timur',
    'Banten',
    'Yogyakarta',
    'Bali',
    'Sumatera Utara',
    'Sumatera Barat',
    'Sulawesi Utara',
    'Sulawesi Selatan'
  ];

  const cities = {
    'DKI Jakarta': ['Jakarta Pusat', 'Jakarta Utara', 'Jakarta Selatan', 'Jakarta Timur', 'Jakarta Barat'],
    'Jawa Barat': ['Bandung', 'Bogor', 'Depok', 'Bekasi', 'Cimahi', 'Sukabumi'],
    'Jawa Tengah': ['Semarang', 'Surakarta', 'Yogyakarta', 'Magelang', 'Purwokerto'],
    'Jawa Timur': ['Surabaya', 'Malang', 'Kediri', 'Blitar', 'Mojokerto'],
    'Banten': ['Tangerang', 'Tangerang Selatan', 'Serang', 'Cilegon'],
    'Yogyakarta': ['Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunung Kidul'],
    'Bali': ['Denpasar', 'Badung', 'Gianyar', 'Tabanan', 'Klungkung'],
    'Sumatera Utara': ['Medan', 'Binjai', 'Tebing Tinggi', 'Pematang Siantar'],
    'Sumatera Barat': ['Padang', 'Bukittinggi', 'Padang Panjang', 'Payakumbuh'],
    'Sulawesi Utara': ['Manado', 'Bitung', 'Tomohon', 'Kotamobagu'],
    'Sulawesi Selatan': ['Makassar', 'Pare-Pare', 'Palopo']
  };

  const labelPresets = [
    { id: 'rumah', label: 'Rumah', icon: MdHome },
    { id: 'kantor', label: 'Kantor', icon: MdWork },
    { id: 'apartemen', label: 'Apartemen', icon: MdLocationOn },
    { id: 'kos', label: 'Kos', icon: MdLocationOn }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.label.trim()) newErrors.label = 'Label alamat wajib diisi';
    if (!formData.receiver.trim()) newErrors.receiver = 'Nama penerima wajib diisi';
    if (!formData.phone.trim()) newErrors.phone = 'Nomor telepon wajib diisi';
    else if (!/^(\+62|62|0)[0-9]{8,13}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Format nomor telepon tidak valid';
    }
    if (!formData.detail.trim()) newErrors.detail = 'Alamat lengkap wajib diisi';
    if (!formData.district.trim()) newErrors.district = 'Kecamatan wajib diisi';
    if (!formData.city.trim()) newErrors.city = 'Kota wajib diisi';
    if (!formData.province.trim()) newErrors.province = 'Provinsi wajib diisi';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Kode pos wajib diisi';
    else if (!/^[0-9]{5}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Kode pos harus 5 digit angka';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-clear city when province changes
    if (field === 'province') {
      setFormData(prev => ({
        ...prev,
        city: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const addressData = {
        ...formData,
        id: editingAddress?.id || Date.now(),
        fullAddress: `${formData.detail}, ${formData.district}, ${formData.city}, ${formData.province} ${formData.postalCode}`
      };

      onSave(addressData);
      onClose();
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In real app, you would use reverse geocoding service
          // For demo, we'll just show coordinates
          alert(`Lokasi terdeteksi: ${position.coords.latitude}, ${position.coords.longitude}\nFitur akan segera tersedia.`);
        },
        (error) => {
          alert('Gagal mendapatkan lokasi. Pastikan Anda mengizinkan akses lokasi.');
        }
      );
    } else {
      alert('Browser Anda tidak mendukung geolokasi.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <MdLocationOn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {mode === 'add' ? 'Tambah Alamat Baru' : 'Edit Alamat'}
              </h2>
              <p className="text-sm text-slate-600">
                {mode === 'add' 
                  ? 'Tambahkan alamat pengiriman baru' 
                  : 'Perbarui informasi alamat'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <MdClose className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[calc(95vh-140px)] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Current Location Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <MdMyLocation className="w-4 h-4 mr-2" />
                Gunakan Lokasi Saat Ini
              </button>
            </div>

            {/* Label Preset */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Label Alamat *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                {labelPresets.map((preset) => {
                  const IconComponent = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleInputChange('label', preset.label)}
                      className={`p-3 border rounded-lg transition-colors flex flex-col items-center space-y-2 ${
                        formData.label === preset.label
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="text-sm font-medium">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
              
              <input
                type="text"
                placeholder="Atau tulis label kustom"
                value={formData.label}
                onChange={(e) => handleInputChange('label', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                  errors.label ? 'border-red-500' : 'border-slate-200'
                }`}
              />
              {errors.label && (
                <p className="mt-1 text-sm text-red-600">{errors.label}</p>
              )}
            </div>

            {/* Receiver Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Penerima *
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap penerima"
                  value={formData.receiver}
                  onChange={(e) => handleInputChange('receiver', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.receiver ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.receiver && (
                  <p className="mt-1 text-sm text-red-600">{errors.receiver}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.phone ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Detailed Address */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Alamat Lengkap *
              </label>
              <textarea
                placeholder="Jalan, gang, nomor rumah, RT/RW, dll."
                value={formData.detail}
                onChange={(e) => handleInputChange('detail', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none ${
                  errors.detail ? 'border-red-500' : 'border-slate-200'
                }`}
              />
              {errors.detail && (
                <p className="mt-1 text-sm text-red-600">{errors.detail}</p>
              )}
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kecamatan *
                </label>
                <input
                  type="text"
                  placeholder="Nama kecamatan"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.district ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.district && (
                  <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kode Pos *
                </label>
                <input
                  type="text"
                  placeholder="12345"
                  maxLength={5}
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.postalCode ? 'border-red-500' : 'border-slate-200'
                  }`}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Provinsi *
                </label>
                <select
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${
                    errors.province ? 'border-red-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">Pilih Provinsi</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </select>
                {errors.province && (
                  <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Kota/Kabupaten *
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  disabled={!formData.province}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed ${
                    errors.city ? 'border-red-500' : 'border-slate-200'
                  }`}
                >
                  <option value="">Pilih Kota</option>
                  {formData.province && cities[formData.province]?.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Catatan untuk Kurir (Opsional)
              </label>
              <textarea
                placeholder="Contoh: Rumah warna biru, dekat warung"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleInputChange('isDefault', e.target.checked)}
                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <label htmlFor="isDefault" className="ml-3 text-sm font-medium text-slate-700">
                Jadikan sebagai alamat utama
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <MdCheck className="w-4 h-4 mr-2" />
                  {mode === 'add' ? 'Simpan Alamat' : 'Perbarui Alamat'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;