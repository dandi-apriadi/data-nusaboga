
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../utils/api';
// Fetch all notifications for current user
export const fetchAllNotifications = createAsyncThunk('profile/fetchAllNotifications', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/engagement/notifications');
    return res.data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { msg: e.message });
  }
});

// Adjust base if needed: assumes axios default baseURL already set elsewhere
export const fetchProfileSummary = createAsyncThunk('profile/fetchSummary', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/profile/summary');
    return res.data.data;
  } catch (e) {
    console.error('[fetchProfileSummary] error:', e?.response?.status, e?.response?.data || e.message);
    return rejectWithValue(e.response?.data || { msg: e.message });
  }
});

export const markNotificationRead = createAsyncThunk('profile/markNotificationRead', async (notificationId, { rejectWithValue }) => {
  try {
    await api.patch(`/api/engagement/notifications/${notificationId}/read`);
    return notificationId;
  } catch (e) {
    return rejectWithValue(e.response?.data || { msg: e.message });
  }
});

export const updateProfile = createAsyncThunk('profile/update', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.patch('/api/profile', payload);
    return res.data.data.user; // updated user
  } catch (e) {
    return rejectWithValue(e.response?.data || { msg: e.message });
  }
});

export const changePassword = createAsyncThunk('profile/changePassword', async (payload, { rejectWithValue }) => {
  try {
    const res = await api.patch('/api/user/change-password', payload);
    return res.data; // { msg }
  } catch (e) {
    return rejectWithValue(e.response?.data || { msg: e.message });
  }
});

const initialState = {
  loading: false,
  error: null,
  user: null,
  membership: null,
  orders: null,
  points_history: [],
  notifications: {
    unread_count: 0,
    recent: []
  },
  allNotifications: [],
  notificationsLoading: false,
  notificationsError: null
  ,passwordChangeLoading: false,
  passwordChangeError: null,
  passwordChangeMessage: null
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    resetProfile: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllNotifications.pending, (state) => {
        state.notificationsLoading = true;
        state.notificationsError = null;
      })
      .addCase(fetchAllNotifications.fulfilled, (state, action) => {
        state.notificationsLoading = false;
        state.allNotifications = action.payload;
      })
      .addCase(fetchAllNotifications.rejected, (state, action) => {
        state.notificationsLoading = false;
        state.notificationsError = action.payload?.msg || 'Gagal memuat notifikasi';
      })
      .addCase(fetchProfileSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.membership = action.payload.membership;
        state.orders = action.payload.orders;
        state.points_history = action.payload.points_history || [];
        state.notifications = action.payload.notifications || { unread_count: 0, recent: [] };
      })
      .addCase(fetchProfileSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.msg || 'Gagal memuat profil';
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const notif = state.notifications.recent.find(n => n.notification_id === id);
        if (notif && !notif.is_read) {
          notif.is_read = true;
          state.notifications.unread_count = Math.max(0, state.notifications.unread_count - 1);
        }
      })
      .addCase(updateProfile.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.user && action.payload.user_id === state.user.user_id) {
          state.user = { ...state.user, ...action.payload };
        } else {
          state.user = action.payload;
        }
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload?.msg || 'Gagal memperbarui profil';
      });
      ;

    builder
      .addCase(changePassword.pending, (state) => {
        state.passwordChangeLoading = true;
        state.passwordChangeError = null;
        state.passwordChangeMessage = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeMessage = action.payload?.msg || 'Password berhasil diperbarui';
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.passwordChangeLoading = false;
        state.passwordChangeError = action.payload?.msg || 'Gagal memperbarui password';
      });
  }
});

export const { resetProfile } = profileSlice.actions;
export default profileSlice.reducer;
