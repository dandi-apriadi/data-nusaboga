import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import routes from "../../routes/routes-auth.js";
import Navbar from "components/navbarhome";
import SignInNavbar from "components/navbarhome/SignInNavbar";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../utils/apiClient";
import { 
  MdChat, 
  MdClose, 
  MdSend,
  MdSupportAgent,
  MdSmartToy,
  MdQuestionAnswer,
  MdShoppingCart,
  MdPointOfSale,
  MdShoppingBag
} from "react-icons/md";
import { FiMessageCircle, FiPhone, FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import POSMenu from "views/admin/POSMenu";

const FULL_WIDTH_PAGES = ['Homepage', 'Sign In', 'About', 'Contact', 'Products', 'Lacak Pesanan'];

export default function Auth() {
  const [page, setPage] = useState("");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showGuestCheckout, setShowGuestCheckout] = useState(false);
  const [showGuestPOS, setShowGuestPOS] = useState(false);
  const [guestData, setGuestData] = useState({
    nama: "",
    alamat: "",
    whatsapp: ""
  });
  const [guestError, setGuestError] = useState("");
  const [guestCheckoutData, setGuestCheckoutData] = useState(null);
  const [cartData, setCartData] = useState({
    items: [],
    itemCount: 0,
    subtotal: 0,
    total: 0
  });
  const [chatMessage, setChatMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Halo! Selamat datang di Lyvia Nusa Boga. Ada yang bisa saya bantu?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  // Chatbot session state (backend-integrated)
  const [chatSessionId, setChatSessionId] = useState(null);
  const [sessionToken, setSessionToken] = useState(() => {
    try {
      return localStorage.getItem('chat_session_token');
    } catch (_) { return null; }
  });
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const defaultQuickReplies = [
    "Info produk cakalang",
    "Cara pemesanan",
    "Info pengiriman",
    "Hubungi sales"
  ];
  const [quickReplies, setQuickReplies] = useState(defaultQuickReplies);
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    
    // Check if it's order-tracking route (with or without ID)
    if (pathname.includes('order-tracking')) {
      setPage('Lacak Pesanan');
      document.title = "Lacak Pesanan - Lyvia Nusa Boga Marketplace";
      return;
    }
    
    // For other routes, use existing logic
    const currentPath = pathname.split("/").pop();
    const currentRoute = routes.find(
      (route) => route.layout === "/auth" && route.path === currentPath
    );

    if (currentRoute) {
      setPage(currentRoute.name);
      document.title = currentRoute.name + " - Lyvia Nusa Boga Marketplace";
    }
  }, [location.pathname]);

  // Load guestCheckoutData ketika modal POS dibuka
  useEffect(() => {
    if (showGuestPOS) {
      const storedGuestData = localStorage.getItem('guestCheckoutData');
      if (storedGuestData) {
        try {
          setGuestCheckoutData(JSON.parse(storedGuestData));
        } catch (e) {
          console.warn('Failed to parse guestCheckoutData:', e);
        }
      }
    }
  }, [showGuestPOS]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/auth") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  // Ensure backend session when chatbot is opened
  useEffect(() => {
    const init = async () => {
      if (!isChatbotOpen) return;
      try {
        // Load quick replies from backend
        apiGet('/api/chat/quick-replies')
          .then((items) => {
            if (Array.isArray(items) && items.length) {
              setQuickReplies(items.map((r) => r.label).slice(0, 6));
            }
          })
          .catch(() => {});

        if (!chatSessionId) {
          const body = {
            source: 'web',
            title: 'Customer Chat',
            session_token: sessionToken || undefined,
          };
          const session = await apiPost('/api/chat/sessions', body);
          if (session?.chat_session_id) setChatSessionId(session.chat_session_id);
          if (session?.session_token && session?.session_token !== sessionToken) {
            try {
              localStorage.setItem('chat_session_token', session.session_token);
              setSessionToken(session.session_token);
            } catch (_) {}
          }
        }
      } catch (err) {
        // If backend unreachable, keep UI functional with fallback
        console.warn('[Chatbot] init failed, fallback to local mode:', err?.message);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChatbotOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = chatMessage.trim();
    if (!text) return;

    setChatError(null);
    const userMsg = {
      id: chatMessages.length + 1,
      text,
      sender: "user",
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMsg]);
    setChatMessage("");
    setIsChatLoading(true);

    // Try backend first; fallback to local reply on error
    try {
      if (!chatSessionId) {
        // Ensure session lazily if not yet available
        const body = { source: 'web', title: 'Customer Chat', session_token: sessionToken || undefined };
        const session = await apiPost('/api/chat/sessions', body);
        if (session?.chat_session_id) setChatSessionId(session.chat_session_id);
        if (session?.session_token && session?.session_token !== sessionToken) {
          try { localStorage.setItem('chat_session_token', session.session_token); } catch (_){ }
          setSessionToken(session.session_token);
        }
      }

      if (chatSessionId) {
        const resp = await apiPost(`/api/chat/sessions/${chatSessionId}/messages`, {
          message_text: text,
          message_type: 'text'
        });
        const botText = resp?.bot?.message_text || getBotResponse(text);
        const botMsg = {
          id: (userMsg.id || 0) + 1,
          text: botText,
          sender: "bot",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMsg]);
      } else {
        // If still no session, fallback
        const botMsg = {
          id: (userMsg.id || 0) + 1,
          text: getBotResponse(text),
          sender: "bot",
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, botMsg]);
      }
    } catch (err) {
      setChatError(err?.message || 'Gagal mengirim pesan');
      const botMsg = {
        id: (userMsg.id || 0) + 1,
        text: getBotResponse(text),
        sender: "bot",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Fallback lokal hanya jika backend/AI tidak tersedia
  const getBotResponse = () => {
    return "Maaf, asisten AI sedang tidak tersedia untuk saat ini. Coba lagi beberapa saat atau hubungi CS: Telepon 082297992691, email lyvianusaboga@gmail.com.";
  };

  const handleQuickReply = (reply) => {
    setChatMessage(reply);
  };

  const handleGuestCheckout = () => {
    setGuestError("");
    
    // Validasi input
    if (!guestData.nama.trim()) {
      setGuestError("Nama wajib diisi");
      return;
    }
    if (!guestData.alamat.trim()) {
      setGuestError("Alamat wajib diisi");
      return;
    }
    if (!guestData.whatsapp.trim()) {
      setGuestError("Nomor WhatsApp wajib diisi");
      return;
    }
    
    // Validasi format WhatsApp (minimal 10 digit)
    const waNumber = guestData.whatsapp.replace(/\D/g, '');
    if (waNumber.length < 10) {
      setGuestError("Nomor WhatsApp tidak valid (minimal 10 digit)");
      return;
    }

    // Simpan ke localStorage untuk digunakan di POS Modal
    localStorage.setItem('guestCheckoutData', JSON.stringify({
      nama: guestData.nama,
      alamat: guestData.alamat,
      whatsapp: guestData.whatsapp,
      timestamp: new Date().toISOString()
    }));

    // Close guest checkout modal
    setShowGuestCheckout(false);
    // Open POS modal
    setShowGuestPOS(true);
  };

  const closeGuestCheckout = () => {
    setShowGuestCheckout(false);
    setGuestData({ nama: "", alamat: "", whatsapp: "" });
    setGuestError("");
  };
  return (
    <>
      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(51, 65, 85, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #4f46e5, #7c3aed);
        }
        
        .custom-scrollbar-white::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-white::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar-white::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #818cf8, #a78bfa);
          border-radius: 10px;
        }
        .custom-scrollbar-white::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #6366f1, #8b5cf6);
        }
      `}</style>

  <div className="relative float-right h-full min-h-screen min-h-screen-ios w-full bg-white">
        {/* Only show the subtle background pattern for non-Sign In pages */}
        {page !== "Sign In" && (
          <div className="absolute inset-0 bg-white">
            {/* Subtle pattern for non-Sign In pages */}
            <div className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%230e4a89' fill-opacity='0.6' fill-rule='evenodd'/%3E%3C/svg%3E\")",
                backgroundSize: "180px",
                opacity: 0.08
              }}
            ></div>
          </div>
        )        }

        <main className={`mx-auto min-h-screen relative z-10 ${page === "Sign In" ? "overflow-hidden" : ""}`}>
          <div className={`${page === "Sign In" ? "absolute w-full top-0 z-50" : ""}`}>
            {page === "Sign In" ? <SignInNavbar /> : <Navbar />}
          </div>
          <div className={`relative ${FULL_WIDTH_PAGES.includes(page) ? "w-full min-h-screen min-h-screen-ios" : ""} ${page === "Sign In" ? "pt-16 sm:pt-20" : ""}`}>
            <div className={`
              ${FULL_WIDTH_PAGES.includes(page)
                ? "w-full h-full p-0 m-0 max-w-none"
                : "mx-auto flex min-h-full w-full flex-col justify-start pt-12 md:max-w-[75%] lg:max-w-[1013px] lg:px-8 lg:pt-0 xl:min-h-[100vh] xl:max-w-[1383px] xl:px-0 xl:pl-[70px]"
              }
            `}>
              <div className={`mb-auto flex flex-col ${!FULL_WIDTH_PAGES.includes(page) ? "pl-5 pr-5 md:pr-0 md:pl-12 lg:max-w-[48%] lg:pl-0 xl:max-w-full" : ""}`}>
                <Routes>
                  {getRoutes(routes)}
                  <Route
                    path="/"
                    element={<Navigate to="/auth/sign-in" replace />}
                  />
                  <Route 
                    path="*" 
                    element={<Navigate to="/auth/sign-in" replace />} 
                  />
                </Routes>
              </div>
            </div>
          </div>
        </main>

        {/* Chatbot Component */}
  <div className="fixed right-6 bottom-28 sm:bottom-6 z-50 flex flex-col items-end gap-3 safe-bottom">
          {/* Belanja Tanpa Login Button */}
          <button
            onClick={() => setShowGuestCheckout(true)}
            title="Belanja tanpa perlu login"
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <MdShoppingCart className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform" />
          </button>

          {/* WhatsApp Button */}
          <a
            href="https://wa.me/6282297992691"
            target="_blank"
            rel="noopener noreferrer"
            title="Chat dengan kami di WhatsApp"
            className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            <FaWhatsapp className="h-6 w-6 sm:h-7 sm:w-7 group-hover:scale-110 transition-transform" />
          </a>

          {/* Chatbot Window */}
          {isChatbotOpen && (
            <div className="mb-4 w-[90vw] max-w-md h-[70vh] sm:w-96 sm:h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between border-b-2 border-indigo-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-700 rounded-full flex items-center justify-center border-2 border-indigo-400">
                    <MdSmartToy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm">Lyvia Assistant</h3>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-indigo-100 text-xs">Online</span>
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
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-1 bg-white border px-3 py-2 rounded-2xl text-slate-600 shadow-sm">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }}></span>
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }}></span>
                    </div>
                  </div>
                )}
                {chatError && (
                  <div className="text-xs text-red-600 mt-2">{chatError}</div>
                )}
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
            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
          >
            {isChatbotOpen ? (
              <MdClose className="h-6 w-6 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform" />
            ) : (
              <div className="relative">
                <MdChat className="h-6 w-6 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">1</span>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Guest Checkout Modal */}
        {showGuestCheckout && (
          <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animation-scale-up">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <MdShoppingCart className="text-blue-200" />
                    Belanja Tanpa Login
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    Isi data untuk melanjutkan ke kasir
                  </p>
                </div>
                <button
                  onClick={closeGuestCheckout}
                  className="text-blue-100 hover:text-white transition-colors"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Content */}
              <form onSubmit={(e) => { e.preventDefault(); handleGuestCheckout(); }} className="p-8 space-y-6">
                {/* Error Message */}
                {guestError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {guestError}
                  </div>
                )}

                {/* Nama Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestData.nama}
                    onChange={(e) => setGuestData({ ...guestData, nama: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                    placeholder="Contoh: Budi Santoso"
                    required
                  />
                </div>

                {/* Alamat Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={guestData.alamat}
                    onChange={(e) => setGuestData({ ...guestData, alamat: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors resize-none"
                    placeholder="Contoh: Jl. Raya Manado No. 123, Kel. Tikala, Kec. Manado Tua, Manado 95119"
                    rows="3"
                    required
                  />
                </div>

                {/* WhatsApp Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 font-medium">+62</span>
                    <input
                      type="tel"
                      value={guestData.whatsapp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        // Hapus prefix 62 jika ada
                        const cleanValue = value.startsWith('62') ? value.substring(2) : value;
                        setGuestData({ ...guestData, whatsapp: cleanValue });
                      }}
                      className="w-full pl-14 pr-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0 focus:outline-none transition-colors"
                      placeholder="811 488 068"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5">Contoh: 811488068 (tanpa +62)</p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <p className="text-sm text-blue-900">
                    ℹ️ Data Anda akan digunakan untuk proses transaksi dan pengiriman produk.
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeGuestCheckout}
                    className="px-6 py-2.5 text-slate-700 border-2 border-slate-300 rounded-xl hover:bg-slate-50 font-semibold transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition-all flex items-center gap-2"
                  >
                    <MdShoppingCart size={18} />
                    Lanjut ke Kasir
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Guest POS Modal - Full Screen with 2-Column Layout */}
        {showGuestPOS && (
          <div className="fixed inset-0 z-[60] bg-white flex flex-col">
            {/* Premium Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-2xl">
              <div className="max-w-full px-4 sm:px-6 lg:px-8 py-5">
                <div className="flex items-center justify-between">
                  {/* Left: Logo & Title */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="flex-shrink-0 bg-indigo-700 p-2.5 sm:p-3 rounded-xl border-2 border-indigo-500 hover:bg-indigo-800 transition-colors">
                      <MdPointOfSale className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-lg sm:text-2xl font-bold text-white truncate">Point of Sale - Guest Checkout</h1>
                      <p className="text-indigo-100 text-xs sm:text-sm hidden xs:block">Lyvia Nusa Boga • Sistem Penjualan</p>
                    </div>
                  </div>

                  {/* Right: Close Button */}
                  <button
                    onClick={() => {
                      setShowGuestPOS(false);
                      localStorage.removeItem('guestCheckoutData');
                      setGuestData({ nama: "", alamat: "", whatsapp: "" });
                    }}
                    className="flex-shrink-0 ml-3 p-2.5 text-indigo-100 hover:text-white bg-indigo-700 hover:bg-indigo-800 rounded-xl transition-all duration-200 border-2 border-indigo-500"
                    title="Tutup (Esc)"
                  >
                    <MdClose className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>

              {/* Animated Bottom Border */}
              <div className="h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
            </div>

            {/* 2-Column Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* Left: Products (Full height on mobile, left column on desktop) */}
              <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 sm:px-7 py-6 min-h-0 custom-scrollbar">
                <POSMenu 
                  isGuest={true}
                  layout="full"
                  onCartUpdate={(updatedCart) => setCartData(updatedCart)}
                  onClose={() => {
                    setShowGuestPOS(false);
                    localStorage.removeItem('guestCheckoutData');
                    setGuestData({ nama: "", alamat: "", whatsapp: "" });
                  }} 
                />
              </div>
            </div>

            {/* Mobile Bottom Bar */}
            <div className="lg:hidden sticky bottom-0 bg-gradient-to-t from-slate-900 to-slate-900/50 border-t border-white/10 px-4 sm:px-6 py-3">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Mode Aktif</span>
                </div>
                <div className="text-slate-500 text-xs">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Desktop Status Bar */}
            <div className="hidden lg:block sticky bottom-0 bg-gradient-to-t from-slate-900 to-slate-900/50 border-t border-white/10 px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="text-slate-400 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Sistem Aktif • Guest Checkout Mode • 2-Column Layout</span>
                </div>
                <div className="text-slate-500 text-xs">
                  {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Keyboard Shortcut Handler */}
            <style>{`
              @media (max-width: 1024px) {
                body { overflow: hidden; }
              }
            `}</style>
          </div>
        )}
      </div>
    </>
  );
}
