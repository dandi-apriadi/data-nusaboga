import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const addToCartApi = createAsyncThunk('cart/addToCart', async ({ product_id, quantity, price_at_add }, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/cart/items', { product_id, quantity, price_at_add });
    return data;
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ cart_item_id, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/cart/items/${cart_item_id}`, { quantity });
    return data;
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const removeCartItem = createAsyncThunk('cart/removeItem', async (cart_item_id, { rejectWithValue }) => {
  try {
    await api.delete(`/cart/items/${cart_item_id}`);
    return cart_item_id;
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/cart');
    return data; // { cart, items }
  } catch (e) { return rejectWithValue(e.response?.data || { message: e.message }); }
});

const slice = createSlice({
  name: 'cart',
  initialState: { items: [], cart: null, loading: false, error: null, adding: false, lastAddedId: null },
  reducers: {
    clearCartFeedback: (state) => { state.lastAddedId = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload.cart; state.items = action.payload.items || []; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload || action.error; })

      .addCase(addToCartApi.pending, (state) => { state.adding = true; state.error = null; })
      .addCase(addToCartApi.fulfilled, (state, action) => {
        state.adding = false;
        state.lastAddedId = action.meta?.arg?.product_id || null;
        const newItem = action.payload;
        if (newItem?.cart_item_id) {
          const idx = state.items.findIndex(i => i.cart_item_id === newItem.cart_item_id);
          if (idx !== -1) {
            state.items[idx] = { ...state.items[idx], ...newItem };
          } else {
            state.items.push(newItem);
          }
        }
      })
      .addCase(addToCartApi.rejected, (state, action) => { state.adding = false; state.error = action.payload || action.error; })

      .addCase(updateCartItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(i => i.cart_item_id === action.payload.cart_item_id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i => i.cart_item_id !== action.payload);
      });
  }
});

export default slice.reducer;
