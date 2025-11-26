import React, { useState } from "react";

const ReferralCode = () => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState(null);

  const handleApply = () => {
    // Simple local validation demo; backend validation will replace this
    if (!code) {
      setStatus({ type: "error", message: "Masukkan kode referal" });
      return;
    }
    // Example rule: code starting with NUSA gives 10%
    if (/^NUSA/i.test(code)) {
      setStatus({ type: "success", message: "Kode valid. Diskon 10% akan diterapkan saat checkout." });
    } else {
      setStatus({ type: "error", message: "Kode tidak valid." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Kode Referal</h1>
          <p className="text-slate-600 text-sm mb-4">Masukkan kode referal untuk mendapatkan diskon saat checkout atau di POS.</p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Contoh: NUSA10"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleApply}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Terapkan
            </button>
          </div>
          {status && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReferralCode;
