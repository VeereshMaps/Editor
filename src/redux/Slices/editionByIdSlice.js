import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const getEditionsById = createAsyncThunk(
  "edition/fetchEditionsById",
  async (editionId, {rejectWithValue }) => {
    try {
     const response = await axiosInstance.get(`/api/editions/${editionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch edition");
    }
  }
);

// Slice definition
const editionByIdSlice = createSlice({
  name: "editionsById",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getEditionsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEditionsById.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getEditionsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default editionByIdSlice.reducer;
