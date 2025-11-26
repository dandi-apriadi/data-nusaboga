import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ==================== DUMMY DATA FOR CHATBOT ====================

// Knowledge base dengan FAQ tentang produk cakalang
const dummyKnowledgeBase = [
  {
    id: '1',
    category: 'PRODUCT_INFO',
    keywords: ['abon cakalang', 'abon', 'ikan abon', 'harga abon'],
    question: 'Apa itu abon cakalang dan bagaimana rasanya?',
    answer: 'Abon cakalang adalah olahan ikan cakalang yang dihaluskan dan dibumbui dengan rempah-rempah khas Sulawesi Utara. Rasanya gurih, sedikit manis, dan memiliki aroma ikan yang khas tapi tidak amis. Teksturnya lembut dan cocok untuk lauk nasi atau isian roti.',
    confidence: 0.95
  },
  {
    id: '2',
    category: 'PRODUCT_INFO',
    keywords: ['dendeng cakalang', 'dendeng', 'ikan dendeng'],
    question: 'Apa beda dendeng cakalang dengan abon cakalang?',
    answer: 'Dendeng cakalang memiliki tekstur yang lebih kasar dan berserat dibanding abon. Dendeng diproses dengan cara dipotong tipis kemudian dikeringkan dan dibumbui, sedangkan abon dihaluskan hingga berbentuk serat halus. Rasa dendeng lebih intense dan tahan lama.',
    confidence: 0.92
  },
  {
    id: '3',
    category: 'PRODUCT_INFO',
    keywords: ['cakalang fufu', 'fufu', 'ikan asap', 'ikan smoky'],
    question: 'Bagaimana cara mengolah cakalang fufu?',
    answer: 'Cakalang fufu sudah siap konsumsi atau bisa diolah lebih lanjut. Bisa dipotong-potong untuk campuran sayur berkuah, ditumis dengan cabai dan bawang, atau dimakan langsung dengan nasi dan sambal. Cakalang fufu memiliki rasa smoky karena proses pengasapan.',
    confidence: 0.94
  },
  {
    id: '4',
    category: 'SHIPPING',
    keywords: ['ongkos kirim', 'ongkir', 'pengiriman', 'ekspedisi', 'kirim'],
    question: 'Berapa ongkos kirim ke luar kota?',
    answer: 'Ongkos kirim bervariasi tergantung kota tujuan. Untuk Pulau Jawa: Rp 15.000-30.000. Sumatera: Rp 20.000-35.000. Kalimantan: Rp 25.000-40.000. Papua: Rp 35.000-50.000. Kami bekerja sama dengan JNE, J&T, dan SiCepat untuk pengiriman.',
    confidence: 0.88
  },
  {
    id: '5',
    category: 'STORAGE',
    keywords: ['penyimpanan', 'tahan berapa lama', 'expired', 'kedaluwarsa', 'simpan'],
    question: 'Bagaimana cara menyimpan produk cakalang agar awet?',
    answer: 'Sebelum dibuka: simpan di tempat sejuk dan kering, tahan 6-12 bulan. Setelah dibuka: untuk abon dan dendeng, simpan dalam wadah kedap udara di kulkas, tahan 2-4 minggu. Cakalang fufu bisa disimpan di freezer hingga 3 bulan.',
    confidence: 0.91
  },
  {
    id: '6',
    category: 'INGREDIENTS',
    keywords: ['bahan', 'komposisi', 'msg', 'pengawet', 'halal'],
    question: 'Apakah produk mengandung MSG atau pengawet buatan?',
    answer: 'Semua produk kami tidak menggunakan MSG atau pengawet buatan. Kami hanya menggunakan bahan alami seperti garam, gula, dan rempah-rempah pilihan. Produk sudah tersertifikasi halal MUI dan aman untuk semua kalangan.',
    confidence: 0.96
  },
  {
    id: '7',
    category: 'PAYMENT',
    keywords: ['pembayaran', 'bayar', 'transfer', 'cod', 'cash on delivery'],
    question: 'Metode pembayaran apa saja yang diterima?',
    answer: 'Kami menerima pembayaran via transfer bank (BCA, Mandiri, BRI, BNI), e-wallet (OVO, GoPay, DANA), dan COD untuk area tertentu. Untuk pembelian di atas Rp 200.000 bisa menggunakan cicilan 0% dengan kartu kredit.',
    confidence: 0.87
  },
  {
    id: '8',
    category: 'NUTRITION',
    keywords: ['gizi', 'nutrisi', 'protein', 'kalori', 'kesehatan'],
    question: 'Berapa kandungan gizi dalam produk cakalang?',
    answer: 'Ikan cakalang kaya protein (25-30g per 100g), omega-3, vitamin B12, dan selenium. Abon cakalang: ~400 kal/100g. Dendeng: ~350 kal/100g. Rendah karbohidrat dan bebas gluten, cocok untuk diet protein tinggi.',
    confidence: 0.89
  },
  {
    id: '9',
    category: 'WHOLESALE',
    keywords: ['grosir', 'reseller', 'agen', 'dropship', 'bulk order'],
    question: 'Apakah ada harga khusus untuk pembelian grosir?',
    answer: 'Ya! Kami menyediakan harga khusus untuk reseller dan grosir. Minimal order 20 pack dapat diskon 10%, 50 pack diskon 15%, 100 pack diskon 20%. Hubungi customer service untuk detail paket reseller.',
    confidence: 0.93
  },
  {
    id: '10',
    category: 'RETURN_POLICY',
    keywords: ['retur', 'kembalikan', 'rusak', 'tidak puas', 'garansi'],
    question: 'Bagaimana kebijakan retur jika produk rusak atau tidak sesuai?',
    answer: 'Kami menjamin 100% kualitas produk. Jika produk rusak saat diterima atau tidak sesuai, bisa retur dalam 3 hari dengan foto bukti. Kami akan ganti atau refund penuh termasuk ongkir. Kepuasan pelanggan adalah prioritas utama.',
    confidence: 0.90
  }
];

// Conversation flows untuk berbagai skenario
const dummyConversationFlows = {
  greeting: [
    'Halo! Selamat datang di Lyvia Nusa Boga 😊',
    'Saya siap membantu Anda dengan informasi tentang produk olahan cakalang kami.',
    'Apa yang bisa saya bantu hari ini?'
  ],
  product_inquiry: [
    'Kami memiliki berbagai produk olahan cakalang berkualitas:',
    '🐟 Abon Cakalang Premium - Rp 45.000',
    '🥩 Dendeng Cakalang Original - Rp 55.000', 
    '🔥 Cakalang Fufu Asap - Rp 65.000',
    '🌶️ Sambal Rica Cakalang - Rp 35.000',
    '🍟 Keripik Cakalang - Rp 25.000',
    'Produk mana yang ingin Anda ketahui lebih detail?'
  ],
  order_process: [
    'Untuk memesan produk kami:',
    '1️⃣ Pilih produk yang diinginkan',
    '2️⃣ Tambahkan ke keranjang',
    '3️⃣ Isi data pengiriman',
    '4️⃣ Pilih metode pembayaran',
    '5️⃣ Konfirmasi pesanan',
    'Apakah ada yang ingin ditanyakan tentang proses pemesanan?'
  ],
  shipping_info: [
    'Informasi pengiriman:',
    '📦 Gratis ongkir untuk pembelian di atas Rp 150.000',
    '🚛 Estimasi pengiriman 2-5 hari kerja',
    '📍 Melayani seluruh Indonesia',
    '📞 Nomor resi akan dikirim via WhatsApp',
    'Ke kota mana pesanan akan dikirim?'
  ],
  not_understood: [
    'Maaf, saya kurang memahami pertanyaan Anda 🤔',
    'Mungkin Anda bisa coba menanyakan:',
    '• Informasi produk cakalang',
    '• Cara pemesanan',
    '• Ongkos kirim',
    '• Metode pembayaran',
    '• Kebijakan retur',
    'Atau ketik "bantuan" untuk melihat daftar topik yang bisa saya jawab.'
  ]
};

// Sample conversation history
const dummyConversations = [
  {
    conversation_id: '1',
    user_id: '101',
    messages: [
      {
        message_id: '1',
        sender: 'user',
        content: 'Halo, saya mau tanya tentang abon cakalang',
        timestamp: '2024-09-20T10:00:00Z',
        type: 'text'
      },
      {
        message_id: '2',
        sender: 'bot',
        content: 'Halo! Selamat datang di Lyvia Nusa Boga 😊\n\nAbon cakalang adalah produk unggulan kami! Terbuat dari ikan cakalang fresh yang diolah dengan bumbu rempah tradisional Sulawesi Utara. Rasanya gurih, tidak amis, dan sangat cocok untuk lauk atau isian roti.\n\nHarga: Rp 45.000 per kemasan 200g\nTahan: 6 bulan sebelum dibuka, 2 minggu setelah dibuka\n\nApakah ada yang ingin ditanyakan lebih lanjut tentang abon cakalang?',
        timestamp: '2024-09-20T10:00:15Z',
        type: 'text',
        quick_replies: ['Cara pesan', 'Ongkos kirim', 'Bahan-bahan']
      },
      {
        message_id: '3',
        sender: 'user',
        content: 'Berapa ongkos kirim ke Jakarta?',
        timestamp: '2024-09-20T10:02:00Z',
        type: 'text'
      },
      {
        message_id: '4',
        sender: 'bot',
        content: 'Ongkos kirim ke Jakarta:\n\n📦 JNE REG: Rp 15.000 (3-4 hari)\n🚀 JNE YES: Rp 25.000 (1-2 hari)\n📮 J&T REG: Rp 12.000 (3-5 hari)\n⚡ SiCepat HALU: Rp 18.000 (1-2 hari)\n\n🎉 GRATIS ONGKIR untuk pembelian minimal Rp 150.000!\n\nMau langsung pesan atau ada pertanyaan lain?',
        timestamp: '2024-09-20T10:02:20Z',
        type: 'text',
        quick_replies: ['Pesan sekarang', 'Lihat produk lain', 'Metode bayar']
      }
    ],
    status: 'active',
    created_at: '2024-09-20T10:00:00Z',
    updated_at: '2024-09-20T10:02:20Z'
  },
  {
    conversation_id: '2',
    user_id: '102',
    messages: [
      {
        message_id: '5',
        sender: 'user',
        content: 'Produk yang paling laris apa?',
        timestamp: '2024-09-20T14:30:00Z',
        type: 'text'
      },
      {
        message_id: '6',
        sender: 'bot',
        content: 'Produk paling laris kami:\n\n🥇 Abon Cakalang Premium (⭐⭐⭐⭐⭐)\n• Paling praktis dan disukai keluarga\n• Cocok untuk segala usia\n\n🥈 Cakalang Fufu Asap (⭐⭐⭐⭐⭐)\n• Rasa smoky autentik\n• Favorit pecinta masakan tradisional\n\n🥉 Dendeng Cakalang Original (⭐⭐⭐⭐)\n• Tahan lama dan praktis dibawa\n• Pilihan traveler dan perantau\n\nMau coba yang mana dulu? 😊',
        timestamp: '2024-09-20T14:30:25Z',
        type: 'text',
        quick_replies: ['Abon Cakalang', 'Cakalang Fufu', 'Dendeng Cakalang']
      }
    ],
    status: 'active',
    created_at: '2024-09-20T14:30:00Z',
    updated_at: '2024-09-20T14:30:25Z'
  }
];

// Quick reply templates
const dummyQuickReplies = {
  general: ['Info produk', 'Cara pesan', 'Ongkir', 'Metode bayar', 'Bantuan'],
  products: ['Abon Cakalang', 'Dendeng Cakalang', 'Cakalang Fufu', 'Sambal Rica', 'Keripik'],
  ordering: ['Tambah keranjang', 'Lihat keranjang', 'Checkout', 'Lacak pesanan'],
  support: ['Hubungi CS', 'FAQ', 'Komplain', 'Saran', 'Rating']
};

// Bot personality settings
const botPersonality = {
  name: 'Kaka Bot',
  greeting: 'Halo! Saya Kaka Bot, asisten virtual Lyvia Nusa Boga 😊',
  personality_traits: [
    'ramah dan helpful',
    'menggunakan emoji secukupnya',
    'fokus pada produk cakalang',
    'memberikan informasi akurat',
    'responsif terhadap kebutuhan customer'
  ],
  fallback_responses: [
    'Maaf, saya belum paham pertanyaan Anda. Bisa dijelaskan lebih detail? 🤔',
    'Hmm, sepertinya pertanyaan Anda di luar pengetahuan saya. Coba hubungi customer service kami ya! 📞',
    'Saya masih belajar untuk menjawab pertanyaan seperti itu. Ada yang bisa saya bantu lainnya? 😅'
  ]
};

// Analytics data for chatbot
const dummyChatbotAnalytics = {
  total_conversations: 1247,
  active_conversations: 23,
  resolved_conversations: 1186,
  average_response_time: '2.3s',
  satisfaction_rate: 4.2,
  top_questions: [
    { question: 'Ongkos kirim', count: 312 },
    { question: 'Info produk abon', count: 267 },
    { question: 'Cara pemesanan', count: 198 },
    { question: 'Metode pembayaran', count: 156 },
    { question: 'Kebijakan retur', count: 134 }
  ],
  peak_hours: [
    { hour: '09:00-10:00', conversations: 89 },
    { hour: '13:00-14:00', conversations: 76 },
    { hour: '19:00-20:00', conversations: 102 },
    { hour: '20:00-21:00', conversations: 95 }
  ]
};

// ==================== ASYNC THUNKS ====================

// MOCK MODE FLAG
const MOCK_MODE = true;
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Send message to chatbot
export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async ({ conversationId, message, userId }) => {
    if (MOCK_MODE) {
      await mockDelay(800); // Simulate thinking time
      
      // Simple keyword matching for demo
      const lowerMessage = message.toLowerCase();
      let botResponse = '';
      let quickReplies = [];
      
      // Greeting detection
      if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hello')) {
        botResponse = dummyConversationFlows.greeting.join('\n\n');
        quickReplies = dummyQuickReplies.general;
      }
      
      // Product info
      else if (lowerMessage.includes('abon') || lowerMessage.includes('produk')) {
        const productInfo = dummyKnowledgeBase.find(kb => 
          kb.keywords.some(keyword => lowerMessage.includes(keyword))
        );
        botResponse = productInfo ? productInfo.answer : dummyConversationFlows.product_inquiry.join('\n');
        quickReplies = dummyQuickReplies.products;
      }
      
      // Shipping info
      else if (lowerMessage.includes('ongkir') || lowerMessage.includes('kirim') || lowerMessage.includes('pengiriman')) {
        const shippingInfo = dummyKnowledgeBase.find(kb => kb.category === 'SHIPPING');
        botResponse = shippingInfo ? shippingInfo.answer : dummyConversationFlows.shipping_info.join('\n');
        quickReplies = ['Jakarta', 'Surabaya', 'Medan', 'Makassar', 'Kota lain'];
      }
      
      // Payment info
      else if (lowerMessage.includes('bayar') || lowerMessage.includes('pembayaran')) {
        const paymentInfo = dummyKnowledgeBase.find(kb => kb.category === 'PAYMENT');
        botResponse = paymentInfo ? paymentInfo.answer : 'Informasi pembayaran tidak ditemukan.';
        quickReplies = ['Transfer bank', 'E-wallet', 'COD', 'Kartu kredit'];
      }
      
      // Order process
      else if (lowerMessage.includes('pesan') || lowerMessage.includes('beli') || lowerMessage.includes('order')) {
        botResponse = dummyConversationFlows.order_process.join('\n');
        quickReplies = dummyQuickReplies.ordering;
      }
      
      // Default fallback
      else {
        botResponse = dummyConversationFlows.not_understood.join('\n');
        quickReplies = dummyQuickReplies.general;
      }
      
      // Create response message
      const responseMessage = {
        message_id: Date.now().toString(),
        sender: 'bot',
        content: botResponse,
        timestamp: new Date().toISOString(),
        type: 'text',
        quick_replies: quickReplies
      };
      
      return {
        success: true,
        data: {
          user_message: {
            message_id: (Date.now() - 1000).toString(),
            sender: 'user',
            content: message,
            timestamp: new Date(Date.now() - 1000).toISOString(),
            type: 'text'
          },
          bot_response: responseMessage,
          conversation_id: conversationId || Date.now().toString()
        }
      };
    }
    
    const response = await api.post('/chatbot/message', {
      conversationId,
      message,
      userId
    });
    return response.data;
  }
);

// Get conversation history
export const fetchConversationHistory = createAsyncThunk(
  'chatbot/fetchHistory',
  async ({ conversationId, userId }) => {
    if (MOCK_MODE) {
      await mockDelay(300);
      
      const conversation = dummyConversations.find(conv => 
        conv.conversation_id === conversationId || conv.user_id === userId
      );
      
      return {
        success: true,
        data: conversation || {
          conversation_id: Date.now().toString(),
          user_id: userId,
          messages: [],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };
    }
    
    const response = await api.get(`/chatbot/conversations/${conversationId}`);
    return response.data;
  }
);

// Search knowledge base
export const searchKnowledgeBase = createAsyncThunk(
  'chatbot/searchKnowledge',
  async (query) => {
    if (MOCK_MODE) {
      await mockDelay(200);
      
      const results = dummyKnowledgeBase.filter(kb =>
        kb.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase())) ||
        kb.question.toLowerCase().includes(query.toLowerCase()) ||
        kb.answer.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      
      return {
        success: true,
        data: results
      };
    }
    
    const response = await api.get(`/chatbot/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }
);

// Get chatbot analytics
export const fetchChatbotAnalytics = createAsyncThunk(
  'chatbot/fetchAnalytics',
  async () => {
    if (MOCK_MODE) {
      await mockDelay(400);
      
      return {
        success: true,
        data: dummyChatbotAnalytics
      };
    }
    
    const response = await api.get('/chatbot/analytics');
    return response.data;
  }
);

// ==================== SLICE ====================

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState: {
    // Conversation data
    currentConversation: MOCK_MODE ? dummyConversations[0] : null,
    conversations: MOCK_MODE ? dummyConversations : [],
    messages: MOCK_MODE ? dummyConversations[0]?.messages || [] : [],
    
    // Knowledge base
    knowledgeBase: MOCK_MODE ? dummyKnowledgeBase.slice(0, 5) : [],
    searchResults: [],
    quickReplies: MOCK_MODE ? dummyQuickReplies.general : [],
    
    // Analytics
    analytics: MOCK_MODE ? dummyChatbotAnalytics : null,
    
    // UI state
    chatOpen: false,
    typing: false,
    connected: true,
    
    // Loading states
    loading: false,
    sending: false,
    searchLoading: false,
    
    // Error states
    error: null,
    connectionError: null,
    
    // Bot settings
    botPersonality: MOCK_MODE ? botPersonality : null,
  },
  reducers: {
    toggleChat: (state) => {
      state.chatOpen = !state.chatOpen;
    },
    closeChat: (state) => {
      state.chatOpen = false;
    },
    openChat: (state) => {
      state.chatOpen = true;
    },
    setTyping: (state, action) => {
      state.typing = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversation = null;
    },
    setQuickReplies: (state, action) => {
      state.quickReplies = action.payload;
    },
    clearErrors: (state) => {
      state.error = null;
      state.connectionError = null;
    },
    setConnectionStatus: (state, action) => {
      state.connected = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
        state.typing = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        state.typing = false;
        
        if (action.payload?.data) {
          // Add user message
          state.messages.push(action.payload.data.user_message);
          
          // Add bot response after a small delay
          setTimeout(() => {
            state.messages.push(action.payload.data.bot_response);
            state.quickReplies = action.payload.data.bot_response.quick_replies || [];
          }, 500);
          
          // Update conversation ID
          if (action.payload.data.conversation_id) {
            if (state.currentConversation) {
              state.currentConversation.conversation_id = action.payload.data.conversation_id;
            } else {
              state.currentConversation = {
                conversation_id: action.payload.data.conversation_id,
                messages: state.messages,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.typing = false;
        state.error = action.payload?.message || 'Gagal mengirim pesan';
      })
      
      // Fetch conversation history
      .addCase(fetchConversationHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversationHistory.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.currentConversation = action.payload.data;
          state.messages = action.payload.data.messages || [];
        }
      })
      .addCase(fetchConversationHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal memuat riwayat chat';
      })
      
      // Search knowledge base
      .addCase(searchKnowledgeBase.pending, (state) => {
        state.searchLoading = true;
      })
      .addCase(searchKnowledgeBase.fulfilled, (state, action) => {
        state.searchLoading = false;
        if (action.payload?.data) {
          state.searchResults = action.payload.data;
        }
      })
      .addCase(searchKnowledgeBase.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload?.message || 'Gagal mencari di knowledge base';
      })
      
      // Fetch analytics
      .addCase(fetchChatbotAnalytics.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.analytics = action.payload.data;
        }
      });
  }
});

export const {
  toggleChat,
  closeChat,
  openChat,
  setTyping,
  clearMessages,
  setQuickReplies,
  clearErrors,
  setConnectionStatus,
  addMessage
} = chatbotSlice.actions;

export default chatbotSlice.reducer;