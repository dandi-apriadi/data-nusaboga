import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiX, FiMenu, FiHome, FiInfo, FiMail, FiLogIn, FiShoppingBag, FiPackage } from 'react-icons/fi';
import { useSelector, useDispatch } from "react-redux";
import { getMe, logoutUser, reset } from "../../store/slices/authSlice";
import "./style.css";
import logo from "../../assets/img/homepage/logo.png";

const Navbar = ({ forceTransparent = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  
  // Check if we're on products, contact, about, tracking, or blog page
  const isProductsPage = location.pathname === '/auth/products';
  const isContactPage = location.pathname === '/auth/contact';
  const isAboutPage = location.pathname === '/auth/about';
  const isTrackingPage = location.pathname === '/auth/order-tracking' || location.pathname.startsWith('/auth/order-tracking/');
  // Blog feature removed from navigation
  
  // Remove isLinkActive function - no active state needed

  const toggleMobileMenu = (e) => {
    e?.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        await dispatch(getMe()).unwrap();
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    };

    fetchUser();
  }, [dispatch]);

  useEffect(() => {
  document.title = "Lyvia Nusa Boga Marketplace";
  }, [user]);
  
  // Add navbar scroll effect
  const [scrolled, setScrolled] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);
  
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      dispatch(reset());
      setIsProfileOpen(false);
      navigate('/auth/sign-in');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  useEffect(() => {
    const closeDropdowns = (e) => {
      if (!e.target.closest('.profile-menu')) {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('click', closeDropdowns);
    return () => document.removeEventListener('click', closeDropdowns);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        !e.target.closest('.menu-button')) {
        setIsMobileMenuOpen(false);
        document.body.style.overflow = '';
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if we're on the login page for small screens - removed location dependency
  
  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 bg-gradient-to-r from-amber-500 via-yellow-400 to-green-600 shadow-lg border-b border-green-700 ${
        (scrolled && !forceTransparent) || isProductsPage || isContactPage || isAboutPage || isTrackingPage
          ? 'py-2' 
          : 'py-3'
      }`}
      aria-label="Main navigation">
  <div className={`max-w-7xl mx-auto px-6 ${(scrolled && !forceTransparent) || isProductsPage || isContactPage || isAboutPage || isTrackingPage ? 'py-1' : 'py-2'} transition-all duration-300`}>
          <div className="flex justify-between items-center">
            {/* Brand */}
            <div className="flex items-center">
              <Link to="/auth/homepage" className="flex items-center group">
                <div className="relative mr-3">
                  <div className={`absolute inset-0 ${(scrolled && !forceTransparent) || isProductsPage || isContactPage || isAboutPage ? 'bg-yellow-400/30' : 'bg-amber-500/30'} rounded-full scale-125 group-hover:scale-150 transition-all duration-300 opacity-60`}></div>
                  <img
                    src={logo}
                    alt="Logo"
                    className="h-11 w-auto rounded-full relative z-10 transition-transform group-hover:scale-105 duration-300"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="relative">
                    <span className={`text-xl font-bold bg-gradient-to-r from-amber-500 via-yellow-400 to-green-600 text-transparent bg-clip-text`}>
                      Lyvia Nusa Boga
                    </span>
                    <div className={`absolute -bottom-1 left-0 w-0 h-0.5 ${
                      (scrolled && !forceTransparent) || isProductsPage || isContactPage || isAboutPage ? 'bg-blue-500' : 'bg-white'
                    } group-hover:w-full transition-all duration-300`}></div>
                  </div>
                  <span className="text-xs tracking-wide uppercase text-green-600 font-semibold">
                    Marketplace UMKM
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/auth/homepage" 
                className="relative group text-white font-medium transition-colors duration-200 hover:text-green-600"
              >
                <span>Beranda</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                to="/auth/products" 
                className="relative group text-white font-medium transition-colors duration-200 hover:text-green-600"
              >
                <span>Produk</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                to="/auth/order-tracking" 
                className="relative group text-white font-medium transition-colors duration-200 hover:text-green-600"
              >
                <span>Lacak Pesanan</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                to="/auth/about" 
                className="relative group text-white font-medium transition-colors duration-200 hover:text-green-600"
              >
                <span>Tentang</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
              <Link 
                to="/auth/contact" 
                className="relative group text-white font-medium transition-colors duration-200 hover:text-green-600"
              >
                <span>Kontak</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300"></div>
              </Link>
            </div>

            {/* Right side items - Auth Button */}
            <div className="flex items-center">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                  className="group relative overflow-hidden bg-green-600 text-white font-bold px-6 py-2.5 rounded-xl
                              hover:bg-amber-500 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5
                              shadow-lg flex items-center justify-center border border-green-700/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 mr-2">Dashboard</span>
                  <FiHome className="relative z-10 w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              ) : (
                <Link 
                  to="/auth/sign-in"
                  className="group relative overflow-hidden bg-yellow-400 text-green-700 font-bold px-6 py-2.5 rounded-xl
                              hover:bg-amber-500 hover:text-white transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5
                              shadow-lg flex items-center justify-center border border-yellow-400/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 mr-2">Masuk</span>
                  <FiLogIn className="relative z-10 w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 ml-3 rounded-md focus:outline-none text-white hover:text-green-600 transition-colors"
              >
                {isMobileMenuOpen ?
                  <FiX className="w-6 h-6" /> :
                  <FiMenu className="w-6 h-6" />
                }
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        ref={mobileMenuRef}
        className={`md:hidden fixed inset-0 z-40 transform transition-all ease-in-out duration-500 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        aria-hidden={!isMobileMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-heading"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/90 via-amber-500/90 to-green-600/90" onClick={handleMobileMenuClose}></div>
        <div className="relative h-screen bg-gradient-to-b from-yellow-400 via-amber-500 to-green-600 pt-24 px-8 shadow-xl max-w-sm mx-auto rounded-b-3xl border-x border-b border-green-700">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-amber-500 via-yellow-400 to-green-600 flex items-center justify-center border-b border-green-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-600/30 flex items-center justify-center mr-3">
                <div className="w-6 h-6 rounded-full bg-yellow-400/30 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                </div>
              </div>
              <span className="text-xl font-bold text-white" id="mobile-menu-heading">Menu Navigasi</span>
            </div>
          </div>

          <div className="flex flex-col space-y-5 mt-8">
            <Link
              to="/auth/homepage"
              onClick={handleMobileMenuClose}
              className="flex items-center py-3 px-4 hover:bg-green-600/20 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 mr-4 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow group-hover:bg-yellow-400/20 transition-all">
                <FiHome className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-white font-medium group-hover:text-green-600">Beranda</span>
            </Link>
            <Link
              to="/auth/products"
              onClick={handleMobileMenuClose}
              className="flex items-center py-3 px-4 hover:bg-green-600/20 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 mr-4 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow group-hover:bg-yellow-400/20 transition-all">
                <FiShoppingBag className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-white font-medium group-hover:text-green-600">Produk</span>
            </Link>
            <Link
              to="/auth/order-tracking"
              onClick={handleMobileMenuClose}
              className="flex items-center py-3 px-4 hover:bg-green-600/20 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 mr-4 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow group-hover:bg-yellow-400/20 transition-all">
                <FiPackage className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-white font-medium group-hover:text-green-600">Lacak Pesanan</span>
            </Link>
            <Link
              to="/auth/about"
              onClick={handleMobileMenuClose}
              className="flex items-center py-3 px-4 hover:bg-green-600/20 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 mr-4 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow group-hover:bg-yellow-400/20 transition-all">
                <FiInfo className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-white font-medium group-hover:text-green-600">Tentang</span>
            </Link>
            <Link
              to="/auth/contact"
              onClick={handleMobileMenuClose}
              className="flex items-center py-3 px-4 hover:bg-green-600/20 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 mr-4 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:shadow group-hover:bg-yellow-400/20 transition-all">
                <FiMail className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-white font-medium group-hover:text-green-600">Kontak</span>
            </Link>
            <div className="mt-4 pt-4 border-t border-green-700">
              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                  onClick={handleMobileMenuClose}
                  className="bg-green-600 text-white hover:bg-amber-500 py-3 px-4 rounded-xl font-medium transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <FiHome className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  to="/auth/sign-in"
                  onClick={handleMobileMenuClose}
                  className="bg-yellow-400 text-green-700 hover:bg-amber-500 hover:text-white py-3 px-4 rounded-xl font-medium transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <FiLogIn className="w-5 h-5" />
                  <span>Masuk ke Sistem</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom mobile navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-gradient-to-r from-amber-500 via-yellow-400 to-green-600 border-t border-green-700 shadow-lg">
        <div className="grid grid-cols-6 h-14">
          <Link
            to="/auth/homepage"
            className="flex flex-col items-center justify-center text-white hover:text-green-600 active:text-yellow-400 transition-colors group"
          >
            <div className="relative p-1 sm:p-2">
              <div className="absolute inset-0 rounded-full bg-green-600/20 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
              <FiHome className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
            </div>
            <span className="text-xs mt-0.5 font-medium">Home</span>
          </Link>
          <Link
            to="/auth/products"
            className="flex flex-col items-center justify-center text-white hover:text-green-600 active:text-yellow-400 transition-colors group"
          >
            <div className="relative p-1 sm:p-2">
              <div className="absolute inset-0 rounded-full bg-green-600/20 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
              <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
            </div>
            <span className="text-xs mt-0.5 font-medium">Produk</span>
          </Link>
          <Link
            to="/auth/order-tracking"
            className="flex flex-col items-center justify-center text-white hover:text-green-600 active:text-yellow-400 transition-colors group"
          >
            <div className="relative p-1 sm:p-2">
              <div className="absolute inset-0 rounded-full bg-green-600/20 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
              <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
            </div>
            <span className="text-xs mt-0.5 font-medium">Lacak</span>
          </Link>
          <Link
            to="/auth/about"
            className="flex flex-col items-center justify-center text-white hover:text-green-600 active:text-yellow-400 transition-colors group"
          >
            <div className="relative p-1 sm:p-2">
              <div className="absolute inset-0 rounded-full bg-green-600/20 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
              <FiInfo className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
            </div>
            <span className="text-xs mt-0.5 font-medium">Info</span>
          </Link>
          <Link
            to="/auth/contact"
            className="flex flex-col items-center justify-center text-white hover:text-green-600 active:text-yellow-400 transition-colors group"
          >
            <div className="relative p-1 sm:p-2">
              <div className="absolute inset-0 rounded-full bg-green-600/20 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
              <FiMail className="w-4 h-4 sm:w-5 sm:h-5 relative z-10" />
            </div>
            <span className="text-xs mt-0.5 font-medium">Kontak</span>
          </Link>
          {user ? (
            <Link
              to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
              className="flex flex-col items-center justify-center text-white hover:text-green-600 active:text-yellow-400 transition-colors group"
            >
              <div className="relative p-2">
                <div className="absolute inset-0 rounded-full bg-yellow-400/30 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                <FiHome className="w-5 h-5 relative z-10" />
              </div>
              <span className="text-xs mt-0.5 font-medium">Dashboard</span>
            </Link>
          ) : (
            <Link
              to="/auth/sign-in"
              className="flex flex-col items-center justify-center text-white hover:text-green-600 active:text-yellow-400 transition-colors group"
            >
              <div className="relative p-2">
                <div className="absolute inset-0 rounded-full bg-yellow-400/30 scale-0 group-hover:scale-100 transition-transform duration-200"></div>
                <FiLogIn className="w-5 h-5 relative z-10" />
              </div>
              <span className="text-xs mt-0.5 font-medium">Masuk</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;