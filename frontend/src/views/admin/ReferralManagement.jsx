import React, { useState, useEffect, useMemo } from "react";
import { MdAdd, MdEdit, MdDelete, MdCardGiftcard, MdDownload, MdChevronLeft, MdChevronRight, MdPayment, MdClose, MdCheckCircle } from "react-icons/md";
import { FaPercentage, FaTag } from "react-icons/fa";
import api from "../../api/axios";
import Receipt from "components/Receipt";
import ResponsiveTable from 'components/ResponsiveTable';
import PaymentProofModal from "../../components/PaymentProofModal";
import PaymentDetailModal from "../../components/PaymentDetailModal";

// Modern Modal Animation Styles
const modalStyles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes scaleUp {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  .animation-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  
  .animation-scale-up {
    animation: scaleUp 0.3s ease-out;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = modalStyles;
  document.head.appendChild(style);
}

const ReferralManagement = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentReferral, setCurrentReferral] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage",
    value: "",
    description: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
    is_active: true,
    owner_user_id: "",
    bonus_percent: "",
    payout_bank_name: "",
    payout_account_number: "",
    payout_account_holder: "",
  });
  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customersError, setCustomersError] = useState(null);
  const [detailReferral, setDetailReferral] = useState(null);
  const [bonusTx, setBonusTx] = useState([]);
  const [bonusLoading, setBonusLoading] = useState(false);
  const [bonusError, setBonusError] = useState(null);
  // Pagination state for bonus transactions
  const [bonusPage, setBonusPage] = useState(1);
  const [bonusPageSize, setBonusPageSize] = useState(10);

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentDetailModal, setShowPaymentDetailModal] = useState(false);
  const [selectedReferralForPayment, setSelectedReferralForPayment] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const totalBonusPages = useMemo(() => {
    return Math.max(1, Math.ceil(bonusTx.length / bonusPageSize));
  }, [bonusTx.length, bonusPageSize]);

  const paginatedBonusTx = useMemo(() => {
    const start = (bonusPage - 1) * bonusPageSize;
    return bonusTx.slice(start, start + bonusPageSize);
  }, [bonusTx, bonusPage, bonusPageSize]);

  // Reset pagination when transactions change
  useEffect(() => { setBonusPage(1); }, [bonusTx.length]);

  const openDetail = async (ref) => {
    setDetailReferral({ loading: true, ref });
    setBonusTx([]); setBonusError(null); setBonusLoading(true);
    try {
      const { data } = await api.get(`/referrals/${ref.id}/bonuses`);
      if (data?.transactions) setBonusTx(data.transactions);
      setDetailReferral({ loading: false, ref: data.referral || ref });
    } catch (e) {
      setBonusError(e?.response?.data?.msg || 'Gagal memuat bonus');
      setDetailReferral({ loading: false, ref });
    } finally { setBonusLoading(false); }
  };
  const closeDetail = () => { setDetailReferral(null); setBonusTx([]); setBonusError(null); };

  // Normalisasi data dari backend (referral_id, type: percent|fixed)
  const normalizeReferral = (r) => ({
    id: r.referral_id,
    code: r.code,
    type: r.type === 'percent' ? 'percentage' : r.type, // samakan dengan UI existing
    value: parseFloat(r.value),
    description: r.description,
    usage_limit: r.usage_limit,
    usage_count: r.usage_count,
    valid_from: r.valid_from,
    valid_until: r.valid_until,
    is_active: r.is_active,
    min_order_amount: r.min_order_amount ? parseFloat(r.min_order_amount) : null,
    created_at: r.created_at,
    updated_at: r.updated_at,
    owner_user_id: r.owner_user_id || r.owner?.user_id || null,
    owner: r.owner || null,
    bonus_percent: r.bonus_percent,
    total_bonus_amount: r.total_bonus_amount ? parseFloat(r.total_bonus_amount) : 0,
    payout_bank_name: r.payout_bank_name || '',
    payout_account_number: r.payout_account_number || '',
    payout_account_holder: r.payout_account_holder || '',
    // Payment fields
    payment_status: r.payment_status || 'unpaid',
    payment_proof: r.payment_proof || null,
    paid_to_account: r.paid_to_account || null,
    paid_date: r.paid_date || null,
    paid_amount: r.paid_amount ? parseFloat(r.paid_amount) : null,
    payment_notes: r.payment_notes || null
  });

  // Fetch referral codes
  const fetchReferrals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/referrals');
      const list = Array.isArray(data) ? data.map(normalizeReferral) : [];
      setReferrals(list);
    } catch (err) {
      console.error('Error fetching referrals:', err);
      setError(err?.response?.data?.msg || 'Gagal memuat data kode referal');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    setCustomersError(null);
    try {
      const { data } = await api.get('/customers', { params: { limit: 200 } });
      // API shape from controller: { success:true, data:[...], pagination:{...} }
      const array = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setCustomers(array.map(c => ({ id: c.id, name: c.fullName || c.name || c.email || c.id, email: c.email })));
      if ((array?.length || 0) === 0) {
        console.warn('[ReferralManagement] Customers endpoint returned empty array');
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
      const msg = err?.response?.data?.msg || err.message || 'Gagal memuat pelanggan';
      setCustomersError(msg);
    } finally {
      setLoadingCustomers(false);
    }
  };

  // Refetch customers when modal opened if empty & not already loading
  useEffect(() => {
    if (showModal && !loadingCustomers && customers.length === 0 && !customersError) {
      fetchCustomers();
    }
  }, [showModal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      ...formData,
      type: formData.type === 'percentage' ? 'percent' : formData.type,
      usage_limit: formData.usage_limit || null,
      valid_from: formData.valid_from || null,
      valid_until: formData.valid_until || null,
      owner_user_id: formData.owner_user_id || null,
      bonus_percent: formData.bonus_percent ? parseFloat(formData.bonus_percent) : null,
      payout_bank_name: formData.payout_bank_name || null,
      payout_account_number: formData.payout_account_number || null,
      payout_account_holder: formData.payout_account_holder || null,
    };
    if (payload.bonus_percent && (payload.bonus_percent < 0 || payload.bonus_percent > 100)) {
      alert('Bonus persen harus antara 0 - 100');
      return;
    }
    try {
      if (editMode && currentReferral) {
        await api.put(`/referrals/${currentReferral.id}`, payload);
        alert('Kode referal berhasil diupdate!');
      } else {
        await api.post('/referrals', payload);
        alert('Kode referal berhasil dibuat!');
      }
      fetchReferrals();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving referral:', err);
      const msg = err?.response?.data?.msg || 'Gagal menyimpan kode referal';
      setError(msg);
      alert(msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus kode referal ini?')) {
      try {
        await api.delete(`/referrals/${id}`);
        fetchReferrals();
        alert('Kode referal berhasil dihapus!');
      } catch (err) {
        console.error('Error deleting referral:', err);
        alert(err?.response?.data?.msg || err.message);
      }
    }
  };

  const handleEdit = (referral) => {
    setCurrentReferral(referral);
    setFormData({
      code: referral.code,
      type: referral.type,
      value: referral.value,
      description: referral.description || "",
      usage_limit: referral.usage_limit || "",
      valid_from: referral.valid_from ? referral.valid_from.split('T')[0] : "",
      valid_until: referral.valid_until ? referral.valid_until.split('T')[0] : "",
      is_active: referral.is_active,
      owner_user_id: referral.owner?.user_id || referral.owner_user_id || "",
      bonus_percent: referral.bonus_percent || ""
      ,payout_bank_name: referral.payout_bank_name || ""
      ,payout_account_number: referral.payout_account_number || ""
      ,payout_account_holder: referral.payout_account_holder || ""
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentReferral(null);
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      description: "",
      usage_limit: "",
      valid_from: "",
      valid_until: "",
      is_active: true,
      owner_user_id: "",
      bonus_percent: ""
      ,payout_bank_name: ""
      ,payout_account_number: ""
      ,payout_account_holder: ""
    });
  };

  // Payment modal functions
  const handleOpenPaymentModal = (referral) => {
    setSelectedReferralForPayment(referral);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedReferralForPayment(null);
    setPaymentLoading(false);
  };

  const handlePaymentProofSubmit = async (formData) => {
    setPaymentLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('paymentProof', formData.paymentProof);
      formDataToSend.append('account_number', selectedReferralForPayment.payout_account_number || '');
      if (formData.paymentNotes) {
        formDataToSend.append('payment_notes', formData.paymentNotes);
      }

      await api.post(`/referrals/${selectedReferralForPayment.id}/payment-proof`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Bukti pembayaran berhasil diupload!');
      fetchReferrals(); // Refresh data
      handleClosePaymentModal();
    } catch (error) {
      console.error('Error uploading payment proof:', error);
      const msg = error?.response?.data?.msg || 'Gagal mengupload bukti pembayaran';
      alert(msg);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle payment detail modal
  const handleShowPaymentDetail = (referral) => {
    setSelectedReferralForPayment(referral);
    setShowPaymentDetailModal(true);
  };

  const handleClosePaymentDetailModal = () => {
    setShowPaymentDetailModal(false);
    setSelectedReferralForPayment(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <MdCardGiftcard className="text-indigo-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Kode Referal</h1>
            <p className="text-slate-600">Kelola kode referal untuk program rujukan pelanggan</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 transition-all font-semibold flex items-center gap-2 border border-indigo-500"
        >
          <MdAdd size={20} /> Tambah Kode Referal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Kode</h3>
          <p className="text-2xl font-bold text-slate-900">{referrals.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Aktif</h3>
          <p className="text-2xl font-bold text-green-600">
            {referrals.filter(r => r.is_active).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Penggunaan</h3>
          <p className="text-2xl font-bold text-blue-600">
            {referrals.reduce((sum, r) => sum + (r.usage_count || 0), 0)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Kadaluarsa</h3>
          <p className="text-2xl font-bold text-red-600">
            {referrals.filter(r => r.valid_until && new Date(r.valid_until) < new Date()).length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <ResponsiveTable>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-600">Kode</th>
                <th className="text-left p-4 font-medium text-slate-600">Tipe</th>
                <th className="text-left p-4 font-medium text-slate-600">Nilai</th>
                <th className="text-left p-4 font-medium text-slate-600">Owner</th>
                <th className="text-left p-4 font-medium text-slate-600">Rekening</th>
                <th className="text-left p-4 font-medium text-slate-600">Bonus %</th>
                <th className="text-left p-4 font-medium text-slate-600">Total Bonus</th>
                <th className="text-left p-4 font-medium text-slate-600">Status Bayar</th>
                <th className="text-left p-4 font-medium text-slate-600">Penggunaan</th>
                <th className="text-left p-4 font-medium text-slate-600">Berlaku Sampai</th>
                <th className="text-left p-4 font-medium text-slate-600">Status</th>
                <th className="text-left p-4 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center p-8 text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="12" className="text-center p-8 text-red-600">
                    {error}
                  </td>
                </tr>
              ) : referrals.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center p-8 text-slate-500">
                    Belum ada kode referal
                  </td>
                </tr>
              ) : (
                referrals.map((referral, index) => (
                  <tr key={referral.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-4">
                      <span className="font-medium text-slate-900">{referral.code}</span>
                      {referral.description && (
                        <p className="text-sm text-slate-500">{referral.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="capitalize">{referral.type}</span>
                    </td>
                    <td className="p-4">
                      {referral.type === 'percentage' ? `${referral.value}%` : `Rp ${Number(referral.value).toLocaleString('id-ID')}`}
                    </td>
                    <td className="p-4 text-sm">
                      {referral.owner?.fullname || referral.owner_user_id || '-'}
                    </td>
                    <td className="p-4 text-xs font-mono">
                      {referral.payout_bank_name ? (
                        <div className="space-y-0.5">
                          <div className="text-slate-700">{referral.payout_bank_name}</div>
                          <div className="text-slate-600 break-all">{referral.payout_account_number || '-'}</div>
                          <div className="text-slate-500 truncate max-w-[140px]" title={referral.payout_account_holder}>{referral.payout_account_holder || '-'}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {referral.bonus_percent ? `${parseFloat(referral.bonus_percent)}%` : '-'}
                    </td>
                    <td className="p-4 text-sm">
                      {referral.total_bonus_amount ? `Rp ${referral.total_bonus_amount.toLocaleString('id-ID')}` : '-'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        referral.payment_status === 'paid' 
                          ? "bg-green-100 text-green-700" 
                          : referral.payment_status === 'pending'
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {referral.payment_status === 'paid' ? 'Sudah Dibayar' 
                         : referral.payment_status === 'pending' ? 'Menunggu Konfirmasi'
                         : 'Belum Dibayar'}
                      </span>
                      {referral.paid_date && (
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(referral.paid_date).toLocaleDateString('id-ID')}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span>{referral.usage_count || 0}</span>
                      {referral.usage_limit && (
                        <span className="text-slate-500">/{referral.usage_limit}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {referral.valid_until ? (
                        <span className={new Date(referral.valid_until) < new Date() ? "text-red-600" : "text-slate-900"}>
                          {new Date(referral.valid_until).toLocaleDateString('id-ID')}
                        </span>
                      ) : (
                        <span className="text-slate-500">Tidak terbatas</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        referral.is_active 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {referral.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(referral)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => openDetail(referral)}
                          className="text-indigo-600 hover:text-indigo-800 p-1"
                          title="Detail Bonus"
                        >
                          ℹ️
                        </button>
                        {referral.total_bonus_amount > 0 && (
                          <button
                            onClick={() => {
                              if (referral.payment_status === 'paid') {
                                handleShowPaymentDetail(referral);
                              } else {
                                handleOpenPaymentModal(referral);
                              }
                            }}
                            className={`p-1 ${
                              referral.payment_status === 'paid' 
                                ? 'text-blue-600 hover:text-blue-800' 
                                : 'text-green-600 hover:text-green-800'
                            }`}
                            title={
                              referral.payment_status === 'paid' 
                                ? 'Lihat Detail Pembayaran' 
                                : 'Upload Bukti Bayar'
                            }
                          >
                            <MdPayment />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(referral.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Hapus"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>

      {/* Modal Form - Modern Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animation-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animation-scale-up max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MdCardGiftcard className="text-indigo-200" />
                  {editMode ? "Edit Kode Referal" : "Tambah Kode Referal"}
                </h2>
                <p className="text-indigo-100 text-sm mt-1">
                  {editMode ? "Update detail kode referal Anda" : "Buat kode referal baru untuk program rujukan"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-indigo-100 hover:text-white transition-colors"
              >
                <MdClose size={24} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Section 1: Informasi Dasar */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                  Informasi Dasar
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Kode */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Kode Referal <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaTag className="absolute left-3 top-3.5 text-indigo-400" />
                      <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const replaced = raw.replace(/\s+/g, '_');
                          const filtered = replaced.replace(/[^A-Za-z0-9_]/g, '');
                          const transformed = filtered.toUpperCase();
                          setFormData({ ...formData, code: transformed });
                        }}
                        pattern="[A-Z0-9_]+"
                        title="Hanya huruf (A-Z), angka (0-9), dan underscore (_)"
                        maxLength={32}
                        className="w-full pl-10 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                        placeholder="NUSA2024"
                        required
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">Format: A-Z, angka, underscore. Maks 32 karakter.</p>
                  </div>

                  {/* Tipe Diskon */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Tipe Diskon
                    </label>
                    <div className="relative">
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="w-full pl-4 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors appearance-none bg-white cursor-pointer"
                      >
                        <option value="percentage">Persentase (%)</option>
                        <option value="fixed">Nominal (Rp)</option>
                      </select>
                      <FaPercentage className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Nilai Diskon & Deskripsi */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nilai Diskon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder={formData.type === 'percentage' ? "10" : "50000"}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Deskripsi
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Diskon untuk pelanggan baru"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Pembatasan & Validitas */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                  Pembatasan & Validitas
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Batas Penggunaan
                    </label>
                    <input
                      type="number"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="100"
                    />
                    <p className="mt-1 text-xs text-slate-500">Kosongkan jika unlimited</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Berlaku Dari
                    </label>
                    <input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Berlaku Sampai
                    </label>
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Data Owner & Bonus */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                  Penerima Bonus & Konfigurasi
                </h3>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Owner (Pelanggan Penerima Bonus)
                  </label>
                  <div className="space-y-2">
                    <select
                      value={formData.owner_user_id}
                      onChange={(e) => setFormData({...formData, owner_user_id: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors disabled:opacity-60"
                      disabled={loadingCustomers}
                    >
                      <option value="">-- Tidak ada (opsional) --</option>
                      {loadingCustomers && <option>Memuat...</option>}
                      {!loadingCustomers && !customersError && customers.length > 0 && customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}{c.email ? ` (${c.email})` : ''}</option>
                      ))}
                      {!loadingCustomers && !customersError && formData.owner_user_id && !customers.find(c => c.id === formData.owner_user_id) && (
                        <option value={formData.owner_user_id}>
                          (Current) {formData.owner_user_id}
                        </option>
                      )}
                      {(!loadingCustomers && !customersError && customers.length === 0) && (
                        <option value="" disabled>Tidak ada data pelanggan (buat pelanggan dulu)</option>
                      )}
                    </select>
                    <div className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={fetchCustomers}
                        className="px-3 py-1.5 border-2 border-indigo-300 rounded-lg hover:bg-indigo-50 text-indigo-600 font-medium transition-colors"
                        disabled={loadingCustomers}
                      >{loadingCustomers ? 'Menyegarkan...' : '🔄 Refresh'}</button>
                      {customersError && (
                        <span className="text-red-600">{customersError}</span>
                      )}
                      {!customersError && customers.length > 0 && (
                        <span className="text-slate-500">Total: {customers.length}</span>
                      )}
                      {!customersError && !loadingCustomers && customers.length === 0 && (
                        <span className="text-amber-600 font-medium">Belum ada pelanggan</span>
                      )}
                    </div>
                    {!customersError && !loadingCustomers && customers.length === 0 && (
                      <div className="mt-2 p-3 bg-amber-50 border-l-4 border-amber-400 rounded text-amber-700 text-xs">
                        <p className="font-medium mb-1">Tidak ditemukan data pelanggan</p>
                        <ul className="list-disc ml-4 space-y-0.5">
                          <li>Pastikan sudah login sebagai admin</li>
                          <li>Sudah membuat / seeding user dengan role user</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Bonus Persentase untuk Owner (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.bonus_percent}
                    onChange={(e) => setFormData({...formData, bonus_percent: e.target.value})}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                    placeholder="Contoh: 5"
                  />
                  <p className="text-xs text-slate-500 mt-1.5">Biarkan kosong jika tidak ada bonus referral tambahan</p>
                </div>
              </div>

              {/* Section 4: Data Rekening */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                  Informasi Payout (Opsional)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nama Bank
                    </label>
                    <input
                      type="text"
                      value={formData.payout_bank_name}
                      onChange={(e)=> setFormData({...formData, payout_bank_name: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="BCA / BRI / Mandiri"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nomor Rekening
                    </label>
                    <input
                      type="text"
                      value={formData.payout_account_number}
                      onChange={(e)=> setFormData({...formData, payout_account_number: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors font-mono"
                      placeholder="1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Nama Pemilik Rekening
                    </label>
                    <input
                      type="text"
                      value={formData.payout_account_holder}
                      onChange={(e)=> setFormData({...formData, payout_account_holder: e.target.value})}
                      className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="Nama di Rekening"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Status Aktif */}
              <div className="border-t pt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="w-5 h-5 rounded-lg border-2 border-slate-300 text-indigo-600 focus:ring-0 appearance-none cursor-pointer accent-indigo-600"
                    />
                    {formData.is_active && (
                      <MdCheckCircle className="absolute top-0 left-0 text-indigo-600" size={20} />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Aktifkan kode referal ini</span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="border-t pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-lg hover:from-indigo-700 hover:to-indigo-800 font-semibold transition-all flex items-center gap-2"
                >
                  <MdCheckCircle size={18} />
                  {editMode ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {detailReferral && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[85vh] mx-4 p-6 relative flex flex-col shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Detail Bonus Referal {detailReferral.ref?.code}</h2>
              <button onClick={closeDetail} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            {bonusLoading ? (
              <div className="py-10 text-center text-slate-500">Memuat...</div>
            ) : bonusError ? (
              <div className="py-10 text-center text-red-600">{bonusError}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-500">Total Transaksi</p>
                    <p className="font-semibold text-slate-800">{bonusTx.length}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-500">Total Base</p>
                    <p className="font-semibold text-slate-800">Rp {bonusTx.reduce((s,b)=>s+parseFloat(b.base_amount||0),0).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-500">Total Bonus</p>
                    <p className="font-semibold text-indigo-600">Rp {bonusTx.reduce((s,b)=>s+parseFloat(b.bonus_amount||0),0).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg">
                    <p className="text-slate-500">Bonus %</p>
                    <p className="font-semibold text-slate-800">{detailReferral.ref?.bonus_percent || '-'}%</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg col-span-2 md:col-span-4">
                    <p className="text-slate-500 mb-1">Rekening Payout</p>
                    {detailReferral.ref?.payout_bank_name ? (
                      <p className="font-mono text-xs text-slate-700 break-all">
                        {detailReferral.ref.payout_bank_name} • {detailReferral.ref.payout_account_number || '-'} • {detailReferral.ref.payout_account_holder || '-'}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-xs italic">Belum diatur</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                  <h3 className="font-semibold text-slate-700 text-sm">Riwayat Bonus ({bonusTx.length})</h3>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500">Baris per halaman:</span>
                      <select
                        value={bonusPageSize}
                        onChange={(e)=>{ setBonusPageSize(parseInt(e.target.value)||10); setBonusPage(1); }}
                        className="border border-slate-300 rounded-md px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        {[5,10,20,50].map(size => <option key={size} value={size}>{size}</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={bonusPage===1}
                        onClick={()=> setBonusPage(p=> Math.max(1,p-1))}
                        className={`p-1 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed`}
                        title="Sebelumnya"
                      >
                        <MdChevronLeft />
                      </button>
                      <span className="text-slate-600">{bonusPage} / {totalBonusPages}</span>
                      <button
                        disabled={bonusPage===totalBonusPages}
                        onClick={()=> setBonusPage(p=> Math.min(totalBonusPages,p+1))}
                        className={`p-1 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed`}
                        title="Berikutnya"
                      >
                        <MdChevronRight />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex-1 overflow-auto border border-slate-200 rounded-lg min-h-[300px]">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="p-2 text-left">Waktu</th>
                        <th className="p-2 text-left">Order</th>
                        <th className="p-2 text-right">Base</th>
                        <th className="p-2 text-right">Bonus</th>
                        <th className="p-2 text-left">Status</th>
                        <th className="p-2 text-center">Struk</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bonusTx.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center p-6 text-slate-500">Belum ada bonus</td>
                        </tr>
                      ) : paginatedBonusTx.map(tx => {
                        const baseAmt = parseFloat(tx.base_amount || 0);
                        const bonusAmt = parseFloat(tx.bonus_amount || 0);
                        return (
                          <tr key={tx.bonus_id} className="border-t border-slate-100">
                            <td className="p-2 whitespace-nowrap">{new Date(tx.created_at).toLocaleString('id-ID')}</td>
                            <td className="p-2 text-xs break-all">{tx.order_id || '-'}</td>
                            <td className="p-2 text-right">Rp {baseAmt.toLocaleString('id-ID')}</td>
                            <td className="p-2 text-right text-indigo-600">Rp {bonusAmt.toLocaleString('id-ID')}</td>
                            <td className="p-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tx.status==='granted' ? 'bg-green-100 text-green-700':'bg-slate-100 text-slate-600'}`}>{tx.status}</span>
                            </td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => {
                                  const orderData = {
                                    id: tx.order_id || `REF-${detailReferral.ref?.code}`,
                                    date: tx.created_at || new Date().toISOString(),
                                    items: [{ name: `Referral ${detailReferral.ref?.code}`, price: baseAmt, quantity: 1 }],
                                    subtotal: baseAmt,
                                    discount: 0,
                                    discountAmount: 0,
                                    total: baseAmt,
                                    paymentMethod: 'qr',
                                    receivedAmount: baseAmt,
                                    change: 0,
                                    profit: bonusAmt,
                                    cashier: detailReferral.ref?.owner?.fullname || 'Referral Owner',
                                    status: 'SELESAI'
                                  };
                                  try {
                                    const receipt = Receipt({ orderData, type: 'pos' });
                                    receipt.printReceipt();
                                  } catch (err) {
                                    console.error('[ReferralManagement] Cetak struk gagal:', err);
                                    alert('Gagal mencetak struk');
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md"
                                title="Download Struk"
                              >
                                <MdDownload />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Pagination Footer */}
                {bonusTx.length > 0 && (
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-xs">
                    <div className="text-slate-600">Menampilkan {(bonusPage-1)*bonusPageSize + 1} - {Math.min(bonusPage*bonusPageSize, bonusTx.length)} dari {bonusTx.length}</div>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={bonusPage===1}
                        onClick={()=> setBonusPage(p=> Math.max(1,p-1))}
                        className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Sebelumnya"
                      >
                        <MdChevronLeft />
                      </button>
                      {Array.from({ length: totalBonusPages }).slice(0,10).map((_,i)=>{
                        const pageNum = i+1;
                        // Show first 5, last 1, and current neighbors if pages > 10 (simple truncation)
                        if (totalBonusPages > 10) {
                          if (pageNum > 5 && pageNum < totalBonusPages && Math.abs(pageNum - bonusPage) > 1) return null;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={()=> setBonusPage(pageNum)}
                            className={`px-2 py-1 rounded-md border text-xs ${bonusPage===pageNum ? 'bg-indigo-600 border-indigo-600 text-white':'border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                          >{pageNum}</button>
                        );
                      })}
                      {totalBonusPages > 10 && bonusPage < totalBonusPages - 2 && (
                        <span className="px-1">…</span>
                      )}
                      {totalBonusPages > 10 && (
                        <button
                          onClick={()=> setBonusPage(totalBonusPages)}
                          className={`px-2 py-1 rounded-md border text-xs ${bonusPage===totalBonusPages ? 'bg-indigo-600 border-indigo-600 text-white':'border-slate-300 hover:bg-slate-50 text-slate-700'}`}
                        >{totalBonusPages}</button>
                      )}
                      <button
                        disabled={bonusPage===totalBonusPages}
                        onClick={()=> setBonusPage(p=> Math.min(totalBonusPages,p+1))}
                        className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Berikutnya"
                      >
                        <MdChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="flex justify-end mt-4 pt-2 border-t border-slate-200">
              <button onClick={closeDetail} className="px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-sm font-medium">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Proof Modal */}
      <PaymentProofModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        referral={selectedReferralForPayment}
        onSubmit={handlePaymentProofSubmit}
        loading={paymentLoading}
      />

      {/* Payment Detail Modal */}
      <PaymentDetailModal
        isOpen={showPaymentDetailModal}
        onClose={handleClosePaymentDetailModal}
        referral={selectedReferralForPayment}
      />
    </div>
  );
};

export default ReferralManagement;