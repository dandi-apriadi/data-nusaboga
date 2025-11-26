import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { loginUser, logoutUser } from "./authSlice"; // to react to auth state changes

// Key will be dynamic per user to avoid cross-user leakage
const STORAGE_VERSION = 'v1';
const BASE_STORAGE_KEY = `nusaboga_wishlist_${STORAGE_VERSION}`;

// Helper to derive key based on current auth user (pass user id when calling)
const storageKeyFor = (userId) => userId ? `${BASE_STORAGE_KEY}_${userId}` : BASE_STORAGE_KEY;

const loadInitial = (userId) => {
  try {
    const raw = localStorage.getItem(storageKeyFor(userId));
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

let currentUserIdCache = null; // updated via setCurrentUserId reducer or thunk side-effect

const persist = (items) => {
  try {
    localStorage.setItem(storageKeyFor(currentUserIdCache), JSON.stringify(items));
  } catch (e) {}
};

// Helper mapping agar konsisten
const mapWishlistItem = (it) => {
  if (!it) return null;
  // Handle variasi key: Sequelize kadang pakai nama model (Product) atau singular table (product)
  const prod = it.Product || it.product;
  const parseStock = (val) => {
    if (val === null || val === undefined) return 0;
    const n = typeof val === 'number' ? val : parseInt(val);
    if (isNaN(n)) return 0;
    return n < 0 ? 0 : n; // clamp
  };
  if (prod) {
    return {
      id: prod.product_id,
      name: prod.name,
      price: prod.price,
      image: prod.image_url,
  stock: parseStock(prod.stock),
      wishlistItemId: it.wishlist_item_id || it.id,
    };
  }
  // fallback jika hanya punya id (data lokal lawas / response minim)
  return {
    id: it.product_id || it.id,
    name: it.name,
    price: it.price,
    image: it.image,
  stock: parseStock(it.stock),
    wishlistItemId: it.wishlist_item_id || it.id,
  };
};

// Async thunks
export const fetchWishlist = createAsyncThunk("wishlist/fetch", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/wishlist");
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Wishlist][fetch] raw response:', res.data);
    }
    // API returns { wishlist_id, items: [ { wishlist_item fields, Product: { product_id, name, price, image_url, stock } } ] }
    const mapped = (res.data.items || []).map(mapWishlistItem).filter(Boolean);
    persist(mapped);
    return mapped;
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[Wishlist][fetch] error:', e.response?.data || e.message);
    }
    return rejectWithValue(e.response?.data?.msg || "Gagal memuat wishlist");
  }
});

// Accept either a numeric/id or an object { id, name, price, image, stock }
export const addWishlistItem = createAsyncThunk(
  "wishlist/add",
  async (payload, { rejectWithValue }) => {
    try {
      const product_id = typeof payload === 'object' ? payload.id : payload;
      const res = await api.post("/wishlist", { product_id });
      if (process.env.NODE_ENV !== 'production') {
        console.log('[Wishlist][add] raw response:', res.data);
      }
      // Response sekarang mengandung Product (lihat controller backend)
      const mapped = mapWishlistItem(res.data) || (typeof payload === 'object' ? payload : { id: product_id });
      return mapped;
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Wishlist][add] error:', e.response?.data || e.message);
      }
      return rejectWithValue(e.response?.data?.msg || "Gagal menambah wishlist");
    }
  }
);

export const removeWishlistItem = createAsyncThunk("wishlist/remove", async (product_id, { rejectWithValue }) => {
  try {
    await api.delete(`/wishlist/${product_id}`);
    return product_id;
  } catch (e) {
    return rejectWithValue(e.response?.data?.msg || "Gagal menghapus wishlist");
  }
});

export const clearWishlistServer = createAsyncThunk("wishlist/clear", async (_, { rejectWithValue }) => {
  try {
    await api.delete("/wishlist");
    return true;
  } catch (e) {
    return rejectWithValue(e.response?.data?.msg || "Gagal mengosongkan wishlist");
  }
});

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    items: loadInitial(null), // will be rehydrated when user id known
    userId: null,
    loading: false,
    error: null,
  },
  reducers: {
    setWishlistUser: (state, action) => {
      const userId = action.payload || null;
      state.userId = userId;
      currentUserIdCache = userId;
      state.items = loadInitial(userId);
    },
    addToWishlist: (state, action) => {
      const item = action.payload; // {id, name, price, image}
      if (!state.items.find((i) => i.id === item.id)) {
        state.items.push(item);
        persist(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter((i) => i.id !== id);
      persist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      persist(state.items);
    },
  },
  extraReducers: (builder) => {
    builder
      // React to successful login to hydrate user-specific wishlist
      .addCase(loginUser.fulfilled, (state, action) => {
        const authPayload = action.payload;
        const userObj = authPayload?.user || authPayload; // depending on backend response shape
        const uid = userObj?.user_id || userObj?.id || null;
        state.userId = uid;
        currentUserIdCache = uid;
        state.items = loadInitial(uid);
        state.error = null;
      })
      // On logout clear in-memory items (localStorage for that user remains for next login)
      .addCase(logoutUser.fulfilled, (state) => {
        state.items = [];
        state.userId = null;
        currentUserIdCache = null;
      })
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false; state.items = action.payload; state.error = null;
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false; state.error = action.payload || 'Error';
      })
      .addCase(addWishlistItem.fulfilled, (state, action) => {
        const newItem = action.payload; // mapped object {id, name, price, image, stock}
        if (newItem?.id && !state.items.find(i => i.id === newItem.id)) {
          state.items.unshift(newItem); // unshift agar item baru muncul di atas (opsional)
          persist(state.items);
        }
      })
      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        state.items = state.items.filter(i=> i.id !== action.payload);
        persist(state.items);
      })
      .addCase(clearWishlistServer.fulfilled, (state) => {
        state.items = []; persist(state.items);
      });
  }
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlistUser } = wishlistSlice.actions;
export default wishlistSlice.reducer;
