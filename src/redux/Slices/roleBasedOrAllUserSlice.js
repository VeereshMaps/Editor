import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";

// Async thunk to fetch user by role or all
export const getRoleBasedOrAllUsers = createAsyncThunk("users", async (role, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`/api/users`, {
        params: { role },
      });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || "Failed to fetch user");
  }
});

const roleBasedOrAllUsersSlice = createSlice({
  name: "roleBasedOrAllUsers",
  initialState: {
    data: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRoleBasedOrAllUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getRoleBasedOrAllUsers.fulfilled, (state, action) => {
        state.status = "success";
        state.data = action.payload;
        state.error= null;
      })
      .addCase(getRoleBasedOrAllUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        state.data= null;
      });
  },
});

export default roleBasedOrAllUsersSlice.reducer;
