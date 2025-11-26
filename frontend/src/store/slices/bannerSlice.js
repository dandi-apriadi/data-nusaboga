import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_BASE_URL + '/api/v1/banners';

export const fetchBanners = createAsyncThunk('banner/fetchBanners', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get(API_URL);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});


export const createBanner = createAsyncThunk('banner/createBanner', async (payload, { rejectWithValue }) => {
  try {
    if (payload.image) {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('description', payload.description || '');
      formData.append('is_active', payload.is_active);
      formData.append('image', payload.image);
      const res = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } else {
      // Kirim JSON biasa jika tidak ada file
      const res = await axios.post(API_URL, {
        title: payload.title,
        description: payload.description || '',
        is_active: payload.is_active
      });
      return res.data.data;
    }
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});


export const updateBanner = createAsyncThunk('banner/updateBanner', async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    if (payload.image) {
      const formData = new FormData();
      formData.append('title', payload.title);
      formData.append('description', payload.description || '');
      formData.append('is_active', payload.is_active);
      formData.append('image', payload.image);
      const res = await axios.put(`${API_URL}/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } else {
      // Kirim JSON biasa jika tidak ada file
      const res = await axios.put(`${API_URL}/${id}`, {
        title: payload.title,
        description: payload.description || '',
        is_active: payload.is_active,
        image_url: payload.image_url || ''
      });
      return res.data.data;
    }
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

export const deleteBanner = createAsyncThunk('banner/deleteBanner', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data || err.message);
  }
});

const bannerSlice = createSlice({
  name: 'banner',
  initialState: {
    banners: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.loading = false;
        state.banners = action.payload;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.banners.push(action.payload);
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        const idx = state.banners.findIndex(b => b.id === action.payload.id);
        if (idx !== -1) state.banners[idx] = action.payload;
      })
      .addCase(deleteBanner.fulfilled, (state, action) => {
        state.banners = state.banners.filter(b => b.id !== action.payload);
      });
  },
});

export default bannerSlice.reducer;
