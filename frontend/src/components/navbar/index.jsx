import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiAlignJustify } from "react-icons/fi";
import { RiDashboardLine, RiLogoutBoxRLine } from "react-icons/ri";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FaWarehouse } from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";
import { BsArrowBarUp } from "react-icons/bs";
import { 
    MdDashboard, 
    MdInventory, 
    MdShoppingCart, 
    MdPeople, 
    MdAssessment, 
    MdPointOfSale,
    MdShoppingBasket,
    MdHistory
} from "react-icons/md";
import Dropdown from "components/dropdown";
import { useLogout } from "hooks/useLogout";

const Navbar = (props) => {
  const { onOpenSidenav, brandText } = props;
  const location = useLocation();
  const { logout, isLoading } = useLogout();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = () => {
    logout();
  };

  return (
  <nav className="sticky top-4 z-40 flex flex-row flex-wrap items-center justify-between rounded-xl bg-white p-4 backdrop-blur-xl lg:flex-nowrap w-full border border-slate-200 shadow-lg shadow-slate-200/50 transition-all duration-300 hover:shadow-xl">
      {/* Enhanced Left Side - Branding & Page Title */}
      <div className="ml-2">
        <div className="flex flex-col space-y-1">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center text-sm text-slate-500">
            <div className="flex items-center mr-2 px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-100">
              <RiDashboardLine className="w-4 h-4 mr-1.5 text-indigo-600" />
              <span className="text-indigo-700 font-medium">Lyvia Nusa Boga</span>
            </div>
            <span className="mx-2 text-slate-400">/</span>
            <span className="capitalize text-slate-700 font-semibold px-2 py-1 rounded-lg bg-slate-50">
              {brandText}
            </span>
          </div>

          {/* Page Title */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
              {brandText}
            </h1>
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-purple-600 animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Right Side - Controls & User Interface */}
      <div className="flex items-center space-x-3">
        {/* Mobile Menu Toggle */}
        <button
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 border border-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5 text-white" />
        </button>

        {/* Mobile Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 border border-red-200 hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all duration-300 xl:hidden disabled:opacity-50 disabled:cursor-not-allowed"
          title="Logout"
        >
          <RiLogoutBoxRLine className={`h-5 w-5 transition-colors ${
            isLoading 
              ? 'text-white/60' 
              : 'text-white'
          }`} />
        </button>

        {/* Role-based Quick Access Menu */}
        <div className="hidden md:flex items-center space-x-2">
          {user?.role === "admin" ? (
            <>
              {/* Admin Menu */}
              <Link
                to="/admin/products"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:shadow-md hover:shadow-indigo-100 transition-all duration-300 group"
                title="Produk"
              >
                <MdInventory className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                to="/admin/orders"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 hover:shadow-md hover:shadow-purple-100 transition-all duration-300 group"
                title="Pesanan"
              >
                <MdShoppingCart className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                to="/admin/customers"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 hover:shadow-md hover:shadow-amber-100 transition-all duration-300 group"
                title="Pelanggan"
              >
                <MdPeople className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                to="/admin/reports"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 hover:shadow-md hover:shadow-blue-100 transition-all duration-300 group"
                title="Laporan"
              >
                <MdAssessment className="h-4 w-4 text-blue-600 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                to="/admin/pos"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:shadow-md hover:shadow-slate-100 transition-all duration-300 group"
                title="POS"
              >
                <MdPointOfSale className="h-4 w-4 text-slate-600 group-hover:scale-110 transition-transform" />
              </Link>
            </>
          ) : (
            <>
              {/* User/Customer Menu */}
              <Link
                to="/user/products"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 hover:shadow-md hover:shadow-indigo-100 transition-all duration-300 group"
                title="Produk"
              >
                <MdShoppingCart className="h-4 w-4 text-indigo-600 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                to="/user/cart"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 hover:shadow-md hover:shadow-purple-100 transition-all duration-300 group"
                title="Keranjang"
              >
                <MdShoppingBasket className="h-4 w-4 text-purple-600 group-hover:scale-110 transition-transform" />
              </Link>
              <Link
                to="/user/orders"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 hover:bg-amber-100 hover:shadow-md hover:shadow-amber-100 transition-all duration-300 group"
                title="Riwayat Pesanan"
              >
                <MdHistory className="h-4 w-4 text-amber-600 group-hover:scale-110 transition-transform" />
              </Link>
            </>
          )}
        </div>

  <div className="h-10 w-px bg-slate-200 mx-2"></div>
        
        {/* Desktop Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoading}
          className="hidden md:flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 border border-red-200 hover:bg-red-700 hover:shadow-lg hover:shadow-red-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Logout"
        >
          <RiLogoutBoxRLine className={`h-4 w-4 transition-colors ${
            isLoading 
              ? 'text-white/60' 
              : 'text-white'
          }`} />
        </button>


        {/* Dashboard Link - Role-based */}
        <Link
          to={user?.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 border border-indigo-200 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-300 group"
          title="Dashboard"
        >
          <RiDashboardLine className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
        </Link>

      </div>
    </nav>
  );
};

export default Navbar;
