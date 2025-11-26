import { useState, useEffect } from 'react';
import { apiGet } from '../utils/apiClient';

export const useChatNotifications = () => {
  const [pendingChats, setPendingChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPendingChats = async () => {
    try {
      setIsLoading(true);
      // Get escalated chats (chats that need human intervention)
      const escalations = await apiGet('/api/chat-admin/escalations?status=pending');
      setPendingChats(escalations);
      setUnreadCount(escalations.length);
    } catch (error) {
      console.error('Error fetching pending chats:', error);
      setPendingChats([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for new chats every 30 seconds
  useEffect(() => {
    fetchPendingChats();
    
    const interval = setInterval(fetchPendingChats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const markChatAsRead = (chatId) => {
    setPendingChats(prev => prev.filter(chat => chat.chat_session_id !== chatId));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  return {
    pendingChats,
    unreadCount,
    isLoading,
    refreshChats: fetchPendingChats,
    markChatAsRead,
  };
};

export default useChatNotifications;