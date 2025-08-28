// versionApproveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from "../../api/axiosInstance";

// Thunk for Approving Version by ID (PUT Method)
export const approveVersionById = createAsyncThunk(
  'version/approveVersionById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/versions/${id}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve Version Error:', error);
      return rejectWithValue(error.response?.data || 'Something went wrong');
    }
  }
);

// Initial State
const initialState = {
  status: 'idle', // idle, success, error
  data: null,
  error: null,
};

// Slice
const versionApproveSlice = createSlice({
  name: 'versionApprove',
  initialState,
  reducers: {}, // No reset here
  extraReducers: (builder) => {
    builder
      .addCase(approveVersionById.pending, (state) => {
        state.status = 'idle'; // keeping 'idle' on pending as per your requirement
        state.error = null;
      })
      .addCase(approveVersionById.fulfilled, (state, action) => {
        state.status = 'success';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(approveVersionById.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload;
      });
  },
});

export default versionApproveSlice.reducer;
