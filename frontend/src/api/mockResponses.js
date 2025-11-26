// ==================== MOCK API RESPONSES FOR REVIEWS ====================

/**
 * Mock API responses untuk sistem review produk
 * File ini berisi sample responses yang akan dikembalikan oleh backend API
 * Gunakan untuk testing dan development sebelum implementasi backend sesungguhnya
 */

// GET /api/v1/reviews/product/{productId}
export const mockGetProductReviews = {
  success: true,
  message: 'Review berhasil diambil',
  data: {
    reviews: [
      {
        review_id: '1',
        product_id: '1',
        user_id: '101',
        user_name: 'Sari Wijaya',
        user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?auto=format&fit=crop&w=150&q=80',
        rating: 5,
        title: 'Abon cakalang terenak yang pernah saya coba!',
        comment: 'Sungguh luar biasa! Rasanya autentik banget, seperti buatan nenek di kampung. Teksturnya pas, tidak terlalu kering dan tidak terlalu lembab.',
        images: [
          'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80'
        ],
        verified_purchase: true,
        helpful_count: 23,
        user_found_helpful: false,
        created_at: '2024-09-18T10:30:00Z',
        updated_at: '2024-09-18T10:30:00Z',
        status: 'APPROVED',
        response: {
          admin_name: 'Tim Lyvia Nusa Boga',
          message: 'Terima kasih atas review yang luar biasa! Kami senang produk abon cakalang kami bisa memenuhi ekspektasi Anda.',
          created_at: '2024-09-18T14:15:00Z'
        }
      }
    ],
    stats: {
      total_reviews: 147,
      average_rating: 4.6,
      rating_distribution: {
        5: 89,
        4: 35,
        3: 15,
        2: 6,
        1: 2
      },
      verified_purchases: 134,
      with_photos: 67
    },
    pagination: {
      current_page: 1,
      per_page: 10,
      total: 147,
      total_pages: 15,
      has_next: true,
      has_prev: false
    }
  }
};

// POST /api/v1/reviews
export const mockSubmitReview = {
  success: true,
  message: 'Review berhasil dikirim dan sedang menunggu persetujuan',
  data: {
    review_id: '148',
    status: 'PENDING',
    estimated_approval: '1-2 hari kerja'
  }
};

// POST /api/v1/reviews/{reviewId}/helpful
export const mockMarkReviewHelpful = {
  success: true,
  message: 'Terima kasih atas feedback Anda',
  data: {
    review_id: '1',
    helpful_count: 24,
    user_action: 'helpful'
  }
};

// GET /api/v1/reviews/questions/{productId}
export const mockGetReviewQuestions = {
  success: true,
  message: 'Pertanyaan berhasil diambil',
  data: [
    {
      question_id: '1',
      product_id: '1',
      user_name: 'Sri Wahyuni',
      question: 'Apakah abon cakalang ini bisa tahan berapa lama setelah dibuka kemasannya?',
      answer: 'Setelah dibuka, abon cakalang bisa tahan 1-2 minggu jika disimpan dalam wadah kedap udara di suhu ruang.',
      answered_by: 'Tim Lyvia Nusa Boga',
      created_at: '2024-09-19T10:15:00Z',
      answered_at: '2024-09-19T14:30:00Z',
      helpful_count: 12
    }
  ]
};

// POST /api/v1/reviews/questions
export const mockSubmitReviewQuestion = {
  success: true,
  message: 'Pertanyaan berhasil dikirim',
  data: {
    question_id: '4',
    status: 'PENDING',
    estimated_answer: 'Akan dijawab dalam 1x24 jam'
  }
};

// ==================== MOCK API RESPONSES FOR CHATBOT ====================

/**
 * Mock API responses untuk sistem chatbot
 * Menyediakan conversation handling, knowledge base search, dan analytics
 */

// POST /api/v1/chatbot/message
export const mockSendChatMessage = {
  success: true,
  message: 'Pesan berhasil diproses',
  data: {
    message_id: '12345',
    conversation_id: 'conv_67890',
    bot_response: {
      content: 'Terima kasih atas pertanyaan Anda! Abon cakalang kami terbuat dari ikan cakalang fresh dengan bumbu rempah tradisional.',
      type: 'text',
      quick_replies: ['Info harga', 'Cara pesan', 'Ongkos kirim'],
      confidence: 0.95,
      response_time: '0.8s'
    },
    conversation_context: {
      intent: 'product_inquiry',
      entities: ['abon_cakalang'],
      sentiment: 'positive'
    }
  }
};

// GET /api/v1/chatbot/conversations/{conversationId}
export const mockGetConversationHistory = {
  success: true,
  message: 'Riwayat percakapan berhasil diambil',
  data: {
    conversation_id: 'conv_67890',
    user_id: '101',
    status: 'active',
    created_at: '2024-09-20T10:00:00Z',
    updated_at: '2024-09-20T10:15:00Z',
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
        content: 'Halo! Senang bisa membantu Anda. Abon cakalang adalah produk unggulan kami dengan rasa autentik.',
        timestamp: '2024-09-20T10:00:15Z',
        type: 'text',
        quick_replies: ['Info harga', 'Cara pesan', 'Lihat gambar']
      }
    ],
    summary: {
      total_messages: 8,
      user_satisfaction: 4.5,
      resolved: false,
      primary_intent: 'product_inquiry'
    }
  }
};

// GET /api/v1/chatbot/search
export const mockSearchKnowledgeBase = {
  success: true,
  message: 'Pencarian knowledge base berhasil',
  data: [
    {
      id: '1',
      category: 'PRODUCT_INFO',
      title: 'Informasi Abon Cakalang',
      content: 'Abon cakalang adalah olahan ikan cakalang yang dihaluskan dan dibumbui dengan rempah-rempah khas.',
      confidence: 0.95,
      keywords: ['abon', 'cakalang', 'produk'],
      last_updated: '2024-09-15T00:00:00Z'
    },
    {
      id: '2',
      category: 'SHIPPING',
      title: 'Informasi Pengiriman',
      content: 'Kami melayani pengiriman ke seluruh Indonesia dengan berbagai pilihan ekspedisi.',
      confidence: 0.88,
      keywords: ['ongkir', 'kirim', 'ekspedisi'],
      last_updated: '2024-09-10T00:00:00Z'
    }
  ],
  meta: {
    query: 'abon cakalang',
    total_results: 2,
    search_time: '0.15s'
  }
};

// GET /api/v1/chatbot/analytics
export const mockGetChatbotAnalytics = {
  success: true,
  message: 'Analytics chatbot berhasil diambil',
  data: {
    overview: {
      total_conversations: 1247,
      active_conversations: 23,
      resolved_conversations: 1186,
      average_response_time: '2.3s',
      user_satisfaction: 4.2
    },
    performance: {
      intent_recognition_accuracy: 89.5,
      successful_resolutions: 95.2,
      escalation_rate: 4.8,
      average_conversation_length: 5.4
    },
    popular_topics: [
      {
        topic: 'Product Information',
        count: 456,
        percentage: 36.6,
        avg_satisfaction: 4.5
      },
      {
        topic: 'Shipping & Delivery',
        count: 312,
        percentage: 25.0,
        avg_satisfaction: 4.1
      },
      {
        topic: 'Payment Methods',
        count: 198,
        percentage: 15.9,
        avg_satisfaction: 4.3
      }
    ],
    peak_hours: [
      { hour: '09:00', conversations: 89 },
      { hour: '13:00', conversations: 76 },
      { hour: '19:00', conversations: 102 },
      { hour: '20:00', conversations: 95 }
    ],
    user_feedback: {
      positive: 78.5,
      neutral: 16.2,
      negative: 5.3
    }
  }
};

// POST /api/v1/chatbot/feedback
export const mockSubmitChatbotFeedback = {
  success: true,
  message: 'Feedback berhasil dikirim',
  data: {
    feedback_id: 'fb_12345',
    conversation_id: 'conv_67890',
    rating: 5,
    comment: 'Sangat membantu!',
    processed_at: '2024-09-20T10:30:00Z'
  }
};

// GET /api/v1/chatbot/suggestions
export const mockGetChatSuggestions = {
  success: true,
  message: 'Saran percakapan berhasil diambil',
  data: {
    quick_questions: [
      'Berapa harga abon cakalang?',
      'Bagaimana cara pemesanan?',
      'Apakah ada diskon untuk pembelian banyak?',
      'Berapa lama pengiriman ke Jakarta?'
    ],
    popular_products: [
      {
        name: 'Abon Cakalang Premium',
        quick_info: 'Rp 45.000 - Ready stock'
      },
      {
        name: 'Dendeng Cakalang Original',
        quick_info: 'Rp 55.000 - Best seller'
      }
    ],
    help_topics: [
      'Cara pemesanan',
      'Metode pembayaran',
      'Kebijakan retur',
      'Informasi pengiriman'
    ]
  }
};

// ==================== ERROR RESPONSES ====================

export const mockErrorResponses = {
  // 400 Bad Request
  badRequest: {
    success: false,
    message: 'Data yang dikirim tidak valid',
    errors: {
      rating: ['Rating harus antara 1-5'],
      comment: ['Komentar minimal 10 karakter']
    },
    code: 'VALIDATION_ERROR'
  },
  
  // 401 Unauthorized
  unauthorized: {
    success: false,
    message: 'Anda harus login untuk memberikan review',
    code: 'UNAUTHORIZED'
  },
  
  // 403 Forbidden
  forbidden: {
    success: false,
    message: 'Anda hanya bisa memberikan review setelah membeli produk',
    code: 'FORBIDDEN'
  },
  
  // 404 Not Found
  notFound: {
    success: false,
    message: 'Produk tidak ditemukan',
    code: 'NOT_FOUND'
  },
  
  // 429 Rate Limit
  rateLimited: {
    success: false,
    message: 'Terlalu banyak percakapan. Coba lagi dalam beberapa menit.',
    code: 'RATE_LIMITED',
    retry_after: 300
  },
  
  // 500 Internal Server Error
  serverError: {
    success: false,
    message: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
    code: 'SERVER_ERROR'
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Simulasi delay untuk mock API responses
 */
export const simulateApiDelay = (min = 300, max = 1000) => {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Simulasi error responses berdasarkan kondisi tertentu
 */
export const simulateApiError = (errorType = 'serverError') => {
  return Promise.reject({
    response: {
      data: mockErrorResponses[errorType]
    }
  });
};

/**
 * Mock pagination helper
 */
export const mockPagination = (data, page = 1, limit = 10) => {
  const total = data.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      current_page: page,
      per_page: limit,
      total: total,
      total_pages: Math.ceil(total / limit),
      has_next: endIndex < total,
      has_prev: page > 1
    }
  };
};

/**
 * Mock search helper
 */
export const mockSearch = (data, query, searchFields = ['title', 'content']) => {
  if (!query) return data;
  
  const lowercaseQuery = query.toLowerCase();
  return data.filter(item => 
    searchFields.some(field => 
      item[field] && item[field].toLowerCase().includes(lowercaseQuery)
    )
  );
};

// Export all mock responses
export default {
  reviews: {
    getProductReviews: mockGetProductReviews,
    submitReview: mockSubmitReview,
    markHelpful: mockMarkReviewHelpful,
    getQuestions: mockGetReviewQuestions,
    submitQuestion: mockSubmitReviewQuestion
  },
  chatbot: {
    sendMessage: mockSendChatMessage,
    getHistory: mockGetConversationHistory,
    searchKnowledge: mockSearchKnowledgeBase,
    getAnalytics: mockGetChatbotAnalytics,
    submitFeedback: mockSubmitChatbotFeedback,
    getSuggestions: mockGetChatSuggestions
  },
  errors: mockErrorResponses,
  utils: {
    simulateApiDelay,
    simulateApiError,
    mockPagination,
    mockSearch
  }
};