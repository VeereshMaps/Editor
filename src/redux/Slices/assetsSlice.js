import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "api/axiosInstance";
import axios from "axios";


export const fetchAssets = createAsyncThunk(
  "assets/fetchAssets",
  async ({ search,page, limit }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/assets", {
        params: { search,page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch assets");
    }
  }
);

const assetsSlice = createSlice({
  name: "assets",
  initialState: {
    photos: [],
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssets.fulfilled, (state, action) => {
        state.loading = false;
        state.photos = action.payload.assets.map((asset) => ({
          src: asset.image,
          width: 600,
          height: 400,
          id: asset._id,
        }));
        state.totalPages = Math.ceil(action.payload.totalAssets / action.meta.arg.limit);
      })
      .addCase(fetchAssets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default assetsSlice.reducer;