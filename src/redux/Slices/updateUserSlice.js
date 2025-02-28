import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const updateUserDetailsFunc = createAsyncThunk(
  "users/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/users/${data.userId}`,data.payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to fetch projects");
    }
  }
);

// Slice definition
const updateUserSlice = createSlice({
  name: "updateUser",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(updateUserDetailsFunc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserDetailsFunc.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(updateUserDetailsFunc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default updateUserSlice.reducer;
