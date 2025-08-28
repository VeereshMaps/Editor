import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const createProjectFunc = createAsyncThunk(
  "projects/create",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/projects/`,payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch projects");
    }
  }
);

// Slice definition
const createProjectSlice = createSlice({
  name: "createProject",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createProjectFunc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProjectFunc.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(createProjectFunc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default createProjectSlice.reducer;
