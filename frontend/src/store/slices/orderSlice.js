import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Thunks
export const fetchOrders = createAsyncThunk(
  "orders/fetch",
  async ({ status, page = 1, pageSize = 50 } = {}, { rejectWithValue }) => {
    try {
      const params = { page, pageSize };
      if (status) params.status = status;
      const { data } = await api.get("/orders", { params });
      return data; // { items, total, page, pageSize }
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateStatus",
  async ({ orderId, status, tracking_number, estimated_delivery, cancel_reason }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/status`, {
        status,
        tracking_number,
        estimated_delivery,
        cancel_reason,
      });
      return data; // updated order
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

// Update payment status (unpaid | paid | refunded | partial)
export const updatePaymentStatus = createAsyncThunk(
  'orders/updatePaymentStatus',
  async ({ orderId, payment_status }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/orders/${orderId}/payment-status`, { payment_status });
      return data; // updated order
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

export const fetchOrder = createAsyncThunk(
  'orders/fetchOne',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      return data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: e.message });
    }
  }
);

const initialState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
  loading: false,
  error: null,
  lastFetchedAt: null,
  selected: null,
  loadingDetail: false,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    setPage(state, action) {
      state.page = action.payload || 1;
    },
    setPageSize(state, action) {
      state.pageSize = action.payload || 50;
    },
    clearOrders(state) {
      state.items = [];
      state.total = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || state.page;
        state.pageSize = action.payload?.pageSize || state.pageSize;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((o) => o.order_id === updated.order_id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...updated };
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.payload || action.error;
      })
      // Payment status update
      .addCase(updatePaymentStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.items.findIndex((o) => o.order_id === updated.order_id);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...updated };
        }
        // also update selected if matches
        if (state.selected && state.selected.order_id === updated.order_id) {
          state.selected = { ...state.selected, ...updated };
        }
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.error = action.payload || action.error;
      })
      .addCase(fetchOrder.pending, (state) => {
        state.loadingDetail = true;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.selected = action.payload;
        // optionally merge into list if exists
        if (action.payload?.order_id) {
          const idx = state.items.findIndex(o => o.order_id === action.payload.order_id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...action.payload };
          }
        }
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loadingDetail = false;
        state.error = action.payload || action.error;
      });
  },
});

export const { setPage, setPageSize, clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
