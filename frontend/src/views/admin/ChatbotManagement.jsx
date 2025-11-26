import React, { useState, useEffect } from "react";
import { 
  MdSmartToy, 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdChat, 
  MdReply, 
  MdNotifications,
  MdCheckCircle,
  MdPending,
  MdWarning 
} from "react-icons/md";
import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/apiClient";
import ResponsiveTable from 'components/ResponsiveTable';

const ChatbotManagement = () => {
  const [activeTab, setActiveTab] = useState("escalations");
  const [escalations, setEscalations] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [replyData, setReplyData] = useState({
    message_text: "",
    is_final: true
  });
  const [error, setError] = useState(null);

  // Fetch data berdasarkan tab yang aktif
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "escalations") {
        const data = await apiGet('/api/chat-admin/escalations');
        setEscalations(data || []);
      } else if (activeTab === "faqs") {
        const data = await apiGet('/api/chat-admin/faqs');
        setFaqs(data || []);
      } else if (activeTab === "replies") {
        const data = await apiGet('/api/chat-admin/quick-replies');
        setQuickReplies(data || []);
      }
    } catch (e) {
      console.error('Error fetching data:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleReplyToEscalation = async (e) => {
    e.preventDefault();
    try {
      await apiPost(`/api/chat-admin/escalations/${currentItem.chat_session_id}/reply`, replyData);
      fetchData();
      setShowReplyModal(false);
      setReplyData({ message_text: "", is_final: true });
      alert('Balasan berhasil dikirim!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (activeTab === 'faqs') {
        // Map frontend fields to backend fields for FAQ
        payload.question = formData.question;
        payload.answer = formData.answer;
        payload.category = formData.category || 'general';
        payload.tags = formData.keywords || formData.tags; // Map keywords to tags
        payload.is_active = formData.is_active !== false;
      } else if (activeTab === 'replies') {
        // Map frontend fields to backend fields for Quick Replies
        payload.label = formData.label;
        payload.payload_text = formData.payload_text || formData.message;
        payload.locale = formData.locale || 'id';
        payload.is_active = formData.is_active !== false;
        payload.sort_order = formData.sort_order || 0;
      }

      if (editMode) {
        const idField = activeTab === 'faqs' ? 'kb_id' : 'quick_reply_id';
        const endpoint = activeTab === 'faqs' ? '/api/chat-admin/faqs' : '/api/chat-admin/quick-replies';
        await apiPut(`${endpoint}/${currentItem[idField]}`, payload);
        alert('Data berhasil diupdate!');
      } else {
        const endpoint = activeTab === 'faqs' ? '/api/chat-admin/faqs' : '/api/chat-admin/quick-replies';
        await apiPost(endpoint, payload);
        alert('Data berhasil dibuat!');
      }
      fetchData();
      handleCloseModal();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Yakin ingin menghapus data ini?')) return;
    try {
      if (type === 'faqs') {
        await apiDelete(`/api/chat-admin/faqs/${id}`);
      } else if (type === 'replies') {
        await apiDelete(`/api/chat-admin/quick-replies/${id}`);
      }
      fetchData();
      alert('Data berhasil dihapus!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    const editData = { ...item };
    // For FAQ, map tags to keywords for form display
    if (activeTab === 'faqs' && item.tags) {
      editData.keywords = item.tags;
    }
    setFormData(editData);
    setEditMode(true);
    setShowModal(true);
  };

  const handleReply = (escalation) => {
    setCurrentItem(escalation);
    setShowReplyModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentItem(null);
    setFormData({});
  };

  const markAsResolved = async (id) => {
    try {
      await apiPut(`/api/chat-admin/escalations/${id}/resolve`);
      fetchData();
      alert('Escalation berhasil ditandai selesai!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <MdPending />;
      case 'in_progress': return <MdWarning />;
      case 'resolved': return <MdCheckCircle />;
      default: return <MdNotifications />;
    }
  };

  const renderEscalationsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Escalation</h3>
          <p className="text-2xl font-bold text-slate-900">{escalations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Pending</h3>
          <p className="text-2xl font-bold text-amber-600">
            {escalations.filter(e => e.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">In Progress</h3>
          <p className="text-2xl font-bold text-blue-600">
            {escalations.filter(e => e.status === 'in_progress').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Resolved</h3>
          <p className="text-2xl font-bold text-green-600">
            {escalations.filter(e => e.status === 'resolved').length}
          </p>
        </div>
      </div>

      {/* Escalations List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Escalated Chats</h3>
          <p className="text-sm text-slate-600">Percakapan yang tidak bisa dijawab chatbot</p>
        </div>
        <div className="divide-y divide-slate-200">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading...</div>
          ) : escalations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">Tidak ada escalation</div>
          ) : (
            escalations.map((escalation) => (
              <div key={escalation.id} className="p-4 hover:bg-slate-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                      <MdChat className="text-slate-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">
                        {escalation.user_name || "Anonymous"}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Session: {escalation.session_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${getStatusColor(escalation.status)}`}>
                      {getStatusIcon(escalation.status)}
                      {escalation.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(escalation.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </div>
                
                <div className="bg-slate-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-slate-700 font-medium">User Message:</p>
                  <p className="text-slate-900">{escalation.user_message}</p>
                </div>

                {escalation.admin_reply && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-blue-700 font-medium">Admin Reply:</p>
                    <p className="text-blue-900">{escalation.admin_reply}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  {escalation.status !== 'resolved' && (
                    <>
                      <button
                        onClick={() => handleReply(escalation)}
                        className="text-blue-600 hover:text-blue-800 px-3 py-1 text-sm border border-blue-200 rounded-lg hover:bg-blue-50 transition flex items-center gap-1"
                      >
                        <MdReply /> Reply
                      </button>
                      <button
                        onClick={() => markAsResolved(escalation.chat_session_id)}
                        className="text-green-600 hover:text-green-800 px-3 py-1 text-sm border border-green-200 rounded-lg hover:bg-green-50 transition flex items-center gap-1"
                      >
                        <MdCheckCircle /> Mark Resolved
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderFAQsTab = () => (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <ResponsiveTable>
          <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">Pertanyaan</th>
              <th className="text-left p-4 font-medium text-slate-600">Keywords</th>
              <th className="text-left p-4 font-medium text-slate-600">Status</th>
              <th className="text-left p-4 font-medium text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-slate-500">Loading...</td>
              </tr>
            ) : faqs.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center p-8 text-slate-500">Belum ada FAQ</td>
              </tr>
            ) : (
              faqs.map((faq, index) => (
                <tr key={faq.kb_id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-900">{faq.question}</p>
                      <p className="text-sm text-slate-500 mt-1">{faq.answer}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {(faq.tags || faq.keywords)?.split(',').map((keyword, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded">
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      faq.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {faq.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(faq)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.kb_id, 'faqs')}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Hapus"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          </table>
        </ResponsiveTable>
    </div>
  );

  const renderQuickRepliesTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <ResponsiveTable>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">Label</th>
              <th className="text-left p-4 font-medium text-slate-600">Pesan</th>
              <th className="text-left p-4 font-medium text-slate-600">Bahasa</th>
              <th className="text-left p-4 font-medium text-slate-600">Urutan</th>
              <th className="text-left p-4 font-medium text-slate-600">Status</th>
              <th className="text-left p-4 font-medium text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-slate-500">Loading...</td>
              </tr>
            ) : quickReplies.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-8 text-slate-500">Belum ada quick reply</td>
              </tr>
            ) : (
              quickReplies.map((reply, index) => (
                <tr key={reply.quick_reply_id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="p-4">
                    <span className="font-medium text-slate-900">{reply.label}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-700 max-w-xs truncate">{reply.payload_text}</p>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded capitalize">
                      {reply.locale || "id"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-slate-700">
                      {reply.sort_order || 0}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      reply.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {reply.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(reply)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(reply.quick_reply_id, 'replies')}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Hapus"
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ResponsiveTable>
    </div>
  );

  const getForm = () => {
    if (activeTab === "faqs") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Pertanyaan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.question || ""}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Bagaimana cara memesan produk?"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Jawaban <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.answer || ""}
              onChange={(e) => setFormData({...formData, answer: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              placeholder="Anda dapat memesan produk melalui website..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Keywords (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={formData.keywords || ""}
              onChange={(e) => setFormData({...formData, keywords: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="pesan, order, beli, checkout"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active" className="text-sm text-slate-600">
              Status Aktif
            </label>
          </div>
        </form>
      );
    } else if (activeTab === "replies") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.label || ""}
              onChange={(e) => setFormData({...formData, label: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Selamat Datang"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Pesan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.payload_text || formData.message || ""}
              onChange={(e) => setFormData({...formData, payload_text: e.target.value, message: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
              placeholder="Selamat datang di Lyvia Nusa Boga! Ada yang bisa saya bantu?"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Bahasa
            </label>
            <select
              value={formData.locale || "id"}
              onChange={(e) => setFormData({...formData, locale: e.target.value})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="id">Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Urutan Tampil
            </label>
            <input
              type="number"
              value={formData.sort_order || 0}
              onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              min="0"
              placeholder="0"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_reply"
              checked={formData.is_active || false}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="is_active_reply" className="text-sm text-slate-600">
              Status Aktif
            </label>
          </div>
        </form>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MdSmartToy className="text-blue-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Chatbot</h1>
            <p className="text-slate-600">Kelola FAQ, quick replies, dan handle escalated chats</p>
          </div>
        </div>
        {(activeTab === "faqs" || activeTab === "replies") && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <MdAdd /> Tambah {activeTab === "faqs" ? "FAQ" : "Quick Reply"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("escalations")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "escalations"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <MdNotifications />
            Escalated Chats
          </div>
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "faqs"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <MdChat />
            FAQ Management
          </div>
        </button>
        <button
          onClick={() => setActiveTab("replies")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "replies"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <MdReply />
            Quick Replies
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === "escalations" && renderEscalationsTab()}
      {activeTab === "faqs" && renderFAQsTab()}
      {activeTab === "replies" && renderQuickRepliesTab()}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editMode ? "Edit" : "Tambah"} {activeTab === "faqs" ? "FAQ" : "Quick Reply"}
            </h2>
            {getForm()}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editMode ? "Update" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Reply to Escalation
            </h2>
            <form onSubmit={handleReplyToEscalation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  User Message:
                </label>
                <div className="bg-slate-50 rounded-lg p-3 text-slate-700">
                  {currentItem?.user_message}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Your Reply <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={replyData.message_text || ""}
                  onChange={(e) => setReplyData({...replyData, message_text: e.target.value})}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="4"
                  placeholder="Terima kasih atas pertanyaan Anda..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_final"
                  checked={replyData.is_final}
                  onChange={(e) => setReplyData({...replyData, is_final: e.target.checked})}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="is_final" className="text-sm text-slate-600">
                  Mark as final answer (akan menutup escalation)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Kirim Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotManagement;