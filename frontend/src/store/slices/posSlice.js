import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const posCheckout = createAsyncThunk('pos/checkout', async (payload, { rejectWithValue }) => {
  try {
    // payload: { items:[{product_id, quantity, price_unit, name_snapshot, discount_amount}], subtotal, discount_amount, total, payment_method_id, received_amount, change_amount, payment_fee }
    const { data } = await api.post('/orders/pos/checkout', payload);
    return data; // created order with items and payments
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

const slice = createSlice({
  name: 'pos',
  initialState: { lastOrder: null, loading: false, error: null },
  reducers: { clearLastOrder(state){ state.lastOrder = null; state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(posCheckout.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(posCheckout.fulfilled, (state, action) => { state.loading = false; state.lastOrder = action.payload; })
      .addCase(posCheckout.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; });
  }
});

export const { clearLastOrder } = slice.actions;
export default slice.reducer;
