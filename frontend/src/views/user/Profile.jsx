import React, { useState, useEffect, useRef } from 'react';
import Card from 'components/card';
import {
  MdPerson,
  MdLock,
  MdSettings,
  MdEdit,
  MdSave,
  MdClose,
  MdInfo,
  MdPhone,
  MdLocationOn
} from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileSummary, updateProfile, fetchAllNotifications, changePassword } from '../../store/slices/profileSlice';
import Swal from 'sweetalert2';

const Profile = () => {
  const dispatch = useDispatch();
  const [activeSection, setActiveSection] = useState('information');
  const { loading, error, user } = useSelector((s) => s.profile);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  const fullnameRef = useRef(null);
  const dateOfBirthRef = useRef(null);
  const genderRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const whatsappRef = useRef(null);
  const streetRef = useRef(null);
  const provinceRef = useRef(null);
  const cityRef = useRef(null);
  const districtRef = useRef(null);
  const postalCodeRef = useRef(null);
  const bioRef = useRef(null);

  useEffect(() => {
    console.log('[Profile] fetching profile summary and notifications');
    dispatch(fetchProfileSummary()).then(() => console.log('[Profile] fetchProfileSummary completed'));
    dispatch(fetchAllNotifications()).then(() => console.log('[Profile] fetchAllNotifications completed'));
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    console.log('[Profile] populating inputs from user:', user.user_id || user.email || 'unknown');

    const toISODate = (val) => {
      if (!val) return '';
      if (typeof val === 'string') {
        if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.split('T')[0];
        const m = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (m) return `${m[3]}-${m[2]}-${m[1]}`;
      }
      const d = new Date(val);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 10);
    };

    if (fullnameRef.current) fullnameRef.current.value = user.fullname || user.name || '';
    if (dateOfBirthRef.current) dateOfBirthRef.current.value = toISODate(user.date_of_birth || user.dateOfBirth);
    if (genderRef.current) genderRef.current.value = user.gender || '';
    if (emailRef.current) emailRef.current.value = user.email || '';
    if (phoneRef.current) phoneRef.current.value = user.phone || '';
    if (whatsappRef.current) whatsappRef.current.value = user.whatsapp_number || '';
    if (streetRef.current) streetRef.current.value = user.street_address || '';
    if (provinceRef.current) provinceRef.current.value = user.province || '';
    if (cityRef.current) cityRef.current.value = user.city || '';
    if (districtRef.current) districtRef.current.value = user.district || '';
    if (postalCodeRef.current) postalCodeRef.current.value = user.postal_code || '';
    if (bioRef.current) bioRef.current.value = user.bio || '';
  }, [user]);

  const startEdit = () => { setSaveMessage(null); setIsEditing(true); };
  const cancelEdit = () => {
    if (!user) return setIsEditing(false);
    if (fullnameRef.current) fullnameRef.current.value = user.fullname || user.name || '';
    if (dateOfBirthRef.current) dateOfBirthRef.current.value = user.date_of_birth ? (''+user.date_of_birth).split('T')[0] : '';
    if (genderRef.current) genderRef.current.value = user.gender || '';
    if (emailRef.current) emailRef.current.value = user.email || '';
    if (phoneRef.current) phoneRef.current.value = user.phone || '';
    if (whatsappRef.current) whatsappRef.current.value = user.whatsapp_number || '';
    if (streetRef.current) streetRef.current.value = user.street_address || '';
    if (provinceRef.current) provinceRef.current.value = user.province || '';
    if (cityRef.current) cityRef.current.value = user.city || '';
    if (districtRef.current) districtRef.current.value = user.district || '';
    if (postalCodeRef.current) postalCodeRef.current.value = user.postal_code || '';
    if (bioRef.current) bioRef.current.value = user.bio || '';
    setIsEditing(false);
  };

  const saveProfile = async () => {
    setSaving(true); setSaveMessage(null);
    try {
      const read = (r) => (r && r.current ? (r.current.value || '') : '');
      const normalizeDateForBackend = (v) => {
        if (!v) return null;
        if (typeof v === 'string') {
          const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
          if (m) return `${m[3]}-${m[2]}-${m[1]}`;
          if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
          const d = new Date(v); if (!isNaN(d.getTime())) return d.toISOString().slice(0,10);
        }
        return null;
      };

      const payload = {
        fullname: read(fullnameRef),
        email: read(emailRef),
        phone: read(phoneRef),
        gender: read(genderRef) || null,
        date_of_birth: normalizeDateForBackend(read(dateOfBirthRef)),
        whatsapp_number: read(whatsappRef) || null,
        street_address: read(streetRef) || null,
        province: read(provinceRef) || null,
        city: read(cityRef) || null,
        district: read(districtRef) || null,
        postal_code: read(postalCodeRef) || null,
        bio: read(bioRef) || null
      };

      console.log('[Profile] saving profile with payload:', payload);
      const updated = await dispatch(updateProfile(payload)).unwrap();
      console.log('[Profile] updateProfile returned:', updated);

      if (fullnameRef.current) fullnameRef.current.value = updated.fullname || '';
      if (dateOfBirthRef.current) dateOfBirthRef.current.value = updated.date_of_birth ? (''+updated.date_of_birth).split('T')[0] : '';
      if (genderRef.current) genderRef.current.value = updated.gender || '';
      if (emailRef.current) emailRef.current.value = updated.email || '';
      if (phoneRef.current) phoneRef.current.value = updated.phone || '';
      if (whatsappRef.current) whatsappRef.current.value = updated.whatsapp_number || '';
      if (streetRef.current) streetRef.current.value = updated.street_address || '';
      if (provinceRef.current) provinceRef.current.value = updated.province || '';
      if (cityRef.current) cityRef.current.value = updated.city || '';
      if (districtRef.current) districtRef.current.value = updated.district || '';
      if (postalCodeRef.current) postalCodeRef.current.value = updated.postal_code || '';
      if (bioRef.current) bioRef.current.value = updated.bio || '';

      setSaveMessage({ type: 'success', text: 'Perubahan profil berhasil disimpan.' });
      setIsEditing(false);
    } catch (e) {
      console.error('[Profile] saveProfile error:', e);
      setSaveMessage({ type: 'error', text: e?.message || 'Gagal menyimpan perubahan.' });
    } finally { setSaving(false); }
  };

  const menuItems = [
    { id: 'information', label: 'Information', icon: MdPerson },
    { id: 'change-password', label: 'Change Password', icon: MdLock }
  ];

  const InformationSection = () => (
    <div className="space-y-6">
      <Card extra="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Personal Information</h3>
          <div className="flex items-center gap-3">
            {!isEditing && (
              <button onClick={startEdit} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2">
                <MdEdit className="w-4 h-4" /> Edit
              </button>
            )}
            {isEditing && (
              <>
                <button disabled={saving} onClick={cancelEdit} className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 disabled:opacity-60">
                  <MdClose className="w-4 h-4" /> Cancel
                </button>
                <button disabled={saving} onClick={saveProfile} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 disabled:opacity-60">
                  {saving ? 'Saving...' : (<><MdSave className="w-4 h-4" /> Save</>)}
                </button>
              </>
            )}
          </div>
        </div>

        {saveMessage && (
          <div className={`mb-4 rounded-md p-3 text-sm ${saveMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {saveMessage.text}
          </div>
        )}

        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            <MdPerson className="w-5 h-5 text-blue-500" /> Basic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name *</label>
              <input ref={fullnameRef} type="text" defaultValue={user?.fullname || user?.name || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
              <input ref={dateOfBirthRef} type="date" defaultValue={user?.date_of_birth ? (''+user.date_of_birth).split('T')[0] : ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
              <select ref={genderRef} defaultValue={user?.gender || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><MdPhone className="w-5 h-5 text-green-500" /> Contact Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address *</label>
              <input ref={emailRef} type="email" defaultValue={user?.email || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
              <input ref={phoneRef} type="tel" defaultValue={user?.phone || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="+62 xxx xxxx xxxx" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">WhatsApp Number</label>
              <input ref={whatsappRef} type="tel" defaultValue={user?.whatsapp_number || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="+62 xxx xxxx xxxx" />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><MdLocationOn className="w-5 h-5 text-red-500" /> Address Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address *</label>
              <textarea ref={streetRef} rows="3" defaultValue={user?.street_address || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none" placeholder="Enter your complete street address" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Province *</label>
              <select ref={provinceRef} defaultValue={user?.province || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" required>
                <option value="">Select Province</option>
                <option value="jakarta">DKI Jakarta</option>
                <option value="jabar">Jawa Barat</option>
                <option value="jateng">Jawa Tengah</option>
                <option value="jatim">Jawa Timur</option>
                <option value="bali">Bali</option>
                <option value="sumut">Sumatera Utara</option>
                <option value="sumsel">Sumatera Selatan</option>
                <option value="kalbar">Kalimantan Barat</option>
                <option value="kaltim">Kalimantan Timur</option>
                <option value="sulsel">Sulawesi Selatan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City/Regency *</label>
              <input ref={cityRef} type="text" defaultValue={user?.city || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter your city/regency" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">District</label>
              <input ref={districtRef} type="text" defaultValue={user?.district || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter your district" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postal Code *</label>
              <input ref={postalCodeRef} type="text" defaultValue={user?.postal_code || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="Enter postal code" pattern="[0-9]{5}" maxLength="5" required />
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2"><MdInfo className="w-5 h-5 text-purple-500" /> Additional Information</h4>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio/Notes</label>
              <textarea ref={bioRef} rows="4" defaultValue={user?.bio || ''} disabled={!isEditing || saving} className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none" placeholder="Tell us about yourself or any special notes for delivery" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const ChangePasswordSection = () => {
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMessage, setPwMessage] = useState(null);

    const checkPasswordStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      return strength;
    };

    const handlePasswordChange = (field, value) => {
      setPasswordData((p) => ({ ...p, [field]: value }));
      if (field === 'newPassword') setPasswordStrength(checkPasswordStrength(value));
    };

    const updatePassword = async () => {
      setPwSaving(true);
      setPwMessage(null);
      try {
        console.log('[Profile] attempting changePassword for user (masked)');
        const resp = await dispatch(changePassword({ oldPassword: passwordData.currentPassword, newPassword: passwordData.newPassword })).unwrap();
        console.log('[Profile] changePassword response:', resp);
        const successText = resp?.msg || 'Password berhasil diperbarui.';
        setPwMessage({ type: 'success', text: successText });
        // Show SweetAlert success notification
        try {
          Swal.fire({
            icon: 'success',
            title: 'Berhasil',
            text: successText,
            timer: 2500,
            showConfirmButton: false
          });
        } catch (swErr) {
          console.log('[Profile] Swal success fire failed:', swErr?.message || swErr);
        }
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } catch (e) {
        console.error('[Profile] updatePassword error:', e);
        // unwrap() throws the rejected value. Try several common shapes to extract a message
        const errMsg = e?.msg || e?.message || e?.payload?.msg || e?.response?.data?.msg || (typeof e === 'string' ? e : null) || 'Gagal memperbarui password.';
        setPwMessage({ type: 'error', text: errMsg });
        // Show SweetAlert error notification
        try {
          Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: errMsg,
            timer: 3500,
            showConfirmButton: true
          });
        } catch (swErr) {
          console.log('[Profile] Swal error fire failed:', swErr?.message || swErr);
        }
      } finally {
        setPwSaving(false);
      }
    };

    return (
      <div className="space-y-6">
        <Card extra="p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">Change Password</h3>
          {pwMessage && (
            <div className={`mb-4 rounded-md p-3 text-sm ${pwMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {pwMessage.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
              <input type="password" value={passwordData.currentPassword} onChange={(e) => handlePasswordChange('currentPassword', e.target.value)} placeholder="Enter your current password" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
              <input type="password" value={passwordData.newPassword} onChange={(e) => handlePasswordChange('newPassword', e.target.value)} placeholder="Enter your new password" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
              <input type="password" value={passwordData.confirmPassword} onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} placeholder="Confirm your new password" className="w-full px-4 py-3 border border-gray-300 rounded-lg" />
            </div>

            <div className="flex justify-end mt-8">
              {console.log('[Profile] change-password state', { passwordData, passwordStrength, pwSaving })}
              <button type="button" onClick={updatePassword} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg" disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordData.newPassword !== passwordData.confirmPassword || pwSaving}>
                {pwSaving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'information':
        return <InformationSection />;
      case 'change-password':
        return <ChangePasswordSection />;
      default:
        return <InformationSection />;
    }
  };

  if (loading) return <div className="p-6">Memuat profil...</div>;
  if (error) return <div className="p-6 text-red-600">Gagal memuat profil: {error}</div>;
  if (!user) return <div className="p-6">Data profil belum tersedia.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <MdSettings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
                  <p className="text-indigo-100 text-lg">Manage your account settings and preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <Card extra="overflow-hidden shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Settings Menu</h2>
              </div>
              <nav className="p-6 space-y-2">
                {menuItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${activeSection === item.id ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md' : 'text-slate-700 hover:bg-slate-100'}`}>
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          <div className="flex-1">{renderSection()}</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;