import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const placeOrder = createAsyncThunk('orderCreate/place', async (payload, { rejectWithValue }) => {
  try { const { data } = await api.post('/orders', payload); return data; } catch(e){ return rejectWithValue(e.response?.data || { message: e.message }); }
});

const slice = createSlice({
  name: 'orderCreate',
  initialState: { order: null, loading: false, error: null },
  reducers: { resetOrder(state){ state.order = null; state.error=null; } },
  extraReducers: b => {
    b.addCase(placeOrder.pending, (s)=>{ s.loading = true; s.error=null; })
     .addCase(placeOrder.fulfilled, (s,a)=>{ s.loading=false; s.order = a.payload; })
     .addCase(placeOrder.rejected, (s,a)=>{ s.loading=false; s.error = a.payload || a.error; });
  }
});

export const { resetOrder } = slice.actions;
export default slice.reducer;
