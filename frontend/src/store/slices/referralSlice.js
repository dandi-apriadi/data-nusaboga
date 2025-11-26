import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const validateReferral = createAsyncThunk('referral/validate', async (code, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/referrals/validate', { code });
    return data; // { code, type, value, description, min_order_amount, msg }
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

const slice = createSlice({
  name: 'referral',
  initialState: { info: null, loading: false, error: null },
  reducers: { clearReferral(state){ state.info = null; state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(validateReferral.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(validateReferral.fulfilled, (state, action) => { state.loading = false; state.info = action.payload; })
      .addCase(validateReferral.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; });
  }
});

export const { clearReferral } = slice.actions;
export default slice.reducer;
