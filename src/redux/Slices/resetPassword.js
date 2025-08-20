import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

export const resetPassword = createAsyncThunk(
  "users/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/users/reset-user-password`, payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || { message: "Failed to reset password." });
    }
  }
);


const resetPasswordSlice = createSlice({
  name: "resetPassword",
  initialState: {
    loading: false,
    error: null,
    data: null,
    status:'idle', 
  },
  reducers: {
    clearResetPasswordState: (state) => {
      state.loading = false;
      state.error = null;
      state.data = null;
      state.status = 'idle'; 
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
        state.status = 'loading'; 
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // contains { message: "..."}
        state.status = 'succeeded'; 
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong.";
        state.status = 'failed';
      });
  },
});

export const { clearResetPasswordState } = resetPasswordSlice.actions;
export default resetPasswordSlice.reducer;

