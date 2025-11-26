import React, { useState, useEffect } from "react";
import { MdAdd, MdEdit, MdDelete, MdStars, MdWorkspacePremium, MdCardGiftcard, MdPeople } from "react-icons/md";
import api from "../../api/axios";
import ResponsiveTable from 'components/ResponsiveTable';

const MembershipManagement = () => {
  const [userPoints, setUserPoints] = useState([]);
  const [userPointsStats, setUserPointsStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  
  // History Modal states
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching user points data from database...');
      const response = await api.get(`/membership/user-points?page=${currentPage}&limit=10&search=${searchTerm}`);
      const data = response.data;
      
      if (data.success) {
        // Validate database response structure
        if (data.data && Array.isArray(data.data.users)) {
          setUserPoints(data.data.users);
          setUserPointsStats(data.data.statistics || {});
          console.log('✅ Database connection successful:', {
            totalUsers: data.data.users.length,
            totalPoints: data.data.statistics?.totalPointsAwarded || 0,
            endpoint: '/membership/user-points'
          });
        } else {
          setError('Invalid data format from database');
          console.error('❌ Invalid database response format:', data);
        }
      } else {
        setError('Failed to fetch data from database');
        console.error('❌ Database response failed:', data);
      }
    } catch (error) {
      console.error('❌ Database connection error:', error);
      setError(`Database connection failed: ${error.response?.data?.msg || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🚀 MembershipManagement component mounted, testing database connection...');
    fetchData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const getCurrentData = () => {
    return userPoints;
  };

  const getCurrentForm = () => {
    return null; // Tidak ada form untuk user points
  };

  const getModalTitle = () => {
    return "User Points"; // Fixed title since we only have users tab
  };

  const renderTable = () => {
    const data = getCurrentData();
    
    if (loading) {
      return (
        <tr>
          <td colSpan="6" className="text-center p-12">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="text-slate-600 font-medium">Connecting to database...</span>
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan="6" className="text-center p-12">
            <div className="text-red-600">
              <MdDelete className="w-12 h-12 mx-auto mb-3" />
              <p className="font-medium">Database connection failed</p>
              <p className="text-sm text-red-500 mt-1">{error}</p>
            </div>
          </td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center p-12">
            <div className="text-slate-500">
              <MdPeople className="w-12 h-12 mx-auto mb-3" />
              <p className="font-medium">No users found in database</p>
              <p className="text-sm mt-1">Database is connected but no user data available</p>
            </div>
          </td>
        </tr>
      );
    }

    return data.map((user, index) => (
      <tr key={user.user_id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
        {/* Member Info */}
        <td className="p-4">
          <div>
            <span className="font-medium text-slate-900">{user.email}</span>
            <p className="text-sm text-slate-500">{user.fullname}</p>
            <p className="text-xs text-slate-400">
              ID: {user.user_id.length > 20 ? `${user.user_id.slice(0, 8)}...` : user.user_id}
            </p>
          </div>
        </td>
        
        {/* Level & Points */}
        <td className="p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {user.membership_level === 'VIP' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full">
                  👑 VIP
                </span>
              )}
              {user.membership_level === 'Gold' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-full">
                  ⭐ Gold
                </span>
              )}
              {user.membership_level === 'Silver' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-slate-400 to-slate-600 text-white rounded-full">
                  🥈 Silver
                </span>
              )}
              {user.membership_level === 'Bronze' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-orange-400 to-orange-600 text-white rounded-full">
                  🥉 Bronze
                </span>
              )}
              {user.membership_level === 'Starter' && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-full">
                  🌱 Starter
                </span>
              )}
            </div>
            <span className="font-semibold text-purple-600">
              {Number(user.total_points || 0).toLocaleString()} points
            </span>
          </div>
        </td>
        
        {/* Total Transaksi */}
        <td className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-blue-600">
              {Number(user.total_orders || 0).toLocaleString()}
            </span>
            <span className="text-sm text-slate-500">pesanan</span>
          </div>
        </td>
        
        {/* Total Belanja */}
        <td className="p-4">
          <div>
            <span className="text-lg font-bold text-green-600">
              Rp {(() => {
                const amount = user.total_spent;
                if (!amount || amount === 0 || amount === '0' || amount === '00') {
                  return '0';
                }
                return Number(amount).toLocaleString('id-ID');
              })()}
            </span>
            {user.avg_order_value && user.avg_order_value > 0 && (
              <p className="text-xs text-slate-500">
                Avg: Rp {(() => {
                  const avgAmount = user.avg_order_value;
                  if (!avgAmount || avgAmount === 0 || avgAmount === '0' || avgAmount === '00') {
                    return '0';
                  }
                  return Number(avgAmount).toLocaleString('id-ID');
                })()}
              </p>
            )}
          </div>
        </td>
        
        {/* Transaksi Terakhir */}
        <td className="p-4">
          <div>
            {user.last_order_date ? (
              <>
                <span className="text-sm text-slate-600">
                  {new Date(user.last_order_date).toLocaleDateString('id-ID')}
                </span>
                <p className="text-xs text-slate-400">
                  {(() => {
                    const daysDiff = Math.floor((new Date() - new Date(user.last_order_date)) / (1000 * 60 * 60 * 24));
                    if (daysDiff === 0) return 'Hari ini';
                    if (daysDiff === 1) return '1 hari lalu';
                    return `${daysDiff} hari lalu`;
                  })()}
                </p>
              </>
            ) : (
              <span className="text-sm text-slate-400">Belum ada pesanan</span>
            )}
          </div>
        </td>
        
        {/* Aksi */}
        <td className="p-4">
          <button
            onClick={() => viewUserOrderHistory(user.user_id)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors"
            title="Lihat Riwayat Pesanan Lengkap"
          >
            📋 Detail History
          </button>
        </td>
      </tr>
    ));
  };

  const viewUserOrderHistory = async (userId) => {
    setHistoryLoading(true);
    setShowHistoryModal(true);
    
    try {
      console.log('Fetching order history from database for user:', userId);
      const response = await api.get(`/membership/user-points/${userId}/orders`);
      const data = response.data;
      if (data.success) {
        setHistoryData(data.data);
        console.log('✅ Order history loaded successfully:', {
          totalOrders: data.data.statistics.totalOrders,
          totalSpent: data.data.statistics.totalSpent
        });
      } else {
        console.error('❌ Failed to fetch order history:', data);
        alert('Gagal mengambil data riwayat pesanan dari database');
        setShowHistoryModal(false);
      }
    } catch (error) {
      console.error('❌ Database error fetching order history:', error);
      alert('Error koneksi database: ' + (error.response?.data?.msg || error.message));
      setShowHistoryModal(false);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Test database connection
  const testDatabaseConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🧪 Testing database connection...');
      const response = await api.get('/membership/user-points?page=1&limit=1');
      if (response.data.success) {
        console.log('✅ Database connection test successful');
        alert('✅ Database connection successful!');
        fetchData(); // Reload full data
      } else {
        console.log('❌ Database connection test failed');
        alert('❌ Database connection failed');
      }
    } catch (error) {
      console.error('❌ Database connection test error:', error);
      alert(`❌ Database connection error: ${error.message}`);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <MdWorkspacePremium className="text-purple-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Membership</h1>
            <p className="text-slate-600">Kelola poin user dan lihat riwayat transaksi member</p>
            <p className="text-xs text-slate-500 mt-1">
              📊 Sistem Poin: 1 poin = Rp 1.000 belanja | 
              🌱 Starter: &lt;250 | 🥉 Bronze: 250+ | 🥈 Silver: 1.000+ | ⭐ Gold: 2.500+ | 👑 VIP: 5.000+
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={testDatabaseConnection}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
            title="Test Database Connection"
          >
            <MdStars />
            {loading ? 'Testing...' : 'Test DB'}
          </button>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition"
            title="Refresh Data"
          >
            <MdEdit />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <MdDelete className="text-red-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">Database Connection Error</h3>
              <p className="text-red-700">{error}</p>
              <button 
                onClick={fetchData}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics untuk User Points */}
      {userPointsStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MdPeople className="text-blue-600 text-lg" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Members</p>
                <p className="text-xl font-bold text-slate-900">{userPointsStats.totalUsers?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MdStars className="text-purple-600 text-lg" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Points</p>
                <p className="text-xl font-bold text-slate-900">{userPointsStats.totalPointsAwarded?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <MdWorkspacePremium className="text-green-600 text-lg" />
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Orders</p>
                <p className="text-xl font-bold text-slate-900">{userPointsStats.totalOrders?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <span className="text-amber-600 text-lg font-bold">💰</span>
              </div>
              <div>
                <p className="text-xs text-slate-600">Total Revenue</p>
                <p className="text-lg font-bold text-slate-900">Rp {userPointsStats.totalRevenue?.toLocaleString('id-ID') || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 text-lg font-bold">📊</span>
              </div>
              <div>
                <p className="text-xs text-slate-600">Avg Order Value</p>
                <p className="text-lg font-bold text-slate-900">Rp {userPointsStats.avgOrderValue?.toLocaleString('id-ID') || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search untuk User Points */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Cari user berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Tabs - Only User Points */}
      <div className="flex border-b border-slate-200 mb-6">
        <div className="px-4 py-2 font-medium text-purple-600 border-b-2 border-purple-600">
          <div className="flex items-center gap-2">
            <MdPeople />
            User Points
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <ResponsiveTable>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-600">Member Info</th>
                <th className="text-left p-4 font-medium text-slate-600">Level & Points</th>
                <th className="text-left p-4 font-medium text-slate-600">Total Transaksi</th>
                <th className="text-left p-4 font-medium text-slate-600">Total Belanja</th>
                <th className="text-left p-4 font-medium text-slate-600">Transaksi Terakhir</th>
                <th className="text-left p-4 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {renderTable()}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <MdWorkspacePremium className="text-2xl" />
                  <div>
                    <h3 className="text-xl font-bold">Riwayat Pesanan Customer</h3>
                    {historyData && (
                      <p className="text-purple-100 text-sm">
                        {historyData.user.fullname} ({historyData.user.email})
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  <MdDelete className="text-xl" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  <span className="ml-3 text-slate-600">Memuat data...</span>
                </div>
              ) : historyData ? (
                <div className="space-y-6">
                  {/* Statistics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <MdStars className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-blue-600 text-sm font-medium">Total Pesanan</p>
                          <p className="text-blue-800 text-2xl font-bold">{historyData.statistics.totalOrders}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                          <MdCardGiftcard className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-purple-600 text-sm font-medium">Total Belanja</p>
                          <p className="text-purple-800 text-2xl font-bold">
                            Rp {Number(historyData.statistics.totalSpent).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg border border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                          <MdWorkspacePremium className="text-white text-xl" />
                        </div>
                        <div>
                          <p className="text-amber-600 text-sm font-medium">Rata-rata per Pesanan</p>
                          <p className="text-amber-800 text-2xl font-bold">
                            Rp {Number(historyData.statistics.avgOrderValue).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order History Table */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-200">
                      <h4 className="text-lg font-semibold text-slate-800">Daftar Pesanan</h4>
                    </div>

                    {historyData.orderHistory && historyData.orderHistory.length > 0 ? (
                      <ResponsiveTable>
                        <table className="w-full">
                          <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                              <th className="text-left p-4 font-medium text-slate-600">Nomor Pesanan</th>
                              <th className="text-left p-4 font-medium text-slate-600">Total</th>
                              <th className="text-left p-4 font-medium text-slate-600">Status</th>
                              <th className="text-left p-4 font-medium text-slate-600">Items</th>
                              <th className="text-left p-4 font-medium text-slate-600">Tanggal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {historyData.orderHistory.map((order, index) => {
                              const statusColors = {
                                'pending': 'bg-yellow-100 text-yellow-800',
                                'confirmed': 'bg-blue-100 text-blue-800',
                                'processing': 'bg-purple-100 text-purple-800',
                                'shipped': 'bg-indigo-100 text-indigo-800',
                                'delivered': 'bg-green-100 text-green-800',
                                'completed': 'bg-green-100 text-green-800',
                                'cancelled': 'bg-red-100 text-red-800'
                              };

                              const statusEmoji = {
                                'pending': '⏳',
                                'confirmed': '✅',
                                'processing': '🔄',
                                'shipped': '🚚',
                                'delivered': '📦',
                                'completed': '✅',
                                'cancelled': '❌'
                              };

                              return (
                                <tr key={order.order_id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                                  <td className="p-4">
                                    <div className="font-medium text-slate-900">
                                      {order.order_number || order.order_id}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      ID: {order.order_id.slice(0, 8)}...
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <span className="font-semibold text-slate-900">
                                      Rp {Number(order.total).toLocaleString()}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-slate-100 text-slate-800'}`}>
                                      <span>{statusEmoji[order.status] || '📋'}</span>
                                      {order.status}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-slate-600">
                                      {order.OrderItems ? order.OrderItems.length : 0} item(s)
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="text-slate-600">
                                      {new Date(order.created_at).toLocaleDateString('id-ID')}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {new Date(order.created_at).toLocaleTimeString('id-ID')}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </ResponsiveTable>
                    ) : (
                      <div className="p-8 text-center">
                        <MdStars className="mx-auto text-4xl text-slate-300 mb-3" />
                        <p className="text-slate-500">Belum ada riwayat pesanan untuk customer ini.</p>
                      </div>
                    )}
                  </div>

                  {/* Pagination info */}
                  {historyData.pagination && (
                    <div className="flex justify-between items-center text-sm text-slate-600 bg-slate-50 px-4 py-3 rounded-lg">
                      <span>
                        Menampilkan {historyData.orderHistory.length} dari {historyData.pagination.total} pesanan
                      </span>
                      <span>
                        Halaman {historyData.pagination.page} dari {historyData.pagination.totalPages}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MdStars className="mx-auto text-4xl text-slate-300 mb-3" />
                  <p className="text-slate-500">Gagal memuat data riwayat pesanan.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembershipManagement;