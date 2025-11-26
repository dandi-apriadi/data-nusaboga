import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Guest upload payment proof
export const uploadPaymentProofGuest = createAsyncThunk('paymentProof/uploadGuest', async ({ order_id, file_url, mime_type, file_size }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payment-proofs/guest', { order_id, file_url, mime_type, file_size });
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { message: e.message });
  }
});

// For simplicity we send base64 or a temporary URL to backend; real file upload would use multipart/form-data endpoint.
export const uploadPaymentProof = createAsyncThunk('paymentProof/upload', async ({ order_id, file_url, mime_type, file_size }, { rejectWithValue }) => {
  try { const { data } = await api.post('/payment-proofs', { order_id, file_url, mime_type, file_size }); return data; } catch(e){ return rejectWithValue(e.response?.data || { message: e.message }); }
});

// Fetch payment proofs (admin or filtered by order)
export const fetchPaymentProofs = createAsyncThunk('paymentProof/fetchList', async ({ order_id, status } = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (order_id) params.append('order_id', order_id);
    if (status) params.append('status', status);
    const qs = params.toString();
    const { data } = await api.get('/payment-proofs' + (qs ? `?${qs}` : ''));
    return { list: data, order_id, status };
  } catch(e){ return rejectWithValue(e.response?.data || { message: e.message }); }
});

// User-owned payment proofs
export const fetchMyPaymentProofs = createAsyncThunk('paymentProof/fetchMy', async ({ order_id } = {}, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (order_id) params.append('order_id', order_id);
    const qs = params.toString();
    const { data } = await api.get('/payment-proofs/my' + (qs ? `?${qs}` : ''));
    return { list: data, order_id };
  } catch(e){ return rejectWithValue(e.response?.data || { message: e.message }); }
});

const slice = createSlice({
  name: 'paymentProof',
  initialState: { proof: null, loading: false, error: null, listLoading: false, list: [], byOrder: {} },
  reducers: { resetProof(s){ s.proof=null; s.error=null; } },
  extraReducers: b => {
    b.addCase(uploadPaymentProof.pending, s => { s.loading = true; s.error = null; })
     .addCase(uploadPaymentProof.fulfilled, (s, a) => {
       s.loading = false;
       s.proof = a.payload;
       try {
         const orderId = a.payload?.order_id;
         if (orderId) {
           if (!s.byOrder[orderId]) s.byOrder[orderId] = [];
           const pid = a.payload.proof_id;
           if (!pid || !s.byOrder[orderId].some(p => p.proof_id === pid)) {
             s.byOrder[orderId].push(a.payload);
           }
         }
       } catch (e) { /* silent */ }
     })
     .addCase(uploadPaymentProof.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; })

     .addCase(uploadPaymentProofGuest.pending, s => { s.loading = true; s.error = null; })
     .addCase(uploadPaymentProofGuest.fulfilled, (s, a) => {
       s.loading = false;
       s.proof = a.payload;
       try {
         const orderId = a.payload?.order_id;
         if (orderId) {
           if (!s.byOrder[orderId]) s.byOrder[orderId] = [];
           const pid = a.payload.proof_id;
           if (!pid || !s.byOrder[orderId].some(p => p.proof_id === pid)) {
             s.byOrder[orderId].push(a.payload);
           }
         }
       } catch (e) { /* silent */ }
     })
     .addCase(uploadPaymentProofGuest.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; });

    b.addCase(fetchPaymentProofs.pending, s=>{ s.listLoading = true; s.error = null; })
     .addCase(fetchPaymentProofs.fulfilled, (s,a)=>{
        s.listLoading = false;
        s.list = a.payload.list || [];
        if (a.payload.order_id) {
          s.byOrder[a.payload.order_id] = a.payload.list;
        }
     })
     .addCase(fetchPaymentProofs.rejected, (s,a)=>{ s.listLoading = false; s.error = a.payload || a.error; });

    b.addCase(fetchMyPaymentProofs.pending, s=>{ s.listLoading = true; s.error = null; })
     .addCase(fetchMyPaymentProofs.fulfilled, (s,a)=>{
        s.listLoading = false;
        // we do not overwrite admin list to avoid mixing contexts; only set byOrder
        if (a.payload.order_id) {
          s.byOrder[a.payload.order_id] = a.payload.list || [];
        }
     })
     .addCase(fetchMyPaymentProofs.rejected, (s,a)=>{ s.listLoading = false; s.error = a.payload || a.error; });
  }
});

export const { resetProof } = slice.actions;
export default slice.reducer;
