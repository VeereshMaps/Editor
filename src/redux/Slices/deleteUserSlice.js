import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch projects based on user role
export const deleteUserDetailsFunc = createAsyncThunk(
  "users/update",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/api/users/${data.userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete user");
    }
  }
);

// Slice definition
const deleteUserSlice = createSlice({
  name: "deleteUser",
  initialState: {
    projects: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(deleteUserDetailsFunc.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUserDetailsFunc.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(deleteUserDetailsFunc.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default deleteUserSlice.reducer;
