import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  XMarkIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BoltIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { 
  sendMessage,
  fetchConversationHistory,
  toggleChat,
  closeChat,
  setTyping,
  clearMessages
} from '../../store/slices/chatbotSlice';
import ChatMessage from './ChatMessage';
import ChatTypingIndicator from './ChatTypingIndicator';
import ChatQuickReplies from './ChatQuickReplies';

const ChatbotWidget = ({ position = 'bottom-right' }) => {
  const dispatch = useDispatch();
  const {
    chatOpen,
    messages,
    currentConversation,
    quickReplies,
    sending,
    typing,
    connected,
    error,
    botPersonality
  } = useSelector(state => state.chatbot);

  const [messageText, setMessageText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // Focus input when chat opens
  useEffect(() => {
    if (chatOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [chatOpen, isMinimized]);

  // Load conversation history when chat opens
  useEffect(() => {
    if (chatOpen && !currentConversation) {
      dispatch(fetchConversationHistory({ userId: 'current_user' }));
    }
  }, [chatOpen, currentConversation, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message = messageText.trim()) => {
    if (!message || sending) return;

    const conversationId = currentConversation?.conversation_id;
    
    setMessageText('');
    
    try {
      await dispatch(sendMessage({
        conversationId,
        message,
        userId: 'current_user'
      }));
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  // Chat button when closed
  if (!chatOpen) {
    return (
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <button
          onClick={() => dispatch(toggleChat())}
          className="group relative w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
        >
          <BoltIcon className="w-6 h-6" />
          
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          
          {/* Tooltip */}
          <div className="absolute right-full mr-3 px-3 py-2 bg-slate-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ada yang bisa dibantu?
            <div className="absolute top-1/2 left-full w-0 h-0 border-l-4 border-l-slate-900 border-y-4 border-y-transparent -translate-y-1/2"></div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden" style={{ width: '380px', height: isMinimized ? '60px' : '500px' }}>
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <BoltIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium">
                {botPersonality?.name || 'Kaka Bot'}
              </h3>
              <div className="flex items-center space-x-1 text-sm text-indigo-100">
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                <span>{connected ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-indigo-100 hover:text-white transition-colors"
            >
              {isMinimized ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => dispatch(closeChat())}
              className="text-indigo-100 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat content - only show when not minimized */}
        {!isMinimized && (
          <>
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: '360px' }}>
              {/* Welcome message */}
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BoltIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h4 className="font-medium text-slate-900 mb-2">
                    Selamat datang! 👋
                  </h4>
                  <p className="text-slate-600 text-sm mb-4">
                    {botPersonality?.greeting || 'Saya siap membantu Anda dengan informasi produk cakalang kami.'}
                  </p>
                  
                  {/* Quick start options */}
                  <div className="space-y-2">
                    <button
                      onClick={() => handleQuickReply('Info produk cakalang')}
                      className="block w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span className="font-medium">🐟 Info Produk</span>
                      <p className="text-sm text-slate-600">Lihat semua produk cakalang kami</p>
                    </button>
                    <button
                      onClick={() => handleQuickReply('Cara pemesanan')}
                      className="block w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span className="font-medium">🛒 Cara Pesan</span>
                      <p className="text-sm text-slate-600">Panduan lengkap pemesanan</p>
                    </button>
                    <button
                      onClick={() => handleQuickReply('Ongkos kirim')}
                      className="block w-full text-left p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <span className="font-medium">📦 Ongkos Kirim</span>
                      <p className="text-sm text-slate-600">Cek biaya pengiriman ke kota Anda</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message, index) => (
                <ChatMessage 
                  key={message.message_id || index} 
                  message={message}
                  isBot={message.sender === 'bot'}
                />
              ))}

              {/* Typing indicator */}
              {typing && <ChatTypingIndicator />}

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            {quickReplies.length > 0 && !typing && (
              <ChatQuickReplies 
                replies={quickReplies}
                onReplyClick={handleQuickReply}
              />
            )}

            {/* Input area */}
            <div className="border-t border-slate-200 p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ketik pesan Anda..."
                    rows={1}
                    disabled={sending || !connected}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ maxHeight: '80px' }}
                  />
                </div>
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!messageText.trim() || sending || !connected}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </div>
              
              {/* Connection status */}
              {!connected && (
                <p className="text-xs text-red-600 mt-2">
                  Koneksi terputus. Mencoba menghubungkan kembali...
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatbotWidget;