import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import AdminChatbot from "components/chatbot/AdminChatbot";
import routes, { getFlattenedRoutes } from "../../routes/routes-admin.js";
import { getMe } from "store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";

export default function Admin(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Main Dashboard");
  const { isError } = useSelector((state => state.auth));
  const [page, setPage] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const currentPath = location.pathname.split("/").pop();
    const currentRoute = routes.find(
      (route) => route.layout === "/admin" && route.path === currentPath
    );

    if (currentRoute) {
      setPage(currentRoute.name);
      document.title = currentRoute.name;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isError) {
      console.log("Error fetching user data", isError);
      navigate("/auth/sign-in");
    }
  }, [isError, navigate]);

  useEffect(() => {
    const handleResize = () => {
      // Auto close sidebar on mobile, keep open on desktop
      if (window.innerWidth < 1024) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    
    // Set initial state
    handleResize();
    
    window.addEventListener("resize", handleResize);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    getActiveRoute(routes);
  }, [location.pathname]);

const getActiveRoute = (routes) => {
  let activeRoute = "Main Dashboard";
  const flattenedRoutes = getFlattenedRoutes(routes);
  for (let i = 0; i < flattenedRoutes.length; i++) {
    if (
      window.location.href.indexOf(
        flattenedRoutes[i].layout + "/" + flattenedRoutes[i].path
      ) !== -1
    ) {
      setCurrentRoute(flattenedRoutes[i].name);
      return flattenedRoutes[i].name; // Return route name immediately
    }
  }
  return activeRoute;
};  const getActiveNavbar = (routes) => {
    let activeNavbar = false;
    const flattenedRoutes = getFlattenedRoutes(routes);
    for (let i = 0; i < flattenedRoutes.length; i++) {
      if (
        window.location.href.indexOf(flattenedRoutes[i].layout + "/" + flattenedRoutes[i].path) !== -1
      ) {
        return flattenedRoutes[i].secondary || false;
      }
    }
    return activeNavbar;
  };

  const getRoutes = (routes) => {
    const flattenedRoutes = getFlattenedRoutes(routes);
    return flattenedRoutes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      }
      return null;
    });
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />
      
      {/* Mobile Overlay */}
      {open && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Navbar */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <Navbar
            onOpenSidenav={() => setOpen(true)}
            logoText="Lyvia Nusa Boga"
            brandText={currentRoute}
            secondary={getActiveNavbar(routes)}
            {...rest}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            <div className="p-4 lg:p-6">
              <Routes>
                {getRoutes(routes)}
                <Route
                  path="/"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
                <Route
                  path="/default"
                  element={<Navigate to="/admin/dashboard" replace />}
                />
              </Routes>
            </div>
            
            {/* Footer */}
            <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <Footer />
            </div>
          </div>
        </main>
      </div>

      {/* Admin Chatbot */}
      <AdminChatbot />
    </div>
  );
}
