import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../api/axiosInstance";

// Thunk to login user
export const loginUser = createAsyncThunk('auth/loginUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/login", userData);
            return response.data; // Should return token and user info
        } catch (error) {
            return rejectWithValue(error.response?.data || "Login failed");
        }
    });

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        accessToken: localStorage.getItem('accessToken') || '',
        isAuthenticated: !!localStorage.getItem('accessToken'),
        status: "idle", // Now using status instead of loading
        error: null
    },
    reducers: {
        setAuthState: (state, action) => {
            return {
                ...state,
                ...action.payload,
            };
        },
        logout: (state) => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            return {
                user: null,
                accessToken: '',
                isAuthenticated: false,
                status: "idle", // Reset status on logout
                error: null
            };
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.status = "pending";
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = "success";
                state.accessToken = action.payload.token;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                localStorage.setItem('accessToken', action.payload.token);
                localStorage.setItem("user", JSON.stringify(action.payload.user));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = "failed";
                state.isAuthenticated = false;  // ✅ Ensure isAuthenticated is false on failed login
                state.error = action.payload;
            });
    }
});

export const { setAuthState,logout } = authSlice.actions;
export default authSlice.reducer;