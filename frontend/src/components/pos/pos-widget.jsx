import React, { useEffect, useState } from "react";
import { MdShoppingCart, MdClose, MdPointOfSale } from "react-icons/md";
import POSMenu from "views/admin/POSMenu";

// PosWidget: Floating guest checkout + full-screen POS modal
// File name: components/pos/pos-widget.jsx (kebab-case)
// Component: PosWidget (PascalCase)
export default function PosWidget() {
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [showGuestPOS, setShowGuestPOS] = useState(false);
  const [guestData, setGuestData] = useState({ nama: "", alamat: "", whatsapp: "" });
  const [guestError, setGuestError] = useState("");
  const [guestCheckoutData, setGuestCheckoutData] = useState(null);
  const [cartData, setCartData] = useState({ items: [], itemCount: 0, subtotal: 0, total: 0 });

  // Load guestCheckoutData when POS modal opens
  useEffect(() => {
    if (showGuestPOS) {
      try {
        const stored = localStorage.getItem("guestCheckoutData");
        if (stored) setGuestCheckoutData(JSON.parse(stored));
      } catch (e) {
        console.warn("[POS] Failed to parse guestCheckoutData", e);
      }
    }
  }, [showGuestPOS]);

  const handleGuestCheckout = () => {
    setGuestError("");

    if (!guestData.nama.trim()) return setGuestError("Nama wajib diisi");
    if (!guestData.alamat.trim()) return setGuestError("Alamat wajib diisi");
    if (!guestData.whatsapp.trim()) return setGuestError("Nomor WhatsApp wajib diisi");

    const waNumber = guestData.whatsapp.replace(/\D/g, "");
    if (waNumber.length < 10) return setGuestError("Nomor WhatsApp tidak valid (minimal 10 digit)");

    try {
      localStorage.setItem(
        "guestCheckoutData",
        JSON.stringify({ ...guestData, timestamp: new Date().toISOString() })
      );
    } catch (e) {
      console.warn("[POS] Failed to persist guestCheckoutData", e);
    }

    setShowGuestCheckout(false);
    setShowGuestPOS(true);
  };

  const closeGuestCheckout = () => {
    setShowGuestCheckout(false);
    setGuestData({ nama: "", alamat: "", whatsapp: "" });
    setGuestError("");
  };

  const closePOS = () => {
    setShowGuestPOS(false);
    try { localStorage.removeItem("guestCheckoutData"); } catch (_) {}
    setGuestData({ nama: "", alamat: "", whatsapp: "" });
  };

  return (
    <>
      {/* Floating POS trigger */}
      <div className="fixed right-6 bottom-[104px] z-50 flex flex-col items-end gap-3 safe-bottom">
        <button
          onClick={() => setShowGuestCheckout(true)}
          title="Belanja tanpa perlu login"
          className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        >
          <MdShoppingCart className="h-7 w-7 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Guest Checkout Modal */}
      {showGuestCheckout && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <MdShoppingCart className="text-blue-200" />
                  Belanja Tanpa Login
                </h2>
                <p className="text-blue-100 text-sm mt-1">Isi data untuk melanjutkan ke kasir</p>
              </div>
              <button onClick={closeGuestCheckout} className="text-blue-100 hover:text-white transition-colors">
                <MdClose size={24} />
              </button>
            </div>

            {/* Content */}
            <form onSubmit={(e) => { e.preventDefault(); handleGuestCheckout(); }} className="p-8 space-y-6">
              {guestError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{guestError}</div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={guestData.nama}
                  onChange={(e) => setGuestData({ ...guestData, nama: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                  placeholder="Contoh: Budi Santoso"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={guestData.alamat}
                  onChange={(e) => setGuestData({ ...guestData, alamat: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors resize-none"
                  placeholder="Contoh: Jl. Raya Manado No. 123, Kel. ..., Manado 95119"
                  rows={3}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Nomor WhatsApp <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 font-medium">+62</span>
                  <input
                    type="tel"
                    value={guestData.whatsapp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const clean = value.startsWith("62") ? value.substring(2) : value;
                      setGuestData({ ...guestData, whatsapp: clean });
                    }}
                    className="w-full pl-14 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                    placeholder="811 488 068"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1.5">Contoh: 811488068 (tanpa +62)</p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900">ℹ️ Data Anda akan digunakan untuk transaksi dan pengiriman.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeGuestCheckout}
                  className="px-6 py-2.5 text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all flex items-center gap-2"
                >
                  <MdShoppingCart size={18} />
                  Lanjut ke Kasir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full-screen POS Modal */}
      {showGuestPOS && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-2xl">
            <div className="max-w-full px-4 sm:px-6 lg:px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div className="flex-shrink-0 bg-indigo-700 p-2.5 sm:p-3 rounded-xl border-2 border-indigo-500">
                    <MdPointOfSale className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Point of Sale - Guest Checkout</h1>
                    <p className="text-indigo-100 text-xs sm:text-sm hidden xs:block">Lyvia Nusa Boga • Sistem Penjualan</p>
                  </div>
                </div>
                <button
                  onClick={closePOS}
                  className="flex-shrink-0 ml-3 p-2.5 text-indigo-100 hover:text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-all duration-200 border-2 border-indigo-500"
                  title="Tutup (Esc)"
                >
                  <MdClose className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 sm:px-7 py-6 min-h-0">
              <POSMenu
                isGuest={true}
                layout="full"
                onCartUpdate={(updatedCart) => setCartData(updatedCart)}
                onClose={closePOS}
              />
            </div>
          </div>

          <div className="lg:hidden sticky bottom-0 bg-gradient-to-t from-slate-900 to-slate-900/50 border-t border-white/10 px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Mode Aktif</span>
              </div>
              <div className="text-slate-500 text-xs">
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>

          <div className="hidden lg:block sticky bottom-0 bg-gradient-to-t from-slate-900 to-slate-900/50 border-t border-white/10 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="text-slate-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span>Sistem Aktif • Guest Checkout Mode • 2-Column Layout</span>
              </div>
              <div className="text-slate-500 text-xs">
                {new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
