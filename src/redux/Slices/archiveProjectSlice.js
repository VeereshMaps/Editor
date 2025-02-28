import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const archiveProjectsFunc = createAsyncThunk(
  "projects/archive",
  async (userId, {rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/projects/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch projects");
    }
  }
);

// Slice definition
const archiveProjectSlice = createSlice({
  name: "archiveProjects",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(archiveProjectsFunc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveProjectsFunc.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(archiveProjectsFunc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default archiveProjectSlice.reducer;
