import React from 'react';
import { MdClose, MdAccountBalance, MdCheckCircle, MdFileDownload } from 'react-icons/md';

const PaymentDetailModal = ({ isOpen, onClose, referral }) => {
  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'unpaid': { label: 'Belum Dibayar', color: 'bg-red-100 text-red-800' },
      'pending': { label: 'Pending', color: 'bg-amber-100 text-amber-800' },
      'paid': { label: 'Sudah Dibayar', color: 'bg-green-100 text-green-800' }
    };
    
    const config = statusConfig[status] || statusConfig['unpaid'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleDownloadProof = () => {
    if (referral?.payment_proof) {
      const link = document.createElement('a');
      link.href = `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${referral.payment_proof}`;
      link.download = `bukti_pembayaran_${referral.code}.jpg`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

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
              <h2 className="text-xl font-bold text-slate-900">Detail Pembayaran Referral</h2>
              <p className="text-sm text-slate-600">Kode: {referral?.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Banner */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MdCheckCircle className={`text-2xl ${referral?.payment_status === 'paid' ? 'text-green-500' : 'text-slate-400'}`} />
              <div>
                <h3 className="font-medium text-slate-900">Status Pembayaran</h3>
                <div className="mt-1">{getStatusBadge(referral?.payment_status)}</div>
              </div>
            </div>
            {referral?.payment_status === 'paid' && referral?.paid_date && (
              <div className="text-right">
                <p className="text-sm text-slate-600">Dibayar pada:</p>
                <p className="font-medium text-slate-900">{formatDate(referral.paid_date)}</p>
              </div>
            )}
          </div>

          {/* Referral Info */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-900 mb-3">Informasi Referral</h3>
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
                <span className="text-slate-600">Bank Tujuan:</span>
                <div className="font-medium">{referral?.payout_bank_name || '-'}</div>
              </div>
              <div>
                <span className="text-slate-600">No. Rekening:</span>
                <div className="font-medium font-mono">{referral?.payout_account_number || '-'}</div>
              </div>
              <div className="md:col-span-2">
                <span className="text-slate-600">Pemegang Rekening:</span>
                <div className="font-medium">{referral?.payout_account_holder || '-'}</div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          {referral?.payment_status !== 'unpaid' && (
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-slate-900 mb-3">Detail Pembayaran</h3>
              <div className="space-y-3 text-sm">
                {referral?.account_number && (
                  <div>
                    <span className="text-slate-600">Nomor Rekening yang Dibayar:</span>
                    <div className="font-medium font-mono">{referral.account_number}</div>
                  </div>
                )}
                
                {referral?.paid_date && (
                  <div>
                    <span className="text-slate-600">Tanggal Pembayaran:</span>
                    <div className="font-medium">{formatDate(referral.paid_date)}</div>
                  </div>
                )}

                {referral?.payment_notes && (
                  <div>
                    <span className="text-slate-600">Catatan:</span>
                    <div className="font-medium">{referral.payment_notes}</div>
                  </div>
                )}

                {referral?.payment_proof && (
                  <div>
                    <span className="text-slate-600">Bukti Pembayaran:</span>
                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={handleDownloadProof}
                        className="flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition text-sm font-medium"
                      >
                        <MdFileDownload className="text-lg" />
                        Lihat / Download Bukti
                      </button>
                    </div>
                    {/* Preview if image */}
                    {referral.payment_proof && (referral.payment_proof.includes('.jpg') || referral.payment_proof.includes('.png') || referral.payment_proof.includes('.jpeg')) && (
                      <div className="mt-3">
                        <img 
                          src={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000'}${referral.payment_proof}`}
                          alt="Bukti Pembayaran"
                          className="max-w-full h-48 object-contain rounded border border-slate-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailModal;