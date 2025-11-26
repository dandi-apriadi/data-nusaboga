import React from "react";
// Import komponen user views
import Dashboard from "views/user/Dashboard";
import Products from "views/user/Products";
import Cart from "views/user/Cart";
import Orders from "views/user/Orders";
import Profile from "views/user/Profile";
import Address from "views/user/Address";
import Blog from "views/user/Blog"; // retained for direct detail route only (if still needed)
import Homepage from "views/auth/Homepage";
// Removed ContentManagementDemo import because Konten menu is deleted

// Icon Imports
import { 
    MdDashboard, 
    MdShoppingCart, 
    MdShoppingBasket, 
    MdHistory, 
    MdLocationOn,
    MdFavorite,
    MdPerson,
    MdStore,
    MdAccountBox,
    MdHome,
    MdArticle,
    MdStar,
    MdChat
} from "react-icons/md";

const routes = [
    {
        name: "Dashboard",
        layout: "/user",
        path: "dashboard",
        icon: MdDashboard,
        component: <Dashboard />,
        category: "main",
    },
    {
        name: "Belanja",
        icon: MdStore,
        category: "menu",
        subMenus: [
            {
                name: "Produk",
                layout: "/user",
                path: "products",
                icon: MdShoppingCart,
                component: <Products />,
            },
            {
                name: "Keranjang",
                layout: "/user",
                path: "cart",
                icon: MdShoppingBasket,
                component: <Cart />,
            },
        ]
    },
    {
        name: "Pesanan",
        layout: "/user",
        path: "orders",
        icon: MdHistory,
        component: <Orders />,
        category: "main",
    },
    // Konten menu removed per request
    {
        name: "Akun Saya",
        icon: MdAccountBox,
        category: "menu",
        subMenus: [
            {
                name: "Profil",
                layout: "/user",
                path: "profile",
                icon: MdPerson,
                component: <Profile />,
            },
            {
                name: "Alamat",
                layout: "/user",
                path: "address",
                icon: MdLocationOn,
                component: <Address />,
            }
        ]
    },
    {
        name: "Beranda",
        layout: "/auth",
        path: "homepage",
        icon: MdHome,
        component: <Homepage />,
        category: "main",
        subtitle: "Kembali ke halaman utama"
    }
];

// Helper function to flatten routes for React Router
export const getFlattenedRoutes = (routes) => {
    const flattened = [];
    
    routes.forEach(route => {
        if (route.subMenus) {
            // Add sub-menu routes
            route.subMenus.forEach(subRoute => {
                // Filter out Membership sub-menu if present
                if (subRoute.path !== "membership") {
                    flattened.push(subRoute);
                }
            });
        } else if (route.layout && route.path) {
            // Add regular routes
            flattened.push(route);
        }
    });
    
    // (Optional) Blog detail route removed with Konten menu. Re-add here if needed.
    
    return flattened;
};

export default routes;