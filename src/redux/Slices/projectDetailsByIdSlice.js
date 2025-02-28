import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const getProjectDetailsById = createAsyncThunk(
  "projects/detailsByID",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/projects/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch projects");
    }
  }
);

// Slice definition
const projectDetailsByIdSlice = createSlice({
  name: "projectDetailsById",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProjectDetailsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProjectDetailsById.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(getProjectDetailsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default projectDetailsByIdSlice.reducer;
