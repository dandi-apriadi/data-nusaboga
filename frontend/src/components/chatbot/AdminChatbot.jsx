import React, { useState, useEffect, useRef } from 'react';
import { MdChat, MdClose, MdSend, MdSmartToy, MdNotifications } from 'react-icons/md';
import { apiGet, apiPost, apiPatch } from '../../utils/apiClient';
import useChatNotifications from '../../hooks/useChatNotifications';

const AdminChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('bot'); // 'bot' or 'pending'
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [quickReplies, setQuickReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Chat notifications hook
  const { unreadCount, pendingChats, refreshChats } = useChatNotifications();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chatbot session when opened
  useEffect(() => {
    if (isOpen && !sessionId && activeTab === 'bot') {
      initializeChatSession();
      loadQuickReplies();
    }
  }, [isOpen, sessionId, activeTab]);

  const initializeChatSession = async () => {
    try {
      setLoading(true);
      
      // Get or create a session
      const sessionData = await apiPost('/api/chat/sessions', {
        source: 'admin_panel',
        title: 'Admin Chat Session'
      });
      
      setSessionId(sessionData.chat_session_id);
      setSessionToken(sessionData.session_token);
      
      // Load existing messages if any
      if (sessionData.chat_session_id) {
        await loadMessages(sessionData.chat_session_id);
      }
      
      // Add welcome message if no messages exist
      if (messages.length === 0) {
        setMessages([{
          id: 'welcome',
          message_text: 'Halo! Selamat datang di Lyvia Nusa Boga Admin Panel. Ada yang bisa saya bantu?',
          sender_type: 'bot',
          created_at: new Date().toISOString(),
        }]);
      }
    } catch (error) {
      console.error('Error initializing chat session:', error);
      // Fallback to offline mode
      setMessages([{
        id: 'welcome-offline',
        message_text: 'Halo! Saya dalam mode offline. Beberapa fitur mungkin tidak tersedia.',
        sender_type: 'bot',
        created_at: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatSessionId) => {
    try {
      const messagesData = await apiGet(`/api/chat/sessions/${chatSessionId}/messages`);
      setMessages(messagesData.map(msg => ({
        ...msg,
        sender_type: msg.sender_type || (msg.sender_id ? 'user' : 'bot')
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadQuickReplies = async () => {
    try {
      const repliesData = await apiGet('/api/chat/quick-replies');
      setQuickReplies(repliesData.filter(reply => reply.is_active));
    } catch (error) {
      console.error('Error loading quick replies:', error);
      // Fallback quick replies
      setQuickReplies([
        { quick_reply_id: '1', label: 'Info produk cakalang', payload_text: 'Bisa ceritakan tentang produk cakalang?' },
        { quick_reply_id: '2', label: 'Cara pemesanan', payload_text: 'Bagaimana cara melakukan pemesanan?' },
        { quick_reply_id: '3', label: 'Info pengiriman', payload_text: 'Bagaimana sistem pengiriman produk?' },
        { quick_reply_id: '4', label: 'Hubungi sales', payload_text: 'Saya ingin berbicara dengan sales' },
      ]);
    }
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      message_text: messageText,
      sender_type: 'user',
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setLoading(true);

    try {
      if (sessionId) {
        // Send to backend
        const response = await apiPost(`/api/chat/sessions/${sessionId}/messages`, {
          message_text: messageText,
          message_type: 'text'
        });

        // Add bot response if provided
        if (response.bot && response.bot.message_text) {
          const botMessage = {
            id: Date.now() + 1,
            message_text: response.bot.message_text,
            sender_type: 'bot',
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, botMessage]);
        }
      } else {
        // Fallback offline response
        setTimeout(() => {
          const botMessage = {
            id: Date.now() + 1,
            message_text: getOfflineBotResponse(messageText),
            sender_type: 'bot',
            created_at: new Date().toISOString(),
          };
          setMessages(prev => [...prev, botMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        message_text: 'Maaf, terjadi kesalahan. Silakan coba lagi nanti.',
        sender_type: 'bot',
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getOfflineBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('produk') || lowerMessage.includes('cakalang')) {
      return 'Kami memiliki berbagai produk olahan cakalang berkualitas seperti abon cakalang, dendeng cakalang, dan cakalang fufu. Silakan kunjungi halaman produk untuk melihat katalog lengkap!';
    } else if (lowerMessage.includes('harga') || lowerMessage.includes('price')) {
      return 'Untuk informasi harga terbaru, silakan hubungi tim sales kami di WhatsApp 62 811-488-068 atau email info@lyvianusaboga.com';
    } else if (lowerMessage.includes('pengiriman') || lowerMessage.includes('kirim')) {
      return 'Kami melayani pengiriman ke seluruh Indonesia dengan berbagai pilihan kurir. Estimasi pengiriman 1-3 hari kerja untuk area Jabodetabek.';
    } else if (lowerMessage.includes('kontak') || lowerMessage.includes('hubungi')) {
      return 'Anda bisa menghubungi kami melalui:\n📞 WhatsApp: 62 811-488-068\n📧 Email: info@lyvianusaboga.com\n🕒 Jam operasional: 08:00-17:00 WIB';
    } else {
      return 'Terima kasih atas pertanyaan Anda! Untuk informasi lebih detail, silakan hubungi customer service kami di WhatsApp 62 811-488-068. Tim kami siap membantu Anda!';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(currentMessage);
  };

  const handleQuickReply = (reply) => {
    sendMessage(reply.payload_text || reply.label);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const closeChatSession = async () => {
    if (sessionId) {
      try {
        await apiPatch(`/api/chat/sessions/${sessionId}/close`);
      } catch (error) {
        console.error('Error closing session:', error);
      }
    }
    setIsOpen(false);
    setSessionId(null);
    setSessionToken(null);
    setMessages([]);
  };

  return (
    <div className="fixed bottom-28 sm:bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MdSmartToy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">Lyvia Assistant</h3>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${sessionId ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
                  <span className="text-white/80 text-xs">
                    {sessionId ? 'Online' : 'Offline'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {unreadCount} pending
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={closeChatSession}
              className="text-white/80 hover:text-white transition-colors"
            >
              <MdClose className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('bot')}
              className={`flex-1 py-2 px-4 text-sm font-medium ${
                activeTab === 'bot'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Bot Chat
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-2 px-4 text-sm font-medium relative ${
                activeTab === 'pending'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Pending Chats
              {unreadCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'bot' ? (
            <>
              {/* Bot Chat Messages */}
              <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-gray-50">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-xs">
                      <div
                        className={`p-3 rounded-2xl text-sm ${
                          message.sender_type === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 shadow-sm border rounded-bl-md'
                        }`}
                      >
                        {message.message_text.split('\\n').map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${
                        message.sender_type === 'user' ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 shadow-sm border p-3 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {quickReplies.length > 0 && (
                <div className="px-4 pb-2">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.slice(0, 4).map((reply) => (
                      <button
                        key={reply.quick_reply_id}
                        onClick={() => handleQuickReply(reply)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                        disabled={loading}
                      >
                        {reply.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ketik pesan Anda..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !currentMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white p-2 rounded-xl transition-colors"
                  >
                    <MdSend className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Pending Chats Tab */
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              <div className="space-y-3">
                {pendingChats.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    Tidak ada chat yang pending
                  </div>
                ) : (
                  pendingChats.map((chat) => (
                    <div key={chat.chat_session_id} className="bg-white p-3 rounded-lg border shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {chat.user_name || 'Anonymous User'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Session: {chat.chat_session_id}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {formatTime(chat.last_message_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {chat.user_message || 'No message preview'}
                      </p>
                      <button 
                        onClick={() => window.open(`/admin/chatbot-management?session=${chat.chat_session_id}`, '_blank')}
                        className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors"
                      >
                        View Chat
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group"
      >
        {isOpen ? (
          <MdClose className="h-6 w-6 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform" />
        ) : (
          <div className="relative">
            <MdChat className="h-6 w-6 sm:h-8 sm:w-8 group-hover:scale-110 transition-transform" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{unreadCount}</span>
              </div>
            )}
          </div>
        )}
      </button>
    </div>
  );
};

export default AdminChatbot;