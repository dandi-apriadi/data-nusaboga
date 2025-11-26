import React from "react";
import SignIn from "views/auth/SignIn";
import SignUp from "views/auth/SignUp";
import Homepage from "views/auth/Homepage";
import About from "views/auth/About";
import Contact from "views/auth/Contact";
import Products from "views/auth/Products";
import BlogList from "views/auth/BlogList";
import BlogDetail from "views/auth/BlogDetail";
import OrderTracking from "views/auth/OrderTracking";
// Icon Imports
import { MdLock, MdHome, MdInfo, MdContactMail, MdShoppingCart, MdLocalShipping } from "react-icons/md";

const routes = [
    {
        name: "Sign In",
        layout: "/auth",
        path: "sign-in",
        icon: <MdLock className="h-6 w-6" />,
        component: <SignIn />,
    },
    {
        name: "Sign Up",
        layout: "/auth",
        path: "sign-up",
        icon: <MdLock className="h-6 w-6" />,
        component: <SignUp />,
    },
    {
        name: "Homepage",
        layout: "/auth",
        path: "homepage",
        icon: <MdHome className="h-6 w-6" />,
        component: <Homepage />,
    },
    {
        name: "About",
        layout: "/auth",
        path: "about",
        icon: <MdInfo className="h-6 w-6" />,
        component: <About />,
    },
    {
        name: "Contact",
        layout: "/auth",
        path: "contact",
        icon: <MdContactMail className="h-6 w-6" />,
        component: <Contact />,
    },
    {
        name: "Products",
        layout: "/auth",
        path: "products",
        icon: <MdShoppingCart className="h-6 w-6" />,
        component: <Products />,
    },
    {
        name: "Lacak Pesanan",
        layout: "/auth",
        path: "order-tracking/:orderId?",
        icon: <MdLocalShipping className="h-6 w-6" />,
        component: <OrderTracking />,
    },
    {
        name: "Artikel",
        layout: "/auth",
        path: "artikel",
        icon: <MdInfo className="h-6 w-6" />,
        component: <BlogList />,
    },
    {
        name: "Artikel Detail",
        layout: "/auth",
        path: "artikel-detail/:slug",
        icon: <MdInfo className="h-6 w-6" />,
        component: <BlogDetail />,
    },
];

export default routes;