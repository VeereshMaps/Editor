import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const getGoldProjects = createAsyncThunk(
  "edition/fetchEditions",
  async (_,{rejectWithValue }) => {
    try {
     const response = await axiosInstance.get("/api/gold/");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch Gold Projects");
    }
  }
);

// Slice definition
const goldProjectSlice = createSlice({
  name: "goldProjects",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getGoldProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGoldProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getGoldProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default goldProjectSlice.reducer;
