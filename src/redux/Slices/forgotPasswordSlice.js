import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Thunk to send OTP
export const sendOtp = createAsyncThunk("auth/sendOtp", async (email, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post("/api/auth/forgot-password", { email });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to send OTP");
    }
});

// Thunk to verify OTP
export const verifyOtp = createAsyncThunk("auth/verifyOtp", async ({ email, otp }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post("/api/auth/verify-otp", { email, otp });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Invalid OTP");
    }
});

// Thunk to reset password
export const resetPassword = createAsyncThunk("auth/resetPassword", async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
        const response = await axiosInstance.post("/api/auth/reset-password", { email, otp, newPassword });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data || "Failed to reset password");
    }
});

const forgotPasswordSlice = createSlice({
    name: "forgotPassword",
    initialState: {
        status: "idle",
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(sendOtp.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(sendOtp.fulfilled, (state) => {
                state.status = "otpSent";
            })
            .addCase(sendOtp.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(verifyOtp.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state) => {
                state.status = "otpVerified";
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            })
            .addCase(resetPassword.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.status = "passwordReset";
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload;
            });
    },
});

export default forgotPasswordSlice.reducer;
