import React from "react";
// Import komponen admin views
import Dashboard from "views/admin/Dashboard";
import Products from "views/admin/Products";
import Categories from "views/admin/Categories";
import Orders from "views/admin/Orders";
import Customers from "views/admin/Customers";
import Reports from "views/admin/Reports";
import POS from "views/admin/POS";
import ReferralManagement from "views/admin/ReferralManagement";
import MembershipManagement from "views/admin/MembershipManagement";
// Removed ChatbotManagement, ReviewManagement, NotificationManagement, BlogManagement per request
import BannerManagement from "views/admin/BannerManagement";

// Icon Imports
import { 
    MdDashboard, 
    MdInventory, 
    MdShoppingCart, 
    MdPeople, 
    MdAssessment, 
    MdPointOfSale,
    MdSettings,
    MdLock,
    MdCardGiftcard,
    MdWorkspacePremium,
    MdStore,
    MdContentCopy,
    MdAccountBox,
    MdTrendingUp,
    MdPhoto
} from "react-icons/md";
import Profile from 'views/user/Profile';

const routes = [
    {
        name: "Dashboard",
        layout: "/admin",
        path: "dashboard",
        icon: MdDashboard,
        component: <Dashboard />,
        category: "main",
    },
    {
        name: "Inventori",
        icon: MdStore,
        category: "menu",
        subMenus: [
            {
                name: "Produk",
                layout: "/admin",
                path: "products",
                icon: MdInventory,
                component: <Products />,
            },
            {
                name: "Kategori",
                layout: "/admin",
                path: "categories",
                icon: MdSettings,
                component: <Categories />,
            }
        ]
    },
    {
        name: "Penjualan",
        icon: MdTrendingUp,
        category: "menu",
        subMenus: [
            {
                name: "Pesanan",
                layout: "/admin",
                path: "orders",
                icon: MdShoppingCart,
                component: <Orders />,
            },
            {
                name: "POS",
                layout: "/admin",
                path: "pos",
                icon: MdPointOfSale,
                component: <POS />,
                subtitle: "Fase 2 - offline POS"
            },
            {
                name: "Laporan",
                layout: "/admin",
                path: "reports",
                icon: MdAssessment,
                component: <Reports />,
            }
        ]
    },
    {
        name: "Manajemen Pelanggan",
        icon: MdAccountBox,
        category: "menu",
        subMenus: [
            {
                name: "Pelanggan",
                layout: "/admin",
                path: "customers",
                icon: MdPeople,
                component: <Customers />,
            },
            {
                name: "Kode Referal",
                layout: "/admin",
                path: "referrals",
                icon: MdCardGiftcard,
                component: <ReferralManagement />,
            }
        ]
    },
    {
        name: "Manajemen Konten",
        icon: MdContentCopy,
        category: "menu",
        subMenus: [
            {
                name: "Banner",
                layout: "/admin",
                path: "banners",
                icon: MdPhoto,
                component: <BannerManagement />,
            },
            
        ]
    },
    {
        name: "Pengaturan",
        layout: "/admin",
        path: "settings",
        icon: MdSettings,
        category: "main",
        subMenus: [
            {
                name: "Ganti Password",
                layout: "/admin",
                path: "settings/change-password",
                icon: MdLock,
                component: <Profile />
            }
        ]
    },
];

// Helper function to flatten routes for React Router
export const getFlattenedRoutes = (routes) => {
    const flattened = [];
    
    routes.forEach(route => {
        if (route.subMenus) {
            // Add sub-menu routes
            route.subMenus.forEach(subRoute => {
                flattened.push(subRoute);
            });
        } else if (route.layout && route.path) {
            // Add regular routes
            flattened.push(route);
        }
    });
    
    return flattened;
};

export default routes;