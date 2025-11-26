import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

// ==================== DUMMY DATA FOR REVIEWS ====================

const dummyReviews = [
  {
    review_id: '1',
    product_id: '1', // Abon Cakalang Premium
    user_id: '101',
    user_name: 'Sari Wijaya',
    user_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Abon cakalang terenak yang pernah saya coba!',
    comment: 'Sungguh luar biasa! Rasanya autentik banget, seperti buatan nenek di kampung. Teksturnya pas, tidak terlalu kering dan tidak terlalu lembab. Bumbu meresap sempurna dan aroma cakalangnya terasa sekali. Sudah beli 3 kali dan selalu puas. Cocok banget untuk lauk makan nasi atau olesan roti. Kemasan juga rapi dan higienis. Recommended!',
    images: [
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80'
    ],
    verified_purchase: true,
    helpful_count: 23,
    created_at: '2024-09-18T10:30:00Z',
    updated_at: '2024-09-18T10:30:00Z',
    status: 'APPROVED',
    response: {
      admin_name: 'Tim Lyvia Nusa Boga',
      message: 'Terima kasih atas review yang luar biasa! Kami senang produk abon cakalang kami bisa memenuhi ekspektasi Anda. Tetap jaga kesehatan dan selamat menikmati!',
      created_at: '2024-09-18T14:15:00Z'
    }
  },
  {
    review_id: '2',
    product_id: '1',
    user_id: '102',
    user_name: 'Budi Santoso',
    user_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Kualitas premium, harga terjangkau',
    comment: 'Sebagai orang Manado asli, saya sangat merekomendasikan abon cakalang ini. Cita rasanya sangat autentik dan mengingatkan saya pada kampung halaman. Proses pembuatannya terasa tradisional tapi tetap higienis. Anak-anak di rumah juga suka banget. Porsinya cukup banyak untuk satu kemasan.',
    images: [],
    verified_purchase: true,
    helpful_count: 18,
    created_at: '2024-09-15T16:45:00Z',
    updated_at: '2024-09-15T16:45:00Z',
    status: 'APPROVED',
    response: null
  },
  {
    review_id: '3',
    product_id: '2', // Dendeng Cakalang
    user_id: '103',
    user_name: 'Maya Putri',
    user_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    title: 'Dendeng cakalang yang enak, tapi agak asin',
    comment: 'Dendeng cakalangnya enak banget, teksturnya pas dan bumbu meresap. Cuma menurut saya agak terlalu asin, mungkin bisa dikurangi sedikit garamnya. Tapi overall tetap recommended karena rasanya autentik dan khas. Kemasan juga bagus dan tahan lama. Cocok buat oleh-oleh.',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=400&q=80'
    ],
    verified_purchase: true,
    helpful_count: 12,
    created_at: '2024-09-12T09:20:00Z',
    updated_at: '2024-09-12T09:20:00Z',
    status: 'APPROVED',
    response: {
      admin_name: 'Tim Lyvia Nusa Boga',
      message: 'Terima kasih atas feedbacknya yang berharga! Kami akan mempertimbangkan untuk menyesuaikan kadar garam pada batch produksi selanjutnya. Setiap masukan sangat berarti untuk perbaikan produk kami.',
      created_at: '2024-09-12T11:30:00Z'
    }
  },
  {
    review_id: '4',
    product_id: '3', // Cakalang Fufu
    user_id: '104',
    user_name: 'Andi Wijaya',
    user_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Cakalang fufu original taste!',
    comment: 'Ini dia cakalang fufu yang saya cari! Rasanya persis seperti yang dijual di pasar tradisional Manado. Proses pengasapannya terasa sekali, aromanya harum dan teksturnya pas. Bisa tahan lama juga kalau disimpan dengan benar. Sangat cocok untuk masakan berkuah atau dimakan langsung dengan nasi panas.',
    images: [
      'https://images.unsplash.com/photo-1530716222358-0a3577f5d8be?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1559181567-c3190ca9959b?auto=format&fit=crop&w=400&q=80'
    ],
    verified_purchase: true,
    helpful_count: 28,
    created_at: '2024-09-10T14:15:00Z',
    updated_at: '2024-09-10T14:15:00Z',
    status: 'APPROVED',
    response: null
  },
  {
    review_id: '5',
    product_id: '1',
    user_id: '105',
    user_name: 'Lina Sari',
    user_avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Perfect untuk sarapan keluarga',
    comment: 'Anak-anak di rumah suka banget sama abon cakalang ini. Biasanya saya pakai untuk isi roti atau campuran nasi goreng. Rasanya gurih dan tidak fishy smell sama sekali. Kemasan zip lock-nya juga praktis untuk menjaga kesegaran. Sudah langganan beli di sini.',
    images: [
      'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
    ],
    verified_purchase: true,
    helpful_count: 15,
    created_at: '2024-09-08T08:30:00Z',
    updated_at: '2024-09-08T08:30:00Z',
    status: 'APPROVED',
    response: {
      admin_name: 'Tim Lyvia Nusa Boga',
      message: 'Senang sekali mendengar keluarga Anda menyukai produk kami! Terima kasih sudah menjadi pelanggan setia. Kami akan terus menjaga kualitas untuk kepuasan keluarga Indonesia.',
      created_at: '2024-09-08T10:45:00Z'
    }
  },
  {
    review_id: '6',
    product_id: '4', // Sambal Rica Cakalang
    user_id: '106',
    user_name: 'Rudi Pratama',
    user_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 4,
    title: 'Pedasnya pas, tapi porsi kecil',
    comment: 'Sambal rica cakalangnya enak banget! Pedasnya pas di lidah, tidak terlalu pedas tapi tetap berasa. Cakalangnya juga banyak dan fresh. Cuma porsinya menurut saya agak kecil untuk harga segitu. Mungkin bisa ditambah sedikit isinya. Tapi tetap recommended karena rasanya autentik.',
    images: [],
    verified_purchase: true,
    helpful_count: 9,
    created_at: '2024-09-05T19:45:00Z',
    updated_at: '2024-09-05T19:45:00Z',
    status: 'APPROVED',
    response: null
  },
  {
    review_id: '7',
    product_id: '2',
    user_id: '107',
    user_name: 'Dewi Maharani',
    user_avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=150&q=80',
    rating: 5,
    title: 'Dendeng terbaik untuk oleh-oleh',
    comment: 'Kemarin beli untuk oleh-oleh ke Jakarta. Teman-teman pada suka banget! Kata mereka rasanya beda dari dendeng biasa, lebih gurih dan aromanya khas. Kemasannya juga menarik dan awet untuk dibawa jauh. Pasti bakal pesan lagi kalau ada acara.',
    images: [
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?auto=format&fit=crop&w=400&q=80'
    ],
    verified_purchase: true,
    helpful_count: 21,
    created_at: '2024-09-02T11:20:00Z',
    updated_at: '2024-09-02T11:20:00Z',
    status: 'APPROVED',
    response: {
      admin_name: 'Tim Lyvia Nusa Boga',
      message: 'Terima kasih telah memilih produk kami sebagai oleh-oleh! Kami senang bisa memperkenalkan cita rasa Sulawesi Utara ke seluruh Indonesia. Sampai jumpa di pembelian berikutnya!',
      created_at: '2024-09-02T15:30:00Z'
    }
  },
  {
    review_id: '8',
    product_id: '5', // Keripik Cakalang
    user_id: '108',
    user_name: 'Agus Firmansyah',
    user_avatar: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=150&q=80',
    rating: 3,
    title: 'Rasa unik tapi agak keras',
    comment: 'Keripik cakalangnya unik banget, belum pernah coba yang kayak gini. Rasanya gurih dan ada hint rasa ikan yang khas. Cuma teksturnya agak keras, mungkin terlalu crispy. Anak-anak saya agak susah ngunyahnya. Tapi untuk camilan dewasa sih oke.',
    images: [],
    verified_purchase: true,
    helpful_count: 7,
    created_at: '2024-08-30T16:10:00Z',
    updated_at: '2024-08-30T16:10:00Z',
    status: 'APPROVED',
    response: {
      admin_name: 'Tim Lyvia Nusa Boga',
      message: 'Terima kasih atas reviewnya! Kami akan evaluasi tekstur keripik untuk membuatnya lebih mudah dinikmati semua kalangan. Masukan Anda sangat berharga untuk pengembangan produk.',
      created_at: '2024-08-30T18:45:00Z'
    }
  }
];

// Review summary statistics
const dummyReviewStats = {
  total_reviews: 147,
  average_rating: 4.6,
  rating_distribution: {
    5: 89,   // 60.5%
    4: 35,   // 23.8%
    3: 15,   // 10.2%
    2: 6,    // 4.1%
    1: 2     // 1.4%
  },
  verified_purchases: 134,
  with_photos: 67,
  recent_reviews: 23, // last 30 days
  helpful_reviews: 45 // reviews with >10 helpful votes
};

// Sample review questions for products
const dummyReviewQuestions = [
  {
    question_id: '1',
    product_id: '1',
    user_name: 'Sri Wahyuni',
    question: 'Apakah abon cakalang ini bisa tahan berapa lama setelah dibuka kemasannya?',
    answer: 'Setelah dibuka, abon cakalang bisa tahan 1-2 minggu jika disimpan dalam wadah kedap udara di suhu ruang, atau 1 bulan jika disimpan di kulkas.',
    answered_by: 'Tim Lyvia Nusa Boga',
    created_at: '2024-09-19T10:15:00Z',
    answered_at: '2024-09-19T14:30:00Z'
  },
  {
    question_id: '2',
    product_id: '1',
    user_name: 'David Chen',
    question: 'Apakah produk ini mengandung MSG atau pengawet buatan?',
    answer: 'Produk abon cakalang kami tidak menggunakan MSG atau pengawet buatan. Kami hanya menggunakan garam alami dan rempah-rempah pilihan untuk pengawetan dan cita rasa.',
    answered_by: 'Tim Lyvia Nusa Boga',
    created_at: '2024-09-17T08:45:00Z',
    answered_at: '2024-09-17T11:20:00Z'
  },
  {
    question_id: '3',
    product_id: '3',
    user_name: 'Maria Situmorang',
    question: 'Bagaimana cara memasak cakalang fufu yang benar?',
    answer: 'Cakalang fufu bisa dimakan langsung atau dimasak. Untuk masakan berkuah, cukup potong-potong dan masukkan ke dalam kuah. Untuk tumisan, potong tipis dan tumis dengan bumbu sesuai selera.',
    answered_by: 'Tim Lyvia Nusa Boga',
    created_at: '2024-09-14T15:30:00Z',
    answered_at: '2024-09-14T16:45:00Z'
  }
];

// ==================== ASYNC THUNKS ====================

// MOCK MODE FLAG
const MOCK_MODE = true;
const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Fetch reviews for a product
export const fetchProductReviews = createAsyncThunk(
  'reviews/fetchProductReviews',
  async ({ productId, page = 1, limit = 10, sort = 'newest', rating = null }) => {
    if (MOCK_MODE) {
      await mockDelay();
      
      let filteredReviews = dummyReviews.filter(review => 
        review.product_id === productId && review.status === 'APPROVED'
      );
      
      // Filter by rating if specified
      if (rating) {
        filteredReviews = filteredReviews.filter(review => review.rating === parseInt(rating));
      }
      
      // Sort reviews
      switch (sort) {
        case 'newest':
          filteredReviews.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          break;
        case 'oldest':
          filteredReviews.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
          break;
        case 'highest':
          filteredReviews.sort((a, b) => b.rating - a.rating);
          break;
        case 'lowest':
          filteredReviews.sort((a, b) => a.rating - b.rating);
          break;
        case 'helpful':
          filteredReviews.sort((a, b) => b.helpful_count - a.helpful_count);
          break;
        default:
          break;
      }
      
      // Pagination
      const total = filteredReviews.length;
      const startIndex = (page - 1) * limit;
      const paginatedReviews = filteredReviews.slice(startIndex, startIndex + limit);
      
      return {
        success: true,
        data: {
          reviews: paginatedReviews,
          stats: dummyReviewStats,
          pagination: {
            current_page: page,
            per_page: limit,
            total: total,
            total_pages: Math.ceil(total / limit)
          }
        }
      };
    }
    
    const response = await api.get(`/reviews/product/${productId}`, {
      params: { page, limit, sort, rating }
    });
    return response.data;
  }
);

// Submit a new review
export const submitReview = createAsyncThunk(
  'reviews/submitReview',
  async (reviewData) => {
    if (MOCK_MODE) {
      await mockDelay(800);
      
      const newReview = {
        review_id: (dummyReviews.length + 1).toString(),
        ...reviewData,
        user_name: 'User Baru', // In real app, get from auth
        user_avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        verified_purchase: true,
        helpful_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'PENDING', // Reviews need approval
        response: null
      };
      
      dummyReviews.unshift(newReview);
      
      return {
        success: true,
        message: 'Review berhasil dikirim dan sedang menunggu persetujuan',
        data: newReview
      };
    }
    
    const response = await api.post('/reviews', reviewData);
    return response.data;
  }
);

// Mark review as helpful
export const markReviewHelpful = createAsyncThunk(
  'reviews/markHelpful',
  async ({ reviewId, helpful = true }) => {
    if (MOCK_MODE) {
      await mockDelay(300);
      
      const reviewIndex = dummyReviews.findIndex(r => r.review_id === reviewId);
      if (reviewIndex !== -1) {
        if (helpful) {
          dummyReviews[reviewIndex].helpful_count += 1;
        } else {
          dummyReviews[reviewIndex].helpful_count = Math.max(0, dummyReviews[reviewIndex].helpful_count - 1);
        }
      }
      
      return {
        success: true,
        data: {
          review_id: reviewId,
          helpful_count: dummyReviews[reviewIndex]?.helpful_count || 0,
          action: helpful ? 'helpful' : 'unhelpful'
        }
      };
    }
    
    const response = await api.post(`/reviews/${reviewId}/helpful`, { helpful });
    return response.data;
  }
);

// Fetch review questions
export const fetchReviewQuestions = createAsyncThunk(
  'reviews/fetchQuestions',
  async (productId) => {
    if (MOCK_MODE) {
      await mockDelay(300);
      
      const questions = dummyReviewQuestions.filter(q => q.product_id === productId);
      
      return {
        success: true,
        data: questions
      };
    }
    
    const response = await api.get(`/reviews/questions/${productId}`);
    return response.data;
  }
);

// Submit a review question
export const submitReviewQuestion = createAsyncThunk(
  'reviews/submitQuestion',
  async ({ productId, question }) => {
    if (MOCK_MODE) {
      await mockDelay(500);
      
      const newQuestion = {
        question_id: (dummyReviewQuestions.length + 1).toString(),
        product_id: productId,
        user_name: 'User Baru',
        question: question,
        answer: null,
        answered_by: null,
        created_at: new Date().toISOString(),
        answered_at: null
      };
      
      dummyReviewQuestions.unshift(newQuestion);
      
      return {
        success: true,
        message: 'Pertanyaan berhasil dikirim',
        data: newQuestion
      };
    }
    
    const response = await api.post('/reviews/questions', { productId, question });
    return response.data;
  }
);

// ==================== SLICE ====================

const reviewSlice = createSlice({
  name: 'reviews',
  initialState: {
    // Reviews data
    reviews: MOCK_MODE ? dummyReviews.filter(r => r.status === 'APPROVED').slice(0, 5) : [],
    reviewStats: MOCK_MODE ? dummyReviewStats : null,
    currentReview: null,
    
    // Questions data
    questions: MOCK_MODE ? dummyReviewQuestions.slice(0, 3) : [],
    
    // UI state
    currentPage: 1,
    totalPages: 0,
    totalReviews: 0,
    currentSort: 'newest',
    currentRatingFilter: null,
    
    // Loading states
    loading: false,
    submitting: false,
    questionsLoading: false,
    
    // Error states
    error: null,
    submitError: null,
    
    // Form state
    showReviewForm: false,
    showQuestionForm: false,
  },
  reducers: {
    setCurrentSort: (state, action) => {
      state.currentSort = action.payload;
    },
    setRatingFilter: (state, action) => {
      state.currentRatingFilter = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    toggleReviewForm: (state) => {
      state.showReviewForm = !state.showReviewForm;
    },
    toggleQuestionForm: (state) => {
      state.showQuestionForm = !state.showQuestionForm;
    },
    clearErrors: (state) => {
      state.error = null;
      state.submitError = null;
    },
    clearCurrentReview: (state) => {
      state.currentReview = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.data) {
          state.reviews = action.payload.data.reviews;
          state.reviewStats = action.payload.data.stats;
          state.totalReviews = action.payload.data.pagination?.total || 0;
          state.totalPages = action.payload.data.pagination?.total_pages || 0;
          state.currentPage = action.payload.data.pagination?.current_page || 1;
        }
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal memuat review';
      })
      
      // Submit review
      .addCase(submitReview.pending, (state) => {
        state.submitting = true;
        state.submitError = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.showReviewForm = false;
        // In real app, review would be pending approval
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitting = false;
        state.submitError = action.payload?.message || 'Gagal mengirim review';
      })
      
      // Mark helpful
      .addCase(markReviewHelpful.fulfilled, (state, action) => {
        if (action.payload?.data) {
          const reviewIndex = state.reviews.findIndex(r => r.review_id === action.payload.data.review_id);
          if (reviewIndex !== -1) {
            state.reviews[reviewIndex].helpful_count = action.payload.data.helpful_count;
          }
        }
      })
      
      // Fetch questions
      .addCase(fetchReviewQuestions.pending, (state) => {
        state.questionsLoading = true;
      })
      .addCase(fetchReviewQuestions.fulfilled, (state, action) => {
        state.questionsLoading = false;
        if (action.payload?.data) {
          state.questions = action.payload.data;
        }
      })
      .addCase(fetchReviewQuestions.rejected, (state, action) => {
        state.questionsLoading = false;
        state.error = action.payload?.message || 'Gagal memuat pertanyaan';
      })
      
      // Submit question
      .addCase(submitReviewQuestion.fulfilled, (state, action) => {
        state.showQuestionForm = false;
        if (action.payload?.data) {
          state.questions.unshift(action.payload.data);
        }
      });
  }
});

export const {
  setCurrentSort,
  setRatingFilter,
  setCurrentPage,
  toggleReviewForm,
  toggleQuestionForm,
  clearErrors,
  clearCurrentReview
} = reviewSlice.actions;

export default reviewSlice.reducer;