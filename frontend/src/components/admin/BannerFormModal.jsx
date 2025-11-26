import React, { useState, useRef } from "react";


export default function BannerFormModal({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    is_active: initialData?.is_active ?? true,
    order: initialData?.order || 0,
    image: null,
    imagePreview: initialData?.image_url || null,
  });
  const [error, setError] = useState("");
  const fileInputRef = useRef();

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({ ...f, image: file, imagePreview: URL.createObjectURL(file) }));
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError("");
    // Debug: cek apakah form.image benar-benar File
    console.log('BannerFormModal handleSubmit form:', form);
    if (!initialData && !form.image) {
      setError("Gambar banner wajib dipilih.");
      return;
    }
    if (form.image && !(form.image instanceof File)) {
      setError("File gambar tidak valid.");
      return;
    }
    // Prepare submit payload; do not send `title` (column removed server-side)
    const submitForm = { ...form };
    delete submitForm.link_url;
    // Remove title to avoid sending unknown/removed field to backend
    delete submitForm.title;

    onSubmit(submitForm);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
      <div className="bg-white/90 border border-slate-200 shadow-2xl rounded-2xl w-full max-w-lg p-0 relative animate-fadeInUp">
        <button
          className="absolute top-3 right-3 text-slate-400 hover:text-red-600 text-2xl focus:outline-none focus:ring"
          onClick={onClose}
          aria-label="Tutup modal"
        >
          &times;
        </button>
        <div className="px-8 pt-8 pb-2">
          <h2 className="text-2xl font-bold text-indigo-700 mb-2 flex items-center gap-2">
            {initialData ? <span className="inline-block w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span> : <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>}
            {initialData ? "Edit Banner" : "Tambah Banner"}
          </h2>
          <p className="text-slate-500 text-sm mb-4">Isi detail banner promosi yang akan tampil di homepage.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title field removed (server no longer stores title). */}
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Deskripsi</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" placeholder="Deskripsi banner (opsional)" />
            </div>
            {/* <div>
              <label className="block text-slate-600 mb-1 font-medium">Urutan</label>
              <input type="number" name="order" value={form.order} onChange={handleChange} className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition" />
            </div> */}
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} id="is_active" className="accent-indigo-600 w-4 h-4" />
              <label htmlFor="is_active" className="text-slate-600 font-medium">Aktif</label>
            </div>
            <div>
              <label className="block text-slate-600 mb-1 font-medium">Gambar Banner <span className="text-red-500">*</span></label>
              <input type="file" name="image" accept="image/*" ref={fileInputRef} onChange={handleFile} className="block file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition" />
              {form.imagePreview && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={form.imagePreview} alt="Preview" className="h-24 w-32 object-cover rounded-lg border border-slate-200 shadow" />
                  <span className="text-xs text-slate-400">Preview</span>
                </div>
              )}
              {error && <div className="text-red-600 text-xs mt-2">{error}</div>}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200 hover:bg-slate-200 focus:ring-2 focus:ring-indigo-400 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-400 transition"
              >
                {initialData ? "Simpan" : "Tambah"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <style>{`
        .animate-fadeInUp {
          animation: fadeInUp .35s cubic-bezier(.39,.575,.565,1) both;
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}
