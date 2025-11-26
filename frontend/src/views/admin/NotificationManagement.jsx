import React, { useState, useEffect } from "react";
import {
  MdNotifications,
  MdAdd,
  MdEdit,
  MdDelete,
  MdSend,
  MdPeople,
  MdPerson,
  MdEmail,
  MdSms,
  MdWeb
} from "react-icons/md";
import { apiGet, apiPost, apiPut, apiDelete } from "../../utils/apiClient";
import ResponsiveTable from 'components/ResponsiveTable';

const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]); // jobs history
  const [templates, setTemplates] = useState([]);
  const [activeTab, setActiveTab] = useState("notifications");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({ channel: 'email', is_active: true });
  const [sendData, setSendData] = useState({
    template_id: "",
    target_type: "all",
    target_users: "",
    send_immediately: true,
    scheduled_at: ""
  });
  const [error, setError] = useState(null);

  // helper mapping
  const mapTemplateToForm = (tpl) => ({
    template_id: tpl.template_id,
    name: tpl.name,
    channel: tpl.channel,
    title: tpl.title || '',
    content: tpl.content || '',
    is_active: tpl.is_active,
  });

  // Fetch data berdasarkan tab yang aktif
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === "notifications") {
        // jobs
        const rows = await apiGet('/api/notifications-admin/jobs');
        setNotifications(rows || []);
      } else {
        const rows = await apiGet('/api/notifications-admin/templates');
        setTemplates(rows || []);
      }
    } catch (e) {
      console.error('Error fetch notifications/templates', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        channel: formData.channel,
        title: formData.title,
        content: formData.content,
        is_active: !!formData.is_active,
      };
      if (editMode) {
        await apiPut(`/api/notifications-admin/templates/${currentItem.template_id}`, payload);
        alert('Template berhasil diupdate!');
      } else {
        await apiPost('/api/notifications-admin/templates', payload);
        alert('Template berhasil dibuat!');
      }
      fetchData();
      handleCloseModal();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      const tpl = templates.find(t => t.template_id === sendData.template_id);
      if (!tpl) {
        alert('Template tidak ditemukan');
        return;
      }
      // backend expects: template_id, channel, target_type, target_user_ids(optional), scheduled_at (optional)
      const payload = {
        template_id: sendData.template_id,
        channel: tpl.channel,
        target_type: sendData.target_type,
      };
      if (sendData.target_type === 'specific' && sendData.target_users.trim()) {
        // map to target_user_ids (assume comma separated identifiers/emails). Backend just stores text.
        payload.target_user_ids = sendData.target_users.split(',').map(s => s.trim()).filter(Boolean).join(',');
      }
      if (!sendData.send_immediately && sendData.scheduled_at) {
        payload.scheduled_at = sendData.scheduled_at;
        payload.status = 'scheduled';
      }
      await apiPost('/api/notifications-admin/send', payload);
      fetchData();
      setShowSendModal(false);
      setSendData({ template_id: "", target_type: "all", target_users: "", send_immediately: true, scheduled_at: "" });
      alert('Job notifikasi dibuat!');
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleDeleteTemplate = async (template_id) => {
    if (!template_id) return;
    if (!window.confirm('Yakin ingin menghapus template ini?')) return;
    try {
      await apiDelete(`/api/notifications-admin/templates/${template_id}`);
      alert('Template berhasil dihapus!');
      fetchData();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  };

  const handleEdit = (tpl) => {
    setCurrentItem(tpl);
    setFormData(mapTemplateToForm(tpl));
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentItem(null);
    setFormData({});
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-700';
      case 'failed': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getTypeIcon = (channel) => {
    switch (channel) {
      case 'email': return <MdEmail className="text-blue-600" />;
      case 'sms': return <MdSms className="text-green-600" />;
      case 'push': return <MdWeb className="text-purple-600" />;
      default: return <MdNotifications className="text-slate-600" />;
    }
  };

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Notifikasi</h3>
          <p className="text-2xl font-bold text-slate-900">{notifications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Terkirim</h3>
          <p className="text-2xl font-bold text-green-600">
            {notifications.filter(n => n.status === 'sent').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Pending</h3>
          <p className="text-2xl font-bold text-amber-600">
            {notifications.filter(n => n.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Gagal</h3>
          <p className="text-2xl font-bold text-red-600">
            {notifications.filter(n => n.status === 'failed').length}
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <ResponsiveTable>
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left p-4 font-medium text-slate-600">Judul</th>
                <th className="text-left p-4 font-medium text-slate-600">Tipe</th>
                <th className="text-left p-4 font-medium text-slate-600">Penerima</th>
                <th className="text-left p-4 font-medium text-slate-600">Status</th>
                <th className="text-left p-4 font-medium text-slate-600">Tanggal</th>
                <th className="text-left p-4 font-medium text-slate-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-500">Loading...</td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-8 text-slate-500">Belum ada notifikasi</td>
                </tr>
              ) : (
                notifications.map((job, index) => (
                  <tr key={job.job_id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-slate-900">{job.template_id || 'Job'}</p>
                        <p className="text-sm text-slate-500 max-w-xs truncate">Channel: {job.channel}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(job.channel)}
                        <span className="capitalize">{job.channel}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {job.target_type === 'all' ? <MdPeople /> : <MdPerson />}
                        <span className="text-sm">
                          {job.target_type === 'all' ? 'Semua User' : 'Target Khusus'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(job.status)}`}>
                        {job.status === 'sent' ? 'Terkirim' :
                         job.status === 'failed' ? 'Gagal' :
                         job.status === 'scheduled' ? 'Terjadwal' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-600">
                        {new Date(job.created_at).toLocaleDateString('id-ID')}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-xs">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ResponsiveTable>
      </div>
    </div>
  );

  const renderTemplatesTab = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <ResponsiveTable>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">Nama Template</th>
              <th className="text-left p-4 font-medium text-slate-600">Tipe</th>
              <th className="text-left p-4 font-medium text-slate-600">Kategori</th>
              <th className="text-left p-4 font-medium text-slate-600">Status</th>
              <th className="text-left p-4 font-medium text-slate-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-slate-500">Loading...</td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-8 text-slate-500">Belum ada template</td>
              </tr>
            ) : (
              templates.map((template, index) => (
                <tr key={template.template_id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                  <td className="p-4">
                    <div>
                      <p className="font-medium text-slate-900">{template.name}</p>
                      <p className="text-sm text-slate-500">{template.title}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(template.channel)}
                      <span className="capitalize">{template.channel}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded capitalize">
                      {template.category || "-"}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      template.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {template.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(template)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.template_id)}
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

  const getTemplateForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Nama Template <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name || ""}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Welcome Email"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Tipe Notifikasi
        </label>
        <select
          value={formData.channel || "email"}
          onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="push">Push Notification</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Kategori
        </label>
        <select
          value={formData.category || ""}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Pilih Kategori</option>
          <option value="welcome">Welcome</option>
          <option value="order">Order</option>
          <option value="promotion">Promotion</option>
          <option value="reminder">Reminder</option>
          <option value="alert">Alert</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Selamat datang di Lyvia Nusa Boga!"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Pesan <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.content || ""}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          rows="4"
          placeholder="Gunakan {{name}}, {{email}} untuk personalisasi..."
          required
        />
        <p className="text-xs text-slate-500 mt-1">
          Variabel tersedia: {"{name}"}, {"{email}"}, {"{order_id}"}, {"{product_name}"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          checked={!!formData.is_active}
          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="is_active" className="text-sm text-slate-600">
          Status Aktif
        </label>
      </div>
    </form>
  );

  const getSendForm = () => (
    <form onSubmit={handleSendNotification} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Pilih Template <span className="text-red-500">*</span>
        </label>
        <select
          value={sendData.template_id}
          onChange={(e) => setSendData({...sendData, template_id: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        >
          <option value="">Pilih Template</option>
          {templates.filter(t => t.is_active).map(template => (
            <option key={template.template_id} value={template.template_id}>
              {template.name} ({template.channel})
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-1">
          Target Penerima
        </label>
        <select
          value={sendData.target_type}
          onChange={(e) => setSendData({...sendData, target_type: e.target.value})}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="all">Semua User</option>
          <option value="specific">User Tertentu</option>
          <option value="segment">Segment User</option>
        </select>
      </div>

      {sendData.target_type === "specific" && (
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Email User (pisahkan dengan koma)
          </label>
          <textarea
            value={sendData.target_users}
            onChange={(e) => setSendData({ ...sendData, target_users: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
            placeholder="user1@email.com, user2@email.com"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="send_immediately"
          checked={sendData.send_immediately}
          onChange={(e) => setSendData({ ...sendData, send_immediately: e.target.checked })}
          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="send_immediately" className="text-sm text-slate-600">
          Kirim Sekarang
        </label>
      </div>

      {!sendData.send_immediately && (
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Jadwalkan Pengiriman
          </label>
          <input
            type="datetime-local"
            value={sendData.scheduled_at}
            onChange={(e) => setSendData({ ...sendData, scheduled_at: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}
    </form>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <MdNotifications className="text-blue-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Notifikasi</h1>
            <p className="text-slate-600">Kelola template dan pengiriman notifikasi ke pelanggan</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSendModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
          >
            <MdSend /> Kirim Notifikasi
          </button>
          {activeTab === "templates" && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <MdAdd /> Tambah Template
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "notifications"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <MdNotifications />
            Riwayat Notifikasi
          </div>
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2 font-medium transition ${
            activeTab === "templates"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2">
            <MdEdit />
            Template Notifikasi
          </div>
        </button>
      </div>

      {/* Content */}
      {activeTab === "notifications" && renderNotificationsTab()}
      {activeTab === "templates" && renderTemplatesTab()}

      {/* Template Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              {editMode ? "Edit Template" : "Tambah Template"}
            </h2>
            {getTemplateForm()}
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

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Kirim Notifikasi
            </h2>
            {getSendForm()}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSendNotification}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManagement;