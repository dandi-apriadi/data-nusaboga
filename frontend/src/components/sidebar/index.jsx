import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiX, HiSparkles } from "react-icons/hi";
import { MdDashboard, MdShoppingCart, MdInventory, MdPeople, MdAssessment, MdSettings, MdFavorite, MdTrendingUp } from "react-icons/md";
import SidebarLinks from "./components/Links";
import routesAdmin from "../../routes/routes-admin.js";
import routesUser from "../../routes/routes-user.js";
import { useSelector } from "react-redux";

// Enhanced Modern Lyvia Logo
const LyviaLogo = () => (
  <div className="relative group">
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
    <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-xl transform group-hover:scale-105 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
      <span className="relative text-white font-bold text-2xl tracking-tight">LN</span>
      <div className="absolute -top-1 -right-1 w-3 h-3">
        <HiSparkles className="w-full h-full text-yellow-300 animate-pulse" />
      </div>
    </div>
  </div>
);

// NotificationBadge removed — notifications are hidden from the sidebar

// Validate routes to ensure they contain valid components
const validateRoutes = (routes) => {
  if (!Array.isArray(routes)) return [];
  return routes.filter(route => {
    // Handle sub-menu routes
    if (route.subMenus) {
      return route.subMenus.every(subRoute => 
        subRoute && typeof subRoute === 'object' && (
          subRoute.component || 
          typeof subRoute.component === 'function' ||
          typeof subRoute.component === 'string' ||
          React.isValidElement(subRoute.component)
        )
      );
    }
    // Handle regular routes
    return route && typeof route === 'object' && (
      route.component || 
      typeof route.component === 'function' ||
      typeof route.component === 'string' ||
      React.isValidElement(route.component) ||
      route.category === 'menu' // Allow menu items without components
    );
  });
};

const Sidebar = ({ open, onClose }) => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredStat, setHoveredStat] = useState(null);

  // Use useMemo to only recalculate routes when user role changes
  const routes = useMemo(() => {
    try {
      const roleRoutes = {
        'admin': routesAdmin,
        'user': routesUser,
      };
      const selectedRoutes = roleRoutes[user?.role] || routesUser;
      return validateRoutes(selectedRoutes);
    } catch (error) {
      console.error("Error processing routes:", error);
      return [];
    }
  }, [user?.role]);

  // Modern color scheme
  const colorScheme = {
    admin: {
      primary: 'indigo',
      secondary: 'purple',
      accent: 'amber'
    },
    user: {
      primary: 'purple', 
      secondary: 'indigo',
      accent: 'green'
    }
  };

  const scheme = colorScheme[user?.role] || colorScheme.user;

  // Quick stats data
  const quickStats = user?.role === 'admin' ? [
    { label: 'Total Penjualan', value: 'Rp 2.8M', change: '+12%', icon: MdTrendingUp, color: 'green' },
    { label: 'Pesanan Baru', value: '25', change: '+5', icon: MdShoppingCart, color: 'blue' },
    { label: 'Produk Aktif', value: '48', change: '+3', icon: MdInventory, color: 'purple' }
  ] : [
    { label: 'Pesanan Saya', value: '8', change: '+2', icon: MdShoppingCart, color: 'purple' },
    { label: 'Wishlist', value: '12', change: '+1', icon: MdFavorite, color: 'red' },
    { label: 'Total Belanja', value: 'Rp 1.2M', change: '', icon: MdTrendingUp, color: 'green' }
  ];

  return (
    <div
      className={`
        fixed top-0 left-0 z-50 h-full w-80
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800
        shadow-2xl shadow-slate-900/10 dark:shadow-black/20
        transition-transform duration-300 ease-in-out
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto lg:shadow-lg
      `}
    >
      {/* Modern Header */}
      <div className="relative px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        {/* Close Button for Mobile */}
        <button
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 lg:hidden"
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <HiX className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <LyviaLogo />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
              Lyvia Nusa Boga
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
              {user?.role === 'admin' ? (
                <>
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  Admin Dashboard
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Customer Portal
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(148, 163, 184, 0.3);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(148, 163, 184, 0.5);
            }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(71, 85, 105, 0.5);
            }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(71, 85, 105, 0.7);
            }
          `}</style>
          {/* User Profile Section */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className={`
              relative overflow-hidden p-5 rounded-2xl
              bg-gradient-to-br from-${scheme.primary}-500 to-${scheme.secondary}-600
              text-white shadow-xl
              hover:shadow-2xl transition-all duration-300
              cursor-pointer group
            `}>
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent group-hover:from-white/20 transition-all duration-300"></div>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="relative flex items-center space-x-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center ring-2 ring-white/20 group-hover:ring-white/40 transition-all duration-300">
                  <span className="text-xl font-bold">
                    {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg truncate mb-1">
                    {user?.fullname || 'User Name'}
                  </h3>
                  <p className="text-sm opacity-90 capitalize flex items-center">
                    {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats removed per request - Overview section intentionally omitted */}

          {/* Navigation Menu */}
          <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Menu
              </h3>
              <div className="w-6 h-0.5 bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600"></div>
            </div>
            
            <nav className="space-y-2">
              {Array.isArray(routes) && routes.length > 0 ? (
                <SidebarLinks routes={routes} />
              ) : (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MdSettings className="w-8 h-8 opacity-50" />
                  </div>
                  <p className="text-sm font-medium">No menu items available</p>
                  <p className="text-xs mt-1 opacity-75">Please contact administrator</p>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Footer - Enhanced */}
        <div className="flex-shrink-0 px-6 py-8 border-t-2 border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-800 dark:via-slate-800/90 dark:to-slate-800/80 shadow-lg">
          <div className="space-y-5">
            {/* App Info */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">LN</span>
                </div>
                <div className="text-left">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                    Lyvia Nusa Boga
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    UMKM Marketplace
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Version 1.0.0 • Build 2025.09
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  © 2025 Lyvia Nusa Boga. All rights reserved.
                </p>
                <div className="flex items-center justify-center space-x-3 pt-2">
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    Made with ❤️ for UMKM
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
