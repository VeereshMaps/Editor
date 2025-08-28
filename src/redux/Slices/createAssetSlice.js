import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "api/axiosInstance";

// Async thunk to create an asset
export const createAsset = createAsyncThunk(
  "assets/createAsset",
  async (formData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        return rejectWithValue("Unauthorized: No token found.");
      }

      const response = await axiosInstance.post("/api/assets", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create asset."
      );
    }
  }
);

// Slice definition
const createAssetSlice = createSlice({
  name: "createAsset",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAsset.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createAsset.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(createAsset.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = typeof action.payload === "string" ? action.payload : "An error occurred.";
      });
  },
});

export const { resetState } = createAssetSlice.actions;
export default createAssetSlice.reducer;
