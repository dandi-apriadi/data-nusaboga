import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchAddresses = createAsyncThunk('addresses/fetch', async (_, { rejectWithValue }) => {
  try { const { data } = await api.get('/addresses'); return data; } catch(e){ return rejectWithValue(e.response?.data || { message: e.message }); }
});

const slice = createSlice({
  name: 'addresses',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchAddresses.pending, (s)=>{ s.loading = true; s.error = null; })
     .addCase(fetchAddresses.fulfilled, (s,a)=>{ s.loading = false; s.items = a.payload || []; })
     .addCase(fetchAddresses.rejected, (s,a)=>{ s.loading = false; s.error = a.payload || a.error; });
  }
});

export default slice.reducer;
