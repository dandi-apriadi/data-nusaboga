import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, reset } from '../../store/slices/authSlice';
// Removed Google signup
import { FiMail, FiLock, FiArrowRight, FiUser, FiShoppingBag } from 'react-icons/fi';
import { MdRestaurant, MdShoppingCart, MdStar, MdLocalOffer } from 'react-icons/md';
import Checkbox from 'components/checkbox';
import Swal from 'sweetalert2';

const SignUp = () => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Hapus state agree karena tidak diperlukan lagi

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    document.title = 'Sign Up - Lyvia Nusa Boga Marketplace';
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    return () => dispatch(reset());
  }, [dispatch]);

  // Catatan: penanganan sukses & error sekarang langsung di handleRegister untuk menghindari kondisi balapan state.

  const validate = () => {
    if (!fullname.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      Swal.fire({
        icon: 'warning',
        iconColor: '#f59e0b',
        title: 'Kolom Kosong',
        text: 'Harap lengkapi semua kolom wajib',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-xl border border-orange-100' }
      });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        icon: 'warning',
        iconColor: '#f59e0b',
        title: 'Email Tidak Valid',
        text: 'Masukkan email yang valid',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-xl border border-orange-100' }
      });
      return false;
    }
    if (password.length < 6) {
      Swal.fire({
        icon: 'warning',
        iconColor: '#f59e0b',
        title: 'Password Terlalu Pendek',
        text: 'Minimal 6 karakter',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-xl border border-orange-100' }
      });
      return false;
    }
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'warning',
        iconColor: '#f59e0b',
        title: 'Konfirmasi Password Salah',
        text: 'Password dan konfirmasi tidak sama',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-xl border border-orange-100' }
      });
      return false;
    }
    // Validasi persetujuan syarat & kebijakan dihapus
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const result = await dispatch(
        registerUser({ fullname: fullname.trim(), email: email.trim(), password: password.trim() })
      ).unwrap();


      // Jika backend mengembalikan referral code, tampilkan di notifikasi
      let successText = 'Akun Anda telah dibuat. Silakan masuk.';
      if (result && result.referral && result.referral.code) {
        successText += `\n\nKode Referral Anda: ${result.referral.code} (Diskon 10% - 1x pakai)`;
      }
      Swal.fire({
        icon: 'success',
        iconColor: '#16a34a',
        title: 'Pendaftaran Berhasil',
        text: successText,
        timer: 4000,
        showConfirmButton: false,
        customClass: { popup: 'rounded-xl border border-green-100' }
      });

      // Reset form dan arahkan ke login
      setFullname('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
  // setAgree(false); // Sudah tidak ada state agree
      dispatch(reset());
      navigate('/auth/sign-in');
    } catch (err) {
      // err dari unwrap biasanya pesan string (rejectWithValue)
      const errorMessage = typeof err === 'string' ? err : err?.message || 'Terjadi kesalahan pada proses pendaftaran';
      Swal.fire({
        icon: 'error',
        iconColor: '#dc2626',
        title: 'Gagal Mendaftar',
        text: errorMessage,
        confirmButtonColor: '#ea580c',
        customClass: { popup: 'rounded-xl border border-red-100' }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-orange-900/40 backdrop-blur-sm z-50">
        <div className="bg-white/90 rounded-2xl p-8 flex flex-col items-center shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600 mb-4" />
          <p className="text-orange-800 font-medium">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-50 relative overflow-hidden pt-24 md:pt-28">
      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translateY(0px) rotate(0deg); } 33% { transform: translateY(-20px) rotate(2deg); } 66% { transform: translateY(-10px) rotate(-1deg); } }
        .animate-float { animation: float 8s ease-in-out infinite; }
        @keyframes wave { 0%, 100% { transform: translateX(0px) translateY(0px); } 25% { transform: translateX(20px) translateY(-10px); } 50% { transform: translateX(-15px) translateY(-20px); } 75% { transform: translateX(10px) translateY(-5px); } }
        .animate-wave { animation: wave 12s ease-in-out infinite; }
        @keyframes bounce-soft { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-5px) scale(1.02); } }
        .animate-bounce-soft { animation: bounce-soft 6s ease-in-out infinite; }
        @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(251, 146, 60, 0.3); } 50% { box-shadow: 0 0 40px rgba(251, 146, 60, 0.6), 0 0 60px rgba(251, 146, 60, 0.3); } }
        .animate-glow { animation: glow 4s ease-in-out infinite; }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hidden sm:block absolute top-20 left-10 text-orange-200/30 animate-float"><MdRestaurant className="h-16 w-16" /></div>
        <div className="hidden md:block absolute top-40 right-20 text-amber-200/40 animate-wave"><MdShoppingCart className="h-12 w-12" /></div>
        <div className="hidden sm:block absolute bottom-32 left-20 text-red-200/30 animate-bounce-soft"><MdStar className="h-20 w-20" /></div>
        <div className="hidden md:block absolute bottom-20 right-10 text-orange-300/25 animate-float"><MdLocalOffer className="h-14 w-14" /></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-300/20 to-amber-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-r from-red-300/15 to-orange-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start mb-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur animate-glow" />
                  <div className="relative bg-gradient-to-r from-orange-500 to-red-600 p-4 rounded-2xl">
                    <MdRestaurant className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 bg-clip-text text-transparent">Lyvia Nusa Boga</h1>
                  <p className="text-orange-600 font-medium text-xs sm:text-sm md:text-base">Spesialis Cakalang Asli</p>
                </div>
              </div>
              <div className="space-y-6 mb-8">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">Buat Akun Baru
                  <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Dan Mulai Belanja</span>
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-md mx-auto lg:mx-0">Gabung dan nikmati kemudahan memesan produk olahan ikan cakalang premium.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center"><MdRestaurant className="h-5 w-5 text-white" /></div><div><h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Abon Premium</h3><p className="text-[10px] sm:text-xs text-gray-600">Resep turun temurun</p></div></div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center"><MdStar className="h-5 w-5 text-white" /></div><div><h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Kualitas Terjamin</h3><p className="text-[10px] sm:text-xs text-gray-600">100% ikan segar</p></div></div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center"><MdShoppingCart className="h-5 w-5 text-white" /></div><div><h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Mudah Dipesan</h3><p className="text-[10px] sm:text-xs text-gray-600">Online & offline</p></div></div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-orange-200/50 hover:bg-white/80 transition-all duration-300">
                  <div className="flex items-center space-x-3"><div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg flex items-center justify-center"><MdLocalOffer className="h-5 w-5 text-white" /></div><div><h3 className="font-semibold text-gray-800 text-xs sm:text-sm">Harga Bersahabat</h3><p className="text-[10px] sm:text-xs text-gray-600">Langsung dari petani</p></div></div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 lg:p-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl mb-4 animate-bounce-soft"><FiShoppingBag className="h-8 w-8 text-white" /></div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">Buat Akun Baru</h2>
                  <p className="text-sm sm:text-base text-gray-600">Daftar untuk mulai berbelanja produk cakalang premium</p>
                </div>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="fullname" className="block text-xs sm:text-sm font-semibold text-gray-700">Nama Lengkap</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiUser className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500" /></div>
                      <input id="fullname" name="fullname" type="text" required value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Nama lengkap" className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm md:text-base" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700">Alamat Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiMail className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500" /></div>
                      <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contoh@email.com" className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm md:text-base" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700">Kata Sandi</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500" /></div>
                      <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimal 6 karakter" className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm md:text-base" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-semibold text-gray-700">Konfirmasi Kata Sandi</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FiLock className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500" /></div>
                      <input id="confirmPassword" name="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ulangi kata sandi" className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-gray-50/50 border-2 border-gray-200 rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 hover:border-gray-300 text-xs sm:text-sm md:text-base" />
                    </div>
                  </div>
                  {/* Persetujuan syarat & kebijakan dihapus */}
                  <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center items-center py-3 sm:py-4 px-6 border border-transparent text-sm sm:text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4">{isLoading ? (<div className="animate-spin h-5 w-5 border-2 border-white rounded-full border-t-transparent" />) : (<FiArrowRight className="h-5 w-5 text-white/80 group-hover:text-white transition-colors duration-200" />)}</span>
                    <span className="ml-2 text-xs sm:text-sm md:text-base">{isLoading ? 'Memproses...' : 'Daftar Sekarang'}</span>
                  </button>
                  {/* Google signup removed */}
                  <div className="text-center pt-6 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-600">Sudah punya akun? <Link to="/auth/sign-in" className="font-semibold text-orange-600 hover:text-orange-700 transition-colors hover:underline">Masuk Sekarang</Link></p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;