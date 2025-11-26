import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import Navbar from "components/navbar";
import Sidebar from "components/sidebar";
import Footer from "components/footer/Footer";
import routes, { getFlattenedRoutes } from "../../routes/routes-user.js";
import { getMe } from "store/slices/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { MdChat, MdClose, MdSend, MdSmartToy } from "react-icons/md";

export default function User(props) {
  const { ...rest } = props;
  const location = useLocation();
  const [open, setOpen] = React.useState(true);
  const [currentRoute, setCurrentRoute] = React.useState("Main Dashboard");
  const { isError } = useSelector((state => state.auth));
  const [page, setPage] = useState("");

  // Chatbot state
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Halo! Selamat datang di Lyvia Nusa Boga. Ada yang bisa saya bantu?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getMe());
  }, [dispatch]);

  useEffect(() => {
    const currentPath = location.pathname.split("/").pop();
    const currentRoute = routes.find(
      (route) => route.layout === "/user" && route.path === currentPath
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
      window.innerWidth < 1200 ? setOpen(false) : setOpen(true);
    };
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
      if (prop.layout === "/user") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      }
      return null;
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        text: chatMessage,
        sender: "user",
        timestamp: new Date(),
      };

      setChatMessages([...chatMessages, newMessage]);
      setChatMessage("");

      setTimeout(() => {
        const botResponse = {
          id: chatMessages.length + 2,
          text: getBotResponse(chatMessage),
          sender: "bot",
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, botResponse]);
      }, 1000);
    }
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("produk") || lowerMessage.includes("cakalang")) {
      return "Kami memiliki berbagai produk olahan cakalang berkualitas seperti abon cakalang, dendeng cakalang, dan cakalang fufu. Silakan kunjungi halaman produk untuk melihat katalog lengkap!";
    } else if (lowerMessage.includes("harga") || lowerMessage.includes("price")) {
      return "Untuk informasi harga terbaru, silakan hubungi tim sales kami di WhatsApp 62 811-488-068 atau email info@lyvianusaboga.com";
    } else if (lowerMessage.includes("pengiriman") || lowerMessage.includes("kirim")) {
      return "Kami melayani pengiriman ke seluruh Indonesia dengan berbagai pilihan kurir. Estimasi pengiriman 1-3 hari kerja untuk area Jabodetabek.";
    } else if (lowerMessage.includes("kontak") || lowerMessage.includes("hubungi")) {
      return "Anda bisa menghubungi kami melalui:\n📞 WhatsApp: 62 811-488-068\n📧 Email: info@lyvianusaboga.com\n🕒 Jam operasional: 08:00-17:00 WIB";
    } else {
      return "Terima kasih atas pertanyaan Anda! Untuk informasi lebih detail, silakan hubungi customer service kami di WhatsApp 62 811-488-068. Tim kami siap membantu Anda!";
    }
  };

  const quickReplies = [
    "Info produk cakalang",
    "Cara pemesanan",
    "Info pengiriman",
    "Hubungi sales",
  ];

  const handleQuickReply = (reply) => {
    setChatMessage(reply);
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-navy-900 dark:via-navy-800 dark:to-navy-900">
      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />
      
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-gray-900 bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar
          onOpenSidenav={() => setOpen(true)}
          logoText="Lyvia Nusa Boga"
          brandText={currentRoute}
          secondary={getActiveNavbar(routes)}
          {...rest}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-full min-h-screen p-3 lg:px-6 lg:py-4">
            <Routes>
              {getRoutes(routes)}
              <Route
                path="/"
                element={<Navigate to="/user/default" replace />}
              />
            </Routes>
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* Chatbot Component */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chatbot Window */}
        {isChatbotOpen && (
          <div className="mb-4 w-[90vw] max-w-md h-[70vh] sm:w-96 sm:h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MdSmartToy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Lyvia Assistant</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsChatbotOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-2xl text-sm ${
                      message.sender === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-800 shadow-sm border"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickReply(reply)}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Ketik pesan Anda..."
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition-colors"
                >
                  <MdSend className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Chatbot Toggle Button */}
        <button
          onClick={() => setIsChatbotOpen(!isChatbotOpen)}
          className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
        >
          {isChatbotOpen ? (
            <MdClose className="h-8 w-8 group-hover:scale-110 transition-transform" />
          ) : (
            <div className="relative">
              <MdChat className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">1</span>
              </div>
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
