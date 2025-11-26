import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { FiAlignJustify } from "react-icons/fi";
import { BsArrowBarUp, BsCalculator } from "react-icons/bs";
import { RiDashboardLine, RiLogoutBoxRLine } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaFileInvoiceDollar, FaWarehouse } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import Dropdown from "components/dropdown";
import { useLogout } from "hooks/useLogout";

const Navbar = ({ onOpenSidenav, brandText: initialBrandText }) => {
  const [brandText, setBrandText] = useState(initialBrandText);
  const { microPage, user } = useSelector((state) => state.auth);
  const { logout, isLoading } = useLogout();

  // Update brandText when microPage changes
  useEffect(() => {
    setBrandText(microPage !== "unset" ? microPage : initialBrandText);
  }, [microPage, initialBrandText]);

  // Handle logout using custom hook
  const handleLogout = () => {
    logout();
  };

  return (
        <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-2xl bg-gradient-to-r from-white/80 via-white/70 to-white/60 dark:from-navy-900/80 dark:via-navy-800/70 dark:to-navy-700/60 p-4 backdrop-blur-xl lg:flex-nowrap w-full border border-white/30 dark:border-white/10 shadow-2xl shadow-indigo-500/10 dark:shadow-black/20 transition-all duration-300 hover:shadow-indigo-500/20">
      {/* Enhanced Left Side - Branding & Page Title */}
      <div className="ml-2">
        <div className="flex flex-col space-y-1">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center mr-2 px-2 py-1 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/30">
              <RiDashboardLine className="w-4 h-4 mr-1.5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-indigo-600 dark:text-indigo-400 font-medium">Lyvia Nusa Boga</span>
            </div>
            <span className="mx-2 text-gray-300 dark:text-gray-600">/</span>
            <span className="capitalize text-gray-700 dark:text-gray-200 font-semibold px-2 py-1 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50">
              {brandText}
            </span>
          </div>

          {/* Page Title */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 dark:from-indigo-400 dark:via-purple-400 dark:to-indigo-300 bg-clip-text text-transparent">
              {brandText}
            </h1>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Right Side - Controls & User Interface */}
      <div className="flex items-center space-x-3">

        {/* Mobile Menu Toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-800/30 hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        </button>

        {/* Mobile Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border border-red-100 dark:border-red-800/30 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 xl:hidden disabled:opacity-50 disabled:cursor-not-allowed"
          title="Logout"
        >
          <RiLogoutBoxRLine className={`h-5 w-5 transition-colors ${
            isLoading 
              ? 'text-gray-400 dark:text-gray-600' 
              : 'text-red-500 dark:text-red-400'
          }`} />
        </button>

        {/* Quick Access Tools */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            to="/admin/input-data"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-100 dark:border-green-800/30 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-300 group"
            title="Input Data"
          >
            <FaWarehouse className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            to="/admin/orders"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-100 dark:border-amber-800/30 hover:shadow-lg hover:shadow-amber-500/25 transition-all duration-300 group"
            title="Pesanan"
          >
            <FaWarehouse className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
          </Link>
          <Link
            to="/admin/laporan"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 group"
            title="Laporan"
          >
            <TbReportAnalytics className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          </Link>
        </div>

        <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
        
        {/* Desktop Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border border-red-100 dark:border-red-800/30 hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Logout"
        >
          <RiLogoutBoxRLine className={`h-4 w-4 transition-colors ${
            isLoading 
              ? 'text-gray-400 dark:text-gray-600' 
              : 'text-red-500 dark:text-red-400'
          }`} />
        </button>

        {/* Enhanced Notification Dropdown */}
        <Dropdown
          button={
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 relative group">
              <IoMdNotificationsOutline className="h-5 w-5 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-[8px] font-bold text-white shadow-md">
                3
              </span>
            </button>
          }
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          children={
            <div className="flex w-[320px] md:w-[360px] flex-col gap-3 rounded-2xl bg-gradient-to-br from-white/95 via-white/90 to-white/80 dark:from-navy-800/95 dark:via-navy-800/90 dark:to-navy-700/80 p-5 shadow-2xl backdrop-blur-xl border border-white/20 dark:border-navy-600/30">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Notifikasi Terbaru
                </h3>
                <button className="text-sm font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20">
                  Tandai dibaca
                </button>
              </div>

              {/* Enhanced Notification Items */}
              <div className="flex w-full items-center rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/30 dark:to-indigo-900/30 p-4 border border-blue-100 dark:border-blue-800/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all cursor-pointer group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-xl text-white shadow-lg group-hover:shadow-blue-500/25 transition-all">
                  <FaWarehouse className="h-5 w-5" />
                </div>
                </div>
                <div className="ml-3 flex h-full w-full flex-col justify-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Pesanan Baru Masuk</p>
            <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-300">1 pesanan menunggu diproses</p>
                  <p className="mt-1 text-[11px] font-medium text-blue-500">
                    Baru saja
                  </p>
                </div>
              </div>

              <div className="flex w-full items-center rounded-lg bg-gray-50 dark:bg-navy-700 p-3 shadow-sm hover:bg-gray-100 dark:hover:bg-navy-600 transition-all cursor-pointer">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-green-500 to-green-600 text-xl text-white shadow-md">
                  <BsArrowBarUp className="h-5 w-5" />
                </div>
                <div className="ml-3 flex h-full w-full flex-col justify-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Perbarui Data Produksi
                  </p>
                  <p className="mt-0.5 text-xs text-gray-700 dark:text-gray-300">
                    Data produksi untuk batch B-2023/05 berhasil diperbarui
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-blue-500">
                    30 menit yang lalu
                  </p>
                </div>
              </div>

              <button className="mt-1 w-full flex justify-center items-center py-2 text-sm text-blue-500 hover:text-blue-700 transition-colors border-t border-gray-100 dark:border-navy-700 pt-2">
                Lihat semua notifikasi
              </button>
            </div>
          }
          classNames={"py-2 top-4 -left-[230px] md:-left-[330px] lg:-left-[360px] w-max"}
        />

        {/* Dashboard Link */}
        <Link
          to="/admin/default"
          className="flex h-[40px] w-[40px] items-center justify-center rounded-full hover:bg-lightPrimary dark:hover:bg-navy-700 border border-gray-200 dark:border-navy-600 transition-all"
          title="Dashboard"
        >
          <RiDashboardLine className="h-5 w-5 text-gray-600 dark:text-white" />
        </Link>

        {/* Profile Dropdown */}
        <Dropdown
          button={
            <button className="flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-navy-700 hover:shadow-md transition-all ml-1">
              <p className="text-base font-bold text-blue-500 dark:text-white">
                {user?.fullname ? user.fullname.charAt(0).toUpperCase() : "U"}
              </p>
            </button>
          }
          children={
            <div className="flex w-56 flex-col justify-start rounded-[16px] bg-white dark:bg-navy-800 bg-cover bg-no-repeat shadow-xl border border-gray-200 dark:border-navy-700">
              {/* User Info */}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-navy-700 dark:text-white">
                    👋 Halo, {user?.fullname || "User"}
                  </p>
                </div>
                <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {user?.role === "admin" ? "Administrator" : "Staff"}
                </p>
              </div>
              <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />

              {/* Menu Items */}
              <div className="flex flex-col p-3">
                <Link
                  to="/admin/profile"
                  className="flex items-center rounded-lg px-3 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
                >
                  <span className="mr-2 text-gray-600 dark:text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                    </svg>
                  </span>
                  Profil Saya
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center rounded-lg px-3 py-2 mt-1 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
                >
                  <span className="mr-2 text-gray-600 dark:text-gray-400">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.83L19.79 16.89C20.1656 17.2655 20.3766 17.7631 20.3766 18.2825C20.3766 18.8019 20.1656 19.2994 19.79 19.675C19.4144 20.0505 18.9169 20.2616 18.3975 20.2616C17.8781 20.2616 17.3805 20.0505 17.005 19.675L16.945 19.615C16.4528 19.1433 15.7321 19.0127 15.115 19.285C14.5136 19.5456 14.1601 20.1571 14.16 20.82V21C14.16 22.0799 13.2799 22.96 12.2 22.96C11.1201 22.96 10.24 22.0799 10.24 21V20.92C10.2329 20.2511 9.87325 19.6395 9.27 19.385C8.65292 19.1127 7.93219 19.2433 7.44 19.715L7.38 19.775C7.00446 20.1505 6.50693 20.3616 5.9875 20.3616C5.46807 20.3616 4.97054 20.1505 4.595 19.775C4.21946 19.3994 4.00842 18.9019 4.00842 18.3825C4.00842 17.8631 4.21946 17.3655 4.595 16.99L4.655 16.93C5.12667 16.4378 5.25733 15.7171 4.985 15.1C4.7244 14.4986 4.11292 14.1451 3.45 14.145H3.27C2.19013 14.145 1.31 13.2649 1.31 12.185C1.31 11.1051 2.19013 10.225 3.27 10.225H3.35C4.01891 10.218 4.6303 9.86055 4.885 9.26C5.15733 8.64293 5.02667 7.92219 4.555 7.43L4.495 7.37C4.11946 6.99446 3.90842 6.49693 3.90842 5.9775C3.90842 5.45807 4.11946 4.96054 4.495 4.585C4.87054 4.20946 5.36807 3.99842 5.8875 3.99842C6.40693 3.99842 6.90446 4.20946 7.28 4.585L7.34 4.645C7.83219 5.11667 8.55292 5.24733 9.17 4.975H9.185C9.78645 4.7144 10.14 4.10292 10.14 3.44V3.27C10.14 2.19013 11.0201 1.31 12.1 1.31C13.1799 1.31 14.06 2.19013 14.06 3.27V3.35C14.06 4.01291 14.4136 4.6244 15.015 4.885C15.6321 5.15733 16.3528 5.02667 16.845 4.555L16.905 4.495C17.2805 4.11946 17.7781 3.90842 18.2975 3.90842C18.8169 3.90842 19.3144 4.11946 19.69 4.495C20.0655 4.87055 20.2766 5.36808 20.2766 5.8875C20.2766 6.40692 20.0655 6.90446 19.69 7.28L19.63 7.34C19.1583 7.83219 19.0277 8.55292 19.3 9.17V9.185C19.5606 9.78645 20.1721 10.1399 20.835 10.14H20.92C21.9999 10.14 22.88 11.0201 22.88 12.1C22.88 13.1799 21.9999 14.06 20.92 14.06H20.84C20.1771 14.0601 19.5656 14.4136 19.305 15.015C19.2971 15.0229 19.2893 15.0309 19.2815 15.0389"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  Pengaturan
                </Link>
              </div>

              <div className="h-px w-full bg-gray-200 dark:bg-navy-700" />

              {/* Sign Out */}
              <div className="p-3">
                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex items-center rounded-lg px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RiLogoutBoxRLine className="mr-2 h-[16px] w-[16px]" />
                  {isLoading ? 'Logging out...' : 'Keluar'}
                </button>
              </div>
            </div>
          }
          classNames={"py-2 top-12 -right-3 md:right-0 w-max"}
        />
      </div>
    </nav>
  );
};

export default Navbar;
