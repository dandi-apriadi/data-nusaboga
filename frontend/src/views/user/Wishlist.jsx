import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Card from 'components/card';
import { fetchWishlist, removeWishlistItem, clearWishlistServer, setWishlistUser } from 'store/slices/wishlistSlice';
import { MdBookmark, MdSearch, MdClose, MdGridView, MdViewList, MdDelete, MdShoppingCart, MdAutorenew, MdInventory, MdOutlineRemoveShoppingCart } from 'react-icons/md';
import buildProductImageUrl, { fallbackAvatar } from 'utils/image';

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector(s => s.wishlist);
  const authUser = useSelector(s => s.auth.user?.user || s.auth.user);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('grid');
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const uid = authUser?.user_id || authUser?.userId || authUser?.id || null;
    dispatch(setWishlistUser(uid));
    if (uid) dispatch(fetchWishlist());
  }, [dispatch, authUser]);
  // Debug: tampilkan state items di console agar bisa dibandingkan dengan response backend
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Wishlist][component] items state:', items);
      const neg = (items||[]).filter(i => typeof i.stock === 'number' && i.stock < 0);
      if (neg.length) console.warn('[Wishlist] Detected negative stock items (clamped visually to 0):', neg);
    }
  }, [items]);

  const filtered = useMemo(() => (items || []).filter(it => (it.name || '').toLowerCase().includes(query.toLowerCase())), [items, query]);
  const format = n => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

  const toggleSel = id => { const c = new Set(selected); c.has(id) ? c.delete(id) : c.add(id); setSelected(c); };
  const selectAll = () => setSelected(new Set(filtered.map(i => i.id)));
  const clearSel = () => setSelected(new Set());
  const removeOne = id => dispatch(removeWishlistItem(id));
  const removeSelected = () => { [...selected].forEach(id => dispatch(removeWishlistItem(id))); clearSel(); };
  const clearAll = () => { dispatch(clearWishlistServer()); clearSel(); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl text-center">
            <div className="flex items-center justify-center mb-2">
              <MdBookmark className="w-8 h-8 mr-3" />
              <h1 className="text-3xl md:text-4xl font-bold">Wishlist</h1>
            </div>
            <p className="text-indigo-100">Koleksi produk favorit Anda</p>
          </div>
        </div>

        <Card extra="border-0 shadow-xl bg-white/90 backdrop-blur-sm mb-6">
          <div className="p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex-1 max-w-md relative">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari produk..." className="w-full pl-10 pr-10 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm" />
              {query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"><MdClose className="w-5 h-5" /></button>}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button onClick={() => setMode('grid')} className={`p-2 rounded-md ${mode === 'grid' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}><MdGridView className="w-5 h-5" /></button>
                <button onClick={() => setMode('list')} className={`p-2 rounded-md ${mode === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}><MdViewList className="w-5 h-5" /></button>
              </div>
              {filtered.length > 0 && selected.size === 0 && <button onClick={selectAll} className="px-4 py-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 border border-slate-200 text-sm font-medium">Pilih Semua</button>}
              {selected.size > 0 && (
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2">
                  <span className="text-sm text-indigo-600 font-medium">{selected.size} dipilih</span>
                  <button onClick={removeSelected} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 border border-red-200 text-sm font-medium">Hapus</button>
                  <button onClick={clearSel} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200 text-sm font-medium">Batal</button>
                </div>
              )}
              {filtered.length > 0 && items.length > 0 && <button onClick={clearAll} className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 border border-red-200 text-sm font-medium">Kosongkan</button>}
            </div>
          </div>
        </Card>

        <Card extra="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <div className="p-6">
            {loading && <div className="flex items-center justify-center py-16 text-slate-600"><MdAutorenew className="w-6 h-6 mr-3 animate-spin" /> Memuat wishlist...</div>}
            {!loading && filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 mx-auto mb-6"><MdInventory className="h-10 w-10 text-slate-400" /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{items.length === 0 ? 'Wishlist Masih Kosong' : 'Tidak Ada Hasil'}</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">{items.length === 0 ? 'Tambahkan produk dari katalog untuk menyimpannya di sini.' : 'Ubah kata kunci pencarian.'}</p>
              </div>
            )}
            {!loading && filtered.length > 0 && (
              <div className={mode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {filtered.map(item => {
                  const out = (item.stock || 0) === 0;
                  const content = (
                    <>
                      <div className="relative aspect-square bg-slate-100 rounded-2xl overflow-hidden mb-4">
                        <img
                          src={buildProductImageUrl(item.image) || fallbackAvatar(item.name)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.src = fallbackAvatar(item.name); }}
                        />
                        {out && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white font-semibold flex items-center text-sm"><MdOutlineRemoveShoppingCart className="w-4 h-4 mr-2" /> Stok Habis</span></div>}
                        <div className="absolute top-3 left-3 z-10"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSel(item.id)} className="w-5 h-5 text-indigo-600 bg-white border-2 border-slate-300 rounded focus:ring-indigo-500" /></div>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mb-2 line-clamp-2 min-h-[2.2rem]">{item.name}</h3>
                      <div className="mb-3"><span className="text-lg font-bold text-indigo-600">{format(item.price)}</span></div>
                      <div className="flex items-center justify-between text-xs mb-4">
                        <span className={`px-2 py-1 rounded-full font-medium ${out ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{out ? 'Habis' : 'Tersedia'}{!out && item.stock !== undefined ? ` (${item.stock})` : ''}</span>
                        <button onClick={() => removeOne(item.id)} className="p-2 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 transition-colors" title="Hapus"><MdDelete className="w-4 h-4" /></button>
                      </div>
                      <button disabled={out} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-bold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"><MdShoppingCart className="mr-2 h-4 w-4" /> {out ? 'Stok Habis' : 'Tambah ke Keranjang'}</button>
                    </>
                  );
                  return mode === 'grid' ? (
                    <div key={item.id} className="group border rounded-2xl p-4 bg-white hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-indigo-300">{content}</div>
                  ) : (
                    <div key={item.id} className="flex items-center p-4 border rounded-2xl bg-white hover:shadow-md transition-all duration-300 border-slate-200 hover:border-indigo-300">
                      <div className="mr-4"><input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSel(item.id)} className="w-5 h-5 text-indigo-600 bg-white border-2 border-slate-300 rounded focus:ring-indigo-500" /></div>
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden mr-4">
                        <img src={buildProductImageUrl(item.image) || fallbackAvatar(item.name)} alt={item.name} className="w-full h-full object-cover" onError={e => { e.target.src = fallbackAvatar(item.name); }} />
                        {out && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><span className="text-white text-[10px] font-semibold">Habis</span></div>}
                      </div>
                      <div className="flex-1 min-w-0 pr-4">
                        <h3 className="font-semibold text-slate-900 text-sm mb-1 truncate">{item.name}</h3>
                        <div className="text-indigo-600 font-bold text-sm mb-1">{format(item.price)}</div>
                        <div className="text-xs text-slate-500">Stok: {item.stock ?? '-'}</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button disabled={out} className="px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"><MdShoppingCart className="w-4 h-4 mr-1" /> Keranjang</button>
                        <button onClick={() => removeOne(item.id)} className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-200 hover:bg-red-100 flex items-center"><MdDelete className="w-4 h-4 mr-1" /> Hapus</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {error && <div className="mt-6 text-sm text-red-600">{error}</div>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Wishlist;
