import React, { useEffect, useState } from "react";
import { MdAdd, MdEdit, MdDelete } from "react-icons/md";
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux";
import { fetchBanners, deleteBanner, createBanner, updateBanner } from "../../store/slices/bannerSlice";
import BannerFormModal from "../../components/admin/BannerFormModal";
import ResponsiveTable from 'components/ResponsiveTable';
import buildImageUrl, { placeholderImage } from 'utils/image';


export default function BannerManagement() {
  const dispatch = useDispatch();
  const { banners, loading, error } = useSelector(state => state.banners);
  // Fungsi untuk tukar posisi banner
  const [localBanners, setLocalBanners] = useState([]);

  useEffect(() => {
    setLocalBanners(banners);
  }, [banners]);

  const handleMove = async (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= localBanners.length) return;
    const newBanners = [...localBanners];
    const [moved] = newBanners.splice(fromIdx, 1);
    newBanners.splice(toIdx, 0, moved);
    setLocalBanners(newBanners);
    // Kirim urutan baru ke backend
    try {
      const order = newBanners.map(b => b.id);
      const res = await fetch('/api/v1/banners/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order })
      });
      const data = await res.json();
      console.log('[BannerManagement] PATCH /banners/reorder response:', data);
    } catch (err) {
      console.error('[BannerManagement] PATCH /banners/reorder error:', err);
    }
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  const handleAdd = () => {
    setEditData(null);
    setModalOpen(true);
  };
  const handleEdit = (banner) => {
    setEditData(banner);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setEditData(null);
  };
  const handleModalSubmit = (form) => {
    if (editData && editData.id) {
      dispatch(updateBanner({ id: editData.id, ...form }));
    } else {
      dispatch(createBanner(form));
    }
    setModalOpen(false);
    setEditData(null);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setShowDelete(true);
  };
  const confirmDelete = () => {
    if (deleteId) dispatch(deleteBanner(deleteId));
    setShowDelete(false);
    setDeleteId(null);
  };
  const cancelDelete = () => {
    setShowDelete(false);
    setDeleteId(null);
  };

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-indigo-700">Manajemen Banner</h1>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-md px-4 py-2 font-medium flex items-center gap-2 focus:ring disabled:opacity-60" onClick={handleAdd}>
            <MdAdd /> Tambah Banner
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <ResponsiveTable>
            <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Judul</th>
                <th className="px-4 py-2 text-left">Gambar</th>
                <th className="px-4 py-2 text-left">Deskripsi</th>
                {/* <th className="px-4 py-2 text-left">Link</th> */}
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Posisi</th>
                <th className="px-4 py-2 text-left">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-red-600">{error.message || error}</td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">Belum ada banner</td>
                </tr>
              ) : (
                localBanners.map((banner, idx) => (
                  <tr key={banner.id} className="even:bg-slate-50 hover:bg-slate-100">
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2 font-medium">{(banner.description || '').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)[0] || ((banner.description||'').split(/[.!?]+/).map(s=>s.trim()).filter(Boolean)[0]) || '-'}</td>
                    <td className="px-4 py-2">
                      <img src={buildImageUrl(banner.image_url)} alt={(banner.description || '').split(/\r?\n/).map(s=>s.trim()).filter(Boolean)[0] || ((banner.description||'').split(/[.!?]+/).map(s=>s.trim()).filter(Boolean)[0]) || ''} className="h-12 rounded-md border" onError={(e)=>{ e.currentTarget.src = placeholderImage(); }} />
                    </td>
                    <td className="px-4 py-2 max-w-xs whitespace-pre-line text-slate-700">
                      {banner.description ? banner.description : <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${banner.is_active ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {banner.is_active ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          className="p-1 rounded bg-slate-100 hover:bg-indigo-100 text-indigo-600 disabled:opacity-40"
                          title="Naik"
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, idx - 1)}
                        >
                          <ArrowUp size={18} />
                        </button>
                        <button
                          className="p-1 rounded bg-slate-100 hover:bg-indigo-100 text-indigo-600 disabled:opacity-40"
                          title="Turun"
                          disabled={idx === localBanners.length - 1}
                          onClick={() => handleMove(idx, idx + 1)}
                        >
                          <ArrowDown size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button className="bg-amber-500 hover:bg-amber-600 text-white rounded px-2 py-1" title="Edit" onClick={() => handleEdit(banner)}>
                        <MdEdit />
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white rounded px-2 py-1" title="Hapus" onClick={() => handleDelete(banner.id)}>
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            </table>
          </ResponsiveTable>
        </div>
      </div>
      <BannerFormModal open={modalOpen} onClose={handleModalClose} onSubmit={handleModalSubmit} initialData={editData} />
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm shadow-lg relative">
            <div className="mb-4 text-lg font-semibold text-red-700">Konfirmasi Hapus</div>
            <div className="mb-6 text-slate-700">Yakin ingin menghapus banner ini?</div>
            <div className="flex justify-end gap-2">
              <button onClick={cancelDelete} className="px-4 py-2 rounded bg-slate-200 text-slate-700">Batal</button>
              <button onClick={confirmDelete} className="px-4 py-2 rounded bg-red-600 text-white font-medium hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
