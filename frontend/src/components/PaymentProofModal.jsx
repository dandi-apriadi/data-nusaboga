import React, { useState } from 'react';
import { MdClose, MdUpload, MdAccountBalance } from 'react-icons/md';

const PaymentProofModal = ({ isOpen, onClose, referral, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    paymentProof: null,
    paymentNotes: ''
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ ...errors, paymentProof: 'Hanya file JPG, PNG, atau PDF yang diizinkan' });
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, paymentProof: 'Ukuran file maksimal 5MB' });
        return;
      }

      setFormData({ ...formData, paymentProof: file });
      setErrors({ ...errors, paymentProof: null });

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.paymentProof) {
      newErrors.paymentProof = 'Bukti pembayaran wajib diupload';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      paymentProof: null,
      paymentNotes: ''
    });
    setPreviewUrl(null);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <MdAccountBalance className="text-indigo-600 text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Upload Bukti Pembayaran</h2>
              <p className="text-sm text-slate-600">Kode: {referral?.code}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1"
            disabled={loading}
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Referral Info */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-900 mb-2">Informasi Referral</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-600">Owner:</span>
                <div className="font-medium">{referral?.owner?.fullname || referral?.owner_user_id || '-'}</div>
              </div>
              <div>
                <span className="text-slate-600">Total Bonus:</span>
                <div className="font-medium text-green-600">
                  Rp {Number(referral?.total_bonus_amount || 0).toLocaleString('id-ID')}
                </div>
              </div>
              <div>
                <span className="text-slate-600">Bank:</span>
                <div className="font-medium">{referral?.payout_bank_name || '-'}</div>
              </div>
              <div>
                <span className="text-slate-600">Rekening:</span>
                <div className="font-medium font-mono">{referral?.payout_account_number || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-600">Pemegang Rekening:</span>
                <div className="font-medium">{referral?.payout_account_holder || '-'}</div>
              </div>
            </div>
          </div>

          {/* Upload Bukti Pembayaran */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bukti Pembayaran *
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-400 transition">
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="paymentProof"
                disabled={loading}
              />
              <label htmlFor="paymentProof" className="cursor-pointer">
                <MdUpload className="mx-auto text-4xl text-slate-400 mb-2" />
                <p className="text-slate-600 mb-1">
                  {formData.paymentProof ? formData.paymentProof.name : 'Pilih file bukti pembayaran'}
                </p>
                <p className="text-xs text-slate-500">JPG, PNG, atau PDF (max 5MB)</p>
              </label>
            </div>
            {errors.paymentProof && (
              <p className="text-red-600 text-xs mt-1">{errors.paymentProof}</p>
            )}
            
            {/* Preview */}
            {previewUrl && (
              <div className="mt-4">
                <img src={previewUrl} alt="Preview" className="max-w-full h-32 object-contain mx-auto rounded" />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Catatan Pembayaran
            </label>
            <textarea
              name="paymentNotes"
              value={formData.paymentNotes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Catatan tambahan (opsional)"
              disabled={loading}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <MdUpload className="text-lg" />
                  Upload Bukti Bayar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentProofModal;