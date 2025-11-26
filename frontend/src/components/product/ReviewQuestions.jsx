import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  QuestionMarkCircleIcon,
  PlusIcon,
  HandThumbUpIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { 
  fetchReviewQuestions, 
  submitReviewQuestion,
  toggleQuestionForm,
  clearErrors
} from '../../store/slices/reviewSlice';

const ReviewQuestions = ({ productId, productName }) => {
  const dispatch = useDispatch();
  const {
    questions,
    questionsLoading,
    showQuestionForm,
    error
  } = useSelector(state => state.reviews);

  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchReviewQuestions(productId));
  }, [dispatch, productId]);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (questionText.trim().length < 10) {
      alert('Pertanyaan minimal 10 karakter');
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(submitReviewQuestion({ 
        productId, 
        question: questionText.trim() 
      }));
      
      setQuestionText('');
      dispatch(toggleQuestionForm());
      
      // Refresh questions
      dispatch(fetchReviewQuestions(productId));
    } catch (error) {
      console.error('Error submitting question:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari yang lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
    return `${Math.floor(diffDays / 30)} bulan yang lalu`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <QuestionMarkCircleIcon className="w-6 h-6 text-indigo-600" />
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Tanya Jawab Produk
              </h3>
              <p className="text-sm text-slate-600">
                Punya pertanyaan tentang {productName}? Tanyakan di sini!
              </p>
            </div>
          </div>
          
          <button
            onClick={() => dispatch(toggleQuestionForm())}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Ajukan Pertanyaan</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Question Form */}
        {showQuestionForm && (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-3">Ajukan Pertanyaan Baru</h4>
            
            <form onSubmit={handleSubmitQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Pertanyaan Anda <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="Tulis pertanyaan Anda tentang produk ini..."
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {questionText.length}/500 karakter (minimal 10)
                </p>
              </div>
              
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => dispatch(toggleQuestionForm())}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || questionText.trim().length < 10}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Mengirim...' : 'Kirim Pertanyaan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
            <button
              onClick={() => dispatch(clearErrors())}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Loading state */}
        {questionsLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-slate-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-slate-100 h-16 rounded mb-2"></div>
                <div className="bg-slate-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Questions list */}
        {!questionsLoading && questions.length > 0 && (
          <div className="space-y-6">
            {questions.map((qa) => (
              <div key={qa.question_id} className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                {/* Question */}
                <div className="mb-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-slate-900">{qa.user_name}</span>
                        <span className="text-sm text-slate-500">•</span>
                        <span className="text-sm text-slate-500">
                          {formatTimeAgo(qa.created_at)}
                        </span>
                      </div>
                      <p className="text-slate-700">{qa.question}</p>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                {qa.answer ? (
                  <div className="ml-11 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">LN</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-indigo-900">{qa.answered_by}</span>
                          <div className="flex items-center space-x-1 text-indigo-700">
                            <ClockIcon className="w-4 h-4" />
                            <span className="text-sm">{formatDate(qa.answered_at)}</span>
                          </div>
                        </div>
                        <p className="text-indigo-800">{qa.answer}</p>
                        
                        {/* Helpful action */}
                        {qa.helpful_count !== undefined && (
                          <div className="flex items-center space-x-2 mt-3">
                            <button className="flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 transition-colors">
                              <HandThumbUpIcon className="w-4 h-4" />
                              <span className="text-sm">Membantu</span>
                            </button>
                            {qa.helpful_count > 0 && (
                              <span className="text-sm text-indigo-600">
                                {qa.helpful_count} orang merasa terbantu
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="ml-11">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <ClockIcon className="w-5 h-5 text-amber-600" />
                        <span className="text-amber-800 font-medium">Menunggu jawaban</span>
                      </div>
                      <p className="text-amber-700 text-sm mt-1">
                        Tim kami akan segera menjawab pertanyaan ini dalam 1x24 jam.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!questionsLoading && questions.length === 0 && (
          <div className="text-center py-8">
            <QuestionMarkCircleIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 mb-2">
              Belum ada pertanyaan
            </h4>
            <p className="text-slate-600 mb-4">
              Jadilah yang pertama bertanya tentang produk ini
            </p>
            <button
              onClick={() => dispatch(toggleQuestionForm())}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ajukan Pertanyaan Pertama
            </button>
          </div>
        )}

        {/* Info section */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h5 className="font-medium text-slate-900 mb-2">Tips Bertanya</h5>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• Tanyakan hal spesifik tentang produk ini</li>
            <li>• Hindari pertanyaan umum yang sudah ada di deskripsi</li>
            <li>• Tim kami akan menjawab dalam 1x24 jam</li>
            <li>• Pertanyaan yang sering ditanyakan akan diprioritaskan</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ReviewQuestions;