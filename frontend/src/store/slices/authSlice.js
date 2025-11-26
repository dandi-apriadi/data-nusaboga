import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Get base URL directly from environment variable
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Validate environment variable
if (!BASE_URL) {
    throw new Error("REACT_APP_API_BASE_URL environment variable is required");
}

// Log base URL for debugging
console.log("🌐 [AUTH SLICE] Base URL initialized:", BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

const initialState = {
    user: null,
    baseURL: BASE_URL,
    microPage: "unset",
    homepage: "unset",
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};

// Thunk untuk mendapatkan data pengguna
export const getMe = createAsyncThunk("user/getMe", async (_, thunkAPI) => {
    try {
        const endpoint = "/api/shared/me";
        const fullUrl = `${BASE_URL}${endpoint}`;
        console.log("🔗 [GET ME] Request URL:", fullUrl);

        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        const message = error?.response?.data?.msg || "Something went wrong!";
        return thunkAPI.rejectWithValue(message);
    }
});

// Thunk untuk logout pengguna
export const logoutUser = createAsyncThunk("user/logoutUser", async (_, thunkAPI) => {
    try {
        const endpoint = "/api/shared/logout";
        const fullUrl = `${BASE_URL}${endpoint}`;
        console.log("🔗 [LOGOUT] Request URL:", fullUrl);

        await api.delete(endpoint);
        return null;
    } catch (error) {
        const message = error?.response?.data?.msg || "Something went wrong!";
        return thunkAPI.rejectWithValue(message);
    }
});

// Thunk untuk login pengguna
export const loginUser = createAsyncThunk("user/loginUser", async (user, thunkAPI) => {
    try {
        const endpoint = "/api/shared/login";
        const fullUrl = `${BASE_URL}${endpoint}`;
        console.log("🔗 [LOGIN] Request URL:", fullUrl);

        const response = await api.post(endpoint, user);
        return response.data;
    } catch (error) {
        const message = error?.response?.data?.msg || "Something went wrong!";
        return thunkAPI.rejectWithValue(message);
    }
});

// Thunk untuk register pengguna
export const registerUser = createAsyncThunk("user/register", async (userData, thunkAPI) => {
    try {
        const endpoint = "/api/shared/register";
        const fullUrl = `${BASE_URL}${endpoint}`;
        console.log("🔗 [REGISTER] Request URL:", fullUrl);

        const response = await api.post(endpoint, userData);
        return response.data;
    } catch (error) {
        const message = error?.response?.data?.msg || "Something went wrong!";
        return thunkAPI.rejectWithValue(message);
    }
});

// Slice Redux untuk otentikasi
export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        reset: (state) => initialState,
        setMicroPage: (state, action) => {
            state.microPage = action.payload; // Update microPage value
        },
    },
    extraReducers: (builder) => {
        builder
            // Login User
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.isError = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Register User
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get Me
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
            })
            .addCase(getMe.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Logout User
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = null; // Clear user data on logout
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            });
    },
});

export const { reset, setMicroPage } = authSlice.actions;

export default authSlice.reducer;