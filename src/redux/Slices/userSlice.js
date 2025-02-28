import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch user by ID
export const fetchUserById = createAsyncThunk("user/fetchUserById", async (userId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/api/users/${userId}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch user");
  }
});

const userIdSlice = createSlice({
    name: "userDetailsById",
    initialState: {
      user: null,
      status: "idle", // idle | loading | succeeded | failed
      error: null,
      isFetched: false, // New flag to prevent duplicate API calls
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchUserById.pending, (state) => {
          state.status = "loading";
          state.user = null;
        })
        .addCase(fetchUserById.fulfilled, (state, action) => {
          state.status = "success";
          state.user = action.payload;
          state.isFetched = true; // Mark as fetched
        })
        .addCase(fetchUserById.rejected, (state, action) => {
          state.status = "failed";
          state.error = action.payload;
        });
    },
  });
  

export default userIdSlice.reducer;
