import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const saveProjectDetailsFunc = createAsyncThunk(
  "projects/detailsByID",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/projects/${data.userId}`,data.payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch projects");
    }
  }
);

// Slice definition
const saveProjectDetailsByIdSlice = createSlice({
  name: "saveProjectDetailsById",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(saveProjectDetailsFunc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProjectDetailsFunc.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(saveProjectDetailsFunc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default saveProjectDetailsByIdSlice.reducer;
