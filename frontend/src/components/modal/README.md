# Dokumentasi Modal Components

Folder ini berisi koleksi lengkap komponen modal yang telah dibuat untuk aplikasi Nusaboga. Semua modal telah didesain dengan UI yang konsisten dan responsif.

## Modal Components yang Tersedia:

### 1. ProductDetailModal.jsx
**Fungsi:** Modal detail produk yang komprehensif
**Fitur:**
- Gallery gambar produk dengan zoom
- Detail produk lengkap (deskripsi, spesifikasi, nutrisi)
- Tab navigasi (Deskripsi, Detail, Ulasan)
- Sistem rating dan ulasan pelanggan
- Kontrol quantity dan add to cart
- Trust indicators (gratis ongkir, pembayaran aman, dll)

### 2. OrderDetailModal.jsx
**Fungsi:** Modal detail pesanan dengan tracking
**Fitur:**
- Tab navigasi (Detail, Tracking, Pembayaran)
- Timeline status pesanan
- Informasi pengiriman lengkap
- Detail pembayaran dan invoice
- Tracking nomor resi
- Cancel order functionality
- Reorder functionality
- Print invoice

### 3. AddressModal.jsx
**Fungsi:** Modal untuk menambah/edit alamat pengiriman
**Fitur:**
- Form alamat lengkap dengan validasi
- Preset label alamat (Rumah, Kantor, dll)
- Dropdown provinsi dan kota terintegrasi
- Geolocation untuk deteksi lokasi
- Set alamat default
- Validasi format nomor telepon dan kode pos

### 4. ProfileSettingsModal.jsx
**Fungsi:** Modal pengaturan profil pengguna
**Fitur:**
- Tab navigasi (Profil, Keamanan, Notifikasi, Preferensi)
- Edit profil dengan foto avatar
- Change password dengan validasi
- Pengaturan notifikasi granular
- Preferensi bahasa dan tema
- Toggle berbagai pengaturan

### 5. NotificationDetailModal.jsx
**Fungsi:** Modal pusat notifikasi
**Fitur:**
- Filter notifikasi berdasarkan kategori
- Bulk actions (mark as read, delete)
- Priority badges (high, medium, low)
- Detail notifikasi dengan metadata
- Action buttons sesuai tipe notifikasi
- Select all/none functionality

## Cara Penggunaan:

```jsx
// Import modal yang dibutuhkan
import { ProductDetailModal, OrderDetailModal, AddressModal } from 'components/modal';

// Gunakan dalam component
const MyComponent = () => {
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  return (
    <div>
      {/* Trigger button */}
      <button onClick={() => setShowProductModal(true)}>
        Lihat Detail Produk
      </button>

      {/* Modal */}
      <ProductDetailModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isInWishlist={wishlist.includes(selectedProduct?.id)}
      />
    </div>
  );
};
```

## Styling dan Konsistensi:

Semua modal menggunakan:
- Tailwind CSS untuk styling
- Konsisten gradient header (indigo-purple)
- Responsive design
- Shadow dan backdrop blur effects
- Smooth transitions dan animations
- Consistent color palette
- Proper accessibility features

## Dependencies:

- React Icons (md icons)
- Tailwind CSS
- React hooks (useState, useEffect)

## Best Practices:

1. **State Management:** Setiap modal memiliki local state untuk form handling
2. **Validation:** Built-in form validation dengan error handling
3. **Accessibility:** Keyboard navigation dan screen reader support
4. **Performance:** Lazy loading dan conditional rendering
5. **Responsive:** Mobile-first design approach

## Customization:

Modal dapat dengan mudah dikustomisasi dengan:
- Mengubah color scheme di Tailwind config
- Menambah props untuk additional functionality
- Extending modal base class untuk consistent behavior
- Adding new tabs atau sections sesuai kebutuhan

Semua modal telah tested dan siap untuk production use.