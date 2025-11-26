import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MdRestaurant,
  MdLocalShipping,
  MdVerified,
  MdArrowForward,
  MdSupport,
  MdCheckCircle,
  MdTrendingUp
} from 'react-icons/md';

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [submittingNewsletter, setSubmittingNewsletter] = useState(false);
  const [newsletterMsg, setNewsletterMsg] = useState(null);

  const submitNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubmittingNewsletter(true);
    setNewsletterMsg(null);
    try {
      // You should replace this with your actual API call
      // await apiPost('/api/engagement/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterMsg('Berhasil berlangganan');
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterMsg('Gagal berlangganan');
    } finally {
      setSubmittingNewsletter(false);
    }
  };

  return (
    <footer className="bg-[#17221f] text-white py-20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center mr-4">
                <MdRestaurant className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Lyvia Nusa Boga
              </h3>
            </div>
            <p className="text-white/90 mb-6 leading-7 md:leading-8 text-lg">
              Spesialis produk olahan ikan cakalang berkualitas premium sejak 2020. Menghadirkan <span className="text-amber-400 font-semibold">abon, dendeng, fufu, dan sambal rica</span> dengan cita rasa autentik langsung ke rumah Anda.
            </p>
            {/* Social Media */}
            <div className="flex space-x-4 mb-6">
              <div className="group w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-700 transition-all duration-300 cursor-pointer transform hover:scale-110">
                <span className="text-sm font-bold group-hover:text-white">FB</span>
              </div>
              <div className="group w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-600 hover:to-rose-600 transition-all duration-300 cursor-pointer transform hover:scale-110">
                <span className="text-sm font-bold group-hover:text-white">IG</span>
              </div>
              <div className="group w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-green-600 hover:to-emerald-600 transition-all duration-300 cursor-pointer transform hover:scale-110">
                <span className="text-sm font-bold group-hover:text-white">WA</span>
              </div>
              <div className="group w-12 h-12 bg-gray-700 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-red-600 hover:to-red-700 transition-all duration-300 cursor-pointer transform hover:scale-110">
                <span className="text-sm font-bold group-hover:text-white">YT</span>
              </div>
            </div>
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center text-white/90">
                <MdLocalShipping className="h-5 w-5 text-amber-300 mr-3" />
                <span>Pengiriman ke seluruh Indonesia</span>
              </div>
              <div className="flex items-center text-white/90">
                <MdVerified className="h-5 w-5 text-amber-300 mr-3" />
                <span>Produk halal & terjamin kualitas</span>
              </div>
            </div>
          </div>
          {/* Products */}
          <div>
            <h4 className="font-bold text-xl mb-6 text-amber-400">Produk Cakalang</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/products/abon-cakalang" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Abon Cakalang
                </Link>
              </li>
              <li>
                <Link to="/products/dendeng-cakalang" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Dendeng Cakalang
                </Link>
              </li>
              <li>
                <Link to="/products/cakalang-fufu" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Cakalang Fufu
                </Link>
              </li>
              <li>
                <Link to="/products/sambal-rica" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Sambal Rica
                </Link>
              </li>
              <li>
                <Link to="/products/keripik-cakalang" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdArrowForward className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                  Keripik Cakalang
                </Link>
              </li>
            </ul>
          </div>
          {/* Support */}
          <div>
            <h4 className="font-bold text-xl mb-6 text-amber-400">Bantuan & Layanan</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <Link to="/help" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdSupport className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                  Pusat Bantuan
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdLocalShipping className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                  Info Pengiriman
                </Link>
              </li>
              <li>
                <Link to="/returns" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdCheckCircle className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                  Kebijakan Return
                </Link>
              </li>
              <li>
                <Link to="/contact" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdRestaurant className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                  Hubungi Kami
                </Link>
              </li>
              <li>
                <Link to="/wholesale" className="flex items-center hover:text-amber-400 transition-colors group">
                  <MdTrendingUp className="h-4 w-4 mr-2 text-gray-400 group-hover:text-amber-400" />
                  Pembelian Grosir
                </Link>
              </li>
            </ul>
          </div>
        </div>
        {/* Newsletter Section */}
          <div className="border-t border-gray-700/40 pt-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h4 className="text-xl font-bold mb-2 text-amber-300">Dapatkan Update Terbaru</h4>
              <p className="text-white/80">Subscribe untuk mendapatkan info produk baru dan promo menarik!</p>
            </div>
            <div className="flex gap-3">
              <form onSubmit={submitNewsletter} className="flex gap-3 w-full">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="flex-1 px-4 py-3 bg-white/5 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-300/20"
                  required
                />
                <button disabled={submittingNewsletter} className="px-6 py-3 bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl hover:bg-amber-300 transition-all duration-300 transform hover:scale-105">
                  {submittingNewsletter ? 'Mengirim...' : 'Subscribe'}
                </button>
              </form>
            </div>
            {newsletterMsg && (
              <div className="md:col-span-2 text-sm text-amber-300 mt-2">{newsletterMsg}</div>
            )}
          </div>
        </div>
        {/* Bottom Section */}
        <div className="border-t border-gray-700/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:gap-6">
            <p className="text-white/70 text-sm mb-2 md:mb-0">
              © 2025 <span className="text-amber-300 font-semibold">Lyvia Nusa Boga</span> Marketplace. All rights reserved.
            </p>
            <p className="text-white/60 text-xs">Kerjasama dengan <span className="font-semibold text-white">BIMA X — Politeknik Negeri Manado</span></p>
          </div>
          <div className="flex flex-wrap gap-6 items-center">
            <Link to="/privacy" className="text-white/70 hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 text-sm transition-colors">
              Kebijakan Privasi
            </Link>
            <Link to="/terms" className="text-white/70 hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 text-sm transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link to="/about" className="text-white/70 hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 text-sm transition-colors">
              Tentang Kami
            </Link>
            <Link to="/sitemap" className="text-white/70 hover:text-amber-300 hover:underline hover:decoration-amber-300 hover:underline-offset-2 text-sm transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
