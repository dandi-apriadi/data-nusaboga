import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/catalog/categories');
    return data;
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params = {}, { rejectWithValue }) => {
  try {
    const { q, category_id, page = 1, pageSize = 50 } = params;
    const { data } = await api.get('/catalog/products', { params: { q, category_id, page, pageSize } });
    return data; // { items, total, page, pageSize }
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

const slice = createSlice({
  name: 'products',
  initialState: {
    categories: [],
    items: [],
    total: 0,
    page: 1,
    pageSize: 50,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.loading = false; state.categories = action.payload || []; })
      .addCase(fetchCategories.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; })

      .addCase(fetchProducts.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.pageSize = action.payload?.pageSize || 50;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; });
  }
});

export default slice.reducer;
