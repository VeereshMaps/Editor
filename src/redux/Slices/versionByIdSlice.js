import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const getVersionsById = createAsyncThunk(
  "edition/fetchVersionsById",
  async (versionId, {rejectWithValue }) => {
    try {
     const response = await axiosInstance.get(`/api/versions/${versionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch versions");
    }
  }
);

// Slice definition
const versionByIdSlice = createSlice({
  name: "versionsById",
  initialState: {
    versions: [],
    status: "idle", 
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getVersionsById.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(getVersionsById.fulfilled, (state, action) => {
        state.status = "success";
        state.versions = action.payload;
      })
      .addCase(getVersionsById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.versions = []; // Clear old data on error
      });
  },
});

export default versionByIdSlice.reducer;
