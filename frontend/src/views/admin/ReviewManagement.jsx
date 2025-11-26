import React, { useState, useEffect } from "react";
import { MdStars, MdVisibility, MdDelete, MdCheckCircle, MdBlock } from "react-icons/md";
import { reviewApi } from "../../api/reviewApi";

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  // Fetch reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewApi.getReviews(filter !== 'all' ? { status: filter } : {});
      setReviews(response.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      alert('Gagal memuat data review: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]); // Re-fetch when filter changes

  const handleApprove = async (id) => {
    setActionLoading(prev => ({ ...prev, [id]: 'approving' }));
    try {
      const response = await reviewApi.approveReview(id);
      if (response.success) {
        await fetchReviews();
        alert('Review berhasil disetujui!');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Gagal menyetujui review: ' + (error.response?.data?.message || error.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Yakin ingin menolak review ini?')) {
      setActionLoading(prev => ({ ...prev, [id]: 'rejecting' }));
      try {
        const response = await reviewApi.rejectReview(id);
        if (response.success) {
          await fetchReviews();
          alert('Review berhasil ditolak!');
        }
      } catch (error) {
        console.error('Error rejecting review:', error);
        alert('Gagal menolak review: ' + (error.response?.data?.message || error.message));
      } finally {
        setActionLoading(prev => ({ ...prev, [id]: null }));
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus review ini?')) {
      setActionLoading(prev => ({ ...prev, [id]: 'deleting' }));
      try {
        const response = await reviewApi.deleteReview(id);
        if (response.success) {
          await fetchReviews();
          alert('Review berhasil dihapus!');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Gagal menghapus review: ' + (error.response?.data?.message || error.message));
      } finally {
        setActionLoading(prev => ({ ...prev, [id]: null }));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <MdStars
        key={i}
        className={`text-lg ${i < rating ? 'text-amber-400' : 'text-slate-300'}`}
      />
    ));
  };

  const filteredReviews = reviews.filter(review => {
    const matchesFilter = filter === "all" || review.status === filter;
    const matchesSearch = review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    rejected: reviews.filter(r => r.status === 'rejected').length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <MdStars className="text-amber-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Review</h1>
            <p className="text-slate-600">Kelola dan moderasi review produk dari pelanggan</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Review</h3>
          <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Disetujui</h3>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Pending</h3>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Ditolak</h3>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Rating Rata-rata</h3>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-slate-900">{stats.avgRating}</p>
            <div className="flex">
              {renderStars(Math.round(stats.avgRating))}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari review, pelanggan, atau produk..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Disetujui</option>
              <option value="rejected">Ditolak</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-center space-x-2 text-slate-500">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <span>Memuat data review...</span>
            </div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="text-center text-slate-500">
              {searchTerm || filter !== "all" ? "Tidak ada review yang sesuai filter" : "Belum ada review"}
            </div>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                    <span className="font-medium text-slate-600">
                      {review.user_name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-slate-900">
                        {review.user_name || "Anonymous"}
                      </h3>
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                      </div>
                      <span className="text-sm text-slate-500">
                        {new Date(review.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      Produk: <span className="font-medium">{review.product_name}</span>
                    </p>
                    <p className="text-slate-900">{review.comment}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(review.status)}`}>
                    {review.status === 'approved' ? 'Disetujui' : 
                     review.status === 'rejected' ? 'Ditolak' : 'Pending'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                {review.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={actionLoading[review.id]}
                      className="flex items-center gap-1 px-3 py-2 text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading[review.id] === 'approving' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Menyetujui...</span>
                        </>
                      ) : (
                        <>
                          <MdCheckCircle /> Setujui
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(review.id)}
                      disabled={actionLoading[review.id]}
                      className="flex items-center gap-1 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading[review.id] === 'rejecting' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          <span>Menolak...</span>
                        </>
                      ) : (
                        <>
                          <MdBlock /> Tolak
                        </>
                      )}
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(review.id)}
                  disabled={actionLoading[review.id]}
                  className="flex items-center gap-1 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading[review.id] === 'deleting' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Menghapus...</span>
                    </>
                  ) : (
                    <>
                      <MdDelete /> Hapus
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination could be added here */}
      {filteredReviews.length > 10 && (
        <div className="mt-6 flex justify-center">
          <div className="bg-white rounded-lg border border-slate-200 p-1 flex items-center gap-1">
            <button className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded transition">
              Previous
            </button>
            <span className="px-3 py-2 bg-amber-100 text-amber-700 rounded font-medium">1</span>
            <button className="px-3 py-2 text-slate-600 hover:bg-slate-50 rounded transition">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;